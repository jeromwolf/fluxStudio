import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider, AuthInitializer } from "@/core/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flux Studio - Animation & Audio Creator",
  description: "Create stunning geometric network animations with synchronized audio effects",
  keywords: "animation, audio, motion graphics, web animation, sound design",
  authors: [{ name: "Flux Studio Team" }],
  openGraph: {
    title: "Flux Studio",
    description: "Professional web-based animation and audio creation platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AuthInitializer />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
