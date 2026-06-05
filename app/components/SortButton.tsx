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
        <div className="relative z-10 flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-purple-700" />

            <select
                value={value}
                onChange={(e) => setValue(e.target.value as CharacterSortOption)}
                className="cursor-pointer rounded-2xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-900 shadow-sm outline-none transition hover:bg-purple-50 focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}