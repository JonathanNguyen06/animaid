"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, getUserCharacters, observeAuth } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

type UserProfile = {
    uid: string;
    username?: string;
    photoURL?: string;

    dailyStreak?: number;
    higherLowerBestStreak?: number;
};

type WishlistAnime = {
    mal_id?: number;
    title?: string;
    title_english?: string | null;
    images?: any;
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
};

export default function MyProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [wishlist, setWishlist] = useState<WishlistAnime[]>([]);
    const [characters, setCharacters] = useState<OwnedCharacter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const totalCollectionPower = characters.reduce(
        (sum, character) => sum + character.powerLevel,
        0
    );

    useEffect(() => {
        const unsubscribe = observeAuth(async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const profileRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(profileRef);

                if (!snapshot.exists()) {
                    setError("Profile not found.");
                    setLoading(false);
                    return;
                }

                setProfile(snapshot.data() as UserProfile);

                const wishlistSnapshot = await getDocs(
                    collection(db, "users", user.uid, "wishlist")
                );

                setWishlist(
                    wishlistSnapshot.docs.map((doc) => doc.data() as WishlistAnime)
                );

                const ownedCharacters = await getUserCharacters(user.uid);
                setCharacters(ownedCharacters as OwnedCharacter[]);
            } catch (e: any) {
                setError(e?.message ?? "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-8">
                <p className="text-purple-900/70">Loading profile...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-3xl font-bold text-purple-950">
                My Profile
            </h1>

            {error && (
                <p className="mt-4 text-red-500">
                    {error}
                </p>
            )}

            {profile && (
                <>
                    <section className="relative z-10 mt-6 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-purple-200 bg-purple-100 shadow-sm">
                                {profile.photoURL ? (
                                    <Image
                                        src={profile.photoURL}
                                        alt={profile.username ?? "Profile picture"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-purple-300">
                                        {profile.username?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                    Username
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold text-purple-950">
                                    @{profile.username}
                                </h2>
                            </div>
                        </div>
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                            Statistics
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-purple-950">
                            Account Stats
                        </h2>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                    Collection Power
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-950">
                                    {totalCollectionPower.toLocaleString()}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-orange-700/60">
                                    Daily Streak
                                </p>

                                <p className="mt-2 text-3xl font-bold text-orange-700">
                                    🔥 {profile.dailyStreak ?? 0}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-green-700/60">
                                    Best Higher / Lower
                                </p>

                                <p className="mt-2 text-3xl font-bold text-green-700">
                                    {profile.higherLowerBestStreak ?? 0}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                    Wishlist
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-purple-950">
                                    Saved Anime
                                </h2>
                            </div>

                            <Link
                                href="/wishlist"
                                className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-900 shadow-sm transition hover:bg-purple-50"
                            >
                                View all
                            </Link>
                        </div>

                        {wishlist.length === 0 ? (
                            <p className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-900/70">
                                No anime in your wishlist yet.
                            </p>
                        ) : (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {wishlist.slice(0, 6).map((anime, index) => {
                                    const animeId = anime.mal_id;
                                    const title = anime.title_english || anime.title || "Unknown Anime";
                                    const image =
                                        anime.images?.jpg?.image_url ||
                                        anime.images?.webp?.image_url;

                                    return (
                                        <Link
                                            key={`${animeId}-${index}`}
                                            href={animeId ? `/anime?id=${animeId}` : "/wishlist"}
                                            className="relative z-10 flex gap-3 rounded-2xl border border-purple-200 bg-purple-50 p-3 transition hover:bg-white hover:shadow-sm"
                                        >
                                            {image && (
                                                <img
                                                    src={image}
                                                    alt={title}
                                                    className="h-20 w-14 rounded-xl object-cover"
                                                />
                                            )}

                                            <div className="min-w-0 text-left">
                                                <h3 className="line-clamp-2 text-sm font-bold text-purple-950">
                                                    {title}
                                                </h3>

                                                <p className="mt-2 text-xs text-purple-900/50">
                                                    Wishlist
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                    Collection
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-purple-950">
                                    Character Collection
                                </h2>
                            </div>

                            <Link
                                href="/collection"
                                className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-900 shadow-sm transition hover:bg-purple-50"
                            >
                                View all
                            </Link>
                        </div>

                        {characters.length === 0 ? (
                            <p className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-900/70">
                                No characters collected yet.
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
                </>
            )}
        </main>
    );
}