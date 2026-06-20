export default function AnimeCardSkeleton() {
    return (
        <div
            className="
            block overflow-hidden
            rounded-3xl
            border border-pink-500/20
            bg-black/40
            backdrop-blur-xl
            shadow-[0_0_20px_rgba(236,72,153,0.08)]
            "
        >
            {/* Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-pink-500/5">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-3">
                <div className="space-y-2">
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-pink-500/10">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    </div>

                    <div className="relative h-3 w-3/5 overflow-hidden rounded-full bg-pink-500/10">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_0.1s_infinite] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    </div>
                </div>

                <div className="mt-3 flex gap-2">
                    <div className="relative h-6 w-14 overflow-hidden rounded-full bg-pink-500/10">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_0.2s_infinite] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    </div>

                    <div className="relative h-6 w-12 overflow-hidden rounded-full bg-pink-500/10">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_0.3s_infinite] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
}