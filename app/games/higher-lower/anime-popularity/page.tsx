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
            <div className="relative z-10 min-h-[560px] overflow-hidden rounded-3xl border border-pink-500/20 bg-black/40 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                <div className="absolute inset-0 animate-pulse bg-pink-500/10" />
                <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-pink-500/10 blur-[80px]" />

                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                    <div className="h-10 w-2/3 animate-pulse rounded-xl bg-white/10" />
                    <div className="mt-5 h-10 w-40 animate-pulse rounded-2xl bg-pink-500/10" />
                </div>
            </div>
        );
    }

    return (
        <main className="relative mx-auto min-h-[calc(100vh-130px)] max-w-7xl px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute right-10 top-80 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
                <div className="absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
            </div>

            <section className="relative z-10 mb-8 rounded-3xl border border-pink-500/20 bg-black/40 p-8 text-center shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Higher or Lower
                </p>

                <h1 className="mt-3 text-5xl font-bold text-white drop-shadow-[0_0_18px_rgba(236,72,153,0.22)]">
                    Anime Popularity
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-100/70">
                    Choose if the new anime is more or less popular on MyAnimeList.
                </p>

                <div className="mt-5 inline-flex rounded-2xl border border-pink-500/20 bg-pink-500/10 px-5 py-3 text-xl font-bold text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.12)] backdrop-blur-xl">
                    Streak: {streak}
                </div>
            </section>

            {error && (
                <p className="relative z-10 mx-auto mb-6 max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-red-300 backdrop-blur-xl">
                    {error}
                </p>
            )}

            {nextMilestone && (
                <div className="relative z-10 mx-auto mb-6 max-w-xl rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-center shadow-[0_0_24px_rgba(16,185,129,0.12)] backdrop-blur-xl">
                    <p className="font-semibold text-emerald-200">
                        You reached a {nextMilestone} streak! Claim your pack reward.
                    </p>

                    <button
                        type="button"
                        onClick={() => handleClaimPack(nextMilestone)}
                        className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/20 px-5 py-3 font-bold text-emerald-100 transition hover:bg-emerald-400/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.18)] hover:cursor-pointer"
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
                            <div className="group relative z-10 min-h-[560px] w-full overflow-hidden rounded-3xl border border-pink-500/20 bg-black/40 text-left shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-pink-400/40 hover:shadow-[0_0_32px_rgba(236,72,153,0.16)]">
                                <Image
                                    src={leftAnime.imageUrl}
                                    alt={leftAnime.title}
                                    fill
                                    className="object-cover object-top transition duration-500 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                                <div className="absolute inset-0 bg-pink-500/5" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-pink-300/70">
                                        Current Anime
                                    </p>

                                    <h2 className="mt-3 text-4xl font-bold text-white drop-shadow-[0_0_14px_rgba(236,72,153,0.25)]">
                                        {leftAnime.title}
                                    </h2>

                                    <div className="mt-4 inline-flex w-fit rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-[0_0_18px_rgba(255,255,255,0.08)] backdrop-blur-xl">
                                        Popularity: #{leftAnime.popularity}
                                    </div>
                                </div>
                            </div>
                        )}

                        {rightAnime && (
                            <div className="group relative z-10 min-h-[560px] w-full overflow-hidden rounded-3xl border border-pink-500/20 bg-black/40 text-left shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-pink-400/40 hover:shadow-[0_0_32px_rgba(236,72,153,0.16)]">
                                <Image
                                    src={rightAnime.imageUrl}
                                    alt={rightAnime.title}
                                    fill
                                    className="object-cover object-top transition duration-500 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                                <div className="absolute inset-0 bg-fuchsia-500/5" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-pink-300/70">
                                        New Anime
                                    </p>

                                    <h2 className="mt-3 text-4xl font-bold text-white drop-shadow-[0_0_14px_rgba(236,72,153,0.25)]">
                                        {rightAnime.title}
                                    </h2>

                                    {revealing ? (
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <span className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl">
                                                Popularity: #{rightAnime.popularity}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-6 grid w-full grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleGuess("higher")}
                                                disabled={guessing}
                                                className="rounded-2xl border border-emerald-300/30 bg-emerald-400/20 px-5 py-3 font-bold text-emerald-100 backdrop-blur-xl transition hover:bg-emerald-400/30 hover:shadow-[0_0_20px_rgba(52,211,153,0.18)] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Higher
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleGuess("lower")}
                                                disabled={guessing}
                                                className="rounded-2xl border border-red-300/30 bg-red-400/20 px-5 py-3 font-bold text-red-100 backdrop-blur-xl transition hover:bg-red-400/30 hover:shadow-[0_0_20px_rgba(248,113,113,0.18)] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="rounded-2xl border border-pink-500/30 bg-pink-500/10 px-5 py-3 font-bold text-pink-100 backdrop-blur-xl transition hover:bg-pink-500/20 hover:shadow-[0_0_24px_rgba(236,72,153,0.18)] hover:cursor-pointer"
                    >
                        Play Again
                    </button>
                </div>
            )}

            <div className="relative z-10 mt-8 text-center">
                <Link
                    href="/games/higher-lower"
                    className="text-sm font-semibold text-pink-300/60 transition hover:text-pink-200"
                >
                    Back to modes
                </Link>
            </div>

            <RoundResultOverlay result={roundResult} show={showRoundOverlay} />
        </main>
    );
}