import React from 'react'
import Image from "next/image";

const Navbar = () => {
    return (
        <header className="sticky top-0 z-40 border-b border-purple-100/60 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-30 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="flex items-center gap-2">
                    {/* Logo placeholder */}
                    <Image src={"/icons/animaid_logo.png"} alt={"AnimAid"} width={150} height={150} />
                </a>
                <nav className="flex items-center gap-7 text-base font-medium">
                    <a href="#friends" className="text-purple-900/80 hover:text-purple-900">Friends</a>
                    <a href="#wishlist" className="text-purple-900/80 hover:text-purple-900">Wishlist</a>
                    <a href="#profile" className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-purple-900/80 hover:text-purple-900 hover:border-purple-300">
                        <div className="h-6 w-6 rounded-full bg-purple-200" aria-hidden />
                        <span className="hidden sm:inline">Profile</span>
                    </a>
                </nav>
            </div>
        </header>
    )
}
export default Navbar
