# CRP-001 — GOVERNANCE COLLISION REGISTER (FOUNDER-FACING)

**Companion to:** `JARVIS-CRP-001-CONTINUITY-RECOVERY-PROGRAM-MANDATE.md`
**Date:** 2026-08-12
**Audience:** founder only. Do not place in an executor's context.
**Status of the program:** AUTHORED / NOT AUTHORIZED / no unit opened.

This register lists what must be ruled before CRP-001 can be launched cold.
Nothing here is a recommendation to proceed. Each item is a question whose
answer changes what the executor is permitted to do.

---

## C1 — Relationship to MRC-001 is unruled

`JARVIS-MRC-001-RETRIEVAL-MEMORY-CONTINUITY-MANDATE.md` exists at repo root
with status **RECEIVED / TRUNCATED / HELD AT §XVIII**, authorization NONE.
CRP-001 covers substantially the same territory (retrieval, memory,
continuity) and arrived complete.

Three dispositions are available; none is implied by delivery:

- **D1 — CRP-001 supersedes MRC-001.** MRC-001 is closed as superseded and its
  truncated tail is never reconstructed. Consequence: see C2.
- **D2 — CRP-001 is a separate program.** Both stand. Two mandates then claim
  overlapping surfaces and a single-owner-per-surface rule is required before
  either opens.
- **D3 — CRP-001 is held behind MRC-001.** MRC-001's missing tail (§XVIII
  onward) is supplied first, then the two are reconciled.

**Unruled.** Do not infer supersession from CRP-001 being the newer and more
complete object. The stored ruling on MRC-001 is that the missing tail *is*
the authorization boundary — a different complete document does not retire
that boundary by itself.

---

## C2 — MDR-001 R5/R3 gate names MRC-001 specifically

MDR-001 ruling **R3** states: *"Phase 4 does not open. MRC-001 must complete
from §XVIII onward first."* That gate is bound to MRC-001 by name.

If **D1** (supersession) is chosen, R3 references a retired object and MDR-001
Phase 4 becomes gated on nothing. R3 would need explicit re-ruling — either
re-pointed at CRP-001's acceptance gate (§18), or restated.

**Choosing D1 without re-ruling R3 silently unblocks MDR-001 Phase 4.** That
is the highest-consequence side effect in this register.

---

## C3 — §1 "Established MIR evidence" has no locatable sealed source

CRP-001 §1 instructs the executor to *"treat the sealed MIR result as
independent diagnostic evidence"* and then lists twelve mechanism findings.

What is on disk here: `artifacts/MIR-001-LAUNCH-PROMPT.md` only. No sealed
MIR-001 return was located in this session (a deeper filesystem sweep timed
out and was not completed — absence is **not** established, only
non-location).

The stored standing on MIR-001 is: Phase A read-only diagnosis AUTHORIZED,
Phase B remediation NOT; awaiting cold launch; the artifact is not the
authority.

Consequence if launched as written: the executor inherits twelve findings as
established fact, from a source it cannot bind. Under CRP-001's own §3 this is
**REFERENT UNBOUND** — and under §4, referent validity outranks system
classification.

**Required before launch:** bind the sealed MIR return (path + SHA), or
demote §1 from "established" to "inherited, unverified — re-derive before
dependent mutation."

This is the same failure mode the mandate was written to prevent, appearing in
the mandate's own evidence section.

---

## C4 — §5 witness vs. member-inspection boundary

§5 requires per-exchange, per-memory-record observability including provenance,
entity/relationship scope, and correlation IDs — over real member traffic
(§18, "production witness"; §13, live comparison arms).

This is close to, and may cross, the MDR-001 **R4** boundary: *minimum
necessary operational telemetry only; no generalized member inspection;*
and the standing BE-001 rule that receiving member feedback never authorizes
inspecting the member.

**Unruled:** whether the final-context witness may run on member traffic at
all, or only on founder/synthetic sessions until a separate consent surface
exists. §19 already lists "privacy/consent boundaries are implicated" as a
stop condition — as written, the executor would hit its own stop on its first
unit.

Recommend ruling this *before* launch rather than discovering it as a stop.

---

## C5 — §13/§6 benchmark arms require holding real member memory

The "full relevant context ceiling" and "no-context floor" arms require
assembling a member's memory set outside the normal path. Same boundary as C4;
distinct mechanism. Needs its own ruling on whether synthetic personae suffice
for the frozen benchmark.

---

## C6 — §15 "isolated worktree" collides with the design-canon hook

Stored finding: a shared pre-commit hook requires a script present on only one
branch, which blocks commits across branches. MDR-001 **R5** authorized
governed-worktree hook repair (prove-before-change, no product behavior
change).

If R5's repair has not landed and been proven, CRP-001 §15's per-defect
isolated-worktree loop cannot commit. **Check whether R5 is closed before
launch** — otherwise every repair unit stalls at the same place.

---

## C7 — §16 skills and the standing voice hold

§16 authorizes authoring fifteen versioned skills. Two of them
(`trace-episodic-continuity`, `production-continuity-witness`) plausibly touch
surfaces that the voice hold covers. The hold stands until the governed Alpha
walk closes.

§16's own rule — *"do not author a skill for a capability that has not yet been
recovered or designed"* — mostly handles this, but the interaction with the
voice hold is not stated in the mandate and should be stated in the launch
prompt if D1/D2 proceeds.

---

## C8 — Skill authoring is itself unbounded work

§16 says "after each mechanism is understood." Read strictly that is
fifteen skills serialized behind fifteen diagnoses, which is a much larger
program than §14's eight-step remediation sequence suggests. Worth ruling
whether skill authoring is (a) in-scope per unit, (b) a separate closing
phase, or (c) out of scope for the first pass entirely.

---

## Summary — what is needed to launch

1. Rule C1 (D1 / D2 / D3).
2. If D1: re-rule MDR-001 R3 (C2).
3. Bind or demote §1's MIR evidence (C3).
4. Rule the member-data boundary for §5/§6/§13 (C4, C5).
5. Confirm MDR-001 R5 hook repair is closed (C6).
6. State the voice-hold interaction and skill-authoring scope in the launch
   prompt (C7, C8).

Until 1–4 are ruled, CRP-001 is not launchable. It is preserved, complete, and
held.
