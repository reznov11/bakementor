"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CircleCheck, Edit3 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { usePages } from "@/features/pages/hooks";
import type { Page } from "@/types/pages";
import { useTranslations } from "@/i18n/provider";

export default function DashboardPage() {
  const { data, isLoading, error } = usePages();
  const pages: Page[] = data ?? [];

  const t = useTranslations();

  return (
    <AppShell
      title={t("builder.pagesTitle")}
      action={
        <Button asChild>
          <Link href="/builder/new">{t("builder.createNew")}</Link>
        </Button>
      }
    >
      {isLoading && (
        <div className="flex h-64 w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {t("common.loadError")}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2">
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/builder/${page.id}`}
              className="group flex h-full flex-col justify-between rounded-2xl border border-surface-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-subtle"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">{page.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-surface-500">{page.description || t("page.noDescription")}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    page.status === "published"
                      ? "bg-green-50 text-green-600"
                      : page.status === "review"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-surface-100 text-surface-500"
                  }`}
                >
                  {page.status === "published" && <CircleCheck className="h-3.5 w-3.5" />}
                  {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-surface-500">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-1">
                    <Edit3 className="h-3.5 w-3.5" />
                    v{page.current_version?.version ?? 1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {(page.tags ?? []).length} tags
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-primary-600">
                  {t("builder.edit")}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}

          {data?.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-surface-200 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-surface-900">{t("page.createFirstTitle")}</h3>
              <p className="mt-2 text-sm text-surface-500">{t("page.createFirstBody")}</p>
              <Button className="mt-6" asChild>
                <Link href="/builder/new">{t("common.startBuilding")}</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
