"use client";
import {useEffect, useRef, useState,} from "react";
import {useParams, useRouter, } from "next/navigation";
import type {DraftMatch,} from "@/types/multiplayerDraft";
import {
    cleanupExpiredDraftLobby,
    expireDraftLobbyIfNeeded,
    listenToDraftMatch,
    setDraftPlayerReady
} from "@/lib/multiplayerDraft";
import {onAuthStateChanged, type User,} from "firebase/auth";
import {auth,} from "@/lib/firebase";

export default function MultiplayerDraftLobbyPage() {
    const router = useRouter();

    const params = useParams<{
        code: string;
    }>();
    const [user, setUser] = useState<User | null>(null);
    const code = params.code?.toUpperCase();
    const [match, setMatch] = useState<DraftMatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [matchNotFound, setMatchNotFound] = useState(false);
    const [readySecondsRemaining, setReadySecondsRemaining,] = useState<number | null>(null);
    const expiringLobbyRef = useRef(false);
    const hadMatchRef = useRef(false);

    useEffect(() => {
        if (!code) return;


        const unsubscribe =
            listenToDraftMatch(
                code,

                (
                    updatedMatch
                ) => {
                    setLoading(
                        false
                    );


                    if (!updatedMatch) {
                        if (hadMatchRef.current) {
                            const currentUser =
                                auth.currentUser;

                            if (currentUser) {
                                cleanupExpiredDraftLobby(
                                    currentUser.uid
                                ).catch(
                                    (error) => {
                                        console.error(
                                            "Failed to clean lobby state:",
                                            error
                                        );
                                    }
                                );
                            }

                            router.replace(
                                "/games/draft/multiplayer"
                            );

                            return;
                        }

                        setMatchNotFound(true);
                        setMatch(null);

                        return;
                    }


                    hadMatchRef.current =
                        true;


                    setMatchNotFound(
                        false
                    );

                    setMatch(
                        updatedMatch
                    );
                }
            );


        return () => {
            unsubscribe();
        };
    }, [
        code,
        router,
    ]);

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
        match?.status,
        code,
        router,
    ]);

    useEffect(() => {
        if (
            !code ||
            !user ||
            !match ||
            match.status !== "lobby" ||
            !match.guest ||
            !match.lobbyReadyStartedAt
        ) {
            setReadySecondsRemaining(null);

            expiringLobbyRef.current = false;

            return;
        }

        // Capture this now so TypeScript knows
        // it can never be null inside tick().
        const currentUserUid =
            user.uid;

        const hostUid =
            match.host.uid;

        const deadline =
            match.lobbyReadyStartedAt.toMillis() +
            10_000;

        async function tick() {
            const millisecondsLeft =
                deadline -
                Date.now();


            const secondsLeft =
                Math.max(
                    0,
                    Math.ceil(
                        millisecondsLeft /
                        1000
                    )
                );


            setReadySecondsRemaining(
                secondsLeft
            );


            /*
             * UI reaches zero at 10 seconds.
             *
             * Actual deletion happens roughly
             * one second later to avoid local
             * clock vs Firestore clock races.
             */
            const DELETE_GRACE_MS =
                1000;


            if (
                millisecondsLeft >
                -DELETE_GRACE_MS
            ) {
                return;
            }


            /*
             * Only host owns lobby expiration.
             */
            const isHost =
                hostUid ===
                currentUserUid;


            if (!isHost) {
                return;
            }


            if (
                expiringLobbyRef.current
            ) {
                return;
            }


            expiringLobbyRef.current =
                true;


            try {
                await expireDraftLobbyIfNeeded(
                    code,
                    currentUserUid
                );
            } catch (error) {
                console.error(
                    "Failed to expire Draft lobby:",
                    error
                );
            } finally {
                expiringLobbyRef.current =
                    false;
            }
        }

        tick();

        const interval =
            window.setInterval(
                tick,
                250
            );

        return () => {
            window.clearInterval(
                interval
            );
        };
    }, [
        code,
        user,
        match,
    ]);

    if (loading) {
        return (
            <main className="flex min-h-[calc(100vh-130px)] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500/20 border-t-pink-400" />
            </main>
        );
    }

    if (matchNotFound || !match) {
        return (
            <main className="flex min-h-[calc(100vh-130px)] items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-white">
                        Match Not Found
                    </h1>

                    <p className="mt-2 text-white/50">
                        This draft room does not exist.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/games/draft/multiplayer"
                            )
                        }
                        className="mt-6 rounded-2xl bg-pink-600 px-6 py-3 font-black text-white hover:cursor-pointer"
                    >
                        Back
                    </button>
                </div>
            </main>
        );
    }

    const isHost =
        user?.uid === match.host.uid;

    const isGuest =
        user?.uid === match.guest?.uid;
    const myReady =
        isHost
            ? match.host.ready
            : isGuest
                ? match.guest?.ready ?? false
                : false;

    async function handleReady() {
        if (!user || !match) return;

        try {
            await setDraftPlayerReady(
                code,
                user.uid,
                !myReady
            );
        } catch (error) {
            console.error(
                "Failed to change ready state:",
                error
            );
        }
    }

    return (
        <main className="relative min-h-[calc(100vh-130px)] overflow-hidden px-4 py-10">
            {/* Background glows */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />
            </div>

            <section className="relative z-10 mx-auto max-w-4xl rounded-3xl border border-pink-500/20 bg-black/50 p-8 shadow-[0_0_40px_rgba(236,72,153,0.1)] backdrop-blur-xl">
                <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-300/60">
                        Multiplayer Draft
                    </p>

                    <h1 className="mt-3 text-4xl font-black text-white">
                        Match Lobby
                    </h1>

                    <p className="mt-3 text-sm text-white/40">
                        Room Code
                    </p>

                    <p className="mt-1 text-3xl font-black tracking-[0.25em] text-yellow-300">
                        {code}
                    </p>

                    {match.guest &&
                        match.status ===
                        "lobby" &&
                        readySecondsRemaining !==
                        null && (
                            <div
                                className="
                                    mx-auto
                                    mt-6
                                    max-w-sm
                                    rounded-2xl
                                    border
                                    border-yellow-400/20
                                    bg-yellow-500/[0.05]
                                    p-4
                                "
                            >

                                <div className="flex items-center justify-between">

                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-200/50">
                                        Ready Up
                                    </p>

                                    <p
                                        className={`
                                            text-2xl
                                            font-black
                    
                                            ${
                                            readySecondsRemaining <=
                                            3
                                                ? "text-red-300"
                                                : "text-yellow-300"
                                            }
                                        `}
                                    >
                                        {readySecondsRemaining > 0
                                            ? `${readySecondsRemaining}s`
                                            : "Expired"}
                                    </p>

                                </div>


                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">

                                    <div
                                        className={`
                                            h-full
                                            rounded-full
                                            transition-all
                                            duration-300
                    
                                            ${
                                            readySecondsRemaining <=
                                            3
                                                ? "bg-red-400"
                                                : "bg-yellow-300"
                                            }
                                        `}
                                        style={{
                                            width:
                                                `${
                                                    (
                                                        readySecondsRemaining /
                                                        10
                                                    ) *
                                                    100
                                                }%`,
                                        }}
                                    />
                                </div>

                                <p className="mt-3 text-xs font-semibold text-white/35">
                                    Both players must ready
                                    before the timer expires.
                                </p>
                            </div>
                        )}
                </div>

                <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {/* HOST */}
                    <div className="rounded-3xl border border-pink-500/20 bg-pink-500/5 p-6 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-300/60">
                            Host
                        </p>

                        <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full border border-pink-400/30 bg-pink-500/10 text-2xl">
                            👤
                        </div>

                        <h2 className="mt-4 text-xl font-black text-white">
                            {match.host.displayName}
                        </h2>

                        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/35">
                            Player 1
                        </p>
                        <div
                            className={`mx-auto mt-4 w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${
                                match.host.ready
                                    ? "border-green-400/30 bg-green-500/10 text-green-300"
                                    : "border-white/10 bg-white/5 text-white/30"
                            }`}
                        >
                            {match.host.ready
                                ? "✓ Ready"
                                : "Not Ready"}
                        </div>
                    </div>

                    {/* GUEST */}
                    <div
                        className={`
                            rounded-3xl border p-6 text-center
                            ${
                            match.guest
                                ? "border-purple-400/30 bg-purple-500/5"
                                : "border-white/10 bg-white/[0.02]"
                        }
                        `}
                    >
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300/60">
                            Opponent
                        </p>

                        <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full border border-purple-400/20 bg-purple-500/10 text-2xl">
                            {match.guest
                                ? "👤"
                                : "?"}
                        </div>

                        {match.guest ? (
                            <>
                                <h2 className="mt-4 text-xl font-black text-white">
                                    {
                                        match.guest
                                            .displayName
                                    }
                                </h2>

                                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-purple-300/50">
                                    Player 2
                                </p>
                                {match.guest && (
                                    <div
                                        className={`mx-auto mt-4 w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${
                                            match.guest.ready
                                                ? "border-green-400/30 bg-green-500/10 text-green-300"
                                                : "border-white/10 bg-white/5 text-white/30"
                                        }`}
                                    >
                                        {match.guest.ready
                                            ? "✓ Ready"
                                            : "Not Ready"}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h2 className="mt-4 text-xl font-black text-white/40">
                                    Waiting...
                                </h2>

                                <p className="mt-2 animate-pulse text-xs font-bold uppercase tracking-widest text-white/25">
                                    Waiting for opponent
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    {!match.guest ? (
                        <p className="animate-pulse text-sm font-semibold text-white/40">
                            Waiting for another player to join...
                        </p>
                    ) : (
                        <p className="text-sm font-black text-green-300">
                            ✓ Opponent connected
                        </p>
                    )}
                </div>
                    {match.guest &&
                        (isHost || isGuest) &&
                        match.status === "lobby" && (
                            <button
                                type="button"
                                onClick={handleReady}
                                disabled={
                                    readySecondsRemaining === 0
                                }
                                className={`
                                    mt-8 w-full
                                    rounded-2xl
                                    border
                                    px-6 py-4
                                    font-black
                                    transition-all duration-300
                                    hover:cursor-pointer
                                    ${
                                    myReady
                                    ? `
                                        border-green-400/40
                                        bg-green-500/10
                                        text-green-300
                                        hover:bg-green-500/20
                                        `
                                                : `
                                        border-pink-400/40
                                        bg-gradient-to-r
                                        from-pink-600
                                        via-fuchsia-600
                                        to-purple-700
                                        text-white
                                        shadow-[0_0_25px_rgba(236,72,153,0.3)]
                                        hover:-translate-y-1
                                        hover:shadow-[0_0_40px_rgba(236,72,153,0.5)]
                                        `
                                    }
                                `}
                            >
                            {myReady
                                ? "✓ Ready — Click to Cancel"
                                : "Ready Up"}
                        </button>
                    )}
                {match.status === "power-selection" && (
                    <div className="mt-8 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300/60">
                            Match Ready
                        </p>

                        <h2 className="mt-2 text-2xl font-black text-white">
                            Both Players Ready!
                        </h2>

                        <p className="mt-2 animate-pulse text-sm text-yellow-200/60">
                            Preparing draft...
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}