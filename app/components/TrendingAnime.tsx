'use client'

import React, { useEffect, useRef, useState } from 'react'
import AnimeCard from "@/app/components/AnimeCard";
import AnimeCardSkeleton from "@/app/components/AnimeCardSkeleton";

type Anime = {
    mal_id: number;
    title: string;
    score?: number | null;
    images?: any;
    type?: string | null;
    year?: number | null;
};

const TrendingAnime = () => {
    const [results, setResults] = useState<Anime[]>([])
    const [loading, setLoading] = useState(true);

    const requestId = useRef(0);

    useEffect(() => {
        const run = async () => {
            const myId = ++requestId.current;

            try {
                const res = await fetch(`/api/jikan/trending`)
                const json = await res.json();

                if (!res.ok) throw new Error(json?.error ?? "Could not load trending anime");
                if (myId !== requestId.current) return;

                setResults(json.data ?? []);
            } catch (e: any) {
                if (myId !== requestId.current) return;
                setResults([]);
            } finally {
                if (myId === requestId.current) setLoading(false);
            }
        }
        run();
    }, [])

    return (
        <div className="mb-6 grid sm:grid-cols-3 md:grid-cols-6 gap-2">
            {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <AnimeCardSkeleton key={i} />
                ))
                : results.map((anime) => (
                    <AnimeCard key={anime.mal_id} anime={anime} />
                ))
            }
        </div>
    )
}

export default TrendingAnime
