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
        imageLink: "/game-images/draft.avif"
    },
];

export default function GamesPage() {
    return (
        <main className="relative mx-auto flex min-h-[calc(100vh-130px)] max-w-7xl flex-col px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            <section className="relative z-10 mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Game Modes
                </p>

                <h1 className="mt-3 text-5xl font-bold text-white">
                    Choose Your Challenge
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-100/70">
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
                            className="
                        group relative z-10 flex min-h-[520px] overflow-hidden
                        rounded-3xl
                        border border-pink-500/20
                        bg-black/40
                        shadow-[0_0_25px_rgba(236,72,153,0.08)]
                        backdrop-blur-xl
                        transition
                        hover:-translate-y-1
                        hover:border-pink-400/40
                        hover:shadow-[0_0_35px_rgba(236,72,153,0.18)]
                        "
                        >
                            <div className="absolute inset-0">
                                <Image
                                    src={game.imageLink}
                                    alt={game.title}
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
                            <div className="absolute inset-0 bg-pink-500/0 transition duration-500 group-hover:bg-pink-500/10" />

                            <div className="relative z-10 mt-auto flex w-full flex-col p-6 text-left">
                            <span className="mb-3 w-fit rounded-full border border-pink-300/30 bg-pink-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-100 backdrop-blur-sm">
                                {game.status}
                            </span>

                                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                                    {game.title}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-purple-100/80">
                                    {game.description}
                                </p>

                                <div className="mt-6 inline-flex w-fit rounded-2xl border border-pink-500/20 bg-pink-500/10 px-5 py-3 text-sm font-bold text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.12)] backdrop-blur-xl transition group-hover:border-pink-400/40 group-hover:bg-pink-500/20 group-hover:shadow-[0_0_22px_rgba(236,72,153,0.2)]">
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