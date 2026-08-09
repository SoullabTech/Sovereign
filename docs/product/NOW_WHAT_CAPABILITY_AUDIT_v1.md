# NOW WHAT? — Client Platform Capability Audit v1

**Date:** 2026-08-05 · **Referent:** deployed `36ca82f08`
**Governed by:** `NOW_WHAT_PRODUCT_DESIGN_BRIEF_v1.0.md`
**Status:** ⛔ audit only. No redesign. No code. No PR.

> ⭐⭐⭐ **The governing finding of this cycle:**
> **We built the practitioner's operations system, not the CEO's development environment.**
>
> ⛔ The mistake was not primarily UI. It was **building the engine room before defining the
> passenger experience.** A yacht can have an extraordinary engine room and still not be a yacht.
>
> ⭐⭐ **The practitioner field is the nervous system. The client platform is the body.**
> We built the nervous system. ⛔ Do not throw it away.

---

## 0. Two evidence streams — ⛔ do not merge

⭐⭐⭐ **The gap between these streams is the product roadmap.** Merging them prematurely destroys
the roadmap by hiding what was never specified.

| | **Stream A — Platform Reality** | **Stream B — Coaching Reality** |
|---|---|---|
| Source | repo · schema · routes · APIs · deployed UI | Flourishing Leadership materials · decks · curriculum · exercises · client journey · coaching agreements · session structure |
| Answers | *What can the system currently do?* | *What should the system help Larry deliver?* |
| **Status** | ✅ **audited below** | 🔴🔴 **ABSENT — not in this repository, never supplied** |

### 🔴🔴 Stream B is missing, and this audit cannot substitute for it

The repo **cannot** tell us: what Larry actually coaches · what transformation he sells · what
clients expect when they hire him · what his programs contain · what exercises, practices, or
frameworks define his methodology · what his coaching rhythm is · what happens between sessions.

⛔ **These are not software questions.** Any product decision made without Stream B is inference
dressed as evidence — the exact failure this cycle already produced in the Author Studio lane.

**Required mapping, once Stream B exists:**
```
Larry concept  →  client experience  →  platform capability

"Leadership flourishing"
        ↓
"I understand where I am developing and what I am practising"
        ↓
"My Development Journey"
```

---

## 1. Stream A — Capability audit

**Question governing every row:** ⭐⭐⭐ *If Larry sends a CEO here tomorrow, what can that CEO
actually experience?*

| Capability | Exists? | Owner | Current orientation | CEO value | Gap |
|---|---|---|---|---|---|
| **MAIA conversation** | ✅ yes | member | **member-facing** | **high** — the only live CEO relationship | refine the loop, don't rebuild |
| **Memory / continuity** | ✅ yes | system | **hidden** | continuity | ⚠️ member visibility — built, not shown to the person it is about |
| **Kept items** | ⚠️ partial | member | member gesture, practitioner substrate | development record | 🔴 **broken loop (W8)** — Keep writes capsules, Shelf reads atoms |
| **Programs / pathways** | ✅ yes | practitioner | **practitioner-facing** | unknown until Stream B | ⛔ **no client experience of a program at all** |
| **Sessions / Session Room** | ✅ yes | practitioner | **practitioner-facing** | coaching continuation | client-side view absent |
| **Calendar** | ✅ yes | practitioner | **practitioner-facing** | relationship rhythm | client surface absent |
| **Communications** | ✅ yes | practitioner | **operational** | relationship | client interaction absent |
| **Notes / observations** | ✅ yes | practitioner | **practitioner-facing** | development continuity | ⚠️ **ownership issue** — the CEO's development is recorded *about* them, not *by* them |
| **Commitments / protocols** | ✅ yes | practitioner | practitioner records | J4 — *what I said I'd do* | no client-owned view |
| **Patterns / spiral state** | ✅ yes | system | **hidden** | growth over time | not surfaced to the subject |
| **Session preparation** | ⚠️ partial | practitioner | *practitioner sends prompts* | **J1 — highest value** | ⛔ wrong direction: no *CEO prepares* path |
| **Decisions / changes** | ✅ yes | practitioner | practitioner instrument | J2 — thinking through | no client-owned surface |
| **Practitioner Portal** | ✅ yes | practitioner | **~55 pages · ~40 API groups** | indirect | ✅ correct as-is — Larry's OS |
| **CEO client surface** | 🔴 **6 components** | client | — | — | 🔴🔴 **the product** |

### The uniform shape
⭐⭐⭐ **Nearly every row reads: built · practitioner-scoped · no client-owned surface.**
⛔ This is not a feature deficit. It is an **orientation** deficit. The substrate exists and points
the wrong way.

### The counted ratio
| Surface | Count |
|---|---|
| Practitioner `/studio/*` pages | ~55 |
| Practitioner API groups | ~40 |
| Member `/maia/*` pages | ~45 |
| **CEO-client components** | **6** |
| `app/now-what/` route | ⚠️ **uncommitted working-tree file** |

---

## 2. Against the seven-part client model

| # | Client need | State |
|---|---|---|
| 1 | **Coaching relationship** — Larry's identity, programs, commitments, sessions, channels | 🔴 **no client-facing surface**; all data exists practitioner-side |
| 2 | **Programs & learning pathways** | 🔴 **no client experience**; ⛔ blocked on Stream B for content |
| 3 | **Conversations with MAIA** | ✅ **live and good** — the one working element |
| 4 | **Session preparation & follow-through** | ⚠️ inverted — practitioner sends, CEO does not prepare |
| 5 | **Communication with Larry / facilitators** | ⚠️ operational only |
| 6 | **Personal development record** | ⚠️ exists *about* the CEO, ⛔ not *owned by* them; Keep loop broken |
| 7 | **Growth journey over time** | 🔴 substrate exists (patterns, spiral state), ⛔ never surfaced |

**Score: 1 of 7 delivered.**

---

## 3. The smallest complete CEO coaching loop

⛔ Not "build the platform." ⭐ The smallest loop that, if it works, means **Now What? exists**:

```
CEO enters
    ↓
sees current coaching relationship        ← Larry, next session
    ↓
sees current program / focus              ← what I'm developing
    ↓
works through a challenge with MAIA       ← ✅ already live
    ↓
captures what matters                     ← 🔴 W8 blocks this
    ↓
brings it into next Larry conversation    ← J1, the highest-value gap
```

**What each step needs, from what already exists:**

| Step | Reuses | Genuinely missing |
|---|---|---|
| enters | member auth | a client home |
| coaching relationship | `client_relationships`, `sessions`, calendar | client-side read |
| current program / focus | `programs`, `protocol-assignments` | client-side read + ⛔ Stream B content |
| MAIA | ✅ live | nothing |
| captures what matters | Keep, `member_memory_atoms`, `keepSource()` | 🔴 **W8 repair** |
| into next conversation | `client-inquiry`, `session-followup` | **direction reversal** — CEO→Larry |

⭐⭐⭐ **Four of six steps need a client-side read of data that already exists.** One needs the W8
repair, already ruled. One needs a direction reversal. ⛔ **None needs new architecture.**

⚠️ **Preliminary read of §9 of the brief:** closer to **50% restructuring** than 20% refinement or
a rebuild. ⛔ Provisional — cannot be confirmed without Stream B.

---

## 4. Constitutional additions proposed by this audit

⛔ Recorded as candidates. Ratification is a founder act.

### Experience Before Infrastructure Law
> **No capability may be considered complete until the human experience it enables is defined.**
> ⛔ A database table is not a feature. An API is not a product. A practitioner workflow is not a
> client experience.
> ✅ Unit of design: **human intention → gesture → experience → capability**
> ⛔ Not: schema → route → component → feature

### Two-Sided Platform Law
> **Every relationship platform has two valid but distinct environments: the provider's operating
> environment and the participant's lived environment. ⛔ Neither may substitute for the other.**

### The Shared Substrate Fallacy
> **Shared infrastructure does not imply shared experience.**
> A memory system can serve a CEO, a coach, an author, and a practitioner — but each experiences it
> through a different purpose. ⭐⭐⭐ **The product is not the substrate. The product is the human
> relationship the substrate enables.**
> ⚠️ This rule would have prevented the Author Studio / Now What? blending in this cycle.

### No More "World-Class Platform" Conversations
> ⛔ Until the first complete user journey exists. **World-class emerges from a complete human
> loop, not from accumulated capabilities.**

---

## 5. Author Studio — confirmed separate

| | **Now What?** | **Author Studio** |
|---|---|---|
| Audience | CEO / client / executive leader | authors / creators |
| Purpose | continue coaching · develop leadership · reflect · practise · prepare · grow | capture · write · shape · publish |

⛔ **Author Studio is not part of the Now What? CEO client experience.** They may share
infrastructure — memory, MAIA, conversations, publishing primitives — but they are **different
products with different human intentions.**

⭐⭐⭐ **The prior confusion came from treating shared capability as shared experience.**

---

## 6. Sequence

1. ✅ Consolidate existing capability — *this document*
2. 🔴 **Gather Larry's actual coaching model (Stream B)** — **BLOCKING**
3. ⏳ Define the CEO journey
4. ⏳ Map existing infrastructure into that journey
5. ⏳ Identify the smallest complete loop, confirmed against Stream B

⛔ **Step 2 blocks steps 3–5.** ⚠️ Everything in §3 above is a Stream-A-only hypothesis and must be
re-tested once the coaching model exists.
