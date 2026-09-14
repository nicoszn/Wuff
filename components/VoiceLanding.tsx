'use client'

import { motion } from "framer-motion";
import { AudioWaveform, ArrowRight, Mic, Sparkles, Upload, Type, Download } from "lucide-react";
import Link from "next/link";
import AdSlot from "@/components/ads/AdSlot";

const tools = [
  {
    label: "Voice Cloning",
    href: "/voice-clone",
    icon: Mic,
    tagline: "Clone a voice from a short sample",
    detail:
      "Upload a few seconds of clean audio, type your script, and Wuff returns natural-sounding speech in that voice. No signup, no watermark — generate and download in seconds.",
  },
  {
    label: "Voice Design",
    href: "/voice-design",
    icon: Sparkles,
    tagline: "Design a voice from plain English",
    detail:
      "Describe the voice you want — warm narrator, crisp news anchor, playful character — and generate speech in it. No recording and no reference audio required.",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Add your input",
    detail: "Upload a short audio sample to clone, or skip the upload and describe the voice you want instead.",
  },
  {
    icon: Type,
    title: "Type your script",
    detail: "Paste or write any text. Wuff handles pacing, punctuation and emphasis automatically.",
  },
  {
    icon: Download,
    title: "Generate & download",
    detail: "Get natural speech in seconds. No signup, no watermark, no credit card — just download and use it.",
  },
];

const faqs = [
  {
    q: "Is Wuff really free?",
    a: "Yes. Both voice cloning and voice design are free to use. There is no signup wall, no watermark on your audio, and no credit card required to generate and download speech.",
  },
  {
    q: "How long does a voice sample need to be?",
    a: "A clean clip of a few seconds is enough. Clear audio with minimal background noise produces the most accurate clone.",
  },
  {
    q: "Can I design a voice without recording anything?",
    a: "Absolutely. With voice design you describe the voice in plain English — tone, age, pace, character — and Wuff generates speech in it without any reference audio.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Wuff runs entirely in your browser. Open a tool, add your input, generate, and download.",
  },
];

export default function VoiceLanding() {
  return (
    <div className="min-h-screen bg-surface text-text-primary overflow-hidden">
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      >
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-signal/5 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-armed/5 blur-[100px]" />
      </div>

      <nav className="relative z-10 border-b border-surface-border/50">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2" aria-label="Wuff home">
            <div className="flex items-center justify-center size-8 rounded-lg bg-signal/15 text-signal">
              <AudioWaveform className="size-4" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight font-mono">Wuff</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 text-sm">
            <Link
              href="/voice-clone"
              className="rounded-full px-3 py-2 text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-raised/60"
            >
              Voice Clone
            </Link>
            <Link
              href="/voice-design"
              className="rounded-full px-3 py-2 text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-raised/60"
            >
              Voice Design
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Wuff Voice Desk
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-mono leading-[1.1]">
            Free AI Voice Cloning
            <span className="text-text-secondary"> & </span>
            Voice Design
          </h1>

          <p className="mt-5 max-w-xl text-text-secondary leading-relaxed">
            Clone a voice from a short sample, or design a brand-new one from a
            text description. Wuff turns your words into natural speech in
            seconds — no signup, no watermark, no software to install.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/voice-clone"
              className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 text-sm font-semibold text-surface-raised transition-colors hover:bg-text-primary/90"
            >
              Clone a voice <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/voice-design"
              className="inline-flex items-center gap-2 rounded-full border border-surface-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised/60"
            >
              Design a voice
            </Link>
          </div>

          <p className="mt-5 text-xs text-text-muted">
            Free forever · No signup · No watermark · Download in seconds
          </p>

          <div className="mt-14 grid sm:grid-cols-2 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.label}
                  href={tool.href}
                  className="group rounded-xl border border-surface-border/60 bg-surface-raised/50 p-5 transition-colors hover:border-signal/40 hover:bg-surface-raised/80"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center size-7 rounded-md bg-signal/15 text-signal">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold font-mono text-signal">
                      {tool.label}
                    </span>
                  </div>
                  <div className="text-sm font-medium mb-2">{tool.tagline}</div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {tool.detail}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-signal opacity-0 transition-opacity group-hover:opacity-100">
                    Open {tool.label} <ArrowRight className="size-3" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-16">
          <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_HOME_TOP ?? ""} />
        </div>

        <section className="mt-24" aria-labelledby="how-it-works">
          <h2
            id="how-it-works"
            className="text-2xl font-bold tracking-tight font-mono"
          >
            How Wuff works
          </h2>
          <p className="mt-2 max-w-xl text-sm text-text-secondary leading-relaxed">
            Three steps from text to downloadable speech — whether you are
            cloning an existing voice or designing one from scratch.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-xl border border-surface-border/60 bg-surface-raised/50 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center justify-center size-7 rounded-md bg-signal/15 text-signal">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-xs text-text-muted">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="text-sm font-semibold mb-2">{step.title}</div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-16">
          <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_HOME_MID ?? ""} />
        </div>

        <section className="mt-24" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold tracking-tight font-mono">
            Frequently asked questions
          </h2>

          <div className="mt-6 divide-y divide-surface-border/60 border-y border-surface-border/60">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold list-none">
                  {faq.q}
                  <span className="text-signal transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 max-w-2xl text-xs text-text-muted leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-2xl border border-surface-border/60 bg-surface-raised/50 p-8 text-center">
          <h2 className="text-xl font-bold tracking-tight font-mono">
            Ready to hear your voice?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary leading-relaxed">
            Start with a short sample to clone a voice, or describe one in plain
            English and let Wuff do the rest.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/voice-clone"
              className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 text-sm font-semibold text-surface-raised transition-colors hover:bg-text-primary/90"
            >
              Clone a voice <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/voice-design"
              className="inline-flex items-center gap-2 rounded-full border border-surface-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised/80"
            >
              Design a voice
            </Link>
          </div>
        </section>

        <div className="mt-16 text-xs text-text-muted space-y-1">
          <p>
            Two tools: AI voice cloning from a short audio sample · AI voice
            design from a text description
          </p>
          <p>Free to use · No signup · No watermark · Browser-based</p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-surface-border/60 py-6">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-text-muted">
          <span>Wuff Voice Desk — Free AI Voice Cloning & Voice Design</span>
          <div className="flex items-center gap-4">
            <Link href="/voice-clone" className="transition-colors hover:text-text-secondary">
              Voice Cloning
            </Link>
            <Link href="/voice-design" className="transition-colors hover:text-text-secondary">
              Voice Design
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-text-secondary">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
