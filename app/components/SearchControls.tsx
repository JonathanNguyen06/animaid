'use client'

import React, {useState} from 'react'
import Searchbar from "@/app/components/Searchbar";
import EpisodeSlider from "@/app/components/EpisodeSlider";
import {useRouter, useSearchParams} from "next/navigation";
import GenreDropdown from "@/app/components/GenreDropdown";

const SearchControls = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [episodeRange, setEpisodeRange] = useState<number[]>([
        Number(searchParams.get("minEpisodes") ?? 1),
        Number(searchParams.get("maxEpisodes") ?? 30),
    ]);
    const [query, setQuery] = useState(searchParams.get("query") ?? "");
    const [type, setType] = useState(searchParams.get("type") ?? "any");

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        const [min, max] = episodeRange;
        const params = new URLSearchParams({
            q,
            minEpisodes: String(min),
            maxEpisodes: String(max),
            type: type,
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
            <div className="mt-6 flex items-start justify-center gap-8">
                <EpisodeSlider
                    value={episodeRange}
                    setValue={setEpisodeRange}
                />
                <GenreDropdown
                    value={type}
                    setValue={setType}
                />
            </div>
        </>
    )
}
export default SearchControls
