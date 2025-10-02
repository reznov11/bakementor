"use client";

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export function Slider({ min = 0, max = 100, step = 1, value, onChange }: SliderProps) {
  const rawPercentage = ((value - min) / (max - min)) * 100;
  const safePercentage = Number.isFinite(rawPercentage) ? Math.min(Math.max(rawPercentage, 0), 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-surface-500">
        <span>{value}px</span>
        <span className="text-surface-400">
          {min} - {max}px
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-200 accent-primary-500"
        />
        <div className="h-2 w-16 rounded-full bg-surface-200">
          <div className="h-full rounded-full bg-primary-500" style={{ width: `${safePercentage}%` }} />
        </div>
      </div>
    </div>
  );
}
