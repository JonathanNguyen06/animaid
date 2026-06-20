"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {ensureUserProfile, signInWithEmail, signInWithGoogle} from "@/lib/firebase";
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);

    function getFriendlyAuthError(error: any) {
        const code = error?.code;

        switch (code) {
            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                return "Invalid email or password. Please try again.";

            case "auth/invalid-email":
                return "Please enter a valid email address.";

            case "auth/too-many-requests":
                return "Too many failed attempts. Please wait a bit and try again.";

            case "auth/network-request-failed":
                return "Network error. Please check your connection and try again.";

            case "auth/popup-closed-by-user":
                return "Google sign-in was cancelled.";

            default:
                return "Something went wrong. Please try again.";
        }
    }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmail(email, password);
      await ensureUserProfile(cred.user);
      router.push("/");
    } catch (err: any) {
        setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithGoogle();
      await ensureUserProfile(cred.user);
      router.push("/");
    } catch (err: any) {
        setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const showPassword = () => {
      setShowing(true);
  }

    return (
        <main className="relative mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center overflow-hidden px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-80px] top-20 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute right-[-80px] top-60 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
                <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
            </div>

            <Link href="/" className="relative z-10 mb-6 transition hover:scale-105">
                <Image
                    src="/icons/animaid.png"
                    alt="AnimAid"
                    width={160}
                    height={160}
                    className="drop-shadow-[0_0_28px_rgba(236,72,153,0.35)]"
                />
            </Link>

            <section className="relative z-10 mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Welcome Back
                </p>

                <h1 className="mt-3 text-4xl font-bold text-white drop-shadow-[0_0_18px_rgba(236,72,153,0.25)]">
                    Sign in to Animaid
                </h1>

                <p className="mt-3 text-purple-100/70">
                    Continue your anime collection and games.
                </p>
            </section>

            <form
                onSubmit={onSubmit}
                className="relative z-10 w-full space-y-4 rounded-3xl border border-pink-500/20 bg-black/40 p-6 shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl"
            >
                {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 backdrop-blur-xl">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-pink-100/80 " htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="w-full rounded-2xl border mt-3 border-pink-500/20 bg-white/10 px-4 py-3 text-white outline-none backdrop-blur-xl placeholder:text-white/30 focus:border-pink-400/50 focus:shadow-[0_0_18px_rgba(236,72,153,0.14)]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-pink-100/80" htmlFor="password">
                        Password
                    </label>

                    <div className="flex w-full items-center mt-3 rounded-2xl border border-pink-500/20 bg-white/10 px-4 py-2 text-white backdrop-blur-xl focus-within:border-pink-400/50 focus-within:shadow-[0_0_18px_rgba(236,72,153,0.14)]">
                        <input
                            id="password"
                            type={showing ? "text" : "password"}
                            className="w-full bg-transparent py-1 outline-none placeholder:text-white/30"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />

                        {showing ? (
                            <EyeSlashIcon
                                height={28}
                                width={28}
                                onClick={() => setShowing(false)}
                                className="cursor-pointer text-pink-200/70 transition hover:text-pink-200"
                            />
                        ) : (
                            <EyeIcon
                                height={28}
                                width={28}
                                onClick={() => setShowing(true)}
                                className="cursor-pointer text-pink-200/70 transition hover:text-pink-200"
                            />
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full cursor-pointer rounded-2xl border border-pink-500/30 bg-pink-500/10 px-4 py-3 font-bold text-pink-100 backdrop-blur-xl transition hover:bg-pink-500/20 hover:shadow-[0_0_24px_rgba(236,72,153,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <button
                    type="button"
                    onClick={onGoogle}
                    disabled={loading}
                    className="w-full cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-bold text-white backdrop-blur-xl transition hover:bg-white/15 hover:shadow-[0_0_24px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Continue with Google
                </button>
            </form>

            <p className="relative z-10 mt-4 text-sm text-purple-100/70">
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="font-semibold text-pink-300/80 transition hover:text-pink-200 hover:underline"
                >
                    Sign up
                </Link>
            </p>
        </main>
    );
}
