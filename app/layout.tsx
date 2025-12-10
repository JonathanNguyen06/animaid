import type { Metadata } from "next";
import { Josefin_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";

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
        {children}
      </body>
    </html>
  );
}
