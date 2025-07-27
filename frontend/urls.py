from django.urls import path, re_path
from django.views.generic import TemplateView

from frontend import views

app_name = "frontend"
urlpatterns = [
    path("permissions/", views.permissions, name="permissions"),
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name='frontend/index.html')),
]
