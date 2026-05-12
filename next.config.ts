import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "myanimelist.net",
                pathname: "/images/**",
            },
            {
                protocol: "https",
                hostname: "cdn.myanimelist.net",
                pathname: "/images/**",
            },
        ],
    },
};

export default nextConfig;