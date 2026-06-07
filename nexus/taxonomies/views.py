from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django import forms
from django.shortcuts import render
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.views.generic.list import ListView

import django_filters
from django_filters.views import FilterView

from nexus.taxonomies.models import AdministrativeRegion, AdministrativeRegionLevel, Taxonomy


@login_required
def index(request):
    context = {}
    context["taxonomies"] = Taxonomy.objects.all()
    return render(request, "taxonomies/index.html", context)


taxonomy_entry_fields = [
    "title",
    "csv_file",
]


class TaxonomyList(LoginRequiredMixin, ListView):
    template_name_suffix = "_list"
    model = Taxonomy
    paginate_by = 5
    ordering = ["title"]


class TaxonomyCreate(LoginRequiredMixin, CreateView):
    template_name_suffix = "_create_form"
    model = Taxonomy
    fields = taxonomy_entry_fields
    success_url = reverse_lazy("taxonomies:list")

    def form_valid(self, form):
        print(form)

        messages.success(self.request, "The taxonomy was created successfully.")
        return super(TaxonomyCreate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The taxonomy was not created successfully.")
        form.error_css_class = "error"
        return super(TaxonomyCreate, self).form_invalid(form)


class TaxonomyUpdate(LoginRequiredMixin, UpdateView):
    template_name_suffix = "_update_form"
    model = Taxonomy
    fields = taxonomy_entry_fields
    success_url = reverse_lazy("taxonomies:list")

    def form_valid(self, form):
        messages.success(self.request, "The taxonomy was updated successfully.")
        return super(TaxonomyUpdate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The taxonomy was not updated successfully.")
        form.error_css_class = "error"
        return super(TaxonomyUpdate, self).form_invalid(form)


class TaxonomyDelete(LoginRequiredMixin, DeleteView):
    template_name_suffix = "_delete_form"
    model = Taxonomy
    success_url = reverse_lazy("taxonomies:list")

    def form_valid(self, form):
        messages.success(self.request, "The taxonomy was deleted successfully.")
        return super(TaxonomyDelete, self).form_valid(form)


adminstrative_region_level_entry_fields = [
    "id",
    "title",
]


class AdministrativeRegionLevelList(LoginRequiredMixin, ListView):
    template_name_suffix = "_list"
    model = AdministrativeRegionLevel
    paginate_by = 5
    ordering = ["id"]


class AdministrativeRegionLevelCreate(LoginRequiredMixin, CreateView):
    template_name_suffix = "_create_form"
    model = AdministrativeRegionLevel
    fields = adminstrative_region_level_entry_fields
    success_url = reverse_lazy("taxonomies:adminstrative_region_level_list")

    def form_valid(self, form):
        messages.success(self.request, "The administrative region level was created successfully.")
        return super(AdministrativeRegionLevelCreate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The administrative region level was not created successfully.")
        form.error_css_class = "error"
        return super(AdministrativeRegionLevelCreate, self).form_invalid(form)


class AdministrativeRegionLevelUpdate(LoginRequiredMixin, UpdateView):
    template_name_suffix = "_update_form"
    model = AdministrativeRegionLevel
    fields = adminstrative_region_level_entry_fields
    success_url = reverse_lazy("taxonomies:adminstrative_region_level_list")

    def form_valid(self, form):
        messages.success(self.request, "The administrative region level was updated successfully.")
        return super(AdministrativeRegionLevelUpdate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The administrative region level was not updated successfully.")
        form.error_css_class = "error"
        return super(AdministrativeRegionLevelCreate, self).form_invalid(form)


class AdministrativeRegionLevelDelete(LoginRequiredMixin, DeleteView):
    template_name_suffix = "_delete_form"
    model = AdministrativeRegionLevel
    success_url = reverse_lazy("taxonomies:adminstrative_region_level_list")

    def form_valid(self, form):
        messages.success(self.request, "The administrative region level was deleted successfully.")
        return super(AdministrativeRegionLevelDelete, self).form_valid(form)


adminstrative_region_entry_fields = [
    "id",
    "title",
    "administrative_region_level",
    "parent_administrative_region",
]


class AdministrativeRegionForm(forms.ModelForm):
    parent_administrative_region = forms.ModelChoiceField(
        queryset=AdministrativeRegion.objects.all().order_by("id"),
        required=False,
        label="Parent region ID",
        widget=forms.NumberInput(
            attrs={
                "placeholder": "Parent region ID",
                "inputmode": "numeric",
            }
        ),
    )

    class Meta:
        model = AdministrativeRegion
        fields = adminstrative_region_entry_fields
        labels = {
            "id": "Region ID",
            "administrative_region_level": "Level",
        }
        widgets = {
            "id": forms.NumberInput(
                attrs={
                    "placeholder": "Region ID",
                    "inputmode": "numeric",
                }
            ),
            "title": forms.TextInput(
                attrs={
                    "placeholder": "Region name",
                    "autocomplete": "off",
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["administrative_region_level"].queryset = AdministrativeRegionLevel.objects.all().order_by("id")
        parent_queryset = AdministrativeRegion.objects.all().order_by("id")
        if self.instance and self.instance.pk:
            parent_queryset = parent_queryset.exclude(pk=self.instance.pk)
        self.fields["parent_administrative_region"].queryset = parent_queryset
        self.fields["parent_administrative_region"].help_text = "Enter the parent region ID instead of loading every region."


class AdministrativeRegionFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(
        label="Region ID",
        widget=forms.NumberInput(
            attrs={
                "placeholder": "e.g. 302641",
                "inputmode": "numeric",
            }
        ),
    )
    title = django_filters.CharFilter(
        field_name="title",
        lookup_expr="icontains",
        label="Search by region name",
        widget=forms.TextInput(
            attrs={
                "placeholder": "Search administrative regions",
                "autocomplete": "off",
            }
        ),
    )
    administrative_region_level = django_filters.ModelChoiceFilter(
        queryset=AdministrativeRegionLevel.objects.all().order_by("id"),
        label="Level",
        empty_label="Any level",
    )
    parent_administrative_region = django_filters.NumberFilter(
        field_name="parent_administrative_region_id",
        label="Parent region ID",
        widget=forms.NumberInput(
            attrs={
                "placeholder": "Parent ID",
                "inputmode": "numeric",
            }
        ),
    )

    class Meta:
        model = AdministrativeRegion
        fields = ["id", "title", "administrative_region_level", "parent_administrative_region"]


class AdministrativeRegionList(LoginRequiredMixin, FilterView):
    template_name_suffix = "_list"
    model = AdministrativeRegion
    filterset_class = AdministrativeRegionFilter
    paginate_by = 50

    def get_queryset(self):
        return (
            AdministrativeRegion.objects.select_related(
                "administrative_region_level",
                "parent_administrative_region",
            )
            .all()
            .order_by("id")
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["query"] = dict()
        # remove page from query tag so pagination works in template
        for k, v in context["filter"].data.items():
            if k != "page" and v != "":
                context["query"][k] = v

        query_params = self.request.GET.copy()
        query_params.pop("page", None)
        context["query_string"] = query_params.urlencode()

        # use paginator range with ellipses for simplicity
        page = context["page_obj"]
        context["paginator_range"] = page.paginator.get_elided_page_range(page.number, on_each_side=2, on_ends=2)

        return context


class AdministrativeRegionCreate(LoginRequiredMixin, CreateView):
    template_name_suffix = "_create_form"
    model = AdministrativeRegion
    form_class = AdministrativeRegionForm
    success_url = reverse_lazy("taxonomies:adminstrative_region_list")

    def form_valid(self, form):
        messages.success(self.request, "The administrative region was created successfully.")
        return super(AdministrativeRegionCreate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The administrative region was not created successfully.")
        form.error_css_class = "error"
        return super(AdministrativeRegionCreate, self).form_invalid(form)


class AdministrativeRegionUpdate(LoginRequiredMixin, UpdateView):
    template_name_suffix = "_update_form"
    model = AdministrativeRegion
    form_class = AdministrativeRegionForm
    success_url = reverse_lazy("taxonomies:adminstrative_region_list")

    def form_valid(self, form):
        messages.success(self.request, "The administrative region was updated successfully.")
        return super(AdministrativeRegionUpdate, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "The administrative region was not updated successfully.")
        form.error_css_class = "error"
        return super(AdministrativeRegionUpdate, self).form_invalid(form)


class AdministrativeRegionDelete(LoginRequiredMixin, DeleteView):
    template_name_suffix = "_delete_form"
    model = AdministrativeRegion
    success_url = reverse_lazy("taxonomies:adminstrative_region_list")

    def form_valid(self, form):
        messages.success(self.request, "The administrative region was deleted successfully.")
        return super(AdministrativeRegionDelete, self).form_valid(form)
