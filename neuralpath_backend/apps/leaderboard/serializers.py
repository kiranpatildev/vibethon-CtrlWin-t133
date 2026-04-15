from rest_framework import serializers
from .models import LeaderboardEntry


class LeaderboardSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='user_profile.display_name', read_only=True)
    badges = serializers.JSONField(source='user_profile.badges', read_only=True)
    streak_count = serializers.IntegerField(source='user_profile.streak_count', read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = ['rank', 'display_name', 'xp_points', 'modules_completed',
                  'quizzes_passed', 'badges', 'streak_count', 'updated_at']
