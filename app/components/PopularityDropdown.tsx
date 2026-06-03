"use client";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

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
    const selected =
        options.find((option) => option.value === value) ??
        options[0];

    return (
        <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-purple-900/70">
                Popularity
            </label>

            <Listbox value={value} onChange={setValue}>
                <div className="relative">
                    <ListboxButton
                        className="
                            w-full
                            cursor-pointer
                            rounded-2xl
                            border
                            border-purple-200
                            bg-white
                            px-4
                            py-3
                            text-left
                            text-purple-950
                            shadow-sm
                            transition
                            hover:border-purple-300
                            focus:outline-none
                            focus:ring-2
                            focus:ring-purple-200
                        "
                    >
                        <div className="flex items-center justify-between">
                            <span>{selected.label}</span>

                            <svg
                                className="h-5 w-5 text-purple-500"
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
                    </ListboxButton>

                    <ListboxOptions
                        anchor="bottom"
                        className="
                            z-50
                            mt-2
                            w-[var(--button-width)]
                            rounded-2xl
                            border
                            border-purple-200
                            bg-white
                            p-2
                            shadow-lg
                            focus:outline-none
                        "
                    >
                        {options.map((option) => (
                            <ListboxOption
                                key={option.value}
                                value={option.value}
                                className={({ focus }) =>
                                    `
                                    cursor-pointer
                                    rounded-xl
                                    px-4
                                    py-2
                                    transition
                                    ${
                                        focus
                                            ? "bg-purple-100 text-purple-950"
                                            : "text-purple-900"
                                    }
                                `
                                }
                            >
                                {({ selected }) => (
                                    <div className="flex items-center justify-between">
                                        <span>{option.label}</span>

                                        {selected && (
                                            <span className="text-purple-700">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                )}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </div>
    );
};

export default PopularityDropdown;