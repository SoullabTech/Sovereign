# JARVIS-KP-01 · I2 — LETHALITY MATRIX

**Date:** 2026-09-20
**Instrument:** in-place mutate-and-restore, one mutation at a time, full suite run per mutation
**Module restored afterwards and verified byte-identical by `diff -r`**

> A falsifier that cannot kill a wrong implementation is decoration.

Each mutation is the smallest edit that defeats exactly one named law. A mutation is **KILLED** when at least one test
fails against it, **SURVIVED** when the whole suite still passes — which means the law it defeats is not enforced by
any falsifier.

**RESULT: 34/34 KILLED · 0 SURVIVED.**

| # | Mutation | Verdict | Failing tests |
|---|---|---|---|
| M01 | no_warrant_offered never fires | KILLED | 3 |
| M02 | reference treated as reliance | KILLED | 1 |
| M03 | undeclared reliance tolerated | KILLED | 1 |
| M04 | accumulation permitted | KILLED | 1 |
| M05 | jurisdiction transfer silent | KILLED | 2 |
| M06 | member authority unbounded | KILLED | 4 |
| M07 | agent role may adopt | KILLED | 1 |
| M08 | claimed semantics uncapped | KILLED | 2 |
| M09 | warrant class cannot cap declaration | KILLED | 1 |
| M10 | boundaries may be dropped | KILLED | 1 |
| M11 | reference boundary wrongly inherited | KILLED | 1 |
| M12 | composite non-method accepted | KILLED | 2 |
| M13 | pseudo-independence accepted | KILLED | 1 |
| M14 | unresolved dependence accepted | KILLED | 1 |
| M15 | composite circularity allowed | KILLED | 1 |
| M16 | composite method-semantic escalation | KILLED | 2 |
| M17 | composite support provenance unchecked | KILLED | 1 |
| M18 | support set passes as composite | KILLED | 1 |
| M19 | branched standing chain tolerated | KILLED | 1 |
| M20 | orphan standing act ignored | KILLED | 1 |
| M21 | standing act mints its own authority | KILLED | 7 |
| M22 | discharge blocked (corrigibility removed) | KILLED | 1 |
| M23 | terminal standing re-elevable | KILLED | 1 |
| M24 | hypothesis erased instead of retained | KILLED | 3 |
| M25 | agent may impersonate human authorship | KILLED | 2 |
| M26 | MEMBER_CONFIRMED without adoption act | KILLED | 1 |
| M27 | join provenance may be absent | KILLED | 1 |
| M28 | adoption provenance loss tolerated | KILLED | 1 |
| M29 | foreign member may adopt | KILLED | 1 |
| M30 | operation stage ceiling ignored | KILLED | 2 |
| M31 | warrant liveness ignored | KILLED | 1 |
| M32 | uncertainty does not narrow standing | KILLED | 1 |
| M33 | endpoint-to-edge transfer unnamed | KILLED | 1 |
| M34 | unknown adopted component invented | KILLED | 1 |

---

## What the first run found

The matrix is recorded because it did not merely confirm the suite; it corrected it.

**Run 1 — two mutations were not killed:**

- **`M25` agent may impersonate human authorship — SURVIVED.** A JARVIS-introduced relation presenting itself as
  `MEMBER_AUTHORED` passed the entire suite. ACT 11 INV-03 (join authorship integrity), INV-11 (human authority
  integrity), and ACT 11 falsifiers 5 and 6 all require that refusal; no test exercised it. Four tests were added under
  `INV-03 / INV-11`, including the lawful case — `MEMBER_CONFIRMED` admitted once a real adoption act exists — so the
  new tests cannot be satisfied by refusing everything.
- **`M20` orphan standing act ignored — SURVIVED, then survived its own first test.** The added test threw
  `cross_subject_supersession` from an earlier guard, so it passed without reaching the orphan check at all. Replaced
  with a rootless mutually-superseding pair — the only shape that reaches it. *A test that passes before reaching the
  code it names is a false witness, and only the mutation exposed it.*

**Also on run 1 — one instrument defect, reported as its own class rather than scored as coverage:** a mutation anchor
carried the wrong indentation and reported `ANCHOR_MISSING`. Had the harness collapsed that into `SURVIVED` or
`KILLED`, an unexercised law would have been recorded as tested. The class exists so an instrument failure cannot
impersonate a result.

**Run 2** — after the authorship tests landed: 33/34, `M20` still surviving.
**Run 3** — after retargeting the orphan test: **34/34**.

---

## Limitation

This ran by mutating real source in place and restoring from a scratchpad copy. The restore was verified
(`diff -r` clean, typecheck EXIT 0, 100 tests passing), but the instrument is **session evidence, not a committed,
independently re-runnable instrument.**

A committed lethality instrument in the S3 B-ii/B-iii style — disposable wrong-implementation candidates rather than
mutation of tracked files — is **owed if the Founder wants this claim re-runnable on demand.** It is deliberately not
built here: a committed script that rewrites `lib/` files is a hazard, and the S3 precedent already established that
disposable candidates are the safer form.
