"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    auth,
    db,
} from "@/lib/firebase";

import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";

import Image from "next/image";


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
    const [
        requests,
        setRequests,
    ] = useState<
        FriendRequest[]
    >([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        actingUid,
        setActingUid,
    ] = useState<
        string | null
    >(null);


    // =========================================================
    // LOAD REQUESTS
    // =========================================================

    useEffect(() => {
        async function loadRequests() {
            const user =
                auth.currentUser;

            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const requestsRef =
                    collection(
                        db,
                        "users",
                        user.uid,
                        "friendRequests"
                    );

                const snapshot =
                    await getDocs(
                        requestsRef
                    );

                const data =
                    snapshot.docs.map(
                        (
                            requestDoc
                        ) =>
                            requestDoc.data() as FriendRequest
                    );

                setRequests(
                    data
                );
            } catch (error) {
                console.error(
                    "Failed to load friend requests:",
                    error
                );
            } finally {
                setLoading(
                    false
                );
            }
        }

        loadRequests();
    }, []);


    // =========================================================
    // ACCEPT
    // =========================================================

    async function acceptRequest(request: FriendRequest) {
        const user = auth.currentUser;

        if (!user) return;

        try {
            const myProfileSnap = await getDoc(
                doc(db, "users", user.uid)
            );

            if (!myProfileSnap.exists()) {
                return;
            }

            const myProfile =
                myProfileSnap.data() as UserProfile;

            const myFriendRef = doc(
                db,
                "users",
                user.uid,
                "friends",
                request.fromUid
            );

            const theirFriendRef = doc(
                db,
                "users",
                request.fromUid,
                "friends",
                user.uid
            );

            const requestRef = doc(
                db,
                "users",
                user.uid,
                "friendRequests",
                request.fromUid
            );

            const batch = writeBatch(db);

            batch.set(myFriendRef, {
                uid: request.fromUid,
                username:
                    request.fromUsername ?? "",
                photoURL:
                    request.fromPhotoURL ?? "",
                created_at:
                    serverTimestamp(),
            });

            batch.set(theirFriendRef, {
                uid: user.uid,
                username:
                    myProfile.username ?? "",
                photoURL:
                    myProfile.photoURL ?? "",
                created_at:
                    serverTimestamp(),
            });

            batch.delete(requestRef);

            await batch.commit();

            setRequests((prev) =>
                prev.filter(
                    (item) =>
                        item.fromUid !==
                        request.fromUid
                )
            );
        } catch (error) {
            console.error(
                "Failed to accept friend request:",
                error
            );
        }
    }


    // =========================================================
    // DECLINE
    // =========================================================

    async function declineRequest(
        request: FriendRequest
    ) {
        const user =
            auth.currentUser;

        if (!user) {
            return;
        }

        try {
            setActingUid(
                request.fromUid
            );

            const requestRef =
                doc(
                    db,
                    "users",
                    user.uid,
                    "friendRequests",
                    request.fromUid
                );

            await deleteDoc(
                requestRef
            );

            setRequests(
                (
                    previous
                ) =>
                    previous.filter(
                        (
                            item
                        ) =>
                            item.fromUid !==
                            request.fromUid
                    )
            );
        } catch (error) {
            console.error(
                "Failed to decline friend request:",
                error
            );
        } finally {
            setActingUid(
                null
            );
        }
    }


    return (
        <div
            className="
                relative
                overflow-hidden
                rounded-[2rem]
                border border-purple-400/20
                bg-gradient-to-br
                from-purple-500/[0.08]
                via-black/70
                to-pink-500/[0.06]
                p-5
                shadow-[0_0_35px_rgba(168,85,247,0.1)]
                backdrop-blur-xl
                sm:p-6
            "
        >

            {/* GLOWS */}

            <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-purple-500/10 blur-[80px]" />

            <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-pink-500/10 blur-[80px]" />


            <div className="relative z-10">

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-2xl
                                border border-purple-400/20
                                bg-purple-500/10
                                text-xl
                                shadow-[0_0_18px_rgba(168,85,247,0.1)]
                            "
                        >
                            ✦
                        </div>


                        <div>

                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-300/40">
                                Incoming
                            </p>

                            <h2 className="mt-1 text-xl font-black text-white">
                                Friend Requests
                            </h2>

                        </div>

                    </div>


                    {!loading &&
                        requests.length >
                        0 && (
                            <div
                                className="
                                    rounded-full
                                    border border-pink-400/20
                                    bg-pink-500/10
                                    px-3 py-1
                                    text-[10px]
                                    font-black
                                    uppercase
                                    tracking-widest
                                    text-pink-200/70
                                "
                            >
                                {
                                    requests.length
                                }{" "}
                                Pending
                            </div>
                        )}

                </div>


                {/* ================================================= */}
                {/* CONTENT */}
                {/* ================================================= */}

                {loading ? (
                    <div className="flex min-h-[130px] items-center justify-center">

                        <div className="text-center">

                            <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.8)]" />

                            <p className="mt-4 text-sm font-semibold text-white/35">
                                Loading requests...
                            </p>

                        </div>

                    </div>
                ) : requests.length ===
                0 ? (
                    <div className="flex min-h-[140px] items-center justify-center text-center">

                        <div>

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border border-white/10
                                    bg-white/[0.03]
                                    text-xl
                                "
                            >
                                ✓
                            </div>

                            <p className="mt-4 font-black text-white/50">
                                You&apos;re all caught up
                            </p>

                            <p className="mt-1 text-xs text-white/25">
                                No pending friend requests.
                            </p>

                        </div>

                    </div>
                ) : (
                    <div className="mt-6 grid gap-3">

                        {requests.map(
                            (request) => {
                                const acting =
                                    actingUid ===
                                    request.fromUid;

                                const username =
                                    request.fromUsername ||
                                    "unknown";

                                return (
                                    <div
                                        key={
                                            request.fromUid
                                        }
                                        className="
                                            flex
                                            flex-col
                                            gap-4
                                            rounded-2xl
                                            border border-white/10
                                            bg-black/35
                                            p-4
                                            transition
                                            hover:border-purple-400/20
                                            hover:bg-purple-500/[0.04]
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                        "
                                    >

                                        {/* PLAYER */}

                                        <div className="flex min-w-0 items-center gap-4">

                                            <div
                                                className="
                                                    relative
                                                    h-12
                                                    w-12
                                                    shrink-0
                                                    overflow-hidden
                                                    rounded-2xl
                                                    border border-purple-400/20
                                                    bg-gradient-to-br
                                                    from-purple-500/10
                                                    to-pink-500/10
                                                "
                                            >

                                                {request.fromPhotoURL ? (
                                                    <Image
                                                        src={
                                                            request.fromPhotoURL
                                                        }
                                                        alt={
                                                            username
                                                        }
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm font-black text-purple-200">
                                                        {username[0]?.toUpperCase() ??
                                                            "?"}
                                                    </div>
                                                )}

                                            </div>


                                            <div className="min-w-0">

                                                <p className="truncate font-black text-white">
                                                    @
                                                    {
                                                        username
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs font-medium text-white/30">
                                                    Wants to join your squad
                                                </p>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="flex shrink-0 gap-2">

                                            <button
                                                type="button"
                                                disabled={
                                                    acting
                                                }
                                                onClick={() =>
                                                    acceptRequest(
                                                        request
                                                    )
                                                }
                                                className="
                                                    cursor-pointer
                                                    rounded-xl
                                                    bg-gradient-to-r
                                                    from-pink-600
                                                    to-purple-600
                                                    px-4 py-2.5
                                                    text-xs
                                                    font-black
                                                    text-white
                                                    shadow-[0_0_16px_rgba(236,72,153,0.18)]
                                                    transition
                                                    hover:-translate-y-0.5
                                                    hover:shadow-[0_0_22px_rgba(236,72,153,0.3)]
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >
                                                {acting
                                                    ? "..."
                                                    : "Accept"}
                                            </button>


                                            <button
                                                type="button"
                                                disabled={
                                                    acting
                                                }
                                                onClick={() =>
                                                    declineRequest(
                                                        request
                                                    )
                                                }
                                                className="
                                                    cursor-pointer
                                                    rounded-xl
                                                    border border-white/10
                                                    bg-white/[0.03]
                                                    px-4 py-2.5
                                                    text-xs
                                                    font-black
                                                    text-white/45
                                                    transition
                                                    hover:border-red-400/25
                                                    hover:bg-red-500/[0.07]
                                                    hover:text-red-200
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >
                                                Decline
                                            </button>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}