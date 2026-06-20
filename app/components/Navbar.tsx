"use client";
import React, { useEffect, useRef, useState } from 'react'
import Image from "next/image";
import {auth, observeAuth, signOut, observeUnopenedPackCount} from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [unopenedPackCount, setUnopenedPackCount] = useState(0);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname === "/login" || pathname === "/signup") {
            setUnopenedPackCount(0);
            return;
        }

        if (!auth.currentUser) {
            setUnopenedPackCount(0);
            return;
        }

        const unsubscribe = observeUnopenedPackCount(
            auth.currentUser.uid,
            setUnopenedPackCount
        );

        return () => unsubscribe();
    }, [username, pathname]);

    useEffect(() => {
        if (pathname === "/login" || pathname === "/signup") {
            setUsername(null);
            setPhotoURL(null);
            return () => {};
        }

        const unsubscribe = observeAuth((user) => {
            setAuthLoading(false);

            if (user) {
                const current = auth.currentUser;
                const name =
                    current?.displayName ||
                    user.displayName ||
                    user.email ||
                    "User";

                setUsername(name);
                setPhotoURL(current?.photoURL || user.photoURL || null);
            } else {
                setUsername(null);
                setPhotoURL(null);
            }
        });

        return () => unsubscribe();
    }, [pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    if (pathname === "/login" || pathname === "/signup") {
        return null;
    }

    const onLogout = async () => {
        try {
            await signOut();
            setOpen(false);
            router.push("/");
        } catch (e) {
            // no-op
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-pink-500/20 bg-black/30 backdrop-blur-xl shadow-[0_0_25px_rgba(236,72,153,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none" />
            <div className="mx-auto flex h-30 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="flex items-center gap-2">
                    <Image src={"/icons/animaid.png"} alt={"AnimAid"} width={150} height={150}/>
                </a>
                <nav className="flex items-center gap-7 text-base font-medium">
                    {!authLoading && username && (
                        <>
                            <Link href="/games" className="text-purple-100/70 transition-all hover:text-pink-300 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                                Games
                            </Link>
                            <Link
                                href="/packs"
                                className="text-purple-100/70 transition-all hover:text-pink-300 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                            >
                                Packs

                                {unopenedPackCount > 0 && (
                                    <span className="absolute -right-4 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm">
                                {unopenedPackCount > 99 ? "99+" : unopenedPackCount}
                            </span>
                                )}
                            </Link>
                            <Link href="/collection" className="text-purple-100/70 transition-all hover:text-pink-300 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                                Collection
                            </Link>
                            <Link href="/friends" className="text-purple-100/70 transition-all hover:text-pink-300 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                                Friends
                            </Link>
                            <Link href="/wishlist" className="text-purple-100/70 transition-all hover:text-pink-300 hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                                Wishlist
                            </Link>
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setOpen((v) => !v)}
                                    className="inline-flex items-center gap-2 rounded-full cursor-pointer
                                                border border-pink-500/30
                                                bg-white/5
                                                px-3 py-1.5
                                                text-purple-100/80
                                                backdrop-blur-md
                                                transition-all
                                                hover:border-pink-400/60
                                                hover:bg-pink-500/10
                                                hover:shadow-[0_0_15px_rgba(236,72,153,0.35)]"
                                >
                                    <div className="relative h-7 w-7 overflow-hidden rounded-full border border-pink-400/50 bg-black/50
                                                    shadow-[0_0_12px_rgba(236,72,153,0.45)] shrink-0">
                                        {photoURL ? (
                                            <Image
                                                src={photoURL}
                                                alt={username}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-purple-500">
                                                {username?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden sm:inline">{username}</span>
                                </button>
                                {open && (
                                    <div
                                        className="
                                            absolute right-0 mt-3 w-48 overflow-hidden
                                            rounded-2xl
                                            border border-pink-500/20
                                            bg-black/80
                                            backdrop-blur-xl
                                            shadow-[0_0_25px_rgba(236,72,153,0.18)]
                                            "
                                    >
                                        <Link
                                            href="/profile/me"
                                            onClick={() => setOpen(false)}
                                            className="
                                                block px-4 py-3
                                                text-sm font-semibold
                                                text-purple-100/75
                                                transition
                                                hover:bg-pink-500/10
                                                hover:text-pink-200
                                                "
                                        >
                                            Profile
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={onLogout}
                                            className="
                                                block w-full px-4 py-3
                                                text-left text-sm font-semibold
                                                text-purple-100/75
                                                transition
                                                hover:bg-red-500/10
                                                hover:text-red-300
                                                cursor-pointer
                                                "
                                        >
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {authLoading && (
                        <div className="h-9 w-20 animate-pulse rounded-md bg-purple-100" />
                    )}

                    {!authLoading && !username && (
                        <a
                            href="/login"
                            className="
                                        rounded-lg
                                        bg-gradient-to-r
                                        from-pink-500
                                        to-purple-600
                                        px-4 py-2
                                        text-white
                                        transition-all
                                        hover:scale-105
                                        hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]
                                        "
                        >
                            Log in
                        </a>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Navbar
