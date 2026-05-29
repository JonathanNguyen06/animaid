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
    limit, getDoc, doc,
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

    // Change the friends loading effect to fetch live photoURLs:
    useEffect(() => {
        const unsubscribe = observeAuth(async (user) => {
            if (!user) {
                setFriends([]);
                setFriendsLoading(false);
                return;
            }

            const friendsRef = collection(db, "users", user.uid, "friends");
            const snapshot = await getDocs(friendsRef);

            // Fetch each friend's current profile to get up-to-date photoURL
            const data = await Promise.all(
                snapshot.docs.map(async (friendDoc) => {
                    try {
                        const profileSnap = await getDoc(doc(db, "users", friendDoc.id));
                        console.log("friend profile data:", profileSnap.data());
                        if (profileSnap.exists()) {
                            return { uid: friendDoc.id, ...profileSnap.data() } as UserProfile;
                        }
                    } catch {}
                    // fallback to subcollection data
                    return { uid: friendDoc.id, ...friendDoc.data() } as UserProfile;
                })
            );

            setFriends(data);
            setFriendsLoading(false);
        });

        return () => unsubscribe();
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
                .map((doc) => doc.data() as UserProfile)
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
                    className="rounded-xl bg-purple-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 cursor-pointer"
                >
                    {showRequests ? "Hide Requests" : "View Requests"}
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
                    <div
                        key={user.uid}
                        className="flex items-center justify-between rounded-2xl border border-purple-200 bg-white/70 p-4 shadow-sm"
                    >
                        <div>
                            <h2 className="font-semibold text-purple-950">
                                {user.displayName || user.username || "Unnamed user"}
                            </h2>
                            <p className="text-sm text-purple-900/60">
                                @{user.username}
                            </p>
                        </div>

                        <AddFriendButton targetUser={user}/>
                    </div>
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