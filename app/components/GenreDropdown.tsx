import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material"
import React from 'react'

type Props = {
    value: string,
    setValue: (value: string) => void
}

const GenreDropdown = ({ value, setValue}: Props ) => {
    const handleChange = (event: SelectChangeEvent) => {
        setValue(event.target.value as string)
    }

    return (
        <FormControl className={"w-1/3"}>
            <InputLabel>Type</InputLabel>
            <Select
                label="Type"
                value={value}
                onChange={handleChange}
            >
                <MenuItem value={"any"}>Any</MenuItem>
                <MenuItem value={"tv"}>TV</MenuItem>
                <MenuItem value={"ova"}>OVA</MenuItem>
                <MenuItem value={"movie"}>Movie</MenuItem>
                <MenuItem value={"special"}>Special</MenuItem>
                <MenuItem value={"ona"}>ONA</MenuItem>
                <MenuItem value={"music"}>Music</MenuItem>
            </Select>
        </FormControl>
    )
}
export default GenreDropdown
