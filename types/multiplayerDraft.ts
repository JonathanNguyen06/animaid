import type {
    AnyDraftPosition,
    PowerPosition,
} from "@/data/draftCharacters";

import type {
    Ascension, Disruption,
} from "@/data/draftLogic";
import {Timestamp} from "@firebase/firestore";

export type DraftMatchStatus =
    | "lobby"
    | "power-selection"
    | "drafting"
    | "ascension"
    | "disruption"
    | "reveal"
    | "complete"
    | "rematch";

export type DraftMatchPlayer = {
    uid: string;
    displayName: string;
    ready: boolean;
};

export type DraftMatchmaking =
    | "room"
    | "open";

type DraftQueueEntry = {
    uid: string;
    displayName: string;
    status: "waiting" | "matched";
    matchCode: string | null;
    matchedWithUid: string | null;
};

export type DraftMatchEndReason =
    | "normal"
    | "forfeit";

export type DraftMatch = {
    id: string;

    host: DraftMatchPlayer;
    guest: DraftMatchPlayer | null;

    status: DraftMatchStatus;

    matchmaking: DraftMatchmaking;

    round: number;
    gameNumber: number;

    hostRollLocked: boolean;
    guestRollLocked: boolean;

    hostSubmitted: boolean;
    guestSubmitted: boolean;

    hostPowerSelected: boolean;
    guestPowerSelected: boolean;

    hostAscensionSelected: boolean;
    guestAscensionSelected: boolean;

    hostDisruptionSelected: boolean;
    guestDisruptionSelected: boolean;

    hostDrawOrder: string[];
    guestDrawOrder: string[];

    hostRematchRequested: boolean;
    guestRematchRequested: boolean;

    hostRematchReady: boolean;
    guestRematchReady: boolean;

    winnerUid: string | null;
    forfeitedByUid: string | null;
    endReason: DraftMatchEndReason | null;

    lobbyReadyStartedAt:
        Timestamp | null;
};

export type MultiplayerDraftRoundReveal = {
    uid: string;
    round: number;
    characterId: string;
};

export type MultiplayerDraftPlayerState = {
    uid: string;

    powerPositionChoices: PowerPosition[];

    selectedPowerPosition:
        PowerPosition | null;

    currentCharacterId:
        string | null;

    usedCharacterIds:
        string[];

    picks:
        MultiplayerDraftPick[];

    lastSubmittedRound:
        number;

    rerollUsed:
        boolean;

    ascensionChoices: Ascension[];

    selectedAscension:
        Ascension | null;
    disruptionChoices: Disruption[];

    selectedDisruption:
        Disruption | null;
};

export type MultiplayerDraftPick = {
    characterId: string;
    position: AnyDraftPosition;

    basePower: number;
    power: number;
    grade: string;

    hasSynergy: boolean;

    ascensionBonus?: number;
    disruptionPenalty?: number;
};

export type DraftMatchHistoryResult =
    | "win"
    | "loss"
    | "draw";


export type DraftMatchHistoryEntry = {
    id: string;

    matchCode: string;
    gameNumber: number;

    userId: string;

    opponentUid: string;
    opponentName: string;

    result:
        DraftMatchHistoryResult;

    myPositionWins:
        number | null;

    opponentPositionWins:
        number | null;

    myTotalPower:
        number | null;

    opponentTotalPower:
        number | null;

    endReason:
        "normal" | "forfeit";

    completedAt?: {
        seconds: number;
        nanoseconds: number;
    };
};