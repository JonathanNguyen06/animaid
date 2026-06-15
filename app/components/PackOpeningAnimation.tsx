// app/components/PackOpeningAnimation.tsx
"use client";

import { motion } from "framer-motion";

type Props = {
    burst?: boolean;
};

export default function PackOpeningAnimation({ burst = false }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-purple-950/90 backdrop-blur-sm">
            <motion.div
                className="absolute h-[520px] w-[520px] rounded-full bg-yellow-400/20 blur-3xl"
                animate={{
                    scale: burst ? [1, 2.4] : [1, 1.35, 1],
                    opacity: burst ? [0.8, 0] : [0.35, 0.9, 0.35],
                }}
                transition={{
                    duration: burst ? 0.6 : 1.8,
                    repeat: burst ? 0 : Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="absolute h-[380px] w-[380px] rounded-full border border-yellow-300/30"
                animate={{
                    rotate: 360,
                    scale: burst ? [1, 1.7] : [1, 1.08, 1],
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

            {[...Array(18)].map((_, i) => (
                <motion.span
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-yellow-200 shadow-lg shadow-yellow-300"
                    style={{
                        left: `${50 + Math.cos(i) * 22}%`,
                        top: `${50 + Math.sin(i) * 22}%`,
                    }}
                    animate={{
                        x: burst ? Math.cos(i) * 260 : [0, Math.cos(i) * 30, 0],
                        y: burst ? Math.sin(i) * 260 : [0, Math.sin(i) * 30, 0],
                        opacity: burst ? [1, 0] : [0.2, 1, 0.2],
                        scale: burst ? [1, 2.5] : [1, 1.4, 1],
                    }}
                    transition={{
                        duration: burst ? 0.7 : 1.6,
                        repeat: burst ? 0 : Infinity,
                        delay: i * 0.03,
                    }}
                />
            ))}

            <motion.img
                src="/icons/animaid-pack.png"
                alt="Anime Aid summon emblem"
                className="relative z-10 h-64 w-64 object-contain drop-shadow-2xl"
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
                className="absolute bottom-24 text-sm font-bold uppercase tracking-[0.35em] text-yellow-200/80"
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