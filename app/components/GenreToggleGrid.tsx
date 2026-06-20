'use client'

import React, { useState } from 'react'

type Genre = {
    mal_id: number;
    name: string;
};

type Props = {
    genreOptions: Genre[];
    value: Genre[];
    setValue: (value: Genre[]) => void;
};

// A small emoji/symbol to give each genre a bit of personality
const GENRE_ICONS: Record<string, string> = {
    Action: '⚔️',
    Adventure: '🗺️',
    'Avant Garde': '✨',
    'Award Winning': '🏆',
    'Boys Love': '👬',
    'Girls Love': '👭',
    Gourmet: '🍔',
    Suspense: '😱',
    Comedy: '😂',
    Drama: '🎭',
    Fantasy: '🧙',
    Horror: '👻',
    Mystery: '🔍',
    Romance: '💕',
    'Sci-Fi': '🚀',
    'Slice of Life': '🌸',
    Sports: '🏀',
    Supernatural: '🦸',
    Music: '🎵',
};

const COLLAPSED_COUNT = 18;

export default function GenreToggleGrid({ genreOptions, value, setValue }: Props) {
    const [expanded, setExpanded] = useState(false);

    const selectedIds = new Set(value.map((g) => g.mal_id));

    function toggle(genre: Genre) {
        if (selectedIds.has(genre.mal_id)) {
            setValue(value.filter((g) => g.mal_id !== genre.mal_id));
        } else {
            setValue([...value, genre]);
        }
    }

    function clearAll() {
        setValue([]);
    }

    const visibleGenres = expanded ? genreOptions : genreOptions.slice(0, COLLAPSED_COUNT);
    const hiddenCount = genreOptions.length - COLLAPSED_COUNT;

    return (
        <div className="w-full flex flex-col items-center">
            <div className="mb-2 flex items-center justify-between w-full max-w-fit space-x-2">
                <span className="text-sm font-medium text-purple-100/70">
                    Genre
                    {value.length > 0 && (
                        <span className="ml-2 inline-flex items-center rounded-full border border-pink-500/30 bg-pink-500/15 px-2 py-0.5 text-xs font-semibold text-pink-300">
                            {value.length}
                        </span>
                    )}
                </span>

                {value.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="cursor-pointer text-xs text-pink-300/60 transition-colors hover:text-pink-300"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                {visibleGenres.map((genre) => {
                    const isSelected = selectedIds.has(genre.mal_id);
                    const icon = GENRE_ICONS[genre.name];

                    return (
                        <button
                            key={genre.mal_id}
                            type="button"
                            onClick={() => toggle(genre)}
                            className={`
                                inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold
                                transition-all duration-200 cursor-pointer select-none
                                active:scale-95
                                backdrop-blur-md
                                ${
                                    isSelected
                                        ? `
                                            border-pink-500/60
                                            bg-pink-500/15
                                            text-pink-200
                                            shadow-[0_0_15px_rgba(236,72,153,0.35)]
                                          `
                                    : `
                                            border-pink-500/20
                                            bg-white/5
                                            text-purple-100/80
                                            hover:border-pink-500/40
                                            hover:bg-pink-500/10
                                            hover:text-pink-200
                                          `
                                }
                            `}
                        >
                            {icon && <span className="text-[11px] leading-none">{icon}</span>}
                            {genre.name}
                        </button>
                    );
                })}

                {/* Expand / collapse toggle */}
                {genreOptions.length > COLLAPSED_COUNT && (
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-full
                            border border-dashed border-pink-500/30
                            bg-white/5
                            px-3 py-1.5
                            text-xs font-semibold
                            text-pink-300/70
                            transition-all
                            hover:border-pink-500/60
                            hover:bg-pink-500/10
                            hover:text-pink-300
                            cursor-pointer
                        "

                    >
                        {expanded ? <>Show less</> : <>+{hiddenCount} more</>}
                    </button>
                )}
            </div>
        </div>
    );
}
