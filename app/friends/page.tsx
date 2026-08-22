"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    auth,
    db,
    observeAuth,
} from "@/lib/firebase";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";

import Link from "next/link";
import Image from "next/image";

import AddFriendButton from "@/app/components/AddFriendButton";
import FriendRequestsPanel from "@/app/components/FriendRequestsPanel";
import SearchBar from "@/app/components/Searchbar";


type UserProfile = {
    uid: string;
    username?: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
};


export default function FriendsPage() {
    const [search, setSearch,] = useState("");
    const [users, setUsers,] = useState<UserProfile[]>([]);
    const [loading, setLoading,] = useState(false);
    const [error, setError,] = useState<string | null>(null);
    const [showRequests, setShowRequests,] = useState(false);
    const [friends, setFriends,] = useState<UserProfile[]>([]);
    const [friendsLoading, setFriendsLoading,] = useState(true);
    const [requestCount, setRequestCount,] = useState(0);


    // =========================================================
    // FRIENDS LISTENER
    // =========================================================

    useEffect(() => {
        let unsubscribeFriends:
            (() => void) | null =
            null;

        const unsubscribeAuth =
            observeAuth((user) => {
                if (
                    unsubscribeFriends
                ) {
                    unsubscribeFriends();
                    unsubscribeFriends =
                        null;
                }

                if (!user) {
                    setFriends([]);
                    setFriendsLoading(
                        false
                    );

                    return;
                }

                setFriendsLoading(
                    true
                );

                const friendsRef =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "friends"
                    );

                unsubscribeFriends =
                    onSnapshot(
                        friendsRef,

                        async (
                            snapshot
                        ) => {
                            const data =
                                await Promise.all(
                                    snapshot.docs.map(
                                        async (
                                            friendDoc
                                        ) => {
                                            try {
                                                const profileSnap =
                                                    await getDoc(
                                                        doc(
                                                            db,
                                                            "users",
                                                            friendDoc.id
                                                        )
                                                    );

                                                if (
                                                    profileSnap.exists()
                                                ) {
                                                    return {
                                                        uid:
                                                        friendDoc.id,

                                                        ...profileSnap.data(),
                                                    } as UserProfile;
                                                }
                                            } catch (
                                                error
                                                ) {
                                                console.error(
                                                    "Failed to load friend profile:",
                                                    error
                                                );
                                            }

                                            return {
                                                uid:
                                                friendDoc.id,

                                                ...friendDoc.data(),
                                            } as UserProfile;
                                        }
                                    )
                                );

                            setFriends(
                                data
                            );

                            setFriendsLoading(
                                false
                            );
                        },

                        (error) => {
                            console.error(
                                "Failed to listen for friends:",
                                error
                            );

                            setFriends(
                                []
                            );

                            setFriendsLoading(
                                false
                            );
                        }
                    );
            });

        return () => {
            unsubscribeAuth();

            if (
                unsubscribeFriends
            ) {
                unsubscribeFriends();
            }
        };
    }, []);


    // =========================================================
    // REQUEST COUNT
    // =========================================================

    useEffect(() => {
        let unsubscribeRequests:
            (() => void) | null =
            null;

        const unsubscribeAuth =
            observeAuth((user) => {
                if (
                    unsubscribeRequests
                ) {
                    unsubscribeRequests();
                    unsubscribeRequests =
                        null;
                }

                if (!user) {
                    setRequestCount(
                        0
                    );

                    return;
                }

                const requestsRef =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "friendRequests"
                    );

                const requestsQuery =
                    query(
                        requestsRef,
                        where(
                            "status",
                            "==",
                            "pending"
                        )
                    );

                unsubscribeRequests =
                    onSnapshot(
                        requestsQuery,

                        (snapshot) => {
                            setRequestCount(
                                snapshot.size
                            );
                        },

                        (error) => {
                            console.error(
                                "Failed to listen for friend requests:",
                                error
                            );

                            setRequestCount(
                                0
                            );
                        }
                    );
            });

        return () => {
            unsubscribeAuth();

            if (
                unsubscribeRequests
            ) {
                unsubscribeRequests();
            }
        };
    }, []);


    // =========================================================
    // SEARCH
    // =========================================================

    async function handleSearch(
        event: React.FormEvent
    ) {
        event.preventDefault();

        const term =
            search
                .trim()
                .toLowerCase();

        if (!term) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const usersRef =
                collection(
                    db,
                    "users"
                );

            const usersQuery =
                query(
                    usersRef,

                    orderBy(
                        "username"
                    ),

                    where(
                        "username",
                        ">=",
                        term
                    ),

                    where(
                        "username",
                        "<=",
                        term + "\uf8ff"
                    ),

                    limit(10)
                );

            const snapshot =
                await getDocs(
                    usersQuery
                );

            const currentUserId =
                auth.currentUser
                    ?.uid;

            const results =
                snapshot.docs
                    .map(
                        (
                            userDoc
                        ) => ({
                            uid:
                            userDoc.id,

                            ...userDoc.data(),
                        } as UserProfile)
                    )
                    .filter(
                        (user) =>
                            user.uid !==
                            currentUserId
                    );

            setUsers(
                results
            );
        } catch (error: any) {
            setError(
                error?.message ??
                "Failed to search users"
            );

            setUsers(
                []
            );
        } finally {
            setLoading(
                false
            );
        }
    }


    return (
        <main className="relative min-h-[calc(100vh-130px)] overflow-hidden px-4 py-10 text-white">

            {/* ===================================================== */}
            {/* BACKGROUND */}
            {/* ===================================================== */}

            <div className="pointer-events-none fixed inset-0">

                <div className="absolute -left-24 top-20 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                <div className="absolute -right-24 top-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/[0.05] blur-[140px]" />

            </div>


            <div className="relative z-10 mx-auto max-w-6xl">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <section className="mb-8">

                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                        <div>

                            <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-300/55">
                                Social
                            </p>

                            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
                                Find Your Squad
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-purple-100/50">
                                Find other AnimAid players,
                                build your friends list, and
                                connect with people you can
                                challenge to future drafts.
                            </p>

                        </div>


                        {/* REQUEST BUTTON */}

                        <button
                            type="button"
                            onClick={() =>
                                setShowRequests(
                                    (
                                        value
                                    ) =>
                                        !value
                                )
                            }
                            className="
                                relative
                                inline-flex
                                shrink-0
                                cursor-pointer
                                items-center
                                gap-3
                                rounded-2xl
                                border border-purple-400/20
                                bg-purple-500/[0.08]
                                px-5 py-3
                                text-sm
                                font-black
                                text-purple-100
                                shadow-[0_0_20px_rgba(168,85,247,0.08)]
                                backdrop-blur-xl
                                transition
                                hover:-translate-y-0.5
                                hover:border-purple-400/40
                                hover:bg-purple-500/[0.12]
                                hover:shadow-[0_0_25px_rgba(168,85,247,0.16)]
                            "
                        >

                            <span>
                                {showRequests
                                    ? "Hide Requests"
                                    : "Friend Requests"}
                            </span>

                            <span className="text-purple-300/60">
                                {showRequests
                                    ? "↑"
                                    : "↓"}
                            </span>


                            {requestCount >
                                0 && (
                                    <span
                                        className="
                                        absolute
                                        -right-2
                                        -top-2
                                        flex
                                        h-6
                                        min-w-6
                                        items-center
                                        justify-center
                                        rounded-full
                                        border border-pink-300/30
                                        bg-pink-500
                                        px-1.5
                                        text-[10px]
                                        font-black
                                        text-white
                                        shadow-[0_0_15px_rgba(236,72,153,0.6)]
                                    "
                                    >
                                    {requestCount >
                                    99
                                        ? "99+"
                                        : requestCount}
                                </span>
                                )}

                        </button>

                    </div>

                </section>


                {/* ================================================= */}
                {/* REQUEST PANEL */}
                {/* ================================================= */}

                {showRequests && (
                    <section className="mb-6">
                        <FriendRequestsPanel />
                    </section>
                )}


                {/* ================================================= */}
                {/* SEARCH CARD */}
                {/* ================================================= */}

                <section
                    className="
                        overflow-hidden
                        rounded-[2rem]
                        border border-pink-500/20
                        bg-gradient-to-br
                        from-pink-500/[0.08]
                        via-black/50
                        to-purple-500/[0.08]
                        p-6
                        shadow-[0_0_35px_rgba(236,72,153,0.1)]
                        backdrop-blur-xl
                        sm:p-8
                    "
                >

                    <div className="flex items-center gap-4">

                        <div
                            className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                border border-pink-400/20
                                bg-pink-500/10
                                text-xl
                                shadow-[0_0_18px_rgba(236,72,153,0.1)]
                            "
                        >
                            🔎
                        </div>

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-300/45">
                                Discover Players
                            </p>

                            <h2 className="mt-1 text-2xl font-black text-white">
                                Search by Username
                            </h2>

                        </div>

                    </div>


                    <div className="mt-6">
                        <SearchBar
                            query={search}
                            setQuery={
                                setSearch
                            }
                            onSubmit={
                                handleSearch
                            }
                            placeholder="Search AnimAid users..."
                            ariaLabel="Search users by username"
                            buttonText="Search"
                        />
                    </div>


                    {loading && (
                        <div className="mt-5 flex items-center gap-3 text-sm text-white/40">

                            <div className="h-2 w-2 animate-pulse rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]" />

                            Searching players...

                        </div>
                    )}


                    {error && (
                        <div
                            className="
                                mt-5
                                rounded-2xl
                                border border-red-400/20
                                bg-red-500/[0.07]
                                px-4 py-3
                                text-sm
                                font-semibold
                                text-red-300
                            "
                        >
                            {error}
                        </div>
                    )}


                    {!loading &&
                        !error &&
                        users.length ===
                        0 &&
                        search && (
                            <p className="mt-5 text-sm text-white/35">
                                No users found
                                matching &quot;
                                {search}
                                &quot;.
                            </p>
                        )}

                </section>


                {/* ================================================= */}
                {/* SEARCH RESULTS */}
                {/* ================================================= */}

                {users.length > 0 && (
                    <section className="mt-8">

                        <div className="mb-4 flex items-center justify-between">

                            <div>

                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-300/40">
                                    Search Results
                                </p>

                                <h2 className="mt-1 text-xl font-black text-white">
                                    Players
                                </h2>

                            </div>

                            <p className="text-xs font-bold text-white/25">
                                {
                                    users.length
                                }{" "}
                                found
                            </p>

                        </div>


                        <div className="grid gap-3">

                            {users.map(
                                (user) => (
                                    <Link
                                        key={
                                            user.uid
                                        }
                                        href={`/profile/${user.uid}`}
                                        className="
                                            group
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            rounded-2xl
                                            border border-white/10
                                            bg-black/40
                                            p-4
                                            backdrop-blur-xl
                                            transition
                                            hover:-translate-y-0.5
                                            hover:border-pink-400/30
                                            hover:bg-pink-500/[0.05]
                                            hover:shadow-[0_0_25px_rgba(236,72,153,0.1)]
                                        "
                                    >

                                        <PlayerIdentity
                                            user={
                                                user
                                            }
                                        />


                                        <div
                                            onClick={(
                                                event
                                            ) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                            }}
                                        >
                                            <AddFriendButton
                                                targetUser={
                                                    user
                                                }
                                            />
                                        </div>

                                    </Link>
                                )
                            )}

                        </div>

                    </section>
                )}


                {/* ================================================= */}
                {/* FRIENDS */}
                {/* ================================================= */}

                <section className="mt-10">

                    <div className="mb-5 flex items-end justify-between">

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300/45">
                                Your Network
                            </p>

                            <h2 className="mt-1 text-2xl font-black text-white">
                                Friends
                            </h2>

                        </div>
                    </div>


                    <div
                        className="
                            overflow-hidden
                            rounded-[2rem]
                            border border-purple-400/15
                            bg-black/40
                            p-4
                            shadow-[0_0_30px_rgba(168,85,247,0.07)]
                            backdrop-blur-xl
                            sm:p-5
                        "
                    >

                        {friendsLoading && (
                            <div className="flex min-h-[170px] items-center justify-center">

                                <div className="text-center">

                                    <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.8)]" />

                                    <p className="mt-4 text-sm font-semibold text-white/35">
                                        Loading friends...
                                    </p>

                                </div>

                            </div>
                        )}


                        {!friendsLoading &&
                            friends.length ===
                            0 && (
                                <div className="flex min-h-[190px] items-center justify-center text-center">

                                    <div>

                                        <div
                                            className="
                                                mx-auto
                                                flex
                                                h-14
                                                w-14
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                border border-white/10
                                                bg-white/[0.03]
                                                text-2xl
                                            "
                                        >
                                            👥
                                        </div>

                                        <p className="mt-4 font-black text-white/55">
                                            Your squad is
                                            empty
                                        </p>

                                        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-white/25">
                                            Search for
                                            another AnimAid
                                            player above to
                                            send your first
                                            friend request.
                                        </p>

                                    </div>

                                </div>
                            )}


                        {!friendsLoading &&
                            friends.length >
                            0 && (
                                <div className="grid gap-3 sm:grid-cols-2">

                                    {friends.map(
                                        (
                                            friend
                                        ) => (
                                            <Link
                                                href={`/profile/${friend.uid}`}
                                                key={
                                                    friend.uid
                                                }
                                                className="
                                                    group
                                                    rounded-2xl
                                                    border border-white/10
                                                    bg-white/[0.025]
                                                    p-4
                                                    transition
                                                    hover:-translate-y-0.5
                                                    hover:border-purple-400/30
                                                    hover:bg-purple-500/[0.06]
                                                    hover:shadow-[0_0_20px_rgba(168,85,247,0.08)]
                                                "
                                            >

                                                <PlayerIdentity
                                                    user={
                                                        friend
                                                    }
                                                />

                                            </Link>
                                        )
                                    )}

                                </div>
                            )}

                    </div>

                </section>

            </div>
        </main>
    );
}


function PlayerIdentity({
                            user,
                        }: {
    user: UserProfile;
}) {
    const displayName =
        user.displayName ||
        user.username ||
        "Unnamed Player";

    return (
        <div className="flex min-w-0 items-center gap-4">

            <div
                className="
                    relative
                    h-12
                    w-12
                    shrink-0
                    overflow-hidden
                    rounded-2xl
                    border border-pink-400/20
                    bg-gradient-to-br
                    from-pink-500/10
                    to-purple-500/10
                    shadow-[0_0_18px_rgba(236,72,153,0.08)]
                "
            >

                {user.photoURL ? (
                    <Image
                        src={
                            user.photoURL
                        }
                        alt={
                            displayName
                        }
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-black text-pink-300">
                        {displayName[0]?.toUpperCase() ??
                            "?"}
                    </div>
                )}

            </div>


            <div className="min-w-0">

                <p className="truncate font-black text-white transition group-hover:text-pink-100">
                    {displayName}
                </p>

                <p className="mt-0.5 truncate text-xs font-semibold text-white/30">
                    @
                    {user.username ||
                        "unknown"}
                </p>

            </div>

        </div>
    );
}