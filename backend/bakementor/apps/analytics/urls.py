"""Analytics API routes."""
from rest_framework.routers import DefaultRouter

from .views import PageDailySummaryViewSet, PageVisitViewSet

router = DefaultRouter()
router.register(r"visits", PageVisitViewSet, basename="analytics-visits")
router.register(r"summaries", PageDailySummaryViewSet, basename="analytics-summaries")

urlpatterns = router.urls
