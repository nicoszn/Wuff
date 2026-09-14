import type { Metadata } from "next";
import Link from "next/link";
import VoiceCloneTool from "@/components/voice-studio/VoiceCloneTool";

// Set this once you have a domain, e.g. NEXT_PUBLIC_SITE_URL=https://yourapp.com
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const PAGE_PATH = "/voice-clone";

export const metadata: Metadata = {
  title: "Free AI Voice Cloning Online | Wuff",
  description:
    "Clone any voice from a short audio clip — free, no signup. Upload a sample, type your text, and download natural-sounding speech in seconds with Wuff.",
  applicationName: "Wuff",
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: "Free AI Voice Cloning Online | Wuff",
    description:
      "Clone any voice from a short audio clip — free, no signup. Upload a sample, type your text, and download in seconds.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Wuff",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Voice Cloning Online | Wuff",
    description: "Clone any voice from a short audio clip — free, no signup. Download in seconds.",
  },
};

const faqs = [
  {
    q: "Is voice cloning actually free?",
    a: "Yes. Upload a reference clip, type what you want said, and generate — there's no account, subscription, or credit system.",
  },
  {
    q: "How long does the reference audio need to be?",
    a: "A few seconds of clean speech is enough. Longer isn't necessarily better — a short, clear sample with no background noise or music usually clones more accurately than a longer noisy one.",
  },
  {
    q: "What file formats are supported?",
    a: "Upload WAV or MP3 for the reference sample, up to 10MB. Output can be downloaded as WAV or MP3.",
  },
  {
    q: "Can I control the emotion or delivery style?",
    a: "Yes — add a style direction (like \"tired\" or \"fast and urgent\"), or use inline tags such as [laugh], [pause], and [sigh] directly in the text to shape delivery beyond a flat read.",
  },
  {
    q: "Does the clone sound identical every time?",
    a: "Not perfectly — like any generative model, output varies slightly run to run. Generate multiple takes and pick the one that fits best; that variation is exposed intentionally as a feature, not hidden.",
  },
  {
    q: "Whose voice can I clone?",
    a: "Only clone voices you have the right to use — your own voice, a voice you have explicit permission for, or licensed material. Using someone else's voice without consent to deceive or impersonate is misuse of this tool.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Wuff Voice Cloner",
      url: `${SITE_URL}${PAGE_PATH}`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (web-based)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "Wuff" },
      description:
        "Free browser-based AI voice cloning tool from Wuff. Upload a short reference audio sample and generate new speech in that voice.",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function VoiceClonePage() {
  return (
    <main className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-gutter-mobile py-10 sm:px-gutter-tablet sm:py-14">
        <header className="mb-8">
          <p className="text-caption font-semibold uppercase tracking-wide text-signal">Wuff Voice Studio · Free</p>
          <h1 className="mt-2 text-display font-bold text-text-primary">
            Free AI Voice Cloning — Turn a Short Clip Into a Speaking Voice
          </h1>
          <p className="mt-4 text-base text-text-secondary">
            Upload a few seconds of reference audio, type what you want it to say, and generate new speech in that
            voice — no account, no watermark, no cost. This tool is part of Wuff's free voice suite. Looking to
            build a voice with no recording at all?{" "}
            <Link href="/voice-design" className="font-medium text-signal underline underline-offset-2">
              Try Voice Design instead
            </Link>
            .
          </p>
        </header>

        <div className="mb-10 flex justify-center">
          <VoiceCloneTool />
        </div>

        <section className="space-y-8 text-text-secondary">
          <div>
            <h2 className="text-heading text-text-primary">How voice cloning works</h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed">
              <li><strong className="text-text-primary">1. Upload a reference clip.</strong> A clean 5–15 second WAV or MP3 sample is plenty — one voice, minimal background noise.</li>
              <li><strong className="text-text-primary">2. Type the text to speak.</strong> Anything up to 2,000 characters. Use inline tags like <code className="rounded bg-surface-muted px-1 py-0.5 text-caption">[laugh]</code> or <code className="rounded bg-surface-muted px-1 py-0.5 text-caption">[pause]</code> to shape delivery.</li>
              <li><strong className="text-text-primary">3. Optionally direct the style.</strong> A short phrase like "sarcastic" or "whispering, low energy" adjusts tone without changing the voice identity.</li>
              <li><strong className="text-text-primary">4. Generate and download.</strong> Get WAV or MP3 output in seconds. Generate multiple takes if you want to pick the cleanest one.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">Who this is for</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed sm:grid-cols-2">
              <li>Indie game and visual-novel developers voicing characters without hiring a full cast</li>
              <li>Podcasters and audio-drama creators needing consistent narrator voices</li>
              <li>Audiobook and video creators localizing or re-recording content quickly</li>
              <li>Accessibility use — turning written content into a familiar, natural-sounding voice</li>
              <li>Prototyping voiceover direction before booking real talent</li>
              <li>Anyone who wants their own voice available for text they didn't have time to record</li>
            </ul>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">Tips for a clean clone</h2>
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
              <li>Use a quiet recording with no music, echo, or overlapping voices</li>
              <li>WAV tends to clone slightly more accurately than heavily compressed MP3</li>
              <li>A natural, steady speaking pace clones better than shouting or whispering source audio</li>
              <li>If a take sounds off, try a different reference clip before troubleshooting text or style settings</li>
            </ul>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <h2 className="text-heading text-text-primary">Frequently asked questions</h2>
            <div className="mt-3 space-y-4">
              {faqs.map((f) => (
                <div className="rounded-xl border border-border/40 bg-card/50 p-5" key={f.q}>
                  <h3 className="text-sm font-semibold font-mono text-text-primary mb-2">{f.q}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="border-t border-surface-border pt-6 text-caption text-text-muted">
            Use this tool responsibly: only clone voices you own or have explicit permission to use. Generated audio
            is created locally in your session and is not shared publicly by this tool.
          </p>
        </section>
      </div>
    </main>
  );
}
