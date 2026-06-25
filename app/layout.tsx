import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SalesForge AI — Close More Deals. Automatically.",
  description:
    "AI-powered sales platform. Find prospects, automate outreach, book meetings on autopilot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.13/lenis.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${syne.className} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}