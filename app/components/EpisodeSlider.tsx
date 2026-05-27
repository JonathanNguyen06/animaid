import React from 'react'
import {Slider} from "@mui/material";

type Props = {
    value: number[];
    setValue: (value: number[]) => void;
}

const EpisodeSlider = ({value, setValue}: Props) => {
    const minDistance = 0

    const handleChange = (event: Event, newValue: number[], activeThumb: number) => {
        if (activeThumb === 0) {
            setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
        } else {
            setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
        }
    };

    return (
        <div className="w-2/3 text-center">
            <p className="mb-2 text-sm font-medium text-purple-900/70">Episodes</p>
            <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value === 30 ? "30+" : value}
                disableSwap
                min={1}
                max={30}
                sx={{
                    color: "#581c87",
                    "& .MuiSlider-thumb": {
                        backgroundColor: "#581c87",
                    },
                    "& .MuiSlider-track": {
                        backgroundColor: "#581c87",
                    },
                    "& .MuiSlider-valueLabel": {
                        backgroundColor: "#581c87",
                        fontFamily: "var(--font-josefin), ui-sans-serif, system-ui",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                    },
                }}
            />
        </div>
    )
}
export default EpisodeSlider
