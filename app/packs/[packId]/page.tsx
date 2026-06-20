"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import { getPack, observeAuth, Pack, openPack } from "@/lib/firebase";
import type { User } from "firebase/auth";
import OpenPackButton from "@/app/components/OpenPackButton";
import { motion } from "framer-motion";
import PackOpeningAnimation from "@/app/components/PackOpeningAnimation";

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
    const [openingAnimation, setOpeningAnimation] = useState(false);
    const [burstAnimation, setBurstAnimation] = useState(false);
    const [showRewardReveal, setShowRewardReveal] = useState(false);
    const [revealedCards, setRevealedCards] = useState<number[]>([]);

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

    function revealCard(index: number) {
        setRevealedCards((current) =>
            current.includes(index) ? current : [...current, index]
        );
    }

    async function handleOpenPack() {
        if (!user || !pack) return;

        try {
            setOpening(true);
            setOpeningAnimation(true);
            setBurstAnimation(false);
            setShowRewardReveal(false);
            setError(null);
            setRevealedCards([]);

            // Let summon animation play while rewards load
            await new Promise((resolve) => setTimeout(resolve, 1200));

            const openedRewards = await openPack(pack.id, user.uid);

            // Rewards are ready now, so burst right before reveal
            setBurstAnimation(true);

            await new Promise((resolve) => setTimeout(resolve, 700));

            setRewards(openedRewards);
            setPack({
                ...pack,
                status: "opened",
                rewards: openedRewards,
            });

            setOpeningAnimation(false);
            setBurstAnimation(false);
            setShowRewardReveal(true);
        } catch (error: any) {
            setError(error?.message ?? "Failed to open pack.");
            setOpeningAnimation(false);
            setBurstAnimation(false);
        } finally {
            setOpening(false);
        }
    }

    function rarityClass(rarity: string) {
        switch (rarity) {
            case "Common":
                return "bg-gray-100 text-gray-700";

            case "Uncommon":
                return "bg-green-100 text-green-700";

            case "Rare":
                return "bg-blue-100 text-blue-700";

            case "Epic":
                return "bg-purple-100 text-purple-700";

            case "Legendary":
                return "bg-yellow-100 text-yellow-700";

            case "Mythic":
                return "bg-red-100 text-red-700";

            default:
                return "bg-purple-100 text-purple-900";
        }
    }

    function rarityPowerClass(rarity: string) {
        switch (rarity) {
            case "Common":
                return "text-gray-700";

            case "Uncommon":
                return "text-green-700";

            case "Rare":
                return "text-blue-700";

            case "Epic":
                return "text-purple-700";

            case "Legendary":
                return "text-yellow-700";

            case "Mythic":
                return "text-red-700";

            default:
                return "text-purple-900";
        }
    }

    function rarityGlow(rarity: string) {
        switch (rarity) {
            case "Mythic":
                return "shadow-red-400/60 ring-2 ring-red-400";

            case "Legendary":
                return "shadow-yellow-400/60 ring-2 ring-yellow-400";

            case "Epic":
                return "shadow-purple-400/50 ring-2 ring-purple-400";

            case "Rare":
                return "shadow-blue-400/40 ring-2 ring-blue-400";

            default:
                return "";
        }
    }

    return (
        <main className="relative mx-auto flex min-h-[calc(100vh-130px)] max-w-3xl flex-col items-center justify-center px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            {openingAnimation && (
                <PackOpeningAnimation burst={burstAnimation} />
            )}

            <section
                className="
            relative z-10
            w-full
            rounded-3xl
            border border-pink-500/20
            bg-black/40
            p-8
            text-center
            backdrop-blur-xl
            shadow-[0_0_30px_rgba(236,72,153,0.08)]
            "
            >
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Character Pack
                </p>

                <h1 className="mt-3 text-4xl font-bold text-white">
                    {pack?.status === "opened"
                        ? "Pack Opened"
                        : "Your Pack Is Ready"}
                </h1>

                {error && (
                    <p
                        className="
                    mt-4
                    rounded-2xl
                    border border-red-500/20
                    bg-red-500/10
                    px-4 py-3
                    text-sm text-red-300
                    "
                    >
                        {error}
                    </p>
                )}

                {pack && (
                    <>
                        <div
                            className="
                        mx-auto mt-6 max-w-md
                        rounded-3xl
                        border border-pink-500/20
                        bg-black/30
                        p-6
                        backdrop-blur-xl
                        "
                        >
                            <p className="text-sm font-semibold text-pink-300/60">
                                Source
                            </p>

                            <p className="mt-1 text-xl font-bold text-white">
                                {pack.source === "dailyQuest"
                                    ? "Daily Quest"
                                    : pack.source === "higherLower"
                                        ? "Higher or Lower"
                                        : pack.source === "exchange"
                                            ? "Character Exchange"
                                            : pack.source}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-pink-300/60">
                                Status
                            </p>

                            <p className="mt-1 text-lg font-bold capitalize text-white">
                                {pack.status}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-pink-300/60">
                                Earned
                            </p>

                            <p className="mt-1 text-purple-100/70">
                                {pack.date}
                            </p>
                        </div>

                        {pack.status === "unopened" && (
                            <OpenPackButton
                                onClick={handleOpenPack}
                                opening={opening || openingAnimation}
                            />
                        )}

                        {pack.status === "opened" &&
                            rewards.length === 0 && (
                                <p
                                    className="
                                mt-6
                                rounded-2xl
                                border border-pink-500/20
                                bg-pink-500/10
                                px-4 py-3
                                text-sm font-semibold
                                text-pink-200
                                "
                                >
                                    This pack has already been opened.
                                </p>
                            )}

                        {!openingAnimation &&
                            !showRewardReveal &&
                            rewards.length > 0 && (
                                <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
                                    {rewards.map((reward, index) => (
                                        <motion.div
                                            key={`${reward.characterId}-${index}`}
                                            initial={{
                                                opacity: 0,
                                                y: 24,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            transition={{
                                                duration: 0.35,
                                                delay: index * 0.18,
                                            }}
                                            className={`
                                            relative z-10 overflow-hidden
                                            rounded-3xl
                                            border border-pink-500/20
                                            bg-black/50
                                            backdrop-blur-xl
                                            shadow-xl
                                            ${rarityGlow(reward.rarity)}
                                        `}
                                        >
                                            {reward.imageUrl && (
                                                <img
                                                    src={reward.imageUrl}
                                                    alt={reward.name}
                                                    className="h-56 w-full object-cover object-[center_5%]"
                                                />
                                            )}

                                            <div className="p-4 text-left">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${rarityClass(
                                                    reward.rarity
                                                )}`}
                                            >
                                                {reward.rarity}
                                            </span>

                                                <h3 className="mt-3 font-bold text-white">
                                                    {reward.name}
                                                </h3>

                                                <p className="mt-1 text-sm text-purple-100/60">
                                                    From{" "}
                                                    {reward.animeTitle ??
                                                        "Unknown Anime"}
                                                </p>

                                                <p
                                                    className={`mt-3 text-sm font-semibold ${rarityPowerClass(
                                                        reward.rarity
                                                    )}`}
                                                >
                                                    Power: {reward.powerLevel}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                    </>
                )}

                <div className="mt-6">
                    <Link
                        href="/"
                        className="
                    text-sm font-medium
                    text-pink-300/70
                    transition
                    hover:text-pink-200
                    "
                    >
                        Back to home
                    </Link>
                </div>
            </section>

            {showRewardReveal && rewards.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 px-4 backdrop-blur-md">
                    <div className="absolute h-[800px] w-[800px] rounded-full bg-pink-500/10 blur-[150px]" />

                    <div className="relative z-10 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.4em] text-pink-300/60">
                            Summon Complete
                        </p>

                        <h2 className="mt-3 text-4xl font-bold text-white">
                            New Characters
                        </h2>

                        <div className="mt-8 flex flex-wrap justify-center gap-6">
                            {rewards.map((reward, index) => {
                                const isRevealed =
                                    revealedCards.includes(index);

                                return (
                                    <motion.div
                                        key={`${reward.characterId}-${index}`}
                                        initial={{
                                            opacity: 0,
                                            y: 40,
                                            scale: 0.85,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        transition={{
                                            duration: 0.45,
                                            delay: index * 0.25,
                                        }}
                                        className="w-[240px]"
                                    >
                                        <div
                                            onClick={() => revealCard(index)}
                                            className="group relative h-[380px] cursor-pointer perspective-[1200px]"
                                        >
                                            <motion.div
                                                animate={{ rotateY: isRevealed ? 180 : 0 }}
                                                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                                                className="relative h-full w-full rounded-3xl [transform-style:preserve-3d]"
                                            >
                                                {/* Card Back */}
                                                <div className="absolute inset-0 overflow-hidden rounded-3xl border border-pink-500/30 bg-black/70 shadow-[0_0_35px_rgba(236,72,153,0.22)] backdrop-blur-xl [backface-visibility:hidden]">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-black to-purple-500/20" />
                                                    <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/20 blur-[70px]" />
                                                    <div className="absolute inset-4 rounded-2xl border border-white/10" />

                                                    <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                                                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-pink-400/40 bg-pink-500/10 text-5xl font-black text-pink-200 shadow-[0_0_35px_rgba(236,72,153,0.3)]">
                                                            ?
                                                        </div>

                                                        <p className="mt-6 text-xs font-black uppercase tracking-[0.35em] text-pink-200/70">
                                                            Sealed Character
                                                        </p>

                                                        <p className="mt-3 text-sm text-purple-100/50">
                                                            Click to reveal
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Card Front */}
                                                <div className="absolute inset-0 overflow-hidden rounded-3xl border border-pink-500/30 bg-black/70 shadow-[0_0_40px_rgba(236,72,153,0.25)] backdrop-blur-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                                                    <div className="absolute inset-0 bg-pink-500/5" />

                                                    {reward.imageUrl && (
                                                        <img
                                                            src={reward.imageUrl}
                                                            alt={reward.name}
                                                            className="h-full w-full object-cover object-[center_8%]"
                                                        />
                                                    )}

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                                                    <div className="absolute left-4 top-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-black uppercase shadow-[0_0_18px_rgba(255,255,255,0.08)] ${rarityClass(
                                                                reward.rarity
                                                            )}`}
                                                        >
                                                            {reward.rarity}
                                                        </span>
                                                    </div>

                                                    <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                                                        <h3 className="text-2xl font-black text-white drop-shadow-[0_0_14px_rgba(236,72,153,0.35)]">
                                                            {reward.name}
                                                        </h3>

                                                        <p className="mt-1 text-sm font-medium text-purple-100/70">
                                                            {reward.animeTitle ?? "Unknown Anime"}
                                                        </p>

                                                        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
                                                            <span className="text-xs font-bold uppercase tracking-widest text-pink-200/60">
                                                                Power
                                                            </span>

                                                            <span
                                                                className={`text-lg font-black ${rarityPowerClass(
                                                                    reward.rarity
                                                                )}`}
                                                            >
                                                                {reward.powerLevel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowRewardReveal(false)
                            }
                            className="
                        mt-8
                        rounded-2xl
                        border border-pink-500/20
                        bg-pink-500/10
                        px-6 py-3
                        font-bold
                        text-pink-200
                        backdrop-blur-xl
                        transition
                        hover:border-pink-400/40
                        hover:bg-pink-500/20
                        hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]
                        hover:cursor-pointer
                        "
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}