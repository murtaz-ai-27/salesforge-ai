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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleRedirect = useCallback((u: User | null) => {
    if (!u && !PUBLIC_PATHS.some((p) => pathname?.startsWith(p))) {
      router.push("/auth/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        // LOCAL persistence — survives mobile tab close/refresh
        await setPersistence(auth, browserLocalPersistence);
      } catch {
        // Already set or not supported — continue
      }

      unsubscribe = onAuthStateChanged(
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
    };

    init();
    return () => { unsubscribe?.(); };
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
