"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
    DraftPosition,
    AnyDraftPosition,
} from "@/data/draftCharacters";

import type {
    DraftPick,
    DraftResult,
} from "@/types/draft";
import {getLetterGrade} from "@/data/draftLogic";

type RevealPhase =
    | "lineup"
    | "ascension"
    | "boost"
    | "final";

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

function getPositionIcon(position: AnyDraftPosition) {
    if (position in positionIcons) {
        return positionIcons[position as DraftPosition];
    }

    return "⚡";
}

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

function getPreAscensionPower(pick: DraftPick) {
    return pick.power - (pick.ascensionBonus ?? 0);
}

export default function DraftResultsPage() {
    const router = useRouter();
    const [result, setResult] = useState<DraftResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareMessage, setShareMessage] = useState("");
    const [revealPhase, setRevealPhase] =
        useState<RevealPhase>("lineup");
    const [revealedCount, setRevealedCount] =
        useState(0);
    const [showAscensionImpact, setShowAscensionImpact] =
        useState(false);

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

    const normalPicks = useMemo(() => {
        if (!result) return [];

        return positionOrder.flatMap((position) => {
            const pick = result.picks.find(
                (pick) => pick.position === position
            );

            return pick ? [pick] : [];
        });
    }, [result]);

    useEffect(() => {
        if (!result) return;
        if (revealPhase !== "ascension") return;

        const impactTimeout = window.setTimeout(() => {
            setShowAscensionImpact(true);
        }, 1200);

        const boostTimeout = window.setTimeout(() => {
            setRevealPhase("boost");
        }, 2600);

        return () => {
            window.clearTimeout(impactTimeout);
            window.clearTimeout(boostTimeout);
        };
    }, [result, revealPhase]);

    useEffect(() => {
        if (revealPhase !== "boost") return;

        const timeout = window.setTimeout(() => {
            setRevealPhase("final");
        }, 900);

        return () => window.clearTimeout(timeout);
    }, [revealPhase]);

    const powerPositionPick = useMemo(() => {
        if (!result) return null;

        return (
            result.picks.find(
                (pick) =>
                    !positionOrder.includes(
                        pick.position as DraftPosition
                    )
            ) ?? null
        );
    }, [result]);

    const sortedPicks = useMemo(() => {
        return [
            ...normalPicks,
            ...(powerPositionPick
                ? [powerPositionPick]
                : []),
        ];
    }, [normalPicks, powerPositionPick]);

    const gridPicks = useMemo<DraftPick[]>(() => {
        return [
            ...normalPicks.slice(0, 4),

            ...(powerPositionPick
                ? [powerPositionPick]
                : []),

            ...normalPicks.slice(4),
        ];
    }, [normalPicks, powerPositionPick]);

    useEffect(() => {
        if (!result) return;
        if (revealPhase !== "lineup") return;

        if (revealedCount >= result.picks.length) {
            const timeout = window.setTimeout(() => {
                setRevealPhase("ascension");
            }, 800);

            return () => window.clearTimeout(timeout);
        }

        const lastRevealedPick =
            revealedCount > 0
                ? gridPicks[revealedCount - 1]
                : null;

        const lastRevealedGrade =
            lastRevealedPick
                ? getLetterGrade(
                    getPreAscensionPower(lastRevealedPick)
                )
                : null;

        const revealDelay =
            lastRevealedGrade === "S+"
                ? 1500
                : lastRevealedGrade === "S"
                    ? 1200
                    : 850;

        const timeout = window.setTimeout(() => {
            setRevealedCount(
                (current) => current + 1
            );
        }, revealDelay);

        return () => window.clearTimeout(timeout);
    }, [
        result,
        revealPhase,
        revealedCount,
        gridPicks
    ]);

    const revealedPower = useMemo(() => {
        if (!result) return 0;

        return gridPicks
            .slice(0, revealedCount)
            .reduce(
                (total, pick) =>
                    total + getPreAscensionPower(pick),
                0
            );
    }, [
        result,
        gridPicks,
        revealedCount,
    ]);

    const displayedTeamPower =
        revealPhase === "final"
            ? (result?.totalPower ?? 0)
            : revealedPower;

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
                    `${getPositionIcon(pick.position)} ${pick.position}: ` +
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

            {revealPhase === "ascension" && (
                <div className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center overflow-hidden">
                    {/* Dark backdrop */}
                    <div className="absolute inset-0 animate-[ascensionBackdrop_2.6s_ease-in-out_forwards] bg-black/90 backdrop-blur-md" />

                    {/* Energy glow */}
                    <div className="absolute h-[500px] w-[500px] animate-[ascensionGlow_2.5s_ease-in-out_forwards] rounded-full bg-yellow-300/15 blur-[100px]" />

                    {/* Expanding rings */}
                    <div className="absolute h-72 w-72 animate-[ascensionRing_1.8s_ease-out_forwards] rounded-full border-2 border-yellow-300/60" />

                    <div className="absolute h-72 w-72 animate-[ascensionRing_1.8s_250ms_ease-out_forwards] rounded-full border border-pink-400/50 opacity-0" />

                    <div className="relative z-10 w-full max-w-xl px-5 text-center">
                        <p className="animate-[ascensionLabel_1s_ease-out_forwards] text-xs font-black uppercase tracking-[0.55em] text-yellow-300/70">
                            Ascension Activated
                        </p>

                        <h2 className="mt-5 animate-[ascensionTitle_1.2s_cubic-bezier(.16,1,.3,1)_forwards] text-5xl font-black text-white md:text-7xl">
                            {result.ascension.name}
                        </h2>

                        <p className="mx-auto mt-5 max-w-md animate-[ascensionDescription_1.5s_ease-out_forwards] text-sm leading-6 text-white/60">
                            {result.ascension.description}
                        </p>

                        <div
                            className={`mt-8 transition-all duration-500 ${
                                showAscensionImpact
                                    ? "scale-100 opacity-100"
                                    : "scale-50 opacity-0"
                            }`}
                        >
                            <p className="text-6xl font-black text-yellow-300 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]">
                                +{result.ascension.totalBonus}
                            </p>

                            <p className="mt-2 text-xs font-black uppercase tracking-[0.3em] text-white/40">
                                Team Power
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

                        {revealPhase === "final" &&
                            result.isNewHighScore && (
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
                                revealPhase !== "final"
                                    ? "text-white/20"
                                    : result.grade === "Legendary"
                                        ? "text-yellow-300 drop-shadow-[0_0_35px_rgba(250,204,21,.8)]"
                                        : result.grade === "S"
                                            ? "text-fuchsia-300 drop-shadow-[0_0_30px_rgba(217,70,239,.8)]"
                                            : "text-white"
                                }
                            `}
                        >
                            {revealPhase === "final"
                                ? result.grade
                                : "?"}
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
                            <div
                                key={displayedTeamPower}
                                className="animate-[teamPowerImpact_450ms_cubic-bezier(.16,1,.3,1)]"
                            >
                                <ResultStat
                                    label="Team Power"
                                    value={displayedTeamPower}
                                    highlight
                                />
                            </div>

                            <ResultStat
                                label="Average"
                                value={
                                    revealPhase === "final"
                                        ? result.averagePower
                                        : "?"
                                }
                            />

                            <ResultStat
                                label="Draft Grade"
                                value={
                                    revealPhase === "final"
                                        ? result.grade
                                        : "?"
                                }
                            />

                            <ResultStat
                                label="Series Links"
                                value={
                                    revealPhase === "final"
                                        ? synergyCount
                                        : "?"
                                }
                            />
                        </div>
                    </div>
                </section>

                {revealPhase === "final" && strongestPick && (
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

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                        {gridPicks.map((pick, index) => {
                            const isPowerPosition =
                                pick.position === powerPositionPick?.position;

                            const isRevealed =
                                index < revealedCount;

                            const isJustRevealed =
                                revealPhase === "lineup" &&
                                isRevealed &&
                                index === revealedCount - 1;

                            const ascensionApplied =
                                revealPhase === "boost" ||
                                revealPhase === "final";

                            const displayedPower =
                                ascensionApplied
                                    ? pick.power
                                    : getPreAscensionPower(pick);

                            const displayedGrade =
                                ascensionApplied
                                    ? pick.grade
                                    : getLetterGrade(
                                        getPreAscensionPower(pick)
                                    );

                            const style =
                                getGradeStyle(displayedGrade);

                            const isSPlus =
                                displayedGrade === "S+";

                            const isElite =
                                displayedGrade === "S" ||
                                displayedGrade === "S+";

                            const ascensionBonus =
                                pick.ascensionBonus ?? 0;

                            const receivedAscension =
                                ascensionBonus > 0;

                            return (
                                <article
                                    key={pick.position}
                                    className={`
                                        group relative min-h-[410px]
                                        overflow-hidden rounded-3xl border-2
                                        bg-black text-left
                                        transition duration-300
                                        hover:-translate-y-2
                                        ${style.border}
                                        ${
                                        ascensionApplied && receivedAscension
                                            ? "ring-2 ring-yellow-300/60 shadow-[0_0_40px_rgba(250,204,21,0.35)]"
                                            : ""
                                    }
                                        ${
                                        isPowerPosition
                                            ? "xl:col-start-5 xl:row-start-1 xl:row-span-2 xl:self-center"
                                            : ""
                                        }
                                    `}
                                    style={{
                                        animation:
                                            "resultCardEnter 650ms ease-out both",
                                        animationDelay: `${index * 80}ms`,
                                    }}
                                >
                                    {isRevealed ? (
                                        <div
                                            className={`
                                                absolute inset-0
                                                ${
                                                isJustRevealed
                                                    ? isElite
                                                        ? "animate-[eliteCardReveal_950ms_cubic-bezier(.16,1,.3,1)_both]"
                                                        : "animate-[draftCardReveal_700ms_cubic-bezier(.16,1,.3,1)_both]"
                                                    : ""
                                                }
                                            `}
                                        >
                                            {/* Reveal flash */}
                                            {isJustRevealed && isElite && (
                                                <div
                                                    className={`
                                                        pointer-events-none
                                                        fixed inset-0 z-[120]
                                                        animate-[eliteScreenFlash_850ms_ease-out_forwards]
                                                        ${
                                                        isSPlus
                                                            ? "bg-yellow-200"
                                                            : "bg-purple-400"
                                                    }
                                                    `}
                                                />
                                            )}
                                            {isJustRevealed && (
                                                <>
                                                    <div
                                                        className={`
                                                        pointer-events-none absolute inset-0 z-40
                                                        animate-[draftRevealFlash_650ms_ease-out_forwards]
                                                        ${
                                                            isPowerPosition
                                                                ? "bg-yellow-200"
                                                                : displayedGrade === "S+" || displayedGrade === "S"
                                                                    ? "bg-purple-300"
                                                                    : "bg-pink-300"
                                                        }
                                                        `}
                                                    />

                                                    {/* Expanding energy ring */}
                                                    <div
                                                        className={`
                                                            pointer-events-none
                                                            absolute left-1/2 top-1/2 z-30
                                                            h-28 w-28
                                                            -translate-x-1/2 -translate-y-1/2
                                                            animate-[draftRevealRing_800ms_ease-out_forwards]
                                                            rounded-full border-4
                                                            ${
                                                            isPowerPosition
                                                                ? "border-yellow-300"
                                                                : displayedGrade === "S+" || displayedGrade === "S"
                                                                    ? "border-purple-300"
                                                                    : "border-pink-400"
                                                        }
                                                        `}
                                                    />
                                                    {isJustRevealed && isElite && (
                                                        <div
                                                            className={`
                                                                pointer-events-none
                                                                absolute left-1/2 top-1/2 z-30
                                                                h-36 w-36
                                                                -translate-x-1/2 -translate-y-1/2
                                                                animate-[eliteRevealRing_1100ms_150ms_ease-out_forwards]
                                                                rounded-full border-4 opacity-0
                                                                ${
                                                                isSPlus
                                                                    ? "border-yellow-200"
                                                                    : "border-fuchsia-300"
                                                            }
                                                            `}
                                                        />
                                                    )}
                                                    {isJustRevealed && isElite && (
                                                        <div
                                                            className={`
                                                                pointer-events-none
                                                                absolute left-1/2 top-1/2 z-20
                                                                h-64 w-64
                                                                -translate-x-1/2 -translate-y-1/2
                                                                animate-[eliteGlowBurst_1s_ease-out_forwards]
                                                                rounded-full blur-[55px]
                                                                ${
                                                                isSPlus
                                                                    ? "bg-yellow-300/70"
                                                                    : "bg-purple-500/60"
                                                            }
                                                            `}
                                                        />
                                                    )}

                                                    {/* Radial particles */}
                                                    <div className="pointer-events-none absolute inset-0 z-40">
                                                        {Array.from({ length: 12 }).map((_, particleIndex) => (
                                                            <span
                                                                key={particleIndex}
                                                                className={`
                                                                    absolute left-1/2 top-1/2
                                                                    h-2 w-2 rounded-full
                                                                    animate-[draftRevealParticle_800ms_ease-out_forwards]
                                                                    ${
                                                                    isPowerPosition
                                                                        ? "bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,1)]"
                                                                        : "bg-pink-300 shadow-[0_0_12px_rgba(244,114,182,1)]"
                                                                }
                                                                `}
                                                                style={
                                                                    {
                                                                        "--particle-angle":
                                                                            `${particleIndex * 30}deg`,
                                                                        animationDelay:
                                                                            `${particleIndex * 18}ms`,
                                                                    } as React.CSSProperties
                                                                }
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Bright vertical shine */}
                                                    <div className="pointer-events-none absolute inset-y-0 -left-1/2 z-30 w-1/3 animate-[draftRevealShine_850ms_100ms_ease-out_forwards] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                                                </>
                                            )}

                                            <img
                                                src={pick.character.imageUrl}
                                                alt={pick.character.name}
                                                draggable={false}
                                                className="
                                                    absolute inset-0
                                                    h-full w-full
                                                    object-cover object-[50%_20%]
                                                    transition duration-700
                                                    group-hover:scale-105
                                                "
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                                            {/* Top badges */}
                                            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                                                <span
                                                    className={`
                                                        ${
                                                        isJustRevealed
                                                            ? "animate-[draftBadgeDrop_550ms_180ms_cubic-bezier(.16,1,.3,1)_both]"
                                                            : ""
                                                        }
                                                        rounded-full border
                                                        px-3 py-1.5
                                                        text-xs font-black uppercase tracking-wider
                                                        backdrop-blur-md
                                                        ${
                                                        isPowerPosition
                                                            ? "border-yellow-300/30 bg-yellow-500/15 text-yellow-200"
                                                            : "border-white/10 bg-black/45 text-white"
                                                    }
                                                    `}
                                                >
                                                    {getPositionIcon(pick.position)}{" "}
                                                    {pick.position}
                                                </span>

                                                {pick.hasSynergy && (
                                                    <span className="animate-[draftBadgeDrop_550ms_250ms_cubic-bezier(.16,1,.3,1)_both] rounded-full border border-pink-300/20 bg-pink-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-pink-200 backdrop-blur-md">
                                                        Series Link
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom info */}
                                            <div className="absolute inset-x-0 bottom-0 p-5">
                                                <div
                                                    className={
                                                        isJustRevealed
                                                            ? "animate-[draftInfoRise_600ms_220ms_cubic-bezier(.16,1,.3,1)_both]"
                                                            : ""
                                                    }
                                                >
                                                    <h3 className="text-2xl font-black text-white drop-shadow-lg">
                                                        {pick.character.name}
                                                    </h3>

                                                    <p className="mt-1 line-clamp-1 text-sm font-medium text-white/60">
                                                        {pick.character.anime}
                                                    </p>
                                                </div>

                                                {ascensionApplied && receivedAscension && (
                                                    <div className="mt-3 flex items-center gap-2 animate-[draftInfoRise_450ms_ease-out_both]">
                                                        <span className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-200">
                                                            Ascended
                                                        </span>

                                                        <span className="text-sm font-black text-yellow-300">
                                                            +{ascensionBonus}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="mt-5 flex items-end justify-between">
                                                    <span
                                                        className={`
                                                            text-5xl font-black italic
                                                            ${
                                                            isJustRevealed
                                                                ? isElite
                                                                    ? "animate-[eliteGradeSlam_900ms_300ms_cubic-bezier(.16,1,.3,1)_both]"
                                                                    : "animate-[draftGradeSlam_700ms_320ms_cubic-bezier(.16,1,.3,1)_both]"
                                                                : ""
                                                            }
                                                            ${style.grade}
                                                            ${
                                                            ascensionApplied && receivedAscension
                                                                ? "scale-110"
                                                                : ""
                                                            }
                                                        `}
                                                    >
                                                        {displayedGrade}
                                                    </span>

                                                    <div
                                                        className={`
                                                            text-right
                                                            ${
                                                            isJustRevealed
                                                                ? "animate-[draftPowerSlam_650ms_380ms_cubic-bezier(.16,1,.3,1)_both]"
                                                                : ""
                                                            }
                                                        `}
                                                    >
                                                        <p
                                                            className={`text-3xl font-black transition-all duration-500 ${
                                                                ascensionApplied && receivedAscension
                                                                    ? "scale-110 text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.7)]"
                                                                    : "text-white"
                                                            }`}
                                                        >
                                                            {displayedPower}
                                                        </p>

                                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                                                            Power
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-950/40 to-black">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08),transparent_60%)]" />

                                            <p
                                                className={`relative text-4xl ${
                                                    isPowerPosition
                                                        ? "text-yellow-300/30"
                                                        : "text-pink-300/25"
                                                }`}
                                            >
                                                {getPositionIcon(pick.position)}
                                            </p>

                                            <p
                                                className={`relative mt-4 text-xs font-black uppercase tracking-[0.25em] ${
                                                    isPowerPosition
                                                        ? "text-yellow-300/40"
                                                        : "text-white/25"
                                                }`}
                                            >
                                                {pick.position}
                                            </p>

                                            <p className="relative mt-2 text-[10px] font-bold uppercase tracking-widest text-white/15">
                                                Awaiting Reveal
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>

                {revealPhase === "final" && (
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
                    )}
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
                
                @keyframes ascensionBackdrop {
                    0% {
                        opacity: 0;
                    }
                
                    12% {
                        opacity: 1;
                    }
                
                    82% {
                        opacity: 1;
                    }
                
                    100% {
                        opacity: 0;
                    }
                }
                
                @keyframes ascensionGlow {
                    0% {
                        opacity: 0;
                        transform: scale(0.4);
                    }
                
                    40% {
                        opacity: 1;
                        transform: scale(1);
                    }
                
                    100% {
                        opacity: 0;
                        transform: scale(1.8);
                    }
                }
                
                @keyframes ascensionRing {
                    0% {
                        opacity: 0;
                        transform: scale(0.25);
                    }
                
                    20% {
                        opacity: 1;
                    }
                
                    100% {
                        opacity: 0;
                        transform: scale(3);
                    }
                }
                
                @keyframes ascensionLabel {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                        letter-spacing: 0.9em;
                    }
                
                    to {
                        opacity: 1;
                        transform: translateY(0);
                        letter-spacing: 0.55em;
                    }
                }
                
                @keyframes ascensionTitle {
                    0% {
                        opacity: 0;
                        transform: scale(2.5) translateY(30px);
                        filter: blur(10px);
                    }
                
                    60% {
                        opacity: 1;
                        transform: scale(0.95) translateY(0);
                        filter: blur(0);
                    }
                
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes ascensionDescription {
                    0%,
                    35% {
                        opacity: 0;
                        transform: translateY(15px);
                    }
                
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes draftCardReveal {
                    0% {
                        opacity: 0;
                        transform:
                            perspective(900px)
                            scale(0.72)
                            rotateY(18deg)
                            translateY(35px);
                        filter: brightness(2) blur(5px);
                    }
                
                    35% {
                        opacity: 1;
                        transform:
                            perspective(900px)
                            scale(1.07)
                            rotateY(-3deg)
                            translateY(-5px);
                        filter: brightness(1.4) blur(0);
                    }
                
                    65% {
                        transform:
                            perspective(900px)
                            scale(0.98)
                            rotateY(1deg)
                            translateY(0);
                    }
                
                    100% {
                        opacity: 1;
                        transform:
                            perspective(900px)
                            scale(1)
                            rotateY(0deg)
                            translateY(0);
                        filter: brightness(1);
                    }
                }
                
                @keyframes draftRevealFlash {
                    0% {
                        opacity: 0;
                    }
                
                    12% {
                        opacity: 0.9;
                    }
                
                    35% {
                        opacity: 0.25;
                    }
                
                    100% {
                        opacity: 0;
                    }
                }
                
                @keyframes draftRevealRing {
                    0% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(0.2);
                    }
                
                    20% {
                        opacity: 1;
                    }
                
                    100% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(4);
                    }
                }
                
                @keyframes draftRevealShine {
                    0% {
                        left: -60%;
                        opacity: 0;
                    }
                
                    15% {
                        opacity: 1;
                    }
                
                    100% {
                        left: 140%;
                        opacity: 0;
                    }
                }
                
                @keyframes draftRevealParticle {
                    0% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            rotate(var(--particle-angle))
                            translateX(0)
                            scale(0);
                    }
                
                    20% {
                        opacity: 1;
                        transform:
                            translate(-50%, -50%)
                            rotate(var(--particle-angle))
                            translateX(20px)
                            scale(1.7);
                    }
                
                    100% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            rotate(var(--particle-angle))
                            translateX(130px)
                            scale(0.2);
                    }
                }
                
                @keyframes draftBadgeDrop {
                    0% {
                        opacity: 0;
                        transform:
                            translateY(-24px)
                            scale(0.8);
                    }
                
                    70% {
                        opacity: 1;
                        transform:
                            translateY(3px)
                            scale(1.04);
                    }
                
                    100% {
                        opacity: 1;
                        transform:
                            translateY(0)
                            scale(1);
                    }
                }
                
                @keyframes draftInfoRise {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes draftGradeSlam {
                    0% {
                        opacity: 0;
                        transform:
                            translateX(-30px)
                            scale(2.4)
                            rotate(-12deg);
                    }
                
                    55% {
                        opacity: 1;
                        transform:
                            translateX(4px)
                            scale(0.92)
                            rotate(-3deg);
                    }
                
                    75% {
                        transform:
                            translateX(0)
                            scale(1.08)
                            rotate(-3deg);
                    }
                
                    100% {
                        opacity: 1;
                        transform:
                            translateX(0)
                            scale(1)
                            rotate(0);
                    }
                }
                
                @keyframes draftPowerSlam {
                    0% {
                        opacity: 0;
                        transform:
                            translateX(25px)
                            scale(1.8);
                    }
                
                    60% {
                        opacity: 1;
                        transform:
                            translateX(-3px)
                            scale(0.95);
                    }
                
                    100% {
                        opacity: 1;
                        transform:
                            translateX(0)
                            scale(1);
                    }
                }
                
                @keyframes teamPowerImpact {
                    0% {
                        transform: scale(0.92);
                        filter: brightness(1);
                    }
                
                    45% {
                        transform: scale(1.08);
                        filter: brightness(1.7);
                    }
                
                    100% {
                        transform: scale(1);
                        filter: brightness(1);
                    }
                }
            @keyframes eliteCardReveal {
                0% {
                    opacity: 0;
                    transform:
                        perspective(1000px)
                        scale(0.45)
                        rotateY(30deg)
                        translateY(55px);
                    filter: brightness(3) blur(8px);
                }
            
                30% {
                    opacity: 1;
                    transform:
                        perspective(1000px)
                        scale(1.14)
                        rotateY(-6deg)
                        translateY(-10px);
                    filter: brightness(1.9) blur(0);
                }
            
                55% {
                    transform:
                        perspective(1000px)
                        scale(0.96)
                        rotateY(2deg);
                }
            
                75% {
                    transform:
                        perspective(1000px)
                        scale(1.04)
                        rotateY(0deg);
                }
            
                100% {
                    opacity: 1;
                    transform:
                        perspective(1000px)
                        scale(1)
                        rotateY(0deg)
                        translateY(0);
                    filter: brightness(1);
                }
            }
            @keyframes eliteScreenFlash {
                0% {
                    opacity: 0;
                }
            
                8% {
                    opacity: 0.75;
                }
            
                20% {
                    opacity: 0.2;
                }
            
                100% {
                    opacity: 0;
                }
            }
            @keyframes eliteRevealRing {
                0% {
                    opacity: 0;
                    transform:
                        translate(-50%, -50%)
                        scale(0.15);
                }
            
                15% {
                    opacity: 1;
                }
            
                100% {
                    opacity: 0;
                    transform:
                        translate(-50%, -50%)
                        scale(5);
                }
            }
            @keyframes eliteGlowBurst {
                0% {
                    opacity: 0;
                    transform:
                        translate(-50%, -50%)
                        scale(0.2);
                }
            
                30% {
                    opacity: 1;
                    transform:
                        translate(-50%, -50%)
                        scale(1);
                }
            
                100% {
                    opacity: 0;
                    transform:
                        translate(-50%, -50%)
                        scale(2.2);
                }
            }
            @keyframes eliteGradeSlam {
                0% {
                    opacity: 0;
                    transform:
                        scale(5)
                        rotate(-20deg);
                    filter: blur(8px);
                }
            
                45% {
                    opacity: 1;
                    transform:
                        scale(0.8)
                        rotate(-5deg);
                    filter: blur(0);
                }
            
                60% {
                    transform:
                        scale(1.25)
                        rotate(-3deg);
                }
            
                78% {
                    transform:
                        scale(0.96);
                }
            
                100% {
                    opacity: 1;
                    transform:
                        scale(1)
                        rotate(0);
                }
            }
            `}
            </style>
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