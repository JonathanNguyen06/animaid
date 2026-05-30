import React from "react";
import AuthGate from "@/app/components/AuthGate";
import SearchControls from "@/app/components/SearchControls";
import TrendingAnime from "@/app/components/TrendingAnime";
import DailyQuestReminder from "@/app/components/DailyQuestReminder";

export default function Home() {
  return (
      <AuthGate>
      <main className="mx-auto flex min-h-[calc(100vh-130px)] w-full max-w-6xl flex-col items-center justify-center px-4">
      <section className="w-full max-w-3xl text-center z-10">
        <h1 className="text-4xl font-bold tracking-tight text-purple-950 sm:text-5xl my-8">
          Find your next favorite anime
        </h1>
        <SearchControls />
          <p className="mx-auto my-6 max-w-2xl text-base text-purple-900/70 sm:text-lg md:text-2xl font-bold">Trending Anime</p>
      </section>
          <TrendingAnime />
          <DailyQuestReminder />
        </main>
      </AuthGate>
  );
}
