import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing anime id" },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(
            `https://api.jikan.moe/v4/anime/${id}/characters`
        );

        if (!res.ok) {
            return NextResponse.json(
                { error: "Failed to load characters" },
                { status: 500 }
            );
        }

        const json = await res.json();

        const characters = (json.data ?? [])
            .map((item: any) => ({
                mal_id: item.character?.mal_id,
                name: item.character?.name,
                role: item.role,
                image_url:
                    item.character?.images?.webp?.image_url ||
                    item.character?.images?.jpg?.image_url ||
                    null,
            }))
            .filter((character: any) =>
                character.mal_id &&
                character.name &&
                character.image_url
            )
            .slice(0, 15);

        return NextResponse.json({ data: characters });
    } catch {
        return NextResponse.json(
            { error: "Failed to load characters" },
            { status: 500 }
        );
    }
}