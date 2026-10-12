import type { Metadata } from "next";
import { Bricolage_Grotesque, Silkscreen } from "next/font/google";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const body = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const pixel = Silkscreen({ variable: "--font-silkscreen", weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Meme'd", template: "%s · Meme'd" },
  description: "Run creator campaigns with milestone payouts that never exceed your budget.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${body.variable} ${pixel.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
