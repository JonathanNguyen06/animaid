"use client";

type Props = {
    result: "correct" | "wrong" | null;
    show: boolean;
};

export default function RoundResultOverlay({ result, show }: Props) {
    if (!show || !result) return null;

    return (
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
                <div
                    className={`relative overflow-hidden rounded-3xl border px-12 py-8 text-center shadow-[0_0_60px_rgba(236,72,153,0.25)] animate-result-pop ${
                        result === "correct"
                            ? "border-emerald-400/40 bg-black/80"
                            : "border-red-400/40 bg-black/80"
                    }`}
                >
                    {/* glow */}
                    <div
                        className={`absolute inset-0 ${
                            result === "correct"
                                ? "bg-emerald-500/10"
                                : "bg-red-500/10"
                        }`}
                    />

                    <div
                        className={`absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] ${
                            result === "correct"
                                ? "bg-emerald-400/20"
                                : "bg-red-400/20"
                        }`}
                    />

                    <div className="relative z-10">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-white/50">
                            Round Result
                        </p>

                        <h2
                            className={`text-5xl font-black uppercase tracking-wider ${
                                result === "correct"
                                    ? "text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]"
                                    : "text-red-300 drop-shadow-[0_0_20px_rgba(248,113,113,0.7)]"
                            }`}
                        >
                            {result === "correct" ? "Correct!" : "Wrong!"}
                        </h2>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes resultPop {
                    0% {
                        transform: scale(0.7);
                        opacity: 0;
                    }

                    50% {
                        transform: scale(1.08);
                        opacity: 1;
                    }

                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-result-pop {
                    animation: resultPop 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                }
            `}</style>
        </>
    );
}