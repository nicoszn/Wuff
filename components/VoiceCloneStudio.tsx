"use client";

import { useRef, useState } from "react";

export default function VoiceCloneStudio() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Voice Clone</h2>
      <p className="mt-1 text-sm text-slate-500">
        Upload a short reference sample, write what it should say, and optionally
        direct the delivery style.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Reference audio (mp3/wav, ≤10MB)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/mp3"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
            className="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Text to speak</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Type the line you want the cloned voice to say…"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Style instruction <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="e.g. tired, sarcastic, whispering, fast-paced and urgent"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Cloning…" : "Generate"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {outputUrl && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <audio controls src={outputUrl} className="w-full" />
        </div>
      )}
    </div>
  );
}
