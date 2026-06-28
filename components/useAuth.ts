"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { displayName: string | null; email: string | null; photoURL: string | null; };

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/firebase").then(({ onAuthChange }) => {
      const unsub = onAuthChange((u) => {
        if (u) setUser({ displayName: u.displayName, email: u.email, photoURL: u.photoURL });
        else setUser(null);
        setLoading(false);
      });
      return () => unsub();
    }).catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try { const { logOut } = await import("@/lib/firebase"); await logOut(); } catch {}
    router.push("/");
  };

  return { user, loading, handleLogout };
}

export type { User };
