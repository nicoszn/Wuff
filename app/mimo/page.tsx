import VoiceCloneStudio from "@/components/VoiceCloneStudio";

export const metadata = {
  title: "Mimo — Voice Clone Studio",
  description: "Clone and synthesize voices with Mimo.",
};

export default function MimoPage() {
  return (
    <main >
      <VoiceCloneStudio />
    </main>
  );
}
