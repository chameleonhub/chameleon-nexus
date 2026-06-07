from typing import Any

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.forms import TextInput
from django.forms.models import BaseModelForm
from django.forms.utils import flatatt
from django.urls import reverse_lazy
from django.utils.safestring import mark_safe
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.views.generic.list import ListView
from django_filters.views import FilterView

from nexus.desk.models import Module, Workflow
from nexus.permissions.permissions import IsSuperUser

desk_module_entry_fields = [
    "title",
    "icon",
    "description",
    "form",
    "external_url",
    "module_type",
    "parent_module",
    "sort_order",
    "is_active",
]


def build_module_tree(modules):
    nodes_by_id = {
        module.id: {
            "module": module,
            "children": [],
        }
        for module in modules
    }
    roots = []

    for module in modules:
        node = nodes_by_id[module.id]
        parent_node = nodes_by_id.get(module.parent_module_id)
        if parent_node:
            parent_node["children"].append(node)
        else:
            roots.append(node)

    return roots


def set_module_form_options(form, request, current_module=None):
    form.fields["icon"].widget = MaterialUIIconPicker()
    form.fields["form"].widget = KoboToolboxFormPicker(request)
    form.fields["parent_module"].queryset = Module.objects.filter(
        module_type__title__iexact="Container",
    ).order_by("sort_order", "title")
    if current_module:
        form.fields["parent_module"].queryset = form.fields["parent_module"].queryset.exclude(pk=current_module.pk)
    return form


class KoboToolboxFormPicker(TextInput):
    def __init__(self, request):
        super().__init__()
        self.request = request

    def render(self, name, value, attrs: dict[str, Any] | None = None, **kwargs):
        super().render(name, value, attrs)

        form_options = '<option value="">-------- Loading forms...</option>'
        if value:
            form_options = f'<option value="{value}" selected>{value} - currently selected form</option>' + form_options

        if attrs is not None:
            flat_attrs = flatatt(attrs)
            html = (
                f'  <select name="{name}" {flat_attrs} '
                f'data-desk-form-picker data-selected-value="{value or ""}"> '
                + form_options
                + "</select>"
            )
        else:
            html = (
                f'  <select name="{name}" data-desk-form-picker '
                f'data-selected-value="{value or ""}"> '
                + form_options
                + "</select>"
            )
        return mark_safe(html)


class MaterialUIIconPicker(TextInput):
    # based on https://codepen.io/mortenson/pen/GMBeEg/
    def render(self, name, value, attrs: dict[str, Any] | None = None, **kwargs):
        super().render(name, value, attrs)

        if attrs is not None:
            flat_attrs = flatatt(attrs)
            if value:
                html = f'<input name={name} {flat_attrs} type="text" class="use-material-icon-picker" value={value}>'
            else:
                html = f'<input name={name} {flat_attrs} type="text" class="use-material-icon-picker">'
        else:
            if value:
                html = f'<input name={name} type="text" class="use-material-icon-picker" value={value}>'
            else:
                html = f'<input name={name} type="text" class="use-material-icon-picker">'
        return mark_safe(html)


class ModuleList(LoginRequiredMixin, FilterView, ):
    permission_classes = [IsSuperUser]
    template_name_suffix = "_list"
    model = Module
    paginate_by = None
    ordering = ["id"]
    filterset_fields = {
        "title": ["icontains"],
        "description": ["icontains"],
        "parent_module": ["exact"],
    }

    def get_queryset(self):
        return Module.objects.select_related("module_type", "parent_module").order_by(
            "parent_module_id",
            "sort_order",
            "id",
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["query"] = dict()
        # remove page from query tag so pagination works in template
        for k, v in context["filter"].data.items():
            if k != "page" and v != "":
                context["query"][k] = v

        context["module_tree"] = build_module_tree(list(context["object_list"]))

        return context


class ModuleCreate(LoginRequiredMixin, CreateView):
    template_name_suffix = "_create_form"
    model = Module
    fields = desk_module_entry_fields
    success_url = reverse_lazy("desk:list")

    def get_form(self, form_class: type[BaseModelForm] | None = None) -> BaseModelForm:
        form = super().get_form(form_class)
        return set_module_form_options(form, self.request)

    def form_valid(self, form):
        messages.success(self.request, "The module was created successfully.")
        return super(ModuleCreate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The module was not created successfully.")
        form.error_css_class = "error"
        return super(ModuleCreate, self).form_invalid(form)


class ModuleUpdate(LoginRequiredMixin, UpdateView):
    template_name_suffix = "_update_form"
    model = Module
    fields = desk_module_entry_fields
    success_url = reverse_lazy("desk:list")

    def get_form(self, form_class: type[BaseModelForm] | None = None) -> BaseModelForm:
        form = super().get_form(form_class)
        return set_module_form_options(form, self.request, self.object)

    def form_valid(self, form):
        messages.success(self.request, "The module was updated successfully.")
        return super(ModuleUpdate, self).form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.object.module_type.title == "List":
            context["allow_workflows"] = True
        return context


class ModuleDelete(LoginRequiredMixin, DeleteView):
    template_name_suffix = "_delete_form"
    model = Module
    success_url = reverse_lazy("desk:list")

    def form_valid(self, form):
        messages.success(self.request, "The module was deleted successfully.")
        return super(ModuleDelete, self).form_valid(form)


desk_module_workflow_entry_fields = [
    "title",
    "source_form",
    "destination_form",
    "definition",
    "is_active",
]


class WorkflowList(LoginRequiredMixin, ListView):
    template_name_suffix = "_list"
    model = Workflow
    paginate_by = 5
    ordering = ["id"]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(source_form__exact=self.kwargs["source_form"]).order_by("id")


class WorkflowCreate(LoginRequiredMixin, CreateView):
    template_name_suffix = "_create_form"
    model = Workflow
    fields = desk_module_workflow_entry_fields
    success_url = reverse_lazy("desk:list")

    def get_form(self, form_class: type[BaseModelForm] | None = None) -> BaseModelForm:
        form = super().get_form(form_class)
        form.fields["source_form"].widget = KoboToolboxFormPicker(self.request)
        form.fields["destination_form"].widget = KoboToolboxFormPicker(self.request)
        return form

    def form_valid(self, form):
        messages.success(self.request, "The module workflow was created successfully.")
        return super(WorkflowCreate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The module workflow was not created successfully.")
        form.error_css_class = "error"
        return super(WorkflowCreate, self).form_invalid(form)


class WorkflowUpdate(LoginRequiredMixin, UpdateView):
    template_name_suffix = "_update_form"
    model = Workflow
    fields = desk_module_workflow_entry_fields
    success_url = reverse_lazy("desk:list")

    def get_form(self, form_class: type[BaseModelForm] | None = None) -> BaseModelForm:
        form = super().get_form(form_class)
        form.fields["source_form"].widget = KoboToolboxFormPicker(self.request)
        form.fields["destination_form"].widget = KoboToolboxFormPicker(self.request)
        return form

    def form_valid(self, form):
        messages.success(self.request, "The module workflow was updated successfully.")
        return super(WorkflowUpdate, self).form_valid(form)


class WorkflowDelete(LoginRequiredMixin, DeleteView):
    template_name_suffix = "_delete_form"
    model = Workflow
    success_url = reverse_lazy("desk:list")

    def form_valid(self, form):
        messages.success(self.request, "The module workflow was deleted successfully.")
        return super(WorkflowDelete, self).form_valid(form)
