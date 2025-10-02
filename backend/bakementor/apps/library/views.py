"""Viewsets for managing media files."""
from __future__ import annotations

from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from .models import MediaFile
from .serializers import MediaFileSerializer


class MediaFileViewSet(viewsets.ModelViewSet):
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return MediaFile.objects.filter(uploaded_by=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def perform_destroy(self, instance):
        storage = instance.file.storage
        file_name = instance.file.name
        super().perform_destroy(instance)
        if file_name:
            storage.delete(file_name)

