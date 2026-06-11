import { NextResponse } from "next/server";

function formatAnime(anime: any) {
    return {
        mal_id: anime.mal_id,
        title: anime.title,
        title_english: anime.title_english ?? null,
        source: anime.source ?? null,
        year: anime.year ?? null,
        score: anime.score ?? null,
        studio: anime.studios?.[0]?.name ?? null,
        genres: anime.genres?.map((genre: any) => genre.name) ?? [],
    };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const q = searchParams.get("q");

    try {
        if (id) {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
            const json = await res.json();

            if (!res.ok || !json.data) {
                return NextResponse.json(
                    { error: "Anime not found." },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                data: formatAnime(json.data),
            });
        }

        if (!q) {
            return NextResponse.json(
                { error: "Missing anime search." },
                { status: 400 }
            );
        }

        const res = await fetch(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10`
        );

        const json = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: "Anime not found." },
                { status: 404 }
            );
        }

        const anime = (json.data ?? []).find(
            (item: any) => item.type === "TV"
        );

        if (!anime) {
            return NextResponse.json(
                { error: "Anime not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            data: formatAnime(anime),
        });
    } catch (error) {
        console.error("Guess route error:", error);

        return NextResponse.json(
            { error: "Failed to load anime." },
            { status: 500 }
        );
    }
}