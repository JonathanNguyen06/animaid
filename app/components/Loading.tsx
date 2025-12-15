"use client";
import React from "react";
import Image from "next/image";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white">
      <Image
        src="/icons/animaid_logo.png"
        alt="AnimAid"
        width={180}
        height={180}
        priority
      />
      <div className="mt-6 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" aria-label="Loading" />
    </div>
  );
};
export default Loading;
