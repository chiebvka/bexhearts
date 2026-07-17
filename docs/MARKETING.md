# MARKETING.md — Bexhearts Go-To-Market Playbook

> **What this file is:** the **sequenced marketing action plan** for Bexhearts — what we do, in what order, to get installs and paying couples. It's the marketing twin of `docs/STEPS.md`. The wisdom of the creators we studied (Marc Lou, Jack Friks, Roman Khaves, Alex Nguyen, Rob Hallam, Adrià Martinez/@adriamatz, + the Reel Farm/faceless toolset) is **digested into our moves here**, not quoted.
>
> **How to use it:**
> - Part 1 is the **sequenced playbook** (M0→M5) — work it in order; timing is tied to dev progress in `docs/STEPS.md`.
> - Part 2 is the **reusable toolkit** the steps pull from (angle map, prompt templates, ASO, seasonal, outreach scripts, guardrails, metrics).
> - When app **features change in `PROGRESS.md`**, update the **feature→angle map** (§2.2) and any affected prompt templates — same pass (cross-update rule in `CLAUDE.md`/`AGENTS.md`).
>
> **Our reality (the constraints every decision respects):** solo founder · ~$0 budget · faith niche (paid religious *targeting* is restricted on Meta/Google, so **organic is the moat, not the fallback**) · US-targeted accounts already created · beachhead = the **dating → engaged → newlywed** Christian-couple journey · positioning = **faith-forward, unapologetic** (see `PROGRESS.md`).
>
> **North-star metric:** *weekly-active linked couples.* (A linked, active couple is the unit that retains and converts — not raw installs.)
>
> **👉 Current position (2026-07-10):** _Pre-launch, M1/M2 in motion._ TikTok account #1 (Faith & Intentional Love theme) is live with 3 posts (~2.7k views, ~150 likes — healthy for a cold account; judge by saves/profile visits, not views). FB + IG accounts starting soon (cross-post the same slideshows). The Codex handoff workbook (`/Users/Ebuka/Documents/VPS-agents/codex-bexhearts-marketing-handoff-2026-06-29/`) holds the first 40 posts (4 theme accounts × 10, Claude Code vs Codex labeled) + the Conversion Tracker. **Approved 2026-07-10 (owner): the 2-month production run — see §2.10.** First wave stays **waitlist-CTA** (store publish realistically ~2 weeks out; flip to download wording at launch). **UPDATE 2026-07-12: the waitlist page EXISTS** — the landing site (`/Users/Ebuka/Projects/bexheartslandingcodex` → **bexhearts.com**, owner-purchased domain) has a Supabase-backed waitlist form w/ UTM capture, a per-couple pricing section, FAQ + FAQPage/SoftwareApplication structured data, full privacy/terms pages mirrored from the legal drafts, a **12-post SEO blog** (8 articles adapted from our content angles), and an expanded `llms.txt` for AI-search discoverability. L2/L3 CTAs unblock once the owner deploys it + points DNS. Link-in-bio should use per-platform UTM params so the Conversion Tracker's link-click column works.

---

# PART 1 — THE SEQUENCED PLAYBOOK

> Step template: **Goal · When · Actions · Asset produced · Success metric.**
> Honest sequencing: M0–M1's *cheap compounding* moves start **now**, in parallel with dev. The *heavy* push (M3+) waits until the app actually works — post-Stage-D / first dev build in `STEPS.md`. Don't pour hours into content for an app nobody can install yet.

## M0 — Pre-launch foundation
**Goal:** every cheap, compounding asset is in place before we make noise.
**When:** now (parallel to dev Stages A–C).
**Actions:**
- Lock the **brand voice** (warm, real, couple-to-couple; never preachy or salesy) and the **ICP one-liner** per stage (dating / engaged / newlywed).
- **Claim every handle** now — TikTok, IG, YouTube, X — even if dormant. Decide the account model: start with **1 main brand account + 1 founder X account**; plan room for **2–3 faceless stage-themed accounts** later (M4) à la the multi-account approach.
- Stand up a **waitlist landing page** (one promise, one email field, app-store "notify me"). This is the Marc Lou move — collect demand before launch.
- Pick the **tool stack** (see §2.3): generation = Reel Farm; distribution = Post Bridge/Postiz (custom TikTok API later); image-edit = GPT Image / Nano Banana for the "clone" approach.
- Wire **install attribution** so we can see which content converts *(product dependency — tracked in `PROGRESS.md`)*.
- Seed the **hook bank** (§2.4) with 20–30 hooks across pain/desire/curiosity/proof/POV/green-flag.
**Asset:** live waitlist page, claimed handles, tool stack, v1 hook bank.
**Success metric:** page live + first waitlist emails trickling in.

## M1 — Build the audience before launch
**Goal:** an audience exists on day one, not zero.
**When:** dev Stages B–D (app taking shape, not yet launched).
**Actions:**
- Start **build-in-public on X** (the Marc Lou / Rob Hallam engine): ship updates, screenshots, the "why I'm building a faith app for couples" story. The founder account *is* a distribution channel.
- Begin **warm-up content** on the brand account at low volume — establish the niche, test a few hooks, learn the editor. Treat new accounts gently (see publishing rules in §2.3).
- Grow the **waitlist** by pointing early content + X at it.
- **Seed partnerships** early (M4 scales them): start a target list of pastors, premarital programs, and Christian couple-creators; begin genuine relationships, no ask yet.
**Asset:** a posting habit, an X presence, a warmed waitlist, a partnership pipeline.
**Success metric:** consistent posting cadence held for 2–3 weeks; waitlist growing.

## M2 — The content engine (the daily machine)
**Goal:** a repeatable system that produces on-brand content in ~5–15 min/session, not hours.
**When:** ramps as the app becomes demoable (post-Stage-D core loop works).
**Actions — the workflow (digested from @adriamatz + Jack Friks):**
1. **Format priority:** slideshows first (reach + cheap + scale), then UGC/talking + "texting-stories" (convert), then build-in-public clips. (Why slideshows: the slide-1 hook forces a *swipe* = real intent, no editing timeline, one pipeline outputs many.)
2. **Fixed slideshow structure, never deviate:** slide 1 = **hook**; middle = **story / context / proof**; last (or second-to-last if long) = **CTA**. Structure consistency frees all your energy for the hook — the only slide that decides if the rest get seen.
3. **Clone, don't template:** find proven faith/couple slideshows, mirror their *structure and rhythm* with **our real assets** — real app screens, real scripture cards, authentic couple aesthetic — never generic Pinterest stock. The specificity is what converts; templating with stock keeps the skeleton and loses the soul.
4. **In-story, native CTA:** type the **hook and CTA text natively in the TikTok editor** (native text out-reaches baked-in text), and phrase the CTA *inside the story* — "we've done this every night for 3 weeks using this app," not "download now."
5. **Cross-post everywhere** (Jack Friks): the same piece → TikTok, IG Reels, YT Shorts, (and repurposed to X). ~1 hr/day, consistency over virality.
6. **Test hooks, scale winners** (Roman Khaves / UGC playbook): 3 hooks per concept, same body; let the winner earn more effort. Generate cheap variants with AI, scale the ones that land.
**Asset:** a daily content habit + a growing record of what works.
**Success metric:** ≥3–4 slideshows/week sustained; saves + profile visits + link-in-bio clicks trending up.

## M3 — Launch
**Goal:** convert the warmed audience + waitlist into installs and linked couples.
**When:** first public build is live (post first dev build / store availability in `STEPS.md` Stage J).
**Actions:**
- **ASO live** (§2.5): stage keywords, screenshots that show the *couple* benefit, a preview video.
- **Waitlist → install** push (email + "we're live" content burst).
- A **launch content wave** across all accounts; the founder X launch thread.
- Optional **Product Hunt / faith-community launch** (Reddit r/Christianity-adjacent, Christian Facebook groups, relevant Discords) — value-first, not spammy.
**Asset:** live store listing + a launch spike.
**Success metric:** first cohort of **linked couples** (north star), install→link rate visible.

## M4 — Growth & optimization
**Goal:** turn the engine from "posting" into "compounding."
**When:** post-launch, ongoing.
**Actions:**
- **Build the pattern library** (@adriamatz's core idea): never throw away a winning post's analysis. Store hook/structure/CTA/rhythm + the source framing + per-account history. Over weeks it becomes a library of *proven-in-our-niche* patterns; promote the best to canonical archetypes. The bottleneck shifts from *production* to *judgment* — which is where you want your time.
- **Propose from the library:** once it's dense, generate fresh posts from the whole history (anti-repeat: no angle reused within 14 days; rotate to niche corners untouched 30+ days). Keep a **human gate** — review proposals before they queue.
- **Scale accounts & automation by maturity:** new accounts post manually; aged (2 wk+) accounts move to drafts via Postiz/Genviral or a **custom TikTok API** integration (free, full control — a few hours to build).
- **Spin up the stage-themed faceless accounts** (dating / engaged / newlywed) once the main account proves the formats.
- **Scale partnerships:** convert the M1 relationships into creator collabs, church small-group pilots, premarital-counselor referrals.
- **Seasonal campaigns** (§2.6) and **referral** (couple-invites-couple is native to the product).
- **Cautious paid tests** only where faith targeting is allowed (creator whitelisting/Spark Ads on winning organic posts > cold interest targeting).
**Asset:** a compounding content library + partnership channel + seasonal calendar in motion.
**Success metric:** CAC trending toward ~$0, organic reach compounding, partnership installs measurable.

## M5 — Retention & premium conversion
**Goal:** keep couples active and move free → premium.
**When:** ongoing, post-launch.
**Actions:**
- **Ratings/reviews push** at in-app "aha" moments (answered prayer, day-30 streak).
- **Lifecycle content & notifications** aligned with the product (streak saves, partner nudges).
- **Conversion angles** matched to the content-volume gating model (`PROGRESS.md` Phase 5): content that showcases premium payoff — full history, all challenges, unlimited daily questions, comparison views, memories.
- **Win-back** for lapsed couples (a gentle "your partner is waiting" beat).
**Asset:** a retention + conversion loop.
**Success metric:** trial→paid rate; weekly-active linked couples retained.

---

# PART 2 — THE REUSABLE TOOLKIT

## 2.1 Operating principles (the "why" behind the steps)
1. **Organic is the moat, not the fallback** — forced on us by faith-targeting limits, and cheaper anyway.
2. **Consistency > virality** — ~1 hr/day, every platform, every day beats chasing one hit.
3. **Hook-first** — slide 1 / first 1.5 seconds is ~90% of the outcome; everything else is structure you don't rethink.
4. **Clone real, never template stock** — authenticity (real app, real scripture, real couples) is the conversion ingredient.
5. **In-story CTAs** — "we use this," not "download this."
6. **Compounding system** — keep every winner's pattern; let the library make the next post easier and smarter.
7. **Human gate on the things that matter** — proposals and posting rules get reviewed before they bake in; automate production, not judgment.
8. **Faceless & multi-account scalable** — but warm new accounts by hand; automate only aged ones.
9. **Monetization model = free trial → hard paywall (no freemium), billing per-COUPLE** (locked 2026-06-17). The invited partner inherits the subscription — never a second paywall. The trial unlocks everything, so content should sell the *during-trial* "aha" (invite partner → first devotional together) that converts trial → paid. Solo is a *state, not a segment* — we never market to singles. **Launch pricing (locked 2026-07-10, weekly added 2026-07-11): $79.99/yr + $12.99/mo + $6.99/wk — all three at launch, 3-day trial on each.** The per-couple framing is a content angle in itself ("one subscription, both of you").

## 2.2 Feature → content-angle map
> Update this table whenever features change in `PROGRESS.md`. Each angle is a content seed; pair with a hook from §2.4.
>
> **What's actually LIVE (2026-07-10) — content may show these as real:** daily devotionals (communal "today's devotional"), shared + personal prayers, **AI-composed prayer focus sessions**, weekly check-ins w/ partner comparison, boundaries & temptation plans, the **350-idea date library w/ couple ratings**, **Journal (Moments + Milestones/countdowns, multi-photo memories, reactions)**, streaks + **Us hub heatmap**, points + leaderboard, partner linking. **NOT yet built — waitlist/soon wording only:** daily question, daily mood, praying-for-you push, couple challenges, home-screen widget. *(This supersedes the stale "do not advertise" list in the 2026-06-29 Codex handoff's CONTENT_NOTES.md — milestones, memories timeline, and prayer sessions have shipped since it was written.)*

| Feature | Content angles |
|---|---|
| Daily devotional | "Green flag: a man who initiates devotionals 🙏" · "POV: we read a devotional together every night before bed" |
| Daily question (reveal) | "We answer the same question separately, then reveal — last night's wrecked me" · "The question that made us cry at 11pm" |
| Prayer journal | "We write our prayers down and check them off when God answers" · "6 months of answered prayers, swipe →" |
| Weekly check-in | "Our Sunday-night relationship check-in ritual" · "We rate our week 1–5 and talk about it" |
| Boundaries | "Boundaries we set as a Christian couple that saved us" · "Christian dating boundaries nobody talks about" — **UGC/acquisition engine: the in-app category taxonomy (purity/digital/friendships/…) doubles as a content calendar; each boundary template = one carousel/Reel w/ its scripture tie. UPDATE 2026-07-10: the template library v1 SHIPPED — 18 stage-aware boundary templates in `src/features/boundaries/templates.ts` are ready-made content seeds ("Holiday plans are decided by us first", "Purchases over $100 get a quick chat"…).** *(Temptation plans are deliberately NOT an ad unit — private/shame-laden; they're the depth/retention + testimonial engine instead. Product decision 2026-06-29.)* |
| Date ideas | "Christian date ideas that aren't just 'go to church'" · "$0 dates with a scripture tie" |
| Streak | "Day 90 of a devotional together 🔥" · "What a 100-day couple streak did for us" |
| Daily mood | "He sees my mood every morning and prays for me" |
| Praying-for-you tap | "The 'praying for you' button is my favorite thing in our marriage" |
| Couple challenges | "Starting the 7-day prayer challenge for couples — day 1" |
| Milestones/countdown | "Countdown to our wedding + a verse for every week" |
| Memories timeline | "Our first year together, told in answered prayers" |
| **Stage: dating** | "Christian dating green flags" · "How we stay pure while dating" |
| **Stage: engaged** | "Premarital questions every Christian couple should answer before the wedding" |
| **Stage: newlywed** | "First year of marriage as Christians — what no one warned us about" |

## 2.3 Tool stack & publishing rules
- **Generate:** Reel Farm (AI slideshows, UGC, hook generator, faceless avatars).
- **Clone/image-edit:** GPT Image / Nano Banana Pro — edit real source framing with our real app/scripture assets (don't generate from scratch).
- **Distribute:** Post Bridge or Postiz (cross-post + schedule); graduate aged accounts to a **custom TikTok API** integration (free, full control).
- **Publishing by account age (@adriamatz rule):**
  - **New (<2 wks):** post **manually** — same upload time / metadata / mechanism can look bot-like and *permanently* suppress reach.
  - **Aged (2 wks+, behaving):** push to drafts/scheduler.
- **Always manual, on purpose:** the hook + CTA **text typed natively in TikTok**; a human review of AI-proposed posts before they queue.

## 2.4 Hook bank (seed; grow it continuously)
Organize by category; build 3 variants per concept to test.
- **Pain:** "We almost broke up because we never prayed together." · "Christian couples don't talk about this."
- **Desire:** "I wanted a man who'd lead us spiritually — so we built a habit." · "The marriage we prayed for."
- **Curiosity:** "We answer the same question separately every night. Here's what happened." · "The app that changed our quiet time."
- **Proof:** "Day 90 of devotionals together." · "6 months of answered prayers."
- **POV:** "POV: your boyfriend asks to pray with you before the date." 
- **Green-flag / listicle:** "5 green flags in a Christian relationship." · "Christian date ideas under $0."

## 2.5 ASO checklist
- **Keywords:** target the uncontested intersection — *christian couples, couples devotional, prayer for couples, christian dating, premarital, marriage devotional, faith couple*. Beachhead terms per stage.
- **Title/subtitle:** lead with the couple+faith promise.
- **Screenshots:** show the *couple* benefit (two avatars, shared prayer, the reveal), not feature lists.
- **Preview video:** 15–20s of the core loop.
- **Reviews:** prompt at aha-moments (M5).

## 2.6 Seasonal calendar (recurring, free demand)
- **December:** engagement season — heavy "just engaged / premarital" push.
- **January:** New Year — "grow together this year" / resolutions.
- **February:** Valentine's — peak couples interest.
- **Lent / Advent:** devotional + challenge campaigns (very on-brand).
- **Summer:** wedding season — newlywed angle.

## 2.7 Church & creator outreach (the free distribution moat)
- **Targets:** pastors / young-marrieds & singles ministry leaders, premarital counselors (Prepare/Enrich, SYMBIS users), Christian couple-creators, marriage-ministry orgs.
- **DM/email script (value-first):** *"Hi [name] — I built a free tool that helps couples do a daily devotional and pray together, made for [dating/engaged/newlyweds]. I'd love your honest feedback, and if it's useful, a way to offer it to your [group/audience]. No catch — can I send you access?"*
- **Offer:** free premium for their group/pilot; a simple referral path; co-created content with creators.

## 2.8 Tone & sensitivity guardrails (for any agent generating content)
- **No outcome claims** — never "this app will fix/save your marriage." Show practice, not promises.
- **No doctrinal landmines** — stay denomination-neutral; scripture as encouragement, not as argument.
- **Authentic, not preachy or salesy** — couple-to-couple, humble, real.
- **Respect the audience** — relationships are tender; never shame, fear-monger, or fake testimonials.
- **Truthful** — real screens, real features; don't market unbuilt features as live.

## 2.9 Metrics we actually watch
- **Pre-launch:** waitlist signups; posting cadence held.
- **Content:** posts/week, views, **saves**, profile visits, **link-in-bio clicks**, follower growth, per-hook thumb-stop/completion.
- **Funnel:** install → **couple linked** (activation) → trial → paid.
- **North star:** **weekly-active linked couples.**

## 2.10 The 2-month slideshow production run (approved by owner 2026-07-10)
- **Scope:** 60 posts per theme account × 4 accounts (Faith & Intentional Love · Couple Activities · Journal & Quotes · Relationship Reflections) = 240 posts, same workbook format as the 2026-06-29 handoff (per-slide copy + visual direction + Canva search terms + captions/hashtags + CTA level).
- **✅ WAVE 1 DELIVERED (2026-07-12):** `bexhearts_content_wave1_claude.xlsx` in the handoff folder — 60 posts (Days 11–25, 15/account), Creator Source "Claude Code", 9/4/2 CTA mix per account, all L2/L3 waitlist-worded, Slide Copy (347 slide rows) + pre-filled Conversion Tracker rows. Leans on the newly-live features (Journal, AI prayer sessions, streak grace, rated date library, check-in reveal) the first 40 posts couldn't use. CONTENT_NOTES.md updated (stale don't-advertise list superseded).
- **Waves, not a blob:** delivered in **2-week waves of 15/account (60 posts/wave, 4 waves)**. Each wave folds in Conversion Tracker learnings from the last (the M4 pattern-library principle) — a pre-written 60-day monolith can't react to what performs.
- **Cross-post, don't triple-create:** the same post serves TikTok + IG + FB. Export both 1080×1920 (TikTok/Reels/Stories) and **4:5 1080×1350 for IG feed carousels**. Hook + CTA text still typed natively per platform (§2.3).
- **CTA mix per wave:** ~60% L1 (value-only) / ~25% L2 (soft bridge) / ~15% L3 (direct). **Wave 1 = waitlist wording** (app not publicly downloadable yet); flip L2/L3 wording to download at store launch, per the handoff's launch-status rule.
- **Claude vs Codex comparison stays on:** keep Creator labels, extend the tracker. Fair-test rules: interleave creators in the schedule (same time slots, alternating), judge on **save rate + link CTR** after ≥72h live, never on views alone.
- **Anti-repeat:** no angle reused within 14 days on an account (M4 rule); rotate through the §2.2 live-feature list — the newly shipped features (Journal/Moments, AI prayer sessions, streak heatmap, rated date library) are fresh angle territory the first 40 posts couldn't use.
- New accounts (<2 wks) post manually per §2.3; keep the warm-up gentle on the new FB/IG accounts.

---

## 📌 Open item
- **[adriamatz — DONE]** His "How I automated my TikTok content workflow" article (clone-don't-template, compounding pattern library, propose-from-library, account-age publishing, native hook/CTA text, human gate) is digested into M2/M4 and §2.1/2.3. ✅

---

*Created 2026-06-13. Keep the feature→angle map (§2.2) in sync with `docs/PROGRESS.md` features per the cross-update rule in `CLAUDE.md`/`AGENTS.md`. Heavy execution is gated on the app working — see `docs/STEPS.md`.*
