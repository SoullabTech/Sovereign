# Jondi Companion — Overview & Candidate

**Status:** CANDIDATE ONLY. No build authorization; nothing here is promised or scheduled. Statuses are unchanged by this revision.
**Date:** 2026-07-21 · **Owner decision:** Kelly

**This document has two parts:**
- **Part A — For Jondi** (below): a plain-language overview, intended to *eventually* be shared with Jondi. It is the only part written to be shared.
- **Part B — Internal working notes** (further down): the architecture, gates, and governance worked out during design. **Not for sharing.**

**Claim discipline** (matching the Larry precedent, per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — *we do not tell tomorrow's story as if it were today's*):
- **EXISTS TODAY** — running in the platform now, verified.
- **TAKING SHAPE** — designed / partly built on existing foundations; not yet a reality Jondi could use.
- **FUTURE** — a genuine possibility, not a commitment; depends on things not yet built.

---

# PART A — For Jondi (overview)

## The simple idea

A living home for your work — one place that helps the people you work with **prepare** before they meet you, **participate** more fully while they're with you, **integrate** afterward, and **continue** between gatherings.

```
Prepare → Participate → Integrate → Continue
```

The whole idea fits in one question:

> **What if the work didn't disappear when people left the room?**

## Why it matters

You already know the pattern. Someone has a real shift in a session or a workshop — and a week later the insight has faded, the practice has stopped, the momentum is gone. Meanwhile the teachings, recordings, group materials, and resources that could help them continue are scattered across many places. The energy of a retreat dissipates almost as soon as everyone goes home.

A living home for the work is simply a way to keep that from happening — to let what mattered *stay* with people between the times they meet you.

## What exists today

Being honest about this matters, so here it is plainly:

- **EXISTS TODAY:** The platform already has the pieces a companion is made from — a place where people can arrive and reflect, and a way to *keep* the moments and teachings that matter to them. A first practitioner (Larry) already has a working version of this kind of companion. These foundations are real and running.
- **TAKING SHAPE:** A tapping/practice companion *in your language*, and a small library of *your* teachings and reminders. These are designed on top of the foundations above — but they depend first on gathering your existing material.
- **Not yet started:** Nothing specific to *your* work exists yet. No recordings, teachings, or practices of yours have been gathered. That gathering is the actual first step (see "Where we are now").

## What could be created first

A small, focused companion for the people you work with, built on the foundations that already exist. A few simple rooms:

- **Prepare** — *What wants attention before we meet? What are you bringing?*
- **Remember** — keep the moments and teachings that mattered.
- **Continue** — reflect on what shifted; carry it forward.
- **Tap** — a tapping practice, in your language.
- **Wisdom** — small pieces of your teaching to return to.

Deliberately **left out of this first step:** anything that tries to detect patterns in a person, track their "progress," or draw conclusions about their inner state. That is not what this is (see "What we are not proposing").

## What could develop over time

If the small companion proves genuinely useful, the same rhythm — prepare, participate, integrate, continue — could extend, over time and only step by step, to:

- Extraordinary College support
- groups and workshops
- retreats
- a fuller library of your teachings and resources
- a space for colleagues and a community of practice
- and, furthest out, preserving your body of work so it endures

All of this is **FUTURE** — a direction, not a plan, and each step would be its own separate decision.

## What we are not proposing

To be completely clear about the boundaries:

- We are **not** replacing you. The relationship between you and the people you work with stays exactly where it belongs — with you.
- We are **not** simulating you. Nothing here speaks *as* Jondi or pretends to be you.
- We are **not** diagnosing participants or inferring their private inner states.
- We are **not** claiming the platform "knows" the healing that happens between you and someone. It doesn't, and it shouldn't.

The companion only ever holds what a person chooses to keep, and what *you* have chosen to share. Nothing more.

## Where we are now

The exact present status: **nothing has been built for you yet.** The only work that can begin right now — and it requires no big decision — is quietly **gathering and organizing your existing materials** (interviews, talks, writings, and so on), and sorting out which of them are clear to use.

Three things stay **separate decisions**, made one at a time, each on its own evidence:
1. Gathering your corpus (can start now).
2. Building the small companion (a later, separate yes).
3. Anything larger (its own, much later, separate yes).

Gathering the material does **not** commit anyone to building the companion; building the companion does **not** commit anyone to anything larger.

## Roadmap

| Phase | What happens |
|---|---|
| **Phase 0** | Inventory your existing materials and sort out permissions |
| **Phase 1** | Curate a first small body of your teachings and practices |
| **Phase 2** | A small companion pilot (Prepare · Remember · Continue · Tap · Wisdom) |
| **Phase 3** | See how it's actually used — learn from real experience |
| **Phase 4** | *Consider* groups, trainings, workshops, retreats, or Extraordinary College |
| **Later** | Community, legacy, and reflective tools — only with separate agreement and evidence |

The spirit throughout: *here is what exists, here is what may be possible, and here is what we would need to learn together.*

---

# PART B — Internal working notes (NOT for sharing)

> Everything below is internal design and governance. It is preserved here so the full north-star architecture and the discipline around it are not lost. It is **not** part of what is shared with Jondi.

### The ladder of distinctions (do not collapse)

```
north-star architecture   ≠  scope
candidate                 ≠  authorization
authorization             ≠  implementation
implementation            ≠  verification
corpus formation          ≠  companion authorization
companion work            ≠  migration authorization
migration                 ≠  practitioner-intelligence authorization
```

Each arrow is a separate gate with its own evidence. The six-layer Jondi articulation is an **instance of the existing Living Studio architecture** (§14), **not** a new "Relationship OS."

**Relationship to prior canon:** extends — does not replace — the reframe ratified 2026-07-21 (*simulate Jondi → learn from Jondi*). This candidate is a **practitioner configuration of existing substrate**, not a new build and not "Virtual Jondi."

## 1. Purpose

A between-sessions companion for Jondi's EFT / transformational clients — a place to stay connected to the work between meetings. It helps clients:

- notice what has shifted since a session,
- keep what matters to them,
- continue tapping practice,
- stay close to Jondi's teachings.

### The rhythm (human terms) — the whole thing, said plainly

Under all the architecture there is one simple human rhythm, and it is the same in every format:

```
Prepare → Participate → Integrate → Continue
```

- **Before — Prepare / arrive.** *What wants attention today? What are you carrying into this session? What's happened since we last met?* Reduces anxiety; less time spent catching up.
- **During — Participate / capture.** Save meaningful moments, mark teachings, keep practices, note questions. (For the practitioner: resources available, materials shareable, continuity forming.)
- **After — Integrate.** The most-often-lost phase: remember what mattered, continue practices, revisit teachings, reflect on what shifted.
- **Between — Continue / deepen.** The work stays alive until the next meeting.

**How to describe it to Jondi (plain, no "platform"):** *"A living companion that helps people prepare, participate, integrate, and continue your work — across sessions, trainings, workshops, retreats, and community life."* The compelling core is a problem every practitioner recognizes: *people forget, insights fade, practices don't continue, the energy of a retreat dissipates.* The vision, in one line: **what if the work didn't disappear when people left the room?**

This rhythm maps directly onto the MVP rooms (§5): Prepare → **Prepare**; Participate → **Remember**; Integrate → **Continue / Notice**; Continue → **Tap / Wisdom**. That correspondence is why the MVP is the honest first embodiment of the whole vision, not a fragment of it.

**One claim-discipline caution on that sentence:** *"across sessions, trainings, workshops, retreats, and community life"* spans **MVP scope (1:1 sessions, self-guided continuity) and held scope (groups, retreats, EC, colleague gatherings — Layer 4, behind the Co-Lab gate).* The rhythm is genuinely format-agnostic, but the *group/retreat containers* are not built. So when actually said to Jondi, describe only the session/continuity part as Live and the rest as where it's heading — do not tell tomorrow's story as today's (`MARKETING_CLAIM_DISCIPLINE`).

It is the **second practitioner vertical** after Larry (the Practitioner Program Platform). Larry proves *coaching / flourishing continuity*; Jondi proves *healing / EFT continuity*. Together they demonstrate the load-bearing claim.

### The strategic milestone (elevated)

If Larry **and** Jondi both work, the evidence is no longer about either of them — it is about MAIA:

> Larry proves coaching continuity. Jondi proves healing continuity.
> Together they prove: **the practitioner substrate generalizes.**

Which reframes what MAIA is:

```
This is not a coaching platform.
This is not a therapy platform.
This is a relational continuity platform for practitioners.
```

That is a much larger claim than "another vertical," and it may be one of the biggest strategic milestones in MAIA's evolution: the shift from *Larry's platform* to **Practitioner Substrate**. The question changes from *"Can we build another platform?"* to *"Can MAIA support multiple practitioner modalities without changing its core?"*

There is a second, distinct proof Jondi may carry that Larry does not. Larry proves **practitioner continuity**. Jondi — because she already runs groups, interviews, and hundreds of hours of public/semi-public teaching — may prove **practitioner knowledge capture and curation**: the pipeline that turns a living body of work into a curated corpus the companion can draw on (§12). Continuity + capture together start to look like the beginnings of a genuine practitioner platform. *(The platform itself is held vision, not authorized scope — see §14.)*

## 2. Core principle

> This is not a new build. It is a practitioner configuration of existing substrate.

The companion does not *simulate* Jondi. It does not speak as her, infer her clients' inner states, or author interpretation. It **accompanies, it does not simulate.**

### The field precedes the technology

> **Studio does not create Jondi's field. Studio accompanies, remembers, and helps sustain continuity within an already-existing field of relationship.**

Jondi's field — her, her clients, the groups, the sessions, the history and trust and teachings — exists whether Studio exists or not. The technology is downstream of the relationship, never its origin. The correct architecture is:

```
Jondi → sessions/groups → field of relationship → Studio continuity → member experience
```

never:

```
Jondi → AI-Jondi → client
```

The latter is precisely the model this project moves away from. This mirrors the estate's *association ≠ attribution* and *doorways-not-preservation* doctrine (Relationship-Field ⇄ Artifact Association candidate; Relational Doorways — "AIN does not preserve the field; it keeps the doorways"): the system may witness evidence arising *within* the field; it does not *know*, *model*, or *become* the field.

### North star

> **Studio does not replace a practitioner. Studio becomes the place where the practitioner's work can continue, accumulate, and endure.**

This is the sentence that keeps the whole arc — from this MVP through the held vision (§14) — on the right side of the line. Everything below is a way of serving that sentence; nothing below is permitted to violate it.

### The surfacing rule (governance, clean form)

The companion may surface **only**:

1. **Member-authored** material (what the member themselves wrote or marked),
2. **Curated Jondi-authored** material (genuinely hers, deliberately prepared),
3. **Procedural support** (a tapping sequence, a prompt, a reflection invitation).

It may **not author**:

- interpretations
- diagnoses
- trajectories
- growth claims
- inferred states

Everything outside the three permitted sources is held out (see §6).

## 3. Prerequisite (the true long pole)

**The MVP is not gated by engineering. It is gated by Jondi.**

Several of the MVP rooms are **content-gated, not code-gated**. The vessel can be assembled quickly; it sits empty without Jondi's actual materials.

The precise state is **zero *intentionally curated* Class-A corpus** — not absolute absence. Raw material almost certainly exists: talks, interviews, Extraordinary College recordings, transcripts, emails, videos. The issue is not that nothing exists; it is that **nothing has yet been deliberately gathered and prepared** into a corpus the companion can draw on. That framing is both more accurate and less discouraging — the work is curation, not creation from nothing.

Needed before the companion has value:

- EFT sequences in the language she actually uses
- teachings, questions, stories, phrases she actually says
- her rhythms and interventions
- audio / video snippets
- her curated "one thing to remember this week" style pieces

The first work is therefore relational, not technical:

```
Interview Jondi. → Capture Jondi. → Curate Jondi.    (before)    Build Jondi.
```

This honors the estate's *curate-before-construct* and *evidence-before-architecture* doctrine. It is not a delay; it is the frontier already named in `project_founder_field_archaeology`.

## 4. Existing substrate map

| Jondi Room | Existing MAIA substrate | State | Grounding (this repo) |
|---|---|---|---|
| **Continue** | Now What? arrival / reflection | ✅ Live | `app/now-what/arrive/`, `app/now-what/reflections/` |
| **Remember** | "Keep this" primitive / mark gesture | ✅ Built | `lib/library/keepIntent.ts`, `lib/psyche/conversational-keep.ts`, `lib/psyche/keep-governor.ts`, `app/maia/keep-capture/`, `app/api/sovereign/episodes/mark/route.ts` |
| **Prepare** | Pre-session intention (Now What? next / questions) | ✅ Live pattern | `app/now-what/next/`, `app/now-what/questions/`; Larry's pre-session prep in `app/practitioner/*` |
| **Tap** *(name provisional)* | Clean Language / EFT content slice | 🟡 Authorized next, unbuilt | design seam per `project_personal_wisdom_library_architecture` (module `lib/maia/supportModes/cleanLanguage.ts` — not yet created) |
| **Wisdom** | Curated teachings on the library engine | 🟡 Needs content | `lib/library/*`, `app/api/library/*`, `lib/wisdom` |
| **Notice** *(optional, later)* | Verbatim reflections (member-marked only) | 🟡 Verbatim pattern exists | Reflection beta `member_reflections` (verbatim-only, no-scoring) — LIVE in prod per memory; migration currently in a worktree, not this branch |
| ~~Patterns~~ | Cross-session synthesis / trajectory | 🔴 Frozen — NOT authorized | held out (see §6) |

Reuse from Larry's vertical (`app/practitioner/*`, `app/practitioners/*` — dashboard, containers, agreements, onboarding, billing): estimated **60–75%**. Both are the same *Practitioner Vertical Template* with different content — Larry = growth / leadership / flourishing; Jondi = healing / somatics / EFT / integration.

## 5. MVP rooms

### 🌿 Continue
*"What has happened since we met?"* — arrival reflection. Configuration of the Now What? arrival pattern with EFT-oriented prompts (something that shifted / something that got harder / something I keep noticing / a pattern that returned / a question I'm carrying).

### 📝 Remember
*"What do you want to keep?"* — the Keep This primitive. Member-authored, verbatim, private by default. This is the client's living journal. No new engine required.

### 🌸 Prepare
*"What wants attention before we meet?"* — pre-session intention. What are you carrying? What would make this session meaningful? This is one of the strongest parts of Larry's platform, and it is especially valuable in therapeutic / healing work: it creates continuity *into* the next session, not only out of the last one. Configuration of the Now What? next / questions pattern. Member-authored, so it stays inside the surfacing rule.

### 💧 Tap *(name provisional — see §10.1)*
*Jondi's EFT practices.* — the authorized Clean Language / EFT content slice. Daily check-in ("How are you arriving today?") → a tapping sequence in Jondi's language + one reflection. "Tap" is functional; Jondi may prefer something softer (Practice / Return / Regulation / Living the Tap / Coming Home). **Content-gated on §3.**

### ✨ Wisdom
*Teachings and reminders.* — small curated Jondi pieces ("Jondi often says…", "one thing to remember this week", "an EFT invitation") kept on the library engine. Curated content, **not** a simulated voice. **Content-gated on §3.**

## 6. Held out (explicitly)

### 🔍 Notice — verbatim-only, if built at all
If a reflection surface ships, it must be **mirror-only**: it shows the member their *own* marked words and nothing else.

> Things you marked as important:
> - "I keep apologizing for existing."
> - "I felt lighter after tapping."
> - "I noticed anger underneath sadness."

No synthesis. No scoring. No inferred trajectory. This is the boundary between **member-authored recognition** (allowed) and **system-authored interpretation** (frozen).

### ❌ Patterns / synthesis surfaces — NOT in MVP
Any surface that asserts a person's inner change — *"your self-compassion increased," "you become activated around criticism," "anxiety reduced over the past month," growth trajectories, recurring-activation themes* — is **cross-session synthesis under freeze**. It is the same claim-family as "Notice what returns," which is explicitly **refused until episodic is jointly verified**. This is **Phase 2 work gated on episodic verification**, not a schedule item that arrives on its own. It must not be represented as MVP.

## 7. Effort (honest)

| Scope | Estimate | Nature |
|---|---|---|
| Technical shell (rooms configured over existing substrate) | **1–2 weeks** | software |
| Corpus gathering (collect → transcribe → curate → organize) | **2–4 weeks** | knowledge + relationship |
| Initial value | **~4–6 weeks total** | *assuming material exists and permissions are clear* |

**Revised down — because Jondi already has the material.** The earlier "1–2 months" assumed corpus *creation*. But Jondi already runs ongoing online groups, has many recorded video sessions and interviews, and likely hundreds of hours of language already expressed publicly or semi-publicly. So the pipeline is not *"interview Jondi → generate corpus"* but the far easier *"collect recordings → transcribe → curate → organize"* (§12). The bottleneck is no longer content creation — it is **curation and permissions**. That plausibly cuts months off.

**This is still more a knowledge-and-relationship project than a software project.** The engineering estimate is *time-to-shell*, not *time-to-value*; time-to-value is gated on §11–§12 corpus capture, which can start now, before any code.

## 8. Phasing

```
Phase 0 — Archaeology.                                  (Track B; can begin now; NO build/authorization dependency)
Phase 1 — Help people stay connected to Jondi's work.   (this candidate; ~1 wk shell, then corpus capture)
Phase 2 — Help people learn from Jondi.                 (deepens; Clean Language already partly in Phase 1 via Tap/Wisdom)
Phase 3 — Help the field itself carry Jondi's wisdom.   (the original Master's Field vision; months; do NOT start here)
```

### Phase 0 — Archaeology (the actual first step)

**`Find → Gather → Permission → Curate`.** This is *"The Jondi Archive Project"*: it has no engineering dependency, no companion dependency, no Studio dependency, and is valuable on its own. Estimated ~2–3 weeks by itself.

Deliverables:
- **Corpus inventory** — see the live scaffold at `docs/architecture/JONDI_CORPUS_INVENTORY.md`.
- **Permissions map** — Green (clear) / Yellow (ask) / Red (cannot use), per source.
- **Content taxonomy** — how the material organizes (teachings, EFT sequences, stories, Q&A, …).
- **First wisdom candidates** — real "Jondi often says…" lines, sourced not invented.
- **First EFT sequence candidates** — real sequences in her language.

*Only after Phase 0 do you actually know what the Companion wants to become.* That is the point: Phase 0 replaces the guess with evidence.

Note: "learn from Jondi" is not wholly deferred — the authorized Clean Language slice already lives inside Phase 1's Tap/Wisdom rooms. Phase 2 is the *deepening*, not the *introduction*, of learning-from-Jondi.

## 9. Governance alignment

- **The surfacing rule (§2)** — the single cleanest constraint: surface only member-authored, curated-Jondi-authored, or procedural material; never author interpretations, diagnoses, trajectories, growth claims, or inferred states. *Accompany, not simulate.*
- **Learn, don't simulate** — no Virtual Jondi; the companion never speaks as her or claims to be her (Master's Field reframe, 2026-07-21).
- **Freeze doctrine** — member-marked over system-inferred; no synthesis; no unverified "field state" claims. Patterns held out; Notice mirror-only.
- **Claim discipline** (`MARKETING_CLAIM_DISCIPLINE`) — landing copy must pass Live/Designed/Vision; phrases like "emotional recovery became faster" or "notice what is changing" are **not Live** and cannot appear as capability claims.
- **Evidence-before-architecture / curate-before-construct** — the corpus capture precedes the build; the rooms stay empty until Jondi's words exist.
- **Sovereignty invariants** — Sanctuary guard applies to all kept/marked content; Keep This defaults to private, low usage-authority (`lib/sanctuary/sanctuaryGuards.ts`).

## 10. Open questions (for the walk)

1. Room naming — the working set is "Continue / Remember / Prepare / Tap / Wisdom." "Tap" especially is provisional; softer candidates depend on Jondi's own language (Practice / Return / Regulation / Living the Tap / Coming Home). Warmer overall framings also possible ("What Wants Attention?", "The Field Between Sessions").
2. Does Jondi's companion get its own themed surface, or is it a configuration of the practitioner template under her studio?
3. Capture logistics — who interviews/curates Jondi, and in what format does the Class-A corpus get gathered and stored (existing talks/EC recordings/transcripts/emails → Keep This engine? dedicated corpus?). This is the long pole; it can start now, before any code.
4. Whether "Notice" ships in v1 at all, or waits with Patterns.
5. Relationship to the authorized Clean Language slice — is Tap the delivery surface that finally motivates building `lib/maia/supportModes/cleanLanguage.ts`?
6. Permissions — which existing recordings/groups/interviews may be curated into the corpus, and under what consent from Jondi *and* from group participants (a group EFT recording contains other members' voices; consent is not Jondi's alone to give).

## 11. Corpus sources

Jondi is an unusually strong candidate precisely because the material already exists. Potential initial sources, roughly by value:

- **Extraordinary College recordings** — potential gold; already semi-structured teaching.
- **Group EFT sessions** — potentially the richest: her language, *repeated* interventions, recurring questions, the patterns she reliably notices. Highest consent sensitivity (multiple voices — see §10.6).
- **Interviews** — especially valuable: people ask her *how she thinks, what she believes, why she works the way she does*, which surfaces implicit wisdom she might not otherwise articulate.
- **Public videos / webinars** — immediately usable Wisdom-room material, lowest consent friction.
- **Writings, handouts, EFT scripts** — already text; fastest to curate.

This is what lets the Wisdom room be **genuinely Jondi-authored** rather than AI-generated approximation — keeping the whole thing inside *learn from Jondi, not simulate Jondi*. Illustrative (real quotes to be sourced from corpus, not invented): *"Jondi often says…" · "one thing to remember this week…" · "an EFT invitation…"*

### Permissions is the real first gate

The sources are **not equal in permission cost**, and that ordering — not engineering — is what sequences the corpus work. Group and client material raise exactly the questions the estate has spent months clarifying: consent, ownership, privacy, participant expectations, downstream use of recordings. That is not a blocker; it is alignment — the constitutional spine already has the answers.

| Source | Permission complexity | Value |
|---|---|---|
| Interviews | Low | High |
| Public videos | Low | Medium |
| Teachings / writings / handouts | Low | High |
| Extraordinary College recordings | Medium | Very high |
| Group EFT sessions | High | Extremely high |
| Private client sessions | Very high | Potentially highest |

The gate is not "may we build?" — it is "**which material may be curated, under whose consent?**" Consent for a group recording is **not Jondi's alone to give** (other members' voices are in it).

## 12. Corpus pipeline (reusable)

The gathering path — **collect, don't create**:

```
Recording → Transcription → Curation → Wisdom extraction → Tap sequences → Companion surfaces
```

Written once for Jondi, this pipeline is **reusable for every future practitioner**. It is the concrete form of the second proof Jondi may carry (§1): not just continuity, but a repeatable **knowledge-capture-and-curation** path from a living body of work to a governed corpus. Each stage stays inside the surfacing rule — curation and extraction select and prepare *her* material; they do not author new claims.

## 13. Two tracks — and corpus formation can start now

The candidate separates into two independent tracks. **Only Track A needs a build decision; Track B needs none.**

```
Track A — Companion Build    (waits on Kelly's authorization)
Track B — Corpus Formation   (can begin tomorrow; no build authorization required)
```

**Track B is the first actionable step, and it is surprisingly simple: begin gathering and curating Jondi's existing materials.** It proceeds by the permissions tiers (§11), lowest-friction / highest-value first:

- **Tier 1 (start here)** — interviews, public videos, writings, handouts, and EC teachings where permissions are straightforward.
- **Tier 2** — group recordings, only with explicit participant permission.
- **Tier 3** — future Studio-native recordings (created *inside* the consent architecture from the start).

Because permissions, not code, gate the corpus, Track B can run entirely ahead of — and independent of — any decision on Track A. Nothing about starting Track B commits the estate to building the companion.

### Three distinct initiatives — each with its own evidence gate

What has emerged is not one project but three, and they must stay separable:

1. **Corpus Formation** ("The Jondi Archive Project") — Phase 0; can begin immediately; no dependency on anything below.
2. **Jondi Companion** — the candidate build (§5); only after enough corpus exists.
3. **Long-term Studio Migration** — held vision (§14); entirely separate; stays held.

**The discipline that keeps this from becoming another "Virtual Jondi" leap** — each initiative has its own gate, and success at one does **not** authorize the next:

```
Corpus gathering succeeds   ≠   Companion authorized
Companion succeeds          ≠   Studio migration authorized
```

Left unstated, the long-term vision quietly pulls the nearer phases forward — the exact drift the estate has spent months naming. Stated, each phase must earn its own evidence before the next opens.

## 14. Beyond the MVP — HELD VISION (Cat 1, NOT authorized)

> **This section is preserved direction, not scope.** Nothing here is authorized. It exists so the larger arc is recorded without contaminating the buildable candidate above. The discipline Kelly named: *immediate authorization = build a companion over existing substrate; long-term vision = Studio becomes the operating system for a practice.* Compatible, but different phases — do not collapse them.

**The arc (aspirational):** `Companion → Member home → Teaching platform → Practice operating system.` A gradual, non-disruptive migration where Studio becomes increasingly indispensable until "this is where my work actually lives" — never "stop using Zoom, move everything now." Practitioners rarely switch operating systems overnight; they slowly discover *"more and more of my work is happening here."* This overlaps existing held work: the Living Studio developmental-OS direction and the Studio north-star (relationship sovereignty). It is **not** a new roadmap; it is this candidate's tail, pointing at those.

**Studio may become the native corpus-formation environment** — not because it records people, but because it *already* has the substrate most systems bolt on later: consent architecture, thresholding, Keep This, privacy primitives, relationship continuity. Governance-first is the unusual asset here.

**The largest framing — Practitioner Legacy Infrastructure.** Jondi may become the first proof of something bigger than "companion": a way that a practitioner's life-work *endures*. The questions it eventually answers — *How does a practitioner's wisdom endure? How does decades of work remain accessible? How does teaching continue between sessions? How does a body of work avoid disappearing when the practitioner isn't in the room?* — are legacy questions, not feature questions. This is the most aspirational reading and the most heavily held; it is recorded here only so the near-term corpus work is understood as its seed, never as its authorization.

### The fullest articulation — Living Coaching Field / "Relationship OS" (= the Living Studio, instanced for Jondi)

For an advanced practitioner like Jondi — decades of work, colleagues, groups, teachings, private sessions, a living community — the ideal long-term form is not a companion app but a **living field with concentric layers**, the practitioner at the center. Kelly's framing (2026-07-21): *a living field where sessions, teachings, groups, colleagues, and wisdom remain connected across time* — a **Relationship OS** for advanced practitioners, not CRM / LMS / community-software / Zoom / knowledge-management (each of those is a fragment of what a practitioner actually lives in simultaneously).

**Important convergence (why this is validation, not a new project):** this six-layer model re-derives, from the advanced-practitioner-community angle, the already-held **Living Studio developmental OS** (Cat 1 VISION; `docs/explainers/THE_LIVING_STUDIO_EXPLAINED.md`; Larry = first instance). The same architecture arrived at twice from different directions is a strong signal it is real — and it means Jondi's field is a **second instance of the Living Studio, not a rival framework.** Where Larry's instance is *Body-of-Work-heavy*, Jondi's is *Community- and Legacy-heavy* — so Jondi actually tests the Living Studio's generalization claim in a new dimension.

| Jondi's concentric layer | Living Studio stream / component | Nearest buildable state | Gate |
|---|---|---|---|
| **L1 Relationship Field** (center: Practitioner ↔ Member — trust, attunement, transmission) | The human relationship; Co-Lab = Relationship | Human, not software — Studio *supports*, never replaces | The north star (§2): Studio never replaces this |
| **L2 Continuity Field** (before / during / after: prepare, keep, reflect, integrate) | MAIA-as-companion continuity | **= this MVP (Phase 1)** | Buildable now, on existing substrate |
| **L3 Teaching Field** (wisdom library, living curriculum, cohorts, EC) | Body of Work · Knowledge Registry · Media Library · courses | Corpus-dependent | Phase 0 corpus + permissions (§11) |
| **L4 Community Field** (colleagues, apprentices, peers, alumni, trained practitioners) | Community of Practice (the 4th stream) | Circles infra exists | Co-Lab boundary gate (31/31) + Circle-as-place architecture |
| **L5 Legacy Field** (archive → living continuity → future generations) | Legacy tier (top of the value stack) | Corpus-dependent | Permissions + heavily held (Practitioner Legacy Infrastructure, above) |
| **L6 Practitioner Intelligence** (what teachings resonate? what questions recur? which groups engage deepest?) | Developmental analytics / reflective intelligence | Not member diagnosis — practitioner's own field | **Episodic verification — same gate as Patterns (§6)** |

**Layer 0 — Corpus Formation underlies all of it.** Before any layer, `Capture → Consent → Curation → Continuity → Intelligence`. This is the reusable pipeline (§12) and the plausible **onboarding path** for future practitioners: `practitioner enters MAIA → corpus forms → continuity forms → practice deepens → Studio becomes practitioner home` — adoption by accumulation ("everything important about my work is already here"), never by migration decree.

**Phasing (Kelly): P1 Continuity → P2 Teaching + Groups → P3 Community + Colleague → P4 Legacy + Reflective Intelligence.** Building P4 immediately would be far too much; the value of stating the whole is that each layer knows which gate it waits on.

**The never-cross line holds at every layer.** L6 especially: *"what teachings resonate / what questions recur / which groups engage deepest"* is **practitioner intelligence about the practitioner's own field, not member diagnosis** — and it is still cross-session synthesis, so it waits on the same episodic verification that gates Patterns (§6). **Never, at any layer:** *"Jondi would probably say…" · "your healing field is asking…" · "your anxiety has improved."* Those cross from witnessing-evidence into authoring-the-field. The ladder: immediate = continuity companion; medium = memory + teaching archive; long = steward of evidence *arising from* the field — but never *Studio becomes Jondi*, never *Studio authors the field*. The field stays fundamentally relational and human; Studio helps it endure across time and between meetings.

---

*Candidate. Nothing here authorizes a build. §1–§13 describe a buildable companion over existing substrate (with Track B corpus formation able to begin with no build authorization); §14 is held vision, explicitly not scope. Its purpose is to give Kelly something concrete to walk and react to.*

---

## Changelog

- **2026-07-21 — Jondi-facing overview added (Part A).** Restructured into two parts: a plain-language overview intended to eventually be shared with Jondi (Part A) and the preserved internal architecture (Part B). No statuses changed; everything remains candidate / held / unauthorized.
  - **Human-terms spine added:** `Prepare → Participate → Integrate → Continue`, with the purpose stated as *"what if the work didn't disappear when people left the room?"*
  - **Present capability explicitly separated from future vision** using the Larry-precedent labels **EXISTS TODAY / TAKING SHAPE / FUTURE** (`MARKETING_CLAIM_DISCIPLINE`). Only the platform foundations (arrive/reflect/keep, proven in Larry's version) are marked EXISTS TODAY; the tapping/wisdom companion is TAKING SHAPE; groups/retreats/community/legacy/intelligence are FUTURE.
  - **Roadmap added** (Phase 0 → Phase 4 → Later), matching the three-independent-gates discipline.
  - **Living Studio convergence recorded:** the six-layer Jondi articulation is treated as an *instance* of the existing Living Studio developmental-OS architecture (Community/Legacy-heavy), not a new "Relationship OS."
  - **Distinctions ladder made explicit** at the head of Part B.
