"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    auth,
    db,
} from "@/lib/firebase";

import {
    doc,
    getDoc,
} from "firebase/firestore";

import {
    deleteDraftChallenge,
    listenToDraftChallenge,
    sendDraftChallenge,
    type DraftChallenge,
} from "@/lib/draftChallenges";


type Props = {
    targetUser: {
        uid: string;
        username?: string;
        photoURL?: string;
    };
};


export default function ChallengeFriendButton({
                                                  targetUser,
                                              }: Props) {
    const [
        isFriend,
        setIsFriend,
    ] = useState(false);

    const [
        challenge,
        setChallenge,
    ] = useState<
        DraftChallenge |
        null
    >(null);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);


    useEffect(() => {
        const currentUser =
            auth.currentUser;

        if (
            !currentUser ||
            currentUser.uid ===
            targetUser.uid
        ) {
            return;
        }


        let unsubscribe:
            (() => void) |
            null =
            null;


        async function setup() {
            const friendSnap =
                await getDoc(
                    doc(
                        db,
                        "users",
                        currentUser!.uid,
                        "friends",
                        targetUser.uid
                    )
                );


            if (
                !friendSnap.exists()
            ) {
                setIsFriend(
                    false
                );

                return;
            }


            setIsFriend(
                true
            );


            unsubscribe =
                listenToDraftChallenge(
                    currentUser!.uid,
                    targetUser.uid,
                    setChallenge
                );
        }


        setup();


        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [
        targetUser.uid,
    ]);


    if (!isFriend) {
        return null;
    }


    async function handleChallenge() {
        const currentUser =
            auth.currentUser;

        if (!currentUser) {
            return;
        }


        setLoading(
            true
        );

        setError(
            null
        );


        try {
            /*
             * Clicking again while pending
             * cancels the challenge.
             */
            if (
                challenge?.status ===
                "pending"
            ) {
                await deleteDraftChallenge(
                    challenge.id
                );

                return;
            }


            const profileSnap =
                await getDoc(
                    doc(
                        db,
                        "users",
                        currentUser.uid
                    )
                );


            const profile =
                profileSnap.exists()
                    ? profileSnap.data()
                    : null;


            await sendDraftChallenge(
                currentUser.uid,

                profile?.username ??
                currentUser.displayName ??
                "Player",

                profile?.photoURL ??
                currentUser.photoURL ??
                "",

                targetUser.uid
            );
        } catch (error) {
            console.error(
                "Failed to challenge friend:",
                error
            );


            if (
                error instanceof
                Error &&
                error.message ===
                "CHALLENGE_ALREADY_PENDING"
            ) {
                setError(
                    "You already challenged someone."
                );
            } else {
                setError(
                    "Challenge failed"
                );
            }
        } finally {
            setLoading(
                false
            );
        }
    }


    return (
        <div className="text-right">

            <button
                type="button"
                disabled={
                    loading ||
                    challenge?.status ===
                    "accepted"
                }
                onClick={
                    handleChallenge
                }
                className={`
                    rounded-xl
                    border
                    px-4 py-2.5
                    text-xs
                    font-black
                    transition
                    hover:cursor-pointer

                    ${
                    challenge?.status ===
                    "pending"
                        ? `
                                border-yellow-400/25
                                bg-yellow-500/[0.08]
                                text-yellow-200
                                hover:bg-red-500/[0.08]
                                hover:text-red-200
                            `
                        : `
                                border-purple-400/25
                                bg-purple-500/[0.08]
                                text-purple-200
                                hover:-translate-y-0.5
                                hover:border-purple-400/50
                                hover:bg-purple-500/[0.14]
                                hover:shadow-[0_0_18px_rgba(168,85,247,0.18)]
                            `
                }

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                `}
            >

                {loading
                    ? "..."
                    : challenge?.status ===
                    "pending"
                        ? "Challenge Sent"
                        : challenge?.status ===
                        "accepted"
                            ? "Accepted"
                            : "⚔ Challenge"}

            </button>


            {error && (
                <p className="mt-1 text-[9px] font-semibold text-red-300">
                    {error}
                </p>
            )}

        </div>
    );
}