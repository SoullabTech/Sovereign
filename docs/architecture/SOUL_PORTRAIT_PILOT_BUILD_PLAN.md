# Soul Portrait Pilot — Build Plan (Create → Steward → Return)

**Status:** PROPOSED — awaiting approval before any implementation.
**First practitioner:** Larry Closs (established practice; candid; ongoing developmental relationship — meets the pilot's first-practitioner criteria).
**Design source of record:** branch `docs/soul-portrait-design-hold`.
**Governs against:** `SOUL_PORTRAIT_CONSENT_ARCHITECTURE.md` (keystone), `SOUL_PORTRAIT_STUDIO_STAGE1_BOUNDARY.md`, `SOUL_PORTRAIT_PILOT_ONE_PRACTITIONER_JOURNEY.md`.
**Constitutional gate:** passed the six architectural-integrity checks (§6). One item **Pending** (two-field provenance), not a blocker for an owner-only slice — see §6.3.

---

## 0. What this slice is — and is not

Larry **creates** a portrait draft about one of his clients, **stewards** it (it persists; he re-opens it), and **returns** to his body of work a week later ("Where was I?").

**Consent tier = None / draft.** In the ratified chain
`Generate draft → Practitioner review → Owner-scoped visibility → Consent event → Handed artifact`,
this slice runs the **first three steps only** and **stops before the consent event**. It therefore *cannot* cross the consent boundary — there is no delivery code path in the pilot to cross it with.

**Explicitly NOT in this slice:** delivery, PDF/handed artifact, any client- or member-facing surface, consent capture, mentor dialogue, publish/`immutable_text` finalization, and the "body of work" **container** (deliberately unbuilt — see §7).

---

## 1. Minimum implementation path

| Step | How | Build type |
|---|---|---|
| **Create** | Reuse generator + `createDraftPortrait`; let Larry pick which client the portrait is about (a `studio_people` subject) | extend (small) |
| **Steward** | Reuse the owner-scoped preview page — the draft persists and re-opens | reuse (as-is) |
| **Return** | NEW practitioner index listing Larry's own portraits, labeled by subject + last-touched — this is "Where was I?" | net-new (the bulk) |

---

## 2. What already exists (reuse — currently local on `feature/soul-portrait-path-b-gate2`)

- `lib/soulPortrait/portraitStore.ts` — Stage 1, **Grade A owner-scoped**: `createDraftPortrait` (writes `consent_state='pending'`, unpublished), `getOwnedPortrait`, `getOwnedPortraitBySlug`, `listOwnedPortraits` (`WHERE owner_member_id = $1`). `CreateDraftInput` **already carries `subjectPersonId`**.
- `lib/soulPortrait/generator/generatePortrait.ts` + `portraitPrompt.ts` — the draft generator.
- `POST /api/soul-portrait/generate` — already authenticates (`getMemberIdFromRequest`; owner = generating member) and calls `createDraftPortrait`.
- `app/soul-portrait/preview/[id]/page.tsx` — Steward view, **fully owner-scoped** (`getOwnedPortrait(id, memberId)`; non-owner / no session → 404).
- `components/soulPortrait/SoulPortraitRenderer.tsx` — renders a portrait.
- Schema (no changes needed): `soul_portraits` (Gate 2, deployed) + `subject_person_id` (Stage 1) + `studio_people` (subjects).
- Auth pattern: `lib/auth/getCurrentPractitioner.ts`, `getMemberFromRequest.ts`. Studio already has `app/studio/clients/page.tsx` (the client list) and `app/studio/tools/page.tsx`.

## 3. Net-new (the honest bulk — all practitioner-private)

1. **`app/studio/soul-portraits/page.tsx`** — practitioner index (the **Return** surface). Server component: `getCurrentPractitioner()` → `listOwnedPortraits(memberId)` → list with subject name + `created_at` + link to the preview. *Primary new work.*
2. **Client selector in Create** — extend `components/soulPortrait/GeneratePortraitForm.tsx` to pick a `studio_people` client (reuse the same query the `studio/clients` page uses), so the draft records `subjectPersonId`.
3. **Thread `subjectPersonId` through** `app/api/soul-portrait/generate/route.ts` — the route currently passes `subjectMemberId` but not `subjectPersonId`; the store already accepts it. One-field delta.
4. *(optional, minimal)* `listOwnedPortraitsWithSubject(ownerMemberId)` in the store — a `LEFT JOIN studio_people` for the subject's display name, kept owner-scoped. Or resolve names in the page. Not load-bearing.

## 4. Exact files / routes / tables

**Tables:** none new. **Migrations:** none. (`soul_portraits`, `subject_person_id`, `studio_people` all exist.)

**Routes/API:** no new routes required. One edit: `app/api/soul-portrait/generate/route.ts` (thread `subjectPersonId`).

**Pages:**
- NEW `app/studio/soul-portraits/page.tsx` (Return; owner-scoped).
- REUSE `app/soul-portrait/preview/[id]/page.tsx` (Steward; owner-scoped, unchanged).
- EXTEND the Create entry (`app/soul-portrait/generate/page.tsx` + `GeneratePortraitForm.tsx`), reached from a "New Soul Portrait" link on the Studio index.

**Lib:** EXTEND `portraitStore.ts` (optional subject-name join). REUSE generator + `getCurrentPractitioner`.

**Components:** small list UI (inline or `StudioSoulPortraitList`); REUSE `SoulPortraitRenderer`.

## 5. No-exposure confirmation

- **Every read is owner-scoped**: Create (`getMemberIdFromRequest`, owner = generator), Steward (`getOwnedPortrait`, non-owner → 404), Return (`listOwnedPortraits WHERE owner_member_id = $1`). The Grade A refusal (no unscoped reader exists) already holds and is tested (`__tests__/soul-portrait-owner-scoping.test.ts`).
- **No consent event** is written (None/draft tier).
- **No delivery/public surface is wired**: `app/soul-portrait/[slug]/page.tsx`, `.../welcome`, and the mentor route are delivery / subject-self tier and stay **out**.
- **No client/member-facing surface**: the subject never sees anything — no link, no PDF, no account.
- **Only new surface** = `app/studio/soul-portraits/*`, authenticated practitioner-only.
→ No member-facing exposure beyond the named pilot path.

## 6. Constitutional checks (architectural-integrity)

1. **Ontology & layer** — Create = generator (draft) · Steward = owner-scoped read · Return = owner-scoped list. Each layer does only its job. **PASS.**
2. **Jurisdiction** — practitioner owns creation/container; subject authorizes (untouched — no consent event); system enforces walls. Owning ≠ authorizing is honored *because the slice never delivers*. **PASS.**
3. **Provenance** — the draft is **system-authored** (generator), practitioner-reviewed, `consent_state='pending'`, unpublished, owner-only. **Pending:** `soul_portraits` lacks two-field provenance (`authored_by`/`authority_class`). **Recommendation: defer** — nothing is delivered in this slice, so no one but Larry (who generated it) ever sees the text; add `authored_by` when publish/delivery ships (when the artifact leaves his hands). Flagged, not silently skipped.
4. **Direction of authority** — owner-scoping in store SQL (Grade A, downward); draft tier enforced by `createDraftPortrait` + the **absence** of any delivery route. Structure, not prompt. **PASS.**
5. **Candidate vs canon** — the pilot and the "body of work container" stay Candidate; nothing canonized. **PASS.**
6. **Evidence proportionality** — the pilot's purpose is to *generate* evidence; no liveness claim until Larry completes the loop unassisted. **PASS.**

## 7. Deliberately NOT built: the "body of work" container

The pilot doc predicts the first friction: *"a body of work" is not yet a re-enterable object* — Stage 1 stores individual portraits, not a container for an ongoing arc with one subject. **We do not pre-solve this.** The minimum build ships the list (`listOwnedPortraits`); the pilot reveals whether the container (likely the *relationship*, not a folder) is needed. Building it now would invent a primitive ahead of evidence.

## 8. Prerequisites to RUNNING (separate, gated — NOT this coding)

These are deploy/provision steps, held under your "do not deploy yet":
- Stage 1 (`603d8972b`) + the generator are **local-only** — must merge + deploy to the pilot environment first. **Co-Lab release gate applies** (client data): `verify-colab-boundaries.ts` 31/31.
- **Larry provisioning**: a practitioner member account + his clients as `studio_people` — a setup step in the pilot environment (local DB currently has 0 practitioners).
- Each is its own authorization, sequenced after this plan is approved and the code is built + reviewed.

## 9. Where the code is built

On a feature branch (extend `feature/soul-portrait-path-b-gate2` or branch off it) — **not** mainline, **not** `docs/soul-portrait-design-hold` (docs stays the design source of record). Implementation reaches production only through its own gated PR + deploy, after this plan is approved.

## 10. Open scoping decisions (need your call before coding)

1. **Subject of the first portrait** — one of Larry's clients (`subject_person_id → studio_people`, exercises the Stage 1 seam and the real practitioner journey) — *recommended* — vs. a simpler self-portrait. 
2. **Steward depth** — re-open + regenerate only (*recommended, smallest*) vs. an editable draft. Editing pre-empts the friction the pilot is meant to find.
3. **Provenance** — defer `authored_by` (*recommended*, §6.3) vs. add it now (a migration, breaks "no new tables/migrations").

## 11. Acceptance (from the pilot doc)

Success = **Larry re-enters his own body of work unassisted** a week later, and answers: *"At what moment did you stop thinking about the software and start thinking about your client?"* The metric is **invisibility** — did the software disappear — not "the feature works." No public commitment until he completes the loop and returns unassisted.
