'use client'

import React, { useEffect, useState } from 'react'
import Searchbar from "@/app/components/Searchbar";
import EpisodeSlider from "@/app/components/EpisodeSlider";
import { useRouter, useSearchParams } from "next/navigation";
import TypeDropdown from "@/app/components/TypeDropdown";
import GenreMultiselect from "@/app/components/GenreMultiselect";
import RerollButton from "@/app/components/RerollButton";

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
    const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

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

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();

        const q = query.trim();
        if (!q) return;

        const params = new URLSearchParams({
            q,
        });

        router.push(`/search?${params.toString()}`);
    }

    function handleRandomRoll() {
        const [min, max] = episodeRange;
        const genreIds = selectedGenres.map((genre) => genre.mal_id).join(",");

        const params = new URLSearchParams({
            minEpisodes: String(min),
            maxEpisodes: String(max),
            type,
            genres: genreIds,
        });

        params.set("roll", String(Date.now()));

        router.push(`/random?${params.toString()}`);
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <div className="rounded-3xl border border-purple-200/70 bg-white/70 p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-purple-950">
                    Search by title
                </h2>
                <Searchbar
                    query={query}
                    setQuery={setQuery}
                    onSubmit={handleSearchSubmit}
                />
            </div>

            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-purple-900/40">
                <div className="flex-1 border-t border-purple-200" />
                <span>or</span>
                <div className="flex-1 border-t border-purple-200" />
            </div>

            <div className="rounded-3xl border border-purple-200/70 bg-white/50 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-purple-950">
                    Roll a random anime
                </h2>
                <p className="mt-1 text-sm text-purple-900/60">
                    Pick filters, then let AnimAid surprise you.
                </p>

                <div className="mt-8 grid grid-cols-1 items-end gap-8 md:grid-cols-[1fr_1fr_1.5fr]">
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

                <div className="mt-6 flex justify-center">
                    <RerollButton onClick={handleRandomRoll} />
                </div>
            </div>
        </div>
    );
}

export default SearchControls;