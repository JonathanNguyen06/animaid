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
        <main className="mx-auto flex min-h-[calc(100vh-130px)] max-w-3xl flex-col items-center justify-center px-4 py-10">
            {openingAnimation && <PackOpeningAnimation burst={burstAnimation} />}

            {showRewardReveal && rewards.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-purple-950/90 px-4 backdrop-blur-sm">
                    <div className="absolute h-[700px] w-[700px] rounded-full bg-yellow-400/20 blur-3xl" />

                    <div className="relative z-10 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.4em] text-yellow-200/80">
                            Summon Complete
                        </p>

                        <h2 className="mt-3 text-4xl font-bold text-white">
                            New Characters
                        </h2>

                        <div className="mt-8 flex flex-wrap justify-center gap-6">
                            {rewards.map((reward, index) => {
                                const isRevealed = revealedCards.includes(index);

                                return (
                                    <motion.div
                                        key={`${reward.characterId}-${index}`}
                                        initial={{ opacity: 0, y: 40, scale: 0.85 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            duration: 0.45,
                                            delay: index * 0.25,
                                            ease: "easeOut",
                                        }}
                                        className="w-[240px]"
                                        style={{ perspective: 1000 }}
                                    >
                                        <motion.button
                                            type="button"
                                            onClick={() => revealCard(index)}
                                            className="relative h-[420px] w-full cursor-pointer"
                                            animate={{ rotateY: isRevealed ? 180 : 0 }}
                                            transition={{
                                                duration: 0.7,
                                                ease: "easeInOut",
                                            }}
                                            style={{
                                                transformStyle: "preserve-3d",
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl border border-yellow-300 bg-gradient-to-br from-purple-700 via-purple-950 to-black shadow-2xl shadow-yellow-400/30"
                                                style={{ backfaceVisibility: "hidden" }}
                                            >
                                                <div className="absolute h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl" />
                                                <div className="absolute inset-4 rounded-2xl border border-yellow-300/40" />

                                                <img
                                                    src="/icons/animaid-pack.png"
                                                    alt="Anime Aid card back"
                                                    className="relative z-10 h-32 w-32 object-contain drop-shadow-2xl"
                                                />

                                                <p className="absolute bottom-8 text-xs font-bold uppercase tracking-[0.3em] text-yellow-200/70">
                                                    Tap to Reveal
                                                </p>
                                            </div>

                                            <div
                                                className={`absolute inset-0 overflow-hidden rounded-3xl border border-purple-200 shadow-2xl ${rarityGlow(reward.rarity)}`}
                                                style={{
                                                    backfaceVisibility: "hidden",
                                                    transform: "rotateY(180deg)",
                                                }}
                                            >
                                                {reward.imageUrl && (
                                                    <img
                                                        src={reward.imageUrl}
                                                        alt={reward.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                                                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase ${rarityClass(reward.rarity)}`}
                                                    >
                                                        {reward.rarity}
                                                    </span>

                                                    <h3 className="mt-3 text-xl font-bold text-white drop-shadow-lg">
                                                        {reward.name}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-white/80">
                                                        From {reward.animeTitle ?? "Unknown Anime"}
                                                    </p>

                                                    <p
                                                        className={`mt-2 text-sm font-semibold ${
                                                            reward.rarity === "Mythic"
                                                                ? "text-red-300"
                                                                : reward.rarity === "Legendary"
                                                                    ? "text-yellow-300"
                                                                    : reward.rarity === "Epic"
                                                                        ? "text-purple-300"
                                                                        : reward.rarity === "Rare"
                                                                            ? "text-blue-300"
                                                                            : reward.rarity === "Uncommon"
                                                                                ? "text-green-300"
                                                                                : "text-white"
                                                        }`}
                                                    >
                                                        Power: {reward.powerLevel}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowRewardReveal(false)}
                            className="mt-8 rounded-2xl bg-yellow-300 px-6 py-3 font-bold text-purple-950 transition hover:bg-yellow-200 hover:cursor-pointer"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            <section className="w-full rounded-3xl border border-purple-200 bg-white relative z-10 p-8 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Character Pack
                </p>

                <h1 className="mt-3 text-4xl font-bold text-purple-950">
                    {pack?.status === "opened" ? "Pack Opened" : "Your Pack Is Ready"}
                </h1>

                {error && (
                    <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {pack && (
                    <>
                        <div className="mx-auto mt-6 max-w-md rounded-3xl border border-purple-200 bg-purple-50 p-6">
                            <p className="text-sm font-semibold text-purple-900/60">
                                Source
                            </p>

                            <p className="mt-1 text-xl font-bold text-purple-950">
                                {pack.source === "dailyQuest"
                                    ? "Daily Quest"
                                    : pack.source === "higherLower"
                                        ? "Higher or Lower"
                                        : pack.source === "exchange"
                                            ? "Character Exchange"
                                            : pack.source}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-purple-900/60">
                                Status
                            </p>

                            <p className="mt-1 text-lg font-bold text-purple-950 capitalize">
                                {pack.status}
                            </p>

                            <p className="mt-4 text-sm font-semibold text-purple-900/60">
                                Earned
                            </p>

                            <p className="mt-1 text-purple-900">{pack.date}</p>
                        </div>

                        {pack.status === "unopened" && (
                            <OpenPackButton
                                onClick={handleOpenPack}
                                opening={opening || openingAnimation}
                            />
                        )}

                        {pack.status === "opened" && rewards.length === 0 && (
                            <p className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-900">
                                This pack has already been opened.
                            </p>
                        )}

                        {!openingAnimation && !showRewardReveal && rewards.length > 0 && (
                            <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-3">
                                {rewards.map((reward, index) => (
                                    <motion.div
                                        key={`${reward.characterId}-${index}`}
                                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            delay: index * 0.18,
                                        }}
                                        className={`relative z-10 overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-lg ${rarityGlow(reward.rarity)}`}
                                    >
                                        {reward.imageUrl && (
                                            <img
                                                src={reward.imageUrl}
                                                alt={reward.name}
                                                className="h-56 w-full object-cover"
                                            />
                                        )}

                                        <div className="p-4 text-left">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${rarityClass(reward.rarity)}`}
                                        >
                                            {reward.rarity}
                                        </span>

                                            <h3 className="mt-3 font-bold text-purple-950">
                                                {reward.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-purple-900/60">
                                                From {reward.animeTitle ?? "Unknown Anime"}
                                            </p>

                                            <p
                                                className={`mt-3 text-sm font-semibold ${rarityPowerClass(reward.rarity)}`}
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
                        className="text-sm font-medium text-purple-900/60 transition hover:text-purple-900"
                    >
                        Back to home
                    </Link>
                </div>
            </section>
        </main>
    );
}