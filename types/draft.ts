// types/draft.ts

import type {
    DraftCharacter,
    DraftPosition,
} from "@/data/draftCharacters";

export type DraftPick = {
    character: DraftCharacter;
    position: DraftPosition;
    basePower: number;
    power: number;
    grade: string;
    hasSynergy?: boolean;
};

export type DraftResult = {
    picks: DraftPick[];
    totalPower: number;
    averagePower: number;
    grade: string;
    isNewHighScore: boolean;
};