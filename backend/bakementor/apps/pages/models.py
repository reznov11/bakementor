"""Page builder domain models."""
from __future__ import annotations

from typing import Any

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from apps.common.models import PublishStatus, SoftDeleteModel, TimeStampedModel, UUIDModel


class Page(UUIDModel, TimeStampedModel, SoftDeleteModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pages",
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=220)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=PublishStatus.choices, default=PublishStatus.DRAFT)
    is_public = models.BooleanField(default=False)
    current_version = models.OneToOneField(
        "PageVersion",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="current_for_page",
    )
    published_version = models.OneToOneField(
        "PageVersion",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="published_for_page",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("title",)

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Page.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                counter += 1
                slug = f"{base_slug}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def mark_published(self, version: "PageVersion") -> None:
        self.status = PublishStatus.PUBLISHED
        self.published_version = version
        self.published_at = timezone.now()
        self.is_public = True
        self.save(update_fields=["status", "published_version", "published_at", "is_public"])

    def __str__(self) -> str:
        return self.title


class PageVersion(UUIDModel, TimeStampedModel):
    page = models.ForeignKey(Page, related_name="versions", on_delete=models.CASCADE)
    version = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_page_versions",
    )
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    component_tree = models.JSONField(default=dict)
    metadata = models.JSONField(default=dict, blank=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ("-created_at",)
        unique_together = ("page", "version")

    def __str__(self) -> str:
        return f"{self.page.title} v{self.version}"

    def mark_as_published(self) -> None:
        self.is_published = True
        self.save(update_fields=["is_published"])

    @staticmethod
    def next_version_for(page: Page) -> int:
        last_version = page.versions.order_by("-version").first()
        return (last_version.version if last_version else 0) + 1


class PageDraftLock(UUIDModel, TimeStampedModel):
    """Optional collaborative editing lock."""

    page = models.OneToOneField(Page, on_delete=models.CASCADE, related_name="draft_lock")
    locked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="page_locks",
    )
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = "Page draft lock"
        verbose_name_plural = "Page draft locks"

    def is_active(self) -> bool:
        return timezone.now() < self.expires_at

