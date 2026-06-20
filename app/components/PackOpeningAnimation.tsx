// app/components/PackOpeningAnimation.tsx
"use client";

import { motion } from "framer-motion";

type Props = {
    burst?: boolean;
};

export default function PackOpeningAnimation({ burst = false }: Props) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/85 backdrop-blur-md">
            <motion.div
                className="absolute h-[560px] w-[560px] rounded-full bg-pink-500/20 blur-3xl"
                animate={{
                    scale: burst ? [1, 2.6] : [1, 1.35, 1],
                    opacity: burst ? [0.9, 0] : [0.35, 0.85, 0.35],
                }}
                transition={{
                    duration: burst ? 0.6 : 1.8,
                    repeat: burst ? 0 : Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="absolute h-[390px] w-[390px] rounded-full border border-pink-300/30 shadow-[0_0_50px_rgba(236,72,153,0.18)]"
                animate={{
                    rotate: 360,
                    scale: burst ? [1, 1.8] : [1, 1.08, 1],
                    opacity: burst ? [1, 0] : [0.6, 1, 0.6],
                }}
                transition={{
                    rotate: {
                        duration: 7,
                        repeat: Infinity,
                        ease: "linear",
                    },
                    scale: {
                        duration: burst ? 0.5 : 2,
                        repeat: burst ? 0 : Infinity,
                    },
                    opacity: {
                        duration: burst ? 0.5 : 2,
                        repeat: burst ? 0 : Infinity,
                    },
                }}
            />

            {[...Array(22)].map((_, i) => {
                const angle = (i / 22) * Math.PI * 2;

                return (
                    <motion.span
                        key={i}
                        className="absolute h-2 w-2 rounded-full bg-pink-200 shadow-[0_0_16px_rgba(244,114,182,0.9)]"
                        style={{
                            left: `${50 + Math.cos(angle) * 22}%`,
                            top: `${50 + Math.sin(angle) * 22}%`,
                        }}
                        animate={{
                            x: burst
                                ? Math.cos(angle) * 280
                                : [0, Math.cos(angle) * 30, 0],
                            y: burst
                                ? Math.sin(angle) * 280
                                : [0, Math.sin(angle) * 30, 0],
                            opacity: burst ? [1, 0] : [0.2, 1, 0.2],
                            scale: burst ? [1, 2.6] : [1, 1.4, 1],
                        }}
                        transition={{
                            duration: burst ? 0.7 : 1.6,
                            repeat: burst ? 0 : Infinity,
                            delay: i * 0.025,
                        }}
                    />
                );
            })}

            <motion.img
                src="/icons/animaid-pack.png"
                alt="Anime Aid summon pack"
                className="relative z-10 h-64 w-64 object-contain drop-shadow-[0_0_35px_rgba(236,72,153,0.55)]"
                animate={
                    burst
                        ? {
                            scale: [1, 1.4, 3.5],
                            rotate: [0, 8, -12],
                            opacity: [1, 1, 0],
                        }
                        : {
                            scale: [1, 1.12, 1],
                            rotate: [0, 5, -5, 0],
                        }
                }
                transition={{
                    duration: burst ? 0.65 : 1.4,
                    repeat: burst ? 0 : Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.p
                className="absolute bottom-24 text-sm font-black uppercase tracking-[0.35em] text-pink-200 drop-shadow-[0_0_18px_rgba(236,72,153,0.7)]"
                animate={{
                    opacity: burst ? [1, 0] : [0.35, 1, 0.35],
                }}
                transition={{
                    duration: burst ? 0.4 : 1.4,
                    repeat: burst ? 0 : Infinity,
                }}
            >
                Summoning
            </motion.p>
        </div>
    );
}