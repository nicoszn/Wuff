'use client';

import React, { useState, useTransition } from 'react';

interface MediaAsset {
  type: 'video' | 'image';
  preview: string;
  downloadUrl: string;
}

interface ExtractionResult {
  id: string;
  text: string;
  author: string;
  media: MediaAsset[];
}

export default function ExtractorForm() {
  const [inputUrl, setInputUrl] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [dataPayload, setDataPayload] = useState<ExtractionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleExtractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setDataPayload(null);

    if (!inputUrl.trim()) return;

    // useTransition keeps the user interface responsive during heavy asynchronous network loads
    startTransition(async () => {
      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputUrl.trim() }),
        });

        const resultJson = await response.json();

        if (!response.ok) {
          throw new Error(resultJson.error || 'Server rejected extraction request.');
        }

        setDataPayload(resultJson);
      } catch (err: any) {
        setErrorText(err.message || 'An unexpected execution issue occurred.');
      }
    });
  };

  return (
    <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-white tracking-tight">
          X / Twitter Media Converter
        </h1>
        <p className="text-xs text-zinc-400">
          Input a link to instantly extract high-quality video or photo file assets.
        </p>
      </div>

      <form onSubmit={handleExtractionSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          required
          disabled={isPending}
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://x.com..."
          className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 sm:py-0 rounded-xl transition-all duration-150 shrink-0"
        >
          {isPending ? 'Processing...' : 'Convert'}
        </button>
      </form>

      {errorText && (
        <div className="bg-red-950/50 border border-red-900/50 text-red-400 text-xs px-4 py-3 rounded-xl">
          {errorText}
        </div>
      )}

      {dataPayload && (
        <div className="pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/40 text-[11px] text-zinc-400">
            <span className="font-bold text-zinc-300 block mb-1">@{dataPayload.author}</span>
            <p className="italic line-clamp-2">"{dataPayload.text}"</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dataPayload.media.map((asset, index) => (
              <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="aspect-video relative bg-zinc-900 flex items-center justify-center">
                  {asset.preview ? (
                    <img 
                      src={asset.preview} 
                      alt="Asset preview thumbnail" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-600 uppercase font-mono">{asset.type} Asset</span>
                  )}
                </div>
                <div className="p-2.5">
                  <a
                    href={asset.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`xtract_${dataPayload.id}_${index}`}
                    className="w-full text-center block bg-zinc-800 hover:bg-white hover:text-zinc-950 text-white text-xs font-bold py-2 rounded-xl transition duration-150"
                  >
                    Open & Save {asset.type.toUpperCase()}
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
