from django.contrib import admin
from django.urls import path, include
from apps.core.views import PingView, RegisterView, LoginView, MeView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/ping/', PingView.as_view(), name='ping'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/me/', MeView.as_view(), name='me'),
    path('api/', include('apps.curriculum.urls')),
    path('api/', include('apps.quiz.urls')),
    path('api/', include('apps.datasets.urls')),
    path('api/', include('apps.leaderboard.urls')),
    path('api/', include('apps.gemini.urls')),
]
