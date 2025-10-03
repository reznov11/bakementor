"""Routes for builder templates API."""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AiImportProgressView,
    AiImportResultView,
    AiImportStartView,
    ComponentDefinitionViewSet,
    PageTemplateViewSet,
)

router = DefaultRouter()
router.register(r"components", ComponentDefinitionViewSet, basename="component-definition")
router.register(r"", PageTemplateViewSet, basename="page-template")

urlpatterns = [
    path("ai/import/start", AiImportStartView.as_view(), name="ai-import-start"),
    path("ai/import/<uuid:job_id>/progress", AiImportProgressView.as_view(), name="ai-import-progress"),
    path("ai/import/<uuid:job_id>/result", AiImportResultView.as_view(), name="ai-import-result"),
]

urlpatterns += router.urls
