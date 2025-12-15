"use client";
import React, { useEffect, useState } from "react";
import { observeAuth } from "@/lib/firebase";
import Loading from "@/app/components/Loading";

type Props = {
  children: React.ReactNode;
};

/**
 * Delays rendering of the app until Firebase Auth state is known.
 * Shows a full-screen loading page meanwhile.
 */
export default function AuthGate({ children }: Props) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = observeAuth(() => {
      // First invocation confirms auth has resolved (user or null)
      setInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  if (!initialized) {
    return <Loading />;
  }

  return <>{children}</>;
}
