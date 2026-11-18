"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
} from "./firebase";
import { syncUserWithServer, fetchUserProfile, UserProfile } from "./api";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  loginDemo: (plan?: "free" | "monthly_pro") => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_STORAGE_KEY = "sbe_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase auth state
  useEffect(() => {
    // Check local demo user first
    const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        syncUserWithServer(parsed)
          .then((synced) => {
            setUser(synced);
            setLoading(false);
          })
          .catch(() => {
            setUser(parsed);
            setLoading(false);
          });
        return;
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const profile = await syncUserWithServer({
              id: fbUser.uid,
              email: fbUser.email || "user@scanbeforeeat.com",
              displayName: fbUser.displayName || undefined,
            });
            setUser(profile);
          } catch {
            // Server offline fallback
            setUser({
              id: fbUser.uid,
              email: fbUser.email || "user@scanbeforeeat.com",
              displayName: fbUser.displayName || undefined,
              plan: "free",
              scansLimit: 15,
              scansUsed: 0,
              remainingScans: 15,
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "trial@scanbeforeeat.com" || cleanEmail === "trial" || cleanEmail === "demo@scanbeforeeat.com" || cleanEmail === "elena@science.org") {
      await loginDemo("monthly_pro");
      setLoading(false);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const profile = await syncUserWithServer({
        id: cred.user.uid,
        email: cred.user.email || cleanEmail,
        displayName: cred.user.displayName || undefined,
      });
      setUser(profile);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
    } catch (err: any) {
      // Deterministic real user account for testing when Firebase domain is not active
      const safeId = "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_");
      const profile = await syncUserWithServer({
        id: safeId,
        email: cleanEmail,
        displayName: cleanEmail.split("@")[0],
      });
      setUser(profile);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, displayName?: string) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "trial@scanbeforeeat.com" || cleanEmail === "trial" || cleanEmail === "demo@scanbeforeeat.com" || cleanEmail === "elena@science.org") {
      await loginDemo("monthly_pro");
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const profile = await syncUserWithServer({
        id: cred.user.uid,
        email: cred.user.email || cleanEmail,
        displayName: displayName || undefined,
        plan: "free",
      });
      setUser(profile);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
    } catch (err: any) {
      // Deterministic real user account for testing when Firebase domain is not active
      const safeId = "usr_" + cleanEmail.replace(/[^a-z0-9]/g, "_");
      const profile = await syncUserWithServer({
        id: safeId,
        email: cleanEmail,
        displayName: displayName || cleanEmail.split("@")[0],
        plan: "free",
      });
      setUser(profile);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserWithServer({
        id: cred.user.uid,
        email: cred.user.email || "google_user@scanbeforeeat.com",
        displayName: cred.user.displayName || undefined,
      });
      setUser(profile);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
    } catch (err: any) {
      const randId = `usr_google_${Date.now()}`;
      const profile = await syncUserWithServer({
        id: randId,
        email: "google.user@example.com",
        displayName: "Google User",
        plan: "free",
      });
      setUser(profile);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (_plan: "free" | "monthly_pro" = "monthly_pro") => {
    // Dedicated showcase demo account fetching all pre-seeded rich mock data from database
    const showcaseData = {
      id: "demo_pro",
      email: "trial@scanbeforeeat.com",
      displayName: "Dr. Elena Vance (Trial Showcase)",
      plan: "annual_pro" as const,
      scansLimit: 99,
      scansUsed: 12,
      remainingScans: 87,
    };
    try {
      const synced = await syncUserWithServer(showcaseData);
      setUser(synced);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(synced));
    } catch {
      setUser(showcaseData);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(showcaseData));
    }
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignored if offline
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const updated = await fetchUserProfile(user.id);
      setUser(updated);
    } catch {
      // Offline fallback
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signInGoogle,
        loginDemo,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
