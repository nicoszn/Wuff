// lib/mimo.ts
// Server-only helper for MiMo-V2.5-TTS-VoiceClone (via TokenPAPA).
// Requires MIMO_API_KEY in your environment (.env.local).
// Provider docs: https://tokenpapa.ai

const BASE_URL = "https://tokenpapa.ai";
const CLONE_MODEL = "mimo-v2.5-tts-voiceclone";

function getApiKey(): string {
  const key = process.env.MIMO_API_KEY;
  if (!key) {
    throw new Error("Missing MIMO_API_KEY environment variable.");
  }
  return key;
}

export type ClonedSpeechOptions = {
  referenceAudio: File;
  text: string;
  styleInstruction?: string;
  format?: "mp3" | "wav" | "opus" | "flac";
};

/**
 * Synthesizes speech in a cloned voice from a reference audio sample.
 * The sample is sent inline (base64) with the request — nothing is
 * registered or persisted on the provider side.
 */
export async function synthesizeClonedSpeech({
  referenceAudio,
  text,
  styleInstruction,
  format = "mp3",
}: ClonedSpeechOptions): Promise<Buffer> {
  // Convert standard File object to an ArrayBuffer, then into a Node.js Buffer
  const arrayBuffer = await referenceAudio.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const referenceAudioBase64 = bytes.toString("base64");

  const res = await fetch(`${BASE_URL}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CLONE_MODEL,
      input: text,
      voice: "alloy", // required by OpenAI schema validation, ignored by clone backend
      response_format: format,
      extra_body: {
        reference_audio: referenceAudioBase64,
        ...(styleInstruction ? { style_instruction: styleInstruction } : {}),
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Speech synthesis failed (${res.status}): ${detail}`);
  }

  const responseArrayBuffer = await res.arrayBuffer();
  return Buffer.from(responseArrayBuffer);
}

export type PingResult = {
  ok: boolean;
  status: number;
  latencyMs: number;
  detail?: string;
};

/**
 * Lightweight health check — hits the provider's /models endpoint
 * to confirm the API key and endpoint are reachable.
 */
export async function pingProvider(): Promise<PingResult> {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });
    const latencyMs = Date.now() - started;

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, status: res.status, latencyMs, detail };
    }
    return { ok: true, status: res.status, latencyMs };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message : "Network error",
    };
  }
}
