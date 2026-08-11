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
    | "complete";

export type DraftMatchPlayer = {
    uid: string;
    displayName: string;
    ready: boolean;
};

export type DraftMatch = {
    id: string;

    host: DraftMatchPlayer;
    guest: DraftMatchPlayer | null;

    status: DraftMatchStatus;

    round: number;

    hostSubmitted: boolean;
    guestSubmitted: boolean;

    hostPowerSelected: boolean;
    guestPowerSelected: boolean;

    hostAscensionSelected: boolean;
    guestAscensionSelected: boolean;
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