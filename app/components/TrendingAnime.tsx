'use client'

import React, {useEffect, useRef, useState} from 'react'
import AnimeCard from "@/app/components/AnimeCard";

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

    const requestId = useRef(0);

    useEffect(() => {
        const run = async () => {
            const myId = ++requestId.current;

            const params = new URLSearchParams({
                filter: "airing",
                limit: "6"
            });

            try {
                const res = await fetch(`/api/jikan/trending?${params.toString()}`)
                const json = await res.json();

                if (!res.ok) throw new Error(json?.error ?? "Could not load trending anime");
                if (myId !== requestId.current) return;

                setResults(json.data ?? []);
            } catch (e: any) {
                if (myId !== requestId.current) return;
                setResults([]);
            }
        }
        run();
    }, [])


    return (
        <div className="my-6 grid sm:grid-cols-3 md:grid-cols-6 gap-2">
            {results.map((anime) => (
                <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
        </div>
    )
}
export default TrendingAnime
