"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import { getPack, observeAuth, Pack, openPack } from "@/lib/firebase";
import type { User } from "firebase/auth";
import OpenPackButton from "@/app/components/OpenPackButton";

export default function PackPage() {
    const params = useParams();
    const packId = params.packId as string;

    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [pack, setPack] = useState<Pack | null>(null);
    const [opening, setOpening] = useState(false);
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = observeAuth((firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authLoading) return;

        async function loadPack() {
            if (!user) {
                setError("You must be signed in to view this pack.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const loadedPack = await getPack(packId) as Pack | null;

                if (!loadedPack) {
                    setError("Pack not found.");
                    setPack(null);
                    return;
                }

                if (loadedPack.userId !== user.uid) {
                    setError("You do not have permission to view this pack.");
                    setPack(null);
                    return;
                }

                setPack(loadedPack as Pack);
            } catch (error: any) {
                setError(error?.message ?? "Failed to load pack.");
                setPack(null);
            } finally {
                setLoading(false);
            }
        }

        loadPack();
    }, [authLoading, user, packId]);

    useEffect(() => {
        if (pack?.rewards) {
            setRewards(pack.rewards);
        }
    }, [pack]);

    if (authLoading || loading) {
        return <Loading />;
    }

    async function handleOpenPack() {
        if (!user || !pack) return;

        try {
            setOpening(true);
            setError(null);

            const openedRewards = await openPack(pack.id, user.uid);

            setRewards(openedRewards);
            setPack({
                ...pack,
                status: "opened",
                rewards: openedRewards,
            });
        } catch (error: any) {
            setError(error?.message ?? "Failed to open pack.");
        } finally {
            setOpening(false);
        }
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-130px)] max-w-3xl flex-col items-center justify-center px-4 py-10">
            <section className="w-full rounded-3xl border border-purple-200 bg-white relative z-10 p-8 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Character Pack
                </p>

                <h1 className="mt-3 text-4xl font-bold text-purple-950">
                    {pack?.status === "opened"
                        ? "Pack Opened"
                        : "Your Pack Is Ready"}
                </h1>

                {error && (
                    <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {pack && (
                    <>
                        <div className="mx-auto mt-6 max-w-md rounded-3xl border border-purple-200 bg-purple-50 p-6">
                            <p className="text-sm font-semibold text-purple-900/60">
                                Source
                            </p>

                            <p className="mt-1 text-xl font-bold text-purple-950">
                                {pack.source === "dailyQuest"
                                    ? "Daily Quest Reward"
                                    : pack.source}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-purple-900/60">
                                Status
                            </p>

                            <p className="mt-1 text-lg font-bold text-purple-950 capitalize">
                                {pack.status}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-purple-900/60">
                                Earned
                            </p>

                            <p className="mt-1 text-purple-900">
                                {pack.date}
                            </p>
                        </div>

                        {pack.status === "unopened" && (
                            <OpenPackButton
                                onClick={handleOpenPack}
                                opening={opening}
                            />
                        )}

                        {pack.status === "opened" && rewards.length === 0 && (
                            <p className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-900">
                                This pack has already been opened.
                            </p>
                        )}

                        {rewards.length > 0 && (
                            <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
                                {rewards.map((reward, index) => (
                                    <div
                                        key={`${reward.characterId}-${index}`}
                                        className="relative z-10 overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm"
                                    >
                                        {reward.imageUrl && (
                                            <img
                                                src={reward.imageUrl}
                                                alt={reward.name}
                                                className="h-56 w-full object-cover"
                                            />
                                        )}

                                        <div className="p-4 text-left">
                                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase text-purple-900">
                                                {reward.rarity}
                                            </span>

                                            <h3 className="mt-3 font-bold text-purple-950">
                                                {reward.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-purple-900/60">
                                                From {reward.animeTitle ?? "Unknown Anime"}
                                            </p>

                                            <p className="mt-3 text-sm font-semibold text-purple-900">
                                                Power: {reward.powerLevel}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-purple-900/60 transition hover:text-purple-900"
                    >
                        Back to home
                    </Link>
                </div>
            </section>
        </main>

    );
}