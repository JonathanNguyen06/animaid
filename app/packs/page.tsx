"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import { getUserPacks, getUserProfile, observeAuth } from "@/lib/firebase";
import type { User } from "firebase/auth";

type Pack = {
    id: string;
    userId: string;
    source: string;
    date: string;
    status: "unopened" | "opened";
};

export default function PacksPage() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [loading, setLoading] = useState(true);
    const [dailyStreak, setDailyStreak] = useState(0);

    useEffect(() => {
        const unsubscribe = observeAuth((firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authLoading) return;

        async function loadPacks() {
            if (!user) {
                setLoading(false);
                return;
            }

            const userPacks = await getUserPacks(user.uid);
            setPacks(userPacks as Pack[]);
            const profile = await getUserProfile(user.uid);
            setDailyStreak(profile?.dailyStreak ?? 0);
            setLoading(false);
        }

        loadPacks();
    }, [authLoading, user]);

    if (authLoading || loading) {
        return <Loading />;
    }

    return (
        <main className="relative mx-auto min-h-[calc(100vh-130px)] max-w-6xl px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            <section
                className="
            relative z-10
            rounded-3xl
            border border-pink-500/20
            bg-black/40
            p-8
            backdrop-blur-xl
            shadow-[0_0_25px_rgba(236,72,153,0.08)]
            "
            >
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Packs
                </p>

                <h1 className="mt-3 text-4xl font-bold text-white">
                    Your Character Packs
                </h1>

                <div
                    className="
                mt-4 inline-flex items-center gap-3
                rounded-2xl
                border border-orange-400/20
                bg-orange-500/10
                px-4 py-2
                backdrop-blur-xl
                shadow-[0_0_20px_rgba(251,146,60,0.12)]
                "
                >
                <span className="text-3xl drop-shadow-[0_0_10px_rgba(251,146,60,0.45)]">
                    🔥
                </span>

                    <div>
                        <p className="text-2xl font-bold leading-none text-orange-200">
                            {dailyStreak}
                        </p>

                        <p className="text-xs font-semibold uppercase tracking-widest text-orange-200/60">
                            Streak
                        </p>
                    </div>
                </div>

                <p className="mt-3 text-purple-100/70">
                    View and open the character packs you have earned.
                </p>

                {!user && (
                    <p
                        className="
                    mt-8 rounded-2xl
                    border border-red-500/20
                    bg-red-500/10
                    px-4 py-3
                    text-red-300
                    backdrop-blur-xl
                    "
                    >
                        You must be signed in to view your packs.
                    </p>
                )}

                {user && packs.length === 0 && (
                    <div
                        className="
                    mt-8 rounded-2xl
                    border border-pink-500/20
                    bg-white/[0.03]
                    p-6
                    text-purple-100/70
                    backdrop-blur-xl
                    "
                    >
                        You do not have any packs yet.
                    </div>
                )}

                {user && packs.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {packs.map((pack) => (
                            <Link
                                key={pack.id}
                                href={`/packs/${pack.id}`}
                                className="
                            group
                            rounded-3xl
                            border border-pink-500/20
                            bg-black/40
                            p-5
                            backdrop-blur-xl
                            shadow-[0_0_20px_rgba(236,72,153,0.08)]
                            transition
                            hover:-translate-y-1
                            hover:border-pink-400/40
                            hover:bg-pink-500/10
                            hover:shadow-[0_0_28px_rgba(236,72,153,0.16)]
                            "
                            >
                                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                    {pack.source === "dailyQuest"
                                        ? "Daily Quest"
                                        : pack.source === "higherLower"
                                            ? "Higher or Lower"
                                            : pack.source === "exchange"
                                                ? "Character Exchange"
                                                : pack.source}
                                </p>

                                <h2 className="mt-3 text-xl font-bold text-white transition group-hover:text-pink-100">
                                    Character Pack
                                </h2>

                                <p className="mt-2 text-sm text-purple-100/60">
                                    Earned {pack.date}
                                </p>

                                <span
                                    className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                                        pack.status === "opened"
                                            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                                            : "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
                                    }`}
                                >
                                {pack.status}
                            </span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}