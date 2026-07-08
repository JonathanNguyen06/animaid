export function isFirstSeasonAnime(anime: any) {
    const title = (anime.title ?? "").toLowerCase();

    const sequelWords = [
        "season 2",
        "season 3",
        "season 4",
        "season 5",
        "season 6",
        "season 7",
        "2nd season",
        "3rd season",
        "4th season",
        "5th season",
        "6th season",
        "7th season",
        "part 2",
        "part 3",
        "part 4",
        "part 5",
        "part 6",
        "part 7",
        "final season",
        "movie",
        "ova",
        "special",
    ];

    const titleLooksLikeSequel = sequelWords.some((word) =>
        title.includes(word)
    );

    const isTv = anime.media_type === "tv";

    return isTv && !titleLooksLikeSequel;
}

export function normalizeTitle(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function formatSource(source?: string | null) {
    if (!source) return null;

    return source
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
        )
        .join(" ");
}