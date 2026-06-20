"use client";

import { ListFilter } from "lucide-react";

export type CharacterSortOption =
    | "power-desc"
    | "power-asc"
    | "name-asc"
    | "anime-asc"
    | "favorites-desc"
    | "favorites-asc";

type Props = {
    value: CharacterSortOption;
    setValue: (value: CharacterSortOption) => void;
};

const sortOptions: {
    value: CharacterSortOption;
    label: string;
}[] = [
    { value: "power-desc", label: "Power: High to Low" },
    { value: "power-asc", label: "Power: Low to High" },
    { value: "name-asc", label: "Character Name" },
    { value: "anime-asc", label: "Anime Name" },
    { value: "favorites-desc", label: "Favorites: High to Low" },
    { value: "favorites-asc", label: "Favorites: Low to High" },
];

export default function SortButton({ value, setValue }: Props) {
    return (
        <div className="relative z-10 flex items-center gap-3">
            <div
                className="
                flex h-10 w-10 items-center justify-center
                rounded-xl
                border border-pink-500/20
                bg-black/40
                backdrop-blur-xl
                shadow-[0_0_15px_rgba(236,72,153,0.12)]
                "
            >
                <ListFilter className="h-5 w-5 text-pink-300" />
            </div>

            <select
                value={value}
                onChange={(e) =>
                    setValue(e.target.value as CharacterSortOption)
                }
                className="
                cursor-pointer
                rounded-2xl
                border border-pink-500/20
                bg-black/40
                px-4 py-2.5
                text-sm font-semibold
                text-pink-200
                backdrop-blur-xl
                shadow-[0_0_15px_rgba(236,72,153,0.08)]
                outline-none
                transition
                hover:border-pink-400/40
                hover:bg-pink-500/10
                focus:border-pink-400/50
                focus:ring-2
                focus:ring-pink-500/20
                "
            >
                {sortOptions.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#0b0b0f] text-pink-200"
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}