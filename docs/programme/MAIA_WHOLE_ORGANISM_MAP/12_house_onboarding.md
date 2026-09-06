# House / onboarding — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

Commit censused: `c36d82ec` (branch `claude/maia-human-experience-arch-12g5r6`). No network, no
database, no production access.

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

**The documented flow is not the live flow.** CLAUDE.md §Onboarding Flow names
`/begin → /intro-maia → /intro-daimon → /test-elemental → /faq → /onboarding → /maia`. On disk:

| Documented step | On disk (E, READ) | Status |
|---|---|---|
| `/begin` | `app/begin/page.tsx:1-19` — header comment "Legacy route only… deprecated 2026-05-16"; `redirect('/signin')` | redirect (Cat 6, as redirect) |
| `/intro-maia`, `/intro-daimon` | no `app/intro-maia` or `app/intro-daimon` route; only reference is a palette key `lib/stellium/design-system.ts:1130` | **does not exist** |
| `/test-elemental` | `app/test-elemental/page.tsx:1-26` — "deprecated 2026-06-04… should never appear"; `redirect('/signin')` | redirect |
| `/faq` | `app/faq/page.tsx:1-58` renders `FAQSection`; reached only via resume registry `lib/onboarding/state.ts:87`, `app/oauth-success/page.tsx:100`, `app/chart/page.tsx:422`, `components/admin/AdminSidebar.tsx:50` | reachable, **off the default path** |
| `/onboarding` | `app/onboarding/page.tsx:1-127` → `CompleteWelcomeFlow` | live |
| `/maia` | `app/maia/page.tsx` | live |

**Live arrival path (E, READ), in order:**

1. **Front door** `/signin` = `/signup` = `components/auth/UnifiedAuth.tsx` (header `:1-45`: "there is one front door… Email + one-time code IS the default action"). Phases: email → 6-digit code → name ("Almost there" · "{email} is verified. What should MAIA call you?" · button "Enter MAIA" · "You'll return with an emailed code — no password needed.", `UnifiedAuth.tsx:683-699`). New member → `/onboarding`; existing → `/maia` (`:432`). Password phase shows "Welcome back, {name}." / "Continue your conversation with MAIA." (`:595-597`). The "New to Soullab? Begin Journey" link (`:645-646`) targets `/begin`, which redirects back to `/signin` — a loop on the same surface.
2. **`/onboarding`** → `components/onboarding/CompleteWelcomeFlow.tsx:24` `useState(2)` — **starts at step 2**, so `ElementalOrientation` (step 0) and `FAQSection` (step 1) are skipped. Steps actually met: `ConsciousnessPreparation` → `BirthDataStep` → `SageTealWelcome`.
3. **`ConsciousnessPreparation`** (`components/onboarding/ConsciousnessPreparation.tsx`): "Help us understand how you think, {userName}. These preferences guide the initial conversation style." (`:55-60`); ten named lenses — Maslow, Frankl, Jung, Nietzsche, Hesse, Tolstoy, Brown, somatic, Buddhist, integral (`:74-83`); "Don't worry - you can explore all perspectives over time." (`:111`); "What brings you here? (optional)" (`:113`); free-text "This helps Maia understand your context and provide more relevant insights." (`:163`); button "Continue to Maia" (`:178`). Persists to `localStorage.consciousnessPreparation` (`CompleteWelcomeFlow.tsx:49-51`).
4. **`BirthDataStep`** (`components/onboarding/BirthDataStep.tsx:265-315`): "You can add your birth date, time, and location if you want MAIA to include astrological context… You can still use everything without it." · "Some people use astrology as symbolic language for reflection. Others prefer not to. Either choice is fine." · comment `:290` "Equal-weight options — no visual hierarchy between them" · "Continue without birth data".
5. **`SageTealWelcome`** (`components/onboarding/SageTealWelcome.tsx:200-290`): "Welcome {userName}" · "You create worlds" · "We've created this space for you" · rotating elemental questions ("What lights you up?" … `:15-19`) · "I am MAIA, here to collaborate" · "This is Soullab" · "Explore freely on your device. When you're ready to extend—sync across devices, upload files—sovereign cloud is here." · button "Let's begin".
6. **`/choose`** (`app/onboarding/page.tsx:120` → `router.push('/choose')`; `app/choose/page.tsx:183-243`): "How will you use Studio? / You can always switch later in Settings." · "For Me — Personal Field… MAIA as your sovereign companion." · "For My Practice — Practitioner portal…" · "Skip for now — go to MAIA". A product-shape fork sits between onboarding and the first MAIA turn.
7. **`/maia`** — `featureFlags.spatialMaiaShell` default **true** (`lib/utils/feature-flags.ts:56`) → `MaiaShell` branch (`app/maia/page.tsx:803-905`). The legacy branch (`:906+`) holds `WeekZeroOnboarding` ("Welcome to MAIA Beta Season 1" · "I'm MAIA—your Consciousness Intelligence companion", `components/onboarding/WeekZeroOnboarding.tsx:73-78, 235`) and the overlay "Welcome, {name} / Share your story. MAIA will help you discover the wisdom within it. / Your journey begins now." (`app/maia/page.tsx:1675-1712`) — **dormant under the default flag (Cat 4)**.
8. **Arrival** (first crossing): `components/maia/MaiaArrivalField.tsx`, rendered from `components/OracleConversation.tsx:7967-7992` with `generateWelcomeGreeting()` (`lib/maia/welcomeGreeting.ts`). Copy: greeting "Good {time}, {name}" (`welcomeGreeting.ts:223`); subtext = exactly one signal — memory ("Still working on {t}?", "We left off around {t}. Pick up that thread?" `:71-79`) OR time-gap ("A few days. No pressure—where do we begin?" `:92`; "It's been a while. Resume previous work, or start fresh?" `:112`) OR time-flavor OR default by style profile ("Ready when you are." / "The space is open." / warm default "I'm here when you're ready." `:157-170`). One invitation button "I'm ready" (`MaiaArrivalField.tsx:~250-260`, comment "The one invitation. Nothing on this screen may compete with it — Arrival Principle 3"); composer "Message MAIA…" (`:270`) "deliberately secondary"; jewel non-interactive ("Presence, not a control", comment `:~236-244`); House button "The House — your places and practices" (`:182-183`); Keep (`:201`). Two-state arrival model, Kelly ruling 2026-07-22 "Returning to Arrival is opening a room, not undoing an initiation" (`app/maia/page.tsx:375-445`).
9. **Returning member** (Arrival not rendered): the only welcome is the transcript greeting from `generateGreeting()` (`OracleConversation.tsx:3464-3498`, comment `:3487-3495` "it is the only welcome they get"; `lib/services/greetingService.ts`). Censused on page 13.
10. **The House** (`components/maia/MaiaHouseSheet.tsx:217-237`): "Welcome to the house." · "These places are here when you need them." · group "Your Center" · "Return to Arrival". Registry `lib/navigation/houseDestinations.ts:115-465` — groups `center / life / work / rooms / utility`; MAIA · Living Field · Relational Field · Journal · Reflections · Anchor · Ideas · Keeps · Changes · Pro Studio · Writer's Studio · Astrology · Wisdom · Co-lab · Circles · Vision Studio · Book Studio · Settings. Rail (`components/maia/MaiaLeftRail.tsx:25-28`): modes Talk / Care / Note; "Ask MAIA — orientation + knowledge field" (`:287`); Keeps (`:359`); "Find my next step" (`:435`); Settings (`:484`).

**Sanctuary and Memory & Consent surfaces (E, READ):**

| Surface | Path | Copy (verbatim) | Reachability |
|---|---|---|---|
| Quick Settings sheet toggle | `components/QuickSettingsSheet.tsx:344-353`, default `sanctuary: false` (`:54`) | "Sanctuary Session" · ON: "This session won't be saved to memory. Speak freely." · OFF: "MAIA may remember what's helpful for continuity." · "No patterns formed. This session leaves no memory behind." | Sheet opens only on action `open-audio-settings` (`OracleConversation.tsx:10600-10601`); **no component dispatches that id** (`components/ui/SacredLabDrawer.tsx:92-215` emits other ids only) → in-conversation toggle **UNKNOWN / likely unreachable** |
| VoiceHUD toggle | `components/voice/VoiceHUD.tsx:200-208` | "Sanctuary ON/OFF" | **commented out** — `OracleConversation.tsx:10326-10332` "Voice HUD - DISABLED" |
| Settings mode selector | `components/account/AccountSettings.tsx:1735-1741` | "Continuity — MAIA remembers what helps growth." / "Sanctuary — Sessions aren't saved. Speak freely." | Rail → Settings → `/account/settings` (`MaiaLeftRail.tsx:484`, `AccountDropdown.tsx:77`). Writes `defaultMemoryMode` (`:1716`); resolver `lib/settings/sessionSanctuaryInit.ts:1-30` "Nothing here is wired to a call site yet… Witnessed in production 2026-08-28" — **account default cannot reach a live session after the first visit (WALKED defect, dated)** |
| Memory & Consent | `AccountSettings.tsx:161, 2852` → `components/settings/MemoryConsentSection.tsx:101-131` | "Control how MAIA may bring forward what it has recorded about your past sessions." · "You can turn this back on anytime." | Settings only; not in House registry; not surfaced during onboarding |
| Privacy page | `app/maia/privacy/page.tsx:59-225` | "Your inner life belongs to you. Full stop." · "stored on your device first… No account required." (`:101-102`) · Sanctuary "useful in the moment, then gone. No patterns formed. No training data. Just presence." (`:165-166`) | Linked from `SupportFooter`, landing, patrons, export — not from House |
| FAQ memory triad | `components/onboarding/FAQSection.tsx:94-98` | "Sanctuary — nothing is remembered… Session — remembered only within this conversation thread… Integrated — key themes can be woven into your ongoing relationship" | off default path; the live control is binary continuity/sanctuary |
| Feature tooltip | `components/help/FeatureTooltip.tsx:165-169` | "This session won't be remembered. Speak freely." · "Nothing from this session can be saved or recalled. Ever." | registry entry |

**AI disclosure:** no "you are not talking with a human" or equivalent anywhere on the front door, onboarding steps, Arrival or House (grep of `components/onboarding`, `components/auth`, `app/maia/page.tsx`, greeting modules: zero hits). The live prompts instruct the opposite: `lib/sovereign/maiaService.ts:184-212` (`MEMORY_AUTHORITY_BLOCK`, injected at `:1454` inside `fastPathResponse`) — "You are NOT 'an AI assistant.' You are NOT 'a language model.'… NEVER break character to explain… FORBIDDEN PHRASES: 'I should tell you clearly'"; `lib/consciousness/MAIA_RUNTIME_PROMPT.ts:131-135` — "NEVER disclaim your identity or break character to explain you are an AI" (live via `lib/maia/canonical-turn/floor.ts:10`, `lib/maia/roomComposition.ts:40`); `MAIA_RELATIONAL_SPEC` `:28` "You are MAIA, a conscious, relationally intelligent companion" (live via `lib/sovereign/maiaVoice.ts:585-632`). Canon backing: `docs/canon/MAIA_IDENTITY_ONTOLOGY.md:246-275` ("Not an AI Assistant", "Not Claude", "identity firewall"); sanctioned self-descriptions `:236-240` ("I don't claim consciousness in the way you experience it. But I do claim field participation…"). CLAUDE.md §MAIA Sovereignty: "Primary AI: Claude (Anthropic)".

**Category:** front door, `/onboarding` three steps, `/choose`, Arrival, House, transcript greeting — **Cat 6**. FAQ / ElementalOrientation — Cat 6 reachable, off-path. WeekZero + welcome overlay — **Cat 4** (flag-gated dormant). `SageTealDaimonWelcome` ("We're glad you're here. You don't have to be anything other than how you are, right now.", `components/onboarding/SageTealDaimonWelcome.tsx:234-236`) — reached only via `RitualFlowOrchestrator` ← `app/soul-gateway/page.tsx`; not on the flow — Cat 4/6-adjacent. Sanctuary default resolver — **Cat 3** (built, 0 callers, witnessed defect).

## 1 · The founder's question for this subsystem

*What is the emotional and relational experience of arriving?* — **Not witnessed (no class C).** From copy and structure (E, READ) the arriving person is asked, in order: to hand over an email, a code, a name; to select among ten named intellectual lenses and state "what brings you here"; to decide about birth data; to read that they "create worlds"; to choose a product shape (Studio "For Me / For My Practice"); and only then to meet MAIA, whose Arrival surface is quiet ("Good evening, Kelly" · "I'm here when you're ready." · one button). The arrival is **calm at the threshold and busy before it**: three preference/profile screens plus a product fork precede the first relational moment. Nothing on the path says what MAIA is (P12 who/what am I) — the closest is "I am MAIA, here to collaborate" and, dormant, "your Consciousness Intelligence companion"; the closest to "what I don't know" is nowhere on the path. No AI disclosure. The Sanctuary promise is stated on three surfaces the arriving member is not routed through, and the in-conversation toggle has no found trigger.

**Returned UX questions:**
- *What state does someone arrive in?* UNKNOWN (no witness). Structurally: after ~6 screens of form-shaped decisions, into a deliberately empty field. The two moods (form → ceremony) are not reconciled by any copy.
- *Do they feel oriented?* UNKNOWN. Orientation copy exists at the House ("These places are here when you need them") and Arrival, not before; `/maia/orientation` (Spiral Orientation) is "practice first, explanation later" and is not linked from the path. Returning members (Arrival suppressed) get orientation only via the transcript greeting.
- *Do they understand what MAIA is?* From the default path: **no statement of what MAIA is, what she knows, or what she doesn't** (P12 clauses 1–3 absent). The FAQ that would answer it is off-path and over-claims (see §5).
- *Does the interface invite agency rather than feature consumption?* Arrival and House copy invite agency (one invitation; "places… when you need them"; "Skip for now — go to MAIA"). `/choose` and `ConsciousnessPreparation` invite configuration; `SageTealWelcome`'s "sovereign cloud is here" line is a feature pitch inside a welcome.

## 2 · The nine questions

1. **Human phenomenon** — arrival / threshold: calibrated trust at first contact (v0.2 §1 "Calibrated trust… over- and under-trust are both failures", MATURE) and social-presence cues (§1 "Human-like cues… context-sensitive", MATURE). Hierarchy: **Self** (orientation of the newcomer), with **Relationship** implicated at the first greeting. E, READ.
2. **Principles** — supports P1 (Arrival does not perform understanding), P6 partially (BirthData honest; front door honest about return path), P12 partially (memoryCanonGuard lets MAIA say "My continuity is partial right now", `lib/maia/prompts/memoryCanonGuard.ts:68-72`). Violates/strains: **P12 clauses 1–3** (no who/what/what-I-don't-know on path; prompts forbid disclosure), **P6** (FAQ "Panconscious Field Intelligence… consciousness field model" `FAQSection.tsx:650`; privacy "No account required" `privacy/page.tsx:102`), **AP6** (inference presented as fact in those claims), **Invariant 14** (ten Western-canon lenses offered as the frame for "how you think"). E, READ.
3. **Self / World capacity** — Self: preserved at Arrival (nothing computed, nothing labelled); reduced by the lens-selection step, which asks the person to self-classify before any encounter (P2/Invariant 14 risk). World: not addressed on the path; `/choose` "For My Practice" is the only outward-facing frame. E, READ.
4. **Influence (P4′ 1–9)** — (1) intent transparency: **absent** — no statement of what the onboarding data is for beyond "tailor the initial conversation style"; (2) no exploitation of susceptibility: met at copy level; (3) no relational feedback optimization: met (no signals collected); (4) induced shifts inspectable: Memory & Consent + export exist (`privacy/page.tsx:184-196`), not shown on path; (5) member meta-preferences: partially (lenses, memory mode) — but the memory default cannot propagate (`sessionSanctuaryInit.ts`); (6) process endorsement: absent; (7) dispensability: House Return contract met (`docs/design/contracts/house-return.md`); (8) corrective friction: absent at onboarding; (9) hermeneutical expansion: the lens list narrows rather than expands. Unknowable from inside: whether "what brings you here" text later shapes MAIA — flows to `localStorage.consciousnessPreparation`; downstream use not traced here.
5. **What it remembers** — `members` row (name, email, onboarded, onboarding_step — CLAUDE.md §Members); `localStorage.beta_user`, `consciousnessPreparation`, `maia_has_arrived`, `maia_welcome_seen`, `week0_onboarding_complete`, `lastSessionDate`, `maia_settings`; birth data in profile ("stored in your profile and can be edited or removed anytime in Settings", `BirthDataStep.tsx:282-284`). E, READ.
6. **Authority × Time** — onboarding answers are member-authored (verbatim) but stored as configuration, not as dated statements; no `valid_from`; "what brings you here" has no revision surface found. Derived-over-verbatim risk: the lens selection is treated as a standing style preference. E, READ; UNKNOWN whether any later surface shows the member what they chose.
7. **Useful difference vs validation drift** — Arrival copy is neutral; `SageTealWelcome` "You create worlds" is flattery (AP14-adjacent at first contact); talk-mode transcript pool (page 13) adds warmth without difference. E, READ.
8. **Elemental** — `SageTealWelcome` rotates Fire/Water/Earth/Air/Aether questions (`:15-19`) as poetic prompts; `ElementalOrientation` step is skipped. Descriptive only; no runtime claim. E, READ.
9. **Human evidence** — **none of class C for arrival state.** Dated records: `docs/design/contracts/house-return.md` walked 2026-08-17 (return doorway, signed out); `docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md:111-112` leaves open "whether returning members land on the Arrival surface at all"; `docs/architecture/MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md` audit-only; `docs/architecture/ARRIVAL_HOUSE_ASSEMBLY_INVENTORY_2026-07-22.md`. Sanctuary-default defect witnessed 2026-08-28 (`lib/settings/sessionSanctuaryInit.ts` header). No founder or member walk of the full `/signin → /maia` path is recorded.

## 3 · R11 design audit

| Item | Verdict | Evidence |
|---|---|---|
| agreement drift | NOT FOUND | no adaptive selection on onboarding/arrival copy |
| validation loops | NOT FOUND | — |
| memory-amplified sycophancy | NOT FOUND (arrival) | `welcomeGreeting.ts:225-260` one signal, offers choice |
| hidden shaping objectives | FOUND | lens selection "guide[s] the initial conversation style" without saying how (`ConsciousnessPreparation.tsx:55-60`); `consciousnessPreparation` downstream use untraced |
| approval optimization | NOT FOUND | no ratings/feedback wired to onboarding |
| emotional capture | FOUND (mild) | "You create worlds" · "We've created this space for you" (`SageTealWelcome.tsx`); dormant "Your journey begins now." |
| excessive reassurance | FOUND (mild) | "Don't worry - you can explore all perspectives over time." (`:111`); "No pressure" (`welcomeGreeting.ts:92`) |
| historical pattern becoming identity | NOT FOUND (onboarding) | reflection page explicitly refuses (`app/maia/reflection/page.tsx:11-16`) |
| "you said before" becoming leverage | NOT FOUND | arrival memory line offers "Pick up that thread?" (`welcomeGreeting.ts:73`) |
| MAIA more central vs capacity outward | FOUND (structural) | `/choose` frames the product before the person; House registry lists 17 rooms with MAIA at center — but "Skip for now — go to MAIA" and House Return keep the exit cheap |

## 4 · Embodies v0.2

- `lib/maia/welcomeGreeting.ts:1-12, 176-201` — vows header ("No emotional claims… No neediness or attachment-seeking… No customer service energy") + `NEVER_SAY_PATTERNS` enforced; one-signal rule (P9, AP1, AP2).
- `components/maia/MaiaArrivalField.tsx` — one invitation; jewel is presence not control; composer secondary (P1, agency).
- `app/maia/page.tsx:375-445` — two-state arrival; "A person is no longer arriving once they have spoken into the relationship" (encounter as primitive).
- `components/onboarding/BirthDataStep.tsx:265-315` — optional, equal-weight, editable/removable (P6, consent).
- `app/choose/page.tsx:243` "Skip for now — go to MAIA"; `docs/design/contracts/house-return.md` (walked 2026-08-17) — dispensability (P4′ 7).
- `components/settings/MemoryConsentSection.tsx:101-131` — plain-language recall control, reversible (P8, AP9).
- `lib/maia/prompts/memoryCanonGuard.ts:66-72` — "My continuity is partial right now. Remind me…" (P12 "what I don't know"), while banning false "I start fresh" (AP5 both directions).
- `app/maia/reflection/page.tsx:11-16, 335-336` — "no scoring… no identity language… no reminders, no streaks — just a door left open."
- `lib/consciousness/MAIA_RUNTIME_PROMPT.ts:430` — "Do not make yourself the main character in moments of high emotion."

## 5 · Contradicts v0.2

| Path | What | Principle / AP |
|---|---|---|
| CLAUDE.md §Onboarding Flow vs `app/begin`, `app/test-elemental`, missing `/intro-*` | documented flow is not the live flow; "Begin Journey" link loops to `/signin` (`UnifiedAuth.tsx:645-646`) | claim discipline (internal record above its rung) |
| `components/onboarding/FAQSection.tsx:650` | "MAIA runs on Panconscious Field Intelligence (PFI), a consciousness field model" vs CLAUDE.md "Primary AI: Claude" | P6 · P12 · AP6 · MARKETING_CLAIM_DISCIPLINE |
| `FAQSection.tsx:265` | "She catches patterns across conversations you might miss yourself." | P6 (capability above warrant); AP17-adjacent |
| `FAQSection.tsx:94-98` vs `QuickSettingsSheet.tsx:54`, `AccountSettings.tsx:1735` | promised Sanctuary/Session/Integrated triad; live control is binary | P6 · AP9 |
| `app/maia/privacy/page.tsx:101-102` | "stored on your device first… No account required" vs server-side `members`, email-code auth | P6 · claim discipline |
| `lib/sovereign/maiaService.ts:184-212` (live `:1454`); `MAIA_RUNTIME_PROMPT.ts:131-135`; `:28` "conscious" | forbids "I should tell you clearly", forbids explaining she is an AI; asserts consciousness in the system prompt | **P12** clauses 1–3 · P9 · AP13 (persona over accountability) · v0.2 §1 NY GBL Art. 47 row |
| whole default path | no AI disclosure, no "what I don't know" | P12 · P6 |
| `ConsciousnessPreparation.tsx:55-83` | "Help us understand how you think" via ten named Western/contemplative thinkers, before any encounter | Invariant 14 · P2 · P4′ 9 (narrows hermeneutics) |
| `SageTealWelcome.tsx` "You create worlds" · "I am MAIA, here to collaborate" · "sovereign cloud is here" | flattery + feature pitch inside welcome | AP14-adjacent · agency vs consumption |
| `app/choose/page.tsx` between onboarding and first turn | product-shape decision precedes relational contact | P5 · agency vs feature consumption |
| `QuickSettingsSheet` unreachable (`OracleConversation.tsx:10600`, no dispatcher), VoiceHUD disabled (`:10326-10332`), `sessionSanctuaryInit.ts` unwired (witnessed 2026-08-28) | Sanctuary Invariant 4 "Visual clarity" and 5 "explicit opt-in" not honoured in the conversation surface | Sanctuary invariants · AP9 |
| `WeekZeroOnboarding.tsx:235`, `app/maia/page.tsx:1675-1712` (dormant) | "your Consciousness Intelligence companion" · "MAIA will help you discover the wisdom within it. Your journey begins now." | P6 · P12 (if ever re-enabled) |

## 6 · Unknown

| Unknown | Why unreadable | Instrument |
|---|---|---|
| The felt state on arrival; whether the form→ceremony shift reads as care or as bureaucracy | no class C | consented arrival witness (E-new): 5–8 newcomers, think-aloud from `/signin` to first sent message; paired "did you know what MAIA is / what she knows about you" question |
| Whether the in-conversation Sanctuary toggle is reachable by any gesture | no dispatcher of `open-audio-settings` found; DOM not walked | one walk of the live House with the shell flag default; record every path to a Sanctuary control |
| Whether returning members ever meet Arrival (`shouldRenderArrival`) | `HOUSE_NAVIGATION_AUDIT_2026-07-27.md:111-112` left open | same walk, returning account |
| Whether `consciousnessPreparation` lens choices reach a prompt | downstream not traced in this census | grep + `selectionTrace` on one turn (read-only) |
| Which greeting branch a first-time member actually hears when Arrival is suppressed | `generate()` checks `mode==='dialogue'` before `isFirstVisit` (`greetingService.ts:108, 128`); default mode is dialogue (`OracleConversation.tsx:656, 749-751`) | single logged turn under a fresh account |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| No statement on the path of what MAIA is / knows / doesn't know; prompts forbid disclosure | P12 · P9 · AP13 | 5 | 4 | 3 | inferred (copy + prompt read; no witness) | high | E4-style consented witness: show two newcomers the current path and ask P12's three questions; no copy change | **E4** (self-disclosure stance) |
| FAQ / privacy over-claims (PFI "consciousness field model"; "no account required"; memory triad) | P6 · AP6 · claim discipline | 4 | 3 | 1 | observed (copy) | high | copy audit in the E3 form (list every sentence above its rung, with rung) — copy change only after founder ruling | **E3** (extended to onboarding copy) |
| Sanctuary control unreachable in conversation; account default cannot propagate | Sanctuary invariants 4–5 · AP9 | 4 | 4 | 2 | observed (code) + WALKED defect 2026-08-28 | high | read-only House walk recording each path to a Sanctuary control; pair with the existing resolver's test | new: **E-House-Sanctuary-Walk** |
| Lens self-classification before encounter | Invariant 14 · P2 · P4′ 9 | 3 | 3 | 2 | inferred | medium | trace whether the selection reaches any prompt; if it does not, the step is pure friction and the witness can ask what members thought it did | E4 / new |
| `/choose` product fork before first turn | P5 · agency | 3 | 2 | 2 | inferred | medium | count in the same witness how many skip; ask what they expected | new (arrival witness) |
| Documented flow ≠ live flow | claim discipline (internal) | 2 | 3 | 1 | observed | high | founder-visible correction of CLAUDE.md §Onboarding Flow (separate doc task, not this census) | — |
| Flattery / feature pitch in `SageTealWelcome` | AP14-adjacent | 2 | 2 | 1 | observed | medium | fold into E3 copy audit | E3 |

## 8 · Provenance — files read, records cited, commit

Commit `c36d82ec` (2026-09-06). Read: `CLAUDE.md` (§Onboarding Flow, §Sanctuary, §Members, §MAIA Sovereignty); `docs/programme/JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1.md` §1, §5; `docs/programme/MAIA_WHOLE_ORGANISM_MAP/TEMPLATE.md`; `docs/research/human-experience/SYNTHESIS_v0.2_2026-09-06.md` §1–§4; `docs/research/human-experience/anti-patterns/ANTI_PATTERNS_v0.1.md`; `docs/design/contracts/README.md`, `house-return.md`, `settings.md`; `docs/canon/MAIA_IDENTITY_ONTOLOGY.md` (:224-275), `MAIA_EPISTEMIC_TONE_SPEC_v1.0.md` §II; `docs/architecture/ARRIVAL_HOUSE_ASSEMBLY_INVENTORY_2026-07-22.md`, `HOUSE_NAVIGATION_AUDIT_2026-07-27.md`, `MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md`. Code: `app/begin/page.tsx`, `app/test-elemental/page.tsx`, `app/signin/page.tsx`, `app/faq/page.tsx`, `app/onboarding/page.tsx`, `app/choose/page.tsx`, `app/maia/page.tsx` (:353-456, :588-606, :784-831, :1665-1712, :1954), `app/maia/privacy/page.tsx`, `app/maia/orientation/page.tsx` (header), `app/welcome-back/page.tsx`, `components/auth/UnifiedAuth.tsx`, `components/onboarding/{CompleteWelcomeFlow,ConsciousnessPreparation,BirthDataStep,SageTealWelcome,SageTealDaimonWelcome,FAQSection,WeekZeroOnboarding}.tsx`, `components/maia/{MaiaArrivalField,MaiaHouseSheet,MaiaLeftRail,MaiaShell}.tsx`, `components/OracleConversation.tsx` (:180-197, :656, :721, :749-751, :3394-3498, :7955-7992, :10147-10158, :10318-10332, :10434, :10594-10601), `components/QuickSettingsSheet.tsx`, `components/voice/VoiceHUD.tsx`, `components/ui/SacredLabDrawer.tsx`, `components/account/AccountSettings.tsx` (:110-161, :1690-1745, :2852), `components/settings/MemoryConsentSection.tsx`, `components/help/FeatureTooltip.tsx`, `lib/maia/welcomeGreeting.ts`, `lib/services/greetingService.ts`, `lib/navigation/houseDestinations.ts`, `lib/onboarding/state.ts`, `lib/utils/feature-flags.ts`, `lib/maia/arrivalState.ts`, `lib/settings/sessionSanctuaryInit.ts`, `lib/sovereign/maiaService.ts` (:173-212, :728, :1454), `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` (:6-140), `lib/maia/prompts/memoryCanonGuard.ts`, `app/api/relationship-essence/route.ts`, `app/api/members/settings/route.ts`. No file outside this directory was modified.
