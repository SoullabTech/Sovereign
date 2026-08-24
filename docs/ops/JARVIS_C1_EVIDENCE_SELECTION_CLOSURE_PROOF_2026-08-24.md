# JARVIS — C1 Evidence Selection Closure Proof

**Date:** 2026-08-24 · **Mode:** WITNESS → FALSIFY → REPAIR → RE-WITNESS → RECORD → STOP
**Commit under test:** `b2bb14241`
**Workspace:** `/Users/soullab/jarvis-c1` (detached, clean)
**Witness type:** JARVIS Desktop, **dev / unpackaged** — title `JARVIS — dev (unpackaged)`, binding by dev-walk

> A dev process reports `app_build_sha: null` before touching the filesystem, so this
> witness cannot have been served by a packaged build or a stale stamp.

---

## §1 — VERDICT

```
PROPOSITION WITNESSED:
  A C1 task that asks JARVIS to inspect its bound repository receives real,
  bounded implementation evidence from that repository, and an answer citing
  it can be certified.

RESULT:  ✅ WITNESSED

REFUSAL PROPERTY:
  A citation that does not resolve to materialized source cannot be certified.
  Verified by controls 8, 9 and 24; NOT LIVE-WITNESSED in this run (see §5).

C1 wiring                 PASS   witnessed
Materialization           PASS   witnessed
Evidence selection        PASS   witnessed
Verifier path identity    PASS   acceptance leg witnessed

C1 ACCEPTANCE:  CLOSED
```

---

## §2 — Falsified assumptions

Both were falsified by live witness, not by review. Each had passing tests behind it
at the time it failed.

**1. Proof artifacts were safe as secondary evidence.**
The first repair ordered implementation ahead of proof artifacts and allowed proofs to
fill remaining slots. Witnessed at `0da9cfa`: the worker was handed the implementation
first and the proof last, and answered from the proof. Anything placed in the packet is
authorized source as far as the worker is concerned, and a proof reads as an
authoritative statement *about* the subject — which is what a worker seeking an answer
prefers. Ordering was the wrong shape of fix, not the wrong weight.

**2. Basename equality was sufficient path identity.**
Containment accepted a citation when `basename(cited) === basename(materialized)`,
ignoring the directory. Witnessed at `0da9cfa`: a citation under `scripts/` was
certified `1/1 contained` against a fragment materialized from `jarvis-desktop/test/`.
A fabricated directory with a real filename read as VERIFIED.

---

## §3 — Repairs

- **Implementation questions exclude proof/test/evaluation artifacts** from the packet
  when implementation evidence qualifies. Proofs remain eligible when the author asks
  about a proof, and when nothing else matched. Exclusion, not ranking.
- **Containment requires real materialized source-path identity.** The basename clause
  is removed and the verifier index no longer carries a basename to match on. Remaining
  forms are segment-anchored: a citation may omit leading directories or carry extra
  ones, but every segment it states must align with the materialized path.

---

## §4 — Live witness

Prompt: the signup-implementation inspection task (unchanged across all three runs).

```
Execution verified    PASS
Result correctness    VERIFIED
Correctness basis     14/14 citations contained in materialized evidence
```

- **14/14** citations, **all** into `app/api/members/email-code/route.ts`
- all cited ranges inside the single derived fragment, lines **116–195**
- **no proof artifact** in the packet
- **no fabricated Java path** in the answer

**Independent semantic check.** Each cited range was read against the file and supports
the claim made about it: member lookup, the removal of the allowlist/waitlist pathway,
code and token generation, invalidation of outstanding codes, insertion into
`magic_link_tokens`, the send, and the send-failure path. This check was performed
separately from the run. VERIFIED establishes containment; it does not establish truth,
and the two are recorded as distinct facts.

---

## §5 — Explicit gap

```
Acceptance 5 — the refusal path (unsupported claims remain UNVERIFIED)
NOT LIVE-WITNESSED
```

The worker made no unsupported claim in this run, so nothing exercised refusal. That leg
rests on controls 8, 9 and 24 in `jarvis-desktop/test/c1-derived-evidence.test.mjs`
alone. **It must not be described as witnessed.**

---

## §6 — Post-witness state

**No mechanism changes were made after the passing witness.** `b2bb14241` is the commit
that was witnessed and the commit that stands.

---

## §7 — Out of scope / unchanged

Separate lanes, untouched by this closure and not covered by it: the held beta sign-in
incident; the Desktop result-surface legibility gap; the three pre-existing
`jarvis-alpha-floor-proof` failures; the stale `maia-route-edge-witness` work claim.
