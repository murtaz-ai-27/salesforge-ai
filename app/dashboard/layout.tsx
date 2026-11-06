"use client";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Dashboard Layout
 *
 * Wraps every dashboard page in an ErrorBoundary so crashes show a
 * friendly recovery UI instead of a blank screen.
 *
 * Note: Sidebar is rendered inside each page component because each page
 * manages its own active-state highlight and mobile behavior. When all
 * pages are refactored to a shared layout pattern, Sidebar can be hoisted
 * here and removed from individual pages.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
