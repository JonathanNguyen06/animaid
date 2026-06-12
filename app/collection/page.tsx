"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import {
    exchangeCharactersForPack,
    getUserCharacters,
    observeAuth
} from "@/lib/firebase";
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
    const [exchangeMode, setExchangeMode] = useState(false);
    const [selectedCharacters, setSelectedCharacters] = useState<OwnedCharacterCard[]>([]);

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

    const totalPower = characters.reduce(
        (sum, character) => sum + character.powerLevel,
        0
    );

    function exchangeRequirement(rarity: string) {
        switch (rarity) {
            case "Common":
                return 10;
            case "Uncommon":
                return 5;
            case "Rare":
                return 3;
            case "Epic":
                return 2;
            case "Legendary":
                return 1;
            default:
                return null;
        }
    }

    function canSelectCharacter(character: OwnedCharacterCard) {
        if (character.rarity === "Mythic") return false;

        if (selectedCharacters.length === 0) return true;

        const selectedRarity = selectedCharacters[0].rarity;
        const required = exchangeRequirement(selectedRarity);

        return (
            character.rarity === selectedRarity &&
            selectedCharacters.length < (required ?? 0)
        );
    }

    function toggleSelectedCharacter(character: OwnedCharacterCard) {
        if (!exchangeMode) return;

        const alreadySelected = selectedCharacters.some(
            (selected) => selected.id === character.id
        );

        if (alreadySelected) {
            setSelectedCharacters((current) =>
                current.filter((selected) => selected.id !== character.id)
            );
            return;
        }

        if (!canSelectCharacter(character)) return;

        setSelectedCharacters((current) => [...current, character]);
    }

    async function handleExchangeCharacters() {
        if (!user || selectedCharacters.length === 0) return;

        const rarity = selectedCharacters[0].rarity;
        const required = exchangeRequirement(rarity);

        if (!required || selectedCharacters.length !== required) return;

        await exchangeCharactersForPack({
            userId: user.uid,
            characterDocIds: selectedCharacters.map((character) => character.id),
            rarity,
        });

        setCharacters((current) =>
            current.filter(
                (character) =>
                    !selectedCharacters.some(
                        (selected) => selected.id === character.id
                    )
            )
        );

        setSelectedCharacters([]);
        setExchangeMode(false);
    }

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

                {user && characters.length > 0 && (
                    <div className="mt-5 inline-flex rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 shadow-sm">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-purple-900/50">
                                Total Collection Power
                            </p>

                            <p className="mt-1 text-2xl font-bold text-purple-950">
                                {totalPower.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setExchangeMode((current) => !current);
                            setSelectedCharacters([]);
                        }}
                        className={`rounded-2xl px-5 py-3 text-sm font-bold transition hover:cursor-pointer ${
                            exchangeMode
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-purple-900 text-white hover:bg-purple-800"
                        }`}
                    >
                        {exchangeMode ? "Cancel Exchange" : "Exchange Characters"}
                    </button>

                    <SortButton value={sortBy} setValue={setSortBy} />
                </div>

                {exchangeMode && (
                    <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                        {selectedCharacters.length === 0 ? (
                            <p>
                                Select characters of the same rarity to exchange for 1 character pack.
                                Mythic characters cannot be exchanged.
                            </p>
                        ) : (
                            <p>
                                Selected {selectedCharacters.length} /{" "}
                                {exchangeRequirement(selectedCharacters[0].rarity)}{" "}
                                {selectedCharacters[0].rarity} characters.
                            </p>
                        )}
                    </div>
                )}

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
                            <button
                                key={character.id}
                                type="button"
                                onClick={() => {
                                    if (exchangeMode) {
                                        toggleSelectedCharacter(character);
                                    }
                                }}
                                disabled={exchangeMode && !canSelectCharacter(character) && !selectedCharacters.some((selected) => selected.id === character.id)}
                                className={`relative z-10 overflow-hidden rounded-3xl border hover:cursor-pointer bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                                    selectedCharacters.some((selected) => selected.id === character.id)
                                        ? "border-yellow-400 ring-4 ring-yellow-200"
                                        : "border-purple-200"
                                } ${
                                    exchangeMode && character.rarity === "Mythic"
                                        ? "opacity-50"
                                        : ""
                                }`}
                            >
                                {character.imageUrl && (
                                    <img
                                        src={character.imageUrl}
                                        alt={character.name}
                                        className="h-64 w-full object-cover object-[center_5%]"
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
                            </button>
                        ))}
                    </div>
                )}

                {exchangeMode && selectedCharacters.length > 0 && (
                    <div className="sticky bottom-4 z-20 mt-6 rounded-3xl border border-purple-200 bg-white p-4 shadow-xl">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-semibold text-purple-950">
                                {selectedCharacters.length} /{" "}
                                {exchangeRequirement(selectedCharacters[0].rarity)} selected
                            </p>

                            <button
                                type="button"
                                onClick={handleExchangeCharacters}
                                disabled={
                                    selectedCharacters.length !==
                                    exchangeRequirement(selectedCharacters[0].rarity)
                                }
                                className="rounded-2xl bg-purple-900 px-5 py-3 font-bold text-white transition hover:bg-purple-800 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Exchange for Pack
                            </button>
                        </div>
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