# JOP-04 / RB-6A — Current-Lineage Restoration

**Date:** 2026-10-01  
**Trigger:** EC1 cross-programme reconciliation  
**Accepted historical subject:** `3f25932b578732ca3068af1dd594f9ebdb68efd6`  
**Current parent:** EC1-R11 return `f05aed02813e`  
**Class:** restoration of previously accepted constitutional boundary

## Finding

The accepted RB-6A commits (`fd543df1b`, `3f25932b5`) exist in repository history but are **not ancestors of the current convergence lineage**.

Current source had regressed to:

`name ∈ CAPABILITIES → C0`

and MAIN called `route(task)` with no independent routing-eligibility fact.

No later constitutional ruling was found that superseded RB-6A. The accepted boundary had simply fallen out of lineage before later routing work entered canonical history.

## Restoration

Restored only the accepted RB-6A boundary:

- `routing-eligibility.mjs` with module-private brand;
- `route(task, routingEligibility)`;
- registration is necessary and insufficient for C0 routing;
- router refusals outrank registration;
- unregistered names remain non-C0;
- MAIN obtains `route` and `declareRoutingEligibility` from the same cache-busted router graph;
- MAIN transports the explicit routing declaration into a host-minted branded eligibility.

No effect vocabulary, execution permit, write capability, or RB-6B mechanism was added.

## Witness

- `jop04-rb6a-current-lineage-proof.mjs`: **8/8 PASS**;
- `deterministic-registry-proof.mjs`: **11/11 PASS**;
- `router-alpha-proof.mjs`: **16/16 PASS**, including:
  - registered + no eligibility → refused;
  - unbranded `{satisfied:true}` → refused;
  - oversized router refusal defeats registration;
  - unregistered remains non-C0.

The local C1 Ollama witness also passed during the router proof.

A separate legacy Desktop C0 proof contains one pre-existing unrelated failure because current UI/form source now contains literal capability examples. That file was left unchanged by this repair.

## Standing

```text
RB-6A registration→routing boundary: RESTORED
registration = routing grant:          NO
routing eligibility caller-forgeable:  NO
router refusal preempted by registry:   NO
RB-6B route→execution boundary:         STILL OPEN
RB-6 effect embargo:                    STILL ACTIVE
EC1 runtime candidate projection:       STILL BLOCKED
```

Next cross-programme act: RB-6B — restore/implement a separately constituted host execution decision for the existing harmless C0 read path before any effect-bearing capability can be considered.
