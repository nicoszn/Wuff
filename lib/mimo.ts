// lib/mimo.ts
// Server-only client for Xiaomi's official MiMo-V2.5-TTS-VoiceClone API.
// Requires MIMO_API_KEY in your environment (.env.local).
// Get a key: https://platform.xiaomimimo.com/console/api-keys
// Model docs: https://mimo.mi.com/models/en/mimo-v2.5-tts-voiceclone
//
// The API is OpenAI-protocol-compatible but routes speech through
// chat.completions rather than a dedicated /audio/speech endpoint:
//   - reference audio -> data URI under `audio.voice`
//   - style instruction (optional) -> the "user" message content
//   - text to speak -> the "assistant" message content
//   - synthesized audio comes back base64-encoded inside the response

const BASE_URL = "https://api.xiaomimimo.com/v1";
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
  format?: "wav" | "mp3";
};

export type ClonedSpeechResult = {
  buffer: Buffer;
  mimeType: string;
};

type ChatCompletionAudioResponse = {
  choices?: Array<{
    message?: {
      audio?: { data?: string };
    };
  }>;
  error?: { message?: string };
};

/**
 * Synthesizes speech in a cloned voice from a reference audio sample.
 * The sample is sent inline as a base64 data URI — nothing is
 * registered or persisted, on the provider side or locally.
 */
export async function synthesizeClonedSpeech({
  referenceAudio,
  text,
  styleInstruction,
  format = "wav",
}: ClonedSpeechOptions): Promise<ClonedSpeechResult> {
  const bytes = Buffer.from(await referenceAudio.arrayBuffer());
  const referenceMimeType = referenceAudio.type || "audio/wav";
  const referenceDataUri = `data:${referenceMimeType};base64,${bytes.toString("base64")}`;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CLONE_MODEL,
      messages: [
        { role: "user", content: styleInstruction ?? "" },
        { role: "assistant", content: text },
      ],
      audio: {
        format,
        voice: referenceDataUri,
      },
    }),
  });

  const payload = (await res.json().catch(() => null)) as ChatCompletionAudioResponse | null;

  if (!res.ok) {
    const detail = payload?.error?.message ?? JSON.stringify(payload ?? {});
    throw new Error(`Speech synthesis failed (${res.status}): ${detail}`);
  }

  const audioBase64 = payload?.choices?.[0]?.message?.audio?.data;
  if (!audioBase64) {
    throw new Error("Provider response did not include audio data.");
  }

  return {
    buffer: Buffer.from(audioBase64, "base64"),
    mimeType: format === "mp3" ? "audio/mpeg" : "audio/wav",
  };
}

export type PingResult = {
  ok: boolean;
  status: number;
  latencyMs: number;
  detail?: string;
};

/**
 * Lightweight health check against the OpenAI-protocol /models endpoint.
 * Confirms the API key and endpoint are reachable without generating audio.
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
