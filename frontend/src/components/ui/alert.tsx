"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const icons = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
};

type AlertVariant = keyof typeof icons;

interface AlertProps {
  title?: string;
  message: ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export function Alert({ title, message, variant = "info", className }: AlertProps) {
  return (
    <div
      className={twMerge(
        "flex items-start gap-3 rounded-lg border border-surface-200 bg-white p-4 text-sm shadow-sm",
        className,
      )}
    >
      <span className="mt-0.5 text-primary-500">{icons[variant]}</span>
      <div>
        {title && <p className="font-semibold text-surface-800">{title}</p>}
        <p className="text-surface-600">{message}</p>
      </div>
    </div>
  );
}

