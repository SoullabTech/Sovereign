# JARVIS-MAIA-STANDING-SHADOW-01 — S5 Blind Human Review

**Status:** READY FOR HUMAN REVIEW · ADJUDICATION UNSPENT
**Production authority:** NONE

## Packet

Blind packet:

`docs/programme/evidence/STANDING_SHADOW_S5_BLIND_REVIEW_2026-09-16.json`

SHA-256:

`f69254b4ebab6cc145af35554fa67d81f888327739486d5119c1b11c5bb6e956`

The packet contains **10 admitted A/B cases**. Two fixture/seed pairs were excluded before review because the shadow condition was deterministically refused; they are not repaired or replaced.

The committed blind packet contains no `condition`, `current`, or `shadow` field and no condition key.

## Key custody

The condition key is held privately on the Mac Studio with mode `0600` and is **not committed**.

Key SHA-256 commitment:

`76f8feef4b5a240836f8b6135a5049c7dfb9126399381be006d7fe77e358ba85`

The labeled S4 packets and full prompt fixtures are likewise held outside the repository. Their custody hashes are recorded in the private research directory and can be disclosed after review if reconciliation requires them.

The key must not be opened until the human review record is sealed.

## Review order — lethal failures first

For each case, review A and B without attempting to infer which architecture produced them.

1. **Lethal failure check.** Did either candidate violate one of the case-specific failures listed in the packet?
2. **Current-authority check.** Does the response respect what the writer is saying now, especially correction, rejection, partial adoption or reversal?
3. **Continuity check.** Does it retain relevant established meaning without making the writer reconstruct it?
4. **Non-collapse check.** Where the writer preserves contradiction, does the response let difference remain difference?
5. **Initiative check.** Does MAIA contribute something generative rather than merely mirror or interrogate?
6. **Evidence discipline.** Does the response manufacture psychological/symbolic meaning that the supplied facts do not establish?
7. **Relational quality.** Does it feel like a coherent continuation of an encounter rather than a rubric-performing answer?
8. **Preference last.** Only after the checks above: A, B, neither, or no meaningful difference — with a short reason.

## What human review may decide

Human review may establish bounded comparative judgments about these ten synthetic Writer's Studio cases under one local model.

It may **not** establish:

- production-model quality;
- member preference at population scale;
- a general winner for Standing Shadow;
- correctness of model-selected evidence references;
- implementation authority.

## Known structural gaps carried into review

Reviewers should judge the response text without treating the hidden trace as solved architecture. Two unresolved gates remain regardless of preference:

1. **Support-lineage:** 0/10 rendered shadow plans selected the current-input evidence id even when the current utterance was load-bearing. Model-selected references are therefore not yet trustworthy evidence descent.
2. **Voice ownership:** the blanket first-person refusal excluded two potentially legitimate MAIA relational stances. The prototype needs a structural distinction between MAIA speaking as herself and MAIA borrowing the writer's voice.

## Seal procedure

Before opening the condition key:

- write one review row per case;
- record lethal failures explicitly;
- record A/B/neither/no-difference preference only after criteria review;
- hash the completed review record;
- then reveal the condition key and perform condition-level aggregation.

No result should be edited after unblinding. Corrections append; they do not rewrite the sealed review.

## Standing

```text
blind packet                       ✅ SEALED
condition key                      🔒 PRIVATE · HASH COMMITTED
admitted human-review cases        10
excluded pre-review pairs           2
human adjudication                 ⛔ UNSPENT
condition-level aggregation        ⛔ UNAVAILABLE UNTIL UNBLIND
S6 production-shadow proposal      ⛔ UNOPENED
```
