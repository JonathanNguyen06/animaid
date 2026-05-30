import { NextResponse } from "next/server";
import {isFirstSeasonAnime} from "@/app/api/jikan/daily/route";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (!q) {
        return NextResponse.json(
            { error: "Missing guess" },
            { status: 400 }
        );
    }

    const url = new URL("https://api.jikan.moe/v4/anime");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "1");
    url.searchParams.set("sfw", "true");

    try {
        const res = await fetch(url.toString(), {
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Jikan error: ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();
        const anime = (json.data ?? []).find(isFirstSeasonAnime);

        if (!anime) {
            return NextResponse.json(
                { error: "Anime not found" },
                { status: 404 }
            );
        }

        const simplified = {
            mal_id: anime.mal_id,
            title: anime.title_english || anime.title,
            title_english: anime.title_english,
            source: anime.source,
            year: anime.year,
            score: anime.score,
            studio: anime.studios?.[0]?.name ?? null,
            genres: anime.genres?.map((genre: any) => genre.name) ?? [],
        };

        return NextResponse.json({ data: simplified });
    } catch {
        return NextResponse.json(
            { error: "Server failed to reach Jikan" },
            { status: 500 }
        );
    }
}