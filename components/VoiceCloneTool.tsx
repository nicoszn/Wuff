"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  saveVoice,
  listVoices,
  deleteVoice,
  saveGeneration,
  listGenerationsByMode,
  updateSelectedTake,
  deleteGeneration,
  type SavedVoice,
  type GenerationRecord,
} from "@/lib/db";
import {
  MAX_CONTEXT_TOKENS,
  MAX_TEXT_LENGTH,
  MAX_FILE_BYTES,
  ACCEPTED_AUDIO_TYPES,
  INLINE_TAGS,
  estimateTokens,
  formatBytes,
  relativeTime,
  base64ToBlob,
  usePing,
  StatusBadge,
  IconUpload,
  IconWave,
  IconX,
  IconAlert,
  IconDownload,
  IconSpinner,
  IconStar,
  IconTrash,
  IconChevron,
  type TakeResult,
} from "./shared";

type ReferenceSource = "upload" | "library" | null;

/**
 * Single-purpose voice-cloning widget. Same engine as the combined
 * VoiceCloneStudio (same /api/voice-clone route, same Dexie tables),
 * just scoped to clone mode only — used on the dedicated /voice-clone
 * landing page.
 */
export default function VoiceCloneTool() {
  const ping = usePing();

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [referenceSource, setReferenceSource] = useState<ReferenceSource>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savedVoices, setSavedVoices] = useState<SavedVoice[]>([]);
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [libraryName, setLibraryName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [directionOpen, setDirectionOpen] = useState(false);
  const [direction, setDirection] = useState("");
  const [format, setFormat] = useState<"wav" | "mp3">("wav");
  const [takeCount, setTakeCount] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [results, setResults] = useState<TakeResult[]>([]);
  const [selectedTake, setSelectedTake] = useState(0);
  const [activeGenerationId, setActiveGenerationId] = useState<number | null>(null);

  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUrls, setHistoryUrls] = useState<Record<number, string>>({});

  const refreshVoices = useCallback(() => {
    listVoices().then(setSavedVoices).catch(() => setSavedVoices([]));
  }, []);
  const refreshHistory = useCallback(() => {
    listGenerationsByMode("clone").then(setHistory).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    refreshVoices();
    refreshHistory();
  }, [refreshVoices, refreshHistory]);

  useEffect(() => {
    const urls: Record<number, string> = {};
    for (const h of history) {
      const take = h.takes[h.selectedTake] ?? h.takes[0];
      if (take) urls[h.id] = URL.createObjectURL(take.blob);
    }
    setHistoryUrls(urls);
    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [history]);

  const audioPreviewUrlRef = useRef<string | null>(null);
  const resultsRef = useRef<TakeResult[]>([]);
  audioPreviewUrlRef.current = audioPreviewUrl;
  resultsRef.current = results;
  useEffect(() => {
    return () => {
      if (audioPreviewUrlRef.current) URL.revokeObjectURL(audioPreviewUrlRef.current);
      resultsRef.current.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, []);

  const applyFile = useCallback((file: File | null, source: ReferenceSource) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
      setError("Use a WAV or MP3 file for the reference sample.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Reference audio must be 10MB or smaller.");
      return;
    }
    setAudioFile(file);
    setReferenceSource(source);
    setSaveToLibrary(false);
    setLibraryName(file.name.replace(/\.[^.]+$/, ""));
    setAudioPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  function clearFile() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setReferenceSource(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function pickLibraryVoice(voice: SavedVoice) {
    applyFile(new File([voice.blob], voice.name, { type: voice.mimeType }), "library");
  }

  async function removeLibraryVoice(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteVoice(id);
    refreshVoices();
  }

  function insertTag(tag: string) {
    const el = textareaRef.current;
    if (!el) {
      setText((t) => `${t} ${tag} `);
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}${tag} ${text.slice(end)}`;
    setText(next);
    requestAnimationFrame(() => {
      const cursor = start + tag.length + 1;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  const totalTokens = useMemo(
    () => estimateTokens(text) + estimateTokens(direction),
    [text, direction]
  );
  const tokenRatio = totalTokens / MAX_CONTEXT_TOKENS;
  const overTokenLimit = totalTokens > MAX_CONTEXT_TOKENS;
  const overCharLimit = text.length > MAX_TEXT_LENGTH;

  function resetResults() {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setSelectedTake(0);
    setActiveGenerationId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!audioFile) {
      setError("Upload or pick a reference audio sample first.");
      return;
    }
    if (!text.trim()) {
      setError("Enter the text you want spoken.");
      return;
    }
    if (overCharLimit || overTokenLimit) {
      setError("Text and direction are too long — shorten before generating.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    resetResults();

    try {
      const form = new FormData();
      form.append("mode", "clone");
      form.append("text", text);
      form.append("format", format);
      form.append("takes", String(takeCount));
      if (direction.trim()) form.append("direction", direction);
      form.append("audio", audioFile);

      const res = await fetch("/api/voice-clone", { method: "POST", body: form, signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      const takes: TakeResult[] = (data.takes as Array<{ audio: string; mimeType: string }>).map((t) => {
        const blob = base64ToBlob(t.audio, t.mimeType);
        return { blob, mimeType: t.mimeType, url: URL.createObjectURL(blob) };
      });
      setResults(takes);
      setSelectedTake(0);

      if (referenceSource === "upload" && saveToLibrary) {
        await saveVoice(audioFile, libraryName.trim() || audioFile.name);
        refreshVoices();
      }

      const generationId = await saveGeneration({
        mode: "clone",
        text,
        direction: direction.trim() || undefined,
        voiceLabel: data.voiceLabel || audioFile.name,
        format,
        takes: takes.map((t) => ({ blob: t.blob, mimeType: t.mimeType })),
        selectedTake: 0,
        createdAt: Date.now(),
      });
      setActiveGenerationId(generationId);
      refreshHistory();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Cancelled by the user — not an error worth surfacing.
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  async function pickBestTake(index: number) {
    setSelectedTake(index);
    if (activeGenerationId !== null) {
      await updateSelectedTake(activeGenerationId, index);
      refreshHistory();
    }
  }

  async function removeHistoryEntry(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteGeneration(id);
    refreshHistory();
  }

  return (
    <div className="w-full max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface-raised shadow-sm shadow-surface-border/40 animate-card-in">
        <div className="flex items-center justify-between gap-3 border-b border-surface-border bg-surface-muted px-card-padding py-4">
          <div>
            <h2 className="text-heading text-text-primary">Voice Cloner</h2>
            <p className="mt-0.5 text-caption text-text-muted">Upload a sample, get a cloned voice.</p>
          </div>
          <StatusBadge ping={ping} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-section-gap px-card-padding py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Reference audio</label>

            {savedVoices.length > 0 && (
              <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
                {savedVoices.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => pickLibraryVoice(v)}
                    className={`group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      referenceSource === "library" && audioFile?.name === v.name
                        ? "border-signal bg-signal/10 text-signal-fg"
                        : "border-surface-border bg-surface-muted text-text-secondary hover:border-signal/40"
                    }`}
                  >
                    <IconWave />
                    <span className="max-w-[7rem] truncate">{v.name}</span>
                    <span
                      onClick={(e) => removeLibraryVoice(v.id, e)}
                      role="button"
                      aria-label={`Delete saved voice ${v.name}`}
                      className="text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-halted"
                    >
                      <IconX className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}

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
                  applyFile(e.dataTransfer.files?.[0] ?? null, "upload");
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  isDragging
                    ? "border-text-primary bg-surface-muted"
                    : "border-surface-border bg-surface-muted/60 hover:border-text-secondary hover:bg-surface-muted"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-text-primary text-surface-raised">
                  <IconUpload />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-secondary">Tap to upload, or drag a file here</p>
                  <p className="mt-0.5 text-caption text-text-muted">WAV or MP3 · up to 10MB · a few seconds is enough</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/wav,audio/mpeg,audio/mp3"
                  onChange={(e) => applyFile(e.target.files?.[0] ?? null, "upload")}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-surface-border bg-surface-muted p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-raised">
                      <IconWave />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{audioFile.name}</p>
                      <p className="text-caption text-text-muted">
                        {formatBytes(audioFile.size)}
                        {referenceSource === "library" && " · from your library"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Remove reference audio"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-border/60 hover:text-text-primary"
                  >
                    <IconX />
                  </button>
                </div>
                {audioPreviewUrl && <audio controls src={audioPreviewUrl} className="mt-3 h-9 w-full" />}

                {referenceSource === "upload" && (
                  <label className="mt-3 flex items-center gap-2 border-t border-surface-border pt-3">
                    <input
                      type="checkbox"
                      checked={saveToLibrary}
                      onChange={(e) => setSaveToLibrary(e.target.checked)}
                      className="h-4 w-4 rounded border-surface-border accent-signal"
                    />
                    <span className="text-sm text-text-secondary">Save to My Voices as</span>
                    {saveToLibrary && (
                      <input
                        type="text"
                        value={libraryName}
                        onChange={(e) => setLibraryName(e.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-surface-border bg-surface-raised px-2 py-1 text-sm text-text-primary outline-none focus:border-signal"
                      />
                    )}
                  </label>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-text-primary">Text to speak</label>
              <span className={`text-caption tabular-nums ${overCharLimit ? "text-halted" : "text-text-muted"}`}>
                {text.length}/{MAX_TEXT_LENGTH}
              </span>
            </div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {INLINE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className="rounded-full border border-surface-border bg-surface-raised px-2.5 py-1 text-caption font-medium text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Type the line you want spoken…"
              className="w-full resize-none rounded-2xl border border-surface-border bg-surface-muted/60 p-3.5 text-base text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-text-secondary focus:bg-surface-raised sm:text-sm"
            />
            {tokenRatio > 0.7 && (
              <p className={`mt-1.5 text-caption ${overTokenLimit ? "text-halted" : "text-warning"}`}>
                {overTokenLimit
                  ? `Over the model's context budget (~${totalTokens}/${MAX_CONTEXT_TOKENS} tokens). Shorten before generating.`
                  : `Approaching the context budget (~${totalTokens}/${MAX_CONTEXT_TOKENS} tokens).`}
              </p>
            )}
          </div>

          <div>
            {!directionOpen ? (
              <button
                type="button"
                onClick={() => setDirectionOpen(true)}
                className="text-sm font-medium text-text-secondary underline decoration-surface-border underline-offset-4 transition-colors hover:text-text-primary"
              >
                + Add a style direction
              </button>
            ) : (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-text-primary">
                    Style direction <span className="font-normal text-text-muted">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDirectionOpen(false);
                      setDirection("");
                    }}
                    className="text-caption text-text-muted transition-colors hover:text-text-secondary"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  autoFocus
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  placeholder="e.g. tired, sarcastic, whispering, fast and urgent"
                  className="w-full rounded-2xl border border-surface-border bg-surface-muted/60 p-3.5 text-base text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-text-secondary focus:bg-surface-raised sm:text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="mb-1.5 text-sm font-medium text-text-primary">Format</p>
              <div className="flex rounded-xl bg-surface-muted p-1">
                {(["wav", "mp3"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`rounded-lg px-3 py-1.5 text-caption font-semibold uppercase transition-colors ${
                      format === f ? "bg-surface-raised text-text-primary shadow-sm" : "text-text-secondary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-text-primary">Takes</p>
              <div className="flex rounded-xl bg-surface-muted p-1">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTakeCount(n)}
                    className={`h-8 w-8 rounded-lg text-sm font-semibold transition-colors ${
                      takeCount === n ? "bg-surface-raised text-text-primary shadow-sm" : "text-text-secondary"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="flex items-start gap-2 rounded-xl bg-halted/10 px-3.5 py-2.5 text-sm text-halted-fg">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || overCharLimit || overTokenLimit}
              className="flex min-h-button-height flex-1 items-center justify-center gap-2 rounded-2xl bg-text-primary px-4 text-sm font-semibold text-surface-raised transition-colors hover:bg-text-primary/90 active:bg-text-primary disabled:cursor-not-allowed disabled:bg-inactive"
            >
              {loading ? (
                <>
                  <IconSpinner />
                  Cloning…
                </>
              ) : (
                `Generate${takeCount > 1 ? ` (${takeCount} takes)` : ""}`
              )}
            </button>
            {loading && (
              <button
                type="button"
                onClick={handleCancel}
                className="min-h-button-height rounded-2xl border border-surface-border bg-surface-raised px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-halted/50 hover:text-halted"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {results.length > 0 && (
          <div className="space-y-2 border-t border-surface-border bg-surface-muted px-card-padding py-4">
            <p className="text-caption font-medium uppercase tracking-wide text-text-muted">
              {results.length > 1 ? "Results — pick a favorite" : "Result"}
            </p>
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                  selectedTake === i ? "border-signal/40 bg-signal/5" : "border-surface-border bg-surface-raised"
                }`}
              >
                {results.length > 1 && (
                  <button
                    type="button"
                    onClick={() => pickBestTake(i)}
                    aria-label={selectedTake === i ? "Best take" : `Mark take ${i + 1} as best`}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      selectedTake === i ? "text-warning" : "text-text-muted hover:text-warning"
                    }`}
                  >
                    <IconStar filled={selectedTake === i} />
                  </button>
                )}
                <audio controls src={r.url} className="h-10 w-full min-w-0" />
                <a
                  href={r.url}
                  download={`voice-clone-take-${i + 1}.${format}`}
                  aria-label={`Download take ${i + 1}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-raised transition-colors hover:bg-text-primary/90"
                >
                  <IconDownload />
                </a>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="border-t border-surface-border">
            <button
              type="button"
              onClick={() => setHistoryOpen((o) => !o)}
              className="flex w-full items-center justify-between px-card-padding py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
              aria-expanded={historyOpen}
            >
              Recent clones ({history.length})
              <IconChevron open={historyOpen} />
            </button>
            {historyOpen && (
              <div className="space-y-2 px-card-padding pb-4">
                {history.map((h) => (
                  <div key={h.id} className="rounded-xl border border-surface-border bg-surface-muted p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-caption text-text-muted">{relativeTime(h.createdAt)}</p>
                        <p className="mt-0.5 truncate text-sm text-text-primary">{h.text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeHistoryEntry(h.id, e)}
                        aria-label="Delete this generation"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-halted/10 hover:text-halted"
                      >
                        <IconTrash />
                      </button>
                    </div>
                    {historyUrls[h.id] && <audio controls src={historyUrls[h.id]} className="mt-2 h-8 w-full" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
