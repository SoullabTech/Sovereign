# MAIA Launch Experience — Specification

**Date:** 2026-08-25 · **Status:** Design specification. **Nothing here authorizes a production UI change.**
**Branch:** `claude/maia-onboarding-orientation-djtoii`
**Governed by:** `docs/canon/THE_HOUSE.md` · `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md` ·
`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` · `docs/canon/THE_MEMBERS_WORLD_IS_PRIMARY.md` ·
`docs/canon/MARKETING_CLAIM_DISCIPLINE.md` · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` (14, 16)

**Claim layer of this document:** **Designed**, with clearly-marked **Vision** sections.
Every surface below carries its own Live / Designed / Vision tag. Where a tag says *Live*, it means
*present in source on `clean-main` lineage as read on 2026-08-25* — **not** a production verification.
No claim in this document may be repeated outward without the runtime check named in §11.

---

## 0 · What this document is

The research pass (2026-08-25) concluded that MAIA's launch problem is not a prettier chat screen; it is that
**conversation is carrying too much of the burden of orientation**. A new member effectively meets
*"Here is MAIA. Say something."* — and must understand what MAIA is, imagine what it can do, decide what is
appropriate to share, formulate it into language, and trust the system, all before receiving any value.

That diagnosis holds. This document turns it into a buildable specification across four surfaces:

| | Surface | Question it answers | Layer today |
|---|---|---|---|
| **A** | Public MAIA landing (`/`) | *Why would I want this, and why should I trust it?* | Live (needs restructure) |
| **B** | Guided Arrival (first visit, and on demand) | *I'm new. Where do I begin?* | Partly Live (ceremony), Designed (doorways) |
| **C** | MAIA House (authenticated home) | *I'm here. What can I do now?* | Partly Live (House sheet, `/home` portal) |
| **D** | Conversation | *the work itself* | Live |

The architectural change is that **conversation becomes D, not A.**

---

## 0.1 · Ratified rulings

### MLX-Q1 — GREEN (Kelly, 2026-08-25): `/maia` is the canonical authenticated MAIA threshold.

```
   /maia  =  MAIA House / threshold
                  │
                  ├── orientation
                  ├── continuity
                  ├── doorways
                  ├── direct conversation
                  └── rooms / worlds
```

**The conceptual correction this carries:** *conversation is no longer synonymous with the route `/maia`.*
Conversation becomes one thing the threshold opens onto, not the thing the route *is*.

Three constraints ride with the ruling:

1. **`/home` must not remain a competing MAIA arrival constitution.** It may redirect, alias, or serve a
   broader account-shell purpose during migration if something genuinely still depends on it — but it may not
   independently answer *"where do I begin?"*
2. **Existing deep links are preserved, not broken.** Routes and query states that currently enter conversation
   directly continue to work. The principle: **one default threshold, many intentional deep entrances.**
3. **Migration behaviour is established before routing changes.** This is a constitution, not a routing
   demolition.

### The doorway ruling (affirmed)

A doorway is **Encounter**, not Recognition. Clicking *Understand a pattern* may mean, at most:

```
   member intentionally entered through doorway X          ✅ context for MAIA's opening
   member_spiral_state = WATER                             ❌ never
```

**It is not psychological evidence.** It may contextualize how MAIA opens; it may not become a claim about
the person.

### MLX-Q5 — RESOLVED (Kelly, 2026-08-25): continuity launches in layers.

Four tiers with **different evidentiary requirements**, replacing one vague "MAIA remembers" bucket:

```
   KEPT       explicit continuity   — the person chose to retain it        ✅ launch primitive
   RECENT     factual continuity    — where they have recently been        ✅ safe to show
   CONTINUE   contextual continuity — resume eligible existing work        ✅ member gesture
   DEEPER     recognition           — only where proven (FAST/CORE)        ⏸ not promised
```

The launch continuity claim narrows accordingly. **Not launchable as a universal claim:** *"You don't have to
begin your life again from zero"* — it promises a universality the runtime cannot guarantee while DEEP breaks
at `buildComprehensiveVoicePrompt`. **Launchable now:**

> *When you've chosen to keep something, MAIA can help you return to it.*
> *What matters doesn't have to disappear when the conversation ends.*

The stronger line **graduates** when the full recall path passes the Failure Test. *We do not hold launch
hostage to the entire memory frontier; we avoid promising more than the runtime reliably delivers.*

### MLX-R1 — GREEN (Kelly, 2026-08-25): the three onboarding screens are replaced by the doorway.

**Post-signup becomes:**

```
   NAME  ──►  DOORWAY  ──►  MAIA
                            target: under 60 seconds to first meaningful interaction
```

Each existing screen is **relocated, not discarded** — the intellectual architecture is kept; it moves to
where it actually has meaning:

| Screen | Disposition |
|---|---|
| **ConsciousnessPreparation** (10 lenses) | **Remove.** Its answer goes to `localStorage` and nothing reads it — pure threshold burden. |
| **BirthDataStep** | **Preserve the capability and its consent model; move it to the point of relevance** — Soul Portrait / Astrology. *Someone should give birth data because they want that experience, not as the price of meeting MAIA.* |
| **SageTealWelcome** (five elements) | **Remove from mandatory onboarding.** Introduce the elements on the public landing page (§A.6) and again through optional, member-initiated discovery inside Soullab. *People should encounter Spiralogic progressively rather than pass a philosophy lesson before receiving value.* |

**The principle this establishes:**

> **Teach the world before signup. Orient the person after signup. Let MAIA provide the first value.**

**Safeguard — the doorway must not become another questionnaire.** It asks *"What is asking for your
attention?"*, offers several recognizable starting places plus *"I don't know where to begin"*, and then:
**one tap, and MAIA starts.** Any addition that turns the doorway into a form violates this ruling rather
than extending it.

### MLX-R5a — GREEN (Kelly, 2026-08-25): two spheres over the shipped spine.

Preserves the live architecture and World names rather than inventing a replacement taxonomy; gives the
ecosystem its personal / practitioner distinction; and retires **Worlds / Rooms** as abstract navigation
concepts a member has to decode.

```
   SOULLAB
   │
   ├── MY SOULLAB
   │   │
   │   ├── MY LIFE                    ├── MY WORK  ⚠️ label not frozen — see R5b
   │   │   ├── Living Field           │   ├── Ideas
   │   │   ├── Journal                │   ├── Wisdom
   │   │   ├── Anchor                 │   ├── Creative / Studio surfaces
   │   │   ├── Relationships          │   └── …
   │   │   ├── Soul Portrait
   │   │   └── …
   │
   └── MY PRACTICE                    ← eligible helpers only
       ├── People / Caseload          ├── Preparation
       ├── Sessions                   ├── Encounters
       ├── Session Room               └── Studios / practitioner tools
```

**The governing rule this establishes:**

> **Use familiar words for orientation; preserve distinctive names for actual places.**

A new member must never have to understand what a *World* is in order to navigate. Once inside, Living Field,
Anchor, Ideas, Wisdom, Keeps and Soul Portrait retain their identity. *That is how Soullab becomes both
familiar and unmistakably its own ecosystem.*

**What the two spheres mean:**

| | |
|---|---|
| **My Soullab** | the life I am living |
| **My Practice** | the responsibility I carry for those I serve |

*Same ecosystem. Different relational jurisdiction.* The two constituencies become visible without splitting
the product into two products.

**Implementation notes.** `Worlds` / `Rooms` retire as **group headings**, not as registry classifications —
`classification: 'world'` may remain in code (§2.96: label and object are already separate layers). The second
sphere renders through the `audience` gate that already exists in `maiaNav.ts`. **No route is renamed.**

**"My Work" — RESOLVED by R5b(i): it becomes *My Contribution*.** See below.

### MLX-R5b(i) — GREEN (Kelly, 2026-08-25): "My Work" becomes **My Contribution**.

The three-part grammar this completes:

```
   MY SOULLAB

   MY LIFE            The life I am living and becoming
   MY CONTRIBUTION    What I am making, learning, developing and offering
   MY PRACTICE        The people, encounters and work you hold in service of others
```

**Why this beat the more familiar option.** *Creative Work* would have bought immediate familiarity by
distorting Wisdom — a gathered library does not sit under a heading about producing things, so choosing it
would have forced Wisdom out of the group. *My Contribution* honestly contains all of it: Ideas · Wisdom ·
Studios · writing · teaching · creative work · knowledge · things being developed · things eventually offered
into the world. **No regrouping is required.**

**The architectural advantage.** The system already understands this as the **Contribution Field**, paired
with the **Personal Field** (`maiaNav.ts`, the `work` / `life` groups). We are not laying poetic navigation
over an unrelated ontology — *we are making the underlying architecture legible.*

**The ambiguity it prevents.** For a therapist, teacher, coach, healer or facilitator, *My Work* and *My
Practice* sound like the same thing. The ruled pair does not:

| | |
|---|---|
| **My Contribution** | what I make and offer |
| **My Practice** | the people, encounters and work I hold in service of others |

That is a constitutional distinction, not a labelling preference.

**Orientation line (recedes with familiarity).** Because *My Contribution* is less immediately obvious than a
conventional word, it carries a supporting line on first encounter:

> **My Contribution** — *Ideas, wisdom, creations and things you're bringing into the world.*

The line **disappears as the member becomes familiar with the House**, per the progressive-richness curve
(§2.9.6). This establishes the general mechanism: **familiarity without flattening the architecture** —
distinctive name, plain line beneath it, line recedes.

### MLX-R5b(ii) — GREEN (Kelly, 2026-08-25): the canonical place names stand.

**Living Field · Anchor · Wisdom · Co-Lab** — and the other established canonical destination names — are
**kept. No cosmetic rename pass.** Existing plain-language descriptions are promoted into visible orientation
where needed; replacements are not invented where canonical copy already exists.

**The rule, now explicit:**

> **Familiar language organizes the ecosystem. Distinctive language names the places within it.**

What a member encounters:

```
   MY LIFE
     Living Field   — a place to gather and reflect on lived experience
     Anchor         — what helps you return to what matters
     Journal        — expressive writing

   MY CONTRIBUTION
     Ideas          — what you're thinking, exploring and developing
     Wisdom         — what you've learned, gathered and want to carry forward
     Studios        — places where ideas become work
```

**One flag on the subtitles.** Where a registry line already exists it is **canonical and preferred** — most
of all for **Living Field**, whose current line (*"a place to gather and reflect on lived experience"*) was
authored under Invariant 16 constraint after two prior attempts were rejected for asserting the person
(*"Who you are becoming"*) and then for an agentless outcome-claim (*"…becomes coherent"*). Illustrative
alternatives such as *"your unfolding life…"* drift back toward naming the member rather than the place. **Any
new subtitle for Living Field passes the same test the label did**; elsewhere, promote what is already written.

**What recedes, and what does not (clarification, Kelly 2026-08-25):**

```
   FIRST ARRIVAL                          LATER

   Living Field                           Living Field
   Your lived experience, patterns,
   relationships and what is unfolding.
```

**The explanatory scaffolding recedes. The destination remains stable.** A subtitle becoming quiet must never
mean a place becoming hard to find. *The system teaches its vocabulary instead of making the member decode it
forever.*

**The combination this achieves:** *the structure is recognizable; the destinations are ownable.* Soullab
becomes neither an incomprehensible mystical system nor a generic productivity app.

### The canonical vocabulary spine after R5

```
   SOULLAB

   MY SOULLAB
   │
   ├── MY LIFE                    the life I am living and becoming
   │   ├── Living Field
   │   ├── Journal
   │   ├── Anchor
   │   ├── Relationships          ⚠️ R2 GREEN — restores on a passing verification walk
   │   ├── Soul Portrait
   │   └── eligible personal places
   │
   ├── MY CONTRIBUTION            what I am learning, creating, developing and offering
   │   ├── Ideas
   │   ├── Wisdom
   │   ├── Studios
   │   └── eligible contribution places
   │
   └── MY PRACTICE                [role gated] the people, encounters and work you hold in service of others
       ├── People / Caseload
       ├── Sessions
       ├── Session Room
       ├── Preparation
       ├── Encounters
       ├── Co-Lab
       └── eligible practitioner places
```

**The spine is settled. Individual child placements are not frozen** — Relationships awaits R2, and Co-Lab's
placement under My Practice is consistent with its existing conditional visibility (founder/practitioner OR a
pending count) but may move.

**R5 is closed.** Vocabulary no longer blocks the shell.

### MLX-R6 — GREEN (Kelly, 2026-08-25): My Practice ships — curated Live subset, redesigned.

**The reasoning that closes it.** If the landing page says Soullab is for people living their lives *and*
those who accompany others, and a practitioner joins to find no corresponding place, we recreate the exact
threshold failure this programme exists to eliminate. But shipping the existing practitioner surfaces
unchanged would violate the Design Canon on the day it is bound. **So: ship the practitioner sphere, curated
around accompaniment rather than administration.**

```
   MY PRACTICE
   For the people, encounters and work you hold in service of others.

     People              The people you accompany.
     Preparation         Arrive more fully prepared.
     Sessions            Your encounters over time.
     Encounters          What happened and what matters now.
     Notes / Observations  What you noticed and chose to retain.
     Co-Lab              Shared relational work.
```

Names and subtitles respect canonical language where it already exists (R5b(ii)); the shape above is
conceptual.

**The distinction that defines the sphere:**

```
   MY PRACTICE                        UTILITIES
   ├── accompaniment                  booking
   ├── relationship                   billing
   ├── preparation                    agreements
   ├── encounter                      administration
   ├── observation                    scheduling
   └── continuity
```

Billing, booking, agreements, administrative caseload tools, account mechanics and scheduling **remain
accessible where needed — but behave like utilities, not like the meaning of the sphere.**

> A therapist, coach, teacher, healer, facilitator, mentor or guide should enter My Practice and think
> ***"this helps me be better with the people I serve"*** — not *"here is my client-management dashboard."*

**The Phase 8 boundary holds.** Session Room, encounters, preparation and the consent threshold are **Live**
and may ship. MARK / SPEAK / universal capture / MAIA-drafted notes are **Designed** and stay in roadmap
phase 8. *Do not fabricate future capability to make My Practice look richer — the Live subset is already
enough to establish a real place.*

**Landing continuity achieved.** Section 05c can now truthfully preview My Practice as an actual part of
Soullab rather than a coming-soon promise, so an eligible helper recognizes it after signup: *"there it is —
this is the place I saw before joining."* That is precisely the landing-to-House continuity §0.1 requires.

**The two layers, formally:**

| **My Practice — identity-bearing** | **Practice Administration — supporting utility** |
|---|---|
| People · Encounters · Preparation · Sessions · Notes/Observations · Co-Lab · Session Room | Booking · Calendar · Billing · Invoices · Agreements · Administrative caseload · Settings |
| In the House. Previewable on the landing page. | Available where needed. **Not the identity.** |

> **Accompaniment is the practice. Administration supports the practice.**

`/studio` and `/practitioner` happen to mix the two. **MLX does not erase that machinery** — it changes what
the member encounters first and what carries Soullab's identity.

### What R6 puts on the launch critical path

| **Required before launch** | **Not required before launch** |
|---|---|
| My Practice branch in the House | Rebuilding billing |
| Role / audience gating | Rebuilding booking |
| Accompaniment-oriented landing surface | Rebuilding invoicing |
| People · Encounters · Preparation · Sessions · Live Notes/Observations · Co-Lab | Replacing every legacy practitioner route |
| Mobile state | Universal Capture · Watch · MARK/SPEAK |
| Visual compliance with the Design Canon | MAIA-authored session summaries |
| Pathways into the existing administrative utilities | Wholesale practitioner backend rewrite |

**This avoids both bad extremes:** *story-only* (an ecosystem promise with no actual place) and *full
practitioner redesign* (launch swallowed by rebuilding practice-management software).

**Acceptance test (part of the ruling):**

> A practitioner entering My Practice should think: ***"this helps me hold the people and encounters I serve
> with greater presence and continuity."*** They should not initially think *"this is my client-management
> dashboard."* And when they need to bill someone or check a booking, those utilities are still easy to find.
>
> **If the first encounter with My Practice could reasonably be mistaken for therapy or practice-management
> software, the surface fails the Soullab Visual & Category Standard.**

*Meaning in the foreground, machinery available behind it.*

### MLX-R2 — GREEN, gated (Kelly, 2026-08-25): verify, then restore Relationships to the House under My Life.

**Vocabulary correction (Kelly):** *restore* means **into the House under My Life** — it does **not** mean
resurrecting the retired left rail as a design pattern. The rail is gone; the destination returns.

**Placement:** `MY SOULLAB → MY LIFE → Relationships`, **conditional on the verification walk below.**

**Why this is re-registration, not new build.** The 2026-07-05 rail removal set its own restore condition —
*"restore here once each is attached to an actual process."* That condition appears substantially met in
source:

| Evidence | |
|---|---|
| `/api/relationships` | create · list · `[id]` · `checkin` · `entries` |
| `/api/maia/relational-navigation` | the Navigation Room endpoint |
| `/api/relationship-spaces/[spaceId]/threshold` · `/consent` | shared, two-party, consent-gated surface |
| `/relationships` | page organised by **outer · inner · transpersonal** realms |
| `member_relationships`, `relationship_content` | migrations |
| `RELATIONSHIP_ROOM_CONSTITUTION.md` | ratified canon |
| `RELATIONAL_NAVIGATION_ROOM.md` | MVP spec with hard invariants — *no live sit-in, no recording, no real-time mediation* |

**But reachable in source is not verified.** Nobody has walked it under an authenticated member. Per the
project's own ladder — *built ≠ wired ≠ surfacing ≠ verified* — the restore is ruled GREEN and **executes only
after the walk passes.**

#### The verification walk — what must be proven

Under a real authenticated member on production, not a fixture:

1. **Create** a relationship in each realm (outer · inner · transpersonal); each persists and is listed.
2. **Checkin** writes and returns; **entries** write and read back.
3. **Navigation** — `/api/maia/relational-navigation` returns under authenticated load and honours its
   hard invariants: no live sit-in, no recording, no real-time mediation, no transcript capture.
4. **Constitutional read** — nothing in the returned surface characterizes the member or the other person.
   Counts and questions are doors; characterizations are not (§C2). Third-party material stays inside its
   own consent context.
5. **Shared spaces** — `relationship-spaces` threshold and consent behave as specified, or the shared
   surface is **explicitly deferred** and only the personal field restores. *The walk decides this; the
   ruling does not presume it.*
6. **Empty state** — a member with no relationships meets a real empty state, not a broken panel. This is
   what the 2026-07-05 removal was actually about.

**The member journey to walk — no code changes:**

```
   House → Relationships → create or access a relationship → check-in → entry
         → navigation → return to House
```

Checked at each step: authenticated access · empty state · creating a relationship · existing relationship
state · check-in · entries and history · consent boundaries · **mobile behaviour** · return to House ·
**no dead routes or misleading affordances.**

**Outcomes:**

- **Pass** → register in `maiaNav.ts` under My Life; landing section 07 may depict a room.
- **Defects found** → **repair the smallest bounded defects first.** *Do not downgrade the whole concept
  because a button or a route needs repair.*
- **Fail** → section 07 reverts to forward voice, and the placement returns to the open list.

**Why "personal field only" was rejected.** It sounds safer but would quietly amputate what makes the
Relationships architecture significant. *Human relationships inherently involve another person, even when only
one member is reflecting.* The consent boundary governs **what becomes shared or crosses jurisdictions** — it
does not exist to prevent a member from having a rich personal relationship field. Collapsing Relationships
into a private diary to avoid solving consent correctly is not a safe choice; it is a smaller product.

**Why immediate restore was rejected.** It would make the prototype carry an assumption that has not earned
its place. The walk is cheap enough to perform now: *one authenticated walk converts "reachable in source"
into "real launch surface."*

**Landing section 07 is gated on the same result** — it may not depict a room the walk has not confirmed
(§A.3, and the Failure Test).

**Why this matters beyond placement.** The four dimensions together are what keep Soullab from becoming
another inward-facing self-improvement product:

| | |
|---|---|
| **My Life** | myself in lived experience |
| **My Contribution** | what moves from me into the world |
| **My Practice** | where I accompany others |
| **Relationships** | **where self and other actually meet** |

Relationships sits structurally under My Life, but it carries the relational dimension the whole ecosystem
depends on — and should probably become one of the most visible parts of Soullab.

**This closes the last unresolved placement in the vocabulary spine, conditionally.** The ecosystem shell is
architecturally frozen pending this walk.

### Standing design requirement — no cognitive cliff (Kelly, 2026-08-25)

> **The landing page and MAIA House are two versions of the same world.** They are not designed separately.

The public page and the authenticated product use the **same conceptual grammar** — the same doorway words,
the same room names, the same continuity vocabulary (Kept / Recent / Continue). Entering the House must feel
like **recognition**, not surprise. Any divergence between the two vocabularies is a defect in this spec, not
a copy difference.

### Standing constraint — do not replace working systems

This programme changes **how people encounter** what exists. It reuses, without rewriting: arrival state,
current Rooms, the House concepts, Keeps/atoms, existing conversation, consent gates, relationship
infrastructure, and voice/text. **No giant "new MAIA UX" branch** — small slices, one at a time.

---

## 1 · The correction the research pass needs

The memo reads as if MAIA has no orientation architecture. It has a great deal — under different names, and
already constitutionally ruled. Before designing, the record must be straight, or we will re-invent shipped
work and re-litigate settled rulings.

**Already true in this repository (read from source, 2026-08-25):**

| Memo proposal | What already exists | Where |
|---|---|---|
| "Make MAIA House, not a dashboard" | **The House is already the navigation.** Grammar: *Your Center · Worlds · Rooms*. Feature rail retired 2026-07-22. | `components/maia/MaiaHouseSheet.tsx`, `lib/navigation/maiaNav.ts` |
| "Rooms, not features" | **Canon since 2026-07-28.** Rooms name human questions: Journal (*What happened?*), Changes (*What is changing?*), Commitments, Becoming. | `docs/canon/THE_HOUSE.md` |
| "Doorways, not a feature grid" | **Shipped in the sibling platform.** Now What? Client Home is an explicit door map with LIVE/GATED states and a rule that gated doors never render as placeholders. | `docs/design/now-what/NOW_WHAT_HOME_DOOR_MAP_2026-08-05.md` |
| "A short first arrival, not a tutorial" | **Arrival ceremony exists**, with a two-state model (durable `hasArrivedBefore`, session-temporary `arrivalInvoked`) and the ruling *"returning to Arrival is opening a room, not undoing an initiation."* | `lib/maia/arrivalState.ts` |
| "Returning members get continuity, not onboarding" | **`/home` already renders a gathering strip** from `maia_sessions` (last session) and `member_memory_atoms` (most recent kept atom, incl. `is_breakthrough`). | `app/home/page.tsx`, `components/portal/PortalThreshold.tsx` |
| "First screen should be a threshold" | **Design law #3**, already canon: *"The first screen is a threshold, not a dashboard."* | `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md` |

**So the real gap is narrower and more specific than the memo states.** It is three things:

1. **There is no doorway layer.** The House answers *where can I go?* It does not answer *what is asking for my
   attention?* A member who does not already know the names of the rooms still has to invent their own entry.
2. **The authenticated arrival is split across two surfaces** — `/home` (PortalThreshold, gathering strip) and
   `/maia` (Arrival ceremony + conversation + House sheet) — with no ruling on which one is *the* threshold.
3. **The public landing carries eleven sections** (`SoullabLanding`) and ends by handing the burden back with
   *"Begin a conversation."* The conceptual material is strong; the transition into lived use is the weak seam.

Everything below is scoped to those three gaps. Where a memo idea duplicates shipped work, this spec says so
and does not re-specify it.

---

## 1.5 · What a new member actually walks through today

**This section is new evidence (audited 2026-08-25), and it changes the shape of Surface B.**

`CLAUDE.md`'s documented onboarding chain is **stale**. It describes
`/begin → /intro-maia → /intro-daimon → /test-elemental → /faq → /onboarding → /maia`. In the source today:

| Documented | Reality |
|---|---|
| `/begin` | **deprecated 2026-05-16**, `redirect('/signin')` |
| `/intro-maia`, `/intro-daimon` | **do not exist as routes** |
| `/test-elemental` | **deprecated 2026-06-04**, `redirect('/signin')` |
| canonical entry | **`/signup` (new) · `/signin` (returning)**, both `UnifiedAuth` |

### The live flow

```
  /signup ──► email ──► 6-digit code ──► name ──► "Enter MAIA"      ← clean. 3 phases.
                                                    │                  (or Google / Apple / biometric)
                                                    ▼
  /onboarding  ──►  CompleteWelcomeFlow, entered at step 2
                          │
                          ├─ step 2  ConsciousnessPreparation   ◄── 10-way self-classification
                          ├─ step 3  BirthDataStep              ◄── birth date / time / place
                          └─ step 4  SageTealWelcome            ◄── the five elements, named
                                                    │
                                                    ▼
                                                  /maia
```

### The finding

Before a new member has said one word to MAIA, they are asked to place themselves among **ten philosophical
lenses**: Maslow · Frankl · Jung · Nietzsche · Hesse · Tolstoy · Brown · Somatic · Buddhist · Integral.

That is the *exact inverse* of the thesis of this spec. It requires the member to understand our framework
before we help them, and it asks for a self-concept vocabulary that Invariant 14 says we may not assume
travels (*"Psyche & Shadow"*, *"Will & Transformation"*, *"Moral Conscience"* are not neutral descriptions of
a person's situation — they are a tradition).

**And the answer is never used.** `handleConsciousnessPreparationComplete` writes
`localStorage.consciousnessPreparation` and **nothing in the codebase reads that key** — not MAIA's prompt,
not the server, not `/api/members/progress`. Verified by search across `app/`, `lib/`, `components/`.

> We ask a stranger to classify themselves ten ways, then discard the answer.

Two smaller observations from the same walk:

- **`BirthDataStep`** asks birth date/time/place. It is genuinely well-built — it has a real consent model
  (`opted_in` / `declined`), it skips on future runs, and its skip affordance becomes *more* prominent on
  save error. It is nonetheless a data ask standing before first value.
- **`SageTealWelcome`** presents Fire · Water · Earth · Air · Aether with their questions — teaching the
  elemental map at the threshold, which §7 of this spec argues against on constitutional grounds, not merely
  stylistic ones.

### What this changes

Surface B is **not** "add an arrival ceremony." It is:

> **Replace three framework screens with one doorway.**

And it is unusually cheap to do, because the screen with the heaviest cognitive load has **no downstream
dependency to break**. The doorway in §4 is a strictly smaller ask (one tap, human language, nothing retained)
that produces *more* usable context than the ten-lens grid produces today — which is none.

**Surface proliferation, noted for the ruling in §11 Q2:** the tree also carries `/welcome`, `/welcome-back`,
`/welcome-flow`, `/beta-welcome`, `/beta-onboarding`, `/partner-welcome`, `/the-beginning`, and `/intro`.
Several are redirects or partner variants; they have not been individually audited here. One threshold
constitution (MLX-Q1) implies a disposition for each.

---

## 2 · Constitutional constraints on this design

These are not style preferences. A doorway layer is exactly the kind of feature that can quietly violate them.

**C1 · Direction of Authority (Invariant 16).**
Authority moves upward only: Encounter → Reflection → Recognition → Living Field. A doorway is at the
**Encounter** layer. It may frame *what kind of attention the member is bringing*. It may **not** manufacture
Reflection or Recognition on the member's behalf — no "you seem to be in a period of change", no assigned
phase, no inferred readiness. *The member may jump around; the system may not.*

**C2 · The House governing principle.**
> MAIA may open doors. It may not describe what is on the other side of one in the member's own life.

A doorway card may carry a count and a question. It may not carry a characterization. This kills a whole
class of tempting copy: *"Your relationship with boundaries has shifted"* is walking through the door
uninvited; *"You've returned to this nine times — would you like to look together?"* is a door.

**C3 · The member's world is primary.**
Doorway labels name **the member's life**, not our mechanisms. Not *Semantic Recall*, not *Spiralogic Phase*,
not *Elemental Orientation*. *"Something keeps repeating."*

**C4 · Cultural sovereignty (Invariant 14).**
Doorway language must not presuppose that *self*, *growth*, *healing*, *family*, or *spirit* mean the same
thing everywhere. Doorways describe **situations**, not **framings of the person**. `I don't know` is
first-class, not a fallback.

**C5 · Consent gates already shipped are binding on this surface.**
`member_daily_anchors.surface_preference` and `member_memory_atoms.return_preference` govern **what MAIA may
bring into conversation**, defaulting to private. Critically — and this distinction is the one most likely to
be lost in a House redesign:

> A member's own material is **private from MAIA**, not private from its member.

So: the House **may** show a member their own kept material (it is theirs, on their screen). The doorway
**may not** hand that material to MAIA's opening turn unless the item's preference allows it. See §6.3 for the
two-channel rule this produces.

**C6 · Interface humility / adaptive disappearance.**
The doorway layer must get quieter as a member gets oriented. A member who arrives knowing what they want
should be able to reach speech in one gesture, forever. Orientation scaffolding that never recedes becomes
the new burden.

---

## 2.9 · The Platform Standard — binding amendment (Kelly, 2026-08-25)

> **MLX is not a landing-page redesign. It is the establishment of Soullab's recognizable platform
> experience.**

**Rejection clause.** Any implementation where `/maia` becomes *eight beautiful buttons + chat* fails this
spec, however well executed. The failure mode to refuse:

```
   ✗   landing page → doorway → chat                    ← still an AI app
   ✅  recognizable public platform → clear arrival
       → living member home → MAIA embedded throughout a substantial world
```

**We are simplifying the threshold, not simplifying Soullab.** The destination must feel larger, richer and
more substantial than the onboarding being removed. The feeling to produce is *"I joined something"*, not
*"I opened another chatbot."*

### 2.9.1 The product model

```
   SOULLAB
   │
   ├── PUBLIC PLATFORM                    └── MEMBER PLATFORM
   │   ├── Landing / Home                     │
   │   ├── What MAIA is                       ├── MAIA HOUSE
   │   ├── Experiences / use cases            │   ├── Continue
   │   ├── The House / platform overview      │   ├── Doorways
   │   ├── Relationships                      │   ├── Recent
   │   ├── Self / Soul Portrait               │   ├── Keeps
   │   ├── Creation / Studios                 │   └── Your world
   │   ├── Spiralogic / Elements              │
   │   ├── Trust / Sovereignty                ├── MAIA · Relationships · Journal
   │   ├── About / Research                   ├── Soul Portrait · Rooms / Worlds
   │   └── Join / Sign in                     ├── Practices · Creative / Studios
   │                                          ├── Keeps / History · Search
   │                                          └── Profile · Settings / Privacy
```

*Not every member needs every destination on day one. But the world needs to visibly exist.*

### 2.9.2 The tension this creates — and the rule that resolves it

**"The world needs to visibly exist" and "gated doors are absent, never placeholdered" (§5.4, Now What?
precedent) pull in opposite directions.** Both are correct. The resolution is that they govern *different
surfaces*:

| Surface | Rule |
|---|---|
| **Public platform** | May show the world **as designed**, because a visitor is being shown what Soullab *is*. Every section still carries its Live / Designed / Vision layer (§A.2) and may not imply a room is enterable today when it is not. |
| **MAIA House** | Renders **only what this member can enter today.** No greyed tiles, no "coming soon". |

And the constraint that keeps the second from hollowing out:

> **Member-state gating is legitimate; capability gating is not.** A destination may be absent because *this
> member* has nothing there yet. A destination that no member can enter may not render for anybody — on the
> public page it is Designed or Vision copy, never a tile in the House.

### 2.9.3 Vocabulary reconciliation — needed before the shell is built

The "no cognitive cliff" requirement (§0.1) applies **internally** too: the landing page, the House, and the
navigation registry must use **one vocabulary**. They currently do not. Audited against `lib/navigation/maiaNav.ts`:

| Proposed shell name | Shipped registry | Status |
|---|---|---|
| Keeps | `keeps` | ✅ matches |
| Journal | `journal` | ✅ matches |
| MAIA | `maia` | ✅ matches |
| Account / Settings / Help / Voice / Feedback | same | ✅ matches |
| Relationships | *off the rail since 2026-07-05* | ⚠️ R2 |
| Soul Portrait | routes exist, **not in the registry** | ⚠️ verify member reach |
| Rooms / Worlds | registry has `living-field`, `anchor`, `ideas`, `wisdom` | ⚠️ **names differ** |
| Studios | `studio` (Pro), `book-studio`, `vision-studio` — audience-gated | ⚠️ partial |
| Practices | **no route** | ❌ does not exist |
| Search | **no route** | ❌ does not exist |
| Profile | `account` exists | ⚠️ same thing, two names — pick one |
| Notifications | **no route** | ❌ does not exist |

**Four shipped Worlds — Living Field, Anchor, Ideas, Wisdom — appear nowhere in the proposed tree.** They are
live and reachable today. Either they carry these names into the shell, or the shell renames them; what they
may not do is exist in the product under names the public page never mentions. **New ruling required — R5.**

### 2.9.4 The stable shell

Members of serious platforms learn quickly: *this is home · this is navigation · this is my account · this is
how I get back · this is where my things live.* Soullab needs the equivalent — a **stable spatial grammar**, so
the member does not rediscover Soullab on every page.

```
   SOULLAB              Home and identity, always in the same place

   House                the threshold
   MAIA                 the relational thread

   Your World           Keeps · Journal · Relationships · Soul Portrait
   Explore              Rooms · Practices · Studios
   ─────────
   Search · Profile · Settings
```

Exact words and order are subject to R5. The *existence of a persistent grammar* is not.

### 2.9.5 MAIA is everywhere without being everything

MAIA is the **connective presence, not the only screen.** She is available inside Relationships, Journal,
Soul Portrait and the Studios — reflecting on what the member wrote, exploring what they are looking at,
understanding the creative context — rather than being a destination that competes with them.

```
                       MAIA
                    ↙   ↓   ↘
      Relationships ← HOUSE → Journal
            ↓                   ↓
      Soul Portrait           Keeps
            ↓                   ↓
        Practices            Studios
```

This is also why the §5 threshold cannot be a chat screen with links: the House is where MAIA's presence and
the member's world are held in the same frame.

### 2.9.6 Progressive richness

The platform gets **richer as the member becomes oriented** — the inverse curve to the doorways receding:

```
   EARLY                                    LATER
   Doorways prominent                       Doorways quiet
   "Here is what you can do"        ──►     "Here is your world"
                                            Continue larger · Recent richer
                                            Keeps meaningful · Relationships populated
                                            Projects and Studios present
```

**This substantially answers R4 in principle** — the trigger is the member's world becoming populated, not an
inferred readiness score. What remains open is the exact trigger and whether the shift is announced. R4 stays
open on that narrower question only.

### 2.9.7 Familiar interface, unfamiliar depth

> **Borrow interaction conventions, not aesthetics.**

Members must not learn poetic words for ordinary interface functions. Home, navigation, search, back, profile,
settings, account, recent, saved, continue, help, privacy controls — **conventional**. House, Keeps, Rooms,
Worlds, MAIA, Soul Portrait, Spiralogic, elemental movements — **distinctively Soullab**.

*The familiar interface holds the unfamiliar depth.* Where the two collide (Profile vs Account, §2.9.3), the
conventional word wins for the function and the Soullab word is reserved for the thing that is genuinely ours.

### 2.9.8 The peripheral states are launch acceptance, not polish

*A platform feels substantive because everything around the edges works.* This list is part of Phase 7's
GREEN/AMBER/RED decision, not a follow-up backlog:

| | Status |
|---|---|
| Profile & identity · Account settings · Privacy & consent | ✅ `account`, `settings` shipped |
| Sign in / sign out · Account recovery | ✅ shipped (`UnifiedAuth`, recovery) |
| Help / orientation · Feedback | ✅ in the registry |
| History / recent activity | ⚠️ partial — `/home` gathering strip absorbs into the House (Q1) |
| Navigation states · back behavior · consistent URLs | ⚠️ unaudited |
| **Empty states · loading states · error states** | ⚠️ unaudited — and these carry the most weight for a new member |
| Mobile navigation | ⚠️ §9 |
| **Search** | ❌ **does not exist** |
| Notifications (only where useful) | ❌ does not exist — may legitimately stay absent |
| Membership / billing where applicable | ⚠️ subscription hooks exist; surface unaudited |

**Search is the significant gap.** A member accumulating Keeps, journal entries and conversations with no way
to find anything is a platform that stops feeling like a place. It belongs in the Phase 5 slice order.

### 2.9.9 A recognizable visual world

One coherent system — typography, spacing, surface hierarchy, imagery, Holoflower use, elemental signals,
motion, iconography, cards and panels, voice surfaces, empty states, room headers, transitions.

> **The standard: someone sees a screenshot with the logo cropped out and thinks — that's Soullab.**

### 2.9.10 The launch surface, in order

```
   PUBLIC IDENTITY → PUBLIC PRODUCT OVERVIEW → JOIN / SIGN IN → ARRIVAL
   → MAIA HOUSE → STABLE PLATFORM NAVIGATION → MAIA + MEMBER WORLD
   → CONTINUITY → RETURN
```

*Soullab should feel like entering a coherent place — recognizable enough that people immediately know how to
move around, distinctive enough that it could only be Soullab, and deep enough that they sense there is far
more here than they need to understand on their first day.*

---

## 2.95 · The Ecosystem Standard — both sides of the work (binding, Kelly, 2026-08-25)

**Constitutional, not implied.** Soullab is not designed only for an individual talking to MAIA. It is
designed for **both sides of care, guidance, practice, teaching, facilitation and transformation** — those
seeking help, those offering help, and the relational field between them.

> **Soullab serves both the person living a life and the person entrusted with helping another person live
> theirs. The system must support both without collapsing personal, practitioner, and shared relational
> contexts.**

> **A helper's tools must deepen presence and discernment — not replace judgment, manufacture certainty, or
> turn another person's life into a dataset.**

The second principle governs Session Capture, Observation, and every future practitioner intelligence, and it
grows more load-bearing as those get more powerful.

### 2.95.1 The ecosystem

```
                              SOULLAB
                         RELATIONAL FIELD

           PERSON                              HELPER
             │                                   │
           MAIA                            PRACTICE TOOLS
             │                                   │
        JOURNAL                            SESSION ROOM
        KEEPS                              NOTES / CAPTURE
        RELATIONSHIPS                      PREPARATION
        SOUL PORTRAIT                      REFLECTION
        ROOMS                              CONTINUITY
             │                                   │
             └───────────── AIN ─────────────────┘
                             │
                     consent + memory
                             │
                        relationship
```

Roles the architecture must hold **without collapsing them into one**: members · clients · patients where
appropriate · seekers · students · practitioners · therapists · coaches · facilitators · spiritual directors ·
healers · teachers · guides · educators.

### 2.95.2 MAIA's two relational orientations — not two personas

| | **Personal MAIA** | **Practice-facing MAIA** |
|---|---|---|
| Asks | *Help me understand my life.* | *Help me be more present, discerning, prepared and coherent in how I serve another person.* |
| Intelligence | the same relational intelligence | the same relational intelligence |
| Differs in | — | **permissions · context · duties · evidentiary boundaries** |

**This distinction is crucial and must be structural, not tonal.** A second persona would be a costume; two
orientations with different permissions and evidentiary duties is an architecture. It is also exactly where
the Capture programme's five-band custody model (Capture → Observation → Reflection → Recognition →
Integration) attaches: those bands *are* the practice-facing evidentiary boundary.

### 2.95.3 The three contexts, and what already enforces them

| Context | Whose | Enforcement that exists today |
|---|---|---|
| **Personal** | the member's own Soullab | `return_preference` / `surface_preference` consent gates; the two-channel rule (§6.2) |
| **Practitioner** | the helper's working material | `practitioner_client_notes` — born encrypted, practitioner-private, and deliberately **no `visibility` column** because sharing is unruled |
| **Shared / relational** | the consented encounter | `encounter_consent_events` + the R-A1 trigger; the Co-Lab boundary gate (31 checks) |

**The sovereignty statement that follows, and that the public page may make:**

> The practitioner is not given secret authority over a member's inner life. The member's personal Soullab
> remains theirs. Shared and session material belongs to its own consented relational context.

That sentence is **Live** — it describes gates that exist and are enforced — which is what makes it worth
saying out loud rather than leaving as abstract principle.

### 2.95.4 The House holds both spheres

A practitioner is still a human being with a life. They must not be exiled from their personal Soullab into an
unrelated admin dashboard; they simply carry an **additional sphere of responsibility**.

```
   MEMBER                          ELIGIBLE PRACTITIONER
   HOUSE                           HOUSE
   ├── Continue                    ├── My Soullab
   ├── Doorways                    │   ├── MAIA · Keeps · Journal
   ├── MAIA                        │   └── …their own world, unchanged
   ├── Keeps · Journal             │
   ├── Relationships               └── My Practice
   ├── Soul Portrait                   ├── Clients / members
   ├── Rooms                           ├── Session Room · Encounters
   └── Practices                       ├── Preparation · Follow-up
                                       ├── Notes / observations
                                       └── Practice intelligence
```

**Mechanism already exists:** `maiaNav.ts` carries `audience` gating (currently `'founder'` on Pro Studio,
Book Studio, Circles, Astrology, Lab Tools, Vision Studio), and practitioner surfaces exist as routes
(`/practitioner`, `/caseload`, `/sessions`, `/studio`). *My Practice* is an extension of that gate into a
named House branch — not new machinery.

### 2.95.5 The public story changes scale

Not *"an AI companion for self-development."* More accurately:

> **A relational intelligence ecosystem for human development — and the people who help make it possible.**

Or, humanly:

> **Soullab supports the work we do within ourselves — and the work we do in service of one another.**

**The landing narrative arc is amended** from `Me → MAIA` to:

```
   Me → My world → Other people → Those who help → The relational field → The deeper ecosystem
```

### 2.95.6 Amendment to the §A.1 spine

The spine gains a **two-pathways movement**, placed after 05 (The House) so a visitor meets the world before
being asked which side of it they are on:

```
   05  THE HOUSE            what exists beyond the conversation
   05b FOR YOUR LIFE        MAIA · Keeps · Journal · Relationships · Soul Portrait · Rooms · Practices · Creation
   05c FOR YOUR PRACTICE    Session Room · preparation · consensual capture · notes · reflection ·
                            practitioner continuity · Practice Studio
   05d ONE ECOSYSTEM        different relationships — plus the sovereignty statement (§2.95.3)
```

**Claim discipline on 05c.** Session Room, encounters and the consent threshold are Live; the Universal
Session Capture enhancements (MARK/SPEAK, multi-surface capture) are **Designed and explicitly parallel to
launch** (roadmap phase 8). So 05c may describe *preparation, encounters, notes, continuity and the consent
architecture* as they exist today, and must not depict wrist-tap capture, watch surfaces, or MAIA-drafted
session notes as available. **This is the one place where the two programmes touch the launch surface**, and
the boundary must hold: the practice *story* ships at launch; the capture *capability* ships on its own track.

---

## 2.96 · Vocabulary audit — evidence for R5

**The finding that reshapes this ruling:** `maiaNav.ts` **already separates member-facing label from route.**
`label: 'Journal'` points at `/labtools/journal`; `label: 'Wisdom'` at `/wisdom-keepers/wisdom`; `label:
'Keeps'` at `/maia/keep-capture`. The three-layer model R5 asks for is therefore **already de facto true in
the architecture** — which means:

> **Settling the member-facing vocabulary does not require renaming a single route, table, or component.**

That dissolves most of the apparent cost of this ruling, and it directly satisfies the constraint *do not
rename functioning architecture merely to make the new mockup tidy.* Legacy routes may stay exactly where
they are.

### The live inventory (read from `lib/navigation/maiaNav.ts`, 2026-08-25)

The House renders three groups today: **Your Center · Worlds · Rooms**. Worlds carry an internal spine:

```
   MY LIFE   — "dimensions of the Personal Field (becoming)"     → Living Field · Journal · Anchor
   MY WORK   — "dimensions of the Contribution Field (offering)" → Ideas · Wisdom
```

| Member-facing label | Canonical object | Route (legacy, may remain) | Tooltip in product |
|---|---|---|---|
| **MAIA** | centre of the House | `/maia` | *Return to center field* |
| **Living Field** | World · life | `/maia/living-field` | *A place to gather and reflect on lived experience* |
| **Journal** | World · life | `/labtools/journal` | *Expressive writing — one practice surface* |
| **Anchor** | World · life | `/maia/anchor` | *A quiet place to return* |
| **Ideas** | World · work | `/maia/ideas` | *Emerging thoughts and creative impulses* |
| **Wisdom** | World · work | `/wisdom-keepers/wisdom` | *Sacred texts, learning, and collected knowledge* |
| **Keeps** | boundary transition | `/maia/keep-capture` | *Moments you have held onto* |
| **Co-lab** | boundary transition | `/team/for-you` | *Shared work and conversation* |
| Pro Studio · Book Studio · Vision Studio · Circles · Astrology · Lab Tools · Community Library | boundary, `audience`-gated | various | — |
| Account · Settings · Help · Voice · Feedback | utility | various | — |

### Three competing spines now exist on paper

| Spine | Source | Grouping |
|---|---|---|
| **A — shipped** | `maiaNav.ts` + `MaiaHouseSheet` | Your Center · Worlds (My Life / My Work) · Rooms |
| **B — proposed shell** | §2.9.4 | House · MAIA · Your World · Explore · utilities |
| **C — ecosystem** | §2.95.4 | My Soullab · My Practice |

**These are not alternatives at the same altitude** — B and C can both be expressed as arrangements of A, or A
can be superseded. That choice *is* R5. What may not happen is three spines coexisting: the landing page, the
House, mobile, and the practitioner branch must resolve to one.

### Names carrying the most risk for a newcomer

Not because they are wrong — because they are **opaque on first encounter**, and this spec's whole thesis is
that a stranger must know what to do:

- **Living Field** — the label is constitutionally careful (it names the place and the activity, deliberately
  avoiding "who you are becoming"), and that care must survive any rename.
- **Anchor** — precise for a member who has used it, unreadable before that.
- **Wisdom** — reads as a claim about content quality rather than a place.
- **Co-lab** — an internal contraction.
- **Worlds / Rooms** as *group headings* — Soullab-distinctive, but they are the top-level wayfinding words a
  first-time member meets.

**Gaps confirmed:** Search, Practices, Notifications have no routes. Profile and Account are two names for one
function. Soul Portrait has routes but no registry entry. Relationships is off the rail (R2).

---

## 2.97 · Visual & Category Constraint — binding (Kelly, 2026-08-25)

> **Now canon.** These constraints were promoted to `docs/canon/SOULLAB_DESIGN_CANON.md` (`1690420`), a
> governing aesthetic and experiential standard for every member-facing Soullab/MAIA surface, alongside
> `INHABITABLE_ARCHITECTURE_STANDARD.md`. **The canon governs; this section is its application to the launch
> surfaces.** Where they differ, canon wins.

> **Soullab is not to be designed or positioned as a therapy platform, healthcare product,
> practice-management application, generic wellness app, or AI chatbot. Those use cases may exist within it,
> but none defines the whole.**
>
> The governing aesthetic is **modern, elemental, elegant, human and quietly futuristic.** The public and
> authenticated experiences communicate **a living ecosystem for human life, consciousness, relationship,
> creation and service.** Practitioner functionality must feel like **one sphere within that ecosystem — not
> the product's identity.**

**Why this is being recorded now.** Since the Ecosystem Standard (§2.95) some of the working language has
drifted toward practice-management vocabulary. The correction is not to remove practitioners — they belong —
but to stop one expression of the ecosystem from becoming its category.

### 2.97.1 The category

**Not** *"AI for therapists and their clients."* Closer to:

> **A living ecosystem for human consciousness, relationship, creativity, growth — and those who accompany
> others through those processes.**

Which includes therapists, and equally: teachers · coaches · facilitators · guides · healers · spiritual
directors · mentors · artists · writers · practitioners · leaders · creators · seekers · **ordinary people
navigating life.**

### 2.97.2 Visual grammar to refuse

Patient portals · EHRs · appointment software · therapist directories · mental-health apps · clinical
dashboards · pastel wellness branding · generic meditation apps · "client management" software.

**Even when practitioner functionality exists underneath.**

### 2.97.3 The five qualities

| | |
|---|---|
| **Elemental** | Fire, Water, Earth, Air, Aether influence **atmosphere, motion, texture, spatial transitions, light, visual rhythm, subtle colour behaviour, interaction states** — not decorative icons. *The elements should feel inhabited, not illustrated.* |
| **Human** | People, language, relationships, voice, handwriting, presence, lived experience. **No robots, neural-network imagery, holographic brains, or AI clichés.** |
| **Futuristic, not sci-fi** | Fluidity, contextual interfaces, adaptive navigation, spatial depth, restrained motion, intelligence appearing where needed, interfaces growing quieter with familiarity. *The future should feel calmer than the present, not more technologically noisy.* |
| **Elegant** | High visual restraint. Fewer things, given more meaning. Strong typography, generous spacing, purposeful surfaces. **No feature-card soup.** |
| **Immersive** | The person has **entered Soullab**, not clicked through webpages. House, places, transitions, MAIA and the elemental field create spatial continuity. |

**On the elements specifically:** five large buttons reading 🔥 FIRE · 💧 WATER · 🌍 EARTH · 🌬 AIR · ✨ AETHER
is too literal and reads as a spiritual app. Instead the interface *expresses* them — Fire as emergence,
direction, initiation, illumination; Water as depth, movement, emotional continuity; Earth as grounded
surfaces, embodiment, stability; Air as openness, relational connection, language, perspective; Aether as
space, integration, silence, the whole. The member gradually realizes: *oh — the elemental architecture is
everywhere.* **Far more sophisticated than teaching the framework through icons**, and consistent with §7
(the elemental layer stays underneath) and §A.6 (teaching after orientation).

### 2.97.4 MAIA should not look like conventional AI

Avoid the ubiquitous **big chatbot window + avatar + prompt suggestions.** MAIA converses conventionally where
useful, but in the House she is **a presence in the environment**: sometimes conversation, sometimes a short
invitation, sometimes continuity, sometimes a doorway, sometimes silence, sometimes *"something from yesterday
may belong here."*

> **The sophistication is that MAIA does not always demand the foreground.**

This is the same requirement as §2.9's rejection clause, stated aesthetically: a threshold that is a chat box
with links fails both.

### 2.97.5 Vocabulary corrections

| Prefer | Over | Note |
|---|---|---|
| People | Patients | |
| Encounters | Appointments | |
| Sessions | — | where genuinely appropriate |
| Practice | Practice management | |
| Notes / Observations | Clinical notes | unless actually clinical |
| Relationship | Case | where jurisdiction allows |

**`Caseload`** may remain an internal or profession-specific surface, but **must not become one of Soullab's
defining public words.** (It is currently a route, `/caseload`, and appears in the §R5 spine under My Practice
— acceptable internally, not as public vocabulary.)

**Framing the helper side as vocation, not profession.** Not *"For therapists and practitioners"* but:

> **For those who accompany others** — *if part of your life is helping, teaching, guiding, healing,
> facilitating or creating spaces where others can grow, Soullab can become part of your practice too.*

Actual practitioner capabilities are shown below that framing, not in place of it. **This amends §2.95.6's
05c section heading.**

### 2.97.6 The ecosystem reveal is spatial, not a card grid

```
                              MAIA
                             AETHER
                               ◌

                         YOUR SOULLAB

              MY LIFE                  MY CONTRIBUTION
            Living Field                   Ideas
           Relationships                   Wisdom
              Journal                      Studios
              Anchor
           Soul Portrait

                          MY PRACTICE
                      for those who accompany

                     People · Encounters
                      Sessions · Co-Lab
```

Indicative, not literal. **It should feel like an ecology of interconnected places, not a software sitemap.**

### 2.97.8 The aesthetic standard — formal criteria, not a mood board

> **The target is not "beautiful wellness software." It is world-class digital craft with restraint, soul, and
> unmistakable identity.**

| Criterion | |
|---|---|
| **Sophisticated simplicity** | Fewer elements, better hierarchy. No clutter, no decorative excess. |
| **Refined materiality** | Typography, spacing, motion, texture, light and surfaces considered at the level of a premium cultural product. |
| **Soulful, not sentimental** | Warmth and depth without cliché, mysticism-as-decoration, or healing-app aesthetics. |
| **Elemental, not literal** | Fire/Water/Earth/Air/Aether through rhythm, movement, atmosphere, density, transitions and spatial behaviour — not icons. |
| **Quietly futuristic** | Adaptive, intelligent, fluid, context-aware. Never neon sci-fi or AI spectacle. |
| **Human first** | Made around attention, relationship, thought, feeling and lived experience. |
| **Distinctive enough to own** | A screenshot is eventually recognizable as Soullab **without the logo**. |
| **Familiar enough to enter** | People with high aesthetic standards feel **intrigued, not confused**. |
| **No cheapness anywhere** | Weak icons, generic cards, inconsistent spacing, stock photography, busy gradients, clumsy transitions, mismatched typography — **each fails review**. |

**The test that guards against the wrong kind of restraint:**

> **If simplifying the interface makes it feel generic, we have simplified the wrong thing.**
> The goal is not minimalism for its own sake. It is **depth without noise.**

### 2.97.9 Screen review — four questions, every major screen

Applied to the landing page, the House, MAIA, and every ecosystem surface in the first high-fidelity pass:

1. **Does it feel inevitable?** — nothing seems arbitrary.
2. **Does it feel spacious but alive?** — not empty.
3. **Does it feel emotionally intelligent?** — not clinical, cute, or performatively spiritual.
4. **Could this belong to any other product?** — **if yes, it is not finished.**

### 2.97.7 Visual acceptance criterion — a gate, not brand prose

Applied to the first high-fidelity prototypes (roadmap phase 3), before any production route is rewritten:

> ❌ **Fails** if the reaction is *"beautiful therapist software."*
> ✅ **Passes** if the reaction is *"I haven't quite seen a digital place like this before — but somehow I
> immediately know how to enter it."*

Both halves are required. Unfamiliar-and-unenterable fails as surely as familiar-and-generic; that pairing is
the same standard as §2.9.7 (*the familiar interface holds the unfamiliar depth*), measured on the prototype.

---

## 3 · Surface A — Public MAIA landing

**Layer: Live surface, Designed restructure. Direction ratified by Kelly, 2026-08-25 — this section replaces
the earlier seven-section simplification.**

### A.0 The ruling that reshapes this surface

> **The landing page should not merely sell MAIA and send them into the product. It should be a compressed
> experience of the product itself.**

A visitor should arrive at `Enter Soullab` already understanding the **grammar of the world**: *I arrive
somewhere; MAIA helps orient me; I can talk about ordinary human things; there are deeper rooms; I can keep
what matters; the relationship develops over time; I remain in control.* The transition into the House should
then feel like **recognition rather than surprise**.

This supersedes the earlier draft's instinct to cut the page down to seven sections. The correction: the
problem was never *how much* the page said — it was that depth arrived **before** orientation and that the CTA
handed the burden back. Everything may appear. It appears in **layers of increasing depth**.

### A.1 The page spine

```
  01  INVITATION          What is asking for your attention?
  02  DOORWAYS            What can I bring to MAIA?
  03  ARRIVAL             What happens when I enter?
  04  CONVERSATION        What does MAIA actually feel like?
  05  THE HOUSE           What exists beyond the conversation?      ◄ centrepiece
  06  CONTINUITY / KEEPS  What develops over time?
  07  RELATIONSHIPS       Can MAIA help with the people in my life?
  08  KNOW YOURSELF       Journal · Soul Portrait · patterns
  09  CREATE              Can I work and make things here?
  10  ELEMENTS            What is the deeper map?
  11  VOICE + TEXT        How do I interact?
  12  CONSENT / PRIVACY   Can I trust this?
  13  AIN / ARCHITECTURE  What makes it fundamentally different?
  14  AFTER SIGNUP        Show me exactly where I'm going.
  15  BEGIN               Enter Soullab.
```

**The circle, not the funnel.** 01 and 15 ask the same question. A visitor who scrolls the whole page returns
to where they started, now able to answer it.

### A.2 The rule that makes depth safe

> **A landing page that mirrors the journey thereby asserts the journey exists.**

Each section inherits the claim layer of the capability it depicts. The spine above is fixed; **which sections
ship at launch is gated**, section by section, by `MARKETING_CLAIM_DISCIPLINE.md`. The gate is not editorial
taste — a section depicting an unbuilt room is capability inflation regardless of how carefully it is worded.

| # | Section | Rests on | Layer | Launch disposition |
|---|---|---|---|---|
| 01 | Invitation | positioning only | **Live** | ✅ ship |
| 02 | Doorways | the doorway set (§4) | **Designed** | ⚠️ ships **with** Surface B, not before |
| 03 | Arrival | Surface B | **Designed** | ⚠️ same gate as 02 |
| 04 | Conversation | live conversation | **Live** | ✅ ship — real transcript material only (A.4) |
| 05 | The House | rooms that exist | **mixed** | ⚠️ **grid must show only live rooms** — see A.3 |
| 06 | Continuity / Keeps | atoms, `return_preference` | **Live** | ✅ ship — this is the launch continuity primitive |
| 07 | Relationships | `member_relationships`, `relationship_content`, `/relationships` | **Designed** | ⚠️ **off the member rail since 2026-07-05** — see A.3 |
| 08 | Know yourself | Journal (live), Soul Portrait (`/soul-portrait/*` exists) | **mixed** | ⚠️ verify Soul Portrait reaches a member before depicting it |
| 09 | Create | Ideas, Wisdom, Book/Vision Studio (audience-gated) | **mixed** | ⚠️ depict only what an ordinary member reaches |
| 10 | Elements | conductor + hysteresis, `member_spiral_state` | **Live** | ✅ ship — **as description, never as "pick one"** |
| 11 | Voice + text | live | **Live** | ✅ ship |
| 12 | Consent / privacy | shipped consent gates | **Live** | ✅ ship — our strongest owned ground |
| 13 | AIN / architecture | canon + infrastructure | **Live** (as description) | ✅ ship, collapsed by default |
| 14 | After signup | **the actual post-signup flow** | **blocked** | ❌ see A.5 — this is the honesty test |
| 15 | Begin | — | **Live** | ✅ ship |

### A.3 The two sections that need a decision before they can be drawn

**05 · The House — the centrepiece, and the highest-risk section on the page.**
The proposed grid (`Relationships · Journal · Soul Portrait · Creation · Practices · Rooms`) asserts a member
world. Against the canon and the tree:

```
   Journal          ✅ live, in the rail
   Keeps            ✅ live (atoms)
   Changes          ✅ live
   Soul Portrait    ⚠️ routes exist (/soul-portrait/{generate,preview,view,[slug]}) — verify member reach
   Relationships    ⚠️ substrate + page, OFF the rail since 2026-07-05
   Practices        ❌ no route in the tree
   Commitments      ❌ Vision — THE_HOUSE.md states plainly it does not exist
   Becoming         ❌ Vision — same
```

**Rule: the House illustration renders only rooms a member can enter today.** Not greyed, not "coming soon" —
absent, per the Now What? door-map precedent. The framing sentence *"MAIA is the host who knows the house"*
is Live and excellent; *"MAIA knows the whole house"* remains ❌ while two of four canonical rooms are Vision.

**07 · Relationships — the sharpest gap between the story and the runtime.**
It is genuinely one of the strongest differentiators from generic AI, and it has real substrate
(`member_relationships`, `relationship_content`, relationship memory Phase 1, a `/relationships` page with
outer / inner / transpersonal realms, and a ratified `RELATIONSHIP_ROOM_CONSTITUTION`). But `maiaNav.ts`
records why it left the rail:

> *"removed from the rail 2026-07-05: both surfaced only a contextual panel with no process behind it.
> Restore here once each is attached to an actual process."*

A landing section inviting people to explore conflict, family patterns and intimacy, opening onto a room the
House does not currently offer, fails the Failure Test. **Two honest paths:** (a) restore Relationships to the
rail with a real process before launch — the substrate is there, this is the recommendation; or (b) keep the
section in forward voice and do not depict a room. **Ruling needed — §11 Q2.**

### A.4 Section 04 — show, don't claim

Three or four selectable exchanges: *a relationship · a life transition · a decision · a creative problem.*
This shows the quality of the relationship rather than describing it, and it carries one of the strongest
onboarding messages we have:

> **You don't need to know how to prompt an AI.**

**Constraint:** real transcript material, member-consented or founder-authored. A synthesized exchange
presented as representative is capability inflation no matter how accurate we believe it to be.

### A.5 Section 14 is the honesty test for the entire launch

Section 14 promises to *show exactly what happens after signup*:

```
   1  CREATE YOUR SOULLAB
   2  ARRIVE IN MAIA HOUSE
   3  CHOOSE WHAT NEEDS ATTENTION
   4  TALK OR TYPE WITH MAIA
   5  KEEP WHAT MATTERS
   6  RETURN, EXPLORE, GO DEEPER
```

**Today, step 3 is a ten-way philosophical self-classification whose answer is discarded (§1.5), and steps 2
and 3 do not exist in that order at all.** The diagram cannot be drawn honestly until Surface B ships.

This is not a copy problem to write around — it is the **forcing function that orders the whole launch**. It
independently confirms §12's sequencing, and for a stronger reason than "the landing should describe something
real": *this specific section cannot be authored until the arrival it depicts exists.* Build B, then draw 14.

### A.6 Elements (10) — teaching after orientation

The elemental section describes **how experience moves**, not what the member is:

> Fire — what wants to happen · Water — what you're feeling · Earth — what is real and embodied ·
> Air — how you understand and relate · Aether — the larger pattern
>
> *MAIA learns to recognize these movements with you, rather than forcing you into a type.*

That last clause is the whole constitutional load, and it is currently contradicted by the product: the live
`SageTealWelcome` step teaches the five elements **at onboarding**, before the member has spoken (§1.5). The
landing page's honest version of this section and Surface B's removal of that screen are **the same fix**.

### A.7 What leaves the page

The current `SoullabLanding` carries eleven sections including Portfolio, Past Sites, Book Announcement and
Projects. None appear in the ratified spine. They are Soullab-the-studio material and compete with
MAIA-the-product at the moment of decision. **Recommendation: move to `/about`**, preserved, not deleted.
The ratified spine effectively answers the old Q4; it is retained in §11 only to confirm the disposition.

## 4 · Surface B — Guided Arrival

**Layer: Designed. Builds on the Live `arrivalState` two-state model. Scope set by MLX-R1 (§0.1): this
surface *replaces* ConsciousnessPreparation, BirthDataStep and SageTealWelcome in the post-signup flow —
it is not added in front of them.**

```
   TODAY                                    AFTER R1
   ─────                                    ────────
   signup                                   signup
     └─ name                                  └─ name
   /onboarding                              /maia
     ├─ 10 philosophical lenses  ✗            └─ doorway  ──►  MAIA
     ├─ birth date/time/place    → relocated
     └─ five elements taught     → relocated       under 60 seconds
   /maia
```

### B.1 When it renders

| Condition | Behavior |
|---|---|
| No durable `maia_has_arrived` marker | Full guided arrival |
| Member chose *"Help me find the thread"* in the House | Same surface, invoked — **does not touch the durable marker** |
| Marker present, no invocation | Not rendered. Straight to the House. |

This is the existing constitution in `lib/maia/arrivalState.ts`, unchanged: *returning to Arrival is opening a
room, not undoing an initiation.* The doorway layer is added **inside** that model, not beside it.

### B.2 Wireframe (mobile-first, the real environment)

```
┌───────────────────────────┐        ┌───────────────────────────┐
│                           │        │                           │
│      ( holoflower )       │        │   What brings you here     │
│                           │  →     │        today?              │
│   Welcome to Soullab.     │        │                           │
│                           │        │ ┌───────────────────────┐ │
│  MAIA is an intelligence  │        │ │ Something is on my    │ │
│  you can talk with about  │        │ │ mind                  │ │
│  your life, relationships,│        │ ├───────────────────────┤ │
│  work, and questions.     │        │ │ I'm going through a   │ │
│                           │        │ │ change                │ │
│  You don't need to know   │        │ ├───────────────────────┤ │
│  what to ask, or how to   │        │ │ I want to understand  │ │
│  use AI.                  │        │ │ myself                │ │
│                           │        │ ├───────────────────────┤ │
│      [ Continue ]         │        │ │ I need clarity about  │ │
│                           │        │ │ a decision            │ │
│                           │        │ ├───────────────────────┤ │
└───────────────────────────┘        │ │ Something in a        │ │
                                     │ │ relationship          │ │
   screen 1 · ~12 seconds            │ ├───────────────────────┤ │
                                     │ │ I'm making something  │ │
                                     │ ├───────────────────────┤ │
                                     │ │ I'm just curious      │ │
                                     │ ├───────────────────────┤ │
                                     │ │ I don't know          │ │
                                     │ └───────────────────────┘ │
                                     │                           │
                                     │  ● Speak    ○ Type        │
                                     └───────────────────────────┘

                                        screen 2 · the doorway
```

Then **MAIA opens**, framed by the door — the member is not staring into an empty field.

Total: two screens. No questionnaire. No preference configuration. **Target: under 60 seconds to first
MAIA turn.**

### B.3 The opening turn is a frame, never a seed

Per the Now What? room precedent (*"the frame orients; it never seeds content"*), the door sets **how MAIA
opens**, not **what the member is dealing with**.

| Door | MAIA's opening (Designed copy — needs voice review) |
|---|---|
| Something is on my mind | *"Start wherever it is. It doesn't have to be organized."* |
| I'm going through a change | *"What's changing?"* |
| I want to understand myself | *"What's the part you keep circling?"* |
| I need clarity about a decision | *"What are you deciding between?"* |
| Something in a relationship | *"Who is it, and what's happening between you?"* |
| I'm making something | *"What are you working on?"* |
| I'm just curious | *"Ask me anything you want. I'll tell you what I actually am."* |
| I don't know | *"That's a fine place to start. What's been taking up room lately?"* |

**Prohibited in every one of these:** any statement about the member. Not *"it sounds like you're in
transition."* The member has said nothing yet; there is nothing to reflect. (C1, C2.)

### B.4 The doorway is a member act, not an inference

Modeled on `arrivalState`'s discipline:

- The chosen door is **session-scoped by default**. It frames this conversation's opening turn and then dies.
- It is **not** persisted as a member attribute, not written to `member_spiral_state`, not used to seed an
  element, and **not** shown back to the member as a characterization ("You entered through Water").
- If we later want persistence — *"you usually come in through decisions"* — that is a **separate ruling** and
  a separate consent surface. It is Recognition-layer material and may not be manufactured from Encounter-layer
  clicks. See §11 Q2.

---

## 5 · Surface C — MAIA House (authenticated threshold)

**Layer: Designed, on Live substrate.** This is the memo's central proposal, reconciled with the shipped House.

### C.1 The reconciliation that must happen first

Two authenticated thresholds exist today: `/home` (PortalThreshold + gathering strip) and `/maia` (Arrival →
conversation, House reachable as a sheet). **They overlap and neither is ruled as canonical.** This spec
recommends:

> **`/maia` is the threshold. The House sheet becomes the House *screen* on arrival, not only a drawer.**
> `/home`'s gathering strip (last session, most recent kept atom) is absorbed into it and `/home` redirects.

Rationale: design law #3 says the first screen is a threshold; a member should not have to choose between two
homes; and the House is already the ruled navigation grammar. **This requires a ruling — §11 Q1.**

### C.2 Wireframe — returning member, desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◇                        SOULLAB                          ⌂  ⚙︎     │
│                                                                      │
│                   Good afternoon, Kelly.                             │
│                What is asking for attention?                         │
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │ WHERE YOU WERE                                             │    │
│   │ A conversation, Tuesday · 24 exchanges        Continue →   │    │
│   └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │ TALK IT THROUGH     │  │ FIND MY NEXT STEP   │                  │
│   │ Something is on     │  │ I'm uncertain what  │                  │
│   │ my mind             │  │ to do next          │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │ UNDERSTAND A        │  │ RELATIONSHIPS       │                  │
│   │ PATTERN             │  │ Something between   │                  │
│   │ Something keeps     │  │ me and another      │                  │
│   │ repeating           │  │ person              │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│   ┌─────────────────────┐  ┌─────────────────────┐                  │
│   │ MAKE SOMETHING      │  │ YOUR OWN MATERIAL   │                  │
│   │ Writing, ideas,     │  │ Journal · Keeps ·   │                  │
│   │ projects            │  │ Changes · Anchor    │                  │
│   └─────────────────────┘  └─────────────────────┘                  │
│                                                                      │
│              I don't know where to begin  →                          │
│                                                                      │
│   ─────────────────────────────────────────────────────────────     │
│   YOUR SOULLAB                                                       │
│   Journal · Keeps · Relationships · Soul Portrait · Rooms            │
│                                                                      │
│   ● Talk to MAIA      ○ Type instead        The House ⌂             │
└──────────────────────────────────────────────────────────────────────┘
```

**Per §2.9, the threshold shows the member's world even on a first visit** — the doorways answer *what can I
do*, the Your Soullab strip answers *what is this place*. Only enterable destinations render (§2.9.2), so
this strip is shorter for a new member than for an established one, and never contains a dead tile.

### C.3 Wireframe — first return (one prior session, nothing kept yet)

```
┌───────────────────────────┐
│                           │   No "Where you were" card — there is
│    Good evening, Kelly.   │   nothing the member kept. The strip
│                           │   renders ONLY on real evidence.
│  What is asking for       │
│  attention?               │   No "Your own material" door either:
│                           │   an empty room is a broken promise.
│  ┌─────────────────────┐  │   (Now What? door-map precedent:
│  │ Talk it through     │  │    gated doors are absent, never
│  ├─────────────────────┤  │    placeholdered.)
│  │ Find my next step   │  │
│  ├─────────────────────┤  │
│  │ Understand a pattern│  │
│  ├─────────────────────┤  │
│  │ Relationships       │  │
│  ├─────────────────────┤  │
│  │ Make something      │  │
│  └─────────────────────┘  │
│                           │
│  I don't know where to    │
│  begin →                  │
│                           │
│  ● Talk    ○ Type    ⌂   │
└───────────────────────────┘
```

### C.4 Member-state matrix

| State | Evidence | Threshold renders |
|---|---|---|
| **S0 · Never arrived** | no `maia_has_arrived` | Surface B (guided arrival) |
| **S1 · Arrived, nothing kept** | marker, 0 atoms, 0 journal | Doorways + `I don't know` only |
| **S2 · Returning, has a last session** | `maia_sessions` row | + *Where you were* card |
| **S3 · Returning, has kept material** | atoms / journal / changes | + *Your own material* door |
| **S4 · Has consented ambient anchor** | `surface_preference` ∈ (`contextual_doorway`, `ritual_review_opt_in`) | + anchor line, in the member's own words |
| **S5 · Deep member** | many rooms populated | Doorways recede (C6) — see §5.5 |

**Every row is evidence-gated.** No card renders from a *capability*; it renders from a *fact about this
member*. This is the single most important implementation rule on this surface.

### C.5 Adaptive disappearance (C6)

The doorway grid is scaffolding. Proposed rule — **needs a ruling, §11 Q3**:

> Once a member has crossed into speech on N consecutive visits without using a doorway, the grid collapses
> behind a single quiet line — *"or choose a way in"* — and the composer takes the threshold.

The recede must be **member-legible and reversible**, never a silent personalization. A one-line, one-tap
restore. And the trigger is a member behavior count, not an inferred readiness score.

---

## 6 · Continuity, consent, and the two channels

### 6.1 What the returning House may show

The *Where you were* card and *Your own material* door surface **the member's own material to the member**.
That is permitted regardless of `return_preference` / `surface_preference` — those gates make material
*private from MAIA*, not private from its owner (C5, and the explicit test in
`lib/workbench/__tests__/keepSourceAdapter.test.ts`).

### 6.2 What the doorway may hand to MAIA

**Nothing that is not already eligible.** Choosing a door must not become a back channel that promotes a
private atom into MAIA's prompt.

```
   MEMBER-VIEW CHANNEL                 MAIA-PROMPT CHANNEL
   (the House screen)                  (the opening turn)
   ───────────────────                 ───────────────────
   all of the member's own    ───✗──►  only what passes the
   material, theirs to see             existing consent gates
                                       (return_preference /
                                       surface_preference)
```

### 6.3 The one exception, and it is a member act

If a member taps *Continue* on the *Where you were* card, they have **just performed a gesture naming that
thread**. That gesture is consent to resume *that thread*, in that moment, and nothing else. It does not
promote the thread's atoms to ambient eligibility, and it does not persist.

Precedent: the Now What? room passes an **opaque thread id** — *the member's words never ride the URL.* Same
rule here.

### 6.4 What the House may never say

- ❌ *"You've been quiet for a while."* (absence read as meaning)
- ❌ *"You seem to be working through something."* (characterization — C2)
- ❌ *"Your coherence is rising."* / any field-state or RFI/UFI surface (still frozen)
- ✅ *"You've returned to this nine times. Would you like to look at them together?"* (count + question)

---

## 7 · The elemental layer stays underneath

The memo's instinct is right and matches the shipped posture: **do not greet a new member with Fire · Water ·
Earth · Air · Aether and ask them to choose.** That converts our sophistication into their onboarding problem.

The doorways are ordinary human language. Spiralogic may **read** them; it may not **display** them, and it
may not **assert** them back.

```
   MEMBER SEES                    SYSTEM MAY READ            SYSTEM MAY NOT
   ──────────────                 ───────────────            ──────────────
   "Something is calling me"  →   fire-ish opening       ✗  "You are in Fire"
   "I need to understand what
    I'm feeling"              →   water-ish opening      ✗  a persisted element
   "I need to decide"         →   earth-ish opening      ✗  a phase assignment
   "This relationship"        →   air-ish opening        ✗  a displayed mandala
   "What does this all mean"  →   aether-ish opening     ✗  a readiness score
```

**Hard constraint:** a doorway click must not write `member_spiral_state`. That table is fed by the conductor
from actual conversation, with hysteresis. A click is not evidence of an element; treating it as such would
inject an unearned Recognition-layer claim from an Encounter-layer gesture (C1).

Discovery of the elemental map is a **later, member-initiated** disclosure — after orientation, per design
law #4 (*mystery comes after orientation*).

---

## 8 · Room architecture — what this spec does and does not touch

**Unchanged and inherited:** House grammar *Your Center · Worlds · Rooms*; the canonical rooms Journal,
Changes, Commitments, Becoming; the retirement of the feature rail; the orphan-recovery discipline in
`maiaNav.ts`.

**Two boundaries this spec explicitly does not cross:**

1. **Now What? stays out.** Ruled 2026-07-22: it is a **client build on AIN OS**, not a native MAIA room. Its
   door map is a design *precedent* to borrow, not a surface to merge. Its absence from the House is a
   correctness condition.
2. **Commitments and Becoming are Vision.** They do not exist. The House screen must not render them as doors —
   not greyed, not "coming soon". Absent until real (Now What? precedent, §5.4 rule).

**Mapping the six doorways onto the House:**

| Doorway (Encounter) | Opens into | Room it may later deposit into (member act only) |
|---|---|---|
| Talk it through | conversation | Journal / Keeps |
| Find my next step | conversation | Changes (later: Commitments — Vision) |
| Understand a pattern | conversation | Changes |
| Relationships | conversation | (Relationships room — currently off the rail; see `maiaNav.ts` note) |
| Make something | conversation | Ideas / Wisdom |
| Your own material | the House, directly | — |

A doorway **never files anything on the member's behalf.** Deposits into rooms remain member gestures.

---

## 9 · Mobile

Mobile is the environment, not a compression of the desktop (Member Experience Design Constitution, §"Mobile
is not the environment compressed").

- **One column. Doorways stack.** No 2×3 grid squeezed to 2×3 tiny.
- **The composer and the mic are always within thumb reach** — the doorway grid scrolls; the way to speak does
  not.
- **`Where you were` is the first card**, above the doorways, because returning is the dominant mobile case.
- **`I don't know where to begin` is pinned to the bottom of the doorway list**, never in a menu.
- **First arrival is two full screens**, not a modal stack, and must complete on a 375pt viewport without
  scrolling on screen 1.

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Good morning │   │ Talk it      │   │              │
│ Kelly.       │   │ through      │   │  conversation│
│              │   ├──────────────┤   │              │
│ What is      │   │ Find my next │   │              │
│ asking for   │   │ step         │   │              │
│ attention?   │   ├──────────────┤   │              │
│              │   │ Understand a │   │              │
│┌────────────┐│   │ pattern      │   │              │
││WHERE YOU   ││   ├──────────────┤   │              │
││WERE        ││   │ Relationships│   │              │
││Tue · 24 ex ││   ├──────────────┤   │              │
││ Continue → ││   │ Make         │   │              │
│└────────────┘│   │ something    │   │              │
│              │   ├──────────────┤   │              │
│ ( doorways   │   │ Your own     │   │              │
│   scroll )   │   │ material     │   │              │
│              │   └──────────────┘   │              │
├──────────────┤   ├──────────────┤   ├──────────────┤
│ ●  Talk   ⌂  │   │ I don't know │   │ ●  ⌨︎     ⌂  │
└──────────────┘   └──────────────┘   └──────────────┘
   scroll top         scroll end         after entry
```

---

## 10 · Claim discipline pass on the public copy

Per `MARKETING_CLAIM_DISCIPLINE.md`: every outward statement declares its **layer**, names its **center of
gravity**, and passes the **failure test** (strip Designed + Vision — does the story survive?).

| Proposed line | Layer | Center of gravity | Verdict |
|---|---|---|---|
| "A different kind of intelligence for the life you are actually living." | **Live** | positioning, no capability claim | ✅ ship |
| "Helps you understand what you are experiencing, keep what matters, and find your own way forward." | **Live** | conversation + Keeps (atoms are live) | ✅ ship |
| "MAIA remembers with consent. Never by stealth." | **Live** | consent gates: `surface_preference` default private, `return_preference` | ✅ ship — **the strongest differentiated claim we own** |
| "She doesn't diagnose or command." | **Live** | canon-enforced behavior | ✅ ship |
| "She helps you see rather than telling you who to be." | **Live** | C2 / Invariant 16 | ✅ ship |
| "Designed to return you to your life, not keep you inside an app." | **Live** (as intent) | must be stated as design commitment, not measured outcome | ⚠️ ship as commitment; **do not** claim measured reduction in centrality |
| "You don't have to begin your life again from zero." | **Designed** | conversational Phase 2 — FAST+CORE reach the prompt; DEEP does not | ⚠️ **fails the failure test as written for all tiers** — see below |
| "MAIA knows the whole house." | **Vision** | Commitments + Becoming don't exist | ❌ not publishable |
| "A relationship that develops with you" | **Designed** | continuity across sessions | ⚠️ permitted only in forward voice |
| Room diagram showing Journal · Changes · Commitments · Becoming | **Vision** | two of four rooms do not exist | ❌ diagram must show only live rooms |

**The continuity claim is the one to watch.** It is the emotional payload of the whole landing page, and it
rests on conversational recall that is verified on FAST + CORE only. Options: (a) scope the claim to what is
verified, (b) finish the DEEP wire (`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §V) before launch, or (c) move
the payload onto Keeps, which is unambiguously live. **Recommendation: (c) for launch, (b) as the fix.**

---

## 11 · Rulings — status

### Resolved

| # | Ruling | Disposition |
|---|---|---|
| **Q1** | `/maia` is the canonical authenticated threshold | ✅ **GREEN** (§0.1) — `/home` may not remain a competing arrival constitution; deep links preserved; migration behaviour established before routing changes |
| **Q4** | Portfolio / Past Sites / Book / Projects demoted below MAIA | ✅ answered by the ratified spine (§A.1) — move to `/about`, preserved |
| **Q5** | Which continuity claim carries the launch payload | ✅ **Kept / Recent / Continue / Deeper**, layered by evidence (§0.1) |

### Open — the remaining MLX set

| # | Question | What it changes |
|---|---|---|
| **R1** | **The three onboarding screens.** ConsciousnessPreparation (10 lenses, answer discarded), BirthDataStep, SageTealWelcome — what happens to each? | Defines Surface B's actual scope. This is the largest single UX change on the critical path. |
| **R2** | **Relationships at launch.** Restore to the rail with a real process, or keep section 07 in forward voice with no room depicted? | Whether the landing page's strongest differentiator can be drawn as a place. |
| **R3** | **Doorway persistence.** Session-scoped only, or recorded as a member-visible fact? | Whether a doorway is purely Encounter framing or becomes a stored trace. |
| **R4** | **Doorway recede rule** (§5.5). What triggers it, and is it member-visible and reversible? | Whether orientation scaffolding becomes a permanent frame. |

**Runtime verifications required before any "Live" tag in this document is repeated outward:**

```bash
# Continuity substrate — what a returning member actually has
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT count(*) FILTER (WHERE return_preference IS NOT NULL) AS atoms_with_pref, count(*) AS atoms FROM member_memory_atoms;"'

# Continuity claim — is the conversational block reaching the prompt
ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 | grep -E "conversational-block|atoms loaded"'
```

---

## 12 · Master roadmap (ratified 2026-08-25)

| Phase | Work | Outcome | Launch-critical |
|---|---|---|---|
| **0** | Constitutional baseline — MLX + Capture specs | what we're building, what we may not violate | ✅ **done** |
| **1** | Resolve rulings — MLX first, then Capture | architecture frozen enough to design | ◀ **here** (R1–R4) |
| **2** | MLX-02 — one frozen target architecture: Landing → Arrival → House → MAIA → Return | one coherent member journey | ✅ |
| **3** | Visual prototype — high-fidelity desktop + mobile journey | experience the product before touching production | ✅ |
| **4** | Threshold testing with unfamiliar people | find confusion before coding it permanently | ✅ |
| **5** | Build in slices | the new launch experience exists in runtime | ✅ |
| **6** | Auth + journey hardening | nobody falls through the front door | ✅ |
| **7** | Launch proof — full new-user and returning-user re-walk | GREEN / AMBER / RED decision | ✅ |
| **8** | Capture system | Session Room + observation architecture | **parallel — must not delay launch** |
| **9** | Deeper continuity — FAST/CORE/DEEP unification | richer return, more intelligent House | post-launch |
| **10** | Native / Watch surfaces | ambient capture | later |

### Phase 3 — the prototype is not bureaucracy

Individual screens can each look lovely while the journey remains confusing. The prototype covers **both full
journeys, desktop and phone**:

```
   new visitor  → landing → signup → first arrival → House → doorway → MAIA → House → another room
   returning    → sign in → House → Continue → MAIA → Keeps / room
```

The bar before anyone rewrites a production route: *"I understand what this world is."*

### Phase 4 — the one test that matters

Not *"do you like this design?"* but: **can someone who knows nothing about Soullab figure out what to do?**
Unfamiliar people, no coaching, six questions:

1. What do you think MAIA is?
2. What could you use this for?
3. What would you do first?
4. What if you didn't know what you needed?
5. What do you think MAIA remembers?
6. Where would you go tomorrow to continue?

Unanswerable questions are architecture defects, not copy defects.

### Phase 5 — slice order

Public landing → `/maia` House shell → first arrival → Doorways → contextual MAIA entry → returning states /
Keeps → mobile → accessibility + performance → instrumentation. **One slice at a time.**

### Phase 6 — auth is a launch gate, not backend housekeeping

The best landing experience in the world loses people at `Enter Soullab → email code → confusion → wrong route
→ wrong identity → blank MAIA`. Two journeys must be verified end to end as **launch acceptance**:

```
   LANDING → CREATE ACCOUNT → VERIFY → FIRST ARRIVAL → /maia → HOUSE → DOORWAY → MAIA
   RETURNING → SIGN IN → /maia → RECOGNIZED RETURNING HOUSE STATE
```

---

## 13 · The launch line

**Not needed before launch:** full DEEP memory · Apple Watch capture · native universal capture · every Studio
integrated into the House · perfect elemental inference · full relational geometry · every future room.

**Needed:** a compelling public explanation · effortless signup/signin · a coherent `/maia` House · clear
doorways · a graceful *"I don't know where to begin"* path · excellent voice/text conversation entry · honest
continuity through Kept / Recent / Continue · solid mobile · verified consent and trust behaviour.

**Version 1 of the House answers *where can I begin?*** The next evolution answers *where am I?*, and
eventually *what seems to be moving in my life?* — informed by Keeps, patterns, relationships, projects,
journal, Soul Portrait, changes, elemental movements, unfinished work.

> **We earn that intelligence. We do not simulate it at launch.**

---

## 14 · Growth-obligation answers

Required by `CLAUDE.md` for any capability increase.

- *What uncertainty does this introduce, and how is it preserved?* — A doorway is the member's stated
  intention, which may be wrong or provisional. Preserved by keeping it session-scoped, non-persisted, and
  never reflected back as a fact about the member (§4.4).
- *What provenance and ownership boundaries does this require?* — The two-channel rule (§6.2): the member sees
  all of their own material; MAIA receives only what the existing consent gates permit.
- *What new responsibility does this create?* — Suggesting entry points is a form of influence. Doorways must
  stay **situations, not framings of the person** (C4), and the scaffolding must recede rather than becoming a
  permanent frame around the member's own attention (C6).

---

*The competitors ask: what can our product do for you? This asks: what is asking for your attention? The
second question is answerable by someone who does not yet know what we built — which is the whole problem.*
