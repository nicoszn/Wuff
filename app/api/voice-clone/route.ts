// app/api/voice-clone/route.ts
import { NextRequest, NextResponse } from "next/server";
import { synthesizeClonedSpeech, pingProvider } from "@/lib/mimo";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/voice-clone — health check. Confirms MIMO_API_KEY is set and
// the provider endpoint is reachable, without generating any audio.
export async function GET() {
  const result = await pingProvider();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

// POST /api/voice-clone — Generates audio payload from Form Data input
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    const text = form.get("text");
    const style = form.get("style");

    // Validation checks
    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json(
        { error: "Missing reference audio file." },
        { status: 400 }
      );
    }
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing text to synthesize." },
        { status: 400 }
      );
    }
    if (audio.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Reference audio must be 10MB or smaller." },
        { status: 400 }
      );
    }

    // Call our library helper (returns a Node Buffer)
    const audioBuffer = await synthesizeClonedSpeech({
      referenceAudio: audio,
      text,
      styleInstruction: typeof style === "string" && style.trim() ? style : undefined,
      format: "mp3",
    });

    // Pass the buffer stream directly into the standard response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="clone-output.mp3"',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
