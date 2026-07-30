# Jondi / Practitioner Companion — Pass 2 Review Packet

**Date:** 2026-07-21
**Status:** Functionally complete for review. **NOT committed, merged, or deployed.**
**Scope:** the thin practitioner shared-view UI + the authenticated two-sided walk. No other feature work.

Governing sentence (met):
> The practitioner may see only what the member deliberately shared, in the form the
> member shared it, within the field and experience to which it was explicitly bound.

---

## 1. Files changed

### New files (untracked — unambiguously this pass)
- `database/migrations/20260721000002_practitioner_companion_experiences.sql` — 3 member-authored, private-by-default tables; composite ownership FK + `UNIQUE(experience_id)`.
- `lib/practitionerCompanion/companionShared.ts` — neutral types, generic prompts, rooms, `COMPANION_ENABLED_FIELDS`/`isCompanionEnabled`, `buildFieldView`.
- `lib/practitionerCompanion/companionService.ts` — member-scoped queries; `isPractitionerForField`; `listSharedReflections` (field-authorized + shared-only).
- `lib/practitionerCompanion/companionRoute.ts` — shared GET/PUT/PATCH reflection handlers; `resolveFieldSlug` (active + companion-enabled).
- `lib/practitionerCompanion/__tests__/companionService.test.ts` · `companionGuards.test.ts` — jest (14 tests).
- `app/api/fields/[slug]/{experiences,preparations,integrations}/route.ts` — member API.
- `app/fields/[field]/companion/{layout,page,prepare,session,integrate,continue}/…` + **`practitioner/page.tsx`** (Pass 2 UI).
- `components/practitionerCompanion/{ReflectionStage,PrepRecap,ExperiencePicker,ContinueList}.tsx` — member surfaces.
- `scripts/verify-practitioner-companion.ts` — behavioural verifier (25 checks).
- `docs/architecture/JONDI_COMPANION_INCREMENT_1_BUILD_PLAN_2026-07-21.md` — plan.

### Modified tracked files (this pass's hunks)
- `config/accessMatrix.ts` — **only** two hunks: `{ prefix: '/fields/jondi/companion', minTier:'free' }` (gated before public `/fields/`) and `{ prefix: '/api/fields', minTier:'free' }`.
- `scripts/verify-constitution-colab.ts` — **only** Section 12 (`checkCompanionBoundaries()` + its call): read-only structural/integrity checks, prod-smoke-safe.

### ⚠️ Commit-hygiene finding (pre-existing hunks that must NOT ride along)
Both tracked files were already dirty at session start; their diffs contain hunks **not authored by this pass**. Stage Pass-2 hunks only (`git add -p`):
- `config/accessMatrix.ts` `@@ -65` — Now What? `/now-what/arrive` + `/api/now-what/register` rules and a `/now-what/room` note change. **Belongs to the Now What? arrival lane, not Pass 2.**
- `scripts/verify-constitution-colab.ts` `@@ -6` — docstring usage-name correction (`verify-colab-boundaries.ts` → `verify-constitution-colab.ts`). **Pre-existing, not Pass 2.**

---

## 2. Shared-read schema change

`listSharedReflections` now `JOIN members m ON m.id = e.member_id` and returns `member_name`
(`COALESCE(m.name,'')`). `SharedReflection` gained `member_name: string`.

**No other shared-read caller is broadened.** Every consumer of `listSharedReflections` /
`SharedReflection`: the practitioner page (Pass 2), `companionService.ts` (definition), and the
two test/verify instruments (`companionService.test.ts`, `verify-practitioner-companion.ts`).
No member-facing or other surface consumes it. Showing the member's name to the field's own
practitioner is the intended provenance.

---

## 3. Practitioner route imports NO mutation capability (durable guarantee)

Beyond "0 inputs / 0 buttons in the rendered HTML", the route (`app/fields/[field]/companion/practitioner/page.tsx`)
is structurally incapable of mutation:
- **Imports (all read-only):** `notFound`, `Lock` (icon), `getFieldBySlug`, `requireMemberId`,
  `isCompanionEnabled`, `PREPARE_PROMPTS`, `INTEGRATE_PROMPTS`, `type ReflectionStage`,
  `isPractitionerForField`, `listSharedReflections`, `type SharedReflection`.
- **No write imports:** `upsertReflection`, `setReflectionSharing`, `createExperience`,
  `updateExperienceStatus` are absent.
- **No mutation client / editable component:** not `'use client'`; no `apiFetch`/`fetch`,
  `useState`, `onClick`/`onChange`, `form_input`; no `ReflectionStage`/`ExperiencePicker`
  component import (the `ReflectionStage` references are the *type* union, not the component).
- **Route-level authorization:** in-route `isPractitionerForField(caller, field)` → `notFound`
  for any non-owner.

The guarantee = route-level authorization + structural absence of any mutation path.

---

## 4. Authenticated two-sided walk — 10 steps, all proven in-browser

Two real sessions (local governed test-members), identity switched via the `maia_session` cookie.
MEMBER = `ce284751…` ("Kelly"); PRACT = `ed52e28f…` ("Kelly"), owner of a temporary `jondi`
`practice_fields` row. Experiences: exp1 `782001b6…`, exp2 `b573cf20…`.

| # | Step | Outcome (observed) |
|---|------|--------------------|
| 1 | Member writes a private record | prep PUT → 200; "Private to you" |
| 2 | Practitioner cannot see it | practitioner view: "No one has shared anything with you yet" |
| 3 | Member explicitly shares it | PATCH → 200; "Shared with Jondi" |
| 4 | Practitioner sees verbatim + provenance | "Kelly" → "SESSION" → "Preparation · shared July 21, 2026 by Kelly" → exact text: *"I keep avoiding the hard conversation about leaving my job — that is what wants attention."* |
| 5 | Practitioner cannot edit / reinterpret | `<main>` = **0 inputs, 0 buttons**; no mutation import (§3) |
| 6 | Member revokes sharing | "Make private" → PATCH → 200 |
| 7 | Record disappears from practitioner view | back to empty state |
| 8 | Underlying member record intact | DB: `sharing_state=private`, `shared_at=NULL`, content preserved verbatim |
| 9 | Wrong / non-practitioner denied | member → "Path Not Found"; data-layer (25/25) also proved 2nd-practitioner cross-field denial |
| 10 | Record bound to another experience does not leak | two experiences → two separate groups; exp2 shows only "celebrate finishing the big project…", exp1 only "leaving my job…" |

**Critical proof (Step 8):** revocation changed *access*, not authorship or source integrity —
the distinction the whole architecture depends on. Sharing appeared only through explicit member
action; revocation removed practitioner access without altering the member's source record.

### Screenshots (retained location)
Captured inline in the **session transcript** at Step 4 and Step 10 (browser screenshot tool).
**Not persisted as repo files** — the walk fixtures were torn down afterward, so they cannot be
re-captured without re-running the walk. Their content is transcribed in the table above (Steps 4
and 10) so the evidence stands without the images. Re-capture on request.

---

## 5. Verifier results
- `scripts/verify-practitioner-companion.ts` — **25 passed · 0 failed** (member isolation, verbatim, private-default, `UNIQUE(experience_id)`, two-practitioner field authorization, private-never-leaked, reversible member-owned sharing, integration mirrors).
- `jest lib/practitionerCompanion` — **14 passed** (ownership, explicit binding, cross-field denial, member-scoped sharing, container kind, companion-enabled exposure, access-matrix gating).
- `scripts/verify-constitution-colab.ts` Section 12 — read-only structural checks; SQL validated against the local DB (composite FK + `UNIQUE(experience_id)` detected on both tables; 0 ownership orphans; default `private`). The full harness aborts locally on missing prod principals, so Section 12 executes in the prod smoke test.
- `npm run typecheck` — clean for all Pass files.
- Clean-database migration proof — migration applies to a fresh DB (needs only `members`) with all constraints.

---

## 6. Artifact-cleanup confirmation
All walk fixtures deleted; verified **0 remaining**:
`DELETE 2` experiences (CASCADE removed their preparations) · `DELETE 1` `jondi` `practice_fields` row ·
`DELETE 2` `auth_sessions` · 0 orphan preparation rows · browser `maia_session` cookie cleared.

## 7. Local auth_sessions caveat (exactly as stated)
The two-sided walk used **local test `auth_sessions` rows** — the same INSERT that sign-in performs —
for two governed local test members, **deleted after the walk**. This is **not** production token
minting and touched only the local development database.

## 8. Held-separate scope (untouched by this pass)
No held-separate lane entered the change: **episodic kept-moments · Wisdom · iOS
`EXCLUDED_DYNAMIC_ROUTES` · generalized practitioner analytics · notifications · broader companion
enablement (other fields) · the `/field`-vs-`/fields/` routing-shadow repair**. Each is a separate
authorization.

Also pending (docs lane): update the constitutional gate so it reads *"all constitutional
collaboration checks must pass"* rather than a hard count (the harness grew ~31→~43 checks).

---

## Reviewer sign-off checklist
- [ ] member_name does not broaden other shared-read callers — §2
- [ ] practitioner route imports no mutation capability — §3
- [ ] 10-step walk + Step-8 source integrity — §4
- [ ] pre-existing hunks excluded from the eventual commit — §1
- [ ] held-separate lanes untouched — §8
