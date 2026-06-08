from django.contrib.auth import get_user_model
from django.db import connection
from rest_framework import permissions, response, views, viewsets

from nexus.desk.api.serializers import ModuleSerializer, ModuleTypeSerializer, WorkflowSerializer
from nexus.desk.models import Module, ModuleType, Workflow
from nexus.desk.utils import get_modules_for_user, search_assets_for_user


class ModuleTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows ModuleTypes to be viewed or edited.
    """

    queryset = ModuleType.objects.all().order_by("id")
    serializer_class = ModuleTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class ModuleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Modules to be viewed or edited.
    """

    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return get_modules_for_user(self.request)


class WorkflowViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Workflows to be viewed or edited.
    """

    queryset = Workflow.objects.all().order_by("id")
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.IsAuthenticated]  # [permissions.IsAuthenticated] FIXME auth is turned off


class FormListView(views.APIView):
    """
    Fast form list for desk CRUD dropdowns.

    This reads deployed survey assets directly from the KPI database.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        query = request.query_params.get("q", "")
        selected = request.query_params.get("selected", "")
        limit = request.query_params.get("limit", 100)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 100

        results = [
            {
                "id": asset.get("uid"),
                "uid": asset.get("uid"),
                "name": asset.get("name") or asset.get("uid"),
                "description": asset.get("settings", {}).get("description") or "",
            }
            for asset in search_assets_for_user(
                request,
                query=query,
                selected=selected,
                limit=limit,
            )
        ]
        return response.Response(
            {
                "count": len(results),
                "results": results,
            }
        )


class DeskUserListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        query = (request.query_params.get("q") or "").strip()
        try:
            limit = int(request.query_params.get("limit", 1000))
        except (TypeError, ValueError):
            limit = 1000
        limit = max(1, min(limit, 2000))

        users = get_user_model().objects.filter(is_active=True).only(
            "id",
            "username",
            "email",
            "is_superuser",
            "date_joined",
            "last_login",
            "is_active",
        )
        if query:
            users = users.filter(username__icontains=query)

        results = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_superuser": user.is_superuser,
                "date_joined": user.date_joined,
                "last_login": user.last_login,
                "is_active": user.is_active,
                "asset_count": 0,
                "metadata": {},
            }
            for user in users.order_by("username")[:limit]
        ]
        return response.Response({"count": len(results), "results": results})


def _api_url(resource, value):
    return f"{resource}/{value}/"


def _partial_permissions_to_api(permissions_json):
    partial_permissions = []
    if isinstance(permissions_json, list):
        for item in permissions_json:
            if isinstance(item, dict) and item.get("url"):
                partial_permissions.append(
                    {
                        "url": item.get("url"),
                        "filters": item.get("filters") or [],
                    }
                )
        return partial_permissions

    if isinstance(permissions_json, dict):
        for permission, filters in permissions_json.items():
            if not filters:
                continue
            partial_permissions.append(
                {
                    "url": _api_url("permissions", permission),
                    "filters": filters if isinstance(filters, list) else [filters],
                }
            )
    return partial_permissions


class FormPermissionDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, uid, format=None):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT asset.id,
                       asset.uid,
                       asset.name,
                       owner.username
                FROM public.kpi_asset AS asset
                LEFT JOIN public.auth_user AS owner ON owner.id = asset.owner_id
                WHERE asset.uid = %s
                LIMIT 1
                """,
                [uid],
            )
            asset = cursor.fetchone()

            if not asset:
                return response.Response({"detail": "Form not found."}, status=404)

            asset_id, asset_uid, asset_name, owner_username = asset

            cursor.execute(
                """
                SELECT auth_user.username,
                       permission.codename,
                       permission.name
                FROM public.kpi_objectpermission AS object_permission
                INNER JOIN public.auth_user AS auth_user
                    ON auth_user.id = object_permission.user_id
                INNER JOIN public.auth_permission AS permission
                    ON permission.id = object_permission.permission_id
                WHERE object_permission.asset_id = %s
                  AND object_permission.deny = false
                ORDER BY auth_user.username, permission.codename
                """,
                [asset_id],
            )
            object_permissions = cursor.fetchall()

            cursor.execute(
                """
                SELECT auth_user.username,
                       partial_permission.permissions
                FROM public.kpi_assetuserpartialpermission AS partial_permission
                INNER JOIN public.auth_user AS auth_user
                    ON auth_user.id = partial_permission.user_id
                WHERE partial_permission.asset_id = %s
                ORDER BY auth_user.username
                """,
                [asset_id],
            )
            partial_permissions = cursor.fetchall()

        permissions_data = [
            {
                "url": _api_url("permission-assignments", f"{username}-{codename}"),
                "user": _api_url("users", username),
                "permission": _api_url("permissions", codename),
                "label": label or codename,
            }
            for username, codename, label in object_permissions
        ]

        for username, permissions_json in partial_permissions:
            partials = _partial_permissions_to_api(permissions_json)
            if partials:
                permissions_data.append(
                    {
                        "url": _api_url("permission-assignments", f"{username}-partial_submissions"),
                        "user": _api_url("users", username),
                        "permission": _api_url("permissions", "partial_submissions"),
                        "label": "Partial submissions",
                        "partial_permissions": partials,
                    }
                )

        return response.Response(
            {
                "uid": asset_uid,
                "name": asset_name,
                "owner__username": owner_username,
                "owner": _api_url("users", owner_username) if owner_username else "",
                "permissions": permissions_data,
            }
        )
