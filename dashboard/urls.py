from django.urls import path, include
from rest_framework.routers import DefaultRouter
from dashboard.views import DailyXFormSubmissionCounterViewSet, UserPartialPermissionViewSet, SubmissionCountAPIView, \
    SubmissionSummaryView

router = DefaultRouter()
router.register(r'daily-submissions', DailyXFormSubmissionCounterViewSet, basename='daily-submissions')

urlpatterns = [
    path('', include(router.urls)),
    path("counts/", SubmissionCountAPIView.as_view(), name="counts"),
    path(r'submissions/counts/', SubmissionSummaryView.as_view(), name='submission-counts')
]
