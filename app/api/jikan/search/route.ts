import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const minEpisodes = Number(searchParams.get("minEpisodes") ?? 1)
    const maxEpisodes = Number(searchParams.get("maxEpisodes") ?? 30)
    const limit = Number(searchParams.get("limit") ?? "12");
    const type = (searchParams.get("type") ?? "any").toLowerCase();
    const genreIds = (searchParams.get("genres") ?? "")
        .split(",")
        .filter(Boolean);

    // Basic validation
    if (!q) {
        return NextResponse.json({ data: [] }, { status: 200 });
    }
    if (q.length > 100) {
        return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    // Clamp limit to avoid abuse
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 24) : 12;

    const url = new URL("https://api.jikan.moe/v4/anime");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", String(safeLimit));

    if (type !== "any") {
        url.searchParams.set("type", type);
    }

    if (genreIds.length > 0) {
        url.searchParams.set("genres", genreIds.join(","));
    }

    try {
        const res = await fetch(url.toString(), {
            // Optional: cache a bit to reduce repeated queries
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Jikan error: ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();

        const filtered = (json.data ?? []).filter((anime: any) => {
            const episodes = anime.episodes;
            const animeType = (anime.type ?? "").toLowerCase();

            const matchesType = type === "any" || animeType === type;

            if (!matchesType) return false;

            if (typeof episodes !== "number") return false;

            if (maxEpisodes === 30) {
                return episodes >= minEpisodes;
            }

            return episodes >= minEpisodes && episodes <= maxEpisodes;
        });

        // Return only what you need (cleaner + smaller)
        const simplified = filtered.map((a:any) => ({
            mal_id: a.mal_id,
            title: a.title,
            score: a.score,
            images: a.images,
            type: a.type,
            year: a.year,
            episodes: a.episodes,
            genres: a.genres,
        }));

        return NextResponse.json({ data: simplified });
    } catch {
        return NextResponse.json({ error: "Server failed to reach Jikan" }, { status: 500 });
    }
}
