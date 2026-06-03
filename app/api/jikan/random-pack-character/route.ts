import { NextResponse } from "next/server";

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET() {
    try {
        for (let attempt = 0; attempt < 12; attempt++) {
            const page = randomInt(1, 20);

            const topRes = await fetch(
                `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${page}&limit=25`
            );

            if (!topRes.ok) continue;

            const topJson = await topRes.json();
            const animeList = topJson.data ?? [];

            if (animeList.length === 0) continue;

            const anime = animeList[randomInt(0, animeList.length - 1)];

            const charactersRes = await fetch(
                `https://api.jikan.moe/v4/anime/${anime.mal_id}/characters`
            );

            if (!charactersRes.ok) continue;

            const charactersJson = await charactersRes.json();

            const characters = (charactersJson.data ?? []).filter(
                (entry: any) =>
                    entry.character?.mal_id &&
                    entry.character?.name
            );

            if (characters.length === 0) continue;

            const entry = characters[randomInt(0, characters.length - 1)];

            return NextResponse.json({
                data: {
                    anime: {
                        mal_id: anime.mal_id,
                        title: anime.title,
                        title_english: anime.title_english,
                        score: anime.score ?? 0,
                        popularity: anime.popularity ?? 500,
                    },
                    character: {
                        mal_id: entry.character.mal_id,
                        name: entry.character.name,
                        images: entry.character.images,
                        favorites: entry.character.favorites ?? 0,
                        role: entry.role ?? "Supporting",
                    },
                },
            });
        }

        return NextResponse.json(
            { error: "Could not find a valid character after multiple tries." },
            { status: 404 }
        );
    } catch (error) {
        console.error("Random pack character error:", error);

        return NextResponse.json(
            { error: "Failed to generate character." },
            { status: 500 }
        );
    }
}