import type { DraftCharacter, DraftPosition } from "@/data/draftCharacters";

export const draftPositions: DraftPosition[] = [
    "Captain",
    "Vice Captain",
    "Support",
    "Scout",
    "Strategist",
    "Assassin",
    "Ace",
    "Vanguard",
];

const positionWeights: Record<DraftPosition, Partial<Record<keyof DraftCharacter["stats"], number>>> = {
    Captain: {
        leadership: 0.45,
        iq: 0.25,
        power: 0.15,
        defense: 0.10,
        utility: 0.05,
    },
    "Vice Captain": {
        leadership: 0.25,
        power: 0.25,
        iq: 0.20,
        utility: 0.15,
        defense: 0.15,
    },
    Support: {
        utility: 0.50,
        iq: 0.20,
        defense: 0.15,
        leadership: 0.15,
    },
    Scout: {
        speed: 0.50,
        iq: 0.20,
        utility: 0.20,
        power: 0.10,
    },
    Strategist: {
        iq: 0.75,
        leadership: 0.15,
        utility: 0.05,
        defense: 0.05,
    },
    Assassin: {
        speed: 0.40,
        power: 0.35,
        iq: 0.15,
        utility: 0.10,
    },
    Ace: {
        power: 0.50,
        speed: 0.20,
        defense: 0.20,
        leadership: 0.10,
    },
    Vanguard: {
        defense: 0.4,
        leadership: 0.2,
        power: 0.2,
        utility: 0.1,
        speed: 0.05,
        iq: 0.05,
    }
};

export function calculateDraftPower(
    character: DraftCharacter,
    position: DraftPosition
) {
    const weights = positionWeights[position];

    const score = Object.entries(weights).reduce((total, [stat, weight]) => {
        return total + character.stats[stat as keyof DraftCharacter["stats"]] * weight;
    }, 0);

    return Math.round(score);
}