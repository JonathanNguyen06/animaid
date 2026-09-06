"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import Link from "next/link";

import type {
    User,
} from "firebase/auth";

import {
    draftCharacters,
    type AnyDraftPosition,
    type DraftCharacter,
    type DraftPosition,
} from "@/data/draftCharacters";

import {
    applySynergyBonuses,
    calculateDraftPower,
    draftPositions,
    getDraftPickGrade,
} from "@/data/draftLogic";

import type {
    DraftPick,
} from "@/types/draft";

import {
    getDailyDraftCharacters,
    getDailyDraftDate,
    findOptimalDailyLineup,
    getDailyDraftEfficiency,
} from "@/lib/dailyDraft";

import {
    getDailyDraftProgress,
    observeAuth,
    saveDailyDraftProgress,
    updateDailyStreak,
} from "@/lib/firebase";

import Loading from "@/app/components/Loading";

import PositionBreakdownTooltip from "@/app/components/PositionBreakdownToolTip";


const positionIcons:
    Record<DraftPosition, string> = {
    Captain: "👑",
    "Vice Captain": "⚔️",
    Support: "💚",
    Scout: "👁️",
    Strategist: "🧠",
    Assassin: "🗡️",
    Ace: "🔥",
    Vanguard: "🛡️",
};


function getPositionIcon(
    position: DraftPosition
) {
    return positionIcons[position];
}


function getGradeGlow(
    grade: string
) {
    switch (grade) {
        case "U":
            return `
                border-amber-200
                ring-2
                ring-yellow-300/50
                shadow-[0_0_25px_rgba(255,215,0,0.9),0_0_65px_rgba(245,158,11,0.65)]
            `;

        case "S+":
            return `
                border-yellow-300
                shadow-[0_0_30px_rgba(250,204,21,0.75)]
            `;

        case "S":
            return `
                border-purple-400
                shadow-[0_0_28px_rgba(168,85,247,0.65)]
            `;

        case "A+":
            return `
                border-blue-400
                shadow-[0_0_24px_rgba(96,165,250,0.6)]
            `;

        case "A":
            return `
                border-cyan-400
                shadow-[0_0_20px_rgba(34,211,238,0.5)]
            `;

        case "B+":
            return `
                border-green-400
                shadow-[0_0_16px_rgba(74,222,128,0.45)]
            `;

        case "B":
            return `
                border-emerald-300
                shadow-[0_0_12px_rgba(110,231,183,0.35)]
            `;

        case "C":
            return `
                border-orange-300
                shadow-[0_0_10px_rgba(253,186,116,0.3)]
            `;

        case "D":
            return `
                border-red-300
                shadow-[0_0_8px_rgba(252,165,165,0.25)]
            `;

        default:
            return "border-white/15";
    }
}


function getEfficiencyMessage(
    efficiency: number
) {
    if (efficiency === 100) {
        return "Perfect Draft";
    }

    if (efficiency >= 98) {
        return "Nearly Perfect";
    }

    if (efficiency >= 95) {
        return "Elite Draft";
    }

    if (efficiency >= 90) {
        return "Strong Draft";
    }

    if (efficiency >= 80) {
        return "Solid Draft";
    }

    return "Room to Improve";
}


export default function DailyPage() {
    const [user, setUser] =
        useState<User | null>(null);

    const [authLoading, setAuthLoading] =
        useState(true);

    const [
        progressLoading,
        setProgressLoading,
    ] = useState(true);

    const [picks, setPicks] =
        useState<DraftPick[]>([]);

    const [
        pendingPick,
        setPendingPick,
    ] = useState<{
        character: DraftCharacter;
        position: DraftPosition;
    } | null>(null);

    const [
        hoveredPosition,
        setHoveredPosition,
    ] = useState<DraftPosition | null>(
        null
    );

    const [
        hoveredInfoPosition,
        setHoveredInfoPosition,
    ] = useState<
        AnyDraftPosition | null
    >(null);

    const [
        isDraggingCard,
        setIsDraggingCard,
    ] = useState(false);

    const [
        completed,
        setCompleted,
    ] = useState(false);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        saveError,
        setSaveError,
    ] = useState<string | null>(null);

    const [
        showRules,
        setShowRules,
    ] = useState(false);

    const [
        showOptimalLineup,
        setShowOptimalLineup,
    ] = useState(false);


    /*
     * Freeze the Daily date for this
     * page session.
     */

    const [today] =
        useState(
            () =>
                getDailyDraftDate()
        );


    /*
     * Same characters for every player
     * on this date.
     */

    const dailyCharacters =
        useMemo(
            () =>
                getDailyDraftCharacters(
                    today
                ),
            [today]
        );


    /*
     * Exact mathematical best lineup.
     *
     * 8! = 40,320 possibilities.
     */

    const optimalSolution =
        useMemo(
            () =>
                findOptimalDailyLineup(
                    dailyCharacters
                ),
            [dailyCharacters]
        );


    /*
     * Current character is based only
     * on how many characters have
     * already been locked.
     */

    const currentCharacter =
        completed
            ? null
            : dailyCharacters[
            picks.length
            ] ?? null;


    const totalPower =
        useMemo(
            () =>
                picks.reduce(
                    (
                        total,
                        pick
                    ) =>
                        total +
                        pick.power,
                    0
                ),
            [picks]
        );


    const efficiency =
        completed
            ? getDailyDraftEfficiency(
                totalPower,
                optimalSolution.totalPower
            )
            : 0;


    const matchedOptimalPositions =
        completed
            ? draftPositions.filter(
                (position) => {
                    const myPick =
                        picks.find(
                            (pick) =>
                                pick.position ===
                                position
                        );

                    const optimalPick =
                        optimalSolution.picks.find(
                            (pick) =>
                                pick.position ===
                                position
                        );

                    return (
                        myPick?.character.id ===
                        optimalPick?.character.id
                    );
                }
            ).length
            : 0;


    /*
     * =========================================
     * AUTH
     * =========================================
     */

    useEffect(() => {
        const unsubscribe =
            observeAuth(
                (
                    firebaseUser
                ) => {
                    setUser(
                        firebaseUser
                    );

                    setAuthLoading(
                        false
                    );
                }
            );

        return () =>
            unsubscribe();
    }, []);


    /*
     * =========================================
     * RESTORE TODAY'S PROGRESS
     * =========================================
     */

    useEffect(() => {
        if (authLoading) {
            return;
        }


        /*
         * Guests can still play,
         * but cannot restore/save.
         */

        if (!user) {
            setProgressLoading(
                false
            );

            return;
        }


        let cancelled = false;


        async function loadProgress() {
            try {
                setProgressLoading(
                    true
                );

                const progress =
                    await getDailyDraftProgress(
                        user!.uid,
                        today
                    );


                if (
                    cancelled ||
                    !progress
                ) {
                    return;
                }


                const restoredPicks:
                    DraftPick[] = [];


                for (
                    const savedPick
                    of progress.picks ?? []
                    ) {
                    const character =
                        draftCharacters.find(
                            (
                                character
                            ) =>
                                character.id ===
                                savedPick.characterId
                        );


                    const position =
                        savedPick.position as
                            DraftPosition;


                    if (
                        !character ||
                        !draftPositions.includes(
                            position
                        )
                    ) {
                        continue;
                    }


                    const basePower =
                        calculateDraftPower(
                            character,
                            position
                        );


                    restoredPicks.push({
                        character,
                        position,

                        basePower,

                        power:
                        basePower,

                        grade:
                            getDraftPickGrade(
                                character,
                                position,
                                basePower
                            ),
                    });
                }


                /*
                 * Recalculate Series Links using
                 * the current shared Draft logic.
                 */

                const restoredWithSynergy =
                    applySynergyBonuses(
                        restoredPicks
                    );


                setPicks(
                    restoredWithSynergy
                );


                if (
                    progress.completed &&
                    restoredWithSynergy.length ===
                    draftPositions.length
                ) {
                    setCompleted(
                        true
                    );
                }
            } catch (
                error
                ) {
                console.error(
                    "Failed to load Daily Draft:",
                    error
                );

                setSaveError(
                    "Could not restore your Daily Draft progress."
                );
            } finally {
                if (!cancelled) {
                    setProgressLoading(
                        false
                    );
                }
            }
        }


        void loadProgress();


        return () => {
            cancelled = true;
        };
    }, [
        authLoading,
        user,
        today,
    ]);


    /*
     * =========================================
     * DRAG START
     * =========================================
     */

    function handleDragStart(
        event:
        React.DragEvent<HTMLDivElement>
    ) {
        if (
            !currentCharacter ||
            pendingPick ||
            completed
        ) {
            return;
        }


        event.dataTransfer.setData(
            "text/plain",
            currentCharacter.id
        );

        event.dataTransfer.effectAllowed =
            "move";


        setHoveredInfoPosition(
            null
        );

        setIsDraggingCard(
            true
        );
    }


    /*
     * =========================================
     * DRAG END
     * =========================================
     */

    function handleDragEnd() {
        setIsDraggingCard(
            false
        );

        setHoveredPosition(
            null
        );

        setHoveredInfoPosition(
            null
        );
    }


    /*
     * =========================================
     * DROP INTO POSITION
     * =========================================
     */

    function handleDrop(
        event:
        React.DragEvent<HTMLDivElement>,

        position:
        DraftPosition
    ) {
        event.preventDefault();
        event.stopPropagation();


        if (
            completed ||
            !currentCharacter ||
            pendingPick
        ) {
            return;
        }


        const alreadyFilled =
            picks.some(
                (pick) =>
                    pick.position ===
                    position
            );


        if (alreadyFilled) {
            return;
        }


        setPendingPick({
            character:
            currentCharacter,

            position,
        });


        setHoveredPosition(
            null
        );

        setHoveredInfoPosition(
            null
        );

        setIsDraggingCard(
            false
        );
    }


    /*
     * =========================================
     * CANCEL PLACEMENT
     * =========================================
     */

    function cancelPendingPick() {
        setPendingPick(
            null
        );

        setHoveredPosition(
            null
        );

        setHoveredInfoPosition(
            null
        );

        setIsDraggingCard(
            false
        );
    }


    /*
     * =========================================
     * CONFIRM PLACEMENT
     * =========================================
     */

    async function confirmPick() {
        if (
            !pendingPick ||
            saving ||
            completed
        ) {
            return;
        }


        setSaving(
            true
        );

        setSaveError(
            null
        );


        const basePower =
            calculateDraftPower(
                pendingPick.character,
                pendingPick.position
            );


        const newPick:
            DraftPick = {
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


        /*
         * Re-run synergy across the
         * entire lineup every time.
         */

        const updatedPicks =
            applySynergyBonuses([
                ...picks,
                newPick,
            ]);


        const updatedTotalPower =
            updatedPicks.reduce(
                (
                    total,
                    pick
                ) =>
                    total +
                    pick.power,
                0
            );


        const didComplete =
            updatedPicks.length ===
            draftPositions.length;


        const updatedEfficiency =
            didComplete
                ? getDailyDraftEfficiency(
                    updatedTotalPower,
                    optimalSolution.totalPower
                )
                : undefined;


        /*
         * Update UI immediately.
         */

        setPicks(
            updatedPicks
        );

        setPendingPick(
            null
        );

        setHoveredPosition(
            null
        );

        setHoveredInfoPosition(
            null
        );

        setIsDraggingCard(
            false
        );


        if (didComplete) {
            setCompleted(
                true
            );
        }


        /*
         * Save if signed in.
         */

        if (user) {
            try {
                await saveDailyDraftProgress(
                    user.uid,
                    today,
                    {
                        completed:
                        didComplete,

                        picks:
                            updatedPicks.map(
                                (
                                    pick
                                ) => ({
                                    characterId:
                                    pick.character.id,

                                    position:
                                    pick.position,

                                    power:
                                    pick.power,

                                    grade:
                                    pick.grade,
                                })
                            ),

                        totalPower:
                        updatedTotalPower,

                        ...(didComplete
                            ? {
                                optimalPower:
                                optimalSolution.totalPower,

                                efficiency:
                                updatedEfficiency,
                            }
                            : {}),
                    }
                );


                /*
                 * Completing the Daily
                 * extends the streak.
                 */

                if (
                    didComplete
                ) {
                    await updateDailyStreak(
                        user.uid,
                        today
                    );
                }
            } catch (
                error
                ) {
                console.error(
                    "Failed to save Daily Draft:",
                    error
                );

                setSaveError(
                    "Your draft was completed, but we could not save your progress."
                );
            }
        }


        setSaving(
            false
        );
    }


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (
        authLoading ||
        progressLoading
    ) {
        return <Loading />;
    }


    /*
     * =========================================
     * RESULT SCREEN
     * =========================================
     */

    if (completed) {
        return (
            <main
                className="
                relative
                mx-auto
                min-h-[calc(100vh-130px)]
                max-w-[1700px]
                px-4
                py-6
                text-white
            "
            >
                {/* ===================================== */}
                {/* BACKGROUND */}
                {/* ===================================== */}

                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                    <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                    <div className="absolute bottom-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[140px]" />
                </div>


                {/* ===================================== */}
                {/* PLAYER RESULT */}
                {/* ===================================== */}

                <section
                    className="
                    relative
                    z-10
                    rounded-3xl
                    border
                    border-pink-500/20
                    bg-black/40
                    p-6
                    shadow-[0_0_30px_rgba(236,72,153,0.08)]
                    backdrop-blur-xl
                "
                >
                    {/* HEADER */}

                    <div className="text-center">

                        <p
                            className="
                            text-xs
                            font-black
                            uppercase
                            tracking-[0.3em]
                            text-pink-300/60
                        "
                        >
                            Daily Draft Complete
                        </p>

                        <h1
                            className="
                            mt-2
                            text-4xl
                            font-black
                            text-white
                            sm:text-5xl
                        "
                        >
                            Your Daily Lineup
                        </h1>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45">
                            Your placements are locked for today.
                            See how close you came to the strongest
                            possible lineup.
                        </p>

                    </div>


                    {/* ===================================== */}
                    {/* SCORE */}
                    {/* ===================================== */}

                    <div
                        className="
                        mx-auto
                        mt-7
                        grid
                        max-w-2xl
                        gap-3
                        sm:grid-cols-2
                    "
                    >
                        <div
                            className="
                            rounded-3xl
                            border
                            border-pink-500/20
                            bg-zinc-950
                            p-5
                            text-center
                        "
                        >
                            <p
                                className="
                                text-[10px]
                                font-black
                                uppercase
                                tracking-[0.25em]
                                text-pink-300/50
                            "
                            >
                                Team Power
                            </p>

                            <p
                                className="
                                mt-2
                                text-5xl
                                font-black
                                text-yellow-300
                            "
                            >
                                {totalPower}
                            </p>
                        </div>


                        <div
                            className="
                            rounded-3xl
                            border
                            border-purple-400/20
                            bg-zinc-950
                            p-5
                            text-center
                        "
                        >
                            <p
                                className="
                                text-[10px]
                                font-black
                                uppercase
                                tracking-[0.25em]
                                text-purple-300/50
                            "
                            >
                                Optimal Efficiency
                            </p>

                            <p
                                className="
                                mt-2
                                text-5xl
                                font-black
                                text-purple-200
                            "
                            >
                                {efficiency}%
                            </p>
                        </div>
                    </div>


                    {/* ===================================== */}
                    {/* PLAYER LINEUP */}
                    {/* ===================================== */}

                    <div className="mt-10">

                        <div className="mb-5 flex items-center justify-between gap-4">

                            <div>
                                <p
                                    className="
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-[0.25em]
                                    text-pink-300/50
                                "
                                >
                                    Final Team
                                </p>

                                <h2 className="mt-1 text-2xl font-black text-white">
                                    Your Lineup
                                </h2>
                            </div>


                            <div
                                className="
                                rounded-full
                                border
                                border-pink-400/20
                                bg-pink-500/5
                                px-3
                                py-1.5
                                text-[10px]
                                font-black
                                uppercase
                                tracking-[0.2em]
                                text-pink-300/50
                            "
                            >
                                {totalPower} Power
                            </div>
                        </div>


                        <div
                            className="
                            grid
                            gap-4
                            md:grid-cols-2
                            xl:grid-cols-4
                        "
                        >
                            {draftPositions.map(
                                (position) => {
                                    const pick =
                                        picks.find(
                                            (pick) =>
                                                pick.position ===
                                                position
                                        );

                                    if (!pick) {
                                        return null;
                                    }


                                    return (
                                        <div
                                            key={
                                                position
                                            }
                                            className="
                                            min-h-[325px]
                                            rounded-3xl
                                            border-2
                                            border-pink-500/30
                                            bg-black/40
                                            p-3
                                            backdrop-blur-xl
                                        "
                                        >
                                            {/* POSITION */}

                                            <p
                                                className="
                                                text-sm
                                                font-bold
                                                uppercase
                                                tracking-widest
                                                text-pink-300/60
                                            "
                                            >
                                                {getPositionIcon(
                                                    position
                                                )}{" "}
                                                {position}
                                            </p>


                                            {/* CHARACTER */}

                                            <div
                                                className={`
                                                relative
                                                mt-3
                                                min-h-[255px]
                                                overflow-hidden
                                                rounded-2xl
                                                border-2
                                                bg-black

                                                ${
                                                    pick.hasSynergy
                                                        ? `
                                                            border-pink-300
                                                            shadow-[0_0_24px_rgba(244,114,182,0.55)]
                                                        `
                                                        : getGradeGlow(
                                                            pick.grade
                                                        )
                                                }
                                            `}
                                            >
                                                <img
                                                    src={
                                                        pick.character.imageUrl
                                                    }
                                                    alt={
                                                        pick.character.name
                                                    }
                                                    draggable={
                                                        false
                                                    }
                                                    className="
                                                    pointer-events-none
                                                    absolute
                                                    inset-0
                                                    h-full
                                                    w-full
                                                    object-cover
                                                    object-[50%_20%]
                                                "
                                                />


                                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />


                                                <div
                                                    className="
                                                    absolute
                                                    bottom-0
                                                    left-0
                                                    right-0
                                                    p-4
                                                    text-left
                                                "
                                                >
                                                    {pick.hasSynergy && (
                                                        <p
                                                            className="
                                                            mb-2
                                                            text-xs
                                                            font-black
                                                            uppercase
                                                            tracking-widest
                                                            text-pink-300
                                                        "
                                                        >
                                                            Series Link
                                                        </p>
                                                    )}


                                                    <h3
                                                        className="
                                                        text-xl
                                                        font-black
                                                        text-white
                                                        drop-shadow
                                                    "
                                                    >
                                                        {
                                                            pick.character.name
                                                        }
                                                    </h3>


                                                    <p className="text-sm font-medium text-white/65">
                                                        {
                                                            pick.character.anime
                                                        }
                                                    </p>


                                                    <div className="mt-3 flex items-end justify-between">

                                                        <p
                                                            className={`
                                                            text-3xl
                                                            font-black
                                                            italic

                                                            ${
                                                                pick.grade ===
                                                                "U"
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
                                                            {
                                                                pick.grade
                                                            }
                                                        </p>


                                                        <div className="text-right">

                                                            <p className="text-xl font-black text-white">
                                                                {
                                                                    pick.power
                                                                }
                                                            </p>

                                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/35">
                                                                OVR
                                                            </p>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>


                    {/* ===================================== */}
                    {/* REVEAL OPTIMAL BUTTON */}
                    {/* ===================================== */}

                    <div className="mt-10 text-center">

                        <p className="text-xs font-semibold text-white/35">
                            Think you found the best possible
                            lineup?
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                setShowOptimalLineup(
                                    true
                                )
                            }
                            className="
                            mt-4
                            rounded-2xl
                            border
                            border-yellow-300/40
                            bg-gradient-to-r
                            from-yellow-300
                            via-amber-300
                            to-yellow-500
                            px-7
                            py-3.5
                            text-sm
                            font-black
                            uppercase
                            tracking-widest
                            text-purple-950
                            shadow-[0_0_25px_rgba(250,204,21,0.25)]
                            transition
                            hover:-translate-y-0.5
                            hover:cursor-pointer
                            hover:shadow-[0_0_35px_rgba(250,204,21,0.45)]
                        "
                        >
                            Reveal Optimal Lineup
                        </button>

                    </div>


                    {/* SAVE ERROR */}

                    {saveError && (
                        <div
                            className="
                            mx-auto
                            mt-6
                            max-w-xl
                            rounded-2xl
                            border
                            border-red-400/20
                            bg-red-500/10
                            px-4
                            py-3
                            text-center
                            text-sm
                            text-red-200
                        "
                        >
                            {saveError}
                        </div>
                    )}


                    {/* FOOTER */}

                    <div className="mt-8 flex justify-center">

                        <Link
                            href="/games"
                            className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            px-5
                            py-3
                            text-sm
                            font-bold
                            text-white/60
                            transition
                            hover:bg-white/10
                            hover:text-white
                        "
                        >
                            Back to Games
                        </Link>

                    </div>
                </section>


                {/* ===================================== */}
                {/* OPTIMAL LINEUP OVERLAY */}
                {/* ===================================== */}

                {showOptimalLineup && (
                    <div
                        className="
                        fixed
                        inset-0
                        z-[200]
                        overflow-y-auto
                        bg-black/90
                        px-4
                        py-8
                        backdrop-blur-md
                    "
                    >
                        {/* BACKGROUND GLOW */}

                        <div className="pointer-events-none fixed inset-0">

                            <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[150px]" />

                            <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                        </div>


                        <div
                            className="
                            relative
                            z-10
                            mx-auto
                            w-full
                            max-w-[1600px]
                        "
                        >
                            {/* OVERLAY HEADER */}

                            <div className="relative text-center">

                                <p
                                    className="
                                    text-xs
                                    font-black
                                    uppercase
                                    tracking-[0.35em]
                                    text-yellow-300/60
                                "
                                >
                                    Perfect Solution
                                </p>


                                <h2
                                    className="
                                    mt-2
                                    text-4xl
                                    font-black
                                    text-white
                                    sm:text-5xl
                                "
                                >
                                    Optimal Lineup
                                </h2>


                                <div
                                    className="
                                    mt-4
                                    inline-flex
                                    items-end
                                    gap-2
                                "
                                >
                                    <p
                                        className="
                                        text-6xl
                                        font-black
                                        text-yellow-300
                                        drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]
                                    "
                                    >
                                        {
                                            optimalSolution.totalPower
                                        }
                                    </p>

                                    <p
                                        className="
                                        pb-2
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-widest
                                        text-white/35
                                    "
                                    >
                                        Power
                                    </p>
                                </div>


                                {/* CLOSE */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowOptimalLineup(
                                            false
                                        )
                                    }
                                    className="
                                    absolute
                                    right-0
                                    top-0
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-white/15
                                    bg-white/5
                                    text-lg
                                    font-black
                                    text-white/60
                                    transition
                                    hover:cursor-pointer
                                    hover:bg-white/10
                                    hover:text-white
                                "
                                    aria-label="Close optimal lineup"
                                >
                                    ✕
                                </button>

                            </div>


                            {/* ===================================== */}
                            {/* OPTIMAL GRID */}
                            {/* ===================================== */}

                            <div
                                className="
                                mt-10
                                grid
                                gap-4
                                md:grid-cols-2
                                xl:grid-cols-4
                            "
                            >
                                {draftPositions.map(
                                    (
                                        position
                                    ) => {
                                        const optimalPick =
                                            optimalSolution.picks.find(
                                                (
                                                    pick
                                                ) =>
                                                    pick.position ===
                                                    position
                                            );


                                        const myPick =
                                            picks.find(
                                                (
                                                    pick
                                                ) =>
                                                    pick.position ===
                                                    position
                                            );


                                        if (
                                            !optimalPick
                                        ) {
                                            return null;
                                        }


                                        const playerGotIt =
                                            myPick?.character.id ===
                                            optimalPick.character.id;


                                        return (
                                            <div
                                                key={
                                                    position
                                                }
                                                className={`
                                                min-h-[325px]
                                                rounded-3xl
                                                border-2
                                                p-3

                                                ${
                                                    playerGotIt
                                                        ? `
                                                            border-emerald-400/50
                                                            bg-emerald-500/5
                                                            shadow-[0_0_25px_rgba(52,211,153,0.12)]
                                                        `
                                                        : `
                                                            border-yellow-400/30
                                                            bg-zinc-950
                                                            shadow-[0_0_25px_rgba(250,204,21,0.06)]
                                                        `
                                                }
                                            `}
                                            >
                                                {/* POSITION */}

                                                <div className="flex items-center justify-between gap-2">

                                                    <p
                                                        className="
                                                        text-sm
                                                        font-bold
                                                        uppercase
                                                        tracking-widest
                                                        text-yellow-300/70
                                                    "
                                                    >
                                                        {getPositionIcon(
                                                            position
                                                        )}{" "}
                                                        {
                                                            position
                                                        }
                                                    </p>


                                                    {playerGotIt && (
                                                        <span
                                                            className="
                                                            rounded-full
                                                            border
                                                            border-emerald-400/30
                                                            bg-emerald-500/10
                                                            px-2
                                                            py-1
                                                            text-[8px]
                                                            font-black
                                                            uppercase
                                                            tracking-widest
                                                            text-emerald-300
                                                        "
                                                        >
                                                        You Got It
                                                    </span>
                                                    )}

                                                </div>


                                                {/* CHARACTER */}

                                                <div
                                                    className={`
                                                    relative
                                                    mt-3
                                                    min-h-[255px]
                                                    overflow-hidden
                                                    rounded-2xl
                                                    border-2
                                                    bg-black

                                                    ${
                                                        optimalPick.hasSynergy
                                                            ? `
                                                                border-pink-300
                                                                shadow-[0_0_24px_rgba(244,114,182,0.55)]
                                                            `
                                                            : getGradeGlow(
                                                                optimalPick.grade
                                                            )
                                                    }
                                                `}
                                                >
                                                    <img
                                                        src={
                                                            optimalPick.character.imageUrl
                                                        }
                                                        alt={
                                                            optimalPick.character.name
                                                        }
                                                        draggable={
                                                            false
                                                        }
                                                        className="
                                                        pointer-events-none
                                                        absolute
                                                        inset-0
                                                        h-full
                                                        w-full
                                                        object-cover
                                                        object-[50%_20%]
                                                    "
                                                    />


                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />


                                                    <div
                                                        className="
                                                        absolute
                                                        bottom-0
                                                        left-0
                                                        right-0
                                                        p-4
                                                        text-left
                                                    "
                                                    >
                                                        {optimalPick.hasSynergy && (
                                                            <p
                                                                className="
                                                                mb-2
                                                                text-xs
                                                                font-black
                                                                uppercase
                                                                tracking-widest
                                                                text-pink-300
                                                            "
                                                            >
                                                                Series Link
                                                            </p>
                                                        )}


                                                        <h3
                                                            className="
                                                            text-xl
                                                            font-black
                                                            text-white
                                                            drop-shadow
                                                        "
                                                        >
                                                            {
                                                                optimalPick.character.name
                                                            }
                                                        </h3>


                                                        <p className="text-sm font-medium text-white/65">
                                                            {
                                                                optimalPick.character.anime
                                                            }
                                                        </p>


                                                        <div className="mt-3 flex items-end justify-between">

                                                            <p
                                                                className={`
                                                                text-3xl
                                                                font-black
                                                                italic

                                                                ${
                                                                    optimalPick.grade ===
                                                                    "U"
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
                                                                {
                                                                    optimalPick.grade
                                                                }
                                                            </p>


                                                            <div className="text-right">

                                                                <p className="text-xl font-black text-white">
                                                                    {
                                                                        optimalPick.power
                                                                    }
                                                                </p>

                                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/35">
                                                                    OVR
                                                                </p>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>


                            {/* ===================================== */}
                            {/* BOTTOM RESULT */}
                            {/* ===================================== */}

                            <div
                                className="
                                mx-auto
                                mt-8
                                max-w-xl
                                rounded-3xl
                                border
                                border-yellow-400/20
                                bg-zinc-950
                                p-5
                                text-center
                            "
                            >
                                <p
                                    className="
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-[0.25em]
                                    text-yellow-300/50
                                "
                                >
                                    Your Result
                                </p>


                                <p className="mt-2 text-2xl font-black text-white">
                                    {totalPower} /{" "}
                                    {
                                        optimalSolution.totalPower
                                    }
                                </p>


                                <p className="mt-2 text-sm font-semibold text-purple-200">
                                    {efficiency}% Optimal
                                </p>


                                <p className="mt-2 text-xs text-white/35">
                                    You found{" "}
                                    {
                                        matchedOptimalPositions
                                    }{" "}
                                    of 8 exact optimal
                                    placements.
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowOptimalLineup(
                                            false
                                        )
                                    }
                                    className="
                                    mt-5
                                    rounded-2xl
                                    border
                                    border-white/15
                                    bg-white/5
                                    px-6
                                    py-3
                                    text-sm
                                    font-black
                                    text-white
                                    transition
                                    hover:cursor-pointer
                                    hover:bg-white/10
                                "
                                >
                                    Back to My Lineup
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </main>
        );
    }


    /*
     * =========================================
     * ACTIVE DAILY DRAFT
     * =========================================
     */

    return (
        <main
            className="
                relative
                mx-auto
                min-h-[calc(100vh-130px)]
                max-w-[1700px]
                px-4
                py-6
            "
        >
            {/* BACKGROUND */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />

            </div>


            <section
                className="
                    relative
                    z-10
                    rounded-3xl
                    border
                    border-pink-500/20
                    bg-black/40
                    p-6
                    shadow-[0_0_25px_rgba(236,72,153,0.08)]
                    backdrop-blur-xl
                "
            >
                {/* HEADER */}

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >
                    <div>

                        <p
                            className="
                                text-xs
                                font-black
                                uppercase
                                tracking-[0.3em]
                                text-pink-300/60
                            "
                        >
                            Daily Draft
                        </p>


                        <h1
                            className="
                                mt-2
                                text-4xl
                                font-black
                                text-white
                                sm:text-5xl
                            "
                        >
                            Today's Lineup
                        </h1>


                        <p
                            className="
                                mt-3
                                max-w-2xl
                                text-sm
                                leading-6
                                text-purple-100/60
                            "
                        >
                            Everyone gets the
                            same 8 characters in
                            the same order. Find
                            the strongest possible
                            lineup.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setShowRules(
                                true
                            )
                        }
                        className="
                            rounded-2xl
                            border
                            border-pink-500/20
                            bg-pink-500/5
                            px-4
                            py-2
                            text-xs
                            font-black
                            uppercase
                            tracking-widest
                            text-pink-200
                            transition
                            hover:cursor-pointer
                            hover:border-pink-400/40
                            hover:bg-pink-500/10
                        "
                    >
                        How to Play
                    </button>
                </div>


                {/* DAILY INFO */}

                <div
                    className="
                        mt-5
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    "
                >
                    <span
                        className="
                            rounded-full
                            border
                            border-pink-500/20
                            bg-pink-500/5
                            px-3
                            py-1.5
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.2em]
                            text-pink-300/60
                        "
                    >
                        Character{" "}
                        {
                            picks.length +
                            1
                        }{" "}
                        / 8
                    </span>


                    <span
                        className="
                            rounded-full
                            border
                            border-purple-500/20
                            bg-purple-500/5
                            px-3
                            py-1.5
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.2em]
                            text-purple-300/60
                        "
                    >
                        Same Draft for Everyone
                    </span>


                    {!user && (
                        <span
                            className="
                                rounded-full
                                border
                                border-yellow-400/20
                                bg-yellow-500/5
                                px-3
                                py-1.5
                                text-[10px]
                                font-black
                                uppercase
                                tracking-[0.2em]
                                text-yellow-300/60
                            "
                        >
                            Guest Progress Won't Save
                        </span>
                    )}
                </div>


                {/* PROGRESS */}

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">

                    <div
                        className="
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            from-pink-500
                            via-fuchsia-500
                            to-purple-500
                            transition-all
                            duration-500
                        "
                        style={{
                            width:
                                `${(picks.length / 8) * 100}%`,
                        }}
                    />

                </div>


                {/* GAME */}

                <div
                    className="
                        mt-7
                        grid
                        gap-6
                        xl:grid-cols-[300px_1fr]
                    "
                >
                    {/* CURRENT CHARACTER */}

                    <div>

                        <div className="mb-4 flex items-center justify-between">

                            <h2 className="text-xl font-bold text-white">
                                Current Character
                            </h2>


                            <span className="text-xs font-black text-pink-300/40">
                                #
                                {
                                    picks.length +
                                    1
                                }
                            </span>

                        </div>


                        {currentCharacter && (
                            <div
                                draggable={
                                    !pendingPick
                                }

                                onDragStart={
                                    handleDragStart
                                }

                                onDragEnd={
                                    handleDragEnd
                                }

                                className={`
                                    relative
                                    min-h-[350px]
                                    overflow-hidden
                                    rounded-3xl
                                    border
                                    border-pink-500/30
                                    bg-black
                                    transition
                                    shadow-[0_0_30px_rgba(236,72,153,0.18)]

                                    ${
                                    pendingPick
                                        ? `
                                                cursor-not-allowed
                                                opacity-40
                                            `
                                        : isDraggingCard
                                            ? `
                                                    cursor-grabbing
                                                    scale-95
                                                    opacity-40
                                                `
                                            : `
                                                    cursor-grab
                                                    active:cursor-grabbing
                                                `
                                }
                                `}
                            >
                                <img
                                    src={
                                        currentCharacter.imageUrl
                                    }
                                    alt={
                                        currentCharacter.name
                                    }
                                    draggable={
                                        false
                                    }
                                    className="
                                        pointer-events-none
                                        absolute
                                        inset-0
                                        h-full
                                        w-full
                                        object-cover
                                        object-[50%_20%]
                                    "
                                />


                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />


                                <div
                                    className="
                                        absolute
                                        bottom-0
                                        left-0
                                        right-0
                                        p-5
                                    "
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-pink-300">
                                        Drag to Position
                                    </p>


                                    <h3
                                        className="
                                            mt-2
                                            text-3xl
                                            font-black
                                            text-white
                                            drop-shadow
                                        "
                                    >
                                        {
                                            currentCharacter.name
                                        }
                                    </h3>


                                    <p className="mt-1 text-sm font-medium text-white/65">
                                        {
                                            currentCharacter.anime
                                        }
                                    </p>

                                </div>
                            </div>
                        )}


                        {/* CURRENT SCORE */}

                        <div
                            className="
                                mt-4
                                rounded-3xl
                                border
                                border-purple-400/15
                                bg-zinc-950
                                p-5
                            "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-300/50">
                                Current Team Power
                            </p>


                            <div className="mt-2 flex items-end gap-2">

                                <p className="text-5xl font-black text-yellow-300">
                                    {
                                        totalPower
                                    }
                                </p>


                                <p className="pb-1 text-xs font-black uppercase tracking-widest text-white/30">
                                    Total
                                </p>

                            </div>
                        </div>


                        {/* SAVE STATUS */}

                        {saving && (
                            <p className="mt-3 text-center text-xs font-bold text-pink-300/50">
                                Saving daily
                                progress...
                            </p>
                        )}


                        {saveError && (
                            <div
                                className="
                                    mt-3
                                    rounded-2xl
                                    border
                                    border-red-400/20
                                    bg-red-500/10
                                    px-4
                                    py-3
                                    text-xs
                                    text-red-200
                                "
                            >
                                {
                                    saveError
                                }
                            </div>
                        )}

                    </div>


                    {/* POSITIONS */}

                    <div>

                        <div className="mb-4 flex items-center justify-between gap-4">

                            <h2 className="text-xl font-bold text-white">
                                Team Positions
                            </h2>


                            <div
                                className="
                                    rounded-full
                                    border
                                    border-pink-400/20
                                    bg-pink-500/5
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-[0.2em]
                                    text-pink-300/50
                                "
                            >
                                Daily Team
                            </div>

                        </div>


                        <div
                            className="
                                grid
                                gap-4
                                md:grid-cols-2
                                xl:grid-cols-4
                            "
                        >
                            {draftPositions.map(
                                (
                                    position
                                ) => {
                                    const pick =
                                        picks.find(
                                            (
                                                pick
                                            ) =>
                                                pick.position ===
                                                position
                                        );


                                    const pendingHere =
                                        pendingPick?.position ===
                                        position;


                                    const dropHovered =
                                        hoveredPosition ===
                                        position;


                                    return (
                                        <div
                                            key={
                                                position
                                            }

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

                                            onDragOver={(
                                                event
                                            ) => {
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

                                            onDragLeave={() => {
                                                setHoveredPosition(
                                                    null
                                                );
                                            }}

                                            onDrop={(
                                                event
                                            ) =>
                                                handleDrop(
                                                    event,
                                                    position
                                                )
                                            }

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
                                                    ? `
                                                            border-pink-500/30
                                                            bg-black/40
                                                            backdrop-blur-xl
                                                        `
                                                    : pendingHere
                                                        ? `
                                                                border-yellow-400
                                                                bg-yellow-500/10
                                                                shadow-[0_0_25px_rgba(250,204,21,0.25)]
                                                            `
                                                        : dropHovered
                                                            ? `
                                                                    border-pink-400
                                                                    bg-pink-500/10
                                                                    shadow-[0_0_25px_rgba(236,72,153,0.25)]
                                                                `
                                                            : `
                                                                    border-pink-500/20
                                                                    bg-black/20
                                                                `
                                            }
                                            `}
                                        >
                                            {/* TOOLTIP */}

                                            <PositionBreakdownTooltip
                                                position={
                                                    position
                                                }
                                                visible={
                                                    !isDraggingCard &&
                                                    !pendingPick &&
                                                    hoveredInfoPosition ===
                                                    position
                                                }
                                            />


                                            {/* POSITION NAME */}

                                            <p
                                                className="
                                                    text-sm
                                                    font-bold
                                                    uppercase
                                                    tracking-widest
                                                    text-pink-300/60
                                                "
                                            >
                                                {getPositionIcon(
                                                    position
                                                )}{" "}
                                                {
                                                    position
                                                }
                                            </p>


                                            {/* EMPTY */}

                                            {!pick &&
                                                !pendingHere && (
                                                    <div
                                                        className="
                                                            mt-8
                                                            text-center
                                                            text-sm
                                                            font-semibold
                                                            text-pink-300/60
                                                        "
                                                    >
                                                        Drop
                                                        character
                                                        here
                                                    </div>
                                                )}


                                            {/* PENDING */}

                                            {!pick &&
                                                pendingHere &&
                                                pendingPick && (
                                                    <div
                                                        className="
                                                        relative
                                                        mt-3
                                                        min-h-[255px]
                                                        overflow-hidden
                                                        rounded-2xl
                                                        border-2
                                                        border-yellow-300
                                                        bg-black
                                                        shadow-[0_0_25px_rgba(250,204,21,0.2)]
                                                    "
                                                    >
                                                        <img
                                                            src={
                                                                pendingPick.character.imageUrl
                                                            }
                                                            alt={
                                                                pendingPick.character.name
                                                            }
                                                            draggable={
                                                                false
                                                            }
                                                            className="
                                                                pointer-events-none
                                                                absolute
                                                                inset-0
                                                                h-full
                                                                w-full
                                                                object-cover
                                                                object-[50%_20%]
                                                            "
                                                        />


                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />


                                                        <div
                                                            className="
                                                                absolute
                                                                bottom-0
                                                                left-0
                                                                right-0
                                                                p-4
                                                                text-left
                                                            "
                                                        >
                                                            <p className="text-xs font-black uppercase tracking-widest text-yellow-300">
                                                                Confirm placement?
                                                            </p>


                                                            <h3 className="mt-2 text-xl font-black text-white drop-shadow">
                                                                {
                                                                    pendingPick.character.name
                                                                }
                                                            </h3>


                                                            <p className="text-sm font-medium text-white/65">
                                                                {
                                                                    pendingPick.character.anime
                                                                }
                                                            </p>


                                                            <div className="mt-4 flex flex-wrap gap-2">

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={() =>
                                                                        void confirmPick()
                                                                    }
                                                                    className="
                                                                        rounded-xl
                                                                        bg-yellow-300
                                                                        px-4
                                                                        py-2
                                                                        text-sm
                                                                        font-black
                                                                        text-purple-950
                                                                        transition
                                                                        hover:cursor-pointer
                                                                        hover:bg-yellow-200
                                                                        disabled:cursor-not-allowed
                                                                        disabled:opacity-50
                                                                    "
                                                                >
                                                                    {saving
                                                                        ? "Saving..."
                                                                        : "Confirm"}
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={
                                                                        cancelPendingPick
                                                                    }
                                                                    className="
                                                                        rounded-xl
                                                                        border
                                                                        border-white/30
                                                                        bg-white/10
                                                                        px-4
                                                                        py-2
                                                                        text-sm
                                                                        font-bold
                                                                        text-white
                                                                        transition
                                                                        hover:cursor-pointer
                                                                        hover:bg-white/20
                                                                        disabled:opacity-50
                                                                    "
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>
                                                        </div>
                                                    </div>
                                                )}


                                            {/* LOCKED PICK */}

                                            {pick && (
                                                <div
                                                    className={`
                                                        relative
                                                        mt-3
                                                        min-h-[255px]
                                                        overflow-hidden
                                                        rounded-2xl
                                                        border-2
                                                        bg-black
                                                        transition

                                                        ${
                                                        pick.hasSynergy
                                                            ? `
                                                                    border-pink-300
                                                                    shadow-[0_0_24px_rgba(244,114,182,0.55)]
                                                                `
                                                            : getGradeGlow(
                                                                pick.grade
                                                            )
                                                    }
                                                    `}
                                                >
                                                    <img
                                                        src={
                                                            pick.character.imageUrl
                                                        }
                                                        alt={
                                                            pick.character.name
                                                        }
                                                        draggable={
                                                            false
                                                        }
                                                        className="
                                                            pointer-events-none
                                                            absolute
                                                            inset-0
                                                            h-full
                                                            w-full
                                                            object-cover
                                                            object-[50%_20%]
                                                        "
                                                    />


                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />


                                                    <div
                                                        className="
                                                            absolute
                                                            bottom-0
                                                            left-0
                                                            right-0
                                                            p-4
                                                            text-left
                                                        "
                                                    >
                                                        {pick.hasSynergy && (
                                                            <p className="mb-2 text-xs font-black uppercase tracking-widest text-pink-300">
                                                                Series Link
                                                            </p>
                                                        )}


                                                        <h3 className="text-xl font-black text-white drop-shadow">
                                                            {
                                                                pick.character.name
                                                            }
                                                        </h3>


                                                        <p className="text-sm font-medium text-white/65">
                                                            {
                                                                pick.character.anime
                                                            }
                                                        </p>


                                                        <div className="mt-3 flex items-end justify-between">

                                                            <p
                                                                className={`
                                                                    text-3xl
                                                                    font-black
                                                                    italic

                                                                    ${
                                                                    pick.grade ===
                                                                    "U"
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
                                                                {
                                                                    pick.grade
                                                                }
                                                            </p>


                                                            <div className="text-right">

                                                                <p className="text-xl font-black text-white">
                                                                    {
                                                                        pick.power
                                                                    }
                                                                </p>

                                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/35">
                                                                    OVR
                                                                </p>

                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    </div>
                </div>
            </section>


            {/* HOW TO PLAY */}

            {showRules && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[200]
                        flex
                        items-center
                        justify-center
                        bg-black/80
                        px-4
                        backdrop-blur-sm
                    "
                    onClick={() =>
                        setShowRules(
                            false
                        )
                    }
                >
                    <div
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                        className="
                            w-full
                            max-w-lg
                            rounded-3xl
                            border
                            border-pink-500/20
                            bg-zinc-950
                            p-6
                            shadow-[0_0_35px_rgba(236,72,153,0.15)]
                        "
                    >
                        <div className="flex items-start justify-between gap-4">

                            <div>

                                <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-300/50">
                                    Daily Draft
                                </p>

                                <h2 className="mt-1 text-2xl font-black text-white">
                                    How to Play
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowRules(
                                        false
                                    )
                                }
                                className="
                                    text-white/40
                                    transition
                                    hover:cursor-pointer
                                    hover:text-white
                                "
                            >
                                ✕
                            </button>

                        </div>


                        <div className="mt-5 space-y-4 text-sm leading-6 text-white/55">

                            <p>
                                Everyone receives
                                the same 8 anime
                                characters in the
                                same order each day.
                            </p>


                            <div>

                                <h3 className="font-black text-white">
                                    Drafting
                                </h3>

                                <ul className="mt-2 list-disc space-y-1 pl-5">

                                    <li>
                                        Drag each
                                        character
                                        into one
                                        open
                                        position.
                                    </li>

                                    <li>
                                        Once you
                                        confirm a
                                        placement,
                                        it is locked.
                                    </li>

                                    <li>
                                        There are
                                        no rerolls
                                        in Daily
                                        Draft.
                                    </li>

                                    <li>
                                        Hover over
                                        positions to
                                        see exactly
                                        how they are
                                        scored.
                                    </li>

                                </ul>
                            </div>


                            <div>

                                <h3 className="font-black text-white">
                                    The Goal
                                </h3>

                                <p className="mt-2">
                                    Build the
                                    strongest lineup
                                    possible with
                                    today's eight
                                    characters.
                                </p>

                            </div>


                            <div>

                                <h3 className="font-black text-white">
                                    Final Result
                                </h3>

                                <p className="mt-2">
                                    After your eighth
                                    placement, your
                                    lineup is compared
                                    against the
                                    mathematically
                                    strongest possible
                                    arrangement.
                                </p>

                            </div>


                            <div>

                                <h3 className="font-black text-white">
                                    Series Links
                                </h3>

                                <p className="mt-2">
                                    Characters from
                                    the same anime
                                    still receive the
                                    normal Series Link
                                    bonus.
                                </p>

                            </div>


                            <div>

                                <h3 className="font-black text-white">
                                    Daily Streak
                                </h3>

                                <p className="mt-2">
                                    Finish the Daily
                                    Draft to keep your
                                    streak alive.
                                </p>

                            </div>

                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}