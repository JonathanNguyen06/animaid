"use client";
import {useEffect, useMemo, useState,} from "react";
import {useParams, useRouter,} from "next/navigation";
import {onAuthStateChanged, type User,} from "firebase/auth";
import {auth,} from "@/lib/firebase";
import {
    beginDraftRematchIfReady,
    completeDraftMatch, getDraftPlayerState, getFinalMultiplayerPicks,
    listenToDraftMatch,
    prepareDraftRematch,
    requestDraftRematch, saveDraftMatchHistory, startDraftRematchIfReady,
} from "@/lib/multiplayerDraft";
import {draftCharacters,} from "@/data/draftCharacters";
import {
    draftPositions,
    ascensionInfo,
    getDraftPickGrade,
    getPowerPositionMatchupPoints,
    getLetterGrade, disruptionInfo,
} from "@/data/draftLogic";
import type {DraftMatch, MultiplayerDraftPlayerState,} from "@/types/multiplayerDraft";
import {RevealProgressBar} from "@/app/components/RevealProgressBar";

type MultiplayerRevealPhase =
    | "intro"
    | "ascension"
    | "disruption"
    | "matchups"
    | "final";

type MatchupEffectStage =
    | "initial"
    | "ascension"
    | "disruption"
    | "resolved";

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

function getPreAscensionPick(
    pick:
    MultiplayerDraftPlayerState[
        "picks"
        ][number]
) {
    const power =
        getPreAscensionPower(
            pick
        );

    const character =
        draftCharacters.find(
            (character) =>
                character.id ===
                pick.characterId
        );

    return {
        ...pick,

        power,

        grade:
            character
                ? getDraftPickGrade(
                    character,
                    pick.position,
                    power
                )
                : getLetterGrade(
                    power
                ),

        disruptionPenalty:
            0,
    };
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

function RollingPower({
                          value,
                      }: {
    value: number;
}) {
    const [
        displayed,
        setDisplayed,
    ] = useState(value);

    useEffect(() => {
        const from =
            displayed;

        if (
            from === value
        ) {
            return;
        }

        const start =
            performance.now();

        const duration =
            650;

        let frame = 0;

        function animate(
            now: number
        ) {
            const progress =
                Math.min(
                    1,
                    (
                        now -
                        start
                    ) /
                    duration
                );

            const eased =
                1 -
                Math.pow(
                    1 -
                    progress,
                    3
                );

            setDisplayed(
                Math.round(
                    from +
                    (
                        value -
                        from
                    ) *
                    eased
                )
            );

            if (
                progress < 1
            ) {
                frame =
                    requestAnimationFrame(
                        animate
                    );
            }
        }

        frame =
            requestAnimationFrame(
                animate
            );

        return () =>
            cancelAnimationFrame(
                frame
            );
    }, [
        value,
    ]);

    return (
        <span className="tabular-nums">
            {displayed}
        </span>
    );
}

function CinematicMatchup({
                              slot,
                              matchupNumber,
                              totalMatchups,
                              myState,
                              opponentState,
                              opponentName,
                              myInitialPower,
                              myAscendedPower,
                              myFinalPower,
                              opponentInitialPower,
                              opponentAscendedPower,
                              opponentFinalPower,
                              effectStage,
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

    myInitialPower: number;
    myAscendedPower: number;
    myFinalPower: number;

    opponentInitialPower: number;
    opponentAscendedPower: number;
    opponentFinalPower: number;

    effectStage: MatchupEffectStage;
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

    const label =
        slot.isPowerPosition
            ? "⚡ POWER POSITION"
            : `${
                positionIcons[
                    slot.label as keyof typeof positionIcons
                    ] ?? ""
            } ${slot.label}`;

    const ascensionApplied =
        effectStage ===
        "ascension" ||
        effectStage ===
        "disruption" ||
        effectStage ===
        "resolved";


    const disruptionApplied =
        effectStage ===
        "disruption" ||
        effectStage ===
        "resolved";


    const myPower =
        disruptionApplied
            ? myFinalPower
            : ascensionApplied
                ? myAscendedPower
                : myInitialPower;


    const opponentPower =
        disruptionApplied
            ? opponentFinalPower
            : ascensionApplied
                ? opponentAscendedPower
                : opponentInitialPower;

    const myPowerColor =
        disruptionApplied &&
        myFinalPower !==
        myAscendedPower
            ? "text-red-200"
            : ascensionApplied &&
            myAscendedPower !==
            myInitialPower
                ? "text-yellow-200"
                : "text-white";


    const opponentPowerColor =
        disruptionApplied &&
        opponentFinalPower !==
        opponentAscendedPower
            ? "text-red-200"
            : ascensionApplied &&
            opponentAscendedPower !==
            opponentInitialPower
                ? "text-yellow-200"
                : "text-white";

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

    const myGradeStyle =
        getGradeStyle(
            myGrade
        );

    const opponentGradeStyle =
        getGradeStyle(
            opponentGrade
        );

    const finalOutcome:
        MatchupOutcome =
        myFinalPower >
        opponentFinalPower
            ? "win"
            : myFinalPower <
            opponentFinalPower
                ? "loss"
                : "tie";


    const showResult =
        effectStage ===
        "resolved";


    const myWon =
        showResult &&
        finalOutcome ===
        "win";


    const opponentWon =
        showResult &&
        finalOutcome ===
        "loss";


    const matchupTied =
        showResult &&
        finalOutcome ===
        "tie";

    return (
        <div
            key={slot.label}
            className="
                relative
                flex
                min-h-[500px]
                flex-col
                items-center
                justify-center
                overflow-hidden
                py-4

                sm:min-h-[620px]
                sm:py-8

                lg:min-h-[680px]
            "
        >
            {/* PROGRESS */}

            <div className="absolute left-0 right-0 top-4 text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25 sm:text-[10px] sm:tracking-[0.35em]">
                    Matchup {matchupNumber} / {totalMatchups}
                </p>

                <p
                    className={`
                        font-black
                        uppercase
                        mt-1
                        text-[10px]
                        tracking-[0.16em]
                        
                        sm:mt-2
                        sm:text-sm
                        sm:tracking-[0.3em]

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
                    grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)]
                    items-center
                    gap-1

                    sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]
                    sm:gap-3

                    lg:grid-cols-[1fr_auto_1fr]
                    lg:gap-6
                "
            >

                {/* ============================== */}
                {/* YOUR SIDE */}
                {/* ============================== */}

                <div className="flex min-w-0 justify-end">
                    <div
                        className="
                            w-full
                            max-w-[155px]
                            animate-[battleCardLeft_850ms_cubic-bezier(.16,1,.3,1)_both]

                            sm:max-w-[240px]
                            lg:max-w-[320px]
                        "
                    >

                        <div
                            className={
                                myWon
                                    ? "animate-[battleWinner_700ms_cubic-bezier(.16,1,.3,1)_forwards]"
                                    : showResult &&
                                    !matchupTied
                                        ? "animate-[battleLoser_500ms_ease-out_forwards]"
                                        : ""
                            }
                        >
                            <div
                                className={`
                                    relative
                                    aspect-[2/3]
                                    w-full
                                    overflow-hidden
                                    rounded-2xl
                                    border-2
                                    bg-black
                            
                                    sm:rounded-[2rem]
                            
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

                                <div className="absolute left-2 top-2 rounded-lg border border-white/10 bg-black/75 px-2 py-1 backdrop-blur-xl sm:left-4 sm:top-4 sm:rounded-xl sm:px-3 sm:py-2">
                                    <p
                                        className={`
                                            text-lg
                                            font-black
                                            italic
                                    
                                            sm:text-3xl
                                    
                                            ${myGradeStyle.grade}
                                        `}
                                    >
                                        {myGrade}
                                    </p>
                                </div>


                                {/* POWER */}

                                <div
                                    className="
                                        absolute
                                        right-2
                                        top-2
                                        rounded-lg
                                        border
                                        border-white/10
                                        bg-black/75
                                        px-2
                                        py-1
                                        text-center
                                        backdrop-blur-xl

                                        sm:right-4
                                        sm:top-4
                                        sm:rounded-xl
                                        sm:px-3
                                        sm:py-2
                                    "
                                >
                                    <p
                                        className={`
                                            text-sm sm:text-2xl
                                            font-black
                                            transition-colors
                                            duration-300
                                    
                                            ${myPowerColor}
                                        `}
                                    >
                                        <RollingPower
                                            value={myPower}
                                        />
                                    </p>

                                    <p className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-white/35">
                                        OVR
                                    </p>
                                </div>


                                {/* INFO */}

                                <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left sm:p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-300">
                                        You
                                    </p>

                                    <h3 className="mt-0.5 line-clamp-2 text-sm font-black leading-tight text-white sm:mt-1 sm:text-2xl">
                                        {myCharacter.name}
                                    </h3>

                                    <p className="mt-0.5 truncate text-[8px] font-semibold text-white/45 sm:mt-1 sm:text-xs">
                                        {myCharacter.anime}
                                    </p>

                                    {slot.isPowerPosition && (
                                        <p className="mt-1 truncate text-[8px] font-black text-yellow-300 sm:mt-2 sm:text-xs">
                                            {myState.selectedPowerPosition}
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

                <div className="relative flex w-9 items-center justify-center sm:w-16 lg:w-24">

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
                            h-9
                            w-9
                            animate-[battleVs_700ms_500ms_cubic-bezier(.16,1,.3,1)_both]
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-pink-300/30
                            bg-black/80
                            text-[9px]
                            font-black
                            italic
                            text-white
                            shadow-[0_0_20px_rgba(236,72,153,0.3)]
                            backdrop-blur-xl

                            sm:h-16
                            sm:w-16
                            sm:text-lg

                            lg:h-20
                            lg:w-20
                            lg:text-2xl
                        "
                    >
                        VS
                    </div>
                </div>


                {/* ============================== */}
                {/* OPPONENT */}
                {/* ============================== */}

                <div className="flex min-w-0 justify-start">
                    <div
                        className="
                            w-full
                            max-w-[155px]
                            animate-[battleCardRight_850ms_cubic-bezier(.16,1,.3,1)_both]

                            sm:max-w-[240px]
                            lg:max-w-[320px]
                        "
                    >

                        <div
                            className={
                                opponentWon
                                    ? "animate-[battleWinner_700ms_cubic-bezier(.16,1,.3,1)_forwards]"
                                    : showResult &&
                                    !matchupTied
                                        ? "animate-[battleLoser_500ms_ease-out_forwards]"
                                        : ""
                            }
                        >
                            <div
                                className={`
                                    relative
                                    aspect-[2/3]
                                    w-full
                                    overflow-hidden
                                    rounded-2xl
                                    border-2
                                    bg-black
                            
                                    sm:rounded-[2rem]
                            
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

                                <div
                                    className="
                                        absolute
                                        left-2
                                        top-2
                                        rounded-lg
                                        border
                                        border-white/10
                                        bg-black/75
                                        px-2
                                        py-1
                                        backdrop-blur-xl

                                        sm:left-4
                                        sm:top-4
                                        sm:rounded-xl
                                        sm:px-3
                                        sm:py-2
                                    "
                                >
                                    <p
                                        className={`
                                            text-lg
                                            font-black
                                            italic
                                
                                            sm:text-3xl
                                
                                            ${opponentGradeStyle.grade}
                                        `}
                                    >
                                        {opponentGrade}
                                    </p>
                                </div>

                                <div
                                    className="
                                        absolute
                                        right-2
                                        top-2
                                        rounded-lg
                                        border
                                        border-white/10
                                        bg-black/75
                                        px-2
                                        py-1
                                        text-center
                                        backdrop-blur-xl

                                        sm:right-4
                                        sm:top-4
                                        sm:rounded-xl
                                        sm:px-3
                                        sm:py-2
                                    "
                                >
                                    <p
                                        className={`
                                            text-sm sm:text-2xl
                                            font-black
                                            transition-colors
                                            duration-300
                                    
                                            ${opponentPowerColor}
                                        `}
                                    >
                                        <RollingPower
                                            value={opponentPower}
                                        />
                                    </p>

                                    <p className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-white/35">
                                        OVR
                                    </p>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left sm:p-5">
                                    <p className="text-[7px] font-black uppercase tracking-[0.12em] text-pink-300 sm:text-[10px] sm:tracking-[0.25em]">
                                        {opponentName}
                                    </p>

                                    <h3 className="mt-0.5 line-clamp-2 text-sm font-black leading-tight text-white sm:mt-1 sm:text-2xl">
                                        {opponentCharacter.name}
                                    </h3>

                                    <p className="mt-0.5 truncate text-[8px] font-semibold text-white/45 sm:mt-1 sm:text-xs">
                                        {opponentCharacter.anime}
                                    </p>

                                    {slot.isPowerPosition && (
                                        <p className="mt-1 truncate text-[8px] font-black text-yellow-300 sm:mt-2 sm:text-xs">
                                            {opponentState.selectedPowerPosition}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ======================================= */}
            {/* MATCHUP RESOLUTION CINEMATIC */}
            {/* ======================================= */}

            {showResult &&
                !matchupTied && (
                    <div
                        className={`
                            pointer-events-none
                            absolute
                            inset-y-0
                            z-30
                            w-1/2
                            overflow-hidden
            
                            ${
                            myWon
                                ? "left-0"
                                : "right-0"
                            }
                        `}
                    >


                        {/* SOFT VICTORY AURA */}

                        <div
                            className={`
                                absolute
                                top-1/2
                                h-[260px]
                                w-[220px]
                                -translate-y-1/2
                                animate-[victoryBurst_800ms_ease-out_both]
                                rounded-[50%]
                                blur-[70px]
                        
                                sm:h-[420px]
                                sm:w-[380px]
                                sm:blur-[100px]
                        
                                ${
                                myWon
                                    ? `
                                        left-[4%]
                                        bg-pink-400/20
                    
                                        sm:left-[12%]
                                    `
                                    : `
                                        right-[4%]
                                        bg-purple-400/20
                    
                                        sm:right-[12%]
                                    `
                                }
                            `}
                        />


                        {/* DIAGONAL ENERGY SLASH */}

                        <div
                            className={`
                                absolute
                                top-[47%]
                                h-[4px]
                                w-[130%]
                                -translate-y-1/2
                                animate-[victorySlash_650ms_cubic-bezier(.16,1,.3,1)_both]
                                bg-gradient-to-r
                                from-transparent
                                via-white
                                to-transparent
                                shadow-[0_0_22px_rgba(255,255,255,0.9)]
            
                                ${
                                myWon
                                    ? `
                                        -left-[15%]
                                        -rotate-[12deg]
                                    `
                                    : `
                                        -right-[15%]
                                        rotate-[12deg]
                                    `
                                }
                            `}
                        />


                        {/* SECONDARY SLASH */}

                        <div
                            className={`
                                absolute
                                top-[51%]
                                h-px
                                w-[115%]
                                -translate-y-1/2
                                animate-[victorySlashSecondary_750ms_80ms_cubic-bezier(.16,1,.3,1)_both]
            
                                ${
                                myWon
                                    ? `
                                        -left-[10%]
                                        -rotate-[8deg]
                                        bg-gradient-to-r
                                        from-transparent
                                        via-pink-200/80
                                        to-transparent
                                    `
                                    : `
                                        -right-[10%]
                                        rotate-[8deg]
                                        bg-gradient-to-r
                                        from-transparent
                                        via-purple-200/80
                                        to-transparent
                                    `
                                }
                            `}
                        />


                        {/* RESULT STAMP */}
                        <div
                            className={`
                                absolute
                                bottom-[13%]
                                animate-[victoryStamp_700ms_120ms_cubic-bezier(.16,1,.3,1)_both]
                        
                                ${
                                myWon
                                    ? `
                                        left-[10%]
                                        text-left
                    
                                        sm:left-[14%]
                                    `
                                    : `
                                        right-[10%]
                                        text-right
                    
                                        sm:right-[14%]
                                    `
                                }
                            `}
                        >
                            <p
                                className={`
                                    text-xl
                                    font-black
                                    italic
                                    tracking-tight
                                    text-white
                                    drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]
                        
                                    sm:text-4xl
                        
                                    ${
                                    myWon
                                        ? "text-pink-100"
                                        : "text-purple-100"
                                    }
                                `}
                            >
                                {myWon
                                    ? "MATCHUP WON"
                                    : "MATCHUP LOST"}
                            </p>

                            <div
                                className={`
                                    mt-1
                                    h-[2px]
                                    w-full
                                    rounded-full
                        
                                    ${
                                    myWon
                                        ? "bg-pink-300/70 shadow-[0_0_10px_rgba(244,114,182,0.7)]"
                                        : "bg-purple-300/70 shadow-[0_0_10px_rgba(216,180,254,0.7)]"
                                    }
                                `}
                            />
                        </div>

                    </div>
                )}

            {matchupTied && (
                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        z-30
                        flex
                        items-center
                        justify-center
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[320px]
                            w-[600px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[tieBurst_800ms_ease-out_both]
                            rounded-full
                            bg-white/[0.07]
                            blur-[100px]
                        "
                    />

                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[2px]
                            w-[70%]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[tieSlash_650ms_cubic-bezier(.16,1,.3,1)_both]
                            bg-gradient-to-r
                            from-transparent
                            via-white/80
                            to-transparent
                            shadow-[0_0_18px_rgba(255,255,255,0.5)]
                        "
                    />

                    <div
                        className="
                            relative
                            animate-[victoryStamp_700ms_cubic-bezier(.16,1,.3,1)_both]
                            text-center
                        "
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                            No Advantage
                        </p>

                        <p
                            className="
                                mt-1
                                text-5xl
                                font-black
                                italic
                                tracking-tight
                                text-white
                                drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]
                            "
                        >
                            DEADLOCK
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}


function RevealEffectChoice({
                                owner,
                                name,
                                description,
                                type,
                                compact,
                                glowing,
                            }: {
    owner: string;

    name: string | null;

    description:
        string | null;

    type:
        | "ascension"
        | "disruption";

    compact: boolean;

    glowing: boolean;
}) {
    return (
        <div
            className={`
                relative
                overflow-hidden
                border
                backdrop-blur-xl

                transition-all
                duration-700
                ease-[cubic-bezier(.16,1,.3,1)]

                ${
                compact
                    ? `
                        w-[calc(50vw-1.25rem)]
                        max-w-[170px]
                        rounded-xl
                        px-2.5
                        py-2
            
                        sm:w-[260px]
                        sm:max-w-none
                        sm:rounded-2xl
                        sm:px-4
                        sm:py-3
                    `
                        : `
                        w-[calc(50vw-1.25rem)]
                        max-w-[170px]
                        rounded-2xl
                        px-3
                        py-4
            
                        sm:w-[420px]
                        sm:max-w-none
                        sm:rounded-3xl
                        sm:px-6
                        sm:py-6
                    `
                }

                ${
                type ===
                "ascension"
                    ? `
                            border-yellow-400/30
                            bg-yellow-500/[0.08]
                        `
                    : `
                            border-red-400/30
                            bg-red-500/[0.08]
                        `
                }

                ${
                glowing &&
                type === "ascension"
                    ? `
                            scale-[1.06]
                            border-yellow-200
                            shadow-[0_0_40px_rgba(250,204,21,0.55)]
                          `
                    : ""
                }

                ${
                glowing &&
                type === "disruption"
                    ? `
                            scale-[1.06]
                            border-red-300
                            shadow-[0_0_40px_rgba(248,113,113,0.50)]
                          `
                    : ""
                }
            `}
        >

            <p
                className={`
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.3em]

                    ${
                    type ===
                    "ascension"
                        ? "text-yellow-300/55"
                        : "text-red-300/55"
                }
                `}
            >
                {owner}
            </p>


            <p
                className={`
                    mt-1
                    font-black

                    ${
                    compact
                        ? "text-xs sm:text-base"
                        : "text-base sm:text-2xl"
                }

                    ${
                    type ===
                    "ascension"
                        ? "text-yellow-100"
                        : "text-red-100"
                }
                `}
            >
                {name ?? "None"}
            </p>


            {!compact &&
                description && (
                    <p className="mt-2 text-xs leading-5 text-white/40">
                        {description}
                    </p>
                )}

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
    const [requestingRematch, setRequestingRematch,] = useState(false);
    const [finalTeamsLoaded, setFinalTeamsLoaded,] = useState(false);
    const [historySaved, setHistorySaved,] = useState(false);
    const [currentMatchupIndex, setCurrentMatchupIndex,] = useState(0);
    const [matchupEffectStage, setMatchupEffectStage,] = useState<MatchupEffectStage>("initial");


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

    const myPreAscensionPicks =
        useMemo(
            () =>
                revealMyState
                    ? revealMyState.picks.map(
                        getPreAscensionPick
                    )
                    : [],
            [
                revealMyState,
            ]
        );


    const opponentPreAscensionPicks =
        useMemo(
            () =>
                revealOpponentState
                    ? revealOpponentState.picks.map(
                        getPreAscensionPick
                    )
                    : [],
            [
                revealOpponentState,
            ]
        );


    const finalMyPicks =
        useMemo(
            () => {
                if (
                    !revealMyState ||
                    !revealOpponentState
                ) {
                    return [];
                }

                return getFinalMultiplayerPicks(
                    revealMyState,

                    revealOpponentState
                        .selectedDisruption
                );
            },
            [
                revealMyState,
                revealOpponentState,
            ]
        );


    const finalOpponentPicks =
        useMemo(
            () => {
                if (
                    !revealMyState ||
                    !revealOpponentState
                ) {
                    return [];
                }

                return getFinalMultiplayerPicks(
                    revealOpponentState,

                    revealMyState
                        .selectedDisruption
                );
            },
            [
                revealMyState,
                revealOpponentState,
            ]
        );

    const finalRevealSlots =
        useMemo(() => {
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
                            finalMyPicks.find(
                                (pick) =>
                                    pick.position ===
                                    position
                            ) ?? null,

                        opponentPick:
                            finalOpponentPicks.find(
                                (pick) =>
                                    pick.position ===
                                    position
                            ) ?? null,

                        isPowerPosition:
                            false,
                    })
                );

            const myPowerPick =
                finalMyPicks.find(
                    (pick) =>
                        pick.position ===
                        revealMyState
                            .selectedPowerPosition
                ) ?? null;

            const opponentPowerPick =
                finalOpponentPicks.find(
                    (pick) =>
                        pick.position ===
                        revealOpponentState
                            .selectedPowerPosition
                ) ?? null;

            return [
                ...normalSlots,

                {
                    label:
                        "Power Position",

                    myPick:
                    myPowerPick,

                    opponentPick:
                    opponentPowerPick,

                    isPowerPosition:
                        true,
                },
            ];
        }, [
            revealMyState,
            revealOpponentState,
            finalMyPicks,
            finalOpponentPicks,
        ]);


// ---------------------------------------------------------
// BUILD 9 REVEAL MATCHUPS
// ---------------------------------------------------------

    useEffect(() => {
        if (
            !hostState ||
            !guestState ||
            revealPhase !== "intro"
        ) {
            return;
        }

        const timeout =
            window.setTimeout(
                () => {
                    setRevealPhase(
                        "ascension"
                    );
                },
                1200
            );

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
            revealPhase !==
            "ascension"
        ) {
            return;
        }

        const timeout =
            window.setTimeout(
                () => {
                    setRevealPhase(
                        "disruption"
                    );
                },
                4500
            );

        return () =>
            window.clearTimeout(
                timeout
            );
    }, [
        revealPhase,
    ]);

    useEffect(() => {
        if (
            revealPhase !==
            "disruption"
        ) {
            return;
        }

        const timeout =
            window.setTimeout(
                () => {
                    setCurrentMatchupIndex(
                        0
                    );

                    setMatchupEffectStage(
                        "initial"
                    );

                    setRevealPhase(
                        "matchups"
                    );
                },
                4500
            );

        return () =>
            window.clearTimeout(
                timeout
            );
    }, [
        revealPhase,
    ]);

    useEffect(() => {
        if (
            revealPhase !==
            "matchups"
        ) {
            return;
        }

        setMatchupEffectStage(
            "initial"
        );

        const ascensionTimer =
            window.setTimeout(
                () => {
                    setMatchupEffectStage(
                        "ascension"
                    );
                },
                800
            );

        const disruptionTimer =
            window.setTimeout(
                () => {
                    setMatchupEffectStage(
                        "disruption"
                    );
                },
                1600
            );

        const resolvedTimer =
            window.setTimeout(
                () => {
                    setMatchupEffectStage(
                        "resolved"
                    );
                },
                2450
            );

        const nextTimer =
            window.setTimeout(
                () => {
                    const isLast =
                        currentMatchupIndex ===
                        finalRevealSlots.length -
                        1;

                    if (isLast) {
                        setRevealPhase(
                            "final"
                        );

                        return;
                    }

                    setCurrentMatchupIndex(
                        (current) =>
                            current + 1
                    );
                },
                3300
            );

        return () => {
            window.clearTimeout(
                ascensionTimer
            );

            window.clearTimeout(
                disruptionTimer
            );

            window.clearTimeout(
                resolvedTimer
            );

            window.clearTimeout(
                nextTimer
            );
        };
    }, [
        revealPhase,
        currentMatchupIndex,
        finalRevealSlots.length,
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
            revealPhase !==
            "final"
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
        finalMyPicks.reduce(
            (total, pick) =>
                total + pick.power,
            0
        );


    const opponentTotalPower =
        finalOpponentPicks.reduce(
            (total, pick) =>
                total + pick.power,
            0
        );

    const finalNormalSlots =
        finalRevealSlots.filter(
            (slot) =>
                !slot.isPowerPosition
        );

    const matchupOutcomes =
        finalRevealSlots.map(
            (slot) =>
                getMatchupOutcome(slot)
        );


    const myPositionWins =
        finalRevealSlots.reduce(
            (
                total,
                slot,
                index
            ) => {
                const outcome =
                    matchupOutcomes[index];

                if (
                    outcome !== "win"
                ) {
                    return total;
                }

                const points =
                    slot.isPowerPosition
                        ? getPowerPositionMatchupPoints(
                            myState
                                .selectedPowerPosition
                        )
                        : 1;

                return (
                    total +
                    points
                );
            },
            0
        );


    const opponentPositionWins =
        finalRevealSlots.reduce(
            (
                total,
                slot,
                index
            ) => {
                const outcome =
                    matchupOutcomes[index];

                if (
                    outcome !== "loss"
                ) {
                    return total;
                }

                const points =
                    slot.isPowerPosition
                        ? getPowerPositionMatchupPoints(
                            opponentState
                                .selectedPowerPosition
                        )
                        : 1;

                return (
                    total +
                    points
                );
            },
            0
        );

    const finalPowerSummarySlot =
        finalRevealSlots.find(
            (slot) =>
                slot.isPowerPosition
        ) ?? null;


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

    const currentMatchupSlot =
        revealPhase === "matchups"
            ? finalRevealSlots[
            currentMatchupIndex
            ] ?? null
            : null;

    const currentMyInitialPick =
        currentMatchupSlot
            ? myPreAscensionPicks.find(
            (pick) =>
                pick.position ===
                currentMatchupSlot
                    .myPick
                    ?.position
        ) ?? null
            : null;


    const currentMyAscendedPick =
        currentMatchupSlot
            ? revealMyState?.picks.find(
            (pick) =>
                pick.position ===
                currentMatchupSlot
                    .myPick
                    ?.position
        ) ?? null
            : null;


    const currentMyFinalPick =
        currentMatchupSlot
            ? finalMyPicks.find(
            (pick) =>
                pick.position ===
                currentMatchupSlot
                    .myPick
                    ?.position
        ) ?? null
            : null;

    const currentOpponentInitialPick =
        currentMatchupSlot
            ? opponentPreAscensionPicks.find(
            (pick) =>
                pick.position ===
                currentMatchupSlot
                    .opponentPick
                    ?.position
        ) ?? null
            : null;


    const currentOpponentAscendedPick =
        currentMatchupSlot
            ? revealOpponentState
            ?.picks.find(
                (pick) =>
                    pick.position ===
                    currentMatchupSlot
                        .opponentPick
                        ?.position
            ) ?? null
            : null;


    const currentOpponentFinalPick =
        currentMatchupSlot
            ? finalOpponentPicks.find(
            (pick) =>
                pick.position ===
                currentMatchupSlot
                    .opponentPick
                    ?.position
        ) ?? null
            : null;

    const myAscensionAffectsCurrent =
        !!currentMyInitialPick &&
        !!currentMyAscendedPick &&
        currentMyAscendedPick.power >
        currentMyInitialPick.power;


    const opponentAscensionAffectsCurrent =
        !!currentOpponentInitialPick &&
        !!currentOpponentAscendedPick &&
        currentOpponentAscendedPick.power >
        currentOpponentInitialPick.power;


    const opponentDisruptionAffectsCurrent =
        !!currentMyAscendedPick &&
        !!currentMyFinalPick &&
        currentMyFinalPick.power <
        currentMyAscendedPick.power;


    const myDisruptionAffectsCurrent =
        !!currentOpponentAscendedPick &&
        !!currentOpponentFinalPick &&
        currentOpponentFinalPick.power <
        currentOpponentAscendedPick.power;

    const ascensionStageActive =
        matchupEffectStage ===
        "ascension" ||
        matchupEffectStage ===
        "disruption" ||
        matchupEffectStage ===
        "resolved";


    const disruptionStageActive =
        matchupEffectStage ===
        "disruption" ||
        matchupEffectStage ===
        "resolved";

    const myAscensionActive =
        ascensionStageActive &&
        myAscensionAffectsCurrent;


    const opponentAscensionActive =
        ascensionStageActive &&
        opponentAscensionAffectsCurrent;


    const myDisruptionActive =
        disruptionStageActive &&
        myDisruptionAffectsCurrent;


    const opponentDisruptionActive =
        disruptionStageActive &&
        opponentDisruptionAffectsCurrent;

    return (
        <main
            className="
                mx-auto
                min-h-[calc(100vh-130px)]
                max-w-[1700px]
                px-2
                py-2

                sm:px-4
                sm:py-6
            "
        >

            {/* BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            {/* REMATCH REQUEST NOTIFICATION */}
            {revealPhase === "final" &&
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

            {(
                revealPhase ===
                        "ascension" ||
                        revealPhase ===
                        "disruption" ||
                        revealPhase ===
                        "matchups"
                    ) && (
                        <div
                            className="
                    pointer-events-none
                    fixed
                    inset-0
                    z-40
                "
                >

                    {/* ====================================== */}
                    {/* ASCENSIONS */}
                    {/* ====================================== */}

                            <div
                                className={`
                                    absolute
                                    left-4
                                    right-4
                                    top-1/2
                                    flex
                                    justify-center
                                    gap-2
                                    transition-transform
                                    duration-700
                                    ease-[cubic-bezier(.16,1,.3,1)]
                            
                                    sm:left-0
                                    sm:right-0
                                    sm:gap-10
                            
                                    ${
                                    revealPhase === "ascension"
                                        ? `
                                            -translate-y-1/2
                                        `
                                        : `
                                            translate-y-[215px]
                        
                                            sm:translate-y-[calc(50vh-6.5rem)]
                                        `
                                    }
                                `}
                            >

                        <RevealEffectChoice
                            owner="Your Ascension"
                            name={
                                revealMyState
                                    ?.selectedAscension ??
                                null
                            }
                            description={
                                revealMyState
                                    ?.selectedAscension
                                    ? ascensionInfo[
                                        revealMyState
                                            .selectedAscension
                                        ].description
                                    : null
                            }
                            type="ascension"
                            compact={
                                revealPhase !==
                                "ascension"
                            }
                            glowing={
                                revealPhase ===
                                "matchups" &&
                                myAscensionActive
                            }
                        />


                        <RevealEffectChoice
                            owner={`${opponentPlayer.displayName}'s Ascension`}
                            name={
                                revealOpponentState
                                    ?.selectedAscension ??
                                null
                            }
                            description={
                                revealOpponentState
                                    ?.selectedAscension
                                    ? ascensionInfo[
                                        revealOpponentState
                                            .selectedAscension
                                        ].description
                                    : null
                            }
                            type="ascension"
                            compact={
                                revealPhase !==
                                "ascension"
                            }
                            glowing={
                                revealPhase ===
                                "matchups" &&
                                opponentAscensionActive
                            }
                        />

                    </div>


                    {/* ====================================== */}
                    {/* DISRUPTIONS */}
                    {/* ====================================== */}

                    {revealPhase !==
                        "ascension" && (
                            <div
                                className={`
                                    absolute
                                    left-4
                                    right-4
                                    top-1/2
                                    flex
                                    justify-center
                                    gap-2
                                    transition-transform
                                    duration-700
                                    ease-[cubic-bezier(.16,1,.3,1)]
                            
                                    sm:left-0
                                    sm:right-0
                                    sm:gap-10
                            
                                    ${
                                    revealPhase === "disruption"
                                        ? `
                                            -translate-y-1/2
                                        `
                                        : `
                                            translate-y-[275px]
                        
                                            sm:translate-y-[calc(50vh-12rem)]
                                        `
                                    }
                                `}
                            >

                                <RevealEffectChoice
                                    owner="Your Disruption"
                                    name={
                                        revealMyState
                                            ?.selectedDisruption ??
                                        null
                                    }
                                    description={
                                        revealMyState
                                            ?.selectedDisruption
                                            ? disruptionInfo[
                                                revealMyState
                                                    .selectedDisruption
                                                ].description
                                            : null
                                    }
                                    type="disruption"
                                    compact={
                                        revealPhase !==
                                        "disruption"
                                    }
                                    glowing={
                                        revealPhase ===
                                        "matchups" &&
                                        myDisruptionActive
                                    }
                                />


                                <RevealEffectChoice
                                    owner={`${opponentPlayer.displayName}'s Disruption`}
                                    name={
                                        revealOpponentState
                                            ?.selectedDisruption ??
                                        null
                                    }
                                    description={
                                        revealOpponentState
                                            ?.selectedDisruption
                                            ? disruptionInfo[
                                                revealOpponentState
                                                    .selectedDisruption
                                                ].description
                                            : null
                                    }
                                    type="disruption"
                                    compact={
                                        revealPhase !==
                                        "disruption"
                                    }
                                    glowing={
                                        revealPhase ===
                                        "matchups" &&
                                        opponentDisruptionActive
                                    }
                                />

                            </div>
                        )}

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
                {/* ASCENSION REVEAL */}
                {/* ============================== */}

                {revealPhase ===
                    "ascension" && (
                        <div
                            className="
                                relative
                                flex
                                min-h-[680px]
                                flex-col
                                items-center
                                justify-start
                                pt-16
                            "
                        >
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-yellow-300/55">
                                Ascension Reveal
                            </p>

                            <h2 className="mt-2 text-4xl font-black text-yellow-100">
                                POWER AWAKENS
                            </h2>

                            <p className="mt-2 text-sm text-white/35">
                                Both players reveal their Ascension.
                            </p>

                            <RevealProgressBar
                                tone="ascension"
                            />
                        </div>
                    )}

                {/* ============================== */}
                {/* DISRUPTION REVEAL */}
                {/* ============================== */}

                {revealPhase ===
                    "disruption" && (
                        <div
                            className="
                                relative
                                flex
                                min-h-[680px]
                                flex-col
                                items-center
                                justify-start
                                pt-16
                            "
                        >
                            <p className="text-xs font-black uppercase tracking-[0.4em] text-red-300/55">
                                Disruption Reveal
                            </p>

                            <h2 className="mt-2 text-4xl font-black text-red-100">
                                COUNTERATTACK
                            </h2>

                            <p className="mt-2 text-sm text-white/35">
                                Both players reveal their Disruption.
                            </p>

                            <RevealProgressBar
                                tone="disruption"
                            />
                        </div>
                    )}


                {/* ============================== */}
                {/* SINGLE MATCHUP */}
                {/* ============================== */}

                {revealPhase ===
                    "matchups" &&
                    currentMatchupSlot &&
                    currentMyInitialPick &&
                    currentMyAscendedPick &&
                    currentMyFinalPick &&
                    currentOpponentInitialPick &&
                    currentOpponentAscendedPick &&
                    currentOpponentFinalPick && (
                        <CinematicMatchup
                            key={
                                currentMatchupIndex
                            }
                            slot={
                                currentMatchupSlot
                            }
                            matchupNumber={
                                currentMatchupIndex +
                                1
                            }
                            totalMatchups={
                                finalRevealSlots.length
                            }
                            myState={
                                myState
                            }
                            opponentState={
                                opponentState
                            }
                            opponentName={
                                opponentPlayer.displayName
                            }

                            myInitialPower={
                                currentMyInitialPick.power
                            }
                            myAscendedPower={
                                currentMyAscendedPick.power
                            }
                            myFinalPower={
                                currentMyFinalPick.power
                            }

                            opponentInitialPower={
                                currentOpponentInitialPick.power
                            }
                            opponentAscendedPower={
                                currentOpponentAscendedPick.power
                            }
                            opponentFinalPower={
                                currentOpponentFinalPick.power
                            }

                            effectStage={
                                matchupEffectStage
                            }
                        />
                    )}

                {/* ============================== */}
                {/* FINAL SUMMARY */}
                {/* ============================== */}

                {revealPhase === "final" && (
                    <div className="animate-[finalReveal_900ms_cubic-bezier(.16,1,.3,1)_both]">

                        <p className="text-xs font-black uppercase tracking-[0.4em] text-yellow-300/60">
                            Final Result
                        </p>


                        {/* POSITION SCORE */}

                        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-center gap-8">

                            <div>
                                <p className="text-[7px] font-black uppercase tracking-[0.12em] text-pink-300 sm:text-[10px] sm:tracking-[0.25em]">
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
                                    xl:items-center
                                "
                            >
                                {/* NORMAL POSITIONS */}

                                <div
                                    className="
                                        grid
                                        gap-3
                                        sm:grid-cols-2
                                        lg:grid-cols-4
                                    "
                                >
                                    {finalNormalSlots.map(
                                        (slot) => (
                                            <HeadToHeadReveal
                                                key={slot.label}
                                                slot={slot}
                                                revealed={true}
                                                ascensionApplied={true}
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


                                {/* POWER POSITION */}

                                {finalPowerSummarySlot && (
                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-center
                                            xl:self-center
                                        "
                                    >
                                        <div className="w-full">
                                            <HeadToHeadReveal
                                                slot={
                                                    finalPowerSummarySlot
                                                }
                                                revealed={true}
                                                ascensionApplied={true}
                                                myState={myState}
                                                opponentState={
                                                    opponentState
                                                }
                                                opponentName={
                                                    opponentPlayer.displayName
                                                }
                                                outcome={
                                                    getMatchupOutcome(
                                                        finalPowerSummarySlot
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
                    
                    @keyframes revealProgress {
                        from {
                            transform: scaleX(0);
                        }
                    
                        to {
                            transform: scaleX(1);
                        }
                    }
                    
                    @keyframes victoryWash {
                        0% {
                            opacity: 0;
                        }
                    
                        30% {
                            opacity: 1;
                        }
                    
                        100% {
                            opacity: 0.7;
                        }
                    }
                    
                    
                    @keyframes victoryBurst {
                        0% {
                            opacity: 0;
                            transform:
                                translateY(-50%)
                                scale(0.2);
                        }
                    
                        35% {
                            opacity: 1;
                            transform:
                                translateY(-50%)
                                scale(1.15);
                        }
                    
                        100% {
                            opacity: 0.3;
                            transform:
                                translateY(-50%)
                                scale(1.45);
                        }
                    }
                    
                    
                    @keyframes victorySlash {
                        0% {
                            opacity: 0;
                            transform:
                                translateX(-100%)
                                scaleX(0.2);
                        }
                    
                        35% {
                            opacity: 1;
                        }
                    
                        100% {
                            opacity: 0;
                            transform:
                                translateX(100%)
                                scaleX(1);
                        }
                    }
                    
                    
                    @keyframes victorySlashSecondary {
                        0% {
                            opacity: 0;
                            transform:
                                translateX(-70%)
                                scaleX(0.3);
                        }
                    
                        45% {
                            opacity: 0.8;
                        }
                    
                        100% {
                            opacity: 0;
                            transform:
                                translateX(70%)
                                scaleX(1);
                        }
                    }
                    
                    
                    @keyframes victoryFrame {
                        0% {
                            opacity: 0;
                            transform: scale(1.12);
                            filter: brightness(2);
                        }
                    
                        45% {
                            opacity: 1;
                            transform: scale(0.98);
                        }
                    
                        100% {
                            opacity: 0.7;
                            transform: scale(1);
                        }
                    }
                    
                    
                    @keyframes victoryWord {
                        0% {
                            opacity: 0;
                            transform:
                                translateY(-50%)
                                translateX(-40px)
                                scale(1.2);
                            filter: blur(10px);
                        }
                    
                        60% {
                            opacity: 1;
                            filter: blur(0);
                        }
                    
                        100% {
                            opacity: 1;
                            transform:
                                translateY(-50%)
                                translateX(0)
                                scale(1);
                        }
                    }
                    
                    
                    @keyframes victoryStamp {
                        0% {
                            opacity: 0;
                            transform:
                                translateY(25px)
                                scale(1.35);
                            filter: blur(5px);
                        }
                    
                        60% {
                            opacity: 1;
                            transform:
                                translateY(-3px)
                                scale(0.97);
                            filter: blur(0);
                        }
                    
                        100% {
                            opacity: 1;
                            transform:
                                translateY(0)
                                scale(1);
                        }
                    }
                    
                    
                    @keyframes tieBurst {
                        0% {
                            opacity: 0;
                            transform:
                                translate(-50%, -50%)
                                scale(0.3);
                        }
                    
                        55% {
                            opacity: 1;
                        }
                    
                        100% {
                            opacity: 0.4;
                            transform:
                                translate(-50%, -50%)
                                scale(1.4);
                        }
                    }
                    
                    
                    @keyframes tieSlash {
                        0% {
                            opacity: 0;
                            transform:
                                translate(-50%, -50%)
                                scaleX(0);
                        }
                    
                        50% {
                            opacity: 1;
                        }
                    
                        100% {
                            opacity: 0;
                            transform:
                                translate(-50%, -50%)
                                scaleX(1.2);
                        }
                    }
                `}
            </style>
        </main>
    );
}