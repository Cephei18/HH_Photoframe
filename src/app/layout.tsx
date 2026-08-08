import type { Metadata, Viewport } from "next";
import { EVENT } from "@/lib/constants";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

const title = "The Signal Pass — Hacker House Goa 2026";
const description =
  "Upload a photo. Get your official HH Goa 2026 builder credential — a Signal Pass, tiered, stamped, and ready to post.";

export const metadata: Metadata = {
  // Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL in production
  // so absolute OG/Twitter image URLs resolve to the real deployed domain.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "The Signal Pass",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  other: {
    hashtag: EVENT.hashtag,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece7d9" },
    { media: "(prefers-color-scheme: dark)", color: "#15130e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
