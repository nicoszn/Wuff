import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Wuff",
  description: "How Wuff handles audio, cookies, and advertising data.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl px-gutter-mobile py-10 sm:px-gutter-tablet sm:py-14">
        <Link href="/" className="text-caption font-medium text-signal underline underline-offset-2">
          ← Back to Wuff
        </Link>

        <h1 className="mt-4 text-display font-bold text-text-primary">Privacy Policy</h1>
        <p className="mt-2 text-caption text-text-muted">Last updated: [DATE]</p>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-text-secondary">
          <div>
            <h2 className="text-heading text-text-primary">1. Audio you upload or generate</h2>
            <p className="mt-2">
              Reference clips and generated speech are processed to produce your output and are not
              used to train models beyond what's needed to serve that request. [Confirm and adjust
              this against your actual TTS provider's data-retention terms before publishing.]
              Anything saved to your voice library or generation history is stored in your browser
              (IndexedDB) on your device, not on our servers, unless you explicitly export or share it.
            </p>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">2. Cookies and advertising</h2>
            <p className="mt-2">
              Wuff is free to use and supported by advertising through Google AdSense. Google and its
              partners use cookies and similar technologies to serve ads based on your visits to this
              and other sites. You can control ad personalization for this site with the banner shown
              on your first visit, and more broadly at{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-text-primary"
              >
                Google Ads Settings
              </a>
              . Learn more about how Google uses data at{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-text-primary"
              >
                policies.google.com/technologies/partner-sites
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">3. Analytics</h2>
            <p className="mt-2">
              [Describe any analytics provider in use, e.g. Google Analytics, Plausible, or none. If
              none is wired up yet, remove this section or state that no analytics are currently
              collected.]
            </p>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">4. Your choices</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Reject ad personalization at any time via the consent banner or Google Ads Settings.</li>
              <li>Clear your voice library and generation history from within the app or by clearing site data in your browser.</li>
              <li>Use browser extensions or built-in settings to block cookies; core cloning/design features still work without ads consent.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">5. Contact</h2>
            <p className="mt-2">
              Questions about this policy: [your contact email]. [Add your business name / jurisdiction
              here if required for your region's disclosure rules.]
            </p>
          </div>
        </section>

        <p className="mt-10 border-t border-surface-border pt-6 text-caption text-text-muted">
          This page is a starting template, not legal advice — have it reviewed before you rely on it
          in production, particularly the bracketed placeholders above.
        </p>
      </div>
    </main>
  );
}
