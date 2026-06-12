"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

type Character = {
    mal_id: number;
    name: string;
    role: string;
    image_url: string | null;
};

type Props = {
    animeId: number;
};

export default function AnimeCharacters({ animeId }: Props) {
    const router = useRouter();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [settingPhoto, setSettingPhoto] = useState<number | null>(null);
    const [successId, setSuccessId] = useState<number | null>(null);

    useEffect(() => {
        async function loadCharacters() {
            try {
                setLoading(true);

                const res = await fetch(`/api/jikan/characters?id=${animeId}`);
                const json = await res.json();

                if (!res.ok || !Array.isArray(json.data)) {
                    setCharacters([]);
                    return;
                }

                setCharacters(json.data);
            } catch {
                setCharacters([]);
            } finally {
                setLoading(false);
            }
        }

        loadCharacters();
    }, [animeId]);

    async function handleSetProfilePic(character: Character) {
        const user = auth.currentUser;

        if (!user) {
            router.push("/login");
            return;
        }

        if (!character.image_url) return;

        try {
            setSettingPhoto(character.mal_id);

            // Update Firebase Auth profile
            await updateProfile(user, { photoURL: character.image_url });

            // Update Firestore user doc
            await updateDoc(doc(db, "users", user.uid), {
                photoURL: character.image_url,
            });

            setSuccessId(character.mal_id);
            setTimeout(() => setSuccessId(null), 2500);
        } catch (err) {
            console.error("Failed to update profile picture", err);
        } finally {
            setSettingPhoto(null);
        }
    }

    if (loading) {
        return (
            <section className="mt-10">
                <h2 className="text-xl font-bold text-purple-950 mb-4">Characters</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-purple-200/70 bg-white overflow-hidden">
                            <div className="relative w-full aspect-[3/4] bg-purple-100 overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
                            </div>
                            <div className="p-2 space-y-1.5">
                                <div className="relative h-2.5 w-3/4 rounded-full bg-purple-100 overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
                                </div>
                                <div className="relative h-2 w-1/2 rounded-full bg-purple-100 overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_0.1s_infinite] bg-gradient-to-r from-transparent via-purple-50/80 to-transparent" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (characters.length === 0) return null;

    return (
        <section className="mt-10">
            <h2 className="text-xl font-bold text-purple-950 mb-1">Characters</h2>
            <p className="text-sm text-purple-900/60 mb-4">
                Click a character to use their image as your profile picture.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {Array.isArray(characters) && characters.map((character) => {
                    const isLoading = settingPhoto === character.mal_id;
                    const isSuccess = successId === character.mal_id;

                    return (
                        <button
                            key={character.mal_id}
                            type="button"
                            onClick={() => handleSetProfilePic(character)}
                            disabled={!!settingPhoto || !character.image_url}
                            className="group rounded-xl border border-purple-200/70 bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left disabled:cursor-not-allowed cursor-pointer"
                        >
                            <div className="relative w-full aspect-[3/4] bg-purple-50">
                                {character.image_url ? (
                                    <>
                                        <Image
                                            src={character.image_url}
                                            alt={character.name}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Hover overlay */}
                                        <div className={`
                                            absolute inset-0 flex items-center justify-center
                                            bg-purple-900/60 transition-opacity duration-200
                                            ${isSuccess ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                                        `}>
                                            {isLoading ? (
                                                <div className="h-6 w-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                            ) : isSuccess ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-2xl">✓</span>
                                                    <span className="text-[11px] font-semibold text-white">Set!</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 px-2 text-center">
                                                    <span className="text-lg">🖼️</span>
                                                    <span className="text-[11px] font-semibold text-white leading-tight">
                                                        Use as profile pic
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-purple-200 text-xs">
                                        No image
                                    </div>
                                )}
                            </div>

                            <div className="p-2">
                                <p className="text-xs font-semibold text-purple-900/90 line-clamp-1">
                                    {character.name}
                                </p>
                                <p className={`text-[11px] font-medium mt-0.5 ${
                                    character.role === "Main"
                                        ? "text-purple-600"
                                        : "text-purple-900/40"
                                }`}>
                                    {character.role}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
