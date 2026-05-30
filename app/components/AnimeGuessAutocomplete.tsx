"use client";

import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {isFirstSeasonAnime} from "@/app/api/jikan/daily/route";

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
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(_, newValue) => {
                setValue(newValue);
            }}
            options={options}
            loading={loading}
            getOptionLabel={(option) => option.title}
            isOptionEqualToValue={(option, value) =>
                option.mal_id === value.mal_id
            }
            fullWidth
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;

                return (
                    <li key={key} {...optionProps}>
                        <div>
                            <p className="font-medium">{option.title}</p>
                            <p className="text-xs text-purple-900/60">
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
                />
            )}
        />
    );
}