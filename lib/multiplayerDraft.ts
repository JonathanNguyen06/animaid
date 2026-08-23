import {
    doc,
    runTransaction,
    serverTimestamp,
    onSnapshot, getDoc, query, collection, where, limit, getDocs, deleteDoc, orderBy
} from "firebase/firestore";
import type {
    DraftMatch, DraftMatchHistoryEntry, MultiplayerDraftPick, MultiplayerDraftPlayerState, MultiplayerDraftRoundReveal,
} from "@/types/multiplayerDraft";
import {db} from "./firebase";
import {
    applyAscension, Ascension,
    calculateDraftPower,
    draftPositions,
    getLetterGrade,
    getRandomAscensions,
    getRandomPowerPositions
} from "@/data/draftLogic";
import {PowerPosition, draftCharacters, AnyDraftPosition} from "@/data/draftCharacters";
import {DraftPick} from "@/types/draft";
import {getDatabase, onDisconnect, ref, remove, set} from "firebase/database";
import {get as getRealtime, serverTimestamp as realtimeServerTimestamp} from "@firebase/database";

function generateDraftCode(length = 6) {
    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(
            Math.random() * characters.length
        );

        code += characters[randomIndex];
    }

    return code;
}

export async function createDraftMatch(
    uid: string,
    displayName: string
) {
    for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateDraftCode();

        const matchRef = doc(
            db,
            "draftMatches",
            code
        );

        try {
            await runTransaction(
                db,
                async (transaction) => {
                    const existingMatch =
                        await transaction.get(matchRef);

                    if (existingMatch.exists()) {
                        throw new Error(
                            "ROOM_CODE_EXISTS"
                        );
                    }

                    transaction.set(matchRef, {
                        host: {
                            uid,
                            displayName,
                            ready: false,
                        },

                        guest: null,

                        status: "lobby",
                        round: 0,
                        gameNumber: 1,

                        hostSubmitted: false,
                        guestSubmitted: false,

                        hostPowerSelected: false,
                        guestPowerSelected: false,

                        hostAscensionSelected: false,
                        guestAscensionSelected: false,

                        hostRematchRequested: false,
                        guestRematchRequested: false,

                        hostRematchReady: false,
                        guestRematchReady: false,

                        winnerUid: null,
                        forfeitedByUid: null,
                        endReason: null,

                        hostRollLocked: false,
                        guestRollLocked: false,

                        matchmaking: "room",

                        lobbyReadyStartedAt:
                            null,

                        createdAt: serverTimestamp(),
                    });
                }
            );

            return code;
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                "ROOM_CODE_EXISTS"
            ) {
                continue;
            }

            throw error;
        }
    }

    throw new Error(
        "Could not create a draft room."
    );
}

export function listenToDraftMatch(
    code: string,
    onMatchChange: (match: DraftMatch | null) => void
) {
    const matchRef = doc(
        db,
        "draftMatches",
        code
    );

    return onSnapshot(
        matchRef,

        (snapshot) => {
            if (!snapshot.exists()) {
                onMatchChange(null);
                return;
            }

            const data = snapshot.data();

            const match: DraftMatch = {
                id: snapshot.id,
                host: data.host,
                guest: data.guest ?? null,
                status: data.status,
                round: data.round,
                hostSubmitted:
                    data.hostSubmitted ?? false,
                guestSubmitted:
                    data.guestSubmitted ?? false,
                hostPowerSelected:
                    data.hostPowerSelected ?? false,
                guestPowerSelected:
                    data.guestPowerSelected ?? false,
                hostAscensionSelected:
                    data.hostAscensionSelected ?? false,
                guestAscensionSelected:
                    data.guestAscensionSelected ?? false,
                hostRematchRequested:
                    data.hostRematchRequested ?? false,
                guestRematchRequested:
                    data.guestRematchRequested ?? false,
                hostRematchReady:
                    data.hostRematchReady ?? false,
                guestRematchReady:
                    data.guestRematchReady ?? false,
                winnerUid:
                    data.winnerUid ?? null,
                forfeitedByUid:
                    data.forfeitedByUid ?? null,
                endReason:
                    data.endReason ?? null,
                matchmaking:
                    data.matchmaking ?? "room",
                hostRollLocked:
                    data.hostRollLocked ?? false,
                guestRollLocked:
                    data.guestRollLocked ?? false,
                gameNumber:
                    data.gameNumber ?? 1,
                lobbyReadyStartedAt:
                    data.lobbyReadyStartedAt ??
                    null,
            };

            onMatchChange(match);
        },

        (error) => {
            console.error(
                "Failed to listen to draft match:",
                error
            );
        }
    );
}

type DraftQueueEntry = {
    uid: string;
    displayName: string;

    status:
        | "waiting"
        | "matched";

    matchCode: string | null;
    matchedWithUid: string | null;
};

const realtimeDb =
    getDatabase();

async function startOpenDraftQueuePresence(
    uid: string
) {
    const presenceRef =
        ref(
            realtimeDb,
            `draftQueuePresence/${uid}`
        );

    /*
     * IMPORTANT:
     *
     * Register the disconnect operation BEFORE
     * saying we're online.
     *
     * That prevents a race where the browser
     * disconnects between the two operations.
     */
    await onDisconnect(
        presenceRef
    ).remove();


    await set(
        presenceRef,
        {
            queued:
                true,

            connectedAt:
                realtimeServerTimestamp(),
        }
    );
}


async function clearOpenDraftQueuePresence(
    uid: string
) {
    const presenceRef =
        ref(
            realtimeDb,
            `draftQueuePresence/${uid}`
        );

    /*
     * We don't really care if cancelling the
     * disconnect registration fails here.
     *
     * Removing the node twice is harmless.
     */
    try {
        await onDisconnect(
            presenceRef
        ).cancel();
    } catch {
        // Ignore cleanup failure.
    }


    await remove(
        presenceRef
    );
}


async function isOpenDraftQueuePlayerConnected(
    uid: string
) {
    try {
        const snapshot =
            await getRealtime(
                ref(
                    realtimeDb,
                    `draftQueuePresence/${uid}`
                )
            );


        if (!snapshot.exists()) {
            return false;
        }


        const value =
            snapshot.val();


        return (
            value?.queued ===
            true
        );
    } catch (error) {
        console.error(
            "Failed to check queue presence:",
            error
        );

        /*
         * Fail closed.
         *
         * If we cannot prove they're online,
         * don't create a match with them.
         */
        return false;
    }
}

export async function enterOpenDraftQueue(
    uid: string,
    displayName: string
): Promise<string | null> {
    const myQueueRef = doc(
        db,
        "draftQueue",
        uid
    );


    /*
     * FIRST:
     *
     * Establish live connection presence.
     */
    await startOpenDraftQueuePresence(
        uid
    );


    try {
        /*
         * Make sure WE have a queue entry.
         *
         * The transaction prevents us from
         * overwriting a match that found us
         * at the same time.
         */
        const existingMatchCode =
            await runTransaction(
                db,
                async (
                    transaction
                ) => {
                    const snapshot =
                        await transaction.get(
                            myQueueRef
                        );


                    if (
                        snapshot.exists()
                    ) {
                        const data =
                            snapshot.data() as
                                DraftQueueEntry;


                        if (
                            data.status ===
                            "matched" &&
                            data.matchCode
                        ) {
                            return data.matchCode;
                        }


                        if (
                            data.status ===
                            "waiting"
                        ) {
                            return null;
                        }
                    }


                    transaction.set(
                        myQueueRef,
                        {
                            uid,
                            displayName,

                            status:
                                "waiting",

                            matchCode:
                                null,

                            matchedWithUid:
                                null,

                            joinedAt:
                                serverTimestamp(),
                        }
                    );


                    return null;
                }
            );


        /*
         * Somehow we were already matched.
         */
        if (existingMatchCode) {
            await clearOpenDraftQueuePresence(
                uid
            );

            return existingMatchCode;
        }


        /*
         * Search for another LIVE player.
         */
        const matchedCode =
            await tryMatchOpenDraftQueue(
                uid,
                displayName
            );


        /*
         * Once matched we are no longer
         * considered part of the open queue.
         */
        if (matchedCode) {
            await clearOpenDraftQueuePresence(
                uid
            );
        }


        return matchedCode;
    } catch (error) {
        /*
         * If entering the Firestore queue failed,
         * don't leave fake RTDB presence behind.
         */
        await clearOpenDraftQueuePresence(
            uid
        );

        throw error;
    }
}


async function tryMatchOpenDraftQueue(
    uid: string,
    displayName: string
): Promise<string | null> {
    const queueQuery =
        query(
            collection(
                db,
                "draftQueue"
            ),

            where(
                "status",
                "==",
                "waiting"
            ),

            limit(10)
        );

    const queueSnapshot =
        await getDocs(queueQuery);

    const possibleCandidates =
        queueSnapshot.docs.filter(
            (snapshot) =>
                snapshot.id !== uid
        );


    const candidatePresenceChecks =
        await Promise.all(
            possibleCandidates.map(
                async (
                    snapshot
                ) => {
                    const connected =
                        await isOpenDraftQueuePlayerConnected(
                            snapshot.id
                        );


                    return {
                        snapshot,
                        connected,
                    };
                }
            )
        );


    const candidates =
        candidatePresenceChecks
            .filter(
                ({
                     connected,
                 }) =>
                    connected
            )
            .map(
                ({
                     snapshot,
                 }) =>
                    snapshot
            );

    if (candidates.length === 0) {
        /*
         * Nobody is here yet.
         *
         * We simply stay in the queue.
         * A future player will find us.
         */
        return null;
    }

    const myQueueRef =
        doc(
            db,
            "draftQueue",
            uid
        );

    /*
     * Try candidates until one transaction succeeds.
     */
    for (
        const candidateSnapshot
        of candidates
        ) {
        const candidateUid =
            candidateSnapshot.id;

        /*
         * Recheck presence immediately before trying
         * to claim this player.
         */
        const candidateStillConnected =
            await isOpenDraftQueuePlayerConnected(
                candidateUid
            );


        if (!candidateStillConnected) {
            continue;
        }

        const candidateQueueRef =
            doc(
                db,
                "draftQueue",
                candidateUid
            );

        /*
         * Generate a fresh normal room code.
         */
        for (
            let attempt = 0;
            attempt < 5;
            attempt++
        ) {
            const code =
                generateDraftCode();

            const matchRef =
                doc(
                    db,
                    "draftMatches",
                    code
                );

            try {
                const matchedCode =
                    await runTransaction(
                        db,
                        async (
                            transaction
                        ) => {
                            /*
                             * IMPORTANT:
                             *
                             * All reads happen before writes.
                             */
                            const mySnapshot =
                                await transaction.get(
                                    myQueueRef
                                );

                            const candidateSnapshot =
                                await transaction.get(
                                    candidateQueueRef
                                );

                            const matchSnapshot =
                                await transaction.get(
                                    matchRef
                                );

                            /*
                             * Someone may have matched us
                             * while we were searching.
                             */
                            if (
                                mySnapshot.exists()
                            ) {
                                const myData =
                                    mySnapshot.data() as
                                        DraftQueueEntry;

                                if (
                                    myData.status ===
                                    "matched" &&
                                    myData.matchCode
                                ) {
                                    return myData.matchCode;
                                }
                            }

                            if (
                                !mySnapshot.exists() ||
                                !candidateSnapshot.exists()
                            ) {
                                return null;
                            }

                            const myData =
                                mySnapshot.data() as
                                    DraftQueueEntry;

                            const candidateData =
                                candidateSnapshot.data() as
                                    DraftQueueEntry;

                            /*
                             * Either player may have been
                             * claimed by another transaction.
                             */
                            if (
                                myData.status !==
                                "waiting" ||
                                candidateData.status !==
                                "waiting"
                            ) {
                                return null;
                            }

                            if (
                                candidateData.uid ===
                                uid
                            ) {
                                return null;
                            }

                            /*
                             * Extremely unlikely room-code
                             * collision.
                             */
                            if (
                                matchSnapshot.exists()
                            ) {
                                throw new Error(
                                    "ROOM_CODE_EXISTS"
                                );
                            }

                            /*
                             * The player performing the match
                             * becomes host.
                             *
                             * The waiting candidate becomes guest.
                             *
                             * After this, it is just a NORMAL
                             * DraftMatch.
                             */
                            transaction.set(
                                matchRef,
                                {
                                    matchmaking:
                                        "open",
                                    gameNumber:
                                        1,
                                    host: {
                                        uid,
                                        displayName,
                                        ready:
                                            false,
                                    },
                                    guest: {
                                        uid:
                                        candidateData.uid,

                                        displayName:
                                        candidateData.displayName,

                                        ready:
                                            false,
                                    },
                                    status:
                                        "lobby",
                                    round: 0,
                                    hostSubmitted:
                                        false,
                                    guestSubmitted:
                                        false,
                                    hostPowerSelected:
                                        false,
                                    guestPowerSelected:
                                        false,
                                    hostAscensionSelected:
                                        false,
                                    guestAscensionSelected:
                                        false,
                                    hostRematchRequested:
                                        false,
                                    guestRematchRequested:
                                        false,
                                    hostRematchReady:
                                        false,
                                    guestRematchReady:
                                        false,
                                    winnerUid:
                                        null,
                                    forfeitedByUid:
                                        null,
                                    endReason:
                                        null,
                                    createdAt:
                                        serverTimestamp(),
                                    hostRollLocked: false,
                                    guestRollLocked: false,
                                    lobbyReadyStartedAt:
                                        serverTimestamp(),
                                }
                            );

                            /*
                             * We don't need our queue entry
                             * anymore because this function
                             * already knows the match code.
                             */
                            transaction.delete(
                                myQueueRef
                            );

                            /*
                             * The OTHER player's page doesn't
                             * know the code yet.
                             *
                             * Tell their listener which match
                             * they were placed into.
                             */
                            transaction.update(
                                candidateQueueRef,
                                {
                                    status:
                                        "matched",

                                    matchCode:
                                    code,

                                    matchedWithUid:
                                    uid,
                                }
                            );

                            return code;
                        }
                    );

                if (matchedCode) {
                    return matchedCode;
                }

                /*
                 * Candidate was claimed.
                 * Try another one.
                 */
                break;
            } catch (error) {
                if (
                    error instanceof
                    Error &&
                    error.message ===
                    "ROOM_CODE_EXISTS"
                ) {
                    continue;
                }

                throw error;
            }
        }
    }

    /*
     * Everyone we found was already claimed.
     *
     * Stay queued and let the next player
     * find us.
     */
    return null;
}

export function listenToOpenDraftQueue(
    uid: string,
    onMatched: (
        matchCode: string
    ) => void
) {
    const queueRef = doc(
        db,
        "draftQueue",
        uid
    );

    /*
     * Prevent the matched snapshot from
     * being handled multiple times while
     * we're cleaning it up.
     */
    let handledMatch = false;


    return onSnapshot(
        queueRef,

        async (snapshot) => {
            if (
                !snapshot.exists() ||
                handledMatch
            ) {
                return;
            }


            const data =
                snapshot.data() as
                    DraftQueueEntry;


            if (
                data.status !== "matched" ||
                !data.matchCode
            ) {
                return;
            }


            handledMatch = true;

            const matchCode =
                data.matchCode;


            /*
             * Player was the waiting candidate.
             *
             * They now know their match code,
             * so this Firestore queue document
             * has finished its job.
             */
            try {
                await deleteDoc(
                    queueRef
                );
            } catch (error) {
                console.error(
                    "Failed to clear matched queue entry:",
                    error
                );
            }


            /*
             * They're also no longer waiting
             * in RTDB matchmaking presence.
             */
            try {
                await clearOpenDraftQueuePresence(
                    uid
                );
            } catch (error) {
                console.error(
                    "Failed to clear matched queue presence:",
                    error
                );
            }


            /*
             * NOW enter the match.
             */
            onMatched(
                matchCode
            );
        },

        (error) => {
            console.error(
                "Failed to listen to draft queue:",
                error
            );
        }
    );
}

export async function cancelOpenDraftQueue(
    uid: string
): Promise<string | null> {
    const queueRef =
        doc(
            db,
            "draftQueue",
            uid
        );


    const matchCode =
        await runTransaction(
            db,
            async (
                transaction
            ) => {
                const snapshot =
                    await transaction.get(
                        queueRef
                    );


                if (!snapshot.exists()) {
                    return null;
                }


                const data =
                    snapshot.data() as
                        DraftQueueEntry;


                /*
                 * Match already won the race.
                 */
                if (
                    data.status ===
                    "matched" &&
                    data.matchCode
                ) {
                    return data.matchCode;
                }


                transaction.delete(
                    queueRef
                );


                return null;
            }
        );


    await clearOpenDraftQueuePresence(
        uid
    );


    return matchCode;
}

export async function clearOpenDraftQueueEntry(
    uid: string
) {
    const queueRef =
        doc(
            db,
            "draftQueue",
            uid
        );


    await Promise.all([
        deleteDoc(
            queueRef
        ),

        clearOpenDraftQueuePresence(
            uid
        ),
    ]);
}

export async function joinDraftMatch(
    code: string,
    uid: string,
    displayName: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(matchRef);

            if (!matchSnapshot.exists()) {
                throw new Error("MATCH_NOT_FOUND");
            }

            const match =
                matchSnapshot.data();

            if (match.status !== "lobby") {
                throw new Error(
                    "MATCH_ALREADY_STARTED"
                );
            }

            if (match.host.uid === uid) {
                throw new Error(
                    "CANNOT_JOIN_OWN_MATCH"
                );
            }

            if (match.guest) {
                throw new Error(
                    "MATCH_FULL"
                );
            }

            transaction.update(
                matchRef,
                {
                    guest: {
                        uid,
                        displayName,
                        ready: false,
                    },

                    lobbyReadyStartedAt:
                        serverTimestamp(),
                }
            );
        }
    );

    return normalizedCode;
}

export async function setDraftPlayerReady(
    code: string,
    uid: string,
    ready: boolean
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(matchRef);

            if (!snapshot.exists()) {
                throw new Error("MATCH_NOT_FOUND");
            }

            const match = snapshot.data();

            if (match.status !== "lobby") {
                throw new Error(
                    "MATCH_ALREADY_STARTED"
                );
            }

            if (!match.guest) {
                throw new Error(
                    "WAITING_FOR_OPPONENT"
                );
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest.uid === uid;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            const hostReady =
                isHost
                    ? ready
                    : match.host.ready;

            const guestReady =
                isGuest
                    ? ready
                    : match.guest.ready;

            const updates: Record<string, unknown> = {};

            if (isHost) {
                updates["host.ready"] = ready;
            }

            if (isGuest) {
                updates["guest.ready"] = ready;
            }

            // If both players are now ready,
            // move the match forward.
            if (hostReady && guestReady) {
                updates.status =
                    "power-selection";
            }

            transaction.update(
                matchRef,
                updates
            );
        }
    );
}

export async function ensureDraftPlayerState(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(
                    playerStateRef
                );

            // Already created?
            // Do nothing.
            if (snapshot.exists()) {
                return;
            }

            const powerPositionChoices =
                getRandomPowerPositions(3);

            const ascensionChoices =
                getRandomAscensions(3);

            transaction.set(
                playerStateRef,
                {
                    uid,

                    powerPositionChoices,

                    selectedPowerPosition:
                        null,

                    currentCharacterId:
                        null,

                    usedCharacterIds:
                        [],

                    picks:
                        [],

                    lastSubmittedRound:
                        0,

                    rerollUsed:
                        false,

                    ascensionChoices,

                    selectedAscension:
                        null,

                    createdAt:
                        serverTimestamp(),
                }
            );
        }
    );
}

export function listenToDraftPlayerState(
    code: string,
    uid: string,
    onChange: (
        state:
            | MultiplayerDraftPlayerState
            | null
    ) => void
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    return onSnapshot(
        playerStateRef,
        (snapshot) => {
            if (!snapshot.exists()) {
                onChange(null);
                return;
            }

            onChange(
                snapshot.data() as
                    MultiplayerDraftPlayerState
            );
        }
    );
}

export async function selectDraftPowerPosition(
    code: string,
    uid: string,
    position: PowerPosition
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(matchRef);

            const playerSnapshot =
                await transaction.get(
                    playerStateRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            if (!playerSnapshot.exists()) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

            const playerState =
                playerSnapshot.data();

            // Make sure we're actually
            // in Power Position phase.
            if (
                match.status !==
                "power-selection"
            ) {
                throw new Error(
                    "INVALID_MATCH_PHASE"
                );
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            // Prevent changing your choice
            // after you've locked it in.
            if (
                playerState.selectedPowerPosition
            ) {
                throw new Error(
                    "POWER_POSITION_ALREADY_SELECTED"
                );
            }

            // Make sure the player actually
            // received this choice.
            if (
                !playerState
                    .powerPositionChoices
                    .includes(position)
            ) {
                throw new Error(
                    "INVALID_POWER_POSITION"
                );
            }

            /*
             * Figure out what the two
             * selection states will look like
             * AFTER this player chooses.
             */

            const hostPowerSelected =
                isHost
                    ? true
                    : match.hostPowerSelected ??
                    false;

            const guestPowerSelected =
                isGuest
                    ? true
                    : match.guestPowerSelected ??
                    false;

            /*
             * PRIVATE UPDATE
             *
             * Only this player can see
             * which position they chose.
             */

            transaction.update(
                playerStateRef,
                {
                    selectedPowerPosition:
                    position,
                }
            );

            /*
             * PUBLIC UPDATE
             *
             * Everyone can know that
             * the player finished choosing.
             */

            const matchUpdates:
                Record<string, unknown> = {};

            if (isHost) {
                matchUpdates.hostPowerSelected =
                    true;
            }

            if (isGuest) {
                matchUpdates.guestPowerSelected =
                    true;
            }

            /*
             * If both players have now
             * selected, begin Round 1.
             */

            if (
                hostPowerSelected &&
                guestPowerSelected
            ) {
                matchUpdates.status =
                    "drafting";

                matchUpdates.round = 1;
            }

            transaction.update(
                matchRef,
                matchUpdates
            );
        }
    );
}

function getRandomUnusedCharacterId(
    usedCharacterIds: string[]
) {
    const availableCharacters =
        draftCharacters.filter(
            (character) =>
                !usedCharacterIds.includes(
                    character.id
                )
        );

    if (availableCharacters.length === 0) {
        throw new Error(
            "NO_CHARACTERS_AVAILABLE"
        );
    }

    const randomCharacter =
        availableCharacters[
            Math.floor(
                Math.random() *
                availableCharacters.length
            )
            ];

    return randomCharacter.id;
}

export async function ensureDraftRoundCharacter(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(matchRef);

            const playerSnapshot =
                await transaction.get(
                    playerStateRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            if (!playerSnapshot.exists()) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

            const playerState =
                playerSnapshot.data();

            if (
                match.status !== "drafting"
            ) {
                return;
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            const alreadySubmitted =
                isHost
                    ? match.hostSubmitted
                    : match.guestSubmitted;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            /*
             * Character already exists?
             *
             * Do NOTHING.
             *
             * This prevents refreshing the
             * page from generating a new one.
             */
            if (
                playerState.currentCharacterId
            ) {
                return;
            }

            if (alreadySubmitted) {
                return;
            }

            if (
                (playerState.lastSubmittedRound ?? 0)
                >= match.round
            ) {
                return;
            }

            if (playerState.currentCharacterId) {
                return;
            }

            const usedCharacterIds =
                playerState.usedCharacterIds ??
                [];

            const characterId =
                getRandomUnusedCharacterId(
                    usedCharacterIds
                );

            transaction.update(
                playerStateRef,
                {
                    currentCharacterId:
                    characterId,
                }
            );
        }
    );
}

function applyMultiplayerSynergyBonuses(
    picks: MultiplayerDraftPick[]
) {
    const animeCounts =
        picks.reduce<Record<string, number>>(
            (counts, pick) => {
                const character =
                    draftCharacters.find(
                        (character) =>
                            character.id ===
                            pick.characterId
                    );

                if (!character) {
                    return counts;
                }

                counts[character.anime] =
                    (counts[character.anime] ?? 0) +
                    1;

                return counts;
            },
            {}
        );

    return picks.map((pick) => {
        const character =
            draftCharacters.find(
                (character) =>
                    character.id ===
                    pick.characterId
            );

        if (!character) {
            return pick;
        }

        const sameAnimeCount =
            animeCounts[character.anime] ?? 1;

        const hasSynergy =
            sameAnimeCount >= 2;

        const synergyBonus =
            hasSynergy
                ? Math.min(
                    sameAnimeCount - 1,
                    3
                )
                : 0;

        const power =
            Math.min(
                99,
                pick.basePower +
                synergyBonus
            );

        return {
            ...pick,

            power,

            grade:
                getLetterGrade(power),

            hasSynergy,
        };
    });
}

export async function submitMultiplayerDraftPick(
    code: string,
    uid: string,
    position: AnyDraftPosition
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(
                    matchRef
                );

            const playerSnapshot =
                await transaction.get(
                    playerStateRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            if (!playerSnapshot.exists()) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

            const playerState =
                playerSnapshot.data();

            if (
                match.status !==
                "drafting"
            ) {
                if (
                    !match.hostRollLocked ||
                    !match.guestRollLocked
                ) {
                    throw new Error(
                        "ROLLS_NOT_REVEALED"
                    );
                }
                throw new Error(
                    "NOT_DRAFTING"
                );
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            const alreadySubmitted =
                isHost
                    ? match.hostSubmitted
                    : match.guestSubmitted;

            if (alreadySubmitted) {
                throw new Error(
                    "ALREADY_SUBMITTED"
                );
            }

            if (
                !playerState.currentCharacterId
            ) {
                throw new Error(
                    "NO_CURRENT_CHARACTER"
                );
            }

            if (
                !playerState.selectedPowerPosition
            ) {
                throw new Error(
                    "NO_POWER_POSITION"
                );
            }

            const availablePositions:
                AnyDraftPosition[] = [
                ...draftPositions,
                playerState
                    .selectedPowerPosition,
            ];

            if (
                !availablePositions.includes(
                    position
                )
            ) {
                throw new Error(
                    "INVALID_POSITION"
                );
            }

            const existingPicks:
                MultiplayerDraftPick[] =
                playerState.picks ?? [];

            if (
                existingPicks.some(
                    (pick) =>
                        pick.position ===
                        position
                )
            ) {
                throw new Error(
                    "POSITION_ALREADY_FILLED"
                );
            }

            const character =
                draftCharacters.find(
                    (character) =>
                        character.id ===
                        playerState.currentCharacterId
                );

            if (!character) {
                throw new Error(
                    "CHARACTER_NOT_FOUND"
                );
            }

            const basePower =
                calculateDraftPower(
                    character,
                    position
                );

            const newPick:
                MultiplayerDraftPick = {
                characterId:
                character.id,

                position,

                basePower,

                power:
                basePower,

                grade:
                    getLetterGrade(
                        basePower
                    ),

                hasSynergy:
                    false,
            };

            const updatedPicks =
                applyMultiplayerSynergyBonuses(
                    [
                        ...existingPicks,
                        newPick,
                    ]
                );

            const usedCharacterIds =
                Array.from(
                    new Set([
                        ...(playerState
                                .usedCharacterIds ??
                            []),

                        character.id,
                    ])
                );

            /*
             * PRIVATE:
             * Save this player's pick.
             */
            transaction.update(
                playerStateRef,
                {
                    picks:
                    updatedPicks,

                    usedCharacterIds,

                    currentCharacterId:
                        null,

                    lastSubmittedRound:
                    match.round,
                }
            );

            /*
             * PUBLIC:
             * Only say that this player
             * finished the round.
             */
            transaction.update(
                matchRef,
                isHost
                    ? {
                        hostSubmitted:
                            true,
                    }
                    : {
                        guestSubmitted:
                            true,
                    }
            );
        }
    );
}

export async function advanceDraftRoundIfReady(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(
                    matchRef
                );

            if (!snapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            const match =
                snapshot.data();

            if (
                match.status !==
                "drafting"
            ) {
                return;
            }

            const isHost =
                match.host.uid === uid;

            if (!isHost) {
                throw new Error(
                    "ONLY_HOST_CAN_ADVANCE"
                );
            }

            if (
                !match.hostSubmitted ||
                !match.guestSubmitted
            ) {
                return;
            }

            /*
             * Round 9 complete.
             */
            if (match.round >= 9) {
                transaction.update(
                    matchRef,
                    {
                        hostSubmitted:
                            false,

                        guestSubmitted:
                            false,

                        status:
                            "ascension",
                    }
                );

                return;
            }

            /*
             * Move everyone to
             * the next round.
             */
            transaction.update(
                matchRef,
                {
                    round:
                        match.round + 1,

                    hostRollLocked:
                        false,

                    guestRollLocked:
                        false,

                    hostSubmitted:
                        false,

                    guestSubmitted:
                        false,
                }
            );
        }
    );
}

export async function rerollMultiplayerDraftCharacter(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(matchRef);

            const playerSnapshot =
                await transaction.get(
                    playerStateRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            if (!playerSnapshot.exists()) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

            const playerState =
                playerSnapshot.data();

            if (match.status !== "drafting") {
                throw new Error(
                    "NOT_DRAFTING"
                );
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            const rollLocked =
                isHost
                    ? match.hostRollLocked
                    : match.guestRollLocked;

            if (rollLocked) {
                throw new Error(
                    "ROLL_ALREADY_LOCKED"
                );
            }

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            const alreadySubmitted =
                isHost
                    ? match.hostSubmitted
                    : match.guestSubmitted;

            if (alreadySubmitted) {
                throw new Error(
                    "ALREADY_SUBMITTED"
                );
            }

            if (playerState.rerollUsed) {
                throw new Error(
                    "REROLL_ALREADY_USED"
                );
            }

            if (
                !playerState.currentCharacterId
            ) {
                throw new Error(
                    "NO_CURRENT_CHARACTER"
                );
            }

            /*
             * Also exclude the character
             * we're throwing away.
             */
            const blockedIds = Array.from(
                new Set([
                    ...(playerState
                        .usedCharacterIds ?? []),

                    playerState
                        .currentCharacterId,
                ])
            );

            const newCharacterId =
                getRandomUnusedCharacterId(
                    blockedIds
                );

            transaction.update(
                playerStateRef,
                {
                    currentCharacterId:
                    newCharacterId,

                    /*
                     * Save the discarded
                     * character here so it
                     * cannot appear again.
                     */
                    usedCharacterIds:
                    blockedIds,

                    rerollUsed:
                        true,
                }
            );
        }
    );
}

export async function selectMultiplayerAscension(
    code: string,
    uid: string,
    ascension: Ascension
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(
                    matchRef
                );

            const playerSnapshot =
                await transaction.get(
                    playerStateRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            if (!playerSnapshot.exists()) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

            const playerState =
                playerSnapshot.data();

            if (
                match.status !==
                "ascension"
            ) {
                throw new Error(
                    "NOT_ASCENSION_PHASE"
                );
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            const publicAscensionAlreadySelected =
                isHost
                    ? match.hostAscensionSelected ===
                    true
                    : match.guestAscensionSelected ===
                    true;


            if (
                playerState.selectedAscension ||
                publicAscensionAlreadySelected
            ) {
                /*
                 * Idempotent no-op.
                 *
                 * A stale timer or double click may
                 * arrive after the choice succeeded.
                 */
                return;
            }

            if (
                !playerState
                    .ascensionChoices
                    ?.includes(ascension)
            ) {
                throw new Error(
                    "INVALID_ASCENSION"
                );
            }

            if (
                !playerState
                    .selectedPowerPosition
            ) {
                throw new Error(
                    "NO_POWER_POSITION"
                );
            }

            const multiplayerPicks:
                MultiplayerDraftPick[] =
                playerState.picks ?? [];

            if (
                multiplayerPicks.length !==
                9
            ) {
                throw new Error(
                    "DRAFT_NOT_COMPLETE"
                );
            }

            /*
             * Turn our smaller multiplayer
             * picks back into normal DraftPick
             * objects so we can reuse your
             * existing applyAscension().
             */

            const normalPicks:
                DraftPick[] =
                multiplayerPicks.map(
                    (pick) => {
                        const character =
                            draftCharacters.find(
                                (character) =>
                                    character.id ===
                                    pick.characterId
                            );

                        if (!character) {
                            throw new Error(
                                "CHARACTER_NOT_FOUND"
                            );
                        }

                        return {
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
                        };
                    }
                );

            /*
             * Reuse your SOLO Ascension logic.
             */

            const ascendedPicks =
                applyAscension(
                    normalPicks,
                    ascension,
                    playerState
                        .selectedPowerPosition
                );

            /*
             * Convert them back into our
             * smaller Firestore format.
             */

            const updatedPicks:
                MultiplayerDraftPick[] =
                ascendedPicks.map(
                    (pick) => ({
                        characterId:
                        pick.character.id,

                        position:
                        pick.position,

                        basePower:
                        pick.basePower,

                        power:
                        pick.power,

                        grade:
                        pick.grade,

                        hasSynergy:
                            pick.hasSynergy ??
                            false,

                        ascensionBonus:
                            pick.ascensionBonus ??
                            0,
                    })
                );

            /*
             * PRIVATE DATA
             */

            transaction.update(
                playerStateRef,
                {
                    selectedAscension:
                    ascension,

                    picks:
                    updatedPicks,
                }
            );


            /*
             * PUBLIC DATA
             *
             * Selecting an Ascension ONLY marks
             * this player as finished.
             *
             * A separate host-controlled function
             * will move the match to reveal once
             * both players are done.
             */

            transaction.update(
                matchRef,
                isHost
                    ? {
                        hostAscensionSelected:
                            true,
                    }
                    : {
                        guestAscensionSelected:
                            true,
                    }
            );
        }
    );
}

export async function advanceDraftAscensionIfReady(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );


    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(
                    matchRef
                );


            if (!snapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }


            const match =
                snapshot.data();


            /*
             * It may already have been
             * advanced by another render.
             */
            if (
                match.status !==
                "ascension"
            ) {
                return;
            }


            /*
             * Only host controls public
             * phase advancement.
             */
            if (
                match.host.uid !==
                uid
            ) {
                return;
            }


            /*
             * Don't advance until both
             * private choices are finished.
             */
            if (
                !match.hostAscensionSelected ||
                !match.guestAscensionSelected
            ) {
                return;
            }


            transaction.update(
                matchRef,
                {
                    status:
                        "reveal",
                }
            );
        }
    );
}

export async function completeDraftMatch(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(
                    matchRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

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
                throw new Error(
                    "NOT_REVEAL_PHASE"
                );
            }

            if (
                match.host.uid !== uid
            ) {
                throw new Error(
                    "ONLY_HOST_CAN_COMPLETE"
                );
            }

            if (
                !match.guest
            ) {
                throw new Error(
                    "NO_OPPONENT"
                );
            }

            if (
                !match.hostAscensionSelected ||
                !match.guestAscensionSelected
            ) {
                throw new Error(
                    "ASCENSIONS_NOT_COMPLETE"
                );
            }


            const hostStateRef =
                doc(
                    db,
                    "draftMatches",
                    normalizedCode,
                    "playerStates",
                    match.host.uid
                );

            const guestStateRef =
                doc(
                    db,
                    "draftMatches",
                    normalizedCode,
                    "playerStates",
                    match.guest.uid
                );


            const hostStateSnapshot =
                await transaction.get(
                    hostStateRef
                );

            const guestStateSnapshot =
                await transaction.get(
                    guestStateRef
                );


            if (
                !hostStateSnapshot.exists() ||
                !guestStateSnapshot.exists()
            ) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }


            const hostState =
                hostStateSnapshot.data() as
                    MultiplayerDraftPlayerState;

            const guestState =
                guestStateSnapshot.data() as
                    MultiplayerDraftPlayerState;


            let hostPositionWins = 0;
            let guestPositionWins = 0;


            /*
             * Compare the 8 normal positions.
             */
            for (
                const position
                of draftPositions
                ) {
                const hostPick =
                    hostState.picks.find(
                        (pick) =>
                            pick.position ===
                            position
                    );

                const guestPick =
                    guestState.picks.find(
                        (pick) =>
                            pick.position ===
                            position
                    );

                if (
                    !hostPick ||
                    !guestPick
                ) {
                    throw new Error(
                        "INCOMPLETE_DRAFT"
                    );
                }

                if (
                    hostPick.power >
                    guestPick.power
                ) {
                    hostPositionWins++;
                } else if (
                    guestPick.power >
                    hostPick.power
                ) {
                    guestPositionWins++;
                }
            }


            /*
             * Compare the Power Positions.
             *
             * They don't have to be the same
             * position type. This is simply
             * Power Position vs Power Position.
             */
            const hostPowerPick =
                hostState.picks.find(
                    (pick) =>
                        pick.position ===
                        hostState
                            .selectedPowerPosition
                );

            const guestPowerPick =
                guestState.picks.find(
                    (pick) =>
                        pick.position ===
                        guestState
                            .selectedPowerPosition
                );


            if (
                !hostPowerPick ||
                !guestPowerPick
            ) {
                throw new Error(
                    "POWER_POSITION_MISSING"
                );
            }


            if (
                hostPowerPick.power >
                guestPowerPick.power
            ) {
                hostPositionWins++;
            } else if (
                guestPowerPick.power >
                hostPowerPick.power
            ) {
                guestPositionWins++;
            }


            const hostTotalPower =
                hostState.picks.reduce(
                    (total, pick) =>
                        total +
                        pick.power,
                    0
                );


            const guestTotalPower =
                guestState.picks.reduce(
                    (total, pick) =>
                        total +
                        pick.power,
                    0
                );


            let winnerUid:
                string | null =
                null;


            /*
             * Primary:
             * Position victories.
             */
            if (
                hostPositionWins >
                guestPositionWins
            ) {
                winnerUid =
                    match.host.uid;
            } else if (
                guestPositionWins >
                hostPositionWins
            ) {
                winnerUid =
                    match.guest.uid;
            }

            /*
             * Tiebreak:
             * Total team power.
             */
            else if (
                hostTotalPower >
                guestTotalPower
            ) {
                winnerUid =
                    match.host.uid;
            } else if (
                guestTotalPower >
                hostTotalPower
            ) {
                winnerUid =
                    match.guest.uid;
            }


            /*
             * winnerUid remains null
             * only for a true draw.
             */
            transaction.update(
                matchRef,
                {
                    status:
                        "complete",

                    winnerUid,

                    endReason:
                        "normal",
                }
            );
        }
    );
}

export async function requestDraftRematch(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(
                    matchRef
                );

            if (!snapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            const match =
                snapshot.data();

            if (
                match.status !==
                "complete"
            ) {
                throw new Error(
                    "MATCH_NOT_COMPLETE"
                );
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            if (isHost) {
                if (
                    match.hostRematchRequested
                ) {
                    return;
                }

                transaction.update(
                    matchRef,
                    {
                        hostRematchRequested:
                            true,
                    }
                );

                return;
            }

            if (
                match.guestRematchRequested
            ) {
                return;
            }

            transaction.update(
                matchRef,
                {
                    guestRematchRequested:
                        true,
                }
            );
        }
    );
}

export async function beginDraftRematchIfReady(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(
                    matchRef
                );

            if (!snapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            const match =
                snapshot.data();

            if (
                match.status !==
                "complete"
            ) {
                return;
            }

            if (
                match.host.uid !== uid
            ) {
                throw new Error(
                    "ONLY_HOST_CAN_BEGIN_REMATCH"
                );
            }

            if (
                !match.hostRematchRequested ||
                !match.guestRematchRequested
            ) {
                return;
            }

            transaction.update(
                matchRef,
                {
                    status:
                        "rematch",

                    hostRematchReady:
                        false,

                    guestRematchReady:
                        false,
                }
            );
        }
    );
}

export async function prepareDraftRematch(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    const powerPositionChoices =
        getRandomPowerPositions(3);

    const ascensionChoices =
        getRandomAscensions(3);

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(
                    matchRef
                );

            const playerSnapshot =
                await transaction.get(
                    playerStateRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            if (!playerSnapshot.exists()) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

            if (
                match.status !==
                "rematch"
            ) {
                return;
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            const alreadyReady =
                isHost
                    ? match.hostRematchReady
                    : match.guestRematchReady;

            if (alreadyReady) {
                return;
            }

            // Reset this player's
            // PRIVATE game state.
            transaction.update(
                playerStateRef,
                {
                    powerPositionChoices,

                    selectedPowerPosition:
                        null,

                    currentCharacterId:
                        null,

                    usedCharacterIds:
                        [],

                    picks:
                        [],

                    lastSubmittedRound:
                        0,

                    rerollUsed:
                        false,

                    ascensionChoices,

                    selectedAscension:
                        null,
                }
            );

            // Tell the public match
            // this player's reset
            // completed.
            transaction.update(
                matchRef,
                isHost
                    ? {
                        hostRematchReady:
                            true,
                    }
                    : {
                        guestRematchReady:
                            true,
                    }
            );
        }
    );
}

export async function startDraftRematchIfReady(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(
                    matchRef
                );

            if (!snapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            const match =
                snapshot.data();

            if (
                match.status !==
                "rematch"
            ) {
                return;
            }

            if (
                match.host.uid !== uid
            ) {
                throw new Error(
                    "ONLY_HOST_CAN_START_REMATCH"
                );
            }

            if (
                !match.hostRematchReady ||
                !match.guestRematchReady
            ) {
                return;
            }

            transaction.update(
                matchRef,
                {
                    status:
                        "power-selection",

                    round:
                        0,
                    gameNumber:
                        (match.gameNumber ?? 1) + 1,

                    // -------------------------
                    // ROUND STATE
                    // -------------------------

                    hostSubmitted:
                        false,

                    guestSubmitted:
                        false,

                    hostRollLocked:
                        false,

                    guestRollLocked:
                        false,

                    // -------------------------
                    // POWER POSITION
                    // -------------------------

                    hostPowerSelected:
                        false,

                    guestPowerSelected:
                        false,

                    // -------------------------
                    // ASCENSION
                    // -------------------------

                    hostAscensionSelected:
                        false,

                    guestAscensionSelected:
                        false,

                    // -------------------------
                    // REMATCH FLAGS
                    // -------------------------

                    hostRematchRequested:
                        false,

                    guestRematchRequested:
                        false,

                    hostRematchReady:
                        false,

                    guestRematchReady:
                        false,

                    // -------------------------
                    // OLD MATCH RESULT
                    // -------------------------

                    winnerUid:
                        null,

                    forfeitedByUid:
                        null,

                    endReason:
                        null,
                }
            );
        }
    );
}

export async function getDraftPlayerState(
    code: string,
    uid: string
): Promise<MultiplayerDraftPlayerState | null> {
    const normalizedCode =
        code.trim().toUpperCase();

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    const snapshot =
        await getDoc(playerStateRef);

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.data() as MultiplayerDraftPlayerState;
}

export async function lockDraftRoundCharacter(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const playerStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        uid
    );

    const revealRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "roundReveals",
        uid
    );

    await runTransaction(
        db,
        async (transaction) => {
            const matchSnapshot =
                await transaction.get(
                    matchRef
                );

            const playerSnapshot =
                await transaction.get(
                    playerStateRef
                );

            if (!matchSnapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            if (!playerSnapshot.exists()) {
                throw new Error(
                    "PLAYER_STATE_NOT_FOUND"
                );
            }

            const match =
                matchSnapshot.data();

            const playerState =
                playerSnapshot.data();

            if (
                match.status !==
                "drafting"
            ) {
                throw new Error(
                    "NOT_DRAFTING"
                );
            }

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            if (!isHost && !isGuest) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            const alreadyLocked =
                isHost
                    ? match.hostRollLocked
                    : match.guestRollLocked;

            if (alreadyLocked) {
                return;
            }

            const alreadySubmitted =
                isHost
                    ? match.hostSubmitted
                    : match.guestSubmitted;

            if (alreadySubmitted) {
                throw new Error(
                    "ALREADY_SUBMITTED"
                );
            }

            if (
                !playerState.currentCharacterId
            ) {
                throw new Error(
                    "NO_CURRENT_CHARACTER"
                );
            }

            /*
             * This document contains ONLY
             * information the opponent is
             * eventually allowed to see.
             *
             * rerollUsed remains private.
             */
            transaction.set(
                revealRef,
                {
                    uid,
                    round:
                    match.round,

                    characterId:
                    playerState
                        .currentCharacterId,
                }
            );

            transaction.update(
                matchRef,
                isHost
                    ? {
                        hostRollLocked:
                            true,
                    }
                    : {
                        guestRollLocked:
                            true,
                    }
            );
        }
    );
}

export function listenToDraftRoundReveal(
    code: string,
    uid: string,
    onChange: (
        reveal:
            MultiplayerDraftRoundReveal |
            null
    ) => void
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const revealRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "roundReveals",
        uid
    );

    return onSnapshot(
        revealRef,
        (snapshot) => {
            if (!snapshot.exists()) {
                onChange(null);
                return;
            }

            onChange(
                snapshot.data() as
                    MultiplayerDraftRoundReveal
            );
        },

        (error) => {
            console.error(
                "Failed to listen to round reveal:",
                error
            );
        }
    );
}

export async function claimDraftForfeit(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    await runTransaction(
        db,
        async (transaction) => {
            const snapshot =
                await transaction.get(
                    matchRef
                );

            if (!snapshot.exists()) {
                throw new Error(
                    "MATCH_NOT_FOUND"
                );
            }

            const match =
                snapshot.data();

            const isHost =
                match.host.uid === uid;

            const isGuest =
                match.guest?.uid === uid;

            if (
                !isHost &&
                !isGuest
            ) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }

            if (!match.guest) {
                throw new Error(
                    "NO_OPPONENT"
                );
            }

            /*
             * Only allow forfeits during
             * an unfinished match.
             */
            const activeStatuses = [
                "lobby",
                "power-selection",
                "drafting",
                "ascension",
            ];

            if (
                !activeStatuses.includes(
                    match.status
                )
            ) {
                throw new Error(
                    "MATCH_NOT_ACTIVE"
                );
            }

            const opponentUid =
                isHost
                    ? match.guest.uid
                    : match.host.uid;

            transaction.update(
                matchRef,
                {
                    status:
                        "complete",

                    winnerUid:
                    uid,

                    forfeitedByUid:
                    opponentUid,

                    endReason:
                        "forfeit",
                }
            );
        }
    );
}

export async function saveDraftMatchHistory(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );

    const matchSnapshot =
        await getDoc(
            matchRef
        );

    if (!matchSnapshot.exists()) {
        throw new Error(
            "MATCH_NOT_FOUND"
        );
    }

    const match =
        matchSnapshot.data();

    if (
        match.status !==
        "complete"
    ) {
        return;
    }

    if (!match.guest) {
        return;
    }


    const isHost =
        match.host.uid === uid;

    const isGuest =
        match.guest.uid === uid;

    if (!isHost && !isGuest) {
        throw new Error(
            "NOT_IN_MATCH"
        );
    }


    const opponent =
        isHost
            ? match.guest
            : match.host;


    const gameNumber =
        match.gameNumber ?? 1;


    const historyId =
        `${normalizedCode}-${gameNumber}`;


    const historyRef = doc(
        db,
        "users",
        uid,
        "draftMatchHistory",
        historyId
    );


    /*
     * Already saved.
     *
     * This makes the function safe to call
     * multiple times from React effects.
     */
    const existingHistory =
        await getDoc(
            historyRef
        );

    if (existingHistory.exists()) {
        return;
    }


    // ==========================================
    // FORFEIT
    // ==========================================

    if (
        match.endReason ===
        "forfeit"
    ) {
        const result:
            "win" | "loss" =
            match.winnerUid === uid
                ? "win"
                : "loss";

        await runTransaction(
            db,
            async (transaction) => {
                const existing =
                    await transaction.get(
                        historyRef
                    );

                if (existing.exists()) {
                    return;
                }

                transaction.set(
                    historyRef,
                    {
                        matchCode:
                        normalizedCode,

                        gameNumber,

                        userId:
                        uid,

                        opponentUid:
                        opponent.uid,

                        opponentName:
                        opponent.displayName,

                        result,

                        myPositionWins:
                            null,

                        opponentPositionWins:
                            null,

                        myTotalPower:
                            null,

                        opponentTotalPower:
                            null,

                        endReason:
                            "forfeit",

                        completedAt:
                            serverTimestamp(),
                    }
                );
            }
        );

        return;
    }


    // ==========================================
    // NORMAL MATCH
    // ==========================================

    const hostStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        match.host.uid
    );

    const guestStateRef = doc(
        db,
        "draftMatches",
        normalizedCode,
        "playerStates",
        match.guest.uid
    );


    const [
        hostSnapshot,
        guestSnapshot,
    ] = await Promise.all([
        getDoc(hostStateRef),
        getDoc(guestStateRef),
    ]);


    if (
        !hostSnapshot.exists() ||
        !guestSnapshot.exists()
    ) {
        throw new Error(
            "PLAYER_STATE_NOT_FOUND"
        );
    }


    const hostState =
        hostSnapshot.data() as
            MultiplayerDraftPlayerState;

    const guestState =
        guestSnapshot.data() as
            MultiplayerDraftPlayerState;


    let hostPositionWins = 0;
    let guestPositionWins = 0;


    // ==========================================
    // 8 NORMAL POSITIONS
    // ==========================================

    for (
        const position
        of draftPositions
        ) {
        const hostPick =
            hostState.picks.find(
                (pick) =>
                    pick.position ===
                    position
            );

        const guestPick =
            guestState.picks.find(
                (pick) =>
                    pick.position ===
                    position
            );

        if (
            !hostPick ||
            !guestPick
        ) {
            continue;
        }

        if (
            hostPick.power >
            guestPick.power
        ) {
            hostPositionWins++;
        } else if (
            guestPick.power >
            hostPick.power
        ) {
            guestPositionWins++;
        }
    }


    // ==========================================
    // POWER POSITION VS POWER POSITION
    // ==========================================

    const hostPowerPick =
        hostState.picks.find(
            (pick) =>
                pick.position ===
                hostState
                    .selectedPowerPosition
        );

    const guestPowerPick =
        guestState.picks.find(
            (pick) =>
                pick.position ===
                guestState
                    .selectedPowerPosition
        );


    if (
        hostPowerPick &&
        guestPowerPick
    ) {
        if (
            hostPowerPick.power >
            guestPowerPick.power
        ) {
            hostPositionWins++;
        } else if (
            guestPowerPick.power >
            hostPowerPick.power
        ) {
            guestPositionWins++;
        }
    }


    const hostTotalPower =
        hostState.picks.reduce(
            (total, pick) =>
                total +
                pick.power,
            0
        );


    const guestTotalPower =
        guestState.picks.reduce(
            (total, pick) =>
                total +
                pick.power,
            0
        );


    const myPositionWins =
        isHost
            ? hostPositionWins
            : guestPositionWins;


    const opponentPositionWins =
        isHost
            ? guestPositionWins
            : hostPositionWins;


    const myTotalPower =
        isHost
            ? hostTotalPower
            : guestTotalPower;


    const opponentTotalPower =
        isHost
            ? guestTotalPower
            : hostTotalPower;


    let result:
        "win" |
        "loss" |
        "draw";


    if (match.winnerUid === uid) {
        result = "win";
    } else if (
        match.winnerUid === null
    ) {
        result = "draw";
    } else {
        result = "loss";
    }


    await runTransaction(
        db,
        async (transaction) => {
            const existing =
                await transaction.get(
                    historyRef
                );

            if (existing.exists()) {
                return;
            }

            transaction.set(
                historyRef,
                {
                    matchCode:
                    normalizedCode,

                    gameNumber,

                    userId:
                    uid,

                    opponentUid:
                    opponent.uid,

                    opponentName:
                    opponent.displayName,

                    result,

                    myPositionWins,

                    opponentPositionWins,

                    myTotalPower,

                    opponentTotalPower,

                    endReason:
                        "normal",

                    completedAt:
                        serverTimestamp(),
                }
            );
        }
    );
}

export function listenToDraftMatchHistory(
    uid: string,
    onChange: (
        history:
        DraftMatchHistoryEntry[]
    ) => void
) {
    const historyQuery =
        query(
            collection(
                db,
                "users",
                uid,
                "draftMatchHistory"
            ),

            orderBy(
                "completedAt",
                "desc"
            ),

            limit(8)
        );


    return onSnapshot(
        historyQuery,

        (snapshot) => {
            const history =
                snapshot.docs.map(
                    (historyDoc) => ({
                        id:
                        historyDoc.id,

                        ...historyDoc.data(),
                    })
                ) as
                    DraftMatchHistoryEntry[];

            onChange(
                history
            );
        },

        (error) => {
            console.error(
                "Failed to listen to match history:",
                error
            );
        }
    );
}

export async function expireDraftLobbyIfNeeded(
    code: string,
    uid: string
): Promise<boolean> {
    const normalizedCode =
        code.trim().toUpperCase();

    const matchRef = doc(
        db,
        "draftMatches",
        normalizedCode
    );


    return runTransaction(
        db,
        async (
            transaction
        ) => {
            const snapshot =
                await transaction.get(
                    matchRef
                );


            if (!snapshot.exists()) {
                return false;
            }


            const match =
                snapshot.data();


            /*
             * Game already started.
             */
            if (
                match.status !==
                "lobby"
            ) {
                return false;
            }


            /*
             * Timer doesn't start until
             * both players exist.
             */
            if (!match.guest) {
                return false;
            }


            const isHost =
                match.host.uid ===
                uid;

            const isGuest =
                match.guest.uid ===
                uid;


            if (
                !isHost &&
                !isGuest
            ) {
                throw new Error(
                    "NOT_IN_MATCH"
                );
            }


            /*
             * Both players ready means another
             * transaction should already be
             * advancing the match.
             */
            if (
                match.host.ready &&
                match.guest.ready
            ) {
                return false;
            }


            if (
                !match.lobbyReadyStartedAt
            ) {
                return false;
            }


            const startedAt =
                match.lobbyReadyStartedAt;


            const deadline =
                startedAt.toMillis() +
                10_000;


            const DELETE_GRACE_MS =
                1000;


            if (
                Date.now() <
                deadline +
                DELETE_GRACE_MS
            ) {
                return false;
            }


            transaction.delete(
                matchRef
            );


            return true;
        }
    );
}

export async function cleanupExpiredDraftLobby(
    uid: string
) {
    const queueRef = doc(
        db,
        "draftQueue",
        uid
    );

    try {
        const queueSnapshot =
            await getDoc(
                queueRef
            );

        if (
            queueSnapshot.exists()
        ) {
            await deleteDoc(
                queueRef
            );
        }
    } catch (error) {
        console.error(
            "Failed to clean expired queue document:",
            error
        );
    }

    try {
        await clearOpenDraftQueuePresence(
            uid
        );
    } catch (error) {
        console.error(
            "Failed to clean expired queue presence:",
            error
        );
    }
}