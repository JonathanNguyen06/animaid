import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const minEpisodes = Number(searchParams.get("minEpisodes") ?? 1);
    const maxEpisodes = Number(searchParams.get("maxEpisodes") ?? 30);
    const type = (searchParams.get("type") ?? "any").toLowerCase();
    const genreIds = (searchParams.get("genres") ?? "")
        .split(",")
        .filter(Boolean);

    function buildUrl(page: number) {
        const url = new URL("https://api.jikan.moe/v4/anime");

        url.searchParams.set("limit", "24");
        url.searchParams.set("sfw", "true");
        url.searchParams.set("page", String(page));

        if (type !== "any") {
            url.searchParams.set("type", type);
        }

        if (genreIds.length > 0) {
            url.searchParams.set("genres", genreIds.join(","));
        }

        return url;
    }

    function episodeMatches(anime: any) {
        const episodes = anime.episodes;

        if (typeof episodes !== "number") return false;

        if (maxEpisodes === 30) {
            return episodes >= minEpisodes;
        }

        return episodes >= minEpisodes && episodes <= maxEpisodes;
    }

    try {
        // 1. Fetch page 1 to get pagination info
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

        // cap to avoid huge/randomly slow page jumps
        const maxRandomPage = Math.min(lastPage, 50);

        // 2. Try a few random pages in case one has no matching episodes
        for (let attempt = 0; attempt < 5; attempt++) {
            const randomPage =
                Math.floor(Math.random() * maxRandomPage) + 1;

            const res = await fetch(buildUrl(randomPage).toString(), {
                next: { revalidate: 60 },
            });

            if (!res.ok) continue;

            const json = await res.json();

            const filtered = (json.data ?? []).filter(episodeMatches);

            if (filtered.length === 0) continue;

            const randomAnime =
                filtered[Math.floor(Math.random() * filtered.length)];

            const simplified = {
                mal_id: randomAnime.mal_id,
                title: randomAnime.title,
                title_english: randomAnime.title_english,
                score: randomAnime.score,
                images: randomAnime.images,
                type: randomAnime.type,
                year: randomAnime.year,
                episodes: randomAnime.episodes,
                status: randomAnime.status,
                rating: randomAnime.rating,
                synopsis: randomAnime.synopsis,
                genres: randomAnime.genres,
            };

            return NextResponse.json({ data: simplified });
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