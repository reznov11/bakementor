"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/i18n/provider";
import type { Page } from "@/types/pages";
import { useUpdatePage, useDeletePage } from "@/features/pages/hooks";

interface Props {
  page: Page;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function PageSettingsModal({ page, open, onClose, onDeleted }: Props) {
  const t = useTranslations();
  const [title, setTitle] = useState(page.title ?? "");
  const [description, setDescription] = useState(page.description ?? "");

  useEffect(() => {
    setTitle(page.title ?? "");
    setDescription(page.description ?? "");
  }, [page]);

  const update = useUpdatePage(String(page.id));
  const del = useDeletePage(String(page.id));

  const handleSave = async () => {
    try {
      await update.mutateAsync({ title, description });
      // notify global toast listener in builder page
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: t("builder.pageSaved") || "Page updated" } }));
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (typeof window !== "undefined") {
        let msg = "Failed to update page";
        if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
          msg = (err as { message: string }).message;
        }
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: `Failed to update page: ${msg}` } }));
      }
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("inspector.confirmDelete") || "Are you sure you want to delete this page? This cannot be undone.")) return;
    try {
      await del.mutateAsync();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: t("inspector.deleted") || "Page deleted" } }));
      }
      onClose();
      onDeleted?.();
    } catch (err) {
      console.error(err);
      if (typeof window !== "undefined") {
        let msg = "Failed to delete page";
        if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
          msg = (err as { message: string }).message;
        }
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: `Failed to delete page: ${msg}` } }));
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-subtle" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-surface-900">{t("builder.pageSettings") || "Page settings"}</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="page-title">{t("builder.pageTitle")}</Label>
            <Input id="page-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="page-desc">{t("builder.pageDescription")}</Label>
            <Input id="page-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
              {t("inspector.delete")}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>{t("common.cancel") || "Cancel"}</Button>
            <Button onClick={handleSave} disabled={update.isPending}>{t("builder.savePage")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
