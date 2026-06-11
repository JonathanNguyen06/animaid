import { NextResponse } from "next/server";

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET() {
    try {
        const page = randomInt(1, 20);

        const res = await fetch(
            `https://api.jikan.moe/v4/top/characters?page=${page}&limit=25`
        );

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to load top characters." },
                { status: 500 }
            );
        }

        const json = await res.json();

        const characters = (json.data ?? []).filter((character: any) => {
            const imageUrl =
                character.images?.jpg?.image_url ||
                character.images?.webp?.image_url;

            return character.mal_id && character.name && imageUrl;
        });

        if (characters.length === 0) {
            return NextResponse.json(
                { error: "Could not find a valid character." },
                { status: 404 }
            );
        }

        const character = characters[randomInt(0, characters.length - 1)];

        let animeId = 0;
        let animeTitle = "";

        try {
            const fullRes = await fetch(
                `https://api.jikan.moe/v4/characters/${character.mal_id}/full`
            );

            if (fullRes.ok) {
                const fullJson = await fullRes.json();

                const firstAnime =
                    fullJson.data?.animeography?.[0]?.anime ||
                    fullJson.data?.anime?.[0]?.anime;

                if (firstAnime) {
                    animeId = firstAnime.mal_id ?? 0;
                    animeTitle =
                        firstAnime.title_english ||
                        firstAnime.title ||
                        "";
                }
            }
        } catch {
            // Anime info is optional.
        }

        const imageUrl =
            character.images?.jpg?.image_url ||
            character.images?.webp?.image_url;

        return NextResponse.json({
            data: {
                mal_id: character.mal_id,
                name: character.name,
                imageUrl,
                favorites: character.favorites ?? 0,
                animeId,
                animeTitle,
            },
        });
    } catch (error) {
        console.error("Higher/lower character error:", error);

        return NextResponse.json(
            { error: "Failed to load character." },
            { status: 500 }
        );
    }
}