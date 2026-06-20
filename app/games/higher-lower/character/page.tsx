"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import {
    claimHigherLowerPack,
    getHigherLowerProgress,
    observeAuth,
    saveHigherLowerProgress,
} from "@/lib/firebase";
import type { User } from "firebase/auth";
import RoundResultOverlay from "@/app/components/RoundResultOverlay";

type CharacterCard = {
    mal_id: number;
    name: string;
    imageUrl: string;
    favorites: number;
    animeId: number;
    animeTitle: string;
};

export default function CharacterHigherLowerPage() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [leftCharacter, setLeftCharacter] = useState<CharacterCard | null>(null);
    const [rightCharacter, setRightCharacter] = useState<CharacterCard | null>(null);
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

        const currentUser = user;

        async function loadProgress() {
            const progress = await getHigherLowerProgress(
                currentUser.uid,
                today
            );

            if (progress) {
                setClaimedMilestones(progress.claimedMilestones ?? []);
            }
        }

        loadProgress();
    }, [authLoading, user, today]);

    async function getRandomCharacter() {
        const res = await fetch("/api/jikan/higher-lower-character", {
            cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json?.error ?? "Failed to load character.");
        }

        return json.data as CharacterCard;
    }

    async function loadGame() {
        try {
            setLoading(true);
            setError(null);
            setRoundResult(null);
            setRevealing(false);
            setGuessing(false);
            setShowRoundOverlay(false)

            const first = await getRandomCharacter();
            let second = await getRandomCharacter();

            while (second.mal_id === first.mal_id) {
                second = await getRandomCharacter();
            }

            setLeftCharacter(first);
            setRightCharacter(second);
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
        if (
            !leftCharacter ||
            !rightCharacter ||
            guessing ||
            roundResult === "wrong"
        ) {
            return;
        }

        setGuessing(true);
        setRevealing(true);

        const correct =
            choice === "higher"
                ? rightCharacter.favorites >= leftCharacter.favorites
                : rightCharacter.favorites <= leftCharacter.favorites;

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

        let nextRight = await getRandomCharacter();

        while (nextRight.mal_id === rightCharacter.mal_id) {
            nextRight = await getRandomCharacter();
        }

        setLeftCharacter(rightCharacter);
        setRightCharacter(nextRight);

        setRoundResult(null);
        setRevealing(false);
        setGuessing(false);

        await new Promise((resolve) => setTimeout(resolve, 150));

        setTransitioningRound(false);
        setShowRoundOverlay(false);
    }

    async function handleClaimPack(milestone: number) {
        if (!user) return;

        await claimHigherLowerPack(
            user.uid,
            today,
            milestone
        );

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

    function CharacterCardSkeleton() {
        return (
            <div className="relative z-10 min-h-[560px] overflow-hidden rounded-3xl border border-purple-200 bg-purple-100 shadow-sm">
                <div className="absolute inset-0 animate-pulse bg-purple-200/60" />

                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                    <div className="h-10 w-2/3 animate-pulse rounded-xl bg-white/50" />
                    <div className="mt-3 h-5 w-1/2 animate-pulse rounded-xl bg-white/40" />
                    <div className="mt-5 h-10 w-40 animate-pulse rounded-2xl bg-white/40" />
                </div>
            </div>
        );
    }

    return (
        <main className="relative mx-auto min-h-[calc(100vh-130px)] max-w-7xl px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            <section className="relative z-10 mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Higher or Lower
                </p>

                <h1 className="mt-3 text-5xl font-bold text-white">
                    Character Popularity
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-100/70">
                    Choose which character has more favorites on MAL.
                </p>

                <div className="mt-5 inline-flex rounded-2xl border border-pink-500/20 bg-pink-500/10 px-5 py-3 text-xl font-bold text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.12)] backdrop-blur-xl">
                    Streak: {streak}
                </div>
            </section>

            {error && (
                <p className="relative z-10 mx-auto mb-6 max-w-xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-red-300 backdrop-blur-xl">
                    {error}
                </p>
            )}

            {nextMilestone && (
                <div className="relative z-10 mx-auto mb-6 max-w-xl rounded-3xl border border-green-400/20 bg-green-500/10 p-5 text-center shadow-[0_0_20px_rgba(16,185,129,0.12)] backdrop-blur-xl">
                    <p className="font-semibold text-green-200">
                        You reached a {nextMilestone} streak! Claim your pack reward.
                    </p>

                    <button
                        type="button"
                        onClick={() => handleClaimPack(nextMilestone)}
                        className="
                    mt-4 rounded-2xl
                    border border-green-400/20
                    bg-green-500/10
                    px-5 py-3
                    font-semibold
                    text-green-200
                    transition
                    hover:bg-green-500/20
                    hover:cursor-pointer
                    "
                    >
                        Claim Pack
                    </button>
                </div>
            )}

            <section className="relative z-10 grid w-full gap-6 lg:grid-cols-2">
                {transitioningRound ? (
                    <>
                        <CharacterCardSkeleton />
                        <CharacterCardSkeleton />
                    </>
                ) : (
                    <>
                        {leftCharacter && (
                            <div
                                className="
                            relative z-10 min-h-[560px] w-full overflow-hidden
                            rounded-3xl
                            border border-pink-500/20
                            bg-black/40
                            shadow-[0_0_25px_rgba(236,72,153,0.08)]
                            "
                            >
                                <Image
                                    src={leftCharacter.imageUrl}
                                    alt={leftCharacter.name}
                                    fill
                                    className="object-cover object-[center_20%]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-pink-200/60">
                                        Current Character
                                    </p>

                                    <h2 className="mt-3 text-4xl font-bold text-white">
                                        {leftCharacter.name}
                                    </h2>

                                    {leftCharacter.animeTitle && (
                                        <p className="mt-2 text-sm font-semibold text-purple-100/70">
                                            From {leftCharacter.animeTitle}
                                        </p>
                                    )}

                                    <div className="mt-4 inline-flex w-fit rounded-2xl border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm font-bold text-pink-200 backdrop-blur-sm">
                                        Favorites: {leftCharacter.favorites}
                                    </div>
                                </div>
                            </div>
                        )}

                        {rightCharacter && (
                            <div
                                className="
                            relative z-10 min-h-[560px] w-full overflow-hidden
                            rounded-3xl
                            border border-pink-500/20
                            bg-black/40
                            shadow-[0_0_25px_rgba(236,72,153,0.08)]
                            "
                            >
                                <Image
                                    src={rightCharacter.imageUrl}
                                    alt={rightCharacter.name}
                                    fill
                                    className="object-cover object-[center_20%]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                                    <p className="text-xs font-bold uppercase tracking-widest text-pink-200/60">
                                        New Character
                                    </p>

                                    <h2 className="mt-3 text-4xl font-bold text-white">
                                        {rightCharacter.name}
                                    </h2>

                                    {rightCharacter.animeTitle && (
                                        <p className="mt-2 text-sm font-semibold text-purple-100/70">
                                            From {rightCharacter.animeTitle}
                                        </p>
                                    )}

                                    {revealing ? (
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <span className="rounded-2xl border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm font-bold text-pink-200 backdrop-blur-sm">
                                            Favorites: {rightCharacter.favorites}
                                        </span>
                                        </div>
                                    ) : (
                                        <div className="mt-6 grid w-full grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleGuess("higher")}
                                                disabled={guessing}
                                                className="
                                            rounded-2xl
                                            border border-green-400/20
                                            bg-green-500/10
                                            px-5 py-3
                                            font-bold
                                            text-green-200
                                            backdrop-blur-sm
                                            transition
                                            hover:bg-green-500/20
                                            hover:cursor-pointer
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                            "
                                            >
                                                Higher
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleGuess("lower")}
                                                disabled={guessing}
                                                className="
                                            rounded-2xl
                                            border border-red-400/20
                                            bg-red-500/10
                                            px-5 py-3
                                            font-bold
                                            text-red-200
                                            backdrop-blur-sm
                                            transition
                                            hover:bg-red-500/20
                                            hover:cursor-pointer
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                            "
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
                        className="
                    rounded-2xl
                    border border-pink-500/20
                    bg-pink-500/10
                    px-5 py-3
                    font-semibold
                    text-pink-200
                    transition
                    hover:bg-pink-500/20
                    hover:cursor-pointer
                    "
                    >
                        Play Again
                    </button>
                </div>
            )}

            <div className="relative z-10 mt-8 text-center">
                <Link
                    href="/games/higher-lower"
                    className="text-sm font-medium text-pink-300/70 transition hover:text-pink-200"
                >
                    Back to modes
                </Link>
            </div>

            <RoundResultOverlay
                result={roundResult}
                show={showRoundOverlay}
            />
        </main>
    );
}