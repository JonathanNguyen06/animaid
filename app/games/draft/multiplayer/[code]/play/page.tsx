"use client";
import {useEffect, useMemo, useRef, useState,} from "react";
import {useParams, useRouter,} from "next/navigation";
import {onAuthStateChanged, type User,} from "firebase/auth";
import {auth,} from "@/lib/firebase";
import {
    ensureDraftPlayerState,
    listenToDraftMatch,
    listenToDraftPlayerState,
    selectDraftPowerPosition,
    ensureDraftRoundCharacter,
    submitMultiplayerDraftPick, advanceDraftRoundIfReady, rerollMultiplayerDraftCharacter, selectMultiplayerAscension,
    completeDraftMatch, claimDraftForfeit, listenToDraftRoundReveal, lockDraftRoundCharacter
} from "@/lib/multiplayerDraft";
import {Ascension, ascensionInfo, draftPositions, getAscensionPreview, powerPositionInfo,} from "@/data/draftLogic";
import type {DraftMatch, MultiplayerDraftPlayerState,} from "@/types/multiplayerDraft";
import type {AnyDraftPosition, DraftPosition, PowerPosition,} from "@/data/draftCharacters";
import {draftCharacters,} from "@/data/draftCharacters";
import {listenToDraftPresence, registerDraftPresence,} from "@/lib/draftPresence";
import {DraftPick} from "@/types/draft";

export default function MultiplayerDraftPlayPage() {
    const router = useRouter();
    const params = useParams<{ code: string; }>();
    const code = params.code?.toUpperCase();
    const [user, setUser] = useState<User | null>(null);
    const [match, setMatch] = useState<DraftMatch | null>(null);
    const [playerState, setPlayerState,] = useState<MultiplayerDraftPlayerState | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [hoveredPosition, setHoveredPosition,] = useState<AnyDraftPosition | null>(null);
    const [pendingPosition, setPendingPosition,] = useState<AnyDraftPosition | null>(null);
    const [isDraggingCard, setIsDraggingCard,] = useState(false);
    const [submittingPick, setSubmittingPick,] = useState(false);
    const advancingRoundRef = useRef(false);
    const autoLockingRollRef = useRef(false);
    const [rerolling, setRerolling,] = useState(false);
    const [selectingAscension, setSelectingAscension,] = useState(false);
    const [opponentOnline, setOpponentOnline,] = useState<boolean | null>(null);
    const [disconnectSecondsRemaining, setDisconnectSecondsRemaining,] = useState<number | null>(null);
    const [processingForfeit, setProcessingForfeit,] = useState(false);
    const autoForfeitRef = useRef(false);
    const opponentOnlineRef = useRef<boolean | null>(null);
    const [opponentVisibleCharacterId, setOpponentVisibleCharacterId,] = useState<string | null>(null);
    const [lockingRoll, setLockingRoll,] = useState(false);
    const [hoveredAscension, setHoveredAscension,] = useState<Ascension | null>(null);

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

    function getPositionIcon(
        position: AnyDraftPosition
    ) {
        if (position in positionIcons) {
            return positionIcons[
                position as DraftPosition
                ];
        }

        return "⚡";
    }

    useEffect(() => {
        const unsubscribe =
            onAuthStateChanged(
                auth,
                (currentUser) => {
                    setUser(currentUser);
                }
            );

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!code) return;

        const unsubscribe =
            listenToDraftMatch(
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

        return unsubscribe;
    }, [
        code,
        router,
    ]);

    useEffect(() => {
        if (!user || !code || !match) {
            return;
        }

        const isPlayer =
            match.host.uid === user.uid ||
            match.guest?.uid === user.uid;

        if (!isPlayer) {
            router.replace(
                "/games/draft/multiplayer"
            );

            return;
        }

        async function initialize() {
            try {
                await ensureDraftPlayerState(
                    code,
                    user!.uid
                );
            } catch (error) {
                console.error(
                    "Failed to initialize player state:",
                    error
                );
            }
        }

        initialize();

        const unsubscribe =
            listenToDraftPlayerState(
                code,
                user.uid,
                (updatedState) => {
                    setPlayerState(
                        updatedState
                    );

                    if (updatedState) {
                        setLoading(false);
                    }
                }
            );

        return unsubscribe;
    }, [
        user,
        code,
        match,
        router,
    ]);

    useEffect(() => {
        opponentOnlineRef.current =
            opponentOnline;
    }, [
        opponentOnline,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match ||
            !playerState
        ) {
            return;
        }

        if (match.status !== "drafting") {
            return;
        }

        if (playerState.currentCharacterId) {
            return;
        }

        ensureDraftRoundCharacter(
            code,
            user.uid
        ).catch((error) => {
            console.error(
                "Failed to generate round character:",
                error
            );
        });
    }, [
        user,
        code,
        match,
        playerState,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match ||
            !playerState
        ) {
            return;
        }

        if (
            match.status !== "drafting"
        ) {
            return;
        }

        /*
         * Auto-lock only after the player's
         * one reroll has already been consumed.
         */
        if (!playerState.rerollUsed) {
            return;
        }

        /*
         * Wait until this round actually has
         * a character.
         */
        if (
            !playerState.currentCharacterId
        ) {
            return;
        }

        /*
         * Don't accidentally operate on a
         * character from an already-submitted
         * round.
         */
        if (
            playerState.lastSubmittedRound >=
            match.round
        ) {
            return;
        }

        const isHost =
            match.host.uid === user.uid;

        const rollAlreadyLocked =
            isHost
                ? match.hostRollLocked
                : match.guestRollLocked;

        if (rollAlreadyLocked) {
            return;
        }

        /*
         * Prevent multiple simultaneous
         * auto-lock attempts.
         */
        if (
            autoLockingRollRef.current
        ) {
            return;
        }

        autoLockingRollRef.current = true;
        setLockingRoll(true);

        lockDraftRoundCharacter(
            code,
            user.uid
        )
            .catch((error) => {
                console.error(
                    "Failed to automatically lock character:",
                    error
                );
            })
            .finally(() => {
                autoLockingRollRef.current =
                    false;

                setLockingRoll(false);
            });
    }, [
        user,
        code,

        match?.status,
        match?.round,
        match?.host.uid,
        match?.hostRollLocked,
        match?.guestRollLocked,

        playerState?.rerollUsed,
        playerState?.currentCharacterId,
        playerState?.lastSubmittedRound,
    ]);

    useEffect(() => {
        if (!user || !code || !match) {
            return;
        }

        if (match.status !== "drafting") {
            return;
        }

        // Only the host controls round advancement
        if (match.host.uid !== user.uid) {
            return;
        }

        // Both players must finish
        if (
            !match.hostSubmitted ||
            !match.guestSubmitted
        ) {
            return;
        }

        // Prevent multiple advance attempts
        if (advancingRoundRef.current) {
            return;
        }

        advancingRoundRef.current = true;

        advanceDraftRoundIfReady(
            code,
            user.uid
        )
            .catch((error) => {
                console.error(
                    "Failed to advance round:",
                    error
                );
            })
            .finally(() => {
                advancingRoundRef.current = false;
            });
    }, [
        user,
        code,
        match?.status,
        match?.round,
        match?.hostSubmitted,
        match?.guestSubmitted,
        match?.host.uid,
    ]);

    useEffect(() => {
        if (!code) {
            return;
        }

        if (
            match?.status !== "reveal" &&
            match?.status !== "complete"
        ) {
            return;
        }

        router.replace(
            `/games/draft/multiplayer/${code}/results`
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
            !match ||
            !match.guest
        ) {
            return;
        }

        const bothLocked =
            match.hostRollLocked &&
            match.guestRollLocked;

        if (!bothLocked) {
            setOpponentVisibleCharacterId(
                null
            );

            return;
        }

        const isHost =
            match.host.uid ===
            user.uid;

        const opponentUid =
            isHost
                ? match.guest.uid
                : match.host.uid;

        return listenToDraftRoundReveal(
            code,
            opponentUid,
            (reveal) => {
                /*
                 * Ignore a reveal document
                 * left over from the last round.
                 */
                if (
                    !reveal ||
                    reveal.round !==
                    match.round
                ) {
                    setOpponentVisibleCharacterId(
                        null
                    );

                    return;
                }

                setOpponentVisibleCharacterId(
                    reveal.characterId
                );
            }
        );
    }, [
        user,
        code,
        match?.round,
        match?.host.uid,
        match?.guest?.uid,
        match?.hostRollLocked,
        match?.guestRollLocked,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match ||
            !match.guest
        ) {
            return;
        }

        const isHost =
            match.host.uid === user.uid;

        const opponentUid =
            isHost
                ? match.guest.uid
                : match.host.uid;

        /*
         * Tell Firebase that WE are online.
         */
        const unregisterPresence =
            registerDraftPresence(
                code,
                user.uid
            );

        /*
         * Listen to the opponent.
         */
        const unsubscribeOpponent =
            listenToDraftPresence(
                code,
                opponentUid,
                (state) => {
                    setOpponentOnline(
                        state === "online"
                    );
                }
            );

        return () => {
            unregisterPresence();
            unsubscribeOpponent();
        };
    }, [
        user,
        code,
        match?.host.uid,
        match?.guest?.uid,
    ]);

    useEffect(() => {
        if (
            !user ||
            !code ||
            !match ||
            !match.guest
        ) {
            return;
        }

        // Capture these AFTER the null checks.
        const currentUid = user.uid;
        const currentCode = code;

        if (opponentOnline !== false) {
            setDisconnectSecondsRemaining(null);
            setProcessingForfeit(false);

            autoForfeitRef.current = false;

            return;
        }

        const activeStatuses = [
            "power-selection",
            "drafting",
            "ascension",
        ];

        if (!activeStatuses.includes(match.status)) {
            return;
        }

        const deadline =
            Date.now() + 30_000;

        autoForfeitRef.current = false;

        setProcessingForfeit(false);
        setDisconnectSecondsRemaining(30);

        async function updateCountdown() {
            const millisecondsRemaining =
                deadline - Date.now();

            const secondsRemaining =
                Math.max(
                    0,
                    Math.ceil(
                        millisecondsRemaining / 1000
                    )
                );

            setDisconnectSecondsRemaining(
                secondsRemaining
            );

            if (secondsRemaining > 0) {
                return;
            }

            if (
                opponentOnlineRef.current !==
                false
            ) {
                return;
            }

            if (autoForfeitRef.current) {
                return;
            }

            autoForfeitRef.current = true;

            setProcessingForfeit(true);

            try {
                await claimDraftForfeit(
                    currentCode,
                    currentUid
                );
            } catch (error) {
                console.error(
                    "Failed to automatically forfeit opponent:",
                    error
                );

                autoForfeitRef.current = false;

                setProcessingForfeit(false);
            }
        }

        updateCountdown();

        const interval =
            window.setInterval(
                updateCountdown,
                250
            );

        return () => {
            window.clearInterval(interval);
        };
    }, [
        user,
        code,
        opponentOnline,
        match?.status,
        match?.host.uid,
        match?.guest?.uid,
    ]);

    async function handleReroll() {
        if (
            !user ||
            !code ||
            !playerState ||
            !currentCharacter ||
            playerState.rerollUsed ||
            myRollLocked ||
            mySubmitted ||
            pendingPosition ||
            rerolling
        ) {
            return;
        }

        setRerolling(true);

        try {
            await rerollMultiplayerDraftCharacter(
                code,
                user.uid
            );
        } catch (error) {
            console.error(
                "Failed to reroll character:",
                error
            );
        } finally {
            setRerolling(false);
        }
    }

    function handleDragStart(
        event:
        React.DragEvent<HTMLDivElement>
    ) {
        if (
            !currentCharacter ||
            !bothRollsLocked ||
            pendingPosition ||
            mySubmitted
        ) {
            return;
        }

        event.dataTransfer.setData(
            "text/plain",
            currentCharacter.id
        );

        event.dataTransfer.effectAllowed =
            "move";

        setIsDraggingCard(true);
    }

    function handleDragEnd() {
        setIsDraggingCard(false);
        setHoveredPosition(null);
    }

    function handleDrop(
        event:
        React.DragEvent<HTMLDivElement>,

        position:
        AnyDraftPosition
    ) {
        event.preventDefault();

        if (
            !currentCharacter ||
            !bothRollsLocked ||
            mySubmitted ||
            filledPositions.includes(
                position
            )
        ) {
            return;
        }

        setPendingPosition(
            position
        );

        setHoveredPosition(null);

        setIsDraggingCard(false);
    }

    function cancelPendingPick() {
        setPendingPosition(null);
        setHoveredPosition(null);
        setIsDraggingCard(false);
    }

    async function handleSelectAscension(
        ascension: Ascension
    ) {
        if (
            !user ||
            !code ||
            !playerState ||
            selectingAscension ||
            playerState.selectedAscension
        ) {
            return;
        }

        setSelectingAscension(true);

        try {
            await selectMultiplayerAscension(
                code,
                user.uid,
                ascension
            );
        } catch (error) {
            console.error(
                "Failed to select Ascension:",
                error
            );

            setSelectingAscension(false);
        }
    }

    async function confirmPendingPick() {
        if (
            !user ||
            !pendingPosition ||
            submittingPick
        ) {
            return;
        }

        setSubmittingPick(true);

        try {
            await submitMultiplayerDraftPick(
                code,
                user.uid,
                pendingPosition
            );

            setPendingPosition(null);
        } catch (error) {
            console.error(
                "Failed to submit pick:",
                error
            );
        } finally {
            setSubmittingPick(false);
        }
    }

    async function handleSelectPosition(
        position: PowerPosition
    ) {
        if (
            !user ||
            !code ||
            selecting ||
            playerState?.selectedPowerPosition
        ) {
            return;
        }

        setSelecting(true);

        try {
            await selectDraftPowerPosition(
                code,
                user.uid,
                position
            );
        } catch (error) {
            console.error(
                "Failed to select Power Position:",
                error
            );

            setSelecting(false);
        }
    }

    if (
        loading ||
        !user ||
        !match ||
        !playerState
    ) {
        return (
            <main className="flex min-h-[calc(100vh-130px)] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-400" />
            </main>
        );
    }

    const currentCharacter =
        playerState.currentCharacterId
            ? draftCharacters.find(
            (character) =>
                character.id ===
                playerState.currentCharacterId
        ) ?? null
            : null;

    const isHost =
        match.host.uid === user.uid;

    const myRollLocked =
        isHost
            ? match.hostRollLocked
            : match.guestRollLocked;

    const opponentRollLocked =
        isHost
            ? match.guestRollLocked
            : match.hostRollLocked;

    const bothRollsLocked =
        match.hostRollLocked &&
        match.guestRollLocked;

    const opponentCurrentCharacter =
        opponentVisibleCharacterId
            ? draftCharacters.find(
            (character) =>
                character.id ===
                opponentVisibleCharacterId
        ) ?? null
            : null;

    async function handleLockRoll() {
        if (
            !user ||
            !code ||
            !match ||
            !playerState ||
            !playerState.currentCharacterId ||
            lockingRoll
        ) {
            return;
        }

        const isHost =
            match.host.uid ===
            user.uid;

        const alreadyLocked =
            isHost
                ? match.hostRollLocked
                : match.guestRollLocked;

        if (alreadyLocked) {
            return;
        }

        setLockingRoll(true);

        try {
            await lockDraftRoundCharacter(
                code,
                user.uid
            );
        } catch (error) {
            console.error(
                "Failed to lock round character:",
                error
            );
        } finally {
            setLockingRoll(false);
        }
    }

    const opponentAscensionSelected =
        isHost
            ? match.guestAscensionSelected
            : match.hostAscensionSelected;

    const mySubmitted =
        isHost
            ? match.hostSubmitted
            : match.guestSubmitted;

    const multiplayerPicks =
        playerState.picks ?? [];

    const ascensionPreviewPicks: DraftPick[] =
        multiplayerPicks.flatMap(
            (pick) => {
                const character =
                    draftCharacters.find(
                        (character) =>
                            character.id ===
                            pick.characterId
                    );

                if (!character) {
                    return [];
                }

                return [
                    {
                        character,

                        position:
                        pick.position,

                        basePower:
                        pick.basePower,

                        power:
                        pick.power,

                        grade:
                        pick.grade,

                        hasSynergy:
                        pick.hasSynergy,

                        ascensionBonus:
                            pick.ascensionBonus ??
                            0,
                    },
                ];
            }
        );

    const ascensionPreviews =
        new Map<
            Ascension,
            ReturnType<
                typeof getAscensionPreview
            >
        >();

    for (
        const ascension of
        playerState.ascensionChoices
        ) {
        ascensionPreviews.set(
            ascension,

            getAscensionPreview(
                ascensionPreviewPicks,
                ascension,
                playerState.selectedPowerPosition
            )
        );
    }

    const hoveredPreview =
        hoveredAscension
            ? ascensionPreviews.get(
            hoveredAscension
        ) ?? []
            : [];

    const hoveredPreviewByPosition =
        new Map(
            hoveredPreview.map(
                (preview) => [
                    preview.position,
                    preview,
                ]
            )
        );

    const isPreviewingAscension =
        hoveredAscension !== null;

    const ascensionTotalPower =
        multiplayerPicks.reduce(
            (total, pick) =>
                total + pick.power,
            0
        );

    const ascensionAveragePower =
        multiplayerPicks.length > 0
            ? Math.round(
                ascensionTotalPower /
                multiplayerPicks.length
            )
            : 0;

    const ascensionHighestPower =
        multiplayerPicks.length > 0
            ? Math.max(
                ...multiplayerPicks.map(
                    (pick) => pick.power
                )
            )
            : 0;

    const balancedFormationCount =
        multiplayerPicks.filter(
            (pick) =>
                Math.abs(
                    pick.power -
                    ascensionAveragePower
                ) <= 10
        ).length;


    const momentumCount =
        multiplayerPicks.filter(
            (pick) =>
                [
                    "A",
                    "A+",
                    "S",
                    "S+",
                ].includes(
                    pick.grade
                )
        ).length;

    const filledPositions =
        multiplayerPicks.map(
            (pick) => pick.position
        );

    const gridPositions:
        AnyDraftPosition[] =
        playerState.selectedPowerPosition
            ? [
                ...draftPositions.slice(
                    0,
                    4
                ),

                playerState
                    .selectedPowerPosition,

                ...draftPositions.slice(4),
            ]
            : [...draftPositions];

    const opponentPowerSelected =
        isHost
            ? match.guestPowerSelected
            : match.hostPowerSelected;

    const opponentName =
        isHost
            ? match.guest?.displayName ?? "Opponent"
            : match.host.displayName;

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-[1700px] px-4 py-6">

            {/* ========================================================= */}
            {/* BACKGROUND */}
            {/* ========================================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            {opponentOnline === false &&
                disconnectSecondsRemaining !== null && (
                    <div
                        className="
                            mb-5
                            overflow-hidden
                            rounded-2xl
                            border border-yellow-400/25
                            bg-yellow-500/10
                            px-5 py-4
                        "
                    >
                        <div className="flex items-center gap-3">

                            <div className="relative flex h-3 w-3 shrink-0">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-40" />

                                <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-400" />
                            </div>


                            <div className="flex-1">
                                <p className="text-sm font-black text-yellow-200">
                                    Opponent disconnected
                                </p>

                                {!processingForfeit ? (
                                    <p className="mt-0.5 text-xs text-white/45">
                                        Waiting for them to
                                        reconnect. The match will
                                        automatically end in{" "}

                                        <span className="font-black text-yellow-300">
                                {
                                    disconnectSecondsRemaining
                                }
                                            s
                            </span>
                                        .
                                    </p>
                                ) : (
                                    <p className="mt-0.5 text-xs font-semibold text-yellow-200/70">
                                        Opponent did not reconnect.
                                        Ending match...
                                    </p>
                                )}
                            </div>
                        </div>


                        {!processingForfeit && (
                            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">

                                <div
                                    className="
                                        h-full
                                        rounded-full
                                        bg-yellow-400
                                        transition-[width]
                                        duration-300
                                        ease-linear
                                    "
                                    style={{
                                        width: `${
                                            ((30 -
                                                    disconnectSecondsRemaining) /
                                                30) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}


            {/* ========================================================= */}
            {/* MAIN DRAFT PANEL */}
            {/* ========================================================= */}

            <section
                className="
                relative z-10
                rounded-3xl
                border border-pink-500/20
                bg-black/40
                p-6
                shadow-[0_0_25px_rgba(236,72,153,0.08)]
                backdrop-blur-xl
            "
            >

                {/* ===================================================== */}
                {/* HEADER */}
                {/* ===================================================== */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-300/60">
                            Multiplayer
                        </p>

                        <h1 className="mt-3 text-5xl font-black text-white">
                            Blind Anime Character Draft
                        </h1>

                        <p className="mt-3 max-w-3xl text-purple-100/70">
                            Reveal each round&apos;s character head-to-head,
                            read your opponent&apos;s draft, and strategically
                            build the stronger lineup. Positions and ratings
                            remain hidden until the final showdown.
                        </p>

                        <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-pink-300/60">
                            {match.status === "drafting"
                                ? `Round ${match.round} / 9`
                                : "Power Position Selection"}
                        </p>
                    </div>


                    {/* MATCH INFORMATION */}
                    <div className="flex shrink-0 flex-wrap gap-3">

                        {/* OPPONENT */}
                        <div
                            className="
                            min-w-[170px]
                            rounded-2xl
                            border border-purple-400/20
                            bg-purple-500/5
                            px-4 py-3
                        "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/45">
                                Opponent
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                                <span
                                    className={`
                                        h-2 w-2 rounded-full
                                        ${
                                        opponentOnline === false
                                            ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"
                                            : opponentOnline === true
                                                ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                                                : "bg-zinc-500"
                                        }
                                    `}
                                />

                                <p className="truncate text-sm font-black text-white">
                                    {opponentName}
                                </p>
                            </div>
                        </div>


                        {/* ROOM */}
                        <div
                            className="
                            rounded-2xl
                            border border-pink-400/20
                            bg-pink-500/5
                            px-4 py-3
                            text-right
                        "
                        >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-300/45">
                                Room
                            </p>

                            <p className="mt-1 font-black tracking-[0.18em] text-pink-200">
                                {code}
                            </p>
                        </div>
                    </div>
                </div>


                {/* ===================================================== */}
                {/* POWER POSITION PHASE */}
                {/* ===================================================== */}

                {match.status === "power-selection" && (
                    <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-yellow-500/5 p-6">

                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300/70">
                                Power Position
                            </p>

                            <h2 className="mt-2 text-2xl font-black text-white">
                                Choose Your Power Position
                            </h2>

                            <p className="mt-2 text-sm text-white/50">
                                Choose one special position to add to your draft.
                                Your choice stays hidden from your opponent.
                            </p>
                        </div>


                        {/* NOT SELECTED YET */}
                        {!playerState.selectedPowerPosition ? (
                            <div className="mt-6 grid gap-5 md:grid-cols-3">
                                {playerState.powerPositionChoices.map(
                                    (position) => {
                                        const info =
                                            powerPositionInfo[position];

                                        return (
                                            <button
                                                key={position}
                                                type="button"
                                                disabled={selecting}
                                                onClick={() =>
                                                    handleSelectPosition(
                                                        position
                                                    )
                                                }
                                                className="
                                                group relative overflow-hidden
                                                rounded-3xl
                                                border border-yellow-400/25
                                                bg-black/60
                                                p-6
                                                text-left
                                                transition-all duration-300
                                                hover:-translate-y-1
                                                hover:border-yellow-300/70
                                                hover:bg-yellow-500/10
                                                hover:shadow-[0_0_30px_rgba(250,204,21,0.18)]
                                                hover:cursor-pointer
                                                disabled:pointer-events-none
                                                disabled:opacity-50
                                            "
                                            >
                                                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-400/10 blur-3xl transition group-hover:bg-yellow-400/20" />

                                                <div className="relative z-10">
                                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300/60">
                                                        ⚡ Power Position
                                                    </p>

                                                    <h3 className="mt-3 text-2xl font-black text-white">
                                                        {position}
                                                    </h3>

                                                    <p className="mt-3 min-h-[60px] text-sm leading-6 text-white/55">
                                                        {info.description}
                                                    </p>

                                                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                                                            Scoring
                                                        </p>

                                                        <p className="mt-1 text-xs font-bold text-yellow-200/80">
                                                            {info.scoring}
                                                        </p>
                                                    </div>

                                                    <div className="mt-5 text-center text-xs font-black uppercase tracking-[0.2em] text-yellow-300 opacity-60 transition group-hover:opacity-100">
                                                        Select Position
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        ) : (

                            /* ========================================= */
                            /* LOCKED IN */
                            /* ========================================= */

                            <div className="mx-auto mt-6 max-w-xl">

                                <div
                                    className="
                                    relative overflow-hidden
                                    rounded-3xl
                                    border border-yellow-300/30
                                    bg-black/60
                                    p-6
                                    text-center
                                    shadow-[0_0_30px_rgba(250,204,21,0.12)]
                                "
                                >
                                    <div className="absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[60px]" />

                                    <div className="relative z-10">
                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300/60">
                                            ⚡ Locked In
                                        </p>

                                        <h3 className="mt-3 text-3xl font-black text-yellow-200 drop-shadow-[0_0_15px_rgba(250,204,21,0.35)]">
                                            {
                                                playerState.selectedPowerPosition
                                            }
                                        </h3>

                                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
                                            {
                                                powerPositionInfo[
                                                    playerState
                                                        .selectedPowerPosition
                                                    ].description
                                            }
                                        </p>


                                        <div className="mt-6 border-t border-white/10 pt-5">

                                            {opponentPowerSelected ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />

                                                    <p className="text-sm font-black text-green-300">
                                                        Opponent locked in
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="h-2 w-2 animate-pulse rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />

                                                    <p className="animate-pulse text-sm font-semibold text-white/40">
                                                        Waiting for opponent...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* ===================================================== */}
                {/* DRAFTING PHASE */}
                {/* ===================================================== */}

                {match.status === "drafting" && (
                    <div className="mt-6 grid gap-6 xl:grid-cols-[560px_1fr]">

                        {/* ================================================= */}
                        {/* LEFT SIDE */}
                        {/* CURRENT CHARACTER */}
                        {/* ================================================= */}

                        <div>

                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    Round Matchup
                                </h2>

                                <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-300/50">
                                    Round {match.round}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">

                                {/* YOUR CHARACTER */}
                                <div>
                                    <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-pink-300/60">
                                        Your Roll
                                    </p>

                                    {currentCharacter ? (
                                        <div
                                            draggable={
                                                bothRollsLocked &&
                                                !pendingPosition &&
                                                !mySubmitted
                                            }
                                            onDragStart={
                                                handleDragStart
                                            }
                                            onDragEnd={
                                                handleDragEnd
                                            }
                                            className={`
                                        relative
                                        min-h-[410px]
                                        overflow-hidden
                                        rounded-3xl
                                        border border-pink-500/30
                                        bg-black
                                        shadow-[0_0_30px_rgba(236,72,153,0.18)]
                                        transition
                                        ${
                                                mySubmitted
                                                    ? "cursor-not-allowed opacity-50"
                                                    : pendingPosition
                                                        ? "cursor-not-allowed opacity-40"
                                                        : isDraggingCard
                                                            ? "cursor-grabbing scale-95 opacity-40"
                                                            : "cursor-grab active:cursor-grabbing"
                                            }
                                    `}
                                        >
                                            <img
                                                src={currentCharacter.imageUrl}
                                                alt={currentCharacter.name}
                                                draggable={false}
                                                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />


                                            {/* ROUND BADGE */}
                                            <div
                                                className="
                                                    absolute left-4 top-4
                                                    rounded-full
                                                    border border-pink-400/30
                                                    bg-black/70
                                                    px-3 py-1.5
                                                    text-[10px] font-black
                                                    uppercase tracking-[0.2em]
                                                    text-pink-200
                                                    backdrop-blur-xl
                                                "
                                            >
                                                Round {match.round}
                                            </div>


                                            {/* PRIVATE BADGE */}
                                            <div
                                                className={`
                                                    absolute right-4 top-4
                                                    rounded-full
                                                    border
                                                    px-3 py-1.5
                                                    text-[10px] font-black
                                                    uppercase tracking-[0.2em]
                                                    backdrop-blur-xl

                                                    ${
                                                    bothRollsLocked
                                                        ? `
                                                            border-green-400/25
                                                            bg-green-500/10
                                                            text-green-300
                                                        `
                                                        : `
                                                            border-purple-400/20
                                                            bg-purple-500/10
                                                            text-purple-200
                                                        `
                                                    }
                                                `}
                                            >
                                                {bothRollsLocked
                                                    ? "⚔ Revealed"
                                                    : "🔒 Private Roll"}
                                            </div>


                                            <div className="absolute bottom-0 left-0 right-0 p-5">

                                                <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
                                                    {bothRollsLocked
                                                        ? "Drag to Position"
                                                        : myRollLocked
                                                            ? "Waiting for Opponent"
                                                            : "Reroll or Lock"}
                                                </p>
                                                <h3 className="mt-2 text-3xl font-black text-white drop-shadow">
                                                    {currentCharacter.name}
                                                </h3>

                                                <p className="text-base font-medium text-white/75">
                                                    {currentCharacter.anime}
                                                </p>
                                            </div>
                                        </div>
                                    ) : mySubmitted ? (
                                        <div className="flex min-h-[410px] flex-col items-center justify-center rounded-3xl border border-purple-400/20 bg-black/40">

                                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-400/20 bg-purple-500/10 text-2xl">
                                                ✓
                                            </div>

                                            <p className="mt-4 text-sm font-black uppercase tracking-widest text-purple-200">
                                                Pick Locked
                                            </p>

                                            <p className="mt-2 animate-pulse text-xs font-semibold text-white/35">
                                                Waiting for {opponentName}...
                                            </p>

                                        </div>
                                    ) : (
                                        <div className="flex min-h-[410px] flex-col items-center justify-center rounded-3xl border border-pink-500/20 bg-black/40">

                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-400" />

                                            <p className="mt-4 animate-pulse text-sm font-semibold text-pink-200/50">
                                                Drawing character...
                                            </p>

                                        </div>
                                    )}
                                </div>


                                {/* OPPONENT CHARACTER */}
                                <div>
                                    <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300/60">
                                        {opponentName}
                                    </p>

                                    {opponentCurrentCharacter ? (
                                        <div
                                            className="
                                                relative
                                                min-h-[410px]
                                                overflow-hidden
                                                rounded-3xl
                                                border border-purple-500/30
                                                bg-black
                                                shadow-[0_0_30px_rgba(168,85,247,0.18)]
                                                transition
                                            "
                                        >
                                            <img
                                                src={opponentCurrentCharacter.imageUrl}
                                                alt={opponentCurrentCharacter.name}
                                                draggable={false}
                                                className="
                                                    pointer-events-none
                                                    absolute inset-0
                                                    h-full w-full
                                                    object-cover
                                                    object-[50%_20%]
                                                "
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />


                                            {/* ROUND BADGE */}
                                            <div
                                                className="
                                                    absolute left-4 top-4
                                                    rounded-full
                                                    border border-purple-400/30
                                                    bg-black/70
                                                    px-3 py-1.5
                                                    text-[10px] font-black
                                                    uppercase tracking-[0.2em]
                                                    text-purple-200
                                                    backdrop-blur-xl
                                                "
                                            >
                                                Round {match.round}
                                            </div>


                                            {/* OPPONENT BADGE */}
                                            <div
                                                className="
                                                    absolute right-4 top-4
                                                    rounded-full
                                                    border border-purple-400/25
                                                    bg-purple-500/10
                                                    px-3 py-1.5
                                                    text-[10px] font-black
                                                    uppercase tracking-[0.2em]
                                                    text-purple-200
                                                    backdrop-blur-xl
                                                "
                                            >
                                                ⚔ Revealed
                                            </div>


                                            {/* CHARACTER INFO */}
                                            <div className="absolute bottom-0 left-0 right-0 p-5">

                                                <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
                                                    Opponent Roll
                                                </p>

                                                <h3 className="mt-2 text-3xl font-black text-white drop-shadow">
                                                    {opponentCurrentCharacter.name}
                                                </h3>

                                                <p className="text-base font-medium text-white/75">
                                                    {opponentCurrentCharacter.anime}
                                                </p>

                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="
                                                relative
                                                flex
                                                min-h-[410px]
                                                flex-col
                                                items-center
                                                justify-center
                                                overflow-hidden
                                                rounded-3xl
                                                border border-purple-500/20
                                                bg-black/40
                                            "
                                        >
                                            {/* ROUND BADGE */}
                                            <div
                                                className="
                                                    absolute left-4 top-4
                                                    rounded-full
                                                    border border-purple-400/20
                                                    bg-black/70
                                                    px-3 py-1.5
                                                    text-[10px] font-black
                                                    uppercase tracking-[0.2em]
                                                    text-purple-200/60
                                                    backdrop-blur-xl
                                                "
                                            >
                                                Round {match.round}
                                            </div>


                                            {/* HIDDEN ICON */}
                                            <div
                                                className="
                                                    flex h-14 w-14
                                                    items-center justify-center
                                                    rounded-full
                                                    border border-purple-400/20
                                                    bg-purple-500/10
                                                    text-2xl
                                                "
                                            >
                                                ?
                                            </div>

                                            <p className="mt-4 text-sm font-black uppercase tracking-widest text-purple-200">
                                                Opponent Roll Hidden
                                            </p>

                                            <p className="mt-2 text-center text-xs font-semibold text-white/35">
                                                {!myRollLocked
                                                    ? "Lock your character to reveal both rolls."
                                                    : !opponentRollLocked
                                                        ? `Waiting for ${opponentName}...`
                                                        : "Revealing character..."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ============================================= */}
                            {/* ROLL ACTIONS */}
                            {/* ============================================= */}

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">

                                {/* REROLL */}
                                <button
                                    type="button"
                                    onClick={handleReroll}
                                    disabled={
                                        playerState.rerollUsed ||
                                        mySubmitted ||
                                        !!pendingPosition ||
                                        rerolling ||
                                        !currentCharacter ||
                                        myRollLocked
                                    }
                                    className={`
                                        group relative
                                        overflow-hidden
                                        rounded-3xl
                                        border
                                        px-5 py-5
                                        transition-all duration-300

                                        ${
                                        playerState.rerollUsed
                                            ? `
                                                cursor-not-allowed
                                                border-zinc-300/20
                                                bg-zinc-500/10
                                                text-zinc-400
                                                opacity-70
                                            `
                                            : myRollLocked ||
                                            mySubmitted ||
                                            pendingPosition ||
                                            rerolling ||
                                            !currentCharacter
                                                ? `
                                                    cursor-not-allowed
                                                    border-yellow-400/20
                                                    bg-yellow-500/5
                                                    text-yellow-100/30
                                                    opacity-50
                                                `
                                                : `
                                                border-yellow-400
                                                bg-gradient-to-br
                                                from-yellow-300
                                                via-amber-300
                                                to-yellow-500
                                                text-purple-950
                                                shadow-[0_0_18px_rgba(250,204,21,0.45)]
                                                hover:-translate-y-1
                                                hover:cursor-pointer
                                                hover:shadow-[0_0_30px_rgba(250,204,21,0.75)]
                                            `
                                        }
                                    `}
                                >
                                    {!playerState.rerollUsed &&
                                        !myRollLocked &&
                                        !mySubmitted &&
                                        !pendingPosition && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition group-hover:opacity-100" />

                                                <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/20 blur-xl" />
                                            </>
                                        )}

                                    <div className="relative z-10 flex items-center justify-center gap-3">

                                        <span className="text-xl">
                                            {playerState.rerollUsed
                                                ? "✓"
                                                : rerolling
                                                    ? "⟳"
                                                    : "🎲"}
                                        </span>

                                        <div className="text-left">

                                            <p className="text-sm font-black uppercase tracking-widest">
                                                {playerState.rerollUsed
                                                    ? "Reroll Used"
                                                    : rerolling
                                                        ? "Rewriting Fate..."
                                                        : "Fate Rewrite"}
                                            </p>

                                            <p
                                                className={`text-xs ${
                                                    playerState.rerollUsed
                                                        ? "text-zinc-500"
                                                        : myRollLocked
                                                            ? "text-yellow-100/30"
                                                            : "text-purple-950/70"
                                                }`}
                                            >
                                                {playerState.rerollUsed
                                                    ? "No rerolls remaining"
                                                    : myRollLocked
                                                        ? "Roll already locked"
                                                        : rerolling
                                                            ? "Drawing a new character"
                                                            : "One secret chance to redraw"}
                                            </p>

                                        </div>
                                    </div>
                                </button>

                                {/* LOCK ROLL */}
                                <button
                                    type="button"
                                    onClick={handleLockRoll}
                                    disabled={
                                        myRollLocked ||
                                        lockingRoll ||
                                        playerState.rerollUsed ||
                                        !currentCharacter
                                    }
                                    className={`
                                        relative
                                        overflow-hidden
                                        rounded-3xl
                                        border
                                        px-5 py-5
                                        font-black
                                        transition-all duration-300

                                        ${
                                        myRollLocked
                                            ? `
                                                cursor-not-allowed
                                                border-green-400/25
                                                bg-green-500/10
                                                text-green-300
                                            `
                                            : `
                                                border-pink-400/40
                                                bg-gradient-to-r
                                                from-pink-600
                                                via-fuchsia-600
                                                to-purple-700
                                                text-white
                                                shadow-[0_0_25px_rgba(236,72,153,0.25)]
                                                hover:-translate-y-1
                                                hover:cursor-pointer
                                                hover:shadow-[0_0_35px_rgba(236,72,153,0.4)]
                                            `
                                        }
                                    `}
                                >
                                    <div className="flex items-center justify-center gap-3">

                                        <span className="text-xl">
                                            {myRollLocked
                                                ? "✓"
                                                : "🔒"}
                                        </span>

                                        <div className="text-left">
                                            <p className="text-sm font-black uppercase tracking-widest">
                                                {lockingRoll
                                                    ? playerState.rerollUsed
                                                        ? "Auto-Locking..."
                                                        : "Locking..."
                                                    : myRollLocked
                                                        ? opponentRollLocked
                                                            ? "Rolls Revealed"
                                                            : "Roll Locked"
                                                        : "Lock Roll"}
                                            </p>

                                            <p className="text-xs font-medium opacity-60">
                                                {lockingRoll &&
                                                playerState.rerollUsed
                                                    ? "Fate Rewrite used — locking automatically"
                                                    : myRollLocked
                                                        ? opponentRollLocked
                                                            ? "Choose where to draft your character"
                                                            : `Waiting for ${opponentName}...`
                                                        : playerState.rerollUsed
                                                            ? "Future rolls lock automatically"
                                                            : "Finalize your character for this round"}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>


                        {/* ================================================= */}
                        {/* RIGHT SIDE */}
                        {/* TEAM POSITIONS */}
                        {/* ================================================= */}

                        <div>

                            <div className="mb-4 flex items-center justify-between gap-4">

                                <h2 className="text-xl font-bold text-white">
                                    Team Positions
                                </h2>

                                <div
                                    className="
                                    rounded-full
                                    border border-pink-400/20
                                    bg-pink-500/5
                                    px-3 py-1.5
                                    text-[10px] font-black
                                    uppercase tracking-[0.2em]
                                    text-pink-300/50
                                "
                                >
                                    Your Team
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                {gridPositions.map(
                                    (position) => {
                                        const isPowerPosition =
                                            position ===
                                            playerState
                                                .selectedPowerPosition;

                                        const pick =
                                            multiplayerPicks.find(
                                                (pick) =>
                                                    pick.position ===
                                                    position
                                            );

                                        const pickedCharacter =
                                            pick
                                                ? draftCharacters.find(
                                                (character) =>
                                                    character.id ===
                                                    pick.characterId
                                            ) ?? null
                                                : null;

                                        const pendingHere =
                                            pendingPosition ===
                                            position;

                                        const isHovered =
                                            hoveredPosition ===
                                            position;

                                        return (
                                            <div
                                                key={position}
                                                onDragOver={(
                                                    event
                                                ) => {
                                                    event.preventDefault();

                                                    if (
                                                        bothRollsLocked &&
                                                        !pick &&
                                                        !pendingPosition &&
                                                        !mySubmitted
                                                    ) {
                                                        setHoveredPosition(
                                                            position
                                                        );
                                                    }
                                                }}
                                                onDragLeave={() =>
                                                    setHoveredPosition(
                                                        null
                                                    )
                                                }
                                                onDrop={(event) =>
                                                    handleDrop(
                                                        event,
                                                        position
                                                    )
                                                }
                                                className={`
                                                    min-h-[325px]
                                                    rounded-3xl
                                                    border-2 border-dashed
                                                    p-3
                                                    transition
                            
                                                    ${
                                                    isPowerPosition
                                                        ? "xl:col-start-5 xl:row-start-1 xl:row-span-2 xl:self-center"
                                                        : ""
                                                }

                                                    ${
                                                    pick
                                                        ? "border-pink-500/30 bg-black/40 backdrop-blur-xl"
                                                        : pendingHere
                                                            ? "border-yellow-400 bg-yellow-500/10 shadow-[0_0_25px_rgba(250,204,21,0.25)]"
                                                            : isHovered
                                                                ? "border-pink-400 bg-pink-500/10 shadow-[0_0_25px_rgba(236,72,153,0.25)]"
                                                                : isPowerPosition
                                                                    ? "border-yellow-400/40 bg-yellow-500/5 shadow-[0_0_25px_rgba(250,204,21,0.1)]"
                                                                    : "border-pink-500/20 bg-black/20"
                                                    }
                                                `}
                                            >
                                                <p
                                                    className={`
                                                        text-sm
                                                        font-bold
                                                        uppercase
                                                        tracking-widest
                            
                                                        ${
                                                        isPowerPosition
                                                            ? "text-yellow-300"
                                                            : "text-pink-300/60"
                                                        }
                                                    `}
                                                >
                                                    {getPositionIcon(
                                                        position
                                                    )}{" "}
                                                    {position}
                                                </p>


                                                {/* EMPTY SLOT */}
                                                {!pick &&
                                                    !pendingHere && (
                                                        <div className="mt-8 text-center text-sm font-semibold text-pink-300/60">
                                                            {mySubmitted
                                                                ? "Waiting for next round"
                                                                : "Drop character here"}
                                                        </div>
                                                    )}


                                                {/* PENDING CONFIRMATION */}
                                                {!pick &&
                                                    pendingHere &&
                                                    currentCharacter && (
                                                        <div className="relative mt-3 min-h-[255px] overflow-hidden rounded-2xl border-2 border-yellow-300 bg-black shadow-[0_0_25px_rgba(250,204,21,0.2)]">

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
                                                                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_20%]"
                                                            />

                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

                                                            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">

                                                                <p className="text-xs font-bold uppercase tracking-widest text-yellow-300">
                                                                    Confirm placement?
                                                                </p>

                                                                <h3 className="mt-2 text-xl font-black text-white drop-shadow">
                                                                    {
                                                                        currentCharacter.name
                                                                    }
                                                                </h3>

                                                                <p className="text-sm font-medium text-white/75">
                                                                    {
                                                                        currentCharacter.anime
                                                                    }
                                                                </p>

                                                                <div className="mt-4 flex flex-wrap gap-2">

                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            submittingPick
                                                                        }
                                                                        onClick={
                                                                            confirmPendingPick
                                                                        }
                                                                        className="
                                                                            rounded-xl
                                                                            bg-yellow-300
                                                                            px-4 py-2
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
                                                                        {submittingPick
                                                                            ? "Locking..."
                                                                            : "Confirm"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            submittingPick
                                                                        }
                                                                        onClick={
                                                                            cancelPendingPick
                                                                        }
                                                                        className="
                                                                            rounded-xl
                                                                            border border-white/30
                                                                            bg-white/10
                                                                            px-4 py-2
                                                                            text-sm
                                                                            font-bold
                                                                            text-white
                                                                            backdrop-blur
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
                                                {pick &&
                                                    pickedCharacter && (
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
                                                                    ? "border-pink-300 shadow-[0_0_24px_rgba(244,114,182,0.55)]"
                                                                    : "border-pink-500/30"
                                                                }
                                                            `}
                                                        >
                                                            <img
                                                                src={
                                                                    pickedCharacter.imageUrl
                                                                }
                                                                alt={
                                                                    pickedCharacter.name
                                                                }
                                                                draggable={
                                                                    false
                                                                }
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
                                                                    {
                                                                        pickedCharacter.name
                                                                    }
                                                                </h3>

                                                                <p className="text-sm font-medium text-white/75">
                                                                    {
                                                                        pickedCharacter.anime
                                                                    }
                                                                </p>

                                                                <div className="mt-3 flex items-end justify-between">

                                                                    <p className="text-3xl font-black italic text-yellow-300 drop-shadow">
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

                                                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
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
                )}

                {match.status === "ascension" && (
                    <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-yellow-500/5 p-6">

                        <div className="text-center">

                            <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300/70">
                                Team Complete
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-white">
                                Choose Your Ascension
                            </h2>

                            <p className="mt-2 text-sm text-white/50">
                                Choose one final bonus to empower your completed team.
                                Your choice remains hidden until the reveal.
                            </p>
                        </div>

                        {/* ===================================================== */}
                        {/* ASCENSION LINEUP PREVIEW */}
                        {/* ===================================================== */}

                        <div
                            className="
                                mt-7
                                overflow-hidden
                                rounded-3xl
                                border border-white/10
                                bg-black/35
                                p-5
                                shadow-[0_0_30px_rgba(0,0,0,0.18)]
                            "
                        >

                            {/* ================================================= */}
                            {/* TEAM SUMMARY */}
                            {/* ================================================= */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                    lg:flex-row
                                    lg:items-end
                                    lg:justify-between
                                "
                            >

                                <div>

                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-300/50">
                                        Your Completed Team
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black text-white">
                                        Ascension Analysis
                                    </h3>

                                    <p className="mt-1 text-sm text-white/35">
                                        Review your lineup before locking in your final bonus.
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-2">

                                    {/* TEAM POWER */}

                                    <div
                                        className="
                                            rounded-xl
                                            border border-white/10
                                            bg-white/[0.03]
                                            px-4 py-2
                                        "
                                    >
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
                                            Team Power
                                        </p>

                                        <p className="mt-0.5 text-lg font-black text-white">
                                            {ascensionTotalPower}
                                        </p>
                                    </div>


                                    {/* AVERAGE */}

                                    <div
                                        className="
                                            rounded-xl
                                            border border-purple-400/15
                                            bg-purple-500/[0.05]
                                            px-4 py-2
                                        "
                                    >
                                        <p className="text-[8px] font-black uppercase tracking-widest text-purple-300/40">
                                            Average
                                        </p>

                                        <p className="mt-0.5 text-lg font-black text-purple-200">
                                            {ascensionAveragePower}
                                        </p>
                                    </div>

                                </div>

                            </div>


                            {/* ================================================= */}
                            {/* LINEUP */}
                            {/* ================================================= */}

                            <div
                                className="
                                    mt-5
                                    grid
                                    grid-cols-2
                                    gap-3
                                    sm:grid-cols-3
                                    lg:grid-cols-5
                                    2xl:grid-cols-9
                                "
                            >

                                {multiplayerPicks.map(
                                    (pick) => {
                                        const character =
                                            draftCharacters.find(
                                                (character) =>
                                                    character.id ===
                                                    pick.characterId
                                            );

                                        const preview =
                                            hoveredPreviewByPosition.get(
                                                pick.position
                                            );

                                        const isAffected =
                                            preview?.affected ??
                                            false;

                                        if (!character) {
                                            return null;
                                        }

                                        const gradeStyle =
                                            getGradeStyle(
                                                pick.grade
                                            );

                                        return (
                                            <div
                                                key={pick.position}
                                                className={`
                                                    group
                                                    relative
                                                    min-h-[250px]
                                                    overflow-hidden
                                                    rounded-2xl
                                                    border
                                                    bg-black
                                            
                                                    transition-all
                                                    duration-300

                                                    ${
                                                    !isPreviewingAscension
                                                        ? gradeStyle.border

                                                        : isAffected
                                                            ? `
                                                                z-10
                                                                scale-[1.035]
                                                                border-yellow-300
                                                                opacity-100
                                                                ring-2
                                                                ring-yellow-300/40
                                                                shadow-[0_0_35px_rgba(250,204,21,0.55)]
                                                            `

                                                            : `
                                                                scale-[0.98]
                                                                border-white/10
                                                                opacity-30
                                                                grayscale-[0.35]
                                                            `
                                                    }
                                                `}
                                            >

                                                {/* IMAGE */}

                                                <img
                                                    src={
                                                        character.imageUrl
                                                    }
                                                    alt={
                                                        character.name
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


                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />


                                                {/* POSITION */}

                                                <div
                                                    className="
                                                        absolute
                                                        left-2
                                                        top-2
                                                        rounded-full
                                                        border border-white/10
                                                        bg-black/65
                                                        px-2
                                                        py-1
                                                        backdrop-blur-md
                                                    "
                                                >
                                                    <p className="text-[8px] font-black uppercase tracking-wider text-white/70">
                                                        {getPositionIcon(
                                                            pick.position
                                                        )}{" "}
                                                        {
                                                            pick.position
                                                        }
                                                    </p>
                                                </div>


                                                {/* CHARACTER INFO */}

                                                <div className="absolute inset-x-0 bottom-0 p-3">
                                                    <h4 className="line-clamp-1 text-sm font-black text-white">
                                                        {
                                                            character.name
                                                        }
                                                    </h4>


                                                    <p className="mt-0.5 line-clamp-1 text-[9px] font-medium text-white/45">
                                                        {
                                                            character.anime
                                                        }
                                                    </p>


                                                    <div className="mt-2 flex items-end justify-between">

                                                        <p
                                                            className={`
                                                                text-2xl
                                                                font-black
                                                                italic
                                                                ${gradeStyle.grade}
                                                            `}
                                                        >
                                                            {
                                                                pick.grade
                                                            }
                                                        </p>


                                                        <div className="text-right">

                                                            <p className="text-lg font-black text-white">
                                                                {
                                                                    pick.power
                                                                }
                                                            </p>

                                                            <p className="text-[7px] font-black uppercase tracking-widest text-white/30">
                                                                Power
                                                            </p>

                                                        </div>

                                                    </div>


                                                    {pick.hasSynergy && (
                                                        <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-pink-300">
                                                            ✦ Series Link
                                                        </p>
                                                    )}

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>


                        {!playerState.selectedAscension ? (

                            /* ============================================= */
                            /* ASCENSION CHOICES */
                            /* ============================================= */

                            <div className="mt-6 grid gap-4 md:grid-cols-3">

                                {playerState.ascensionChoices.map(
                                    (ascension) => {
                                        const info =
                                            ascensionInfo[
                                                ascension
                                                ];

                                        return (
                                            <button
                                                key={ascension}
                                                type="button"

                                                disabled={
                                                    selectingAscension
                                                }

                                                onMouseEnter={() =>
                                                    setHoveredAscension(
                                                        ascension
                                                    )
                                                }

                                                onMouseLeave={() =>
                                                    setHoveredAscension(
                                                        null
                                                    )
                                                }

                                                onFocus={() =>
                                                    setHoveredAscension(
                                                        ascension
                                                    )
                                                }

                                                onBlur={() =>
                                                    setHoveredAscension(
                                                        null
                                                    )
                                                }

                                                onClick={() =>
                                                    handleSelectAscension(
                                                        ascension
                                                    )
                                                }

                                                className="
                                                    group relative
                                                    overflow-hidden
                                                    rounded-3xl
                                                    border border-yellow-400/25
                                                    bg-black/60
                                                    p-5
                                                    text-left
                                                    transition-all duration-300

                                                    hover:-translate-y-1
                                                    hover:border-yellow-300/70
                                                    hover:bg-yellow-500/10
                                                    hover:shadow-[0_0_30px_rgba(250,204,21,0.18)]
                                                    hover:cursor-pointer

                                                    focus:border-yellow-300/70
                                                    focus:bg-yellow-500/10
                                                    focus:outline-none
                                                    focus:shadow-[0_0_30px_rgba(250,204,21,0.18)]

                                                    disabled:pointer-events-none
                                                    disabled:opacity-50
                                                "
                                            >

                                                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-yellow-400/10 blur-3xl transition group-hover:bg-yellow-400/20" />

                                                <div className="relative z-10">

                                                    <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300/60">
                                                        Ascension
                                                    </p>

                                                    <h3 className="mt-3 text-xl font-black text-white">
                                                        {ascension}
                                                    </h3>

                                                    <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/55">
                                                        {
                                                            info.description
                                                        }
                                                    </p>

                                                    <div className="mt-5 border-t border-white/[0.06] pt-4">

                                                        {(() => {
                                                            const preview =
                                                                ascensionPreviews.get(
                                                                    ascension
                                                                ) ?? [];

                                                            const affectedCount =
                                                                preview.filter(
                                                                    (item) =>
                                                                        item.affected
                                                                ).length;

                                                            return (
                                                                <div className="flex items-center justify-between gap-3">

                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                                                        {affectedCount === 0
                                                                            ? "No Current Targets"
                                                                            : `${affectedCount} Target${
                                                                                affectedCount === 1
                                                                                    ? ""
                                                                                    : "s"
                                                                            }`}
                                                                    </p>

                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-300/50">
                                                                        Preview
                                                                    </p>

                                                                </div>
                                                            );
                                                        })()}

                                                        <div className="mt-3 text-center text-xs font-black uppercase tracking-[0.2em] text-yellow-300 opacity-50 transition group-hover:opacity-100">
                                                            {selectingAscension
                                                                ? "Locking In..."
                                                                : "Hover to Preview"}
                                                        </div>

                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        ) : (

                            /* ============================================= */
                            /* LOCKED ASCENSION */
                            /* ============================================= */

                            <div className="mx-auto mt-8 max-w-xl">

                                <div
                                    className="
                                        relative overflow-hidden
                                        rounded-3xl
                                        border border-yellow-300/30
                                        bg-black/60
                                        p-7
                                        text-center
                                        shadow-[0_0_35px_rgba(250,204,21,0.15)]
                                    "
                                >

                                    <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[70px]" />

                                    <div className="relative z-10">

                                        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300/60">
                                            Ascension Locked
                                        </p>

                                        <h3 className="mt-3 text-3xl font-black text-yellow-200 drop-shadow-[0_0_18px_rgba(250,204,21,0.4)]">
                                            {
                                                playerState.selectedAscension
                                            }
                                        </h3>

                                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
                                            {
                                                ascensionInfo[
                                                    playerState
                                                        .selectedAscension
                                                    ].description
                                            }
                                        </p>

                                        <div className="mt-6 border-t border-white/10 pt-5">

                                            {opponentAscensionSelected ? (
                                                <div className="flex items-center justify-center gap-2">

                                                    <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />

                                                    <p className="text-sm font-black text-green-300">
                                                        Opponent locked in
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">

                                                    <span className="h-2 w-2 animate-pulse rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />

                                                    <p className="animate-pulse text-sm font-semibold text-white/40">
                                                        Waiting for {opponentName}...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {match.status === "reveal" && (
                    <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-black/50 p-12 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-300/30 bg-yellow-500/10 text-3xl shadow-[0_0_30px_rgba(250,204,21,0.15)]">
                            ⚔️
                        </div>

                        <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-yellow-300/60">
                            Draft Complete
                        </p>

                        <h2 className="mt-2 text-3xl font-black text-white">
                            Both Teams Are Locked
                        </h2>

                        <p className="mt-3 animate-pulse text-sm text-white/40">
                            Preparing Draft Results...
                        </p>
                    </div>
                )}


                {/* ===================================================== */}
                {/* TEMPORARY FALLBACK */}
                {/* ===================================================== */}

                {match.status !== "power-selection" &&
                    match.status !== "drafting" &&
                    match.status !== "ascension" &&
                    match.status !== "reveal" && (
                        <div className="mt-8 rounded-3xl border border-pink-500/20 bg-black/40 p-10 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/10 text-2xl">
                                ⚔️
                            </div>

                            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-pink-300/50">
                                Multiplayer Draft
                            </p>

                            <h2 className="mt-2 text-2xl font-black text-white">
                                Preparing Match
                            </h2>

                            <p className="mt-3 animate-pulse text-sm text-white/40">
                                Waiting for the next phase...
                            </p>
                        </div>
                    )}
            </section>
        </main>
    );
}