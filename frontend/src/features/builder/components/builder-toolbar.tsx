"use client";

import { ArrowLeft, Eye, Save, Rocket, Monitor, Sun, Moon } from "lucide-react";

import { DEVICE_ICONS } from "@/features/builder/constants";
import { Button } from "@/components/ui/button";
import type { BreakpointId } from "@/types/builder";
import { useTheme } from "@/hooks/use-theme";
import { useTranslations } from "@/i18n/provider";

interface BuilderToolbarProps {
  activeBreakpoint: BreakpointId;
  onBreakpointChange: (breakpoint: BreakpointId) => void;
  onBack: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onOpenShortcuts: () => void;
  isSavingDraft?: boolean;
  isPublishing?: boolean;
}

const BREAKPOINT_ORDER: BreakpointId[] = ["desktop", "tablet", "mobile"];

export function BuilderToolbar({
  activeBreakpoint,
  onBreakpointChange,
  onBack,
  onPreview,
  onSaveDraft,
  onPublish,
  onOpenShortcuts,
  isSavingDraft = false,
  isPublishing = false,
}: BuilderToolbarProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const t = useTranslations();

  return (
    <header className="flex items-center justify-between border-b border-surface-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t("builder.dashboard")}
        </Button>
        <div className="hidden items-center gap-2 text-sm font-medium text-surface-600 sm:flex">
          <Monitor className="h-4 w-4 text-primary-500" />
          {t("builder.builderName")}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs text-surface-500 sm:flex">
            <button
            type="button"
            onClick={onOpenShortcuts}
            className="flex items-center gap-1 text-surface-500 transition hover:text-primary-600"
          >
            {t("builder.typeSearch")} <kbd className="rounded bg-surface-200 px-1">{t("builder.ctrl")}</kbd>+
            <kbd className="rounded bg-surface-200 px-1">{t("builder.slash")}</kbd> {t("builder.toSearch")}
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-surface-200 bg-surface-50 p-1">
          {BREAKPOINT_ORDER.map((breakpoint) => (
            <button
              key={breakpoint}
              type="button"
              onClick={() => onBreakpointChange(breakpoint)}
              className={`flex items-center gap-1 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ${
                activeBreakpoint === breakpoint ? "bg-white text-primary-600 shadow-sm" : "text-surface-500 hover:text-primary-600"
              }`}
            >
              {DEVICE_ICONS[breakpoint]}
              {/* <span className="hidden capitalize sm:inline">{breakpoint}</span> */}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="secondary" size="sm" className="gap-2" onClick={onPreview}>
            <Eye className="h-4 w-4" /> {t("builder.preview")}
          </Button>
          <Button variant="secondary" size="sm" className="gap-2" onClick={onSaveDraft} disabled={isSavingDraft || isPublishing}>
            <Save className="h-4 w-4" /> {isSavingDraft ? t("builder.saving") : t("builder.saveDraft")}
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-primary-600 hover:bg-primary-700"
            onClick={onPublish}
            disabled={isPublishing}
          >
            <Rocket className="h-4 w-4" /> {isPublishing ? t("builder.publishing") : t("builder.publish")}
          </Button>
        </div>
      </div>
    </header>
  );
}
