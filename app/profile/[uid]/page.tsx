"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, db, getUserCharacters } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

type UserProfile = {
    uid: string;
    username?: string;
    photoURL?: string;
};

type WishlistAnime = {
    mal_id?: number;
    title?: string;
    title_english?: string | null;
    image_url?: string;
    images?: any;
    score?: number | null;
    type?: string | null;
    year?: number | null;
    episodes?: number | null;
};

type OwnedCharacter = {
    id: string;
    characterId: number;
    animeId: number;
    animeTitle?: string;
    name: string;
    imageUrl: string;
    rarity: string;
    powerLevel: number;
    role?: string;
    favorites?: number;
};

export default function ProfilePage() {
    const params = useParams();
    const uid = params.uid as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [wishlist, setWishlist] = useState<WishlistAnime[]>([]);
    const [characters, setCharacters] = useState<OwnedCharacter[]>([]);
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

                const ownedCharacters = await getUserCharacters(uid);
                setCharacters(ownedCharacters as OwnedCharacter[]);

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

                setWishlist(
                    wishlistSnap.docs.map((doc) => doc.data() as WishlistAnime)
                );
            } catch (e: any) {
                setError(e?.message ?? "Failed to load profile");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [uid]);

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
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
                    <section className="relative z-10 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-purple-200 bg-purple-100 shadow-sm">
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
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                    Trainer Profile
                                </p>

                                <h1 className="mt-1 text-3xl font-bold text-purple-950">
                                    @{profile.username}
                                </h1>
                            </div>
                        </div>
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                Collection
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-purple-950">
                                Character Collection
                            </h2>
                        </div>

                        {characters.length === 0 ? (
                            <p className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-900/70">
                                This user has not collected any characters yet.
                            </p>
                        ) : (
                            <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {characters.slice(0, 8).map((character) => (
                                    <Link
                                        key={character.id}
                                        href={`/anime?id=${character.animeId}`}
                                        className="relative z-10 overflow-hidden rounded-2xl border border-purple-200 bg-purple-50 transition hover:bg-white hover:shadow-sm"
                                    >
                                        {character.imageUrl && (
                                            <img
                                                src={character.imageUrl}
                                                alt={character.name}
                                                className="h-44 w-full object-cover"
                                            />
                                        )}

                                        <div className="p-3 text-left">
                                            <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold uppercase text-purple-900">
                                                {character.rarity}
                                            </span>

                                            <h3 className="mt-2 line-clamp-1 text-sm font-bold text-purple-950">
                                                {character.name}
                                            </h3>

                                            <p className="mt-1 line-clamp-1 text-xs text-purple-900/60">
                                                {character.animeTitle ?? "Unknown Anime"}
                                            </p>

                                            <p className="mt-2 text-xs font-semibold text-purple-900">
                                                Power: {character.powerLevel}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                Wishlist
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-purple-950">
                                Saved Anime
                            </h2>
                        </div>

                        {!canViewWishlist && (
                            <p className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-900/70">
                                This wishlist is private. Add this user as a friend to view it.
                            </p>
                        )}

                        {canViewWishlist && wishlist.length === 0 && (
                            <p className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-900/70">
                                This user has no anime in their wishlist.
                            </p>
                        )}

                        {canViewWishlist && wishlist.length > 0 && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {wishlist.map((anime, index) => {
                                    const title =
                                        anime.title_english ||
                                        anime.title ||
                                        "Unknown Anime";

                                    const image =
                                        anime.image_url ||
                                        anime.images?.jpg?.image_url ||
                                        anime.images?.webp?.image_url;

                                    return (
                                        <Link
                                            key={`${anime.mal_id}-${index}`}
                                            href={anime.mal_id ? `/anime?id=${anime.mal_id}` : "#"}
                                            className="relative z-10 flex gap-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                                        >
                                            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-purple-100">
                                                {image ? (
                                                    <Image
                                                        src={image}
                                                        alt={title}
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
                                                <h3 className="text-lg font-semibold text-purple-950">
                                                    {title}
                                                </h3>

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
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}