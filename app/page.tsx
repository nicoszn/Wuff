import type { Metadata } from "next";
import VoiceLanding from "@/components/VoiceLanding";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Wuff — Free AI Voice Cloning & Voice Design",
  description:
    "Clone a voice from a short sample, or design a brand-new one from a text description. Free, no signup, no watermark — generate and download speech in seconds.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Wuff — Free AI Voice Cloning & Voice Design",
    description:
      "Clone a voice from a short sample, or design a brand-new one from a text description. Free, no signup, no watermark.",
    url: SITE_URL,
    siteName: "Wuff",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wuff — Free AI Voice Cloning & Voice Design",
    description: "Free AI voice cloning and voice design. No signup, no watermark.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Wuff",
  url: SITE_URL,
  description:
    "Free browser-based AI voice tools: clone a voice from a short sample, or design a new one from a text description.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/voice-clone?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VoiceLanding />
    </>
  );
}
