"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Dashboard Page Transition Wrapper
 *
 * Next.js App Router re-mounts <template> on EVERY navigation,
 * so this component triggers a fresh fade-up animation each time
 * the user navigates to a new dashboard tab — zero extra work needed
 * in individual page files.
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset then replay
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    // rAF gives the browser one frame to register the reset before animating
    const id = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.15s cubic-bezier(0.4,0,0.2,1), transform 0.15s cubic-bezier(0.4,0,0.2,1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0px)";
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      ref={ref}
      style={{ opacity: 0, transform: "translateY(6px)", willChange: "opacity, transform" }}
    >
      {children}
    </div>
  );
}
