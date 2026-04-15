from django.urls import path
from . import views

urlpatterns = [
    path('datasets/', views.DatasetListView.as_view(), name='datasets'),
    path('datasets/<str:name>/', views.DatasetDetailView.as_view(), name='dataset-detail'),
]
