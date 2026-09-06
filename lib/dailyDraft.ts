import {
    draftCharacters,
    type DraftCharacter,
} from "@/data/draftCharacters";

import {
    applySynergyBonuses,
    calculateDraftPower,
    draftPositions,
    getDraftPickGrade,
} from "@/data/draftLogic";

import type {
    DraftPick,
} from "@/types/draft";


export type DailyDraftSolution = {
    picks: DraftPick[];
    totalPower: number;
};


/*
 * ==========================================
 * DAILY DATE
 * ==========================================
 *
 * Daily Draft resets at midnight
 * Pacific Time.
 */

export function getDailyDraftDate(
    date = new Date()
) {
    const formatter =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    "America/Los_Angeles",

                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }
        );

    const parts =
        formatter.formatToParts(
            date
        );

    const year =
        parts.find(
            (part) =>
                part.type === "year"
        )?.value;

    const month =
        parts.find(
            (part) =>
                part.type === "month"
        )?.value;

    const day =
        parts.find(
            (part) =>
                part.type === "day"
        )?.value;

    return `${year}-${month}-${day}`;
}


/*
 * ==========================================
 * STRING -> NUMBER SEED
 * ==========================================
 */

function hashString(
    value: string
) {
    let hash =
        2166136261;

    for (
        let index = 0;
        index < value.length;
        index++
    ) {
        hash ^=
            value.charCodeAt(
                index
            );

        hash =
            Math.imul(
                hash,
                16777619
            );
    }

    return hash >>> 0;
}


/*
 * ==========================================
 * SEEDED RANDOM NUMBER GENERATOR
 * ==========================================
 *
 * Same seed = same sequence.
 */

function createSeededRandom(
    seed: number
) {
    return function () {
        seed +=
            0x6d2b79f5;

        let value =
            seed;

        value =
            Math.imul(
                value ^
                (value >>> 15),
                value | 1
            );

        value ^=
            value +
            Math.imul(
                value ^
                (value >>> 7),
                value | 61
            );

        return (
            (
                value ^
                (value >>> 14)
            ) >>>
            0
        ) / 4294967296;
    };
}


/*
 * ==========================================
 * GET TODAY'S 8 CHARACTERS
 * ==========================================
 *
 * Every player receives the same:
 *
 * - 8 characters
 * - in the same order
 *
 * for a given date.
 */

export function getDailyDraftCharacters(
    date: string
): DraftCharacter[] {
    const seed =
        hashString(
            `animaid-daily-draft-${date}`
        );

    const random =
        createSeededRandom(
            seed
        );

    const shuffledCharacters =
        [...draftCharacters];


    /*
     * Seeded Fisher-Yates shuffle.
     */

    for (
        let index =
            shuffledCharacters.length -
            1;

        index > 0;

        index--
    ) {
        const randomIndex =
            Math.floor(
                random() *
                (index + 1)
            );

        [
            shuffledCharacters[index],
            shuffledCharacters[
                randomIndex
                ],
        ] = [
            shuffledCharacters[
                randomIndex
                ],
            shuffledCharacters[index],
        ];
    }


    return shuffledCharacters.slice(
        0,
        8
    );
}


/*
 * Convenience helper for today's
 * characters.
 */

export function getTodaysDailyDraftCharacters() {
    return getDailyDraftCharacters(
        getDailyDraftDate()
    );
}


/*
 * ==========================================
 * CREATE ONE DRAFT PICK
 * ==========================================
 *
 * Uses the EXACT same scoring logic
 * as normal Draft.
 */

function createDailyDraftPick(
    character: DraftCharacter,
    position: DraftPick["position"]
): DraftPick {
    const basePower =
        calculateDraftPower(
            character,
            position
        );

    return {
        character,
        position,

        basePower,
        power:
        basePower,

        grade:
            getDraftPickGrade(
                character,
                position,
                basePower
            ),
    };
}


/*
 * ==========================================
 * CALCULATE FINAL LINEUP
 * ==========================================
 *
 * Applies Series Link after all
 * characters have been placed.
 */

export function calculateDailyDraftLineup(
    picks: DraftPick[]
) {
    const finalPicks =
        applySynergyBonuses(
            picks
        );

    const totalPower =
        finalPicks.reduce(
            (total, pick) =>
                total +
                pick.power,
            0
        );

    return {
        picks: finalPicks,
        totalPower,
    };
}


/*
 * ==========================================
 * FIND PERFECT LINEUP
 * ==========================================
 *
 * 8 characters
 * 8 positions
 *
 * 8! = 40,320 possible lineups.
 *
 * Testing all of them is small enough
 * to guarantee the ACTUAL best lineup.
 */

export function findOptimalDailyLineup(
    characters: DraftCharacter[]
): DailyDraftSolution {
    if (
        characters.length !==
        draftPositions.length
    ) {
        throw new Error(
            `Daily Draft requires exactly ${draftPositions.length} characters.`
        );
    }


    /*
     * Precalculate every
     * character-position combination.
     *
     * 8 characters x 8 positions
     * = only 64 calculations.
     */

    const pickMatrix =
        characters.map(
            (character) =>
                draftPositions.map(
                    (position) =>
                        createDailyDraftPick(
                            character,
                            position
                        )
                )
        );


    let bestTotalPower =
        -Infinity;

    let bestPicks:
        DraftPick[] = [];


    const currentPicks:
        DraftPick[] = [];

    const usedPositionIndexes =
        new Set<number>();


    function search(
        characterIndex: number
    ) {
        /*
         * All 8 characters
         * have been assigned.
         */

        if (
            characterIndex ===
            characters.length
        ) {
            const finalPicks =
                applySynergyBonuses(
                    currentPicks
                );

            const totalPower =
                finalPicks.reduce(
                    (
                        total,
                        pick
                    ) =>
                        total +
                        pick.power,
                    0
                );


            if (
                totalPower >
                bestTotalPower
            ) {
                bestTotalPower =
                    totalPower;

                /*
                 * Store copies because
                 * currentPicks continues
                 * changing during search.
                 */

                bestPicks =
                    finalPicks.map(
                        (pick) => ({
                            ...pick,
                        })
                    );
            }

            return;
        }


        /*
         * Try this character in every
         * still-available position.
         */

        for (
            let positionIndex = 0;

            positionIndex <
            draftPositions.length;

            positionIndex++
        ) {
            if (
                usedPositionIndexes.has(
                    positionIndex
                )
            ) {
                continue;
            }


            usedPositionIndexes.add(
                positionIndex
            );

            currentPicks.push(
                pickMatrix[
                    characterIndex
                    ][
                    positionIndex
                    ]
            );


            search(
                characterIndex + 1
            );


            currentPicks.pop();

            usedPositionIndexes.delete(
                positionIndex
            );
        }
    }


    search(0);


    return {
        picks:
        bestPicks,

        totalPower:
        bestTotalPower,
    };
}


/*
 * ==========================================
 * PERFORMANCE %
 * ==========================================
 *
 * Example:
 *
 * Player: 744
 * Perfect: 768
 *
 * = 96.9%
 */

export function getDailyDraftEfficiency(
    playerPower: number,
    optimalPower: number
) {
    if (
        optimalPower <= 0
    ) {
        return 0;
    }

    return Math.round(
        (
            playerPower /
            optimalPower
        ) *
        1000
    ) / 10;
}