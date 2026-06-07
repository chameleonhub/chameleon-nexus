import json

from django.db import connection

from nexus.desk.models import Module


# get assets list for authenticated user
def get_assets_for_user(request):
    if not request.user.is_authenticated:
        return []

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT DISTINCT
                asset.uid,
                asset.name,
                COALESCE(asset.settings, '{}'::jsonb) AS settings
            FROM public.kpi_asset AS asset
            LEFT JOIN public.kpi_objectpermission AS object_permission
                ON object_permission.asset_id = asset.id
                AND object_permission.user_id = %s
                AND object_permission.deny = false
            LEFT JOIN public.auth_permission AS permission
                ON permission.id = object_permission.permission_id
                AND permission.codename = 'view_asset'
            WHERE asset.asset_type = 'survey'
                AND asset.date_deployed IS NOT NULL
                AND asset.pending_delete = false
                AND (
                    asset.owner_id = %s
                    OR permission.id IS NOT NULL
                )
            ORDER BY asset.name, asset.uid
            """,
            [request.user.pk, request.user.pk],
        )
        rows = cursor.fetchall()

    asset_list = []
    for uid, name, settings in rows:
        if isinstance(settings, str):
            settings = json.loads(settings or "{}")

        asset_list.append(
            {
                "uid": uid,
                "name": name,
                "settings": settings or {},
                "has_deployment": True,
            }
        )

    return asset_list


# get module for authenticated user
def get_modules_for_user(request):
    asset_list = get_assets_for_user(request)

    asset_id_list = [asset.get("uid") for asset in asset_list if asset.get("has_deployment", False)]
    if not asset_id_list:
        return Module.objects.none()

    return Module.objects.raw(
        """
        WITH RECURSIVE module AS (
            SELECT *
            FROM desk_module
            WHERE form = ANY(%s)
            UNION ALL
            SELECT dm.*
            FROM desk_module AS dm,
                 module AS m
            WHERE dm.id = m.parent_module_id
        )
        SELECT *
        FROM module
        ORDER BY parent_module_id, sort_order
        """,
        [asset_id_list],
    )
