from django.urls import path
from . import views

urlpatterns = [
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('leaderboard/me/', views.MyRankView.as_view(), name='leaderboard-me'),
]
