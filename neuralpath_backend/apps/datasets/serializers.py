from rest_framework import serializers
from .models import Dataset


class DatasetListSerializer(serializers.ModelSerializer):
    row_count = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = ['id', 'name', 'display_name', 'description', 'task_type',
                  'target_column', 'feature_columns', 'row_count', 'created_at']

    def get_row_count(self, obj):
        return len(obj.rows) if obj.rows else 0


class DatasetDetailSerializer(serializers.ModelSerializer):
    row_count = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = ['id', 'name', 'display_name', 'description', 'columns',
                  'rows', 'task_type', 'target_column', 'feature_columns',
                  'row_count', 'created_at']

    def get_row_count(self, obj):
        return len(obj.rows) if obj.rows else 0
