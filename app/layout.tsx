import type { Metadata } from "next";
import { Josefin_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import {HeartIcon} from "@heroicons/react/24/outline";
import React from "react";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Animaid",
  description: "Discover anime and manga tailored to your tastes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body
        className={`${josefinSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#0a0a0f] text-purple-100 relative overflow-x-hidden`}
    >
    {/* Background gradients */}
    <div className="fixed inset-0 -z-20 bg-[#0a0a0f]" />

    <div
        className="fixed inset-0 -z-10"
        style={{
            background: `
        radial-gradient(circle at 20% 20%, rgba(236,72,153,0.12) 0%, transparent 30%),
        radial-gradient(circle at 80% 30%, rgba(168,85,247,0.12) 0%, transparent 35%),
        radial-gradient(circle at 50% 80%, rgba(59,130,246,0.08) 0%, transparent 40%)
      `,
        }}
    />

    {/* Neon hearts */}
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
            <HeartIcon
                key={i}
                className="absolute text-pink-400/20 blur-[1px]"
                style={{
                    width: `${20 + (i % 4) * 12}px`,
                    height: `${20 + (i % 4) * 12}px`,
                    top: `${(i * 17) % 100}%`,
                    left: `${(i * 13) % 100}%`,
                    transform: `rotate(${(i * 23) % 360}deg)`,
                    filter: `
            drop-shadow(0 0 6px rgba(236,72,153,0.8))
            drop-shadow(0 0 12px rgba(236,72,153,0.5))
          `,
                }}
            />
        ))}
    </div>

    <Navbar />

    <main className="relative">
        {children}
    </main>
    </body>
    </html>
  );
}
