// lib/mimo.ts
// Server-only helper for MiMo-V2.5-TTS-VoiceClone (via TokenPAPA).
// Requires MIMO_API_KEY in your environment (.env.local).
// Provider docs: https://doc.tokenpapa.ai/en/docs/blog/mimo-tts-api-guide
//
// Swapping providers later: this is the only file that talks to the
// network. Change BASE_URL / the request shape here and nothing else
// in the app needs to change.

const BASE_URL = "https://tokenpapa.ai/v1";
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
 * registered or persisted on the provider side, no local storage either.
 */
export async function synthesizeClonedSpeech({
  referenceAudio,
  text,
  styleInstruction,
  format = "mp3",
}: ClonedSpeechOptions): Promise<Buffer> {
  const bytes = Buffer.from(await referenceAudio.arrayBuffer());
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
      voice: "alloy", // required by schema, ignored by the clone model
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

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
