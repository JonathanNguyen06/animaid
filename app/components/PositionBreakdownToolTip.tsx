"use client";

import {
    formulaPowerPositionBreakdowns,
    getPositionWeights,
} from "@/data/draftLogic";

import type {
    AnyDraftPosition,
    FormulaPowerPosition,
} from "@/data/draftCharacters";

type Props = {
    position: AnyDraftPosition;
    visible: boolean;
};

const statLabels = {
    leadership: "Leadership",
    power: "Power",
    utility: "Utility",
    speed: "Speed",
    iq: "IQ",
    defense: "Defense",
} as const;

export default function PositionBreakdownTooltip({
                                                     position,
                                                     visible,
                                                 }: Props) {
    if (!visible) {
        return null;
    }

    const weights =
        getPositionWeights(position);

    const formulaBreakdown =
        position in
        formulaPowerPositionBreakdowns
            ? formulaPowerPositionBreakdowns[
                position as FormulaPowerPosition
                ]
            : null;

    /*
     * Standard positions +
     * weighted Power Positions.
     */
    const weightedEntries =
        weights
            ? Object.entries(weights).sort(
                (
                    [, firstWeight],
                    [, secondWeight]
                ) =>
                    (secondWeight ?? 0) -
                    (firstWeight ?? 0)
            )
            : [];

    return (
        <div
            className="
                pointer-events-none
                absolute
                bottom-[calc(100%+12px)]
                left-1/2
                z-[80]
                w-[240px]
                -translate-x-1/2
                rounded-2xl
                border
                border-pink-400/25
                bg-zinc-950
                p-4
                text-left
                shadow-[0_0_30px_rgba(236,72,153,0.16)]
            "
        >
            {/* GLOW */}

            <div
                className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-0
                    h-16
                    w-32
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-pink-500/10
                    blur-2xl
                "
            />


            <div className="relative z-10">

                <p
                    className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.28em]
                        text-pink-300/50
                    "
                >
                    Position Breakdown
                </p>

                <p className="mt-1 text-base font-black text-white">
                    {position}
                </p>


                {/* ================================= */}
                {/* NORMAL WEIGHTED POSITION */}
                {/* ================================= */}

                {weights && (
                    <div className="mt-4 space-y-3">

                        {weightedEntries.map(
                            ([stat, weight]) => {
                                const percentage =
                                    Math.round(
                                        (weight ?? 0) *
                                        100
                                    );

                                return (
                                    <div key={stat}>

                                        <div className="flex items-center justify-between gap-3">

                                            <p className="text-[10px] font-bold text-white/55">
                                                {
                                                    statLabels[
                                                        stat as keyof typeof statLabels
                                                        ]
                                                }
                                            </p>

                                            <p className="text-[10px] font-black text-pink-200">
                                                {percentage}%
                                            </p>

                                        </div>


                                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">

                                            <div
                                                className="
                                                    h-full
                                                    rounded-full
                                                    bg-gradient-to-r
                                                    from-pink-500
                                                    to-purple-400
                                                "
                                                style={{
                                                    width:
                                                        `${percentage}%`,
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}


                {/* ================================= */}
                {/* FORMULA POWER POSITION */}
                {/* ================================= */}

                {formulaBreakdown && (
                    <>
                        <p className="mt-3 text-[10px] leading-4 text-white/40">
                            {
                                formulaBreakdown.description
                            }
                        </p>

                        <div className="mt-4 space-y-3">

                            {formulaBreakdown.rows.map(
                                (row) => (
                                    <div
                                        key={
                                            row.label
                                        }
                                    >
                                        <div className="flex items-center justify-between gap-3">

                                            <p className="text-[10px] font-bold text-white/55">
                                                {
                                                    row.label
                                                }
                                            </p>

                                            <p className="text-right text-[10px] font-black text-yellow-200">
                                                {row.percentage !==
                                                undefined
                                                    ? `${row.percentage}%`
                                                    : row.value}
                                            </p>

                                        </div>


                                        {row.percentage !==
                                            undefined && (
                                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">

                                                    <div
                                                        className="
                                                        h-full
                                                        rounded-full
                                                        bg-gradient-to-r
                                                        from-yellow-400
                                                        to-amber-500
                                                    "
                                                        style={{
                                                            width:
                                                                `${row.percentage}%`,
                                                        }}
                                                    />

                                                </div>
                                            )}

                                    </div>
                                )
                            )}

                        </div>


                        {formulaBreakdown.note && (
                            <div
                                className="
                                    mt-4
                                    rounded-xl
                                    border
                                    border-yellow-400/15
                                    bg-yellow-500/5
                                    px-3
                                    py-2
                                "
                            >
                                <p className="text-[9px] leading-4 text-yellow-100/45">
                                    {
                                        formulaBreakdown.note
                                    }
                                </p>
                            </div>
                        )}
                    </>
                )}

            </div>


            {/* ARROW */}

            <div
                className="
                    absolute
                    left-1/2
                    top-full
                    h-3
                    w-3
                    -translate-x-1/2
                    -translate-y-1/2
                    rotate-45
                    border-b
                    border-r
                    border-pink-400/25
                    bg-zinc-950
                "
            />
        </div>
    );
}