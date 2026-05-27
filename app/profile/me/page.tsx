"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, db, observeAuth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type UserProfile = {
    uid: string;
    username?: string;
    email?: string;
    photoURL?: string;
};

export default function MyProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = observeAuth(async (user) => {
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const profileRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(profileRef);

                if (!snapshot.exists()) {
                    setError("Profile not found.");
                    setLoading(false);
                    return;
                }

                setProfile(snapshot.data() as UserProfile);
            } catch (e: any) {
                setError(e?.message ?? "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-8">
                <p className="text-purple-900/70">Loading profile...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-3xl font-bold text-purple-950">
                My Profile
            </h1>

            {error && (
                <p className="mt-4 text-red-500">
                    {error}
                </p>
            )}

            {profile && (
                <section className="mt-6 rounded-3xl border border-purple-200 bg-white relative z-10 p-6 shadow-sm">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="relative h-28 w-28 overflow-hidden rounded-3xl bg-purple-100">
                            {profile.photoURL ? (
                                <Image
                                    src={profile.photoURL}
                                    alt={profile.username ?? "Profile picture"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-purple-300">
                                    {profile.username?.[0]?.toUpperCase() ?? "?"}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-purple-950">
                                @{profile.username}
                            </h2>

                            <p className="mt-1 text-purple-900/60">
                                {profile.email}
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}