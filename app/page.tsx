import Searchbar from "@/app/components/Searchbar";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col items-center justify-center px-4 py-16">
      <section className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-purple-950 sm:text-5xl">
          Find your next favorite anime or manga
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-purple-900/70 sm:text-lg">
          Search with a prompt or your interests, and we’ll recommend titles that match your vibe.
        </p>

        {/* Centralized search bar */}
        <div className="mt-8">
          <Searchbar />
          {/* Optional quick interest chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              "Slice of Life",
              "Shounen",
              "Romance",
              "Sports",
              "Psychological",
              "Isekai",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs font-medium text-purple-900/80 hover:border-purple-300 hover:text-purple-900"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
