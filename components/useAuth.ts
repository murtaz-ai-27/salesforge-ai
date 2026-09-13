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
    // Auth state listener with error handling
    let unsubscribe: () => void;
    
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          setUser(u);
          setLoading(false);
          // Redirect to login if not authenticated
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

    return () => { if (unsubscribe) unsubscribe(); };
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("[Logout Error]", error);
      // Force redirect even if signOut fails
      router.push("/login");
    }
  };

  return { user, loading, handleLogout };
}
