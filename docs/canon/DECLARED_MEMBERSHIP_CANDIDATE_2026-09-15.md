# Declared Membership — Sovereignty Invariant CANDIDATE

**Status:** ⛔ **CANDIDATE — NOT RATIFIED.** Recorded 2026-09-15 by founder
instruction during `SOURCE-CUSTODY-PII-01`, explicitly *not* folded into that
lane. Ratification requires its own act.

**Provenance:** surfaced empirically across four independent failures in a
single session. It was not designed and then illustrated; it was extracted
after the fourth instance of the same shape.

---

## The candidate invariant

> **Membership must be declared and mechanically checked; it may never be
> inherited solely from location, container, naming, or access mode.**

The deeper principle: **containers do not confer standing. Standing comes from
explicit admission under a rule.**

---

## The four proofs

Each was a container trusted for what it was *called* rather than for what it
actually *admits*.

| Container | Assumed to mean | Actually meant |
|---|---|---|
| a git **worktree** | disclosure-bounded | checks out the same tracked revision, PII included |
| **`--sandbox read-only`** | privacy-bounded | bounds *writes*; reads the whole working directory |
| a **source directory** (`data/ain/source/`) | knowledge-authorized | ingested by recursive walk, no classification, no exclusion |
| **removal from HEAD** | removed | reachable from ~1,430 branches, ~78 tags, every existing clone |

⭐ The fourth is the one that generalizes the law past filesystems: *removal*
is also a membership claim, and it inherited its authority from an operation's
name rather than from a checked rule about where the object still exists.

---

## What the invariant demands of a design

1. **Declaration.** Membership is stated somewhere a person can read and review.
2. **Mechanical check.** The declaration is enforced by code, not convention.
3. **Default exclusion.** Absence of a declaration means *out*, never *probably
   fine*. A guard whose default is admission is the defect wearing a manifest.
4. **Detectors are defence in depth.** A content scanner catches a *wrong
   declaration*; it is never itself the boundary. Every detector has false
   negatives — this lane watched two produce false confidence in one session.
5. **The name is not the rule.** "worktree", "read-only", "source", "deleted"
   are labels. Ask what the thing admits.

---

## Design test

> *What does this container actually admit, and where is that written down and
> checked?*

If the answer is "everything that happens to be inside it", the boundary does
not exist yet — whatever it is called.

---

## Existing implementation

`lib/corpus/admission.ts` + `data/ain/corpus-admission.json` are the first
implementation of this candidate, guarded by
`lib/corpus/__tests__/admission.test.ts` (T6 is the mutant: a default-admit
implementation must fail the suite).

⛔ That one implementation does not ratify the invariant, and the invariant does
not retroactively authorize anything built before it.

---

## Open questions for the ratification act

- Does this belong as a numbered Sovereignty Invariant, or as its own canon
  document with the Invariants citing it?
- What is the relationship to **Interface Humility** and to the
  **Constitutional Direction of Authority**? All three constrain how authority
  is acquired; this one constrains how *membership* is.
- Should it carry an enforcement obligation — that any new container-shaped
  boundary ships with a declaration and a mutant-tested guard — or remain a
  design test?
- Does it govern agent context admission (the Sovereign Agent Boundary), or is
  that a separate invariant that happens to share this shape?
