"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import SearchControls from "@/app/components/SearchControls";

type Genre = {
    mal_id: number;
    name: string;
};

type Anime = {
    mal_id: number;
    title: string;
    title_english?: string | null;
    score?: number | null;
    images?: any;
    type?: string | null;
    year?: number | null;
    episodes?: number | null;
    status?: string | null;
    rating?: string | null;
    synopsis?: string | null;
    genres?: Genre[];
};

export default function RandomPage() {
    const searchParams = useSearchParams();

    const minEpisodes = Number(searchParams.get("minEpisodes") ?? 1);
    const maxEpisodes = Number(searchParams.get("maxEpisodes") ?? 30);
    const type = searchParams.get("type") ?? "any";
    const genres = searchParams.get("genres") ?? "";
    const roll = searchParams.get("roll") ?? "";

    const [anime, setAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestId = useRef(0);

    useEffect(() => {
        const run = async () => {
            const myId = ++requestId.current;

            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    minEpisodes: String(minEpisodes),
                    maxEpisodes: String(maxEpisodes),
                    type,
                });

                if (genres) {
                    params.set("genres", genres);
                }

                const res = await fetch(`/api/jikan/random?${params.toString()}`);
                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json?.error ?? "Random roll failed");
                }

                if (myId !== requestId.current) return;

                setAnime(json.data);
            } catch (e: any) {
                if (myId !== requestId.current) return;

                setError(e?.message ?? "Something went wrong");
                setAnime(null);
            } finally {
                if (myId === requestId.current) {
                    setLoading(false);
                }
            }
        };

        run();
    }, [minEpisodes, maxEpisodes, type, genres, roll]);

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <SearchControls />

            <section className="mt-10">
                <h1 className="text-2xl font-bold text-purple-950">
                    Random Anime Roll
                </h1>

                {loading && (
                    <p className="mt-4 text-purple-900/70">
                        Rolling...
                    </p>
                )}

                {error && (
                    <p className="mt-4 text-red-500">
                        {error}
                    </p>
                )}

                {!loading && !error && anime && (
                    <div className="mt-6 grid gap-6 rounded-3xl border border-purple-200 bg-white/70 p-6 shadow-sm md:grid-cols-[220px_1fr]">
                        <div className="overflow-hidden rounded-2xl bg-purple-100">
                            {anime.images?.webp?.large_image_url && (
                                <Image
                                    src={anime.images.webp.large_image_url}
                                    alt={anime.title}
                                    width={220}
                                    height={320}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-purple-950">
                                {anime.title}
                            </h2>

                            {anime.title_english && anime.title_english !== anime.title && (
                                <p className="mt-1 text-purple-900/60">
                                    {anime.title_english}
                                </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                {anime.type && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                        {anime.type}
                                    </span>
                                )}

                                {anime.episodes && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                        {anime.episodes} episodes
                                    </span>
                                )}

                                {anime.year && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                        {anime.year}
                                    </span>
                                )}

                                {anime.score && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                        Score: {anime.score}
                                    </span>
                                )}

                                {anime.status && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                        {anime.status}
                                    </span>
                                )}

                                {anime.rating && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                        {anime.rating}
                                    </span>
                                )}
                            </div>

                            {anime.genres && anime.genres.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {anime.genres.map((genre) => (
                                        <span
                                            key={genre.mal_id}
                                            className="rounded-full border border-purple-200 px-3 py-1 text-sm text-purple-900/80"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-purple-950">
                                    Synopsis
                                </h3>
                                <p className="mt-2 leading-7 text-purple-900/70">
                                    {anime.synopsis ?? "No synopsis available."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}