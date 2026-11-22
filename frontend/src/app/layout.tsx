/* eslint-disable @next/next/no-sync-scripts */
/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scanbeforeeat.onrender.com";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ScanBeforeEat — AI Food Ingredient Scanner",
    template: "%s | ScanBeforeEat",
  },
  description:
    "Scan any food product barcode or ingredient list. Get instant AI-powered analysis of additives, allergens, ultra-processed markers, and a transparent health score.",
  keywords: [
    "food ingredient scanner",
    "food additive checker",
    "barcode scanner for food",
    "ultra processed food scanner",
    "UPF checker",
    "E number checker",
    "allergen scanner",
    "food safety app",
    "ingredient analysis",
    "clean label scanner",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ScanBeforeEat",
    title: "ScanBeforeEat — AI Food Ingredient Scanner",
    description:
      "Scan any food product. Get instant AI analysis of additives, allergens, and ultra-processed markers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanBeforeEat — AI Food Ingredient Scanner",
    description:
      "Scan any food product. Get instant AI analysis of additives, allergens, and ultra-processed markers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: siteUrl },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "nuIuORa0PeSDcS_sze1GxUt1ET5hyhVBU5Vh3x1HWrc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-zinc-900 font-body antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
