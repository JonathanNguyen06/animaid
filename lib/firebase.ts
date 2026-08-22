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
    onSnapshot,
    deleteDoc,
} from "firebase/firestore";
import {
    getDatabase,
} from "firebase/database";

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

export const realtimeDb = getDatabase(app);

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

function getYesterday(date: string) {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

export async function updateDailyStreak(
    userId: string,
    today: string
) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return;
    }

    const userData = userSnap.data();

    if (userData.lastDailyWinDate === today) {
        return;
    }

    const yesterday = getYesterday(today);

    const currentStreak =
        typeof userData.dailyStreak === "number"
            ? userData.dailyStreak
            : 0;

    const newStreak =
        userData.lastDailyWinDate === yesterday
            ? currentStreak + 1
            : 1;

    await updateDoc(userRef, {
        dailyStreak: newStreak,
        lastDailyWinDate: today,
    });

    return newStreak;
}

export async function getUserProfile(userId: string) {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    return snapshot.exists() ? snapshot.data() : null;
}

export type DraftHighScore = {
    userId: string;
    totalPower: number;
    averagePower: number;
    grade: string;
    lineup: {
        position: string;
        power: number;
        grade: string;
        character: {
            id: string;
            name: string;
            anime: string;
            imageUrl: string;
        };
    }[];
    updatedAt?: any;
};

export async function getDraftHighScore(userId: string) {
    const highScoreRef = doc(
        db,
        "users",
        userId,
        "draftHighScores",
        "blindDraft"
    );

    const snapshot = await getDoc(highScoreRef);

    return snapshot.exists()
        ? (snapshot.data() as DraftHighScore)
        : null;
}

export async function saveDraftHighScore(
    userId: string,
    highScore: Omit<DraftHighScore, "userId" | "updatedAt">
) {
    const highScoreRef = doc(
        db,
        "users",
        userId,
        "draftHighScores",
        "blindDraft"
    );

    await setDoc(highScoreRef, {
        userId,
        ...highScore,
        updatedAt: serverTimestamp(),
    });
}