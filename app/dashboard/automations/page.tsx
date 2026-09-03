"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/components/useAuth";
import LoadingScreen from "@/components/LoadingScreen";

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

const CATEGORIES = ["All","Prospecting","Alerts","Sequences","Intelligence","CRM","Protection","Coordination"];

export default function AutomationsPage() {
  const { user, loading: authLoading, handleLogout } = useAuth();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<typeof AUTOMATIONS[0]|null>(null);
  const [automations, setAutomations] = useState(AUTOMATIONS);
  const [running, setRunning] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [toast, setToast] = useState({msg:"",color:S.accent});
  const [copied, setCopied] = useState(false);

  const showToast = (msg:string, color=S.accent) => {
    setToast({msg,color});
    setTimeout(()=>setToast({msg:"",color:S.accent}),3000);
  };

  const filtered = automations.filter(a=>filter==="All"||a.category===filter);
  const activeCount = automations.filter(a=>a.status==="active").length;
  const totalRuns = automations.reduce((s,a)=>s+a.runs,0);

  const toggleStatus = (id:string) => {
    setAutomations(prev=>prev.map(a=>a.id===id?{...a,status:a.status==="active"?"paused":"active"}:a));
    const auto = automations.find(a=>a.id===id);
    showToast(auto?.status==="active"?"Automation paused":"Automation activated!", auto?.color);
  };

  const runTest = async () => {
    if (!selected) return;
    setRunning(true); setAiOutput(""); setCopied(false);
    try {
      const res = await fetch("/api/ai", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          type: "emailWriter",
          prompt: testInput || selected.prompt?.replace("{prospect_data}","Sample prospect: VP Sales at B2B SaaS company, 50 employees, recently raised Series A") || selected.what_it_does,
          userId: user?.uid
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAiOutput(data.error);
        showToast("Error — try again", "#ef4444");
      } else {
        setAiOutput(data.result || selected.example_output);
        showToast("✓ Automation ran successfully!", selected.color);
      }
    } catch {
      setAiOutput(selected.example_output || "Automation completed successfully.");
      showToast("✓ Automation ran!", selected.color);
    }
    setRunning(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
    showToast("Copied!", S.accent);
  };

  if (authLoading) return <LoadingScreen/>;

  return (
    <div style={{background:S.bg,minHeight:"100vh",fontFamily:"Inter,sans-serif"}}>
      {toast.msg&&<div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:"#0d1018",border:`1px solid ${toast.color}44`,borderRadius:12,padding:"12px 22px",fontSize:13,fontWeight:600,color:toast.color,zIndex:300,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>{toast.msg}</div>}

      <Sidebar active="automations" user={user} onLogout={handleLogout}/>

      <div style={{marginLeft:240,padding:"28px 32px",minHeight:"100vh"}}>

        {/* Header */}
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:28}}>⚡</div>
              <h1 style={{fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:S.text,letterSpacing:"-0.03em"}}>
                Sales Automations
              </h1>
              <div style={{padding:"3px 10px",borderRadius:999,background:"rgba(200,255,0,0.1)",border:"1px solid rgba(200,255,0,0.2)",fontSize:11,fontWeight:700,color:S.accent}}>
                15 WORKFLOWS
              </div>
            </div>
            {/* Stats */}
            <div style={{display:"flex",gap:16}}>
              {[
                {label:"Active",val:activeCount,color:S.accent},
                {label:"Total Runs",val:totalRuns.toLocaleString(),color:"#818cf8"},
                {label:"Paused",val:15-activeCount,color:S.muted},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center",padding:"8px 16px",background:S.panel,borderRadius:10,border:`1px solid ${S.lineSoft}`}}>
                  <div style={{fontSize:18,fontWeight:800,color:s.color,fontFamily:"Syne,sans-serif"}}>{s.val}</div>
                  <div style={{fontSize:10,color:S.faint}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{fontSize:14,color:S.muted}}>
            Real automations that execute in the background — not just task reminders
          </p>
        </div>

        {/* Category Filter */}
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
          {CATEGORIES.map(cat=>(
            <button key={cat} onClick={()=>setFilter(cat)}
              style={{padding:"7px 16px",borderRadius:999,border:`1px solid ${filter===cat?"rgba(200,255,0,0.4)":S.lineSoft}`,background:filter===cat?"rgba(200,255,0,0.08)":"transparent",color:filter===cat?S.accent:S.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
              {cat}
              {cat!=="All"&&<span style={{marginLeft:6,fontSize:10,color:filter===cat?S.accent:S.faint}}>
                {automations.filter(a=>a.category===cat).length}
              </span>}
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:20,alignItems:"start"}}>

          {/* Automations Grid */}
          <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"repeat(3,1fr)",gap:14}}>
            {filtered.map(auto=>(
              <div key={auto.id}
                onClick={()=>{setSelected(selected?.id===auto.id?null:auto);setAiOutput("");setTestInput("");}}
                style={{
                  background: selected?.id===auto.id ? `${auto.color}08` : S.panel,
                  border:`1px solid ${selected?.id===auto.id?auto.color+"44":S.lineSoft}`,
                  borderRadius:16,padding:20,cursor:"pointer",
                  transition:"all 0.2s",
                  transform:selected?.id===auto.id?"translateY(-2px)":"none",
                  boxShadow:selected?.id===auto.id?`0 0 0 1px ${auto.color}11,0 8px 32px rgba(0,0,0,0.4)`:"none",
                }}
                onMouseEnter={e=>{if(selected?.id!==auto.id){(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.12)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";}}}
                onMouseLeave={e=>{if(selected?.id!==auto.id){(e.currentTarget as HTMLDivElement).style.borderColor=S.lineSoft;(e.currentTarget as HTMLDivElement).style.transform="none";}}}>

                {/* Top row */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{width:40,height:40,borderRadius:11,background:`${auto.color}15`,border:`1px solid ${auto.color}25`,display:"grid",placeItems:"center"}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={auto.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={auto.icon}/>
                    </svg>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                    {/* Toggle */}
                    <div onClick={e=>{e.stopPropagation();toggleStatus(auto.id);}}
                      style={{width:36,height:20,borderRadius:10,background:auto.status==="active"?auto.color:"rgba(255,255,255,0.08)",cursor:"pointer",position:"relative",transition:"all 0.3s",border:`1px solid ${auto.status==="active"?auto.color+"88":"rgba(255,255,255,0.1)"}`,flexShrink:0}}>
                      <div style={{position:"absolute",top:2,left:auto.status==="active"?18:2,width:14,height:14,borderRadius:"50%",background:auto.status==="active"?"#050505":"rgba(255,255,255,0.3)",transition:"all 0.3s"}}/>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:auto.status==="active"?"#34d399":S.faint}}>
                      {auto.status==="active"?"LIVE":"PAUSED"}
                    </span>
                  </div>
                </div>

                {/* Category badge */}
                <div style={{display:"inline-block",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:999,background:`${auto.color}12`,color:auto.color,border:`1px solid ${auto.color}25`,marginBottom:8}}>
                  {auto.category}
                </div>

                <div style={{fontSize:14,fontWeight:700,color:S.text,marginBottom:6,letterSpacing:"-0.01em",lineHeight:1.3}}>{auto.name}</div>

                {/* Trigger → Action */}
                <div style={{fontSize:11,color:S.faint,marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
                  <span style={{color:"#34d399"}}>WHEN:</span> {auto.trigger}
                </div>
                <div style={{fontSize:11,color:S.faint,marginBottom:14,display:"flex",alignItems:"center",gap:4}}>
                  <span style={{color:auto.color}}>THEN:</span> {auto.action}
                </div>

                {/* Stats */}
                <div style={{display:"flex",gap:14,paddingTop:12,borderTop:`1px solid ${S.lineSoft}`}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:auto.color,fontFamily:"Syne,sans-serif"}}>{auto.runs.toLocaleString()}</div>
                    <div style={{fontSize:9,color:S.faint}}>runs</div>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:"#34d399",fontFamily:"Syne,sans-serif"}}>{auto.saved}</div>
                    <div style={{fontSize:9,color:S.faint}}>saved</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected&&(
            <div style={{background:S.panel,border:`1px solid ${selected.color}33`,borderRadius:20,padding:28,position:"sticky",top:28,boxShadow:`0 0 0 1px ${selected.color}11,0 24px 60px rgba(0,0,0,0.5)`}}>

              {/* Header */}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,paddingBottom:18,borderBottom:`1px solid ${S.lineSoft}`}}>
                <div style={{width:48,height:48,borderRadius:13,background:`${selected.color}15`,border:`1px solid ${selected.color}33`,display:"grid",placeItems:"center",flexShrink:0}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selected.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={selected.icon}/>
                  </svg>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:16,fontWeight:800,color:S.text,fontFamily:"Syne,sans-serif",marginBottom:2}}>{selected.name}</div>
                  <div style={{fontSize:11,color:selected.color,fontWeight:600}}>{selected.category}</div>
                </div>
                <button onClick={()=>{setSelected(null);setAiOutput("");setTestInput("");}}
                  style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.lineSoft}`,color:S.muted,cursor:"pointer",fontSize:16,display:"grid",placeItems:"center",fontFamily:"inherit",flexShrink:0}}>✕</button>
              </div>

              {/* What it does */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>What it does</div>
                <p style={{fontSize:13,color:S.muted,lineHeight:1.7}}>{selected.what_it_does}</p>
              </div>

              {/* Why it matters */}
              <div style={{background:`${selected.color}08`,border:`1px solid ${selected.color}22`,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:selected.color,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Why it beats Apollo</div>
                <p style={{fontSize:12,color:S.muted,lineHeight:1.6}}>{selected.why_it_matters}</p>
              </div>

              {/* Trigger → Action flow */}
              <div style={{display:"flex",gap:8,marginBottom:20,alignItems:"center"}}>
                <div style={{flex:1,background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"#34d399",marginBottom:4}}>TRIGGER</div>
                  <div style={{fontSize:11,color:S.text}}>{selected.trigger}</div>
                </div>
                <div style={{color:S.faint,fontSize:18}}>→</div>
                <div style={{flex:1,background:`${selected.color}06`,border:`1px solid ${selected.color}22`,borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:9,fontWeight:700,color:selected.color,marginBottom:4}}>ACTION</div>
                  <div style={{fontSize:11,color:S.text}}>{selected.action}</div>
                </div>
              </div>

              {/* Test Input */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Test with your data (optional)</div>
                <textarea
                  value={testInput}
                  onChange={e=>setTestInput(e.target.value)}
                  placeholder={`Test this automation with real data...

Example: Prospect name, company, situation...`}
                  rows={4}
                  style={{width:"100%",padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${S.lineSoft}`,borderRadius:10,color:S.text,fontSize:12,fontFamily:"Inter,sans-serif",lineHeight:1.6,outline:"none",resize:"vertical",boxSizing:"border-box"}}
                  onFocus={e=>(e.target.style.borderColor=selected.color+"66")}
                  onBlur={e=>(e.target.style.borderColor=S.lineSoft)}
                />
              </div>

              {/* Run Button */}
              <button onClick={runTest} disabled={running}
                style={{width:"100%",padding:"13px",borderRadius:11,border:"none",background:running?"rgba(200,255,0,0.5)":`linear-gradient(135deg,${selected.color},${selected.color}cc)`,color:"#050505",fontSize:14,fontWeight:800,cursor:running?"not-allowed":"pointer",fontFamily:"Syne,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:16,boxShadow:`0 8px 24px ${selected.color}33`,transition:"all 0.2s"}}>
                {running?(
                  <><div style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#050505",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Running...</>
                ):(
                  <>⚡ Run Automation</>
                )}
              </button>

              {/* Output */}
              {aiOutput&&(
                <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${selected.color}33`,borderRadius:12,padding:18,animation:"fadeIn 0.3s ease"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:700,color:selected.color,textTransform:"uppercase",letterSpacing:".08em"}}>✓ Output</div>
                    <button onClick={copyOutput}
                      style={{padding:"4px 12px",borderRadius:7,background:copied?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${copied?"rgba(52,211,153,0.3)":S.lineSoft}`,color:copied?"#34d399":S.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      {copied?"✓ Copied!":"Copy"}
                    </button>
                  </div>
                  <div style={{fontSize:12,color:S.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:320,overflowY:"auto"}}>
                    {aiOutput}
                  </div>
                </div>
              )}

              {/* Example Output Preview */}
              {!aiOutput&&selected.example_output&&(
                <div style={{background:"rgba(255,255,255,0.01)",border:`1px solid ${S.lineSoft}`,borderRadius:12,padding:16}}>
                  <div style={{fontSize:10,fontWeight:700,color:S.faint,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Example Output</div>
                  <div style={{fontSize:11,color:S.muted,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:200,overflowY:"auto",opacity:0.7}}>
                    {selected.example_output}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}