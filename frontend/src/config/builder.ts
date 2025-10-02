import type { BreakpointId } from "@/types/builder";

export const BREAKPOINT_VIEWPORTS: Record<BreakpointId, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 414, height: 896 },
};

export const BUILDER_AUTOSAVE_INTERVAL = 10_000; // ms
export const BUILDER_VERSION = "2025-10-01";
