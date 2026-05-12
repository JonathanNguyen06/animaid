import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const limit = Number(searchParams.get("limit") ?? "12");

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

        // Return only what you need (cleaner + smaller)
        const simplified = (json.data ?? []).map((a: any) => ({
            mal_id: a.mal_id,
            title: a.title,
            score: a.score,
            images: a.images,
            type: a.type,
            year: a.year,
        }));

        return NextResponse.json({ data: simplified });
    } catch {
        return NextResponse.json({ error: "Server failed to reach Jikan" }, { status: 500 });
    }
}
