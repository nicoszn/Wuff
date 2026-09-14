"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PingState = "checking" | "online" | "offline";
type PingInfo = { state: PingState; latencyMs?: number; detail?: string };

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 2000;
const ACCEPTED_TYPES = ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-6 w-6">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconWave() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-5 w-5">
      <path d="M3 12h2l2-7 3 14 3-11 2 4h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-4 w-4">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4 shrink-0">
      <path d="M12 9v4M12 16.5h.01M10.3 3.9 1.8 18a1.5 1.5 0 0 0 1.3 2.25h17.8a1.5 1.5 0 0 0 1.3-2.25L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4">
      <path d="M12 4v12M12 16l-4-4M12 16l4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSpinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function StatusBadge({ ping }: { ping: PingInfo }) {
  const config: Record<PingState, { dot: string; text: string; label: string }> = {
    checking: { dot: "bg-amber-400", text: "text-amber-700", label: "Checking…" },
    online: { dot: "bg-emerald-500", text: "text-emerald-700", label: "API online" },
    offline: { dot: "bg-red-500", text: "text-red-700", label: "API unreachable" },
  };
  const c = config[ping.state];
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${ping.state === "checking" ? "animate-pulse" : ""}`} />
      {c.label}
      {ping.state === "online" && ping.latencyMs !== undefined && (
        <span className="text-slate-400">· {ping.latencyMs}ms</span>
      )}
    </div>
  );
}

export default function VoiceCloneStudio() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState("");
  const [styleOpen, setStyleOpen] = useState(false);
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ping, setPing] = useState<PingInfo>({ state: "checking" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/voice-clone")
      .then((res) => res.json())
      .then((data: { ok: boolean; latencyMs: number }) => {
        if (cancelled) return;
        setPing({ state: data.ok ? "online" : "offline", latencyMs: data.latencyMs });
      })
      .catch(() => {
        if (!cancelled) setPing({ state: "offline" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a WAV or MP3 file for the reference sample.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Reference audio must be 10MB or smaller.");
      return;
    }
    setAudioFile(file);
    setAudioPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  function clearFile() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioFile(null);
    setAudioPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!audioFile) {
      setError("Upload a reference audio sample first.");
      return;
    }
    if (!text.trim()) {
      setError("Enter the text you want spoken.");
      return;
    }

    setLoading(true);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);

    try {
      const form = new FormData();
      form.append("audio", audioFile);
      form.append("text", text);
      if (style.trim()) form.append("style", style);

      const res = await fetch("/api/voice-clone", { method: "POST", body: form });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const blob = await res.blob();
      setOutputUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const charCount = text.length;
  const overLimit = charCount > MAX_TEXT_LENGTH;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 sm:px-0">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Voice Clone
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Reference sample in, cloned speech out.
            </p>
          </div>
          <StatusBadge ping={ping} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          {/* Dropzone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reference audio
            </label>
            {!audioFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  applyFile(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  isDragging
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                  <IconUpload />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Tap to upload, or drag a file here
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    WAV or MP3 · up to 10MB · a few seconds is enough
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/wav,audio/mpeg,audio/mp3"
                  onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                      <IconWave />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {audioFile.name}
                      </p>
                      <p className="text-xs text-slate-400">{formatBytes(audioFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Remove reference audio"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
                  >
                    <IconX />
                  </button>
                </div>
                {audioPreviewUrl && (
                  <audio controls src={audioPreviewUrl} className="mt-3 h-9 w-full" />
                )}
              </div>
            )}
          </div>

          {/* Text */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Text to speak</label>
              <span className={`text-xs tabular-nums ${overLimit ? "text-red-500" : "text-slate-400"}`}>
                {charCount}/{MAX_TEXT_LENGTH}
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Type the line you want the cloned voice to say…"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:text-sm"
            />
          </div>

          {/* Style instruction (progressive disclosure) */}
          <div>
            {!styleOpen ? (
              <button
                type="button"
                onClick={() => setStyleOpen(true)}
                className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-800"
              >
                + Add a style direction
              </button>
            ) : (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Style direction <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStyleOpen(false);
                      setStyle("");
                    }}
                    className="text-xs text-slate-400 transition-colors hover:text-slate-600"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  autoFocus
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="e.g. tired, sarcastic, whispering, fast and urgent"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || overLimit}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <IconSpinner />
                Cloning voice…
              </>
            ) : (
              "Generate"
            )}
          </button>
        </form>

        {/* Result */}
        {outputUrl && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Result
            </p>
            <div className="flex items-center gap-3">
              <audio controls autoPlay src={outputUrl} className="h-10 w-full" />
              <a
                href={outputUrl}
                download="voice-clone-output.wav"
                aria-label="Download generated audio"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-800"
              >
                <IconDownload />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
