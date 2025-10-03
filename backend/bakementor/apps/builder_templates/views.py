"""Viewsets for templates and component definitions, plus AI import endpoints."""
from __future__ import annotations

import uuid

from django.core.cache import cache
from django.db import models
from rest_framework import permissions, status, views, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

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


AI_IMPORT_CACHE_PREFIX = "ai_import:"
AI_IMPORT_TTL_SECONDS = 60 * 60


def _cache_key(job_id: uuid.UUID) -> str:
    return f"{AI_IMPORT_CACHE_PREFIX}{job_id}"


class AiImportStartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        figma_url = request.data.get("figma_url")
        if not figma_url or not isinstance(figma_url, str):
            return Response({"detail": "figma_url is required"}, status=status.HTTP_400_BAD_REQUEST)

        job_id = uuid.uuid4()
        cache.set(
            _cache_key(job_id),
            {"progress": 0, "step": "queued", "result": None, "figma_url": figma_url, "user_id": request.user.id},
            timeout=AI_IMPORT_TTL_SECONDS,
        )

        # Defer to Celery task
        try:
            from .tasks import run_figma_import

            run_figma_import.delay(str(job_id), figma_url, request.user.id)
        except Exception:  # pragma: no cover
            # Fallback: set immediate error
            cache.set(_cache_key(job_id), {"progress": 100, "step": "failed", "error": "Task dispatch failed"}, timeout=AI_IMPORT_TTL_SECONDS)
            return Response({"job_id": str(job_id), "accepted": False}, status=status.HTTP_202_ACCEPTED)

        return Response({"job_id": str(job_id), "accepted": True}, status=status.HTTP_202_ACCEPTED)


class AiImportProgressView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id: uuid.UUID):
        data = cache.get(_cache_key(job_id))
        if not data:
            return Response({"detail": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        progress = int(data.get("progress", 0))
        step = data.get("step", "")
        return Response({"job_id": str(job_id), "progress": progress, "step": step})


class AiImportResultView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id: uuid.UUID):
        data = cache.get(_cache_key(job_id))
        if not data:
            return Response({"detail": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        result = data.get("result")
        if not result:
            return Response({"detail": "Result not ready"}, status=status.HTTP_202_ACCEPTED)
        return Response(result)

