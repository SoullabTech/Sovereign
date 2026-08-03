# Now What? — Design Direction (Larry-facing translation)

**Date:** 2026-08-03 · **Status:** RECORDED. Founder-authored direction + three candidate design
rules. **Rules 1–3 are CANDIDATE, not ratified. No build authority. Nothing implemented.**

Companion to [the pattern study](NOW_WHAT_INTERACTION_PATTERN_STUDY_2026-08-03.md). Checked against
[Phase 0.5](../architecture/NOW_WHAT_CLIENT_HOME_PHASE_0_5_BOUNDARY_2026-08-02.md) and the ruled
E-2 / E-3 / Q-A / Q-B / Q-C set.

---

## 0. The direction, as authored

> Most software is built around managing information. Now What? is being designed around supporting
> human development. That creates a different kind of platform.

And the assumption swap, which is the strongest sentence produced in this lane so far:

> Traditional CRM: *"The company owns the customer record."*
> Now What?: *"The relationship is shared, but each person owns their own experience."*
> **That is not missing information. That is trust.**

That is the north star in a form Larry can hear. It should be the sentence the platform is explained
with. It also states, in plain language, the same thing the ownership map states in schema terms:
*does this record exist because of a professional relationship, or because the person exists?*

**Confirmed adoptions from the pattern study:** Apple (fewer decisions), Airbnb (roles → three
questions per item: who created · who owns · what may be done), Figma (collaboration without one
blended voice). The `Larry offered: "Where might you experiment with delegation?"` form is now
stated as the house form. Good.

**Rule 3 is a real correction and it lands.** *"Here is what you are carrying. Where would you like
to continue?"* is E-2 compatible — kept material, doors, no computed next step. The productivity
framing is explicitly refused. Nothing further needed here.

---

## 1. Four things in this draft still collide with ruled constraints

Ordered by severity. #1 and #2 are boundary issues; #3 is a governance issue; #4 is a leak surface.

### 1.1 ⛔ "Current focus: Leadership transition" — two different objects share one name

On Larry's client page this line is either fine or the single most important violation in the lane,
and the label does not say which.

| Object | Owner | Larry may see | Substrate |
|---|---|---|---|
| The **process/program** Larry placed Senja in, and its stage | relationship | ✅ yes — Larry authored it | `coach_client_processes`, `coach_program_enrollments.current_stage_id` ✅ on trunk |
| Senja's **selected focus** — which process she considers herself in | **person** | ⛔ **never** — *unreachable from any practitioner query* | `coach_client_selected_focus` ✅ on trunk |
| Senja's focus **in her own words** | person | ⛔ never | `coach_current_focus` ⛔ deferred |

"Current focus" reads naturally as the second or third. Those are exactly the objects Slice 0 exists
to prove Larry cannot reach — *the proof is a negative; the absence is the product.*

**Recommended wording on Larry's page:** `Working through: Leadership transition · placed by you`.
It is accurate, it is authored, and it makes the invariant legible in the label instead of relying
on the reader to know which table it came from.

> **Standing hazard for this lane: whenever a word names both a practitioner-authored placement and
> a person-owned election, the interface must disambiguate. `focus` is that word.**

### 1.2 ⚠️ `What Senja is carrying: [private unless shared]` — a rendered slot is not silence

This is Q-P2 arriving in concrete form, and it deserves naming rather than solving quickly.

E-3 ruled: **private sovereignty is silent.** An empty labelled band is not silent — it tells Larry
*"there is material here you are not being shown."* That is weaker than reading her reflections, but
it is the same category: it makes her private material into an object on his screen. It also gives
withheld-ness a permanent position, which over months reads as a gap in the relationship rather than
as its structure.

Two directions, pulling opposite:

- **Kelly's intent** — the boundary should be *legible as integrity*, so Larry understands the
  design rather than suspecting a defect.
- **E-3's constraint** — the absence must not be rendered.

**Proposed resolution (not a ruling):** *state the boundary once, in the relationship's terms;
never per-band.* Larry learns the rule from the platform's own honest description of what a
practitioner can and cannot see — said plainly, once, where it belongs — and the client page renders
only what exists: a `Shared with you` section that is present when Senja has shared something and
simply absent when she has not. Absence then has no slot to occupy.

This relocates Q-P2 rather than closing it. It remains the hinge question of the lane.

### 1.3 ⛔ The third voice — `MAIA observed: "This theme has appeared several times."`

This is new in this draft and it is the largest governance item.

Rule 2 (*authorship is always visible*) is being asked to carry weight it cannot carry.
**Attribution answers *whose voice*. It does not answer *whether that voice has authority to make
that claim*.** A labelled claim is still a claim; `MAIA observed:` makes the source honest without
making the utterance admissible.

"This theme has appeared several times" is a cross-material pattern claim — the system performing
Reflection → Recognition on the member's behalf. That is held under freeze (*no synthesis;
provenance-grounded only*), and Pattern Attunement is explicitly gated downstream of episodic. Under
the Constitutional Direction of Authority, authority moves upward **only** through authored
experience; a system-generated recognition claim manufactures a higher-order layer the member did
not author.

Rule 1 (*the system reveals; it does not decide*) is the right instinct but is not yet a usable
boundary — "reveals a pattern" and "decides what your pattern is" are the same sentence with
different verbs. **What makes the difference operable is provenance, not phrasing:** a claim is
admissible when it points at material the member authored and lets them do the recognizing
(*"you wrote this in March and again in June"* — two pointers, no synthesis) and inadmissible when
it names the theme for them.

⛔ **And a hard sub-case regardless of how the above is ruled:** a MAIA observation about the
member's private material must never render on **Larry's** surface. That is surveillance with
attribution attached — the E-3 problem plus a system-authored claim, in one line.

**Recommendation:** the third voice is a separate ruling, not a design rule. Do not let it enter via
the pattern study. Rules 1–3 can be ratified without it.

### 1.4 ⚠️ `Timeline: shared moments` — the place a withdrawal would leak

A timeline of **authored acts** (sessions held · things Larry published · things Senja elected to
share) is admissible; every entry has an author and a gesture behind it.

Two constraints it must satisfy by construction:

- **No member activity.** If an entry can appear because Senja *did something in her own Field*, the
  timeline is the activity feed E-3 forbids — the styling changed, not the substance.
- **No withdrawal shadows.** E-3 ruled withdrawal produces no notification and no event to Larry.
  A timeline is precisely where a removed item leaves a visible gap. Withdrawn items must be
  **unreconstructible from the timeline**, not merely hidden in it — including by position, count,
  or spacing.

---

## 2. Candidate rules — restated for ratification

| # | As drafted | Status |
|---|---|---|
| 1 | The system reveals; it does not decide | ◐ right instinct, not yet operable — **needs the provenance test** (§1.3) to be a boundary rather than a preference |
| 2 | Authorship is always visible | ✅ ratify — with the explicit note that **attribution is necessary, not sufficient** |
| 3 | Returning should feel natural — *"here is what you are carrying"*, never *"complete this next"* | ✅ ratify as written — E-2 compatible, no changes |

**Still open from the pattern study, unchanged by this draft:** Q-P1 (one component with a viewer
parameter is where projection re-enters) · Q-P2 (§1.2 above) · Q-P3 (nav lists `Programs · Sessions ·
Resources`, whose content tables are deliberately deferred — size nav to what exists, or declare
shape ahead of content).

---

## 3. What has not changed

Slice 0 is still the next build unit and is still **a trust-boundary demonstration, not a homepage**.
Services before UI. No migration. This document describes the destination; Slice 0 proves the floor
is solid enough to stand on it.

The closing sentence of the direction is the right statement of the problem and should be preserved:

> The hard part is not creating screens. The hard part is creating a system where the software is
> intelligent enough to help, but humble enough not to take over.
