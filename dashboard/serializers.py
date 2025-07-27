# dashboard/serializers.py
from rest_framework import serializers
from dashboard.models import DailyXFormSubmissionCounter

class DailyXFormSubmissionCounterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    xform_id = serializers.IntegerField(source='xform.id', read_only=True)

    class Meta:
        model = DailyXFormSubmissionCounter
        fields = ['date', 'username', 'xform_id', 'counter']