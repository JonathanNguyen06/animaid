"use client";
import React, { useEffect, useRef, useState } from 'react'
import Image from "next/image";
import { observeAuth, signOut } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
    const [username, setUsername] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = observeAuth((user) => {
            if (user) {
                const name = user.displayName || user.email || "User";
                setUsername(name);
            } else {
                setUsername(null);
            }
        });
        return () => unsubscribe();
    }, []);

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

    // Login now routes to the dedicated /login page instead of opening a popup

    // Hide entire navbar on auth pages
    if (pathname === "/login" || pathname === "/signup") {
        return null;
    }

    const onLogout = async () => {
        try {
            await signOut();
            setOpen(false);
            router.push("/");
        } catch (e) {
            // no-op; could add toast later
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-purple-100/60 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-30 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="flex items-center gap-2">
                    {/* Logo placeholder */}
                    <Image src={"/icons/animaid_logo.png"} alt={"AnimAid"} width={150} height={150} />
                </a>
                <nav className="flex items-center gap-7 text-base font-medium">
                    {username && (
                        <>
                            <a href="#friends" className="text-purple-900/80 hover:text-purple-900">Friends</a>
                            <a href="#wishlist" className="text-purple-900/80 hover:text-purple-900">Wishlist</a>
                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setOpen((v) => !v)}
                                    className="inline-flex items-center gap-2 rounded-full cursor-pointer border border-purple-200 px-4 py-2 text-purple-900/80 hover:text-purple-900 hover:border-purple-300"
                                >
                                    <div className="h-6 w-6 rounded-full bg-purple-200" aria-hidden />
                                    <span className="hidden sm:inline">{username}</span>
                                </button>
                                {open && (
                                    <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-purple-200/70 bg-white shadow-lg">
                                        <a
                                            href="#profile"
                                            className="block px-4 py-2 text-sm text-purple-900/80 hover:bg-purple-50 hover:text-purple-900 cursor-pointer"
                                            onClick={() => setOpen(false)}
                                        >
                                            Profile
                                        </a>
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
                        <a href="/login" className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 cursor-pointer">
                            Log in
                        </a>
                    )}
                </nav>
            </div>
        </header>
    )
}
export default Navbar
