'use client';

import React, { useState, useTransition } from 'react';

interface MediaFile {
  type: 'video' | 'image';
  preview: string;
  downloadUrl: string;
}

interface XtractPayload {
  id: string;
  text: string;
  title: string;
  media: MediaFile[];
}

export default function ExtractorForm() {
  const [targetLink, setTargetLink] = useState('');
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [result, setResult] = useState<XtractPayload | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLog(null);
    setResult(null);

    if (!targetLink.trim()) return;

    startTransition(async () => {
      try {
        const res = await fetch('/api/downloader', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetLink.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || 'The conversion pipeline returned an unexpected error state.');
        }

        setResult(data);
      } catch (err: any) {
        setErrorLog(err.message || 'Network connectivity fault processing the stream.');
      }
    });
  };

  return (
    <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent tracking-tight">
          X / Twitter Media Serverless Extractor
        </h1>
        <p className="text-xs text-zinc-400">
          Powered by isolated Vercel Services compute routing.
        </p>
      </div>

      <form onSubmit={handleExtraction} className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          required
          disabled={isPending}
          value={targetLink}
          onChange={(e) => setTargetLink(e.target.value)}
          placeholder="https://x.com..."
          className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 sm:py-0 rounded-xl transition duration-150 shrink-0"
        >
          {isPending ? 'Processing...' : 'Xtract'}
        </button>
      </form>

      {errorLog && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 text-xs px-4 py-3 rounded-xl">
          {errorLog}
        </div>
      )}

      {result && (
        <div className="pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <blockquote className="text-xs text-zinc-400 line-clamp-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/40 italic">
            "{result.text || "No post body payload text retrieved."}"
          </blockquote>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.media.map((file, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="aspect-video relative bg-zinc-900 flex items-center justify-center">
                  {file.preview ? (
                    <img src={file.preview} alt="Thumb" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">{file.type}</span>
                  )}
                </div>
                <div className="p-3">
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center bg-zinc-800 hover:bg-white hover:text-zinc-950 text-white text-xs font-bold py-2 rounded-xl transition"
                  >
                    Download {file.type.toUpperCase()}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
