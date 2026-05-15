import React from "react";
import AuthGate from "@/app/components/AuthGate";
import Searchbar from "@/app/components/Searchbar";
import EpisodeSlider from "@/app/components/EpisodeSlider";
import SearchControls from "@/app/components/SearchControls";

export default function Home() {
  return (
      <AuthGate>
      <main className="mx-auto flex min-h-[calc(100vh-130px)] w-full max-w-6xl flex-col items-center justify-center px-4">
      <section className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-purple-950 sm:text-5xl">
          Find your next favorite anime
        </h1>
        <p className="mx-auto my-6 max-w-2xl text-base text-purple-900/70 sm:text-lg">
          Search with a prompt or your interests, and we’ll recommend titles that match your vibe.
        </p>
        <SearchControls />
      </section>
        </main>
      </AuthGate>
  );
}
