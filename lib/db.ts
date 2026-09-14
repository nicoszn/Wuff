// lib/db.ts
// Local persistence layer — Dexie 4 over IndexedDB.
// Two tables: `voices` (saved reference clips, reusable across sessions
// without re-uploading) and `generations` (history of past renders,
// including every take, not just the one picked).
//
// Dexie 4 typing pattern (dexie.org/docs/Typescript):
//   const db = new Dexie(name) as Dexie & { table: EntityTable<T, 'id'> }
import Dexie, { type EntityTable } from "dexie";

export interface SavedVoice {
  id: number;
  name: string;
  blob: Blob;
  mimeType: string;
  size: number;
  createdAt: number;
}

export interface GenerationTake {
  blob: Blob;
  mimeType: string;
}

export interface GenerationRecord {
  id: number;
  mode: "clone" | "design";
  text: string;
  direction?: string;
  voiceLabel: string;
  format: "wav" | "mp3";
  takes: GenerationTake[];
  selectedTake: number;
  createdAt: number;
}

export const db = new Dexie("VoiceCloneStudioDB") as Dexie & {
  voices: EntityTable<SavedVoice, "id">;
  generations: EntityTable<GenerationRecord, "id">;
};

db.version(1).stores({
  voices: "++id, name, createdAt",
  generations: "++id, mode, createdAt",
});

// ---- Voices ----

export async function saveVoice(file: Blob, name: string): Promise<number> {
  return db.voices.add({
    name,
    blob: file,
    mimeType: file.type || "audio/wav",
    size: file.size,
    createdAt: Date.now(),
  });
}

export function listVoices(): Promise<SavedVoice[]> {
  return db.voices.orderBy("createdAt").reverse().toArray();
}

export function deleteVoice(id: number): Promise<void> {
  return db.voices.delete(id);
}

// ---- Generations ----

export async function saveGeneration(
  entry: Omit<GenerationRecord, "id">
): Promise<number> {
  return db.generations.add(entry);
}

export function listGenerations(limit = 8): Promise<GenerationRecord[]> {
  return db.generations.orderBy("createdAt").reverse().limit(limit).toArray();
}

/** Same as listGenerations, scoped to one mode — used by the single-purpose
 * clone/design pages so each tool's history only shows its own runs. */
export async function listGenerationsByMode(
  mode: GenerationRecord["mode"],
  limit = 8
): Promise<GenerationRecord[]> {
  const matches = await db.generations.where("mode").equals(mode).toArray();
  return matches.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function updateSelectedTake(id: number, selectedTake: number): Promise<number> {
  return db.generations.update(id, { selectedTake });
}

export function deleteGeneration(id: number): Promise<void> {
  return db.generations.delete(id);
}
