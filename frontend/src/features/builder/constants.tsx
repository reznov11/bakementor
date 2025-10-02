import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { BreakpointId } from "@/types/builder";

export const DEVICE_ICONS: Record<BreakpointId, JSX.Element> = {
  desktop: <Monitor className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
};
