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
            <p className="mb-2 text-sm font-medium text-purple-100/70">
                Episodes
            </p>

            <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => (value === 30 ? "30+" : value)}
                disableSwap
                min={1}
                max={30}
                sx={{
                    color: "#ec4899",

                    "& .MuiSlider-rail": {
                        backgroundColor: "rgba(236,72,153,0.15)",
                        opacity: 1,
                    },

                    "& .MuiSlider-track": {
                        backgroundColor: "#ec4899",
                        border: "none",
                        boxShadow: "0 0 10px rgba(236,72,153,0.4)",
                    },

                    "& .MuiSlider-thumb": {
                        backgroundColor: "#f472b6",
                        border: "2px solid #fff",
                        boxShadow: "0 0 15px rgba(236,72,153,0.6)",

                        "&:hover": {
                            boxShadow: "0 0 20px rgba(236,72,153,0.8)",
                        },

                        "&.Mui-focusVisible": {
                            boxShadow: "0 0 20px rgba(236,72,153,0.8)",
                        },
                    },

                    "& .MuiSlider-valueLabel": {
                        backgroundColor: "#ec4899",
                        color: "#fff",
                        borderRadius: "10px",
                        fontFamily: "var(--font-josefin), ui-sans-serif, system-ui",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        boxShadow: "0 0 15px rgba(236,72,153,0.5)",
                    },
                }}
            />
        </div>
    )
}
export default EpisodeSlider
