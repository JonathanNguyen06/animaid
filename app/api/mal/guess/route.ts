import { NextResponse } from "next/server";
import {isFirstSeasonAnime, normalizeTitle, formatSource} from "@/lib/anime";

const MAL_API = "https://api.myanimelist.net/v2";

const FIELDS = [
    "id",
    "title",
    "alternative_titles",
    "source",
    "start_season",
    "mean",
    "studios",
    "genres",
    "media_type",
    "num_episodes",
    "popularity",
    "rank",
    "main_picture",
].join(",");

function titleMatchesQuery(anime: any, q: string) {
    const query = normalizeTitle(q);

    const titles = [
        anime.title,
        anime.alternative_titles?.en,
        ...(anime.alternative_titles?.synonyms ?? []),
    ]
        .filter(Boolean)
        .map((title: string) => normalizeTitle(title));

    return titles.some((title) => title === query);
}

function formatAnime(anime: any) {
    return {
        mal_id: anime.id,
        title: anime.alternative_titles?.en || anime.title,
        title_english: anime.alternative_titles?.en ?? null,
        source: formatSource(anime.source) ?? null,
        year: anime.start_season?.year ?? null,
        score: anime.mean ?? null,
        studio: anime.studios?.[0]?.name ?? null,
        genres: anime.genres?.map((genre: any) => genre.name) ?? [],
        type: anime.media_type?.toUpperCase() ?? null,
        episodes: anime.num_episodes ?? null,
        popularity: anime.popularity ?? null,
        rank: anime.rank ?? null,
        images: {
            jpg: {
                image_url: anime.main_picture?.medium ?? null,
                large_image_url: anime.main_picture?.large ?? null,
            },
        },
    };
}

async function fetchMal(url: string, clientId: string) {
    const res = await fetch(url, {
        headers: {
            "X-MAL-CLIENT-ID": clientId,
        },
        next: { revalidate: 86400 },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");

        throw new Error(
            `MAL request failed: ${res.status}${text ? ` - ${text}` : ""}`
        );
    }

    return res.json();
}

export async function GET(req: Request) {
    const clientId = process.env.MAL_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: "Missing MAL_CLIENT_ID." },
            { status: 500 }
        );
    }

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const q = searchParams.get("q")?.trim();

    try {
        if (id) {
            const url = new URL(`${MAL_API}/anime/${id}`);
            url.searchParams.set("fields", FIELDS);

            const anime = await fetchMal(url.toString(), clientId);

            return NextResponse.json({
                data: formatAnime(anime),
            });
        }

        if (!q) {
            return NextResponse.json(
                { error: "Missing anime search." },
                { status: 400 }
            );
        }

        const url = new URL(`${MAL_API}/anime`);
        url.searchParams.set("q", q);
        url.searchParams.set("limit", "25");
        url.searchParams.set("fields", FIELDS);

        const json = await fetchMal(url.toString(), clientId);

        const results = (json.data ?? []).map((entry: any) => entry.node);

        const exactFirstSeasonMatch = results.find(
            (anime: any) => titleMatchesQuery(anime, q) && isFirstSeasonAnime(anime)
        );

        const firstSeasonMatch = results.find(isFirstSeasonAnime);

        const tvMatch = results.find((anime: any) => anime.media_type === "tv");

        const anime = exactFirstSeasonMatch || firstSeasonMatch || tvMatch;

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
            { error: "Failed to load anime from MyAnimeList." },
            { status: 500 }
        );
    }
}