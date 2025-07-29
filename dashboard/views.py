from collections import defaultdict
from operator import itemgetter

from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from dashboard.models import DailyXFormSubmissionCounter
from dashboard.serializers import DailyXFormSubmissionCounterSerializer, AssetViewPermissionSerializer
from .models import AssetUserPartialPermission, Instance
from .serializers import SubmissionCountSerializer


class DailyXFormSubmissionCounterViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DailyXFormSubmissionCounterSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'user__username', 'xform__id']

    def get_queryset(self):
        return DailyXFormSubmissionCounter.objects.all().select_related('user', 'xform')


class UserPartialPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AssetViewPermissionSerializer

    def get_queryset(self):
        return AssetUserPartialPermission.objects.using('default').filter(
            user=self.request.user
        )


# class SubmissionCountAPIView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         user_asset_map = defaultdict(set)
#
#         for perm in AssetUserPartialPermission.objects.using('default').filter(user_id=request.user.id).select_related(
#                 'asset', 'user'):
#             asset_id = perm.asset_id
#             view_subs = perm.permissions.get("view_submissions", [])
#             for entry in view_subs:
#                 submitted_by = entry.get("_submitted_by")
#                 if submitted_by:
#                     if isinstance(submitted_by, dict) and "$in" in submitted_by:
#                         for uname in submitted_by["$in"]:
#                             user_asset_map[(asset_id, uname)].add(perm.user_id)
#                     elif isinstance(submitted_by, str):
#                         user_asset_map[(asset_id, submitted_by)].add(perm.user_id)
#
#         submission_qs = (
#             Instance.objects
#             .filter(user__isnull=False, xform__isnull=False)
#             .values("xform_id", "user__username")
#             .annotate(submission_count=Count("id"))
#         )
#
#         submission_map = {
#             (row["xform_id"], row["user__username"]): row["submission_count"]
#             for row in submission_qs
#         }
#
#         response = []
#         for (asset_id, username), _ in user_asset_map.items():
#             count = submission_map.get((asset_id, username), 0)
#             response.append({
#                 "asset_id": asset_id,
#                 "username": username,
#                 "submission_count": count,
#             })
#
#         response.sort(key=lambda x: (x["asset_id"], x["username"]))
#         return Response(response)



class CustomPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = "page_size"
    max_page_size = 10000

class SubmissionCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_asset_map = defaultdict(set)

        for perm in AssetUserPartialPermission.objects.using('default').filter(user_id=request.user.id).select_related('asset', 'user'):
            asset_id = perm.asset_id
            asset_name = perm.asset.name
            view_subs = perm.permissions.get("view_submissions", [])
            for entry in view_subs:
                submitted_by = entry.get("_submitted_by")
                if submitted_by:
                    if isinstance(submitted_by, dict) and "$in" in submitted_by:
                        for uname in submitted_by["$in"]:
                            user_asset_map[(asset_id, asset_name, uname)].add(perm.user_id)
                    elif isinstance(submitted_by, str):
                        user_asset_map[(asset_id, asset_name, submitted_by)].add(perm.user_id)

        submission_qs = (
            Instance.objects
            .filter(user__isnull=False, xform__isnull=False)
            .values("xform_id", "user__username")
            .annotate(submission_count=Count("id"))
        )

        submission_map = {
            (row["xform_id"], row["user__username"]): row["submission_count"]
            for row in submission_qs
        }

        response = []
        for (asset_id, asset_name, username), _ in user_asset_map.items():
            count = submission_map.get((asset_id, username), 0)
            response.append({
                "user_id": request.user.id,
                "username": username,
                "asset_id": asset_id,
                "form_name": asset_name,
                "submission_count": count,
            })


        form_name_filter = request.query_params.get("form_name")
        username_filter = request.query_params.get("username")

        if form_name_filter:
            response = [r for r in response if form_name_filter.lower() in r["form_name"].lower()]

        if username_filter:
            response = [r for r in response if username_filter.lower() in r["username"].lower()]


        ordering = request.query_params.get("ordering")  # e.g., "-submission_count", "username"
        if ordering:
            reverse = ordering.startswith("-")
            key = ordering.lstrip("-")
            if key in {"form_name", "username", "submission_count"}:
                response = sorted(response, key=itemgetter(key), reverse=reverse)


        paginator = CustomPagination()
        paginated = paginator.paginate_queryset(response, request)
        return paginator.get_paginated_response(SubmissionCountSerializer(paginated, many=True).data)

