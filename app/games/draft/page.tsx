"use client";

import { useEffect, useState, useRef } from "react";
import {draftCharacters, DraftCharacter, DraftPosition, AnyDraftPosition,} from "@/data/draftCharacters";
import {
    applySynergyBonuses,
    calculateDraftPower,
    draftPositions,
    getDraftPickGrade,
} from "@/data/draftLogic";
import {auth, getDraftHighScore, saveDraftHighScore, type DraftHighScore,} from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import type { DraftPick, DraftResult } from "@/types/draft";
import PositionBreakdownTooltip from "@/app/components/PositionBreakdownToolTip";


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

function getGradeGlow(
    grade: string
) {
    switch (grade) {
        case "U":
            return "border-amber-200 ring-2 ring-yellow-300/50 shadow-[0_0_25px_rgba(255,215,0,0.9),0_0_65px_rgba(245,158,11,0.65)]";
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

function getPositionIcon(position: AnyDraftPosition) {
    if (position in positionIcons) {
        return positionIcons[position as DraftPosition];
    }

    return "⚡";
}

function getRandomCharacter(usedIds: string[]) {
    const available = draftCharacters.filter(
        (character) => !usedIds.includes(character.id)
    );

    return available[Math.floor(Math.random() * available.length)];
}

function LegendaryPickReveal({
                                 pick,
                             }: {
    pick: DraftPick;
}) {
    const isUltra =
        pick.grade === "U";

    const isSPlus =
        pick.grade === "S+";

    const isS =
        pick.grade === "S";


    const revealLabel =
        isUltra
            ? "ULTRA"
            : isSPlus
                ? "LIMIT BREAK"
                : "ELITE PICK";


    const cardBorder =
        isUltra
            ? "border-white/80"
            : isSPlus
                ? "border-yellow-300"
                : "border-purple-400";


    const cardShadow =
        isUltra
            ? `
                shadow-[
                    0_0_18px_rgba(255,255,255,0.8),
                    0_0_45px_rgba(34,211,238,0.4),
                    0_0_70px_rgba(217,70,239,0.4),
                    0_0_95px_rgba(250,204,21,0.32)
                ]
            `
            : isSPlus
                ? `
                    shadow-[
                        0_0_28px_rgba(250,204,21,0.65),
                        0_0_70px_rgba(245,158,11,0.38)
                    ]
                `
                : `
                    shadow-[
                        0_0_30px_rgba(168,85,247,0.42)
                    ]
                `;


    const labelStyle =
        isUltra
            ? `
                bg-gradient-to-r
                from-cyan-200
                via-white
                to-fuchsia-200
                bg-clip-text
                text-transparent
                drop-shadow-[0_0_18px_rgba(255,255,255,0.65)]
            `
            : isSPlus
                ? `
                    text-yellow-200
                    drop-shadow-[0_0_14px_rgba(250,204,21,0.6)]
                `
                : `
                    text-purple-200
                `;


    const gradeStyle =
        isUltra
            ? `
                bg-[linear-gradient(
                    90deg,
                    #ffffff,
                    #67e8f9,
                    #f0abfc,
                    #fde68a,
                    #ffffff
                )]
                bg-[length:300%_100%]
                bg-clip-text
                text-transparent
                animate-[ultraChromeText_1600ms_linear_infinite]
                drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]
            `
            : isSPlus
                ? `
                    text-yellow-300
                    drop-shadow-[0_0_16px_rgba(250,204,21,0.75)]
                `
                : `
                    text-purple-300
                    drop-shadow-[0_0_12px_rgba(168,85,247,0.55)]
                `;


    return (
        <div
            className="
                pointer-events-none
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                overflow-hidden
            "
        >
            {/* ===================================== */}
            {/* BACKDROP */}
            {/* ===================================== */}

            <div
                className={`
                    absolute
                    inset-0
                    bg-black/90
                    backdrop-blur-md

                    ${
                    isUltra
                        ? "animate-[eliteBackdrop_2300ms_ease-out_forwards]"
                        : isSPlus
                            ? "animate-[eliteBackdrop_2050ms_ease-out_forwards]"
                            : "animate-[eliteBackdrop_1850ms_ease-out_forwards]"
                }
                `}
            />


            {/* ===================================== */}
            {/* MAIN AURA */}
            {/* ===================================== */}

            {isUltra ? (

                // =================================
                // U — CHROME / RAINBOW
                // =================================

                <>
                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[620px]
                            w-[620px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[ultraAura_2300ms_cubic-bezier(.16,1,.3,1)_forwards]
                            rounded-full
                            bg-[conic-gradient(
                                from_0deg,
                                rgba(103,232,249,0.3),
                                rgba(217,70,239,0.3),
                                rgba(250,204,21,0.3),
                                rgba(96,165,250,0.3),
                                rgba(255,255,255,0.35),
                                rgba(103,232,249,0.3)
                            )]
                            blur-[95px]
                        "
                    />


                    {/* WHITE-HOT IMPACT */}

                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[280px]
                            w-[280px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[ultraBurst_900ms_ease-out_forwards]
                            rounded-full
                            bg-white/35
                            blur-[65px]
                        "
                    />


                    {/* PRISM RING */}

                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[420px]
                            w-[420px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[ultraRing_1200ms_cubic-bezier(.16,1,.3,1)_forwards]
                            rounded-full
                            p-[3px]
                            opacity-0
                            bg-[conic-gradient(
                                from_0deg,
                                #ffffff,
                                #67e8f9,
                                #f0abfc,
                                #fde047,
                                #60a5fa,
                                #ffffff
                            )]
                        "
                    >
                        <div className="h-full w-full rounded-full bg-black" />
                    </div>


                    {/* CHROMATIC SLASHES */}

                    <div
                        className="
                            absolute
                            left-1/2
                            top-[46%]
                            h-[3px]
                            w-[85vw]
                            -translate-x-1/2
                            -rotate-[9deg]
                            animate-[ultraSlash_750ms_ease-out_forwards]
                            bg-gradient-to-r
                            from-transparent
                            via-cyan-200
                            to-transparent
                            shadow-[0_0_24px_rgba(103,232,249,0.9)]
                        "
                    />

                    <div
                        className="
                            absolute
                            left-1/2
                            top-[49%]
                            h-[2px]
                            w-[80vw]
                            -translate-x-1/2
                            rotate-[7deg]
                            animate-[ultraSlash_800ms_60ms_ease-out_forwards]
                            bg-gradient-to-r
                            from-transparent
                            via-fuchsia-200
                            to-transparent
                            shadow-[0_0_20px_rgba(240,171,252,0.8)]
                        "
                    />

                    <div
                        className="
                            absolute
                            left-1/2
                            top-[52%]
                            h-px
                            w-[75vw]
                            -translate-x-1/2
                            -rotate-[3deg]
                            animate-[ultraSlash_850ms_120ms_ease-out_forwards]
                            bg-gradient-to-r
                            from-transparent
                            via-yellow-100
                            to-transparent
                        "
                    />
                </>

            ) : isSPlus ? (

                // =================================
                // S+ — STRONGER GOLD CINEMATIC
                // =================================

                <>
                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[600px]
                            w-[600px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[eliteAura_2050ms_cubic-bezier(.16,1,.3,1)_forwards]
                            rounded-full
                            bg-yellow-300/22
                            blur-[105px]
                        "
                    />


                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[390px]
                            w-[390px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[sPlusRing_1100ms_ease-out_forwards]
                            rounded-full
                            border-2
                            border-yellow-200/70
                        "
                    />


                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[390px]
                            w-[390px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[sPlusRing_1200ms_100ms_ease-out_forwards]
                            rounded-full
                            border
                            border-white/60
                            opacity-0
                        "
                    />


                    <div
                        className="
                            absolute
                            left-1/2
                            top-[48%]
                            h-[3px]
                            w-[80vw]
                            -translate-x-1/2
                            -rotate-[8deg]
                            animate-[eliteSlash_650ms_ease-out_forwards]
                            bg-gradient-to-r
                            from-transparent
                            via-yellow-100
                            to-transparent
                            shadow-[0_0_24px_rgba(250,204,21,0.8)]
                        "
                    />

                    <div
                        className="
                            absolute
                            left-1/2
                            top-[52%]
                            h-px
                            w-[65vw]
                            -translate-x-1/2
                            rotate-[6deg]
                            animate-[eliteSlashSecondary_750ms_80ms_ease-out_forwards]
                            bg-gradient-to-r
                            from-transparent
                            via-white/60
                            to-transparent
                        "
                    />
                </>

            ) : (

                // =================================
                // S — CLEANEST / LEAST FLASHY
                // =================================

                <>
                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[540px]
                            w-[540px]
                            -translate-x-1/2
                            -translate-y-1/2
                            animate-[eliteAura_1850ms_cubic-bezier(.16,1,.3,1)_forwards]
                            rounded-full
                            bg-fuchsia-400/14
                            blur-[110px]
                        "
                    />

                    <div
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            h-[2px]
                            w-[65vw]
                            -translate-x-1/2
                            -translate-y-1/2
                            -rotate-[7deg]
                            animate-[eliteSlash_650ms_ease-out_forwards]
                            bg-gradient-to-r
                            from-transparent
                            via-purple-200/75
                            to-transparent
                        "
                    />
                </>
            )}


            {/* ===================================== */}
            {/* CONTENT */}
            {/* ===================================== */}

            <div
                className="
                    relative
                    z-10
                    flex
                    flex-col
                    items-center
                "
            >

                {/* LABEL */}

                <p
                    className={`
                        mb-4
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.5em]

                        ${
                        isUltra
                            ? "animate-[eliteLabel_2300ms_cubic-bezier(.16,1,.3,1)_forwards]"
                            : isSPlus
                                ? "animate-[eliteLabel_2050ms_cubic-bezier(.16,1,.3,1)_forwards]"
                                : "animate-[eliteLabel_1850ms_cubic-bezier(.16,1,.3,1)_forwards]"
                    }

                        ${labelStyle}
                    `}
                >
                    {revealLabel}
                </p>


                {/* ===================================== */}
                {/* CARD OUTER CHROME FRAME */}
                {/* ===================================== */}

                <div
                    className={`
                        relative
                        rounded-[2.15rem]

                        ${
                        isUltra
                            ? `
                                    p-[3px]
                                    bg-[conic-gradient(
                                        from_0deg,
                                        #ffffff,
                                        #67e8f9,
                                        #f0abfc,
                                        #fde047,
                                        #60a5fa,
                                        #ffffff
                                    )]
                                    animate-[ultraBorderSpin_1800ms_linear_infinite]
                                `
                            : ""
                    }
                    `}
                >

                    {/* CARD */}

                    <div
                        className={`
                            relative
                            h-[460px]
                            w-[310px]
                            overflow-hidden
                            rounded-[2rem]
                            border-2
                            bg-black

                            ${
                            isUltra
                                ? "animate-[ultraCard_2300ms_cubic-bezier(.16,1,.3,1)_forwards]"
                                : isSPlus
                                    ? "animate-[sPlusCard_2050ms_cubic-bezier(.16,1,.3,1)_forwards]"
                                    : "animate-[eliteCard_1850ms_cubic-bezier(.16,1,.3,1)_forwards]"
                        }

                            ${cardBorder}
                            ${cardShadow}
                        `}
                    >
                        <img
                            src={
                                pick.character
                                    .imageUrl
                            }
                            alt={
                                pick.character.name
                            }
                            className="
                                absolute
                                inset-0
                                h-full
                                w-full
                                object-cover
                                object-[50%_20%]
                            "
                        />


                        <div
                            className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-black
                                via-black/15
                                to-black/5
                            "
                        />


                        {/* ULTRA PRISM OVERLAY */}

                        {isUltra && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    animate-[ultraPrism_1700ms_linear_infinite]
                                    bg-[linear-gradient(
                                        115deg,
                                        transparent_10%,
                                        rgba(103,232,249,0.14)_28%,
                                        rgba(255,255,255,0.22)_40%,
                                        rgba(240,171,252,0.15)_52%,
                                        rgba(250,204,21,0.12)_65%,
                                        transparent_82%
                                    )]
                                    bg-[length:250%_100%]
                                    mix-blend-screen
                                "
                            />
                        )}


                        {/* SHINE */}

                        <div
                            className={`
                                absolute
                                inset-y-0
                                -left-1/2
                                skew-x-[-18deg]
                                bg-gradient-to-r
                                from-transparent
                                via-white/65
                                to-transparent

                                ${
                                isUltra
                                    ? `
                                            w-1/2
                                            animate-[eliteShine_850ms_280ms_ease-out_forwards]
                                        `
                                    : isSPlus
                                        ? `
                                                w-[40%]
                                                animate-[eliteShine_750ms_320ms_ease-out_forwards]
                                            `
                                        : `
                                                w-1/3
                                                animate-[eliteShine_650ms_350ms_ease-out_forwards]
                                            `
                            }
                            `}
                        />


                        {/* LARGE BACKGROUND GRADE */}

                        <div
                            className={`
                                absolute
                                right-2
                                top-1/2
                                -translate-y-1/2
                                text-[9rem]
                                font-black
                                italic
                                leading-none
                                opacity-10

                                ${
                                isUltra
                                    ? "animate-[ultraGrade_2300ms_cubic-bezier(.16,1,.3,1)_forwards]"
                                    : isSPlus
                                        ? "animate-[eliteGrade_2050ms_cubic-bezier(.16,1,.3,1)_forwards]"
                                        : "animate-[eliteGrade_1850ms_cubic-bezier(.16,1,.3,1)_forwards]"
                            }

                                ${gradeStyle}
                            `}
                        >
                            {pick.grade}
                        </div>


                        {/* INFO */}

                        <div
                            className="
                                absolute
                                bottom-0
                                left-0
                                right-0
                                p-6
                            "
                        >
                            <p
                                className={`
                                    text-xs
                                    font-black
                                    uppercase
                                    tracking-[0.3em]

                                    ${labelStyle}
                                `}
                            >
                                {getPositionIcon(
                                    pick.position as AnyDraftPosition
                                )}{" "}
                                {pick.position}
                            </p>


                            <h2
                                className="
                                    mt-2
                                    text-3xl
                                    font-black
                                    text-white
                                    drop-shadow-lg
                                "
                            >
                                {
                                    pick.character
                                        .name
                                }
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-white/65
                                "
                            >
                                {
                                    pick.character
                                        .anime
                                }
                            </p>


                            <p
                                className={`
                                    mt-4
                                    text-6xl
                                    font-black
                                    italic
                                    leading-none

                                    ${gradeStyle}
                                `}
                            >
                                {pick.grade}
                            </p>

                        </div>
                    </div>
                </div>
            </div>


            <style>{`

                /* ================================= */
                /* SHARED */
                /* ================================= */

                @keyframes eliteBackdrop {
                    0% {
                        opacity: 0;
                    }

                    10% {
                        opacity: 1;
                    }

                    84% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                    }
                }


                @keyframes eliteAura {
                    0% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(0.35);
                    }

                    22% {
                        opacity: 1;
                        transform:
                            translate(-50%, -50%)
                            scale(1);
                    }

                    76% {
                        opacity: 0.5;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(1.18);
                    }
                }


                @keyframes eliteCard {
                    0% {
                        opacity: 0;
                        transform:
                            translateY(38px)
                            scale(0.84);
                        filter: blur(6px);
                    }

                    22% {
                        opacity: 1;
                        transform:
                            translateY(-3px)
                            scale(1.02);
                        filter: blur(0);
                    }

                    32% {
                        transform:
                            translateY(0)
                            scale(1);
                    }

                    82% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translateY(-10px)
                            scale(1.01);
                    }
                }


                @keyframes eliteLabel {
                    0%,
                    8% {
                        opacity: 0;
                        transform:
                            translateY(12px);
                        letter-spacing: 0.8em;
                    }

                    24% {
                        opacity: 1;
                        transform:
                            translateY(0);
                        letter-spacing: 0.5em;
                    }

                    84% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                    }
                }


                @keyframes eliteGrade {
                    0%,
                    14% {
                        opacity: 0;
                        transform:
                            translateY(-50%)
                            translateX(30px)
                            scale(1.25);
                    }

                    30% {
                        opacity: 0.12;
                        transform:
                            translateY(-50%)
                            translateX(0)
                            scale(1);
                    }

                    84% {
                        opacity: 0.1;
                    }

                    100% {
                        opacity: 0;
                    }
                }


                @keyframes eliteShine {
                    0% {
                        left: -60%;
                        opacity: 0;
                    }

                    20% {
                        opacity: 1;
                    }

                    100% {
                        left: 140%;
                        opacity: 0;
                    }
                }


                @keyframes eliteSlash {
                    0% {
                        opacity: 0;
                        transform:
                            translateX(-50%)
                            scaleX(0);
                    }

                    28% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translateX(-50%)
                            scaleX(1.15);
                    }
                }


                @keyframes eliteSlashSecondary {
                    0% {
                        opacity: 0;
                        transform:
                            translateX(-50%)
                            scaleX(0);
                    }

                    35% {
                        opacity: 0.7;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translateX(-50%)
                            scaleX(1);
                    }
                }


                /* ================================= */
                /* S+ */
                /* ================================= */

                @keyframes sPlusCard {
                    0% {
                        opacity: 0;
                        transform:
                            translateY(55px)
                            scale(0.72);
                        filter:
                            blur(9px)
                            brightness(2);
                    }

                    18% {
                        opacity: 1;
                        transform:
                            translateY(-8px)
                            scale(1.07);
                        filter:
                            blur(0)
                            brightness(1.5);
                    }

                    30% {
                        transform:
                            translateY(0)
                            scale(1);
                        filter:
                            brightness(1);
                    }

                    82% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translateY(-12px)
                            scale(1.025);
                    }
                }


                @keyframes sPlusRing {
                    0% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(0.35);
                    }

                    20% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(1.8);
                    }
                }


                /* ================================= */
                /* ULTRA */
                /* ================================= */

                @keyframes ultraCard {
                    0% {
                        opacity: 0;
                        transform:
                            perspective(1200px)
                            translateY(65px)
                            scale(0.62)
                            rotateX(8deg);
                        filter:
                            blur(12px)
                            brightness(3);
                    }

                    17% {
                        opacity: 1;
                        transform:
                            perspective(1200px)
                            translateY(-10px)
                            scale(1.09)
                            rotateX(-1deg);
                        filter:
                            blur(0)
                            brightness(1.7);
                    }

                    29% {
                        transform:
                            perspective(1200px)
                            translateY(0)
                            scale(1)
                            rotateX(0);
                        filter:
                            brightness(1);
                    }

                    84% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            perspective(1200px)
                            translateY(-14px)
                            scale(1.03);
                    }
                }


                @keyframes ultraAura {
                    0% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(0.2)
                            rotate(0deg);
                    }

                    20% {
                        opacity: 1;
                    }

                    80% {
                        opacity: 0.55;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(1.25)
                            rotate(90deg);
                    }
                }


                @keyframes ultraBurst {
                    0% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(0.1);
                    }

                    20% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(2.6);
                    }
                }


                @keyframes ultraRing {
                    0% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(0.25)
                            rotate(0deg);
                    }

                    20% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translate(-50%, -50%)
                            scale(1.8)
                            rotate(120deg);
                    }
                }


                @keyframes ultraSlash {
                    0% {
                        opacity: 0;
                        transform:
                            translateX(-50%)
                            scaleX(0);
                    }

                    24% {
                        opacity: 1;
                    }

                    100% {
                        opacity: 0;
                        transform:
                            translateX(-50%)
                            scaleX(1.15);
                    }
                }


                @keyframes ultraPrism {
                    from {
                        background-position:
                            150% center;
                    }

                    to {
                        background-position:
                            -100% center;
                    }
                }


                @keyframes ultraBorderSpin {
                    from {
                        filter:
                            hue-rotate(0deg);
                    }

                    to {
                        filter:
                            hue-rotate(360deg);
                    }
                }


                @keyframes ultraChromeText {
                    from {
                        background-position:
                            150% center;
                    }

                    to {
                        background-position:
                            -150% center;
                    }
                }


                @keyframes ultraGrade {
                    0%,
                    10% {
                        opacity: 0;
                        transform:
                            translateY(-50%)
                            translateX(45px)
                            scale(1.55);
                    }

                    26% {
                        opacity: 0.17;
                        transform:
                            translateY(-50%)
                            translateX(0)
                            scale(1);
                    }

                    84% {
                        opacity: 0.12;
                    }

                    100% {
                        opacity: 0;
                    }
                }

            `}</style>
        </div>
    );
}

export default function DraftPage() {
    const [usedCharacterIds, setUsedCharacterIds] = useState<string[]>([]);
    const [currentCharacter, setCurrentCharacter] = useState<DraftCharacter | null>(null);
    const [hoveredPosition, setHoveredPosition] = useState<AnyDraftPosition | null>(null);
    const [picks, setPicks] = useState<DraftPick[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [highScore, setHighScore] = useState<DraftHighScore | null>(null);
    const [rerollUsed, setRerollUsed] = useState(false);
    const [isNewHighScore, setIsNewHighScore] = useState(false);
    const [isDraggingCard, setIsDraggingCard] = useState(false);
    const [pendingPick, setPendingPick] = useState<{
        character: DraftCharacter;
        position: AnyDraftPosition;
    } | null>(null);
    const [legendaryReveal, setLegendaryReveal] = useState<DraftPick | null>(null);
    const [isLeavingDraft, setIsLeavingDraft] = useState(false);
    const [showDraftInfo, setShowDraftInfo] = useState(false);
    const [hoveredInfoPosition, setHoveredInfoPosition,] = useState<AnyDraftPosition | null>(null);
    const availablePositions = draftPositions;

    const totalRounds = availablePositions.length;

    const currentRound = Math.min(
        picks.length + 1,
        totalRounds
    );

    const router = useRouter();

    const droppedInSlotRef = useRef(false);
    const dragSkeletonTimeoutRef = useRef<number | null>(null);

    const filledPositions = picks.map((pick) => pick.position);
    const draftComplete =
        picks.length === availablePositions.length;

    const gridPositions = draftPositions;

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

    if (!currentCharacter) {
        return null;
    }

    function handleDragStart(
        event: React.DragEvent<HTMLDivElement>
    ) {
        if (
            pendingPick ||
            !currentCharacter
        ) {
            return;
        }

        event.dataTransfer.setData(
            "text/plain",
            currentCharacter.id
        );

        event.dataTransfer.effectAllowed =
            "move";

        /*
         * Hide any info tooltip as soon
         * as dragging begins.
         */
        setHoveredInfoPosition(null);

        setIsDraggingCard(true);
    }

    function handleDragEnd() {
        setIsDraggingCard(false);

        /*
         * Drag/drop highlight.
         */
        setHoveredPosition(null);

        /*
         * Information tooltip.
         */
        setHoveredInfoPosition(null);
    }

    function handleDrop(
        event: React.DragEvent<HTMLDivElement>,
        position: AnyDraftPosition
    ) {
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
        setHoveredInfoPosition(null);
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
        setHoveredInfoPosition(null);
        setIsDraggingCard(false);
    }

    async function finishDraft(finalPicks: DraftPick[]) {
        const completedTotalPower = finalPicks.reduce(
            (total, pick) => total + pick.power,
            0
        );

        const completedAveragePower = Math.round(
            completedTotalPower / finalPicks.length
        );

        const completedGrade = getDraftGrade(
            completedAveragePower
        );

        const isNewRecord =
            !highScore ||
            completedTotalPower > highScore.totalPower;

        if (isNewRecord && user) {
            const newHighScore: Omit<
                DraftHighScore,
                "userId" | "updatedAt"
            > = {
                totalPower: completedTotalPower,
                averagePower: completedAveragePower,
                grade: completedGrade,

                lineup: finalPicks.map((pick) => ({
                    position:
                        pick.position as DraftPosition,

                    power:
                    pick.power,

                    grade:
                    pick.grade,

                    character: {
                        id:
                        pick.character.id,

                        name:
                        pick.character.name,

                        anime:
                        pick.character.anime,

                        imageUrl:
                            pick.character.imageUrl ?? "",
                    },
                })),
            };

            await saveDraftHighScore(
                user.uid,
                newHighScore
            );

            setIsNewHighScore(true);

            setHighScore({
                userId: user.uid,
                ...newHighScore,
            });
        }

        const result: DraftResult = {
            picks: finalPicks,

            totalPower: completedTotalPower,
            averagePower: completedAveragePower,
            grade: completedGrade,

            isNewHighScore: isNewRecord,
        };

        sessionStorage.setItem(
            "anime-draft-result",
            JSON.stringify(result)
        );

        setIsLeavingDraft(true);

        window.setTimeout(() => {
            router.push("/games/draft/results");
        }, 800);
    }

    function confirmPick() {
        if (!pendingPick) return;

        const basePower =
            calculateDraftPower(
                pendingPick.character,
                pendingPick.position
            );

        const newPick: DraftPick = {
            character:
            pendingPick.character,

            position:
            pendingPick.position,

            basePower,

            power:
            basePower,

            grade:
                getDraftPickGrade(
                    pendingPick.character,
                    pendingPick.position,
                    basePower
                ),
        };

        const updatedPicks = applySynergyBonuses([...picks, newPick]);

        const revealedPick = updatedPicks.find(
            (pick) => pick.position === pendingPick.position
        );

        const newUsedIds = [
            ...usedCharacterIds,
            pendingPick.character.id,
        ];

        setPicks(updatedPicks);
        setUsedCharacterIds(newUsedIds);
        setPendingPick(null);
        setHoveredPosition(null);

        if (
            revealedPick &&
            (
                revealedPick.grade === "S" ||
                revealedPick.grade === "S+" ||
                revealedPick.grade === "U"
            )
        ) {
            setLegendaryReveal(
                revealedPick
            );

            const legendaryRevealDuration =
                revealedPick.grade === "U"
                    ? 2300
                    : revealedPick.grade === "S+"
                        ? 2050
                        : 1850;

            window.setTimeout(() => {
                setLegendaryReveal(
                    null
                );
            }, legendaryRevealDuration);
        }

        const completedDraft =
            updatedPicks.length === availablePositions.length;

        if (completedDraft) {
            void finishDraft(updatedPicks);
            return;
        }

        setCurrentCharacter(getRandomCharacter(newUsedIds));
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
        setHoveredInfoPosition(null);
    }

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-[1700px] px-4 py-6">
            {showDraftInfo && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
                    onClick={() => setShowDraftInfo(false)}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-pink-500/20 bg-black/90 p-5 shadow-[0_0_30px_rgba(236,72,153,0.15)] backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                    Blind Draft
                                </p>

                                <h2 className="mt-1 text-xl font-black text-white">
                                    How to Play
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowDraftInfo(false)}
                                className="text-pink-300/70 transition hover:text-pink-200 hover:cursor-pointer"
                                aria-label="Close rules"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-left text-[13px] leading-5 text-purple-100/70">
                            <p>
                                Build the strongest anime team possible by assigning random
                                characters to the positions where they fit best.
                            </p>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Drafting
                                </h3>

                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>
                                        You receive 1 random anime character each round.
                                    </li>
                                    <li>
                                        Drag the character into any open position.
                                    </li>
                                    <li>
                                        Once you confirm a placement, that character and
                                        position are permanently locked.
                                    </li>
                                    <li>
                                        The draft ends once all 8 positions are filled.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Character Attributes
                                </h3>

                                <p className="mt-2">
                                    Every character is rated using 6 attributes:
                                </p>

                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {[
                                        "Leadership",
                                        "Power",
                                        "Utility",
                                        "Speed",
                                        "IQ",
                                        "Defense",
                                    ].map((stat) => (
                                        <span
                                            key={stat}
                                            className="rounded-md border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-200"
                                        >
                                {stat}
                            </span>
                                    ))}
                                </div>

                                <p className="mt-3">
                                    Each position values those attributes differently, so
                                    the same character can perform very differently
                                    depending on where you place them.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Position Rating
                                </h3>

                                <div className="mt-2 space-y-2">
                                    <p>
                                        After confirming a character, they receive a rating
                                        based on how well their attributes fit that
                                        position.
                                    </p>

                                    <p>
                            <span className="rounded-md border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 font-semibold text-yellow-200">
                                S / S+
                            </span>{" "}
                                        represents an elite fit.
                                    </p>

                                    <p>
                            <span className="rounded-md border border-purple-400/20 bg-purple-500/10 px-2 py-1 font-semibold text-purple-200">
                                A / B
                            </span>{" "}
                                        represents a strong or solid fit.
                                    </p>

                                    <p>
                            <span className="rounded-md border border-pink-500/20 bg-white/[0.03] px-2 py-1 font-semibold text-purple-100/70">
                                C / D / F
                            </span>{" "}
                                        represents a weaker fit for that position.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Series Synergy
                                </h3>

                                <p className="mt-2">
                                    Drafting multiple characters from the same anime creates
                                    a Series Link and gives those characters a small rating
                                    boost.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Fate Rewrite
                                </h3>

                                <p className="mt-2">
                                    You can reroll your current character once per draft.
                                    Once used, your reroll is gone for the rest of the game.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">
                                    Goal
                                </h3>

                                <p className="mt-2">
                                    Fill all 8 positions and finish with the highest total
                                    team rating possible.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {legendaryReveal && (
                <LegendaryPickReveal pick={legendaryReveal} />
            )}

            {isLeavingDraft && (
                <div className="pointer-events-none fixed inset-0 z-[90] bg-black/10 backdrop-blur-[1px]">
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/70 px-5 py-3 text-xs font-black uppercase tracking-[0.3em] text-white/70 shadow-xl backdrop-blur-xl">
                        Preparing Draft Report
                    </div>
                </div>
            )}
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
                    p-6
                    backdrop-blur-xl
                    shadow-[0_0_25px_rgba(236,72,153,0.08)]
                "
            >
                <h1 className="mt-3 text-5xl font-black text-white">
                    Blind Anime Character Draft
                </h1>

                <div className="mt-3 flex items-center gap-2">
                    <p className="text-purple-100/70">
                        Drag the character into a position. Once confirmed, that slot is locked.
                    </p>

                    <button
                        type="button"
                        onClick={() => setShowDraftInfo(true)}
                        aria-label="How to play Anime Draft"
                        className="
                        flex h-6 w-6 shrink-0 items-center justify-center
                        rounded-full
                        border border-pink-400/40
                        bg-pink-500/10
                        text-xs font-black text-pink-200
                        transition-all duration-200
                        hover:scale-110
                        hover:border-pink-300
                        hover:bg-pink-500/20
                        hover:text-white
                        hover:shadow-[0_0_14px_rgba(236,72,153,0.4)]
                        hover:cursor-pointer
                    "
                    >
                        ?
                    </button>
                </div>

                <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-300/60 mt-3">
                    Round {currentRound} / {totalRounds}
                </p>

                {(!draftComplete || isLeavingDraft) && (
                    <div
                        className={`mt-6 grid gap-6 xl:grid-cols-[300px_1fr] ${
                            isLeavingDraft
                                ? "pointer-events-none"
                                : ""
                        }`}
                    >
                        <div
                            className="
                                xl:flex
                                xl:flex-col
                                xl:justify-center
                                xl:py-8
                            "
                        >
                            <h2 className="mb-4 text-xl font-bold text-white">
                                Current Character
                            </h2>

                            <div
                                draggable={!pendingPick}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                className={`relative min-h-[390px] overflow-hidden rounded-3xl border border-pink-500/30 bg-black transition shadow-[0_0_30px_rgba(236,72,153,0.18)] ${
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
                        </div>

                        <div>
                            <h2 className="mb-4 text-xl font-bold text-white">
                                Team Positions
                            </h2>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {gridPositions.map((position) => {
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

                                                if (
                                                    !pick &&
                                                    !pendingPick
                                                ) {
                                                    setHoveredPosition(
                                                        position
                                                    );
                                                }
                                            }}
                                            onDragLeave={() => setHoveredPosition(null)}
                                            onDrop={(event) => handleDrop(event, position)}
                                            onMouseEnter={() => {
                                                if (
                                                    !isDraggingCard &&
                                                    !pendingPick
                                                ) {
                                                    setHoveredInfoPosition(
                                                        position
                                                    );
                                                }
                                            }}

                                            onMouseLeave={() => {
                                                setHoveredInfoPosition(
                                                    null
                                                );
                                            }}
                                            className={`
                                                relative
                                                min-h-[325px]
                                                rounded-3xl
                                                border-2
                                                border-dashed
                                                p-3
                                                transition
                                    
                                                ${
                                                pick
                                                    ? "border-pink-500/30 bg-black/40 backdrop-blur-xl"
                                                    : pendingForThisPosition
                                                        ? "border-yellow-400 bg-yellow-500/10 shadow-[0_0_25px_rgba(250,204,21,0.25)]"
                                                        : isHovered
                                                            ? "border-pink-400 bg-pink-500/10 shadow-[0_0_25px_rgba(236,72,153,0.25)]"
                                                            : "border-pink-500/20 bg-black/20"
                                                }
                                            `}
                                        >
                                            <PositionBreakdownTooltip
                                                position={position}
                                                visible={
                                                    !isDraggingCard &&
                                                    !pendingPick &&
                                                    hoveredInfoPosition ===
                                                    position
                                                }
                                            />

                                            <p className="text-sm font-bold uppercase tracking-widest text-pink-300/60">
                                                {getPositionIcon(position)} {position}
                                            </p>

                                            {!pick && !pendingForThisPosition && (
                                                <div className="mt-8 text-center text-sm font-semibold text-pink-300/60">
                                                    Drop character here
                                                </div>
                                            )}

                                            {!pick && pendingForThisPosition && (
                                                <div className="relative mt-3 min-h-[255px] overflow-hidden rounded-2xl border-2 border-yellow-300 bg-black shadow-md">
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
                                                    className={`relative mt-3 min-h-[255px] overflow-hidden rounded-2xl border-2 bg-black transition ${
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

                                                        <p
                                                            className={`
                                                                mt-3
                                                                text-3xl
                                                                font-black
                                                                italic
                                                        
                                                                ${
                                                                pick.grade === "U"
                                                                    ? `
                                                                        bg-gradient-to-b
                                                                        from-white
                                                                        via-yellow-200
                                                                        to-amber-500
                                                                        bg-clip-text
                                                                        text-transparent
                                                                        drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]
                                                                    `
                                                                    : `
                                                                        text-yellow-300
                                                                        drop-shadow
                                                                    `
                                                                }
                                                            `}
                                                        >
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
            </section>
        </main>
    );
}