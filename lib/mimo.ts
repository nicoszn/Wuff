// lib/mimo.ts
// Server-only client for Xiaomi's official MiMo-V2.5-TTS API family.
// Requires MIMO_API_KEY in your environment (.env.local).
// Get a key: https://platform.xiaomimimo.com/console/api-keys
// Docs: https://mimo.mi.com/docs/en-US/quick-start/usage-guide/audio/speech-synthesis-v2.5
//
// Confirmed call rules (from the official docs):
//   - Text to speak MUST be the "assistant" message — never "user".
//   - "user" message is optional for voiceclone (style/tone instruction),
//     but REQUIRED for voicedesign (that's where the voice description goes).
//   - voiceclone additionally needs `audio.voice` as a reference data URI.
//   - voicedesign has no `audio.voice` field — no reference audio at all.
//   - Context window is 8,192 tokens total (input + output) for either model.

const BASE_URL = "https://api.xiaomimimo.com/v1";
const CLONE_MODEL = "mimo-v2.5-tts-voiceclone";
const DESIGN_MODEL = "mimo-v2.5-tts-voicedesign";

function getApiKey(): string {
  const key = process.env.MIMO_API_KEY;
  if (!key) {
    throw new Error("Missing MIMO_API_KEY environment variable.");
  }
  return key;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatCompletionAudioResponse = {
  choices?: Array<{ message?: { audio?: { data?: string } } }>;
  error?: { message?: string };
};

export type SynthesisFormat = "wav" | "mp3";

export type SynthesisResult = {
  buffer: Buffer;
  mimeType: string;
};

/**
 * Rough token estimator (chars / 4, the standard rule-of-thumb for mixed
 * English text) used to warn before a request would exceed the 8k context
 * window. Not exact — the real tokenizer isn't public — but close enough
 * to flag "this is going to get truncated" before it happens.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export const MAX_CONTEXT_TOKENS = 8192;

/** One retry on 5xx (transient provider errors), none on 4xx or abort. */
async function postWithRetry(
  url: string,
  body: unknown,
  signal?: AbortSignal
): Promise<Response> {
  const attempt = () =>
    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

  const first = await attempt();
  if (first.status < 500) return first;

  await new Promise((resolve) => setTimeout(resolve, 400));
  return attempt();
}

async function runChatCompletion(
  model: string,
  messages: ChatMessage[],
  format: SynthesisFormat,
  signal?: AbortSignal,
  referenceVoiceDataUri?: string
): Promise<SynthesisResult> {
  const audio: { format: SynthesisFormat; voice?: string } = { format };
  if (referenceVoiceDataUri) audio.voice = referenceVoiceDataUri;

  const res = await postWithRetry(
    `${BASE_URL}/chat/completions`,
    { model, messages, audio },
    signal
  );

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

export type CloneOptions = {
  referenceAudio: File;
  text: string;
  styleInstruction?: string;
  format?: SynthesisFormat;
  signal?: AbortSignal;
};

/** Synthesizes speech in a cloned voice from a reference audio sample. */
export async function synthesizeClonedSpeech({
  referenceAudio,
  text,
  styleInstruction,
  format = "wav",
  signal,
}: CloneOptions): Promise<SynthesisResult> {
  const bytes = Buffer.from(await referenceAudio.arrayBuffer());
  const referenceMimeType = referenceAudio.type || "audio/wav";
  const referenceDataUri = `data:${referenceMimeType};base64,${bytes.toString("base64")}`;

  return runChatCompletion(
    CLONE_MODEL,
    [
      { role: "user", content: styleInstruction ?? "" },
      { role: "assistant", content: text },
    ],
    format,
    signal,
    referenceDataUri
  );
}

export type DesignOptions = {
  description: string;
  text: string;
  format?: SynthesisFormat;
  signal?: AbortSignal;
};

/**
 * Synthesizes speech in a voice generated from a text description —
 * no reference audio involved. The description is a required "user"
 * message per the official call rules for this model.
 */
export async function synthesizeDesignedSpeech({
  description,
  text,
  format = "wav",
  signal,
}: DesignOptions): Promise<SynthesisResult> {
  return runChatCompletion(
    DESIGN_MODEL,
    [
      { role: "user", content: description },
      { role: "assistant", content: text },
    ],
    format,
    signal
  );
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
