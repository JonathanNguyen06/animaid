"use client";

import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { isFirstSeasonAnime } from "@/app/api/jikan/daily/route";

type AnimeOption = {
    mal_id: number;
    title: string;
    title_english?: string | null;
    year?: number | null;
    type?: string | null;
};

type Props = {
    value: AnimeOption | null;
    setValue: (value: AnimeOption | null) => void;
};

export default function AnimeGuessAutocomplete({ value, setValue }: Props) {
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<AnimeOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (inputValue.trim().length < 2) {
            setOptions([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    `/api/jikan/search?q=${encodeURIComponent(inputValue)}&limit=8`
                );

                const json = await res.json();
                const validAnime = (json.data ?? []).filter(isFirstSeasonAnime);

                setOptions(validAnime);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [inputValue]);

    return (
        <Autocomplete
            value={value}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            onChange={(_, newValue) => setValue(newValue)}
            options={options}
            loading={loading}
            getOptionLabel={(option) => option.title_english || option.title}
            isOptionEqualToValue={(option, value) => option.mal_id === value.mal_id}
            noOptionsText="No anime found"
            loadingText="Searching..."
            fullWidth
            slotProps={{
                paper: {
                    className:
                        "relative z-10 mt-2 overflow-hidden rounded-2xl border border-pink-500/20 bg-black/90 shadow-[0_0_25px_rgba(236,72,153,0.18)] backdrop-blur-xl",
                    sx: {
                        backgroundColor: "#0b0b0f !important",
                        color: "#ffffff",

                        "& .MuiAutocomplete-listbox": {
                            padding: "8px",
                            backgroundColor: "#0b0b0f",
                        },
                        "& .MuiAutocomplete-noOptions": {
                            color: "#ffffff",
                        },

                        "& .MuiAutocomplete-loading": {
                            color: "#ffffff",
                        },

                        "& .MuiAutocomplete-option": {
                            backgroundColor: "#0b0b0f",
                            color: "#ffffff",
                            borderRadius: "12px",
                            marginBottom: "4px",
                        },

                        "& .MuiAutocomplete-option:hover": {
                            backgroundColor: "rgba(236,72,153,0.10)",
                        },

                        "& .MuiAutocomplete-option.Mui-focused": {
                            backgroundColor: "rgba(236,72,153,0.10)",
                        },

                        "& .MuiAutocomplete-option[aria-selected='true']": {
                            backgroundColor: "rgba(236,72,153,0.16)",
                            color: "#fbcfe8",
                        },
                    },
                },
            }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;

                return (
                    <li
                        key={key}
                        {...optionProps}
                        className="
                    cursor-pointer
                    rounded-xl
                    px-4 py-3
                    transition
                    hover:bg-pink-500/10
                    "
                    >
                        <div className="w-full">
                            <p className="font-semibold text-white">
                                {option.title_english || option.title}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {option.type && (
                                    <span
                                        className="
                                    rounded-full
                                    border border-pink-500/20
                                    bg-pink-500/10
                                    px-2 py-0.5
                                    text-xs
                                    font-medium
                                    text-pink-200
                                    "
                                    >
                                    {option.type}
                                </span>
                                )}

                                {option.year && (
                                    <span
                                        className="
                                    rounded-full
                                    border border-purple-300/20
                                    bg-white/[0.04]
                                    px-2 py-0.5
                                    text-xs
                                    font-medium
                                    text-purple-100/60
                                    "
                                    >
                                    {option.year}
                                </span>
                                )}
                            </div>
                        </div>
                    </li>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Guess an anime"
                    placeholder="Start typing..."
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "1rem",
                            backgroundColor: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(16px)",
                            color: "#ffffff",
                            boxShadow: "0 0 15px rgba(236,72,153,0.08)",

                            "& fieldset": {
                                borderColor: "rgba(236,72,153,0.2)",
                            },

                            "&:hover fieldset": {
                                borderColor: "rgba(244,114,182,0.4)",
                            },

                            "&.Mui-focused fieldset": {
                                borderColor: "rgba(244,114,182,0.55)",
                                borderWidth: "1px",
                            },

                        },

                        "& .MuiInputBase-input": {
                            color: "#ffffff",
                        },

                        "& .MuiInputBase-input::placeholder": {
                            color: "rgba(243,232,255,0.4)",
                            opacity: 1,
                        },

                        "& .MuiInputLabel-root": {
                            color: "rgba(243,232,255,0.6)",
                        },

                        "& .MuiInputLabel-root.Mui-focused": {
                            color: "#f9a8d4",
                        },

                        "& .MuiAutocomplete-popupIndicator": {
                            color: "#f9a8d4",
                        },

                        "& .MuiAutocomplete-clearIndicator": {
                            color: "#f9a8d4",
                        },

                        "& .MuiCircularProgress-root": {
                            color: "#f9a8d4",
                        },
                    }}
                />
            )}
        />
    );
}