"use client";

import { AppShell } from "@/components/layout/app-shell";
import { useTranslations } from "@/i18n/provider";

export default function AnalyticsPage() {
  const t = useTranslations();

  return (
    <AppShell title={t("dashboard.navbar.analytics") || "Analytics"}>
      <div className="rounded-2xl border border-surface-200 bg-white p-10 text-center text-sm text-surface-500">
        Analytics widgets will live here. Hook up to custom trackers or import data from the backend.
      </div>
    </AppShell>
  );
}
