import { NextResponse } from "next/server";

function dateSeed(date: string) {
    let seed = 0;

    for (let i = 0; i < date.length; i++) {
        seed = (seed * 31 + date.charCodeAt(i)) >>> 0;
    }

    return seed;
}

export function isFirstSeasonAnime(anime: any) {
    const title = (anime.title ?? "").toLowerCase();

    const sequelWords = [
        "season 2",
        "season 3",
        "season 4",
        "season 5",
        "season 6",
        "season 7",
        "2nd season",
        "3rd season",
        "4th season",
        "5th season",
        "6th season",
        "7th season",
        "part 2",
        "part 3",
        "part 4",
        "part 5",
        "part 6",
        "part 7",
        "final season",
        "movie",
        "ova",
        "special",
    ];

    const titleLooksLikeSequel = sequelWords.some((word) =>
        title.includes(word)
    );

    const isTv = anime.type === "TV";

    return isTv && !titleLooksLikeSequel;
}

export async function GET() {
    const today = new Date().toISOString().slice(0, 10);
    const seed = dateSeed(today);

    const page = (seed % 21) + 1; // top ~500 with limit 24
    const index = seed % 24;

    const url = new URL("https://api.jikan.moe/v4/anime");
    url.searchParams.set("order_by", "popularity");
    url.searchParams.set("sort", "asc");
    url.searchParams.set("limit", "24");
    url.searchParams.set("page", String(page));
    url.searchParams.set("sfw", "true");

    try {
        const res = await fetch(url.toString(), {
            next: { revalidate: 86400 },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Jikan error: ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();

        const candidates = (json.data ?? []).filter(isFirstSeasonAnime);

        if (candidates.length === 0) {
            return NextResponse.json(
                { error: "No daily anime found" },
                { status: 404 }
            );
        }

        const anime = candidates[index % candidates.length];

        return NextResponse.json({
            data: {
                mal_id: anime.mal_id,
                title: anime.title_english || anime.title,
                title_english: anime.title_english,
                source: anime.source,
                year: anime.year,
                score: anime.score,
                studio: anime.studios?.[0]?.name ?? null,
                genres: anime.genres?.map((genre: any) => genre.name) ?? [],
                images: anime.images,
                type: anime.type,
                episodes: anime.episodes,
                popularity: anime.popularity,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Server failed to reach Jikan" },
            { status: 500 }
        );
    }
}