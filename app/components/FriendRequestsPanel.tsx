"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

type FriendRequest = {
    fromUid: string;
    fromUsername?: string;
    fromPhotoURL?: string;
    status?: string;
};

type UserProfile = {
    uid: string;
    username?: string;
    photoURL?: string;
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

        const myProfileSnap = await getDoc(doc(db, "users", user.uid));

        if (!myProfileSnap.exists()) return;

        const myProfile = myProfileSnap.data() as UserProfile;

        const myFriendRef = doc(db, "users", user.uid, "friends", request.fromUid);
        const theirFriendRef = doc(db, "users", request.fromUid, "friends", user.uid);
        const requestRef = doc(db, "users", user.uid, "friendRequests", request.fromUid);

        await setDoc(myFriendRef, {
            uid: request.fromUid,
            username: request.fromUsername ?? "",
            photoURL: request.fromPhotoURL ?? "",
            created_at: serverTimestamp(),
        });

        await setDoc(theirFriendRef, {
            uid: user.uid,
            username: myProfile.username ?? "",
            photoURL: myProfile.photoURL ?? "",
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
        return (
            <p className="mt-4 text-purple-100/60">
                Loading requests...
            </p>
        );
    }

    if (requests.length === 0) {
        return (
            <p className="mt-4 text-purple-100/60">
                No friend requests.
            </p>
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-3">
            {requests.map((request) => (
                <div
                    key={request.fromUid}
                    className="
                relative z-10
                flex items-center justify-between
                rounded-3xl
                border border-pink-500/20
                bg-black/40
                p-4
                backdrop-blur-xl
                shadow-[0_0_20px_rgba(236,72,153,0.08)]
                "
                >
                    <p className="font-medium text-white">
                        @{request.fromUsername || "unknown user"}
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => acceptRequest(request)}
                            className="
                        cursor-pointer
                        rounded-xl
                        border border-pink-400/30
                        bg-pink-500/10
                        px-4 py-2
                        text-sm font-semibold
                        text-pink-200
                        backdrop-blur-xl
                        transition
                        hover:border-pink-400/50
                        hover:bg-pink-500/20
                        hover:shadow-[0_0_18px_rgba(236,72,153,0.18)]
                        "
                        >
                            Accept
                        </button>

                        <button
                            type="button"
                            onClick={() => declineRequest(request)}
                            className="
                        cursor-pointer
                        rounded-xl
                        border border-purple-100/20
                        bg-white/[0.03]
                        px-4 py-2
                        text-sm font-semibold
                        text-purple-100/70
                        backdrop-blur-xl
                        transition
                        hover:border-purple-100/40
                        hover:bg-white/[0.07]
                        hover:text-white
                        "
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}