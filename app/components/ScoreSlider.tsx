import React from 'react'
import Slider from '@mui/material/Slider';

type Props = {
    value: number;
    setValue: (value: number) => void;
}

const ScoreSlider = ({ value, setValue }: Props) => {
    return (
        <div className="w-full rounded-2xl border border-pink-500/20 bg-black/40 px-5 py-4 backdrop-blur-xl shadow-[0_0_25px_rgba(236,72,153,0.08)]">
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
                    color: "#ec4899",

                    "& .MuiSlider-thumb": {
                        backgroundColor: "#f472b6",
                        border: "2px solid rgba(255,255,255,0.7)",
                        boxShadow: "0 0 15px rgba(236,72,153,0.6)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                            boxShadow: "0 0 25px rgba(236,72,153,0.9)",
                        },
                    },

                    "& .MuiSlider-track": {
                        background:
                            "linear-gradient(90deg, rgba(236,72,153,1) 0%, rgba(217,70,239,1) 100%)",
                        border: "none",
                        boxShadow: "0 0 12px rgba(236,72,153,0.5)",
                    },

                    "& .MuiSlider-rail": {
                        backgroundColor: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                        opacity: 1,
                    },

                    "& .MuiSlider-mark": {
                        backgroundColor: "rgba(255,255,255,0.3)",
                        width: "3px",
                        height: "3px",
                        borderRadius: "999px",
                    },

                    "& .MuiSlider-markActive": {
                        backgroundColor: "#f472b6",
                        boxShadow: "0 0 8px rgba(236,72,153,0.8)",
                    },

                    "& .MuiSlider-valueLabel": {
                        background: "rgba(0,0,0,0.85)",
                        border: "1px solid rgba(236,72,153,0.4)",
                        backdropFilter: "blur(12px)",
                        color: "#fbcfe8",
                        boxShadow: "0 0 20px rgba(236,72,153,0.25)",
                        fontFamily: "var(--font-josefin), ui-sans-serif, system-ui",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                    },

                    "& .MuiSlider-markLabel": {
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.75rem",
                        marginTop: "8px",
                    },
                }}
            />
        </div>
    )
}

export default ScoreSlider