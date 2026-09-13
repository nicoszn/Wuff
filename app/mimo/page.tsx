import VoiceCloneStudio from "@/components/VoiceCloneStudio";

export const metadata = {
  title: "Mimo — Voice Clone Studio",
  description: "Clone and synthesize voices with Mimo.",
};

export default function MimoPage() {
  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      <VoiceCloneStudio />
    </main>
  );
}
