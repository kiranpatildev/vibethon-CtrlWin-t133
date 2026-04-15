from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Dataset
from .serializers import DatasetListSerializer, DatasetDetailSerializer


class DatasetListView(APIView):
    """GET /api/datasets/ — list all datasets (no rows)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datasets = Dataset.objects.all()
        serializer = DatasetListSerializer(datasets, many=True)
        return Response(serializer.data)


class DatasetDetailView(APIView):
    """GET /api/datasets/<name>/ — full dataset with rows."""
    permission_classes = [IsAuthenticated]

    def get(self, request, name):
        try:
            dataset = Dataset.objects.get(name=name)
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = DatasetDetailSerializer(dataset)
        return Response(serializer.data)
