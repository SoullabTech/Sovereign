# Personal Portal — Case Study Evaluation & Member Reconfiguration

- **Date**: 2026-06-14
- **Governed by**: `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` (Live/Designed/Vision · Center of Gravity · Failure Test), `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`, `docs/canon/MAIA_ATTENTION_DOCTRINE.md`
- **Prior art**: `PERSONAL_PORTAL_REVEAL_2026-06-10.md`, `PERSONAL_DAILY_FLOW_DESIGN_2026-06-11.md`, `PERSONAL_THRESHOLD_DESIGN_2026-06-11.md`, `THRESHOLD_PRINCIPLE_CANON_PROPOSAL_2026-06-11.md`, `STUDIO_HOME_REVEAL_SPEC_2026-06-10.md` (Track A — the practitioner analog)
- **Status**: EVALUATION + RECONFIGURATION SPEC. No code changed. Build sequence in §11 is gated, not authorized.

---

## North Star (governing frame — read first; added 2026-06-14, governs everything below)

The center of gravity moved three times in design — **Tools → Architecture → Purpose** — and the third governs. The Personal Portal is **not** a productivity system, a self-improvement system, a wellness dashboard, or a life-OS. It is a **place of conscious attending** — where a person can honor, reflect upon, remember, and remain in relationship with their life *while living it* (Kelly, 2026-06-14, refined past both "productivity system" and "coherence system" alone; the emphasis moved from management to **participation**). Not management, not optimization, not escape — participation. The system property it maintains is **coherence**, sharpened: coherence is *not* organization — it is *maintaining conscious relationship with the realities, experiences, relationships, commitments, and meanings that constitute one's life.* A coherent person is not necessarily organized; a coherent person is **attending.** Felt outcome: **presence.**

**Governing sentence (Kelly, 2026-06-14, refined to *participation*):**
> *The Personal Portal is a place of conscious attending — where a person can honor, reflect upon, remember, and remain in relationship with their life while living it.*
> *(earlier form, still true as a gloss: "helps people return to themselves, remember what matters, and live from conscious relationship with their lives.")*

**Success metric.** Not *"Did I complete my tasks?"* but ***"Am I more present in my life than I was ten minutes ago?"*** The object-permanence / continuity / obstacle-removal / Life→Portal→Life principles throughout this doc are **presence principles, not productivity principles** — the portal restores attention to the person's life; it never holds it.

**Sovereignty boundary (load-bearing).** The portal does **not** produce presence, consciousness, or meaning. It removes obstacles and offers a threshold; the returning is the person's own. Copy that claims the portal *makes* you present/conscious is guru-stance and fails the canon. The honest verb is *return* — the threshold is ours, the returning is theirs.

**The one question.** Daily Anchor, Journal, Keep/Capture, Relationship Field, Soul Mirror, Ideas, and the Focus tools are not separate features — they are doorways to a single question: ***"What is alive in me right now?"*** This is the "one foreground, several beneath" decision (Live), given its content.

**Witnessing, not tracking (invariant).** A living record of a life, never a performance score. Replace tasks-completed / streaks / minutes with member-named **signs of conscious living** — moments of presence, meaningful encounters, courage, synchronicity, creative sparks, gratitude, alignment-over-reaction, listening-over-rushing. **Critical discipline: these are member-marked, never system-inferred.** MAIA holds what the person names; it does not classify their experience for them (Threshold Principle: *never decides who the person is*; same rule, same substrate as the breakthrough-memory member-marked flag on atoms). A portal that *labels* your synchronicities is surveillance of the soul — the exact line the canon forbids.

**The rhythm — two portals, asymmetric:**

| | **Morning Portal** (threshold-in) | **Evening Portal** (threshold-out) |
|---|---|---|
| Question | *"What kind of day am I entering?"* — not "what do I have to do?" | *"What happened to me today?"* — not "what did I finish?" |
| Holds | energy · intention · one meaningful focus · one thing to remember | what mattered · what surprised me · what I'm carrying · what I'm ready to release · what I want remembered |
| Substrate | **Daily Anchor — Live** (`app/maia/anchor`) | **Designed (new, small)** — release keeps nothing; "what I want remembered" wires to Keep/Capture + atoms (member-marked) |
| Felt | orientation | **integration — this is where the exhale happens** |

The **Evening Portal is the deepest-shift touchpoint** — the answer to *"where does the exhale happen?"* It is the threshold *out*: noise released, day integrated. *"What am I ready to release?"* is the exhale; *"what do I want remembered?"* is the only memory the portal keeps — consent-grounded, member-marked. Designing the most cared-for moment as the **way back into life** — never a hook to return — is the Sovereignty Invariant in felt form (push life outward, reduce the system's centrality). *Refinement (Kelly, ↔): the measure is not the **fact** of leaving but the **quality of return** — the Portal is a conscious space **within** life (**Life ↔ Portal ↔ Life**), not an exit from it. The Leaving Test (Drift Register) measures the return, never the duration of the stay; what keeps "attending within life" from sliding into dwelling is structural — no pull mechanisms, time-in-portal never a success metric.*

**The product principle (governing test — Kelly, 2026-06-14).** *The Personal Portal exists to help people **notice, choose, and carry forward what matters while releasing what does not.*** Every feature faces one question: **does this help a person notice, choose, carry forward, or release?** If not, it may be useful, but it does not belong at the center. The **Evening Portal** — the one surface that does all four — is the first buildable piece: `docs/specs/EVENING_PORTAL_SPEC_2026-06-14.md`.

---

## North Star Drift Register — how it slowly becomes the wrong thing (Kelly-authored 2026-06-14; structural enforcement folded in)

The live risk is no longer "what should we build?" but *"how does it slowly become the wrong thing?"* The north star drifts wherever its guard is **behavioral** ("the team/MAIA remembers to keep it coherent") rather than **structural** ("the surface *cannot* express the wrong pattern"). Structure survives the actor; behavior erodes (cf. *structure-not-behavior-is-the-safeguard*). Set these as **gates before the build.** Five vectors (Kelly), each with its structural enforcement:

**Drift #1 — Productivity Creep.** The portal becomes task-management / optimization / performance-tracking; the question slides from *"Am I living consciously?"* to *"Did I complete enough?"* **Early signs:** streaks, completion %, badges, productivity scores, daily quotas, AI performance assessments. **Guardrail (Kelly):** every productivity feature must answer *"how does this increase coherence?"* — "helps people get more done" does not belong at the center. **Structural enforcement:** *coherence has no denominator* — no counts, streaks, "X of Y," or "this week you…" anywhere; and build Tasks from the **focus-tool** components (AvoidanceBreaker / NextStep, no scoring), never the `studio_tasks` board. The absence of a denominator is the testable structural form of the guardrail.

**Drift #2 — Interpretive Overreach.** MAIA begins deciding what experiences *mean* — "this was a breakthrough / courage / a synchronicity," "this pattern means…" — becoming an authority over experience. **Early signs:** auto-tagged soul encounters, inferred life lessons, personality conclusions, uninvited archetypal classifications. **Guardrail (Kelly):** the member names, MAIA holds; the member declares *"I want this remembered,"* the system never declares *"this should be remembered."* **Structural enforcement:** member-marked only, riding the atoms `is_breakthrough` pattern — **no classifier endpoint in the path.** The absence of an inference step is the guard, not MAIA's restraint.

**Drift #3 — Attention Capture.** The portal becomes a destination; time inside grows; the platform becomes central, life peripheral. **Early signs:** engagement metrics, notifications designed to pull people back, feeds, recommendation loops, session-length as success. **Guardrail (Kelly):** *Life ↔ Portal ↔ Life*; success is measured by what happens *after* leaving, not while staying. **Structural enforcement:** **no pull mechanisms** (no re-engagement notifications, no feed, no recommendation loop) and **time-in-portal is never a success metric.** This is the load-bearing guard that lets the *↔ / "conscious space within life"* framing be true without licensing dwelling: attending is measured by **depth (the Leaving Test), never duration.** The record is also **exportable** (the member's, not the platform's) so leaving never means loss.

**Drift #4 — Relationship Surveillance.** Relationship Field shifts from *reflection on my experience* to *analysis of another person.* **Early signs:** personality profiling, attachment classifications, predictions, "what they really meant," memory objects about non-members. **Guardrail (Kelly):** MAIA helps you understand *your participation* in the relationship; MAIA does not study the other person — both an ethical boundary and a product differentiator. **Structural enforcement:** **no persistence about non-members, ever** — no atoms, no profile, no cross-transcript memory keyed to the other party. The interaction model has nowhere to put the other person (see Evening-Portal spec: the same model, pointed at a transcript).

**Drift #5 — Coherence Inflation (the subtlest).** The portal tries to become calendar + tasks + journaling + relationships + creativity + health + finances + spirituality + community + learning — *everything* — and collapses into a life-OS. **Early signs:** feature accumulation, growing navigation, multiple competing home screens, rising complexity. **Guardrail (Kelly):** the portal **gathers; it does not absorb.** Its role is not to *become* life but to help people *remain in relationship with* life. **Structural enforcement:** the **four-verb membership test** — a feature belongs at the center only if it helps a person *notice, choose, carry forward, or release*; and the morning surface resolves to **one** foreground ("one clear orientation"), never a dashboard of tiles. Coherence is *not* organization — it is *attending*; a feature that organizes more but helps a person attend less has inflated.

**Above even the Failure Test — the Leaving Test (Kelly).** After interacting with the portal: *is the person more present, more connected, more coherent, more capable of returning to life?* If yes, it belongs. If it primarily increases engagement, dependency, interpretation, optimization, or platform centrality, it has drifted. (This measures the **quality of return**, not the fact of exit — the right test for a portal that lives *within* life: a deep 90-second attending passes; a sticky 10-minute session fails.)

**Meta-answer to "where does it drift":** wherever a guard is a *reminder* instead of a *structure.* The five vectors' enforcements above are the structural form of the north star — without them, "coherence" is copy.

> *The Personal Portal is not where life happens. It is where people remember they are alive.*

---

## The Constitution — four tests above the features (PROPOSED 2026-06-14)

The strongest artifact to emerge from this work is not a feature; it is a **hierarchy of tests**. Features evolve for years; these should not. Per canon discipline (boundaries are canon; nothing self-promotes), this is a **proposed** constitution for the Personal Portal — adoption into `docs/canon/` is Kelly's act, as with the Threshold Principle (kept in `specs/` until ratified).

**Grounding: three of the four already exist in canon; only the Leaving Test is new.** The Constitution *composes* existing instruments + one new test:

1. **Leaving Test** *(telos — NEW, Kelly)* — *Does this return people more fully to their life?* Protects **purpose.**
2. **Failure Test** *(honesty — `MARKETING_CLAIM_DISCIPLINE.md`)* — *Does the story survive if the Designed layer disappears?* Protects **truthfulness.**
3. **Sovereignty Test** *(agency — `MAIA_SOVEREIGNTY_INVARIANTS.md`)* — *Does agency remain with the member?* Protects **the person.**
4. **Attention Test** *(posture — `MAIA_ATTENTION_DOCTRINE.md`)* — *Does the system serve life rather than itself?* Protects **orientation.**

Failure Test protects honesty; Leaving Test protects telos — *you need both.* (Attention Test = the system's posture; Leaving Test = the person's experience — two angles on one telos.)

**Why the Leaving Test sits above everything.** The danger is not that MAIA becomes manipulative (obvious, catchable). It is that MAIA becomes **indispensable** (feels helpful). The drift sounds like *"people spend more time here because it's meaningful"* → and ends at *"people live through the Portal."* At that point the product has violated its purpose *while fulfilling its engagement metrics* — and it has **passed** the honesty, agency, and attention tests the whole way, because nothing was dishonest, coercive, or inattentive. Only the Leaving Test fails it early. That is why it is first.

---

## The Reciprocity Resolution — two truths held (added 2026-06-14)

Two truths appear to conflict:
- **Truth 1** — the Portal must not become the center; it returns people to life.
- **Truth 2** — genuine witnessing is profoundly meaningful; the Portal must not feel **inert** (not a filing cabinet, not a toolbox).

**Resolution: the variable is not *time*, it is *reciprocity*.** Deep relationship ≠ more time in the system; presence ≠ minimal interaction. What changes the experience is whether the space *witnesses back*. Inert: *"store things here."* Living: *"I remember what you chose to place here, and I can sit with you in it."* This is **witnessed continuity** — *"my life is not disappearing behind me"* — load-bearing for people who are overwhelmed, neurodivergent, creative, grieving, aging, or changing.

**The axis that keeps Truth 2 from eating Truth 1 — Witnessing vs Authority (structural):**
- MAIA *may* (**Witnessing**): remember, reflect, ask, notice **declared** threads, revisit **chosen** memories, hold continuity. → creates **relationship.**
- MAIA *may not* (**Authority**): decide, diagnose, classify, determine significance, define identity. → creates **dependency.**

**Two structural guards the beautiful examples themselves can slip past** — this is where the resolution becomes enforceable, not merely felt:

1. **Witnessed continuity surfaces *within* member-initiated presence — never pushed to manufacture it.** *"Three months ago you chose to remember the conversation with your daughter — looking back now, what do you see?"* is witnessing **only** when the member is already present (they opened the Evening Portal; they asked Resonance). The *same words* delivered as an outbound notification are a **pull mechanism** (Drift #3) — witnessing weaponized into re-engagement. **Rule:** continuity surfaces inside a session the member chose to open; it never reaches out to start one. This is precisely what lets witnessed continuity *not* violate the Leaving Test.
2. **Continuity context must be member-authored, not inferred.** *"You saved this 287 days ago"* is a verbatim fact (safe). *"…during a period when you were exploring belonging"* is **interpretation** unless the member labeled that period (Drift #2). **Rule:** MAIA states what the member *did* (saved this, on this date, with the label they wrote) — never characterizes the period or state unless the member named it. Verbatim echo, even here.

With those two guards, **witnessed continuity increases meaning without increasing centrality.** The Companion tier's felt value sharpens from *Continuity* to **Witnessed continuity**: *my life is being consciously attended alongside me* (notebook → conversation; archive → witness; database → companion). It passes the Leaving Test because its goal is not to keep someone in, but to help them feel their lived experience is not vanishing unnoticed.

---

## The Four Fields + the Witnessing Rule (added 2026-06-14)

**The real problem (Kelly):** this is no longer "designing a portal." It is *designing the conditions under which a relationship with MAIA can deepen **without becoming dependency.*** Most AI products pick a side — deep relationship (dependency risk) or independence (emotionally thin). This architecture holds both: depth comes from **witnessing** (continuity, reciprocity); dependency is blocked by **the Constitution + the Witnessing/Authority axis.**

**The information architecture — four standing fields + one daily bridge:**

| Field | Its question | Live substrate | Dominant drift to guard | Status |
|---|---|---|---|---|
| **Living Field** | *moving through the day* — tasks, calendar, creativity, commitments | Personal Field modules + Google Calendar (Live, practitioner-gated) | **Productivity Creep (#1)** + Coherence Inflation (#5) | ungate + curate |
| **Memory Field** | *what happened? what do I want remembered?* | atoms + `is_breakthrough` + Keep/Capture (Live) | Interpretive Overreach (#2) | surface |
| **Wisdom Field** | *what helps me make meaning?* | atoms / Keep-Capture (Live) + new collected-wisdom store | #2 + content-creep (#1/#3) | spec written |
| **Relationship Field** | *what am I learning through connection?* | scribe `container='solo'` (Live) | Relationship Surveillance (#4) | spec'd; member surface new |

*Everything else is a doorway into one of these four.* Note the **asymmetry**: the Living Field guards hardest against *productivity* drift; the three meaning-fields (Memory/Wisdom/Relationship) guard hardest against *authority* drift. Different field, different dominant drift, different primary guard.

**The Evening Portal is the bridge among the fields, not a fifth field.** Its gestures are the verbs that move a moment between life and the fields:
- **Honor / Witness** → *notice* (raise a candidate moment)
- **Remember** → *the router*: the member places a marked moment into its field — a conversation line → Relationship/Wisdom; a passage → Wisdom; a turning point → Memory. **Member-directed routing; no auto-classification** (the member chooses the field exactly as they choose the label).
- **Release** → *discard* (non-persistent)

So: **the four fields are the nouns (where meaning lives); the Evening Portal gestures are the verbs (how it moves).** Honor·Witness·Release·Remember doesn't just close a day — repeated nightly, it *builds a life that feels attended.*

**The Living Field's special hazard.** It is the most productivity-shaped surface (it *is* the Studio modules), so it is where Productivity Creep (#1) and Coherence Inflation (#5) pull hardest. Guard: the Living Field is legitimate only insofar as it **feeds the meaning-fields** — a completed task can become a Remember, a calendar event can be Honored — never a standalone productivity suite. It *gathers* the day toward attending; it does not *absorb* the portal into a life-OS. (Memory Field asks *what happened?*; Wisdom Field asks *what helped me understand what happened?*)

---

## The Witnessing Rule (generative — added 2026-06-14)

The Authority→Witnessing table is not five examples; it is **one generative rule** governing every MAIA utterance in the portal:

> **Every surface utterance must be expressible as a statement of what the member *did* — "you marked / saved / chose / returned to X" — never a statement of what *is* — "this is / means / you are X."**

| Domain | Authority (forbidden) | Witnessing (required) |
|---|---|---|
| Memory | "This was important." | "You marked this as important." |
| Relationships | "They meant…" | "What do you notice?" |
| Soul encounters | "This was synchronicity." | "You chose to remember this." |
| Wisdom | "Here's inspiration." | "This might belong beside what you saved." |
| Continuity | "You're becoming…" | "You saved this on Mar 3, Jun 1, Sep 8." |

A **testable lint**: take any MAIA line in the portal and ask *"is this a statement about what the member did, or about what is true of them?"* The second form is authority — rewrite or cut. Every witnessing form preserves agency — that is the entire mechanism by which the relationship deepens without becoming dependency.

**One seam in the table itself:** the Continuity row's natural phrasing — *"you've returned to this several times"* — carries a faint **denominator** (a count). Prefer the **verbatim** form — *"you saved this on Mar 3, Jun 1, Sep 8"* — both more evocative and free of the score-shaped "several times." The discipline is fractal: even the witnessing forms must pass the no-denominator guard (#1).

---

## What becomes an atom — three tiers of keeping (added 2026-06-14)

The Personal Portal is **not** a memory-free zone — shares and experiences *can and should* become atoms; that is the witnessed-continuity value (*"my life is not disappearing behind me"*). The Sanctuary fix (PR #446) does not reduce memory — it guarantees the **opt-out container is real**, which is exactly what makes default-keeping trustworthy. A space can only safely default to remembering if *not*-remembering is genuinely available. Three tiers:

1. **Released / Sanctuary** — kept **nowhere.** The member opted out (Release gesture, or Sanctuary Mode for a whole session). Non-persistence is absolute (PR #446 makes it true at the learning / relational / observability layers, not just the DB).
2. **Witnessed (default)** — a **background atom forms** (continuity substrate). MAIA *remembers* — but **forming an atom is not authority.** These are recall substrate; MAIA does not declare significance from them.
3. **Remembered / marked** — the member **explicitly elevates** a share/experience (Remember gesture → marked atom / `is_breakthrough`). The sovereign overlay the Portal's witnessing surfaces foreground.

**The principle (Kelly, canon-candidate): _atom formation is continuity; significance is sovereignty_ — MAIA may remember what was shared; it may not declare what matters.** Concretely: a share becoming an atom (substrate) is not authority; MAIA declaring it significant is. Atoms may form automatically; only the **member** marks "this matters"; and only **member-marked** atoms are surfaced as significance — the Continuity echo reflects what the member *chose*, never what the system *inferred*. Tier 1's reality is what makes tiers 2–3 safe.

*Resolved (Kelly, 2026-06-14): the **Evening Portal is hybrid.*** Honor / Witness → **Witnessed (tier 2)** (an unmarked entry may form a background continuity atom, like normal conversation); Release → **tier 1** (kept nowhere); Remember → **tier 3** (member-elevated). Rationale: if Witness left no trace the ritual would feel *less* alive than ordinary conversation; if Witness auto-marked significance it would be *too* interpretive — the background atom is the middle path, and the member's final **Remember** is the only act that says "carry this forward."

**The Memory Constitution scales across every field** (Kelly, 2026-06-14) — these are *constitutional* distinctions, not feature distinctions, so the same sovereignty rule holds everywhere:

| Field | Witnessed (tier 2 · continuity) | Remembered (tier 3 · member-declared) |
|---|---|---|
| Memory | background atom | marked atom |
| Wisdom | saved passage | member-canon item |
| Relationship | reflection exists | explicitly carried forward |
| Living | activity occurred | consciously retained |

It answers the question most memory systems never resolve — *how can something be remembered without the system deciding it is important?* **Continuity can be automatic; significance cannot.**

**Implementation guard — the Remember asymmetry (Kelly; the first crack to watch for).** At build time the temptation will be to make Remember *easier* by having MAIA suggest what to remember. That will feel helpful and is the first breach of the witnessing/authority boundary:
- ✅ MAIA **may ask:** *"Is there anything from today you want remembered?"* (opens the member's choice)
- ⛔ MAIA **may not ask:** *"Would you like me to remember this insight?"* (proposes significance — names "this insight" as significant)

Small difference in wording; enormous difference constitutionally. **MAIA opens the gesture; it never nominates the content** — the Witnessing Rule applied to questions (an invitation, never a nomination).

---

## 0. Executive verdict (the stamp)

> **Carrier:** Human (the tools serve the member's own agency) · **Layer:** *mostly Live, surfaced Designed* · **Center of Gravity:** rests on tools that already run in production · **Failure Test:** **survives** — strip the threshold surface and the member still gets Live tools today · **Verdict:** ✅ **Now (as a reveal)** + ⚠️ **Forward (Relationship Field, Tasks page, threshold surface)**

**The one-sentence finding:** *The Personal Portal is not a build — it is a **reveal** of tools that are already Live, given **object permanence** for a scattered mind, plus two focused builds (Relationship Field, a Tasks surface), packaged as the felt content of the paid Companion tier.* The risk is not over-building; it is **over-claiming the threshold surface as the value** when the value is the tools it makes findable.

---

## v2 — Grounding Correction (2026-06-14): the Personal Field already exists

**What changed.** A screenshot of a live "Personal Field" surface forced a re-grounding. The v1 claim — *"no member portal route; the threshold surface is Designed"* — **undercounted what is built.** This is the project's documented *inverse drift* (live infrastructure stays invisible until measured). The v1 *value* analysis still holds (the tools are mostly Live); the *architecture* and *build sequence* are corrected below.

**The surface exists and is Live — as a mode of the Studio shell, not a new route.** "Personal Field" = `members.studio_mode = 'personal'` (default `'practice'`), toggled in `components/studio/TeamSwitcher.tsx`, nav filtered by `getVisibleModules()` in `lib/studio/moduleDefinitions.ts`. Personal preset (current) = `['decisions','changes','maia','vault','threshold','tools']` + always-on `settings`. **Per Kelly 2026-06-14, `threshold` is removed from the member set** — the surface itself is the threshold (see the module table). Member-clean core becomes `['maia','decisions','changes','vault','tools']` + `settings`, plus the daily additions: **Daily Anchor as the landing/floor**, **Tasks**, **Relationship Field**. **It is *not* `app/fields/[field]/*`** (that is the unrelated Masters field-authoring system — do not conflate).

**The one edge that blocks it from being a member product is the gate, not the surface.** `app/studio/layout.tsx` redirects any non-practitioner to `/studio/create`. **A plain member cannot reach Personal Field today** — it is currently *a practitioner's personal-life mode*. (Cf. doctrine: *find the missing edge, not the missing thing.*)

**Corrected module inventory (Personal Field nav):**

| Module | Backing | Status | Disposition |
|---|---|---|---|
| MAIA | `app/studio/maia` (`OracleConversation surface="studio"`) | 🟢 Live | **Keep** |
| Decisions | `app/studio/decisions/*` | 🟢 Live | **Keep** — personal decision-tracking + MAIA consult |
| Changes | `app/studio/changes/*` (I-Ching) | 🟢 Live | **Keep** — strong cultural-creatives fit |
| Vault | `app/studio/vault` → `app/api/studio/files` | 🟢 Live | **Keep** — encrypted personal files/notes |
| Settings | `app/studio/settings` | 🟢 Live | **Keep** — hosts the mode toggle |
| Media Studio | `app/studio/media` | 🟢 Live (thin) | **Keep** — creative |
| Live Camera | `app/studio/camera` (local `getUserMedia`) | 🟢 Live | **Keep** — creative |
| Threshold | `app/studio/threshold/*` | 🟢 Live, **practitioner-residue** | **REMOVE (Kelly 2026-06-14).** The Personal Field's *landing* IS the threshold — the zero-input floor / Daily Anchor you cross on the way in and back out. A module called "Threshold" inside a threshold is redundant; and the existing one is a practitioner six-week passage. Drop it. The *Threshold Principle* (design doctrine) still governs the whole surface. |
| Session Room | `app/studio/session-room` (Scribe, 1643 LOC) | 🟢 Live, **practitioner-residue** | **Rework → Relationship Field** (§6); strip client containers + supervision |
| Tools | `app/studio/tools` | 🟡 **Placeholder-heavy** (`comingSoon`/affiliate) | **Fill** — this is where Tasks + the daily creativity/productivity set land (§7) |

**The aggregator vision is closer than v1 implied.** Kelly's framing — *"calm the chaos of calendar, to-do, scheduling, journaling — all in one place"* — already has Live substrate:
- **Calendar (Live, Google):** real OAuth + token store + automatic booking→event sync + privacy-disclosure setting (`lib/calendar/GoogleCalendarService.ts`, `syncSessionToGoogle.ts`, routes `app/api/auth/google/*`). Microsoft 365 is build-complete but env-gated off (`lib/calendar/MicrosoftGraphService.ts`). The "Active"/"Connected" states are read from real DB rows.
- **To-do / Tasks:** `focus_tasks` substrate Live; needs the member surface (lands in Tools).
- **Journaling:** Quick Journal + Keep/Capture Live; Vault Live for longer notes.
- **Reframe:** "Calendar Privacy → no **client name**" (`calendar_disclosure_default`, applied in `syncSessionToGoogle.ts:59`) is practitioner-residue language to reword for personal use.

So "all in one place" is a **curate + ungate + reveal**, not a greenfield aggregator build.

**Revised thesis (supersedes §2/§11 sequencing):** the highest-leverage move is **ungate → curate → strip**, not build:
1. **Open the gate** for personal-mode members (or clone a member-gated shell) — the pivotal, security-sensitive decision (§12.1).
2. **Re-curate the personal preset** to a member-clean daily set: make **Daily Anchor** the landing (the zero-input floor that *is* the threshold); add **Tasks**; **remove the Threshold module**; **rework Session Room → Relationship Field**; **fill Tools**.
3. **Reveal the Live aggregation** (Google Calendar + Tasks + journaling + Vault) as the calm-the-chaos home; reword the practitioner-residue copy.

**Cultural-creatives "future-proofing" — held as Vision; do not let it inflate the near-term claim.** MAIA's advanced options (ultradian 90-min cycles, HRV-informed energy states, somatic check-ins, peer-resonance) are **Vision-tier with named gates**: HRV needs sensor input; somatic = the dormant `SomaticMemoryService` (Cat-4, Later); ultradian needs a rhythm model. The **one** advanced angle already partly Live and worth featuring is **archetypal / cyclical frameworks** (Spiralogic + the I-Ching `Changes` module) — a real, grounded differentiator for season/phase thinkers. Everything else stays Cat-1 preserved direction until its gate is met. (This is exactly the Failure-Test discipline: the cultural-creatives pitch must survive on the Live + archetypal layer alone.)

**MAIA's "Connection to Practitioner Layer" pillar** conflicts with *no practitioner tools* only in name — it is a *member-side* thread to one's own practitioner, not a practitioner capability. **Defer it:** it's an integration, not a daily-life tool, and it's the easiest seam for practitioner-residue to creep back in.

---

## 1. What is being evaluated

A **scale-up paid option for personal members/stewards** built around the Personal Portal concept, with four reconfiguration constraints from the directive:

1. Fit the **Ganesha-ADHD model** (object permanence, externalized working memory, obstacle-removal not optimization).
2. **No practitioner tools** — strip everything that credentials a role or holds another person as a "client."
3. Rework **Session Rooms → Relationship Field**: MAIA helps a member review a *recorded relationship transcript*, with **no pro/clinical/supervision options**.
4. Make **Tasks** available, plus **any daily-use tool that aids creativity and productivity**.

This evaluation grades each piece against the claim-discipline ladder, names the load-bearing boundaries, and gives a gated build sequence.

---

## 2. The reconfiguration thesis — Studio reveal → Personal threshold

The practitioner side already solved this shape. **Studio Home Reveal (Track A)** was *presentation-first, no new backend*: five cards wired to verified existing endpoints, nav re-aimed via config, showrooms (mock/coming-soon) removed so they "must not define the first impression." (`STUDIO_HOME_REVEAL_SPEC_2026-06-10.md`)

The Personal Portal is the **member-facing sibling of that move**. The directive's "reconfigure/edit for personal member use" is, precisely, *port the Track A pattern from practitioner to member and swap the contents*:

| Studio Track A (practitioner) | Personal Portal (member) |
|---|---|
| My People (clients) | — *removed; no client model* |
| Prepare Me (pre-session surfacing) | **Daily Anchor / Now Card** (pre-day orientation) |
| My Threads (continuity proxy) | **Keep / Capture + memory continuity** |
| My Communities | **Community / Commons** (already member-facing) |
| MAIA (living presence) | **MAIA** (the conversation — unchanged) |
| Sessions / Scribe (supervision) | **Relationship Field** (personal transcript reflection) |
| Studio Tasks (energy board) | **Tasks** (focus_tasks, member-framed) |

**Reveal-over-build is the whole discipline here.** Most contents are Live; what is Designed is the *arrangement* and two features.

---

## 3. The Ganesha-ADHD frame (why this is a portal, not a dashboard)

From `PERSONAL_PORTAL_REVEAL_2026-06-10.md` §0.5, three tenets are load-bearing and **directly determine the paid-tier design** (see §5):

- **Object permanence** — *"a tool you must remember to find does not exist for a scattered mind."* For this population **hidden = nonexistent**. This is why "reveal" is a *function, not a finish*, and why **summoned-only tools (focus tools today) do not count as available.**
- **Externalized working memory** — the portal offloads what the brain can't hold. The continuity layer is not a luxury; it is the accommodation.
- **Obstacle-removal, not optimization** — *"Ganesha smooths the path to the next action; it never asks the person to perform meaning."* No streaks, no scores, no optimization theater.

**Signature mechanism (unchanged, adopt verbatim):** *personalize the **demand**, not the content* — capacity determines how many of the threshold's questions get asked; **default to the floor, invite toward the ceiling.**

**Telos test (sharpened):** not "orient to what is alive" but *"does this help the person stay tuned in?"* — i.e., return them to their life oriented (Life → Portal → Life), never hold them in the app.

---

## 4. Capability inventory — Live / Designed / Vision

The heart of the evaluation. Graded against runtime fact (a Live claim must be answerable to a runtime fact; built ≠ wired ≠ surfacing ≠ verified).

| Capability | Layer | Runtime basis | Gap to close |
|---|---|---|---|
| **Daily Anchor** | 🟢 **Live** | Own route `app/maia/anchor/`, wired | Surface as a portal tile |
| **Keep / Capture** (mark atoms) | 🟢 **Live** | `app/maia/keep-capture/`, atoms loader Cat 6 | Surface as tile |
| **Quick Journal** | 🟢 **Live** | `components/journal/QuickJournalSheet.tsx` | Surface as tile |
| **Songwriter / Ideas** (creativity) | 🟢 **Live** | `app/maia/songwriter/`, `app/maia/ideas/` | Surface as tiles |
| **NeurodivergentValidation** | 🟢 **Live** | `lib/oracle/NeurodivergentValidation.ts`, in oracle | None (in-conversation) |
| **Soul Mirror / Mandala** (reflection) | 🟢 **Live** | `app/maia/soul-mirror/`, `app/maia/mandala/` | Surface as tiles |
| **Tier / billing** (Explorer/Companion/Steward) | 🟢 **Live** | `app/api/billing/subscriptions/route.ts`, `lib/portal/tier.ts` | None |
| **Focus Garden / AvoidanceBreaker** | 🟡 **Live-but-summoned-only** | Built + mounted via `ToolRevealSheet` in `OracleConversation.tsx:9089`; tier-aware; **Oracle-summoned, not findable** | **Object-permanence gap** — give a standing surface |
| **Now Card (member)** | 🟡 **Designed** | Built but Studio-only (`/api/studio/energy`) | Member route + member energy source |
| **Personal Portal threshold surface** | 🟡 **Designed** | No `app/maia/portal` route exists | Build the surface (the reveal) |
| **Tasks (unified member page)** | 🟡 **Designed** | `focus_tasks` substrate Live (`20260104000001_focus_tasks.sql`); no member page | Build page; reconcile `user_id TEXT` ↔ `member_id` |
| **Relationship Field** | 🟡 **Designed** | Scribe substrate Live (`scribe_sessions` supports `container='solo'`); review engine Live (`lib/scribe/sessionReviewMode.ts`); no member surface, prompts are clinical | Member UI + relationship lens (strip clinical) |
| **Weather = posture (tone→opening register)** | 🔵 **Vision** | No tone→posture mechanism exists | Build last, most conservatively |

**Read:** 7 capabilities Live, 5 Designed (4 of which are *surfacing* gaps over Live substrate), 1 Vision. The Center of Gravity sits squarely on the Live row. This is a publishable-now reveal with two real builds behind it.

---

## 5. The paid-tier evaluation (the hard doctrinal question)

**The constraint that governs everything:** the tier philosophy is *"Soullab does not sell attention… the limit is continuity, not care,"* and the gating doctrine is **Visible Doors** (`VISIBLE_DOORS_2026-06-12.md`) — a tier-gated surface **orients** to the next layer, never **locks** a feature. The Ganesha-ADHD tenet **compounds this**: gating a focus/avoidance tool behind a paywall *in a moment of need* is **hidden = nonexistent** — actively hostile to the population the portal serves.

**Therefore the paid tier gates DEPTH and CONTINUITY, never access-in-the-moment:**

| Tier | Key | Price | What the Portal gives | What it does **not** gate |
|---|---|---|---|---|
| **Explorer** | free | $0 | The floor + the tools **in the moment** (Daily Anchor, journal, focus tools when summoned, one Now Card) | Never gates a tool you need *right now* |
| **Companion** | personal | $12/mo | **The Portal itself** — object permanence (tools stay visible), continuity across days, **Relationship Field**, persistent **Tasks**, patterns over time | — |
| **Steward** | pro | $35/mo | Deeper continuity capacity + **personal** stewardship (Helper Fund, community contribution) — *responsibility for one's own field, not authority over others* | **No practitioner/clinical tools** (per directive) |

**The honest pitch for the paid scale-up:** *Explorer gives you the tools. Companion gives you a place they live — so a scattered mind stops re-finding them, and the portal remembers across days.* The paid value is **object permanence + continuity**, which is exactly the ADHD accommodation and exactly what the tier doctrine says you may charge for. **This is the cleanest possible alignment of pricing philosophy and feature.**

**Naming tension (decision in §12):** the existing "Steward/pro" tier is where practitioner-ish responsibility lives. The directive's "members/stewards… no practitioner tools" means the Personal Portal is principally the **Companion** experience; "Steward" must be reframed for *personal* depth (stewarding one's own field + optional contribution), not practitioner capability.

---

## 6. Relationship Field (reworked Session Rooms)

**Mechanic (reuse, near-whole):** the scribe stack already supports this with **no schema change**. `scribe_sessions` has `container='solo'`; `scribe_transcript_entries` holds content; `scribe_markers` holds flagged moments; `lib/scribe/scribeAuth.ts` is already pure member-ownership; the review engine `lib/scribe/sessionReviewMode.ts` + `app/api/scribe/review-session/route.ts` is member-gated and already has a non-clinical "read it back to the person" mode.

**Strip (the "no pro options" line):** the entire `supervision_*` schema, `case_id`, `practitioner_id`, `booking_id`, the SOAP/DAP note generation, "client name" framing, and the CPD/mentor lens. None of it ships to members.

**New (small):** a member surface (sibling to the practitioner-gated `app/studio/scribe`, e.g. `app/maia/relationship-field`) + a **relationship reflection lens** swapped into `sessionReviewMode.ts` (reflect on *the member's experience of the relationship*, grounded in the transcript — not a clinical read).

**⚠️ LOAD-BEARING BOUNDARY — third-party consent (the standout finding).** A "relationship transcript" contains a **second person who is not a member and has not consented to MAIA's memory.** The entire consent architecture (Sanctuary Mode, consent-for-memory) is built around the member's *own* data. This feature touches someone else's. Non-negotiables:

1. **MAIA reflects the member's experience, never builds a profile of the other person.** The other party gets no atoms, no model, no pattern formation. They are present in the text, absent from memory.
2. **Default posture: bring-your-own / sealed.** Prefer the member reviewing a recording *they already made with consent* over MAIA capturing live. If live capture is offered, the member explicitly acknowledges responsibility for others' consent, and the session defaults toward Sanctuary-style sealing (`memory_policy='sealed'`).
3. **This boundary is the feature, not a gap** — it is exactly what separates Relationship Field from the practitioner tools (which legitimately *do* hold a client). Frame it as the sovereignty guarantee: *"MAIA helps you reflect on the relationship. It never studies the other person."*

This boundary must pass the Attention-Doctrine and Sovereignty-Invariant checks before any build.

---

## 7. Tasks & the daily creativity/productivity set

**Tasks (Designed over Live substrate):** `focus_tasks` (+ `focus_reminders`, `focus_message_drafts`) is built and member-aware; the tool components exist — `InboxTriage`, `NextStepBuilder`, `AvoidanceBreaker` (`components/focus/*`). Missing is a **unified member surface** and the `user_id TEXT` ↔ `member_id` reconciliation (pattern exists in `app/api/members/migrate-data/route.ts`). The practitioner `studio_tasks` energy-board is **not** reused (it's gated and over-featured for personal use).

**Ganesha-ADHD framing for Tasks (mandatory):** obstacle-removal, not a productivity board. `AvoidanceBreaker` ("draft the avoided message + schedule one follow-up, <60s, <3 choices") is the highest-leverage tile. **No streaks, no completion scores, no nagging** — that is optimization theater the tenets forbid.

**The daily portal tile set (creativity + productivity):** Daily Anchor · Now Card (member) · Tasks/Focus (InboxTriage, NextStep, AvoidanceBreaker) · Focus Garden · Quick Journal / Keep-Capture · Songwriter · Ideas · Soul Mirror / Mandala. **One foreground, several beneath** — gather, never menu. All but Now Card, Tasks-page, and Focus-standing-surface are Live today.

---

## 8. Boundaries (load-bearing — all must pass before ship)

- **Sovereignty:** every tile increases agency and pushes life **outward** (Life → Portal → Life). A tile that increases time-in-app fails (Sovereignty Invariant Check).
- **Attention:** the portal returns the person to their life oriented; it does not compete for attention or "perform meaning."
- **Consent / third-party (§6):** the other person in a relationship transcript is never modeled. Sanctuary boundary is absolute.
- **Object-permanence vs. paywall:** the paid tier gates **depth/continuity**, never a tool needed in the moment. No focus tool is ever paywalled at point of need.
- **No practitioner tools:** no client model, no clinical notes, no supervision, no booking, no caseload — verified by exclusion, not by intention.
- **Claim discipline in-product:** a tile must never imply a capability the click won't deliver. Designed tiles (Relationship Field, Tasks) carry honest "becoming" status until verified-surfacing.

---

## 9. Drift to avoid (named explicitly)

- ⛔ *"A complete personal operating system for your life"* — narrative inflation; it is a threshold that reveals existing tools.
- ⛔ *"MAIA understands your relationships"* — the Relationship Field reflects the **member's** experience; it does not understand or model the other person.
- ⛔ *"AI-powered productivity suite"* — optimization theater; the Ganesha frame is obstacle-removal, explicitly not optimization.
- ⛔ *"Unlock premium tools"* — paywall framing; the doctrine is Visible Doors / continuity-not-care.
- ⛔ Treating the **threshold surface** as the headline capability — the Center of Gravity is the Live tools; the surface is the arrangement.

---

## 10. Failure Test + Verdict

**Failure Test:** strip the Designed layer (threshold surface, Relationship Field, Tasks page) and the Vision layer (weather/posture). **Does the story survive?** Yes — *members get Daily Anchor, Keep/Capture, journaling, songwriter, ideas, and focus tools, live today.* The story survives as Live. → **Publishable now as a reveal.** The Designed features are honest **Forward** claims, not Live ones.

**Verdict:** ✅ **Now (reveal of Live tools + Companion-tier continuity)** · ⚠️ **Forward (Relationship Field, Tasks surface, member Now Card, threshold surface)** · 🔵 **Vision (weather=posture)**.

---

## 11. Build sequence (gated — not authorized; each phase verifies before the next)

1. **Phase 0 — Reveal (presentation-first, no new backend).** Build `app/maia/portal` threshold surface: zero-input floor + one foreground, several beneath. Tiles point only to **Live** routes (Anchor, Keep/Capture, Journal, Songwriter, Ideas, Soul Mirror). Give the **focus tools a standing surface** (close the object-permanence gap) — same components, now findable, not summoned-only. *Mirror Studio Track A: clean branch off `clean-main-no-secrets`, reuse verified endpoints, verify authenticated in browser.* **Gate to Companion tier via Visible Doors (orient, don't lock).**
2. **Phase 1 — Tasks surface.** Unified member page over `focus_tasks`; reconcile `user_id`↔`member_id`; AvoidanceBreaker/InboxTriage/NextStep tiles; no streaks/scores. Verify writes persist per member.
3. **Phase 2 — Relationship Field.** Member surface over scribe `container='solo'`; relationship reflection lens in `sessionReviewMode.ts`; **third-party consent boundary (§6) implemented and tested first.** Default sealed. Verify the other-person-not-modeled guarantee holds (no atoms written for non-members).
4. **Phase 3 — member Now Card.** Member energy source; Studio-only `/api/studio/energy` not reused directly.
5. **Phase 4 (Vision, last) — weather=posture.** Only after the above stabilize; most conservative build.

Each phase ends at a verify gate (authenticated render + runtime-fact check), consistent with the project's "declaration is not liveness" discipline.

---

## 12. Open decisions (for Kelly)

1. **Access architecture (PIVOTAL — gates everything else).** The Personal Field surface is Live but practitioner-gated. Three ways to let members in:
   - **(A) Generalize the gate** — let personal-mode members into the existing `/studio` shell, rendering only the member-clean module subset. *Lowest build cost, reuses everything Live (incl. Google Calendar sync).* **Security-sensitive**: the shell is currently a practitioner boundary; route-level (not just nav-level) protection must ensure members can't reach client/caseload/billing/supervision surfaces. Requires a `security-auditor` pass before ship.
   - **(B) Clone a member-gated Personal Portal shell** — separate surface reusing the same module components with member auth from the ground up. *Clean separation, no leak risk; more work + some duplication.*
   - **(C) Hybrid** — extract the shared module renderer; mount it under both the practitioner shell (existing) and a new member-gated entry. *Best long-term, highest up-front cost.*
   - **Recommendation: (A) for the first ship**, behind a `personal_portal_enabled` flag + Companion tier gate + a security-auditor review of route-level gating, because the missing piece is genuinely the gate, not the surface (reveal-over-build). Migrate toward (C) if duplication pressure appears.
2. **Tier naming for the personal scale-up.** Is the Personal Portal sold as **Companion** ($12, the natural home — continuity + object permanence), with "Steward" reframed for *personal* depth (own-field stewardship + Helper Fund contribution, no practitioner tools)? Or does it need its own name? Current "Steward/pro" connotes practitioner responsibility, which the directive excludes.
2. **Relationship Field capture posture.** Bring-your-own-recording (member already has consent) vs. live capture with an explicit third-party-consent acknowledgment. Recommendation: **bring-your-own / sealed by default** for the first ship; live capture is a later, gated decision.
3. **Scope of Phase 0 reveal.** Ship the reveal of Live tools alone first (publishable now), and treat Relationship Field + Tasks as Forward — or hold the whole portal until all three are built? Recommendation: **ship the reveal first** (Failure Test says it stands alone), then layer Forward features.
