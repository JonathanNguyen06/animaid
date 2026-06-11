import { NextResponse } from "next/server";

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET() {
    try {
        const page = randomInt(1, 20);

        const res = await fetch(
            `https://api.jikan.moe/v4/top/anime?page=${page}&limit=25`
        );

        const json = await res.json();
        const animeList = json.data ?? [];

        const anime = animeList[randomInt(0, animeList.length - 1)];

        return NextResponse.json({
            data: {
                mal_id: anime.mal_id,
                title: anime.title_english || anime.title,
                imageUrl:
                    anime.images?.jpg?.large_image_url ||
                    anime.images?.jpg?.image_url ||
                    anime.images?.webp?.large_image_url ||
                    anime.images?.webp?.image_url,
                score: anime.score ?? 0,
                popularity: anime.popularity ?? 999999,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to load anime." },
            { status: 500 }
        );
    }
}