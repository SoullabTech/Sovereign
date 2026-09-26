# O8R2 Post-F1 Pre-Cognition Description Intercept Design Audit v0.1

**Scope:** design/documentation only. No production route mutation.

## Route witnesses

- active route: `app/api/sovereign/app/maia/list/route.ts`
- active route SHA-256: `3f3ba6ec7491aa627a31728b14d9677b20e0d73f340acefe214914da654491ab`
- Canon header source: `lib/sovereign/http/canonHeaders.ts`
- Canon header SHA-256: `38e3178c97286915498281d178d06621cc641cf43a1e33f7fd573618557b1d8a`

## Design outcome

- insertion point: after F1 member-turn acceptance/durability, before F2 and cognition
- pilot channel: text-only; audio requests fall through unchanged
- ABSTAIN: observationally equivalent fall-through
- DESCRIBE: session infrastructure only → exact deterministic description → conditional same-exchange assistant durability → early return
- recognized durable member: same exchangeId assistant write
- recognized durability failure: no orphan assistant write; deterministic response still returned
- Sanctuary: ephemeral, no persistence, Canon mode SANCTUARY
- guest: ephemeral, no member-attributed persistence
- assistant durability failure: log/degrade record; no model fallback
- response: minimal client-compatible shape, no fabricated provider/model/cognition fields
- Canon provenance: pipeline `direct`, source `direct`, no provider/model headers
- DESCRIBE excludes cognition, memory, retrieval, model, observer, signal, shadow, offer, and audio paths

## Artifact

- contract: `O8R2_POST_F1_PRE_COGNITION_DESCRIPTION_INTERCEPT_CONTRACT_v0.1.md`
- contract SHA-256: `8f1307cdaa57a756f236c949ac8d891ec5fc9ae417d1802672beee06c348d698`

## Runtime standing

- production O8 consumers: 0
- active route bytes unchanged
- runtime description authority: NOT GRANTED

## Next boundary

`O8R2R1 — POST-F1 PRE-COGNITION INTERCEPT SIMULATION + ROUTE-SEAM CONFORMANCE MATRIX ONLY`.