import { NextResponse } from "next/server";
import {isFirstSeasonAnime} from "@/lib/anime";

const FIELDS = [
    "alternative_titles",
    "media_type",
    "start_season",
].join(",");

function formatAnime(anime: any) {
    return {
        mal_id: anime.id,
        title: anime.title,
        title_english: anime.alternative_titles?.en ?? null,
        year: anime.start_season?.year ?? null,
        type: anime.media_type?.toUpperCase() ?? null,
    };
}

export async function GET(req: Request) {
    const clientId = process.env.MAL_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: "Missing MAL_CLIENT_ID" },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim();

    const limit = Math.min(
        Number(searchParams.get("limit") ?? 20),
        50
    );

    if (!q) {
        return NextResponse.json(
            { error: "Missing search query." },
            { status: 400 }
        );
    }

    try {
        const url = new URL("https://api.myanimelist.net/v2/anime");

        url.searchParams.set("q", q);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("fields", FIELDS);

        const res = await fetch(url.toString(), {
            headers: {
                "X-MAL-CLIENT-ID": clientId,
            },
            next: {
                revalidate: 86400,
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to search MyAnimeList." },
                { status: res.status }
            );
        }

        const json = await res.json();

        const anime = (json.data ?? [])
            .map((entry: any) => entry.node)
            .filter(isFirstSeasonAnime)
            .map(formatAnime);

        return NextResponse.json({
            data: anime,
        });
    } catch (error) {
        console.error("MAL search error:", error);

        return NextResponse.json(
            { error: "Failed to search anime." },
            { status: 500 }
        );
    }
}