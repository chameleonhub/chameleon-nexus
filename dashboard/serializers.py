from rest_framework import serializers
from dashboard.models import DailyXFormSubmissionCounter
from rest_framework import serializers
from .models import Asset, AssetUserPartialPermission
from django.contrib.auth.models import User


class DailyXFormSubmissionCounterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    xform_id = serializers.IntegerField(source='xform.id', read_only=True)

    class Meta:
        model = DailyXFormSubmissionCounter
        fields = ['date', 'username', 'xform_id', 'counter']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class AssetSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all(), allow_null=True)
    children = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    deployment_status = serializers.CharField(source='_deployment_status', read_only=True)
    deployment_data = serializers.JSONField(source='_deployment_data', read_only=True)

    class Meta:
        model = Asset
        fields = [
            'uid',
            'name',
            'asset_type',
            'owner',
            'date_created',
            'date_modified',
            'date_deployed',
            'content',
            'summary',
            'report_styles',
            'report_custom',
            'map_styles',
            'map_custom',
            'advanced_features',
            'known_cols',
            'parent',
            'children',
            'settings',
            'deployment_status',
            'deployment_data',
            'data_sharing',
            'paired_data',
            'pending_delete',
        ]
        read_only_fields = fields  # Make all fields read-only for your use case


class AssetListSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'uid',
            'name',
            'asset_type',
            'owner',
            'date_modified',
            'deployment_status',
            'submission_count',
        ]
        read_only_fields = fields

    def get_submission_count(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Implement your logic to get count for the current user
            return obj.submissions.for_user(request.user).count()
        return 0


class AssetUserPartialPermissionSerializer(serializers.ModelSerializer):
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())
    user = UserSerializer(read_only=True)

    class Meta:
        model = AssetUserPartialPermission
        fields = [
            'id',
            'asset',
            'user',
            'permissions',
            'date_created',
            'date_modified',
        ]
        read_only_fields = ['id', 'user', 'date_created', 'date_modified']


class AssetWithPermissionsSerializer(AssetSerializer):
    partial_permissions = serializers.SerializerMethodField()

    class Meta(AssetSerializer.Meta):
        fields = AssetSerializer.Meta.fields + ['partial_permissions']

    def get_partial_permissions(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            perm = obj.asset_partial_permissions.filter(user=request.user).first()
            if perm:
                return AssetUserPartialPermissionSerializer(perm).data
        return None


class AssetViewPermissionSerializer(serializers.ModelSerializer):
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())
    permissions = serializers.SerializerMethodField()

    def get_permissions(self, obj):
        """
        Return only the view_submissions permissions in the expected structure
        """
        original_permissions = obj.permissions
        if not isinstance(original_permissions, dict):
            return {}

        view_perms = original_permissions.get('view_submissions', [])
        return {'view_submissions': view_perms} if view_perms else {}


    class Meta:
        model = AssetUserPartialPermission
        fields = [
            'id',
            'asset',
            'user',
            'permissions',
        ]
        read_only_fields = ['id', 'user',]


class SubmissionCountSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    form_id = serializers.IntegerField(source="asset_id")
    form_name = serializers.CharField()
    submission_count = serializers.IntegerField()



class UserSubmissionSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    submission_count = serializers.IntegerField()

class FormSubmissionSerializer(serializers.Serializer):
    form_id = serializers.IntegerField()
    form_name = serializers.CharField()
    total_submission_count = serializers.IntegerField()
    users = UserSubmissionSerializer(many=True)
