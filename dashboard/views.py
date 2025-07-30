from collections import defaultdict
from operator import itemgetter

from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.models import DailyXFormSubmissionCounter
from dashboard.serializers import DailyXFormSubmissionCounterSerializer, AssetViewPermissionSerializer, \
    FormSubmissionSerializer
from .models import AssetUserPartialPermission, Instance


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


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class SubmissionCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")
        form_id = request.query_params.get("form_id")
        ordering = request.query_params.get("ordering", "form_id")

        user_asset_map = defaultdict(set)

        perms = AssetUserPartialPermission.objects.using('default').filter(user_id=user_id)

        for perm in perms:
            asset_id = perm.asset_id
            view_subs = perm.permissions.get("view_submissions", [])
            for entry in view_subs:
                submitted_by = entry.get("_submitted_by")
                if submitted_by:
                    if isinstance(submitted_by, dict) and "$in" in submitted_by:
                        for uname in submitted_by["$in"]:
                            user_asset_map[(asset_id, uname)].add(perm.user_id)
                    elif isinstance(submitted_by, str):
                        user_asset_map[(asset_id, submitted_by)].add(perm.user_id)

        submission_qs = Instance.objects.filter(user__isnull=False, xform__isnull=False)

        if from_date:
            submission_qs = submission_qs.filter(date_created__gte=from_date)
        if to_date:
            submission_qs = submission_qs.filter(date_created__lte=to_date)
        if form_id:
            submission_qs = submission_qs.filter(xform_id=form_id)

        submission_qs = submission_qs.values("xform_id", "user__username", "user__id", "xform__title") \
            .annotate(submission_count=Count("id"))

        grouped = defaultdict(lambda: {"form_id": None, "form_name": None, "total_submission_count": 0, "users": []})

        for row in submission_qs:
            key = (row["xform_id"])
            grouped[key]["form_id"] = row["xform_id"]
            grouped[key]["form_name"] = row["xform__title"]
            grouped[key]["total_submission_count"] += row["submission_count"]
            grouped[key]["users"].append({
                "user_id": row["user__id"],
                "username": row["user__username"],
                "submission_count": row["submission_count"],
            })

        response = list(grouped.values())

        if ordering in {"form_id", "-form_id", "form_name", "-form_name"}:
            response.sort(key=lambda x: x[ordering.lstrip('-')], reverse=ordering.startswith('-'))

        return Response(response)

        paginator = CustomPagination()
        paginated = paginator.paginate_queryset(result, request)
        return paginator.get_paginated_response(paginated)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class SubmissionSummaryView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FormSubmissionSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return Instance.objects.select_related('user', 'xform')

    def get(self, request, *args, **kwargs):
        user = request.user
        params = request.query_params
        form_id_filter = params.get('form_id')
        ordering = params.get('ordering', 'form_id')
        from_date = params.get('from')
        to_date = params.get('to')

        # Step 1: Get user permissions
        user_asset_map = defaultdict(set)

        perms = AssetUserPartialPermission.objects.using('default').filter(user_id=user.id).select_related('asset')
        for perm in perms:
            asset_id = perm.asset_id
            view_subs = perm.permissions.get("view_submissions", [])
            for entry in view_subs:
                submitted_by = entry.get("_submitted_by")
                if submitted_by:
                    if isinstance(submitted_by, dict) and "$in" in submitted_by:
                        for uname in submitted_by["$in"]:
                            user_asset_map[(asset_id, uname)].add(user.id)
                    elif isinstance(submitted_by, str):
                        user_asset_map[(asset_id, submitted_by)].add(user.id)

        # Step 2: Apply submission filters
        filters = Q()
        if from_date:
            filters &= Q(date_created__date__gte=from_date)
        if to_date:
            filters &= Q(date_created__date__lte=to_date)

        if form_id_filter:
            filters &= Q(xform_id=form_id_filter)

        submission_qs = (
            self.get_queryset()
            .filter(filters)
            .values('xform_id', 'xform__title', 'user__id', 'user__username')
            .annotate(count=Count('id'))
        )

        # Step 3: Create map of (xform_id, username) -> count
        submission_map = {}
        form_name_map = defaultdict(str)
        total_count_map = defaultdict(int)

        for row in submission_qs:
            key = (row['xform_id'], row['user__username'])
            submission_map[key] = row['count']
            form_name_map[row['xform_id']] = row['xform__title']
            total_count_map[row['xform_id']] += row['count']

        # Step 4: Prepare full response with 0 counts
        form_data = defaultdict(list)

        for (form_id, username), _ in user_asset_map.items():
            count = submission_map.get((form_id, username), 0)
            form_data[form_id].append({
                "user_id": user.id,
                "username": username,
                "submission_count": count
            })

        results = []
        for form_id, users in form_data.items():
            results.append({
                "form_id": form_id,
                "form_name": form_name_map.get(form_id, ""),
                "total_submission_count": total_count_map.get(form_id, 0),
                "users": users
            })

        # Step 5: Apply ordering
        reverse = ordering.startswith('-')
        ordering_field = ordering.lstrip('-')
        if ordering_field in {"form_id", "form_name", "total_submission_count"}:
            results.sort(key=lambda x: x.get(ordering_field), reverse=reverse)

        # Step 6: Paginate
        page = self.paginate_queryset(results)
        return self.get_paginated_response(page)
