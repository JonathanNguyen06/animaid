"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import Image from "next/image";

import {
    auth,
} from "@/lib/firebase";

import {
    acceptDraftChallenge,
    deleteDraftChallenge,
    listenToIncomingDraftChallenges,
    type DraftChallenge,
} from "@/lib/draftChallenges";


export default function DraftChallengesPanel() {
    const router =
        useRouter();

    const [
        challenges,
        setChallenges,
    ] = useState<
        DraftChallenge[]
    >([]);

    const [
        actingId,
        setActingId,
    ] = useState<
        string | null
    >(null);


    useEffect(() => {
        const user =
            auth.currentUser;

        if (!user) {
            return;
        }


        return listenToIncomingDraftChallenges(
            user.uid,
            setChallenges
        );
    }, []);


    if (
        challenges.length ===
        0
    ) {
        return null;
    }


    async function handleAccept(
        challenge:
        DraftChallenge
    ) {
        const user =
            auth.currentUser;

        if (!user) {
            return;
        }


        try {
            setActingId(
                challenge.id
            );


            const code =
                await acceptDraftChallenge(
                    challenge,

                    user.uid,

                    user.displayName ??
                    "Player"
                );


            router.push(
                `/games/draft/multiplayer/${code}`
            );
        } catch (error) {
            console.error(
                "Failed to accept Draft challenge:",
                error
            );
        } finally {
            setActingId(
                null
            );
        }
    }


    async function handleDecline(
        challenge:
        DraftChallenge
    ) {
        try {
            setActingId(
                challenge.id
            );


            await deleteDraftChallenge(
                challenge.id
            );
        } finally {
            setActingId(
                null
            );
        }
    }


    return (
        <section
            className="
                mb-7
                overflow-hidden
                rounded-[2rem]
                border border-purple-400/25
                bg-gradient-to-br
                from-purple-500/[0.1]
                via-black/60
                to-pink-500/[0.08]
                p-6
                shadow-[0_0_35px_rgba(168,85,247,0.12)]
                backdrop-blur-xl
            "
        >

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300/50">
                        Multiplayer
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-white">
                        Draft Challenges
                    </h2>

                </div>


                <div className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-[10px] font-black text-pink-200">
                    {challenges.length} Pending
                </div>

            </div>


            <div className="mt-5 grid gap-3">

                {challenges.map(
                    (
                        challenge
                    ) => {
                        const acting =
                            actingId ===
                            challenge.id;


                        return (
                            <div
                                key={
                                    challenge.id
                                }
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                    rounded-2xl
                                    border border-white/10
                                    bg-black/35
                                    p-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                                            relative
                                            h-12
                                            w-12
                                            overflow-hidden
                                            rounded-2xl
                                            border border-purple-400/25
                                            bg-purple-500/10
                                        "
                                    >

                                        {challenge.fromPhotoURL ? (
                                            <Image
                                                src={
                                                    challenge.fromPhotoURL
                                                }
                                                alt={
                                                    challenge.fromUsername
                                                }
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center font-black text-purple-200">
                                                {challenge.fromUsername[0]?.toUpperCase() ??
                                                    "?"}
                                            </div>
                                        )}

                                    </div>


                                    <div>

                                        <p className="font-black text-white">
                                            @
                                            {
                                                challenge.fromUsername
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-white/35">
                                            challenged you to a Multiplayer Draft
                                        </p>

                                    </div>

                                </div>


                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            acting
                                        }
                                        onClick={() =>
                                            handleAccept(
                                                challenge
                                            )
                                        }
                                        className="
                                            rounded-xl
                                            bg-gradient-to-r
                                            from-pink-600
                                            to-purple-600
                                            px-5 py-2.5
                                            text-xs
                                            font-black
                                            text-white
                                            shadow-[0_0_18px_rgba(236,72,153,0.2)]
                                            transition
                                            hover:-translate-y-0.5
                                            disabled:opacity-50
                                            hover:cursor-pointer
                                        "
                                    >
                                        {acting
                                            ? "..."
                                            : "Accept"}
                                    </button>


                                    <button
                                        type="button"
                                        disabled={
                                            acting
                                        }
                                        onClick={() =>
                                            handleDecline(
                                                challenge
                                            )
                                        }
                                        className="
                                            rounded-xl
                                            border border-white/10
                                            bg-white/[0.03]
                                            px-5 py-2.5
                                            text-xs
                                            font-black
                                            text-white/45
                                            transition
                                            hover:cursor-pointer
                                            hover:border-red-400/25
                                            hover:bg-red-500/[0.08]
                                            hover:text-red-200
                                            disabled:opacity-50
                                        "
                                    >
                                        Decline
                                    </button>

                                </div>

                            </div>
                        );
                    }
                )}

            </div>

        </section>
    );
}