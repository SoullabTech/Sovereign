# Relational Field design inquiry — provenance and standing

## ⛔ NON-AUTHORITATIVE EVIDENCE

Nothing in this directory is governing authority. It is preserved because the founder
rulings of 2026-08-13 were issued in response to it, and a ruling whose evidence has
been discarded cannot be re-examined.

## What this is

Eleven parallel invocations (JRF-01 … JRF-07, and a five-voice Elemental Council),
each blind to the others, run 2026-08-13 as bounded design research. Each read
`00-INVOCATION-BRIEF.md` before working and wrote exactly one findings file. No code,
schema, migration, or pull request was created or modified at any point.

`JRF-08-CORPUS-CALLOSUM-SYNTHESIS.md` is the synthesis. It preserves contradiction
rather than resolving it, and it remains **PROPOSED — NOT RATIFIED**.

## ⚠️ The known defect in this evidence — read before citing any finding

**The inquiry ran against the wrong referent.** It searched `d41b8b355`
(`feature/labtools-redesign`, 2026-08-11) while production was `22200f967`
(2026-08-13). The branch predates the rupture containment by two days.

The most serious consequence: JRF-02 and JRF-01 independently reported that
`DECLARATION_CAPABLE_SOURCES` **exists only in documents**, by four searches with a
working control. That finding is **wrong about production**. The constant exists at
`22200f967:lib/relationships/relationshipSignalService.ts:169`, empty by intent and
fail-closed, gating `ruptureState` at write (`:178`) and at read (`:285`).

⭐ **Corroboration across independent agents did not save the finding, because every
agent searched the same wrong tree.** Agreement is not a referent.

`JRF-08A-EXACT-REFERENT-RECONCILIATION.md` re-tests every code claim by ref-bound read
against the exact production SHA. **Read JRF-08A before relying on anything in
JRF-08.** Where the two differ, JRF-08A governs.

## Standing of each claim class

| Class | Standing |
|---|---|
| Code claims re-tested at `22200f967` in JRF-08A | established as **source facts at that SHA** |
| Code claims in JRF-08 not re-tested | ⛔ **wrong-referent until reconciled** |
| Runtime behaviour (reachability, whether a path fires) | ⛔ **NOT ESTABLISHED** — no runtime witness was taken |
| All production row counts | ⛔ **NOT ESTABLISHED** — no database access was exercised |
| Design reasoning, dissent, elemental readings | opinion offered to the founder; never fact |

## Errors recorded rather than tidied

- The steward named refusals **R23/R24** in the JRF-04 invocation prompt. **They do not
  exist.** The register runs R01–R22.
- **JRF-05/Air** derived a clean structural defect from a stale local ref, caught it,
  and retracted it. The retraction is preserved deliberately — an impeccable
  distinction referring to nothing is the failure mode this programme exists to catch.
- The steward re-encountered the same artifact during reconciliation
  (`git diff 22200f967..d41b8b355` renders the containment as 295 deleted lines, which
  is a newer-to-older diff artifact and **not** a deletion by the branch) and recorded
  the correct reading.

## Dissent is preserved by design

The five elemental voices were each instructed that their partiality was the point and
that they must not balance themselves. Where they disagree with A1/A2 or with each
other, that disagreement stands unreconciled. ⛔ Do not read convergence between two
invocations as confirmation: several converged by asking *different* questions, and
that is recorded as two findings, not one.
