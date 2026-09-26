# Personal Portal Reveal — Audit + Build Spec

**Date:** 2026-06-10
**Status:** Design/spec only. No code, no route moves, no nav/auth changes. Read-only audit complete.
**Sibling to:** Studio Home Reveal (PR #401) — same discipline, member-facing instead of practitioner-facing.
**Governing canon:** `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` (Live/Designed/Vision), `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`, six-category typology.

---

## 0. Frame

**Not "rebuild the portal." Reveal the person's living field.**

The Studio audit found a practitioner *introduced as an Operator* — the frame itself was wrong, so the fix was to **replace** it. The Personal Portal is a different problem. Its relational center is already correct. What is wrong is that **the person's living field — which is real, consent-gated, and already reaching MAIA's prompt — is hidden from the person.** The fix is to **surface** what already exists, not to invent continuity.

**Adapted test (applied to every surface below):** *"Does this help a person orient to what is alive in them?"* — sharpened by the lineage below to: **"Does this help a person stay tuned in?"**

---

## 0.5 Telos & lineage — *the portal is the surfacing layer for the Ganesha / ADHD tools*

**Origin (project owner, design history):** the Personal Portal grew out of the **Ganesha ADHD** work — helping members "manage their world in a more magical and harmonious way so they can stay tuned in." No doc wrote this lineage down (it lived in design memory), but the **code corroborates the substance**: a coherent attention / executive-function feature line already exists (§2.5), sharing one telos, and the portal's own Daily Anchor practice is built directly on it. *Absence of a written lineage is a documentation gap, not evidence against it.*

**This sharpens the success test** from *"orient to what is alive in them"* to:

> **"Does this help a person stay tuned in — manage their world without scatter?"**

**Why this makes "reveal" load-bearing, not cosmetic.** The §1 finding is *the living field is real but hidden from the person*. For an ADHD-rooted design, **hidden = nonexistent** — object permanence ("out of sight, out of mind") is the core executive-function gap. Under-revealing the field is therefore not a polish problem; it is *the* failure mode for the exact population the portal was built for. The Ganesha lineage is what makes the reveal a **function**, not a finish.

**Design consequences of the ADHD root (constraints on any build):**
- **Object permanence** — tools and threads must stay *visible*, not summoned on demand. (Today: Focus Garden only appears if the Oracle chooses to reveal it; AvoidanceBreaker isn't wired at all — a scattered member cannot *find* them.)
- **Low decision-load** — a quiet "what's alive / what's your energy" strip, never a wall of modules (a wall *is* the scatter).
- **Externalized working memory** — "what you've been carrying" offloads what an ADHD brain can't hold.
- **Scales across capacity** — must work on "exhausted / numb / nonverbal days." Daily Anchor already does.
- **Obstacle-removal, not optimization** — Ganesha smooths the path to the next action; it never asks the person to perform meaning.

---

## 1. The Persona Break (corrected finding)

The original hypothesis was `Person → introduced as → User / Profile`. The audit **disconfirms** that at the center and **relocates** the break:

| Layer | Reality | Cite |
|---|---|---|
| **Center** (the encounter) | Already "a life in motion." Talk-first `MaiaShell`; `MaiaCenterField` is explicitly "not a widget… received, accompanied, oriented, in contact"; name-safe "Good morning" greeting (no bogus "Friend"); I‑Thou file doctrine. **Not broken.** | `app/maia/page.tsx:349`, `:8–12`, `:733–735`; `MaiaCenterField` ~`:1016` |
| **Orientation content** | Filed as **settings**. "Continuity" and "Patterns" — the literal *what's-alive-in-me* views — are sections inside the 2,939-line account settings drawer. Life-shaped content wearing a software label. | `components/account/AccountSettings.tsx:163–164` |
| **The "journey/dashboard" surfaces** | **Mock orphans.** `/dashboard` renders hardcoded fake metrics on a `setTimeout`; `WisdomJourneyDashboard` (the `?panel=journey` surface) returns mock data with a TODO. They *simulate* continuity instead of drawing the real substrate. | `app/dashboard/page.tsx:49–93`; `components/maya/WisdomJourneyDashboard.tsx:86` |
| **Real continuity substrate** | **Live but invisible.** Atoms, breakthrough flag, conversational recall, spiral state all reach the prompt. The member *feels* them in conversation but has **no surface that shows them**. | see §3 |

**The break, stated precisely:** `Person → greeted as a presence (right) → but their living field is buried under Settings, faked by mock dashboards, and otherwise invisible.` The portal does not mis-introduce the person. It **under-reveals their life.**

This is why the move is *reveal*, not *replace*.

---

## 2. Surface Inventory (grounded)

Register key: **Live** = production-class, reaches a member · **Forming** = built/wired but mock, dormant, or experimental · **Absent** = does not exist.

### Entry / landing
| Surface | Register | Note | Cite |
|---|---|---|---|
| `/maia` (main) | **Live** | The real personal portal. Relational center sound; right-panel cognition signals are "PRODUCTION: empty until real oracle/memory signals wired (Phase 7)". | `app/maia/page.tsx:928–929` |
| `/welcome-back` | **Live** | Better than expected — copy is continuity-shaped ("where you left off," "what you were here for," "inner life"), not software. A model for tone. | `app/welcome-back/page.tsx:111–115` |
| `/dashboard` | **Forming (mock orphan)** | Hardcoded fake analytics, disconnected from real sessions. Actively misleads. **Hide/deprecate candidate #1.** | `app/dashboard/page.tsx:49–93` |
| `/portals` | n/a (wrong audience) | Practitioner/institutional, not member. Out of scope. | `app/portals/page.tsx:438–482` |
| `/field/enter` | Live (router gate) | Pure redirect, no UI. | `app/field/enter/page.tsx:630–707` |

### Practices (candidate "My Practices")
| Practice | Register | Wire | Cite |
|---|---|---|---|
| Daily Anchor | **Live** | `/api/anchor/today` (CRUD) | `app/maia/anchor/page.tsx` |
| Journal (Quick) | **Live** | `/api/journal/quick/*` (voice/dream/handwriting) | `components/journal/QuickJournalSheet.tsx` |
| Astrology ("Blueprint") | **Live** | `/api/astrology/*` — but routed at `/astrology`, **not** under `/maia` | `app/astrology/page.tsx` |
| Keep/Capture | **Live** | `/api/sovereign/atoms/*`, elemental lenses | `app/maia/keep-capture/page.tsx` |
| Soul Mirror | **Live** | felt-option routing into the book | `components/maia/SoulMirror.tsx` |
| Field Lab | **Forming** | 1 experiment (relational-navigation), "no persistence yet" | `app/maia/field-lab/page.tsx` |
| Reflections | **Forming** (component-only) | `ReflectionDrawer`, `DailyReflectionRitual` etc. — no standalone route | — |

### Continuity substrate (candidate "My Life" / "My Conversations")
| Signal | Register | Reaches member today? | Cite |
|---|---|---|---|
| Atoms loader (semantic) | **Live** | Yes — into prompt; consent-gated (`contextual_doorway`/`ritual_review_opt_in` only; `member_pulled` excluded) | `lib/maia/memoryAtomsLoader.ts:253`, `app/api/sovereign/app/maia/list/route.ts:108–112` |
| `is_breakthrough` flag | **Live** | Yes — member-callable; **system-never-sets** doctrine + schema constraint; surfaced first in sort | `app/api/sovereign/atoms/[id]/breakthrough/route.ts` |
| Conversational recall (Phase 2) | **Live in code** (deploy-unverified) | Wired FAST+CORE → prompt; DEEP context-only; `conversational_recall_enabled` default TRUE; Sanctuary-suppressed; **no-synthesis** hardwired. *CLAUDE.md still marks this branch-only/awaiting-deploy — production status NOT verified by this audit.* | `lib/maia/conversationalRecallBlock.ts:84–121` |
| Spiral state (Bridge D) | **Live** | Loaded every session (element/phase/motion); anti-regression | `lib/consciousness/spiralStatePersistence.ts:96–214` |
| Episodic memory | **Forming** | No — service built, **zero route callers**, no UI | `lib/consciousness/memory/EpisodicMemoryService.ts:44–91` |
| Relational Navigation Room | **Forming** | Member-reachable but "Observation phase · no persistence" | `app/maia/field-lab/relational-navigation/page.tsx:35,41` |
| Wisdom Journey Dashboard | **Forming (mock)** | Renders, but `loadWisdomJourney()` returns stub data | `components/maya/WisdomJourneyDashboard.tsx:86` |
| Conversation history list ("My Conversations") | **Absent** | No member-facing past-thread surface exists | — |
| `/journey` route | **Absent** | No member journey surface (`/api/premium-storage/journey` is backend-only) | — |

### Software frame (account/settings)
- `AccountDropdown` is lean and correct — Settings · Feedback · Sign Out, no life-content leakage, no payment. (`components/maia/AccountDropdown.tsx`)
- `/account/settings` (`AccountSettings.tsx`, 17 sections `:152–170`): **legitimate software** = Profile, Account, MAIA Settings, Voice, Data&Privacy, Sovereignty, Memory&Consent, Notifications, Privacy, Messaging, Connections, Your Data. **Miscast** = Continuity (`:163`), Patterns (`:164`), Astrology chart-viewing (`:1217–1350`).
- `/maia/membership` (tiers, honest/non-coercive) and `/maia/privacy` ("Your inner life belongs to you. Full stop.") — both correctly placed, not chrome. Keep.

---

## 2.5 Ganesha / ADHD substrate inventory (connect, don't duplicate)

The portal's job is to *surface and keep visible* these existing tools — not rebuild them.

| Tool | Register | What it does (ADHD telos) | Cite |
|---|---|---|---|
| Daily Anchor | **Live** | Re-entry ritual; "reducing fragmentation"; scales to nonverbal/exhausted days | `lib/maia/dailyAnchor.ts`, `/maia/anchor` |
| Focus Garden | **Live** (Oracle-summoned) | Obstacle→gate wisdom practice; reframes scattered/can't-start as signal | `components/ganesha/FocusGarden.tsx`, `/api/focus/garden` |
| Neurodivergent validation | **Live** (in oracle) | Reframes self-blame ("lazy"→executive dysfunction) mid-conversation | `lib/oracle/NeurodivergentValidation.ts` |
| AvoidanceBreaker | **Forming** | "Highest-leverage ADHD tool": draft the avoided message + schedule follow-up + close the loop; <60s, <3 choices. Built, **not wired to members.** | `components/focus/AvoidanceBreaker.tsx` |
| Energy / "Now Card" | **Forming** (Studio-only) | Elemental energy state (fire/water/earth/air/aether) → match action to capacity. **Member route absent.** | `app/api/studio/energy/route.ts`, `member_energy_state` |
| ND-support library | **Forming** (library-only) | ADHD/Autism/AuDHD adaptation (micro-pauses, dopamine hits, overwhelm protocol, flow variants); not routed | `lib/neurodivergent-support/*` |
| GaneshaAgent / Ganesha outreach | **Absent / out-of-scope** | Empty stub; the outreach file is a *marketing* orchestrator, not ADHD support | `lib/consciousness/ganesha/GaneshaAgent.ts` |

**Highest-leverage moves:** the two **Forming** pieces most worth wiring member-side are **AvoidanceBreaker** (built, unreached) and a member **Now Card** (energy state exists Studio-only). Both are pure executive-function scaffolding and both are nearly there.

**Name discipline:** "Ganesha" labels three unrelated things — (1) the ADHD/Focus line (this spec), (2) `lib/ganesha/contacts.ts` = the founder's newsletter/contact manager (internal, not member-facing), (3) `MAIAGaneshaConsciousnessOutreach` = a launch-comms mock. Only (1) belongs to the portal.

**Housekeeping (separate, not this spec):** `lib/ganesha/supabase-export.ts` is a dead Supabase-era stub (`createClient()` with no import, zero callers) — `check:no-supabase` may flag the string. Delete/archive in its own pass.

---

## 3. Proposed Reveal Model (five areas, honestly graded)

Each area is graded by how much **already-live substrate** it can draw on. The discipline: **an area ships only as far as its substrate is Live; everything else is labeled Forming or deferred.**

### My Life — *what is active now*
- **Substrate:** Live — spiral state (element/phase/motion) + recent atoms + breakthrough-marked atoms, all already loaded by `/api/sovereign/app/maia/list`.
- **Ships as:** a quiet "what seems alive" orientation strip drawn from data the portal *already fetches*. No new endpoint.
- **Forbidden register:** do NOT label this "coherence," "field state," "RFI/UFI" (all frozen Cat 1/5). It is *element + phase + recently-held material*, named plainly.
- **ADHD addition (Forming):** a member **"Now Card"** — current energy state (fire/water/earth/air/aether) so the portal can meet capacity instead of demanding it. The substrate exists Studio-only (`/api/studio/energy`); a member surface is the net-new piece. Mark Forming until wired.
- **Forming edge:** any cross-signal *synthesis* ("you are integrating X") is Forming — mark it, don't render it.

### My Conversations — *threads that keep returning*
- **Substrate:** split. Conversational recall is **Live in code** (exchanges reach the prompt) — but the member-facing **history list is Absent.**
- **Ships as:** this is the **single genuinely net-new read surface** in the whole reveal — a read-only list of past sessions/exchanges. It is the one piece that is not assembly. Flag it as the largest build; gate it behind verification of the recall deploy state.
- **Discipline:** "threads that keep returning" implies *recurrence detection* — that is Forming, not Live. v1 lists conversations; it does not claim to know which "keep returning."

### My Practices — *the Ganesha toolkit + the reflective practices*
- **This is the heart of "manage your world harmoniously."** Not a generic module list — it is the **Ganesha / ADHD toolkit** (§2.5) made permanently visible, plus the reflective practices.
- **Substrate:** strongest — assembly of existing live routes.
  - *Live:* **Daily Anchor** (re-entry / anti-fragmentation), **Focus Garden** (obstacle→gate — today only Oracle-summoned; the portal's job is to make it *findable*), Journal, Astrology, Keep/Capture, Soul Mirror.
  - *Forming:* **AvoidanceBreaker** (close-the-loop — built, member-wiring needed), Field Lab ("what we're exploring").
  - *Excluded:* Reflections (component-only).
- **Object-permanence requirement:** these stay visible on the surface; for this population, a tool that must be summoned effectively does not exist.
- **Note (no action this spec):** Astrology lives at `/astrology`, not `/maia/astrology` — an IA seam. **Do not move it** (out of scope); link to it.

### My People — *relationships*
- **Substrate:** **Forming/Absent.** Relational Navigation is observation-phase, no persistence; no relationship model surfaces.
- **Ships as:** **deferred.** Do not surface a "My People" card until a real relational substrate exists. Naming it now would be a fake capability.

### MAIA — *morning orientation, not just chat*
- **Substrate:** greeting is Live (name-safe "Good morning"); the orientation *content* behind it is the empty Phase-7 cognition panel.
- **Ships as:** MAIA's morning orientation **is** the surfaced "My Life" strip — i.e., this area is the *delivery* of My Life, not a separate build. The greeting already exists; My Life fills what comes after it.

---

## 4. What to Hide / Move Deeper

| Item | Action | Why | Cite |
|---|---|---|---|
| `/dashboard` mock | **Hide/deprecate** (redirect to `/maia`) | Fake metrics actively contradict the reveal's honesty | `app/dashboard/page.tsx:49–93` |
| `WisdomJourneyDashboard` mock | **Don't present as journey** until wired to real substrate | Simulates continuity | `components/maya/WisdomJourneyDashboard.tsx:86` |
| "Continuity" + "Patterns" settings sections | **Elevate, not bury** — lift out of the settings drawer into the reveal (the inverse move) | These ARE orientation content miscast as configuration | `AccountSettings.tsx:163–164` |
| Astrology chart-viewing in settings | Link out to `/astrology`; keep only the consent toggle in settings | Birth-data consent is settings; chart *viewing* is a practice | `AccountSettings.tsx:1217–1350` |
| Right-panel cognition signals (Patterns/Teachings/Journal) | Keep empty/honest until Phase 7 wires real signals — do not imply intelligence | Already correctly empty | `app/maia/page.tsx:928–929` |

---

## 5. Track A (safest first cut) + sequencing

**Track A — "Reveal what's already live" (no new backend, no route moves, no auth/nav/Studio/SoulComms/notification/deploy changes):**
1. Surface a read-only **My Life** orientation strip from data `/api/sovereign/app/maia/list` *already returns* (spiral element/phase + recent + breakthrough atoms). Named plainly; no coherence/field language.
2. Assemble a read-only **My Practices** area linking the Live practices, and **make the Oracle-summoned Focus Garden permanently findable** (pure reveal — it is already Live, just un-findable); Field Lab shown as Forming.
3. **Lift** the "Continuity"/"Patterns" content out of the settings drawer into the reveal (presentation only).
4. Reuse `MaiaShell` / `MaiaCenterField` / greeting; build nothing new in the center.
5. Threshold copy in the spirit of `/welcome-back` (e.g., "Here is where your life is gathering") — Vision register, final wording TBD.

This mirrors Studio Track A: cards + zero-state-first, reuse-only, no new backend.

**Track B — net-new surfaces (each its own cut):**
- **"My Conversations"** — past-session list (the continuity read-surface). Gated behind verifying conversational-recall **production** deploy state (see §6). Do not claim "threads that keep returning" — list first, detect recurrence later.
- **Member "Now Card"** — expose the energy state member-side (substrate is Studio-only today). Lets the portal meet capacity instead of demanding it.
- **AvoidanceBreaker member wiring** — route the already-built "close-the-loop" tool to members. Highest-leverage ADHD piece per §2.5.

**Track C — deferred:** "My People" (needs real relational substrate); cross-signal synthesis; any "field/coherence" surface (frozen).

---

## 6. Discipline guardrails + open verification gates

**Claim register (must hold in any build):**
- Live → may render as present-tense fact.
- Forming → must be labeled forming ("what we're exploring," "observation phase").
- Absent → must not be named at all.
- Banned vocabulary on member surfaces until substrate exists: "coherence," "field state," "resonance field," "RFI/UFI," "relationship memory," "deep continuity."

**Open gates before Track A→B:**
1. **Verify conversational-recall production state.** Code is wired (FAST+CORE); CLAUDE.md still marks Phase 2 branch-only/awaiting-deploy. Confirm via the runtime `conversational-block` log marker on `sovereign/app/maia/list` before "My Conversations" claims liveness.
2. **Confirm `/api/sovereign/app/maia/list` already returns spiral state + atoms in one payload** (audit infers from loader wiring; verify the response shape before building My Life against it).
3. **Confirm `/dashboard` has no inbound member links** before deprecating.

**Deliverable status:** this document is the audit + build spec. No implementation performed. The spec authorizes nothing on its own — Track A requires explicit go-ahead, and ships as its own reveal (not folded into unrelated branches).
