# Soul Portrait Studio — Stage 1 Boundary

**Status:** built · internal-only · **not deployed** (local branch `feature/soul-portrait-path-b-gate2`) · 2026-07-04
**Governs:** the DB-backed Soul Portrait foundation + practitioner ownership. Nothing client-facing.

Stage 1 makes the Soul Portrait Studio field *real as a store* without opening the
consent / client-data field. It is **adopt-and-harden** over the existing local draft
tooling (commit `55af496e8`), not a rebuild.

## In scope (built this stage)

- **`soul_portraits` is the source of truth** — the Gate 2 table (deployed) +
  `lib/soulPortrait/portraitStore.ts`.
- **Practitioner ownership** — `owner_member_id`; every read is owner-scoped.
- **Client linkage** — new nullable `subject_person_id` → `studio_people`
  (migration `20260704000001`), so a portrait can be *about* a client/friend with no
  member account. `subject_member_id` is **preserved** (orthogonal: the account link
  when one exists).
- **Owner-scoped store accessors** — `getOwnedPortrait`, `getOwnedPortraitBySlug`,
  `listOwnedPortraits`. The unscoped readers (`getPortraitById`, `getPortraitBySlug`)
  were **removed**: there is no read path that does not filter by `owner_member_id`.
  The preview route now reads via `getOwnedPortrait(id, memberId)` — scoping is in the
  store, not a per-route check.
- **Structural refusal + verifier** — cross-practitioner scoping cannot leak. Enforced
  in SQL (the store), proven by `__tests__/soul-portrait-owner-scoping.test.ts`.
  Falsifiable: drop the owner filter, or reintroduce an unscoped reader → the verifier
  fails.

## Refusal grade

The leak refusal is **Grade A** for reads: no unscoped read accessor exists; a fork
would have to hand-write raw SQL to read across owners. (It was ~Grade C — a per-route
`ownerMemberId !== memberId` check a new route could forget.)

## Explicitly OUT of scope (the boundary — not built, not shipped)

- **Generator** — remains inert, **local-only draft tooling**. Not deployed, not advanced here.
- **Delivery / client surface** — none. No public/client route, no share link, no PDF
  button, no Studio UI, no Encounter-mode surface.
- **Consent exposure** — the consent ledger (`soul_portrait_consents`) is untouched; no
  consent is recorded or read by Stage 1.
- **External member access** — none. Reads are practitioner (owner) only.

## Pending (later stages — each its own gated build)

- Two-field provenance (`authored_by` + `authority_class`) on stored portraits.
- Gate 4 consent-scoped **delivery** (a *different* accessor: viewer = subject, gated by
  the ledger — never an unscoped read).
- Populating `subject_person_id` from a Studio UI; the generate route does not set it yet.
- Applying migration `20260704000001` to a DB (local first). It guards its FK target
  (`studio_people`) and fails loudly if absent.

## Deploy posture

Local branch only. Nothing in Stage 1 is on `clean-main`. Shipping any of it requires the
**Co-Lab release gate** (`verify-constitution-colab` 31/31) — it is client-data /
practitioner surface.
