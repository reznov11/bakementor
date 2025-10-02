"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JsonEditorProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export default function JsonEditor({ value, onChange, readOnly = false }: JsonEditorProps) {
  const [internalValue, setInternalValue] = useState<string>(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInternalValue(JSON.stringify(value, null, 2));
  }, [value]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(internalValue) as Record<string, unknown>;
      setError(null);
      onChange(parsed);
    } catch {
      setError("Invalid JSON structure");
    }
  };

  return (
    <div className="space-y-3">
      <Label
        htmlFor="component-tree"
        className="flex items-center justify-between text-xs uppercase tracking-wide text-surface-500"
      >
        Component tree JSON
      </Label>
      <Textarea
        id="component-tree"
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        className="min-h-[260px] font-mono text-xs"
        readOnly={readOnly}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={handleApply} disabled={readOnly}>
          Apply changes
        </Button>
      </div>
    </div>
  );
}
