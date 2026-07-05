"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type User = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
};

export function useAuth(redirectOnLogout = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    import("@/lib/firebase")
      .then(({ onAuthChange }) => {
        unsub = onAuthChange((u) => {
          if (u) {
            setUser({
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              uid: u.uid,
            });
          } else {
            setUser(null);
            if (redirectOnLogout) router.push("/auth/login");
          }
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
    return () => unsub?.();
  }, [router, redirectOnLogout]);

  const handleLogout = async () => {
    try {
      const { logOut } = await import("@/lib/firebase");
      await logOut();
    } catch {}
    router.push("/");
  };

  return { user, loading, handleLogout };
}
