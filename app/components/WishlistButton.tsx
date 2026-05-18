"use client";

import {useEffect, useState} from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { Tooltip } from "@mui/material";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Anime = {
    mal_id: number;
    title: string;
    score?: number | null;
    images?: {
        jpg?: { image_url?: string; large_image_url?: string };
        webp?: { image_url?: string; large_image_url?: string };
    };
    type?: string | null;
    year?: number | null;
    episodes?: number | null;
};

type Props = {
    anime: Anime;
};

export default function WishlistButton({ anime }: Props) {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const img =
        anime.images?.webp?.image_url ||
        anime.images?.jpg?.image_url ||
        "";

    useEffect(() => {
        async function checkWishlist() {
            const user = auth.currentUser;
            if (!user) {
                setAdded(false);
                return;
            }

            const wishlistRef = doc(
                db,
                "users",
                user.uid,
                "wishlist",
                String(anime.mal_id)
            );

            const snapshot = await getDoc(wishlistRef);

            setAdded(snapshot.exists());
            setLoading(false);
        }

        checkWishlist();
    }, [anime.mal_id]);

    async function handleClick() {
        const user = auth.currentUser;

        if (!user) {
            router.push("/login");
            return;
        }

        const wishlistRef = doc(
            db,
            "users",
            user.uid,
            "wishlist",
            String(anime.mal_id)
        );

        if (added) {
            await deleteDoc(wishlistRef);
            setAdded(false);
        } else {
            await setDoc(wishlistRef, {
                mal_id: anime.mal_id,
                title: anime.title,
                image_url: img,
                score: anime.score ?? null,
                type: anime.type ?? null,
                year: anime.year ?? null,
                episodes: anime.episodes ?? null,
                created_at: serverTimestamp(),
            });

            setAdded(true);
        }
    }

    if (loading) {
        return (
            <button
                type="button"
                disabled
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-300 shadow-sm"
                aria-label="Checking wishlist"
            />
        );
    }

    return (
        <Tooltip title={added ? "Remove from wishlist" : "Add to wishlist"}>
            <button
                type="button"
                onClick={handleClick}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-900 shadow-sm transition hover:bg-purple-50"
                aria-label={added ? "Remove from wishlist" : "Add to wishlist"}
            >
                {added ? (
                    <CheckIcon fontSize="small" />
                ) : (
                    <AddIcon fontSize="small" />
                )}
            </button>
        </Tooltip>
    );
}