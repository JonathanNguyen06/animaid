'use client'

import React, {useEffect, useState} from 'react'
import Searchbar from "@/app/components/Searchbar";
import EpisodeSlider from "@/app/components/EpisodeSlider";
import {useRouter, useSearchParams} from "next/navigation";
import TypeDropdown from "@/app/components/TypeDropdown";
import GenreMultiselect from "@/app/components/GenreMultiselect";

type Genre = {
    mal_id: number;
    name: string;
};

const SearchControls = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [episodeRange, setEpisodeRange] = useState<number[]>([
        Number(searchParams.get("minEpisodes") ?? 1),
        Number(searchParams.get("maxEpisodes") ?? 30),
    ]);
    const [query, setQuery] = useState(searchParams.get("q") ?? "");
    const [type, setType] = useState(searchParams.get("type") ?? "any");
    const [genreOptions, setGenreOptions] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>([

    ]);

    useEffect(() => {
        async function loadGenres() {
            const res = await fetch("/api/jikan/genres");
            const json = await res.json();
            setGenreOptions(json.data ?? []);
        }

        loadGenres();
    }, []);

    useEffect(() => {
        if (genreOptions.length === 0) return;

        const genreIds = (searchParams.get("genres") ?? "")
            .split(",")
            .filter(Boolean)
            .map(Number);

        const selected = genreOptions.filter((genre) =>
            genreIds.includes(genre.mal_id)
        );

        setSelectedGenres(selected);
    }, [genreOptions, searchParams]);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        const [min, max] = episodeRange;
        const genreIds = selectedGenres.map((genre) => genre.mal_id).join(",");
        const params = new URLSearchParams({
            q,
            minEpisodes: String(min),
            maxEpisodes: String(max),
            type: type,
            genres: genreIds,
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
                <TypeDropdown value={type} setValue={setType} />
                <GenreMultiselect
                    genreOptions={genreOptions}
                    value={selectedGenres}
                    setValue={setSelectedGenres}
                />
            </div>
        </>
    )
}
export default SearchControls
