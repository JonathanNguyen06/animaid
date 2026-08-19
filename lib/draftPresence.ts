import {
    onDisconnect,
    onValue,
    ref,
    serverTimestamp,
    set,
} from "firebase/database";

import {
    realtimeDb,
} from "@/lib/firebase";

export type DraftPresenceState =
    | "online"
    | "offline";


export function registerDraftPresence(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const playerPresenceRef =
        ref(
            realtimeDb,
            `draftPresence/${normalizedCode}/${uid}`
        );

    const connectedRef =
        ref(
            realtimeDb,
            ".info/connected"
        );

    const unsubscribe =
        onValue(
            connectedRef,
            async (snapshot) => {
                if (
                    snapshot.val() !== true
                ) {
                    return;
                }

                /*
                 * Register the server-side
                 * disconnect action FIRST.
                 */
                await onDisconnect(
                    playerPresenceRef
                ).set({
                    state: "offline",

                    lastChanged:
                        serverTimestamp(),
                });

                /*
                 * Only after onDisconnect
                 * is registered do we say
                 * we're online.
                 */
                await set(
                    playerPresenceRef,
                    {
                        state: "online",

                        lastChanged:
                            serverTimestamp(),
                    }
                );
            }
        );

    return unsubscribe;
}


export function listenToDraftPresence(
    code: string,
    uid: string,
    callback: (
        state: DraftPresenceState
    ) => void
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const playerPresenceRef =
        ref(
            realtimeDb,
            `draftPresence/${normalizedCode}/${uid}`
        );

    return onValue(
        playerPresenceRef,
        (snapshot) => {
            const data =
                snapshot.val();

            callback(
                data?.state === "online"
                    ? "online"
                    : "offline"
            );
        }
    );
}


export async function markDraftPresenceOffline(
    code: string,
    uid: string
) {
    const normalizedCode =
        code.trim().toUpperCase();

    const playerPresenceRef =
        ref(
            realtimeDb,
            `draftPresence/${normalizedCode}/${uid}`
        );

    await set(
        playerPresenceRef,
        {
            state: "offline",

            lastChanged:
                serverTimestamp(),
        }
    );
}