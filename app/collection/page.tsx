"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import { getUserCharacters, observeAuth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import SortButton, { CharacterSortOption } from "@/app/components/SortButton";

type OwnedCharacterCard = {
    id: string;
    characterId: number;
    animeId: number;
    animeTitle?: string;
    name: string;
    imageUrl: string;
    role: string;
    favorites: number;
    powerLevel: number;
    rarity: string;
};

export default function CollectionPage() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [characters, setCharacters] = useState<OwnedCharacterCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPowerInfo, setShowPowerInfo] = useState(false);
    const [sortBy, setSortBy] = useState<CharacterSortOption>("power-desc");

    useEffect(() => {
        const unsubscribe = observeAuth((firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authLoading) return;

        async function loadCharacters() {
            if (!user) {
                setLoading(false);
                return;
            }

            const ownedCharacters = await getUserCharacters(user.uid);
            setCharacters(ownedCharacters as OwnedCharacterCard[]);
            setLoading(false);
        }

        loadCharacters();
    }, [authLoading, user]);

    if (authLoading || loading) {
        return <Loading />;
    }

    function rarityClass(rarity: string) {
        switch (rarity) {
            case "Common":
                return "bg-gray-100 text-gray-700";

            case "Uncommon":
                return "bg-green-100 text-green-700";

            case "Rare":
                return "bg-blue-100 text-blue-700";

            case "Epic":
                return "bg-purple-100 text-purple-700";

            case "Legendary":
                return "bg-yellow-100 text-yellow-700";

            case "Mythic":
                return "bg-red-100 text-red-700";

            default:
                return "bg-purple-100 text-purple-900";
        }
    }

    function rarityPowerClass(rarity: string) {
        switch (rarity) {
            case "Common":
                return "text-gray-700";

            case "Uncommon":
                return "text-green-700";

            case "Rare":
                return "text-blue-700";

            case "Epic":
                return "text-purple-700";

            case "Legendary":
                return "text-yellow-700";

            case "Mythic":
                return "text-red-700";

            default:
                return "text-purple-900";
        }
    }

    const sortedCharacters = [...characters].sort((a, b) => {
        switch (sortBy) {
            case "power-desc":
                return b.powerLevel - a.powerLevel;

            case "power-asc":
                return a.powerLevel - b.powerLevel;

            case "name-asc":
                return a.name.localeCompare(b.name);

            case "anime-asc":
                return (a.animeTitle ?? "").localeCompare(b.animeTitle ?? "");

            case "favorites-desc":
                return b.favorites - a.favorites;

            case "favorites-asc":
                return a.favorites - b.favorites;

            default:
                return 0;
        }
    });

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-6xl px-4 py-10">
            <section className="relative z-10 rounded-3xl border border-purple-200 bg-white p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Collection
                </p>

                <div className="mt-3 flex items-start justify-between gap-4">
                    <h1 className="text-4xl font-bold text-purple-950">
                        Your Characters
                    </h1>

                    <button
                        type="button"
                        onClick={() => setShowPowerInfo(true)}
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-200 bg-purple-50 text-sm font-bold text-purple-900 transition hover:bg-purple-100 hover:cursor-pointer"
                        aria-label="Power information"
                    >
                        ?
                    </button>
                </div>

                <p className="mt-3 text-purple-900/70">
                    View the characters you have earned from packs.
                </p>

                <div className="mt-6 flex justify-end">
                    <SortButton value={sortBy} setValue={setSortBy} />
                </div>

                {!user && (
                    <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        You must be signed in to view your collection.
                    </p>
                )}

                {user && characters.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50 p-6 text-purple-900/70">
                        You do not have any characters yet.
                    </div>
                )}

                {user && characters.length > 0 && (
                    <div className="relative z-10 mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {sortedCharacters.map((character) => (
                            <Link
                                key={character.id}
                                href={`/anime?id=${character.animeId}`}
                                className="relative z-10 overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                {character.imageUrl && (
                                    <img
                                        src={character.imageUrl}
                                        alt={character.name}
                                        className="h-64 w-full object-cover"
                                    />
                                )}

                                <div className="p-4">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${rarityClass(character.rarity)}`}
                                    >
                                        {character.rarity}
                                    </span>

                                    <h2 className="mt-3 font-bold text-purple-950">
                                        {character.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-purple-900/60">
                                        {character.animeTitle ?? "Unknown Anime"}
                                    </p>

                                    <p
                                        className={`mt-3 text-sm font-semibold ${rarityPowerClass(character.rarity)}`}
                                    >
                                        Power: {character.powerLevel}
                                    </p>

                                    <p className="mt-1 text-xs text-purple-900/50">
                                        {character.role} • {character.favorites} favorites
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {showPowerInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
                    <div className="relative z-10 w-full max-w-lg rounded-3xl border border-purple-200 bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-2xl font-bold text-purple-950">
                                Power Levels
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowPowerInfo(false)}
                                className="text-purple-400 transition hover:text-purple-900 hover:cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-sm leading-6 text-purple-900/70">
                            <p>
                                Every character has a Power Level that represents their overall value and rarity.
                            </p>

                            <p>
                                Power is influenced by factors such as the character's popularity, the success of their anime, and the significance of their role within the story.
                            </p>

                            <p>
                                More iconic and influential characters tend to receive higher Power Levels and rarer classifications.
                            </p>

                            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
                                <h3 className="font-semibold text-purple-950">
                                    Rarity Tiers
                                </h3>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-700">
                                        Common
                                    </span>

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700">
                                        Uncommon
                                    </span>

                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                                        Rare
                                    </span>

                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase text-purple-700">
                                        Epic
                                    </span>

                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold uppercase text-yellow-700">
                                        Legendary
                                    </span>

                                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700">
                                        Mythic
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-purple-900/50">
                                The exact formula is intentionally hidden to encourage discovery and collecting.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}