import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const url = new URL(`https://api.jikan.moe/v4/top/anime`);
    url.searchParams.set("filter", "airing")
    url.searchParams.set("limit", "6")

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

        const simplified = (json.data ?? []).map((a: any) => ({
            mal_id: a.mal_id,
            title: a.title,
            images: a.images,
        }));

        return NextResponse.json({ data: simplified });
    } catch {
        return NextResponse.json(
            { error: "Server failed to reach Jikan" },
            { status: 500 }
        );
    }
}