"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import RoundResultOverlay from "@/app/components/RoundResultOverlay";
import {
    claimHigherLowerPack,
    getHigherLowerProgress,
    observeAuth,
    saveHigherLowerProgress,
} from "@/lib/firebase";
import type { User } from "firebase/auth";

type AnimeCard = {
    mal_id: number;
    title: string;
    imageUrl: string;
    score: number;
    popularity: number;
};

export default function AnimePopularityHigherLowerPage() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [leftAnime, setLeftAnime] = useState<AnimeCard | null>(null);
    const [rightAnime, setRightAnime] = useState<AnimeCard | null>(null);
    const [streak, setStreak] = useState(0);
    const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [guessing, setGuessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roundResult, setRoundResult] = useState<"correct" | "wrong" | null>(null);
    const [revealing, setRevealing] = useState(false);
    const [showRoundOverlay, setShowRoundOverlay] = useState(false);
    const [transitioningRound, setTransitioningRound] = useState(false);

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        const unsubscribe = observeAuth((firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authLoading || !user) return;

        async function loadProgress() {
            const progress = await getHigherLowerProgress(user!.uid, today);

            if (progress) {
                setClaimedMilestones(progress.claimedMilestones ?? []);
            }
        }

        loadProgress();
    }, [authLoading, user, today]);

    async function getRandomAnime() {
        const res = await fetch("/api/jikan/higher-lower-anime", {
            cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json?.error ?? "Failed to load anime.");
        }

        return json.data as AnimeCard;
    }

    async function loadGame() {
        try {
            setLoading(true);
            setError(null);
            setRoundResult(null);
            setRevealing(false);
            setGuessing(false);
            setShowRoundOverlay(false);

            const first = await getRandomAnime();
            let second = await getRandomAnime();

            while (second.mal_id === first.mal_id) {
                second = await getRandomAnime();
            }

            setLeftAnime(first);
            setRightAnime(second);
        } catch (error: any) {
            setError(error?.message ?? "Failed to load game.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (authLoading) return;

        loadGame();
    }, [authLoading]);

    async function handleGuess(choice: "higher" | "lower") {
        if (!leftAnime || !rightAnime || guessing || roundResult === "wrong") {
            return;
        }

        setGuessing(true);
        setRevealing(true);

        const correct =
            choice === "higher"
                ? rightAnime.popularity <= leftAnime.popularity
                : rightAnime.popularity >= leftAnime.popularity;

        setRoundResult(correct ? "correct" : "wrong");
        setShowRoundOverlay(true);

        await new Promise((resolve) => setTimeout(resolve, 1200));

        if (!correct) {
            setStreak(0);
            setGuessing(false);

            setTimeout(() => {
                setShowRoundOverlay(false);
            }, 700);

            return;
        }

        const nextStreak = streak + 1;
        setStreak(nextStreak);

        if (user) {
            await saveHigherLowerProgress(user.uid, today, nextStreak);
        }

        setTransitioningRound(true);

        let nextRight = await getRandomAnime();

        while (nextRight.mal_id === rightAnime.mal_id) {
            nextRight = await getRandomAnime();
        }

        setLeftAnime(rightAnime);
        setRightAnime(nextRight);

        setRoundResult(null);
        setRevealing(false);
        setGuessing(false);

        await new Promise((resolve) => setTimeout(resolve, 150));

        setTransitioningRound(false);
        setShowRoundOverlay(false);
    }

    async function handleClaimPack(milestone: number) {
        if (!user) return;

        await claimHigherLowerPack(user.uid, today, milestone);

        setClaimedMilestones((current) => [...current, milestone]);
    }

    if (authLoading || loading) {
        return <Loading />;
    }

    const nextMilestone = [5, 10, 15, 20].find(
        (milestone) =>
            streak >= milestone &&
            !claimedMilestones.includes(milestone)
    );

    function AnimeCardSkeleton() {
        return (
            <div className="relative z-10 min-h-[560px] overflow-hidden rounded-3xl border border-purple-200 bg-purple-100 shadow-sm">
                <div className="absolute inset-0 animate-pulse bg-purple-200/60" />

                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                    <div className="h-10 w-2/3 animate-pulse rounded-xl bg-white/50" />
                    <div className="mt-5 h-10 w-40 animate-pulse rounded-2xl bg-white/40" />
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-7xl px-4 py-10">
            <section className="relative z-10 mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Higher or Lower
                </p>

                <h1 className="mt-3 text-5xl font-bold text-purple-950">
                    Anime Popularity
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-900/70">
                    Choose if the new anime is higher or lower in MAL popularity.
                </p>

                <div className="mt-5 inline-flex rounded-2xl border border-purple-200 bg-white px-5 py-3 text-xl font-bold text-purple-950 shadow-sm">
                    Streak: {streak}
                </div>
            </section>

            {error && (
                <p className="relative z-10 mx-auto mb-6 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">
                    {error}
                </p>
            )}

            {nextMilestone && (
                <div className="relative z-10 mx-auto mb-6 max-w-xl rounded-3xl border border-green-200 bg-green-50 p-5 text-center shadow-sm">
                    <p className="font-semibold text-green-800">
                        You reached a {nextMilestone} streak! Claim your pack reward.
                    </p>

                    <button
                        type="button"
                        onClick={() => handleClaimPack(nextMilestone)}
                        className="mt-4 rounded-2xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 hover:cursor-pointer"
                    >
                        Claim Pack
                    </button>
                </div>
            )}

            <section className="relative z-10 grid w-full gap-6 lg:grid-cols-2">
                {transitioningRound ? (
                    <>
                        <AnimeCardSkeleton />
                        <AnimeCardSkeleton />
                    </>
                ) : (
                    <>
                        {leftAnime && (
                            <div className="relative z-10 min-h-[560px] w-full overflow-hidden rounded-3xl border border-purple-200 bg-white text-left shadow-sm">
                                <Image
                                    src={leftAnime.imageUrl}
                                    alt={leftAnime.title}
                                    fill
                                    className="object-cover object-top"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/35 to-transparent" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                                        Current Anime
                                    </p>

                                    <h2 className="mt-3 text-4xl font-bold text-white">
                                        {leftAnime.title}
                                    </h2>

                                    <div className="mt-4 inline-flex w-fit rounded-2xl border border-white/20 bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                                        Popularity Rank: #{leftAnime.popularity}
                                    </div>
                                </div>
                            </div>
                        )}

                        {rightAnime && (
                            <div className="relative z-10 min-h-[560px] w-full overflow-hidden rounded-3xl border border-purple-200 bg-white text-left shadow-sm">
                                <Image
                                    src={rightAnime.imageUrl}
                                    alt={rightAnime.title}
                                    fill
                                    className="object-cover object-top"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/35 to-transparent" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                                        New Anime
                                    </p>

                                    <h2 className="mt-3 text-4xl font-bold text-white">
                                        {rightAnime.title}
                                    </h2>

                                    {revealing ? (
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <span className="rounded-2xl border border-white/20 bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                                                Popularity Rank: #{rightAnime.popularity}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-6 grid w-full grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleGuess("higher")}
                                                disabled={guessing}
                                                className="rounded-2xl border border-green-200/40 bg-green-400/20 px-5 py-3 font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-green-400/30 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Higher
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleGuess("lower")}
                                                disabled={guessing}
                                                className="rounded-2xl border border-red-200/40 bg-red-400/20 px-5 py-3 font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-red-400/30 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Lower
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            {roundResult === "wrong" && (
                <div className="relative z-10 mt-6 text-center">
                    <button
                        type="button"
                        onClick={loadGame}
                        className="rounded-2xl bg-purple-900 px-5 py-3 font-semibold text-white transition hover:bg-purple-800 hover:cursor-pointer"
                    >
                        Play Again
                    </button>
                </div>
            )}

            <div className="relative z-10 mt-8 text-center">
                <Link
                    href="/games/higher-lower"
                    className="text-sm font-medium text-purple-900/60 transition hover:text-purple-900"
                >
                    Back to modes
                </Link>
            </div>

            <RoundResultOverlay result={roundResult} show={showRoundOverlay} />
        </main>
    );
}