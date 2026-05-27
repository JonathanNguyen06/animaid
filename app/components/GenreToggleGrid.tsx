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
        <div className="w-full">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900/70">
                    Genre
                    {value.length > 0 && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-purple-900 px-2 py-0.5 text-xs font-semibold text-white">
                            {value.length}
                        </span>
                    )}
                </span>
                {value.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs text-purple-400 hover:text-purple-700 transition-colors cursor-pointer"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
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
                                transition-all duration-150 cursor-pointer select-none
                                active:scale-95
                                ${isSelected
                                    ? 'border-purple-900 bg-purple-900 text-white shadow-sm shadow-purple-300'
                                    : 'border-purple-200 bg-white text-purple-800 hover:border-purple-400 hover:bg-purple-50'
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
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-purple-300 bg-transparent px-3 py-1.5 text-xs font-semibold text-purple-500 transition hover:border-purple-500 hover:text-purple-700 cursor-pointer"
                    >
                        {expanded ? (
                            <>Show less</>
                        ) : (
                            <>+{hiddenCount} more</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
