# MLX-02 — Experience Architecture · **FROZEN**

**Date:** 2026-08-25 · **Status:** **FROZEN** for the launch programme.
**Rationale and derivation:** `docs/specs/MAIA_LAUNCH_EXPERIENCE_SPEC_2026-08-25.md` (MLX-01).
**Governing canon:** `docs/canon/SOULLAB_DESIGN_CANON.md` · `INHABITABLE_ARCHITECTURE_STANDARD.md` ·
`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` · `THE_HOUSE.md` · `MARKETING_CLAIM_DISCIPLINE.md` ·
`MAIA_SOVEREIGNTY_INVARIANTS.md`

> **What "frozen" means.** Not frozen forever — **frozen enough that implementation stops re-deciding the
> product while building it.** Every question below is answered. Building against this document does not
> require re-opening it. Changing it requires the process in §12.

---

## 1 · The ruled set

| # | Ruling | |
|---|---|---|
| **Q1** | `/maia` is the canonical authenticated threshold. `/home` may not remain a competing arrival constitution. Deep links preserved — *one default threshold, many intentional deep entrances.* | GREEN |
| **Q4** | Portfolio · Past Sites · Book · Projects move to `/about`. | GREEN |
| **Q5** | Continuity launches in layers: **Kept · Recent · Continue · Deeper**, each with its own evidentiary requirement. | GREEN |
| **R1** | The doorway replaces the three onboarding screens. Post-signup = **Name → Doorway → MAIA**, under 60s. | GREEN |
| **R2** | Relationships restores under **My Life**, **member-authored scope only**. System-authored durable relational interpretation withheld. | GREEN, reduced |
| **R3** | Doorway intent is **session-scoped**. No durable member fact, no Recognition, no elemental state. | GREEN |
| **R4** | The member's world **displaces** the doorways. Fixed threshold order; recession is **spatial, not eliminative**. | GREEN |
| **R5a** | **Two spheres over the shipped spine** — My Soullab / My Practice. `Worlds`/`Rooms` retire as group headings. | GREEN |
| **R5b(i)** | *My Work* → **My Contribution.** | GREEN |
| **R5b(ii)** | Canonical place names stand. No cosmetic rename pass. | GREEN |
| **R6** | **My Practice ships** — curated Live subset, redesigned to canon. Administration remains as utility. | GREEN |

**Governing rules established:**

- *Teach the world before signup. Orient the person after signup. Let MAIA provide the first value.* (R1)
- *Use familiar words for orientation; preserve distinctive names for actual places.* (R5a)
- *Accompaniment is the practice. Administration supports the practice.* (R6)
- *The explanatory scaffolding recedes; the destination remains stable.* (R5b-ii)
- *The architecture must not assume that expertise eliminates uncertainty.* (R4)

---

## 2 · Canonical vocabulary

```
   SOULLAB
   │
   ├── MY SOULLAB
   │   ├── MY LIFE               the life I am living and becoming
   │   │   ├── Living Field      a place to gather and reflect on lived experience
   │   │   ├── Journal           expressive writing
   │   │   ├── Anchor            a quiet place to return
   │   │   └── Relationships     where self and other meet — MEMBER-AUTHORED SCOPE ONLY (R2 revised)
   │   │                         (Soul Portrait moved to My Practice — PREFLIGHT §2)
   │   │
   │   └── MY CONTRIBUTION       what I am learning, creating, developing and offering
   │       ├── Ideas             what you're thinking, exploring and developing
   │       ├── Wisdom            what you've learned, gathered and want to carry
   │       └── Studios           places where ideas become work
   │
   └── MY PRACTICE               [role gated] the people, encounters and work
       ├── People                  you hold in service of others
       ├── Encounters
       ├── Preparation
       ├── Sessions
       ├── Notes / Observations
       ├── Co-Lab
       ├── Session Room
       └── Soul Portrait         [moved from My Life — practitioner authors and sends]
```

**Rules.** Member-facing label, canonical object and route are three separate layers — **no route is renamed.**
Each place carries its registry line as a visible subtitle on first encounter, receding with familiarity.
Living Field's subtitle passes the same Invariant 16 test its label did. Conventional words for ordinary
functions (Home, Search, Back, Profile, Settings); distinctive words only for places.

**Not in the member vocabulary:** Caseload (internal / profession-specific only), Worlds, Rooms (retired as
headings), Practices (no route), Notifications (no route).

---

## 3 · The journey

```
   PUBLIC IDENTITY → PUBLIC PRODUCT OVERVIEW → JOIN / SIGN IN → ARRIVAL
   → MAIA HOUSE → STABLE PLATFORM NAVIGATION → MAIA + MEMBER WORLD → CONTINUITY → RETURN
```

| | Surface | Job |
|---|---|---|
| **A** | Public landing | *Why would I want this, and why should I trust it?* |
| **B** | Guided Arrival | *I'm new. Where do I begin?* |
| **C** | MAIA House (`/maia`) | *I'm here. What can I do now?* |
| **D** | Conversation | the work itself |

**Landing spine (15 sections):** Invitation · Doorways · Arrival · Conversation · **The House** · For your
life · For your practice · One ecosystem · Continuity/Keeps · Relationships · Know yourself · Create ·
Elements · Voice+Text · Consent/Privacy · AIN/Architecture · **After signup** · Begin.
Section 14 (After signup) is undrawable until Surface B ships — it is the honesty test for the launch.

**Landing ⇄ House share one conceptual grammar.** Entering must feel like **recognition, not surprise.**

---

## 4 · The threshold (Surface C)

**Fixed order. No trigger, no counting, no inference.**

```
   1  Continue        the thread already underway
   2  Kept            what they chose to retain
   3  Recent          where they have been
   4  Doorways        what is asking for your attention
   5  I don't know where to begin      ← permanently available
   6  Your Soullab    the member's places
```

| State | Evidence | Threshold |
|---|---|---|
| **S0** never arrived | no `maia_has_arrived` | Surface B |
| **S1** arrived, nothing kept | marker only | Doorways lead; Your Soullab short |
| **S2** has a last session | `maia_sessions` | + Continue |
| **S3** has kept material | atoms / journal | + Kept; doorways move down |
| **S4** consented ambient anchor | `surface_preference` | + anchor line, member's words |
| **S5** established | populated world | Their world leads; doorways below, quieter, present |

**Every row renders from a fact about *this member*, never from a capability.** Member-state gating is
legitimate; capability gating is not — a destination no member can enter renders for nobody.

---

## 5 · Doorways

**The set:** Something is on my mind · I'm going through a change · I want to understand myself · I need
clarity about a decision · Something in a relationship · I'm making something · I'm just curious ·
**I don't know.**

**Constraints.** One tap, then MAIA starts — never a questionnaire. The opening turn is a **frame, never a
seed**; it may not characterize the member, who has said nothing yet. Session-scoped: no persistence, no
`member_spiral_state` write, no reflection back as a fact. Elemental reading may inform the opening; it may
never be displayed or asserted.

---

## 6 · Continuity

| Layer | Meaning | Evidence required |
|---|---|---|
| **Kept** | the member chose to retain it | atoms — **the launch primitive** |
| **Recent** | where they have been | `maia_sessions` — factual |
| **Continue** | resume eligible work | member gesture |
| **Deeper** | recognition | **only where proven** — not promised at launch |

**Two-channel rule.** The member sees all of their own material; **MAIA receives only what
`return_preference` / `surface_preference` permit.** Tapping *Continue* consents to resuming *that thread*,
now — it promotes nothing to ambient eligibility.

**Launch claim:** *"When you've chosen to keep something, MAIA can help you return to it."*
**Not launchable:** *"You don't have to begin your life again from zero"* — DEEP recall is unverified.

---

## 7 · My Practice

| Identity-bearing (in the House, previewable) | Utility (available, not the identity) |
|---|---|
| People · Encounters · Preparation · Sessions · Notes/Observations · Co-Lab · Session Room | Booking · Calendar · Billing · Invoices · Agreements · Admin caseload · Settings |

**Live only.** MARK / SPEAK / universal capture / MAIA-drafted notes are **phase 8** and may not be implied.
**Framing:** *For those who accompany others* — vocation, not profession.
**Acceptance:** if a first encounter could reasonably be mistaken for practice-management software, it fails.

---

## 8 · Standards that govern every surface

**Design Canon** (`docs/canon/SOULLAB_DESIGN_CANON.md`) — world-class digital craft with restraint, soul and
unmistakable identity. Sophisticated simplicity · refined materiality · soulful not sentimental · elemental
not literal · quietly futuristic · human first · distinctive enough to own · familiar enough to enter · no
cheapness anywhere. *If simplifying makes it feel generic, we simplified the wrong thing.*

**Category refusal** — never a therapy platform, healthcare product, practice-management app, wellness app or
AI chatbot. **MAIA is a presence in the environment, not a chat window with an avatar.**
**Rejection clause:** `/maia` as *eight beautiful buttons + chat* fails, however well executed.

**Screen review — four questions.** Inevitable? · Spacious but alive? · Emotionally intelligent? · Could this
belong to any other product? *If yes, it isn't finished.*

**Visual acceptance:** ❌ *"beautiful therapist software."* ✅ *"I haven't quite seen a digital place like this
before — but somehow I immediately know how to enter it."*

---

## 9 · The launch line

**In:** compelling public explanation · effortless signup/signin · coherent `/maia` House · clear doorways ·
graceful *"I don't know where to begin"* · excellent voice/text entry · honest continuity (Kept/Recent/
Continue) · solid mobile · verified consent behaviour · My Practice (curated Live subset).

**Out:** full DEEP memory · Apple Watch · universal capture · MARK/SPEAK · every Studio in the House ·
perfect elemental inference · full relational geometry · every future room · rebuilding billing/booking/
invoicing · wholesale practitioner backend rewrite.

---

## 10 · Gates

| Gate | Applies |
|---|---|
| **Claim discipline** — Live/Designed/Vision, Center of Gravity, Failure Test | every outward statement |
| **Design Canon + four-question review** | every major screen, phase 3 |
| **Comprehension test** — unfamiliar people, no coaching, six questions | phase 4 |
| **Co-Lab Release Gate** — 31/31 | any migration touching sessions/encounters/members |
| **R2 verification walk** | before Relationships is registered or depicted |
| **Auth journey proof** — both journeys end to end | phase 6, launch acceptance |

---

## 11 · Open items (do not block the freeze)

1. ~~R2 governance block~~ — **RESOLVED: reduced scope (R2 revised).** Relationships ships member-authored
   only; the system-authored layer is withheld pending the constitution's remedy. Runtime walk still owed for
   empty state, mobile and dead routes (`MLX_PREFLIGHT_VERIFICATION_2026-08-25.md` §3), but it no longer gates
   MLX-03 composition.
2. **Search does not exist.** A member accumulating Keeps and journal entries with no way to find anything is
   a platform that stops feeling like a place. Belongs in the phase 5 slice order.
3. **Soul Portrait is practitioner-owner only** — resolved: it moves to My Practice and leaves the landing
   page's member capabilities (PREFLIGHT §2).
4. ~~Filename collision~~ — **RESOLVED 2026-08-25.** The older file is now
   `docs/design/SOULLAB_VISUAL_LANGUAGE_v1.0.md`, retitled and pointed at the governing canon as its
   implementation layer; inbound references updated. `docs/canon/SOULLAB_DESIGN_CANON.md` is the single
   unambiguous authority.
5. **`CLAUDE.md` onboarding section is stale** — documents `/begin → /intro-maia → /intro-daimon →
   /test-elemental` which are deprecated redirects or nonexistent. Should be corrected when R1 ships.

---

## 12 · Change control

This document changes only by: **(a)** a founder ruling recorded in MLX-01 and reflected here, **(b)** the R2
walk outcome, or **(c)** a phase 3/4 finding that a ruled decision fails in practice — which is a *finding*,
reported with evidence, not a unilateral redesign.

**Implementation does not re-open rulings.** A builder who believes a ruling is wrong raises it; they do not
route around it.

**Next phase:** MLX-03 — high-fidelity prototype of both journeys, desktop and mobile, judged against §8
before any production route is rewritten.
