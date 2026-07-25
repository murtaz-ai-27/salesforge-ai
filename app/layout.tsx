import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default:"Salevrix — AI-Powered Sales Platform", template:"%s | Salevrix" },
  description:"Replace Apollo.io with Salevrix. 10 AI agents, 15 automations, 100% data accuracy. Start free.",
  keywords:["Apollo.io alternative","AI sales platform","cold email automation","SDR automation","sales AI agents"],
  openGraph:{
    type:"website", locale:"en_US", url:"https://salevrix.com",
    siteName:"Salevrix",
    title:"Salevrix — The Apollo.io Alternative That Actually Works",
    description:"10 AI agents. 15 automations. 100% data accuracy. Replace Apollo.io.",
    images:[{ url:"/icon-512.png", width:512, height:512, alt:"Salevrix" }],
  },
  twitter:{ card:"summary_large_image", title:"Salevrix", images:["/icon-512.png"] },
  robots:{ index:true, follow:true },
  manifest:"/manifest.json",
  icons:{
    icon:[
      { url:"/favicon.ico", sizes:"any" },
      { url:"/favicon.svg", type:"image/svg+xml" },
      { url:"/icon-32.png", sizes:"32x32", type:"image/png" },
      { url:"/icon-16.png", sizes:"16x16", type:"image/png" },
    ],
    apple:[{ url:"/icon-192.png", sizes:"192x192" }],
    shortcut:[{ url:"/favicon.ico" }],
  },
};

export const viewport: Viewport = {
  width:"device-width", initialScale:1, maximumScale:1,
  themeColor:"#050505",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>{children}</body>
    </html>
  );
}
