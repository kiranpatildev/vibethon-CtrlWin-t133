from django.urls import path
from . import views

urlpatterns = [
    path('', views.MeView.as_view(), name='me'),
    path('update/', views.MeView.as_view(), name='me-update'),
]
