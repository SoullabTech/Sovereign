# Now What? — Larry Practice Workspace v1 · UI/UX Specification

**Date:** 2026-08-03 · **Status:** ⛔ **DRAFT — NOT RULED. Design specification only. No
implementation authorization.**

> **Larry is not the person who should discover the architecture for us.** He is the person who
> should tell us whether the architecture honors his practice — *after* the environment is coherent
> enough to be encountered.

---

## 0. ⚠️ Fifth near-collision — two of the eight sections are already decided

Two prior artifacts cover requested sections 5 and 6, **as architecture decisions, not as drafts**:

| Requested section | Already exists |
|---|---|
| **5 · MAIA relationship boundaries** | `docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md` §G *MAIA composition boundaries* |
| **6 · Privacy / visibility model** | same ADR §E *Privacy boundaries* + §F *Visibility matrix* |
| Scope of a first slice | `..._INSPECTION_2026-07-13.md` §E *minimal vertical slice* + **§J *what must not be built yet*** |

**Those are inherited, not restated.** Writing a second privacy model would create a competing
referent for something already ruled — the failure this lane has now caught five times in two days.
This document covers **only what is genuinely UI/UX**: doorways, first screens, the continuity
surface, the between-session experience, acceptance, and the gate.

⚠️ **Before implementation, re-read ADR §E/§F/§G and Inspection §J.** If this spec contradicts them,
**they win** and this document is wrong.

## 0b. ⚖️ The unit question — must be ruled before anything is built

**"Larry Practice Workspace v1" and "Slice 0" are not the same object**, and the relationship between
them is unstated:

- **Slice 0** is ruled as *a trust-boundary demonstration, not a homepage* — services before UI, no
  migration, **the proof is a negative**.
- **v1** is *a coherent deployed experience Larry can encounter and evaluate.*

Three possibilities, none ruled: v1 **contains** Slice 0 as its first increment · v1 **supersedes**
Slice 0 (the negative proof becomes an internal test rather than a deliverable) · they **run
parallel** on different timelines.

⛔ **Do not resolve this by building.** Naming the unit first is the standing rule; "v1" silently
absorbing a ruled object is how a ruling is lost.

## 1. Practitioner doorway

| Question | Specification |
|---|---|
| Where does Larry enter? | One address he can bookmark. Not through the member app's front door — that door is the Explorer's. |
| What does he see first? | Who he is meeting today, and nothing that requires interpretation. Names before numbers. |
| How does he understand his role? | By recognizing the objects — clients, programs, sessions — not by reading an explanation. **If a training explanation is required, the doorway has failed.** |
| How does he avoid becoming a dashboard operator? | No counts he did not ask for, no queue that implies obligation, no status he must maintain. The workspace reports; it does not assign. |

## 2. Client doorway

⚠️ **Gated on the threshold ratification** — whether AIN OS admits a practitioner-invite entry
distinct from the Explorer flow is unruled, and the client doorway cannot be specified past that
point.

What is specifiable now: **neutral before authentication, personalized after** — a door may adapt to
the relationship but must not reveal the relationship before the person enters. First authenticated
screen names Larry and the work; nothing before it does.

## 3. Session continuity

The surface is *before · during · after*, and the ownership differs across the three:

- **Before** — the client's preparation. **Theirs.** Shared only by an act of sharing, visible as one.
  ⛔ A preparation field Larry can read by default is a homework surface.
- **During** — the session record. Shared.
- **After** — what each carried. Separately authored, separately owned.

🔴 **Blocked:** `sessions.team_id` is omitted by four INSERT paths (#899). Session creation is broken.
**This is a prerequisite for the room, not a detail inside it.**

## 4. Between-session experience

The room that is nearly buildable today and carries the strongest boundary. The client's own
material, returned by **their gesture** — kept, not last. MAIA available, invited, never surfacing
unprompted beyond L1.

⭐ **This is the part of the environment that most distinguishes the product**, and it needs the least
new code. It should be in v1 for that reason, not despite it.

## 5. MAIA relationship boundaries — INHERITED

See ADR §G. **Not restated here.** The only UI consequences this spec adds:

- MAIA is a door in every room and the centre of none.
- Every MAIA surface must state why it appeared. Unprompted presence is L1 only.
- ⛔ MAIA output about a client's private material never renders on Larry's surface, at any consent
  level.

## 6. Privacy / visibility model — INHERITED

See ADR §E and §F. **Not restated here.** The only UI consequence this spec adds is the property that
must hold on the practitioner surface:

> **Larry's view is a function only of shared material.** It must not vary with the client's private
> state — provable by rendering two fixtures that differ only in private material and diffing.

## 7. Acceptance questions — defined before implementation

1. Could Larry understand his role **without a training explanation**?
2. Could a client state, in their own words, **what Larry can and cannot see** — and be right?
3. Does the environment **strengthen** Larry's relationship, or **insert itself** between him and the
   client?
4. Does it support continuity **without becoming the owner** of the client's development?
5. Does the interface make Larry feel **replaced, or amplified**?

⭐ **Question 5 is the sharpest and is a design requirement, not messaging.** If MAIA does the
preparation, holds the reflection, and carries the continuity, **name what remains distinctly
Larry's.** If that list is thin, the design is wrong regardless of how well it performs on 1–4. The
honest answer is that judgment, timing, provocation, and relationship are his — and the environment
must visibly leave them to him rather than approximate them.

⚠️ Question 2 is judged by **belief comparison, not sentiment** — ask what the client believes is
visible and compare it to what is. A client who reports feeling comfortable while wrong about
visibility is a failure, not a pass.

## 8. Deployment gate

v1 does not go to Larry until **all** hold:

| # | Gate |
|---|---|
| G1 | The unit question (§0b) is ruled |
| G2 | Threshold ratification is ruled — or the client doorway is explicitly out of v1 |
| G3 | #899 is fixed, or Sessions and Calendar are explicitly out of v1 |
| G4 | The practitioner-view indistinguishability test exists and passes |
| G5 | Co-Lab boundary gate passes 31/31 in production |
| G6 | Acceptance questions §7 answered by someone who is **not** Larry, first |

⭐ **G6 matters:** if the environment cannot survive an internal walk, Larry's time is being spent on
our unfinished work. That is the exact failure this resequencing exists to prevent.

## 9. What v1 excludes — stated as loudly as what it includes

⛔ Messages · Resources · practitioner authored notes · commitments · group and cohort spaces ·
anything requiring the eleven deferred `coach_*` content tables. **Those are the encrypted lane.**
Building them here fails the boundary gate by construction.

**"Coherent" must not quietly become "complete."** A v1 that honestly excludes half the house and
says so is coherent. A v1 that implies the missing rooms exist is not.

## 10. ⚠️ This does not gate the baseline arrival walk

The resequencing gates **Larry's engagement**, not **all observation**.

`docs/product/walks/CLIENT_ARRIVAL_BASELINE_WALK_2026-08-03.md` steps 1–5 test **the door that
exists today**, need nothing built, and need **any operator with an invitation — not Larry.** It
remains runnable now and still supplies the evidence for G2.

⛔ Do not fold it into this gate. It is the cheapest evidence available and it tests a different
object.

## 11. What this does not do

No code, no components, no schema. Does not supersede the ADR, the Inspection Report, the Experience
Design, the Larry Walk, or the acceptance walk. Does not rule the unit question, the threshold, or
the constitution referent. **Not an implementation authorization.**
