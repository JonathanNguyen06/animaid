"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase";
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const showPassword = () => {
      setShowing(true);
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4">
      <Link href="/" className="mb-6">
        <Image src="/icons/animaid_logo.png" alt="AnimAid" width={160} height={160} />
      </Link>

      <h1 className="mb-4 text-2xl font-semibold text-purple-900">Welcome back</h1>
      <p className="mb-6 text-purple-900/70">Sign in to continue</p>

      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl border border-purple-200/60 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="space-y-1">
          <label className="text-sm text-purple-900/80" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full rounded-md border border-purple-200 px-3 py-2 outline-none focus:border-purple-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
          <div className="space-y-1">
              <label className="text-sm text-purple-900/80" htmlFor="password">Password</label>
              <div className={"flex items-center justify-center w-full rounded-md border border-purple-200 px-3 py-1 outline-none focus-within:border-purple-400"}>
                  <input
                      id="password"
                      type={showing ? "text" : "password"}
                      className="w-full focus:outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                  />
                  {showing ?
                      <EyeSlashIcon height={35} width={35} onClick={() => setShowing(false)} className="cursor-pointer"/>
                      :
                      <EyeIcon height={35} width={35} onClick={() => setShowing(true)} className="cursor-pointer" />}

              </div>
          </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full cursor-pointer rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <button
          type="button"
          onClick={onGoogle}
          disabled={loading}
          className="w-full cursor-pointer rounded-md border border-purple-300 bg-white px-4 py-2 font-medium text-purple-800 hover:bg-purple-50 disabled:opacity-60"
        >
          Continue with Google
        </button>
      </form>

      <p className="mt-4 text-sm text-purple-900/80">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-purple-700 hover:underline">Sign up</Link>
      </p>
    </main>
  );
}
