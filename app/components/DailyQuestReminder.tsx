"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { observeAuth } from "@/lib/firebase";
import type { User } from "firebase/auth";

export default function DailyQuestReminder() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = observeAuth(setUser);
        return () => unsubscribe();
    }, []);

    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2">
            <Link
                href={user ? "/daily" : "/signup"}
                className="block rounded-3xl border border-purple-200 bg-white/90 p-4 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Daily Quest
                </p>

                <h3 className="mt-2 text-lg font-bold text-purple-950">
                    Anime Challenge Available
                </h3>

                <p className="mt-1 text-sm text-purple-900/60">
                    Complete today’s challenge to earn a character pack.
                </p>

                <div className="mt-4 inline-flex rounded-xl bg-purple-900 px-4 py-2 text-sm font-semibold text-white">
                    Play Now
                </div>
            </Link>
        </div>
    );
}