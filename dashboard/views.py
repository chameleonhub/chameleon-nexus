from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from dashboard.models import DailyXFormSubmissionCounter, AssetUserPartialPermission
from dashboard.serializers import DailyXFormSubmissionCounterSerializer, AssetUserPartialPermissionSerializer
from django_filters.rest_framework import DjangoFilterBackend


class DailyXFormSubmissionCounterViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DailyXFormSubmissionCounterSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'user__username', 'xform__id']

    def get_queryset(self):
        return DailyXFormSubmissionCounter.objects.all().select_related('user', 'xform')


class UserPartialPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AssetUserPartialPermissionSerializer

    def get_queryset(self):
        return AssetUserPartialPermission.objects.using('default').filter(
            user=self.request.user
        )

