import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesForge AI — Sales Platform",
  description: "AI-powered B2B sales platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body style={{ margin:0, padding:0, background:"#050505", fontFamily:"Inter,sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
