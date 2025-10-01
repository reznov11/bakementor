"""Celery application instance for BakeMentor."""
from __future__ import annotations

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bakementor.settings")

app = Celery("bakementor")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    """Simple debug task to ensure Celery is wired up."""
    print(f"Request: {self.request!r}")
