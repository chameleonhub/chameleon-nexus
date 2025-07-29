from django.urls import path, include
from rest_framework.routers import DefaultRouter
from dashboard.views import DailyXFormSubmissionCounterViewSet, UserPartialPermissionViewSet, SubmissionCountAPIView

router = DefaultRouter()
router.register(r'daily-submissions', DailyXFormSubmissionCounterViewSet, basename='daily-submissions')
router.register(r'submissions/counts', UserPartialPermissionViewSet, basename='submission-counts')

urlpatterns = [
    path('', include(router.urls)),
    path("counts/", SubmissionCountAPIView.as_view(), name="counts"),
    # path('my-submissions/', SubmissionStatsView.as_view(), name='my-submissions'),
]
