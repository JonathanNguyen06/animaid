"use client";

import { useEffect, useMemo, useState } from "react";
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

        setTimeout(() => {
            setIsDraggingCard(true);
        }, 0);
    }

    function handleDragEnd() {
        setIsDraggingCard(false);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>, position: DraftPosition) {
        event.preventDefault();

        const draggedCharacterId = event.dataTransfer.getData("text/plain");

        if (
            !draggedCharacterId ||
            filledPositions.includes(position) ||
            draftComplete ||
            !currentCharacter
        ) {
            return;
        }

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

        const newUsedIds = [...usedCharacterIds, pendingPick.character.id];

        setPicks((current) => applySynergyBonuses([...current, newPick]));
        setUsedCharacterIds(newUsedIds);
        setPendingPick(null);
        setHoveredPosition(null);

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
    }

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-[1600px] px-4 py-10">
            <section className="relative z-10 rounded-3xl border border-purple-200 bg-white p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Anime Draft
                </p>

                <h1 className="mt-3 text-4xl font-bold text-purple-950">
                    Blind Character Draft
                </h1>

                <p className="mt-3 text-purple-900/70">
                    Drag the character into a position. Once confirmed, that slot is locked.
                </p>

                {!draftComplete && (
                    <div className="mt-8 grid gap-8 xl:grid-cols-[340px_1fr]">
                        <div>
                            <h2 className="mb-4 text-xl font-bold text-purple-950">
                                Current Character
                            </h2>

                            {isDraggingCard || pendingPick ? (
                                <DraftCardSkeleton />
                            ) : (
                                <div
                                    draggable
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    className="cursor-grab overflow-hidden rounded-3xl border border-purple-200 bg-purple-50 shadow-lg transition active:cursor-grabbing active:scale-95"
                                >
                                    <img
                                        src={currentCharacter.imageUrl}
                                        alt={currentCharacter.name}
                                        draggable={false}
                                        className="pointer-events-none h-80 w-full object-cover object-[50%_20%]"
                                    />

                                    <div className="p-5">
                                        <h3 className="text-2xl font-bold text-purple-950">
                                            {currentCharacter.name}
                                        </h3>

                                        <p className="mt-1 text-sm font-medium text-purple-900/60">
                                            {currentCharacter.anime}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={rerollCharacter}
                                disabled={rerollUsed || !!pendingPick}
                                className="mt-4 w-full rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 font-bold text-yellow-800 transition hover:cursor-pointer hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {rerollUsed ? "Reroll Used" : "Reroll Character"}
                            </button>
                        </div>

                        <div>
                            <h2 className="mb-4 text-xl font-bold text-purple-950">
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
                                                    ? "border-purple-200 bg-white"
                                                    : pendingForThisPosition
                                                        ? "border-yellow-400 bg-yellow-50"
                                                        : isHovered
                                                            ? "border-purple-500 bg-purple-100"
                                                            : "border-purple-200 bg-purple-50"
                                            }`}
                                        >
                                            <p className="text-sm font-bold uppercase tracking-widest text-purple-900/50">
                                                {positionIcons[position]} {position}
                                            </p>

                                            {!pick && !pendingForThisPosition && (
                                                <div className="mt-8 text-center text-sm font-semibold text-purple-900/50">
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
                        <p className="text-sm font-bold uppercase tracking-widest text-purple-900/50">
                            Draft Complete
                        </p>

                        <h2 className="mt-3 text-5xl font-black text-purple-950">
                            {getDraftGrade(averagePower)} Draft
                        </h2>

                        <p className="mt-3 text-xl font-bold text-purple-900">
                            Total Power: {totalPower}
                        </p>

                        <p className="mt-1 text-purple-900/60">
                            Average Rating: {averagePower}
                        </p>

                        {highScore && (
                            <div
                                className={`mx-auto mt-6 max-w-md rounded-2xl border p-5 transition ${
                                    isNewHighScore
                                        ? "animate-pulse border-yellow-400 bg-gradient-to-br from-yellow-50 via-white to-purple-50 shadow-[0_0_35px_rgba(250,204,21,0.75)]"
                                        : "border-yellow-300 bg-yellow-50"
                                }`}
                            >
                                {isNewHighScore && (
                                    <p className="mb-2 text-sm font-black uppercase tracking-widest text-yellow-600">
                                        ✨ New Record! ✨
                                    </p>
                                )}

                                <p className="text-sm font-bold uppercase tracking-widest text-yellow-700">
                                    High Score
                                </p>

                                <p className="mt-2 text-2xl font-black text-purple-950">
                                    {highScore.totalPower}
                                </p>

                                <p className="text-sm font-semibold text-purple-900/60">
                                    {highScore.grade} Draft • Average {highScore.averagePower}
                                </p>
                            </div>
                        )}

                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {sortedPicks.map((pick) => (
                                <div
                                    key={pick.position}
                                    className={`overflow-hidden rounded-3xl border-2 bg-purple-50 text-left transition ${
                                        pick.hasSynergy
                                            ? "border-pink-300 shadow-[0_0_28px_rgba(244,114,182,0.6)]"
                                            : getGradeGlow(pick.grade)
                                    }`}
                                >
                                    <img
                                        src={pick.character.imageUrl}
                                        alt={pick.character.name}
                                        draggable={false}
                                        className="pointer-events-none h-56 w-full object-cover object-[50%_20%]"
                                    />

                                    <div className="p-5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                            {positionIcons[pick.position]} {pick.position}
                                        </p>

                                        <h3 className="mt-2 text-xl font-bold text-purple-950">
                                            {pick.character.name}
                                        </h3>

                                        <p className="text-sm text-purple-900/60">
                                            {pick.character.anime}
                                        </p>

                                        {pick.hasSynergy && (
                                            <p className="mt-2 text-xs font-black uppercase tracking-widest text-pink-500">
                                                Series Link
                                            </p>
                                        )}

                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-2xl font-black text-purple-900">
                                                {pick.grade}
                                            </span>

                                            <span className="rounded-full bg-purple-900 px-3 py-1 text-sm font-bold text-white">
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
                            className="mt-8 rounded-2xl bg-purple-900 px-6 py-3 font-bold text-white transition hover:cursor-pointer hover:bg-purple-800"
                        >
                            Start New Draft
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}