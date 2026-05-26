"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

type UserProfile = {
    uid: string;
    username?: string;
    photoURL?: string;
};

type WishlistAnime = {
    mal_id: number;
    title: string;
    image_url?: string;
    score?: number | null;
    type?: string | null;
    year?: number | null;
    episodes?: number | null;
};

export default function ProfilePage() {
    const params = useParams();
    const uid = params.uid as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [wishlist, setWishlist] = useState<WishlistAnime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canViewWishlist, setCanViewWishlist] = useState(false);


    useEffect(() => {
        async function loadProfile() {
            if (!uid) {
                setError("Missing user id");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const profileSnap = await getDoc(doc(db, "users", uid));

                if (!profileSnap.exists()) {
                    setError("User not found");
                    return;
                }

                setProfile(profileSnap.data() as UserProfile);

                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setCanViewWishlist(false);
                    return;
                }

                const isOwnProfile = currentUser.uid === uid;

                const friendSnap = await getDoc(
                    doc(db, "users", currentUser.uid, "friends", uid)
                );

                const isFriend = friendSnap.exists();

                if (!isOwnProfile && !isFriend) {
                    setCanViewWishlist(false);
                    return;
                }

                setCanViewWishlist(true);

                const wishlistSnap = await getDocs(
                    collection(db, "users", uid, "wishlist")
                );

                const wishlistData = wishlistSnap.docs.map(
                    (doc) => doc.data() as WishlistAnime
                );

                setWishlist(wishlistData);
            } catch (e: any) {
                setError(e?.message ?? "Failed to load profile");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [uid]);

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            {loading && (
                <p className="text-purple-900/70">
                    Loading profile...
                </p>
            )}

            {error && (
                <p className="text-red-500">
                    {error}
                </p>
            )}

            {!loading && !error && profile && (
                <>
                    <section className="rounded-3xl border border-purple-200 bg-white relative z-10 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-purple-100">
                                {profile.photoURL ? (
                                    <Image
                                        src={profile.photoURL}
                                        alt={profile.username ?? "Profile picture"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-purple-300">
                                        {profile.username?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-purple-950">
                                    @{profile.username}
                                </h1>
                                <p className="mt-1 text-purple-900/70">
                                    Wishlist
                                </p>
                            </div>
                        </div>
                    </section>

                    {!canViewWishlist && (
                        <p className="mt-6 text-purple-900/70">
                            This wishlist is private.
                        </p>
                    )}

                    {wishlist.length === 0 && canViewWishlist ? (
                        <p className="mt-6 text-purple-900/70">
                            This user has no anime in their wishlist.
                        </p>
                    ) : (
                        <div className="mt-6 flex flex-col gap-4">
                            {wishlist.map((anime) => (
                                <Link
                                    key={anime.mal_id}
                                    href={`/anime?id=${anime.mal_id}`}
                                    className="flex gap-4 rounded-2xl border border-purple-200 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                    )}
                </>
            )}
        </main>
    );
}