"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchControls from "@/app/components/SearchControls";
import Image from "next/image";
import WishlistButton from "@/app/components/WishlistButton";
import AnimeCharacters from "@/app/components/AnimeCharacters";
import Loading from "@/app/components/Loading";

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

function AnimePageContent() {
    const searchParams = useSearchParams();

    const id = searchParams.get("id") ?? "";
    const [anime, setAnime] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setAnime(null);
            setError("Missing anime id");
            return;
        }

        async function loadAnime() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`/api/jikan/anime?id=${id}`);
                const json = await res.json();

                if (!res.ok) {
                    throw new Error(json?.error ?? "Failed to load anime");
                }

                setAnime(json.data);
            } catch (e: any) {
                setError(e?.message ?? "Something went wrong");
                setAnime(null);
            } finally {
                setLoading(false);
            }
        }

        loadAnime();
    }, [id]);

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <SearchControls />

            <section className="mt-10">
                {loading && (
                    <div className="relative z-10 mt-6 grid gap-6 rounded-3xl border border-pink-500/20 bg-black/40 backdrop-blur-xl p-6 shadow-sm md:grid-cols-[220px_1fr]">
                        <div className="animate-pulse rounded-2xl bg-pink-500/10" style={{ height: 320 }} />

                        <div className="flex flex-col gap-0">
                            <div className="flex items-center justify-between">
                                <div className="h-8 w-[55%] animate-pulse rounded-lg bg-pink-500/10" />
                                <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-pink-500/10" />
                            </div>

                            <div className="mt-2.5 h-4 w-[30%] animate-pulse rounded-md bg-pink-500/10" />

                            <div className="mt-4 flex flex-wrap gap-2">
                                {[60, 80, 50, 68, 74, 90].map((w, i) => (
                                    <div
                                        key={i}
                                        className="h-7 animate-pulse rounded-full bg-pink-500/10"
                                        style={{ width: w }}
                                    />
                                ))}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {[70, 58, 82].map((w, i) => (
                                    <div
                                        key={i}
                                        className="h-7 animate-pulse rounded-full bg-pink-500/10"
                                        style={{ width: w }}
                                    />
                                ))}
                            </div>

                            <div className="mt-6">
                                <div className="h-5 w-24 animate-pulse rounded-md bg-pink-500/10" />
                                <div className="mt-3 flex flex-col gap-2">
                                    {[100, 95, 98, 88, 92, 60].map((w, i) => (
                                        <div
                                            key={i}
                                            className="h-3.5 animate-pulse rounded bg-pink-500/10"
                                            style={{ width: `${w}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <p className="mt-4 text-pink-300">
                        {error}
                    </p>
                )}

                {!loading && !error && anime && (
                    <>
                        <div className="
                            relative z-10 mt-6 grid gap-6
                            rounded-3xl
                            border border-pink-500/20
                            bg-black/40
                            p-6
                            backdrop-blur-xl
                            shadow-[0_0_25px_rgba(236,72,153,0.08)]
                            md:grid-cols-[220px_1fr]
                            ">
                            <div className="overflow-hidden rounded-2xl bg-black/30 border border-pink-500/20">
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
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <h2 className="
                                    min-w-0 break-words text-3xl font-bold
                                    text-white
                                    ">
                                        {anime.title}
                                    </h2>

                                    <div className="shrink-0">
                                        <WishlistButton anime={anime} />
                                    </div>
                                </div>

                                {anime.title_english && anime.title_english !== anime.title && (
                                    <p className="mt-1 text-purple-100/50">
                                        {anime.title_english}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                    {anime.type && (
                                        <span className="
                                        rounded-full
                                        border border-pink-500/20
                                        bg-pink-500/10
                                        px-3 py-1
                                        text-pink-200
                                        ">
                                            {anime.type}
                                        </span>
                                    )}

                                    {anime.episodes && (
                                        <span className="
                                        rounded-full
                                        border border-pink-500/20
                                        bg-pink-500/10
                                        px-3 py-1
                                        text-pink-200
                                        ">
                                            {anime.episodes} episodes
                                        </span>
                                    )}

                                    {anime.year && (
                                        <span className="
                                        rounded-full
                                        border border-pink-500/20
                                        bg-pink-500/10
                                        px-3 py-1
                                        text-pink-200
                                        ">
                                            {anime.year}
                                        </span>
                                    )}

                                    {anime.score && (
                                        <span className="
                                        rounded-full
                                        border border-pink-500/20
                                        bg-pink-500/10
                                        px-3 py-1
                                        text-pink-200
                                        ">
                                            ⭐ {anime.score}
                                        </span>
                                    )}

                                    {anime.status && (
                                        <span className="
                                        rounded-full
                                        border border-pink-500/20
                                        bg-pink-500/10
                                        px-3 py-1
                                        text-pink-200
                                        ">
                                            {anime.status}
                                        </span>
                                    )}

                                    {anime.rating && (
                                        <span className="
                                        rounded-full
                                        border border-pink-500/20
                                        bg-pink-500/10
                                        px-3 py-1
                                        text-pink-200
                                        ">
                                            {anime.rating}
                                        </span>
                                    )}
                                </div>

                                {anime.genres && anime.genres.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {anime.genres.map((genre) => (
                                            <span
                                                key={genre.mal_id}
                                                className="
                                            rounded-full
                                            border border-pink-500/20
                                            bg-white/5
                                            px-3 py-1
                                            text-sm
                                            text-purple-100/80
                                            "
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        Synopsis
                                    </h3>

                                    <p className="mt-2 leading-7 text-purple-100/70">
                                        {anime.synopsis ?? "No synopsis available."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <AnimeCharacters animeId={anime.mal_id} />
                    </>
                )}
            </section>
        </main>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <AnimePageContent />
        </Suspense>
    );
}