import Script from "next/script";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Server component (no "use client" needed — next/script handles hydration).
 *
 * Order matters for Google Consent Mode:
 *   1. Set default consent state (denied) — must run before the AdSense
 *      library itself, so it never assumes personalization is allowed.
 *   2. Load the AdSense library (adsbygoogle.js). It's safe to load this
 *      unconditionally: with ad_storage/ad_personalization denied by
 *      default, Google serves non-personalized ads until the visitor opts
 *      in via ConsentBanner -> setConsent('granted').
 *
 * Renders nothing if NEXT_PUBLIC_ADSENSE_CLIENT_ID isn't set, so local/dev
 * builds without a real AdSense account don't try to load the script.
 */
export default function AdSenseLoader() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <>
      <Script id="consent-defaults" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      />
    </>
  );
}
