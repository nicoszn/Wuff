"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredConsent, setConsent } from "@/lib/consent";

/**
 * Bottom consent banner. Renders nothing until we've checked localStorage
 * client-side (avoids a hydration flash), then shows once until the visitor
 * makes a choice. "Reject" still lets AdSense serve non-personalized ads —
 * it only withholds consent for personalization/analytics storage.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
  }, []);

  if (!visible) return null;

  function choose(choice: "granted" | "denied") {
    setConsent(choice);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and ad consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-border bg-surface-raised/95 px-gutter-mobile py-4 backdrop-blur sm:px-gutter-tablet"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-text-secondary sm:max-w-xl">
          Wuff uses cookies to keep this free and support it with ads. Accept
          to allow personalized ads, or reject to see fewer relevant ones.
          See our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-text-primary">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-full border border-surface-border px-4 py-2 text-caption font-semibold text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-full bg-text-primary px-4 py-2 text-caption font-semibold text-surface-raised transition-colors hover:bg-text-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
