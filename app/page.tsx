import React from "react";
import Link from "next/link";
import AuthGate from "@/app/components/AuthGate";
import DailyQuestReminderGate from "@/app/components/DailyQuestReminderGate";

export default function Home() {
    return (
        <AuthGate>
            <main className="relative min-h-[calc(100vh-130px)] overflow-hidden text-white">

                {/* ================================================= */}
                {/* BACKGROUND */}
                {/* ================================================= */}

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-24 top-10 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />

                    <div className="absolute -right-24 top-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

                    <div className="absolute bottom-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-fuchsia-500/[0.06] blur-[140px]" />
                </div>


                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20">

                    {/* ================================================= */}
                    {/* HERO */}
                    {/* ================================================= */}

                    <section className="mx-auto flex min-h-[560px] max-w-5xl flex-col items-center justify-center text-center">

                        <p className="text-xs font-black uppercase tracking-[0.4em] text-pink-300/60">
                            Competitive Anime Drafting
                        </p>

                        <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                            Build. Draft.{" "}
                            <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(236,72,153,0.3)]">
                                Battle.
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-purple-100/60 sm:text-lg">
                            Draft iconic anime characters, assign them to strategic
                            roles, build powerful synergies, and battle other players
                            position-by-position.
                        </p>


                        {/* CTA BUTTONS */}
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">

                            <Link
                                href="/games/draft/multiplayer"
                                className="
                                    group
                                    inline-flex
                                    min-w-[210px]
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-gradient-to-r
                                    from-pink-600
                                    via-fuchsia-600
                                    to-purple-700
                                    px-7 py-4
                                    text-sm
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-white
                                    shadow-[0_0_30px_rgba(236,72,153,0.3)]
                                    transition
                                    hover:-translate-y-1
                                    hover:shadow-[0_0_45px_rgba(236,72,153,0.45)]
                                "
                            >
                                Play Multiplayer

                                <span className="transition-transform group-hover:translate-x-1">
                                    →
                                </span>
                            </Link>


                            <Link
                                href="/games/draft"
                                className="
                                    group
                                    inline-flex
                                    min-w-[210px]
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    border border-white/15
                                    bg-white/[0.04]
                                    px-7 py-4
                                    text-sm
                                    font-black
                                    uppercase
                                    tracking-wider
                                    text-white/80
                                    backdrop-blur-xl
                                    transition
                                    hover:-translate-y-1
                                    hover:border-pink-400/40
                                    hover:bg-pink-500/10
                                    hover:text-pink-100
                                "
                            >
                                Solo Draft

                                <span className="transition-transform group-hover:translate-x-1">
                                    →
                                </span>
                            </Link>

                        </div>


                        {/* QUICK FEATURE STRIP */}
                        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">

                            <span>9 Draft Rounds</span>

                            <span className="hidden h-1 w-1 rounded-full bg-pink-400/40 sm:block" />

                            <span>Strategic Roles</span>

                            <span className="hidden h-1 w-1 rounded-full bg-pink-400/40 sm:block" />

                            <span>Synergies</span>

                            <span className="hidden h-1 w-1 rounded-full bg-pink-400/40 sm:block" />

                            <span>Ascensions</span>

                        </div>

                    </section>


                    {/* ================================================= */}
                    {/* HOW IT WORKS */}
                    {/* ================================================= */}

                    <section className="pb-20 pt-8">

                        <div className="text-center">

                            <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-300/50">
                                How It Works
                            </p>

                            <h2 className="mt-3 text-4xl font-black text-white">
                                Every Pick Matters
                            </h2>

                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-purple-100/50">
                                Build your lineup one round at a time and adapt to
                                the characters fate gives you.
                            </p>

                        </div>


                        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                            <HomeStep
                                number="01"
                                title="Roll"
                                description="Receive a random anime character every round."
                            />

                            <HomeStep
                                number="02"
                                title="Build"
                                description="Assign each character to the position where they fit your strategy."
                            />

                            <HomeStep
                                number="03"
                                title="Adapt"
                                description="Use Fate Rewrite, synergies, Power Positions, and Ascensions."
                            />

                            <HomeStep
                                number="04"
                                title="Battle"
                                description="Go head-to-head across nine position matchups."
                            />

                        </div>

                    </section>


                    {/* ================================================= */}
                    {/* PLAY YOUR WAY */}
                    {/* ================================================= */}

                    <section className="py-20">

                        <div className="text-center">

                            <p className="text-xs font-black uppercase tracking-[0.35em] text-purple-300/50">
                                Choose Your Mode
                            </p>

                            <h2 className="mt-3 text-4xl font-black text-white">
                                Play Your Way
                            </h2>

                        </div>


                        <div className="mt-10 grid gap-6 md:grid-cols-2">

                            {/* SOLO */}
                            <Link
                                href="/games/draft"
                                className="
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-3xl
                                    border border-pink-500/20
                                    bg-black/40
                                    p-8
                                    shadow-[0_0_30px_rgba(236,72,153,0.08)]
                                    backdrop-blur-xl
                                    transition
                                    hover:-translate-y-1
                                    hover:border-pink-400/45
                                    hover:bg-pink-500/[0.06]
                                    hover:shadow-[0_0_40px_rgba(236,72,153,0.16)]
                                "
                            >
                                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-pink-500/10 blur-3xl transition group-hover:bg-pink-500/20" />

                                <div className="relative z-10">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/10 text-2xl">
                                        👤
                                    </div>

                                    <p className="mt-7 text-[10px] font-black uppercase tracking-[0.3em] text-pink-300/50">
                                        Classic
                                    </p>

                                    <h3 className="mt-2 text-3xl font-black text-white">
                                        Solo Draft
                                    </h3>

                                    <p className="mt-3 max-w-md text-sm leading-6 text-purple-100/55">
                                        Build the strongest team possible, discover
                                        powerful combinations, and chase your personal
                                        high score.
                                    </p>

                                    <div className="mt-8 flex items-center gap-2 text-sm font-black text-pink-200">
                                        Start Draft

                                        <span className="transition-transform group-hover:translate-x-1">
                                            →
                                        </span>
                                    </div>

                                </div>
                            </Link>


                            {/* MULTIPLAYER */}
                            <Link
                                href="/games/draft/multiplayer"
                                className="
                                    group
                                    relative
                                    overflow-hidden
                                    rounded-3xl
                                    border border-purple-400/25
                                    bg-gradient-to-br
                                    from-purple-500/[0.08]
                                    via-black/40
                                    to-pink-500/[0.06]
                                    p-8
                                    shadow-[0_0_35px_rgba(168,85,247,0.1)]
                                    backdrop-blur-xl
                                    transition
                                    hover:-translate-y-1
                                    hover:border-purple-400/50
                                    hover:shadow-[0_0_45px_rgba(168,85,247,0.2)]
                                "
                            >
                                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-purple-500/15 blur-3xl transition group-hover:bg-purple-500/25" />

                                <div className="relative z-10">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10 text-2xl">
                                        ⚔️
                                    </div>

                                    <div className="mt-7 flex items-center gap-2">

                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300/50">
                                            Head To Head
                                        </p>

                                        <span className="rounded-full border border-pink-400/20 bg-pink-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-pink-200">
                                            Featured
                                        </span>

                                    </div>

                                    <h3 className="mt-2 text-3xl font-black text-white">
                                        Multiplayer Draft
                                    </h3>

                                    <p className="mt-3 max-w-md text-sm leading-6 text-purple-100/55">
                                        Reveal characters head-to-head, read your
                                        opponent&apos;s strategy, and battle across
                                        every position for the win.
                                    </p>

                                    <div className="mt-8 flex items-center gap-2 text-sm font-black text-purple-200">
                                        Find Opponent

                                        <span className="transition-transform group-hover:translate-x-1">
                                            →
                                        </span>
                                    </div>

                                </div>
                            </Link>

                        </div>

                    </section>


                    {/* ================================================= */}
                    {/* STRATEGY */}
                    {/* ================================================= */}

                    <section className="py-20">

                        <div
                            className="
                                overflow-hidden
                                rounded-[2rem]
                                border border-pink-500/20
                                bg-gradient-to-br
                                from-pink-500/[0.06]
                                via-black/40
                                to-purple-500/[0.08]
                                p-8
                                shadow-[0_0_40px_rgba(236,72,153,0.08)]
                                backdrop-blur-xl
                                md:p-10
                            "
                        >

                            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

                                <div>

                                    <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-300/50">
                                        More Than Luck
                                    </p>

                                    <h2 className="mt-3 text-4xl font-black text-white">
                                        Strategy Changes Every Draft
                                    </h2>

                                    <p className="mt-4 max-w-lg text-sm leading-7 text-purple-100/55">
                                        Your characters are random. What you do with
                                        them isn&apos;t. Every mechanic gives you
                                        another way to turn an imperfect roll into a
                                        winning team.
                                    </p>

                                </div>


                                <div className="grid gap-3 sm:grid-cols-2">

                                    <FeaturePill
                                        title="Fate Rewrite"
                                        description="One reroll. Choose when to spend it."
                                    />

                                    <FeaturePill
                                        title="Power Position"
                                        description="Give one role extra importance."
                                    />

                                    <FeaturePill
                                        title="Anime Synergy"
                                        description="Draft characters from the same series for bonuses."
                                    />

                                    <FeaturePill
                                        title="Ascensions"
                                        description="Transform your lineup with a final strategic effect."
                                    />

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* ================================================= */}
                    {/* DAILY QUEST */}
                    {/* ================================================= */}

                    <section className="py-20">

                        <div
                            className="
                                flex
                                flex-col
                                gap-6
                                rounded-3xl
                                border border-white/10
                                bg-white/[0.025]
                                p-8
                                backdrop-blur-xl
                                md:flex-row
                                md:items-center
                                md:justify-between
                            "
                        >

                            <div>

                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-200/40">
                                    Daily Challenge
                                </p>

                                <h2 className="mt-2 text-3xl font-black text-white">
                                    Daily Quest
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-purple-100/45">
                                    Test your anime knowledge with a new guessing
                                    challenge every day.
                                </p>

                            </div>


                            <Link
                                href="/daily"
                                className="
                                    inline-flex
                                    shrink-0
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    border border-yellow-300/25
                                    bg-yellow-300/[0.07]
                                    px-6 py-3
                                    text-sm
                                    font-black
                                    text-yellow-100
                                    transition
                                    hover:-translate-y-0.5
                                    hover:border-yellow-300/50
                                    hover:bg-yellow-300/[0.12]
                                "
                            >
                                Play Daily
                                <span>→</span>
                            </Link>

                        </div>

                    </section>

                </div>


                {/* KEEP YOUR EXISTING DAILY REMINDER */}
                <DailyQuestReminderGate />

            </main>
        </AuthGate>
    );
}


function HomeStep({
                      number,
                      title,
                      description,
                  }: {
                    number: string;
                    title: string;
                    description: string;
                }) {
    return (
        <div
            className="
                rounded-3xl
                border border-white/10
                bg-white/[0.025]
                p-6
                backdrop-blur-xl
                transition
                hover:border-pink-400/20
                hover:bg-pink-500/[0.04]
            "
        >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-300/40">
                {number}
            </p>

            <h3 className="mt-4 text-xl font-black text-white">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-purple-100/45">
                {description}
            </p>
        </div>
    );
}


function FeaturePill({
                         title,
                         description,
                     }: {
                        title: string;
                        description: string;
                    }) {
    return (
        <div
            className="
                rounded-2xl
                border border-white/10
                bg-black/30
                p-5
            "
        >
            <h3 className="text-sm font-black text-white">
                {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-purple-100/40">
                {description}
            </p>
        </div>
    );
}