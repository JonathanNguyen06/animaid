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
    requestDraftRematch, startDraftRematchIfReady,
} from "@/lib/multiplayerDraft";
import {draftCharacters,} from "@/data/draftCharacters";
import {draftPositions, ascensionInfo, getLetterGrade,} from "@/data/draftLogic";
import type {DraftMatch, MultiplayerDraftPlayerState,} from "@/types/multiplayerDraft";

type MultiplayerRevealPhase =
    | "intro"
    | "lineup"
    | "ascension"
    | "final";

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
                              justRevealed,
                              ascensionApplied,
                              myState,
                              opponentState,
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
    justRevealed: boolean;
    ascensionApplied: boolean;

    myState: MultiplayerDraftPlayerState;
    opponentState: MultiplayerDraftPlayerState;
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

    const matchupWinner:
        "you" | "opponent" | "tie" =
        myPower > opponentPower
            ? "you"
            : opponentPower > myPower
                ? "opponent"
                : "tie";

    const myGrade =
        slot.myPick
            ? getLetterGrade(myPower)
            : null;

    const opponentGrade =
        slot.opponentPick
            ? getLetterGrade(
                opponentPower
            )
            : null;

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
                transition-all duration-500

                ${
                slot.isPowerPosition
                    ? `
                            border-yellow-400/30
                            bg-yellow-500/5
                            shadow-[0_0_25px_rgba(250,204,21,0.08)]
                        `
                    : `
                            border-white/10
                            bg-black/40
                        `
            }

                ${
                justRevealed
                    ? "animate-[versusReveal_700ms_cubic-bezier(.16,1,.3,1)_both]"
                    : ""
            }
            `}
        >
            {/* POSITION */}
            <div className="mb-3 text-center">
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
                                    Opponent
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
                                border border-purple-400/20
                                bg-purple-500/10
                                px-3 py-2
                            "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
                                Opponent Wins
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

export default function MultiplayerDraftResultsPage() {
    const router = useRouter();
    const params = useParams<{ code: string; }>();
    const code = params.code?.toUpperCase();
    const [user, setUser] = useState<User | null>(null);
    const [match, setMatch] = useState<DraftMatch | null>(null);
    const [hostState, setHostState,] = useState<MultiplayerDraftPlayerState | null>(null);
    const [guestState, setGuestState,] = useState<MultiplayerDraftPlayerState | null>(null);
    const [revealPhase, setRevealPhase,] = useState<MultiplayerRevealPhase>("intro");
    const [revealedCount, setRevealedCount,] = useState(0);
    const [showAscensionImpact, setShowAscensionImpact,] = useState(false);
    const [requestingRematch, setRequestingRematch,] = useState(false);
    const [finalTeamsLoaded, setFinalTeamsLoaded,] = useState(false);


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

    useEffect(() => {
        if (
            !hostState ||
            !guestState
        ) {
            return;
        }

        if (revealPhase !== "intro") {
            return;
        }

        const timeout =
            window.setTimeout(() => {
                setRevealPhase(
                    "lineup"
                );
            }, 1400);

        return () =>
            window.clearTimeout(timeout);
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

        const impactTimeout =
            window.setTimeout(() => {
                setShowAscensionImpact(
                    true
                );
            }, 1300);

        const finalTimeout =
            window.setTimeout(() => {
                setRevealPhase(
                    "final"
                );
            }, 3000);

        return () => {
            window.clearTimeout(
                impactTimeout
            );

            window.clearTimeout(
                finalTimeout
            );
        };
    }, [
        revealPhase,
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
            revealPhase !== "final"
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

                opponentPick:
                opponentPowerPick,

                isPowerPosition: true,
            },
        ];
    }, [
        revealMyState,
        revealOpponentState,
    ]);

    // ---------------------------------------------------------
    // LIVE REVEAL SCORE
    // ---------------------------------------------------------

    const liveRevealScore = useMemo(() => {
        let myWins = 0;
        let opponentWins = 0;
        let ties = 0;

        /*
         * During the lineup reveal, only count
         * positions that have actually been shown.
         *
         * Once Ascensions begin, every position
         * has already been revealed.
         */
        const visibleSlotCount =
            revealPhase === "intro"
                ? 0
                : revealPhase === "lineup"
                    ? revealedCount
                    : revealSlots.length;

        const ascensionsActive =
            showAscensionImpact ||
            revealPhase === "final";

        for (
            let index = 0;
            index < visibleSlotCount;
            index++
        ) {
            const slot =
                revealSlots[index];

            if (
                !slot.myPick ||
                !slot.opponentPick
            ) {
                continue;
            }

            /*
             * Score using exactly the same power
             * currently being shown on the cards.
             */
            const myPower =
                ascensionsActive
                    ? slot.myPick.power
                    : getPreAscensionPower(
                        slot.myPick
                    );

            const opponentPower =
                ascensionsActive
                    ? slot.opponentPick.power
                    : getPreAscensionPower(
                        slot.opponentPick
                    );

            if (
                myPower >
                opponentPower
            ) {
                myWins++;
            } else if (
                opponentPower >
                myPower
            ) {
                opponentWins++;
            } else {
                ties++;
            }
        }

        return {
            myWins,
            opponentWins,
            ties,
            revealed:
            visibleSlotCount,
        };
    }, [
        revealSlots,
        revealedCount,
        revealPhase,
        showAscensionImpact,
    ]);


// ---------------------------------------------------------
// LINEUP REVEAL TIMER
// ---------------------------------------------------------

    useEffect(() => {
        if (
            revealPhase !== "lineup"
        ) {
            return;
        }

        if (revealSlots.length === 0) {
            return;
        }

        if (
            revealedCount >=
            revealSlots.length
        ) {
            const timeout =
                window.setTimeout(
                    () => {
                        setRevealPhase(
                            "ascension"
                        );
                    },
                    900
                );

            return () =>
                window.clearTimeout(
                    timeout
                );
        }

        const currentSlot =
            revealSlots[
                revealedCount
                ];

        const myGrade =
            currentSlot.myPick
                ? getLetterGrade(
                    getPreAscensionPower(
                        currentSlot.myPick
                    )
                )
                : null;

        const opponentGrade =
            currentSlot.opponentPick
                ? getLetterGrade(
                    getPreAscensionPower(
                        currentSlot.opponentPick
                    )
                )
                : null;

        const eliteReveal =
            myGrade === "S+" ||
            myGrade === "S" ||
            opponentGrade === "S+" ||
            opponentGrade === "S";

        const delay =
            eliteReveal
                ? 1450
                : 950;

        const timeout =
            window.setTimeout(() => {
                setRevealedCount(
                    (count) =>
                        count + 1
                );
            }, delay);

        return () =>
            window.clearTimeout(
                timeout
            );
    }, [
        revealPhase,
        revealedCount,
        revealSlots,
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

    const myPlayer =
        amHost
            ? match.host
            : match.guest;

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

    // ---------------------------------------------------------
    // POSITION MATCHUP SCORE
    // ---------------------------------------------------------

    const positionResults =
        revealSlots.map((slot) => {
            const myPower =
                slot.myPick?.power ?? 0;

            const opponentPower =
                slot.opponentPick?.power ?? 0;

            if (myPower > opponentPower) {
                return "you" as const;
            }

            if (opponentPower > myPower) {
                return "opponent" as const;
            }

            return "tie" as const;
        });


    const myPositionWins =
        positionResults.filter(
            (result) =>
                result === "you"
        ).length;


    const opponentPositionWins =
        positionResults.filter(
            (result) =>
                result === "opponent"
        ).length;


    const tiedPositions =
        positionResults.filter(
            (result) =>
                result === "tie"
        ).length;


    /*
     * Team Power only matters if
     * positional wins are tied.
     */
    const decidedByPowerTiebreaker =
        myPositionWins ===
        opponentPositionWins;


    const isDraw =
        decidedByPowerTiebreaker &&
        myTotalPower ===
        opponentTotalPower;


    const iWon =
        !isDraw &&
        (
            myPositionWins >
            opponentPositionWins

            ||

            (
                decidedByPowerTiebreaker &&
                myTotalPower >
                opponentTotalPower
            )
        );


    const iLost =
        !isDraw &&
        !iWon;

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-[1700px] px-4 py-6">

            {/* BACKGROUND */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>


            <section className="relative z-10 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">

                <div className="text-center">

                    <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-300/60">
                        Multiplayer Draft
                    </p>

                    <h1 className="mt-3 text-5xl font-black text-white">
                        Final Showdown
                    </h1>

                    <p className="mt-3 text-purple-100/60">
                        Both teams are locked. Time to see who drafted better.
                    </p>

                    <div className="mt-8">
                        <div
                            className="
                                relative
                                mb-7
                                overflow-hidden
                                rounded-3xl
                                border border-white/10
                                bg-black/50
                                p-5
                                shadow-[0_0_30px_rgba(236,72,153,0.06)]
                                backdrop-blur-xl
                            "
                            >
                            <div className="pointer-events-none absolute left-0 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[60px]" />

                            <div className="pointer-events-none absolute right-0 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[60px]" />


                            <div className="relative z-10">

                                {/* LABEL */}
                                <div className="mb-4 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/30">
                                        Live Match Score
                                    </p>
                                </div>


                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5">

                                    {/* ===================================== */}
                                    {/* YOU */}
                                    {/* ===================================== */}

                                    <div className="text-center">

                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-300/50">
                                            You
                                        </p>

                                        <p
                                            key={`my-${liveRevealScore.myWins}`}
                                            className="
                                                mt-1
                                                animate-[scorePop_350ms_cubic-bezier(.16,1,.3,1)]
                                                text-6xl
                                                font-black
                                                text-pink-300
                                                drop-shadow-[0_0_20px_rgba(244,114,182,0.35)]
                                            "
                                        >
                                            {liveRevealScore.myWins}
                                        </p>

                                        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/25">
                                            Positions
                                        </p>
                                    </div>


                                    {/* ===================================== */}
                                    {/* CENTER */}
                                    {/* ===================================== */}

                                    <div className="text-center">

                                        <div
                                            className="
                                                flex h-12 w-12
                                                items-center justify-center
                                                rounded-full
                                                border border-white/10
                                                bg-white/[0.03]
                                            "
                                        >
                                            <p className="text-xs font-black italic text-white/30">
                                                VS
                                            </p>
                                        </div>

                                    </div>


                                    {/* ===================================== */}
                                    {/* OPPONENT */}
                                    {/* ===================================== */}

                                    <div className="text-center">

                                        <p className="truncate text-[10px] font-black uppercase tracking-[0.25em] text-purple-300/50">
                                            {match.host.uid === user.uid
                                                ? match.guest?.displayName
                                                : match.host.displayName}
                                        </p>

                                        <p
                                            key={`opponent-${liveRevealScore.opponentWins}`}
                                            className="
                                                mt-1
                                                animate-[scorePop_350ms_cubic-bezier(.16,1,.3,1)]
                                                text-6xl
                                                font-black
                                                text-purple-300
                                                drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]
                                            "
                                        >
                                            {liveRevealScore.opponentWins}
                                        </p>

                                        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/25">
                                            Positions
                                        </p>
                                    </div>
                                </div>


                                {/* ========================================= */}
                                {/* REVEAL PROGRESS */}
                                {/* ========================================= */}

                                <div className="mt-5 border-t border-white/10 pt-4">

                                    <div className="flex items-center justify-between gap-4">

                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                            {liveRevealScore.revealed}
                                            {" / "}
                                            {revealSlots.length}
                                            {" Positions Revealed"}
                                        </p>


                                        {liveRevealScore.ties > 0 && (
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200/45">
                                                {liveRevealScore.ties}{" "}
                                                {liveRevealScore.ties === 1
                                                    ? "Tie"
                                                    : "Ties"}
                                            </p>
                                        )}
                                    </div>


                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">

                                        <div
                                            className="
                                                h-full
                                                rounded-full
                                                bg-gradient-to-r
                                                from-pink-500
                                                via-fuchsia-500
                                                to-purple-500
                                                transition-[width]
                                                duration-500
                                                ease-out
                                            "
                                            style={{
                                                width: `${
                                                    revealSlots.length > 0
                                                        ? (
                                                        liveRevealScore.revealed /
                                                        revealSlots.length
                                                    ) * 100
                                                        : 0
                                                }%`,
                                            }}
                                        />

                                    </div>

                                </div>


                                {/* ========================================= */}
                                {/* ASCENSION RECALC NOTICE */}
                                {/* ========================================= */}

                                {showAscensionImpact && (
                                    <div
                                        className="
                                            mt-4
                                            animate-[scorePop_500ms_cubic-bezier(.16,1,.3,1)]
                                            rounded-xl
                                            border border-yellow-400/20
                                            bg-yellow-500/10
                                            px-4 py-2
                                            text-center
                                        "
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-200">
                                            ⚡ Score Updated After Ascensions
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-300/50">
                                    Head-to-Head
                                </p>

                                <h2 className="mt-1 text-2xl font-black text-white">
                                    Lineup Reveal
                                </h2>
                            </div>

                            <p className="text-xs font-bold text-white/30">
                                {Math.min(
                                    revealedCount,
                                    revealSlots.length
                                )}
                                /{revealSlots.length} revealed
                            </p>
                        </div>


                        <div
                            className="
                            grid
                            gap-3
                            sm:grid-cols-2
                            xl:grid-cols-3
                            2xl:grid-cols-5
                        "
                        >
                            {revealSlots.map(
                                (slot, index) => {
                                    const revealed =
                                        index <
                                        revealedCount;

                                    const justRevealed =
                                        revealPhase ===
                                        "lineup" &&
                                        index ===
                                        revealedCount - 1;

                                    return (
                                        <HeadToHeadReveal
                                            key={slot.label}
                                            slot={slot}
                                            revealed={
                                                revealed
                                            }
                                            justRevealed={
                                                justRevealed
                                            }
                                            ascensionApplied={
                                                showAscensionImpact ||
                                                revealPhase ===
                                                "final"
                                            }
                                            myState={
                                                myState
                                            }
                                            opponentState={
                                                opponentState
                                            }
                                        />
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {(
                        revealPhase === "ascension" ||
                        revealPhase === "final"
                    ) && (
                        <div className="relative mt-10 overflow-hidden rounded-3xl border border-yellow-400/25 bg-yellow-500/5 p-6">

                            <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/10 blur-[100px]" />

                            <div className="relative z-10">

                                <p className="text-center text-xs font-black uppercase tracking-[0.35em] text-yellow-300/60">
                                    Ascension Reveal
                                </p>

                                <div className="mt-6 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">

                                    <div className="rounded-3xl border border-yellow-400/20 bg-black/50 p-5 text-center">

                                        <p className="text-[10px] font-black uppercase tracking-widest text-pink-300/50">
                                            Your Ascension
                                        </p>

                                        <h3 className="mt-2 text-2xl font-black text-yellow-200">
                                            {
                                                myState.selectedAscension
                                            }
                                        </h3>

                                        <p className="mt-2 text-sm text-white/45">
                                            {
                                                myState.selectedAscension
                                                    ? ascensionInfo[
                                                        myState
                                                            .selectedAscension
                                                        ].description
                                                    : ""
                                            }
                                        </p>
                                    </div>

                                    <p className="text-center text-2xl font-black italic text-yellow-300/30">
                                        VS
                                    </p>

                                    <div className="rounded-3xl border border-yellow-400/20 bg-black/50 p-5 text-center">

                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-300/50">
                                            Opponent Ascension
                                        </p>

                                        <h3 className="mt-2 text-2xl font-black text-yellow-200">
                                            {
                                                opponentState.selectedAscension
                                            }
                                        </h3>

                                        <p className="mt-2 text-sm text-white/45">
                                            {
                                                opponentState.selectedAscension
                                                    ? ascensionInfo[
                                                        opponentState
                                                            .selectedAscension
                                                        ].description
                                                    : ""
                                            }
                                        </p>
                                    </div>
                                </div>

                                {showAscensionImpact && (
                                    <p className="mt-6 animate-[ascensionImpact_800ms_cubic-bezier(.16,1,.3,1)_both] text-center text-sm font-black uppercase tracking-[0.3em] text-yellow-300">
                                        ⚡ Ascensions Applied
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {revealPhase === "final" && (
                        <div className="mt-10 animate-[finalReveal_900ms_cubic-bezier(.16,1,.3,1)_both] text-center">

                            <p className="text-xs font-black uppercase tracking-[0.4em] text-yellow-300/60">
                                Final Result
                            </p>

                            <div className="mx-auto mt-6 grid max-w-5xl items-center gap-5 md:grid-cols-[1fr_auto_1fr]">

                                {/* YOU */}
                                <div
                                    className="
                                        rounded-3xl
                                        border border-pink-500/25
                                        bg-pink-500/5
                                        p-6
                                    "
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-pink-300/50">
                                        You
                                    </p>

                                    <p
                                        className="
                                            mt-3
                                            text-7xl
                                            font-black
                                            text-yellow-300
                                            drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]
                                        "
                                    >
                                        {myPositionWins}
                                    </p>

                                    <p className="mt-2 text-xs font-black uppercase tracking-widest text-white/30">
                                        Positions Won
                                    </p>
                                </div>


                                {/* SCORE */}
                                <div className="text-center">
                                    <p className="text-xs font-black uppercase tracking-[0.25em] text-white/20">
                                        Final
                                    </p>

                                    <p className="mt-1 text-3xl font-black italic text-white/25">
                                        VS
                                    </p>
                                </div>


                                {/* OPPONENT */}
                                <div
                                    className="
                                        rounded-3xl
                                        border border-purple-500/25
                                        bg-purple-500/5
                                        p-6
                                    "
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-purple-300/50">
                                        {opponentPlayer.displayName}
                                    </p>

                                    <p
                                        className="
                                            mt-3
                                            text-7xl
                                            font-black
                                            text-yellow-300
                                            drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]
                                        "
                                    >
                                        {opponentPositionWins}
                                    </p>

                                    <p className="mt-2 text-xs font-black uppercase tracking-widest text-white/30">
                                        Positions Won
                                    </p>
                                </div>
                            </div>

                            <div
                                className="
                                    mx-auto
                                    mt-5
                                    max-w-3xl
                                    rounded-2xl
                                    border border-white/10
                                    bg-white/[0.025]
                                    px-5 py-4
                                "
                            >
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">

                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                            Your Team Power
                                        </p>

                                        <p className="mt-1 text-xl font-black text-white/70">
                                            {myTotalPower}
                                        </p>
                                    </div>


                                    <div className="h-8 w-px bg-white/10" />


                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                            Opponent Power
                                        </p>

                                        <p className="mt-1 text-xl font-black text-white/70">
                                            {opponentTotalPower}
                                        </p>
                                    </div>
                                </div>


                                {tiedPositions > 0 && (
                                    <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                                        {tiedPositions}{" "}
                                        {tiedPositions === 1
                                            ? "position tied"
                                            : "positions tied"}
                                    </p>
                                )}


                                {decidedByPowerTiebreaker &&
                                    !isDraw && (
                                        <div
                                            className="
                                                mt-4
                                                rounded-xl
                                                border border-yellow-400/20
                                                bg-yellow-500/10
                                                px-4 py-2
                                                text-center
                                            "
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-200">
                                                ⚡ Team Power Tiebreaker
                                            </p>
                                        </div>
                                    )}
                            </div>


                            <div className="mt-10">

                                {isDraw ? (
                                    <>
                                        <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30">
                                            Final Result
                                        </p>

                                        <p className="mt-2 text-6xl font-black text-white">
                                            DRAW
                                        </p>

                                        <p className="mt-3 text-sm text-white/40">
                                            Both the position score and
                                            total team power were tied.
                                        </p>
                                    </>
                                ) : iWon ? (
                                    <>
                                        <p className="text-xs font-black uppercase tracking-[0.4em] text-yellow-300/60">
                                            Winner
                                        </p>

                                        <h2
                                            className="
                                                mt-2
                                                text-7xl
                                                font-black
                                                text-yellow-300
                                                drop-shadow-[0_0_35px_rgba(250,204,21,0.65)]
                                            "
                                        >
                                            VICTORY
                                        </h2>

                                        <p className="mt-3 text-lg font-bold text-white/60">
                                            You defeated{" "}
                                            {opponentPlayer.displayName}
                                        </p>

                                        <p className="mt-2 text-sm font-black text-yellow-200/60">
                                            {myPositionWins} -{" "}
                                            {opponentPositionWins}{" "}
                                            Positions
                                        </p>

                                        {decidedByPowerTiebreaker && (
                                            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-yellow-300/45">
                                                Won by Team Power Tiebreaker
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs font-black uppercase tracking-[0.4em] text-purple-300/60">
                                            Winner
                                        </p>

                                        <h2
                                            className="
                                                mt-2
                                                text-7xl
                                                font-black
                                                text-purple-300
                                                drop-shadow-[0_0_35px_rgba(168,85,247,0.65)]
                                            "
                                        >
                                            DEFEAT
                                        </h2>

                                        <p className="mt-3 text-lg font-bold text-white/60">
                                            {opponentPlayer.displayName}{" "}
                                            wins the draft
                                        </p>

                                        <p className="mt-2 text-sm font-black text-purple-200/60">
                                            {opponentPositionWins} -{" "}
                                            {myPositionWins}{" "}
                                            Positions
                                        </p>

                                        {decidedByPowerTiebreaker && (
                                            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-purple-300/45">
                                                Lost by Team Power Tiebreaker
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleRematch}
                                    disabled={
                                        requestingRematch ||
                                        myRematchRequested ||
                                        match.status !== "complete"
                                    }
                                    className={`
                                        rounded-2xl
                                        border
                                        px-7 py-3
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
                                        border border-pink-500/30
                                        bg-pink-500/10
                                        px-7 py-3
                                        text-sm font-black
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
            </section>

            <style>{`
                    @keyframes versusReveal {
                        0% {
                            opacity: 0;
                            transform:
                                scale(0.92)
                                translateY(30px);
                            filter: blur(8px);
                        }
                
                        55% {
                            opacity: 1;
                            transform:
                                scale(1.025)
                                translateY(0);
                            filter: blur(0);
                        }
                
                        100% {
                            opacity: 1;
                            transform:
                                scale(1)
                                translateY(0);
                        }
                    }
                
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
                
                    @keyframes ascensionImpact {
                        0% {
                            opacity: 0;
                            transform: scale(2.5);
                            filter: blur(8px);
                        }
                
                        55% {
                            opacity: 1;
                            transform: scale(0.9);
                            filter: blur(0);
                        }
                
                        100% {
                            opacity: 1;
                            transform: scale(1);
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
                `}
            </style>
        </main>
    );
}