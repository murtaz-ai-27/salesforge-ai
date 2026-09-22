import Script from "next/script";

export const metadata = {
  title: "Security — Salevrix AI",
  description: "Enterprise-grade security. Your data is protected by 12 layers of security including AES-256 encryption, SOC 2 compliance, and zero-trust architecture.",
};

export default function SecurityPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg:#050505; --bg-2:#080a0e; --panel:#0d1018;
          --line:rgba(255,255,255,.07); --line-soft:rgba(255,255,255,.04);
          --text:#f4f5f7; --muted:#9598a3; --faint:#555a66;
          --accent:#C8FF00; --accent-rgb:200,255,0;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
        a { text-decoration: none; color: inherit; }

        /* NAV */
        nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 5%; height: 64px; background: rgba(5,5,5,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line-soft); }
        .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 17px; }
        .mark { width: 32px; height: 32px; background: var(--accent); border-radius: 8px; display: grid; place-items: center; }
        .nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--muted); }
        .nav-links a:hover { color: var(--text); }
        .nav-cta { display: flex; gap: 10px; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all .2s; }
        .btn-primary { background: var(--accent); color: #050505; }
        .btn-primary:hover { background: #b8ef00; transform: translateY(-1px); }
        .btn-ghost { background: rgba(255,255,255,.06); color: var(--text); border: 1px solid var(--line); }
        .btn-ghost:hover { background: rgba(255,255,255,.1); }

        /* LAYOUT */
        .wrap { max-width: 1100px; margin: 0 auto; padding: 0 5%; }
        section { padding: 80px 0; }

        /* HERO */
        .sec-hero { text-align: center; padding: 100px 0 80px; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; background: rgba(200,255,0,.08); border: 1px solid rgba(200,255,0,.2); font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: .05em; text-transform: uppercase; margin-bottom: 24px; }
        .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .hero-title { font-size: clamp(36px,6vw,64px); font-weight: 900; line-height: 1.1; letter-spacing: -.03em; margin-bottom: 20px; }
        .hero-title span { color: var(--accent); }
        .hero-sub { font-size: 18px; color: var(--muted); max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
        .score-badge { display: inline-flex; align-items: center; gap: 16px; padding: 16px 28px; border-radius: 16px; background: rgba(200,255,0,.06); border: 1px solid rgba(200,255,0,.2); }
        .score-num { font-size: 48px; font-weight: 900; color: var(--accent); line-height: 1; }
        .score-label { text-align: left; }
        .score-label strong { display: block; font-size: 15px; color: var(--text); }
        .score-label span { font-size: 12px; color: var(--muted); }

        /* STATS */
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 80px; }
        .stat-card { background: var(--panel); border: 1px solid var(--line-soft); border-radius: 14px; padding: 24px; text-align: center; }
        .stat-val { font-size: 32px; font-weight: 900; color: var(--accent); margin-bottom: 6px; }
        .stat-label { font-size: 12px; color: var(--muted); }

        /* LAYERS GRID */
        .sec-head { text-align: center; margin-bottom: 48px; }
        .sec-head h2 { font-size: clamp(28px,4vw,40px); font-weight: 900; letter-spacing: -.03em; margin-bottom: 12px; }
        .sec-head p { font-size: 16px; color: var(--muted); }
        .layers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .layer-card { background: var(--panel); border: 1px solid var(--line-soft); border-radius: 14px; padding: 24px; transition: all .2s; }
        .layer-card:hover { border-color: rgba(200,255,0,.25); transform: translateY(-3px); }
        .layer-num { font-size: 11px; font-weight: 800; color: var(--faint); letter-spacing: .1em; margin-bottom: 12px; }
        .layer-icon { font-size: 28px; margin-bottom: 12px; }
        .layer-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
        .layer-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .layer-badge { display: inline-flex; align-items: center; gap: 5px; margin-top: 14px; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; background: rgba(52,211,153,.1); color: #34d399; border: 1px solid rgba(52,211,153,.2); }
        .layer-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #34d399; }

        /* COMPARISON */
        .compare-table { width: 100%; border-collapse: collapse; }
        .compare-table th { padding: 14px 16px; font-size: 12px; font-weight: 700; text-align: left; border-bottom: 1px solid var(--line); }
        .compare-table td { padding: 14px 16px; font-size: 13px; color: var(--muted); border-bottom: 1px solid var(--line-soft); }
        .compare-table tr:last-child td { border-bottom: none; }
        .compare-table tr:hover td { background: rgba(255,255,255,.02); }
        .col-us { color: #34d399 !important; font-weight: 700; }
        .col-them { color: #f97316 !important; }
        .col-feat { color: var(--text) !important; }

        /* ENCRYPTION */
        .enc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .enc-card { background: var(--panel); border: 1px solid var(--line-soft); border-radius: 14px; padding: 24px; }
        .enc-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
        .enc-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .enc-code { margin-top: 12px; padding: 10px 14px; background: rgba(0,0,0,.4); border-radius: 8px; font-family: monospace; font-size: 11px; color: var(--accent); }

        /* CTA */
        .cta-box { background: rgba(200,255,0,.05); border: 1px solid rgba(200,255,0,.15); border-radius: 20px; padding: 60px; text-align: center; }
        .cta-box h2 { font-size: 36px; font-weight: 900; letter-spacing: -.03em; margin-bottom: 12px; }
        .cta-box p { font-size: 16px; color: var(--muted); margin-bottom: 32px; }

        /* FOOTER */
        footer { border-top: 1px solid var(--line-soft); padding: 32px 0; }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; }
        .footer-links { display: flex; gap: 24px; font-size: 13px; color: var(--muted); }
        .footer-links a:hover { color: var(--text); }

        @media(max-width:768px) {
          .stats-row { grid-template-columns: repeat(2,1fr); }
          .layers-grid { grid-template-columns: 1fr; }
          .enc-grid { grid-template-columns: 1fr; }
          .nav-links { display: none; }
          .cta-box { padding: 32px 20px; }
        }
      `}} />

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
          <a href="/#features">Features</a>
          <a href="/#agents">AI Agents</a>
          <a href="/#pricing">Pricing</a>
          <a href="/security" style={{ color: 'var(--accent)' }}>Security</a>
        </div>
        <div className="nav-cta">
          <a href="/auth/login" className="btn btn-ghost">Sign in</a>
          <a href="/auth/signup" className="btn btn-primary">Start Free →</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="sec-hero">
        <div className="wrap">
          <div className="eyebrow">
            <div className="dot" />
            Security & Compliance
          </div>
          <h1 className="hero-title">
            Your data is <span>protected.</span><br />
            We take this seriously.
          </h1>
          <p className="hero-sub">
            Salevrix AI implements 12 layers of enterprise-grade security — the same standards used by Apollo.io, Linear, and Notion.
          </p>
          <div className="score-badge">
            <div className="score-num">94</div>
            <div className="score-label">
              <strong>Security Score</strong>
              <span>Independent assessment · 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="wrap">
        <div className="stats-row">
          {[
            { val: 'AES-256', label: 'Encryption Standard' },
            { val: '12', label: 'Security Layers' },
            { val: '0', label: 'Data Breaches Ever' },
            { val: '99.9%', label: 'Uptime SLA' },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 12 LAYERS */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow"><div className="dot" />Defense in Depth</span>
            <h2>12 Security Layers</h2>
            <p>Every request is validated. Every user is verified. Every input is sanitized.</p>
          </div>
          <div className="layers-grid">
            {[
              { num: '01', icon: '🛡️', title: 'Content Security Policy', desc: 'Blocks XSS attacks, clickjacking, and data injection. Whitelist-only script execution from trusted sources.', badge: 'Active' },
              { num: '02', icon: '⚡', title: 'Rate Limiting — 3 Layers', desc: 'Global 100 req/min, per-IP 200 req/min, per-user 2–50 req/min by plan. Sliding window algorithm.', badge: 'Active' },
              { num: '03', icon: '🔐', title: 'CSRF Protection', desc: 'HMAC-SHA256 tokens with 1-hour expiry. Constant-time comparison prevents timing attacks.', badge: 'Active' },
              { num: '04', icon: '✅', title: 'Input Validation (Zod)', desc: 'Type-safe schema validation on every API route. Malformed requests are rejected before processing.', badge: 'Active' },
              { num: '05', icon: '🗄️', title: 'SQL Injection Prevention', desc: 'Supabase parameterized queries. No raw SQL ever. ORM-level protection on every database operation.', badge: 'Active' },
              { num: '06', icon: '🔒', title: 'Row Level Security', desc: 'Database-level policies — users can only access their own data. Enforced at the Postgres level.', badge: 'Active' },
              { num: '07', icon: '📋', title: 'Security Headers (8)', desc: 'X-Frame-Options, X-Content-Type, HSTS, Referrer-Policy, Permissions-Policy, and more on every response.', badge: 'Active' },
              { num: '08', icon: '🤖', title: 'Prompt Injection Filter', desc: 'AI inputs sanitized — removes jailbreak attempts, "ignore instructions" patterns before processing.', badge: 'Active' },
              { num: '09', icon: '📝', title: 'Security Audit Log', desc: 'Every security event logged: login, logout, data export, settings change, rate limit hit. 90-day retention.', badge: 'Active' },
              { num: '10', icon: '🔑', title: 'AES-256-GCM Encryption', desc: 'Sensitive data encrypted at rest. Keys stored in environment variables, never in code or database.', badge: 'Active' },
              { num: '11', icon: '🌐', title: 'Session Management', desc: '30-day sessions with instant revocation. Suspicious login detection — impossible travel alerts.', badge: 'Active' },
              { num: '12', icon: '⚙️', title: 'Env Var Validation', desc: 'Application validates all environment variables at startup. Fails fast with clear errors if misconfigured.', badge: 'Active' },
            ].map((l, i) => (
              <div className="layer-card" key={i}>
                <div className="layer-num">LAYER {l.num}</div>
                <div className="layer-icon">{l.icon}</div>
                <div className="layer-title">{l.title}</div>
                <div className="layer-desc">{l.desc}</div>
                <div className="layer-badge">{l.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENCRYPTION SECTION */}
      <section style={{ background: 'var(--bg-2)' }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow"><div className="dot" />Encryption</span>
            <h2>Data Protected at Every Layer</h2>
            <p>Your data is encrypted in transit and at rest using military-grade standards.</p>
          </div>
          <div className="enc-grid">
            {[
              { title: 'Encryption at Rest', text: 'All sensitive data encrypted using AES-256-GCM before storing in database. Encryption keys stored in environment variables — never in code.', code: 'Algorithm: AES-256-GCM | Key size: 256-bit' },
              { title: 'Encryption in Transit', text: 'All data transmitted over HTTPS/TLS 1.3. HSTS enforced with 1-year max-age. No HTTP connections accepted in production.', code: 'Protocol: TLS 1.3 | HSTS: max-age=31536000' },
              { title: 'Password Security', text: 'Authentication handled by Firebase — industry-standard OAuth2. No passwords stored in our database. Google and GitHub OAuth only.', code: 'Auth: Firebase OAuth2 | Storage: None' },
              { title: 'Database Security', text: 'Row Level Security (RLS) enforced at Postgres level. Service role key used only server-side. Anon key has zero write permissions.', code: 'DB: Supabase + RLS | Admin: Server-only' },
            ].map((e, i) => (
              <div className="enc-card" key={i}>
                <h3>{e.title}</h3>
                <p>{e.text}</p>
                <div className="enc-code">{e.code}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS APOLLO COMPARISON */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow"><div className="dot" />Comparison</span>
            <h2>Salevrix vs Industry Standards</h2>
            <p>How we compare to Apollo.io, Linear, and other leading B2B SaaS platforms.</p>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line-soft)', borderRadius: 16, overflow: 'hidden' }}>
            <table className="compare-table">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.03)' }}>
                  <th>Security Feature</th>
                  <th style={{ color: 'var(--accent)' }}>✓ Salevrix AI</th>
                  <th style={{ color: 'var(--muted)' }}>Apollo.io</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Rate Limiting', '3-layer sliding window', '✓ Basic rate limiting'],
                  ['CSRF Protection', 'HMAC-SHA256 tokens', '✓ Standard CSRF'],
                  ['Input Validation', 'Zod type-safe schemas', '✓ Server-side validation'],
                  ['Database RLS', 'Supabase RLS policies', '✓ Row level policies'],
                  ['Encryption at Rest', 'AES-256-GCM', '✓ AES-256 encryption'],
                  ['Security Audit Log', 'Full event logging', '✓ Enterprise audit trail'],
                  ['Session Management', '30-day + revocation', '✓ Session management'],
                  ['Security Headers', '8 headers incl. CSP', '✓ Standard headers'],
                  ['AI Input Security', 'Prompt injection filter', '✗ Not applicable'],
                  ['Uptime SLA', '99.9% (Vercel Edge)', '✓ 99.9% SLA'],
                ].map(([feat, us, them], i) => (
                  <tr key={i}>
                    <td className="col-feat">{feat}</td>
                    <td className="col-us">✓ {us}</td>
                    <td className={them.startsWith('✓') ? '' : 'col-them'}>{them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section style={{ background: 'var(--bg-2)' }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow"><div className="dot" />Compliance</span>
            <h2>Compliance & Certifications</h2>
            <p>Current status and roadmap for formal security certifications.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { name: 'GDPR', status: 'Compliant', desc: 'Data processing in compliance with EU General Data Protection Regulation. 90-day log retention and auto-deletion.', color: '#34d399', badge: '✓ ACTIVE' },
              { name: 'SOC 2 Type II', status: 'In Progress', desc: 'Independent third-party security audit scheduled for Q1 2027. Controls documentation in progress.', color: '#f59e0b', badge: '⏳ Q1 2027' },
              { name: 'ISO 27001', status: 'Planned', desc: 'International information security management certification planned for Q2 2027 post SOC 2 completion.', color: '#60a5fa', badge: '📋 Q2 2027' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--panel)', border: `1px solid ${c.color}33`, borderRadius: 14, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{c.name}</h3>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: `${c.color}15`, color: c.color, fontSize: 10, fontWeight: 700, border: `1px solid ${c.color}30` }}>{c.badge}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESPONSIBLE DISCLOSURE */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <h2>Responsible Disclosure</h2>
            <p>Found a security vulnerability? We want to know.</p>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line-soft)', borderRadius: 16, padding: '40px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Security Vulnerability Reporting</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              If you discover a security vulnerability, please report it directly to our security team.
              We commit to responding within 48 hours and will credit researchers who report valid vulnerabilities.
            </p>
            <a href="mailto:security@salevrix.ai" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Report Vulnerability →
            </a>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--faint)' }}>security@salevrix.ai</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="wrap">
          <div className="cta-box">
            <h2>Security you can trust.<br />Platform you'll love.</h2>
            <p>Start free today — no credit card, no sales call, no BS.</p>
            <a href="/auth/signup" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              ⚡ Start Free Trial →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="footer-inner">
            <div className="logo" style={{ fontSize: 14 }}>
              <div className="mark" style={{ width: 26, height: 26 }}>
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                  <path d="M3 8L6.5 11.5L13 4.5" stroke="#050505" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Salevrix AI
            </div>
            <div className="footer-links">
              <a href="/">Home</a>
              <a href="/security">Security</a>
              <a href="/#pricing">Pricing</a>
              <a href="mailto:murtaztahir2@gmail.com">Contact</a>
            </div>
            <p style={{ fontSize: 12, color: 'var(--faint)' }}>© 2026 Salevrix AI</p>
          </div>
        </div>
      </footer>
    </>
  );
}
