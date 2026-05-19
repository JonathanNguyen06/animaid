"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

type FriendRequest = {
    fromUid: string;
    fromUsername?: string;
    status?: string;
};

export default function FriendRequestsPanel() {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRequests() {
            const user = auth.currentUser;
            if (!user) return;

            const requestsRef = collection(
                db,
                "users",
                user.uid,
                "friendRequests"
            );

            const snapshot = await getDocs(requestsRef);

            const data = snapshot.docs.map((doc) => doc.data() as FriendRequest);

            setRequests(data);
            setLoading(false);
        }

        loadRequests();
    }, []);

    async function acceptRequest(request: FriendRequest) {
        const user = auth.currentUser;
        if (!user) return;

        const myFriendRef = doc(db, "users", user.uid, "friends", request.fromUid);
        const theirFriendRef = doc(db, "users", request.fromUid, "friends", user.uid);
        const requestRef = doc(db, "users", user.uid, "friendRequests", request.fromUid);

        await setDoc(myFriendRef, {
            uid: request.fromUid,
            username: request.fromUsername ?? "",
            created_at: serverTimestamp(),
        });

        await setDoc(theirFriendRef, {
            uid: user.uid,
            username: user.displayName ?? "",
            created_at: serverTimestamp(),
        });

        await deleteDoc(requestRef);

        setRequests((prev) =>
            prev.filter((item) => item.fromUid !== request.fromUid)
        );
    }

    async function declineRequest(request: FriendRequest) {
        const user = auth.currentUser;
        if (!user) return;

        const requestRef = doc(db, "users", user.uid, "friendRequests", request.fromUid);

        await deleteDoc(requestRef);

        setRequests((prev) =>
            prev.filter((item) => item.fromUid !== request.fromUid)
        );
    }

    if (loading) {
        return <p className="mt-4 text-purple-900/70">Loading requests...</p>;
    }

    if (requests.length === 0) {
        return <p className="mt-4 text-purple-900/70">No friend requests.</p>;
    }

    return (
        <div className="mt-4 flex flex-col gap-3">
            {requests.map((request) => (
                <div
                    key={request.fromUid}
                    className="flex items-center justify-between rounded-2xl border border-purple-200 bg-white/70 p-4 shadow-sm"
                >
                    <p className="font-medium text-purple-950">
                        @{request.fromUsername || "unknown user"}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => acceptRequest(request)}
                            className="rounded-xl bg-purple-900 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 cursor-pointer"
                        >
                            Accept
                        </button>

                        <button
                            type="button"
                            onClick={() => declineRequest(request)}
                            className="rounded-xl border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-900 hover:bg-purple-50 cursor-pointer"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}