"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { draftCharacters, DraftCharacter, DraftPosition } from "@/data/draftCharacters";
import { calculateDraftPower } from "@/data/draftLogic";
import {
    auth,
    getDraftHighScore,
    saveDraftHighScore,
    type DraftHighScore,
} from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

type DraftPick = {
    character: DraftCharacter;
    position: DraftPosition;
    basePower: number;
    power: number;
    grade: string;
    hasSynergy?: boolean;
};

type PowerBurst = {
    id: number;
    amount: number;
};

const positions: DraftPosition[] = [
    "Captain",
    "Vice Captain",
    "Support",
    "Scout",
    "Strategist",
    "Assassin",
    "Ace",
    "Vanguard",
];

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

function getLetterGrade(score: number) {
    if (score >= 95) return "S+";
    if (score >= 90) return "S";
    if (score >= 85) return "A+";
    if (score >= 80) return "A";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
}

function getGradeGlow(grade: string) {
    switch (grade) {
        case "S+":
            return "border-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.75)]";
        case "S":
            return "border-purple-400 shadow-[0_0_28px_rgba(168,85,247,0.65)]";
        case "A+":
            return "border-blue-400 shadow-[0_0_24px_rgba(96,165,250,0.6)]";
        case "A":
            return "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]";
        case "B+":
            return "border-green-400 shadow-[0_0_16px_rgba(74,222,128,0.45)]";
        case "B":
            return "border-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.35)]";
        case "C":
            return "border-orange-300 shadow-[0_0_10px_rgba(253,186,116,0.3)]";
        case "D":
            return "border-red-300 shadow-[0_0_8px_rgba(252,165,165,0.25)]";
        default:
            return "border-gray-300 shadow-sm";
    }
}

function getDraftGrade(average: number) {
    if (average >= 94) return "Legendary";
    if (average >= 88) return "S";
    if (average >= 82) return "A";
    if (average >= 74) return "B";
    if (average >= 66) return "C";
    return "D";
}

function getRandomCharacter(usedIds: string[]) {
    const available = draftCharacters.filter(
        (character) => !usedIds.includes(character.id)
    );

    return available[Math.floor(Math.random() * available.length)];
}

function applySynergyBonuses(picks: DraftPick[]) {
    const animeCounts = picks.reduce<Record<string, number>>((counts, pick) => {
        counts[pick.character.anime] = (counts[pick.character.anime] ?? 0) + 1;
        return counts;
    }, {});

    return picks.map((pick) => {
        const sameAnimeCount = animeCounts[pick.character.anime] ?? 1;
        const hasSynergy = sameAnimeCount >= 2;
        const synergyBonus = hasSynergy ? Math.min(sameAnimeCount - 1, 3) : 0;
        const power = Math.min(99, pick.basePower + synergyBonus);

        return {
            ...pick,
            power,
            grade: getLetterGrade(power),
            hasSynergy,
        };
    });
}

function DraftCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border border-purple-200 bg-purple-50 shadow-lg">
            <div className="h-80 w-full animate-pulse bg-purple-200/70" />

            <div className="space-y-3 p-5">
                <div className="h-7 w-3/4 animate-pulse rounded-full bg-purple-200" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-purple-100" />
            </div>
        </div>
    );
}

function TeamPowerCounter({
                              totalPower,
                              bursts,
                          }: {
    totalPower: number;
    bursts: PowerBurst[];
}) {
    return (
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-950 via-purple-900 to-black p-5 text-white shadow-[0_0_25px_rgba(126,34,206,0.35)]">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-300/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-fuchsia-400/20 blur-2xl" />

            {bursts.map((burst) => (
                <span
                    key={burst.id}
                    className="pointer-events-none absolute right-6 top-6 z-20 text-3xl font-black text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]"
                    style={{
                        animation: "powerBurst 1s ease-out forwards",
                    }}
                >
                    +{burst.amount}
                </span>
            ))}

            <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-200">
                    Team Power
                </p>

                <div className="mt-3 flex items-end gap-3">
                    <p className="text-6xl font-black leading-none text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.55)]">
                        {totalPower}
                    </p>

                    <p className="pb-2 text-xs font-bold uppercase tracking-widest text-white/50">
                        Total
                    </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-fuchsia-300 to-purple-300 transition-all duration-500"
                        style={{
                            width: `${Math.min((totalPower / 800) * 100, 100)}%`,
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes powerBurst {
                    0% {
                        opacity: 0;
                        transform: translateY(12px) scale(0.6);
                    }
                    20% {
                        opacity: 1;
                        transform: translateY(-12px) scale(1.25);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-70px) scale(0.85);
                    }
                }
            `}</style>
        </div>
    );
}

export default function DraftPage() {
    const [usedCharacterIds, setUsedCharacterIds] = useState<string[]>([]);
    const [currentCharacter, setCurrentCharacter] = useState<DraftCharacter | null>(null);
    const [hoveredPosition, setHoveredPosition] = useState<DraftPosition | null>(null);
    const [picks, setPicks] = useState<DraftPick[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [highScore, setHighScore] = useState<DraftHighScore | null>(null);
    const [rerollUsed, setRerollUsed] = useState(false);
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const [isDraggingCard, setIsDraggingCard] = useState(false);
    const [pendingPick, setPendingPick] = useState<{
        character: DraftCharacter;
        position: DraftPosition;
    } | null>(null);
    const [powerBursts, setPowerBursts] = useState<PowerBurst[]>([]);
    const [lastPowerIncrease, setLastPowerIncrease] = useState(0);

    const droppedInSlotRef = useRef(false);
    const dragSkeletonTimeoutRef = useRef<number | null>(null);

    const filledPositions = picks.map((pick) => pick.position);
    const draftComplete = picks.length === positions.length;

    const totalPower = useMemo(() => {
        return picks.reduce((total, pick) => total + pick.power, 0);
    }, [picks]);

    const averagePower = draftComplete
        ? Math.round(totalPower / positions.length)
        : 0;

    const sortedPicks = useMemo(() => {
        return [...picks].sort(
            (a, b) => positions.indexOf(a.position) - positions.indexOf(b.position)
        );
    }, [picks]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setHighScore(null);
                return;
            }

            const savedHighScore = await getDraftHighScore(currentUser.uid);
            setHighScore(savedHighScore);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setCurrentCharacter(getRandomCharacter([]));
    }, []);

    useEffect(() => {
        async function updateHighScore() {
            if (!draftComplete || !user) return;

            const draftGrade = getDraftGrade(averagePower);

            if (!highScore || totalPower > highScore.totalPower) {
                const newHighScore: Omit<DraftHighScore, "userId" | "updatedAt"> = {
                    totalPower,
                    averagePower,
                    grade: draftGrade,
                    lineup: sortedPicks.map((pick) => ({
                        position: pick.position,
                        power: pick.power,
                        grade: pick.grade,
                        character: {
                            id: pick.character.id,
                            name: pick.character.name,
                            anime: pick.character.anime,
                            imageUrl: pick.character.imageUrl ?? "",
                        },
                    })),
                };

                await saveDraftHighScore(user.uid, newHighScore);
                setIsNewHighScore(true);

                setHighScore({
                    userId: user.uid,
                    ...newHighScore,
                });
            }
        }

        updateHighScore();
    }, [draftComplete, user, totalPower, averagePower, highScore, sortedPicks]);

    if (!currentCharacter) {
        return null;
    }

    function handleDragStart(event: React.DragEvent<HTMLDivElement>) {
        if (pendingPick || !currentCharacter) return;

        event.dataTransfer.setData("text/plain", currentCharacter.id);
        event.dataTransfer.effectAllowed = "move";

        setIsDraggingCard(true);
    }

    function handleDragEnd() {
        setIsDraggingCard(false);
        setHoveredPosition(null);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>, position: DraftPosition) {
        event.preventDefault();
        event.stopPropagation();

        if (dragSkeletonTimeoutRef.current !== null) {
            window.clearTimeout(dragSkeletonTimeoutRef.current);
            dragSkeletonTimeoutRef.current = null;
        }

        if (
            filledPositions.includes(position) ||
            draftComplete ||
            !currentCharacter
        ) {
            setIsDraggingCard(false);
            return;
        }

        droppedInSlotRef.current = true;

        setPendingPick({
            character: currentCharacter,
            position,
        });

        setHoveredPosition(null);
        setIsDraggingCard(false);
    }

    function rerollCharacter() {
        if (rerollUsed || draftComplete || !currentCharacter || pendingPick) return;

        setCurrentCharacter(
            getRandomCharacter([...usedCharacterIds, currentCharacter.id])
        );

        setRerollUsed(true);
    }

    function cancelPendingPick() {
        setPendingPick(null);
        setHoveredPosition(null);
        setIsDraggingCard(false);
    }

    function confirmPick() {
        if (!pendingPick) return;

        const previousTotal = picks.reduce((total, pick) => total + pick.power, 0);

        const basePower = calculateDraftPower(
            pendingPick.character,
            pendingPick.position
        );

        const newPick: DraftPick = {
            character: pendingPick.character,
            position: pendingPick.position,
            basePower,
            power: basePower,
            grade: getLetterGrade(basePower),
        };

        const updatedPicks = applySynergyBonuses([...picks, newPick]);
        const newTotal = updatedPicks.reduce((total, pick) => total + pick.power, 0);
        const increase = newTotal - previousTotal;

        const newUsedIds = [...usedCharacterIds, pendingPick.character.id];

        setPicks(updatedPicks);
        setUsedCharacterIds(newUsedIds);
        setPendingPick(null);
        setHoveredPosition(null);
        setLastPowerIncrease(increase);

        const burstId = Date.now();

        setPowerBursts((current) => [
            ...current,
            {
                id: burstId,
                amount: increase,
            },
        ]);

        window.setTimeout(() => {
            setPowerBursts((current) =>
                current.filter((burst) => burst.id !== burstId)
            );
        }, 1000);

        if (picks.length + 1 < positions.length) {
            setCurrentCharacter(getRandomCharacter(newUsedIds));
        }
    }

    function restartDraft() {
        setUsedCharacterIds([]);
        setCurrentCharacter(getRandomCharacter([]));
        setHoveredPosition(null);
        setPendingPick(null);
        setPicks([]);
        setRerollUsed(false);
        setIsNewHighScore(false);
        setIsDraggingCard(false);
        setPowerBursts([]);
        setLastPowerIncrease(0);
    }

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-[1600px] px-4 py-10">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />
                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />
                <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>
            <section
                className="
                    relative z-10
                    rounded-3xl
                    border border-pink-500/20
                    bg-black/40
                    p-8
                    backdrop-blur-xl
                    shadow-[0_0_25px_rgba(236,72,153,0.08)]
                "
            >
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Anime Draft
                </p>

                <h1 className="mt-3 text-5xl font-black text-white">
                    Blind Character Draft
                </h1>

                <p className="mt-3 text-purple-100/70">
                    Drag the character into a position. Once confirmed, that slot is locked.
                </p>

                {!draftComplete && (
                    <div className="mt-8 grid gap-8 xl:grid-cols-[340px_1fr]">
                        <div>
                            <h2 className="mb-4 text-xl font-bold text-white">
                                Current Character
                            </h2>

                            <div
                                draggable={!pendingPick}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                className={`relative min-h-[420px] overflow-hidden rounded-3xl border border-pink-500/30 bg-black transition shadow-[0_0_30px_rgba(236,72,153,0.18)] ${
                                    pendingPick
                                        ? "cursor-not-allowed opacity-40"
                                        : isDraggingCard
                                            ? "cursor-grabbing scale-95 opacity-40"
                                            : "cursor-grab active:cursor-grabbing"
                                }`}
                            >
                                <img
                                    src={currentCharacter.imageUrl}
                                    alt={currentCharacter.name}
                                    draggable={false}
                                    className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
                                        Drag to Position
                                    </p>

                                    <h3 className="mt-2 text-3xl font-black text-white drop-shadow">
                                        {currentCharacter.name}
                                    </h3>

                                    <p className="text-base font-medium text-white/75">
                                        {currentCharacter.anime}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={rerollCharacter}
                                disabled={rerollUsed || !!pendingPick}
                                className={`group relative mt-4 w-full overflow-hidden rounded-3xl border px-5 py-4 transition-all duration-300 hover:cursor-pointer ${
                                    rerollUsed
                                        ? "cursor-not-allowed border-zinc-300 bg-zinc-100 text-zinc-500 opacity-70"
                                        : "border-yellow-400 bg-gradient-to-br from-yellow-300 via-amber-300 to-yellow-500 text-purple-950 shadow-[0_0_18px_rgba(250,204,21,0.45)] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(250,204,21,0.75)]"
                                }`}
                            >
                                {!rerollUsed && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                                        <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/20 blur-xl" />
                                    </>
                                )}

                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    <span className="text-xl">
                                        {rerollUsed ? "✓" : "🎲"}
                                    </span>

                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-widest">
                                            {rerollUsed ? "Reroll Used" : "Fate Rewrite"}
                                        </p>

                                        <p
                                            className={`text-xs ${
                                                rerollUsed
                                                    ? "text-zinc-500"
                                                    : "text-purple-950/70"
                                            }`}
                                        >
                                            {rerollUsed
                                                ? "No rerolls remaining"
                                                : "One chance to redraw"}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <TeamPowerCounter
                                totalPower={totalPower}
                                bursts={powerBursts}
                            />
                        </div>

                        <div>
                            <h2 className="mb-4 text-xl font-bold text-white">
                                Team Positions
                            </h2>

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
                                {positions.map((position) => {
                                    const pick = picks.find(
                                        (pick) => pick.position === position
                                    );

                                    const pendingForThisPosition =
                                        pendingPick?.position === position ? pendingPick : null;

                                    const isHovered = hoveredPosition === position;

                                    return (
                                        <div
                                            key={position}
                                            onDragOver={(event) => {
                                                event.preventDefault();

                                                if (!pick && !pendingPick) {
                                                    setHoveredPosition(position);
                                                }
                                            }}
                                            onDragLeave={() => setHoveredPosition(null)}
                                            onDrop={(event) => handleDrop(event, position)}
                                            className={`min-h-[390px] rounded-3xl border-2 border-dashed p-4 transition ${
                                                pick
                                                    ? "border-pink-500/30 bg-black/40 backdrop-blur-xl"
                                                    : pendingForThisPosition
                                                        ? "border-yellow-400 bg-yellow-500/10 shadow-[0_0_25px_rgba(250,204,21,0.25)]"
                                                        : isHovered
                                                            ? "border-pink-400 bg-pink-500/10 shadow-[0_0_25px_rgba(236,72,153,0.25)]"
                                                            : "border-pink-500/20 bg-black/20"
                                            }`}
                                        >
                                            <p className="text-sm font-bold uppercase tracking-widest text-pink-300/60">
                                                {positionIcons[position]} {position}
                                            </p>

                                            {!pick && !pendingForThisPosition && (
                                                <div className="mt-8 text-center text-sm font-semibold text-pink-300/60">
                                                    Drop character here
                                                </div>
                                            )}

                                            {!pick && pendingForThisPosition && (
                                                <div className="relative mt-4 min-h-[320px] overflow-hidden rounded-2xl border-2 border-yellow-300 bg-black shadow-md">
                                                    <img
                                                        src={pendingForThisPosition.character.imageUrl}
                                                        alt={pendingForThisPosition.character.name}
                                                        draggable={false}
                                                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

                                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-yellow-300">
                                                            Confirm placement?
                                                        </p>

                                                        <h3 className="mt-2 text-xl font-black text-white drop-shadow">
                                                            {pendingForThisPosition.character.name}
                                                        </h3>

                                                        <p className="text-sm font-medium text-white/75">
                                                            {pendingForThisPosition.character.anime}
                                                        </p>

                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={confirmPick}
                                                                className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-black text-purple-950 transition hover:cursor-pointer hover:bg-yellow-200"
                                                            >
                                                                Confirm
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={cancelPendingPick}
                                                                className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:cursor-pointer hover:bg-white/20"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {pick && (
                                                <div
                                                    className={`relative mt-4 min-h-[320px] overflow-hidden rounded-2xl border-2 bg-black transition ${
                                                        pick.hasSynergy
                                                            ? "border-pink-300 shadow-[0_0_24px_rgba(244,114,182,0.55)]"
                                                            : getGradeGlow(pick.grade)
                                                    }`}
                                                >
                                                    <img
                                                        src={pick.character.imageUrl}
                                                        alt={pick.character.name}
                                                        draggable={false}
                                                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                                                        {pick.hasSynergy && (
                                                            <p className="mb-2 text-xs font-black uppercase tracking-widest text-pink-300">
                                                                Series Link
                                                            </p>
                                                        )}

                                                        <h3 className="text-xl font-black text-white drop-shadow">
                                                            {pick.character.name}
                                                        </h3>

                                                        <p className="text-sm font-medium text-white/75">
                                                            {pick.character.anime}
                                                        </p>

                                                        <p className="mt-3 text-3xl font-black text-yellow-300 drop-shadow">
                                                            {pick.grade}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {draftComplete && (
                    <div className="mt-10 text-center">
                        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-pink-500/30 bg-gradient-to-br from-purple-950 via-purple-900 to-black p-8 text-white shadow-[0_0_60px_rgba(236,72,153,0.30)]">
                            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-yellow-300/20 blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-fuchsia-400/20 blur-3xl" />

                            <div className="relative z-10">
                                <p className="text-xs font-black uppercase tracking-[0.45em] text-yellow-300">
                                    Draft Complete
                                </p>

                                <h2 className="mt-4 text-5xl font-black text-white drop-shadow md:text-6xl">
                                    {getDraftGrade(averagePower)} Draft
                                </h2>

                                <div className="mt-8 grid gap-4 md:grid-cols-3">
                                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                        <p className="text-xs font-black uppercase tracking-widest text-purple-200">
                                            Total Power
                                        </p>

                                        <p className="mt-2 text-5xl font-black text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.65)]">
                                            {totalPower}
                                        </p>
                                    </div>

                                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                        <p className="text-xs font-black uppercase tracking-widest text-purple-200">
                                            Average Power
                                        </p>

                                        <p className="mt-2 text-5xl font-black text-white">
                                            {averagePower}
                                        </p>
                                    </div>

                                    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                                        <p className="text-xs font-black uppercase tracking-widest text-purple-200">
                                            Grade
                                        </p>

                                        <p className="mt-2 text-5xl font-black text-fuchsia-300 drop-shadow-[0_0_18px_rgba(217,70,239,0.65)]">
                                            {getDraftGrade(averagePower)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {highScore && (
                            <div
                                className={`mx-auto mt-6 max-w-3xl overflow-hidden rounded-3xl border p-5 transition ${
                                    isNewHighScore
                                        ? "animate-pulse border-yellow-300 bg-gradient-to-br from-yellow-300 via-amber-200 to-purple-200 shadow-[0_0_40px_rgba(250,204,21,0.85)]"
                                        : "border-purple-300 bg-gradient-to-br from-purple-950 via-purple-900 to-black shadow-[0_0_25px_rgba(126,34,206,0.35)]"
                                }`}
                            >
                                <div className="flex flex-col gap-4 text-center text-white sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-left">
                                        <p
                                            className={`text-xs font-black uppercase tracking-[0.3em] ${
                                                isNewHighScore ? "text-purple-950" : "text-yellow-300"
                                            }`}
                                        >
                                            {isNewHighScore ? "✨ New Record ✨" : "High Score"}
                                        </p>

                                        <p
                                            className={`mt-1 text-sm font-semibold ${
                                                isNewHighScore ? "text-purple-900" : "text-white/60"
                                            }`}
                                        >
                                            Best saved draft
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-5">
                                        <div>
                                            <p
                                                className={`text-4xl font-black ${
                                                    isNewHighScore ? "text-purple-950" : "text-yellow-300"
                                                }`}
                                            >
                                                {highScore.totalPower}
                                            </p>

                                            <p
                                                className={`text-xs font-bold uppercase ${
                                                    isNewHighScore ? "text-purple-900" : "text-white/50"
                                                }`}
                                            >
                                                Total
                                            </p>
                                        </div>

                                        <div className="h-12 w-px bg-white/20" />

                                        <div>
                                            <p
                                                className={`text-4xl font-black ${
                                                    isNewHighScore ? "text-purple-950" : "text-white"
                                                }`}
                                            >
                                                {highScore.averagePower}
                                            </p>

                                            <p
                                                className={`text-xs font-bold uppercase ${
                                                    isNewHighScore ? "text-purple-900" : "text-white/50"
                                                }`}
                                            >
                                                Avg
                                            </p>
                                        </div>

                                        <div className="h-12 w-px bg-white/20" />

                                        <div>
                                            <p
                                                className={`text-4xl font-black ${
                                                    isNewHighScore ? "text-purple-950" : "text-fuchsia-300"
                                                }`}
                                            >
                                                {highScore.grade}
                                            </p>

                                            <p
                                                className={`text-xs font-bold uppercase ${
                                                    isNewHighScore ? "text-purple-900" : "text-white/50"
                                                }`}
                                            >
                                                Grade
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {sortedPicks.map((pick) => (
                                <div
                                    key={pick.position}
                                    className={`relative min-h-[360px] overflow-hidden rounded-3xl border-2 bg-black text-left transition ${
                                        pick.hasSynergy
                                            ? "border-pink-300 shadow-[0_0_28px_rgba(244,114,182,0.6)]"
                                            : getGradeGlow(pick.grade)
                                    }`}
                                >
                                    <img
                                        src={pick.character.imageUrl}
                                        alt={pick.character.name}
                                        draggable={false}
                                        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-purple-200">
                                            {positionIcons[pick.position]} {pick.position}
                                        </p>

                                        {pick.hasSynergy && (
                                            <p className="mt-2 text-xs font-black uppercase tracking-widest text-pink-300">
                                                Series Link
                                            </p>
                                        )}

                                        <h3 className="mt-2 text-xl font-black text-white drop-shadow">
                                            {pick.character.name}
                                        </h3>

                                        <p className="text-sm font-medium text-white/75">
                                            {pick.character.anime}
                                        </p>

                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-3xl font-black text-yellow-300 drop-shadow">
                                                {pick.grade}
                                            </span>

                                            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-black text-white backdrop-blur">
                                                {pick.power}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={restartDraft}
                            className="
                            mt-8
                            rounded-2xl
                            border border-pink-500/30
                            bg-gradient-to-r
                            from-pink-600
                            via-fuchsia-600
                            to-purple-700
                            px-8
                            py-4
                            font-black
                            text-white
                            shadow-[0_0_30px_rgba(236,72,153,0.35)]
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-[0_0_45px_rgba(236,72,153,0.65)]
                            hover:cursor-pointer
                            "
                        >
                            Start New Draft
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}