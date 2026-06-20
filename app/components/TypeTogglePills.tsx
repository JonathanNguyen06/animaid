'use client'

import React from 'react'

type Props = {
    value: string;
    setValue: (value: string) => void;
};

const TYPES = [
    { value: 'any',     label: 'Any',     icon: '✨' },
    { value: 'tv',      label: 'TV',       icon: '📺' },
    { value: 'movie',   label: 'Movie',    icon: '🎬' },
    { value: 'ova',     label: 'OVA',      icon: '💿' },
    { value: 'ona',     label: 'ONA',      icon: '🌐' },
    { value: 'special', label: 'Special',  icon: '⭐' },
    { value: 'music',   label: 'Music',    icon: '🎵' },
];

const TypeTogglePills = ({ value, setValue }: Props) => {
    return (
        <div className="w-full flex flex-col items-center">
            <p className="mb-2 text-sm font-medium text-purple-100/70">
                Type
            </p>

            <div className="flex flex-wrap justify-center gap-2">
                {TYPES.map((type) => {
                    const isSelected = value === type.value;

                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => setValue(type.value)}
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
                    <span className="text-[11px] leading-none">
                        {type.icon}
                    </span>

                            {type.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TypeTogglePills;
