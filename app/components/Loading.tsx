"use client";
import React from "react";
import Image from "next/image";

const Loading = () => {
    return (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#0a0a0f]">
            {/* Soft glow behind logo */}
            <div className="absolute h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />

            <Image
                src="/icons/animaid.png"
                alt="AnimAid"
                width={180}
                height={180}
                priority
                className="relative z-10 drop-shadow-[0_0_25px_rgba(236,72,153,0.35)]"
            />
            <div className="mt-8 flex gap-2">
                <div className="h-3 w-3 animate-bounce rounded-full bg-pink-400" />
                <div
                    className="h-3 w-3 animate-bounce rounded-full bg-pink-400"
                    style={{ animationDelay: "0.15s" }}
                />
                <div
                    className="h-3 w-3 animate-bounce rounded-full bg-pink-400"
                    style={{ animationDelay: "0.3s" }}
                />
            </div>
        </div>
    );
};

export default Loading;