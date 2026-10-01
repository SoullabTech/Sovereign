# H1 cohort gate — browser admission witness — 2026-09-30

```text
Class: A programme · exposure admission evidence
Canonical witnessed: 3421a2096c3afcce617a394bca1ffe246171f39f (#1551 merged)
Production GIT_COMMIT observed: 3421a2096
Production H1 config observed: HOUSE_STUDIO_H1_ENABLED unset · member count 0
Standing: BROWSER WITNESS PASS · PRODUCTION EXPOSURE REMAINS CLOSED
```

## Purpose

Prove the ratified H1 law with two authenticated populations and one unauthenticated direct-entry case, without changing production configuration.

The local witness ran the exact canonical merge SHA with `HOUSE_STUDIO_H1_ENABLED=true` and exactly one existing member id in `HOUSE_STUDIO_H1_MEMBER_IDS`. A second existing member was deliberately outside the cohort.

## Admitted member

- `GET /api/house-studio/admission` returned `{ admitted: true }`.
- House `What's alive → Writing` emitted `/writers-studio?from=house&work=<owned-work-id>`.
- Following that link resolved the canonical Studio H1 arrival surface with `data-arrival="one"` for a one-manuscript Work.
- The Work id remained a pointer validated by the Studio; no member meaning or manuscript content was carried in the address.

## Ordinary authenticated member

- `GET /api/house-studio/admission` returned `{ admitted: false }`.
- House `What's alive → Writing` emitted plain `/writers-studio`.
- A hand-typed address using that member's own valid Work id — `/writers-studio?from=house&work=<owned-work-id>` — produced **zero** `[data-arrival]` surfaces and fell through to ordinary Studio Home behaviour.
- This proves the House gate is not cosmetic: the Studio side independently refuses H1 Work-context arrival for a non-admitted member.

## Unauthenticated direct entry

A fresh browser context opened `/writers-studio?from=house&work=<valid-work-id>` with no session.

- HTTP document response: `200`.
- Member-visible result: `Sign in to open your Writer’s Studio.`
- H1 arrival surfaces: `0`.
- The admission endpoint and all member-scoped Studio APIs returned `401` in the server log.

## Production state

Production was already running `3421a2096` when this witness began. Its H1 configuration remained closed: `HOUSE_STUDIO_H1_ENABLED` was unset and the configured cohort member count was `0`. No production environment value was changed during this witness.

Therefore **the code is admitted by browser evidence, while exposure is still closed operationally**. Opening a real cohort is a separate rollout act: set the production switch explicitly, list the intended member ids, restart, and then re-witness the admitted and ordinary populations on production.
