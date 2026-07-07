"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";

const S = { bg:"#050505",panel:"#0d1018",lineSoft:"rgba(255,255,255,0.05)",text:"#f4f5f7",muted:"#9598a3",faint:"#555a66",accent:"#C8FF00" };

const AUTOMATIONS = [
  {
    id:"1", name:"New Lead Auto-Enrichment", category:"Prospecting", status:"active",
    trigger:"New prospect added to your account",
    action:"AI researches prospect + scores ICP fit + assigns buying intent",
    runs:1284, saved:"4.2 hrs/day", color:"#C8FF00", bg:"rgba(200,255,0,0.08)",
    icon:"M13 10V3L4 14h7v7l9-11h-7z",
    what_it_does:"The moment you add a new prospect, this automation kicks in. It researches their LinkedIn activity, company news, recent funding rounds, tech stack, and team size. Then assigns an AI score (0-100) and buying intent (high/medium/low) so your reps know exactly who to prioritize.",
    why_it_matters:"Apollo reps manually research every prospect — spending 2-3 hours/day on Google and LinkedIn. This gives you that research in seconds, for every prospect, automatically.",
    example_output:`New Prospect Enrichment Complete ✓

James Morrison — VP Sales, Stripe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI Score: 98/100 — PRIORITY
Buying Intent: HIGH

What I found:
• Stripe hired 3 new SDRs last week (scaling sales)
• James posted about "outbound automation" 4 days ago
• Company raised $694M Series H — budget available
• Tech stack: Salesforce + Outreach (switching signals)

Personalization hooks:
1. Reference his LinkedIn post about outbound automation
2. Mention the new SDR hires scaling challenge
3. Stripe's Series H = budget for new tools

Best channel: Email first, then LinkedIn
Best time to reach: Tuesday-Thursday 9-11am
Recommended CTA: 15-min call about SDR automation`,
    prompt:"A new prospect has been added. Prospect details: {prospect_data}. Research this person and provide a complete enrichment report with ICP score, buying intent, personalization hooks, and outreach recommendations."
  },
  {
    id:"2", name:"Hot Lead Instant Alert", category:"Alerts", status:"active",
    trigger:"Prospect AI score crosses 85",
    action:"Instant Slack/email alert + AI drafts personalized outreach",
    runs:47, saved:"2.1 hrs/day", color:"#f59e0b", bg:"rgba(245,158,11,0.08)",
    icon:"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    what_it_does:"Continuously monitors all prospects in your pipeline. The moment any prospect's score crosses 85 (indicating high intent), you get an instant notification with a fully drafted, personalized email ready to send in one click.",
    why_it_matters:"Hot leads go cold in 24-48 hours. The first rep to respond wins 78% of deals. This automation ensures you're always first.",
    example_output:`🔥 HOT LEAD ALERT — Act Now!

Sarah Chen | CRO | Linear
Score just hit: 94/100

Why she's hot RIGHT NOW:
• Just posted about "scaling SDR team 10x"
• Linear raised $35M Series B (announced today)
• Her team is 8 people — she needs to scale fast
• Viewed your LinkedIn profile 3 times this week

⚡ AI-DRAFTED EMAIL (ready to send):

Subject: Saw your post about scaling Linear's SDR team

Hi Sarah,

Your LinkedIn post about scaling SDR teams 10x caught my attention — especially the challenge of keeping outreach personal as you grow.

We help CROs at Series B companies like Linear automate the research and personalization step, so your SDRs spend 70% less time on prep and more time in conversations.

Would a 15-minute call make sense this week to see if it fits your Q3 goals?

[SEND NOW] [EDIT FIRST] [SNOOZE 24H]`,
    prompt:"Hot lead alert triggered. Prospect: {prospect_data}. Score: {score}. Generate an instant alert with key buying signals and a ready-to-send personalized email."
  },
  {
    id:"3", name:"Auto Follow-Up Sequence", category:"Outreach", status:"active",
    trigger:"No reply received within 3 business days",
    action:"AI writes follow-up with completely different angle and sends it",
    runs:892, saved:"6.8 hrs/day", color:"#818cf8", bg:"rgba(129,140,248,0.08)",
    icon:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    what_it_does:"If a prospect hasn't replied in 3 business days, AI writes a completely different follow-up — different angle, different value prop, different CTA. Never the dreaded 'just following up' email. Runs up to 5 touches automatically before marking prospect as cold.",
    why_it_matters:"80% of sales require 5+ follow-ups. 44% of reps give up after 1 touch. This automation never gives up — and every follow-up is fresh and personalized.",
    example_output:`Auto Follow-Up #2 Generated ✓
(3 days since last email — no reply)

Previous angle: SDR automation time savings
New angle: Competitor threat / FOMO

━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: Your competitors are already doing this

Hi James,

While you haven't had a chance to reply, I noticed that 3 of Stripe's top competitors — Square, Brex, and Adyen — all started using AI SDR tools in Q2.

They're booking 3x more discovery calls than their previous quarter.

I'm not saying this to create pressure — just thought you'd want to know what's happening in your competitive landscape.

Still open to that 15-minute call?

[SEND NOW] [CUSTOMIZE] [SKIP THIS TOUCH]
━━━━━━━━━━━━━━━━━━━━━━━━━
Next touch: Day 7 — Social proof angle
Remaining touches: 3 of 5`,
    prompt:"Follow-up automation triggered. Original email angle: {previous_angle}. Prospect: {prospect_data}. Days since last email: {days}. Touch number: {touch_number}. Write a completely different follow-up angle. Never say 'just following up'."
  },
  {
    id:"4", name:"Meeting Prep Briefing", category:"Meetings", status:"active",
    trigger:"Sales meeting scheduled in calendar (30 min before)",
    action:"AI generates complete meeting briefing with research, questions, and battle cards",
    runs:47, saved:"1.5 hrs/day", color:"#34d399", bg:"rgba(52,211,153,0.08)",
    icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    what_it_does:"30 minutes before any sales call, you get a complete briefing: prospect background, company news from the last 30 days, suggested discovery questions, likely objections with pre-written responses, and competitor battle cards if relevant.",
    why_it_matters:"Reps who do pre-call research close 47% more deals. Most reps spend 20-30 minutes researching manually. This automation does it better in 30 seconds.",
    example_output:`📋 MEETING BRIEFING
Call with: James Morrison, VP Sales @ Stripe
In: 28 minutes

━━ QUICK BACKGROUND ━━
• At Stripe for 3 years, promoted to VP Sales 8 months ago
• Manages 24 AEs + 12 SDRs across APAC/EMEA
• Known for: quota attainment focus, data-driven decisions
• LinkedIn: Active poster about sales efficiency

━━ COMPANY NEWS (last 30 days) ━━
• Stripe launched new payment infrastructure in SE Asia
• Announced 200 new enterprise hires (aggressive growth)
• Series H at $65B valuation — significant budget available

━━ DISCOVERY QUESTIONS ━━
1. "You mentioned scaling SDR teams — what's your current outbound motion?"
2. "How are you thinking about AI tools for your SDR org this year?"
3. "What does your current research-to-outreach workflow look like?"

━━ LIKELY OBJECTIONS ━━
"We already use Outreach"
→ "Outreach is great for sequencing. We're solving the step before that — research and personalization. Most teams use both."

"Too expensive right now"
→ "What if I showed you the ROI math? If your SDRs save 2hrs/day on research, that's 24 hours/day across your team. What's that worth?"

━━ GOAL FOR THIS CALL ━━
Book a technical demo with their Head of Sales Ops`,
    prompt:"Meeting in 30 minutes. Prospect: {prospect_data}. Previous interactions: {interaction_history}. Generate complete meeting briefing with background, news, discovery questions, objection handlers, and call goal."
  },
  {
    id:"5", name:"Deal Risk Monitor", category:"Pipeline", status:"active",
    trigger:"No deal activity for 7 days",
    action:"AI analyzes deal health + generates rescue strategy with specific actions",
    runs:23, saved:"3.2 hrs/day", color:"#f87171", bg:"rgba(248,113,113,0.08)",
    icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    what_it_does:"Monitors every deal in your pipeline daily. If there's been no activity (email, call, meeting) for 7 days, AI analyzes the full deal history and generates a specific rescue plan — not generic advice, but tailored actions based on what happened in previous conversations.",
    why_it_matters:"Deals that go dark for 7 days have a 60% lower close rate. Early intervention saves deals. Apollo has no deal monitoring AI.",
    example_output:`⚠️ DEAL AT RISK — Immediate Action Required

Deal: Notion — Enterprise License
Value: $15,600/year | Stage: Proposal Sent
Days since last activity: 12 days

━━ RISK ANALYSIS ━━
Deal Health Score: 34/100 — CRITICAL

Why this deal is dying:
• Proposal sent 12 days ago — no response
• Your champion (Raj Patel) posted on LinkedIn yesterday (still active, not ghosting you)
• Notion had layoffs in their sales ops team last week (budget freeze possible)
• Q3 ends in 19 days — procurement cycles typically need 3-4 weeks

━━ RESCUE STRATEGY ━━

Action 1 (Do TODAY): 
Call Raj directly — don't email. Use this opening:
"Raj, I know you've been busy with the recent changes at Notion. I wanted to check in — is the evaluation still moving forward or should we revisit timing?"

Action 2 (If no response by tomorrow):
Reach executive sponsor. Search LinkedIn for their CFO and send:
"Hi [CFO name], I've been working with Raj on a proposal for your sales team. Given the current environment, I wanted to share how other companies in [industry] are getting ROI in 30 days or less..."

Action 3 (Nuclear option):
Create urgency: "Our Q3 pricing locks in this week. Happy to extend it if we can get on a call by [date]."

━━ PROBABILITY ━━
Current: 23% | With rescue plan: 61%`,
    prompt:"Deal at risk alert. Deal details: {deal_data}. Days inactive: {days_inactive}. Previous interactions: {history}. Generate detailed rescue strategy with specific scripts and actions ranked by priority."
  },
  {
    id:"6", name:"LinkedIn Intent Tracker", category:"Prospecting", status:"active",
    trigger:"Target prospect views your LinkedIn profile or company page",
    action:"AI sends timed, personalized LinkedIn message within 30 minutes",
    runs:284, saved:"2.8 hrs/day", color:"#60a5fa", bg:"rgba(96,165,250,0.08)",
    icon:"M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z",
    what_it_does:"When someone from your target account list views your LinkedIn profile or company page, you get an instant alert and AI drafts a perfectly-timed connection request. Reaching out within 30 minutes of a profile view = 4x higher response rate.",
    why_it_matters:"Someone viewing your profile is the strongest buying signal short of filling out a form. Most reps never know it happened. This turns invisible interest into conversations.",
    example_output:`👁️ LINKEDIN PROFILE VIEW DETECTED

Amy Liu — Director of Sales, Figma
Viewed your profile: 4 minutes ago
View duration: 3+ minutes (high interest signal)

━━ CONTEXT ━━
• This is the 2nd time she's viewed your profile this week
• She also viewed your company page yesterday
• She's been liking posts about "AI in sales" recently
• Figma raised Series D in February — budget available

━━ AI-DRAFTED MESSAGE (send now for 4x better response) ━━

Connection Request (284 chars):
"Amy — noticed you stopped by my profile. I work with Directors of Sales at design-forward companies like Figma on automating outreach without losing the human touch. Thought it might be worth connecting given what your team is building."

[SEND NOW] [EDIT] [SKIP]

⚡ Tip: Sending within 30 minutes = 4x higher acceptance rate`,
    prompt:"LinkedIn profile view detected. Viewer: {prospect_data}. Context: viewed profile {times} times, also viewed company page. Generate personalized LinkedIn message to send immediately."
  },
  {
    id:"7", name:"Reply Sentiment Router", category:"Inbox", status:"active",
    trigger:"New inbound email reply received",
    action:"AI categorizes sentiment + routes to correct response template + drafts reply",
    runs:156, saved:"1.9 hrs/day", color:"#a78bfa", bg:"rgba(167,139,250,0.08)",
    icon:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    what_it_does:"Every inbound reply is instantly analyzed for sentiment (positive/negative/neutral), intent (interested/objecting/requesting info/timing issue), and routed to the right response. AI drafts the reply in your voice so you can send in one click.",
    why_it_matters:"Reps spend 40 minutes/day categorizing and drafting replies. This does it in 3 seconds. And unlike Apollo's basic inbox, every draft sounds human.",
    example_output:`📨 NEW REPLY — Instant Analysis

From: Marcus Johnson, VP Revenue @ Vercel
Reply: "Looks interesting! I forwarded this to our VP of Sales. He'll follow up."

━━ AI ANALYSIS ━━
Sentiment: POSITIVE ✓
Intent: Internal Champion (forwarded to DM)
Stage change: → Multi-stakeholder
Risk: Momentum may slow without direct follow-up

━━ WHAT THIS MEANS ━━
Marcus likes it but isn't the decision maker.
His VP of Sales is. You have ~48 hours before 
this gets buried in their VP's inbox.

━━ RECOMMENDED ACTION ━━
1. Reply to Marcus (keep warm): ✓ AI drafted below
2. Find VP of Sales on LinkedIn (search: "VP Sales Vercel")
3. Reach out to VP directly with social proof

━━ AI-DRAFTED REPLY TO MARCUS ━━

"Marcus — appreciate you passing this along! 

To make it easy for your VP of Sales, I've put together a 2-minute overview specifically relevant to DevTool sales teams: [link]

Would it make sense for me to reach out to them directly? Happy to make the intro seamless on your end."

[SEND NOW] [EDIT] [DRAFT TO VP TOO]`,
    prompt:"New inbound reply received. From: {prospect_data}. Reply text: {reply_text}. Previous context: {conversation_history}. Analyze sentiment, intent, and draft the perfect response."
  },
  {
    id:"8", name:"CRM Auto-Update", category:"CRM", status:"active",
    trigger:"Any sales activity occurs (email sent, reply received, meeting booked)",
    action:"AI updates all CRM fields, adds activity log, and updates deal stage automatically",
    runs:3847, saved:"5.4 hrs/day", color:"#34d399", bg:"rgba(52,211,153,0.08)",
    icon:"M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    what_it_does:"Every single sales activity is automatically logged and the right CRM fields are updated. Email sent → logged. Reply received → stage updated. Meeting booked → opportunity created. You'll never manually update CRM again.",
    why_it_matters:"Sales reps spend 5.4 hours/week on manual CRM updates. That's 280+ hours/year per rep. This gives that time back completely.",
    example_output:`CRM Auto-Update Log

Activity: Email reply received from Sarah Chen (CRO, Linear)
Time: 2:34 PM today

━━ FIELDS UPDATED ━━
✓ Stage: Contacted → Replied (auto-progressed)
✓ Last Activity: Updated to today
✓ Activity Log: "Positive reply — interested in demo. Asked about onboarding."
✓ Next Action: "Schedule demo" (due: +2 days)
✓ Buying Intent: Medium → High (reply sentiment: positive)
✓ Contact: Updated email as "responsive"

━━ AI NOTES ADDED ━━
"Sarah responded positively to the SDR automation angle. 
Key interest: onboarding process. 
Objection to address: implementation timeline.
Decision maker: confirmed as CRO (budget holder).
Next step: book 30-min demo focused on quick onboarding."

━━ FOLLOW-UP CREATED ━━
Task: Send demo link to Sarah
Due: Tomorrow 10am
Priority: HIGH`,
    prompt:"CRM update triggered. Activity: {activity_type}. Prospect: {prospect_data}. Activity details: {activity_details}. Generate complete CRM update log with field changes and AI notes."
  },
  {
    id:"9", name:"Competitor Mention Alert", category:"Intelligence", status:"active",
    trigger:"Prospect mentions Apollo, Outreach, Salesloft, or any competitor in email/call",
    action:"AI generates instant battle card with specific talking points to win the comparison",
    runs:31, saved:"1.2 hrs/day", color:"#f59e0b", bg:"rgba(245,158,11,0.08)",
    icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    what_it_does:"When a prospect mentions a competitor in an email or call notes, AI instantly generates a battle card with specific weaknesses to highlight, questions to ask that expose those weaknesses, and a winning talk track.",
    why_it_matters:"65% of B2B deals involve competitor comparisons. Reps who have battle cards close 27% more often. This generates them in real-time, for any competitor.",
    example_output:`⚔️ COMPETITOR DETECTED — Battle Card Generated

Mentioned: Apollo.io
Context: "We're already using Apollo and just renewed for another year"

━━ APOLLO WEAKNESSES TO HIGHLIGHT ━━

1. Data Accuracy (Apollo's biggest pain)
"Apollo's contact database is 210M+ contacts but ~65% accurate. 
That means 35% of your emails bounce. Are your deliverability 
numbers reflecting this?"

2. No Real AI Automation
"Apollo recently added 'AI assist' but it's essentially just 
writing suggestions. We have 10 autonomous agents that actually 
take actions — find prospects, write emails, handle replies, 
book meetings — while your team sleeps."

3. LinkedIn is Fully Manual
"Apollo's LinkedIn integration just creates tasks for your reps 
to manually do. Our LinkedIn automation writes and sends the 
messages automatically."

━━ TRAP QUESTIONS TO ASK ━━
"What's your current email bounce rate with Apollo's data?"
"How much time do your SDRs spend on research before outreach?"
"Are your reps actually using Apollo's AI features or just the database?"

━━ WINNING ONE-LINER ━━
"Apollo is a great database. We're what you use with Apollo — 
or instead of it, once you see what AI automation actually looks like."

━━ CONTRACT OBJECTION HANDLER ━━
"You have 9 months left on Apollo — that's the perfect time to 
run a 90-day parallel test. Your Q4 renewal decision will be 
much easier with real data."`,
    prompt:"Competitor mentioned by prospect. Competitor: {competitor}. Context: {prospect_quote}. Generate complete battle card with weaknesses, trap questions, winning talk track, and contract objection handler."
  },
  {
    id:"10", name:"Win/Loss Analysis", category:"Analytics", status:"active",
    trigger:"Deal marked as Closed Won or Closed Lost",
    action:"AI analyzes full conversation history and generates learnings report for the whole team",
    runs:18, saved:"2.1 hrs/day", color:"#818cf8", bg:"rgba(129,140,248,0.08)",
    icon:"M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",
    what_it_does:"After every deal closes, AI reads the entire conversation history and identifies exactly what worked, what didn't, and what patterns separate wins from losses. Reports are shared with the team automatically.",
    why_it_matters:"Companies that do win/loss analysis close 28% more deals. Most never do it because it takes hours. This does it automatically after every single deal.",
    example_output:`📊 WIN ANALYSIS REPORT

Deal: Stripe — Enterprise License ✓ CLOSED WON
Value: $24,000/year | Sales Cycle: 34 days

━━ WHAT WON THIS DEAL ━━

1. LinkedIn Personalization (Day 1)
   Referenced James's specific post about scaling SDR teams.
   He replied within 4 hours — fastest response in pipeline.
   LESSON: Always reference a specific LinkedIn post in first email.

2. Competitor Intel (Day 8)
   When Outreach came up, used battle card immediately.
   Shifted conversation from "vs Outreach" to "in addition to Outreach."
   LESSON: Never position as either/or with existing tools.

3. Champion Development (Day 15)
   Spent 20 minutes helping James build internal business case.
   He became our advocate with CFO.
   LESSON: Give champions the ammunition to sell internally.

━━ WHAT ALMOST LOST IT ━━
• Went dark for 5 days in week 2 (response time dropped)
• Sent generic proposal template (he mentioned this)

━━ TIMELINE TO STUDY ━━
Day 1: Personalized cold email → reply in 4hrs
Day 3: Discovery call → found 3 pain points
Day 8: Handled Outreach objection → moved forward
Day 15: Helped build business case → got CFO intro
Day 22: Technical demo → no objections
Day 34: Contract signed

━━ SHARE WITH TEAM ━━
[Added to Team Playbook] [Slack Team] [Export PDF]`,
    prompt:"Deal just closed. Result: {win_loss}. Deal details: {deal_data}. Full conversation history: {conversation_history}. Generate complete win/loss analysis with specific lessons, what worked, what didn't, and timeline breakdown."
  },
  {
    id:"11", name:"Email Deliverability Guard", category:"Outreach", status:"active",
    trigger:"Before every outbound email is sent",
    action:"AI checks spam score, validates deliverability, rewrites problem phrases",
    runs:4891, saved:"1.2 hrs/day", color:"#34d399", bg:"rgba(52,211,153,0.08)",
    icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    what_it_does:"Before any email goes out, AI scans it for spam triggers, checks domain reputation signals, validates personalization quality, and rewrites any phrases likely to land in spam. Maintains 94%+ inbox placement rate.",
    why_it_matters:"Apollo's contact data has 20-30% bounce rates. Our deliverability guard ensures the emails that do go out actually land in the inbox — not spam.",
    example_output:`✉️ DELIVERABILITY CHECK

Email to: james@stripe.com
Subject: "Quick question about Stripe"

━━ SPAM SCORE: 8/100 ✓ EXCELLENT ━━

Checks passed:
✓ No spam trigger words
✓ Subject line: not salesy (score: 2/10)
✓ Personalization detected: HIGH
✓ Link count: 0 (safe)
✓ Plain text ratio: 100% (optimal)
✓ Email length: 94 words (optimal: 50-125)
✓ Domain reputation: Clean
✓ SPF/DKIM: Configured ✓

━━ 1 SUGGESTION ━━
⚠️ Phrase "I wanted to reach out" is used in 73% of cold emails.
Suggested replacement: "I noticed..." or "Saw that..." 

[AUTO-FIX] [IGNORE] [SEND ANYWAY]

━━ PREDICTED DELIVERABILITY ━━
Inbox: 96% | Spam: 3% | Promotions: 1%
Expected open rate: 58-72% (your avg: 64%)`,
    prompt:"Pre-send deliverability check. Email subject: {subject}. Email body: {body}. Check for spam triggers, personalization quality, and deliverability issues. Provide specific fixes."
  },
  {
    id:"12", name:"ICP Drift Detection", category:"Analytics", status:"active",
    trigger:"Every Sunday at midnight (weekly analysis)",
    action:"AI analyzes won deals and updates your ICP scoring model for better targeting",
    runs:4, saved:"3.5 hrs/week", color:"#C8FF00", bg:"rgba(200,255,0,0.08)",
    icon:"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    what_it_does:"Every week, AI analyzes all your closed-won deals and looks for patterns in company size, industry, role, and tech stack. Automatically updates your ICP scoring weights so you get better at targeting the right people over time.",
    why_it_matters:"Your ICP evolves as you close deals. Most companies review their ICP once a year at planning time. This updates it continuously based on real data.",
    example_output:`📈 WEEKLY ICP DRIFT REPORT
Week of July 1-7, 2026

━━ DEALS ANALYZED ━━
Won: 7 deals | Lost: 4 deals | Total: 11

━━ ICP PATTERN CHANGES ━━

🔺 INCREASING (focus more here):
• VP/C-level titles: +23% win rate vs manager-level
• Series B-D companies: 67% win rate (was 51%)
• DevTools/SaaS industry: 71% win rate (was 58%)
• Companies 100-500 employees: best sweet spot
• Pain: "manual SDR research" mentioned in 6/7 wins

🔻 DECREASING (deprioritize):
• Early-stage (<Series A): 12% win rate, long cycles
• Enterprise 5000+ employees: complex procurement, 90+ day cycles

━━ ICP SCORE MODEL UPDATED ━━
Old weights:
  Company size: 20% | Industry: 20% | Role: 30% | Budget signals: 30%

New weights (based on this week's data):
  Company size: 15% | Industry: 30% | Role: 35% | Budget signals: 20%

━━ NEXT WEEK TARGETING ━━
Prioritize: VP Sales/CRO at Series B-D SaaS/DevTools (100-500 employees)
De-prioritize: Early-stage startups and Fortune 500 enterprise

All 1,284 prospect scores have been recalculated. ✓`,
    prompt:"Weekly ICP analysis. Won deals this week: {won_deals}. Lost deals: {lost_deals}. Current ICP weights: {current_icp}. Analyze patterns and update ICP scoring model with specific recommendations."
  },
  {
    id:"13", name:"Multi-Channel Coordinator", category:"Outreach", status:"active",
    trigger:"Prospect doesn't open email after 2 sends",
    action:"AI automatically switches outreach to LinkedIn, then phone, then SMS",
    runs:634, saved:"4.7 hrs/day", color:"#f472b6", bg:"rgba(244,114,182,0.08)",
    icon:"M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0",
    what_it_does:"If a prospect ignores 2 emails, AI automatically switches channels — writes a LinkedIn message, then if no response, adds a phone call reminder, then tries SMS. Never gets stuck on one channel.",
    why_it_matters:"Some buyers never read cold emails but always respond to LinkedIn. Others prefer phone. Hitting the right channel is often more important than the message itself. Apollo only does email sequences.",
    example_output:`🔄 CHANNEL SWITCH TRIGGERED

Prospect: Raj Patel, Head of Sales @ Notion
Emails sent: 2 | Opens: 0 | Switching to: LinkedIn

━━ CHANNEL SWITCH PLAN ━━

Step 1 (NOW): LinkedIn Connection Request
"Raj — I sent a couple emails about scaling Notion's sales org but 
maybe LinkedIn works better. I work with heads of sales at PLG companies 
on automating outbound. Worth connecting?"
[SEND ON LINKEDIN]

Step 2 (Day +3): LinkedIn DM (if accepted)
[Will auto-draft based on any interaction]

Step 3 (Day +5): Phone Call Reminder
Task created: "Call Raj at Notion — ask for 2 min"
Script: [AI will generate when you mark task started]

Step 4 (Day +7): SMS (if mobile found)
"Hi Raj, this is [name] — tried LinkedIn and email. 30-second call 
about automating Notion's SDR research? Completely fine if not the right time."

━━ PROBABILITY BY CHANNEL ━━
Email (tried): ~12% for this prospect
LinkedIn: ~34% (he's very active)
Phone: ~28%
SMS: ~19%`,
    prompt:"Channel switch triggered. Prospect: {prospect_data}. Emails sent without open: {email_count}. Switching to: {next_channel}. Generate channel-appropriate outreach with timing plan."
  },
  {
    id:"14", name:"Referral Request Automator", category:"Growth", status:"active",
    trigger:"Deal marked as Closed Won (3 days after)",
    action:"AI sends perfectly-timed, personalized referral request to new customer",
    runs:7, saved:"45 min/deal", color:"#60a5fa", bg:"rgba(96,165,250,0.08)",
    icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    what_it_does:"Three days after a deal closes, AI sends a personalized referral request when the customer is at peak satisfaction. Identifies specific people in their network who match your ICP and asks for warm introductions by name.",
    why_it_matters:"Referred customers close 4x faster, churn 37% less, and have 25% higher LTV. Most reps never ask because they forget or feel awkward. This does it automatically at the perfect moment.",
    example_output:`🤝 REFERRAL REQUEST SENT

To: James Morrison (just closed — 3 days ago)
Status: Onboarding going well (positive signals)

━━ AI-CRAFTED REFERRAL REQUEST ━━

Subject: One quick favor — worth 20 seconds

James,

So glad we got the Stripe SDR team set up — seeing some early promising numbers on the personalization scores.

Quick ask: I noticed you're connected with a few people who might benefit from this.

Specifically, I saw you know:
• David Park — VP Sales @ Rippling (similar SDR team challenges)
• Lisa Chen — Head of Sales @ Brex (Series C, scaling fast)

Would you be open to a quick intro to either? Even a "James Morrison suggested I reach out" email from you would be huge.

In exchange, happy to do the same for anyone you're trying to reach. 

No pressure at all — just thought I'd ask.

[SEND] [EDIT NAMES] [SKIP]

━━ REFERRAL TRACKING ━━
Referral sent to: James Morrison
Prospects suggested: David Park (Rippling), Lisa Chen (Brex)
Expected response: 3-5 days`,
    prompt:"Referral request trigger. Won customer: {customer_data}. Deal closed: {close_date}. Customer's LinkedIn connections matching ICP: {matching_connections}. Write personalized referral request mentioning specific people by name."
  },
  {
    id:"15", name:"AI Proposal Generator", category:"Closing", status:"active",
    trigger:"Prospect requests a proposal or pricing",
    action:"AI generates fully customized proposal with ROI calc in under 60 seconds",
    runs:12, saved:"6.2 hrs/deal", color:"#a78bfa", bg:"rgba(167,139,250,0.08)",
    icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    what_it_does:"When a prospect asks for a proposal, AI generates a fully customized one in 60 seconds. Pulls from all conversation history, calculates personalized ROI based on their team size and current tools, and recommends the right plan.",
    why_it_matters:"Generic proposals lose deals. Personalized proposals with specific ROI calculations close at 3x the rate. Most reps spend 3-4 hours on proposals and still send generic decks.",
    example_output:`📄 CUSTOM PROPOSAL GENERATED

For: TechNova Solutions | Ahmed Raza, Marketing Manager
Generated in: 47 seconds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SALESFORGE AI — CUSTOM PROPOSAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY
We help TechNova's 12-person sales team automate 
the research-to-outreach workflow, cutting prep time 
by 70% and increasing reply rates from 8% to 28%+.

THE PROBLEM WE'RE SOLVING FOR TECHNOVA
Based on our conversations, your team faces:
• 12 sales reps spending avg 3hrs/day on manual research
• 8-12% cold email reply rates
• No LinkedIn automation (missing high-intent channel)
• Manually updating CRM after every interaction

THE MATH (your specific numbers):
Current state:
• 12 reps × 3hrs research/day = 36 hrs/day wasted
• At $50/hr blended rate = $1,800/day = $450,000/year

With SalesForge AI (Pro Plan):
• Research automated → 36hrs saved daily
• Reply rates: 8% → 25%+ (310% improvement)
• Meetings booked: 3x increase
• Annual value created: $450K in time + 3x pipeline

Investment: $948/year (Pro Plan, 1 seat)
ROI: 47,000%+ in year 1

RECOMMENDED PLAN: Pro ($79/month)
Includes: Unlimited prospects, all 10 AI agents, 
15 automations, email sending (10K/mo)

IMPLEMENTATION TIMELINE:
Week 1: Account setup + prospect import
Week 2: First sequences live
Week 3: AI agents activated
Week 4: Full automation running

NEXT STEPS:
1. Sign up at salesforge.ai/signup (5 minutes)
2. Import your prospect list (CSV upload)
3. 30-min onboarding call with our team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SEND TO AHMED] [EXPORT PDF] [CUSTOMIZE]`,
    prompt:"Proposal requested. Prospect: {prospect_data}. Conversation history: {history}. Team size: {team_size}. Current tools: {current_tools}. Pain points: {pain_points}. Generate fully customized proposal with specific ROI calculation."
  },
];

const CATEGORIES = ["All","Prospecting","Outreach","Alerts","Meetings","Pipeline","Inbox","CRM","Intelligence","Analytics","Growth","Closing"];

export default function AutomationsPage() {
  const { user, loading, handleLogout } = useAuth();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<typeof AUTOMATIONS[0]|null>(null);
  const [automations, setAutomations] = useState(AUTOMATIONS);
  const [running, setRunning] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const filtered = automations.filter(a=>filter==="All"||a.category===filter);
  const activeCount = automations.filter(a=>a.status==="active").length;
  const totalRuns = automations.reduce((s,a)=>s+a.runs,0);

  const toggleAuto = (id:string) => {
    setAutomations(prev=>prev.map(a=>a.id===id?{...a,status:a.status==="active"?"paused":"active"}:a));
    const a = automations.find(x=>x.id===id);
    showToast(a?.status==="active"?`${a.name} paused`:`${a?.name} activated ⚡`);
  };

  const runTest = async () => {
    if (!selected) return;
    setRunning(true); setAiOutput("");
    try {
      const prompt = testInput.trim() ||
        `Run this automation: "${selected.name}". Trigger: "${selected.trigger}". Action: "${selected.action}". Prospect example: Ahmed Raza, Marketing Manager at TechNova Solutions (SaaS, 50-200 employees). They recently posted about scaling outbound sales. Company raised $5M seed round last month.`;
      const res = await fetch("/api/ai", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:"emailWriter", prompt, userId:user?.uid }),
      });
      const data = await res.json();
      if (data.error) {
        setAiOutput(data.upgrade
          ? `⚠️ ${data.error}\n\nUpgrade at /dashboard/pricing`
          : `Error: ${data.error}`);
      } else {
        // Show the example output for clarity, then AI result
        setAiOutput(selected.example_output + "\n\n━━ YOUR LIVE AI OUTPUT ━━\n\n" + data.result);
      }
    } catch(err:any) { setAiOutput(`Error: ${err.message}`); }
    setRunning(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",background:S.bg,display:"grid",placeItems:"center" }}>
      <div style={{ width:36,height:36,border:"3px solid rgba(200,255,0,0.2)",borderTopColor:S.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif" }}>
      {toast&&<div style={{ position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:"1px solid rgba(200,255,0,0.3)",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:600,color:S.accent,zIndex:300,whiteSpace:"nowrap" }}>{toast}</div>}
      <Sidebar active="automations" user={user} onLogout={handleLogout}/>
      <div style={{ marginLeft:240,padding:"28px 32px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24 }}>
          <div>
            <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:S.text,letterSpacing:"-0.03em",marginBottom:4 }}>Automation Workflows</h1>
            <p style={{ color:S.muted,fontSize:14 }}>
              <span style={{ color:S.accent,fontWeight:700 }}>15 real AI automations</span> — Apollo has basic task reminders. We have autonomous workflows.
            </p>
          </div>
          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
            <div style={{ padding:"8px 16px",background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,textAlign:"center" }}>
              <div style={{ fontSize:20,fontWeight:800,color:S.accent,fontFamily:"Syne,sans-serif" }}>{activeCount}</div>
              <div style={{ fontSize:11,color:S.faint }}>Active</div>
            </div>
            <div style={{ padding:"8px 16px",background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,textAlign:"center" }}>
              <div style={{ fontSize:20,fontWeight:800,color:"#818cf8",fontFamily:"Syne,sans-serif" }}>{totalRuns.toLocaleString()}</div>
              <div style={{ fontSize:11,color:S.faint }}>Total Runs</div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:12,fontWeight:700,color:S.accent,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",padding:"8px 16px",borderRadius:999 }}>
              <span style={{ width:7,height:7,background:S.accent,borderRadius:"50%",display:"inline-block",animation:"ping 1.5s infinite" }}/>{activeCount} Running
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24 }}>
          {[
            { label:"Time Saved Today",value:"38.4 hrs",color:S.accent },
            { label:"Emails Automated",value:"4,891",color:"#818cf8" },
            { label:"Leads Enriched",value:"1,284",color:"#34d399" },
            { label:"Deals Rescued",value:"23",color:"#f59e0b" },
          ].map(s=>(
            <div key={s.label} style={{ background:S.panel,border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontSize:12,color:S.faint }}>{s.label}</span>
              <span style={{ fontSize:18,fontWeight:800,color:s.color,fontFamily:"Syne,sans-serif" }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:20 }}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setFilter(c)}
              style={{ fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:999,border:`1px solid ${filter===c?"rgba(200,255,0,0.3)":S.lineSoft}`,background:filter===c?"rgba(200,255,0,0.08)":"transparent",color:filter===c?S.accent:S.faint,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all 0.2s" }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 460px":"1fr",gap:20 }}>
          {/* Grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14,alignContent:"start" }}>
            {filtered.map(auto=>(
              <div key={auto.id}
                onClick={()=>{ setSelected(selected?.id===auto.id?null:auto); setAiOutput(""); setTestInput(""); }}
                style={{ background:S.panel,border:`1px solid ${selected?.id===auto.id?"rgba(200,255,0,0.3)":S.lineSoft}`,borderRadius:14,padding:20,cursor:"pointer",transition:"all 0.2s" }}
                onMouseEnter={e=>{ if(selected?.id!==auto.id)(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.1)"; }}
                onMouseLeave={e=>{ if(selected?.id!==auto.id)(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft; }}>

                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:38,height:38,borderRadius:10,background:auto.bg,border:`1px solid ${auto.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={auto.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={auto.icon}/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:S.text }}>{auto.name}</div>
                      <span style={{ fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:999,background:"rgba(255,255,255,0.05)",color:S.faint }}>{auto.category}</span>
                    </div>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); toggleAuto(auto.id); }}
                    style={{ width:40,height:22,borderRadius:999,border:"none",cursor:"pointer",background:auto.status==="active"?S.accent:"rgba(255,255,255,0.1)",transition:"all 0.3s",position:"relative",flexShrink:0 }}>
                    <div style={{ position:"absolute",top:2,left:auto.status==="active"?20:2,width:18,height:18,borderRadius:"50%",background:auto.status==="active"?"#050505":"rgba(255,255,255,0.4)",transition:"all 0.3s" }}/>
                  </button>
                </div>

                {/* Trigger → Action */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:6,marginBottom:12,alignItems:"center" }}>
                  <div style={{ background:"rgba(255,255,255,0.02)",border:`1px solid ${S.lineSoft}`,borderRadius:8,padding:"8px 10px" }}>
                    <div style={{ fontSize:9,fontWeight:700,color:S.faint,textTransform:"uppercase",marginBottom:3 }}>WHEN</div>
                    <div style={{ fontSize:11,color:S.muted,lineHeight:1.4 }}>{auto.trigger}</div>
                  </div>
                  <div style={{ color:auto.color,fontSize:16 }}>→</div>
                  <div style={{ background:`${auto.color}08`,border:`1px solid ${auto.color}22`,borderRadius:8,padding:"8px 10px" }}>
                    <div style={{ fontSize:9,fontWeight:700,color:auto.color,textTransform:"uppercase",marginBottom:3 }}>THEN</div>
                    <div style={{ fontSize:11,color:S.muted,lineHeight:1.4 }}>{auto.action}</div>
                  </div>
                </div>

                <p style={{ fontSize:12,color:S.faint,lineHeight:1.6,marginBottom:10 }}>{auto.what_it_does}</p>

                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ display:"flex",gap:12 }}>
                    <span style={{ fontSize:11,color:S.faint }}><span style={{ color:auto.color,fontWeight:700 }}>{auto.runs.toLocaleString()}</span> runs</span>
                    <span style={{ fontSize:11,color:S.faint }}><span style={{ color:"#34d399",fontWeight:700 }}>{auto.saved}</span> saved</span>
                  </div>
                  <span style={{ fontSize:11,fontWeight:700,color:auto.status==="active"?"#34d399":S.faint }}>
                    {auto.status==="active"?"● Active":"○ Paused"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected&&(
            <div style={{ background:S.panel,border:"1px solid rgba(200,255,0,0.2)",borderRadius:16,padding:24,height:"fit-content",position:"sticky",top:28,maxHeight:"calc(100vh - 56px)",overflowY:"auto" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:selected.bg,border:`1px solid ${selected.color}33`,display:"grid",placeItems:"center",flexShrink:0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={selected.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={selected.icon}/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:S.text }}>{selected.name}</div>
                  <div style={{ fontSize:11,color:S.faint }}>{selected.category} · {selected.runs} runs · {selected.saved} saved</div>
                </div>
                <button onClick={()=>{ setSelected(null); setAiOutput(""); }} style={{ background:"none",border:"none",cursor:"pointer",color:S.faint }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Why it matters */}
              <div style={{ padding:"12px 14px",borderRadius:10,background:"rgba(200,255,0,0.04)",border:"1px solid rgba(200,255,0,0.12)",fontSize:12,color:S.muted,lineHeight:1.7,marginBottom:14 }}>
                <span style={{ color:S.accent,fontWeight:700 }}>Why this beats Apollo: </span>{selected.why_it_matters}
              </div>

              {/* Example Output */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8 }}>Example Output</div>
                <pre style={{ fontSize:11,color:S.muted,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"'JetBrains Mono','Fira Code',monospace",background:"rgba(0,0,0,0.3)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"12px 14px",maxHeight:280,overflow:"auto" }}>{selected.example_output}</pre>
              </div>

              {/* Test input */}
              <div style={{ fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6 }}>Live Test (optional)</div>
              <textarea value={testInput} onChange={e=>setTestInput(e.target.value)}
                placeholder="Add specific prospect details to test with real data, or leave empty to use default example..."
                style={{ width:"100%",minHeight:80,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,padding:"10px 12px",color:S.text,fontSize:12,fontFamily:"Inter,sans-serif",outline:"none",resize:"vertical",lineHeight:1.6,marginBottom:12 }}
                onFocus={e=>(e.target as HTMLTextAreaElement).style.borderColor="rgba(200,255,0,0.3)"}
                onBlur={e=>(e.target as HTMLTextAreaElement).style.borderColor=S.lineSoft}/>

              <button onClick={runTest} disabled={running||selected.status==="paused"}
                style={{ width:"100%",padding:"12px",borderRadius:10,border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"Inter,sans-serif",marginBottom:aiOutput?14:0,
                  background:selected.status==="paused"?"rgba(255,255,255,0.05)":running?"rgba(200,255,0,0.6)":S.accent,
                  color:selected.status==="paused"?S.faint:"#050505",
                  fontSize:13,fontWeight:700,cursor:running||selected.status==="paused"?"not-allowed":"pointer" }}>
                {running
                  ?<><span style={{ width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>Running automation...</>
                  :selected.status==="paused"?"Paused — Toggle to Activate"
                  :<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Run Automation Test</>}
              </button>

              {aiOutput&&(
                <div style={{ background:"rgba(0,0,0,0.3)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:"14px 16px" }}>
                  <div style={{ fontSize:10,fontWeight:700,color:S.accent,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>⚡ Live Output</div>
                  <pre style={{ fontSize:12,color:S.text,lineHeight:1.75,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif",margin:"0 0 10px" }}>{aiOutput}</pre>
                  <button onClick={()=>navigator.clipboard.writeText(aiOutput).then(()=>showToast("Copied ✓"))}
                    style={{ padding:"6px 14px",borderRadius:8,background:"rgba(200,255,0,0.08)",border:"1px solid rgba(200,255,0,0.2)",color:S.accent,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif" }}>
                    Copy Output
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#050505}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{0%,100%{box-shadow:0 0 0 0 rgba(200,255,0,0.4)}50%{box-shadow:0 0 0 6px rgba(200,255,0,0)}}
        textarea::placeholder{color:#555a66;font-size:12px}
        button:focus{outline:none}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
      `}</style>
    </div>
  );
}
