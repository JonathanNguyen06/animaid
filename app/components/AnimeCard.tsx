import Image from "next/image";

type Anime = {
    mal_id: number;
    title: string;
    score?: number | null;
    images?: {
        jpg?: { image_url?: string; large_image_url?: string };
        webp?: { image_url?: string; large_image_url?: string };
    };
    type?: string | null;
    year?: number | null;
};

export default function AnimeCard({ anime }: { anime: Anime }) {
    const img =
        anime.images?.webp?.image_url ||
        anime.images?.jpg?.image_url ||
        "";

    return (
        <div className="group rounded-xl border border-purple-200/70 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden hover:-translate-y-0.5 cursor-pointer">
            <div className="relative w-full aspect-[3/4] bg-purple-50">
                {img ? (
                    <Image src={img} alt={anime.title} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-purple-300">
                        <span className="text-sm">No image</span>
                    </div>
                )}
            </div>

            <div className="p-3">
                <div className="text-sm font-semibold line-clamp-2 text-purple-900/90 group-hover:text-purple-900">
                    {anime.title}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-800">
                        {anime.score ? (
                            <>
                                <span className="mr-1">⭐</span> {anime.score}
                            </>
                        ) : (
                            "No score"
                        )}
                    </span>
                    {anime.type ? (
                        <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-800">
                            {anime.type}
                        </span>
                    ) : null}
                    {anime.year ? (
                        <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-800">
                            {anime.year}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
