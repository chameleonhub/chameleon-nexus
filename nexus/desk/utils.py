import requests
from django.core.cache import cache
from rest_framework.authtoken.models import Token

from nexus.desk.models import Module
from config.settings.base import env


# get assets list for authenticated user
def get_assets_for_user(request):
    cache_key = f"desk:kobo-assets:{request.user.pk}"
    cached_assets = cache.get(cache_key)
    if cached_assets is not None:
        return cached_assets

    api_url = env("KOBOTOOLBOX_KF_API_URL")
    token = Token.objects.get(user=request.user).key
    response = requests.get(
        f"{api_url}assets/?format=json",
        headers={"Authorization": f"Token {token}"},
        timeout=5,
    )
    response.raise_for_status()
    asset_list = response.json().get("results")
    cache.set(cache_key, asset_list, 300)
    return asset_list


# get module for authenticated user
def get_modules_for_user(request):
    asset_list = get_assets_for_user(request)

    if asset_list:
        asset_id_list = tuple([asset.get("uid") for asset in asset_list if asset.get("has_deployment", False)])

        return Module.objects.raw(
            f"""
                                WITH RECURSIVE module(id) AS (SELECT *
                                            FROM desk_module
                                            WHERE form in ({', '.join("'" + str(id) + "'" for id in asset_id_list)})
                                            UNION ALL
                                            SELECT dm.*
                                            FROM desk_module AS dm,
                                                 module AS m
                                            WHERE dm.id = m.parent_module_id)
                                SELECT *
                                FROM module order by parent_module_id, sort_order
                                """
        )
