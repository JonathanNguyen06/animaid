import {NextResponse} from "next/server";

export async function GET(req: Request)  {
    const url = new URL("https://api.jikan.moe/v4/genres/anime")
    url.searchParams.set("filter", "genres");

    try {
        const res = await fetch(url.toString(), {
            next: { revalidate: 86400 },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `Jikan error: ${res.status}` },
                { status: res.status }
            );
        }

        const json = await res.json();

        const simplified = (json.data ?? []).map((genre: any) => ({
            mal_id: genre.mal_id,
            name: genre.name,
        }));

        return NextResponse.json({ data: simplified });
    } catch {
        return NextResponse.json({ error: "Server failed to reach Jikan" }, { status: 500 });
    }
}