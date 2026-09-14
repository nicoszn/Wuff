import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AdSenseLoader from "@/components/ads/AdSenseLoader";
import ConsentBanner from "@/components/ads/ConsentBanner";

export const metadata: Metadata = {
  title: "Wuff Voice Desk — Free AI Voice Cloning & Voice Design",
  description: "Free AI voice tools: clone a voice from a short sample, or design a new one from a text description. No signup, no watermark — generate and download in seconds.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdSenseLoader />
        <Providers>
          {children}
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  );
};
