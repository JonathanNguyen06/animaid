"use client";
import {useEffect, useMemo, useState,} from "react";
import {useParams, useRouter,} from "next/navigation";
import {onAuthStateChanged, type User,} from "firebase/auth";
import {auth,} from "@/lib/firebase";
import {
    beginDraftRematchIfReady,
    completeDraftMatch, getDraftPlayerState,
    listenToDraftMatch,
    prepareDraftRematch,
    requestDraftRematch, saveDraftMatchHistory, startDraftRematchIfReady,
} from "@/lib/multiplayerDraft";
import {draftCharacters,} from "@/data/draftCharacters";
import {draftPositions, ascensionInfo, getDraftPickGrade,} from "@/data/draftLogic";
import type {DraftMatch, MultiplayerDraftPlayerState,} from "@/types/multiplayerDraft";

type MultiplayerRevealPhase =
    | "intro"
    | "ascension"
    | "matchups"
    | "summary";

type MatchupOutcome =
    | "win"
    | "loss"
    | "tie";

const positionIcons = {
    Captain: "👑",
    "Vice Captain": "⚔️",
    Support: "💚",
    Scout: "👁️",
    Strategist: "🧠",
    Assassin: "🗡️",
    Ace: "🔥",
    Vanguard: "🛡️",
} as const;

function getGradeStyle(grade: string) {
    switch (grade) {
        case "U":
            return {
                border:
                    "border-amber-200 ring-2 ring-yellow-300/60 shadow-[0_0_18px_rgba(255,255,255,0.45),0_0_40px_rgba(250,204,21,0.85),0_0_80px_rgba(245,158,11,0.5)]",

                grade:
                    "bg-gradient-to-b from-white via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(250,204,21,0.95)]",
            };

        case "S+":
            return {
                border:
                    "border-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.75)]",
                grade:
                    "text-yellow-300 drop-shadow-[0_0_16px_rgba(250,204,21,0.85)]",
            };

        case "S":
            return {
                border:
                    "border-purple-400 shadow-[0_0_28px_rgba(168,85,247,0.65)]",
                grade:
                    "text-purple-300 drop-shadow-[0_0_16px_rgba(168,85,247,0.8)]",
            };

        case "A+":
            return {
                border:
                    "border-blue-400 shadow-[0_0_24px_rgba(96,165,250,0.6)]",
                grade:
                    "text-blue-300 drop-shadow-[0_0_14px_rgba(96,165,250,0.75)]",
            };

        case "A":
            return {
                border:
                    "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]",
                grade:
                    "text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]",
            };

        case "B+":
            return {
                border:
                    "border-green-400 shadow-[0_0_16px_rgba(74,222,128,0.45)]",
                grade:
                    "text-green-300 drop-shadow-[0_0_12px_rgba(74,222,128,0.65)]",
            };

        case "B":
            return {
                border:
                    "border-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.35)]",
                grade:
                    "text-emerald-300 drop-shadow-[0_0_10px_rgba(110,231,183,0.55)]",
            };

        case "C":
            return {
                border:
                    "border-orange-300 shadow-[0_0_10px_rgba(253,186,116,0.3)]",
                grade:
                    "text-orange-300",
            };

        case "D":
            return {
                border:
                    "border-red-300 shadow-[0_0_8px_rgba(252,165,165,0.25)]",
                grade:
                    "text-red-300",
            };

        default:
            return {
                border:
                    "border-gray-400 shadow-[0_0_6px_rgba(156,163,175,0.2)]",
                grade:
                    "text-gray-300",
            };
    }
}

function HiddenPortraitCard({
                                side,
                            }: {
    side:
        | "you"
        | "opponent";
}) {
    return (
        <div
            className={`
                relative
                aspect-[2/3]
                overflow-hidden
                rounded-2xl
                border
                bg-black/50

                ${
                side === "you"
                    ? "border-pink-500/15"
                    : "border-purple-500/15"
            }
            `}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.025] to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-4xl font-black text-white/10">
                    ?
                </p>
            </div>

            <div className="absolute bottom-2 left-0 right-0 text-center">
                <p
                    className={`text-[8px] font-black uppercase tracking-widest ${
                        side === "you"
                            ? "text-pink-300/25"
                            : "text-purple-300/25"
                    }`}
                >
                    {side === "you"
                        ? "You"
                        : "Opponent"}
                </p>
            </div>
        </div>
    );
}

function HeadToHeadReveal({
                              slot,
                              revealed,
                              ascensionApplied,
                              myState,
                              opponentState,
                              opponentName,
                              outcome
                          }: {
    slot: {
        label: string;

        myPick:
            | MultiplayerDraftPlayerState["picks"][number]
            | null;

        opponentPick:
            | MultiplayerDraftPlayerState["picks"][number]
            | null;

        isPowerPosition: boolean;
    };

    revealed: boolean;
    ascensionApplied: boolean;

    myState: MultiplayerDraftPlayerState;
    opponentState: MultiplayerDraftPlayerState;
    opponentName: string;
    outcome: MatchupOutcome;
}) {
    const myCharacter =
        slot.myPick
            ? draftCharacters.find(
            (character) =>
                character.id ===
                slot.myPick!.characterId
        ) ?? null
            : null;

    const opponentCharacter =
        slot.opponentPick
            ? draftCharacters.find(
            (character) =>
                character.id ===
                slot.opponentPick!.characterId
        ) ?? null
            : null;

    const myPower =
        slot.myPick
            ? ascensionApplied
                ? slot.myPick.power
                : getPreAscensionPower(
                    slot.myPick
                )
            : 0;

    const opponentPower =
        slot.opponentPick
            ? ascensionApplied
                ? slot.opponentPick.power
                : getPreAscensionPower(
                    slot.opponentPick
                )
            : 0;

    const myGrade =
        slot.myPick &&
        myCharacter
            ? getDraftPickGrade(
                myCharacter,
                slot.myPick.position,
                myPower
            )
            : null;

    const opponentGrade =
        slot.opponentPick &&
        opponentCharacter
            ? getDraftPickGrade(
                opponentCharacter,
                slot.opponentPick.position,
                opponentPower
            )
            : null;

    const matchupWinner:
        "you" | "opponent" | "tie" =
        outcome === "win"
            ? "you"
            : outcome === "loss"
                ? "opponent"
                : "tie";

    const myGradeStyle =
        getGradeStyle(
            myGrade ?? ""
        );

    const opponentGradeStyle =
        getGradeStyle(
            opponentGrade ?? ""
        );

    const label =
        slot.isPowerPosition
            ? "⚡ Power Position"
            : `${
                positionIcons[
                    slot.label as keyof typeof positionIcons
                    ] ?? ""
            } ${slot.label}`;

    return (
        <div
            className={`
                relative
                overflow-hidden
                rounded-3xl
                border
                p-3
                transition-all
                duration-500

                ${
                outcome === "win"
                    ? `
                        border-emerald-400/40
                        bg-zinc-950
                        shadow-[0_0_25px_rgba(52,211,153,0.12)]
                    `
                    : outcome === "loss"
                        ? `
                            border-red-400/40
                            bg-zinc-950
                            shadow-[0_0_25px_rgba(248,113,113,0.10)]
                        `
                        : `
                            border-white/15
                            bg-zinc-950
                        `
            }

                ${
                slot.isPowerPosition
                    ? "ring-1 ring-yellow-400/20"
                    : ""
                }
            `}
        >
            {/* POSITION */}
                <div className="mb-3 flex items-center justify-between gap-2">

                <p
                    className={`
                        truncate
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.16em]
            
                        ${
                        slot.isPowerPosition
                            ? "text-yellow-300"
                            : "text-pink-300/70"
                        }
                    `}
                >
                    {label}
                </p>

                <span
                    className={`
                        rounded-full
                        border
                        px-2
                        py-1
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
            
                        ${
                        outcome === "win"
                            ? `
                        border-emerald-400/30
                        bg-emerald-500/10
                        text-emerald-300
                            `
                            : outcome === "loss"
                                ? `
                            border-red-400/30
                            bg-red-500/10
                            text-red-300
                            `
                                : `
                            border-white/15
                            bg-white/5
                            text-white/40
                            `
                        }
                    `}
                >
                    {outcome === "win"
                        ? "Won"
                        : outcome === "loss"
                            ? "Lost"
                            : "Tie"}
                </span>
            </div>


            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">

                {/* ======================================= */}
                {/* YOUR CARD */}
                {/* ======================================= */}

                <div>
                    {revealed &&
                    slot.myPick &&
                    myCharacter ? (
                        <div
                            className={`
                                relative
                                aspect-[2/3]
                                overflow-hidden
                                rounded-2xl
                                border
                                bg-black
                                transition-all
                                duration-500
                            
                                ${myGradeStyle.border}
                            `}
                        >
                            <img
                                src={
                                    myCharacter.imageUrl
                                }
                                alt={
                                    myCharacter.name
                                }
                                className="
                                    absolute
                                    inset-0
                                    h-full
                                    w-full
                                    object-cover
                                    object-top
                                "
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />


                            {/* GRADE */}
                            <div className="absolute left-2 top-2">
                                <div className="rounded-lg border border-black/30 bg-black/75 px-2 py-1 backdrop-blur">
                                    <p
                                        className={`
                                            text-lg
                                            font-black
                                            italic
                                            ${myGradeStyle.grade}
                                        `}
                                    >
                                        {myGrade}
                                    </p>
                                </div>
                            </div>


                            {/* POWER */}
                            <div className="absolute right-2 top-2">
                                <div className="rounded-lg border border-black/30 bg-black/75 px-2 py-1 text-center backdrop-blur">
                                    <p
                                        key={
                                            myPower
                                        }
                                        className={
                                            ascensionApplied &&
                                            (slot.myPick
                                                    .ascensionBonus ??
                                                0) > 0
                                                ? "animate-[powerBoost_500ms_cubic-bezier(.16,1,.3,1)] text-sm font-black text-yellow-200"
                                                : "text-sm font-black text-white"
                                        }
                                    >
                                        {myPower}
                                    </p>

                                    <p className="text-[7px] font-black uppercase tracking-widest text-white/40">
                                        OVR
                                    </p>
                                </div>
                            </div>


                            {/* NAME */}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-pink-300">
                                    You
                                </p>

                                <p className="mt-0.5 line-clamp-2 text-sm font-black leading-tight text-white">
                                    {
                                        myCharacter.name
                                    }
                                </p>

                                {slot.isPowerPosition && (
                                    <p className="mt-1 truncate text-[9px] font-bold text-yellow-300/80">
                                        {
                                            myState.selectedPowerPosition
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <HiddenPortraitCard
                            side="you"
                        />
                    )}
                </div>


                {/* ======================================= */}
                {/* VS */}
                {/* ======================================= */}

                <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-black italic text-white/20">
                        VS
                    </p>
                </div>


                {/* ======================================= */}
                {/* OPPONENT CARD */}
                {/* ======================================= */}

                <div>
                    {revealed &&
                    slot.opponentPick &&
                    opponentCharacter ? (
                        <div
                            className={`
                                relative
                                aspect-[2/3]
                                overflow-hidden
                                rounded-2xl
                                border
                                bg-black
                                transition-all
                                duration-500
                            
                                ${opponentGradeStyle.border}
                            `}
                        >
                            <img
                                src={
                                    opponentCharacter.imageUrl
                                }
                                alt={
                                    opponentCharacter.name
                                }
                                className="
                                    absolute
                                    inset-0
                                    h-full
                                    w-full
                                    object-cover
                                    object-top
                                "
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />


                            {/* GRADE */}
                            <div className="absolute left-2 top-2">
                                <div className="rounded-lg border border-black/30 bg-black/75 px-2 py-1 backdrop-blur">
                                    <p
                                        className={`
                                            text-lg
                                            font-black
                                            italic
                                            ${opponentGradeStyle.grade}
                                        `}
                                    >
                                        {opponentGrade}
                                    </p>
                                </div>
                            </div>


                            {/* POWER */}
                            <div className="absolute right-2 top-2">
                                <div className="rounded-lg border border-black/30 bg-black/75 px-2 py-1 text-center backdrop-blur">
                                    <p
                                        key={
                                            opponentPower
                                        }
                                        className={
                                            ascensionApplied &&
                                            (slot.opponentPick
                                                    .ascensionBonus ??
                                                0) > 0
                                                ? "animate-[powerBoost_500ms_cubic-bezier(.16,1,.3,1)] text-sm font-black text-yellow-200"
                                                : "text-sm font-black text-white"
                                        }
                                    >
                                        {
                                            opponentPower
                                        }
                                    </p>

                                    <p className="text-[7px] font-black uppercase tracking-widest text-white/40">
                                        OVR
                                    </p>
                                </div>
                            </div>


                            {/* NAME */}
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-purple-300">
                                    {opponentName}
                                </p>

                                <p className="mt-0.5 line-clamp-2 text-sm font-black leading-tight text-white">
                                    {
                                        opponentCharacter.name
                                    }
                                </p>

                                {slot.isPowerPosition && (
                                    <p className="mt-1 truncate text-[9px] font-bold text-yellow-300/80">
                                        {
                                            opponentState.selectedPowerPosition
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <HiddenPortraitCard
                            side="opponent"
                        />
                    )}
                </div>
            </div>

            {revealed && ascensionApplied && (
                <div className="mt-3 text-center">
                    {matchupWinner === "you" ? (
                        <div
                            className="
                                rounded-xl
                                border border-green-400/25
                                bg-green-500/10
                                px-3 py-2
                            "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">
                                ✓ Position Won
                            </p>
                        </div>
                    ) : matchupWinner === "opponent" ? (
                        <div
                            className="
                                rounded-xl
                                border border-red-400/25
                                bg-red-500/10
                                px-3 py-2
                            "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">
                                ✕ Position Lost
                            </p>
                        </div>
                    ) : (
                        <div
                            className="
                                rounded-xl
                                border border-white/10
                                bg-white/5
                                px-3 py-2
                            "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                Position Tied
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function getPreAscensionPower(
    pick: {
        power: number;
        ascensionBonus?: number;
    }
) {
    return (
        pick.power -
        (pick.ascensionBonus ?? 0)
    );
}

function getMatchupOutcome(
    slot: {
        myPick:
            | MultiplayerDraftPlayerState["picks"][number]
            | null;

        opponentPick:
            | MultiplayerDraftPlayerState["picks"][number]
            | null;
    }
): MatchupOutcome {
    const myPower =
        slot.myPick?.power ?? 0;

    const opponentPower =
        slot.opponentPick?.power ?? 0;

    if (myPower > opponentPower) {
        return "win";
    }

    if (myPower < opponentPower) {
        return "loss";
    }

    return "tie";
}

function CinematicMatchup({
                              slot,
                              matchupNumber,
                              totalMatchups,
                              myState,
                              opponentState,
                              opponentName,
                          }: {
    slot: {
        label: string;

        myPick:
            | MultiplayerDraftPlayerState["picks"][number]
            | null;

        opponentPick:
            | MultiplayerDraftPlayerState["picks"][number]
            | null;

        isPowerPosition: boolean;
    };

    matchupNumber: number;
    totalMatchups: number;

    myState: MultiplayerDraftPlayerState;
    opponentState: MultiplayerDraftPlayerState;

    opponentName: string;
}) {
    const myCharacter =
        slot.myPick
            ? draftCharacters.find(
            (character) =>
                character.id ===
                slot.myPick!.characterId
        ) ?? null
            : null;

    const opponentCharacter =
        slot.opponentPick
            ? draftCharacters.find(
            (character) =>
                character.id ===
                slot.opponentPick!.characterId
        ) ?? null
            : null;

    if (
        !slot.myPick ||
        !slot.opponentPick ||
        !myCharacter ||
        !opponentCharacter
    ) {
        return null;
    }

    const myPower =
        slot.myPick.power;

    const opponentPower =
        slot.opponentPick.power;

    const myGrade =
        getDraftPickGrade(
            myCharacter,
            slot.myPick.position,
            myPower
        );

    const opponentGrade =
        getDraftPickGrade(
            opponentCharacter,
            slot.opponentPick.position,
            opponentPower
        );

    const outcome =
        getMatchupOutcome(slot);

    const myWon =
        outcome === "win";

    const opponentWon =
        outcome === "loss";

    const myGradeStyle =
        getGradeStyle(myGrade);

    const opponentGradeStyle =
        getGradeStyle(opponentGrade);

    const label =
        slot.isPowerPosition
            ? "⚡ POWER POSITION"
            : `${
                positionIcons[
                    slot.label as keyof typeof positionIcons
                    ] ?? ""
            } ${slot.label}`;

    return (
        <div
            key={slot.label}
            className="
                relative
                flex
                min-h-[680px]
                flex-col
                items-center
                justify-center
                overflow-hidden
                py-8
            "
        >
            {/* PROGRESS */}

            <div className="absolute left-0 right-0 top-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/25">
                    Matchup {matchupNumber} / {totalMatchups}
                </p>

                <p
                    className={`
                        mt-2
                        text-sm
                        font-black
                        uppercase
                        tracking-[0.3em]

                        ${
                        slot.isPowerPosition
                            ? "text-yellow-300"
                            : "text-pink-300"
                    }
                    `}
                >
                    {label}
                </p>
            </div>


            {/* CENTER ENERGY */}

            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-72
                    w-72
                    -translate-x-1/2
                    -translate-y-1/2
                    animate-[battleEnergy_1600ms_ease-out_both]
                    rounded-full
                    bg-fuchsia-500/10
                    blur-[80px]
                "
            />


            <div
                className="
                    relative
                    z-10
                    grid
                    w-full
                    max-w-5xl
                    grid-cols-[1fr_auto_1fr]
                    items-center
                    gap-2 sm:gap-4 lg:gap-6
                "
            >

                {/* ============================== */}
                {/* YOUR SIDE */}
                {/* ============================== */}

                <div className="flex justify-end">
                    <div className="animate-[battleCardLeft_850ms_cubic-bezier(.16,1,.3,1)_both]">

                        <div
                            className={`
                                ${
                                myWon
                                    ? "animate-[battleWinner_700ms_950ms_cubic-bezier(.16,1,.3,1)_both]"
                                    : opponentWon
                                        ? "animate-[battleLoser_700ms_950ms_ease-out_both]"
                                        : ""
                            }
                            `}
                        >
                            <div
                                className={`
                                    relative
                                    aspect-[2/3]
                                    w-[250px]
                                    overflow-hidden
                                    rounded-[2rem]
                                    border-2
                                    bg-black
                                    sm:w-[290px]
                                    lg:w-[320px]

                                    ${myGradeStyle.border}
                                `}
                            >
                                <img
                                    src={
                                        myCharacter.imageUrl
                                    }
                                    alt={
                                        myCharacter.name
                                    }
                                    className="
                                        absolute
                                        inset-0
                                        h-full
                                        w-full
                                        object-cover
                                        object-top
                                    "
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />


                                {/* GRADE */}

                                <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/75 px-3 py-2 backdrop-blur-xl">
                                    <p
                                        className={`
                                            text-3xl
                                            font-black
                                            italic

                                            ${myGradeStyle.grade}
                                        `}
                                    >
                                        {
                                            myGrade
                                        }
                                    </p>
                                </div>


                                {/* POWER */}

                                <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/75 px-3 py-2 text-center backdrop-blur-xl">
                                    <p className="text-2xl font-black text-white">
                                        {myPower}
                                    </p>

                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
                                        OVR
                                    </p>
                                </div>


                                {/* INFO */}

                                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-300">
                                        You
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        {
                                            myCharacter.name
                                        }
                                    </h3>

                                    <p className="mt-1 text-xs font-semibold text-white/45">
                                        {
                                            myCharacter.anime
                                        }
                                    </p>

                                    {slot.isPowerPosition && (
                                        <p className="mt-2 text-xs font-black text-yellow-300">
                                            {
                                                myState
                                                    .selectedPowerPosition
                                            }
                                        </p>
                                    )}

                                    {(slot.myPick
                                            .ascensionBonus ??
                                        0) > 0 && (
                                        <p className="mt-2 text-xs font-black text-yellow-200">
                                            +
                                            {
                                                slot.myPick
                                                    .ascensionBonus
                                            }{" "}
                                            Ascension
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* ============================== */}
                {/* IMPACT */}
                {/* ============================== */}

                <div className="relative flex w-12 items-center justify-center sm:w-20 lg:w-24">

                    <div
                        className="
                            absolute
                            h-36
                            w-36
                            animate-[battleImpact_700ms_550ms_ease-out_both]
                            rounded-full
                            bg-white
                            opacity-0
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            relative
                            z-10
                            flex
                            h-20
                            w-20
                            animate-[battleVs_700ms_500ms_cubic-bezier(.16,1,.3,1)_both]
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-pink-300/30
                            bg-black/80
                            text-2xl
                            font-black
                            italic
                            text-white
                            shadow-[0_0_35px_rgba(236,72,153,0.35)]
                            backdrop-blur-xl
                        "
                    >
                        VS
                    </div>
                </div>


                {/* ============================== */}
                {/* OPPONENT */}
                {/* ============================== */}

                <div className="flex justify-start">
                    <div className="animate-[battleCardRight_850ms_cubic-bezier(.16,1,.3,1)_both]">

                        <div
                            className={`
                                ${
                                opponentWon
                                    ? "animate-[battleWinner_700ms_950ms_cubic-bezier(.16,1,.3,1)_both]"
                                    : myWon
                                        ? "animate-[battleLoser_700ms_950ms_ease-out_both]"
                                        : ""
                            }
                            `}
                        >
                            <div
                                className={`
                                    relative
                                    aspect-[2/3]
                                    w-[150px]
                                    sm:w-[240px]
                                    lg:w-[320px]
                                    overflow-hidden
                                    rounded-[2rem]
                                    border-2
                                    bg-black

                                    ${opponentGradeStyle.border}
                                `}
                            >
                                <img
                                    src={
                                        opponentCharacter.imageUrl
                                    }
                                    alt={
                                        opponentCharacter.name
                                    }
                                    className="
                                        absolute
                                        inset-0
                                        h-full
                                        w-full
                                        object-cover
                                        object-top
                                    "
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                                <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/75 px-3 py-2 backdrop-blur-xl">
                                    <p
                                        className={`
                                            text-3xl
                                            font-black
                                            italic

                                            ${opponentGradeStyle.grade}
                                        `}
                                    >
                                        {
                                            opponentGrade
                                        }
                                    </p>
                                </div>

                                <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/75 px-3 py-2 text-center backdrop-blur-xl">
                                    <p className="text-2xl font-black text-white">
                                        {opponentPower}
                                    </p>

                                    <p className="text-[8px] font-black uppercase tracking-widest text-white/35">
                                        OVR
                                    </p>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300">
                                        {opponentName}
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        {
                                            opponentCharacter.name
                                        }
                                    </h3>

                                    <p className="mt-1 text-xs font-semibold text-white/45">
                                        {
                                            opponentCharacter.anime
                                        }
                                    </p>

                                    {slot.isPowerPosition && (
                                        <p className="mt-2 text-xs font-black text-yellow-300">
                                            {
                                                opponentState
                                                    .selectedPowerPosition
                                            }
                                        </p>
                                    )}

                                    {(slot.opponentPick
                                            .ascensionBonus ??
                                        0) > 0 && (
                                        <p className="mt-2 text-xs font-black text-yellow-200">
                                            +
                                            {
                                                slot.opponentPick
                                                    .ascensionBonus
                                            }{" "}
                                            Ascension
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* MATCHUP RESULT */}

            <div
                className="
                    absolute
                    inset-x-0
                    bottom-6
                    z-20
                    flex
                    justify-center
                    px-4
                "
            >
                <div
                    className={`
                        animate-[battleResult_650ms_1150ms_cubic-bezier(.16,1,.3,1)_both]
                        rounded-full
                        border
                        px-6
                        py-3
                        backdrop-blur-xl
            
                        ${
                        outcome === "win"
                            ? `
                                border-emerald-400/40
                                bg-emerald-500/15
                                text-emerald-200
                                shadow-[0_0_30px_rgba(52,211,153,0.20)]
                            `
                            : outcome === "loss"
                                ? `
                                    border-red-400/40
                                    bg-red-500/15
                                    text-red-200
                                    shadow-[0_0_30px_rgba(248,113,113,0.18)]
                                `
                                : `
                                    border-white/20
                                    bg-white/10
                                    text-white/70
                                `
                        }
                    `}
                >
                    <p className="text-xs font-black uppercase tracking-[0.25em]">
                        {outcome === "win"
                            ? "Matchup Won"
                            : outcome === "loss"
                                ? `Matchup Lost`
                                : "Tie"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function MultiplayerDraftResultsPage() {
    const router = useRouter();
    const params = useParams<{ code: string; }>();
    const code = params.code?.toUpperCase();
    const [user, setUser] = useState<User | null>(null);
    const [match, setMatch] = useState<DraftMatch | null>(null);
    const [hostState, setHostState,] = useState<MultiplayerDraftPlayerState | null>(null);
    const [guestState, setGuestState,] = useState<MultiplayerDraftPlayerState | null>(null);
    const [revealPhase, setRevealPhase] = useState<MultiplayerRevealPhase>("intro");
    const [currentMatchupIndex, setCurrentMatchupIndex,] = useState(0);
    const [requestingRematch, setRequestingRematch,] = useState(false);
    const [finalTeamsLoaded, setFinalTeamsLoaded,] = useState(false);
    const [historySaved, setHistorySaved,] = useState(false);


    // ---------------------------------------------------------
    // AUTH
    // ---------------------------------------------------------

    useEffect(() => {
        return onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
            }
        );
    }, []);


    // ---------------------------------------------------------
    // MATCH LISTENER
    // ---------------------------------------------------------

    useEffect(() => {
        if (!code) return;

        return listenToDraftMatch(
            code,
            (updatedMatch) => {
                if (!updatedMatch) {
                    router.replace(
                        "/games/draft/multiplayer"
                    );

                    return;
                }

                setMatch(updatedMatch);
            }
        );
    }, [
        code,
        router,
    ]);


    // ---------------------------------------------------------
    // FINAL PLAYER STATES
    // ---------------------------------------------------------

    useEffect(() => {
        if (
            !code ||
            !user ||
            !match ||
            !match.guest ||
            finalTeamsLoaded
        ) {
            return;
        }

        const isPlayer =
            match.host.uid === user.uid ||
            match.guest.uid === user.uid;

        if (!isPlayer) {
            router.replace(
                "/games/draft/multiplayer"
            );

            return;
        }

        if (match.endReason === "forfeit") {
            return;
        }

        if (
            match.status !== "reveal" &&
            match.status !== "complete"
        ) {
            return;
        }

        const hostUid =
            match.host.uid;

        const guestUid =
            match.guest.uid;

        let cancelled = false;

        async function loadFinalTeams() {
            try {
                const [
                    loadedHostState,
                    loadedGuestState,
                ] = await Promise.all([
                    getDraftPlayerState(
                        code,
                        hostUid
                    ),

                    getDraftPlayerState(
                        code,
                        guestUid
                    ),
                ]);

                if (cancelled) {
                    return;
                }

                if (
                    !loadedHostState ||
                    !loadedGuestState
                ) {
                    throw new Error(
                        "FINAL_PLAYER_STATE_MISSING"
                    );
                }

                setHostState(
                    loadedHostState
                );

                setGuestState(
                    loadedGuestState
                );

                setFinalTeamsLoaded(
                    true
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load final teams:",
                    error
                );
            }
        }

        loadFinalTeams();

        return () => {
            cancelled = true;
        };
    }, [
        code,
        user,
        match?.status,
        match?.endReason,
        match?.host.uid,
        match?.guest?.uid,
        router,
        finalTeamsLoaded,
    ]);

    // ---------------------------------------------------------
// RESOLVE VIEWER SIDES
// ---------------------------------------------------------

    const amHost =
        !!user &&
        !!match &&
        user.uid === match.host.uid;

    const revealMyState =
        hostState && guestState
            ? amHost
                ? hostState
                : guestState
            : null;

    const revealOpponentState =
        hostState && guestState
            ? amHost
                ? guestState
                : hostState
            : null;


// ---------------------------------------------------------
// BUILD 9 REVEAL MATCHUPS
// ---------------------------------------------------------

    const revealSlots = useMemo(() => {
        if (
            !revealMyState ||
            !revealOpponentState
        ) {
            return [];
        }

        const normalSlots =
            draftPositions.map(
                (position) => ({
                    label: position,

                    myPick:
                        revealMyState.picks.find(
                            (pick) =>
                                pick.position ===
                                position
                        ) ?? null,

                    opponentPick:
                        revealOpponentState.picks.find(
                            (pick) =>
                                pick.position ===
                                position
                        ) ?? null,

                    isPowerPosition: false,
                })
            );

        const myPowerPick =
            revealMyState.picks.find(
                (pick) =>
                    pick.position ===
                    revealMyState.selectedPowerPosition
            ) ?? null;

        const opponentPowerPick =
            revealOpponentState.picks.find(
                (pick) =>
                    pick.position ===
                    revealOpponentState.selectedPowerPosition
            ) ?? null;

        return [
            ...normalSlots,

            {
                label: "Power Position",
                myPick: myPowerPick,
                opponentPick: opponentPowerPick,
                isPowerPosition: true,
            },
        ];
    }, [
        revealMyState,
        revealOpponentState,
    ]);

    useEffect(() => {
        if (
            !hostState ||
            !guestState
        ) {
            return;
        }

        if (
            revealPhase !== "intro"
        ) {
            return;
        }

        const timeout =
            window.setTimeout(() => {
                setRevealPhase(
                    "ascension"
                );
            }, 1200);

        return () =>
            window.clearTimeout(
                timeout
            );
    }, [
        hostState,
        guestState,
        revealPhase,
    ]);

    useEffect(() => {
        if (
            revealPhase !== "ascension"
        ) {
            return;
        }

        const timeout =
            window.setTimeout(() => {
                setCurrentMatchupIndex(0);

                setRevealPhase(
                    "matchups"
                );
            }, 3000);

        return () =>
            window.clearTimeout(
                timeout
            );
    }, [
        revealPhase,
    ]);

    useEffect(() => {
        if (
            revealPhase !== "matchups"
        ) {
            return;
        }

        if (
            revealSlots.length === 0
        ) {
            return;
        }

        const currentSlot =
            revealSlots[
                currentMatchupIndex
                ];

        if (!currentSlot) {
            return;
        }

        const isUltra =
            currentSlot.myPick?.grade ===
            "U" ||
            currentSlot.opponentPick
                ?.grade === "U";

        const isElite =
            currentSlot.myPick?.grade ===
            "S+" ||
            currentSlot.myPick?.grade ===
            "S" ||
            currentSlot.opponentPick
                ?.grade === "S+" ||
            currentSlot.opponentPick
                ?.grade === "S";

        const delay =
            isUltra
                ? 3000
                : isElite
                    ? 2600
                    : 2300;

        const timeout =
            window.setTimeout(() => {
                const isLast =
                    currentMatchupIndex ===
                    revealSlots.length - 1;

                if (isLast) {
                    setRevealPhase(
                        "summary"
                    );

                    return;
                }

                setCurrentMatchupIndex(
                    (current) =>
                        current + 1
                );
            }, delay);

        return () =>
            window.clearTimeout(
                timeout
            );
    }, [
        revealPhase,
        currentMatchupIndex,
        revealSlots,
    ]);

    useEffect(() => {
        if (
            !user ||
            !match ||
            !code
        ) {
            return;
        }

        if (
            revealPhase !== "summary"
        ) {
            return;
        }

        // Only host finalizes the match
        if (
            match.host.uid !==
            user.uid
        ) {
            return;
        }

        if (
            match.status ===
            "complete"
        ) {
            return;
        }

        if (
            match.status !==
            "reveal"
        ) {
            return;
        }

        if (match.endReason === "forfeit") {
            return;
        }

        completeDraftMatch(
            code,
            user.uid
        ).catch((error) => {
            console.error(
                "Failed to complete match:",
                error
            );
        });
    }, [
        user,
        code,
        match,
        revealPhase,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match
        ) {
            return;
        }

        if (
            match.status !==
            "complete"
        ) {
            return;
        }

        if (
            match.host.uid !==
            user.uid
        ) {
            return;
        }

        if (
            !match.hostRematchRequested ||
            !match.guestRematchRequested
        ) {
            return;
        }

        beginDraftRematchIfReady(
            code,
            user.uid
        ).catch((error) => {
            console.error(
                "Failed to begin rematch:",
                error
            );
        });
    }, [
        user,
        code,
        match?.status,
        match?.host.uid,
        match?.hostRematchRequested,
        match?.guestRematchRequested,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match
        ) {
            return;
        }

        if (
            match.status !==
            "rematch"
        ) {
            return;
        }

        const isHost =
            match.host.uid ===
            user.uid;

        const alreadyReady =
            isHost
                ? match.hostRematchReady
                : match.guestRematchReady;

        if (alreadyReady) {
            return;
        }

        prepareDraftRematch(
            code,
            user.uid
        ).catch((error) => {
            console.error(
                "Failed to prepare rematch:",
                error
            );
        });
    }, [
        user,
        code,
        match?.status,
        match?.host.uid,
        match?.hostRematchReady,
        match?.guestRematchReady,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match
        ) {
            return;
        }

        if (
            match.status !==
            "rematch"
        ) {
            return;
        }

        if (
            match.host.uid !==
            user.uid
        ) {
            return;
        }

        if (
            !match.hostRematchReady ||
            !match.guestRematchReady
        ) {
            return;
        }

        startDraftRematchIfReady(
            code,
            user.uid
        ).catch((error) => {
            console.error(
                "Failed to start rematch:",
                error
            );
        });
    }, [
        user,
        code,
        match?.status,
        match?.host.uid,
        match?.hostRematchReady,
        match?.guestRematchReady,
    ]);

    useEffect(() => {
        if (!code) {
            return;
        }

        if (
            match?.status !==
            "power-selection"
        ) {
            return;
        }

        router.replace(
            `/games/draft/multiplayer/${code}/play`
        );
    }, [
        code,
        match?.status,
        router,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match
        ) {
            return;
        }

        if (
            match.status !==
            "complete"
        ) {
            return;
        }

        if (historySaved) {
            return;
        }

        let cancelled = false;

        async function saveHistory() {
            try {
                await saveDraftMatchHistory(
                    code,
                    user!.uid
                );

                if (!cancelled) {
                    setHistorySaved(
                        true
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to save match history:",
                    error
                );
            }
        }

        saveHistory();

        return () => {
            cancelled = true;
        };
    }, [
        user,
        code,
        match?.status,
        match?.gameNumber,
        historySaved,
    ]);

    useEffect(() => {
        if (
            match?.status ===
            "power-selection"
        ) {
            setHistorySaved(
                false
            );
        }
    }, [
        match?.status,
        match?.gameNumber,
    ]);

    if (
        user &&
        match &&
        match.guest &&
        match.status === "complete" &&
        match.endReason === "forfeit"
    ) {
        const iWon =
            match.winnerUid === user.uid;

        const opponent =
            match.host.uid === user.uid
                ? match.guest
                : match.host;

        return (
            <main
                className="
                relative
                mx-auto
                flex
                min-h-[calc(100vh-130px)]
                max-w-[1500px]
                items-center
                justify-center
                overflow-hidden
                px-4
                py-8
            "
            >
                {/* BACKGROUND GLOW */}

                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                    <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                    <div
                        className={`
                        absolute
                        bottom-[-150px]
                        left-1/2
                        h-[500px]
                        w-[500px]
                        -translate-x-1/2
                        rounded-full
                        blur-[140px]

                        ${
                            iWon
                                ? "bg-yellow-400/10"
                                : "bg-red-500/10"
                        }
                    `}
                    />
                </div>


                <section
                    className={`
                    relative z-10
                    w-full
                    max-w-3xl
                    overflow-hidden
                    rounded-[2rem]
                    border
                    bg-black/50
                    px-6
                    py-12
                    text-center
                    backdrop-blur-xl

                    ${
                        iWon
                            ? `
                                border-yellow-400/25
                                shadow-[0_0_60px_rgba(250,204,21,0.10)]
                              `
                            : `
                                border-red-400/20
                                shadow-[0_0_60px_rgba(248,113,113,0.08)]
                              `
                    }
                `}
                >
                    {/* INNER GLOW */}

                    <div
                        className={`
                        pointer-events-none
                        absolute
                        left-1/2
                        top-[-120px]
                        h-80
                        w-80
                        -translate-x-1/2
                        rounded-full
                        blur-[100px]

                        ${
                            iWon
                                ? "bg-yellow-400/15"
                                : "bg-red-500/10"
                        }
                    `}
                    />


                    <div className="relative z-10">

                        {/* ICON */}

                        <div
                            className={`
                            mx-auto
                            flex h-20 w-20
                            items-center justify-center
                            rounded-full
                            border
                            text-4xl

                            ${
                                iWon
                                    ? `
                                        border-yellow-300/30
                                        bg-yellow-500/10
                                        shadow-[0_0_35px_rgba(250,204,21,0.18)]
                                      `
                                    : `
                                        border-red-300/25
                                        bg-red-500/10
                                        shadow-[0_0_35px_rgba(248,113,113,0.12)]
                                      `
                            }
                        `}
                        >
                            {iWon
                                ? "🏆"
                                : "⚔️"}
                        </div>


                        {/* LABEL */}

                        <p
                            className={`
                            mt-6
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.35em]

                            ${
                                iWon
                                    ? "text-yellow-300/65"
                                    : "text-red-300/60"
                            }
                        `}
                        >
                            Match Ended by Forfeit
                        </p>


                        {/* RESULT */}

                        <h1
                            className={`
                            mt-3
                            text-6xl
                            font-black
                            tracking-tight
                            sm:text-7xl

                            ${
                                iWon
                                    ? `
                                        text-yellow-300
                                        drop-shadow-[0_0_25px_rgba(250,204,21,0.45)]
                                      `
                                    : `
                                        text-red-300
                                        drop-shadow-[0_0_20px_rgba(248,113,113,0.25)]
                                      `
                            }
                        `}
                        >
                            {iWon
                                ? "VICTORY"
                                : "DEFEAT"}
                        </h1>


                        {/* DESCRIPTION */}

                        <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-white/50">
                            {iWon
                                ? `${opponent.displayName} did not reconnect within 30 seconds. You win the match by forfeit.`
                                : "You were disconnected for too long, so the match was awarded to your opponent."}
                        </p>


                        {/* VS CARD */}

                        <div
                            className="
                            mx-auto
                            mt-8
                            grid
                            max-w-xl
                            grid-cols-[1fr_auto_1fr]
                            items-center
                            gap-5
                            rounded-3xl
                            border border-white/10
                            bg-white/[0.03]
                            p-5
                        "
                        >
                            {/* YOU */}

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                                    You
                                </p>

                                <p
                                    className={`
                                    mt-2
                                    text-xl
                                    font-black

                                    ${
                                        iWon
                                            ? "text-yellow-300"
                                            : "text-white/60"
                                    }
                                `}
                                >
                                    {iWon
                                        ? "Winner"
                                        : "Forfeit"}
                                </p>
                            </div>


                            {/* VS */}

                            <div
                                className="
                                flex h-12 w-12
                                items-center justify-center
                                rounded-full
                                border border-pink-400/20
                                bg-pink-500/10
                                text-xs
                                font-black
                                text-pink-200
                            "
                            >
                                VS
                            </div>


                            {/* OPPONENT */}

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                                    {opponent.displayName}
                                </p>

                                <p
                                    className={`
                                    mt-2
                                    text-xl
                                    font-black

                                    ${
                                        !iWon
                                            ? "text-yellow-300"
                                            : "text-white/60"
                                    }
                                `}
                                >
                                    {!iWon
                                        ? "Winner"
                                        : "Forfeit"}
                                </p>
                            </div>
                        </div>


                        {/* FORFEIT BADGE */}

                        <div
                            className="
                            mx-auto
                            mt-6
                            w-fit
                            rounded-full
                            border border-yellow-400/20
                            bg-yellow-500/10
                            px-5
                            py-2
                        "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-200/80">
                                Victory by Forfeit
                            </p>
                        </div>


                        {/* EXIT */}

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/games/draft/multiplayer"
                                )
                            }
                            className="
                            mt-9
                            rounded-2xl
                            border border-pink-500/30
                            bg-pink-500/10
                            px-7
                            py-3
                            text-sm
                            font-black
                            text-pink-100
                            transition
                            hover:-translate-y-0.5
                            hover:border-pink-400/60
                            hover:bg-pink-500/20
                            hover:cursor-pointer
                        "
                        >
                            Back to Multiplayer
                        </button>

                    </div>
                </section>
            </main>
        );
    }

    if (
        !user ||
        !match ||
        !match.guest ||
        !hostState ||
        !guestState
    ) {
        return (
            <main className="flex min-h-[calc(100vh-130px)] items-center justify-center">
                <div className="text-center">

                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-400" />

                    <p className="mt-4 text-sm font-semibold text-white/40">
                        Preparing final showdown...
                    </p>
                </div>
            </main>
        );
    }

    const normalSummarySlots =
        revealSlots.filter(
            (slot) =>
                !slot.isPowerPosition
        );

    const powerSummarySlot =
        revealSlots.find(
            (slot) =>
                slot.isPowerPosition
        ) ?? null;

    const myRematchRequested =
        amHost
            ? match.hostRematchRequested
            : match?.guestRematchRequested;

    const opponentRematchRequested =
        amHost
            ? match.guestRematchRequested
            : match?.hostRematchRequested;

    async function handleRematch() {
        if (
            !user ||
            !code ||
            !match ||
            requestingRematch ||
            myRematchRequested
        ) {
            return;
        }

        setRequestingRematch(true);

        try {
            await requestDraftRematch(
                code,
                user.uid
            );
        } catch (error) {
            console.error(
                "Failed to request rematch:",
                error
            );
        } finally {
            setRequestingRematch(false);
        }
    }


    // ---------------------------------------------------------
    // TOTAL POWER
    // ---------------------------------------------------------

    const hostTotalPower =
        hostState.picks.reduce(
            (total, pick) =>
                total + pick.power,
            0
        );

    const guestTotalPower =
        guestState.picks.reduce(
            (total, pick) =>
                total + pick.power,
            0
        );


    // ---------------------------------------------------------
    // YOUR SIDE
    // ---------------------------------------------------------

    const myState =
        amHost
            ? hostState
            : guestState;

    const opponentState =
        amHost
            ? guestState
            : hostState;

    const opponentPlayer =
        amHost
            ? match.guest
            : match.host;

    const myTotalPower =
        amHost
            ? hostTotalPower
            : guestTotalPower;

    const opponentTotalPower =
        amHost
            ? guestTotalPower
            : hostTotalPower;

    const matchupOutcomes =
        revealSlots.map(
            (slot) =>
                getMatchupOutcome(slot)
        );

    const myPositionWins =
        matchupOutcomes.filter(
            (result) =>
                result === "win"
        ).length;

    const opponentPositionWins =
        matchupOutcomes.filter(
            (result) =>
                result === "loss"
        ).length;

    const tiedPositions =
        matchupOutcomes.filter(
            (result) =>
                result === "tie"
        ).length;


    const positionalScoreTied =
        myPositionWins ===
        opponentPositionWins;


    const finalIsDraw =
        positionalScoreTied &&
        myTotalPower ===
        opponentTotalPower;


    const iWonFinal =
        !finalIsDraw &&
        (
            myPositionWins >
            opponentPositionWins ||
            (
                positionalScoreTied &&
                myTotalPower >
                opponentTotalPower
            )
        );

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-[1700px] px-4 py-6">

            {/* BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            {/* REMATCH REQUEST NOTIFICATION */}
            {revealPhase === "summary" &&
                match.status === "complete" &&
                opponentRematchRequested &&
                !myRematchRequested && (
                    <div
                        className="
                fixed
                right-6
                top-24
                z-[100]
                w-[340px]
                animate-[rematchNotificationIn_450ms_cubic-bezier(.16,1,.3,1)_both]
                overflow-hidden
                rounded-3xl
                border
                border-yellow-400/30
                bg-black/90
                p-5
                shadow-[0_0_40px_rgba(250,204,21,0.18)]
                backdrop-blur-xl
            "
                        role="status"
                        aria-live="polite"
                    >
                        {/* GLOW */}
                        <div
                            className="
                    pointer-events-none
                    absolute
                    -right-12
                    -top-12
                    h-32
                    w-32
                    rounded-full
                    bg-yellow-400/15
                    blur-3xl
                "
                        />

                        <div className="relative z-10">
                            <div className="flex items-start gap-4">

                                {/* ICON */}
                                <div
                                    className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-yellow-400/25
                            bg-yellow-500/10
                            text-xl
                            shadow-[0_0_20px_rgba(250,204,21,0.12)]
                        "
                                >
                                    ⚡
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p
                                        className="
                                text-[10px]
                                font-black
                                uppercase
                                tracking-[0.3em]
                                text-yellow-300/60
                            "
                                    >
                                        Rematch Request
                                    </p>

                                    <p className="mt-1 text-base font-black text-white">
                                        {opponentPlayer.displayName} wants a rematch
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/40">
                                        Run it back?
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleRematch}
                                disabled={requestingRematch}
                                className="
                                    mt-4
                                    w-full
                                    rounded-2xl
                                    border
                                    border-yellow-300/40
                                    bg-gradient-to-r
                                    from-yellow-400
                                    via-amber-400
                                    to-yellow-500
                                    px-5
                                    py-3
                                    text-sm
                                    font-black
                                    text-black
                                    shadow-[0_0_22px_rgba(250,204,21,0.22)]
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:shadow-[0_0_32px_rgba(250,204,21,0.4)]
                                    hover:cursor-pointer
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {requestingRematch
                                    ? "Accepting..."
                                    : "Accept Rematch"}
                            </button>
                        </div>
                    </div>
                )}


            <div className="text-center">

                {/* ============================== */}
                {/* INTRO */}
                {/* ============================== */}

                {revealPhase === "intro" && (
                    <div
                        className="
                            flex
                            min-h-[650px]
                            flex-col
                            items-center
                            justify-center
                            animate-[finalReveal_700ms_cubic-bezier(.16,1,.3,1)_both]
                        "
                    >
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-pink-300/50">
                            Multiplayer Draft
                        </p>

                        <h1 className="mt-4 text-6xl font-black text-white sm:text-7xl">
                            FINAL SHOWDOWN
                        </h1>

                        <p className="mt-4 text-sm font-semibold text-white/40">
                            Every position matters.
                        </p>
                    </div>
                )}


                {/* ============================== */}
                {/* ASCENSION SPLASH */}
                {/* ============================== */}

                {revealPhase === "ascension" && (
                    <div
                        className="
                            flex
                            min-h-[650px]
                            items-center
                            justify-center
                            animate-[finalReveal_700ms_cubic-bezier(.16,1,.3,1)_both]
                        "
                    >
                        <div className="w-full max-w-4xl">

                            <p className="text-xs font-black uppercase tracking-[0.4em] text-yellow-300/60">
                                Final Modifiers
                            </p>

                            <h2 className="mt-2 text-5xl font-black text-white">
                                ASCENSIONS
                            </h2>

                            <div className="mt-10 grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">

                                <div
                                    className="
                                        rounded-3xl
                                        border
                                        border-pink-500/30
                                        bg-zinc-950
                                        p-7
                                        shadow-[0_0_30px_rgba(236,72,153,0.08)]
                                    "
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-300/50">
                                        Your Ascension
                                    </p>

                                    <h3 className="mt-3 text-3xl font-black text-yellow-200">
                                        {
                                            myState.selectedAscension
                                        }
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-white/40">
                                        {myState.selectedAscension
                                            ? ascensionInfo[
                                                myState
                                                    .selectedAscension
                                                ].description
                                            : ""}
                                    </p>
                                </div>


                                <div className="flex items-center justify-center">
                                    <p className="text-3xl font-black italic text-white/20">
                                        VS
                                    </p>
                                </div>


                                <div
                                    className="
                                        rounded-3xl
                                        border
                                        border-purple-500/30
                                        bg-zinc-950
                                        p-7
                                        shadow-[0_0_30px_rgba(168,85,247,0.08)]
                                    "
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300/50">
                                        {
                                            opponentPlayer.displayName
                                        }
                                    </p>

                                    <h3 className="mt-3 text-3xl font-black text-yellow-200">
                                        {
                                            opponentState.selectedAscension
                                        }
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-white/40">
                                        {opponentState.selectedAscension
                                            ? ascensionInfo[
                                                opponentState
                                                    .selectedAscension
                                                ].description
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* ============================== */}
                {/* SINGLE MATCHUP */}
                {/* ============================== */}

                {revealPhase === "matchups" &&
                    revealSlots[
                        currentMatchupIndex
                        ] && (
                        <CinematicMatchup
                            key={
                                revealSlots[
                                    currentMatchupIndex
                                    ].label
                            }
                            slot={
                                revealSlots[
                                    currentMatchupIndex
                                    ]
                            }
                            matchupNumber={
                                currentMatchupIndex +
                                1
                            }
                            totalMatchups={
                                revealSlots.length
                            }
                            myState={myState}
                            opponentState={
                                opponentState
                            }
                            opponentName={
                                opponentPlayer.displayName
                            }
                        />
                    )}


                {/* ============================== */}
                {/* FINAL SUMMARY */}
                {/* ============================== */}

                {revealPhase === "summary" && (
                    <div className="animate-[finalReveal_900ms_cubic-bezier(.16,1,.3,1)_both]">

                        <p className="text-xs font-black uppercase tracking-[0.4em] text-yellow-300/60">
                            Final Result
                        </p>


                        {/* POSITION SCORE */}

                        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-center gap-8">

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-pink-300/50">
                                    You
                                </p>

                                <p className="mt-2 text-7xl font-black text-white">
                                    {myPositionWins}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-white/25">
                                    Position Wins
                                </p>

                                <p className="mt-2 text-3xl font-black italic text-white/20">
                                    -
                                </p>

                                {tiedPositions > 0 && (
                                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
                                        {tiedPositions}{" "}
                                        {tiedPositions === 1
                                            ? "Tie"
                                            : "Ties"}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-purple-300/50">
                                    {
                                        opponentPlayer.displayName
                                    }
                                </p>

                                <p className="mt-2 text-7xl font-black text-white">
                                    {
                                        opponentPositionWins
                                    }
                                </p>
                            </div>
                        </div>


                        {/* POWER TIEBREAKER */}

                        {positionalScoreTied && (
                            <div className="mx-auto mt-6 w-fit rounded-full border border-yellow-400/20 bg-yellow-500/[0.06] px-5 py-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-200/60">
                                    Team Power Tiebreaker •{" "}
                                    {myTotalPower} -{" "}
                                    {opponentTotalPower}
                                </p>
                            </div>
                        )}


                        {/* RESULT */}

                        <div className="mt-8">
                            {finalIsDraw ? (
                                <>
                                    <h2 className="text-7xl font-black text-white">
                                        DRAW
                                    </h2>

                                    <p className="mt-3 text-sm text-white/40">
                                        An evenly matched draft.
                                    </p>
                                </>
                            ) : iWonFinal ? (
                                <>
                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-yellow-300/60">
                                        Winner
                                    </p>

                                    <h2 className="mt-2 text-7xl font-black text-yellow-300 drop-shadow-[0_0_35px_rgba(250,204,21,0.65)]">
                                        VICTORY
                                    </h2>

                                    <p className="mt-3 text-lg font-bold text-white/60">
                                        You defeated{" "}
                                        {
                                            opponentPlayer.displayName
                                        }
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-purple-300/60">
                                        Winner
                                    </p>

                                    <h2 className="mt-2 text-7xl font-black text-purple-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.65)]">
                                        DEFEAT
                                    </h2>

                                    <p className="mt-3 text-lg font-bold text-white/60">
                                        {
                                            opponentPlayer.displayName
                                        }{" "}
                                        wins the draft
                                    </p>
                                </>
                            )}
                        </div>

                        {/* ASCENSION SUMMARY */}

                        <div className="mx-auto mt-8 max-w-4xl">

                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-300/50">
                                Ascensions
                            </p>

                            <div
                                className="
                                    mt-3
                                    grid
                                    items-stretch
                                    gap-3
                                    sm:grid-cols-[1fr_auto_1fr]
                                "
                            >

                                {/* YOUR ASCENSION */}

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-pink-500/30
                                        bg-zinc-950
                                        p-5
                                        text-left
                                        shadow-[0_0_25px_rgba(236,72,153,0.07)]
                                    "
                                >
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-pink-300/50">
                                        Your Ascension
                                    </p>

                                    <p className="mt-2 text-xl font-black text-yellow-200">
                                        {myState.selectedAscension}
                                    </p>

                                    {myState.selectedAscension && (
                                        <p className="mt-2 text-xs leading-5 text-white/40">
                                            {
                                                ascensionInfo[
                                                    myState.selectedAscension
                                                    ].description
                                            }
                                        </p>
                                    )}
                                </div>


                                {/* VS */}

                                <div className="flex items-center justify-center px-2">
                                    <p className="text-xs font-black italic text-white/20">
                                        VS
                                    </p>
                                </div>


                                {/* OPPONENT ASCENSION */}

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-purple-500/30
                                        bg-zinc-950
                                        p-5
                                        text-left
                                        shadow-[0_0_25px_rgba(168,85,247,0.07)]
                                    "
                                >
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-purple-300/50">
                                        {opponentPlayer.displayName}
                                    </p>

                                    <p className="mt-2 text-xl font-black text-yellow-200">
                                        {opponentState.selectedAscension}
                                    </p>

                                    {opponentState.selectedAscension && (
                                        <p className="mt-2 text-xs leading-5 text-white/40">
                                            {
                                                ascensionInfo[
                                                    opponentState.selectedAscension
                                                    ].description
                                            }
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>


                        {/* TOTAL POWER */}

                        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">

                            <div className="rounded-2xl border border-pink-500/20 bg-zinc-950 p-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-pink-300/40">
                                    Your Team Power
                                </p>

                                <p className="mt-1 text-3xl font-black text-white">
                                    {myTotalPower}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-pink-500/20 bg-zinc-950 p-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-purple-300/40">
                                    {
                                        opponentPlayer.displayName
                                    }
                                </p>

                                <p className="mt-1 text-3xl font-black text-white">
                                    {
                                        opponentTotalPower
                                    }
                                </p>
                            </div>
                        </div>


                        {/* MATCHUP SUMMARY */}

                        <div className="mt-12">

                            <div className="mb-5 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-300/50">
                                        Match Breakdown
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Head-to-Head Summary
                                    </h3>
                                </div>
                            </div>


                            <div
                                className="
                                    grid
                                    gap-4
                                    xl:grid-cols-[minmax(0,4fr)_minmax(240px,1fr)]
                                    xl:items-stretch
                                "
                            >
                                {/* ======================================= */}
                                {/* NORMAL POSITIONS */}
                                {/* ======================================= */}

                                <div
                                    className="
                                        grid
                                        gap-3
                                        sm:grid-cols-2
                                        lg:grid-cols-4
                                    "
                                >
                                    {normalSummarySlots.map(
                                        (slot) => (
                                            <HeadToHeadReveal
                                                key={slot.label}
                                                slot={slot}
                                                revealed={true}
                                                ascensionApplied={
                                                    true
                                                }
                                                myState={myState}
                                                opponentState={
                                                    opponentState
                                                }
                                                opponentName={
                                                    opponentPlayer.displayName
                                                }
                                                outcome={
                                                    getMatchupOutcome(
                                                        slot
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>


                                {/* ======================================= */}
                                {/* POWER POSITION */}
                                {/* ======================================= */}

                                {powerSummarySlot && (
                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >
                                        <div className="w-full">
                                            <HeadToHeadReveal
                                                slot={
                                                    powerSummarySlot
                                                }
                                                revealed={true}
                                                ascensionApplied={
                                                    true
                                                }
                                                myState={myState}
                                                opponentState={
                                                    opponentState
                                                }
                                                opponentName={
                                                    opponentPlayer.displayName
                                                }
                                                outcome={
                                                    getMatchupOutcome(
                                                        powerSummarySlot
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* BUTTONS */}

                        <div className="mt-10 flex flex-wrap justify-center gap-3">

                            <button
                                type="button"
                                onClick={handleRematch}
                                disabled={
                                    requestingRematch ||
                                    myRematchRequested ||
                                    match.status !==
                                    "complete"
                                }
                                className={`
                                    rounded-2xl
                                    border
                                    px-7
                                    py-3
                                    text-sm
                                    font-black
                                    transition

                                    ${
                                    myRematchRequested
                                        ? `
                                    cursor-not-allowed
                                    border-yellow-400/25
                                    bg-yellow-500/10
                                    text-yellow-200
                                    `
                                        : `
                                    border-yellow-400/40
                                    bg-yellow-500/10
                                    text-yellow-200
                                    hover:-translate-y-0.5
                                    hover:bg-yellow-500/20
                                    hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]
                                    hover:cursor-pointer
                                    `
                                    }
                                `}
                            >
                                {myRematchRequested
                                    ? opponentRematchRequested
                                        ? "Starting Rematch..."
                                        : "Waiting for Opponent..."
                                    : requestingRematch
                                        ? "Requesting..."
                                        : "⚡ Rematch"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/games/draft/multiplayer"
                                    )
                                }
                                className="
                                    rounded-2xl
                                    border
                                    border-pink-500/30
                                    bg-pink-500/10
                                    px-7
                                    py-3
                                    text-sm
                                    font-black
                                    text-pink-100
                                    transition
                                    hover:-translate-y-0.5
                                    hover:border-pink-400/60
                                    hover:bg-pink-500/20
                                    hover:cursor-pointer
                                "
                            >
                                Leave Match
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                
                    @keyframes powerBoost {
                        0% {
                            transform: scale(1);
                            filter: brightness(1);
                        }
                
                        45% {
                            transform: scale(1.35);
                            filter: brightness(2);
                        }
                
                        100% {
                            transform: scale(1);
                            filter: brightness(1);
                        }
                    }
                
                    @keyframes finalReveal {
                        0% {
                            opacity: 0;
                            transform:
                                scale(0.85)
                                translateY(35px);
                        }
                
                        60% {
                            opacity: 1;
                            transform:
                                scale(1.03)
                                translateY(0);
                        }
                
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    
                    @keyframes rematchNotificationIn {
                        0% {
                            opacity: 0;
                            transform:
                                translateX(50px)
                                scale(0.92);
                            filter: blur(6px);
                        }
                    
                        60% {
                            opacity: 1;
                            transform:
                                translateX(-5px)
                                scale(1.02);
                            filter: blur(0);
                        }
                    
                        100% {
                            opacity: 1;
                            transform:
                                translateX(0)
                                scale(1);
                            filter: blur(0);
                        }
                    }
                    @keyframes battleCardLeft {
                        0% {
                            opacity: 0;
                            transform:
                                translateX(-70vw)
                                scale(0.65)
                                rotate(-8deg);
                            filter: blur(10px);
                        }
                    
                        65% {
                            opacity: 1;
                            transform:
                                translateX(18px)
                                scale(1.04)
                                rotate(1deg);
                            filter: blur(0);
                        }
                    
                        100% {
                            opacity: 1;
                            transform:
                                translateX(0)
                                scale(1)
                                rotate(0);
                        }
                    }
                    
                    @keyframes battleCardRight {
                        0% {
                            opacity: 0;
                            transform:
                                translateX(70vw)
                                scale(0.65)
                                rotate(8deg);
                            filter: blur(10px);
                        }
                    
                        65% {
                            opacity: 1;
                            transform:
                                translateX(-18px)
                                scale(1.04)
                                rotate(-1deg);
                            filter: blur(0);
                        }
                    
                        100% {
                            opacity: 1;
                            transform:
                                translateX(0)
                                scale(1)
                                rotate(0);
                        }
                    }
                    
                    @keyframes battleVs {
                        0%,
                        55% {
                            opacity: 0;
                            transform: scale(3);
                        }
                    
                        70% {
                            opacity: 1;
                            transform: scale(0.8);
                        }
                    
                        85% {
                            transform: scale(1.15);
                        }
                    
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    
                    @keyframes battleImpact {
                        0%,
                        55% {
                            opacity: 0;
                            transform: scale(0.2);
                        }
                    
                        70% {
                            opacity: 0.8;
                            transform: scale(1);
                        }
                    
                        100% {
                            opacity: 0;
                            transform: scale(2.8);
                        }
                    }
                    
                    @keyframes battleWinner {
                        0% {
                            transform: scale(1);
                            filter: brightness(1);
                        }
                    
                        60% {
                            transform: scale(1.075);
                            filter: brightness(1.35);
                        }
                    
                        100% {
                            transform: scale(1.055);
                            filter: brightness(1.15);
                        }
                    }
                    
                    @keyframes battleLoser {
                        0% {
                            transform: scale(1);
                            opacity: 1;
                            filter: brightness(1);
                        }
                    
                        100% {
                            transform: scale(0.94);
                            opacity: 0.55;
                            filter: brightness(0.55);
                        }
                    }
                    
                    @keyframes battleResult {
                        0% {
                            opacity: 0;
                            transform:
                                translateY(20px)
                                scale(0.8);
                        }
                    
                        65% {
                            opacity: 1;
                            transform:
                                translateY(-3px)
                                scale(1.05);
                        }
                    
                        100% {
                            opacity: 1;
                            transform:
                                translateY(0)
                                scale(1);
                        }
                    }
                    
                    @keyframes battleEnergy {
                        0% {
                            opacity: 0;
                            transform:
                                translate(-50%, -50%)
                                scale(0.5);
                        }
                    
                        45% {
                            opacity: 1;
                        }
                    
                        100% {
                            opacity: 0.35;
                            transform:
                                translate(-50%, -50%)
                                scale(1.4);
                        }
                    }
                `}
            </style>
        </main>
    );
}