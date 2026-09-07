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

export const positionWeights = {
    Captain: {
        leadership: 0.80,
        iq: 0.10,
        power: 0.10,
    },

    "Vice Captain": {
        leadership: 0.40,
        power: 0.25,
        iq: 0.20,
        defense: 0.15,
    },

    Support: {
        utility: 0.65,
        iq: 0.20,
        speed: 0.05,
        defense: 0.10,
    },

    Scout: {
        speed: 0.55,
        iq: 0.25,
        utility: 0.20,
    },

    Strategist: {
        iq: 0.80,
        leadership: 0.15,
        utility: 0.05,
    },

    Assassin: {
        speed: 0.55,
        power: 0.35,
        utility: 0.10,
    },

    Ace: {
        power: 0.55,
        speed: 0.20,
        defense: 0.15,
        iq: 0.10,
    },

    Vanguard: {
        defense: 0.65,
        leadership: 0.10,
        power: 0.15,
        utility: 0.10,
    },
} satisfies Record<
    DraftPosition,
    Partial<Record<CharacterStat, number>>
>;

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

export const formulaPowerPositionBreakdowns: Record<
    FormulaPowerPosition,
    {
        description: string;
        rows: {
            label: string;
            percentage?: number;
            value?: string;
        }[];
        note?: string;
    }
> = {
    Wildcard: {
        description:
            "Automatically uses the character's 3 strongest attributes.",
        rows: [
            {
                label: "Highest Attribute",
                percentage: 45,
            },
            {
                label: "2nd Highest",
                percentage: 35,
            },
            {
                label: "3rd Highest",
                percentage: 20,
            },
        ],
    },

    Specialist: {
        description:
            "Rewards characters who dominate in one or two attributes.",
        rows: [
            {
                label: "Highest Attribute",
                percentage: 70,
            },
            {
                label: "2nd Highest",
                percentage: 30,
            },
        ],
    },

    Prodigy: {
        description:
            "Rewards characters who are consistently strong across every attribute.",
        rows: [
            {
                label: "All-Stat Average",
                percentage: 60,
            },
            {
                label: "Weakest Attribute",
                percentage: 40,
            },
        ],
    },

    Apex: {
        description:
            "Tests a character's weaknesses instead of their strengths.",
        rows: [
            {
                label: "Weakest Attribute",
                percentage: 45,
            },
            {
                label: "2nd Weakest",
                percentage: 35,
            },
            {
                label: "3rd Weakest",
                percentage: 20,
            },
        ],
    },

    "One Man Army": {
        description:
            "Rewards characters who are elite across the entire stat sheet.",
        rows: [
            {
                label: "Base Score",
                value: "Average of all 6 attributes",
            },
            {
                label: "85+ Attribute",
                value: "+1 Power each",
            },
            {
                label: "90+ Attribute",
                value: "+2 Power each",
            },
        ],
        note:
            "90+ attributes receive +2 instead of the +1 bonus.",
    },
};

export type Ascension =
    | "Comeback Story"
    | "Perfect Chemistry"
    | "Elite Core"
    | "Second Wind"
    | "Power Surge"
    | "Master Tactician"
    | "Balanced Formation"
    | "Underdogs"
    | "Momentum"
    | "Star Player"
    | "Chain Reaction"
    | "Command Structure"
    | "Unstoppable Force"
    | "Utility Network"
    | "Last Stand"
    | "Dynamic Duo"
    | "Perfect Fit"
    | "Power Through Numbers"
    | "Anime Alliance"
    | "Anchor Point"
    | "Strike Team"
    | "Wide Formation"
    | "One for All"
    | "All for One";

export const ascensionInfo: Record<
    Ascension,
    {
        description: string;
    }
> = {
    "Comeback Story": {
        description:
            "Your lowest-rated character gains 25% of their missing Power to 99.",
    },

    "Perfect Chemistry": {
        description:
            "Your existing Series Link bonuses gain 75% additional effectiveness.",
    },

    "Elite Core": {
        description:
            "Your 3 highest-rated characters gain 3% Power.",
    },

    "Second Wind": {
        description:
            "Up to 4 characters below 75 Power gain 4% Power.",
    },

    "Power Surge": {
        description:
            "Your Power Position character gains 8% Power.",
    },

    "Master Tactician": {
        description:
            "Your Captain and Strategist gain 5% Power.",
    },

    "Balanced Formation": {
        description:
            "Characters within 10 Power of your team average gain 2% Power.",
    },

    "Underdogs": {
        description:
            "Your 3 lowest-rated characters gain 5% Power.",
    },

    "Momentum": {
        description:
            "All characters rated A or higher gain 2% Power.",
    },

    "Star Player": {
        description:
            "Your highest-rated character gains 8% Power.",
    },

    "Chain Reaction": {
        description:
            "Every Series Link character gains 2% Power, plus another 1% if 3 or more characters share their anime.",
    },

    "Command Structure": {
        description:
            "Your Captain, Vice Captain, and Strategist each gain 3% Power.",
    },

    "Unstoppable Force": {
        description:
            "Your Vanguard, Ace, and Power Position each gain 3% Power.",
    },

    "Utility Network": {
        description:
            "Your Support, Scout, and Strategist each gain 3% Power.",
    },

    "Last Stand": {
        description:
            "All characters below 70 Power gain 25% Power.",
    },

    "Dynamic Duo": {
        description:
            "Your 2 highest-rated characters gain 4% Power.",
    },

    "Perfect Fit": {
        description:
            "Up to 3 S or S+ characters gain 2% Power.",
    },

    "Power Through Numbers": {
        description:
            "If your team has no S+ characters, everyone gains 1.5% Power.",
    },

    "Anime Alliance": {
        description:
            "Characters from your largest same-series group gain 3% Power.",
    },

    "Anchor Point": {
        description:
            "Your Vanguard gains 5% Power and your Support gains 3% Power.",
    },

    "Strike Team": {
        description:
            "Your Assassin, Scout, and Ace each gain 3% Power.",
    },

    "Wide Formation": {
        description:
            "If all 8 core positions are within 20 Power of each other, everyone gains 1.5% Power.",
    },

    "One for All": {
        description:
            "Your Captain gains 1% Power for each teammate rated below them, up to 6%.",
    },

    "All for One": {
        description:
            "Your Captain gains 1% Power for each teammate rated above them, up to 7%.",
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
    const previousPower =
        pick.power;

    const power =
        Math.min(
            99,
            previousPower + amount
        );

    const actualBonus =
        power - previousPower;

    return {
        ...pick,

        power,

        grade:
            getDraftPickGrade(
                pick.character,
                pick.position,
                power
            ),

        ascensionBonus:
            (pick.ascensionBonus ?? 0) +
            actualBonus,
    };
}

function addPercentagePower(
    pick: DraftPick,
    percentage: number
): DraftPick {
    const bonus = Math.round(
        pick.power * percentage
    );

    return addPower(
        pick,
        bonus
    );
}

export function applyAscension(
    picks: DraftPick[],
    ascension: Ascension,
    powerPosition: PowerPosition | null
): DraftPick[] {
    switch (ascension) {
        case "Comeback Story": {
            if (picks.length === 0) {
                return picks;
            }

            const lowestPower = Math.min(
                ...picks.map((pick) => pick.power)
            );

            let applied = false;

            return picks.map((pick) => {
                if (
                    applied ||
                    pick.power !== lowestPower
                ) {
                    return pick;
                }

                applied = true;

                const missingPower =
                    99 - pick.power;

                const bonus = Math.round(
                    missingPower * 0.25
                );

                return addPower(
                    pick,
                    bonus
                );
            });
        }

        case "Perfect Chemistry": {
            return picks.map((pick) => {
                const synergyBonus =
                    pick.power - pick.basePower;

                if (synergyBonus <= 0) {
                    return pick;
                }

                const additionalBonus =
                    Math.round(
                        synergyBonus * 0.75
                    );

                return addPower(
                    pick,
                    additionalBonus
                );
            });
        }

        case "Elite Core": {
            const topThree = [...picks]
                .sort(
                    (a, b) =>
                        b.power - a.power
                )
                .slice(0, 3);

            const positions = new Set(
                topThree.map(
                    (pick) => pick.position
                )
            );

            return picks.map((pick) =>
                positions.has(pick.position)
                    ? addPercentagePower(
                        pick,
                        0.03
                    )
                    : pick
            );
        }

        case "Second Wind": {
            const eligible = [...picks]
                .filter(
                    (pick) =>
                        pick.power < 75
                )
                .sort(
                    (a, b) =>
                        a.power - b.power
                )
                .slice(0, 4);

            const positions = new Set(
                eligible.map(
                    (pick) => pick.position
                )
            );

            return picks.map((pick) =>
                positions.has(pick.position)
                    ? addPercentagePower(
                        pick,
                        0.04
                    )
                    : pick
            );
        }

        case "Power Surge": {
            if (!powerPosition) {
                return picks;
            }

            return picks.map((pick) =>
                pick.position === powerPosition
                    ? addPercentagePower(
                        pick,
                        0.08
                    )
                    : pick
            );
        }

        case "Master Tactician": {
            return picks.map((pick) =>
                pick.position === "Captain" ||
                pick.position === "Strategist"
                    ? addPercentagePower(
                        pick,
                        0.05
                    )
                    : pick
            );
        }

        case "Balanced Formation": {
            if (picks.length === 0) {
                return picks;
            }

            const teamAverage =
                picks.reduce(
                    (total, pick) =>
                        total + pick.power,
                    0
                ) / picks.length;

            return picks.map((pick) =>
                Math.abs(
                    pick.power - teamAverage
                ) <= 10
                    ? addPercentagePower(
                        pick,
                        0.02
                    )
                    : pick
            );
        }

        case "Underdogs": {
            const bottomThree = [...picks]
                .sort(
                    (a, b) =>
                        a.power - b.power
                )
                .slice(0, 3);

            const positions = new Set(
                bottomThree.map(
                    (pick) => pick.position
                )
            );

            return picks.map((pick) =>
                positions.has(pick.position)
                    ? addPercentagePower(
                        pick,
                        0.05
                    )
                    : pick
            );
        }

        case "Momentum": {
            return picks.map((pick) =>
                pick.power >= 80
                    ? addPercentagePower(
                        pick,
                        0.02
                    )
                    : pick
            );
        }

        case "Star Player": {
            if (picks.length === 0) {
                return picks;
            }

            const highestPower = Math.max(
                ...picks.map(
                    (pick) => pick.power
                )
            );

            let applied = false;

            return picks.map((pick) => {
                if (
                    applied ||
                    pick.power !== highestPower
                ) {
                    return pick;
                }

                applied = true;

                return addPercentagePower(
                    pick,
                    0.08
                );
            });
        }

        case "Chain Reaction": {
            const animeCounts =
                picks.reduce<Record<string, number>>(
                    (counts, pick) => {
                        counts[pick.character.anime] =
                            (counts[
                                pick.character.anime
                                ] ?? 0) + 1;

                        return counts;
                    },
                    {}
                );

            return picks.map((pick) => {
                const sameAnimeCount =
                    animeCounts[
                        pick.character.anime
                        ] ?? 1;

                if (sameAnimeCount < 2) {
                    return pick;
                }

                const percentage =
                    sameAnimeCount >= 3
                        ? 0.03
                        : 0.02;

                return addPercentagePower(
                    pick,
                    percentage
                );
            });
        }

        case "Command Structure": {
            return picks.map((pick) =>
                pick.position === "Captain" ||
                pick.position ===
                "Vice Captain" ||
                pick.position ===
                "Strategist"
                    ? addPercentagePower(
                        pick,
                        0.03
                    )
                    : pick
            );
        }

        case "Unstoppable Force": {
            return picks.map((pick) => {
                const qualifies =
                    pick.position === "Vanguard" ||
                    pick.position === "Ace" ||
                    (
                        powerPosition !== null &&
                        pick.position ===
                        powerPosition
                    );

                return qualifies
                    ? addPercentagePower(
                        pick,
                        0.03
                    )
                    : pick;
            });
        }

        case "Utility Network": {
            return picks.map((pick) =>
                pick.position === "Support" ||
                pick.position === "Scout" ||
                pick.position ===
                "Strategist"
                    ? addPercentagePower(
                        pick,
                        0.03
                    )
                    : pick
            );
        }

        case "Last Stand": {
            return picks.map((pick) =>
                pick.power < 70
                    ? addPercentagePower(
                        pick,
                        0.25
                    )
                    : pick
            );
        }

        case "Dynamic Duo": {
            const topTwo = [...picks]
                .sort(
                    (a, b) =>
                        b.power - a.power
                )
                .slice(0, 2);

            const positions = new Set(
                topTwo.map(
                    (pick) => pick.position
                )
            );

            return picks.map((pick) =>
                positions.has(pick.position)
                    ? addPercentagePower(
                        pick,
                        0.04
                    )
                    : pick
            );
        }

        case "Perfect Fit": {
            const elitePicks = [...picks]
                .filter(
                    (pick) =>
                        pick.power >= 90
                )
                .sort(
                    (a, b) =>
                        b.power - a.power
                )
                .slice(0, 3);

            const positions = new Set(
                elitePicks.map(
                    (pick) => pick.position
                )
            );

            return picks.map((pick) =>
                positions.has(pick.position)
                    ? addPercentagePower(
                        pick,
                        0.02
                    )
                    : pick
            );
        }

        case "Power Through Numbers": {
            const hasSPlus =
                picks.some(
                    (pick) =>
                        pick.power >= 95
                );

            if (hasSPlus) {
                return picks;
            }

            return picks.map((pick) =>
                addPercentagePower(
                    pick,
                    0.015
                )
            );
        }

        case "Anime Alliance": {
            const groups = new Map<
                string,
                DraftPick[]
            >();

            for (const pick of picks) {
                const anime =
                    pick.character.anime;

                const current =
                    groups.get(anime) ?? [];

                current.push(pick);

                groups.set(
                    anime,
                    current
                );
            }

            const largestGroup =
                [...groups.entries()]
                    .filter(
                        ([, group]) =>
                            group.length >= 2
                    )
                    .sort((a, b) => {
                        if (
                            b[1].length !==
                            a[1].length
                        ) {
                            return (
                                b[1].length -
                                a[1].length
                            );
                        }

                        const aPower =
                            a[1].reduce(
                                (total, pick) =>
                                    total +
                                    pick.power,
                                0
                            );

                        const bPower =
                            b[1].reduce(
                                (total, pick) =>
                                    total +
                                    pick.power,
                                0
                            );

                        return (
                            bPower -
                            aPower
                        );
                    })[0];

            if (!largestGroup) {
                return picks;
            }

            const selectedAnime =
                largestGroup[0];

            return picks.map((pick) =>
                pick.character.anime ===
                selectedAnime
                    ? addPercentagePower(
                        pick,
                        0.03
                    )
                    : pick
            );
        }

        case "Anchor Point": {
            return picks.map((pick) => {
                if (
                    pick.position === "Vanguard"
                ) {
                    return addPercentagePower(
                        pick,
                        0.05
                    );
                }

                if (
                    pick.position === "Support"
                ) {
                    return addPercentagePower(
                        pick,
                        0.03
                    );
                }

                return pick;
            });
        }

        case "Strike Team": {
            return picks.map((pick) =>
                pick.position === "Assassin" ||
                pick.position === "Scout" ||
                pick.position === "Ace"
                    ? addPercentagePower(
                        pick,
                        0.03
                    )
                    : pick
            );
        }

        case "Wide Formation": {
            const corePicks =
                picks.filter((pick) =>
                    draftPositions.includes(
                        pick.position as DraftPosition
                    )
                );

            if (
                corePicks.length !==
                draftPositions.length
            ) {
                return picks;
            }

            const powers =
                corePicks.map(
                    (pick) => pick.power
                );

            const highest =
                Math.max(...powers);

            const lowest =
                Math.min(...powers);

            if (
                highest - lowest > 20
            ) {
                return picks;
            }

            return picks.map((pick) =>
                addPercentagePower(
                    pick,
                    0.015
                )
            );
        }

        case "One for All": {
            const captain =
                picks.find(
                    (pick) =>
                        pick.position ===
                        "Captain"
                );

            if (!captain) {
                return picks;
            }

            const teammatesBelow =
                picks.filter(
                    (pick) =>
                        pick.position !==
                        "Captain" &&
                        pick.power <
                        captain.power
                ).length;

            const percentage =
                Math.min(
                    teammatesBelow * 0.01,
                    0.06
                );

            if (percentage <= 0) {
                return picks;
            }

            return picks.map((pick) =>
                pick.position === "Captain"
                    ? addPercentagePower(
                        pick,
                        percentage
                    )
                    : pick
            );
        }

        case "All for One": {
            const captain =
                picks.find(
                    (pick) =>
                        pick.position ===
                        "Captain"
                );

            if (!captain) {
                return picks;
            }

            const teammatesAbove =
                picks.filter(
                    (pick) =>
                        pick.position !==
                        "Captain" &&
                        pick.power >
                        captain.power
                ).length;

            const percentage =
                Math.min(
                    teammatesAbove * 0.01,
                    0.07
                );

            if (percentage <= 0) {
                return picks;
            }

            return picks.map((pick) =>
                pick.position === "Captain"
                    ? addPercentagePower(
                        pick,
                        percentage
                    )
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
    if (
        isUltraPick(
            character,
            position
        )
    ) {
        return 99;
    }

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

export function getDraftPickGrade(
    character: DraftCharacter,
    position: AnyDraftPosition,
    power: number
) {
    if (
        isUltraPick(
            character,
            position
        )
    ) {
        return "U";
    }

    return getLetterGrade(
        power
    );
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

export function isUltraPick(
    character: DraftCharacter,
    position: AnyDraftPosition
) {
    return (
        character.rarity?.type ===
        "Ultra" &&
        character.rarity.position ===
        position
    );
}

export function getPowerPositionMatchupPoints(
    position: PowerPosition | null | undefined
) {
    if (
        position === "Apex" ||
        position === "One Man Army"
    ) {
        return 2;
    }

    return 1;
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
        description:
            "Only characters with virtually no weaknesses can dominate this role.",
        scoring:
            "Uses the character's 3 weakest attributes • Win = 2 matchup points",
    },

    "One Man Army": {
        description:
            "Designed for characters capable of doing everything themselves.",
        scoring:
            "Uses all 6 attributes with bonuses for elite stats • Win = 2 matchup points",
    },
};

export type AscensionPreviewEntry = {
    position: DraftPick["position"];

    affected: boolean;

    beforePower: number;
    afterPower: number;

    powerGain: number;

    beforeGrade: string;
    afterGrade: string;
};


export function getAscensionPreview(
    picks: DraftPick[],
    ascension: Ascension,
    powerPosition: PowerPosition | null
): AscensionPreviewEntry[] {
    if (picks.length === 0) {
        return [];
    }

    /*
     * IMPORTANT:
     *
     * We use the REAL applyAscension function.
     * Nothing is saved. This is only a local
     * simulation for the UI.
     */

    const previewPicks =
        applyAscension(
            picks,
            ascension,
            powerPosition
        );


    return picks.map(
        (originalPick) => {
            const previewPick =
                previewPicks.find(
                    (pick) =>
                        pick.position ===
                        originalPick.position
                );


            /*
             * Should never happen because
             * applyAscension preserves picks,
             * but this keeps the helper safe.
             */
            if (!previewPick) {
                return {
                    position:
                    originalPick.position,

                    affected:
                        false,

                    beforePower:
                    originalPick.power,

                    afterPower:
                    originalPick.power,

                    powerGain:
                        0,

                    beforeGrade:
                    originalPick.grade,

                    afterGrade:
                    originalPick.grade,
                };
            }


            const powerGain =
                previewPick.power -
                originalPick.power;


            return {
                position:
                originalPick.position,

                affected:
                    powerGain > 0,

                beforePower:
                originalPick.power,

                afterPower:
                previewPick.power,

                powerGain,

                beforeGrade:
                originalPick.grade,

                afterGrade:
                previewPick.grade,
            };
        }
    );
}

export function getPositionWeights(
    position: DraftPosition | PowerPosition
): Partial<Record<CharacterStat, number>> | null {
    if (position in positionWeights) {
        return positionWeights[
            position as DraftPosition
            ];
    }

    if (position in powerPositionWeights) {
        return powerPositionWeights[
            position as WeightedPowerPosition
            ];
    }

    return null;
}


export function applySynergyBonuses(
    picks: DraftPick[]
) {
    const animeCounts =
        picks.reduce<
            Record<string, number>
        >(
            (counts, pick) => {
                counts[
                    pick.character.anime
                    ] =
                    (
                        counts[
                            pick.character.anime
                            ] ?? 0
                    ) + 1;

                return counts;
            },
            {}
        );


    return picks.map(
        (pick) => {
            const sameAnimeCount =
                animeCounts[
                    pick.character.anime
                    ] ?? 1;


            const hasSynergy =
                sameAnimeCount >= 2;


            /*
             * ULTRA OVERRIDE
             *
             * An Ultra pick is permanently
             * U / 99 regardless of synergy.
             */
            if (
                isUltraPick(
                    pick.character,
                    pick.position
                )
            ) {
                return {
                    ...pick,

                    basePower: 99,
                    power: 99,
                    grade: "U",

                    hasSynergy,
                };
            }


            const synergyBonus =
                hasSynergy
                    ? Math.min(
                        sameAnimeCount -
                        1,
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
                    getLetterGrade(
                        power
                    ),

                hasSynergy,
            };
        }
    );
}

// =============================================================
// DISRUPTIONS
// =============================================================

export type Disruption =
    | "Sabotage"
    | "Pressure Point"
    | "Disrupt Formation"
    | "Break the Line"
    | "Cut the Supply"
    | "Target Lock"
    | "Anti-Synergy"
    | "Crush Momentum"
    | "Expose Weakness"
    | "Level the Field"
    | "Isolation"
    | "Decapitation Strike"
    | "Disarm"
    | "Fortress Breaker";


export const disruptionInfo: Record<
    Disruption,
    {
        description: string;
    }
> = {
    Sabotage: {
        description:
            "Enemy's highest-rated character loses 6% Power.",
    },

    "Pressure Point": {
        description:
            "Enemy's lowest-rated character loses 8% Power.",
    },

    "Disrupt Formation": {
        description:
            "Enemy Captain, Vice Captain, and Strategist lose 3% Power.",
    },

    "Break the Line": {
        description:
            "Enemy Vanguard, Ace, and Power Position lose 3% Power.",
    },

    "Cut the Supply": {
        description:
            "Enemy Support, Scout, and Strategist lose 3% Power.",
    },

    "Target Lock": {
        description:
            "Enemy Power Position loses 8% Power.",
    },

    "Anti-Synergy": {
        description:
            "Enemy cannot have Series Link bonuses.",
    },

    "Crush Momentum": {
        description:
            "Enemy characters rated A or higher lose 2% Power.",
    },

    "Expose Weakness": {
        description:
            "Enemy's bottom 3 characters lose 4% Power.",
    },

    "Level the Field": {
        description:
            "Enemy's top 3 characters lose 3% Power.",
    },

    Isolation: {
        description:
            "Enemy's largest same-series group loses 3% Power.",
    },

    "Decapitation Strike": {
        description:
            "Enemy Captain loses 8% Power.",
    },

    Disarm: {
        description:
            "Enemy Assassin, Ace, and Scout lose 3% Power.",
    },

    "Fortress Breaker": {
        description:
            "Enemy Vanguard and Support lose 4% Power.",
    },
};


export function getRandomDisruptions(
    count = 3
): Disruption[] {
    const disruptions =
        Object.keys(
            disruptionInfo
        ) as Disruption[];

    return [...disruptions]
        .sort(
            () =>
                Math.random() - 0.5
        )
        .slice(
            0,
            count
        );
}


// =============================================================
// DISRUPTION POWER HELPERS
// =============================================================

function removePower(
    pick: DraftPick,
    amount: number
): DraftPick {
    /*
     * U characters are completely immune
     * to Disruptions.
     */
    if (
        isUltraPick(
            pick.character,
            pick.position
        )
    ) {
        return {
            ...pick,

            power: 99,
            grade: "U",

            disruptionPenalty:
                pick.disruptionPenalty ??
                0,
        };
    }

    const previousPower =
        pick.power;

    const power =
        Math.max(
            0,
            previousPower - amount
        );

    const actualLoss =
        previousPower - power;

    return {
        ...pick,

        power,

        grade:
            getDraftPickGrade(
                pick.character,
                pick.position,
                power
            ),

        disruptionPenalty:
            (
                pick.disruptionPenalty ??
                0
            ) + actualLoss,
    };
}


function removePercentagePower(
    pick: DraftPick,
    percentage: number
): DraftPick {
    const loss =
        Math.round(
            pick.power *
            percentage
        );

    return removePower(
        pick,
        loss
    );
}

export function applyDisruption(
    picks: DraftPick[],
    disruption: Disruption,
    powerPosition: PowerPosition | null,
    selectedAscension: Ascension | null = null
): DraftPick[] {
    switch (disruption) {
        // =====================================================
        // HIGHEST CHARACTER -6%
        // =====================================================

        case "Sabotage": {
            if (picks.length === 0) {
                return picks;
            }

            const highestPower =
                Math.max(
                    ...picks.map(
                        (pick) =>
                            pick.power
                    )
                );

            let applied = false;

            return picks.map(
                (pick) => {
                    if (
                        applied ||
                        pick.power !==
                        highestPower
                    ) {
                        return pick;
                    }

                    applied = true;

                    return removePercentagePower(
                        pick,
                        0.06
                    );
                }
            );
        }


        // =====================================================
        // LOWEST CHARACTER -8%
        // =====================================================

        case "Pressure Point": {
            if (picks.length === 0) {
                return picks;
            }

            const lowestPower =
                Math.min(
                    ...picks.map(
                        (pick) =>
                            pick.power
                    )
                );

            let applied = false;

            return picks.map(
                (pick) => {
                    if (
                        applied ||
                        pick.power !==
                        lowestPower
                    ) {
                        return pick;
                    }

                    applied = true;

                    return removePercentagePower(
                        pick,
                        0.08
                    );
                }
            );
        }


        // =====================================================
        // CAPTAIN / VICE / STRATEGIST -3%
        // =====================================================

        case "Disrupt Formation": {
            return picks.map(
                (pick) =>
                    pick.position ===
                    "Captain" ||

                    pick.position ===
                    "Vice Captain" ||

                    pick.position ===
                    "Strategist"

                        ? removePercentagePower(
                            pick,
                            0.03
                        )

                        : pick
            );
        }


        // =====================================================
        // VANGUARD / ACE / POWER POSITION -3%
        // =====================================================

        case "Break the Line": {
            return picks.map(
                (pick) => {
                    const affected =
                        pick.position ===
                        "Vanguard" ||

                        pick.position ===
                        "Ace" ||

                        (
                            powerPosition !==
                            null &&

                            pick.position ===
                            powerPosition
                        );

                    return affected
                        ? removePercentagePower(
                            pick,
                            0.03
                        )
                        : pick;
                }
            );
        }


        // =====================================================
        // SUPPORT / SCOUT / STRATEGIST -3%
        // =====================================================

        case "Cut the Supply": {
            return picks.map(
                (pick) =>
                    pick.position ===
                    "Support" ||

                    pick.position ===
                    "Scout" ||

                    pick.position ===
                    "Strategist"

                        ? removePercentagePower(
                            pick,
                            0.03
                        )

                        : pick
            );
        }


        // =====================================================
        // POWER POSITION -8%
        // =====================================================

        case "Target Lock": {
            if (!powerPosition) {
                return picks;
            }

            return picks.map(
                (pick) =>
                    pick.position ===
                    powerPosition

                        ? removePercentagePower(
                            pick,
                            0.08
                        )

                        : pick
            );
        }


        // =====================================================
        // REMOVE SERIES LINK
        // =====================================================

        case "Anti-Synergy": {
            return picks.map(
                (pick) => {
                    /*
                     * Current stored Power is:
                     *
                     * Base
                     * + Series Link
                     * + Ascension
                     */

                    const ascensionBonus =
                        pick.ascensionBonus ??
                        0;

                    const preAscensionPower =
                        pick.power -
                        ascensionBonus;

                    /*
                     * This gives us the ACTUAL
                     * Series Link bonus, including
                     * any 99 cap that occurred.
                     */
                    const seriesLinkBonus =
                        Math.max(
                            0,

                            preAscensionPower -
                            pick.basePower
                        );

                    /*
                     * Perfect Chemistry is literally
                     * an amplification of Series Link.
                     *
                     * If Series Link is disabled,
                     * Perfect Chemistry must disappear
                     * too.
                     */
                    const perfectChemistryBonus =
                        selectedAscension ===
                        "Perfect Chemistry"

                            ? ascensionBonus

                            : 0;

                    const updated =
                        removePower(
                            pick,

                            seriesLinkBonus +
                            perfectChemistryBonus
                        );

                    return {
                        ...updated,

                        /*
                         * Visually remove the
                         * Series Link indicator too.
                         */
                        hasSynergy:
                            false,
                    };
                }
            );
        }


        // =====================================================
        // A OR HIGHER -2%
        // =====================================================

        case "Crush Momentum": {
            return picks.map(
                (pick) =>
                    pick.power >= 80

                        ? removePercentagePower(
                            pick,
                            0.02
                        )

                        : pick
            );
        }


        // =====================================================
        // BOTTOM 3 -4%
        // =====================================================

        case "Expose Weakness": {
            const bottomThree =
                [...picks]
                    .sort(
                        (a, b) =>
                            a.power -
                            b.power
                    )
                    .slice(
                        0,
                        3
                    );

            const positions =
                new Set(
                    bottomThree.map(
                        (pick) =>
                            pick.position
                    )
                );

            return picks.map(
                (pick) =>
                    positions.has(
                        pick.position
                    )

                        ? removePercentagePower(
                            pick,
                            0.04
                        )

                        : pick
            );
        }


        // =====================================================
        // TOP 3 -3%
        // =====================================================

        case "Level the Field": {
            const topThree =
                [...picks]
                    .sort(
                        (a, b) =>
                            b.power -
                            a.power
                    )
                    .slice(
                        0,
                        3
                    );

            const positions =
                new Set(
                    topThree.map(
                        (pick) =>
                            pick.position
                    )
                );

            return picks.map(
                (pick) =>
                    positions.has(
                        pick.position
                    )

                        ? removePercentagePower(
                            pick,
                            0.03
                        )

                        : pick
            );
        }


        // =====================================================
        // LARGEST SAME-SERIES GROUP -3%
        // =====================================================

        case "Isolation": {
            const groups =
                new Map<
                    string,
                    DraftPick[]
                >();

            for (
                const pick
                of picks
                ) {
                const anime =
                    pick.character.anime;

                const current =
                    groups.get(
                        anime
                    ) ?? [];

                current.push(
                    pick
                );

                groups.set(
                    anime,
                    current
                );
            }

            const largestGroup =
                [...groups.entries()]
                    .filter(
                        ([, group]) =>
                            group.length >= 2
                    )
                    .sort(
                        (a, b) => {
                            /*
                             * Biggest group wins.
                             */
                            if (
                                b[1].length !==
                                a[1].length
                            ) {
                                return (
                                    b[1].length -
                                    a[1].length
                                );
                            }

                            /*
                             * Tie:
                             * target the stronger
                             * group.
                             */
                            const aPower =
                                a[1].reduce(
                                    (
                                        total,
                                        pick
                                    ) =>
                                        total +
                                        pick.power,
                                    0
                                );

                            const bPower =
                                b[1].reduce(
                                    (
                                        total,
                                        pick
                                    ) =>
                                        total +
                                        pick.power,
                                    0
                                );

                            return (
                                bPower -
                                aPower
                            );
                        }
                    )[0];

            if (!largestGroup) {
                return picks;
            }

            const selectedAnime =
                largestGroup[0];

            return picks.map(
                (pick) =>
                    pick.character.anime ===
                    selectedAnime

                        ? removePercentagePower(
                            pick,
                            0.03
                        )

                        : pick
            );
        }


        // =====================================================
        // CAPTAIN -8%
        // =====================================================

        case "Decapitation Strike": {
            return picks.map(
                (pick) =>
                    pick.position ===
                    "Captain"

                        ? removePercentagePower(
                            pick,
                            0.08
                        )

                        : pick
            );
        }


        // =====================================================
        // ASSASSIN / ACE / SCOUT -3%
        // =====================================================

        case "Disarm": {
            return picks.map(
                (pick) =>
                    pick.position ===
                    "Assassin" ||

                    pick.position ===
                    "Ace" ||

                    pick.position ===
                    "Scout"

                        ? removePercentagePower(
                            pick,
                            0.03
                        )

                        : pick
            );
        }


        // =====================================================
        // VANGUARD / SUPPORT -4%
        // =====================================================

        case "Fortress Breaker": {
            return picks.map(
                (pick) =>
                    pick.position ===
                    "Vanguard" ||

                    pick.position ===
                    "Support"

                        ? removePercentagePower(
                            pick,
                            0.04
                        )

                        : pick
            );
        }


        default:
            return picks;
    }
}

export type DisruptionPreviewEntry = {
    position:
        DraftPick["position"];

    affected: boolean;

    beforePower: number;
    afterPower: number;

    powerLoss: number;

    beforeGrade: string;
    afterGrade: string;
};


export function getDisruptionPreview(
    picks: DraftPick[],
    disruption: Disruption,
    powerPosition: PowerPosition | null,
    selectedAscension: Ascension | null = null
): DisruptionPreviewEntry[] {
    const previewPicks =
        applyDisruption(
            picks,
            disruption,
            powerPosition,
            selectedAscension
        );

    return picks.map(
        (originalPick) => {
            const previewPick =
                previewPicks.find(
                    (pick) =>
                        pick.position ===
                        originalPick.position
                );

            if (!previewPick) {
                return {
                    position:
                    originalPick.position,

                    affected:
                        false,

                    beforePower:
                    originalPick.power,

                    afterPower:
                    originalPick.power,

                    powerLoss:
                        0,

                    beforeGrade:
                    originalPick.grade,

                    afterGrade:
                    originalPick.grade,
                };
            }

            const powerLoss =
                originalPick.power -
                previewPick.power;

            return {
                position:
                originalPick.position,

                affected:
                    powerLoss > 0,

                beforePower:
                originalPick.power,

                afterPower:
                previewPick.power,

                powerLoss,

                beforeGrade:
                originalPick.grade,

                afterGrade:
                previewPick.grade,
            };
        }
    );
}