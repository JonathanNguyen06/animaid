import React from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material";

type Props = {
    value: string;
    setValue: (value: string) => void;
};

const PopularityDropdown = ({ value, setValue }: Props) => {
    const handleChange = (event: SelectChangeEvent) => {
        setValue(event.target.value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel id="popularity-label">Popularity</InputLabel>
            <Select
                labelId="popularity-label"
                label="Popularity"
                value={value}
                onChange={handleChange}
            >
                <MenuItem value="any">Any</MenuItem>
                <MenuItem value="top100">Top 100</MenuItem>
                <MenuItem value="top250">Top 250</MenuItem>
                <MenuItem value="top500">Top 500</MenuItem>
                <MenuItem value="top1000">Top 1000</MenuItem>
            </Select>
        </FormControl>
    );
};

export default PopularityDropdown;