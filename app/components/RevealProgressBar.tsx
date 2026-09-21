export function RevealProgressBar({
                               tone,
                           }: {
    tone:
        | "ascension"
        | "disruption";
}) {
    return (
        <div className="mx-auto mt-5 h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-white/10">

            <div
                className={`
                    h-full
                    origin-left
                    animate-[revealProgress_4500ms_linear_forwards]
                    rounded-full

                    ${
                    tone ===
                    "ascension"
                        ? "bg-yellow-300"
                        : "bg-red-400"
                }
                `}
            />

        </div>
    );
}