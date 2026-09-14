import type { Metadata } from "next";
import Link from "next/link";
import VoiceDesignTool from "@/components/voice-studio/VoiceDesignTool";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const PAGE_PATH = "/voice-design";

export const metadata: Metadata = {
  title: "Free AI Voice Design Online | Wuff",
  description:
    "Describe a voice in plain English and generate speech in it — no recording, no reference audio needed. Free AI voice design tool from Wuff.",
  applicationName: "Wuff",
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: "Free AI Voice Design Online | Wuff",
    description: "Describe a voice in plain English and generate speech in it. No recording required, no signup.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Wuff",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Voice Design Online | Wuff",
    description: "Describe a voice in plain English and generate speech in it. No recording required, free.",
  },
};

const faqs = [
  {
    q: "Is voice design free to use?",
    a: "Yes. Write a description, type your text, and generate — no account or payment involved.",
  },
  {
    q: "How is this different from voice cloning?",
    a: "Cloning copies an existing voice from a recording. Design builds a new voice from scratch using only a text description — useful when you don't have (or don't want to use) a real audio sample.",
  },
  {
    q: "What should I include in a voice description?",
    a: "Age, gender, pitch, pacing, and accent get you most of the way — e.g. \"a young man, high energy, fast talker, slight British accent.\" Texture words like raspy, breathy, or warm add character on top.",
  },
  {
    q: "Can I get the same voice again later?",
    a: "Reuse the exact same description text for a close match — output isn't pixel-identical run to run, but a consistent description keeps the voice's core character stable across generations.",
  },
  {
    q: "Can I control emotion in the speech?",
    a: "Yes — add a delivery note (like \"nervous\" or \"deadpan\"), or use inline tags such as [laugh], [sigh], and [pause] directly inside the text.",
  },
  {
    q: "What can I use the generated voice for?",
    a: "Anything you have rights to use it for — character voices for games and animation, narration, prototyping voiceover direction, or accessibility read-aloud. Avoid using it to impersonate a real, identifiable person.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Wuff Voice Designer",
      url: `${SITE_URL}${PAGE_PATH}`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (web-based)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "Wuff" },
      description:
        "Free browser-based AI voice design tool from Wuff. Describe a voice in plain English and generate speech in it — no reference audio needed.",
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

export default function VoiceDesignPage() {
  return (
    <main className="min-h-screen bg-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-gutter-mobile py-10 sm:px-gutter-tablet sm:py-14">
        <header className="mb-8">
          <p className="text-caption font-semibold uppercase tracking-wide text-signal">Wuff Voice Studio · Free</p>
          <h1 className="mt-2 text-display font-bold text-text-primary">
            Free AI Voice Design — Build a Voice From a Description, No Recording Needed
          </h1>
          <p className="mt-4 text-base text-text-secondary">
            Describe a voice in plain English — age, pitch, pace, accent, texture — and generate speech in it. No
            microphone, no reference clip. This tool is part of Wuff's free voice suite. Already have a real voice
            sample to work from?{" "}
            <Link href="/voice-clone" className="font-medium text-signal underline underline-offset-2">
              Try Voice Cloning instead
            </Link>
            .
          </p>
        </header>

        <div className="mb-10 flex justify-center">
          <VoiceDesignTool />
        </div>

        <section className="space-y-8 text-text-secondary">
          <div>
            <h2 className="text-heading text-text-primary">How voice design works</h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed">
              <li><strong className="text-text-primary">1. Describe the voice.</strong> Cover age, gender, pitch, pace, and accent — the more concrete, the more consistent the result.</li>
              <li><strong className="text-text-primary">2. Type the text to speak.</strong> Up to 2,000 characters. Use inline tags like <code className="rounded bg-surface-muted px-1 py-0.5 text-caption">[laugh]</code> or <code className="rounded bg-surface-muted px-1 py-0.5 text-caption">[breath]</code> for finer control.</li>
              <li><strong className="text-text-primary">3. Optionally add a delivery note.</strong> Layer emotion or urgency on top of the base description without rewriting it.</li>
              <li><strong className="text-text-primary">4. Generate and download.</strong> WAV or MP3 output, ready in seconds. Try multiple takes and keep the best.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">Who this is for</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed sm:grid-cols-2">
              <li>Game and animation developers who need original character voices</li>
              <li>Narrators and explainer-video creators without access to a voice actor</li>
              <li>Writers prototyping how a script sounds before booking real talent</li>
              <li>Podcast and audio-drama creators building a cast of distinct voices</li>
              <li>Educators and course creators producing narrated content quickly</li>
              <li>Anyone testing voice concepts before committing to a recording session</li>
            </ul>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">Writing a good voice description</h2>
            <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
              <li>Start with the fundamentals: age range, gender, and rough pitch (low, mid, high)</li>
              <li>Add pace and energy: unhurried, fast-talking, high energy, deadpan</li>
              <li>Note an accent or region if it matters: slight Irish accent, neutral American</li>
              <li>Finish with texture: raspy, breathy, warm, nasal, gravelly — these do the most to make a voice distinctive</li>
              <li>Example: "an older man, low and gravelly, speaks slowly with a slight Southern drawl"</li>
            </ul>
          </div>

          <div>
            <h2 className="text-heading text-text-primary">Frequently asked questions</h2>
            <div className="mt-3 space-y-4">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="text-sm font-semibold text-text-primary">{f.q}</h3>
                  <p className="mt-1 text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="border-t border-surface-border pt-6 text-caption text-text-muted">
            Use this tool responsibly: designed voices are original, not copies of real people — avoid writing
            descriptions intended to imitate a specific, identifiable individual. Generated audio is created locally
            in your session and is not shared publicly by this tool.
          </p>
        </section>
      </div>
    </main>
  );
}
