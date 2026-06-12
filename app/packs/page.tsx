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
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-6xl px-4 py-10">
            <section className="rounded-3xl border border-purple-200 bg-white relative z-10 p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Packs
                </p>

                <h1 className="mt-3 text-4xl font-bold text-purple-950">
                    Your Character Packs
                </h1>

                <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 px-4 py-2 shadow-sm">
                    <span className="text-3xl">🔥</span>

                    <div>
                        <p className="text-2xl font-bold leading-none text-orange-700">
                            {dailyStreak}
                        </p>

                        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600/70">
                            Streak
                        </p>
                    </div>
                </div>

                <p className="mt-3 text-purple-900/70">
                    View and open the character packs you have earned.
                </p>

                {!user && (
                    <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        You must be signed in to view your packs.
                    </p>
                )}

                {user && packs.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6 text-purple-900/70">
                        You do not have any packs yet.
                    </div>
                )}

                {user && packs.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {packs.map((pack) => (
                            <Link
                                key={pack.id}
                                href={`/packs/${pack.id}`}
                                className="rounded-3xl border border-purple-200 bg-purple-50 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                            >
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                    {pack.source === "dailyQuest"
                                        ? "Daily Quest"
                                        : pack.source === "higherLower"
                                            ? "Higher or Lower"
                                            : pack.source === "exchange"
                                                ? "Character Exchange"
                                                : pack.source}
                                </p>

                                <h2 className="mt-3 text-xl font-bold text-purple-950">
                                    Character Pack
                                </h2>

                                <p className="mt-2 text-sm text-purple-900/60">
                                    Earned {pack.date}
                                </p>

                                <span
                                    className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                        pack.status === "opened"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
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