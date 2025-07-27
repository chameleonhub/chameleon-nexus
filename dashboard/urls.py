from django.urls import path, include
from rest_framework.routers import DefaultRouter
from dashboard.views import DailyXFormSubmissionCounterViewSet

router = DefaultRouter()
router.register(r'daily-submissions', DailyXFormSubmissionCounterViewSet, basename='daily-submissions')

urlpatterns = [
    path('', include(router.urls)),
]