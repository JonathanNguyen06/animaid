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
    createDraftMatch,
    joinDraftMatch,
} from "@/lib/multiplayerDraft";

export default function MultiplayerDraftPage() {
    const router = useRouter();

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [roomCode, setRoomCode] =
        useState("");

    const [error, setError] =
        useState("");

    const [joining, setJoining] =
        useState(false);

    const [creating, setCreating] =
        useState(false);

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
        if (!user) return;

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

    async function handleJoinMatch() {
        if (!user) return;

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

                <button
                    type="button"
                    onClick={handleCreateMatch}
                    disabled={creating}
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
                    disabled={joining}
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