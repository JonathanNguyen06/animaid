"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AnimeCard from "@/app/components/AnimeCard";
import Searchbar from "../components/Searchbar";
import SearchControls from "@/app/components/SearchControls";

type Anime = {
    mal_id: number;
    title: string;
    score?: number | null;
    images?: any;
    type?: string | null;
    year?: number | null;
};

export default function SearchPage() {
    const searchParams = useSearchParams();
    const q = (searchParams.get("q") ?? "").trim();
    const minEpisodes = Number(searchParams.get("minEpisodes") ?? 1)
    const maxEpisodes = Number(searchParams.get("maxEpisodes") ?? 30)
    const type = (searchParams.get("type") ?? "any")

    const [results, setResults] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // prevents older requests overwriting newer ones
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

                const res = await fetch(
                    `/api/jikan/search?q=${encodeURIComponent(q)}&limit=24&minEpisodes=${minEpisodes}&maxEpisodes=${maxEpisodes}&type=${type}`
                );
                const json = await res.json();

                if (!res.ok) throw new Error(json?.error ?? "Search failed");
                if (myId !== requestId.current) return;

                setResults(json.data ?? []);
            } catch (e: any) {
                if (myId !== requestId.current) return;
                setError(e?.message ?? "Something went wrong");
                setResults([]);
            } finally {
                if (myId === requestId.current) setLoading(false);
            }
        };

        run();
    }, [q, minEpisodes, maxEpisodes, type]);

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <SearchControls />
            <h1 className="text-2xl mt-4 font-bold">
                {q ? `Results for “${q}”` : "Search"}
            </h1>

            {loading && <p className="mt-3 opacity-70">Searching…</p>}
            {error && <p className="mt-3 text-red-500">{error}</p>}

            {!loading && !error && q && (
                <p className="mt-2 text-sm opacity-70">{results.length} results</p>
            )}

            {!loading && !error && q && results.length === 0 && (
                <p className="mt-6 opacity-70">No results found.</p>
            )}

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
            </div>
        </main>
    );
}
