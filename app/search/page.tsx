"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AnimeCard from "@/app/components/AnimeCard";
import AnimeCardSkeleton from "@/app/components/AnimeCardSkeleton";
import SearchControls from "@/app/components/SearchControls";
import Loading from "@/app/components/Loading";

type Anime = {
    mal_id: number;
    title: string;
    score?: number | null;
    images?: any;
    type?: string | null;
    year?: number | null;
};

function SearchPageContent() {
    const searchParams = useSearchParams();
    const q = (searchParams.get("q") ?? "").trim();
    const minEpisodes = Number(searchParams.get("minEpisodes") ?? 1);
    const maxEpisodes = Number(searchParams.get("maxEpisodes") ?? 30);
    const type = searchParams.get("type") ?? "any";
    const genres = searchParams.get("genres") ?? "";

    const [results, setResults] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestId = useRef(0);

    useEffect(() => {
        if (!q) {
            setResults([]);
            setError(null);
            setLoading(false);
            return;
        }

        const run = async () => {
            const myId = ++requestId.current;

            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    q,
                    limit: "24",
                    minEpisodes: String(minEpisodes),
                    maxEpisodes: String(maxEpisodes),
                    type,
                });

                if (genres) params.set("genres", genres);

                const res = await fetch(`/api/jikan/search?${params.toString()}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json?.error ?? "Search failed");
                if (myId !== requestId.current) return;

                setResults(json.data ?? []);
            } catch (e: any) {
                if (myId !== requestId.current) return;

                setError(e?.message ?? "Something went wrong");
                setResults([]);
            } finally {
                if (myId === requestId.current) {
                    setLoading(false);
                }
            }
        };

        run();
    }, [q, minEpisodes, maxEpisodes, type, genres]);

    return (
        <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
            <SearchControls />

            <div className="mt-8 rounded-3xl border border-pink-500/20 bg-black/40 p-5 backdrop-blur-xl shadow-[0_0_25px_rgba(236,72,153,0.08)]">
                <h1 className="text-2xl font-bold text-white">
                    {q ? (
                        <>
                            Results for{" "}
                            <span className="text-pink-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]">
                            "{q}"
                        </span>
                        </>
                    ) : (
                        "Search"
                    )}
                </h1>

                {error && (
                    <p className="mt-3 text-sm font-medium text-pink-300">
                        {error}
                    </p>
                )}

                {!loading && !error && q && (
                    <p className="mt-2 text-sm text-purple-100/60">
                        {results.length} results
                    </p>
                )}

                {!loading && !error && q && results.length === 0 && (
                    <p className="mt-6 text-purple-100/60">
                        No results found.
                    </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {loading
                        ? Array.from({ length: 12 }).map((_, i) => (
                            <AnimeCardSkeleton key={i} />
                        ))
                        : results.map((anime) => (
                            <AnimeCard key={anime.mal_id} anime={anime} />
                        ))}
                </div>
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SearchPageContent />
        </Suspense>
    );
}