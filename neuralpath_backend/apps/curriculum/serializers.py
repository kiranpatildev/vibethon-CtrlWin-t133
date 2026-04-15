from rest_framework import serializers
from .models import LearningTrack, Module, Lesson, UserProgress


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content_markdown', 'has_code_challenge',
                  'starter_code', 'test_cases', 'order']


class LessonListSerializer(serializers.ModelSerializer):
    """Lightweight — for listing without full markdown."""
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'has_code_challenge', 'order']


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    track_name = serializers.CharField(source='track.name', read_only=True)
    track_level = serializers.CharField(source='track.track_level', read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'slug', 'description', 'order',
                  'estimated_minutes', 'xp_reward', 'skill_category',
                  'track_name', 'track_level', 'lessons']


class ModuleListSerializer(serializers.ModelSerializer):
    """Lightweight — for listing without lessons."""
    track_name = serializers.CharField(source='track.name', read_only=True)
    track_level = serializers.CharField(source='track.track_level', read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'slug', 'description', 'order',
                  'estimated_minutes', 'xp_reward', 'skill_category',
                  'track_name', 'track_level']


class LearningTrackSerializer(serializers.ModelSerializer):
    modules = ModuleListSerializer(many=True, read_only=True)
    module_count = serializers.SerializerMethodField()

    class Meta:
        model = LearningTrack
        fields = ['id', 'name', 'track_level', 'order', 'description', 'icon', 'modules', 'module_count']

    def get_module_count(self, obj):
        return obj.modules.count()


class UserProgressSerializer(serializers.ModelSerializer):
    module_slug = serializers.CharField(source='module.slug', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    xp_reward = serializers.IntegerField(source='module.xp_reward', read_only=True)

    class Meta:
        model = UserProgress
        fields = ['id', 'module_slug', 'module_title', 'xp_reward',
                  'completed', 'completed_at', 'score', 'lessons_completed']
