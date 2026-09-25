import Link from "next/link";

export const metadata = {
  title: "Blog — Salevrix AI | Sales Automation & Cold Email Tips",
  description: "Expert guides on cold email automation, AI sales tools, Apollo.io alternatives, and B2B outreach strategies that actually work in 2026.",
  alternates: { canonical: "https://salevrix-ai-black.vercel.app/blog" },
};

const POSTS = [
  {
    slug: "apollo-io-alternative",
    title: "The #1 Apollo.io Alternative in 2026 (With 35% Reply Rates)",
    excerpt: "Apollo gives you a database. Salevrix gives you a complete AI sales team. Here's exactly why 2,000+ sales teams are switching — with real numbers.",
    category: "Comparison",
    readTime: "8 min read",
    date: "Sep 15, 2026",
    featured: true,
    color: "#C8FF00",
  },
  {
    slug: "cold-email-reply-rates",
    title: "Why Your Cold Email Reply Rate Is Under 5% (And How to Fix It)",
    excerpt: "The average cold email gets a 3.43% reply rate. We analyzed 50,000 emails and found the 7 mistakes killing your outreach — and the AI-powered fixes.",
    category: "Cold Email",
    readTime: "6 min read",
    date: "Sep 10, 2026",
    featured: false,
    color: "#818cf8",
  },
  {
    slug: "ai-sdr-vs-human-sdr",
    title: "AI SDR vs Human SDR: The 2026 Honest Comparison",
    excerpt: "Can an AI really replace your SDR team? We ran a 90-day experiment with 10 reps and one AI agent. The results will surprise you.",
    category: "AI Sales",
    readTime: "10 min read",
    date: "Sep 5, 2026",
    featured: false,
    color: "#34d399",
  },
  {
    slug: "b2b-sales-automation-guide",
    title: "The Complete B2B Sales Automation Guide for 2026",
    excerpt: "From prospecting to closing — how to automate your entire sales process without losing the human touch. Step-by-step playbook.",
    category: "Automation",
    readTime: "12 min read",
    date: "Aug 28, 2026",
    featured: false,
    color: "#f97316",
  },
  {
    slug: "outreach-vs-salevrix",
    title: "Outreach.io vs Salevrix AI: Which One Wins in 2026?",
    excerpt: "Outreach costs $1,200/user/year and still requires manual work. Salevrix costs $79/month for your whole team and automates everything. Here's the breakdown.",
    category: "Comparison",
    readTime: "7 min read",
    date: "Aug 20, 2026",
    featured: false,
    color: "#f472b6",
  },
  {
    slug: "cold-email-subject-lines",
    title: "47 Cold Email Subject Lines That Get 40%+ Open Rates (2026)",
    excerpt: "We A/B tested 200+ subject lines across 50,000 emails. These 47 consistently outperform. Copy them, adapt them, win more replies.",
    category: "Cold Email",
    readTime: "5 min read",
    date: "Aug 12, 2026",
    featured: false,
    color: "#60a5fa",
  },
];

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:#050505; --panel:#0d1018; --accent:#C8FF00; --text:#f4f5f7; --muted:#9598a3; --faint:#3d4455; --line:rgba(255,255,255,0.06); }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
        a { text-decoration: none; color: inherit; }

        nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 6%; height: 64px; background: rgba(5,5,5,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid var(--line); }
        .logo { display: flex; align-items: center; gap: 10px; font-family: 'Syne',sans-serif; font-weight: 800; font-size: 16px; }
        .mark { width: 32px; height: 32px; background: var(--accent); border-radius: 8px; display: grid; place-items: center; }
        .nav-links { display: flex; gap: 28px; }
        .nav-links a { font-size: 14px; color: var(--muted); transition: color .2s; }
        .nav-links a:hover, .nav-links a.active { color: var(--text); }
        .btn { display: inline-flex; align-items: center; padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; font-family: inherit; }
        .btn-primary { background: var(--accent); color: #050505; }

        .wrap { max-width: 1100px; margin: 0 auto; padding: 0 6%; }
        .hero { padding: 80px 0 60px; text-align: center; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 999px; background: rgba(200,255,0,0.08); border: 1px solid rgba(200,255,0,0.2); font-size: 11px; font-weight: 800; color: var(--accent); letter-spacing: .06em; text-transform: uppercase; margin-bottom: 20px; }
        .hero h1 { font-family: 'Syne',sans-serif; font-size: clamp(32px,5vw,56px); font-weight: 900; letter-spacing: -.03em; margin-bottom: 14px; }
        .hero p { font-size: 17px; color: var(--muted); max-width: 520px; margin: 0 auto; line-height: 1.7; }

        /* Featured */
        .featured-card { background: var(--panel); border: 1px solid rgba(200,255,0,0.2); border-radius: 20px; padding: 40px; margin-bottom: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; transition: all .3s; }
        .featured-card:hover { border-color: rgba(200,255,0,0.4); transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        .feat-label { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; background: rgba(200,255,0,0.1); border: 1px solid rgba(200,255,0,0.25); font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 16px; }
        .feat-title { font-family: 'Syne',sans-serif; font-size: clamp(22px,3vw,32px); font-weight: 900; letter-spacing: -.02em; margin-bottom: 14px; line-height: 1.2; }
        .feat-excerpt { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 24px; }
        .feat-meta { display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--faint); }
        .feat-visual { background: rgba(200,255,0,0.04); border: 1px solid rgba(200,255,0,0.1); border-radius: 16px; height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
        .feat-stat { text-align: center; }
        .feat-stat-val { font-family: 'Syne',sans-serif; font-size: 48px; font-weight: 900; color: var(--accent); line-height: 1; }
        .feat-stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

        /* Posts grid */
        .posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 80px; }
        .post-card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 28px; transition: all .25s; display: flex; flex-direction: column; }
        .post-card:hover { border-color: rgba(200,255,0,0.2); transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.3); }
        .post-cat { font-size: 10px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; margin-bottom: 14px; display: inline-block; }
        .post-title { font-family: 'Syne',sans-serif; font-size: 17px; font-weight: 800; letter-spacing: -.02em; margin-bottom: 10px; line-height: 1.3; flex: 1; }
        .post-excerpt { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 18px; }
        .post-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--faint); border-top: 1px solid var(--line); padding-top: 14px; margin-top: auto; }
        .read-more { color: var(--accent); font-weight: 700; font-size: 12px; }

        /* SEO CTA */
        .seo-cta { background: rgba(200,255,0,0.05); border: 1px solid rgba(200,255,0,0.12); border-radius: 20px; padding: 60px 40px; text-align: center; margin-bottom: 80px; }
        .seo-cta h2 { font-family: 'Syne',sans-serif; font-size: clamp(24px,3vw,40px); font-weight: 900; letter-spacing: -.03em; margin-bottom: 12px; }
        .seo-cta p { font-size: 15px; color: var(--muted); margin-bottom: 28px; }

        footer { border-top: 1px solid var(--line); padding: 28px 0; }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .foot-links { display: flex; gap: 20px; }
        .foot-links a { font-size: 13px; color: var(--muted); }
        .foot-links a:hover { color: var(--text); }

        @media(max-width: 768px) {
          .featured-card { grid-template-columns: 1fr; }
          .feat-visual { display: none; }
          .posts-grid { grid-template-columns: 1fr; }
          .nav-links { display: none; }
        }
      `}} />

      <nav>
        <Link href="/" className="logo">
          <div className="mark">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Salevrix AI
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/security">Security</Link>
          <Link href="/blog" className="active" style={{color:'var(--text)'}}>Blog</Link>
        </div>
        <Link href="/auth/signup" className="btn btn-primary">Start Free →</Link>
      </nav>

      {/* Hero */}
      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Sales Intelligence Blog</div>
          <h1>Close more deals.<br/>Learn how.</h1>
          <p>Guides, comparisons, and playbooks from the team building the #1 Apollo.io alternative.</p>
        </div>

        {/* Featured Post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`}>
            <div className="featured-card">
              <div>
                <div className="feat-label">⭐ Featured Post</div>
                <h2 className="feat-title">{featured.title}</h2>
                <p className="feat-excerpt">{featured.excerpt}</p>
                <div className="feat-meta">
                  <span style={{background:`${featured.color}18`,color:featured.color,padding:'3px 10px',borderRadius:999,fontSize:10,fontWeight:800}}>{featured.category}</span>
                  <span>{featured.date}</span>
                  <span>{featured.readTime}</span>
                  <span style={{color:'var(--accent)',fontWeight:700}}>Read article →</span>
                </div>
              </div>
              <div className="feat-visual">
                {[
                  {v:'3.43%→35%',l:'Reply Rate'},
                  {v:'$150K→$948',l:'Annual Cost'},
                  {v:'11',l:'AI Agents'},
                ].map((s,i) => (
                  <div className="feat-stat" key={i}>
                    <div className="feat-stat-val" style={{fontSize:i===2?48:32}}>{s.v}</div>
                    <div className="feat-stat-label">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        )}

        {/* Posts Grid */}
        <div className="posts-grid">
          {rest.map(post => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <div className="post-card">
                <div className="post-cat" style={{background:`${post.color}15`,color:post.color}}>{post.category}</div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <span>{post.date} · {post.readTime}</span>
                  <span className="read-more">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* SEO CTA */}
        <div className="seo-cta">
          <h2>Stop reading. Start closing.</h2>
          <p>14-day free trial. No credit card. No sales call. See why teams are switching from Apollo.</p>
          <Link href="/auth/signup" className="btn btn-primary" style={{fontSize:15,padding:'13px 32px'}}>
            ⚡ Start Free — It Takes 5 Minutes
          </Link>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="footer-inner">
            <div className="logo">
              <div className="mark" style={{width:26,height:26}}>
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Salevrix AI
            </div>
            <div className="foot-links">
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/security">Security</Link>
              <Link href="/#pricing">Pricing</Link>
            </div>
            <p style={{fontSize:12,color:'var(--faint)'}}>© 2026 Salevrix AI</p>
          </div>
        </div>
      </footer>
    </>
  );
}
