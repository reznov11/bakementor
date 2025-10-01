"""Routes for builder templates API."""
from rest_framework.routers import DefaultRouter

from .views import ComponentDefinitionViewSet, PageTemplateViewSet

router = DefaultRouter()
router.register(r"components", ComponentDefinitionViewSet, basename="component-definition")
router.register(r"", PageTemplateViewSet, basename="page-template")

urlpatterns = router.urls
