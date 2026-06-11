"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const modes = [
    {
        title: "Anime Score",
        description: "Guess which anime has the higher MAL score.",
        href: "/games/higher-lower/anime-score",
        status: "Score Mode",
        imageLink: "/game-images/higher-lower-score.jpeg",
    },
    {
        title: "Anime Popularity",
        description: "Guess which anime is more popular on MAL.",
        href: "/games/higher-lower/anime-popularity",
        status: "Popularity Mode",
        imageLink: "/game-images/higher-lower-popularity-v2.jpg",
    },
    {
        title: "Character Favorites",
        description: "Guess which character has more favorites.",
        href: "/games/higher-lower/character",
        status: "Character Mode",
        imageLink: "/game-images/higher-lower-character.jpg",
    },
];

export default function HigherLowerSelectPage() {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-130px)] max-w-7xl flex-col px-4 py-10">
            <section className="relative z-10 mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Higher or Lower
                </p>

                <h1 className="mt-3 text-5xl font-bold text-purple-950">
                    Choose a Mode
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-900/70">
                    Build your streak by guessing which anime or character ranks higher.
                    Earn packs every 5 correct answers, up to 4 per day.
                </p>
            </section>

            <section className="relative z-10 grid flex-1 gap-6 lg:grid-cols-3">
                {modes.map((mode, index) => (
                    <motion.div
                        key={mode.title}
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.35,
                            delay: index * 0.15,
                        }}
                    >
                        <Link
                            href={mode.href}
                            className="group relative z-10 flex min-h-[520px] overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="absolute inset-0 bg-purple-100">
                                <Image
                                    src={mode.imageLink}
                                    alt={mode.title}
                                    fill
                                    className="object-cover object-top"
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/85 via-purple-950/35 to-transparent" />

                            <div className="relative z-10 mt-auto flex w-full flex-col p-6 text-left">
                                <span className="mb-3 w-fit rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                                    {mode.status}
                                </span>

                                <h2 className="text-3xl font-bold text-white">
                                    {mode.title}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-white/80">
                                    {mode.description}
                                </p>

                                <div className="mt-6 inline-flex w-fit rounded-2xl bg-white px-5 py-3 text-sm font-bold text-purple-950 transition group-hover:bg-purple-100">
                                    Play Mode
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </section>
        </main>
    );
}