"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const games = [
    {
        title: "Daily Quest",
        description: "Guess today’s anime in 6 tries and earn a character pack.",
        href: "/daily",
        status: "Available Daily",
        imageLabel: "Daily Quest Image",
        imageLink: "/game-images/daily-game.png"
    },
    {
        title: "Higher or Lower",
        description: "Compare animes based on their ratings or popularity, or characters based on popularity.",
        href: "/games/higher-lower",
        status: "Available",
        imageLabel: "Higher or Lower Image",
        imageLink: "/game-images/higher-or-lower.jpg"
    },
    {
        title: "Blind Draft",
        description: "Create the best anime squad with random characters.",
        href: "/games/draft",
        status: "Available",
        imageLabel: "Mystery Game Image",
        imageLink: "/game-images/mystery.jpg"
    },
];

export default function GamesPage() {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-130px)] max-w-7xl flex-col px-4 py-10">
            <section className="relative z-10 mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Game Modes
                </p>

                <h1 className="mt-3 text-5xl font-bold text-purple-950">
                    Choose Your Challenge
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-900/70">
                    Play anime-themed challenges, earn packs, and grow your character collection.
                </p>
            </section>

            <section className="relative z-10 grid flex-1 gap-6 lg:grid-cols-3">
                {games.map((game, index) => (
                    <motion.div
                        key={game.title}
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.35,
                            delay: index * 0.15,
                        }}
                    >
                        <Link
                            href={game.href}
                            className="group relative z-10 flex min-h-[520px] overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="absolute inset-0">
                                <Image
                                    src={game.imageLink}
                                    alt={game.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-purple-950/85 via-purple-950/35 to-transparent" />

                            <div className="relative z-10 mt-auto flex w-full flex-col p-6 text-left">
                                <span className="mb-3 w-fit rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                                    {game.status}
                                </span>

                                <h2 className="text-3xl font-bold text-white">
                                    {game.title}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-white/80">
                                    {game.description}
                                </p>

                                <div className="mt-6 inline-flex w-fit rounded-2xl bg-white px-5 py-3 text-sm font-bold text-purple-950 transition group-hover:bg-purple-100">
                                    Play Now
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </section>
        </main>
    );
}