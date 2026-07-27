"use client";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Salevrix AI Blog — Sales Automation & Cold Email Tips 2026",
  description: "Expert guides on cold email automation, AI sales tools, Apollo.io alternatives, and B2B outreach strategies that actually work in 2026.",
  alternates: { canonical: "https://salevrix-ai-black.vercel.app/blog" },
};

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const POSTS = [
  {
    slug:"apollo-io-alternative",
    title:"7 Best Apollo.io Alternatives in 2026 (Honest Review)",
    desc:"Apollo.io charges $119/user and has 65% data accuracy. We tested 7 alternatives and ranked them by reply rates, features, and price.",
    category:"Comparison",
    readTime:"8 min",
    date:"July 2026",
    color:"#C8FF00",
  },
  {
    slug:"cold-email-automation-guide",
    title:"Cold Email Automation: The Complete 2026 Guide",
    desc:"How to automate cold email outreach and hit 28%+ reply rates. The exact framework top SDR teams use — with templates and tools.",
    category:"Guide",
    readTime:"12 min",
    date:"July 2026",
    color:"#818cf8",
  },
  {
    slug:"ai-sdr-software",
    title:"AI SDR Software: How to Replace Your SDR Team With AI in 2026",
    desc:"AI SDRs are booking more meetings than human SDRs at 10% of the cost. Here's exactly how companies are doing it — and the tools they use.",
    category:"AI Sales",
    readTime:"10 min",
    date:"July 2026",
    color:"#34d399",
  },
  {
    slug:"cold-email-reply-rates",
    title:"How to Get 28%+ Cold Email Reply Rates in 2026",
    desc:"The average cold email reply rate is 3%. Top performers hit 28%+. Here's the exact difference — with real email examples and data.",
    category:"Cold Email",
    readTime:"9 min",
    date:"July 2026",
    color:"#f59e0b",
  },
  {
    slug:"zoominfo-alternative",
    title:"5 ZoomInfo Alternatives That Are Actually Better in 2026",
    desc:"ZoomInfo costs $15,000+/year with outdated data. We compared 5 alternatives on accuracy, AI features, and price.",
    category:"Comparison",
    readTime:"7 min",
    date:"July 2026",
    color:"#f472b6",
  },
  {
    slug:"b2b-sales-automation",
    title:"B2B Sales Automation: 15 Workflows That Actually Book Meetings",
    desc:"The 15 sales automations every B2B team needs in 2026. From hot lead alerts to deal risk monitors — with exact setup instructions.",
    category:"Automation",
    readTime:"11 min",
    date:"July 2026",
    color:"#60a5fa",
  },
];

export default function BlogPage() {
  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>

      {/* Nav */}
      <nav style={{ position:"sticky",top:0,zIndex:100,background:"rgba(5,5,5,0.95)",borderBottom:`1px solid ${S.lineSoft}`,padding:"14px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(12px)" }}>
        <Link href="/" style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:S.accent,display:"grid",placeItems:"center" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:16,color:S.text }}>Salevrix AI</span>
        </Link>
        <div style={{ display:"flex",gap:20,alignItems:"center" }}>
          <Link href="/vs-apollo" style={{ fontSize:13,color:S.muted }}>vs Apollo</Link>
          <Link href="/dashboard/pricing" style={{ fontSize:13,color:S.muted }}>Pricing</Link>
          <Link href="/auth/signup" style={{ padding:"8px 18px",borderRadius:9,background:S.accent,color:"#050505",fontSize:13,fontWeight:700 }}>Start Free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding:"60px 48px 40px",maxWidth:1000,margin:"0 auto",textAlign:"center" }}>
        <div style={{ fontSize:12,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:".1em",marginBottom:14 }}>Salevrix AI Blog</div>
        <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:42,fontWeight:900,color:S.text,letterSpacing:"-0.04em",marginBottom:14 }}>
          Sales Automation & AI Outreach
        </h1>
        <p style={{ fontSize:16,color:S.muted,maxWidth:520,margin:"0 auto" }}>
          Guides, comparisons, and strategies for B2B sales teams replacing Apollo.io with AI.
        </p>
      </div>

      {/* Posts Grid */}
      <div style={{ maxWidth:1000,margin:"0 auto",padding:"0 48px 80px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
        {POSTS.map(post=>(
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:16,padding:24,height:"100%",transition:"all 0.2s",cursor:"pointer" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=`${post.color}33`; (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                <span style={{ fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,background:`${post.color}15`,color:post.color,border:`1px solid ${post.color}30` }}>{post.category}</span>
                <span style={{ fontSize:11,color:S.faint }}>{post.readTime} read</span>
              </div>
              <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:17,fontWeight:800,color:S.text,lineHeight:1.35,marginBottom:10,letterSpacing:"-0.02em" }}>{post.title}</h2>
              <p style={{ fontSize:13,color:S.muted,lineHeight:1.65,marginBottom:16 }}>{post.desc}</p>
              <div style={{ fontSize:11,color:S.faint }}>{post.date}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background:S.panel,borderTop:`1px solid ${S.lineSoft}`,padding:"48px",textAlign:"center" }}>
        <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,marginBottom:10 }}>Ready to replace Apollo.io?</h2>
        <p style={{ fontSize:14,color:S.muted,marginBottom:24 }}>Start free. 10 AI agents. 15 automations. No credit card.</p>
        <Link href="/auth/signup" style={{ padding:"14px 32px",borderRadius:12,background:S.accent,color:"#050505",fontSize:15,fontWeight:800,fontFamily:"Syne,sans-serif" }}>
          Start Free Today →
        </Link>
      </div>
    </div>
  );
}
