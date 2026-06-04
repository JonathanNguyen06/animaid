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
            fullWidth
            slotProps={{
                paper: {
                    className:
                        "relative z-10 mt-2 rounded-2xl border border-purple-200 bg-white p-2 shadow-lg",
                },
            }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;

                return (
                    <li
                        key={key}
                        {...optionProps}
                        className="cursor-pointer rounded-xl px-4 py-3 text-left text-sm text-purple-900 transition hover:bg-purple-50"
                    >
                        <div>
                            <p className="font-semibold text-purple-950">
                                {option.title_english || option.title}
                            </p>

                            <p className="mt-1 text-xs text-purple-900/50">
                                {[option.type, option.year].filter(Boolean).join(" • ")}
                            </p>
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
                            backgroundColor: "white",
                            boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
                            color: "#2e1065",
                            "& fieldset": {
                                borderColor: "#e9d5ff",
                            },
                            "&:hover fieldset": {
                                borderColor: "#d8b4fe",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#c084fc",
                                borderWidth: "1px",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: "rgb(88 28 135 / 0.65)",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                            color: "#581c87",
                        },
                        "& .MuiInputBase-input::placeholder": {
                            color: "rgb(88 28 135 / 0.4)",
                            opacity: 1,
                        },
                    }}
                />
            )}
        />
    );
}