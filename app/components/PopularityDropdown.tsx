"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
    value: string;
    setValue: (value: string) => void;
};

const options = [
    { value: "any", label: "Any" },
    { value: "top100", label: "Top 100" },
    { value: "top250", label: "Top 250" },
    { value: "top500", label: "Top 500" },
    { value: "top1000", label: "Top 1000" },
];

const PopularityDropdown = ({ value, setValue }: Props) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const selected =
        options.find((option) => option.value === value) ?? options[0];

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full" ref={dropdownRef}>
            <label className="mb-2 block text-sm font-medium text-pink-100/80">
                Popularity
            </label>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((current) => !current)}
                    className="w-full cursor-pointer rounded-2xl border border-pink-500/20 bg-white/10 px-4 py-3 text-left text-white shadow-[0_0_18px_rgba(236,72,153,0.08)] backdrop-blur-xl transition hover:border-pink-400/40 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-pink-500/30"
                >
                    <div className="flex items-center justify-between">
                        <span>{selected.label}</span>

                        <svg
                            className={`h-5 w-5 text-pink-300/70 transition ${
                                open ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </button>

                {open && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-pink-500/20 bg-black/95 p-2 shadow-[0_0_25px_rgba(236,72,153,0.14)] backdrop-blur-xl">
                        {options.map((option) => {
                            const isSelected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setValue(option.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-2 text-left transition ${
                                        isSelected
                                            ? "bg-pink-500/15 text-pink-100"
                                            : "text-purple-100/70 hover:bg-pink-500/10 hover:text-pink-100"
                                    }`}
                                >
                                    <span>{option.label}</span>

                                    {isSelected && (
                                        <span className="text-pink-300">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopularityDropdown;