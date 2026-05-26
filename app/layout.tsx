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
        className={`${josefinSans.variable} ${geistMono.variable} antialiased min-h-screen text-purple-950`}
      >
          {/* Global navigation */}
          <Navbar />
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              {Array.from({ length: 80 }).map((_, i) => (
                  <HeartIcon
                      key={i}
                      className="absolute text-purple-900/10"
                      style={{
                          width: `${20 + (i % 4) * 12}px`,
                          height: `${20 + (i % 4) * 12}px`,
                          top: `${(i * 17) % 100}%`,
                          left: `${(i * 13) % 100}%`,
                          transform: `rotate(${(i * 23) % 360}deg)`,
                      }}
                  />
              ))}
          </div>
          {children}
      </body>
    </html>
  );
}
