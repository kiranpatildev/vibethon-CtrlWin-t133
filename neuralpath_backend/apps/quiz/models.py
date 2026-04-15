from django.db import models
from apps.core.models import UserProfile
from apps.curriculum.models import Module


class Quiz(models.Model):
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    module = models.ForeignKey(Module, on_delete=models.CASCADE, null=True, blank=True, related_name='quizzes')
    title = models.CharField(max_length=200)
    is_ai_generated = models.BooleanField(default=False)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPES = [('mcq', 'Multiple Choice'), ('code', 'Code-based')]
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES, default='mcq')
    question_text = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.IntegerField()
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:60]}"


class UserQuizResult(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='quiz_results')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.IntegerField()
    max_score = models.IntegerField()
    time_taken_seconds = models.IntegerField(default=0)
    answers = models.JSONField(default=dict)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    @property
    def percentage(self):
        return round((self.score / self.max_score) * 100) if self.max_score > 0 else 0

    def __str__(self):
        return f"{self.user_profile} — {self.quiz.title} ({self.percentage}%)"
