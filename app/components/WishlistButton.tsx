"use client";

import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import {Tooltip} from "@mui/material";

export default function WishlistButton() {
    const [added, setAdded] = useState(false);

    return (
        <Tooltip title={added ? "Remove from wishlist" : "Add to wishlist"}>
            <button
                type="button"
                onClick={() => setAdded(!added)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-900 shadow-sm transition hover:bg-purple-50 cursor-pointer"
                aria-label={added ? "Remove from wishlist" : "Add to wishlist"}
            >
                {added ? (
                    <CheckIcon fontSize="small" />
                ) : (
                    <AddIcon fontSize="small" />
                )}
            </button>
        </Tooltip>
    );
}