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
            color="secondary"
            onClick={onClick}
        >
            <RefreshIcon />
        </Button>
    )
}

export default RerollButton