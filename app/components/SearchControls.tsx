'use client'

import React, {useState} from 'react'
import Searchbar from "@/app/components/Searchbar";
import EpisodeSlider from "@/app/components/EpisodeSlider";
import {useRouter} from "next/navigation";

const SearchControls = () => {
    const router = useRouter();
    const [episodeRange, setEpisodeRange] = useState<number[]>([1, 30]);
    const [query, setQuery] = useState("");

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        const [min, max] = episodeRange;
        const params = new URLSearchParams({
            q,
            minEpisodes: String(min),
            maxEpisodes: String(max),
        });

        router.push(`/search?${params.toString()}`);
    }

    return (
        <>
            <div>
                <Searchbar
                    query={query}
                    setQuery={setQuery}
                    onSubmit={onSubmit}
                />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <EpisodeSlider
                    value={episodeRange}
                    setValue={setEpisodeRange}
                />
            </div>
        </>
    )
}
export default SearchControls
