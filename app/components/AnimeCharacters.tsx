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
            <section className="relative z-10 mt-10">
                <h2 className="mb-4 text-xl font-bold text-white">
                    Characters
                </h2>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="
                            overflow-hidden rounded-xl
                            border border-pink-500/20
                            bg-black/40
                            backdrop-blur-md
                        "
                        >
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-pink-500/10">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-pink-300/10 to-transparent" />
                            </div>

                            <div className="space-y-1.5 p-2">
                                <div className="relative h-2.5 w-3/4 overflow-hidden rounded-full bg-pink-500/10">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-pink-300/10 to-transparent" />
                                </div>

                                <div className="relative h-2 w-1/2 overflow-hidden rounded-full bg-pink-500/10">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_0.1s_infinite] bg-gradient-to-r from-transparent via-pink-300/10 to-transparent" />
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
        <section className="relative z-10 mt-10">
            <h2 className="mb-1 text-xl font-bold text-white">
                Characters
            </h2>

            <p className="mb-4 text-sm text-purple-100/60">
                Click a character to use their image as your profile picture.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {Array.isArray(characters) && characters.map((character) => {
                    const isLoading = settingPhoto === character.mal_id;
                    const isSuccess = successId === character.mal_id;

                    return (
                        <button
                            key={character.mal_id}
                            type="button"
                            onClick={() => handleSetProfilePic(character)}
                            disabled={!!settingPhoto || !character.image_url}
                            className="
                            group overflow-hidden rounded-xl
                            border border-pink-500/20
                            bg-black/40
                            text-left
                            shadow-[0_0_15px_rgba(236,72,153,0.06)]
                            backdrop-blur-md
                            transition-all duration-300
                            hover:-translate-y-1
                            hover:border-pink-500/40
                            hover:shadow-[0_0_25px_rgba(236,72,153,0.18)]
                            disabled:cursor-not-allowed
                            cursor-pointer
                        "
                        >
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/30">
                                {character.image_url ? (
                                    <>
                                        <Image
                                            src={character.image_url}
                                            alt={character.name}
                                            fill
                                            className="
                                            object-cover
                                            transition-transform duration-500
                                            group-hover:scale-105
                                        "
                                        />

                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50" />

                                        <div
                                            className={`
                                            absolute inset-0 flex items-center justify-center
                                            bg-black/70
                                            backdrop-blur-[2px]
                                            transition-opacity duration-200
                                            ${isSuccess ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                                        `}
                                        >
                                            {isLoading ? (
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-300/30 border-t-pink-300" />
                                            ) : isSuccess ? (
                                                <div className="flex flex-col items-center gap-1 text-pink-200">
                                                <span className="text-2xl drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                                                    ✓
                                                </span>
                                                    <span className="text-[11px] font-semibold text-white">
                                                    Set!
                                                </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 px-2 text-center">
                                                    <span className="text-lg">🖼️</span>
                                                    <span className="text-[11px] font-semibold leading-tight text-white">
                                                    Use as profile pic
                                                </span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-purple-100/40">
                                        No image
                                    </div>
                                )}
                            </div>

                            <div className="p-2">
                                <p className="line-clamp-1 text-xs font-semibold text-white transition-colors group-hover:text-pink-200">
                                    {character.name}
                                </p>

                                <p
                                    className={`mt-0.5 text-[11px] font-medium ${
                                        character.role === "Main"
                                            ? "text-pink-300"
                                            : "text-purple-100/40"
                                    }`}
                                >
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
