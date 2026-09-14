// app/api/voice-clone/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  synthesizeClonedSpeech,
  synthesizeDesignedSpeech,
  pingProvider,
  estimateTokens,
  MAX_CONTEXT_TOKENS,
  type SynthesisFormat,
  type SynthesisResult,
} from "@/lib/mimo";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_REFERENCE_BYTES = 10 * 1024 * 1024;
const MAX_TAKES = 3;

// GET /api/voice-clone — health check. Confirms MIMO_API_KEY is set and
// the provider endpoint is reachable, without generating any audio.
export async function GET() {
  const result = await pingProvider();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const mode = form.get("mode") === "design" ? "design" : "clone";
    const text = form.get("text");
    const direction = form.get("direction"); // style instruction (clone) or extra direction (design)
    const format: SynthesisFormat = form.get("format") === "mp3" ? "mp3" : "wav";
    const takesRequested = Math.min(
      Math.max(Number(form.get("takes")) || 1, 1),
      MAX_TAKES
    );

    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Missing text to synthesize." }, { status: 400 });
    }

    const directionText = typeof direction === "string" ? direction : "";
    const estimatedTokens = estimateTokens(text) + estimateTokens(directionText);
    if (estimatedTokens > MAX_CONTEXT_TOKENS) {
      return NextResponse.json(
        {
          error: `Text and direction together are too long (~${estimatedTokens} tokens, limit ${MAX_CONTEXT_TOKENS}). Shorten and try again.`,
        },
        { status: 400 }
      );
    }

    let synthesizeOnce: () => Promise<SynthesisResult>;
    let voiceLabel: string;

    if (mode === "design") {
      const description = form.get("description");
      if (typeof description !== "string" || description.trim().length === 0) {
        return NextResponse.json(
          { error: "Voice description is required for voice design." },
          { status: 400 }
        );
      }
      const fullDirection = directionText
        ? `${description}. ${directionText}`
        : description;
      synthesizeOnce = () =>
        synthesizeDesignedSpeech({
          description: fullDirection,
          text,
          format,
          signal: req.signal,
        });
      voiceLabel = description.slice(0, 60);
    } else {
      const audio = form.get("audio");
      if (!(audio instanceof File) || audio.size === 0) {
        return NextResponse.json(
          { error: "Missing reference audio file." },
          { status: 400 }
        );
      }
      if (audio.size > MAX_REFERENCE_BYTES) {
        return NextResponse.json(
          { error: "Reference audio must be 10MB or smaller." },
          { status: 400 }
        );
      }
      synthesizeOnce = () =>
        synthesizeClonedSpeech({
          referenceAudio: audio,
          text,
          styleInstruction: directionText || undefined,
          format,
          signal: req.signal,
        });
      voiceLabel = audio.name;
    }

    const results = await Promise.all(
      Array.from({ length: takesRequested }, () => synthesizeOnce())
    );

    return NextResponse.json({
      mode,
      voiceLabel,
      takes: results.map((r) => ({
        audio: r.buffer.toString("base64"),
        mimeType: r.mimeType,
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request cancelled." }, { status: 499 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
