"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  User,
  setPersistence,
  browserLocalStorage,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      try {
        // Force LOCAL persistence — survives mobile browser refresh/tab switch
        await setPersistence(auth, browserLocalStorage);
      } catch {
        // Ignore — already set or not supported
      }

      try {
        unsubscribe = onAuthStateChanged(
          auth,
          (u) => {
            setUser(u);
            setLoading(false);

            // Only redirect if truly not logged in AND on dashboard
            if (!u && typeof window !== "undefined") {
              const path = window.location.pathname;
              if (path.startsWith("/dashboard")) {
                router.push("/login");
              }
            }
          },
          (error) => {
            console.error("[Auth Error]", error.message);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("[Auth Init Error]", error);
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return { user, loading, handleLogout };
}
