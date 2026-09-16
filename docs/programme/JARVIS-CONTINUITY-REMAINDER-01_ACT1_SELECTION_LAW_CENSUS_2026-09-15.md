# JARVIS-CONTINUITY-REMAINDER-01 · ACT 1 · Selection-law census

**Date:** 2026-09-15
**Base:** `e41e4137e` · prior continuity lane durable tip
**Production:** `e57ca1baa` · unchanged
**Authority:** founder handoff to ChatGPT after closure of C1-BRIDGE-02.
**Scope:** read-only architecture/evidence census. No behavioral code, tests, deployment, repair, or `S` act.

## 1. Question

Why did frozen P1 recover member plant `22`, while production W1 recovered `[5,15,27] via 38` under another ordinary opaque formulation?

The prior failure record correctly left three possibilities undetermined: probe sensitivity, live-selection defect, or oracle-fidelity gap. ACT 1 inspected those rather than assuming one.

## 2. Finding A — HOP 1 is exact-token fragile

`recoverViaBridge` admits a recent prefix exchange only when its **member message** shares an exact token with the current probe.

Frozen P1 probe tokens include `remember · phrase · shared · eralier`. Prefix `39` contains `remember` plus the member's marker tokens, so the lawful path is admitted:

`probe →[remember]→ 39 →[marker tokens]→ 22`.

Production W1 was `what was that phrase I mentioned earlier?`; after the bridge tokenizer its identifying tokens are `phrase · mentioned · earlier`. Prefix `39` contains none of those. The lawful path to `22` is therefore **not a candidate path at all** under W1.
## 3. Finding B — the implementation has no path-selection law

For every admitted prefix hop, HOP 2 creates displaced candidates from tokens added by that hop. Candidates from all hops are then pooled in one map.

The final ordering is only:

1. descending count of second-hop `carriedBy` tokens;
2. ascending displaced exchange index as the tie-break.

No term represents first-hop strength, hop recency, bridge continuity, target provenance, or ambiguity between competing paths. `viaPrefixIndex` is telemetry, not selection authority.

Under the W1 wording, prefix `38` is admitted through `phrase`. Its remaining member tokens link to displaced `5`, `15`, and `27`. Each carries one token. Prefix `40` can also contribute weaker one-token links, including `remember → 36`, but the final index tie-break admits the earlier `[5,15,27]` first. This exactly matches the production witness `via: [38,38,38]`.

## 4. Finding C — N1 protected edge origin, not recovered-content provenance

The bridge function never reads MAIA replies while constructing its two hops. That protection is real.

But once a displaced exchange is admitted by **any** member-carried token, `recoverForTier` hands the whole exchange to cognition, including MAIA's reply. In W1, displaced `27` was member-admissible through an unrelated carrier from prefix `38`, while the marker itself existed only in MAIA's response at `27`.

So the production failure did not violate N1's narrow edge-origin rule. It exposed a different boundary: **a member-grounded edge can still admit an exchange whose answer-relevant content is assistant-carried.**
## 5. Finding D — the frozen composition oracle is not production-identical

`c1-bridge-composition.ts` fixes `APERTURE = 3`. The live W1 ran CORE, whose exported `CORE_PROMPT_HISTORY_APERTURE` is `4`.

For frozen P1, adding index `37` to the active prefix does not create a probe link, so this mismatch does **not** explain the observed W1 failure. The probe divergence does. But the aperture mismatch means the old composition oracle must not be treated as an exact reproduction of CORE production composition.

## 6. ACT 1 disposition

The production failure is now mechanically explained without changing runtime behavior:

`different opaque wording → exact-token HOP 1 excludes prefix 39 → prefix 38 remains admissible → second-hop-only ranking + index tie-break → [5,15,27] → full exchange 27 exposes assistant-carried marker`.

This narrows ACT 2. The next architectural question is not merely “which of several bridges wins?” It is:

> **What constitutes a stable member-grounded continuity relation across paraphrase, and what provenance must the recovered content itself satisfy before a bridge is admissible?**

Standing after ACT 1:

```text
selection-law census     ✅ COMPLETE
behavioral changes       ⛔ NONE
production               ✅ e57ca1baa · untouched
ACT 2 law                ⛔ NOT YET WRITTEN
W2 / W3 / S              ⛔ UNSPENT
rollback repair          ⛔ separate · unopened
first-ask opaque memory  ⛔ separate · unsolved
```
