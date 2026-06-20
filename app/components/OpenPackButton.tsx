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
            className="group relative z-10 mt-8 inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-pink-500/30 bg-black/50 px-8 py-4 font-bold text-pink-100 shadow-[0_0_25px_rgba(236,72,153,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/50 hover:shadow-[0_0_40px_rgba(236,72,153,0.35)] hover:cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-fuchsia-500/10 to-purple-500/10" />

            <div className="absolute -left-10 top-0 h-full w-10 rotate-12 bg-white/20 blur-md transition-all duration-700 group-hover:left-[120%]" />

            <Package
                size={22}
                className={opening ? "relative z-10 animate-pulse" : "relative z-10"}
            />

            <span className="relative z-10">
                {opening ? "Opening..." : "Open Pack"}
            </span>
        </button>
    );
}