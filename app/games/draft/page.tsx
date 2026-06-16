"use client";

import {useEffect, useMemo, useState} from "react";
import { draftCharacters, DraftCharacter, DraftPosition } from "@/data/draftCharacters";
import { calculateDraftPower } from "@/data/draftLogic";

type DraftPick = {
    character: DraftCharacter;
    position: DraftPosition;
    power: number;
    grade: string;
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

export default function DraftPage() {
    const [usedCharacterIds, setUsedCharacterIds] = useState<string[]>([]);
    const [currentCharacter, setCurrentCharacter] = useState<DraftCharacter | null>(null);
    const [hoveredPosition, setHoveredPosition] = useState<DraftPosition | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<DraftPosition | null>(null);
    const [picks, setPicks] = useState<DraftPick[]>([]);

    const filledPositions = picks.map((pick) => pick.position);
    const draftComplete = picks.length === positions.length;

    const totalPower = useMemo(() => {
        return picks.reduce((total, pick) => total + pick.power, 0);
    }, [picks]);

    const averagePower = draftComplete
        ? Math.round(totalPower / positions.length)
        : 0;

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

    useEffect(() => {
        setCurrentCharacter(getRandomCharacter([]));
    }, []);

    if (!currentCharacter) {
        return null;
    }

    function handleDragStart(event: React.DragEvent) {
        if (!currentCharacter) return;

        event.dataTransfer.setData("text/plain", currentCharacter.id);
    }

    function handleDrop(position: DraftPosition) {
        if (filledPositions.includes(position) || draftComplete) return;

        setSelectedPosition(position);
        setHoveredPosition(null);
    }

    function confirmPick() {
        if (!selectedPosition || !currentCharacter) return;

        const power = calculateDraftPower(currentCharacter, selectedPosition);

        const newPick: DraftPick = {
            character: currentCharacter,
            position: selectedPosition,
            power,
            grade: getLetterGrade(power),
        };

        const newUsedIds = [...usedCharacterIds, currentCharacter.id];

        setPicks((current) => [...current, newPick]);
        setUsedCharacterIds(newUsedIds);
        setSelectedPosition(null);

        if (picks.length + 1 < positions.length) {
            setCurrentCharacter(getRandomCharacter(newUsedIds));
        }
    }

    function restartDraft() {
        const firstCharacter = getRandomCharacter([]);

        setUsedCharacterIds([]);
        setCurrentCharacter(firstCharacter);
        setHoveredPosition(null);
        setSelectedPosition(null);
        setPicks([]);
    }

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-7xl px-4 py-10">
            <section className="rounded-3xl border border-purple-200 bg-white relative z-10 p-8 shadow-sm">
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
                    <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
                        <div>
                            <h2 className="mb-4 text-xl font-bold text-purple-950">
                                Current Character
                            </h2>

                            <div
                                draggable
                                onDragStart={handleDragStart}
                                className="cursor-grab overflow-hidden rounded-3xl border border-purple-200 bg-purple-50 shadow-lg active:cursor-grabbing"
                            >
                                <img
                                    src={currentCharacter.imageUrl}
                                    alt={currentCharacter.name}
                                    className="h-80 w-full object-cover"
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

                            {selectedPosition && (
                                <div className="mt-5 rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
                                    <p className="font-semibold text-purple-950">
                                        Place {currentCharacter.name} at{" "}
                                        <span className="text-yellow-700">
                                            {selectedPosition}
                                        </span>
                                        ?
                                    </p>

                                    <div className="mt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={confirmPick}
                                            className="rounded-xl bg-purple-900 px-4 py-2 font-bold text-white transition hover:bg-purple-800 hover:cursor-pointer"
                                        >
                                            Confirm
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedPosition(null)}
                                            className="rounded-xl border border-purple-200 px-4 py-2 font-bold text-purple-900 transition hover:bg-purple-50 hover:cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="mb-4 text-xl font-bold text-purple-950">
                                Team Positions
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {positions.map((position) => {
                                    const pick = picks.find(
                                        (pick) => pick.position === position
                                    );

                                    const isHovered = hoveredPosition === position;
                                    const isSelected = selectedPosition === position;

                                    return (
                                        <div
                                            key={position}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                if (!pick) setHoveredPosition(position);
                                            }}
                                            onDragLeave={() => setHoveredPosition(null)}
                                            onDrop={() => handleDrop(position)}
                                            className={`min-h-56 rounded-3xl border-2 border-dashed p-4 transition ${
                                                pick
                                                    ? "border-purple-200 bg-white"
                                                    : isSelected
                                                        ? "border-yellow-400 bg-yellow-50"
                                                        : isHovered
                                                            ? "border-purple-500 bg-purple-100"
                                                            : "border-purple-200 bg-purple-50"
                                            }`}
                                        >
                                            <p className="text-sm font-bold uppercase tracking-widest text-purple-900/50">
                                                {positionIcons[position]} {position}
                                            </p>

                                            {!pick && (
                                                <div className="mt-8 text-center text-sm font-semibold text-purple-900/50">
                                                    Drop character here
                                                </div>
                                            )}

                                            {pick && (
                                                <div
                                                    className={`mt-4 overflow-hidden rounded-2xl border-2 bg-white transition ${getGradeGlow(
                                                        pick.grade
                                                    )}`}
                                                >
                                                    <img
                                                        src={pick.character.imageUrl}
                                                        alt={pick.character.name}
                                                        className="h-40 w-full object-cover"
                                                    />

                                                    <div className="p-4">
                                                        <h3 className="font-bold text-purple-950">
                                                            {pick.character.name}
                                                        </h3>

                                                        <p className="text-sm text-purple-900/60">
                                                            {pick.character.anime}
                                                        </p>

                                                        <p className="mt-3 text-2xl font-black text-purple-900">
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

                        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[...picks]
                                .sort(
                                    (a, b) =>
                                        positions.indexOf(a.position) - positions.indexOf(b.position)
                                )
                                .map((pick) => (
                                <div
                                    key={pick.position}
                                    className={`overflow-hidden rounded-3xl border-2 bg-purple-50 text-left transition ${getGradeGlow(
                                        pick.grade
                                    )}`}
                                >
                                    <img
                                        src={pick.character.imageUrl}
                                        alt={pick.character.name}
                                        className="h-56 w-full object-cover"
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
                            className="mt-8 rounded-2xl bg-purple-900 px-6 py-3 font-bold text-white transition hover:bg-purple-800 hover:cursor-pointer"
                        >
                            Start New Draft
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}