"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  title?: string;
  description?: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-surface-900/40 p-4">
      <div className="max-w-lg animate-fade-in rounded-2xl bg-white p-6 shadow-lg">
        {title ? <h3 className="text-lg font-semibold text-surface-900">{title}</h3> : null}
        {description ? <p className="mt-3 text-sm text-surface-600">{description}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
