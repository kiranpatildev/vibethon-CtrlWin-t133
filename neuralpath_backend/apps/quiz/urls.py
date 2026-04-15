from django.urls import path
from . import views

urlpatterns = [
    path('quiz/', views.QuizView.as_view(), name='quiz'),
    path('quiz/submit/', views.QuizSubmitView.as_view(), name='quiz-submit'),
]
