"use client";

import {useEffect, useState} from "react";
import SearchBar from "@/app/components/Searchbar";
import { auth, db, observeAuth } from "@/lib/firebase";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit, getDoc, doc, onSnapshot
} from "firebase/firestore";
import AddFriendButton from "@/app/components/AddFriendButton";
import FriendRequestsPanel from "@/app/components/FriendRequestsPanel";
import Link from "next/link";
import Image from "next/image"

type UserProfile = {
    uid: string;
    username?: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
};

export default function FriendsPage() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRequests, setShowRequests] = useState(false);
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(true);
    const [requestCount, setRequestCount] = useState(0);

    useEffect(() => {
        let unsubscribeFriends: (() => void) | null = null;

        const unsubscribeAuth = observeAuth((user) => {
            if (unsubscribeFriends) {
                unsubscribeFriends();
                unsubscribeFriends = null;
            }

            if (!user) {
                setFriends([]);
                setFriendsLoading(false);
                return;
            }

            setFriendsLoading(true);

            const friendsRef = collection(db, "users", user.uid, "friends");

            unsubscribeFriends = onSnapshot(
                friendsRef,
                async (snapshot) => {
                    const data = await Promise.all(
                        snapshot.docs.map(async (friendDoc) => {
                            try {
                                const profileSnap = await getDoc(
                                    doc(db, "users", friendDoc.id)
                                );

                                if (profileSnap.exists()) {
                                    return {
                                        uid: friendDoc.id,
                                        ...profileSnap.data(),
                                    } as UserProfile;
                                }
                            } catch {}

                            return {
                                uid: friendDoc.id,
                                ...friendDoc.data(),
                            } as UserProfile;
                        })
                    );

                    setFriends(data);
                    setFriendsLoading(false);
                },
                (error) => {
                    console.error("Failed to listen for friends:", error);
                    setFriends([]);
                    setFriendsLoading(false);
                }
            );
        });

        return () => {
            unsubscribeAuth();

            if (unsubscribeFriends) {
                unsubscribeFriends();
            }
        };
    }, []);

    useEffect(() => {
        let unsubscribeRequests: (() => void) | null = null;

        const unsubscribeAuth = observeAuth((user) => {
            if (unsubscribeRequests) {
                unsubscribeRequests();
                unsubscribeRequests = null;
            }

            if (!user) {
                setRequestCount(0);
                return;
            }

            const requestsRef = collection(
                db,
                "users",
                user.uid,
                "friendRequests"
            );

            const requestsQuery = query(
                requestsRef,
                where("status", "==", "pending")
            );

            unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
                setRequestCount(snapshot.size);
            });
        });

        return () => {
            unsubscribeAuth();

            if (unsubscribeRequests) {
                unsubscribeRequests();
            }
        };
    }, []);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();

        const term = search.trim().toLowerCase();
        if (!term) return;

        try {
            setLoading(true);
            setError(null);

            const usersRef = collection(db, "users");

            const q = query(
                usersRef,
                orderBy("username"),
                where("username", ">=", term),
                where("username", "<=", term + "\uf8ff"),
                limit(10)
            );

            const snapshot = await getDocs(q);

            const currentUserId = auth.currentUser?.uid;

            const results = snapshot.docs
                .map((userDoc) => ({
                    uid: userDoc.id,
                    ...userDoc.data(),
                } as UserProfile))
                .filter((user) => user.uid !== currentUserId);

            setUsers(results);
        } catch (err: any) {
            setError(err?.message ?? "Failed to search users");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-purple-950">
                    Find Friends
                </h1>

                <button
                    type="button"
                    onClick={() => setShowRequests(!showRequests)}
                    className="relative rounded-xl bg-purple-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 cursor-pointer"
                >
                    {showRequests ? "Hide Requests" : "View Requests"}

                    {requestCount > 0 && (
                        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white shadow-sm">
                            {requestCount > 99 ? "99+" : requestCount}
                        </span>
                    )}
                </button>
            </div>

            {showRequests && (
                <div className="mt-4">
                    <FriendRequestsPanel />
                </div>
            )}

            <p className="mt-2 text-purple-900/70">
                Search for other Animaid users by username
            </p>

            <div className="mt-6">
                <SearchBar
                    query={search}
                    setQuery={setSearch}
                    onSubmit={handleSearch}
                    placeholder="Search by username"
                    ariaLabel="Search users by username"
                    buttonText="Find"
                />
            </div>

            {loading && (
                <p className="mt-6 text-purple-900/70">
                    Searching...
                </p>
            )}

            {error && (
                <p className="mt-6 text-red-500">
                    {error}
                </p>
            )}

            {!loading && !error && users.length === 0 && search && (
                <p className="mt-6 text-purple-900/70">
                    No users found.
                </p>
            )}

            <div className="mt-6 flex flex-col gap-4">
                {users.map((user) => (
                    <Link
                        key={user.uid}
                        href={`/profile/${user.uid}`}
                        className="flex items-center justify-between rounded-2xl border border-purple-200 bg-white p-4 shadow-sm transition hover:bg-purple-50 hover:shadow-md relative z-10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-purple-100">
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.username ?? "Profile picture"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center font-bold text-purple-300">
                                        {user.username?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 className="font-semibold text-purple-950">
                                    {user.displayName || user.username || "Unnamed user"}
                                </h2>

                                <p className="text-sm text-purple-900/60">
                                    @{user.username}
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <AddFriendButton targetUser={user} />
                        </div>
                    </Link>
                ))}
            </div>

            <section className="mt-6 rounded-2xl border border-purple-200 bg-white p-4 shadow-sm z-10 relative">
                <h2 className="text-xl font-semibold text-purple-950">
                    Your Friends
                </h2>

                {friendsLoading && (
                    <p className="mt-3 text-purple-900/70">
                        Loading friends...
                    </p>
                )}

                {!friendsLoading && friends.length === 0 && (
                    <p className="mt-3 text-purple-900/70">
                        You have no friends yet.
                    </p>
                )}

                <div className="mt-4 flex flex-col gap-3">
                    {friends.map((friend) => (
                        <Link
                            href={`/profile/${friend.uid}`}
                            key={friend.uid}
                            className="rounded-xl border border-purple-100 bg-white p-3 transition hover:bg-purple-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-purple-100">
                                    {friend.photoURL ? (
                                        <Image
                                            src={friend.photoURL}
                                            alt={friend.username ?? "Profile picture"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center font-bold text-purple-300">
                                            {friend.username?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="font-medium text-purple-950">
                                        @{friend.username || "unknown user"}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}