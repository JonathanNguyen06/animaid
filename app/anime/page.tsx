'use client'

import React, {useEffect, useState} from 'react'
import {useSearchParams} from "next/navigation";
import SearchControls from "@/app/components/SearchControls";
import Image from "next/image";
import WishlistButton from "@/app/components/WishlistButton";
import AnimeCharacters from "@/app/components/AnimeCharacters";

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

const Page = () => {
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
                    <p className="mt-4 text-purple-900/70">
                        Loading anime...
                    </p>
                )}
                {error && (
                    <p className="mt-4 text-red-500">
                        {error}
                    </p>
                )}

                {!loading && !error && anime && (
                    <>
                        <div className="mt-6 grid gap-6 rounded-3xl border border-purple-200 bg-white relative z-10 p-6 shadow-sm md:grid-cols-[220px_1fr]">
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
                                <h2 className="text-3xl font-bold text-purple-950 justify-between flex">
                                    {anime.title}
                                    <WishlistButton anime={anime}/>
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
                                            ⭐ {anime.score}
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

                        <AnimeCharacters animeId={anime.mal_id} />
                    </>
                )}
            </section>
        </main>
    )
}
export default Page
