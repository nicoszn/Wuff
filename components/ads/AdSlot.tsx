"use client";

import { useEffect, useId, useRef } from "react";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

type AdSlotProps = {
  /** AdSense ad unit slot ID from the AdSense dashboard, e.g. "1234567890". */
  slot: string;
  /** "auto" for responsive display units (default), "fluid" for in-article/in-feed units. */
  format?: "auto" | "fluid";
  /** Required for in-article/in-feed ("fluid") units. */
  layout?: string;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders one AdSense unit. Safe to mount/unmount as the user navigates
 * between routes (App Router client-side nav) — each instance pushes itself
 * exactly once via a mount-guard ref.
 *
 * In dev / before an AdSense account is wired up (no NEXT_PUBLIC_ADSENSE_CLIENT_ID
 * and no slot id), renders a labeled placeholder so layout/spacing can be
 * reviewed without live ads.
 */
export default function AdSlot({ slot, format = "auto", layout, className = "" }: AdSlotProps) {
  const pushed = useRef(false);
  const reactId = useId();

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !slot || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense not yet ready (e.g. blocked by an ad blocker) — fail silently.
    }
  }, [slot]);

  const isConfigured = Boolean(ADSENSE_CLIENT_ID && slot);

  return (
    <div className={`w-full ${className}`}>
      <p className="mb-1.5 text-center text-[10px] uppercase tracking-wide text-text-muted/70">
        Advertisement
      </p>
      {isConfigured ? (
        <ins
          key={reactId}
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
          {...(layout ? { "data-ad-layout": layout } : {})}
        />
      ) : (
        <div className="flex min-h-[90px] items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-muted text-caption text-text-muted">
          Ad slot “{slot}” — set NEXT_PUBLIC_ADSENSE_CLIENT_ID to go live
        </div>
      )}
    </div>
  );
}
