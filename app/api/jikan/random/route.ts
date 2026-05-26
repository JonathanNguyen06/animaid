import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const minEpisodes = Number(searchParams.get("minEpisodes") ?? 1);
    const maxEpisodes = Number(searchParams.get("maxEpisodes") ?? 30);
    const type = (searchParams.get("type") ?? "any").toLowerCase();
    const genreIds = (searchParams.get("genres") ?? "")
        .split(",")
        .filter(Boolean);

    const minScore = Number(searchParams.get("minScore") ?? 1);
    const popularity = (searchParams.get("popularity") ?? "any").toLowerCase();

    const popularityLimits: Record<string, number | null> = {
        any: null,
        top100: 100,
        top250: 250,
        top500: 500,
        top1000: 1000,
    };

    const popularityLimit = popularityLimits[popularity] ?? null;

    function buildUrl(page: number) {
        const url = new URL("https://api.jikan.moe/v4/anime");

        url.searchParams.set("limit", "24");
        url.searchParams.set("sfw", "true");
        url.searchParams.set("page", String(page));

        // Helps popularity filters return popular results first
        url.searchParams.set("order_by", "popularity");
        url.searchParams.set("sort", "asc");

        if (minScore > 1) {
            url.searchParams.set("min_score", String(minScore));
        }

        if (type !== "any") {
            url.searchParams.set("type", type);
        }

        if (genreIds.length > 0) {
            url.searchParams.set("genres", genreIds.join(","));
        }

        return url;
    }

    function animeMatches(anime: any) {
        const episodes = anime.episodes;
        const score = anime.score;
        const animePopularity = anime.popularity;

        if (typeof episodes !== "number") return false;
        if (typeof score !== "number") return false;

        const matchesEpisodes =
            maxEpisodes === 30
                ? episodes >= minEpisodes
                : episodes >= minEpisodes && episodes <= maxEpisodes;

        const matchesScore = score >= minScore;

        const matchesPopularity =
            popularityLimit === null
                ? true
                : typeof animePopularity === "number" &&
                animePopularity <= popularityLimit;

        return matchesEpisodes && matchesScore && matchesPopularity;
    }

    try {
        const firstRes = await fetch(buildUrl(1).toString(), {
            next: { revalidate: 60 },
        });

        if (!firstRes.ok) {
            return NextResponse.json(
                { error: `Jikan error: ${firstRes.status}` },
                { status: firstRes.status }
            );
        }

        const firstJson = await firstRes.json();
        const lastPage = firstJson.pagination?.last_visible_page ?? 1;

        const maxPageByPopularity =
            popularityLimit === null
                ? 50
                : Math.ceil(popularityLimit / 24);

        const maxRandomPage = Math.min(lastPage, maxPageByPopularity);

        for (let attempt = 0; attempt < 20; attempt++) {
            const randomPage =
                Math.floor(Math.random() * maxRandomPage) + 1;

            const res = await fetch(buildUrl(randomPage).toString(), {
                next: { revalidate: 60 },
            });

            if (!res.ok) continue;

            const json = await res.json();

            const filtered = (json.data ?? []).filter(animeMatches);

            if (filtered.length === 0) continue;

            const randomAnime =
                filtered[Math.floor(Math.random() * filtered.length)];

            return NextResponse.json({
                data: {
                    mal_id: randomAnime.mal_id,
                },
            });
        }

        return NextResponse.json(
            { error: "No anime found with those filters" },
            { status: 404 }
        );
    } catch {
        return NextResponse.json(
            { error: "Server failed to reach Jikan" },
            { status: 500 }
        );
    }
}