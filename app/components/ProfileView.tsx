"use client";

import {
    useEffect,
    useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
    useRouter,
} from "next/navigation";

import {
    doc,
    getDoc,
} from "firebase/firestore";

import {
    db,
    getDraftHighScore,
    observeAuth,
    type DraftHighScore,
} from "@/lib/firebase";

import AddFriendButton from "@/app/components/AddFriendButton";


type UserProfile = {
    uid: string;
    username?: string;
    displayName?: string;
    photoURL?: string;
    dailyStreak?: number;
};


type Props = {
    profileUid: string;
};


const positionIcons:
    Record<string, string> = {
    Captain: "👑",
    "Vice Captain": "⚔️",
    Support: "💚",
    Scout: "👁️",
    Strategist: "🧠",
    Assassin: "🗡️",
    Ace: "🔥",
    Vanguard: "🛡️",
};


export default function ProfileView({
                                        profileUid,
                                    }: Props) {
    const router =
        useRouter();

    const [
        profile,
        setProfile,
    ] = useState<UserProfile | null>(
        null
    );

    const [
        draftHighScore,
        setDraftHighScore,
    ] = useState<DraftHighScore | null>(
        null
    );

    const [
        isOwnProfile,
        setIsOwnProfile,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    // =========================================================
    // LOAD PROFILE
    // =========================================================

    useEffect(() => {
        let cancelled =
            false;

        const unsubscribe =
            observeAuth(
                async (
                    currentUser
                ) => {
                    if (!currentUser) {
                        router.push(
                            "/login"
                        );

                        return;
                    }


                    const resolvedUid =
                        profileUid ===
                        "me"
                            ? currentUser.uid
                            : profileUid;


                    if (!resolvedUid) {
                        if (!cancelled) {
                            setError(
                                "Missing user id"
                            );

                            setLoading(
                                false
                            );
                        }

                        return;
                    }


                    try {
                        if (!cancelled) {
                            setLoading(
                                true
                            );

                            setError(
                                null
                            );
                        }


                        const profileRef =
                            doc(
                                db,
                                "users",
                                resolvedUid
                            );


                        const profileSnap =
                            await getDoc(
                                profileRef
                            );


                        if (
                            !profileSnap.exists()
                        ) {
                            if (
                                !cancelled
                            ) {
                                setError(
                                    "User not found"
                                );
                            }

                            return;
                        }


                        const profileData = {
                            uid:
                            profileSnap.id,

                            ...profileSnap.data(),
                        } as UserProfile;


                        const highScore =
                            await getDraftHighScore(
                                resolvedUid
                            );


                        if (cancelled) {
                            return;
                        }


                        setProfile(
                            profileData
                        );

                        setDraftHighScore(
                            highScore
                        );

                        setIsOwnProfile(
                            currentUser.uid ===
                            resolvedUid
                        );
                    } catch (
                        error
                        ) {
                        console.error(
                            "Failed to load profile:",
                            error
                        );

                        if (
                            !cancelled
                        ) {
                            setError(
                                error instanceof
                                Error
                                    ? error.message
                                    : "Failed to load profile"
                            );
                        }
                    } finally {
                        if (
                            !cancelled
                        ) {
                            setLoading(
                                false
                            );
                        }
                    }
                }
            );


        return () => {
            cancelled =
                true;

            unsubscribe();
        };
    }, [
        profileUid,
        router,
    ]);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <main className="relative min-h-[calc(100vh-130px)] overflow-hidden px-4 py-10">

                <BackgroundGlow />

                <div className="relative z-10 mx-auto max-w-7xl">

                    <div
                        className="
                            rounded-[2rem]
                            border border-pink-500/20
                            bg-black/40
                            p-7
                            shadow-[0_0_35px_rgba(236,72,153,0.08)]
                            backdrop-blur-xl
                        "
                    >
                        <div className="flex items-center gap-6">

                            <div className="h-28 w-28 animate-pulse rounded-3xl bg-pink-500/10" />

                            <div className="flex-1">

                                <div className="h-3 w-24 animate-pulse rounded-full bg-pink-500/10" />

                                <div className="mt-4 h-8 w-52 animate-pulse rounded-full bg-white/5" />

                                <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-white/5" />

                            </div>

                        </div>
                    </div>

                </div>
            </main>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (
        error ||
        !profile
    ) {
        return (
            <main className="relative flex min-h-[calc(100vh-130px)] items-center justify-center overflow-hidden px-4">

                <BackgroundGlow />

                <div
                    className="
                        relative z-10
                        w-full max-w-md
                        rounded-3xl
                        border border-red-400/20
                        bg-black/50
                        p-8
                        text-center
                        shadow-[0_0_30px_rgba(248,113,113,0.08)]
                        backdrop-blur-xl
                    "
                >
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300/50">
                        Profile
                    </p>

                    <h1 className="mt-3 text-2xl font-black text-white">
                        {error ??
                            "User not found"}
                    </h1>

                    <Link
                        href="/"
                        className="
                            mt-6
                            inline-flex
                            rounded-xl
                            border border-white/10
                            bg-white/5
                            px-5 py-2.5
                            text-sm
                            font-black
                            text-white/70
                            transition
                            hover:border-pink-400/30
                            hover:bg-pink-500/10
                            hover:text-pink-100
                        "
                    >
                        Back Home
                    </Link>
                </div>

            </main>
        );
    }


    const displayName =
        profile.displayName ||
        profile.username ||
        "AnimAid Player";


    return (
        <main className="relative min-h-[calc(100vh-130px)] overflow-hidden px-4 py-10 text-white">

            <BackgroundGlow />


            <div className="relative z-10 mx-auto max-w-7xl">

                {/* ================================================= */}
                {/* PROFILE HERO */}
                {/* ================================================= */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[2rem]
                        border border-pink-500/20
                        bg-gradient-to-br
                        from-pink-500/[0.08]
                        via-black/55
                        to-purple-500/[0.08]
                        p-7
                        shadow-[0_0_40px_rgba(236,72,153,0.1)]
                        backdrop-blur-xl
                        sm:p-8
                    "
                >

                    <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-pink-500/15 blur-[100px]" />

                    <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-purple-500/15 blur-[100px]" />


                    <div
                        className="
                            relative z-10
                            flex
                            flex-col
                            gap-7
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        {/* PLAYER */}

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                            <div
                                className="
                                    relative
                                    h-28
                                    w-28
                                    shrink-0
                                    overflow-hidden
                                    rounded-[1.75rem]
                                    border border-pink-400/30
                                    bg-black/50
                                    shadow-[0_0_28px_rgba(236,72,153,0.18)]
                                "
                            >

                                {profile.photoURL ? (
                                    <Image
                                        src={
                                            profile.photoURL
                                        }
                                        alt={
                                            displayName
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
                                            bg-gradient-to-br
                                            from-pink-500/10
                                            to-purple-500/10
                                            text-4xl
                                            font-black
                                            text-pink-300
                                        "
                                    >
                                        {displayName[0]?.toUpperCase() ??
                                            "?"}
                                    </div>
                                )}

                            </div>


                            <div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-pink-300/50">
                                        {isOwnProfile
                                            ? "Your Player Card"
                                            : "AnimAid Player"}
                                    </p>


                                    {isOwnProfile && (
                                        <span
                                            className="
                                                rounded-full
                                                border border-purple-400/20
                                                bg-purple-500/10
                                                px-2.5
                                                py-1
                                                text-[8px]
                                                font-black
                                                uppercase
                                                tracking-widest
                                                text-purple-200/70
                                            "
                                        >
                                            You
                                        </span>
                                    )}

                                </div>


                                <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                                    {displayName}
                                </h1>


                                <p className="mt-1 text-sm font-bold text-white/35">
                                    @
                                    {profile.username ||
                                        "unknown"}
                                </p>


                                <p className="mt-4 max-w-lg text-sm leading-6 text-purple-100/45">
                                    Draft player building
                                    lineups, chasing stronger
                                    teams, and battling across
                                    AnimAid.
                                </p>

                            </div>

                        </div>


                        {/* PROFILE ACTION */}

                        <div className="shrink-0">

                            {isOwnProfile ? (
                                <div className="flex flex-wrap gap-2">

                                    <Link
                                        href="/games/draft"
                                        className="
                                            rounded-xl
                                            border border-pink-400/25
                                            bg-pink-500/10
                                            px-4 py-2.5
                                            text-xs
                                            font-black
                                            text-pink-100
                                            transition
                                            hover:-translate-y-0.5
                                            hover:border-pink-400/50
                                            hover:bg-pink-500/15
                                        "
                                    >
                                        Solo Draft
                                    </Link>


                                    <Link
                                        href="/games/draft/multiplayer"
                                        className="
                                            rounded-xl
                                            bg-gradient-to-r
                                            from-pink-600
                                            to-purple-600
                                            px-4 py-2.5
                                            text-xs
                                            font-black
                                            text-white
                                            shadow-[0_0_18px_rgba(236,72,153,0.2)]
                                            transition
                                            hover:-translate-y-0.5
                                            hover:shadow-[0_0_25px_rgba(236,72,153,0.35)]
                                        "
                                    >
                                        Multiplayer
                                    </Link>

                                </div>
                            ) : (
                                <AddFriendButton
                                    targetUser={{
                                        uid:
                                        profile.uid,

                                        username:
                                        profile.username,

                                        photoURL:
                                        profile.photoURL,
                                    }}
                                />
                            )}

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* DRAFT RESUME */}
                {/* ================================================= */}

                <section className="mt-8">

                    <div className="mb-5">

                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-purple-300/45">
                            Player Stats
                        </p>

                        <h2 className="mt-2 text-2xl font-black text-white">
                            Draft Resume
                        </h2>

                    </div>


                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <ProfileStat
                            label="Best Draft"
                            value={
                                draftHighScore
                                    ?.totalPower ??
                                "—"
                            }
                            detail="Total Power"
                            accent="pink"
                        />

                        <ProfileStat
                            label="Average Power"
                            value={
                                draftHighScore
                                    ?.averagePower ??
                                "—"
                            }
                            detail="Best Lineup"
                            accent="purple"
                        />

                        <ProfileStat
                            label="Draft Grade"
                            value={
                                draftHighScore
                                    ?.grade ??
                                "—"
                            }
                            detail={
                                draftHighScore
                                    ? "Personal Best"
                                    : "No Draft Yet"
                            }
                            accent="yellow"
                        />

                        <ProfileStat
                            label="Daily Quest"
                            value={`🔥 ${
                                profile.dailyStreak ??
                                0
                            }`}
                            detail="Current Streak"
                            accent="orange"
                        />

                    </div>

                </section>


                {/* ================================================= */}
                {/* BEST DRAFT */}
                {/* ================================================= */}

                <section className="mt-10">

                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-[2rem]
                            border border-yellow-400/20
                            bg-gradient-to-br
                            from-yellow-500/[0.05]
                            via-black/50
                            to-purple-500/[0.06]
                            p-5
                            shadow-[0_0_35px_rgba(250,204,21,0.07)]
                            backdrop-blur-xl
                            sm:p-7
                        "
                    >

                        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-yellow-400/[0.08] blur-[100px]" />


                        <div className="relative z-10">

                            {/* HEADER */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                    sm:flex-row
                                    sm:items-end
                                    sm:justify-between
                                "
                            >

                                <div>

                                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-yellow-200/45">
                                        Personal Record
                                    </p>

                                    <h2 className="mt-2 text-3xl font-black text-white">
                                        Best Draft Lineup
                                    </h2>


                                    {draftHighScore && (
                                        <p className="mt-2 text-sm text-white/35">

                                            <span className="font-black text-yellow-200">
                                                {
                                                    draftHighScore.grade
                                                }
                                            </span>

                                            {" Draft · "}

                                            {
                                                draftHighScore.totalPower
                                            }

                                            {" Power · "}

                                            Avg{" "}

                                            {
                                                draftHighScore.averagePower
                                            }

                                        </p>
                                    )}

                                </div>


                                {isOwnProfile && (
                                    <Link
                                        href="/games/draft"
                                        className="
                                            inline-flex
                                            shrink-0
                                            items-center
                                            gap-2
                                            text-xs
                                            font-black
                                            text-yellow-200/60
                                            transition
                                            hover:text-yellow-100
                                        "
                                    >
                                        Beat This Draft
                                        <span>
                                            →
                                        </span>
                                    </Link>
                                )}

                            </div>


                            {/* ========================================= */}
                            {/* LINEUP */}
                            {/* ========================================= */}

                            {draftHighScore ? (

                                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                    {draftHighScore.lineup.map(
                                        (
                                            pick
                                        ) => (
                                            <DraftCard
                                                key={
                                                    pick.position
                                                }
                                                pick={
                                                    pick
                                                }
                                            />
                                        )
                                    )}

                                </div>

                            ) : (

                                <div
                                    className="
                                        mt-7
                                        flex
                                        min-h-[260px]
                                        items-center
                                        justify-center
                                        rounded-3xl
                                        border border-dashed border-white/10
                                        bg-black/25
                                        text-center
                                    "
                                >

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
                                                border border-yellow-400/15
                                                bg-yellow-500/[0.05]
                                                text-2xl
                                            "
                                        >
                                            👑
                                        </div>


                                        <p className="mt-4 font-black text-white/55">
                                            No saved draft yet
                                        </p>


                                        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-white/25">
                                            {isOwnProfile
                                                ? "Complete a Solo Draft to put your best lineup on your player card."
                                                : "This player hasn't recorded a Solo Draft yet."}
                                        </p>


                                        {isOwnProfile && (
                                            <Link
                                                href="/games/draft"
                                                className="
                                                    mt-5
                                                    inline-flex
                                                    rounded-xl
                                                    border border-yellow-400/20
                                                    bg-yellow-500/[0.07]
                                                    px-4 py-2.5
                                                    text-xs
                                                    font-black
                                                    text-yellow-100
                                                    transition
                                                    hover:border-yellow-400/40
                                                    hover:bg-yellow-500/[0.12]
                                                "
                                            >
                                                Start Draft
                                            </Link>
                                        )}

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* BOTTOM PLAY CTA */}
                {/* ================================================= */}

                {isOwnProfile && (
                    <section
                        className="
                            mt-8
                            flex
                            flex-col
                            gap-5
                            rounded-3xl
                            border border-purple-400/15
                            bg-purple-500/[0.04]
                            p-6
                            backdrop-blur-xl
                            md:flex-row
                            md:items-center
                            md:justify-between
                        "
                    >

                        <div>

                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-300/40">
                                Ready For Another?
                            </p>

                            <h2 className="mt-2 text-xl font-black text-white">
                                Build your next lineup.
                            </h2>

                        </div>


                        <div className="flex flex-wrap gap-2">

                            <Link
                                href="/games/draft"
                                className="
                                    rounded-xl
                                    border border-white/10
                                    bg-white/[0.04]
                                    px-5 py-3
                                    text-xs
                                    font-black
                                    text-white/65
                                    transition
                                    hover:border-pink-400/30
                                    hover:text-pink-100
                                "
                            >
                                Solo Draft
                            </Link>


                            <Link
                                href="/games/draft/multiplayer"
                                className="
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-pink-600
                                    to-purple-600
                                    px-5 py-3
                                    text-xs
                                    font-black
                                    text-white
                                    shadow-[0_0_18px_rgba(236,72,153,0.18)]
                                    transition
                                    hover:-translate-y-0.5
                                "
                            >
                                Find Opponent
                            </Link>

                        </div>

                    </section>
                )}

            </div>
        </main>
    );
}


// =============================================================
// BACKGROUND
// =============================================================

function BackgroundGlow() {
    return (
        <div className="pointer-events-none fixed inset-0">

            <div className="absolute -left-28 top-24 h-[500px] w-[500px] rounded-full bg-pink-500/[0.08] blur-[150px]" />

            <div className="absolute -right-28 top-32 h-[500px] w-[500px] rounded-full bg-purple-500/[0.08] blur-[150px]" />

            <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/[0.04] blur-[130px]" />

        </div>
    );
}


// =============================================================
// STAT
// =============================================================

function ProfileStat({
                         label,
                         value,
                         detail,
                         accent,
                     }: {
    label: string;
    value:
        string |
        number;
    detail: string;
    accent:
        | "pink"
        | "purple"
        | "yellow"
        | "orange";
}) {
    const styles = {
        pink: {
            border:
                "border-pink-400/20",

            background:
                "bg-pink-500/[0.06]",

            label:
                "text-pink-300/45",

            value:
                "text-pink-200",
        },

        purple: {
            border:
                "border-purple-400/20",

            background:
                "bg-purple-500/[0.06]",

            label:
                "text-purple-300/45",

            value:
                "text-purple-200",
        },

        yellow: {
            border:
                "border-yellow-400/20",

            background:
                "bg-yellow-500/[0.06]",

            label:
                "text-yellow-200/45",

            value:
                "text-yellow-200",
        },

        orange: {
            border:
                "border-orange-400/20",

            background:
                "bg-orange-500/[0.06]",

            label:
                "text-orange-200/45",

            value:
                "text-orange-200",
        },
    }[accent];


    return (
        <div
            className={`
                rounded-2xl
                border
                p-5
                backdrop-blur-xl
                ${styles.border}
                ${styles.background}
            `}
        >

            <p
                className={`
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.25em]
                    ${styles.label}
                `}
            >
                {label}
            </p>


            <p
                className={`
                    mt-3
                    text-3xl
                    font-black
                    ${styles.value}
                `}
            >
                {value}
            </p>


            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/20">
                {detail}
            </p>

        </div>
    );
}


// =============================================================
// DRAFT CARD
// =============================================================

function DraftCard({
                       pick,
                   }: {
    pick:
        DraftHighScore["lineup"][number];
}) {
    return (
        <div
            className="
                group
                relative
                min-h-[360px]
                overflow-hidden
                rounded-3xl
                border
                border-yellow-400/20
                bg-black
                shadow-[0_0_20px_rgba(250,204,21,0.08)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-yellow-300/45
                hover:shadow-[0_0_28px_rgba(250,204,21,0.16)]
            "
        >

            {/* IMAGE */}

            {pick.character.imageUrl ? (
                <img
                    src={
                        pick.character.imageUrl
                    }
                    alt={
                        pick.character.name
                    }
                    draggable={
                        false
                    }
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-cover
                        object-[50%_20%]
                        transition-transform
                        duration-500
                        group-hover:scale-[1.03]
                    "
                />
            ) : (
                <div
                    className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-purple-950
                        via-black
                        to-pink-950
                    "
                >
                    <span className="text-5xl opacity-25">
                        ?
                    </span>
                </div>
            )}


            {/* OVERLAY */}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/5" />


            {/* POSITION */}

            <div
                className="
                    absolute
                    left-4
                    top-4
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border border-white/15
                    bg-black/55
                    px-3 py-1.5
                    backdrop-blur-xl
                "
            >
                <span className="text-xs">
                    {positionIcons[
                        pick.position
                        ] ?? "✦"}
                </span>

                <span className="text-[9px] font-black uppercase tracking-widest text-white/65">
                    {pick.position}
                </span>
            </div>


            {/* INFO */}

            <div className="absolute inset-x-0 bottom-0 p-5">

                <h3 className="line-clamp-1 text-xl font-black text-white drop-shadow-lg">
                    {
                        pick.character
                            .name
                    }
                </h3>

                <p className="mt-1 line-clamp-1 text-xs font-semibold text-white/45">
                    {
                        pick.character
                            .anime
                    }
                </p>


                <div className="mt-4 flex items-end justify-between">

                    <div>

                        <p className="text-[8px] font-black uppercase tracking-[0.25em] text-yellow-200/35">
                            Grade
                        </p>

                        <p className="mt-1 text-4xl font-black italic text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.55)]">
                            {
                                pick.grade
                            }
                        </p>

                    </div>


                    <div className="text-right">

                        <span
                            className="
                                inline-flex
                                rounded-full
                                border border-white/15
                                bg-black/50
                                px-3 py-1.5
                                text-sm
                                font-black
                                text-white
                                backdrop-blur-md
                            "
                        >
                            {
                                pick.power
                            }
                        </span>

                        <p className="mt-1 text-[8px] font-black uppercase tracking-widest text-white/25">
                            Power
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}