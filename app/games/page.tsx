"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const games = [
    {
        title: "Draft",
        description:
            "Build an anime squad from random characters, assign strategic roles, create synergies, and chase the strongest lineup.",
        href: "/games/draft",
        status: "Featured",
        imageLabel: "Anime Draft",
        imageLink: "/game-images/draft.avif",
    },
    {
        title: "Daily Quest",
        description:
            "Test your anime knowledge with a new guessing challenge every day.",
        href: "/daily",
        status: "Daily",
        imageLabel: "Daily Quest",
        imageLink: "/game-images/daily-game.png",
    },
];

export default function GamesPage() {
    const [showDraftModes, setShowDraftModes] = useState(false);

    return (
        <main className="relative mx-auto flex min-h-[calc(100vh-130px)] max-w-7xl flex-col px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            {/* Draft Mode Selection Modal */}
            <AnimatePresence>
                {showDraftModes && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDraftModes(false)}
                        className="
                            fixed inset-0 z-[100]
                            flex items-center justify-center
                            bg-black/80 px-4
                            backdrop-blur-md
                        "
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                                y: 30,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                y: 20,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 240,
                                damping: 22,
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="
                                relative w-full max-w-3xl
                                overflow-hidden rounded-[2rem]
                                border border-pink-500/25
                                bg-black/90
                                p-7
                                shadow-[0_0_50px_rgba(236,72,153,0.18)]
                                backdrop-blur-2xl
                            "
                        >
                            {/* Background glow */}
                            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-pink-500/15 blur-[90px]" />
                            <div className="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-purple-500/15 blur-[90px]" />

                            <div className="relative z-10">
                                <button
                                    type="button"
                                    onClick={() => setShowDraftModes(false)}
                                    className="
                                        absolute right-0 top-0
                                        flex h-9 w-9 items-center justify-center
                                        rounded-full
                                        border border-white/10
                                        bg-white/5
                                        text-sm text-white/50
                                        transition
                                        hover:cursor-pointer
                                        hover:border-pink-400/40
                                        hover:bg-pink-500/10
                                        hover:text-white
                                    "
                                >
                                    ✕
                                </button>

                                <div className="text-center">
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-300/60">
                                        Anime Draft
                                    </p>

                                    <h2 className="mt-3 text-4xl font-black text-white">
                                        Choose Your Mode
                                    </h2>

                                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-purple-100/60">
                                        Build the strongest anime lineup alone or challenge
                                        another player head-to-head.
                                    </p>
                                </div>

                                <div className="mt-8 grid gap-5 md:grid-cols-2">
                                    {/* Solo */}
                                    <Link
                                        href="/games/draft"
                                        className="
                                            group relative
                                            min-h-[260px]
                                            overflow-hidden rounded-3xl
                                            border border-pink-500/25
                                            bg-white/[0.03]
                                            p-6
                                            transition-all duration-300
                                            hover:-translate-y-1
                                            hover:border-pink-400/60
                                            hover:bg-pink-500/10
                                            hover:shadow-[0_0_35px_rgba(236,72,153,0.18)]
                                        "
                                    >
                                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl transition group-hover:bg-pink-500/20" />

                                        <div className="relative z-10 flex h-full flex-col">
                                            <div
                                                className="
                                                    flex h-12 w-12
                                                    items-center justify-center
                                                    rounded-2xl
                                                    border border-pink-400/25
                                                    bg-pink-500/10
                                                    text-2xl
                                                    shadow-[0_0_18px_rgba(236,72,153,0.12)]
                                                "
                                            >
                                                👤
                                            </div>

                                            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-pink-300/50">
                                                Classic Mode
                                            </p>

                                            <h3 className="mt-2 text-3xl font-black text-white">
                                                Solo Draft
                                            </h3>

                                            <p className="mt-3 text-sm leading-6 text-purple-100/60">
                                                Build your own lineup, chase a new high
                                                score, and create the strongest possible
                                                team.
                                            </p>

                                            <div className="mt-auto pt-6">
                                                <div className="flex items-center gap-2 text-sm font-black text-pink-200">
                                                    Play Solo
                                                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                                                        →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Multiplayer */}
                                    <Link
                                        href="/games/draft/multiplayer"
                                        className="
                                            group relative
                                            min-h-[260px]
                                            overflow-hidden rounded-3xl
                                            border border-purple-400/25
                                            bg-white/[0.03]
                                            p-6
                                            transition-all duration-300
                                            hover:-translate-y-1
                                            hover:border-purple-400/60
                                            hover:bg-purple-500/10
                                            hover:shadow-[0_0_35px_rgba(168,85,247,0.2)]
                                        "
                                    >
                                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition group-hover:bg-purple-500/20" />

                                        <div className="relative z-10 flex h-full flex-col">
                                            <div
                                                className="
                                                    flex h-12 w-12
                                                    items-center justify-center
                                                    rounded-2xl
                                                    border border-purple-400/25
                                                    bg-purple-500/10
                                                    text-2xl
                                                    shadow-[0_0_18px_rgba(168,85,247,0.14)]
                                                "
                                            >
                                                ⚔️
                                            </div>

                                            <div className="mt-6 flex items-center gap-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300/50">
                                                    Head to Head
                                                </p>

                                                <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-200">
                                                    Multiplayer
                                                </span>
                                            </div>

                                            <h3 className="mt-2 text-3xl font-black text-white">
                                                Multiplayer Draft
                                            </h3>

                                            <p className="mt-3 text-sm leading-6 text-purple-100/60">
                                                Enter a lobby and compete against another
                                                player to see who can build the stronger
                                                anime squad.
                                            </p>

                                            <div className="mt-auto pt-6">
                                                <div className="flex items-center gap-2 text-sm font-black text-purple-200">
                                                    Play Multiplayer
                                                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                                                        →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="relative z-10 mb-8 text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-300/60">
                    Play AnimAid
                </p>

                <h1 className="mt-3 text-5xl font-black text-white">
                    Build. Draft. Battle.
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-100/70">
                    Build anime lineups, master your draft strategy, and challenge
                    other players head-to-head.
                </p>
            </section>

            <section className="relative z-10 grid flex-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
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
                        {game.title === "Draft" ? (
                            <button
                                type="button"
                                onClick={() =>
                                    setShowDraftModes(true)
                                }
                                className="
                                    group relative z-10 flex
                                    min-h-[520px] w-full
                                    overflow-hidden
                                    rounded-3xl
                                    border border-pink-500/25
                                    bg-black/40
                                    text-left
                                    shadow-[0_0_35px_rgba(236,72,153,0.12)]
                                    backdrop-blur-xl
                                    transition
                                    hover:-translate-y-1
                                    hover:cursor-pointer
                                    hover:border-pink-400/50
                                    hover:shadow-[0_0_45px_rgba(236,72,153,0.22)]
                                "
                            >
                                <GameCardContent game={game} />
                            </button>
                        ) : (
                            <Link
                                href={game.href}
                                className="
                                    group relative z-10 flex
                                    min-h-[520px] overflow-hidden
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
                                <GameCardContent game={game} />
                            </Link>
                        )}
                    </motion.div>
                ))}
            </section>
        </main>
    );
}

function GameCardContent({
                             game,
                         }: {
    game: (typeof games)[number];
}) {
    return (
        <>
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
        </>
    );
}