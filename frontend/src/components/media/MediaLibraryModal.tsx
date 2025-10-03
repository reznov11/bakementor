"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Film, Upload as UploadIcon, Check as CheckIcon } from "lucide-react";
import NextImage from "next/image";
import { apiClient } from "@/lib/api-client";

type AxiosLikeError = { response?: { status?: number; data?: { detail?: unknown } } };
function isAxiosLike(err: unknown): err is AxiosLikeError {
  return typeof err === "object" && err !== null && "response" in err;
}

type MediaType = "image" | "video" | "document" | "other" | "all";

type MediaFile = {
  id: string;
  title: string;
  file: string;
  media_type: string;
  mime_type: string;
  size: number;
  uploaded_by_email?: string;
  file_url?: string;
};

export function MediaLibraryModal() {
  const [open, setOpen] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("all");
  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [nodeContext, setNodeContext] = useState<Record<string, unknown> | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<Array<{ id: string; name: string; progress: number; status: "uploading" | "done" | "error" | "cancelled"; error?: string; file?: File }>>([]);
  const uploadControllers = useRef<Map<string, AbortController>>(new Map());
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  // fileInputRef not needed; we create inputs dynamically on upload

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Record<string, unknown> | undefined;
      setNodeContext(detail ?? null);
      setOpen(true);
      // fetch current mediaType state
      fetchFiles(mediaType);
    };
    window.addEventListener("bakementor:openMediaLibrary", handler as EventListener);
    return () => window.removeEventListener("bakementor:openMediaLibrary", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchFiles(mediaType);
  }, [mediaType, open]);

  async function fetchFiles(type: MediaType) {
    setLoading(true);
    try {
      const params = type && type !== "all" ? { media_type: type } : {};
      const { data } = await apiClient.get("/media/", { params });
      const results = Array.isArray(data) ? data : data.results ?? [];
      setFiles(results);
    } catch (err: unknown) {
      if (isAxiosLike(err) && err.response?.status === 401) {
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: "Authentication required" } }));
      }
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  // deprecated wrapper removed; use startUpload directly

  async function startUpload(file: File) {
    const max = 1024 * 2048; // 1MB
    if (file.size > max) {
      window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: "File too large (max 1MB)" } }));
      return null;
    }

  const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  setUploads((u) => [...u, { id, name: file.name, progress: 0, status: "uploading", file }]);
  const controller = new AbortController();
  uploadControllers.current.set(id, controller);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name);

    function extractProgress(ev: unknown) {
      if (ev && typeof ev === "object") {
        const e = ev as Record<string, unknown>;
        const loaded = typeof e.loaded === "number" ? e.loaded : typeof e.bytesTransferred === "number" ? e.bytesTransferred : 0;
        const total = typeof e.total === "number" ? e.total : typeof e.totalBytes === "number" ? e.totalBytes : 0;
        return { loaded, total };
      }
      return { loaded: 0, total: 0 };
    }

    try {
      const { data } = await apiClient.post("/media/upload/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
        // axios progress event typing varies; accept ProgressEvent-like shapes
        onUploadProgress: (ev: unknown) => {
          const { loaded, total } = extractProgress(ev);
          if (!total) return;
          const percent = Math.round((loaded / total) * 100);
          setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: percent } : x)));
        },
      });

      setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: 100, status: "done" } : x)));
      // refresh grid
      fetchFiles(mediaType);
      return data;
    } catch (err: unknown) {
      // remove controller reference
      uploadControllers.current.delete(id);
  const errName = (err as unknown as { name?: string })?.name;
  if (errName === "CanceledError" || errName === "AbortError") {
        setUploads((u) => u.map((x) => (x.id === id ? { ...x, status: "cancelled", error: "Cancelled" } : x)));
        return null;
      }
      const msg = isAxiosLike(err) ? String(err.response?.data?.detail ?? "Upload failed") : "Upload failed";
      setUploads((u) => u.map((x) => (x.id === id ? { ...x, status: "error", error: msg } : x)));
      if (isAxiosLike(err) && err.response?.status === 401) {
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: "Authentication required" } }));
      } else {
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: msg } }));
      }
      return null;
    }
  }

  async function checkAuth() {
    try {
      (window as unknown as Record<string, unknown>).__bakementor_debug_access_token = (await import("@/lib/auth-storage")).authStorage.getAccessToken();
      const { data } = await apiClient.get("/auth/me/");
      window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: `Authenticated as ${data?.email ?? data?.id ?? 'unknown'}` } }));
    } catch (err: unknown) {
      if (isAxiosLike(err) && err.response?.status === 401) {
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: "Auth check failed: 401" } }));
      } else {
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: "Auth check failed" } }));
      }
    }
  }

  function onUploadButtonClick() {
    // Open the upload panel instead of launching file picker immediately
    setShowUploadPanel(true);
  }

  function onBrowseClick() {
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
      uploadInputRef.current.click();
    } else {
      // fallback dynamic input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "*/*";
      input.multiple = true;
      input.onchange = (ev) => {
        const files = Array.from((ev.target as HTMLInputElement).files ?? []);
        files.forEach((f) => void startUpload(f));
        setShowUploadPanel(false);
      };
      input.click();
    }
  }

  function onHiddenInputChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(ev.target.files ?? []);
    files.forEach((f) => void startUpload(f));
    setShowUploadPanel(false);
  }

  function cancelUpload(id: string) {
    const controller = uploadControllers.current.get(id);
    if (controller) {
      controller.abort();
      uploadControllers.current.delete(id);
    }
    setUploads((u) => u.map((x) => (x.id === id ? { ...x, status: "cancelled", error: "Cancelled" } : x)));
  }

  function retryUpload(id: string) {
    const entry = uploads.find((u) => u.id === id);
    if (!entry?.file) return;
    // remove previous entry and restart
    setUploads((u) => u.filter((x) => x.id !== id));
    void startUpload(entry.file);
  }

  function handleSelect(file: MediaFile) {
    // dispatch event consumed by builder to update node props
    const payload = { nodeId: nodeContext?.nodeId, type: nodeContext?.type, file };
    window.dispatchEvent(new CustomEvent("bakementor:mediaSelected", { detail: payload }));
    setOpen(false);
  }

  useEffect(() => {
    if (uploads.length === 0) return;
    const hasUploading = uploads.some((u) => u.status === "uploading");
    const hasError = uploads.some((u) => u.status === "error");
    const allDone = uploads.length > 0 && !hasUploading && !hasError && uploads.every((u) => u.status === "done");
    if (allDone) {
      const t = setTimeout(() => {
        setUploads([]);
        window.dispatchEvent(new CustomEvent("bakementor:showToast", { detail: { message: "Uploads complete" } }));
      }, 600);
      return () => clearTimeout(t);
    }
  }, [uploads]);

  function humanFileSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const thresh = 1024;
    const units = ["B", "KB", "MB", "GB", "TB"];
    let u = 0;
    let value = bytes;
    while (value >= thresh && u < units.length - 1) {
      value /= thresh;
      u++;
    }
    return `${value.toFixed(value < 10 && u > 0 ? 1 : 0)} ${units[u]}`;
  }

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-6">
      <div className="mx-auto w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Media library</h3>
          <div>
            <Button variant="ghost" size="sm" onClick={checkAuth}>Check auth</Button>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4">
          <div className="flex gap-1">
            <button className={`rounded px-3 py-1 text-sm flex items-center gap-2 ${mediaType === 'all' ? 'bg-surface-200' : ''}`} onClick={() => { setMediaType('all'); setShowUploadPanel(false); }}>
              <UploadIcon className="h-4 w-4" /> All
            </button>
            <button className={`rounded px-3 py-1 text-sm flex items-center gap-2 ${mediaType === 'image' ? 'bg-surface-200' : ''}`} onClick={() => { setMediaType('image'); setShowUploadPanel(false); }}>
              <ImageIcon className="h-4 w-4" /> Images
            </button>
            <button className={`rounded px-3 py-1 text-sm flex items-center gap-2 ${mediaType === 'video' ? 'bg-surface-200' : ''}`} onClick={() => { setMediaType('video'); setShowUploadPanel(false); }}>
              <Film className="h-4 w-4" /> Videos
            </button>
            <button className={`rounded px-3 py-1 text-sm flex items-center gap-2 ${mediaType === 'document' ? 'bg-surface-200' : ''}`} onClick={() => { setMediaType('document'); setShowUploadPanel(false); }}>
              <NextImage src="/icons/document.svg" alt="docs" width={16} height={16} className="h-4 w-4" /> Docs
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={onUploadButtonClick}>From computer</Button>
        </div>

        <div className="p-4 overflow-auto">
          {showUploadPanel ? (
            <div
              className={`mt-4 flex h-72 items-center justify-center rounded-md border border-dashed p-6 text-center ${isDragging ? "bg-surface-50" : "bg-white"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const dt = e.dataTransfer;
                if (!dt) return;
                const dropped = Array.from(dt.files ?? []);
                dropped.forEach((f) => void startUpload(f));
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <UploadIcon className="h-12 w-12 text-surface-500" />
                <div className="text-sm text-surface-600">Drag files here or</div>
                <Button onClick={onBrowseClick} variant="ghost">Browse</Button>
                <div className="text-xs text-surface-400">Max size: 1MB</div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-5 gap-4">
              {loading ? (
                <div className="col-span-4 text-sm text-surface-500">Loading…</div>
              ) : files.length === 0 ? (
                <div className="col-span-4 text-sm text-surface-500">No files</div>
              ) : (
                files.map((f) => (
                  <div key={f.id} className="relative overflow-hidden rounded-md border text-xs bg-white">
                    <div className="h-40 w-full overflow-hidden bg-surface-50">
                      {f.mime_type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.file_url || f.file} alt={f.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center p-4 text-surface-500">
                          {/* Render file-type SVGs from public/icons */}
                          {f.mime_type.startsWith("video/") ? (
                            <NextImage src="/icons/video.svg" alt="video" width={32} height={32} className="h-8 w-8" />
                          ) : f.mime_type === "application/pdf" ? (
                            <NextImage src="/icons/pdf.svg" alt="pdf" width={32} height={32} className="h-8 w-8" />
                          ) : f.mime_type === "application/msword" || f.mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                            <NextImage src="/icons/word.svg" alt="word" width={32} height={32} className="h-8 w-8" />
                          ) : (
                            <NextImage src="/icons/document.svg" alt="doc" width={32} height={32} className="h-8 w-8" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* centered overlay select icon (single unified icon for all file types) */}
                    <button
                      type="button"
                      onClick={() => handleSelect(f)}
                      className="absolute inset-0 m-0 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                      aria-label={`Select ${f.title}`}
                    >
                      <div className="rounded-full bg-white/90 p-3 shadow hover:scale-105 transition-transform">
                        <CheckIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </button>

                    <div className="mt-2 px-2 py-1">
                      <div className="truncate text-sm">{f.title}</div>
                      <div className="text-xs text-surface-500">{humanFileSize(f.size)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {/* Hidden file input used by Browse button */}
          <input ref={uploadInputRef} type="file" className="hidden" multiple onChange={onHiddenInputChange} />
          {/* Upload progress list */}
          {uploads.length > 0 && (
            <div className="p-4 border-t">
              <h4 className="text-sm font-medium">Uploads</h4>
              <div className="mt-2 flex flex-col gap-2">
                {uploads.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-4">
                    <div className="truncate text-sm">{u.name}</div>
                    <div className="w-48">
                      <div className="h-2 w-full rounded bg-surface-200">
                        <div className="h-2 rounded bg-primary-600" style={{ width: `${u.progress}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-surface-500">{u.status === "uploading" ? `${u.progress}%` : u.status === "done" ? "Done" : u.error}</div>
                        <div className="flex gap-2">
                          {u.status === "uploading" && (
                            <Button size="sm" variant="ghost" onClick={() => cancelUpload(u.id)}>Cancel</Button>
                          )}
                          {(u.status === "error" || u.status === "cancelled") && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => retryUpload(u.id)}>Retry</Button>
                              <Button size="sm" variant="ghost" onClick={() => setUploads((arr) => arr.filter((x) => x.id !== u.id))}>Remove</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
}

export default MediaLibraryModal;
