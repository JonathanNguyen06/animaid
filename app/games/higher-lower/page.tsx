"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const modes = [
    {
        title: "Anime Score",
        description: "Guess which anime has the higher MAL score.",
        href: "/games/higher-lower/anime-score",
        status: "Score Mode",
        imageLink: "/game-images/higher-lower-score.jpeg",
    },
    {
        title: "Anime Popularity",
        description: "Guess which anime is more popular on MAL.",
        href: "/games/higher-lower/anime-popularity",
        status: "Popularity Mode",
        imageLink: "/game-images/higher-lower-popularity-v2.jpg",
    },
    {
        title: "Character Favorites",
        description: "Guess which character has more favorites.",
        href: "/games/higher-lower/character",
        status: "Character Mode",
        imageLink: "/game-images/higher-lower-character.jpg",
    },
];

export default function HigherLowerSelectPage() {
    return (
        <main className="relative flex min-h-[calc(100vh-130px)] items-center justify-center overflow-hidden px-6">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-20 top-20 h-80 w-80 rounded-full bg-pink-500/10 blur-[140px]" />
                <div className="absolute right-20 bottom-20 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[140px]" />
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[180px]" />
            </div>

            <div
                className="
                    relative z-10
                    max-w-2xl
                    rounded-3xl
                    border border-pink-500/20
                    bg-black/40
                    p-12
                    text-center
                    backdrop-blur-xl
                    shadow-[0_0_45px_rgba(236,72,153,0.15)]
                "
            >
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-5xl shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                    🚧
                </div>

                <p className="text-sm font-bold uppercase tracking-[0.35em] text-pink-300/70">
                    Under Construction
                </p>

                <h1 className="mt-4 text-5xl font-extrabold text-white">
                    Higher or Lower
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-purple-100/75">
                    This game mode is currently being rebuilt from the ground up.
                    I'm adding new gameplay, improved visuals, and a more polished
                    experience.
                </p>

                <div className="mt-10 inline-flex rounded-2xl border border-pink-500/30 bg-pink-500/10 px-6 py-3 font-semibold text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                    Coming Soon
                </div>
            </div>
        </main>
    );
}

// export default function HigherLowerSelectPage() {
//     return (
//         <main className="relative mx-auto flex min-h-[calc(100vh-130px)] max-w-7xl flex-col px-4 py-10 text-white">
//             <div className="pointer-events-none absolute inset-0 overflow-hidden">
//                 <div className="absolute left-10 top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
//                 <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[120px]" />
//             </div>
//
//             <section className="relative z-10 mb-8 text-center">
//                 <p className="text-xs font-bold uppercase tracking-widest text-pink-300/60">
//                     Higher or Lower
//                 </p>
//
//                 <h1 className="mt-3 text-5xl font-bold text-white">
//                     Choose a Mode
//                 </h1>
//
//                 <p className="mx-auto mt-3 max-w-2xl text-purple-100/70">
//                     Build your streak by guessing which anime or character ranks
//                     higher. Earn packs every 5 correct answers, up to 4 per day.
//                 </p>
//             </section>
//
//             <section className="relative z-10 grid flex-1 gap-6 lg:grid-cols-3">
//                 {modes.map((mode, index) => (
//                     <motion.div
//                         key={mode.title}
//                         initial={{ opacity: 0, y: 24, scale: 0.96 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         transition={{
//                             duration: 0.35,
//                             delay: index * 0.15,
//                         }}
//                     >
//                         <Link
//                             href={mode.href}
//                             className="
//                         group relative z-10 flex min-h-[520px] overflow-hidden
//                         rounded-3xl
//                         border border-pink-500/20
//                         bg-black/40
//                         backdrop-blur-xl
//                         shadow-[0_0_25px_rgba(236,72,153,0.08)]
//                         transition
//                         hover:-translate-y-1
//                         hover:border-pink-400/40
//                         hover:shadow-[0_0_35px_rgba(236,72,153,0.18)]
//                         "
//                         >
//                             <div className="absolute inset-0">
//                                 <Image
//                                     src={mode.imageLink}
//                                     alt={mode.title}
//                                     fill
//                                     className="object-cover object-top transition duration-500 group-hover:scale-105"
//                                 />
//                             </div>
//
//                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
//                             <div className="absolute inset-0 bg-pink-500/0 transition duration-500 group-hover:bg-pink-500/10" />
//
//                             <div className="relative z-10 mt-auto flex w-full flex-col p-6 text-left">
//                             <span
//                                 className="
//                                 mb-3 w-fit
//                                 rounded-full
//                                 border border-pink-300/30
//                                 bg-pink-500/10
//                                 px-3 py-1
//                                 text-xs font-bold uppercase tracking-widest
//                                 text-pink-100
//                                 backdrop-blur-sm
//                                 "
//                             >
//                                 {mode.status}
//                             </span>
//
//                                 <h2 className="text-3xl font-bold text-white drop-shadow-lg">
//                                     {mode.title}
//                                 </h2>
//
//                                 <p className="mt-3 text-sm leading-6 text-purple-100/80">
//                                     {mode.description}
//                                 </p>
//
//                                 <div
//                                     className="
//                                 mt-6 inline-flex w-fit
//                                 rounded-2xl
//                                 border border-pink-500/20
//                                 bg-pink-500/10
//                                 px-5 py-3
//                                 text-sm font-bold
//                                 text-pink-200
//                                 backdrop-blur-xl
//                                 shadow-[0_0_15px_rgba(236,72,153,0.12)]
//                                 transition
//                                 group-hover:border-pink-400/40
//                                 group-hover:bg-pink-500/20
//                                 group-hover:shadow-[0_0_22px_rgba(236,72,153,0.2)]
//                                 "
//                                 >
//                                     Play Mode
//                                 </div>
//                             </div>
//                         </Link>
//                     </motion.div>
//                 ))}
//             </section>
//         </main>
//     );
// }