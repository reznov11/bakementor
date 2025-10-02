"use client";

import { ArrowLeft, Eye, Save, Rocket, Monitor } from "lucide-react";

import { DEVICE_ICONS } from "@/features/builder/constants";
import { Button } from "@/components/ui/button";
import type { BreakpointId } from "@/types/builder";

interface BuilderToolbarProps {
  activeBreakpoint: BreakpointId;
  onBreakpointChange: (breakpoint: BreakpointId) => void;
  onBack: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
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
  isSavingDraft = false,
  isPublishing = false,
}: BuilderToolbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-surface-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Button>
        <div className="hidden items-center gap-2 text-sm font-medium text-surface-600 sm:flex">
          <Monitor className="h-4 w-4 text-primary-500" />
          BakeMentor Builder
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-surface-200 bg-surface-50 p-1">
          {BREAKPOINT_ORDER.map((breakpoint) => (
            <button
              key={breakpoint}
              type="button"
              onClick={() => onBreakpointChange(breakpoint)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                activeBreakpoint === breakpoint ? "bg-white text-primary-600 shadow-sm" : "text-surface-500 hover:text-primary-600"
              }`}
            >
              {DEVICE_ICONS[breakpoint]}
              <span className="hidden capitalize sm:inline">{breakpoint}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-2" onClick={onPreview}>
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button variant="secondary" size="sm" className="gap-2" onClick={onSaveDraft} disabled={isSavingDraft || isPublishing}>
            <Save className="h-4 w-4" /> {isSavingDraft ? "Saving..." : "Save draft"}
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-primary-600 hover:bg-primary-700"
            onClick={onPublish}
            disabled={isPublishing}
          >
            <Rocket className="h-4 w-4" /> {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </header>
  );
}
