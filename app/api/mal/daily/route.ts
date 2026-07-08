import { NextResponse } from "next/server";
import {isFirstSeasonAnime, formatSource} from "@/lib/anime";

function dateSeed(date: string) {
    let seed = 0;

    for (let i = 0; i < date.length; i++) {
        seed = (seed * 31 + date.charCodeAt(i)) >>> 0;
    }

    return seed;
}

export async function GET() {
    const clientId = process.env.MAL_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: "Missing MAL_CLIENT_ID" },
            { status: 500 }
        );
    }

    const today = new Date().toISOString().slice(0, 10);
    const seed = dateSeed(today);

    // Random deterministic anime from top 1000 popularity
    const offset = seed % 1000;

    const url = new URL("https://api.myanimelist.net/v2/anime/ranking");
    url.searchParams.set("ranking_type", "bypopularity");
    url.searchParams.set("limit", "50");
    url.searchParams.set("offset", String(Math.max(0, offset - 25)));
    url.searchParams.set(
        "fields",
        [
            "id",
            "title",
            "alternative_titles",
            "main_picture",
            "media_type",
            "num_episodes",
            "start_season",
            "mean",
            "rank",
            "popularity",
            "source",
            "studios",
            "genres",
            "rating",
        ].join(",")
    );

    try {
        const res = await fetch(url.toString(), {
            headers: {
                "X-MAL-CLIENT-ID": clientId,
            },
            next: { revalidate: 86400 },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `MyAnimeList error: ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();

        const candidates = (json.data ?? [])
            .map((entry: any) => entry.node)
            .filter(isFirstSeasonAnime);

        if (candidates.length === 0) {
            return NextResponse.json(
                { error: "No daily anime found" },
                { status: 404 }
            );
        }

        const anime = candidates[seed % candidates.length];

        return NextResponse.json({
            data: {
                mal_id: anime.id,
                title:
                    anime.alternative_titles?.en ||
                    anime.title,
                title_english: anime.alternative_titles?.en ?? null,
                source: formatSource(anime.source) ?? null,
                year: anime.start_season?.year ?? null,
                score: anime.mean ?? null,
                studio: anime.studios?.[0]?.name ?? null,
                genres: anime.genres?.map((genre: any) => genre.name) ?? [],
                images: {
                    jpg: {
                        image_url: anime.main_picture?.medium ?? null,
                        large_image_url: anime.main_picture?.large ?? null,
                    },
                },
                type: anime.media_type?.toUpperCase() ?? null,
                episodes: anime.num_episodes ?? null,
                popularity: anime.popularity ?? null,
                rating: anime.rating ?? null,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Server failed to reach MyAnimeList" },
            { status: 500 }
        );
    }
}