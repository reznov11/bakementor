"""Viewsets for managing media files."""
from __future__ import annotations

from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import Permission

from .models import MediaFile
from .serializers import MediaFileSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 100


class IsLibraryUploader(permissions.BasePermission):
    """Allow access only to authenticated users who have add_mediafile permission or staff."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff:
            return True
        # check model permission
        return request.user.has_perm("apps.library.add_mediafile")


class MediaFileViewSet(viewsets.ModelViewSet):
    serializer_class = MediaFileSerializer
    permission_classes = [IsLibraryUploader]
    parser_classes = (MultiPartParser, FormParser)
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Return files visible to the current user.

        By default non-staff users see only their own uploads. Staff can see all.
        Supports filtering by media_type via ?media_type=image
        """
        qs = MediaFile.objects.all().order_by("-created_at")
        if not self.request.user.is_staff:
            qs = qs.filter(uploaded_by=self.request.user)
        media_type = self.request.query_params.get("media_type")
        if media_type:
            qs = qs.filter(media_type=media_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def perform_destroy(self, instance):
        storage = instance.file.storage
        file_name = instance.file.name
        super().perform_destroy(instance)
        if file_name:
            storage.delete(file_name)

    @action(detail=False, methods=["post"], permission_classes=[IsLibraryUploader], url_path="upload")
    def upload(self, request):
        """Dedicated upload endpoint that accepts multipart file and optional title/alt_text.

        Returns created object or validation errors.
        """
        data = request.data.copy()
        # If user didn't provide title, use filename
        file_obj = data.get("file")
        if file_obj and not data.get("title"):
            data["title"] = getattr(file_obj, "name", "Untitled")

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

