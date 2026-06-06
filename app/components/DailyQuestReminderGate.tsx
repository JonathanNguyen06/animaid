"use client";

import { useEffect, useState } from "react";
import DailyQuestReminder from "@/app/components/DailyQuestReminder";
import { getDailyProgress, observeAuth } from "@/lib/firebase";

export default function DailyQuestReminderGate() {
    const [showReminder, setShowReminder] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);

        const unsubscribe = observeAuth(async (user) => {
            if (!user) {
                setShowReminder(false);
                return;
            }

            const progress = await getDailyProgress(user.uid, today);

            if (!progress || !progress.won) {
                setShowReminder(true);
            } else {
                setShowReminder(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!showReminder) return null;

    return <DailyQuestReminder />;
}