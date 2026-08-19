import type {
    AnyDraftPosition,
    PowerPosition,
} from "@/data/draftCharacters";

import type {
    Ascension,
} from "@/data/draftLogic";

export type DraftMatchStatus =
    | "lobby"
    | "power-selection"
    | "drafting"
    | "ascension"
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

    hostRollLocked: boolean;
    guestRollLocked: boolean;

    hostSubmitted: boolean;
    guestSubmitted: boolean;

    hostPowerSelected: boolean;
    guestPowerSelected: boolean;

    hostAscensionSelected: boolean;
    guestAscensionSelected: boolean;

    hostRematchRequested: boolean;
    guestRematchRequested: boolean;

    hostRematchReady: boolean;
    guestRematchReady: boolean;

    winnerUid: string | null;
    forfeitedByUid: string | null;
    endReason: DraftMatchEndReason | null;
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
};

export type MultiplayerDraftPick = {
    characterId: string;
    position: AnyDraftPosition;

    basePower: number;
    power: number;
    grade: string;

    hasSynergy: boolean;

    ascensionBonus?: number;
};