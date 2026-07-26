import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salevrix AI vs Apollo.io — Full Comparison 2026 | Best Apollo.io Alternative",
  description: "Apollo.io charges $49-$119/user/month with 65% data accuracy. Salevrix AI starts at $0 with 10 AI agents, 100% accuracy, and 3x reply rates. See why 500+ teams switched.",
  keywords: [
    "Apollo.io alternative 2026", "Apollo.io vs Salevrix AI", "better than Apollo.io",
    "Apollo.io competitor", "switch from Apollo.io", "Apollo.io replacement",
    "Apollo.io too expensive", "Apollo.io data accuracy problems",
    "sales platform comparison 2026", "cold email software comparison",
    "best Apollo.io alternative free", "Apollo.io pricing",
  ],
  openGraph: {
    title: "Salevrix AI vs Apollo.io — Apollo Charges $119/User. We Start at $0.",
    description: "10 AI agents vs 1. 100% accuracy vs 65%. $0 vs $119/user. 500+ teams already switched. See the full comparison.",
    url: "https://salevrix.ai/vs-apollo",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Salevrix AI vs Apollo.io Comparison" }],
  },
  alternates: { canonical: "https://salevrix.ai/vs-apollo" },
};

export default function VsApolloLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
