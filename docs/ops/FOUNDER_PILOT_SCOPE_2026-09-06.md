# Founder Pilot — scope direction, 2026-09-06

> **Founder direction:** *For tomorrow's Founder Pilot, DEVELOP is IN scope. MAIA must be able to
> developmentally read a whole manuscript; standing/decision acts remain OUT.*

This SUPERSEDES the earlier boundary in which DEVELOP sat outside the tester surface.

## 1 · The minimum acceptable product

```text
writer uploads / opens a real manuscript
→ WRITE is navigable
→ DEVELOP can read the WHOLE manuscript
→ MAIA returns ONE coherent developmental reading
→ author can discuss that reading
→ standing / decision controls remain unavailable
```

**Go/no-go, stated brutally:** *If MAIA cannot take the 62,933-word Elemental Alchemy manuscript,
cover all 262 sections across bounded passes, and return one coherent developmental reading, DEVELOP
is not ready.*

## 2 · Consequence the scope change forces — P0

#1244 hides the 07F standing controls in the UI **only**. Its own record says that if DEVELOP
returns to tester scope, the **server-side standing refusal must land first**.

```text
A HIDDEN BUTTON IS NOT CONTAINMENT.
```

Required, containment only:

```text
add the matching SERVER-SIDE refusal on the standing-write route whenever the
standing feature is disabled (server env authority, not a NEXT_PUBLIC_ var if that
would let a client-visible value govern server refusal)

acceptance
  standing controls absent
  direct standing POST refused
  stale client standing POST refused
  existing standing history untouched
  developmental reading + dialogue unaffected
```

⛔ Do NOT resume 07F. Do NOT repair F-CTX tonight.

**Why this is sufficient for F-CTX.** F-CTX is the hazard that a member makes a *durable standing
act* on a reading they did not intend. With standing writes refused at the server, that act cannot
occur — the hazard is contained rather than fixed, and the finding stays open.

## 3 · Tonight's order (founder)

```text
1  amend #1244 — server-side standing refusal            P0 containment
2  198bbf44 — PR / merge / deploy + issue REAL invites   admission, the first tester leg
3  minimum 07G whole-work orchestration                  the critical change
4  witness Elemental Alchemy end-to-end in DEVELOP
5  repair inert WRITE section navigation
6  #1245 Co-Lab deploy / witness
7  08B only if runway remains
```

⛔ **`ceiling_exceeded` cannot be what a tester encounters tomorrow.** The 60,000 code-point boundary
stays exactly where it is; the work is turning it from a dead end into an internal batching boundary.

⛔ **Zero pending invites after enforcement = a locked door.** Do not discover that during the cohort.

## 4 · TWO OUTSTANDING FOUNDER ACTS — flagged, not assumed

### 4.1 07G implementation is not yet authorized

The 07G Acceptance Instrument v1 is RATIFIED and F1–F26 are FILED. But the DECIDE record's own
sequence makes **opening implementation a separate dated founder act taken on the falsifier set**:

```text
2  ratification act                DONE 2026-09-06
3  falsifiers filed                DONE
4  BUILD opened by a dated act     ← NOT YET PERFORMED
```

The direction above reads as an implementation instruction, but it was addressed to the orchestration
layer as a packet. **If 07G implementation is to open, it needs the act.** One line suffices:

> *I authorize BUILD-07G implementation on the F1–F26 falsifier set.*

Recorded here rather than inferred, because inferring it would be exactly the "gates green → merge"
substitution this programme refuses.

### 4.2 Resume is recorded but not ratified

Whole-work invariant *"interruption may resume only against that same frozen revision"* is NOT among
the thirteen ratified points (07G DECIDE §12.2). A2 makes resume possible, never required. If the
minimum slice is to be accepted against a resume requirement, that requirement needs ratifying too.

## 5 · What does NOT move

```text
per-pass ceiling            60,000 code points — NOT raised, NOT bypassed
truncation                  never, silent or otherwise
chapters                    NOT required to read a Work — 07G packs contiguous ranges
08B                         NOT a prerequisite; may follow if runway remains
composition                 stays inside the ratified §5 observational boundary —
                            assembled and attributable, never a second interpretive layer
manuscript mutation         impossible from this lane
one lens                    throughout one commissioned reading
```

## 6 · Live acceptance subject

```text
manuscript   848bbd74-d1ad-41a4-bfe0-238c34763e03
draft        06b8df26-dfca-45ac-9830-4ac712ef3418
observed     262 source sections · 262 draft sections · section-addressable
             ~62,933 words · ~386,470 code points · > 6× the one-pass ceiling

witness      whole_work commission
             → planner emits N bounded passes, N > 1
             → every pass ≤ 60,000 code points
             → all 262 sections covered EXACTLY ONCE
             → one exact revision throughout
             → all passes complete
             → one whole-work developmental reading persists
             → DEVELOP displays it
             → member can open developmental dialogue from it
             → NO ceiling_exceeded dead end
```
