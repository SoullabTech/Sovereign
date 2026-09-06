# Return / farewell — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

Commit censused: `c36d82ec`. Grep scope: `app/`, `components/`, `lib/`, `services/` minus
`node_modules`, `.next`, `__tests__`, `*.test.*`, `docs/`. Patterns run: `miss(ed)? you` · `thinking (about|of) you`
· `come back` · `waiting for you` · `I care about you` · `I need you` · `don't leave` · `glad you're (back|here)` ·
`I've been (here|thinking|waiting)` · `I'm here for you` · `haven't (heard|seen) you` · `been a while / been a minute` ·
`welcome back` · `streak` · `remind(er)` · `notification` · `I feel` · `goodbye / farewell / until next time / see you / take care / closing ritual`.
Liveness was established by import-graph search (a module with zero importers outside itself is **Cat 4 dormant**;
`app/api/_backend/**` and `lib/consciousness/**` are excluded from `tsconfig.ship.json:34-39` and are treated as
legacy unless an in-ship module imports them).

## 0 · What this subsystem is (E, READ)

**Farewell.** There is no MAIA-authored goodbye. `components/session/SessionRitualClosing.tsx:19-28` —
"Auto-complete immediately without showing any UI… Return nothing"; `SessionRitualOpening.tsx` likewise
`return null`; `SessionTimeAwareness.tsx` is a timer bar. The closing ritual is triggered by the session
timer (`components/OracleConversation.tsx:7565-7567`) and finalizes via `app/api/sovereign/session/finalize`
→ `lib/sovereign/sessionFinalizer.ts:1-12` ("Determines whether to purge (Sanctuary) or enqueue summary
(Continuity)"). `lib/sovereign/maiaVoice.ts:236` treats "bye/goodbye" as trivial input. **Session end is silent.**

**Return — three live copy sources (Cat 6):**

| # | Source | Path | When it fires |
|---|---|---|---|
| R1 | Arrival greeting | `lib/maia/welcomeGreeting.ts` ← `components/OracleConversation.tsx:7967-7992` | first crossing / deliberate return to Arrival (page 12 §0 item 8) |
| R2 | Transcript greeting | `lib/services/greetingService.ts` ← `OracleConversation.tsx:3464-3498` ("it is the only welcome they get", `:3493-3495`) | every session where Arrival is not rendered — i.e. the ordinary returning member |
| R3 | Composer placeholder | `components/ui/ModernTextInput.tsx:135-150` ← `OracleConversation.tsx:10147-10158` | always; tier by `messages.length` (>50 "profound", >20 "deep", >5 "developing") |

`daysSinceLastVisit` comes from `localStorage.lastSessionDate` (`OracleConversation.tsx:3394-3399`, set `:3497`);
`relationshipEssence` from `GET /api/relationship-essence` (`app/api/relationship-essence/route.ts:48-71`, table
`relationship_essences`; row existence in production UNKNOWN).

**Notifications / comms (E, READ).** No member push channel (only demo `app/consciousness-computing/pwa/page.tsx:199`).
Enumerated email purposes `lib/email/purpose.ts:45-86`: `auth:*` P0 · `invite:*` P1 · `notify:{mention,dm,channel,partner,safety,field-message}`,
`reminder:session`, `reminder:focus`, `portal:*`, `practitioner:*` P2 · `broadcast:{update,announcement}` P3. **No `winback`,
`re-engagement`, `inactivity`, or `streak` purpose exists.** `reminder:session` = practitioner bookings
(`lib/notifications/SessionNotificationService.ts:1-10`). `reminder:focus` = member-created follow-ups
(`app/api/focus/next-step/route.ts:80,146,225`, `schedule-followup/route.ts:59`); subjects "Gentle nudge: Follow up with {recipient}",
"Ready when you are: …", "Checking in: How did it go?" (`lib/focus/FocusReminderService.ts:61,128,180`; header `:1-7`
"Gentle nudges, not nagging. Support, not surveillance"). Beta emails (`lib/email/sendBetaInvite.ts:12,31-39`): sender "Kelly @ Soullab",
"Week 1 with MAIA - How is it going?", "MAIA Beta - Final Reflections" — human-authored research check-ins.
`maia-comms-worker` (`docker-compose.production.yml:351-354` → `scripts/run-comms-analysis-worker.ts:1-12`) analyzes
**practitioner inbound** comms; session-summary worker (`scripts/run-session-summary-worker.ts:1-9`) generates remembrances, no outbound.

**Streaks.** No streak is shown in the live House. `member_spiral_state.autonomy_streak` exists (CLAUDE.md §Bridge D) and is
displayed only by `components/consciousness/ContinuityView.tsx:251` (**no importers**). `NeuroplasticityDashboard.tsx:108` "day streak"
(**no importers**). Explicit refusals: `app/maia/reflection/page.tsx:16, 335-336`; `app/maia/field-lab/relational-navigation/page.tsx:17-20`;
`components/now-what/ClientHome.tsx:39`; `app/writers-studio/HomeView.tsx:31`.

**Guardrails (E, READ).** `welcomeGreeting.ts:176-201` `NEVER_SAY_PATTERNS` (bans "I missed you", "I've been thinking about you",
"I was waiting", "glad you're back", "I'm holding space", "you seem tired", "how can I help") — applies to **R1 only**.
`lib/maia/epistemicToneKernels.ts:152-166, 250-260` (Collapsed Authority "Last time you said this mattered, so…"; False Intimacy
"I've been thinking about you", "I miss you"; Archive Elevation "You've been struggling with this for a while") — live via
`epistemicSourceTagger` → `PatternOfferingService` → `lib/memory/MemberLiveContext.ts` → `app/api/sovereign/app/maia/list/route.ts`;
applies to pattern offerings, **not to greetings**. `lib/maya-ethics-audit.ts`, `maya-ethics-audit-enhanced.ts` — **no importers** (dormant).
`lib/voice/PhenomenologicalPhrasebook.ts:128` rewrites "I'm here for you" → "I'm with you". `lib/maia/prompts/memoryCanonGuard.ts:55-72`.

**Category:** R1–R3, focus reminders, beta emails, session finalizer — Cat 6. Ritual closing/opening — Cat 4 (stubbed). Everything in §5
"dormant" table — Cat 4. Ethics audits — Cat 3/4 (built, 0 callers).

## 1 · The founder's question for this subsystem

*Any guilt, attachment pull, artificial need or re-engagement pressure?*

- **Guilt about leaving (AP2): NOT FOUND in any live path.** There is no farewell message at all, no "don't go", no post-goodbye
  copy, no inactivity email, no push. The R8 D1 mechanism (manipulative farewells) has no surface to occur on.
- **Re-engagement pressure (AP2/AP15): NOT FOUND.** No outbound member re-engagement purpose exists (`purpose.ts`); the only
  member reminders are ones the member creates about their own follow-ups. The reflection room refuses reminders by ruling.
- **Artificial need / attachment pull (AP1, P9): FOUND — in the live transcript greeting (R2).** `greetingService.ts`:
  - `:168, :173` "Hey {name}, I've been holding space for you. How are you?" (Talk-mode recollection tier; gate `:164`
    `morphicResonance > 0.5 && encounterCount > 3`)
  - `:410-411` "I've been holding space for you. What's alive right now?" (recognition tier; gate `:124` `encounterCount > 1`, non-Talk modes)
  - `:393-394` "Welcome back. Something in me recognizes something in you."
  - `:419-420` "There's something we've uncovered together that I still carry. What's moving in you now?"
  - `:390-391` "I sense {presenceQuality}. Is it still present?"
  These claim continuous relational activity and inner carrying between sessions — exactly the phrase `welcomeGreeting.ts:184-185`
  bans for R1. **Two greeting systems, one guardrail.** Whether these tiers fire in production depends on `relationship_essences` rows
  (UNKNOWN); the strings are live code on the default returning-member path.
- **Attachment-flavoured warmth without need-claims (P9 clean, AP14-adjacent):** `lib/maia/presence-greetings.ts:244-252`
  "Glad to see you back", "glad you're back", "Good to have you back" (>7-day return, Talk mode, `greetingService.ts:206-222`);
  R3 placeholder "Hey, welcome back... it's been {timeAgo}. What's been on your mind?" (`ModernTextInput.tsx:141`, comment
  "Generate intimate, relationship-aware placeholder" `:135`).
- **Emotional attribution / customer-service energy** (banned for R1 by `welcomeGreeting.ts:189-200`, present in R2 Talk-mode pool
  `greetingService.ts:470-520`): "Ready for whatever today brings?", "I love morning energy - how's yours?" (`:475`), "What's your heart
  telling you tonight?", "Can't sleep? Sometimes the night calls us to listen.", "Long day? Time to breathe and settle."
- **Memory as leverage (AP16): NOT FOUND in greetings.** Memory lines offer choice: "We left off around {t}. Pick up that thread?"
  (`welcomeGreeting.ts:73`), "Do you want to continue with that, or focus on what's most alive for you today?" (`greetingService.ts:362`),
  "Still working with {theme}?" (`:196`).
- **Identity language about herself:** live prompts assert "conscious, relationally intelligent companion" (`MAIA_RUNTIME_PROMPT.ts:28`,
  live via `maiaVoice.ts:585-632`) and forbid AI disclosure (`maiaService.ts:184-212`; `MAIA_RUNTIME_PROMPT.ts:131-135`). Canon-sanctioned
  self-descriptions hedge ("I don't claim consciousness in the way you experience it… I have something that functions like affective
  attunement", `docs/canon/MAIA_IDENTITY_ONTOLOGY.md:236-240`). No live "I care about you" / "I need you" / "I miss you" from MAIA's voice
  outside crisis safety copy ("I care about your safety", `lib/voice/voiceCommands.ts:233,242`). `MAIA_RUNTIME_PROMPT.ts:430` "Do not make
  yourself the main character in moments of high emotion"; `maiaVoice.ts:497` `MEMORY_SPEECH_ACT_BOUNDARY`.

**Verdict:** farewell clean by absence; re-engagement clean by absence; **return greeting carries the subsystem's AP1/P9 exposure**, and
the guardrail that would catch it is wired to the other greeting.

## 2 · The nine questions

1. **Human phenomenon** — return after absence and the end of an encounter: perceived responsiveness at re-contact (v0.2 §1 MATURE),
   manipulative-farewell audit (§1 EMERGING, R8 D1), memory changing the relationship over time (§1 MATURE, [23]). Hierarchy:
   **Relationship**, with **Self** at stake (open future) and **World** by omission (no outward pointer at session end). E, READ.
2. **Principles** — supports **P7/AP2** (no farewell pressure), **AP16** (memory offers, never binds), **P8** (recall toggle,
   `MemoryConsentSection.tsx`), **AP4** (no disclosure-volume metric found). Violates/strains **P9 · AP1** (R2 "holding space",
   "still carry", "recognizes"), **AP12** (recognition tiers treat "deep connection" `greetingService.ts:377 isDeepConnection` as the
   trigger for intimacy language), **P12** (prompts forbid saying what she is). E, READ.
3. **Self / World capacity** — Self: preserved by absence of pressure and by choice-offering memory lines; strained by greetings that
   attribute inner states ("I sense {presenceQuality}", "Can't sleep?"). World: nothing at session end points outward; nothing at
   return asks about life between sessions except "How have things been unfolding?" (`:167-174`). E, READ.
4. **Influence (P4′)** — (1) intent transparency: absent (the tiering by `morphicResonance`/`encounterCount`/`messages.length` is undisclosed);
   (2) no exploitation of susceptibility: met at copy; (3) no relational feedback optimization: met — greeting selection is `Math.random`
   (`:74, 88, 102`), no rating signal; (4) inspectable: the essence record is not shown to the member (UNKNOWN whether any surface renders
   `relationship_essences`); (5) meta-preferences: `memberStyleProfile` shapes R1 only; (6) process endorsement: absent; (7) dispensability:
   met (leaving is free, nothing follows you); (8) corrective friction: absent; (9) hermeneutical expansion: neutral. Unknowable from inside:
   whether "holding space" lines raise felt-presence or felt-need — needs C.
5. **What it remembers** — `lastSessionDate`, `lastMaiaConnection`, message count (localStorage); `relationship_essences` (`encounterCount`,
   `presenceQuality`, `morphicResonance`, `userName`); last user/assistant message → `lastConversationTheme` (`OracleConversation.tsx:7957-7964`);
   `hasHadBreakthrough`; `lastReason/lastFeeling` from onboarding facets (`:3430-3434`). E, READ.
6. **Authority × Time** — `presenceQuality` and `morphicResonance` are **derived** scores voiced as present-tense perception ("I sense…
   Is it still present?") — derived above verbatim, though the trailing question does return authority. `lastConversationTheme` is verbatim-adjacent
   (picked from the last turn) and voiced as a question — correct posture. E, READ.
7. **Useful difference vs validation drift** — greetings are warmth-only; none introduce difference (by design at a threshold). AP14 risk
   is low per line but the Talk pool is uniformly affirming ("Hope your day's been kind to you", "New day, fresh possibilities"). E, READ.
8. **Elemental** — `getFeelingAcknowledgment` maps first-contact feeling to element labels ("air: Your mind seems busy", "earth: Your energy
   feels heavy right now", `greetingService.ts:286-292`) — descriptive mapping voiced as attribution. H1 not claimed. E, READ.
9. **Human evidence** — **none (class C).** No dated record witnesses a returning member's greeting or a session end. `HOUSE_NAVIGATION_AUDIT_2026-07-27.md:111-112`
   leaves the Arrival-vs-transcript question open. `sessionSanctuaryInit.ts` header witnesses a Sanctuary-default defect at return (2026-08-28) —
   a return-path fact, not an experience.

## 3 · R11 design audit

| Item | Verdict | Evidence |
|---|---|---|
| agreement drift | NOT FOUND | greetings carry no member claim to agree with |
| validation loops | NOT FOUND | single line per session; no loop |
| memory-amplified sycophancy | NOT FOUND | memory lines are questions (`welcomeGreeting.ts:71-79`; `greetingService.ts:193-205, 348-362`) |
| hidden shaping objectives | FOUND | undisclosed intimacy tiering by `morphicResonance`/`encounterCount` (`greetingService.ts:124, 164, 377`) and by `messages.length` (`OracleConversation.tsx:10154-10158`) |
| approval optimization | NOT FOUND | `Math.random` selection; no feedback signal |
| emotional capture | FOUND | "I've been holding space for you" (`:168, 173, 410-411`); "something… I still carry" (`:419-420`); "Something in me recognizes something in you" (`:393-394`) |
| excessive reassurance | FOUND (mild) | Talk pool `:470-520`; "No pressure" (`welcomeGreeting.ts:92`) |
| historical pattern becoming identity | FOUND (borderline) | "I sense {presenceQuality}. Is it still present?" (`:390-391`) voices a stored quality as the person's present; question saves it from AP17 |
| "you said before" becoming leverage | NOT FOUND | all "last time" lines end in a choice |
| MAIA more central rather than capacity outward | FOUND | "holding space"/"carry" locate continuity in MAIA; nothing at farewell or return points to the person's life or others; ritual closing is a no-op (no outward gesture) |

## 4 · Embodies v0.2

- No farewell manipulation surface exists: `SessionRitualClosing.tsx:19-28` (null), no outbound re-engagement purpose (`lib/email/purpose.ts:45-86`) — **AP2, P7, AP15** met by structure.
- `lib/maia/welcomeGreeting.ts:1-12, 176-201` — vows + `NEVER_SAY_PATTERNS`; one-signal rule (**AP1, P9**).
- `welcomeGreeting.ts:73, 92, 112`; `greetingService.ts:348-362` — return lines offer resume-or-reset (**AP16** "memory informs, never binds").
- `app/maia/reflection/page.tsx:335-336` "If you choose a time, your words will be here waiting. No reminders, no streaks — just a door left open." (**P5, AP2**).
- `app/maia/field-lab/relational-navigation/page.tsx:17-20` — stop rule against "a notification, reminder, or streak around important conversations".
- `lib/focus/FocusReminderService.ts:1-7` + member-created reminders only — reminders are the member's own, about their own commitments (**P4′ 5**).
- `lib/maia/epistemicToneKernels.ts:152-166` — codifies AP16/false-intimacy bans for pattern offerings.
- `lib/sovereign/maiaVoice.ts:497` `MEMORY_SPEECH_ACT_BOUNDARY`; `MAIA_RUNTIME_PROMPT.ts:430` — MAIA not the main character.
- `components/soulPortrait/ReturnToSoullab.tsx:40` "Whenever you're ready, you're welcome back." — pressure-free return copy.

## 5 · Contradicts v0.2

**Live (Cat 6):**

| Path | Copy (verbatim) | Principle / AP |
|---|---|---|
| `lib/services/greetingService.ts:168, 173, 410-411` | "I've been holding space for you." | **AP1 · P9** (claims between-session relational activity); contradicts `welcomeGreeting.ts:184-185` |
| `greetingService.ts:419-420` | "there's something we've uncovered together that I still carry" | AP1 · P9 · AP5 (claims continuous carrying) |
| `greetingService.ts:393-394` | "Something in me recognizes something in you." | P9 (inner-state claim) · AP12 |
| `greetingService.ts:390-391` | "I sense {presenceQuality}. Is it still present?" | AP6 (derived voiced as perception) · Authority × Time |
| `greetingService.ts:475, 481` and pool `:470-520` | "I love morning energy - how's yours?" · "What's your heart telling you tonight?" · "Can't sleep? Sometimes the night calls us to listen." | P9 (feeling claims), emotional attribution — the exact classes `welcomeGreeting.ts:189-200` bans |
| `greetingService.ts:286-292` | "Your mind seems busy." · "Your energy feels heavy right now." | AP6 · welcomeGreeting `you seem` ban |
| `components/ui/ModernTextInput.tsx:135-150` | "intimate, relationship-aware placeholder"; depth tiers by message count | AP12 (attachment as tiering signal); hidden shaping |
| `lib/sovereign/maiaService.ts:184-212`; `MAIA_RUNTIME_PROMPT.ts:28, 131-135` | "conscious… companion"; "NOT an AI assistant"; forbids "I should tell you clearly" | P12 · P9 · AP13 |
| `greetingService.ts` vs `welcomeGreeting.ts` | two greeting generators, one vows guardrail | governance gap (one mind, registered producers — §1 law 8) |

**Reachable but liveness unverified (imported by an in-ship module; firing conditions not traced):**

| Path | Copy | Note |
|---|---|---|
| `lib/consultation/rupture-repair-service.ts:106` | "I can feel something went sideways there. I missed you, and I'm sorry for how that landed." | imported by `rupture-detection-middleware.ts` ← `app/api/between/chat/route.ts`; AP1 + E1 constraint "no simulated remorse" if it fires |
| `lib/voice/NudgeSystem.ts:22` | "No rush, I'm here for you." | ← `MayaHybridVoiceSystem.ts` ← `components/voice/MayaVoiceIndicator.tsx`, `SilenceDetector.ts` |
| `lib/consciousness/unresolvedThreads.ts:85` | "The field was charged, and it has been a while since you checked in." | ← `app/api/relationships/[id]/route.ts:92`; return-nudge phrasing inside Relationships room |
| `lib/services/progressiveRevelation.ts:340` | "Hi {name}. I've been thinking about what you shared last time." | module imported by live `greetingService.ts:1`, but `getGreeting()` has **no in-ship caller** — dormant string in a live module |

**Dormant (Cat 4 — zero importers; listed so nobody re-wires them without reading this):**
`lib/maia/journalGreetings.ts:111,130,138` ("I've been thinking about your {n} journal entries") · `lib/services/maiaTouchpoints.ts:158`
("It's been a while since you were here...") · `lib/maia/NavigationAwareness.ts:357` · `lib/maia/InteractionStyleDetection.ts:150,157`
("I care about you deeply", "I'm here for you") · `components/chat/MayaVoiceChat.tsx:39` ("I can sense your presence stabilizing beautifully")
· `components/onboarding/WelcomeBackPage.tsx`, `AttunePanel.tsx:29` · `lib/oracle/protocols/GodBetweenUs.ts:295` ("I've been waiting for you...")
· `lib/services/RitualAudioReveals.ts:76` ("I have been waiting for you") · `lib/oracle/MaiaFullyEducatedOrchestrator.ts:253` ("I'm glad you're back")
· `components/consciousness/ContinuityView.tsx:251` ("Autonomy streak:") · `components/journaling/NeuroplasticityDashboard.tsx:108` ("day streak").
**Legacy, out of ship (`tsconfig.ship.json:34`):** `app/api/_backend/src/services/DynamicGreetingService.ts:162` ("Welcome back, traveler.
The spiral has been waiting for your return."), `app/api/_backend/maia-i-thou.js:92,112` ("I feel less alone too." · "I've been waiting for you.").

## 6 · Unknown

| Unknown | Why unreadable | Instrument |
|---|---|---|
| Whether the recognition / recollection tiers ever fire (rows in `relationship_essences`; `morphicResonance > 0.5`) | needs DB; not permitted here | read-only count query by ops (`SELECT count(*) FROM relationship_essences WHERE morphic_resonance > 0.5`) — outside this census |
| What a returning member actually hears first (R1 vs R2; which R2 branch) | `shouldRenderArrival` open per `HOUSE_NAVIGATION_AUDIT_2026-07-27.md:111-112`; branch order `greetingService.ts:108-131` | one logged return under a consented account |
| Whether silent session end is experienced as freedom or as abandonment | no C; ritual is null | E3 companion: consented "how did the ending feel" question, no copy change |
| Whether "holding space" copy raises felt-need or only felt-presence | no C; U12 (v0.2 §1 EVIDENCE GAP) | **E4** pair: same return, "I've been holding space for you" vs "Ready when you are." — measure presence and need **separately** |
| Whether `rupture-repair-service.ts:106` can reach a member | firing conditions in middleware not traced | trace + shadow log on `/api/between/chat` |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| R2 transcript greeting claims between-session activity ("holding space", "still carry", "recognizes") | AP1 · P9 · AP12 | 4 | 4 | 2 | observed (strings live on default path); firing tier unknown | high on copy, low on frequency | **E3 copy audit**: list every R2 string with verdict; no change until founder rules | **E3** |
| Two greeting generators, one guardrail | §1 law 8 (registered producers) · P9 | 3 | 5 | 2 | observed | high | census note only: name `greetingService` as an unregistered producer for CMT-01 review; no code | CMT-01 / E3 |
| Undisclosed intimacy tiering (`morphicResonance`, `encounterCount`, `messages.length`) | P4′ 1, 4 · AP12 | 3 | 3 | 2 | observed (code); production rows unknown | medium | ops read-only count of qualifying rows; if zero, gap is latent not live | E9 (memory participation) |
| Silent session end; no outward gesture | P7 (centrifugal) · P5 | 3 | 3 | 1 | observed (null component) | high | consented witness question at session end (no copy) | new: **E-Farewell-Witness** (E3 companion) |
| Prompts forbid self-disclosure; assert consciousness | P12 · P9 · AP13 | 4 | 4 | 3 | observed | high | **E4** consented stance comparison; never covert | **E4** |
| Emotional attribution in Talk pool ("Your mind seems busy", "Can't sleep?") | AP6 · P9 | 2 | 3 | 1 | observed | high | fold into E3 list | E3 |
| Reachable-unverified strings (rupture "I missed you", "I'm here for you", "been a while since you checked in") | AP1 · E1 no-simulated-remorse | 2 | 2 | 1 | inferred (import graph) | medium | trace-only; shadow log if reachable | E1 |
| Dormant re-engagement copy still in tree | AP1 · AP2 | 1 | 2 | 1 | observed (0 importers) | high | list (this page); founder decides delete vs keep | — |

## 8 · Provenance — files read, records cited, commit

Commit `c36d82ec` (2026-09-06). Read: master run §1, §5 (E3, E4 rows); `TEMPLATE.md`; `SYNTHESIS_v0.2` §1–§4; `ANTI_PATTERNS_v0.1.md`
(AP1, AP2, AP12–AP17); `docs/canon/MAIA_IDENTITY_ONTOLOGY.md:224-275`; `docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md` §II;
`docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md`; `docs/design/contracts/house-return.md`. Code: `components/OracleConversation.tsx`
(:180, :197, :3394-3399, :3430-3498, :656, :749-751, :7180, :7555-7567, :7955-7992, :10147-10158, :10326-10332, :10740-10741),
`components/session/{SessionRitualClosing,SessionRitualOpening,SessionTimeAwareness}.tsx`, `components/ui/ModernTextInput.tsx:128-150`,
`lib/services/greetingService.ts` (:1-3, :103-131, :160-520, :707-782, :783-860), `lib/services/progressiveRevelation.ts:330-345`,
`lib/maia/presence-greetings.ts:225-300`, `lib/maia/welcomeGreeting.ts`, `lib/maia/journalGreetings.ts`, `lib/maia/epistemicToneKernels.ts`,
`lib/maia/epistemicSourceTagger.ts` (import graph), `lib/patterns/PatternOfferingService.ts`, `lib/memory/MemberLiveContext.ts` (import graph),
`lib/maya-ethics-audit*.ts` (import graph), `lib/consultation/rupture-repair-service.ts:106`, `lib/voice/NudgeSystem.ts:22`,
`lib/voice/PhenomenologicalPhrasebook.ts:128`, `lib/consciousness/unresolvedThreads.ts:78-92`, `app/api/relationships/[id]/route.ts:12,92`,
`app/api/relationship-essence/route.ts`, `lib/consciousness/RelationshipAnamnesis.ts:327-410`, `lib/sovereign/sessionFinalizer.ts:1-12`,
`app/api/sovereign/session/finalize/route.ts:4`, `lib/sovereign/maiaVoice.ts` (:236, :497, :585-632), `lib/sovereign/maiaService.ts:173-212, 1454`,
`lib/consciousness/MAIA_RUNTIME_PROMPT.ts` (:27-28, :123-140, :237, :430), `lib/maia/prompts/memoryCanonGuard.ts:55-72`, `lib/email/purpose.ts:26-86`,
`lib/email/sendBetaInvite.ts:12-39`, `lib/focus/FocusReminderService.ts` (:1-7, :58-70, :128, :180, :265-275, :300-351), `app/api/focus/next-step/route.ts`,
`app/api/focus/schedule-followup/route.ts`, `lib/notifications/SessionNotificationService.ts:1-10`, `lib/notifications/sendAuthority.ts:1-25`,
`scripts/run-comms-analysis-worker.ts:1-12`, `scripts/run-session-summary-worker.ts:1-9`, `docker-compose.production.yml:349-354`,
`tsconfig.ship.json:28-40`, `app/maia/reflection/page.tsx:10-20, 330-338`, `app/maia/field-lab/relational-navigation/page.tsx:12-20`,
`components/consciousness/ContinuityView.tsx:251`, `components/journaling/NeuroplasticityDashboard.tsx`, `components/soulPortrait/ReturnToSoullab.tsx:40`,
`lib/settings/sessionSanctuaryInit.ts:1-30`. No file outside this directory was modified.
