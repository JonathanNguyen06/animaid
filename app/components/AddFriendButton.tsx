"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

type UserProfile = {
    uid: string;
    username?: string;
    photoURL?: string;
};

type Props = {
    targetUser: UserProfile;
};

export default function AddFriendButton({ targetUser }: Props) {
    const router = useRouter();

    const [sent, setSent] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function checkFriendStatus() {
            const currentUser = auth.currentUser;

            if (!currentUser || currentUser.uid === targetUser.uid) {
                setCheckingStatus(false);
                return;
            }

            try {
                const friendSnap = await getDoc(
                    doc(db, "users", currentUser.uid, "friends", targetUser.uid)
                );

                if (friendSnap.exists()) {
                    setIsFriend(true);
                    setCheckingStatus(false);
                    return;
                }

                const requestSnap = await getDoc(
                    doc(
                        db,
                        "users",
                        targetUser.uid,
                        "friendRequests",
                        currentUser.uid
                    )
                );

                if (requestSnap.exists()) {
                    const request = requestSnap.data();

                    if (request.status === "pending") {
                        setSent(true);
                    }
                }
            } catch (err) {
                console.error("Failed to check friend request status", err);
            } finally {
                setCheckingStatus(false);
            }
        }

        checkFriendStatus();
    }, [targetUser.uid]);

    async function handleAddFriend() {
        const currentUser = auth.currentUser;
        setError(null);

        if (!currentUser) {
            router.push("/login");
            return;
        }

        if (currentUser.uid === targetUser.uid || sent || isFriend) return;

        try {
            setLoading(true);

            const myProfileRef = doc(db, "users", currentUser.uid);
            const myProfileSnap = await getDoc(myProfileRef);

            if (!myProfileSnap.exists()) {
                return;
            }

            const myProfile = myProfileSnap.data() as UserProfile;

            const requestRef = doc(
                db,
                "users",
                targetUser.uid,
                "friendRequests",
                currentUser.uid
            );

            await setDoc(requestRef, {
                fromUid: currentUser.uid,
                fromUsername: myProfile.username ?? "",
                fromPhotoURL: myProfile.photoURL ?? "",
                status: "pending",
                created_at: serverTimestamp(),
            });

            setSent(true);
        } catch (err: any) {
            console.error("Failed to send friend request", err);
            setError(err?.message ?? "Failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            disabled={checkingStatus || loading || sent || isFriend}
            onClick={handleAddFriend}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:cursor-pointer ${
                isFriend
                    ? "bg-green-700"
                    : sent
                        ? "bg-green-600"
                        : "bg-purple-900 hover:bg-purple-800"
            } disabled:cursor-not-allowed disabled:opacity-70`}
        >
            {error
                ? "Failed"
                : checkingStatus
                    ? "Checking..."
                    : loading
                        ? "Sending..."
                        : isFriend
                            ? "Friends"
                            : sent
                                ? "Request Sent"
                                : "Add Friend"}
        </button>
    );
}