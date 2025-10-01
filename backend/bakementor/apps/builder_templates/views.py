"""Viewsets for templates and component definitions."""
from __future__ import annotations

from django.db import models
from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from .models import ComponentDefinition, PageTemplate
from .serializers import ComponentDefinitionSerializer, PageTemplateSerializer


class ComponentDefinitionViewSet(viewsets.ModelViewSet):
    queryset = ComponentDefinition.objects.order_by("name")
    serializer_class = ComponentDefinitionSerializer
    permission_classes = [permissions.IsAdminUser]


class PageTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = PageTemplateSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = PageTemplate.objects.filter(created_by=user)
        include_public = self.request.query_params.get("include_public")
        if include_public in {"1", "true", "True"}:
            queryset = PageTemplate.objects.filter(models.Q(created_by=user) | models.Q(is_public=True))
        return queryset.order_by("name")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

