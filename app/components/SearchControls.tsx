'use client'

import React, { useEffect, useState } from 'react'
import Searchbar from "@/app/components/Searchbar";
import EpisodeSlider from "@/app/components/EpisodeSlider";
import { useRouter, useSearchParams } from "next/navigation";
import TypeTogglePills from "@/app/components/TypeTogglePills";
import GenreToggleGrid from "@/app/components/GenreToggleGrid";
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
    const [popularity, setPopularity] = useState(searchParams.get("popularity") ?? "any");
    const [rolling, setRolling] = useState(false);
    const [rollError, setRollError] = useState<string | null>(null);

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
        router.push(`/search?${new URLSearchParams({ q }).toString()}`);
    }

    async function handleRandomRoll() {
        setRollError(null);
        setRolling(true);

        const [min, max] = episodeRange;
        const genreIds = selectedGenres.map((genre) => genre.mal_id).join(",");

        const params = new URLSearchParams({
            minEpisodes: String(min),
            maxEpisodes: String(max),
            type,
            minScore: String(minScore),
            popularity,
        });

        if (genreIds) params.set("genres", genreIds);

        try {
            const res = await fetch(`/api/jikan/random?${params.toString()}`);
            const json = await res.json();

            if (res.status === 404) {
                setRollError("No anime matched your filters. Try loosening them a bit!");
                return;
            }

            if (!res.ok) {
                setRollError("Something went wrong. Please try again.");
                return;
            }

            router.push(`/anime?id=${json.data.mal_id}`);
        } catch {
            setRollError("Couldn't reach the server. Check your connection and try again.");
        } finally {
            setRolling(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 z-10 relative">
            {/* Search by title */}
            <div className="rounded-3xl border border-purple-200/70 bg-white p-5 shadow-sm text-center">
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

            {/* Random roll */}
            <div className="rounded-3xl border border-purple-200/70 bg-white p-5 shadow-sm text-center">
                <h2 className="text-lg font-semibold text-purple-950">
                    Roll a random anime
                </h2>
                <p className="mt-1 text-sm text-purple-900/60">
                    Pick filters, then let AnimAid surprise you.
                </p>

                {/* Episodes + Type rows */}
                <div className="my-6 space-y-6 flex flex-col items-center">
                    <EpisodeSlider value={episodeRange} setValue={setEpisodeRange} />
                    <TypeTogglePills value={type} setValue={setType} />
                </div>

                {/* Genre toggle grid — full width */}
                <GenreToggleGrid
                    genreOptions={genreOptions}
                    value={selectedGenres}
                    setValue={setSelectedGenres}
                />

                {/* Advanced toggle */}
                <div className="mt-6 flex justify-center">
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
                                <ScoreSlider value={minScore} setValue={setMinScore} />
                            </div>
                            <div className="w-full">
                                <PopularityDropdown value={popularity} setValue={setPopularity} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {rollError && (
                    <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
                        <span className="text-base">🎲</span>
                        <span>{rollError}</span>
                        <button
                            type="button"
                            onClick={() => setRollError(null)}
                            className="ml-auto text-purple-400 hover:text-purple-700 cursor-pointer transition-colors"
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="mt-6 flex justify-center">
                    <RerollButton onClick={handleRandomRoll} rolling={rolling} />
                </div>
            </div>
        </div>
    );
};

export default SearchControls;
