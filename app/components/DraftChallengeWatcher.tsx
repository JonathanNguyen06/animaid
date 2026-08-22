"use client";

import {
    useEffect,
    useRef,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    collection,
    deleteDoc,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";

import {
    auth,
    db,
    observeAuth,
} from "@/lib/firebase";

import {
    joinDraftMatch,
} from "@/lib/multiplayerDraft";


export default function DraftChallengeWatcher() {
    const router =
        useRouter();

    const joiningRef =
        useRef<string | null>(
            null
        );


    useEffect(() => {
        let unsubscribeChallenges:
            (() => void) |
            null =
            null;


        const unsubscribeAuth =
            observeAuth(
                (user) => {
                    if (
                        unsubscribeChallenges
                    ) {
                        unsubscribeChallenges();
                        unsubscribeChallenges =
                            null;
                    }


                    if (!user) {
                        return;
                    }


                    const outgoingQuery =
                        query(
                            collection(
                                db,
                                "draftChallenges"
                            ),

                            where(
                                "fromUid",
                                "==",
                                user.uid
                            )
                        );


                    unsubscribeChallenges =
                        onSnapshot(
                            outgoingQuery,

                            (
                                snapshot
                            ) => {
                                const accepted =
                                    snapshot.docs.find(
                                        (
                                            challengeDoc
                                        ) => {
                                            const data =
                                                challengeDoc.data();

                                            return (
                                                data.status ===
                                                "accepted" &&
                                                data.matchCode
                                            );
                                        }
                                    );


                                if (
                                    !accepted ||
                                    joiningRef.current
                                ) {
                                    return;
                                }


                                const challenge =
                                    accepted.data();

                                const code =
                                    challenge.matchCode as string;


                                joiningRef.current =
                                    accepted.id;


                                joinDraftMatch(
                                    code,

                                    user.uid,

                                    user.displayName ??
                                    "Player"
                                )
                                    .then(
                                        async () => {
                                            /*
                                             * Challenge is complete.
                                             */
                                            await deleteDoc(
                                                accepted.ref
                                            );


                                            router.push(
                                                `/games/draft/multiplayer/${code}`
                                            );
                                        }
                                    )
                                    .catch(
                                        (
                                            error
                                        ) => {
                                            console.error(
                                                "Failed to join accepted Draft challenge:",
                                                error
                                            );
                                        }
                                    )
                                    .finally(
                                        () => {
                                            joiningRef.current =
                                                null;
                                        }
                                    );
                            }
                        );
                }
            );


        return () => {
            unsubscribeAuth();

            if (
                unsubscribeChallenges
            ) {
                unsubscribeChallenges();
            }
        };
    }, [
        router,
    ]);


    return null;
}