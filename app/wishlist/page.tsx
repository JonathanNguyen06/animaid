"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import Loading from "@/app/components/Loading";

type WatchStatus =
    | "Watching"
    | "Finished"
    | "Dropped"
    | "On Hold"
    | "Plan to Watch";

type WishlistAnime = {
    mal_id: number;
    title: string;
    image_url?: string;
    score?: number | null;
    type?: string | null;
    year?: number | null;
    episodes?: number | null;
    watchStatus?: WatchStatus;
    episodesWatched?: number;
};

const watchStatuses: WatchStatus[] = [
    "Watching",
    "Finished",
    "Dropped",
    "On Hold",
    "Plan to Watch",
];

function statusClass(status: WatchStatus) {
    switch (status) {
        case "Watching":
            return `
                border-cyan-500/30
                bg-cyan-500/10
                text-cyan-300
            `;

        case "Finished":
            return `
                border-green-500/30
                bg-green-500/10
                text-green-300
            `;

        case "Dropped":
            return `
                border-red-500/30
                bg-red-500/10
                text-red-300
            `;

        case "On Hold":
            return `
                border-yellow-500/30
                bg-yellow-500/10
                text-yellow-300
            `;

        case "Plan to Watch":
            return `
                border-pink-500/30
                bg-pink-500/10
                text-pink-300
            `;
    }
}

export default function WishlistPage() {
    const router = useRouter();

    const [animeList, setAnimeList] = useState<WishlistAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [openStatusId, setOpenStatusId] = useState<number | null>(null);

    useEffect(() => {
        async function loadWishlist() {
            const user = auth.currentUser;

            if (!user) {
                router.push("/login");
                return;
            }

            const wishlistRef = collection(db, "users", user.uid, "wishlist");
            const q = query(wishlistRef, orderBy("created_at", "desc"));

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((docSnap) => {
                const anime = docSnap.data() as WishlistAnime;

                return {
                    ...anime,
                    watchStatus: anime.watchStatus ?? "Plan to Watch",
                    episodesWatched: anime.episodesWatched ?? 0,
                };
            });

            setAnimeList(data);
            setLoading(false);
        }

        loadWishlist();
    }, [router]);

    async function updateAnimeProgress(
        animeId: number,
        updates: Partial<WishlistAnime>
    ) {
        const user = auth.currentUser;

        if (!user) return;

        setSavingId(animeId);

        try {
            const anime = animeList.find((item) => item.mal_id === animeId);

            const nextAnime = {
                ...anime,
                ...updates,
            } as WishlistAnime;

            const maxEpisodes = nextAnime.episodes ?? 0;

            if (
                nextAnime.watchStatus === "Finished" &&
                maxEpisodes > 0
            ) {
                nextAnime.episodesWatched = maxEpisodes;
            }

            if ((nextAnime.episodesWatched ?? 0) < 0) {
                nextAnime.episodesWatched = 0;
            }

            if (
                maxEpisodes > 0 &&
                (nextAnime.episodesWatched ?? 0) > maxEpisodes
            ) {
                nextAnime.episodesWatched = maxEpisodes;
            }

            setAnimeList((current) =>
                current.map((item) =>
                    item.mal_id === animeId
                        ? nextAnime
                        : item
                )
            );

            await updateDoc(
                doc(db, "users", user.uid, "wishlist", String(animeId)),
                {
                    watchStatus: nextAnime.watchStatus,
                    episodesWatched: nextAnime.episodesWatched ?? 0,
                }
            );
        } finally {
            setSavingId(null);
        }
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <section
                className="
                relative z-10 rounded-3xl
                border border-pink-500/20
                bg-black/40
                p-8
                backdrop-blur-xl
                shadow-[0_0_25px_rgba(236,72,153,0.08)]
            "
            >
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/70">
                    Anime List
                </p>

                <h1 className="mt-3 text-4xl font-bold text-white">
                    My Wishlist
                </h1>

                <p className="mt-3 text-purple-100/70">
                    Characters from anime on your wishlist have a slightly increased chance of appearing in packs.
                </p>

                {animeList.length === 0 && (
                    <p
                        className="
                        mt-8 rounded-2xl
                        border border-pink-500/20
                        bg-pink-500/10
                        p-6
                        text-purple-100/70
                    "
                    >
                        Your wishlist is empty.
                    </p>
                )}

                <div className="mt-6 flex flex-col gap-4">
                    {animeList.map((anime) => {
                        const status = anime.watchStatus ?? "Plan to Watch";
                        const episodesWatched = anime.episodesWatched ?? 0;
                        const totalEpisodes = anime.episodes ?? 0;
                        const hasEpisodeCount = totalEpisodes > 0;

                        return (
                            <Link
                                key={anime.mal_id}
                                href={`/anime?id=${anime.mal_id}`}
                                className="
                                relative z-10 flex gap-4 rounded-2xl
                                border border-pink-500/20
                                bg-black/40
                                p-4
                                backdrop-blur-md
                                shadow-[0_0_15px_rgba(236,72,153,0.06)]
                                transition-all duration-300
                                hover:-translate-y-1
                                hover:border-pink-500/40
                                hover:shadow-[0_0_25px_rgba(236,72,153,0.18)]
                            "
                            >
                                <div
                                    className="
                                    relative h-36 w-24 shrink-0 overflow-hidden rounded-xl
                                    border border-pink-500/20
                                    bg-black/30
                                "
                                >
                                    {anime.image_url ? (
                                        <Image
                                            src={anime.image_url}
                                            alt={anime.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-purple-300">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col justify-center">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">
                                                {anime.title}
                                            </h2>

                                            <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                                {anime.score && (
                                                    <span
                                                        className="
                                                        rounded-full
                                                        border border-pink-500/20
                                                        bg-pink-500/10
                                                        px-3 py-1
                                                        text-pink-200
                                                    "
                                                    >
                                                    Score: {anime.score}
                                                </span>
                                                )}

                                                {anime.type && (
                                                    <span
                                                        className="
                                                        rounded-full
                                                        border border-pink-500/20
                                                        bg-pink-500/10
                                                        px-3 py-1
                                                        text-pink-200
                                                    "
                                                    >
                                                    {anime.type}
                                                </span>
                                                )}

                                                {anime.year && (
                                                    <span
                                                        className="
                                                        rounded-full
                                                        border border-pink-500/20
                                                        bg-pink-500/10
                                                        px-3 py-1
                                                        text-pink-200
                                                    "
                                                    >
                                                    {anime.year}
                                                </span>
                                                )}

                                                {anime.episodes && (
                                                    <span
                                                        className="
                                                        rounded-full
                                                        border border-pink-500/20
                                                        bg-pink-500/10
                                                        px-3 py-1
                                                        text-pink-200
                                                    "
                                                    >
                                                    {anime.episodes} episodes
                                                </span>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className="flex flex-col gap-3 md:min-w-[220px]"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenStatusId(
                                                            openStatusId === anime.mal_id
                                                                ? null
                                                                : anime.mal_id
                                                        )
                                                    }
                                                    disabled={savingId === anime.mal_id}
                                                    className={`
                                                    w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold
                                                    backdrop-blur-md transition-all
                                                    hover:shadow-[0_0_15px_rgba(236,72,153,0.18)]
                                                    disabled:cursor-not-allowed disabled:opacity-60 hover:cursor-pointer
                                                    ${statusClass(status)}
                                                `}
                                                >
                                                    {status}
                                                </button>

                                                {openStatusId === anime.mal_id && (
                                                    <div
                                                        className="
                                                        absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-xl
                                                        border border-pink-500/20
                                                        bg-black/90
                                                        backdrop-blur-xl
                                                        shadow-[0_0_25px_rgba(236,72,153,0.18)]
                                                    "
                                                    >
                                                        {watchStatuses.map((option) => (
                                                            <button
                                                                key={option}
                                                                type="button"
                                                                onClick={() => {
                                                                    updateAnimeProgress(anime.mal_id, {
                                                                        watchStatus: option,
                                                                    });
                                                                    setOpenStatusId(null);
                                                                }}
                                                                className={`
                                                                block w-full px-3 py-2 text-left text-sm font-semibold
                                                                transition
                                                                ${
                                                                    option === status
                                                                        ? "bg-pink-500/15 text-pink-200"
                                                                        : "text-purple-100/80 hover:bg-pink-500/10 hover:text-pink-200"
                                                                }
                                                            `}
                                                            >
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div
                                                className="
                                                rounded-2xl
                                                border border-pink-500/20
                                                bg-white/5
                                                p-3
                                            "
                                            >
                                                <div className="flex items-center justify-between text-xs font-semibold text-purple-100/60">
                                                    <span>Episodes</span>

                                                    <span>
                                                    {episodesWatched}
                                                        {hasEpisodeCount
                                                            ? ` / ${totalEpisodes}`
                                                            : ""}
                                                </span>
                                                </div>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateAnimeProgress(anime.mal_id, {
                                                                episodesWatched:
                                                                    episodesWatched - 1,
                                                            })
                                                        }
                                                        disabled={
                                                            savingId === anime.mal_id ||
                                                            episodesWatched <= 0
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-pink-500/20 bg-white/5 text-pink-200 transition hover:bg-pink-500/10 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        -
                                                    </button>

                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={
                                                            hasEpisodeCount
                                                                ? totalEpisodes
                                                                : undefined
                                                        }
                                                        value={episodesWatched}
                                                        onChange={(e) =>
                                                            updateAnimeProgress(anime.mal_id, {
                                                                episodesWatched:
                                                                    Number(e.target.value),
                                                            })
                                                        }
                                                        disabled={savingId === anime.mal_id}
                                                        className="
                                                        w-16 rounded-xl
                                                        border border-pink-500/20
                                                        bg-white/5
                                                        px-2 py-1
                                                        text-center text-sm font-semibold
                                                        text-white
                                                        outline-none
                                                        focus:border-pink-500/50
                                                    "
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateAnimeProgress(anime.mal_id, {
                                                                episodesWatched:
                                                                    episodesWatched + 1,
                                                            })
                                                        }
                                                        disabled={savingId === anime.mal_id}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-pink-500/20 bg-white/5 text-pink-200 transition hover:bg-pink-500/10 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {hasEpisodeCount && (
                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-pink-500/10">
                                                        <div
                                                            className="
                                                            h-full rounded-full
                                                            bg-gradient-to-r from-pink-500 to-purple-500
                                                            shadow-[0_0_12px_rgba(236,72,153,0.45)]
                                                            transition-all
                                                        "
                                                            style={{
                                                                width: `${
                                                                    totalEpisodes > 0
                                                                        ? (episodesWatched /
                                                                            totalEpisodes) *
                                                                        100
                                                                        : 0
                                                                }%`,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}