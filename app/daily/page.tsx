"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loading from "@/app/components/Loading";
import AnimeGuessAutocomplete from "@/app/components/AnimeGuessAutocomplete";
import {
    claimDailyPack,
    getDailyProgress,
    observeAuth,
    saveDailyProgress,
    updateDailyStreak
} from "@/lib/firebase";
import type {User} from "firebase/auth";

type GuessAnime = {
    mal_id: number;
    title: string;
    title_english?: string | null;
    source?: string | null;
    year?: number | null;
    score?: number | null;
    studio?: string | null;
    genres: string[];
};

type AnimeOption = {
    mal_id: number;
    title: string;
    title_english?: string | null;
    year?: number | null;
    type?: string | null;
};

export default function DailyPage() {
    const [selectedAnime, setSelectedAnime] = useState<AnimeOption | null>(null);
    const [attempts, setAttempts] = useState<GuessAnime[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [won, setWon] = useState(false);
    const [dailyAnime, setDailyAnime] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showRules, setShowRules] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [rewardClaimed, setRewardClaimed] = useState(false);
    const [guessError, setGuessError] = useState<string | null>(null);
    const [showHint, setShowHint] = useState(false);
    const today = new Date().toISOString().slice(0, 10);

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = observeAuth((firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (authLoading) return;

        async function loadDailyAnime() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const res = await fetch("/api/jikan/daily");
                const json = await res.json();

                setDailyAnime(json.data);

                const progress = await getDailyProgress(user.uid, today);

                if (progress && progress.animeId === json.data.mal_id) {
                    setAttempts(progress.attempts ?? []);
                    setWon(progress.won ?? false);
                    setRewardClaimed(progress.rewardClaimed ?? false);
                }
            } catch (error) {
                console.error("Daily challenge load error:", error);
                setGuessError("Failed to load daily challenge.");
            } finally {
                setLoading(false);
            }
        }

        loadDailyAnime();
    }, [authLoading, user, today]);

    async function handleClaimPack() {
        if (!user) {
            setGuessError("You must be signed in to claim a pack.");
            return;
        }

        try {
            await claimDailyPack(user.uid, today);

            setRewardClaimed(true);
        } catch (error: any) {
            setGuessError(error?.message ?? "Failed to claim pack.");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (
            !selectedAnime ||
            won ||
            attempts.length >= 6 ||
            !dailyAnime
        ) {
            return;
        }

        const alreadyGuessed = attempts.some(
            (attempt) => attempt.mal_id === selectedAnime.mal_id
        );

        if (alreadyGuessed) {
            setGuessError("You already guessed that anime.");
            return;
        }

        try {
            const res = await fetch(
                `/api/jikan/guess?id=${selectedAnime.mal_id}`
            );

            const json = await res.json();

            if (!res.ok) {
                setGuessError(json?.error ?? "Anime not found.");
                return;
            }

            const guessedAnime = json.data;

            const newAttempts = [...attempts, guessedAnime];
            const didWin = guessedAnime.mal_id === dailyAnime.mal_id;

            setAttempts(newAttempts);

            if (didWin) {
                setWon(true);
            }

            const alreadyGuessed = attempts.some(
                attempt => attempt.mal_id === guessedAnime.mal_id
            );

            if (alreadyGuessed) {
                setGuessError("You've already guessed that anime.");
                return;
            }

            if (!user) {
                setGuessError("You must be signed in to save progress.");
                return;
            }

            await saveDailyProgress(
                user.uid,
                today,
                dailyAnime.mal_id,
                newAttempts,
                didWin || won
            );

            if (didWin) {
                await updateDailyStreak(user.uid, today);
            }

            setSelectedAnime(null);
        } catch {
            setGuessError("Failed to submit guess.");
        }
    }

    const lost = attempts.length >= 6 && !won;

    const answerTitle =
        dailyAnime?.title_english || dailyAnime?.title;

    const answerImage =
        dailyAnime?.images?.jpg?.image_url ||
        dailyAnime?.images?.webp?.image_url;

    type CellStatus = "correct" | "close" | "wrong";

    function cellClass(status: CellStatus) {
        if (status === "correct") {
            return "border-green-400/20 bg-green-500/10 text-green-200";
        }

        if (status === "close") {
            return "border-yellow-400/20 bg-yellow-500/10 text-yellow-200";
        }

        return "border-pink-500/10 bg-white/[0.03] text-purple-100/60";
    }

    function compareExact(guess?: string | null, answer?: string | null): CellStatus {
        if (!guess || !answer) return "wrong";
        return guess.toLowerCase() === answer.toLowerCase() ? "correct" : "wrong";
    }

    function compareYear(guess?: number | null, answer?: number | null): CellStatus {
        if (!guess || !answer) return "wrong";
        if (guess === answer) return "correct";
        if (Math.abs(guess - answer) <= 3) return "close";
        return "wrong";
    }

    function compareScore(guess?: number | null, answer?: number | null): CellStatus {
        if (!guess || !answer) return "wrong";
        if (Math.abs(guess - answer) < 0.1) return "correct";
        if (Math.abs(guess - answer) <= 0.5) return "close";
        return "wrong";
    }

    function compareGenres(guessGenres: string[] = [], answerGenres: string[] = []): CellStatus {
        if (guessGenres.length === 0 || answerGenres.length === 0) return "wrong";

        const exact =
            guessGenres.length === answerGenres.length &&
            guessGenres.every((genre) => answerGenres.includes(genre));

        if (exact) return "correct";

        const overlap = guessGenres.some((genre) => answerGenres.includes(genre));

        return overlap ? "close" : "wrong";
    }

    function genresAreExact(
        guessGenres: string[] = [],
        answerGenres: string[] = []
    ) {
        if (guessGenres.length === 0 || answerGenres.length === 0) return false;

        const normalizedAnswer = answerGenres.map((genre) => genre.toLowerCase());

        return (
            guessGenres.length === answerGenres.length &&
            guessGenres.every((genre) =>
                normalizedAnswer.includes(genre.toLowerCase())
            )
        );
    }

    function genrePillClass(
        genre: string,
        answerGenres: string[] = [],
        allGenresCorrect: boolean
    ) {
        if (allGenresCorrect) {
            return "border-green-400/20 bg-green-500/10 text-green-200";
        }

        const isPartialMatch = answerGenres
            .map((answerGenre) => answerGenre.toLowerCase())
            .includes(genre.toLowerCase());

        if (isPartialMatch) {
            return "border-yellow-400/20 bg-yellow-500/10 text-yellow-200";
        }

        return "border-pink-500/20 bg-white/[0.03] text-purple-100/60";
    }

    function numericArrow(
        guess?: number | null,
        answer?: number | null
    ) {
        if (
            guess == null ||
            answer == null ||
            guess === answer
        ) {
            return null;
        }

        return guess < answer ? "⬆️" : "⬇️";
    }

    function getTitleHint(title?: string) {
        if (!title) return "";

        return title
            .split("")
            .map((char) => {
                if (char === " ") return "/";

                if (/[a-zA-Z0-9]/.test(char)) {
                    return "_";
                }

                return char;
            })
            .join(" ");
    }

    if (loading || authLoading) {
        return <Loading />;
    }

    return (
        <main className="relative mx-auto flex min-h-[calc(100vh-130px)] max-w-4xl flex-col items-center justify-center px-4 py-10 text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
                <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
            </div>

            <section className="relative z-10 w-full rounded-3xl border border-pink-500/20 bg-black/40 p-6 text-center shadow-[0_0_25px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                    Daily Quest
                </p>

                <h1 className="mt-3 text-4xl font-bold text-white">
                    Anime Challenge
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-purple-100/70">
                    Guess today’s anime in 6 tries. Complete the challenge to earn a character pack.
                </p>

                <button
                    type="button"
                    onClick={() => setShowRules(!showRules)}
                    className="mt-4 rounded-xl border border-pink-500/20 bg-black/40 px-4 py-2 text-sm font-semibold text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.08)] transition hover:border-pink-400/40 hover:bg-pink-500/10 hover:cursor-pointer"
                >
                    How to play
                </button>

                <div className="mx-auto mt-8 max-w-xl">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <AnimeGuessAutocomplete
                            value={selectedAnime}
                            setValue={setSelectedAnime}
                        />

                        <button
                            type="submit"
                            disabled={!user || won || lost}
                            className="rounded-2xl border border-pink-500/20 bg-pink-500/10 px-5 py-3 font-semibold text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.08)] transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Guess
                        </button>
                    </form>

                    {guessError && (
                        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-xl">
                            <span>⚠️</span>
                            <span>{guessError}</span>

                            <button
                                type="button"
                                onClick={() => setGuessError(null)}
                                className="ml-auto text-red-300/70 transition-colors hover:text-red-200 hover:cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {attempts.length >= 3 && !won && !lost && dailyAnime && (
                        <div className="mt-4 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 backdrop-blur-xl">
                            {!showHint ? (
                                <button
                                    type="button"
                                    onClick={() => setShowHint(true)}
                                    className="rounded-xl border border-pink-500/20 bg-black/40 px-4 py-2 text-sm font-semibold text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.08)] transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:cursor-pointer"
                                >
                                    Reveal Hint
                                </button>
                            ) : (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
                                        Title Length Hint
                                    </p>

                                    <p className="mt-2 break-words font-mono text-lg font-bold tracking-widest text-white">
                                        {getTitleHint(answerTitle)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 w-full overflow-hidden rounded-2xl border border-pink-500/20 bg-black/30 shadow-[0_0_20px_rgba(236,72,153,0.08)] backdrop-blur-xl">
                        <table className="w-full table-fixed border-collapse text-center text-sm">
                            <thead className="bg-pink-500/10 text-xs font-bold uppercase tracking-widest text-pink-200">
                            <tr>
                                <th className="w-[22%] border-b border-pink-500/20 px-4 py-3">Title</th>
                                <th className="w-[14%] border-b border-pink-500/20 px-4 py-3">Source</th>
                                <th className="w-[10%] border-b border-pink-500/20 px-4 py-3">Year</th>
                                <th className="w-[10%] border-b border-pink-500/20 px-4 py-3">Score</th>
                                <th className="w-[18%] border-b border-pink-500/20 px-4 py-3">Studio</th>
                                <th className="w-[26%] border-b border-pink-500/20 px-4 py-3">Genres</th>
                            </tr>
                            </thead>

                            <tbody>
                            {Array.from({ length: 6 }).map((_, index) => {
                                const attempt = attempts[index];

                                return (
                                    <tr key={index} className="border-b border-pink-500/10 last:border-b-0">
                                        <td className={`border-r border-pink-500/10 px-4 py-4 font-medium ${
                                            attempt
                                                ? cellClass(compareExact(attempt.title, dailyAnime.title))
                                                : "text-purple-100/40"
                                        }`}>
                                            {attempt?.title ?? `Attempt ${index + 1}`}
                                        </td>

                                        <td className={`border-r border-pink-500/10 px-4 py-4 ${
                                            attempt
                                                ? cellClass(compareExact(attempt.source, dailyAnime.source))
                                                : "text-purple-100/40"
                                        }`}>
                                            {attempt?.source ?? "—"}
                                        </td>

                                        <td className={`border-r border-pink-500/10 px-4 py-4 ${
                                            attempt
                                                ? cellClass(compareYear(attempt.year, dailyAnime.year))
                                                : "text-purple-100/40"
                                        }`}>
                                            <>
                                                {attempt?.year}
                                                {" "}
                                                {attempt &&
                                                    compareYear(attempt.year, dailyAnime.year) !== "correct" &&
                                                    numericArrow(attempt.year, dailyAnime.year)}
                                            </>
                                        </td>

                                        <td className={`border-r border-pink-500/10 px-4 py-4 ${
                                            attempt
                                                ? cellClass(compareScore(attempt.score, dailyAnime.score))
                                                : "text-purple-100/40"
                                        }`}>
                                            <>
                                                {attempt?.score}
                                                {" "}
                                                {attempt &&
                                                    compareScore(attempt.score, dailyAnime.score) !== "correct" &&
                                                    numericArrow(attempt.score, dailyAnime.score)}
                                            </>
                                        </td>

                                        <td className={`border-r border-pink-500/10 px-4 py-4 ${
                                            attempt
                                                ? cellClass(compareExact(attempt.studio, dailyAnime.studio))
                                                : "text-purple-100/40"
                                        }`}>
                                            {attempt?.studio ?? "—"}
                                        </td>

                                        <td
                                            className={`px-4 py-4 ${
                                                attempt && genresAreExact(attempt.genres, dailyAnime.genres)
                                                    ? "border-green-400/20 bg-green-500/10"
                                                    : attempt
                                                        ? "bg-white/[0.03]"
                                                        : "text-purple-100/40"
                                            }`}
                                        >
                                            {attempt?.genres?.length ? (
                                                <div className="flex flex-wrap justify-center gap-1.5">
                                                    {attempt.genres.map((genre) => {
                                                        const allGenresCorrect = genresAreExact(
                                                            attempt.genres,
                                                            dailyAnime.genres
                                                        );

                                                        return (
                                                            <span
                                                                key={genre}
                                                                className={`rounded-full border px-2 py-1 text-xs font-semibold ${genrePillClass(
                                                                    genre,
                                                                    dailyAnime.genres,
                                                                    allGenresCorrect
                                                                )}`}
                                                            >
                                                                {genre}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {(won || lost) && dailyAnime && (
                        <div
                            className={`mt-6 rounded-3xl border p-5 text-left backdrop-blur-xl ${
                                won
                                    ? "border-green-400/20 bg-green-500/10"
                                    : "border-red-400/20 bg-red-500/10"
                            }`}
                        >
                            <p
                                className={`text-sm font-semibold ${
                                    won ? "text-green-200" : "text-red-300"
                                }`}
                            >
                                {won
                                    ? "You got it! You earned 1 character pack."
                                    : "Out of guesses! The correct answer was:"}
                            </p>

                            <Link
                                href={`/anime?id=${dailyAnime.mal_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex gap-4 rounded-2xl border border-pink-500/20 bg-black/40 p-4 shadow-[0_0_18px_rgba(236,72,153,0.08)] transition hover:-translate-y-1 hover:border-pink-400/40 hover:bg-pink-500/10"
                            >
                                {answerImage && (
                                    <img
                                        src={answerImage}
                                        alt={answerTitle}
                                        className="h-28 w-20 rounded-xl object-cover"
                                    />
                                )}

                                <div className="flex flex-col justify-center">
                                    <h3 className="text-lg font-bold text-white">
                                        {answerTitle}
                                    </h3>

                                    <p className="mt-1 text-sm text-purple-100/60">
                                        {dailyAnime.year ?? "Unknown year"} •{" "}
                                        {dailyAnime.studio ?? "Unknown studio"}
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-pink-200">
                                        View anime →
                                    </p>
                                </div>
                            </Link>
                        </div>
                    )}

                    {won && !rewardClaimed && (
                        <button
                            type="button"
                            onClick={handleClaimPack}
                            className="mt-4 w-full rounded-2xl border border-pink-500/20 bg-pink-500/10 px-5 py-3 font-semibold text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.08)] transition hover:border-pink-400/40 hover:bg-pink-500/20 hover:cursor-pointer"
                        >
                            Claim Character Pack
                        </button>
                    )}

                    {won && rewardClaimed && (
                        <div className="mt-4 rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-200 backdrop-blur-xl">
                            Character pack added to your collection of packs!
                        </div>
                    )}

                    <div className="mt-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-pink-300/70 transition hover:text-pink-200"
                        >
                            Back to home
                        </Link>
                    </div>
                </div>
            </section>

            {showRules && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-pink-500/20 bg-black/90 p-6 shadow-[0_0_30px_rgba(236,72,153,0.15)] backdrop-blur-xl">
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-2xl font-bold text-white">
                                How to Play
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowRules(false)}
                                className="text-pink-300/70 transition hover:text-pink-200 hover:cursor-pointer"
                                aria-label="Close rules"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-left text-sm leading-6 text-purple-100/70">
                            <p>
                                Guess today’s anime in 6 tries. Each guess fills the board with clues about how close your guess is to the answer.
                            </p>

                            <div>
                                <h3 className="font-semibold text-white">Rules</h3>
                                <ul className="mt-2 list-disc space-y-1 pl-5">
                                    <li>Each guess must be a real anime title.</li>
                                    <li>You get 6 attempts per day.</li>
                                    <li>The daily anime is the same for everyone.</li>
                                    <li>Your progress is saved for the day.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">Colors</h3>

                                <div className="mt-2 space-y-2">
                                    <p>
                                    <span className="rounded-md border border-green-400/20 bg-green-500/10 px-2 py-1 font-semibold text-green-200">
                                        Green
                                    </span>{" "}
                                        means an exact match.
                                    </p>

                                    <p>
                                    <span className="rounded-md border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 font-semibold text-yellow-200">
                                        Yellow
                                    </span>{" "}
                                        means a close match.
                                    </p>

                                    <ul className="ml-5 list-disc text-purple-100/70">
                                        <li>Year is within 3 years of the answer.</li>
                                        <li>Score is within 0.5 points of the answer.</li>
                                        <li>Genres share at least one genre with the answer.</li>
                                    </ul>

                                    <p>
                                    <span className="rounded-md border border-pink-500/20 bg-white/[0.03] px-2 py-1 font-semibold text-purple-100/70">
                                        Purple
                                    </span>{" "}
                                        means no meaningful match.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white">Arrows</h3>

                                <p className="mt-2">
                                    Numeric categories use directional hints:
                                </p>

                                <ul className="ml-5 mt-2 list-disc text-purple-100/70">
                                    <li>⬆️ means the correct value is higher.</li>
                                    <li>⬇️ means the correct value is lower.</li>
                                    <li>No arrow means you guessed the exact value.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}