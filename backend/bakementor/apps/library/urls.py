"""API routes for media management."""
from rest_framework.routers import DefaultRouter

from .views import MediaFileViewSet

router = DefaultRouter()
router.register(r"", MediaFileViewSet, basename="media")

urlpatterns = router.urls
