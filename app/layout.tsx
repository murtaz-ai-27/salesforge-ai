import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default:"SalesForge AI — AI-Powered Sales Platform", template:"%s | SalesForge AI" },
  description:"Replace Apollo.io with SalesForge AI. 10 AI agents, 15 automations, 100% data accuracy. Start free — no credit card required.",
  keywords:["Apollo.io alternative","AI sales platform","cold email automation","SDR automation","sales AI agents","B2B outreach","sales automation"],
  authors:[{ name:"SalesForge AI" }],
  creator:"SalesForge AI",
  openGraph:{
    type:"website",
    locale:"en_US",
    url:"https://salesforge.ai",
    siteName:"SalesForge AI",
    title:"SalesForge AI — The Apollo.io Alternative That Actually Works",
    description:"10 AI agents. 15 automations. 100% data accuracy. Replace Apollo.io and 3x your reply rates. Start free.",
    images:[{ url:"/og-image.png", width:1200, height:630, alt:"SalesForge AI" }],
  },
  twitter:{
    card:"summary_large_image",
    title:"SalesForge AI — Replace Apollo.io",
    description:"10 AI agents. 15 automations. Start free.",
    images:["/og-image.png"],
  },
  robots:{ index:true, follow:true, googleBot:{ index:true, follow:true } },
  manifest:"/manifest.json",
  icons:{
    icon:[{ url:"/favicon.ico" },{ url:"/icon-192.png", sizes:"192x192", type:"image/png" }],
    apple:[{ url:"/apple-icon.png", sizes:"180x180" }],
  },
};

export const viewport: Viewport = {
  width:"device-width",
  initialScale:1,
  maximumScale:1,
  themeColor:"#050505",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
