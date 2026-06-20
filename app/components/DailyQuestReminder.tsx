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
        <div className="fixed right-8 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
            <Link
                href={user ? "/daily" : "/signup"}
                className="
                block w-72 rounded-3xl
                border border-pink-500/20
                bg-black/50
                p-5
                backdrop-blur-xl
                shadow-[0_0_25px_rgba(236,72,153,0.08)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-pink-500/40
                hover:shadow-[0_0_35px_rgba(236,72,153,0.18)]
            "
            >
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.9)]" />

                    <p className="text-xs font-bold uppercase tracking-widest text-pink-300/70">
                        Daily Quest
                    </p>
                </div>

                <h3 className="text-lg font-bold text-white">
                    Anime Challenge Available
                </h3>

                <p className="mt-2 text-sm text-purple-100/60">
                    Complete today's challenge to earn a character pack.
                </p>

                <div
                    className="
                    mt-5 inline-flex rounded-xl
                    bg-gradient-to-r
                    from-pink-500
                    to-purple-600
                    px-4 py-2
                    text-sm font-semibold text-white
                    shadow-[0_0_15px_rgba(236,72,153,0.35)]
                "
                >
                    Play Now →
                </div>
            </Link>
        </div>
    );
}