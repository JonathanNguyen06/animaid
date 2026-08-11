import {
    AnyDraftPosition,
    CharacterStat,
    DraftCharacter,
    DraftPosition,
    FormulaPowerPosition, PowerPosition, powerPositions,
    WeightedPowerPosition
} from "@/data/draftCharacters";

import type { DraftPick } from "@/types/draft";

export function getLetterGrade(score: number) {
    if (score >= 95) return "S+";
    if (score >= 90) return "S";
    if (score >= 85) return "A+";
    if (score >= 80) return "A";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
}

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

export const powerPositionWeights = {
    Juggernaut: {
        power: 0.50,
        defense: 0.40,
        speed: 0.10,
    },

    Guardian: {
        defense: 0.40,
        utility: 0.30,
        leadership: 0.20,
        power: 0.10,
    },

    "Battle Genius": {
        iq: 0.40,
        power: 0.25,
        speed: 0.25,
        utility: 0.10,
    },
} satisfies Record<
    WeightedPowerPosition,
    Partial<Record<CharacterStat, number>>
>;

export const formulaPowerPositions: FormulaPowerPosition[] = [
    "Wildcard",
    "Specialist",
    "Prodigy",
    "Apex",
    "One Man Army",
];

export type Ascension =
    | "Limit Break"
    | "Perfect Chemistry"
    | "Elite Core"
    | "Second Wind"
    | "Power Surge"
    | "Master Tactician";

export const ascensionInfo: Record<
    Ascension,
    {
        description: string;
    }
> = {
    "Limit Break": {
        description: "Your lowest-rated character gains +8 power.",
    },

    "Perfect Chemistry": {
        description: "All Series Link bonuses are doubled.",
    },

    "Elite Core": {
        description: "Your 3 highest-rated characters gain +3 power.",
    },

    "Second Wind": {
        description: "Characters below 75 power gain +4 power.",
    },

    "Power Surge": {
        description: "Your Power Position character gains +7 power.",
    },

    "Master Tactician": {
        description: "Your Captain and Strategist gain +4 power.",
    },
};

export function getRandomAscensions(count = 3): Ascension[] {
    const ascensions = Object.keys(
        ascensionInfo
    ) as Ascension[];

    return [...ascensions]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}

function addPower(
    pick: DraftPick,
    amount: number
): DraftPick {
    const previousPower = pick.power;

    const power = Math.min(
        99,
        previousPower + amount
    );

    const actualBonus =
        power - previousPower;

    return {
        ...pick,
        power,
        grade: getLetterGrade(power),

        ascensionBonus:
            (pick.ascensionBonus ?? 0) +
            actualBonus,
    };
}

export function applyAscension(
    picks: DraftPick[],
    ascension: Ascension,
    powerPosition: PowerPosition | null
): DraftPick[] {
    switch (ascension) {
        case "Limit Break": {
            const lowestPower = Math.min(
                ...picks.map((pick) => pick.power)
            );

            let applied = false;

            return picks.map((pick) => {
                if (!applied && pick.power === lowestPower) {
                    applied = true;
                    return addPower(pick, 8);
                }

                return pick;
            });
        }

        case "Perfect Chemistry": {
            return picks.map((pick) => {
                const synergyBonus =
                    pick.power - pick.basePower;

                if (synergyBonus <= 0) {
                    return pick;
                }

                const previousPower = pick.power;

                const power = Math.min(
                    99,
                    pick.basePower + synergyBonus * 2
                );

                return {
                    ...pick,

                    power,

                    grade: getLetterGrade(power),

                    ascensionBonus:
                        power - previousPower,
                };
            });
        }

        case "Elite Core": {
            const topThree = [...picks]
                .sort((a, b) => b.power - a.power)
                .slice(0, 3);

            const topThreePositions = new Set(
                topThree.map((pick) => pick.position)
            );

            return picks.map((pick) =>
                topThreePositions.has(pick.position)
                    ? addPower(pick, 3)
                    : pick
            );
        }

        case "Second Wind": {
            return picks.map((pick) =>
                pick.power < 75
                    ? addPower(pick, 4)
                    : pick
            );
        }

        case "Power Surge": {
            if (!powerPosition) {
                return picks;
            }

            return picks.map((pick) =>
                pick.position === powerPosition
                    ? addPower(pick, 7)
                    : pick
            );
        }

        case "Master Tactician": {
            return picks.map((pick) =>
                pick.position === "Captain" ||
                pick.position === "Strategist"
                    ? addPower(pick, 4)
                    : pick
            );
        }

        default:
            return picks;
    }
}

export function calculateDraftPower(
    character: DraftCharacter,
    position: DraftPosition | PowerPosition
) {
    let score: number;

    if (position in positionWeights) {
        score = calculateWeightedScore(
            character,
            positionWeights[position as DraftPosition]
        );
    } else if (position in powerPositionWeights) {
        score = calculateWeightedScore(
            character,
            powerPositionWeights[
                position as WeightedPowerPosition
                ]
        );
    } else {
        switch (position as FormulaPowerPosition) {
            case "Wildcard":
                score = calculateWildcardScore(character);
                break;

            case "Specialist":
                score = calculateSpecialistScore(character);
                break;

            case "Prodigy":
                score = calculateProdigyScore(character);
                break;

            case "Apex":
                score = calculateApexScore(character);
                break;

            case "One Man Army":
                score = calculateOneManArmyScore(character);
                break;

            default:
                throw new Error(`Unknown draft position: ${position}`);
        }
    }

    return Math.min(99, Math.round(score));
}

function calculateWeightedScore(
    character: DraftCharacter,
    weights: Partial<Record<CharacterStat, number>>
) {
    return Object.entries(weights).reduce(
        (total, [stat, weight]) => {
            return (
                total +
                character.stats[stat as CharacterStat] * (weight ?? 0)
            );
        },
        0
    );
}

function getStats(character: DraftCharacter) {
    return Object.values(character.stats);
}

function calculateWildcardScore(character: DraftCharacter) {
    const stats = getStats(character).sort((a, b) => b - a);

    return (
        stats[0] * 0.45 +
        stats[1] * 0.35 +
        stats[2] * 0.20
    );
}

function calculateSpecialistScore(character: DraftCharacter) {
    const stats = getStats(character).sort((a, b) => b - a);

    return (
        stats[0] * 0.70 +
        stats[1] * 0.30
    );
}

function calculateProdigyScore(character: DraftCharacter) {
    const stats = getStats(character);

    const average =
        stats.reduce((sum, stat) => sum + stat, 0) /
        stats.length;

    const lowest = Math.min(...stats);

    return average * 0.60 + lowest * 0.40;
}

function calculateApexScore(character: DraftCharacter) {
    const stats = getStats(character).sort((a, b) => a - b);

    return (
        stats[0] * 0.45 +
        stats[1] * 0.35 +
        stats[2] * 0.20
    );
}

function calculateOneManArmyScore(character: DraftCharacter) {
    const stats = getStats(character);

    const average =
        stats.reduce((sum, stat) => sum + stat, 0) /
        stats.length;

    const bonus = stats.reduce((total, stat) => {
        if (stat >= 90) {
            return total + 2;
        }

        if (stat >= 85) {
            return total + 1;
        }

        return total;
    }, 0);

    return average + bonus;
}

export function getRandomPowerPositions(
    count = 3
): PowerPosition[] {
    const positions =
        Object.keys(powerPositionInfo) as PowerPosition[];

    return [...positions]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}

export const powerPositionInfo: Record<
    PowerPosition,
    {
        description: string;
        scoring: string;
    }
> = {
    Juggernaut: {
        description: "An unstoppable force built to overpower anything in its path.",
        scoring: "50% Power • 40% Defense • 10% Speed",
    },

    Guardian: {
        description: "A defensive anchor capable of protecting and supporting the team.",
        scoring: "40% Defense • 30% Utility • 20% Leadership • 10% Power",
    },

    "Battle Genius": {
        description: "Combines elite combat ability with exceptional tactical intelligence.",
        scoring: "40% IQ • 25% Power • 25% Speed • 10% Utility",
    },

    Wildcard: {
        description: "Adapts to whatever a character does best.",
        scoring: "Uses the character's 3 highest attributes",
    },

    Specialist: {
        description: "Rewards characters who are exceptional in a small number of areas.",
        scoring: "70% highest attribute • 30% second highest",
    },

    Prodigy: {
        description: "Rewards exceptionally well-rounded characters.",
        scoring: "Overall average with a bonus for a strong weakest attribute",
    },

    Apex: {
        description: "Only characters with virtually no weaknesses can dominate this role.",
        scoring: "Uses the character's 3 weakest attributes",
    },

    "One Man Army": {
        description: "Designed for characters capable of doing everything themselves.",
        scoring: "Uses all 6 attributes with bonuses for elite stats",
    },
};