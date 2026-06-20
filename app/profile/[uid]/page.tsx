"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    auth,
    db,
    getUserCharacters,
    getDraftHighScore,
    type DraftHighScore,
} from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import AddFriendButton from "@/app/components/AddFriendButton";

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
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [draftHighScore, setDraftHighScore] = useState<DraftHighScore | null>(null);
    const [showDraftLineup, setShowDraftLineup] = useState(false);

    const totalCollectionPower = characters.reduce(
        (sum, character) => sum + character.powerLevel,
        0
    );

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
                const savedDraftHighScore = await getDraftHighScore(uid);
                setDraftHighScore(savedDraftHighScore);

                const ownedCharacters = await getUserCharacters(uid);

                const sortedCharacters = (ownedCharacters as OwnedCharacter[]).sort(
                    (a, b) => b.powerLevel - a.powerLevel
                );

                setCharacters(sortedCharacters);

                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setCanViewWishlist(false);
                    return;
                }

                const ownProfile = currentUser.uid === uid;
                setIsOwnProfile(ownProfile);

                const friendSnap = await getDoc(
                    doc(db, "users", currentUser.uid, "friends", uid)
                );

                const isFriend = friendSnap.exists();

                if (!ownProfile && !isFriend) {
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
                <p className="relative z-10 text-red-300">
                    {error}
                </p>
            )}

            {!loading && !error && profile && (
                <>
                    <section className="relative z-10 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
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

                            <div className="flex flex-1 items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                        Username
                                    </p>

                                    <h2 className="mt-2 text-2xl font-semibold text-white">
                                        @{profile.username}
                                    </h2>
                                </div>

                                {!isOwnProfile && (
                                    <AddFriendButton
                                        targetUser={{
                                            uid: profile.uid,
                                            username: profile.username,
                                            photoURL: profile.photoURL,
                                        }}
                                    />
                                )}
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
                            <div className="rounded-2xl border border-pink-500/20 bg-white/[0.03] p-5 backdrop-blur-xl">
                                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                    Collection Power
                                </p>

                                <p className="mt-2 text-3xl font-bold text-white">
                                    {totalCollectionPower.toLocaleString()}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-5 shadow-[0_0_18px_rgba(251,146,60,0.10)] backdrop-blur-xl">
                                <p className="text-xs font-bold uppercase tracking-widest text-orange-200/60">
                                    Daily Streak
                                </p>

                                <p className="mt-2 text-3xl font-bold text-orange-200">
                                    🔥 {profile.dailyStreak ?? 0}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5 shadow-[0_0_18px_rgba(16,185,129,0.10)] backdrop-blur-xl">
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-200/60">
                                    Best Higher / Lower
                                </p>

                                <p className="mt-2 text-3xl font-bold text-emerald-200">
                                    {profile.higherLowerBestStreak ?? 0}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDraftLineup((current) => !current)
                                }
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
                                    {draftHighScore.grade} Draft •{" "}
                                    {draftHighScore.totalPower} Power
                                </h3>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {draftHighScore.lineup.map((pick) => (
                                        <div
                                            key={pick.position}
                                            className="overflow-hidden rounded-2xl border border-yellow-400/20 bg-black/40 text-left shadow-[0_0_16px_rgba(250,204,21,0.10)] backdrop-blur-xl"
                                        >
                                            {pick.character.imageUrl && (
                                                <img
                                                    src={pick.character.imageUrl}
                                                    alt={pick.character.name}
                                                    className="h-40 w-full object-cover object-[center_5%]"
                                                />
                                            )}

                                            <div className="p-4">
                                                <p className="text-xs font-bold uppercase tracking-widest text-yellow-200/60">
                                                    {pick.position}
                                                </p>

                                                <h4 className="mt-2 line-clamp-1 font-bold text-white">
                                                    {pick.character.name}
                                                </h4>

                                                <p className="mt-1 line-clamp-1 text-xs text-purple-100/60">
                                                    {pick.character.anime}
                                                </p>

                                                <div className="mt-3 flex items-center justify-between">
                                                <span className="text-xl font-black text-yellow-200">
                                                    {pick.grade}
                                                </span>

                                                    <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-200">
                                                    {pick.power}
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                Collection
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Character Collection
                            </h2>
                        </div>

                        {characters.length === 0 ? (
                            <p className="mt-5 rounded-2xl border border-pink-500/20 bg-white/[0.03] p-4 text-purple-100/70">
                                This user has not collected any characters yet.
                            </p>
                        ) : (
                            <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {characters.slice(0, 8).map((character) => (
                                    <Link
                                        key={character.id}
                                        href={`/anime?id=${character.animeId}`}
                                        className="relative z-10 overflow-hidden rounded-2xl border border-pink-500/20 bg-white/[0.03] transition hover:-translate-y-1 hover:border-pink-400/40 hover:bg-pink-500/10 hover:shadow-[0_0_18px_rgba(236,72,153,0.12)]"
                                    >
                                        {character.imageUrl && (
                                            <img
                                                src={character.imageUrl}
                                                alt={character.name}
                                                className="h-44 w-full object-cover object-[center_5%]"
                                            />
                                        )}

                                        <div className="p-3 text-left">
                                        <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-2 py-1 text-[10px] font-bold uppercase text-pink-200">
                                            {character.rarity}
                                        </span>

                                            <h3 className="mt-2 line-clamp-1 text-sm font-bold text-white">
                                                {character.name}
                                            </h3>

                                            <p className="mt-1 line-clamp-1 text-xs text-purple-100/60">
                                                {character.animeTitle ??
                                                    "Unknown Anime"}
                                            </p>

                                            <p className="mt-2 text-xs font-semibold text-pink-200">
                                                Power: {character.powerLevel}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="relative z-10 mt-6 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                Wishlist
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Saved Anime
                            </h2>
                        </div>

                        {!canViewWishlist && (
                            <p className="mt-5 rounded-2xl border border-pink-500/20 bg-white/[0.03] p-4 text-purple-100/70">
                                This wishlist is private. Add this user as a friend
                                to view it.
                            </p>
                        )}

                        {canViewWishlist && wishlist.length === 0 && (
                            <p className="mt-5 rounded-2xl border border-pink-500/20 bg-white/[0.03] p-4 text-purple-100/70">
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
                                            href={
                                                anime.mal_id
                                                    ? `/anime?id=${anime.mal_id}`
                                                    : "#"
                                            }
                                            className="relative z-10 flex gap-4 rounded-2xl border border-pink-500/20 bg-white/[0.03] p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-pink-400/40 hover:bg-pink-500/10 hover:shadow-[0_0_18px_rgba(236,72,153,0.12)]"
                                        >
                                            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-pink-500/20 bg-black/40">
                                                {image ? (
                                                    <Image
                                                        src={image}
                                                        alt={title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-purple-100/40">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-col justify-center">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {title}
                                                </h3>

                                                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                                    {anime.score && (
                                                        <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-pink-200">
                                                        Score: {anime.score}
                                                    </span>
                                                    )}

                                                    {anime.type && (
                                                        <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-pink-200">
                                                        {anime.type}
                                                    </span>
                                                    )}

                                                    {anime.year && (
                                                        <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-pink-200">
                                                        {anime.year}
                                                    </span>
                                                    )}

                                                    {anime.episodes && (
                                                        <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-pink-200">
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