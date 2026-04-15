from django.db import models
from apps.core.models import UserProfile


class LearningTrack(models.Model):
    TRACK_CHOICES = [
        ('beginner', 'Beginner'),
        ('practitioner', 'Practitioner'),
        ('advanced', 'Advanced'),
    ]
    name = models.CharField(max_length=100)
    track_level = models.CharField(max_length=20, choices=TRACK_CHOICES)
    order = models.IntegerField(default=0)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='book')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Module(models.Model):
    SKILL_CATEGORIES = [
        ('nlp', 'NLP'),
        ('computer_vision', 'Computer Vision'),
        ('tabular', 'Tabular Data'),
        ('reinforcement_learning', 'Reinforcement Learning'),
        ('model_evaluation', 'Model Evaluation'),
        ('data_preprocessing', 'Data Preprocessing'),
        ('fundamentals', 'Fundamentals'),
    ]
    track = models.ForeignKey(LearningTrack, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    order = models.IntegerField(default=0)
    estimated_minutes = models.IntegerField(default=15)
    xp_reward = models.IntegerField(default=50)
    skill_category = models.CharField(max_length=30, choices=SKILL_CATEGORIES, default='fundamentals')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content_markdown = models.TextField()
    has_code_challenge = models.BooleanField(default=False)
    starter_code = models.TextField(blank=True)
    solution_code = models.TextField(blank=True)
    test_cases = models.JSONField(default=list)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.module.title} — {self.title}"


class UserProgress(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='progress')
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(default=0)
    lessons_completed = models.JSONField(default=list)  # list of lesson IDs

    class Meta:
        unique_together = ('user_profile', 'module')
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user_profile} — {self.module.title}"
