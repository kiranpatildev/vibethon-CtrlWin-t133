from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    level = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'display_name', 'email',
            'xp_points', 'streak_count', 'last_active_date',
            'badges', 'created_at', 'level',
        ]
        read_only_fields = ['id', 'xp_points', 'streak_count', 'badges', 'created_at']

    def get_level(self, obj):
        xp = obj.xp_points
        if xp < 200:
            return {'name': 'Novice', 'number': 1, 'next_xp': 200}
        elif xp < 500:
            return {'name': 'Apprentice', 'number': 2, 'next_xp': 500}
        elif xp < 1000:
            return {'name': 'Practitioner', 'number': 3, 'next_xp': 1000}
        elif xp < 2000:
            return {'name': 'Expert', 'number': 4, 'next_xp': 2000}
        else:
            return {'name': 'Master', 'number': 5, 'next_xp': None}
