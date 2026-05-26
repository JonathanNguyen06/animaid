import React from 'react'
import Slider from '@mui/material/Slider';

type Props = {
    value: number;
    setValue: (value: number) => void;
}

const ScoreSlider = ({ value, setValue }: Props) => {
    return (
        <div className="w-full">
            <Slider
                aria-label="Minimum Score"
                value={value}
                onChange={(_, newValue) => setValue(newValue as number)}
                getAriaValueText={(value) => `${value} or higher`}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}+`}
                shiftStep={30}
                step={1}
                marks
                min={1}
                max={9}
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
                    },
                }}
            />
        </div>
    )
}

export default ScoreSlider