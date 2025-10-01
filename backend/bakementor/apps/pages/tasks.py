"""Celery tasks for page lifecycle."""
from __future__ import annotations

from celery import shared_task
from django.db import transaction

from .models import Page, PageVersion


@shared_task(name="pages.publish_version")
def publish_page_version(page_id: str, version_id: str) -> None:
    try:
        page = Page.objects.get(id=page_id)
        version = page.versions.get(id=version_id)
    except (Page.DoesNotExist, PageVersion.DoesNotExist):
        return

    with transaction.atomic():
        version.mark_as_published()
        page.mark_published(version)

