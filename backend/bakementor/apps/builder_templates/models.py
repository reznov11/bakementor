"""Template and component registry models."""
from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.common.models import TimeStampedModel, UUIDModel


class ComponentCategory(models.TextChoices):
    HERO = "hero", "Hero"
    CONTENT = "content", "Content"
    MEDIA = "media", "Media"
    FORMS = "forms", "Forms"
    LAYOUT = "layout", "Layout"
    CTA = "cta", "Call to action"


class ComponentDefinition(UUIDModel, TimeStampedModel):
    key = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=30, choices=ComponentCategory.choices)
    description = models.TextField(blank=True)
    schema = models.JSONField(default=dict)
    props_schema = models.JSONField(default=dict, blank=True)
    preview_image = models.ImageField(upload_to="component_previews/", blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class PageTemplate(UUIDModel, TimeStampedModel):
    name = models.CharField(max_length=180)
    slug = models.SlugField(unique=True, max_length=200)
    description = models.TextField(blank=True)
    component_tree = models.JSONField(default=dict)
    thumbnail = models.ImageField(upload_to="template_thumbnails/", blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_templates",
    )
    is_public = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while PageTemplate.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                counter += 1
                slug = f"{base_slug}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name

