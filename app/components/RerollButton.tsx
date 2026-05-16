import React from 'react'
import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';

type Props = {
    onClick: () => void;
};

const RerollButton = ({ onClick }: Props) => {
    return (
        <Button
            variant="contained"
            onClick={onClick}
            sx={{
                backgroundColor: "#581c87",
                "&:hover": {
                    backgroundColor: "#6b21a8",
                },
                borderRadius: "0.75rem",
                textTransform: "none",
            }}
        >
            <RefreshIcon />
        </Button>
    )
}

export default RerollButton