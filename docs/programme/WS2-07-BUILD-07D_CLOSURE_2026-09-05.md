# WS2-07 · BUILD-07D — DEVELOP SURFACE · closure record

> **BUILD-07D is CLOSED / ACCEPTED (founder act, 2026-09-05), bound to the production runtime
> `5c57e27f0`. This record changes no runtime bytes. It closes one unit and opens nothing.**

```text
UNIT               BUILD-07D  DEVELOP SURFACE
STATE              CLOSED / ACCEPTED
BOUND RUNTIME      5c57e27f0   LIVE on minisforum, dual provenance verified
CLOSING ACT        founder, 2026-09-05
```

## 0 · What this record supersedes, and what it does not touch

`WS2-07-BUILD-07D_DEVELOP_WITNESS_2026-09-04.md` §4 recorded **NOT CLOSED**. That record is
**left exactly as written**. It was true of the runtime it witnessed, and the lane's rule is that
evidence belongs to the runtime that produced it — a witness is never back-edited into agreement
with a later outcome. This document supersedes its *closure state* only, and says below what
changed between the two.

## 1 · What unblocked the 07D closure

07D's closure was blocked on `WS2-07C-F1` — the classifier `unclassifiable` finding — not on
anything 07D owned. That chain resolved in its own acts:

```text
WS2-07-F1_SEMANTIC_BOUNDARY_REPAIR_2026-09-04    determination (C); the eight phenomena
                                                 given ratified is / isNot definitions
reading contract v2                              DEVELOPMENTAL-READING-CONTRACT-02:
                                                 `phenomenon` becomes OPTIONAL on an
                                                 observation; omission is the only
                                                 representation of "no taxonomy claim"
founder ruling                                   `unclassifiable` is a REFUSAL CONDITION,
                                                 never a ninth phenomenon
WS2-07-BUILD-07D_NATURAL_DECLINE_2026-09-05      the first formally recorded natural decline
                                                 on the accepted lineage — the observation was
                                                 KEPT whole, evidenced, limited and unlabelled
WS2-07-BUILD-07D_LENS_DIFFERENTIATION_2026-09-05 two lenses over one Work returned
                                                 non-overlapping attention (supporting
                                                 evidence for the seven-lens design; closes
                                                 no gate on its own)
```

The load-bearing correction: **observation has ontological priority over classification.** The
taxonomy may describe a developmental observation; it may neither manufacture one nor veto one.
That is why a decline stopped being a blocker and became a recorded, acceptable outcome.

## 2 · The evidence chain to the bound runtime

Each SHA carries its own witness. None inherits another's.

```text
61ec49b48   WS2 Write ⇄ Develop private-beta candidate — FROZEN, never modified
            Reader-04 · deterministic contract gates PASS · live Gate 7 PASS
              (docs/programme/WS2-WRITE-DEVELOP_PRIVATE_BETA_CANDIDATE_2026-09-05.md)

de0f35434   first promotion (PR #1209)
            provenance PASS · Co-Lab 33 / 0 / 0
            Gate 3 item 1 FAIL — two defects established, never collapsed:
              F1  onMeta contract emitted no `words`; the consumer read
                  draftMeta.words.toLocaleString() → TypeError
              R1-cause  canvas identity seeded once from window.location.search,
                        so the section param trailed the navigation and required
                        a cold reload

ba00815f5   R2 — restore `words` across the onMeta contract, at the producers
dc742fe43   R1 — take canvas identity from route state (useSearchParams), and latch it
            PR #1211 · 8 / 8 protected checks green · merged

5c57e27f0   promotion SHA — LIVE
            provenance PASS (image GIT_COMMIT == container printenv == Config.Env == 5c57e27f0)
            Co-Lab 33 / 0 / 0
```

**The repairs carry positive witnesses, not absence-of-error witnesses.** R1 is confirmed by the
`&s=` section param appearing on the *first* navigation, where it had previously appeared only
after a cold reload. R2 is confirmed by `62,998 words` rendering in the orientation line of the
185-section continuous manuscript — the exact expression that previously threw. A value printing
is proof the datum was restored at the producers; it is not the same claim as an error no longer
appearing, which a consumer-side guard would also have produced.

## 3 · The production smoke, as adjudicated

```text
PRODUCTION       5c57e27f0  LIVE
PROVENANCE       PASS
CO-LAB           PASS · 33 / 0 / 0

GATE 3
1 WRITE          PASS      (retaken from the beginning after the repair)
2 KEEP VERSION   PASS      precondition edit present · versions 2 → 3, exactly +1 ·
                           staged edit survived navigation/exit flush · body otherwise unchanged
3 DEVELOP        PASS
4 DIRECT &r=     PASS
5 SIGNED-OUT &r= PASS
6 COMPACT WIDTH  PASS

F1 REGRESSION    PASS      negative witness taken on /writers-studio/canvas?m=dca75052…
                           0 console errors; one unrelated forced-reflow warning
READER-04        PASS      (inherited from the candidate record, not re-run here)
```

Item 2 supports the stronger claim, and it is stated as the stronger claim: the checkpoint
**preserved** manuscript state rather than altering it, and the staged edit survived the exit
flush. The fixture stands at **versions kept = 3** and is not to be exercised again — a second
Keep would move it to 4 and add no evidence to an already-complete witness.

## 4 · Closure

```text
GATE A           PASS · STRUCTURALLY PROVED           (07D witness, 2026-09-04)
GATE B           UNBLOCKED by the WS2-07C-F1 chain above, then carried by the
                 production walk at 5c57e27f0 rather than re-run in isolation
SMOKE            PASS · six items · live member path
CLOSURE          BUILD-07D DEVELOP SURFACE — CLOSED / ACCEPTED (founder, 2026-09-05)
BOUND RUNTIME    5c57e27f0
```

**Stage 7.1 (BUILD-07A–07D) is complete on the bound runtime.**

## 5 · Scope of the claim — what this closure does NOT establish

```text
no claim that MAIA's readings are good — 07D showed what she noticed; the quality of the
   noticing is 07B's and 07C's question
no interpretation · no dialogue · no decisions · no revision path — the surface still ends
   where the writer's own judgment begins
no private-beta launch threshold. Tester invites are no longer blocked BY THIS SMOKE. The
   programme-level private beta is earned when Stage 7 is DONE / PROVED and Stage 8 is
   CLOSED / ACCEPTED. These are different thresholds and are not to be merged.
no re-opening of anything parked. A green gate is not an authorisation to pull in parked units.
```

BUILD-07E is **not** opened by this closure. It opens only by its own founder act — recorded
separately in `WS2-07-BUILD-07E_DIALOGUE_BOUNDARY_CENSUS_2026-09-05.md`.
