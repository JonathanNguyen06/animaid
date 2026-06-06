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
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "Finished":
            return "border-green-200 bg-green-50 text-green-700";

        case "Dropped":
            return "border-red-200 bg-red-50 text-red-700";

        case "On Hold":
            return "border-yellow-200 bg-yellow-50 text-yellow-700";

        case "Plan to Watch":
            return "border-purple-200 bg-purple-50 text-purple-700";
    }
}

export default function WishlistPage() {
    const router = useRouter();

    const [animeList, setAnimeList] = useState<WishlistAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);

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
            <section className="relative z-10 rounded-3xl border border-purple-200 bg-white p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Anime List
                </p>

                <h1 className="mt-3 text-4xl font-bold text-purple-950">
                    My Wishlist
                </h1>

                <p className="mt-3 text-purple-900/70">
                    Track what you're watching, what you've finished, and what you plan to watch next.
                </p>

                {animeList.length === 0 && (
                    <p className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6 text-purple-900/70">
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
                                className="relative z-10 flex gap-4 rounded-2xl border border-purple-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-purple-100">
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
                                            <h2 className="text-lg font-semibold text-purple-950">
                                                {anime.title}
                                            </h2>

                                            <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                                {anime.score && (
                                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                                        Score: {anime.score}
                                                    </span>
                                                )}

                                                {anime.type && (
                                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                                        {anime.type}
                                                    </span>
                                                )}

                                                {anime.year && (
                                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                                        {anime.year}
                                                    </span>
                                                )}

                                                {anime.episodes && (
                                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-900">
                                                        {anime.episodes} episodes
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className="flex flex-col gap-3 md:min-w-[220px]"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            <select
                                                value={status}
                                                onChange={(e) =>
                                                    updateAnimeProgress(
                                                        anime.mal_id,
                                                        {
                                                            watchStatus: e.target.value as WatchStatus,
                                                        }
                                                    )
                                                }
                                                disabled={savingId === anime.mal_id}
                                                className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold outline-none transition ${statusClass(status)}`}
                                            >
                                                {watchStatuses.map((option) => (
                                                    <option
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-3">
                                                <div className="flex items-center justify-between text-xs font-semibold text-purple-900/60">
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
                                                            updateAnimeProgress(
                                                                anime.mal_id,
                                                                {
                                                                    episodesWatched:
                                                                        episodesWatched - 1,
                                                                }
                                                            )
                                                        }
                                                        disabled={
                                                            savingId === anime.mal_id ||
                                                            episodesWatched <= 0
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-900 transition hover:bg-purple-100 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
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
                                                            updateAnimeProgress(
                                                                anime.mal_id,
                                                                {
                                                                    episodesWatched:
                                                                        Number(e.target.value),
                                                                }
                                                            )
                                                        }
                                                        disabled={savingId === anime.mal_id}
                                                        className="w-16 rounded-xl border border-purple-200 bg-white px-2 py-1 text-center text-sm font-semibold text-purple-950 outline-none focus:border-purple-400"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateAnimeProgress(
                                                                anime.mal_id,
                                                                {
                                                                    episodesWatched:
                                                                        episodesWatched + 1,
                                                                }
                                                            )
                                                        }
                                                        disabled={savingId === anime.mal_id}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-900 transition hover:bg-purple-100 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {hasEpisodeCount && (
                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-100">
                                                        <div
                                                            className="h-full rounded-full bg-purple-700 transition-all"
                                                            style={{
                                                                width: `${
                                                                    totalEpisodes > 0
                                                                        ? (episodesWatched / totalEpisodes) * 100
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