from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.core.views import get_or_create_profile
from .models import LearningTrack, Module, Lesson, UserProgress
from .serializers import (
    LearningTrackSerializer, ModuleSerializer, ModuleListSerializer,
    UserProgressSerializer
)


class TracksView(APIView):
    """GET /api/tracks/ — List all learning tracks."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tracks = LearningTrack.objects.prefetch_related('modules').all()
        serializer = LearningTrackSerializer(tracks, many=True)
        return Response(serializer.data)


class ModulesView(APIView):
    """GET /api/modules/?track=beginner — List modules, optionally filtered by track."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        track_level = request.query_params.get('track')
        qs = Module.objects.select_related('track')
        if track_level:
            qs = qs.filter(track__track_level=track_level)
        serializer = ModuleListSerializer(qs, many=True)
        return Response(serializer.data)


class ModuleDetailView(APIView):
    """GET /api/modules/<slug>/ — Single module with full lessons."""
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        try:
            module = Module.objects.prefetch_related('lessons').get(slug=slug)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ModuleSerializer(module)
        return Response(serializer.data)


class ProgressView(APIView):
    """GET/POST /api/progress/ — Get or mark module progress."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = get_or_create_profile(request.user)
        progress = UserProgress.objects.filter(user_profile=profile).select_related('module')
        serializer = UserProgressSerializer(progress, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Mark a module as complete. Body: { module_slug, lesson_id (optional) }"""
        profile, _ = get_or_create_profile(request.user)
        module_slug = request.data.get('module_slug')
        lesson_id = request.data.get('lesson_id')

        if not module_slug:
            return Response({'error': 'module_slug is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            module = Module.objects.get(slug=module_slug)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)

        progress, created = UserProgress.objects.get_or_create(
            user_profile=profile,
            module=module,
        )

        # Track individual lesson completion
        if lesson_id and lesson_id not in progress.lessons_completed:
            progress.lessons_completed.append(lesson_id)
            profile.add_xp(10, 'lesson_complete')
            profile.award_badge('first_lesson')

        # Mark module complete if all lessons done
        total_lessons = module.lessons.count()
        if not progress.completed and (len(progress.lessons_completed) >= total_lessons or request.data.get('force_complete')):
            progress.completed = True
            progress.completed_at = timezone.now()
            profile.add_xp(module.xp_reward, 'module_complete')

        progress.save()
        serializer = UserProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)
