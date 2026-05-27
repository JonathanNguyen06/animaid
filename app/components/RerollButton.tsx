import React from 'react'
import Button from '@mui/material/Button';
import { Dices } from 'lucide-react'

type Props = {
    onClick: () => void;
    rolling?: boolean;
};

const RerollButton = ({ onClick, rolling = false }: Props) => {
    return (
        <Button
            variant="contained"
            onClick={onClick}
            disabled={rolling}
            sx={{
                backgroundColor: "#581c87",
                "&:hover": {
                    backgroundColor: "#6b21a8",
                },
                "&.Mui-disabled": {
                    backgroundColor: "#581c87",
                    opacity: 0.8,
                },
                borderRadius: "0.75rem",
                textTransform: "none",
                minWidth: "120px",
                gap: "8px",
            }}
        >
            <Dices
                style={{
                    animation: rolling ? "spin 0.6s linear infinite" : "none",
                }}
            />
            <span
                style={{
                    fontFamily: "var(--font-josefin), ui-sans-serif, system-ui",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "white",
                }}
            >
                {rolling ? "Rolling..." : "Roll"}
            </span>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Button>
    )
}

export default RerollButton
