import type { Metadata, Viewport } from "next";
import { PWARegistration } from "@/components/PWAExperience";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyDict – Multilingual Dictionary",
  description:
    "Fast multilingual dictionary with English, French, Spanish, Twi & Ewe. AI explanations, pronunciation, and offline-friendly PWA.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PolyDict",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#101412" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
