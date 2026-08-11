import {
    doc,
    runTransaction,
    serverTimestamp,
    onSnapshot, updateDoc
} from "firebase/firestore";
import type {
    DraftMatch, MultiplayerDraftPick, MultiplayerDraftPlayerState,
} from "@/types/multiplayerDraft";
import { db } from "./firebase";
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

                        hostSubmitted: false,
                        guestSubmitted: false,

                        hostPowerSelected: false,
                        guestPowerSelected: false,

                        hostAscensionSelected: false,
                        guestAscensionSelected: false,

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

            if (
                playerState.selectedAscension
            ) {
                throw new Error(
                    "ASCENSION_ALREADY_SELECTED"
                );
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
             * Work out whether both
             * players will now be done.
             */

            const hostSelected =
                isHost
                    ? true
                    : match.hostAscensionSelected ??
                    false;

            const guestSelected =
                isGuest
                    ? true
                    : match.guestAscensionSelected ??
                    false;

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
             */

            const matchUpdates:
                Record<string, unknown> = {};

            if (isHost) {
                matchUpdates
                    .hostAscensionSelected =
                    true;
            }

            if (isGuest) {
                matchUpdates
                    .guestAscensionSelected =
                    true;
            }

            /*
             * Last player to choose moves
             * everyone to reveal.
             */

            if (
                hostSelected &&
                guestSelected
            ) {
                matchUpdates.status =
                    "reveal";
            }

            transaction.update(
                matchRef,
                matchUpdates
            );
        }
    );
}