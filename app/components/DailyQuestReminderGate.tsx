"use client";

import {
    useEffect,
    useState,
} from "react";

import DailyQuestReminder
    from "@/app/components/DailyQuestReminder";

import {
    getDailyDraftProgress,
    observeAuth,
} from "@/lib/firebase";

import {
    getDailyDraftDate,
} from "@/lib/dailyDraft";


export default function DailyQuestReminderGate() {
    const [
        showReminder,
        setShowReminder,
    ] = useState(false);


    useEffect(() => {
        const today =
            getDailyDraftDate();

        let cancelled = false;


        const unsubscribe =
            observeAuth(
                async (user) => {
                    if (!user) {
                        if (!cancelled) {
                            setShowReminder(
                                false
                            );
                        }

                        return;
                    }


                    try {
                        const progress =
                            await getDailyDraftProgress(
                                user.uid,
                                today
                            );


                        if (cancelled) {
                            return;
                        }


                        /*
                         * Show reminder when:
                         *
                         * - no Daily Draft exists
                         * - OR today's draft has
                         *   not been completed
                         */

                        setShowReminder(
                            !progress ||
                            !progress.completed
                        );
                    } catch (
                        error
                        ) {
                        console.error(
                            "Failed to check Daily Draft progress:",
                            error
                        );


                        /*
                         * Don't annoy the user
                         * with a reminder if the
                         * progress check failed.
                         */

                        if (!cancelled) {
                            setShowReminder(
                                false
                            );
                        }
                    }
                }
            );


        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);


    if (!showReminder) {
        return null;
    }


    return (
        <DailyQuestReminder />
    );
}