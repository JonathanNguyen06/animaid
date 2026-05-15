import React from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

type Genre = {
    mal_id: number;
    name: string;
};

type Props = {
    genreOptions: Genre[],
    value: Genre[],
    setValue: (value: Genre[]) => void,
}

const GenreMultiselect = ({genreOptions, value, setValue}: Props) => {
    return (
        <Autocomplete
            multiple
            value={value}
            options={genreOptions}
            onChange={(event, newValue) => {setValue(newValue)}}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                const SelectionIcon = selected ? CheckBoxIcon : CheckBoxOutlineBlankIcon;

                return (
                    <li key={key} {...optionProps}>
                        <SelectionIcon
                            fontSize="small"
                            style={{ marginRight: 8, padding: 9, boxSizing: 'content-box' }}
                        />
                        {option.name}
                    </li>
                );
            }}
            className={"w-full"}
            renderInput={(params) => (
                <TextField {...params} label="Genre" />
            )}
        />
    );
}

export default GenreMultiselect
