"use client";

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
    auth,
    observeAuth,
    signOut,
} from "@/lib/firebase";

import {
    usePathname,
    useRouter,
} from "next/navigation";


const Navbar = () => {
    const [username, setUsername,] = useState<string | null>(null);
    const [photoURL, setPhotoURL,] = useState<string | null>(null);
    const [open, setOpen,] = useState(false);
    const [authLoading, setAuthLoading,] = useState(true);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // =========================================================
    // AUTH
    // =========================================================

    useEffect(() => {
        if (
            pathname === "/login" ||
            pathname === "/signup"
        ) {
            setUsername(null);
            setPhotoURL(null);

            return () => {};
        }

        const unsubscribe =
            observeAuth(
                (user) => {
                    setAuthLoading(
                        false
                    );

                    if (user) {
                        const current =
                            auth.currentUser;

                        const name =
                            current?.displayName ||
                            user.displayName ||
                            user.email ||
                            "User";

                        setUsername(
                            name
                        );

                        setPhotoURL(
                            current?.photoURL ||
                            user.photoURL ||
                            null
                        );
                    } else {
                        setUsername(
                            null
                        );

                        setPhotoURL(
                            null
                        );
                    }
                }
            );

        return () =>
            unsubscribe();
    }, [
        pathname,
    ]);


    // =========================================================
    // CLOSE PROFILE MENU ON OUTSIDE CLICK
    // =========================================================

    useEffect(() => {
        function handleClickOutside(
            event: MouseEvent
        ) {
            if (
                open &&
                menuRef.current &&
                !menuRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, [
        open,
    ]);


    // =========================================================
    // HIDE NAVBAR ON AUTH PAGES
    // =========================================================

    if (
        pathname === "/login" ||
        pathname === "/signup"
    ) {
        return null;
    }


    // =========================================================
    // LOGOUT
    // =========================================================

    const onLogout =
        async () => {
            try {
                await signOut();

                setOpen(
                    false
                );

                router.push(
                    "/"
                );
            } catch (error) {
                console.error(
                    "Failed to log out:",
                    error
                );
            }
        };


    // =========================================================
    // ACTIVE LINK
    // =========================================================

    function navLinkClass(
        active: boolean
    ) {
        return `
            relative
            py-2
            text-sm
            font-bold
            transition-all
            duration-200

            ${
            active
                ? `
                        text-pink-300
                        drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]
                    `
                : `
                        text-purple-100/60
                        hover:text-pink-300
                        hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]
                    `
        }
        `;
    }


    return (
        <header
            className="
                sticky top-0 z-40
                border-b border-pink-500/20
                bg-black/40
                shadow-[0_0_25px_rgba(236,72,153,0.12)]
                backdrop-blur-xl
            "
        >

            {/* BACKGROUND GLOW */}
            <div
                className="
                    pointer-events-none
                    absolute inset-0
                    bg-gradient-to-r
                    from-pink-500/[0.04]
                    via-purple-500/[0.04]
                    to-fuchsia-500/[0.03]
                "
            />


            <div
                className="
                    relative
                    mx-auto
                    flex h-[100px]
                    max-w-7xl
                    items-center
                    justify-between
                    px-4
                    sm:px-6
                "
            >

                {/* ================================================= */}
                {/* LOGO */}
                {/* ================================================= */}

                <Link
                    href="/"
                    className="
                        flex
                        items-center
                        transition
                        hover:opacity-90
                    "
                >
                    <Image
                        src="/icons/animaid.png"
                        alt="AnimAid"
                        width={145}
                        height={145}
                        priority
                    />
                </Link>


                {/* ================================================= */}
                {/* NAVIGATION */}
                {/* ================================================= */}

                <nav
                    className="
                        flex
                        items-center
                        gap-6
                        md:gap-8
                    "
                >

                    {/* PLAY */}
                    <Link
                        href="/games"
                        className={navLinkClass(
                            pathname.startsWith(
                                "/games"
                            )
                        )}
                    >
                        Play

                        {pathname.startsWith(
                            "/games"
                        ) && (
                            <span
                                className="
                                    absolute
                                    -bottom-1
                                    left-1/2
                                    h-[2px]
                                    w-5
                                    -translate-x-1/2
                                    rounded-full
                                    bg-pink-400
                                    shadow-[0_0_8px_rgba(244,114,182,0.9)]
                                "
                            />
                        )}
                    </Link>


                    {/* FRIENDS */}
                    {!authLoading &&
                        username && (
                            <Link
                                href="/friends"
                                className={navLinkClass(
                                    pathname.startsWith(
                                        "/friends"
                                    )
                                )}
                            >
                                Friends

                                {pathname.startsWith(
                                    "/friends"
                                ) && (
                                    <span
                                        className="
                                            absolute
                                            -bottom-1
                                            left-1/2
                                            h-[2px]
                                            w-5
                                            -translate-x-1/2
                                            rounded-full
                                            bg-pink-400
                                            shadow-[0_0_8px_rgba(244,114,182,0.9)]
                                        "
                                    />
                                )}
                            </Link>
                        )}


                    {/* ============================================= */}
                    {/* FUTURE LEADERBOARD */}
                    {/* Uncomment once leaderboard exists */}
                    {/* ============================================= */}

                    {/*
                    <Link
                        href="/leaderboard"
                        className={navLinkClass(
                            pathname.startsWith(
                                "/leaderboard"
                            )
                        )}
                    >
                        Leaderboard
                    </Link>
                    */}


                    {/* ================================================= */}
                    {/* AUTHENTICATED USER */}
                    {/* ================================================= */}

                    {!authLoading &&
                        username && (
                            <div
                                className="relative"
                                ref={menuRef}
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpen(
                                            (value) =>
                                                !value
                                        )
                                    }
                                    className="
                                        inline-flex
                                        cursor-pointer
                                        items-center
                                        gap-2
                                        rounded-full
                                        border border-pink-500/30
                                        bg-white/5
                                        px-3
                                        py-1.5
                                        text-purple-100/80
                                        backdrop-blur-md
                                        transition-all
                                        hover:border-pink-400/60
                                        hover:bg-pink-500/10
                                        hover:shadow-[0_0_15px_rgba(236,72,153,0.35)]
                                    "
                                >

                                    {/* AVATAR */}
                                    <div
                                        className="
                                            relative
                                            h-8 w-8
                                            shrink-0
                                            overflow-hidden
                                            rounded-full
                                            border border-pink-400/50
                                            bg-black/50
                                            shadow-[0_0_12px_rgba(236,72,153,0.45)]
                                        "
                                    >

                                        {photoURL ? (
                                            <Image
                                                src={
                                                    photoURL
                                                }
                                                alt={
                                                    username
                                                }
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="
                                                    flex
                                                    h-full
                                                    w-full
                                                    items-center
                                                    justify-center
                                                    text-xs
                                                    font-black
                                                    text-pink-300
                                                "
                                            >
                                                {username?.[0]?.toUpperCase() ??
                                                    "?"}
                                            </div>
                                        )}

                                    </div>


                                    <span className="hidden max-w-[120px] truncate text-sm font-bold sm:inline">
                                        {username}
                                    </span>


                                    {/* ARROW */}
                                    <span
                                        className={`
                                            text-[10px]
                                            text-white/30
                                            transition-transform

                                            ${
                                            open
                                                ? "rotate-180"
                                                : ""
                                        }
                                        `}
                                    >
                                        ▼
                                    </span>

                                </button>


                                {/* ===================================== */}
                                {/* PROFILE DROPDOWN */}
                                {/* ===================================== */}

                                {open && (
                                    <div
                                        className="
                                            absolute
                                            right-0
                                            mt-3
                                            w-52
                                            overflow-hidden
                                            rounded-2xl
                                            border border-pink-500/20
                                            bg-black/90
                                            shadow-[0_0_25px_rgba(236,72,153,0.18)]
                                            backdrop-blur-xl
                                        "
                                    >

                                        <div
                                            className="
                                                border-b
                                                border-white/10
                                                px-4
                                                py-3
                                            "
                                        >
                                            <p
                                                className="
                                                    text-[9px]
                                                    font-black
                                                    uppercase
                                                    tracking-[0.2em]
                                                    text-pink-300/40
                                                "
                                            >
                                                Player
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    truncate
                                                    text-sm
                                                    font-black
                                                    text-white
                                                "
                                            >
                                                {
                                                    username
                                                }
                                            </p>
                                        </div>


                                        <Link
                                            href="/profile/me"
                                            onClick={() =>
                                                setOpen(
                                                    false
                                                )
                                            }
                                            className="
                                                block
                                                px-4
                                                py-3
                                                text-sm
                                                font-semibold
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
                                            onClick={
                                                onLogout
                                            }
                                            className="
                                                block
                                                w-full
                                                cursor-pointer
                                                px-4
                                                py-3
                                                text-left
                                                text-sm
                                                font-semibold
                                                text-purple-100/75
                                                transition
                                                hover:bg-red-500/10
                                                hover:text-red-300
                                            "
                                        >
                                            Log out
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}


                    {/* ================================================= */}
                    {/* AUTH LOADING */}
                    {/* ================================================= */}

                    {authLoading && (
                        <div
                            className="
                                h-10
                                w-24
                                animate-pulse
                                rounded-full
                                bg-white/5
                            "
                        />
                    )}


                    {/* ================================================= */}
                    {/* LOGGED OUT */}
                    {/* ================================================= */}

                    {!authLoading &&
                        !username && (
                            <Link
                                href="/login"
                                className="
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-pink-500
                                    to-purple-600
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-black
                                    text-white
                                    shadow-[0_0_18px_rgba(236,72,153,0.25)]
                                    transition-all
                                    hover:-translate-y-0.5
                                    hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]
                                "
                            >
                                Log In
                            </Link>
                        )}

                </nav>
            </div>
        </header>
    );
};


export default Navbar;