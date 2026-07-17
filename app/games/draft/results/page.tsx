"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DraftPosition } from "@/data/draftCharacters";
import type { DraftResult } from "@/types/draft";

const positionIcons: Record<DraftPosition, string> = {
    Captain: "👑",
    "Vice Captain": "⚔️",
    Support: "💚",
    Scout: "👁️",
    Strategist: "🧠",
    Assassin: "🗡️",
    Ace: "🔥",
    Vanguard: "🛡️",
};

const positionOrder: DraftPosition[] = [
    "Captain",
    "Vice Captain",
    "Support",
    "Scout",
    "Strategist",
    "Assassin",
    "Ace",
    "Vanguard",
];

function getGradeStyle(grade: string) {
    switch (grade) {
        case "S+":
            return {
                border:
                    "border-yellow-300/70 shadow-[0_0_32px_rgba(250,204,21,0.35)]",
                grade:
                    "text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.75)]",
                accent: "text-yellow-200",
            };

        case "S":
            return {
                border:
                    "border-purple-400/70 shadow-[0_0_30px_rgba(168,85,247,0.35)]",
                grade:
                    "text-purple-300 drop-shadow-[0_0_18px_rgba(168,85,247,0.75)]",
                accent: "text-purple-200",
            };

        case "A+":
        case "A":
            return {
                border:
                    "border-cyan-400/60 shadow-[0_0_24px_rgba(34,211,238,0.25)]",
                grade:
                    "text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.6)]",
                accent: "text-cyan-200",
            };

        default:
            return {
                border:
                    "border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.15)]",
                grade: "text-pink-300",
                accent: "text-pink-200",
            };
    }
}

export default function DraftResultsPage() {
    const router = useRouter();
    const [result, setResult] = useState<DraftResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareMessage, setShareMessage] = useState("");

    useEffect(() => {
        const savedResult = sessionStorage.getItem(
            "anime-draft-result"
        );

        if (!savedResult) {
            router.replace("/games/draft");
            return;
        }

        try {
            setResult(JSON.parse(savedResult) as DraftResult);
        } catch {
            sessionStorage.removeItem("anime-draft-result");
            router.replace("/games/draft");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const sortedPicks = useMemo(() => {
        if (!result) return [];

        return [...result.picks].sort(
            (a, b) =>
                positionOrder.indexOf(a.position) -
                positionOrder.indexOf(b.position)
        );
    }, [result]);

    const strongestPick = useMemo(() => {
        if (!result) return null;

        return [...result.picks].sort(
            (a, b) => b.power - a.power
        )[0];
    }, [result]);

    const synergyCount = useMemo(() => {
        if (!result) return 0;

        return result.picks.filter(
            (pick) => pick.hasSynergy
        ).length;
    }, [result]);

    function startNewDraft() {
        sessionStorage.removeItem("anime-draft-result");
        router.push("/games/draft");
    }

    async function shareDraft() {
        if (!result) return;

        const lineupText = sortedPicks
            .map(
                (pick) =>
                    `${positionIcons[pick.position]} ${pick.position}: ` +
                    `${pick.character.name} — ${pick.grade} (${pick.power})`
            )
            .join("\n");

        const mvpText = strongestPick
            ? `⭐ Draft MVP: ${strongestPick.character.name} — ${strongestPick.power} Power`
            : "";

        const shareText = [
            `🔥 I just completed an Anime Draft!`,
            "",
            `🏆 Grade: ${result.grade}`,
            `⚡ Total Power: ${result.totalPower}`,
            `📊 Average Power: ${result.averagePower}`,
            mvpText,
            "",
            lineupText,
            "",
            "Can you build a stronger team?",
        ]
            .filter(Boolean)
            .join("\n");

        const shareData: ShareData = {
            title: `${result.grade} Anime Draft`,
            text: shareText,
            url: window.location.origin + "/games/draft",
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                setShareMessage("Draft shared!");
            } else {
                await navigator.clipboard.writeText(
                    `${shareText}\n\n${shareData.url}`
                );

                setShareMessage("Results copied!");
            }
        } catch (error) {
            if (
                error instanceof DOMException &&
                error.name === "AbortError"
            ) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    `${shareText}\n\n${shareData.url}`
                );

                setShareMessage("Results copied!");
            } catch {
                setShareMessage("Unable to share");
            }
        }

        window.setTimeout(() => {
            setShareMessage("");
        }, 2500);
    }

    if (loading || !result) {
        return (
            <main className="flex min-h-[calc(100vh-130px)] items-center justify-center px-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-400" />
            </main>
        );
    }

    return (
        <main className="relative min-h-[calc(100vh-130px)] overflow-hidden px-4 py-10">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-0 top-0 h-[550px] w-[550px] rounded-full bg-pink-500/10 blur-[160px]" />
                <div className="absolute right-0 top-10 h-[550px] w-[550px] rounded-full bg-purple-500/10 blur-[160px]" />
                <div className="absolute bottom-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-yellow-400/5 blur-[140px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-[1500px]">
                <section className="relative overflow-hidden rounded-[2.25rem] border border-pink-500/20 bg-black/50 px-6 py-10 text-center shadow-[0_0_50px_rgba(236,72,153,0.12)] backdrop-blur-2xl md:px-10">
                    <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-300/80 to-transparent" />

                    <div className="absolute left-1/2 top-16 h-56 w-56 -translate-x-1/2 rounded-full bg-yellow-300/10 blur-[80px]" />

                    <div className="relative z-10">
                        <p className="text-xs font-black uppercase tracking-[0.5em] text-pink-300/70">
                            Final Draft Report
                        </p>

                        {result.isNewHighScore && (
                            <div className="mx-auto mt-5 w-fit rounded-full border border-yellow-300/40 bg-yellow-300/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                                ✨ New Personal Record
                            </div>
                        )}

                        <h1
                            className={`
                                mt-6
                                text-8xl
                                font-black
                                ${
                                result.grade === "Legendary"
                                    ? "text-yellow-300 drop-shadow-[0_0_35px_rgba(250,204,21,.8)]"
                                    : result.grade === "S"
                                        ? "text-fuchsia-300 drop-shadow-[0_0_30px_rgba(217,70,239,.8)]"
                                        : "text-white"
                                                            }
                                    `}
                        >
                            {result.grade}
                        </h1>

                        <p className="mt-3 text-2xl font-bold uppercase tracking-[0.4em] text-white/75">
                            Draft
                        </p>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
                            Your final lineup has been assembled.
                            Review every role, power rating, and team
                            connection below.
                        </p>

                        <div className="mx-auto mt-9 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <ResultStat
                                label="Total Power"
                                value={result.totalPower}
                                highlight
                            />

                            <ResultStat
                                label="Average"
                                value={result.averagePower}
                            />

                            <ResultStat
                                label="Draft Grade"
                                value={result.grade}
                            />

                            <ResultStat
                                label="Series Links"
                                value={synergyCount}
                            />
                        </div>
                    </div>
                </section>

                {strongestPick && (
                    <section className="mt-6 overflow-hidden rounded-3xl border border-yellow-400/20 bg-gradient-to-r from-yellow-500/10 via-black/50 to-pink-500/10 p-5 backdrop-blur-xl">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center">
                            <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-yellow-300/20 md:w-40">
                                <img
                                    src={strongestPick.character.imageUrl}
                                    alt={strongestPick.character.name}
                                    className="absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
                            </div>

                            <div className="flex-1 text-left">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
                                    Draft MVP
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-white">
                                    {strongestPick.character.name}
                                </h2>

                                <p className="text-sm text-white/50">
                                    {strongestPick.position} •{" "}
                                    {strongestPick.character.anime}
                                </p>
                            </div>

                            <div className="text-left md:text-right">
                                <p className="text-5xl font-black text-yellow-300">
                                    {strongestPick.power}
                                </p>

                                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                                    Power
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <section className="mt-8">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-300/60">
                                Final Formation
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-white">
                                Your Lineup
                            </h2>
                        </div>

                        <p className="text-sm text-white/40">
                            {sortedPicks.length} roles filled
                        </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {sortedPicks.map((pick, index) => {
                            const style = getGradeStyle(pick.grade);

                            return (
                                <article
                                    key={pick.position}
                                    className={`group relative min-h-[410px] overflow-hidden rounded-3xl border-2 bg-black text-left transition duration-300 hover:-translate-y-2 ${style.border}`}
                                    style={{
                                        animation:
                                            "resultCardEnter 650ms ease-out both",
                                        animationDelay: `${index * 80}ms`,
                                    }}
                                >
                                    <img
                                        src={pick.character.imageUrl}
                                        alt={pick.character.name}
                                        draggable={false}
                                        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] transition duration-700 group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                                        <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
                                            {positionIcons[pick.position]}{" "}
                                            {pick.position}
                                        </span>

                                        {pick.hasSynergy && (
                                            <span className="rounded-full border border-pink-300/20 bg-pink-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-pink-200 backdrop-blur-md">
                                                Series Link
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 p-5">
                                        <h3 className="text-2xl font-black text-white drop-shadow-lg">
                                            {pick.character.name}
                                        </h3>

                                        <p className="mt-1 line-clamp-1 text-sm font-medium text-white/60">
                                            {pick.character.anime}
                                        </p>

                                        <div className="mt-5 flex items-end justify-between">
                                            <span
                                                className={`text-5xl font-black italic ${style.grade}`}
                                            >
                                                {pick.grade}
                                            </span>

                                            <div className="text-right">
                                                <p className="text-3xl font-black text-white">
                                                    {pick.power}
                                                </p>

                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                                                    Power
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={shareDraft}
                        className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border border-yellow-300/40
                            bg-gradient-to-r
                            from-yellow-300
                            via-amber-300
                            to-yellow-500
                            px-8
                            py-4
                            font-black
                            text-purple-950
                            shadow-[0_0_25px_rgba(250,204,21,0.3)]
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:cursor-pointer
                            hover:shadow-[0_0_40px_rgba(250,204,21,0.55)]
                        "
                    >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                        <span className="relative flex items-center justify-center gap-2">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <path d="m8.6 13.5 6.8 4" />
                                <path d="m15.4 6.5-6.8 4" />
                            </svg>

                            Share Draft
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={startNewDraft}
                        className="
                            rounded-2xl
                            bg-gradient-to-r
                            from-pink-600
                            via-fuchsia-600
                            to-purple-700
                            px-8
                            py-4
                            font-black
                            text-white
                            shadow-[0_0_30px_rgba(236,72,153,0.3)]
                            transition
                            hover:-translate-y-1
                            hover:cursor-pointer
                            hover:shadow-[0_0_45px_rgba(236,72,153,0.55)]
                        "
                    >
                        Draft Again
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/games")}
                        className="
                            rounded-2xl
                            border border-white/10
                            bg-white/5
                            px-8
                            py-4
                            font-black
                            text-white/70
                            backdrop-blur
                            transition
                            hover:cursor-pointer
                            hover:border-pink-400/30
                            hover:bg-pink-500/10
                            hover:text-white
                        "
                    >
                        Back to Games
                    </button>
                </div>
            </div>

            {shareMessage && (
                <div className="fixed bottom-7 left-1/2 z-[100] -translate-x-1/2 animate-[shareToast_250ms_ease-out] rounded-full border border-yellow-300/30 bg-black/85 px-6 py-3 text-sm font-black text-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.25)] backdrop-blur-xl">
                    {shareMessage}
                </div>
            )}

            <style>{`
                @keyframes resultCardEnter {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.96);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes shareToast {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 16px) scale(0.95);
                    }
                
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0) scale(1);
                    }
                }
            `}</style>
        </main>
    );
}

function ResultStat({
                        label,
                        value,
                        highlight = false,
                    }: {
    label: string;
    value: string | number;
    highlight?: boolean;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                {label}
            </p>

            <p
                className={`mt-3 text-4xl font-black ${
                    highlight
                        ? "text-yellow-300 drop-shadow-[0_0_16px_rgba(250,204,21,0.55)]"
                        : "text-white"
                }`}
            >
                {value}
            </p>
        </div>
    );
}