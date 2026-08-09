# Now What? — Product Rescue / Reality Reset

**Date:** 2026-08-05 · **Referent:** deployed `36ca82f08`
**Mode:** ⛔ PRODUCT RESCUE. No code. No components. No PR. No deployment.
**Deliverables:** A diagnosis · B CEO journey map · C minimal MVP · D capability mapping ·
E delete/hide/defer

> **Now What? is not a writing app. Not an AI app. Not a dashboard.**
> It is **Larry Closs' executive coaching platform for CEOs and leaders.**

The loop everything must serve:
```
Larry's coaching conversation → CEO develops between sessions →
CEO reflects, practices, prepares, works through challenges →
CEO returns with deeper insight → Larry's coaching becomes more effective
```

---

# A. Product diagnosis

## A1. The inventory, counted

Measured at `36ca82f08`:

| Surface | Count |
|---|---|
| **Practitioner** (`/studio/*`) pages | **~55** |
| **Practitioner** API groups (`/api/studio/*`) | **~40** |
| **Member** (`/maia/*`) pages | **~45** |
| **CEO-client** (`components/now-what/`) components | **6** |
| `app/now-what/` route | ⚠️ **uncommitted working-tree file** |

## A2. 🔴🔴 The diagnosis, in one sentence

> **We built the practitioner's operations system, not the CEO's development environment.**

Larry can run a practice: caseload, scheduling, encounters, session room, scribe, comms,
campaigns, marketing, triage, tasks, teams, protocols, proof-signals, soul-portraits, vault.
**Forty API groups of practice operations.**

The CEO — the person paying for transformation, the person whose development is the product —
has **six components and an uncommitted route.**

⭐⭐⭐ **The ratio is the diagnosis.** ~95 practitioner-and-member surfaces to ~6 client surfaces.
Every one of those 95 was a real engineering decision. None of them was the CEO's.

## A3. Why this happened, structurally — ⛔ not a competence failure

Each surface was individually justified: Larry needs scheduling; sessions need a room; notes need
storage. **The failure is that no one owned the CEO's loop**, so effort flowed to whoever could
articulate a need — and Larry can articulate operational needs, while the CEO is not in the room
when the work is scoped.

⚠️ **The same failure this repository documented today in the Author Studio lane**: capability
accumulated, the organizing relationship did not. *The pieces are not absent; the organizing
relationship is.*

## A4. The commercial test this fails

> **"If Larry had 100 CEOs paying premium coaching fees, what would make him say: this platform
> makes my coaching better?"**

Today the honest answer is: **it makes his admin better.** Scheduling, notes, session capture,
comms. Real value — ⛔ but it is practice-management value, which Larry could buy from
SimplePractice. **It is not the moat, and it is not what a CEO pays for.**

⭐⭐⭐ The thing that would make Larry say *this makes my coaching better* is a CEO who arrives at
the next session **further along than when they left** — and there is no surface that produces
that.

---

# B. The CEO journey — the five jobs

⛔ Stated in executive language. ⛔ No *field · journey · archive · hearth · carrying forward ·
reflections · living room*.

| # | The job | The moment | What "done" feels like |
|---|---|---|---|
| **J1** | **Prepare for my next conversation with Larry** | day before / hour before | *I know what I want to use this hour on* |
| **J2** | **Think through a hard decision I'm carrying** | the moment it won't leave me alone | *I can see the decision more clearly than when I started* |
| **J3** | **Practise something I said I'd change** | between sessions, repeatedly | *I tried it, and I know what happened* |
| **J4** | **Check what I committed to** | before the session, or when slipping | *I know what I said I'd do and where I actually am* |
| **J5** | **Keep working on the thing I'm developing** | ongoing, over months | *I can see I'm not where I was in March* |

⚠️ **J1 and J4 are the highest-frequency and the least built.** They are also the two that make
Larry's hour more valuable, which is where the commercial argument lives.

---

# C. What is Larry selling

⛔ Not features. ⛔ Not AI. ⛔ Not software.

| | |
|---|---|
| **The transformation** | *A leader who can meet what's in front of them without losing themselves* — a CEO who sees more clearly, decides more soundly, and does not burn out doing it |
| **The coaching model** | Sustained developmental relationship. ⭐ Value compounds across sessions; **it does not live inside any one session** |
| **The client promise** | *"You will not be the same leader in a year, and you will be able to tell me how."* |

⭐⭐⭐ **The commercial consequence:** if value compounds *between* sessions, then **the between is
the product.** Today the platform instruments the sessions and leaves the between empty.

---

# D. Minimal Now What? MVP — the CEO's home

## The first 10 seconds
The CEO sees **one thing**: ⭐ **the work they are currently in**, and how far off the next
conversation is.

⛔ Not a dashboard. ⛔ Not a menu of capabilities. ⛔ Not a status report. ⛔ **Not a list of what
isn't ready yet.**

## The first action
**Continue** — resume the thing they were last working through.
⚠️ If they have never been here: **a single prompt from Larry's last session.** ⛔ Never an empty
state, ⛔ never an import form, ⛔ never a tour.

## Secondary actions — visible, not prominent
1. *Before we meet* — what I want from the next hour **(J1)**
2. *What I said I'd do* — my own commitments, in my own words **(J4)**
3. *Something I'm working through* — an open decision or situation **(J2)**

## What disappears until context makes it meaningful
Everything else. Past sessions · notes · history · anything with the word *manage* in it ·
⛔ **every reference to a capability that does not yet exist.**

## What persists because it represents the relationship
**The thread with Larry.** The one continuous thing. Not a feature — the reason the CEO is here.

---

# E. Mapping existing capabilities into that experience

⭐⭐⭐ **The MVP needs almost no new substrate.** It needs the existing substrate pointed at the CEO
instead of at the practice.

| MVP element | Existing capability | State |
|---|---|---|
| The thread with Larry | `sessions`, `encounters`, `client_relationships` | ✅ built — **practitioner-facing only** |
| Continue | `member_sessions`, spiral state, return-state patterns | ✅ built — proven in the Studio draft return |
| Before we meet | `client-inquiry`, `prompt-sets`, `session-followup` | ⚠️ built as a *practitioner sends* mechanism, ⛔ not a *CEO prepares* one |
| What I said I'd do | commitments / `protocol-assignments` / tasks | ⚠️ exists **as practitioner records**, ⛔ no client-owned view |
| Working through a decision | `/studio/decisions`, `changes`, MAIA conversation | ⚠️ decisions are a **practitioner instrument**; MAIA is member-facing and live |
| Development over time | `member_patterns`, `member_spiral_state`, portraits | ⚠️ built, ⛔ **not shown to the person it is about** |
| Keeping something that mattered | Keep gesture, `member_memory_atoms` | 🔴 **broken loop — W8**, capsule ≠ atom |

⭐⭐⭐ **The recurring shape: the capability exists and the CEO cannot see it.** Nearly every row is
*built, practitioner-scoped, no client-owned surface.* **That is the rescue** — not new features.

⚠️ **The exception worth naming:** MAIA's conversation surface **is** live, member-facing, and
good. It is the only place the CEO already has a real relationship with the product. **The home
should be adjacent to it, not a separate destination that competes with it.**

---

# F. Delete · hide · defer

## Delete from the CEO's view — ⛔ costs nothing, earns immediately
- **"COMING LATER — not yet available"**, everywhere. ⭐⭐⭐ *A room does not tell you what it
  cannot do.* To a CEO this reads *unfinished* before they have done anything.
- **Administrative verbs as first offers** — *Rename · Withdraw · Import · Manage*.
- **Headers promising four things where one is delivered.**

## Hide until context makes them meaningful
Past sessions · notes · history · settings · anything answering *where is my stuff* rather than
*what am I working on*.

## Defer — ⛔ not product yet
Every surface that fails the **Product Loop Closure Law** (*who uses it · when · why · what
changes · how do we know*). ⚠️ On the inventory above, **most of the ~40 practitioner API groups
have no answer to "what changes for the CEO?"** — they answer *what changes for the practice*,
which is a different product.

## The Surface Purpose Invariant, applied
> **"Would the CEO arrive wanting this, or does this exist because we built it?"**

⛔ Applied to the current `/press/studio` home: **the CEO would arrive wanting none of it.** Work
list, import form, three disabled labels. Every element exists because it was buildable.

---

# G. What this document does not do

⛔ No code · no components · no PR · no deployment · no new constitutional document.
⛔ It does not authorize the MVP. ⛔ It does not rule on Author Studio, Writer's Field, or W8.
⛔ It does not decide whether `/press/studio` serves authors or CEOs — ⚠️ **that question is now
open and is upstream of everything here.**

⭐⭐⭐ **The single finding to carry forward:**

> **The platform instruments the coaching relationship from the practitioner's side and leaves the
> client's side of that same relationship empty. The between-sessions life of a CEO — where the
> transformation actually happens and where the money is justified — has no home.**
