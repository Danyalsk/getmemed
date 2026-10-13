import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Silkscreen } from "next/font/google";

import { Providers } from "@/components/providers";
import { ServerWakeNotice } from "@/components/server-wake-notice";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const body = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const pixel = Silkscreen({ variable: "--font-silkscreen", weight: ["400", "700"], subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SHARE_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Meme'd: pay creators for the reach they actually deliver",
};
const DESCRIPTION = "Run creator campaigns with milestone payouts that track real views and never exceed your budget.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Meme'd · Creator campaigns, paid on performance", template: "%s · Meme'd" },
  description: DESCRIPTION,
  applicationName: "Meme'd",
  openGraph: {
    type: "website",
    siteName: "Meme'd",
    title: "Meme'd · Creator campaigns, paid on performance",
    description: DESCRIPTION,
    locale: "en_IN",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meme'd · Creator campaigns, paid on performance",
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#131313",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${body.variable} ${pixel.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <ServerWakeNotice />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
