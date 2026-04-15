from django.urls import path
from . import views

urlpatterns = [
    path('tracks/', views.TracksView.as_view(), name='tracks'),
    path('modules/', views.ModulesView.as_view(), name='modules'),
    path('modules/<slug:slug>/', views.ModuleDetailView.as_view(), name='module-detail'),
    path('progress/', views.ProgressView.as_view(), name='progress'),
]
