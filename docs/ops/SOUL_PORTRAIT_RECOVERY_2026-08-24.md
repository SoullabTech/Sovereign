# Soul Portrait "disappearance" — Phase 1 finding (read-only)

**Date**: 2026-08-24 · **Canonical branch**: `clean-main-no-secrets` · **Tip audited**: `e56e502ff`

## Verdict

**B — FOUND IN LEGACY STORAGE. All 12 Soul Portraits are intact. Nothing was deleted, and no
recovery write is required.**

`{"portraits":[]}` from `/api/soul-portrait/mine` is **correct behavior**, not data loss. Kelly's
portraits have never lived in the `soul_portraits` table that the Studio index reads. They live in
the repository, in the file-based registry, and are served by a different route.

## The two disjoint portrait universes

No code path connects them. Verified across the full 5,180-commit history.

| | **Registry (where Kelly's portraits are)** | **DB (what Studio reads)** |
|---|---|---|
| Storage | `lib/soulPortrait/portraits/*.ts` (git) | `soul_portraits` table (Postgres) |
| Index | `lib/soulPortrait/registry.ts` | `owner_member_id = <session member>` |
| Read route | `/soul-portrait/[slug]` (static, public) | `/api/soul-portrait/mine` → `/studio/soul-portraits` |
| Write path | hand-authored, committed | `POST /api/soul-portrait/generate` |
| Ownership column | none — no `owner_member_id` at all | `owner_member_id` |
| Kelly's content | **12 portraits** | 0 rows |

Because the registry rows carry no `owner_member_id`, they are structurally invisible to the Studio
index. They were never in it — the Studio index has only ever had two commits (`508ec2073`,
`f13948f92`) and neither ever imported the registry.

## The 12 portraits — all present at `origin/clean-main-no-secrets`

| slug | name | status |
|---|---|---|
| `andrea` | Andrea Nezat | live |
| `andrea-fagan` | Andrea Fagan | live |
| `augusten` | Augusten Lucas Nezat | live |
| `catherine` | Catherine Teresa Butler | live |
| `heather` | Heather Hampton | live |
| `jondi` | Jondi | live |
| `katie` | Katie Claire McCullen | live |
| `kelly` | Kelly Nezat | live |
| `nathan` | Nathan Kane | live |
| `sophie` | Sophie Claire Nezat | live |
| `summer` | Summer Angela Bell Skalos | live |
| `larry` | Larry Closs | **content intact; slug 404s** — withdrawn from the public registry by founder directive 2026-08-05 (`19a054ccf`), pending consent. Re-enabling is one import + one registry line. |

Reachable now at `https://soullab.life/soul-portrait/<slug>` (unauthenticated, statically generated,
unlisted — not linked from navigation).

## Evidence that nothing was destroyed

1. **No portrait file was ever deleted, on any branch, in the entire history**
   (`git log --all --diff-filter=D -- '*soul*ortrait*'` → empty).
2. **No code has ever deleted a `soul_portraits` row.** The only `DELETE FROM soul_portraits` in
   history is commented-out teardown in `scripts/soul-portrait-demo-seed.sql` (`5bd8f8608`), scoped
   to the fixed demo UUID `00000000-0000-4000-a000-000000000d01` — not Kelly's.
3. **No code has ever updated `owner_member_id` after insert.** It is set once, at
   `portraitStore.ts:84`, from the session-verified member.
4. **Ownership has always been session-verified.** The auth hardening that stopped trusting a bare
   `x-member-id` claim (`5b4eff3d5`, 2026-06-09) *predates* the portrait pilot (`508ec2073`,
   2026-07-07), so no portrait was ever written under a client-asserted identity.
5. **The identity chain is consistent.** `/api/studio/whoami` and `/api/soul-portrait/mine` both
   resolve identity through the same `getMemberIdFromRequest`. The `practitionerId`
   (`717da53c-…`) is never used for portrait ownership.
6. **The query ran successfully against an existing table.** `listOwnedPortraitsWithSubject` has no
   try/catch and neither does the route — a missing table would return 500, not 200. HTTP 200 with
   an empty array means the table exists and matched zero rows.
7. **The `/mine` filter has no hidden predicate.** `WHERE sp.owner_member_id = $1` only — no
   soft-delete, archive, consent, published, or team filter, and the `studio_people` join is a
   LEFT JOIN, so it cannot drop rows.

## Residual question (needs DB access — not available from this container)

This session has no SSH to minisforum and no `DATABASE_URL`, so the DB layer was not queried
directly. The finding above rests on code and git history, which are decisive about the registry
portraits. One question remains open: whether Kelly *additionally* created DB-backed drafts through
`/soul-portrait/generate` that are now missing.

Given (2) and (3), if such rows were ever created they can only be missing via an out-of-band event
(manual SQL, restore, volume loss) or — more likely — because they were generated against the
**Mac Studio parallel dev stack** rather than production. Read-only confirmation:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"
  SELECT owner_member_id, count(*), min(created_at), max(created_at)
    FROM soul_portraits GROUP BY 1 ORDER BY 2 DESC;\""

ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"
  SELECT sp.id, sp.slug, sp.portrait_kind, sp.owner_member_id, sp.subject_member_id,
         sp.consent_state, sp.published_at, sp.created_at,
         sp.immutable_text->'person'->>'name' AS subject_name
    FROM soul_portraits sp ORDER BY sp.created_at DESC;\""

ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"
  SELECT id, username, email, name, created_at FROM members
   WHERE email ILIKE '%soullab1%' OR name ILIKE '%kelly%' OR username ILIKE '%kelly%'
   ORDER BY created_at;\""
```

If the first query returns **zero rows overall**, no practitioner has ever generated a DB portrait
in production, and the Studio index has been empty since it shipped — closing the question with
no incident. If it returns rows under a *different* Kelly `members.id`, that is a genuine
Hypothesis-A ownership repair and warrants a scoped Phase 2 plan.

## Why no write was made

Phase 2 was not entered. The portraits are not lost, so there is nothing to restore, and the two
systems were never joined. Backfilling the registry portraits into `soul_portraits` to make them
appear in Studio would **not** be recovery — it would be manufacturing ownership rows for portraits
about real, named people, one of whom (Larry Closs) is currently withdrawn precisely because his
consent has not been obtained. That is a new consent-bearing feature decision for Kelly, not an
incident remedy.
