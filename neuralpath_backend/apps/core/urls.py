from django.urls import path
from . import views

urlpatterns = [
    path('', views.MeView.as_view(), name='me'),
    path('update/', views.MeView.as_view(), name='me-update'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('ping/', views.PingView.as_view(), name='ping'),
]
