import React from 'react'

const Searchbar = () => {
    return (
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
                className="ml-2 inline-flex items-center justify-center rounded-xl bg-purple-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-800"
            >
                Search
            </button>
        </form>
    )
}
export default Searchbar
