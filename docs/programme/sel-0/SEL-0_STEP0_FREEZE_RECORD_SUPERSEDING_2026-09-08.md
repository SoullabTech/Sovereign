# SEL-0 Step 0 — superseding freeze record · blind-safety repair

**Supersedes**: `SEL-0_STEP0_FREEZE_RECORD_2026-09-08.md`, which is left unaltered.
**Before-state**: `1fef99995` — durable, but **reason-conformance FAILED**. Preserved as
provenance; not amended, not rewritten.

Founder ruling, 2026-09-08: `1fef99995` is not the authoritative blind-safe freeze.
A representation-only repair was authorized.

---

## What changed

Exactly two founder-readable fields, 7 items each:

```text
SEL-0_MANIFEST_A_SOURCE.json   exclusion_reason   7/7 replaced
SEL-0_EXCLUDED_SET.json        f7_reason          7/7 replaced
```

Each now carries the eligibility verdict and the canonical rule-clause citation only:
`INELIGIBLE_F7 · E1 §3.2`.

**The repair was extractive, not adjudicative.** Every one of the 14 prose fields already
embedded the clause token `E1 §3.2` — a single distinct clause across all of them. The
citation was retained and the surrounding description removed. No verdict was re-derived,
no observation re-read, no adjudication re-run.

## What did not change

```text
production                  not read
F-7 adjudication            not re-run
eligibility verdicts        unchanged (ELIGIBLE | INELIGIBLE_F7)
candidate identity          unchanged
lawful N                    19
|excluded|                  7
Manifest B / C / snapshot   byte-identical to 1fef99995
```

## Conformance after repair

```text
Manifest A exclusion_reason   7/7 rule-clause-only   PASS
Excluded-set f7_reason        7/7 rule-clause-only   PASS
```

Test is structural — a pattern over the whole field value, not a vocabulary allowlist.

## Identity re-verified

```text
A items 26 · B 19 · C 19 · excluded 7      19 + 7 = 26
A-flagged excluded == excluded-set ids     true
```

## Retained deliberately — flagged for founder ruling

`SEL-0_EXCLUDED_SET.json` keeps its top-level `rule` field, the canonical statement of
E1 §3.2. It is doctrine, not stimulus-derived, and it is what makes the excluded set
auditable. It does imply a general property of the seven, but any clause citation does
that; the ruling permits the citation. Removable by a further founder act if that
implication is judged too much.

## Standing

```text
threshold                UNSET
founder ranking          NOT STARTED
MAIA ranking             NOT STARTED
stimulus exposed         NO
Outcome                  B  (lawful N = 19 < floor 40; top-k does not run)
```

### Browse boundary

```text
SAFE TO OPEN    Manifest A · excluded set · freeze records
DO NOT OPEN     Manifest B (until the authorized ranking step)
                Manifest C · source snapshot
```

The blind is now held partly by artifact design and partly by discipline: B, C and the
snapshot contain the stimulus by necessity, since freezing a stimulus means storing it.
