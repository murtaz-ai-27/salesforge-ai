"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    const id = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div ref={ref} style={{ opacity: 0, transform: "translateY(8px)", willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}
