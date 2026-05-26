export default function AnimeCardSkeleton() {
    return (
        <div className="block rounded-xl border border-purple-200/70 bg-white shadow-sm overflow-hidden">
            {/* Image area — same 3:4 aspect ratio as AnimeCard */}
            <div className="relative w-full aspect-[3/4] bg-purple-100 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
            </div>

            {/* Text area */}
            <div className="p-3 space-y-2">
                {/* Title line 1 */}
                <div className="relative h-3 w-full rounded-full bg-purple-100 overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
                </div>
                {/* Title line 2 — shorter */}
                <div className="relative h-3 w-3/5 rounded-full bg-purple-100 overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_0.1s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
                </div>

                {/* Tag pills */}
                <div className="mt-2 flex gap-1.5">
                    <div className="relative h-5 w-12 rounded-full bg-purple-100 overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_0.2s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
                    </div>
                    <div className="relative h-5 w-10 rounded-full bg-purple-100 overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_0.3s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
}
