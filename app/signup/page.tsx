"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/firebase";
import {EyeIcon, EyeSlashIcon} from "@heroicons/react/24/outline";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showing, setShowing] = useState<boolean>(false);
  const [showingConfirm, setShowingConfirm] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail({ username, email, password });
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const showPassword = () => {
      setShowing(true);
  }

  const showConfirm = () => {
      setShowingConfirm(true);
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4">
      <Link href="/" className="mb-6">
        <Image src="/icons/animaid_logo.png" alt="AnimAid" width={160} height={160} />
      </Link>

      <h1 className="mb-4 text-2xl font-semibold text-purple-900">Create your account</h1>
      <p className="mb-6 text-purple-900/70">Join Animaid</p>

      <form onSubmit={onSubmit} className="w-full space-y-4 rounded-xl border border-purple-200/60 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="space-y-1">
          <label className="text-sm text-purple-900/80" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="w-full rounded-md border border-purple-200 px-3 py-2 outline-none focus:border-purple-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="nickname"
          />
        </div>
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
            <div className={"flex items-center justify-center w-full rounded-md border border-purple-200 px-3 py-0.5 outline-none focus-within:border-purple-400"}>
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
        <div className="space-y-1">
          <label className="text-sm text-purple-900/80" htmlFor="confirm">Confirm Password</label>
            <div className={"flex items-center justify-center w-full rounded-md border border-purple-200 px-3 py-0.5 outline-none focus-within:border-purple-400"}>
          <input
            id="confirm"
            type={showingConfirm ? "text" : "password"}
            className="w-full focus:outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
                {showingConfirm ?
                    <EyeSlashIcon height={35} width={35} onClick={() => setShowingConfirm(false)} className="cursor-pointer"/>
                    :
                    <EyeIcon height={35} width={35} onClick={() => setShowingConfirm(true)} className="cursor-pointer" />}
            </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full cursor-pointer rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-purple-900/80">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-700 hover:underline">Log in</Link>
      </p>
    </main>
  );
}
