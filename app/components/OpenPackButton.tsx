"use client";

import { Package } from "lucide-react";

type Props = {
    onClick: () => void;
    opening?: boolean;
};

export default function OpenPackButton({ onClick, opening = false }: Props) {
    return (
        <>
            <button
                type="button"
                onClick={onClick}
                disabled={opening}
                className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-2xl bg-purple-900 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-800 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
                <Package
                    size={20}
                    className={opening ? "animate-pack-shake" : ""}
                />

                {opening ? "Opening..." : "Open Pack"}
            </button>

            <style jsx>{`
                @keyframes packShake {
                    0% { transform: rotate(0deg) scale(1); }
                    20% { transform: rotate(-10deg) scale(1.08); }
                    40% { transform: rotate(10deg) scale(1.08); }
                    60% { transform: rotate(-8deg) scale(1.08); }
                    80% { transform: rotate(8deg) scale(1.08); }
                    100% { transform: rotate(0deg) scale(1); }
                }

                .animate-pack-shake {
                    animation: packShake 0.55s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}