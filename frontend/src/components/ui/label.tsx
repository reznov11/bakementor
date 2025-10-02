"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={twMerge("text-sm font-medium text-surface-600", className)}
      {...props}
    />
  );
}

