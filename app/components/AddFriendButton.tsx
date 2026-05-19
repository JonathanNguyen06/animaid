"use client";

import { useState } from "react";
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
};

type Props = {
    targetUser: UserProfile;
};

export default function AddFriendButton({ targetUser }: Props) {
    const router = useRouter();

    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleAddFriend() {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            router.push("/login");
            return;
        }

        if (currentUser.uid === targetUser.uid) {
            return;
        }

        try {
            setLoading(true);

            const requestRef = doc(
                db,
                "users",
                targetUser.uid,
                "friendRequests",
                currentUser.uid
            );

            await setDoc(requestRef, {
                fromUid: currentUser.uid,
                fromUsername: currentUser.displayName ?? "",
                status: "pending",
                created_at: serverTimestamp(),
            });

            setSent(true);
        } catch (err) {
            console.error("Failed to send friend request", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            disabled={loading || sent}
            onClick={handleAddFriend}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition cursor-pointer ${
                sent
                    ? "bg-green-600"
                    : "bg-purple-900 hover:bg-purple-800"
            } disabled:cursor-not-allowed disabled:opacity-70`}
        >
            {loading
                ? "Sending..."
                : sent
                    ? "Request Sent"
                    : "Add Friend"}
        </button>
    );
}