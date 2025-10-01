"""URL routes for page management."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PageViewSet, PublicPageViewSet

router = DefaultRouter()
router.register(r"", PageViewSet, basename="pages")

urlpatterns = [
    path("", include(router.urls)),
    path("public/<slug:slug>/", PublicPageViewSet.as_view({"get": "retrieve"}), name="public-page"),
]
