import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Missing anime id" }, { status: 400 });
    }

    const url = new URL(`https://api.jikan.moe/v4/anime/${id}/characters`);

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

        const characters = (json.data ?? [])
            // Only main/supporting, skip voice actors etc.
            .filter((c: any) => c.role === "Main" || c.role === "Supporting")
            // Sort mains first
            .sort((a: any, b: any) => {
                if (a.role === b.role) return 0;
                return a.role === "Main" ? -1 : 1;
            })
            .slice(0, 20)
            .map((c: any) => ({
                mal_id: c.character.mal_id,
                name: c.character.name,
                role: c.role,
                image_url: c.character.images?.jpg?.image_url ?? null,
            }));

        return NextResponse.json({ data: characters });
    } catch {
        return NextResponse.json(
            { error: "Server failed to reach Jikan" },
            { status: 500 }
        );
    }
}