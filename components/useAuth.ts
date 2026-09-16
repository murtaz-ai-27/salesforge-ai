"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      // Set localStorage persistence only on client
      try {
        const { setPersistence, browserLocalStorage } = await import("firebase/auth");
        await setPersistence(auth, browserLocalStorage);
      } catch {
        // Ignore
      }

      unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          setUser(u);
          setLoading(false);
          if (!u && typeof window !== "undefined") {
            const path = window.location.pathname;
            if (path.startsWith("/dashboard")) {
              router.push("/login");
            }
          }
        },
        () => { setLoading(false); }
      );
    };

    init();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [router]);

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    router.push("/login");
  };

  return { user, loading, handleLogout };
}
