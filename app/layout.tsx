import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://salevrix.ai"),
  title: {
    default: "Salevrix AI — #1 Apollo.io Alternative | AI Sales Automation Platform",
    template: "%s | Salevrix AI"
  },
  description: "The best Apollo.io alternative in 2026. Salevrix AI gives you 10 AI sales agents, 15 automations, 100% data accuracy, and 3x higher reply rates. Start free — no credit card required.",
  keywords: [
    // Apollo competitors
    "Apollo.io alternative", "Apollo.io competitor", "best Apollo.io alternative 2026",
    "replace Apollo.io", "switch from Apollo.io", "Apollo.io too expensive",
    "ZoomInfo alternative", "Outreach.io alternative", "Salesloft alternative",
    // Cold email
    "cold email software", "cold email automation software", "best cold email tool",
    "cold email automation", "cold outreach tool", "cold outreach software",
    // Sales automation
    "sales outreach tool", "sales automation software", "B2B sales automation software",
    "outbound sales software", "sales engagement platform", "sales engagement software",
    // AI Sales
    "AI sales assistant", "AI sales platform", "AI SDR software", "AI sales agents",
    "AI outreach tool", "AI cold email",
    // Prospecting
    "sales prospecting software", "B2B lead generation software", "B2B prospecting tool",
    "sales intelligence software", "outbound automation",
    // LinkedIn
    "LinkedIn automation tool", "LinkedIn outreach tool",
    // Brand
    "Salevrix AI", "Salevrix",
    // Free
    "free sales outreach tool", "free cold email software", "free Apollo.io alternative",
    // SDR
    "SDR automation tool", "SDR software", "email outreach software",
  ],
  authors: [{ name: "Salevrix AI", url: "https://salevrix.ai" }],
  creator: "Salevrix AI",
  publisher: "Salevrix AI",
  category: "Sales Software",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://salevrix.ai",
    siteName: "Salevrix AI",
    title: "Salevrix AI — Apollo.io Charges $119/User. We Start at $0.",
    description: "10 AI sales agents. 15 real automations. 100% data accuracy. The #1 Apollo.io alternative that actually works. Start free today.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Salevrix AI — Apollo.io Alternative" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@salevrixai",
    title: "Salevrix AI — #1 Apollo.io Alternative | Start Free",
    description: "10 AI agents. 15 automations. 100% data accuracy. Apollo charges $119/user. We start at $0.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
  alternates: { canonical: "https://salevrix.ai" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5,
  themeColor: "#050505",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Salevrix AI",
  "url": "https://salevrix.ai",
  "logo": "https://salevrix.ai/icon-512.png",
  "description": "AI-powered sales platform — the #1 Apollo.io alternative with 10 AI agents and 15 automations.",
  "foundingDate": "2024",
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "url": "https://salevrix.ai/auth/signup" }
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Salevrix AI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://salevrix.ai",
  "description": "The #1 Apollo.io alternative. 10 AI sales agents, 15 automations, 100% data accuracy. Replace Apollo.io and 3x your reply rates.",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "199",
    "priceCurrency": "USD",
    "offerCount": "4",
    "offers": [
      { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Starter", "price": "29", "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Pro", "price": "79", "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Enterprise", "price": "199", "priceCurrency": "USD" },
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "247",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "10 Specialized AI Sales Agents",
    "15 Real Sales Automations",
    "Cold Email Automation",
    "LinkedIn Automation",
    "AI Prospect Scoring",
    "Deal Intelligence",
    "Revenue Forecasting",
    "Objection Handling AI",
    "Meeting Summarizer AI",
    "Competitor Intelligence AI"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Salevrix AI the best Apollo.io alternative?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Salevrix AI offers 10 specialized AI agents vs Apollo's 1 basic assistant, 15 real automations vs manual task reminders, 100% data accuracy vs Apollo's ~65%, and starts at $0 vs Apollo's $49-$119 per user per month." }
    },
    {
      "@type": "Question",
      "name": "How much does Salevrix AI cost compared to Apollo.io?",
      "acceptedAnswer": { "@type": "Answer", "text": "Salevrix AI starts free forever. Paid plans start at $29/month for your entire team — not per user. Apollo.io charges $49-$119 per user per month. A team of 5 on Apollo = $7,140/year. Same team on Salevrix Pro = $948/year." }
    },
    {
      "@type": "Question",
      "name": "Can I import my Apollo.io contacts into Salevrix AI?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Export your Apollo.io contacts as CSV and import them into Salevrix AI in one click. Full setup takes under 5 minutes." }
    },
    {
      "@type": "Question",
      "name": "What AI agents does Salevrix AI have?",
      "acceptedAnswer": { "@type": "Answer", "text": "Salevrix AI has 10 specialized agents: Email Writer, Subject Line Tester, Ice Breaker, Objection Handler, Prospect Analyzer, Deal Analyzer, Meeting Summarizer, Cold Call Writer, LinkedIn Writer, and Revenue Forecaster." }
    },
    {
      "@type": "Question",
      "name": "Does Salevrix AI work for cold email outreach?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Salevrix AI automates cold email outreach with AI-written hyper-personalized emails, achieving 28%+ reply rates vs the industry average of 3-5%. The AI references LinkedIn posts, funding rounds, and company news in every email." }
    },
    {
      "@type": "Question",
      "name": "Is Salevrix AI better than ZoomInfo?",
      "acceptedAnswer": { "@type": "Answer", "text": "For AI-powered outreach automation, yes. ZoomInfo is primarily a contact database. Salevrix AI combines prospect data with 10 AI agents that write emails, handle objections, score deals, and book meetings automatically." }
    }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://salevrix.ai" },
    { "@type": "ListItem", "position": 2, "name": "vs Apollo.io", "item": "https://salevrix.ai/vs-apollo" },
    { "@type": "ListItem", "position": 3, "name": "Pricing", "item": "https://salevrix.ai/dashboard/pricing" },
    { "@type": "ListItem", "position": 4, "name": "Sign Up Free", "item": "https://salevrix.ai/auth/signup" }
  ]
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/>
      </head>
      <body>{children}</body>
    </html>
  );
}
