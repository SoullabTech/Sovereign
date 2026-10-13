# Ganesha–Pro Boundary G2-2 — Member-Owned Personal Field Continuity

**Status:** Isolated read-only implementation candidate; independent human review and production HOLD.
**Date:** 2026-10-12.
**Parent:** G2-1 exact `9e2ab1d8d7384dd12b95203df9e48d036b2eb082`, which follows G1 `4f9e4fc36e9323376c71e67873456f9d15044809`.
**Branch:** `feature/ganesha-pro-g2-personal-continuity-20261012`.
**Exact G2-2 commit:** record externally after a governance-checked commit.
**Law:** ADR-010 Personal Field universality; MAIA Sanctuary Economy; no paid relational depth, no practice-client authority inferred from personal identity.

## The implemented boundary

Two new read-only source files:

- `lib/ganesha/personalFieldContinuity.ts`: a fixed-size, exact-owner Personal Field continuity reader over *installed existing tables*, using `IndividualContext` from G2-1.
- `app/api/ganesha/personal-field/continuity/route.ts`: authenticated server endpoint returning a bounded snapshot with `Cache-Control: private, no-store`. An unsigned caller gets 401; database/ownership failures get 503 without leaking SQL/member content in logs.

**No schema change, no personal/practitioner row creation, no rekey or deletion, no billing or client-data mutation.** The endpoint is not wired into the current `/choose`, `/studio`, or Ganesha marketing navigation; this is a G2-2 source candidate, not a working released Personal Portal.

## Exact custody and visibility

| Store | Existing data custody | G2-2 read rule and exclusion |
| --- | --- | --- |
| `studio_decisions` | Member-owned `decision_scope='personal'`, `personal_member_id` | Exact authenticated member; `practitioner_id`, `client_id`, `team_id` all NULL; excludes professional/team Decisions |
| `process_items` | `member_id NOT NULL`, optional old `practitioner_id` | Member ID, plus either NULL practitioner or exact active `portal_type='personal'` record revalidated against member; excludes professional aliases |
| `studio_changes` | Either member ID, legacy practitioner ID, or both | No client/team; member ID and NULL practitioner, or exact member-owned active personal compatibility record with member ID matching or NULL. Contradictory non-NULL member IDs fail |
| `field_notes` | Only practitioner FK (NOT NULL; cascading on delete), optional team | Query only with one verified active personal compatibility ID. Recheck `practitioners.member_id`, `portal_type`, `status` at query time; `team_id IS NULL` |
| `field_attention` | Only practitioner FK, optional team; may cache labels for unowned Decisions/Changes | Same exact revalidated personal adapter and no team; referenced Change/Decision must itself satisfy this member's personal ownership. Cached unverified labels and orphaned references are not returned |

Each section returns at most **25** recent items with minimum required fields. The API states `access:'bounded_read_only'` and `coverage:'personal_records_with_verified_provenance_only'`. **A missing item is not evidence of deletion**: historical practice-tagged personal decisions, unknown-provenance rows, withdrawn/suspended or duplicate legacy adapters, older pages and unlinked archives remain in custody without automatic promotion.

The server response does not expose legacy practitioner IDs, professional standing, clients, service contacts, birth data or unscoped journal archives. No data are shared with a practitioner or team. Actor identity cannot be selected from URL, request body, cookie label or browser localStorage. Professional context must be independently granted.

## What the synthetic checks do and don't prove

- G2-2 targeted unit tests: 11 passing, covering no practitioner, active single personal reference, ambiguous/suspended references, data minimization and fail-closed failure behavior.
- G2-1 context/route regression: 14 passing; total 25 tests across four suites.
- Exact source SQL compiled and executed on **Docker `postgres:16-alpine`, `--network none`, `--rm`, no mounts or production credentials**. A new temporary database held entirely fictional UUIDs and content. 22 fixtures passed: A/B member separation, member-only/old-personal/Pro rows, contradictory member linkage, client/team exclusions, attention references to foreign/pro sources, verified current labels, forged legacy ID, professional identity substitution, and four in-database stale-reference denials after a Personal Studio was suspended. Synthetic container was stopped and verified absent.
- Installed production PostgreSQL **catalog only** confirmed needed table columns. No account/member/client/content rows were read. The synthetic database is simplified schema, so this is a focused SQL-predicate witness, **not** a proof of all live triggers, encryption, indexes, old-reader migration compatibility or production runtime.
- G1 prior 96 focused tests and three independently baseline-reproduced legacy test failures remain a separate record. This G2-2 work does not retroactively resolve the older failures.

## Separate local model challenge (advisory, source-verified)

Local `jarvis-qwen3-coder:65k` read exact G2-1/G2-2 source text without
member data, produced an **advisory REVISE**, and alleged that
`PERSONAL_LEGACY_ATTENTION_SQL` would disclose unverified cached labels.
That specific assertion is **not supported by source**:

- Decision references are resolved only through
  `d.decision_scope = 'personal' AND d.personal_member_id = $1` plus NULL
  practitioner/client/team scopes.
- Change references are resolved only through `PERSONAL_CHANGES_SCOPE`,
  which binds the member and exact authenticated, active personal adapter.
- The final WHERE predicate admits a referenced Decision or Change **only**
  when the corresponding owned row exists (`d.id IS NOT NULL` or
  `c.id IS NOT NULL`). Unlike the original Practitioner Studio route,
  the return CASE uses verified `d.title` or `c.title`, **not**
  `a.label` for referenced objects.
- Real PostgreSQL fictional fixtures include an A-owned attention pointing
  to B's personal Decision, an A professional Decision, and an A professional
  Change; all are excluded. Verified personal references resolve their
  **current title**, not cached text.

No independent human review has occurred. The model's general recommendation
to withhold production remains the standing human-governance disposition,
independent of its unsupported label-leak diagnosis.

## Mandatory remaining gates

1. **Independent human review** of G1, G2-1 and exact G2-2 SHA before merge or release. A local LLM opinion is advisory, not human authorization.
2. **Full Personal Field UI / API audit:** old `/api/studio/field`, `/api/studio/changes`, Field notes/attention, Decisions, Events, People and arrival selectors still use practitioner-shaped identity in some paths. Do not claim all are converted; G2-2 is a new segregated read-only corridor.
3. **G2-3 additive ownership migration:** propose `personal_member_id`/owner provenance for `field_notes` and `field_attention`, preserve old FKs and stable row IDs, prove restore/old-reader coexistence, duplicate/anomalous ID handling, and withdrawal/deletion integrity. **No migration created or applied in G2-2.**
4. **Personal → Professional transition:** add an explicitly authorized Pro context without converting/replacing the old Personal row; eliminate arbitrary `LIMIT 1` professional resolution, preserve suspended status and distinct tier/role capabilities.
5. **Market-facing Ganesha beta:** receive product/UX acceptance before surfacing content in the House or allowing editing. Do not sell free MAIA continuity or charge by changing `members.tier`.
6. **Production compatibility:** reconcile all Writer's Studio, Mail and current trunk deltas independently before any eventual cutover. Public currently runs a separate older image.

## Review request

A reviewer should read the exact commit plus `lib/auth/individualContext.ts`, verify each SQL predicate against actual installed schema *metadata*, independently challenge cross-member and Pro-vs-personal cases with synthetic fixtures, and issue **PASS/REVISE/HOLD**, including privacy and incomplete-history implications. Absence of runtime member-data proof is explicit.

**Disposition:** G2-2 source candidate with verified bounded reads, **human review pending; no release**. Production, subscriptions, live MAIA, historic Personal Studio and member data remain unchanged.
