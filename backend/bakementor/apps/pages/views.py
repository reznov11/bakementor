"""Views for managing pages and versions."""
from __future__ import annotations

from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.models import PublishStatus

from .models import Page, PageVersion
from .serializers import (
    PageCreateSerializer,
    PagePublishSerializer,
    PageSerializer,
    PageVersionSerializer,
    PageVersionWriteSerializer,
)


class PageViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Page.objects.select_related("owner", "current_version", "published_version")
            .filter(owner=self.request.user, is_deleted=False)
            .order_by("title")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return PageCreateSerializer
        return PageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        page = serializer.save()
        output = PageSerializer(page, context=self.get_serializer_context())
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        page = self.get_object()
        serializer = PagePublishSerializer(data=request.data, context={"page": page})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="versions")
    def list_versions(self, request, pk=None):
        page = self.get_object()
        versions = page.versions.order_by("-created_at")
        serializer = PageVersionSerializer(versions, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="versions")
    def create_version(self, request, pk=None):
        page = self.get_object()
        serializer = PageVersionWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        version = PageVersion.objects.create(
            page=page,
            version=PageVersion.next_version_for(page),
            created_by=request.user,
            **serializer.validated_data,
        )
        page.current_version = version
        page.status = PublishStatus.DRAFT
        page.save(update_fields=["current_version", "status"])
        output = PageVersionSerializer(version, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)


class PublicPageViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Page.objects.select_related("published_version")
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        page = self.get_object()
        if not page.is_public or not page.published_version:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = PageVersionSerializer(page.published_version, context=self.get_serializer_context())
        return Response(
            {
                "page": PageSerializer(page, context=self.get_serializer_context()).data,
                "version": serializer.data,
            }
        )

