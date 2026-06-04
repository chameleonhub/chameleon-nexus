from django.db import models
from django.contrib.auth.models import User


class DailyXFormSubmissionCounter(models.Model):
    date = models.DateField()
    user = models.ForeignKey(
        'auth.User',  # Changed from User to 'auth.User'
        related_name='+',
        on_delete=models.DO_NOTHING
    )
    xform = models.ForeignKey(
        'dashboard.XForm',  # Changed to reference local XForm
        related_name='+',
        null=True,
        on_delete=models.DO_NOTHING
    )
    counter = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'logger_dailyxformsubmissioncounter'
        app_label = 'dashboard'


class XForm(models.Model):
    """Minimal representation of Kobocat's XForm model"""
    id = models.IntegerField(primary_key=True)
    # Add any other fields you need to reference
    id_string = models.CharField(max_length=255)
    title = models.CharField(max_length=255)

    class Meta:
        managed = False  # Don't manage this table
        db_table = 'logger_xform'  # Actual table name in kobocat
        app_label = 'dashboard'


class Asset(models.Model):
    name = models.CharField(max_length=255, blank=True, default='')
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    date_deployed = models.DateTimeField(null=True)
    content = models.JSONField(default=dict)
    summary = models.JSONField(default=dict)
    report_styles = models.JSONField(default=dict)
    report_custom = models.JSONField(default=dict)
    map_styles = models.JSONField(default=dict)
    map_custom = models.JSONField(default=dict)
    advanced_features = models.JSONField(default=dict)
    known_cols = models.JSONField(default=list)
    asset_type = models.CharField(max_length=20, db_index=True)
    parent = models.ForeignKey('Asset', related_name='children',
                               null=True, blank=True, on_delete=models.CASCADE)
    owner = models.ForeignKey('auth.User', related_name='assets', null=True,
                              on_delete=models.CASCADE)
    uid = models.TextField()
    settings = models.JSONField(default=dict)
    _deployment_data = models.JSONField(default=dict)

    data_sharing = models.JSONField(default=dict)
    paired_data = models.JSONField(default=dict)
    pending_delete = models.BooleanField(default=False)

    _deployment_status = models.CharField(
        max_length=8,
        null=True,
        blank=True,
        db_index=True
    )

    class Meta:
        managed = False
        db_table = 'kpi_asset'
        app_label = 'dashboard'


class AssetUserPartialPermission(models.Model):
    asset = models.ForeignKey(
        'Asset',
        related_name='asset_partial_permissions',
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        'auth.User',
        related_name='user_partial_permissions',
        on_delete=models.CASCADE,
    )
    permissions = models.JSONField()
    date_created = models.DateTimeField()
    date_modified = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'kpi_assetuserpartialpermission'
        app_label = 'dashboard'


class Instance(models.Model):
    XML_HASH_LENGTH = 64
    DEFAULT_XML_HASH = None

    json = models.JSONField(default=dict, null=False)
    xml = models.TextField()
    xml_hash = models.CharField(max_length=XML_HASH_LENGTH, db_index=True, null=True,
                                default=DEFAULT_XML_HASH)
    user = models.ForeignKey(User, related_name='instances', null=True, on_delete=models.CASCADE)
    xform = models.ForeignKey(XForm, null=True, related_name='instances', on_delete=models.CASCADE)

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, default=None)
    status = models.CharField(max_length=20,
                              default='submitted_via_web')
    uuid = models.CharField(max_length=249, default='', db_index=True)
    validation_status = models.JSONField(null=True, default=None)

    class Meta:
        app_label = 'dashboard'
        db_table = 'logger_instance'
        managed = False

    @property
    def asset(self):
        return self.xform
