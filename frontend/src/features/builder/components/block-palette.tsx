"use client";

import type { BlockTemplate } from "@/features/builder/blocks";

interface BlockPaletteProps {
  blocks: BlockTemplate[];
  onSelect: (blockId: string) => void;
}

export function BlockPalette({ blocks, onSelect }: BlockPaletteProps) {
  return (
    <div className="theme-light-scope flex flex-col gap-3">
      {blocks.map((block) => (
        <button
          key={block.id}
          type="button"
          onClick={() => onSelect(block.id)}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 bg-white p-3 text-left shadow-sm transition hover:border-primary-200 hover:bg-white/90 hover:shadow-subtle"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-100 text-sm font-semibold text-primary-500">
            {block.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-surface-800">{block.name}</p>
            <p className="text-xs text-surface-500 line-clamp-2">{block.description}</p>
          </div>
        </button>
      ))}
      {blocks.length === 0 && (
        <div className="rounded-lg border border-dashed border-surface-200 p-4 text-center text-xs text-surface-500">
          Block library coming soon.
        </div>
      )}
    </div>
  );
}
