"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  saveGeneration,
  listGenerationsByMode,
  updateSelectedTake,
  deleteGeneration,
  type GenerationRecord,
} from "@/lib/db";
import {
  MAX_CONTEXT_TOKENS,
  MAX_TEXT_LENGTH,
  INLINE_TAGS,
  estimateTokens,
  relativeTime,
  base64ToBlob,
  usePing,
  StatusBadge,
  IconAlert,
  IconDownload,
  IconSpinner,
  IconStar,
  IconTrash,
  IconChevron,
  type TakeResult,
} from "./shared";

/**
 * Single-purpose voice-design widget — generates a voice from a text
 * description, no reference audio. Same /api/voice-clone route (mode
 * switches server-side), same Dexie history table, scoped to "design".
 */
export default function VoiceDesignTool() {
  const ping = usePing();

  const [description, setDescription] = useState("");
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

  const refreshHistory = useCallback(() => {
    listGenerationsByMode("design").then(setHistory).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

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

  const resultsRef = useRef<TakeResult[]>([]);
  resultsRef.current = results;
  useEffect(() => {
    return () => {
      resultsRef.current.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, []);

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
    () => estimateTokens(text) + estimateTokens(direction) + estimateTokens(description),
    [text, direction, description]
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

    if (!description.trim()) {
      setError("Describe the voice you want first.");
      return;
    }
    if (!text.trim()) {
      setError("Enter the text you want spoken.");
      return;
    }
    if (overCharLimit || overTokenLimit) {
      setError("Text and description are too long — shorten before generating.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    resetResults();

    try {
      const form = new FormData();
      form.append("mode", "design");
      form.append("text", text);
      form.append("format", format);
      form.append("takes", String(takeCount));
      form.append("description", description);
      if (direction.trim()) form.append("direction", direction);

      const res = await fetch("/api/voice-clone", { method: "POST", body: form, signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      const takes: TakeResult[] = (data.takes as Array<{ audio: string; mimeType: string }>).map((t) => {
        const blob = base64ToBlob(t.audio, t.mimeType);
        return { blob, mimeType: t.mimeType, url: URL.createObjectURL(blob) };
      });
      setResults(takes);
      setSelectedTake(0);

      const generationId = await saveGeneration({
        mode: "design",
        text,
        direction: direction.trim() || undefined,
        voiceLabel: data.voiceLabel || description.slice(0, 60),
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
            <h2 className="text-heading text-text-primary">Voice Designer</h2>
            <p className="mt-0.5 text-caption text-text-muted">Describe a voice, generate it from scratch.</p>
          </div>
          <StatusBadge ping={ping} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-section-gap px-card-padding py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Voice description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. a warm, low-pitched woman in her 40s with a slight rasp, speaking unhurried"
              className="w-full resize-none rounded-2xl border border-surface-border bg-surface-muted/60 p-3.5 text-base text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-text-secondary focus:bg-surface-raised sm:text-sm"
            />
            <p className="mt-1.5 text-caption text-text-muted">
              Cover age, gender, pitch, pace, and accent for the most consistent results.
            </p>
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
                + Add a delivery note
              </button>
            ) : (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-text-primary">
                    Delivery note <span className="font-normal text-text-muted">(optional)</span>
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
                  Designing…
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
                  download={`voice-design-take-${i + 1}.${format}`}
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
              Recent designs ({history.length})
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
