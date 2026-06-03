"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import { getUserCharacters, observeAuth } from "@/lib/firebase";
import type { User } from "firebase/auth";

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

    return (
        <main className="mx-auto min-h-[calc(100vh-130px)] max-w-6xl px-4 py-10">
            <section className="relative z-10 rounded-3xl border border-purple-200 bg-white p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                    Collection
                </p>

                <h1 className="mt-3 text-4xl font-bold text-purple-950">
                    Your Characters
                </h1>

                <p className="mt-3 text-purple-900/70">
                    View the characters you have earned from packs.
                </p>

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
                        {characters.map((character) => (
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
                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase text-purple-900">
                                        {character.rarity}
                                    </span>

                                    <h2 className="mt-3 font-bold text-purple-950">
                                        {character.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-purple-900/60">
                                        From {character.animeTitle ?? "Unknown Anime"}
                                    </p>

                                    <p className="mt-3 text-sm font-semibold text-purple-900">
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
        </main>
    );
}