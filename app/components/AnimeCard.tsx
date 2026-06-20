import Image from "next/image";
import Link from "next/link"

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
    episodes?: number | null;
    genre?: string | null;
};

export default function AnimeCard({ anime }: { anime: Anime }) {
    const img =
        anime.images?.webp?.image_url ||
        anime.images?.jpg?.image_url ||
        "";

    return (
        <Link
            href={`/anime?id=${anime.mal_id}`}
            className="
            group block overflow-hidden rounded-2xl
            border border-pink-500/20
            bg-black/40
            backdrop-blur-md
            shadow-[0_0_15px_rgba(236,72,153,0.06)]
            transition-all duration-300
            hover:-translate-y-1
            hover:border-pink-500/40
            hover:shadow-[0_0_25px_rgba(236,72,153,0.18)]
            cursor-pointer
        "
        >
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/30">
                {img ? (
                    <Image
                        src={img}
                        alt={anime.title}
                        fill
                        className="
                        object-cover
                        transition-transform duration-500
                        group-hover:scale-105
                    "
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-purple-100/40">
                        <span className="text-sm">No image</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>

            <div className="p-3">
                <div
                    className="
                    line-clamp-2 text-sm font-semibold
                    text-white
                    transition-colors
                    group-hover:text-pink-200
                "
                >
                    {anime.title}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                    {anime.score && (
                        <span
                            className="
                            inline-flex items-center rounded-full
                            border border-pink-500/30
                            bg-pink-500/15
                            px-2 py-0.5
                            text-[11px] font-medium
                            text-pink-200
                            shadow-[0_0_8px_rgba(236,72,153,0.2)]
                        "
                        >
                        <span className="mr-1">⭐</span>
                            {anime.score}
                    </span>
                    )}

                    {anime.type && (
                        <span
                            className="
                            inline-flex items-center rounded-full
                            border border-pink-500/20
                            bg-pink-500/10
                            px-2 py-0.5
                            text-[11px] font-medium
                            text-pink-200
                        "
                        >
                        {anime.type}
                    </span>
                    )}

                    {anime.year && (
                        <span
                            className="
                            inline-flex items-center rounded-full
                            border border-pink-500/20
                            bg-pink-500/10
                            px-2 py-0.5
                            text-[11px] font-medium
                            text-pink-200
                        "
                        >
                        {anime.year}
                    </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
