import React from 'react'
import Button from '@mui/material/Button';
import { Dices } from 'lucide-react'

type Props = {
    onClick: () => void;
    rolling?: boolean;
};

const RerollButton = ({ onClick, rolling = false }: Props) => {
    return (
        <>
            <Button
                variant="contained"
                onClick={onClick}
                disabled={rolling}
                sx={{
                    background:
                        "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",

                    color: "white",

                    border: "1px solid rgba(236,72,153,0.35)",

                    borderRadius: "16px",

                    minWidth: "180px",
                    height: "56px",

                    textTransform: "none",

                    fontFamily:
                        "var(--font-josefin), ui-sans-serif, system-ui",

                    fontWeight: 700,

                    fontSize: "0.95rem",

                    gap: "10px",

                    boxShadow:
                        "0 0 25px rgba(236,72,153,0.25)",

                    transition: "all 0.2s ease",

                    "&:hover": {
                        background:
                            "linear-gradient(135deg, #f472b6 0%, #c084fc 100%)",

                        transform: "translateY(-2px)",

                        boxShadow:
                            "0 0 35px rgba(236,72,153,0.45)",
                    },

                    "&:active": {
                        transform: "translateY(0px) scale(0.97)",
                    },

                    "&.Mui-disabled": {
                        background:
                            "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",

                        opacity: 0.6,

                        color: "white",
                    },
                }}
            >
                <Dices
                    size={20}
                    style={{
                        animation: rolling
                            ? "animaidDiceSpin 0.7s linear infinite"
                            : "none",
                    }}
                />

                {rolling ? "Rolling..." : "Roll Anime"}
            </Button>

            <style jsx>{`
                @keyframes animaidDiceSpin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </>
    );
};

export default RerollButton;