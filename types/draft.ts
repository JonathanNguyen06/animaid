// types/draft.ts

import type {
    AnyDraftPosition,
    DraftCharacter,
    DraftPosition,
} from "@/data/draftCharacters";
import {Ascension} from "@/data/draftLogic";

export type DraftPick = {
    character: DraftCharacter;
    position: AnyDraftPosition;

    basePower: number;
    power: number;
    grade: string;

    hasSynergy?: boolean;

    ascensionBonus?: number;
};

export type DraftResult = {
    picks: DraftPick[];

    totalPower: number;
    averagePower: number;
    grade: string;

    ascension?: {
        name: string;
        description: string;
        totalBonus: number;
    };

    isNewHighScore: boolean;
};