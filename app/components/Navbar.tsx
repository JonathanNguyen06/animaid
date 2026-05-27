"use client";
import React, { useEffect, useRef, useState } from 'react'
import Image from "next/image";
import {auth, observeAuth, signOut} from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (pathname === "/login" || pathname === "/signup") {
            setUsername(null);
            setPhotoURL(null);
            return () => {};
        }

        const unsubscribe = observeAuth((user) => {
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
        <header className="sticky top-0 z-40 border-b border-purple-100/60 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-30 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="flex items-center gap-2">
                    <Image src={"/icons/animaid_logo.png"} alt={"AnimAid"} width={150} height={150}/>
                </a>
                <nav className="flex items-center gap-7 text-base font-medium">
                    {username && (
                        <>
                            <Link href="/friends" className="text-purple-900/80 hover:text-purple-900">
                                Friends
                            </Link>
                            <Link href="/wishlist" className="text-purple-900/80 hover:text-purple-900">
                                Wishlist
                            </Link>
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setOpen((v) => !v)}
                                    className="inline-flex items-center gap-2 rounded-full cursor-pointer border border-purple-200 px-3 py-1.5 text-purple-900/80 hover:text-purple-900 hover:border-purple-300"
                                >
                                    <div className="relative h-7 w-7 overflow-hidden rounded-full bg-purple-200 shrink-0">
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
                                    <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-purple-200/70 bg-white shadow-lg">
                                        <Link
                                            href="/profile/me"
                                            className="block px-4 py-2 text-sm text-purple-900/80 hover:bg-purple-50 hover:text-purple-900 cursor-pointer"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={onLogout}
                                            className="block w-full px-4 py-2 text-left text-sm text-purple-900/80 hover:bg-purple-50 hover:text-purple-900 cursor-pointer"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {!username && (
                        <a href="/login"
                           className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 cursor-pointer">
                            Log in
                        </a>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Navbar
