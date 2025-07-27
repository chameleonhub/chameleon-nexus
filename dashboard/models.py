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