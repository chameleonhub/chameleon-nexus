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
