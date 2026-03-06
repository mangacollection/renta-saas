import React, { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import type { AuthContextValue, AuthState } from "./auth.types";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, initializing: true });

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setState({ user, initializing: false });
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      login: async (email, password) => {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      logout: async () => {
        await signOut(firebaseAuth);
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}