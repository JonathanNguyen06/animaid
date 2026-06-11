"use client";

type Props = {
    result: "correct" | "wrong" | null;
    show: boolean;
};

export default function RoundResultOverlay({ result, show }: Props) {
    if (!show || !result) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div
                    className={`relative z-10 rounded-3xl border px-10 py-6 text-4xl font-black uppercase tracking-widest shadow-xl animate-result-pop ${
                        result === "correct"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                    }`}
                >
                    {result === "correct" ? "Correct!" : "Wrong!"}
                </div>
            </div>

            <style jsx>{`
                @keyframes resultPop {
                    0% {
                        transform: scale(0.85);
                        opacity: 0;
                    }

                    35% {
                        transform: scale(1.08);
                        opacity: 1;
                    }

                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-result-pop {
                    animation: resultPop 0.35s ease-out;
                }
            `}</style>
        </>
    );
}