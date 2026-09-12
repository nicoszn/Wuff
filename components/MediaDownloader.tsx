'use client';

import React, { useState } from 'react';

interface MediaItem {
  type: 'video' | 'image';
  preview: string;
  downloadUrl: string;
}

interface PostData {
  id: string;
  text: string;
  media: MediaItem[];
}

export default function MediaDownloader() {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PostData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to process URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-900">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            X / Twitter Media Converter
          </h1>
          <p className="text-sm text-slate-400">
            Paste a link below to process and directly download public thread media, videos, or images.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="url"
              required
              placeholder="https://x.com..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 pr-24 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 disabled:opacity-50 font-semibold px-4 rounded-lg text-xs tracking-wide uppercase transition-all duration-200"
            >
              {loading ? 'Processing...' : 'Fetch'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="border-t border-slate-800 pt-6">
              <p className="text-sm text-slate-300 italic line-clamp-3 mb-4">
                &ldquo;{result.text}&rdquo;
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.media.map((item, idx) => (
                  <div key={idx} className="group relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
                    <div className="aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                      {item.preview ? (
                        <img 
                          src={item.preview} 
                          alt="Media preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <span className="text-xs text-slate-600 uppercase font-mono">{item.type} preview</span>
                      )}
                    </div>
                    <div className="p-3">
                      <a
                        href={`/api/proxy?url=${encodeURIComponent(item.downloadUrl)}`}
                        download
                        className="w-full inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition-all duration-150"
                      >
                        Download {item.type.toUpperCase()}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
