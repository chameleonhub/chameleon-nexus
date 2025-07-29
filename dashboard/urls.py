from django.urls import path, include
from rest_framework.routers import DefaultRouter
from dashboard.views import DailyXFormSubmissionCounterViewSet, UserPartialPermissionViewSet

router = DefaultRouter()
router.register(r'daily-submissions', DailyXFormSubmissionCounterViewSet, basename='daily-submissions')
router.register(r'submissions/counts', UserPartialPermissionViewSet, basename='submission-counts')

urlpatterns = [
    path('', include(router.urls)),
]
