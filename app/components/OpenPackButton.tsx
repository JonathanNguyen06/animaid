"use client";

import { Package } from "lucide-react";

type Props = {
    onClick: () => void;
    opening?: boolean;
};

export default function OpenPackButton({ onClick, opening = false }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={opening}
            className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-2xl bg-purple-900 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-800 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        >
            <Package
                size={20}
                className={opening ? "animate-bounce" : ""}
            />

            {opening ? "Opening..." : "Open Pack"}
        </button>
    );
}