import { NextResponse } from "next/server";

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getValidCharacterImage(entry: any) {
    const jpg = entry.character?.images?.jpg?.image_url;
    const webp = entry.character?.images?.webp?.image_url;

    const imageUrl = jpg || webp;

    if (!imageUrl) return null;

    const invalidImageParts = [
        "questionmark",
        "question_mark",
        "no_image",
        "noimage",
        "placeholder",
        "default",
    ];

    const lowerImageUrl = imageUrl.toLowerCase();

    const isInvalid = invalidImageParts.some((part) =>
        lowerImageUrl.includes(part)
    );

    if (isInvalid) return null;

    return imageUrl;
}

async function getCharacterFromAnime(anime: any) {
    const charactersRes = await fetch(
        `https://api.jikan.moe/v4/anime/${anime.mal_id}/characters`
    );

    if (!charactersRes.ok) return null;

    const charactersJson = await charactersRes.json();

    const characters = (charactersJson.data ?? []).filter((entry: any) => {
        const imageUrl = getValidCharacterImage(entry);

        return (
            entry.character?.mal_id &&
            entry.character?.name &&
            imageUrl
        );
    });

    if (characters.length === 0) return null;

    const entry = characters[randomInt(0, characters.length - 1)];
    const imageUrl = getValidCharacterImage(entry);

    if (!imageUrl) return null;

    let favorites = entry.character?.favorites ?? entry.favorites ?? 0;

    try {
        const characterRes = await fetch(
            `https://api.jikan.moe/v4/characters/${entry.character.mal_id}/full`
        );

        if (characterRes.ok) {
            const characterJson = await characterRes.json();

            favorites = characterJson.data?.favorites ?? favorites;
        }
    } catch {
        // keep fallback favorites
    }

    return {
        anime: {
            mal_id: anime.mal_id,
            title: anime.title,
            title_english: anime.title_english ?? anime.title,
            score: anime.score ?? 0,
            popularity: anime.popularity ?? 5000,
        },
        character: {
            mal_id: entry.character.mal_id,
            name: entry.character.name,
            images: {
                jpg: {
                    image_url: imageUrl,
                },
                webp: {
                    image_url: imageUrl,
                },
            },
            favorites,
            role: entry.role ?? "Supporting",
        },
    };
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const wishlist =
            searchParams
                .get("wishlist")
                ?.split(",")
                .map(Number)
                .filter(Boolean) ?? [];

        const shouldUseWishlist = wishlist.length > 0 && Math.random() < 0.05;

        if (shouldUseWishlist) {
            for (let attempt = 0; attempt < 5; attempt++) {
                const animeId = wishlist[randomInt(0, wishlist.length - 1)];

                const animeRes = await fetch(
                    `https://api.jikan.moe/v4/anime/${animeId}`
                );

                if (!animeRes.ok) continue;

                const animeJson = await animeRes.json();
                const anime = animeJson.data;

                if (!anime) continue;

                const result = await getCharacterFromAnime(anime);

                if (result) {
                    return NextResponse.json({ data: result });
                }
            }
        }

        for (let attempt = 0; attempt < 30; attempt++) {
            const page = randomInt(1, 40);

            const topAnimeRes = await fetch(
                `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${page}&limit=25`
            );

            if (!topAnimeRes.ok) continue;

            const topAnimeJson = await topAnimeRes.json();
            const animeList = topAnimeJson.data ?? [];

            if (animeList.length === 0) continue;

            const anime = animeList[randomInt(0, animeList.length - 1)];

            const result = await getCharacterFromAnime(anime);

            if (result) {
                return NextResponse.json({ data: result });
            }
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