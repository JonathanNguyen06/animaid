'use client'

import React, { useEffect, useState } from 'react'
import Searchbar from "@/app/components/Searchbar";
import EpisodeSlider from "@/app/components/EpisodeSlider";
import { useRouter, useSearchParams } from "next/navigation";
import TypeDropdown from "@/app/components/TypeDropdown";
import GenreMultiselect from "@/app/components/GenreMultiselect";
import RerollButton from "@/app/components/RerollButton";
import ScoreSlider from "@/app/components/ScoreSlider";
import PopularityDropdown from "@/app/components/PopularityDropdown";

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
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [minScore, setMinScore] = useState(Number(searchParams.get("minScore") ?? 1));
    const [popularity, setPopularity] = useState(searchParams.get("popularity") ?? "any")

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

    async function handleRandomRoll() {
        const [min, max] = episodeRange;
        const genreIds = selectedGenres.map((genre) => genre.mal_id).join(",");

        const params = new URLSearchParams({
            minEpisodes: String(min),
            maxEpisodes: String(max),
            type,
            minScore: String(minScore),
            popularity
        });

        if (genreIds) {
            params.set("genres", genreIds);
        }

        const res = await fetch(`/api/jikan/random?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
            console.error(json?.error ?? "Random roll failed");
            return;
        }

        router.push(`/anime?id=${json.data.mal_id}`);
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 z-10 relative">
            <div className="rounded-3xl border border-purple-200/70 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-purple-950">
                    Search by title
                </h2>
                <Searchbar
                    query={query}
                    setQuery={setQuery}
                    onSubmit={handleSearchSubmit}
                />
            </div>

            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-purple-900/50">
                <div className="flex-1 border-t border-purple-200" />
                <span>or</span>
                <div className="flex-1 border-t border-purple-200" />
            </div>

            <div className="rounded-3xl border border-purple-200/70 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-purple-950">
                    Roll a random anime
                </h2>
                <p className="mt-1 text-sm text-purple-900/60">
                    Pick filters, then let AnimAid surprise you.
                </p>

                {/* Main filters */}
                <div className="my-8 grid grid-cols-1 items-end gap-8 md:grid-cols-[1fr_1fr_1.5fr]">
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

                {/* Advanced toggle */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        className="w-fit text-sm font-medium text-purple-900/60 transition hover:cursor-pointer hover:text-purple-900"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        {showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
                    </button>
                </div>

                {/* Advanced filters */}
                {showAdvanced && (
                    <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-6">
                        <p className="mb-6 text-center text-sm font-semibold text-purple-950">
                            Advanced filters
                        </p>

                        <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-2">
                            <div className="w-full">
                                <p className="mb-4 text-center text-sm font-medium text-purple-900/70">
                                    Minimum Score
                                </p>
                                <ScoreSlider
                                    value={minScore}
                                    setValue={setMinScore}
                                />
                            </div>

                            <div className="w-full">
                                <PopularityDropdown
                                    value={popularity}
                                    setValue={setPopularity}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-center">
                    <RerollButton onClick={handleRandomRoll} />
                </div>
            </div>
        </div>
    );
}

export default SearchControls;