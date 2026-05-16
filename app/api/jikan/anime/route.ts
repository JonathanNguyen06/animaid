import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing anime id" }, { status: 400 });
    }

    const url = new URL(`https://api.jikan.moe/v4/anime/${id}`);

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
        const a = json.data;

        return NextResponse.json({
            data: {
                mal_id: a.mal_id,
                title: a.title,
                title_english: a.title_english,
                score: a.score,
                images: a.images,
                type: a.type,
                year: a.year,
                episodes: a.episodes,
                status: a.status,
                rating: a.rating,
                synopsis: a.synopsis,
                genres: a.genres,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Server failed to reach Jikan" },
            { status: 500 }
        );
    }
}