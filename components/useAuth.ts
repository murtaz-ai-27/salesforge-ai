"use client";
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
} from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

// Public routes — no auth needed
const PUBLIC_PATHS = ["/", "/auth/login", "/auth/signup", "/blog", "/pricing"];

// Set persistence once at module load — not on every hook mount
setPersistence(auth, browserLocalPersistence).catch(() => {});

export function useAuth() {
  // auth.currentUser is synchronously set by Firebase after SDK init with
  // local persistence — use it directly so tabs open with ZERO loading delay.
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState<boolean>(!auth.currentUser);
  const router = useRouter();
  const pathname = usePathname();

  const handleRedirect = useCallback((u: User | null) => {
    if (!u && !PUBLIC_PATHS.some((p) => pathname?.startsWith(p))) {
      router.push("/auth/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    // onAuthStateChanged confirms/refreshes the token in the background.
    // If currentUser was already set above, loading is already false and
    // the page renders immediately — no spinner, no null flash.
    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setLoading(false);
        handleRedirect(u);
      },
      (error) => {
        console.error("[useAuth] Auth error:", (error as any).code ?? error.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [handleRedirect]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("[useAuth] Logout error:", err);
    } finally {
      router.push("/auth/login");
    }
  };

  return { user, loading, handleLogout };
}
