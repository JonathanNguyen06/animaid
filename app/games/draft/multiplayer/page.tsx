"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    onAuthStateChanged,
    type User,
} from "firebase/auth";

import {
    auth,
} from "@/lib/firebase";

import {
    cancelOpenDraftQueue,
    clearOpenDraftQueueEntry,
    createDraftMatch, enterOpenDraftQueue,
    joinDraftMatch, listenToOpenDraftQueue,
} from "@/lib/multiplayerDraft";

export default function MultiplayerDraftPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("");
    const [joining, setJoining] = useState(false);
    const [creating, setCreating] = useState(false);
    const [queueing, setQueueing] = useState(false);
    const [queueError, setQueueError] = useState("");

    useEffect(() => {
        const unsubscribe =
            onAuthStateChanged(
                auth,
                (currentUser) => {
                    setUser(currentUser);
                    setLoading(false);
                }
            );

        return unsubscribe;
    }, []);

    async function handleCreateMatch() {
        if (!user || queueing) return;

        setError("");
        setCreating(true);

        try {
            const code =
                await createDraftMatch(
                    user.uid,
                    user.displayName ??
                    "Player"
                );

            router.push(
                `/games/draft/multiplayer/${code}`
            );
        } catch (error) {
            console.error(error);

            setError(
                "Unable to create match."
            );

            setCreating(false);
        }
    }

    useEffect(() => {
        if (
            !user ||
            !queueing
        ) {
            return;
        }

        const unsubscribe =
            listenToOpenDraftQueue(
                user.uid,
                async (
                    matchCode
                ) => {
                    setQueueing(false);

                    try {
                        await clearOpenDraftQueueEntry(
                            user.uid
                        );
                    } catch (error) {
                        console.error(
                            "Failed to clear matched queue entry:",
                            error
                        );
                    }

                    router.push(
                        `/games/draft/multiplayer/${matchCode}`
                    );
                }
            );

        return unsubscribe;
    }, [
        user,
        queueing,
        router,
    ]);

    async function handleOpenQueue() {
        if (
            !user ||
            queueing
        ) {
            return;
        }

        setError("");
        setQueueError("");
        setQueueing(true);

        try {
            const matchCode =
                await enterOpenDraftQueue(
                    user.uid,
                    user.displayName ??
                    "Player"
                );

            /*
             * We found somebody ourselves.
             *
             * Since WE created the match,
             * we already know its code.
             */
            if (matchCode) {
                setQueueing(false);

                await clearOpenDraftQueueEntry(
                    user.uid
                ).catch(() => {});

                router.push(
                    `/games/draft/multiplayer/${matchCode}`
                );
            }
        } catch (error) {
            console.error(
                "Failed to enter open queue:",
                error
            );

            setQueueError(
                "Unable to join matchmaking."
            );

            setQueueing(false);
        }
    }

    async function handleCancelQueue() {
        if (!user) {
            return;
        }

        try {
            const matchCode =
                await cancelOpenDraftQueue(
                    user.uid
                );

            /*
             * Matchmaking beat our cancellation.
             *
             * Don't abandon the opponent.
             */
            if (matchCode) {
                setQueueing(false);

                await clearOpenDraftQueueEntry(
                    user.uid
                ).catch(() => {});

                router.push(
                    `/games/draft/multiplayer/${matchCode}`
                );

                return;
            }

            setQueueing(false);
        } catch (error) {
            console.error(
                "Failed to cancel queue:",
                error
            );

            setQueueError(
                "Unable to cancel matchmaking."
            );
        }
    }

    async function handleJoinMatch() {
        if (!user || queueing) return;

        if (!roomCode.trim()) {
            setError(
                "Enter a room code."
            );
            return;
        }

        setError("");
        setJoining(true);

        try {
            const code =
                await joinDraftMatch(
                    roomCode,
                    user.uid,
                    user.displayName ??
                    "Player"
                );

            router.push(
                `/games/draft/multiplayer/${code}`
            );
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                switch (error.message) {
                    case "MATCH_NOT_FOUND":
                        setError(
                            "That match does not exist."
                        );
                        break;

                    case "MATCH_FULL":
                        setError(
                            "That match is already full."
                        );
                        break;

                    case "MATCH_ALREADY_STARTED":
                        setError(
                            "That match has already started."
                        );
                        break;

                    case "CANNOT_JOIN_OWN_MATCH":
                        setError(
                            "You are already the host of that match."
                        );
                        break;

                    default:
                        setError(
                            "Unable to join match."
                        );
                }
            }

            setJoining(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-[calc(100vh-130px)] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-400" />
            </main>
        );
    }

    if (!user) {
        return (
            <main className="flex min-h-[calc(100vh-130px)] items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-white">
                        Sign In Required
                    </h1>

                    <p className="mt-2 text-white/50">
                        You need an account to play multiplayer.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-[calc(100vh-130px)] overflow-hidden px-4 py-10">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />
            </div>

            <section className="relative z-10 mx-auto max-w-2xl rounded-3xl border border-pink-500/20 bg-black/50 p-8 shadow-[0_0_40px_rgba(236,72,153,0.12)] backdrop-blur-xl">
                <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-300/60">
                        Anime Draft
                    </p>

                    <h1 className="mt-3 text-4xl font-black text-white">
                        Multiplayer
                    </h1>

                    <p className="mt-3 text-sm text-white/45">
                        Create a room or join another player's draft.
                    </p>
                </div>

                <div
                    className="
                        mt-8
                        overflow-hidden
                        rounded-3xl
                        border border-pink-400/25
                        bg-gradient-to-br
                        from-pink-500/10
                        via-fuchsia-500/5
                        to-purple-500/10
                        p-6
                        shadow-[0_0_30px_rgba(236,72,153,0.1)]
                    "
                >
                    {!queueing ? (
                        <>
                            <div className="text-center">
                                <div
                                    className="
                                        mx-auto
                                        flex h-14 w-14
                                        items-center justify-center
                                        rounded-2xl
                                        border border-pink-400/25
                                        bg-pink-500/10
                                        text-2xl
                                        shadow-[0_0_20px_rgba(236,72,153,0.15)]
                                    "
                                >
                                    ⚔️
                                </div>

                                <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-pink-300/60">
                                    Quick Match
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-white">
                                    Open Queue
                                </h2>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                                    Find another player looking
                                    for a draft and battle
                                    head-to-head.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleOpenQueue}
                                disabled={
                                    creating ||
                                    joining
                                }
                                className="
                                    mt-6 w-full
                                    rounded-2xl
                                    bg-gradient-to-r
                                    from-pink-600
                                    via-fuchsia-600
                                    to-purple-700
                                    px-6 py-4
                                    font-black text-white
                                    shadow-[0_0_25px_rgba(236,72,153,0.3)]
                                    transition
                                    hover:-translate-y-1
                                    hover:cursor-pointer
                                    hover:shadow-[0_0_35px_rgba(236,72,153,0.45)]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                Find Opponent
                            </button>
                        </>
                    ) : (
                        <div className="py-3 text-center">
                            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                                <div
                                    className="
                                        absolute inset-0
                                        animate-ping
                                        rounded-full
                                        border border-pink-400/30
                                    "
                                />

                                <div
                                    className="
                                        absolute inset-3
                                        animate-pulse
                                        rounded-full
                                        border border-purple-400/30
                                    "
                                />

                                <div
                                    className="
                                        h-4 w-4
                                        rounded-full
                                        bg-pink-400
                                        shadow-[0_0_20px_rgba(244,114,182,0.9)]
                                    "
                                />
                            </div>

                            <p className="mt-5 text-xs font-black uppercase tracking-[0.35em] text-pink-300/60">
                                Open Queue
                            </p>

                            <h2 className="mt-2 text-2xl font-black text-white">
                                Searching for Opponent
                            </h2>

                            <p className="mt-2 animate-pulse text-sm text-white/40">
                                Looking for another player...
                            </p>

                            <button
                                type="button"
                                onClick={handleCancelQueue}
                                className="
                                    mt-6
                                    rounded-2xl
                                    border border-white/15
                                    bg-white/5
                                    px-6 py-3
                                    text-sm font-black
                                    text-white/60
                                    transition
                                    hover:cursor-pointer
                                    hover:border-red-400/30
                                    hover:bg-red-500/10
                                    hover:text-red-200
                                "
                            >
                                Cancel Queue
                            </button>
                        </div>
                    )}

                    {queueError && (
                        <p className="mt-4 text-center text-sm font-semibold text-red-300">
                            {queueError}
                        </p>
                    )}
                </div>

                <div className="mt-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />

                    <p className="text-xs font-black uppercase tracking-widest text-white/25">
                        Private Match
                    </p>

                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                    type="button"
                    onClick={handleCreateMatch}
                    disabled={
                        creating ||
                        queueing
                    }
                    className="
                        mt-8 w-full
                        rounded-2xl
                        bg-gradient-to-r
                        from-pink-600
                        via-fuchsia-600
                        to-purple-700
                        px-6 py-4
                        font-black text-white
                        shadow-[0_0_25px_rgba(236,72,153,0.3)]
                        transition
                        hover:-translate-y-1
                        hover:cursor-pointer
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {creating
                        ? "Creating..."
                        : "Create Match"}
                </button>

                <div className="my-7 flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />

                    <p className="text-xs font-black uppercase tracking-widest text-white/25">
                        Or
                    </p>

                    <div className="h-px flex-1 bg-white/10" />
                </div>

                <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                    Room Code
                </label>

                <input
                    value={roomCode}
                    onChange={(event) =>
                        setRoomCode(
                            event.target.value
                                .toUpperCase()
                                .slice(0, 6)
                        )
                    }
                    placeholder="ABC123"
                    maxLength={6}
                    className="
                        mt-2 w-full
                        rounded-2xl
                        border border-white/10
                        bg-black/50
                        px-5 py-4
                        text-center
                        text-2xl font-black
                        uppercase
                        tracking-[0.3em]
                        text-white
                        outline-none
                        transition
                        placeholder:text-white/15
                        focus:border-pink-400/50
                        focus:shadow-[0_0_20px_rgba(236,72,153,0.12)]
                    "
                />

                <button
                    type="button"
                    onClick={handleJoinMatch}
                    disabled={
                        joining ||
                        queueing
                    }
                    className="
                        mt-4 w-full
                        rounded-2xl
                        border border-yellow-300/30
                        bg-yellow-300/10
                        px-6 py-4
                        font-black text-yellow-200
                        transition
                        hover:cursor-pointer
                        hover:border-yellow-300/60
                        hover:bg-yellow-300/15
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {joining
                        ? "Joining..."
                        : "Join Match"}
                </button>

                {error && (
                    <p className="mt-4 text-center text-sm font-semibold text-red-300">
                        {error}
                    </p>
                )}
            </section>
        </main>
    );
}