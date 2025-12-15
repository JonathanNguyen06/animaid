import React from "react";
import AuthGate from "@/app/components/AuthGate";

export default function Home() {
  return (
      <AuthGate>
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col items-center justify-center px-4 py-16">
      <section className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-purple-950 sm:text-5xl">
          Find your next favorite anime or manga
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-purple-900/70 sm:text-lg">
          Search with a prompt or your interests, and we’ll recommend titles that match your vibe.
        </p>

        {/* Centralized search bar */}
        <div className="mt-8">
            <form className="group relative mx-auto flex w-full items-center rounded-2xl border border-purple-200 bg-white p-2 shadow-sm focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-200/60">
                <input
                    type="text"
                    name="q"
                    placeholder="e.g. cozy slice of life with found family, or: sports, isekai, mystery"
                    className="w-full rounded-xl px-4 py-3 text-purple-950 placeholder-purple-900/40 outline-none"
                    aria-label="Search anime or manga by prompt or interests"
                    autoComplete={"off"}
                />
                <button
                    type="submit"
                    className=" cursor-pointer ml-2 inline-flex items-center justify-center rounded-xl bg-purple-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800"
                >
                    Search
                </button>
            </form>
          {/* Optional quick interest chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              "Slice of Life",
              "Shounen",
              "Romance",
              "Sports",
              "Psychological",
              "Isekai",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-900/80 hover:border-purple-300 hover:text-purple-900 cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
      </AuthGate>
  );
}
