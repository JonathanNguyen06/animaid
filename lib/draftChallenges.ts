import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs, limit,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

import {
    db,
} from "@/lib/firebase";

import {
    createDraftMatch,
} from "@/lib/multiplayerDraft";


export type DraftChallenge = {
    id: string;

    fromUid: string;
    fromUsername: string;
    fromPhotoURL: string;

    toUid: string;

    status:
        | "pending"
        | "accepted";

    matchCode:
        string | null;

    createdAt?: unknown;
    acceptedAt?: unknown;
};


export type ChallengeTarget = {
    uid: string;
    username?: string;
    photoURL?: string;
};


function getChallengeId(
    fromUid: string,
    toUid: string
) {
    return `${fromUid}_${toUid}`;
}


// =============================================================
// SEND CHALLENGE
// =============================================================

export async function sendDraftChallenge(
    fromUid: string,
    fromUsername: string,
    fromPhotoURL: string,
    toUid: string
) {
    if (fromUid === toUid) {
        throw new Error(
            "CANNOT_CHALLENGE_SELF"
        );
    }


    // =========================================================
    // CHECK EXISTING OUTGOING CHALLENGES
    // =========================================================

    const outgoingQuery = query(
        collection(
            db,
            "draftChallenges"
        ),

        where(
            "fromUid",
            "==",
            fromUid
        )
    );


    const outgoingSnapshot =
        await getDocs(
            outgoingQuery
        );


    const outgoingChallenges =
        outgoingSnapshot.docs.map(
            (challengeDoc) => ({
                id:
                challengeDoc.id,

                ...challengeDoc.data(),
            } as DraftChallenge)
        );


    // Only allow one pending outgoing challenge at a time.
    const pendingChallenge =
        outgoingChallenges.find(
            (challenge) =>
                challenge.status ===
                "pending"
        );


    if (pendingChallenge) {
        throw new Error(
            "CHALLENGE_ALREADY_PENDING"
        );
    }


    // =========================================================
    // CHECK FOR AN OLD CHALLENGE TO THIS SAME PLAYER
    // =========================================================

    const existingChallenge =
        outgoingChallenges.find(
            (challenge) =>
                challenge.toUid ===
                toUid
        );


    /*
     * An accepted challenge can occasionally remain briefly
     * until the previous flow cleans it up.
     *
     * Remove it before creating a fresh challenge.
     */
    if (existingChallenge) {
        await deleteDoc(
            doc(
                db,
                "draftChallenges",
                existingChallenge.id
            )
        );
    }


    // =========================================================
    // CREATE NEW CHALLENGE
    // =========================================================

    const challengeId =
        getChallengeId(
            fromUid,
            toUid
        );


    const challengeRef = doc(
        db,
        "draftChallenges",
        challengeId
    );


    await setDoc(
        challengeRef,
        {
            fromUid,

            fromUsername,

            fromPhotoURL,

            toUid,

            status:
                "pending",

            matchCode:
                null,

            createdAt:
                serverTimestamp(),
        }
    );
}


// =============================================================
// CANCEL / DECLINE
// =============================================================

export async function deleteDraftChallenge(
    challengeId: string
) {
    await deleteDoc(
        doc(
            db,
            "draftChallenges",
            challengeId
        )
    );
}


// =============================================================
// ACCEPT
// =============================================================

export async function acceptDraftChallenge(
    challenge:
    DraftChallenge,

    acceptingUid: string,
    acceptingDisplayName: string
) {
    if (
        challenge.toUid !==
        acceptingUid
    ) {
        throw new Error(
            "NOT_CHALLENGE_RECIPIENT"
        );
    }


    /*
     * Reuse your existing normal private
     * multiplayer room creation.
     */
    const code =
        await createDraftMatch(
            acceptingUid,
            acceptingDisplayName
        );


    const challengeRef =
        doc(
            db,
            "draftChallenges",
            challenge.id
        );


    try {
        await updateDoc(
            challengeRef,
            {
                status:
                    "accepted",

                matchCode:
                code,

                acceptedAt:
                    serverTimestamp(),
            }
        );
    } catch (error) {
        /*
         * Challenge couldn't be updated.
         *
         * Clean up the room we just
         * created so it isn't orphaned.
         */
        try {
            await deleteDoc(
                doc(
                    db,
                    "draftMatches",
                    code
                )
            );
        } catch {
            // No-op cleanup failure.
        }

        throw error;
    }


    return code;
}


// =============================================================
// LISTEN TO INCOMING CHALLENGES
// =============================================================

export function listenToIncomingDraftChallenges(
    uid: string,
    onChange: (
        challenges: DraftChallenge[]
    ) => void
) {
    const challengeQuery = query(
        collection(
            db,
            "draftChallenges"
        ),
        where(
            "toUid",
            "==",
            uid
        )
    );

    return onSnapshot(
        challengeQuery,

        (snapshot) => {
            const challenges =
                snapshot.docs
                    .map(
                        (
                            challengeDoc
                        ): DraftChallenge => ({
                            id:
                            challengeDoc.id,

                            ...challengeDoc.data(),
                        } as DraftChallenge)
                    )
                    .filter(
                        (challenge) =>
                            challenge.status ===
                            "pending"
                    );

            onChange(
                challenges
            );
        },

        (error) => {
            console.error(
                "Failed to listen to incoming challenges:",
                error
            );
        }
    );
}


// =============================================================
// LISTEN TO ONE OUTGOING CHALLENGE
// =============================================================

export function listenToDraftChallenge(
    fromUid: string,
    toUid: string,
    onChange: (
        challenge:
            DraftChallenge |
            null
    ) => void
) {
    const challengeQuery = query(
        collection(
            db,
            "draftChallenges"
        ),

        where(
            "fromUid",
            "==",
            fromUid
        ),

        limit(10)
    );

    return onSnapshot(
        challengeQuery,

        (snapshot) => {
            const matchingDoc =
                snapshot.docs.find(
                    (challengeDoc) => {
                        const data =
                            challengeDoc.data();

                        return (
                            data.toUid ===
                            toUid
                        );
                    }
                );


            if (!matchingDoc) {
                onChange(
                    null
                );

                return;
            }


            onChange({
                id:
                matchingDoc.id,

                ...matchingDoc.data(),
            } as DraftChallenge);
        },

        (error) => {
            console.error(
                "Failed to listen to outgoing Draft challenge:",
                error
            );

            onChange(
                null
            );
        }
    );
}