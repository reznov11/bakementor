"""Analytics endpoints."""
from __future__ import annotations

from rest_framework import permissions, viewsets

from .models import PageDailySummary, PageVisit
from .serializers import PageDailySummarySerializer, PageVisitSerializer


class PageVisitViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PageVisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PageVisit.objects.filter(page__owner=self.request.user)
        page_id = self.request.query_params.get("page")
        if page_id:
            queryset = queryset.filter(page_id=page_id)
        return queryset.order_by("-visited_at")


class PageDailySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PageDailySummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PageDailySummary.objects.filter(page__owner=self.request.user)
        page_id = self.request.query_params.get("page")
        if page_id:
            queryset = queryset.filter(page_id=page_id)
        return queryset.order_by("-date")

