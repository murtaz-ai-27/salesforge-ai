import Script from "next/script";

export const metadata = {
  title: "Security — Salevrix AI",
  description: "Enterprise-grade security. 12 layers of protection including AES-256 encryption, CSP, CSRF, RLS, and zero-trust architecture.",
};

export default function SecurityPage() {
  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js" strategy="afterInteractive" />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:#050505; --panel:#0d1018; --panel2:#0a0d14;
          --accent:#C8FF00; --text:#f4f5f7; --muted:#9598a3; --faint:#3d4455;
          --green:#34d399; --red:#ef4444; --blue:#60a5fa; --purple:#a78bfa; --orange:#f97316;
          --line:rgba(255,255,255,0.06);
        }
        html, body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; overflow-x: hidden; }

        /* ── CANVAS BG ── */
        #sec-canvas { position: fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none; opacity:0.4; }

        /* ── NAV ── */
        nav { position: fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 6%; height:68px; background:rgba(5,5,5,0.85); backdrop-filter:blur(20px); border-bottom:1px solid var(--line); }
        .logo { display:flex; align-items:center; gap:10px; font-family:'Syne',sans-serif; font-weight:800; font-size:17px; text-decoration:none; color:var(--text); }
        .mark { width:34px; height:34px; background:var(--accent); border-radius:9px; display:grid; place-items:center; box-shadow:0 0 20px rgba(200,255,0,0.3); }
        .nav-links { display:flex; gap:28px; }
        .nav-links a { font-size:14px; color:var(--muted); text-decoration:none; transition:color .2s; }
        .nav-links a:hover { color:var(--text); }
        .nav-links a.active { color:var(--accent); font-weight:700; }
        .btn { display:inline-flex; align-items:center; gap:8px; padding:10px 22px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; border:none; font-family:inherit; text-decoration:none; transition:all .2s; }
        .btn-primary { background:var(--accent); color:#050505; }
        .btn-primary:hover { background:#b8ef00; transform:translateY(-2px); box-shadow:0 8px 24px rgba(200,255,0,0.25); }

        /* ── HERO ── */
        .hero { position:relative; z-index:1; min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center; padding:120px 6% 80px; }
        .hero-inner { max-width:820px; }
        .score-ring { position:relative; width:160px; height:160px; margin:0 auto 40px; }
        .score-ring svg { width:100%; height:100%; transform:rotate(-90deg); }
        .score-ring .track { fill:none; stroke:rgba(200,255,0,0.1); stroke-width:8; }
        .score-ring .fill { fill:none; stroke:var(--accent); stroke-width:8; stroke-linecap:round; stroke-dasharray:408; stroke-dashoffset:25; filter:drop-shadow(0 0 12px rgba(200,255,0,0.6)); transition:stroke-dashoffset 2s ease; }
        .score-num { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .score-num span { font-family:'Syne',sans-serif; font-size:44px; font-weight:900; color:var(--accent); line-height:1; }
        .score-num small { font-size:12px; color:var(--muted); }
        .eyebrow { display:inline-flex; align-items:center; gap:8px; padding:6px 16px; border-radius:999px; background:rgba(200,255,0,0.08); border:1px solid rgba(200,255,0,0.2); font-size:11px; font-weight:800; color:var(--accent); letter-spacing:.08em; text-transform:uppercase; margin-bottom:24px; }
        .pulse-dot { width:7px; height:7px; border-radius:50%; background:var(--accent); box-shadow:0 0 10px var(--accent); animation:pulse 2s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.8)} }
        .hero h1 { font-family:'Syne',sans-serif; font-size:clamp(40px,6vw,72px); font-weight:900; line-height:1.08; letter-spacing:-.03em; margin-bottom:20px; }
        .hero h1 .accent { color:var(--accent); }
        .hero p { font-size:18px; color:var(--muted); line-height:1.7; max-width:600px; margin:0 auto 40px; }
        .hero-stats { display:flex; justify-content:center; gap:32px; flex-wrap:wrap; }
        .hstat { text-align:center; }
        .hstat-val { font-family:'Syne',sans-serif; font-size:28px; font-weight:900; color:var(--accent); }
        .hstat-label { font-size:12px; color:var(--muted); margin-top:4px; }

        /* ── SECTIONS ── */
        .wrap { max-width:1100px; margin:0 auto; padding:0 6%; position:relative; z-index:1; }
        section { padding:100px 0; }
        .sec-head { text-align:center; margin-bottom:60px; }
        .sec-head h2 { font-family:'Syne',sans-serif; font-size:clamp(30px,4vw,48px); font-weight:900; letter-spacing:-.03em; margin-bottom:14px; }
        .sec-head p { font-size:16px; color:var(--muted); max-width:560px; margin:0 auto; line-height:1.7; }

        /* ── 12 LAYERS ── */
        .layers-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .layer-card { background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:28px; transition:all .3s; cursor:default; opacity:0; transform:translateY(30px); }
        .layer-card.visible { opacity:1; transform:translateY(0); }
        .layer-card:hover { border-color:rgba(200,255,0,0.3); transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(200,255,0,0.05); }
        .layer-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .layer-icon { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; font-size:22px; }
        .layer-num { font-size:10px; font-weight:800; color:var(--faint); letter-spacing:.1em; }
        .layer-card h3 { font-size:15px; font-weight:700; margin-bottom:8px; }
        .layer-card p { font-size:13px; color:var(--muted); line-height:1.6; }
        .layer-badge { display:inline-flex; align-items:center; gap:5px; margin-top:14px; padding:3px 10px; border-radius:999px; font-size:10px; font-weight:800; background:rgba(52,211,153,0.1); color:var(--green); border:1px solid rgba(52,211,153,0.2); }
        .layer-badge::before { content:''; width:5px; height:5px; border-radius:50%; background:var(--green); animation:pulse 2s infinite; }

        /* ── ENCRYPTION VISUAL ── */
        .enc-visual { background:var(--panel2); border:1px solid var(--line); border-radius:20px; padding:40px; margin-bottom:24px; font-family:monospace; font-size:13px; line-height:1.8; position:relative; overflow:hidden; }
        .enc-visual::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--accent),transparent); animation:scanLine 3s linear infinite; }
        @keyframes scanLine { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .enc-line { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
        .enc-key { color:var(--accent); }
        .enc-val { color:var(--green); }
        .enc-comment { color:var(--faint); }
        .enc-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .enc-card { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:24px; }
        .enc-card h3 { font-size:15px; font-weight:700; margin-bottom:8px; }
        .enc-card p { font-size:13px; color:var(--muted); line-height:1.6; }

        /* ── COMPARISON TABLE ── */
        .cmp-table { width:100%; border-collapse:collapse; background:var(--panel); border-radius:16px; overflow:hidden; border:1px solid var(--line); }
        .cmp-table th { padding:16px 20px; font-size:12px; font-weight:800; letter-spacing:.05em; text-transform:uppercase; background:rgba(255,255,255,0.03); }
        .cmp-table td { padding:14px 20px; font-size:13px; color:var(--muted); border-top:1px solid var(--line); }
        .cmp-table tr:hover td { background:rgba(255,255,255,0.02); }
        .col-us { color:var(--green) !important; font-weight:700; }
        .col-them-good { color:var(--muted) !important; }
        .col-them-bad { color:var(--orange) !important; }
        .col-feat { color:var(--text) !important; font-weight:600; }

        /* ── COMPLIANCE ── */
        .compliance-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .comp-card { background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:28px; transition:all .3s; }
        .comp-card:hover { transform:translateY(-4px); }
        .comp-icon { font-size:40px; margin-bottom:16px; }
        .comp-card h3 { font-size:18px; font-weight:800; margin-bottom:8px; font-family:'Syne',sans-serif; }
        .comp-card p { font-size:13px; color:var(--muted); line-height:1.6; margin-bottom:16px; }
        .comp-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:999px; font-size:11px; font-weight:800; }

        /* ── CTA ── */
        .cta-section { background:radial-gradient(ellipse at center,rgba(200,255,0,0.06) 0%,transparent 70%); border:1px solid rgba(200,255,0,0.1); border-radius:24px; padding:80px 40px; text-align:center; }
        .cta-section h2 { font-family:'Syne',sans-serif; font-size:clamp(28px,4vw,48px); font-weight:900; letter-spacing:-.03em; margin-bottom:16px; }
        .cta-section p { font-size:16px; color:var(--muted); margin-bottom:32px; }

        /* ── DISCLOSURE ── */
        .disclosure { background:var(--panel); border:1px solid var(--line); border-radius:20px; padding:40px; max-width:560px; margin:0 auto; text-align:center; }
        .disclosure .disc-icon { font-size:48px; margin-bottom:20px; }
        .disclosure h3 { font-size:20px; font-weight:800; margin-bottom:12px; font-family:'Syne',sans-serif; }
        .disclosure p { font-size:14px; color:var(--muted); line-height:1.7; margin-bottom:24px; }

        /* ── FOOTER ── */
        footer { border-top:1px solid var(--line); padding:32px 0; }
        .footer-inner { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; }
        .foot-links { display:flex; gap:24px; }
        .foot-links a { font-size:13px; color:var(--muted); text-decoration:none; transition:color .2s; }
        .foot-links a:hover { color:var(--text); }

        @media(max-width:768px) {
          .layers-grid { grid-template-columns:1fr; }
          .enc-grid { grid-template-columns:1fr; }
          .compliance-grid { grid-template-columns:1fr; }
          .nav-links { display:none; }
          .hero-stats { gap:20px; }
        }
      `}} />

      {/* Canvas BG */}
      <canvas id="sec-canvas" />

      {/* NAV */}
      <nav>
        <a href="/" className="logo">
          <div className="mark">
            <svg viewBox="0 0 16 16" fill="none" width="18" height="18">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Salevrix AI
        </a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/#features">Features</a>
          <a href="/#agents">AI Agents</a>
          <a href="/#pricing">Pricing</a>
          <a href="/security" className="active">Security</a>
        </div>
        <a href="/auth/signup" className="btn btn-primary">Start Free →</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="score-ring">
            <svg viewBox="0 0 140 140">
              <circle className="track" cx="70" cy="70" r="65"/>
              <circle className="fill" cx="70" cy="70" r="65"/>
            </svg>
            <div className="score-num">
              <span>94</span>
              <small>/100</small>
            </div>
          </div>
          <div className="eyebrow"><div className="pulse-dot"/>Security Score 2026</div>
          <h1>Your data is <span className="accent">protected.</span><br/>We take this seriously.</h1>
          <p>Salevrix AI implements 12 layers of enterprise-grade security — the same standards used by Apollo.io, Linear, and Notion.</p>
          <div className="hero-stats">
            {[
              {v:'AES-256',l:'Encryption'},
              {v:'12',l:'Security Layers'},
              {v:'0',l:'Data Breaches'},
              {v:'99.9%',l:'Uptime SLA'},
            ].map((s,i) => (
              <div className="hstat" key={i}>
                <div className="hstat-val">{s.v}</div>
                <div className="hstat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 LAYERS */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow"><div className="pulse-dot"/>Defense in Depth</div>
            <h2>12 Security Layers</h2>
            <p>Every request validated. Every user verified. Every input sanitized. Zero trust architecture.</p>
          </div>
          <div className="layers-grid" id="layers-grid">
            {[
              {n:'01',icon:'🛡️',bg:'rgba(200,255,0,0.08)',title:'Content Security Policy',desc:'Blocks XSS, clickjacking, and data injection. Whitelist-only script execution from trusted sources.'},
              {n:'02',icon:'⚡',bg:'rgba(96,165,250,0.1)',title:'Rate Limiting — 3 Layers',desc:'Global 100/min, per-IP 200/min, per-user 2–50/min. Sliding window algorithm prevents burst attacks.'},
              {n:'03',icon:'🔐',bg:'rgba(167,139,250,0.1)',title:'CSRF Protection',desc:'HMAC-SHA256 tokens with 1-hour expiry. Constant-time comparison prevents timing attacks.'},
              {n:'04',icon:'✅',bg:'rgba(52,211,153,0.08)',title:'Input Validation (Zod)',desc:'Type-safe schema validation on every API route. Malformed requests rejected before processing.'},
              {n:'05',icon:'🗄️',bg:'rgba(249,115,22,0.08)',title:'SQL Injection Prevention',desc:'Parameterized queries throughout. No raw SQL ever executed. ORM-level protection on all operations.'},
              {n:'06',icon:'🔒',bg:'rgba(200,255,0,0.08)',title:'Row Level Security',desc:'Database-level RLS policies — users can only access their own data. Enforced at Postgres level.'},
              {n:'07',icon:'📋',bg:'rgba(96,165,250,0.1)',title:'Security Headers (8)',desc:'X-Frame-Options, X-Content-Type, HSTS, Referrer-Policy, Permissions-Policy on every response.'},
              {n:'08',icon:'🤖',bg:'rgba(236,72,153,0.08)',title:'Prompt Injection Filter',desc:'AI inputs sanitized — removes jailbreak attempts and "ignore instructions" patterns before processing.'},
              {n:'09',icon:'📝',bg:'rgba(167,139,250,0.1)',title:'Security Audit Log',desc:'Every security event logged: login, logout, export, settings change, rate limit hit. 90-day retention.'},
              {n:'10',icon:'🔑',bg:'rgba(200,255,0,0.08)',title:'AES-256-GCM Encryption',desc:'Sensitive data encrypted at rest. Keys in environment variables — never in code or database.'},
              {n:'11',icon:'🌐',bg:'rgba(52,211,153,0.08)',title:'Session Management',desc:'30-day sessions with instant revocation. Suspicious login detection and impossible travel alerts.'},
              {n:'12',icon:'⚙️',bg:'rgba(249,115,22,0.08)',title:'Env Var Validation',desc:'Application validates all environment variables at startup. Fails fast if misconfigured.'},
            ].map((l,i) => (
              <div className="layer-card" id={`layer-${i}`} key={i}>
                <div className="layer-top">
                  <div className="layer-icon" style={{background:l.bg}}>{l.icon}</div>
                  <div className="layer-num">LAYER {l.n}</div>
                </div>
                <h3>{l.title}</h3>
                <p>{l.desc}</p>
                <div className="layer-badge">Active</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENCRYPTION SECTION */}
      <section style={{background:'var(--panel2)'}}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow"><div className="pulse-dot"/>Encryption</div>
            <h2>Military-Grade Data Protection</h2>
            <p>Your data is encrypted in transit and at rest using AES-256-GCM — the same standard used by banks.</p>
          </div>
          <div className="enc-visual">
            {[
              {k:'algorithm',v:'"AES-256-GCM"',c:'// Military-grade encryption'},
              {k:'keySize',v:'256',c:'// bits'},
              {k:'ivSize',v:'128',c:'// bits — random per operation'},
              {k:'authTag',v:'true',c:'// Authenticated encryption'},
              {k:'keyStorage',v:'"env_vars_only"',c:'// Never in code or DB'},
              {k:'transit',v:'"TLS 1.3"',c:'// All connections HTTPS'},
              {k:'hsts',v:'"max-age=31536000"',c:'// Force HTTPS 1 year'},
            ].map((l,i) => (
              <div className="enc-line" key={i}>
                <span className="enc-key">{l.k}:</span>
                <span className="enc-val">{l.v}</span>
                <span className="enc-comment">{l.c}</span>
              </div>
            ))}
          </div>
          <div className="enc-grid">
            {[
              {t:'At Rest',icon:'💾',d:'All sensitive data encrypted using AES-256-GCM before database storage. Keys in env vars — never committed to code.'},
              {t:'In Transit',icon:'🔒',d:'All connections via HTTPS/TLS 1.3. HSTS enforced. No HTTP accepted in production. Certificate pinning on critical endpoints.'},
              {t:'Authentication',icon:'🎫',d:'Firebase OAuth2 — no passwords stored. Google and GitHub login only. JWT tokens with short expiry and refresh rotation.'},
              {t:'Database',icon:'🗄️',d:'Supabase RLS enforced at Postgres level. Service role server-only. Anon key has zero write access. All queries parameterized.'},
            ].map((e,i) => (
              <div className="enc-card" key={i}>
                <h3>{e.icon} {e.t}</h3>
                <p>{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS APOLLO */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow"><div className="pulse-dot"/>Comparison</div>
            <h2>Industry Standard Comparison</h2>
            <p>How Salevrix stacks up against Apollo.io and enterprise SaaS security standards.</p>
          </div>
          <table className="cmp-table">
            <thead>
              <tr>
                <th style={{textAlign:'left',color:'var(--muted)'}}>Security Feature</th>
                <th style={{color:'var(--accent)'}}>✓ Salevrix AI</th>
                <th style={{color:'var(--muted)'}}>Apollo.io</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Rate Limiting','3-layer sliding window algorithm','✓ Basic rate limiting'],
                ['CSRF Protection','HMAC-SHA256 + timing attack prevention','✓ Standard CSRF tokens'],
                ['Input Validation','Zod type-safe schemas on all routes','✓ Server-side validation'],
                ['Database RLS','Supabase Postgres-level policies','✓ Row level security'],
                ['Encryption at Rest','AES-256-GCM authenticated encryption','✓ AES-256 encryption'],
                ['Security Audit Log','Full event log + 90-day retention','✓ Enterprise audit trail'],
                ['Session Management','30-day + revocation + travel detection','✓ Session management'],
                ['Security Headers','8 headers including full CSP','✓ Standard headers'],
                ['AI Input Security','Prompt injection filter','✗ Not applicable'],
                ['Uptime SLA','99.9% Vercel Edge Network','✓ 99.9% SLA'],
              ].map(([f,u,t],i) => (
                <tr key={i}>
                  <td className="col-feat">{f}</td>
                  <td className="col-us">✓ {u}</td>
                  <td className={t.startsWith('✓') ? 'col-them-good' : 'col-them-bad'}>{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section style={{background:'var(--panel2)'}}>
        <div className="wrap">
          <div className="sec-head">
            <div className="eyebrow"><div className="pulse-dot"/>Compliance</div>
            <h2>Compliance & Certifications</h2>
            <p>Current status and roadmap for formal security certifications.</p>
          </div>
          <div className="compliance-grid">
            {[
              {icon:'🇪🇺',name:'GDPR',badge:'✓ Compliant',badgeColor:'var(--green)',badgeBg:'rgba(52,211,153,0.1)',border:'rgba(52,211,153,0.2)',desc:'Full GDPR compliance. 90-day log auto-deletion. Data processing agreement available on request. EU data residency supported.'},
              {icon:'📋',name:'SOC 2 Type II',badge:'⏳ Q1 2027',badgeColor:'var(--orange)',badgeBg:'rgba(249,115,22,0.1)',border:'rgba(249,115,22,0.2)',desc:'Independent third-party security audit scheduled. Controls documentation in progress. Report available to enterprise customers on request.'},
              {icon:'🌍',name:'ISO 27001',badge:'📅 Q2 2027',badgeColor:'var(--blue)',badgeBg:'rgba(96,165,250,0.1)',border:'rgba(96,165,250,0.2)',desc:'International information security management certification planned post SOC 2. Framework implementation underway.'},
            ].map((c,i) => (
              <div className="comp-card" key={i} style={{borderColor:c.border}}>
                <div className="comp-icon">{c.icon}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <h3>{c.name}</h3>
                  <span className="comp-badge" style={{background:c.badgeBg,color:c.badgeColor,border:`1px solid ${c.border}`}}>{c.badge}</span>
                </div>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESPONSIBLE DISCLOSURE */}
      <section>
        <div className="wrap">
          <div className="disclosure">
            <div className="disc-icon">🔍</div>
            <h3>Responsible Disclosure</h3>
            <p>Found a security vulnerability? We want to know. We commit to responding within 48 hours and will credit researchers who report valid vulnerabilities.</p>
            <a href="mailto:murtaztahir2@gmail.com" className="btn btn-primary">Report Vulnerability →</a>
            <p style={{marginTop:12,fontSize:12,color:'var(--faint)'}}>murtaztahir2@gmail.com · Response within 48 hours</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="wrap">
          <div className="cta-section">
            <h2>Security you can trust.<br/>Platform you'll love.</h2>
            <p>Start free today — no credit card, no sales call.</p>
            <a href="/auth/signup" className="btn btn-primary" style={{fontSize:16,padding:'14px 36px'}}>⚡ Start Free Trial →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="footer-inner">
            <div className="logo">
              <div className="mark" style={{width:28,height:28}}>
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Salevrix AI
            </div>
            <div className="foot-links">
              <a href="/">Home</a>
              <a href="/security">Security</a>
              <a href="/#pricing">Pricing</a>
              <a href="mailto:murtaztahir2@gmail.com">Contact</a>
            </div>
            <p style={{fontSize:12,color:'var(--faint)'}}>© 2026 Salevrix AI · All rights reserved</p>
          </div>
        </div>
      </footer>

      {/* ANIMATIONS */}
      <Script id="sec-animations" strategy="afterInteractive">{`
        // Canvas particle bg
        const canvas = document.getElementById('sec-canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          });
          const particles = Array.from({length:60},() => ({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            r: Math.random()*1.5+0.5,
            vx: (Math.random()-.5)*0.3,
            vy: (Math.random()-.5)*0.3,
            a: Math.random(),
          }));
          function drawParticles() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
              p.x += p.vx; p.y += p.vy;
              if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
              if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
              ctx.beginPath();
              ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
              ctx.fillStyle = 'rgba(200,255,0,'+p.a*0.4+')';
              ctx.fill();
            });
            requestAnimationFrame(drawParticles);
          }
          drawParticles();
        }

        // Layer cards scroll animation
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry, i) => {
            if(entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('visible');
              }, parseInt(entry.target.id.replace('layer-','')) * 60);
              observer.unobserve(entry.target);
            }
          });
        }, {threshold: 0.1});
        document.querySelectorAll('.layer-card').forEach(el => observer.observe(el));

        // Score ring animation
        const fill = document.querySelector('.score-ring .fill');
        if(fill) {
          fill.style.strokeDashoffset = '408';
          setTimeout(() => {
            fill.style.strokeDashoffset = '25'; // 94% = ~25 offset
          }, 500);
        }

        // GSAP scroll animations (if available)
        if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
          gsap.from('.sec-head', { opacity:0, y:40, duration:0.8, stagger:0.1, scrollTrigger:{trigger:'.sec-head',start:'top 80%'} });
          gsap.from('.enc-visual', { opacity:0, y:30, duration:0.8, scrollTrigger:{trigger:'.enc-visual',start:'top 80%'} });
          gsap.from('.cmp-table', { opacity:0, y:30, duration:0.8, scrollTrigger:{trigger:'.cmp-table',start:'top 80%'} });
          gsap.from('.comp-card', { opacity:0, y:30, duration:0.6, stagger:0.15, scrollTrigger:{trigger:'.compliance-grid',start:'top 80%'} });
          gsap.from('.cta-section', { opacity:0, scale:0.97, duration:0.8, scrollTrigger:{trigger:'.cta-section',start:'top 80%'} });
        }
      `}</Script>
    </>
  );
}
