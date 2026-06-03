// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase (singleton safe for Next.js hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth exports
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  return await firebaseSignOut(auth);
}

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Email/password helpers
export async function signInWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(params: {
  username: string;
  email: string;
  password: string;
}) {
  const { username, email, password } = params;
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (cred.user && username) {
    await updateProfile(cred.user, { displayName: username });
    await cred.user.reload();
  }
  return cred;
}

export async function ensureUserProfile(user: User, username?: string) {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const derivedUsername = username?.toLowerCase()
            || user.displayName?.toLowerCase().replace(/\s+/g, "")
            || user.email?.split("@")[0].toLowerCase()
            || "";

        await setDoc(userRef, {
            uid: user.uid,
            username: derivedUsername,
            email: user.email ?? "",
            photoURL: user.photoURL ?? "",
            created_at: serverTimestamp(),
        });
    }
}
export const db = getFirestore(app);

export default app;

export async function getDailyProgress(
    userId: string,
    date: string
) {
    const progressRef = doc(
        db,
        "dailyProgress",
        `${userId}-${date}`
    );

    const snapshot = await getDoc(progressRef);

    return snapshot.exists() ? snapshot.data() : null;
}

export async function saveDailyProgress(
    userId: string,
    date: string,
    animeId: number,
    attempts: any[],
    won: boolean
) {
    const progressRef = doc(
        db,
        "dailyProgress",
        `${userId}-${date}`
    );

    const snapshot = await getDoc(progressRef);

    const existingData = snapshot.exists()
        ? snapshot.data()
        : null;

    await setDoc(
        progressRef,
        {
            userId,
            date,
            animeId,
            attempts,
            won,
            rewardClaimed: existingData?.rewardClaimed ?? false,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

export async function claimDailyPack(
    userId: string,
    date: string
) {
    const progressRef = doc(
        db,
        "dailyProgress",
        `${userId}-${date}`
    );

    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists()) {
        throw new Error("No daily progress found.");
    }

    const progress = progressSnap.data();

    if (!progress.won) {
        throw new Error("You must win the daily challenge first.");
    }

    if (progress.rewardClaimed) {
        throw new Error("Daily reward already claimed.");
    }

    const packRef = await addDoc(collection(db, "packs"), {
        userId,
        source: "dailyQuest",
        date,
        status: "unopened",
        createdAt: serverTimestamp(),
    });

    await updateDoc(progressRef, {
        rewardClaimed: true,
        claimedPackId: packRef.id,
        updatedAt: serverTimestamp(),
    });

    return packRef.id;
}

export async function getPack(
    packId: string
): Promise<Pack | null> {
    const packRef = doc(db, "packs", packId);
    const snapshot = await getDoc(packRef);

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: snapshot.id,
        ...(snapshot.data() as Omit<Pack, "id">),
    };
}

export type Pack = {
    id: string;
    userId: string;
    source: string;
    date: string;
    status: "unopened" | "opened";
    rewards?: any[];
};

export async function getUserPacks(userId: string) {
    const packsRef = collection(db, "packs");

    const q = query(
        packsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function openPack(
    packId: string,
    userId: string
) {
    const packRef = doc(db, "packs", packId);
    const packSnap = await getDoc(packRef);

    if (!packSnap.exists()) {
        throw new Error("Pack not found.");
    }

    const pack = packSnap.data();

    if (pack.userId !== userId) {
        throw new Error("You do not own this pack.");
    }

    if (pack.status === "opened") {
        throw new Error("This pack has already been opened.");
    }

    const realRewards: OwnedCharacter[] = [];

    for (let i = 0; i < 3; i++) {
        if (i > 0) {
            await sleep(1000);
        }

        const res = await fetch("/api/jikan/random-pack-character");
        const json = await res.json();

        if (!res.ok) {
            console.error("Pack reward generation failed:", json);
            throw new Error(json?.error ?? "Failed to generate pack reward.");
        }

        const anime = json.data.anime;
        const character = json.data.character;

        const powerLevel = calculatePowerLevel({
            characterFavorites: character.favorites ?? 0,
            animePopularityRank: anime.popularity ?? 500,
            animeScore: anime.score ?? 0,
            role: character.role ?? "Supporting",
        });

        const rarity = getRarity(powerLevel);

        realRewards.push({
            characterId: character.mal_id,
            animeId: anime.mal_id,
            animeTitle:
                anime.title_english ||
                anime.title,
            name: character.name,
            imageUrl:
                character.images?.jpg?.image_url ??
                character.images?.webp?.image_url ??
                "",
            role: character.role ?? "Supporting",
            favorites: character.favorites ?? 0,
            powerLevel,
            rarity,
            obtainedFrom: "dailyQuest",
        });
    }

    const rewardIds: string[] = [];

    for (const reward of realRewards) {
        const characterRef = await addDoc(
            collection(db, "users", userId, "characters"),
            {
                ...reward,
                packId,
                obtainedAt: serverTimestamp(),
            }
        );

        rewardIds.push(characterRef.id);
    }

    await updateDoc(packRef, {
        status: "opened",
        openedAt: serverTimestamp(),
        rewards: realRewards,
        rewardIds,
    });

    return realRewards;
}

export type CharacterRarity =
    | "Common"
    | "Uncommon"
    | "Rare"
    | "Epic"
    | "Legendary"
    | "Mythic";

export type OwnedCharacter = {
    characterId: number;
    animeId: number;
    animeTitle: string;

    name: string;
    imageUrl: string;

    role: string;
    favorites: number;

    powerLevel: number;
    rarity: CharacterRarity;

    obtainedFrom: string;
};

export async function addCharacterToCollection(
    userId: string,
    character: OwnedCharacter
) {
    const collectionRef = collection(
        db,
        "users",
        userId,
        "characters"
    );

    await addDoc(collectionRef, {
        ...character,
        obtainedAt: serverTimestamp(),
    });
}

export function getRarity(
    powerLevel: number
): CharacterRarity {
    if (powerLevel >= 9700) return "Mythic";
    if (powerLevel >= 8500) return "Legendary";
    if (powerLevel >= 6500) return "Epic";
    if (powerLevel >= 4000) return "Rare";
    if (powerLevel >= 2000) return "Uncommon";

    return "Common";
}

export function calculatePowerLevel(params: {
    characterFavorites: number;
    animePopularityRank: number;
    animeScore: number;
    role: string;
}) {
    const {
        characterFavorites,
        animePopularityRank,
        animeScore,
        role,
    } = params;

    const characterFavoritesScore =
        Math.min(
            Math.log10(characterFavorites + 1) /
            Math.log10(200000 + 1),
            1
        ) * 9999;

    const animePopularityScore =
        ((501 - animePopularityRank) / 500) * 9999;

    const animeRatingScore =
        (animeScore / 10) * 9999;

    const roleBonus =
        role === "Main"
            ? 9999
            : 2500;

    const powerLevel =
        characterFavoritesScore * 0.6 +
        animePopularityScore * 0.2 +
        animeRatingScore * 0.15 +
        roleBonus * 0.05;

    return Math.round(
        Math.max(
            1,
            Math.min(powerLevel, 9999)
        )
    );
}

export type PackReward = {
    characterId: number;
    animeId: number;
    name: string;
    imageUrl: string;

    rarity: CharacterRarity;
    powerLevel: number;
};

export async function getUserCharacters(userId: string) {
    const charactersRef = collection(
        db,
        "users",
        userId,
        "characters"
    );

    const q = query(
        charactersRef,
        orderBy("obtainedAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}