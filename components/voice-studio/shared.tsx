"use client";

// components/voice-studio/shared.tsx
// Icons, constants, and small presentational pieces shared by
// VoiceCloneTool and VoiceDesignTool. Deliberately NOT imported by
// components/VoiceCloneStudio.tsx — that file stays untouched, and a
// little icon duplication there is a fair trade for zero regression risk.

import { useEffect, useState } from "react";

export const MAX_CONTEXT_TOKENS = 8192;
export const MAX_TEXT_LENGTH = 5000;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_AUDIO_TYPES = ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3"];
export const INLINE_TAGS = ["[laugh]", "[sigh]", "[pause]", "[breath]", "[whisper]"];

export type PingState = "checking" | "online" | "offline";
export type PingInfo = { state: PingState; latencyMs?: number };
export type TakeResult = { blob: Blob; mimeType: string; url: string };

export function estimateTokens(s: string): number {
  return Math.ceil(s.length / 4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function relativeTime(ts: number): string {
  const seconds = Math.round((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
  return new Blob([array], { type: mimeType });
}

// ---- Icons -------------------------------------------------------------

export function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-6 w-6">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconWave() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-5 w-5">
      <path d="M3 12h2l2-7 3 14 3-11 2 4h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconX({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className={className}>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4 shrink-0">
      <path d="M12 9v4M12 16.5h.01M10.3 3.9 1.8 18a1.5 1.5 0 0 0 1.3 2.25h17.8a1.5 1.5 0 0 0 1.3-2.25L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4">
      <path d="M12 4v12M12 16l-4-4M12 16l4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconSpinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
export function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} strokeWidth={1.75} className="h-4 w-4">
      <path d="m12 3 2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6Z" stroke="currentColor" strokeLinejoin="round" />
    </svg>
  );
}
export function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className="h-4 w-4">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H9.8a2 2 0 0 1-2-1.9L7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function IconChevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatusBadge({ ping }: { ping: PingInfo }) {
  const config: Record<PingState, { dot: string; chip: string; label: string }> = {
    checking: { dot: "bg-warning", chip: "bg-warning/10 text-warning-fg", label: "Checking…" },
    online: { dot: "bg-armed", chip: "bg-armed/10 text-armed-fg", label: "API online" },
    offline: { dot: "bg-halted", chip: "bg-halted/10 text-halted-fg", label: "API unreachable" },
  };
  const c = config[ping.state];
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-medium ${c.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${ping.state === "checking" ? "animate-pulse" : ""}`} />
      {c.label}
      {ping.state === "online" && ping.latencyMs !== undefined && (
        <span className="text-text-muted">· {ping.latencyMs}ms</span>
      )}
    </div>
  );
}

/** Health-check hook: pings the API once on mount. */
export function usePing(): PingInfo {
  const [ping, setPing] = useState<PingInfo>({ state: "checking" });
  useEffect(() => {
    let cancelled = false;
    fetch("/api/voice-clone")
      .then((res) => res.json())
      .then((data: { ok: boolean; latencyMs: number }) => {
        if (!cancelled) setPing({ state: data.ok ? "online" : "offline", latencyMs: data.latencyMs });
      })
      .catch(() => {
        if (!cancelled) setPing({ state: "offline" });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return ping;
}
