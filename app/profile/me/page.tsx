"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    db,
    observeAuth,
    getDraftHighScore,
    type DraftHighScore,
} from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

type UserProfile = {
    uid: string;
    username?: string;
    photoURL?: string;

    dailyStreak?: number;
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
    const [draftHighScore, setDraftHighScore] = useState<DraftHighScore | null>(null);
    const [showDraftLineup, setShowDraftLineup] = useState(false);

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
                const savedDraftHighScore = await getDraftHighScore(user.uid);
                setDraftHighScore(savedDraftHighScore);

                const wishlistSnapshot = await getDocs(
                    collection(db, "users", user.uid, "wishlist")
                );

                setWishlist(
                    wishlistSnapshot.docs.map((doc) => doc.data() as WishlistAnime)
                );
            } catch (e: any) {
                setError(e?.message ?? "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <main className="relative mx-auto max-w-5xl px-4 py-8 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            {loading && (
                <section className="relative z-10 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="h-28 w-28 animate-pulse rounded-3xl border border-pink-500/20 bg-pink-500/10" />

                        <div className="flex-1">
                            <div className="h-3 w-24 animate-pulse rounded-full bg-pink-500/10" />
                            <div className="mt-4 h-7 w-48 animate-pulse rounded-full bg-pink-500/10" />
                        </div>
                    </div>
                </section>
            )}

            {error && (
                <p className="relative z-10 mt-4 text-red-300">
                    {error}
                </p>
            )}

            {!loading && !error && profile && (
                <>
                    <h1 className="relative z-10 text-3xl font-bold text-white">
                        My Profile
                    </h1>
                    <section className="relative z-10 mt-6 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-pink-500/20 bg-black/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                                {profile.photoURL ? (
                                    <Image
                                        src={profile.photoURL}
                                        alt={profile.username ?? "Profile picture"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-pink-300">
                                        {profile.username?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                    Username
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold text-white">
                                    @{profile.username}
                                </h2>
                            </div>
                        </div>
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                            Statistics
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                            Account Stats
                        </h2>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-5 shadow-[0_0_18px_rgba(251,146,60,0.10)] backdrop-blur-xl">
                                <p className="text-xs font-bold uppercase tracking-widest text-orange-200/60">
                                    Daily Streak
                                </p>

                                <p className="mt-2 text-3xl font-bold text-orange-200">
                                    🔥 {profile.dailyStreak ?? 0}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowDraftLineup((current) => !current)}
                                className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 text-left shadow-[0_0_18px_rgba(250,204,21,0.10)] backdrop-blur-xl transition hover:border-yellow-300/40 hover:bg-yellow-500/20 hover:cursor-pointer"
                            >
                                <p className="text-xs font-bold uppercase tracking-widest text-yellow-200/60">
                                    Best Draft
                                </p>

                                <p className="mt-2 text-3xl font-bold text-yellow-200">
                                    {draftHighScore?.totalPower ?? 0}
                                </p>

                                <p className="mt-1 text-xs font-semibold text-yellow-100/60">
                                    {draftHighScore
                                        ? `${draftHighScore.grade} Draft • Avg ${draftHighScore.averagePower}`
                                        : "No draft yet"}
                                </p>

                                {draftHighScore && (
                                    <p className="mt-2 text-xs font-bold text-yellow-100">
                                        Click to view lineup
                                    </p>
                                )}
                            </button>
                        </div>

                        {showDraftLineup && draftHighScore && (
                            <div className="mt-6 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-5 shadow-[0_0_20px_rgba(250,204,21,0.12)] backdrop-blur-xl">
                                <p className="text-xs font-bold uppercase tracking-widest text-yellow-200/60">
                                    High Score Lineup
                                </p>

                                <h3 className="mt-2 text-2xl font-bold text-white">
                                    {draftHighScore.grade} Draft • {draftHighScore.totalPower} Power
                                </h3>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {draftHighScore.lineup.map((pick) => (
                                        <div
                                            key={pick.position}
                                            className="
                                                relative
                                                min-h-[360px]
                                                overflow-hidden
                                                rounded-3xl
                                                border-2
                                                border-yellow-400/20
                                                bg-black
                                                text-left
                                                shadow-[0_0_20px_rgba(250,204,21,0.14)]
                                                transition-all
                                                duration-300
                                                hover:-translate-y-1
                                                hover:border-yellow-300/50
                                                hover:shadow-[0_0_28px_rgba(250,204,21,0.28)]
                                            "
                                        >
                                            {pick.character.imageUrl ? (
                                                <img
                                                    src={pick.character.imageUrl}
                                                    alt={pick.character.name}
                                                    draggable={false}
                                                    className="
                                                        pointer-events-none
                                                        absolute
                                                        inset-0
                                                        h-full
                                                        w-full
                                                        object-cover
                                                        object-[50%_20%]
                                                        transition-transform
                                                        duration-500
                                                    "
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-950 via-black to-pink-950">
                                                    <span className="text-5xl opacity-30">
                                                        ?
                                                    </span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                                            <div className="absolute inset-x-0 bottom-0 p-5">
                                                <p className="text-xs font-bold uppercase tracking-widest text-yellow-200/70">
                                                    {pick.position}
                                                </p>

                                                <h4 className="mt-2 line-clamp-1 text-xl font-black text-white drop-shadow-lg">
                                                    {pick.character.name}
                                                </h4>

                                                <p className="mt-1 line-clamp-1 text-sm font-medium text-white/65">
                                                    {pick.character.anime}
                                                </p>

                                                <div className="mt-4 flex items-end justify-between">
                                                    <span className="text-4xl font-black text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.65)] italic">
                                                        {pick.grade}
                                                    </span>

                                                    <div className="text-right">
                                                        <span className="inline-flex rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-sm font-black text-white backdrop-blur-md">
                                                            {pick.power}
                                                        </span>

                                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                                            Overall
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                    Wishlist
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    Saved Anime
                                </h2>
                            </div>

                            <Link
                                href="/wishlist"
                                className="rounded-xl border border-pink-500/20 bg-black/40 px-4 py-2 text-sm font-semibold text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.08)] transition hover:border-pink-400/40 hover:bg-pink-500/10"
                            >
                                View all
                            </Link>
                        </div>

                        {wishlist.length === 0 ? (
                            <p className="mt-5 rounded-2xl border border-pink-500/20 bg-white/[0.03] p-4 text-purple-100/70">
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
                                            className="relative z-10 flex gap-3 rounded-2xl border border-pink-500/20 bg-white/[0.03] p-3 transition hover:border-pink-400/40 hover:bg-pink-500/10 hover:shadow-[0_0_18px_rgba(236,72,153,0.12)]"
                                        >
                                            {image && (
                                                <img
                                                    src={image}
                                                    alt={title}
                                                    className="h-20 w-14 rounded-xl object-cover"
                                                />
                                            )}

                                            <div className="min-w-0 text-left">
                                                <h3 className="line-clamp-2 text-sm font-bold text-white">
                                                    {title}
                                                </h3>

                                                <p className="mt-2 text-xs text-purple-100/50">
                                                    Wishlist
                                                </p>
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