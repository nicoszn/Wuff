/**
 * Minimal consent-state helper for Google Consent Mode v2.
 *
 * Wuff has no accounts and no server-side user record, so consent is tracked
 * client-side only (localStorage) and mirrored into `window.dataLayer` via
 * `gtag('consent', 'update', …)`. This is what tells AdSense whether it may
 * serve personalized ads, or must fall back to non-personalized ads for that
 * visitor.
 *
 * This does not attempt IP-based geo-detection — the banner is shown to every
 * visitor and defaults to "denied" until they choose, which is the safe,
 * compliant default for both GDPR (EEA/UK) and CCPA/CPRA (California).
 */

export type ConsentChoice = "granted" | "denied";

const STORAGE_KEY = "wuff_ad_consent";
export const CONSENT_EVENT = "wuff:consent-changed";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

function pushGtagConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  window.gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

export function setConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, choice);
  pushGtagConsent(choice);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}
