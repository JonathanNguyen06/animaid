"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Loading from "@/app/components/Loading";

type WishlistAnime = {
    mal_id: number;
    title: string;
    image_url?: string;
    score?: number | null;
    type?: string | null;
    year?: number | null;
    episodes?: number | null;
};

export default function WishlistPage() {
    const router = useRouter();

    const [animeList, setAnimeList] = useState<WishlistAnime[]>([]);
    const [loading, setLoading] = useState(true);

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

            const data = snapshot.docs.map((doc) => doc.data() as WishlistAnime);

            setAnimeList(data);
            setLoading(false);
        }

        loadWishlist();
    }, [router]);

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-3xl font-bold text-purple-950">
                My Wishlist
            </h1>

            {loading && (
                <Loading />
            )}

            {!loading && animeList.length === 0 && (
                <p className="mt-4 text-purple-900/70">
                    Your wishlist is empty.
                </p>
            )}

            <div className="mt-6 flex flex-col gap-4">
                {animeList.map((anime) => (
                    <Link
                        key={anime.mal_id}
                        href={`/anime?id=${anime.mal_id}`}
                        className="flex gap-4 rounded-2xl border border-purple-200 bg-white relative z-10 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-purple-100">
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

                        <div className="flex flex-col justify-center">
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
                    </Link>
                ))}
            </div>
        </main>
    );
}