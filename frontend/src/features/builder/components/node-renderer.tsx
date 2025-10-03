"use client";

import type { ChangeEvent, CSSProperties, ReactNode, FocusEvent, ElementType } from "react";
import { Children, useEffect, useMemo, useRef, useState } from "react";

import { useBuilderStore } from "@/store/builder-store";
import { t } from "@/i18n";
import type { BuilderNode, BreakpointId } from "@/types/builder";
import { computeNodeStyle, isLayoutNode } from "@/features/builder/style";

interface NodeRendererProps {
  node: BuilderNode;
  breakpoint: BreakpointId;
  readOnly?: boolean;
  children?: ReactNode;
}

const DEFAULT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg width='400' height='240' viewBox='0 0 400 240' xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23f1f5f9' width='400' height='240' rx='16'/%3E%3Cpath stroke='%2394a3b8' stroke-width='2' stroke-dasharray='6 6' d='M32 32h336v176H32z'/%3E%3C/svg%3E";

export function NodeRenderer({ node, breakpoint, readOnly = false, children }: NodeRendererProps) {
  const style = computeNodeStyle(node, breakpoint);
  const updateNodeProps = useBuilderStore((state) => state.updateNodeProps);

  if (!style.boxSizing) {
    style.boxSizing = "border-box";
  }

  

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const sliderSlides = useMemo(() => Children.toArray(children), [children]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const sliderAutoplay = Number(node.props?.autoplay ?? 0);
  const [isEditingButton, setIsEditingButton] = useState(false);
  const buttonEditableRef = useRef<HTMLSpanElement | null>(null);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const linkEditableRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (node.component !== "media.slider") return;
    if (!sliderAutoplay || sliderAutoplay <= 0 || sliderSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setSliderIndex((current) => {
        if (sliderSlides.length === 0) return 0;
        return (current + 1) % sliderSlides.length;
      });
    }, sliderAutoplay);
    return () => window.clearInterval(id);
  }, [node.component, sliderAutoplay, sliderSlides.length]);

  useEffect(() => {
    if (node.component !== "media.slider") return;
    if (sliderIndex >= sliderSlides.length) {
      setSliderIndex(0);
      return;
    }
    const container = sliderContainerRef.current;
    if (!container) return;
    const width = container.offsetWidth;
    container.scrollTo({ left: width * sliderIndex, behavior: "smooth" });
  }, [sliderIndex, node.component, sliderSlides.length]);

  useEffect(() => {
    if (node.component !== "content.button") return;
    if (!isEditingButton) {
      return;
    }
    const span = buttonEditableRef.current;
    if (span) {
      span.focus();
      const range = document.createRange();
      range.selectNodeContents(span);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditingButton, node.component]);

  useEffect(() => {
    if (node.component !== "content.button" && isEditingButton) {
      setIsEditingButton(false);
    }
  }, [node.component, isEditingButton]);

  useEffect(() => {
    if (node.component !== "content.link") return;
    if (!isEditingLink) return;
    const span = linkEditableRef.current;
    if (span) {
      span.focus();
      const range = document.createRange();
      range.selectNodeContents(span);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [node.component, isEditingLink]);

  useEffect(() => {
    if (node.component !== "content.link" && isEditingLink) {
      setIsEditingLink(false);
    }
  }, [node.component, isEditingLink]);

  const component = node.component;

  if (component === "content.file") {
    const fileUrl = (node.props?.url as string) ?? "";
    const title = (node.props?.title as string) ?? "File";
    return (
      <div style={style} className="relative w-full overflow-hidden rounded-lg bg-white/90 p-4 shadow-sm flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-100 text-surface-600">
          {/* simple file icon */}
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5a2 2 0 0 0 2 2h5" />
          </svg>
        </div>
        <div className="flex-1 text-sm">
          <div className="font-medium">{title}</div>
          <div className="text-xs text-surface-500 truncate">{fileUrl}</div>
        </div>
      </div>
    );
  }

  if (component === "media.slider") {
    const slides = sliderSlides.length > 0 ? sliderSlides : [
      <div key="empty" className="flex h-full w-full items-center justify-center rounded-3xl bg-surface-200 text-xs text-surface-500">
        {t("canvas.addImagesInsideSlider")}
      </div>,
    ];

    const goTo = (index: number) => {
      if (slides.length <= 1) return;
      if (index < 0) {
        setSliderIndex(slides.length - 1);
      } else {
        setSliderIndex(index % slides.length);
      }
    };

    return (
      <div style={style} className="relative w-full overflow-hidden rounded-3xl bg-surface-100">
        <div
          ref={sliderContainerRef}
          className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
          onWheel={(event) => {
            if (slides.length <= 1) return;
            if (event.deltaY === 0) return;
            event.preventDefault();
            goTo(sliderIndex + (event.deltaY > 0 ? 1 : -1));
          }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full snap-center">
              {slide}
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-xs shadow"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => goTo(sliderIndex - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-xs shadow"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => goTo(sliderIndex + 1)}
            >
              ›
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === sliderIndex ? "bg-primary-500" : "bg-white/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (isLayoutNode(node)) {
    const layoutStyle: CSSProperties = { ...style };

    if (!layoutStyle.boxSizing) {
      layoutStyle.boxSizing = "border-box";
    }

    if (!layoutStyle.display) {
      layoutStyle.display = "flex";
    }

    if (layoutStyle.display === "flex" && !layoutStyle.flexDirection) {
      layoutStyle.flexDirection = "column";
    }

    if (!layoutStyle.gap && layoutStyle.display === "flex") {
      layoutStyle.gap = "16px";
    }

    return (
      <div style={layoutStyle} className="w-full">
        {children}
      </div>
    );
  }

  if (component === "content.richText") {
    const value = (node.props?.text as string) ?? "Text";
  // avoid referencing JSX.IntrinsicElements directly here to keep typing simpler in this file
  const Tag: ElementType = ((node.props?.tag as unknown) as ElementType) ?? "p";

    return (
      <Tag
        style={style}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onBlur={(event: FocusEvent<HTMLElement>) => {
          if (!readOnly) {
            updateNodeProps(node.id, { text: event.currentTarget.textContent ?? "" });
          }
        }}
        className={`outline-none ${readOnly ? "" : "focus-visible:ring-1 focus-visible:ring-primary-300"}`}
      >
        {value}
      </Tag>
    );
  }

  if (component === "content.button") {
    const label = (node.props?.label as string) ?? "Button";
    return (
      <a
        href={(node.props?.href as string) ?? "#"}
        onClick={(event) => {
          if (!readOnly && !isEditingButton) {
            event.preventDefault();
          }
        }}
        style={style}
        className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-subtle transition hover:bg-primary-700"
        onDoubleClick={(event) => {
          if (readOnly) return;
          event.preventDefault();
          setIsEditingButton(true);
        }}
      >
        <span
          ref={buttonEditableRef}
          contentEditable={!readOnly && isEditingButton}
          suppressContentEditableWarning
          onBlur={(event) => {
            if (!readOnly) {
              updateNodeProps(node.id, { label: event.currentTarget.textContent ?? "" });
              setIsEditingButton(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              (event.target as HTMLElement).blur();
            }
          }}
          className={!readOnly ? "outline-none" : undefined}
        >
          {label}
        </span>
      </a>
    );
  }

  if (component === "content.link") {
    const label = (node.props?.label as string) ?? "Link";
    const href = (node.props?.href as string) ?? "#";
    const target = (node.props?.target as string | undefined) ?? "_self";
    const rel = target === "_blank" ? "noopener noreferrer" : undefined;

    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={style}
        className="inline-flex items-center text-primary-600 underline-offset-4 transition hover:underline"
        onClick={(event) => {
          if (!readOnly && !isEditingLink) {
            event.preventDefault();
          }
        }}
        onDoubleClick={(event) => {
          if (readOnly) return;
          event.preventDefault();
          setIsEditingLink(true);
        }}
      >
        <span
          ref={linkEditableRef}
          contentEditable={!readOnly && isEditingLink}
          suppressContentEditableWarning
          onBlur={(event) => {
            if (!readOnly) {
              updateNodeProps(node.id, { label: event.currentTarget.textContent ?? "" });
              setIsEditingLink(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              (event.target as HTMLElement).blur();
            }
          }}
          className={!readOnly ? "outline-none" : undefined}
        >
          {label}
        </span>
      </a>
    );
  }

  if (component === "content.image") {
    const src = (node.props?.url as string) || DEFAULT_IMAGE_PLACEHOLDER;
    const alt = (node.props?.alt as string) ?? "";
    const height = (node.props?.height as string | undefined) ?? undefined;
    const objectFitProp = (node.props?.objectFit as string | undefined) ?? undefined;
    const objectPositionProp = (node.props?.objectPosition as string | undefined) ?? undefined;

    const containerStyle: CSSProperties = { ...style };
    if (height) {
      containerStyle.height = height;
    }

    const imageStyle: CSSProperties = {
      width: "100%",
      display: "block",
      objectFit: (objectFitProp ?? "cover") as CSSProperties["objectFit"],
      objectPosition: objectPositionProp ?? "center",
    };
    if (height) {
      imageStyle.height = height;
    } else {
      imageStyle.height = "auto";
    }

    const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      updateNodeProps(node.id, { url: objectUrl, alt: file.name, sourceType: "upload" });
    };
    // NOTE: file picker and media library are triggered from the content inspector now.

    return (
      <div style={containerStyle} className="relative w-full overflow-hidden rounded-xl bg-surface-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} style={imageStyle} />
        {/* Overlay upload/media buttons removed — use Media library from the content inspector instead */}
        {!readOnly && (
          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        )}
      </div>
    );
  }

  if (component === "forms.input") {
    return (
      <label style={style} className="flex w-full flex-col gap-1">
  <span className="text-xs font-medium text-surface-600">{String(node.props?.label ?? "Label")}</span>
        <input
          placeholder={(node.props?.placeholder as string) ?? "Placeholder"}
          className="h-11 w-full rounded-lg border border-surface-200 px-3 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </label>
    );
  }

  if (component === "forms.textarea") {
    const rows = Number(node.props?.rows ?? 4);
    return (
      <label style={style} className="flex w-full flex-col gap-1">
  <span className="text-xs font-medium text-surface-600">{String(node.props?.label ?? "Textarea")}</span>
        <textarea
          rows={Number.isNaN(rows) ? 4 : rows}
          placeholder={(node.props?.placeholder as string) ?? "Type your message"}
          className="w-full rounded-lg border border-surface-200 px-3 py-2 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </label>
    );
  }

  if (component === "forms.select") {
    const rawOptions = (node.props?.options as string) ?? "Option";
    const options = rawOptions
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
    return (
      <label style={style} className="flex w-full flex-col gap-1">
  <span className="text-xs font-medium text-surface-600">{String(node.props?.label ?? "Select")}</span>
        <select className="h-11 w-full rounded-lg border border-surface-200 px-3 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200">
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (component === "forms.checkbox") {
    const label = (node.props?.label as string) ?? "Checkbox";
    const name = (node.props?.name as string) ?? "checkbox";
    const defaultChecked = node.props?.defaultChecked === true || node.props?.defaultChecked === "true";

    return (
      <label style={style} className="flex items-center gap-2 text-sm text-surface-700">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="h-4 w-4 rounded border border-surface-300 text-primary-600 focus:ring-primary-400"
        />
        <span>{label}</span>
      </label>
    );
  }

  if (component === "forms.radio") {
    const label = (node.props?.label as string) ?? "Radio";
    const name = (node.props?.name as string) ?? "radio-group";
    const value = (node.props?.value as string) ?? label;
    const defaultChecked = node.props?.defaultChecked === true || node.props?.defaultChecked === "true";

    return (
      <label style={style} className="flex items-center gap-2 text-sm text-surface-700">
        <input
          type="radio"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          className="h-4 w-4 border border-surface-300 text-primary-600 focus:ring-primary-400"
        />
        <span>{label}</span>
      </label>
    );
  }

  if (component === "forms.datetime") {
    const label = (node.props?.label as string) ?? "Date & time";
    const name = (node.props?.name as string) ?? "datetime";
    const defaultValue = (node.props?.defaultValue as string) ?? "";

    return (
      <label style={style} className="flex w-full flex-col gap-1">
        <span className="text-xs font-medium text-surface-600">{label}</span>
        <input
          type="datetime-local"
          name={name}
          defaultValue={defaultValue}
          className="h-11 w-full rounded-lg border border-surface-200 px-3 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </label>
    );
  }

  if (component === "content.logo") {
    const text = (node.props?.text as string) ?? "Brand";
    const url = (node.props?.url as string) ?? "";
    const href = (node.props?.href as string) ?? "#";

    if (url) {
      return (
        <a href={href} style={style} className="inline-flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={text} className="h-9 w-auto" />
        </a>
      );
    }

    return (
      <a href={href} style={style} className="inline-flex items-center text-lg font-semibold text-surface-900">
        {text}
      </a>
    );
  }

  if (component === "content.navLink") {
    const label = (node.props?.label as string) ?? "Link";
    const href = (node.props?.href as string) ?? "#";
    const hasDropdown = Children.count(children) > 0;

    const linkStyle: CSSProperties = { ...style };

    return (
      <div className="group relative inline-flex flex-col">
        <a
          href={href}
          style={linkStyle}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-surface-700 transition hover:bg-surface-100"
        >
          {label}
          {hasDropdown && <span className="text-xs text-surface-400">▾</span>}
        </a>
        {hasDropdown && (
          <div className="z-10 mt-2 flex min-w-[160px] flex-col gap-1 rounded-lg border border-surface-200 bg-white p-2 text-sm text-surface-600 shadow-xl">
            {children}
          </div>
        )}
      </div>
    );
  }

  if (component === "content.stat") {
    const value = (node.props?.value as string) ?? "--";
    const label = (node.props?.label as string) ?? "Stat";
    const description = (node.props?.description as string) ?? "";

    return (
      <div style={style} className="flex flex-col gap-1 rounded-2xl bg-white/90 p-6 shadow-subtle">
        <span className="text-3xl font-semibold text-primary-600">{value}</span>
        <span className="text-sm font-medium text-surface-700">{label}</span>
        {description ? <p className="text-xs text-surface-500">{description}</p> : null}
      </div>
    );
  }

  if (component === "media.video") {
    const source = (node.props?.source as string) ?? "";
    const poster = (node.props?.poster as string) ?? "";
    const title = (node.props?.title as string) ?? "Video";

    // file upload and media library access are provided via the content inspector and toolbar

    const isEmbed = /youtu\.be|youtube\.com|vimeo\.com/.test(source ?? "");

    return (
      <div style={style} className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl bg-surface-900">
        {source ? (
          isEmbed ? (
            <iframe
              title={title}
              src={source}
              className="h-full w-full"
              allow="autoplay; fullscreen"
            />
          ) : (
            <video controls poster={poster} className="h-full w-full">
              <source src={source} />
              Your browser does not support embedded video.
            </video>
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-white/70">
            <span>No video selected</span>
          </div>
        )}
        {/* Upload and Media library controls removed from the video renderer per UX decision */}
      </div>
    );
  }

  if (component === "media.slider") {
    const slides = sliderSlides.length > 0 ? sliderSlides : [
      <div key="empty" className="flex h-full w-full items-center justify-center rounded-3xl bg-surface-200 text-xs text-surface-500">
        Add images inside the slider
      </div>,
    ];

    const goTo = (index: number) => {
      if (slides.length <= 1) return;
      if (index < 0) {
        setSliderIndex(slides.length - 1);
      } else {
        setSliderIndex(index % slides.length);
      }
    };

    return (
      <div style={style} className="relative w-full overflow-hidden rounded-3xl bg-surface-100">
        <div
          ref={sliderContainerRef}
          className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
          onWheel={(event) => {
            if (slides.length <= 1) return;
            if (event.deltaY === 0) return;
            event.preventDefault();
            goTo(sliderIndex + (event.deltaY > 0 ? 1 : -1));
          }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full snap-center">
              {slide}
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-xs shadow"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => goTo(sliderIndex - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-xs shadow"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => goTo(sliderIndex + 1)}
            >
              ›
            </button>
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === sliderIndex ? "bg-primary-500" : "bg-white/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={style} className="w-full">
      <div className="text-xs text-surface-400">{node.component}</div>
      {children}
    </div>
  );
}
