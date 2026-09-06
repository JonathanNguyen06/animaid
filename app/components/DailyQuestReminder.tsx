"use client";

import Link from "next/link";

export default function DailyQuestReminder() {
    return (
        <div className="fixed right-8 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
            <Link
                href="/daily"
                className="
                    block
                    w-72
                    rounded-3xl
                    border
                    border-pink-500/20
                    bg-black/50
                    p-5
                    backdrop-blur-xl
                    shadow-[0_0_25px_rgba(236,72,153,0.08)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-pink-500/40
                    hover:shadow-[0_0_35px_rgba(236,72,153,0.18)]
                "
            >
                {/* STATUS */}

                <div className="mb-3 flex items-center gap-2">
                    <div
                        className="
                            h-2
                            w-2
                            animate-pulse
                            rounded-full
                            bg-pink-400
                            shadow-[0_0_12px_rgba(236,72,153,0.9)]
                        "
                    />

                    <p className="text-xs font-bold uppercase tracking-widest text-pink-300/70">
                        Daily Draft
                    </p>
                </div>


                {/* TITLE */}

                <h3 className="text-lg font-black text-white">
                    Today&apos;s Draft Is Ready
                </h3>


                {/* DESCRIPTION */}

                <p className="mt-2 text-sm leading-5 text-purple-100/60">
                    Draft today&apos;s 8 characters and see how close you can get to the optimal lineup.
                </p>


                {/* CTA */}

                <div
                    className="
                        mt-5
                        inline-flex
                        rounded-xl
                        bg-gradient-to-r
                        from-pink-500
                        to-purple-600
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        shadow-[0_0_15px_rgba(236,72,153,0.35)]
                    "
                >
                    Start Daily Draft →
                </div>
            </Link>
        </div>
    );
}