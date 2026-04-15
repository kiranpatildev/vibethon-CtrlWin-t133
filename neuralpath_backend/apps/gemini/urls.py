from django.urls import path
from . import views

urlpatterns = [
    path('ai/tutor/', views.AITutorView.as_view(), name='ai-tutor'),
    path('ai/quiz-gen/', views.AIQuizGenView.as_view(), name='ai-quiz-gen'),
    path('ai/hint/', views.AIHintView.as_view(), name='ai-hint'),
    path('ai/explain/', views.AIExplainView.as_view(), name='ai-explain'),
]
