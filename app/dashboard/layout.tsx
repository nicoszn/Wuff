import type { Metadata } from "next";

// dashboard/page.tsx is a client component, which can't export metadata
// directly — this segment-level layout carries it instead. Keeps the
// unplugged trading dashboard functional but out of Google's index, since
// it's unrelated to the voice-clone/voice-design product surface.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
