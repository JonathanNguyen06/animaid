type Props = {
    query: string;
    setQuery: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
    ariaLabel?: string;
    buttonText?: string;
};

export default function SearchBar({
                                      query,
                                      setQuery,
                                      onSubmit,
                                      placeholder = "e.g. Naruto, Attack on Titan",
                                      ariaLabel = "Search",
                                      buttonText = "Search",
                                  }: Props) {
    return (
        <form
            onSubmit={onSubmit}
            className="
        group relative mx-auto flex w-full items-center
        rounded-2xl
        border border-pink-500/20
        bg-black/40
        backdrop-blur-xl
        p-2
        shadow-[0_0_20px_rgba(236,72,153,0.08)]
        transition-all
        focus-within:border-pink-500/50
        focus-within:shadow-[0_0_25px_rgba(236,72,153,0.18)]
    "
        >
            <input
                type="text"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="
            w-full rounded-xl bg-transparent
            px-4 py-3
            text-white
            placeholder:text-purple-100/40
            outline-none
        "
                aria-label={ariaLabel}
                autoComplete="off"
            />

            <button
                type="submit"
                className="
            ml-2 inline-flex cursor-pointer items-center justify-center
            rounded-xl
            bg-gradient-to-r
            from-pink-500
            to-purple-600
            px-5 py-3
            text-sm font-semibold text-white
            transition-all
            hover:scale-105
            hover:shadow-[0_0_20px_rgba(236,72,153,0.45)]
            active:scale-95
        "
            >
                {buttonText}
            </button>
        </form>
    );
}