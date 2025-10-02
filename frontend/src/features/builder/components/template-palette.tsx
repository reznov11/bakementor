import type { PageTemplate } from "@/features/builder/templates";

interface TemplatePaletteProps {
  templates: PageTemplate[];
  onSelect: (templateId: string) => void;
}

export function TemplatePalette({ templates, onSelect }: TemplatePaletteProps) {
  if (templates.length === 0) {
    return (
      <div className="theme-light-scope rounded-lg border border-dashed border-surface-200 p-4 text-center text-xs text-surface-500">
        Template library coming soon.
      </div>
    );
  }

  return (
    <div className="theme-light-scope flex flex-col gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template.id)}
          className="group flex w-full flex-col gap-4 rounded-2xl border border-surface-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-subtle"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-surface-900">{template.name}</p>
              <p className="text-xs text-surface-500">{template.description}</p>
            </div>
            <span
              className="mt-1 inline-flex items-center rounded-full bg-surface-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-surface-500"
            >
              {template.category}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-surface-200"
              style={{ background: template.previewBackground }}
            >
              <div className="absolute inset-0 bg-white/40 transition group-hover:bg-white/20" />
              <div
                className="absolute left-2 top-2 h-2 w-12 rounded-full"
                style={{ background: template.accent }}
              />
              <div className="absolute bottom-2 right-2 h-6 w-10 rounded-md bg-white/70" />
            </div>
            <p className="flex-1 text-xs text-surface-400">
              Applying a template replaces the current layout.
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
