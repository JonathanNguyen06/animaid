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
        <div className="w-1/3">
            Episodes
            <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value === 30 ? "30+" : value}
                disableSwap
                min={1}
                max={30}
                color={"secondary"}
            />
        </div>
    )
}
export default EpisodeSlider
