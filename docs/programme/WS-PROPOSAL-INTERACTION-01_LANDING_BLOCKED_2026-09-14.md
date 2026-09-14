# WS-PROPOSAL-INTERACTION-01 — LANDING NOT PERFORMED

**Date:** 2026-09-14 · **Authorized:** cherry-pick `d519c838b7` → `claude/s3-implementation`
**Performed:** ⛔ **NOTHING.** The authorization's premise no longer holds.

---

## The premise that changed

The landing was authorized against a lane at `dd7059b4` with this defect unrepaired.
**The lane has moved five commits and already carries an equivalent repair**, authored
**30 minutes before** `d519c838b7`:

```
0bd2b65789  witness(studio): capture runtime custody as a command, not by hand
8eff36fb12  docs(studio): ruling B in its ratified form, and the custody qualification
26dfcf2034  test(studio): WS-PROPOSAL-INTERACTION-01 acceptance is behavioural
b9744cced4  docs(studio): naming ruling — proposal and authorization are different objects
07741b9918  fix(studio): Show change returns the writer every time they ask   ← 01:34:11Z
                                                          (d519c838b7 was 02:0x)
```

⛔ **A cherry-pick was dry-run and CONFLICTS** in `canvas/page.tsx`. Landing it would
mean hand-resolving two independent repairs of one defect into one file — the worst
possible way to acquire either.

---

## The two repairs, compared honestly

Both separate the same two authorities and both reject a flag for a count. `07741b9918`
is **the better of the two**, and in two respects mine is **weaker**:

| | `07741b9918` (lane) | `d519c838b7` (mine) |
|---|---|---|
| Shape | two effects · `revealToken` nonce | one token `locus#request` |
| Prop | ⭐ **required** (`revealToken: number`) | ⛔ optional (`revealRequest?`) |
| `goToSection` when already there | ⭐ **SC-7 guards on `activeId`** | ⛔ **not addressed** |
| Falsifiers | 6 known-bad shapes · 43/43 | 1 shape · 12 tests |
| Whole view | ⛔ **not covered** | ⭐ **covered** |

⭐ **Their required prop is the stronger call, for the reason their own message gives**:
`FieldBody` has two call sites and the second passes no `renderSectionOverlay` at all,
so an optional prop would let a whole layout lose voluntary return silently. **Mine
made it optional.**

⛔ **And SC-7 is a defect mine does not fix**: `goToSection` on the section the writer
is already in runs the capture seam — *their own prose written back because they asked
to LOOK at something.*

---

## ⭐ The one thing that is additive: Whole view is still open

At the lane tip, `revealToken` is threaded to `renderProposalWork` (Section view,
`page.tsx:1572`) and **not** to `renderProposalEvidence` (Whole view, `page.tsx:1553`).
`ProposalEvidenceInWork` takes no token and calls no reveal:

```ts
export function ProposalEvidenceInWork(
  { body, range, replacementText, onWorkWithChange }: { … }   // ⛔ no reveal, no token
```

⛔ **So in Whole view `Show change` cannot reach the locus even once** — only the
section shell scroll, which is the original defect in the view that was never repaired.

⚠️ **The founder's runtime walk predicts this**: *"repeat in Whole view"* should
**FAIL at the lane tip**, in exactly the way Section view no longer does. That is a
falsifiable prediction and the cheapest next evidence available.

---

## Recommendation

1. ⛔ **Abandon `d519c838b7` as a landing candidate.** Redundant, conflicting, and
   weaker in two respects. Nothing is lost: `07741b9918` already holds the law.
2. ⭐ **Carry ONE finding forward** — Whole view has no locus reveal — as a small
   follow-up **on the lane, in the lane's own shape** (`revealToken`, required,
   threaded to `renderProposalEvidence`), with its own behavioural obligation.
   ⛔ Not as my commit, and not as a second design.
3. **Run the runtime walk on the lane tip.** If Whole view fails as predicted, (2) is
   confirmed from the pixels rather than from a reading of the wiring.

⛔ **Not authorized here:** proposal editing · successor schema · migration
reconciliation · execution-authority redesign · ACCEPT · `WS-PROPOSAL-AUTHORSHIP-01`.

---

## Governance note, accepted

⛔ **No no-regression acceptance amendment is imported from BCS-01A, and none is
implied.** The identical-40 baseline in `d519c838b7` says one thing only: *that change
added zero regressions.* It does **not** make `npm run test` globally green and does
**not** establish a programme-wide baseline policy. The 40-suite debt is unchanged,
unowned by this lane, and remains debt.

> *Two sessions repaired one defect within half an hour. The lane's repair is better.
> The right outcome is not to land mine beside it — it is to take the one thing mine
> saw that theirs did not, in their shape.*
