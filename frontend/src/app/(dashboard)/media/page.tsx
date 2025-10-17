"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/provider";

export default function MediaLibraryPage() {
  const t = useTranslations();

  return (
    <AppShell
      title={t("inspector.mediaLibrary" ) || "Media Library"}
      action={
        <Button asChild>
          <Link href="/media/upload">{t("inspector.mediaLibrary")}</Link>
        </Button>
      }
    >
      <div className="rounded-2xl border border-dashed border-surface-200 bg-white p-12 text-center text-sm text-surface-500">
        Asset manager coming soon. Drag files here or upload via the button above.
      </div>
    </AppShell>
  );
}
