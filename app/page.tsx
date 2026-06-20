import React from "react";
import AuthGate from "@/app/components/AuthGate";
import SearchControls from "@/app/components/SearchControls";
import TrendingAnime from "@/app/components/TrendingAnime";
import DailyQuestReminderGate from "@/app/components/DailyQuestReminderGate";

export default function Home() {
    return (
        <AuthGate>
            <main className="mx-auto flex min-h-[calc(100vh-130px)] w-full max-w-6xl flex-col items-center px-4">
                <section className="w-full max-w-3xl text-center z-10 pt-20">
                    <h1
                        className="
              text-5xl sm:text-6xl
              font-bold
              tracking-tight
              text-white
              my-8
            "
                    >
                        Find your next favorite{" "}
                        <span className="text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.7)]">
              anime
            </span>
                    </h1>

                    <p className="mx-auto mb-8 max-w-2xl text-lg text-purple-100/70">
                        Discover trending series, build your collection, and compete in anime draft games.
                    </p>

                    <SearchControls />

                    <div className="mt-10 flex items-center justify-center gap-4">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-pink-500/50" />

                        <p
                            className="
                text-lg
                font-semibold
                uppercase
                tracking-[0.25em]
                text-pink-300/90
              "
                        >
                            Trending Anime
                        </p>

                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-pink-500/50" />
                    </div>
                </section>

                <div className="mt-8 w-full">
                    <TrendingAnime />
                </div>

                <DailyQuestReminderGate />
            </main>
        </AuthGate>
    );
}