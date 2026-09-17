# F5-CONFORMANCE-REPAIR-01 · P5-C — FOUNDER AUTHORIZATION

**Date:** 2026-09-17
**Authority:** founder continuation in-session after P5-B closure
**Parent:** `134f43dca353c4ece29f60899390492dabe306aa`

## Authorized act

Implement **P5-C legacy sovereignty retirement / containment only**.

The purpose is to make the P3 ruling `RETIRE AS AUTHORITY` executable and mechanically durable:

- the legacy `/api/sovereignty/delete-my-memory` address may not execute erasure;
- the old static/mock summary may not advertise that deletion contract;
- the standalone Express deletion service may not remain as a second/fallback engine;
- the Lab Tools sovereignty page may not present an executable destructive control;
- `/api/sovereignty/*` must no longer inherit access policy accidentally from `/api/sovereign*`;
- canonical `/api/members/delete-account` remains the only eventual account-erasure authority and
  remains **fail-closed / unactivated** in this act.

## Explicitly not authorized

- no change to canonical account-deletion execution;
- no Account Settings activation or response redesign;
- no Circles/S5 execution integration;
- no registry activation;
- no migration deployment;
- no legacy-table cleanup or historical production investigation;
- no P5-D/P5-E work;
- no production mutation.

Historical records remain in Git/docs. Retirement does not require executable legacy code to remain.
