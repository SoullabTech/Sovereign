# Client Representation Governance Patch — Spec

**Status: REMEDIATION + PREVENTION** (calibrated from prod, 2026-06-25). The constitutional crossing is live but barely exercised.

**Governs:** the seam where practitioner support becomes **third-party (client) representation through persistence, inference, or aggregation** — verified first-hand in [the Responsibility Ladder §3a/4a findings](../architecture/PRACTITIONER_PORTAL_RESPONSIBILITY_LADDER_2026-06-25.md). The member side already has this discipline (`member_memory_atoms.crossing_allowed=FALSE` + provenance); the client side does not. This patch brings the client side to parity. It is the **governance floor that makes the existing crossing legible and safe — not permission to expand it** (the multi-party / triadic constitution remains separate, unbuilt).

**This is a spec (design). No code changes here.**

---

## 0 — Prod calibration (why remediation, not just prevention)

| Table | Finding (aggregate only — no content/identity inspected) |
|---|---|
| `case_memories` | **2 rows, 1 case**, both `maia_inferred` (`source_candidate_id` set), **0 human-authored**, single write event **2026-03-14 23:00:04** (= the `20260314000002` migration date). Signature reads as dev/test data; treated as real. |
| `pending_review_candidates` | **4 → 2 promoted, 2 expired-unpromoted.** Two MAIA inferences generated then discarded **with no rejection record** — the silent-expiry rejection gap, already realized. |

**Implication:** backfill is trivial (both rows classifiable from FKs). The **disposition of the 2 existing rows is a steward decision** (purge-as-test vs retain-under-governance) — not automated by this patch. The conservative default below holds them (`crossing_allowed=FALSE`) until that decision is made.

---

## Build status (2026-06-25)

| Increment | State |
|---|---|
| 1 · Migration (schema + ruling-encoded backfill + retroactive rejection) | **Built + proven** — `database/migrations/20260625000002_client_representation_governance.sql`; rollback proof `scripts/repro/client_representation_governance_db_proof.sql` (case_memories: columns/default/classifier/**held-invariant** green; pending half deferred — parity note below). |
| 2 · Enforcement-decision layer (pure) | **Built + proven** — `lib/governance/clientRepresentationGuards.ts`; `scripts/repro/client_representation_guard_proof.mts` **5/5** + jest CI artifact. |
| 3A · Persist gate + stamp (`review/save`) | **Built + proven** — gate refuses `consent_based` without consent; INSERT stamps `maia_inferred` / `accepted` / `crossing_allowed=FALSE` (held) / consent snapshot / `source_route`. INSERT shape validated vs migrated schema (`PREPARE`); jest CI test `app/api/studio/review/__tests__/save.governance.test.ts`; guard proof 5/5. |
| 3B · Surface filter (`review/memories`) | **Built + proven** — two-pass guard: held `maia_*` withheld; content loaded **only** for surfaceable ids (never reaches payload); consent floor withholds all; `withheld` count returned. **Scope finding:** `review/memories` is the *only* content surface for `case_memories` — prep/digest/briefing don't read it; `CaseStore` exposes counts only. jest CI test `memories.governance.test.ts`; guard 5/5. *Gap: the `prep` view surfaces `maia_prep` (a different, ungoverned representation on `practitioner_sessions`) — governed in 3D.* |
| 3C · Generate refusal | **Built + proven (policy 6/6)** — ratified three-mode policy: **`private` = no representation (refuse)** · `consent_based` = needs consent · `transparent` = permitted. `series/analyze` gated cleanly (case-keyed); `analyze` gated via session→client→case JOIN (refuse if a linked case refuses; **unlinked sessions proceed — 3A persist is the backstop**). 3A persist message corrected to match (`representationRefusal`). jest CI tests for both routes + updated 3A/guard tests. *Structural finding: `analyze` is pre-case — a fully clean generate-gate needs it case-aware. Surface edge: a now-`private` case with a pre-existing `crossing_allowed=TRUE` maia row would still surface (mode transition) — future `maySurface` refinement.* |
| 3D · Auth side door + parallel path | **Partial.** ✓ **Auth side door closed** — `stellium/maia/prepare` takes identity from the authenticated session; body `practitionerId` ignored. ✓ **maia_prep generate gate** — refuses before the LLM under private/unmet-consent (session→client→case JOIN). ✓ **Mode-transition edge closed** — `maySurface`: `private` withholds `maia_*` even when `crossing_allowed` (covers `case_memories` via `review/memories`). guard proof **7/7**; guard + 3B tests updated. **Remaining resolved by the coverage audit + follow-up patches (final section):** the real maia_prep surface gap was `stellium/sessions/[id]` (Patch 1), **not** `sessionPrep` (which surfaces practitioner-authored content); `pending_review_candidates` guarded (Patch 3); `spiralogic_reports` blocked on a missing identity link (recorded, not faked). |
| 4 · Faithfulness proof | **Pending** — route-level `crossing_allowed=FALSE ⇒ withheld` (recall/Sanctuary template, client side). |
| Deploy | **Pending steward authorization** — migration + backfill via `scripts/deploy-production.sh`; backfill holds the 2 prod rows. |

**Local/prod parity gap (surfaced by the proof):** `pending_review_candidates` exists in **prod** but **not** in the local dev DB — so the rejection-capture half is proven only at deploy/CI, and the Studio review tables are not all present locally. Worth a parity audit before deploy.

## 1 — Schema (migration `20260625000002_client_representation_governance.sql`)

### 1a. `case_memories` — first-class provenance, disposition, crossing, consent snapshot
```sql
ALTER TABLE case_memories
  ADD COLUMN authorship       TEXT NOT NULL DEFAULT 'maia_inferred'
    CHECK (authorship IN ('practitioner_authored','maia_inferred','maia_suggested')),
  ADD COLUMN disposition      TEXT NOT NULL DEFAULT 'accepted'
    CHECK (disposition IN ('provisional','accepted','rejected')),
  ADD COLUMN crossing_allowed BOOLEAN NOT NULL DEFAULT FALSE,   -- member-side analog
  ADD COLUMN consent_basis    TEXT,         -- snapshot of practitioner_cases.privacy_mode at write
  ADD COLUMN consent_at_write TIMESTAMPTZ,  -- snapshot of consent_captured_at at write
  ADD COLUMN source_route     TEXT;         -- e.g. 'studio/review/save', 'stellium/maia/prepare'
```
- **`authorship`** is the first-class discriminator S1 found missing. Backfillable: `source_candidate_id IS NOT NULL OR review_lens_id IS NOT NULL` ⇒ `maia_inferred`; `source_note_id IS NOT NULL` ⇒ `practitioner_authored`.
- **`crossing_allowed`** is the constitutional core (member-side parity). **Default `FALSE`** — a MAIA-inferred client representation is *held*, not *surfaced/asserted*, until conditions below are met. **Whether `FALSE` is the ratified default is Kelly's constitutional call** (mirrors the member-side `crossing_allowed=FALSE` choice).
- **`consent_basis` + `consent_at_write`** snapshot the case's consent state onto each memory at write time (the `session_consent_events` snapshot pattern), so each representation carries durable consent provenance rather than a live lookup.

### 1b. Rejection capture — `pending_review_candidates`
```sql
ALTER TABLE pending_review_candidates
  ADD COLUMN rejected_at     TIMESTAMPTZ,
  ADD COLUMN rejection_reason TEXT;        -- nullable; practitioner-volunteered
```
Rejection becomes explicit (practitioner declines a candidate) rather than silent TTL expiry. A nightly/lazy sweep may mark `expires_at < now() AND promoted_at IS NULL AND rejected_at IS NULL` as `rejected_at = expires_at, rejection_reason = 'expired_unreviewed'` so the **2 already-expired rows** gain a disposition retroactively.

---

## 2 — Enforcement: `privacy_mode` at generate / persist / surface

Target **`practitioner_cases.privacy_mode`** specifically (CHECK `private|transparent|consent_based`) — **not** the `rl_sessions.privacy_mode` gate in `trust/service.ts` (different table/values; naming collision noted).

| Stage | Routes | Rule |
|---|---|---|
| **Generate** | `studio/review/analyze`, `studio/review/series/analyze` | Ratified three-mode policy (Kelly 2026-06-25): **`private` ⇒ refuse** (no MAIA representation); `consent_based` + no `consent_captured_at` ⇒ refuse; `transparent` ⇒ allow. Refuse BEFORE the LLM call. |
| **Persist** | `studio/review/save`, `stellium/maia/prepare`, `clients/[clientId]/spiralogic-report` | Same gate; on write, **snapshot** `consent_basis`+`consent_at_write`; set `authorship`, `source_route`. |
| **Surface** | `studio/review/memories`, `clients/[clientId]/prep`, `.../digest`, `sessions/[sessionId]/briefing` | Return a representation only if `crossing_allowed = TRUE` AND consent satisfied. `maia_inferred` + `crossing_allowed=FALSE` ⇒ withheld (count may show, content does not — the member-side pattern). |

**`consent_based` requires `consent_captured_at`** is the load-bearing rule: the strongest privacy mode cannot be satisfied by a flag alone.

---

## 3 — Backfill + review workflow (because rows exist)

1. **Backfill provenance** on the 2 existing rows: both ⇒ `authorship='maia_inferred'`, `disposition='accepted'`, `source_route='studio/review/save'`, `consent_basis`/`consent_at_write` from their case.
2. **Hold by default**: backfilled `crossing_allowed=FALSE` ⇒ the 2 rows are not surfaced until reviewed. Conservative remediation: existing un-governed MAIA client representations stop being surfaceable the moment the patch lands.
3. **Steward disposition**: surface the 2 rows (count + provenance + case, **no content unless Kelly opts to read**) for a purge-vs-retain decision. Not automated.
4. **Retroactive rejection**: mark the 2 expired-unpromoted candidates `rejected_at`.

---

## 4 — Close the auth side door (bug, bundled because it compounds S3)

`stellium/maia/prepare/route.ts:32-39` takes `practitionerId` from the **request body** with no ownership check — anyone can generate/store a client prep for arbitrary IDs. **Fix:** derive `practitionerId` from the authenticated session (as the other prep routes do via `requireMemberId`/`getCurrentPractitioner`) and verify the caller owns `sessionId`/the client. Until fixed, the persist-stage enforcement in §2 is bypassable.

---

## 5 — Seams (constitutional) vs Bugs (ordinary), addressed by this patch

**Constitutional seams** (the reason this patch exists):
- **S1** — no first-class provenance on `case_memories` → §1a `authorship`.
- **S2** — `privacy_mode` built but unenforced on representation pathways → §2.
- **S3** — MAIA-synthesized client prep (`maia_prep`, spiralogic-report) persisted without consent → §2 persist-stage + §4.
- **Governance asymmetry** — client memory lacks the member-side `crossing_allowed` → §1a.

**Ordinary bugs** (fixed alongside, not constitutional):
- `stellium/maia/prepare` body-supplied `practitionerId` (§4).
- `review/save` files candidates under any owned `caseId` with no session→case binding check (MAIA inference can land under the wrong client) — add the binding check.
- `reviewLens.ts:15` stale invariant ("never persists" — false).
- `relational-navigation/route.ts:255` undefined `TEMPERATURE` in retry path.

---

## 6 — Ladder impact (Built ≠ Permitted ≠ Sellable)

This patch does not make 3c/4b/4c **Sellable**. It makes the existing crossing **governed** — a precondition. After it lands *and* a faithfulness proof exists (consent-gate honored; `crossing_allowed=FALSE` ⇒ withheld, proven the way recall/Sanctuary were), 3c/4b/4c may move Constitutional `gated → conditionally-allowed (consent-gated)` and Faithfulness `not-yet-proven → proven`. Until then they remain **Not-yet-sellable**. The triadic constitution (acting *in the client's care*) is still a separate, unbuilt layer — this patch governs representation, not action.

## 7 — Two decisions that are Kelly's, not the patch's
1. **Is `crossing_allowed=FALSE` the ratified default** for `maia_inferred` client representations? (Conservative; mirrors member side. Recommended.)
2. **Disposition of the 2 existing prod rows** — test-purge or retain-under-governance? (Backfill holds them either way until decided.)

---

## Coverage audit + follow-up patches — FINAL STATE (2026-06-25)

A read-only coverage audit asked: *does any path prepare/persist/surface governed client representation without consulting the shared `clientRepresentationGuards` policy?* Result: `case_memories` sealed, `leadership/decisions/changes` correctly **exempt** (the practitioner's own work — migrations say "consultant-facing, **not** client-facing"), and three gaps — two now closed.

| store | final status |
|---|---|
| `case_memories` | **Sealed** — generate · persist · surface · mode-transition edge (this patch). |
| `maia_prep` | **Content-sealed** — generate (`stellium/maia/prepare`) + auth/persist/surface (`stellium/sessions/[id]`, **Patch 1** `670f9181a`). *The real surface gap was `stellium/sessions/[id]` — an auth side door persisting **arbitrary** prep content — NOT `sessionPrep.ts`, which surfaces practitioner-authored notes (not maia_prep). Residual: a boolean `prep_status` existence flag in `sessionPrep:570` — no content, low-risk.* |
| `pending_review_candidates` | **Guarded** — read-time surface guard (**Patch 3** `0fa1f6b56`): withholds all candidates when the session's case forbids; content never loads. |
| `spiralogic_reports` | **KNOWN UNGOVERNED — blocked on identity link.** Keyed to `members.id`; `practitioner_cases.privacy_mode` is keyed to `client_identifier`/`practitioner_clients(id)`; the bridge is **empty** (`practitioner_clients.member_id` 0/26, `cases.client_id` 2/6) → **no member→privacy_mode path.** A gate would always-proceed = fake coverage. **No gate shipped.** |
| leadership · decisions · changes · CaseStore · reviewLens · sessionPrep notes | **Exempt** — practitioner's own work / counts only / authored. |

**Ruling (Kelly 2026-06-25): *no governable identity path, no governance claim.*** The earlier framing of spiralogic as *"wiring, not new policy — add columns + 4 gates"* is **superseded** — it assumed the member→case join existed; the data says it doesn't.

**Spiralogic — Option A (the real fix, deferred):** establish an explicit `spiralogic_report → practitioner_case` link (a `case_id`, or a populated member↔client bridge), **then** gate generate/persist/surface through the shared policy (a few lines). Until that link exists, spiralogic stays recorded-as-ungoverned. **Not implemented.**

**The governance claim, honestly stated:** *every path with a governable identity link routes through the shared policy.* The one surface without such a link — spiralogic — is recorded as ungoverned, not faked.

**Branch `feature/client-representation-governance`:** `8cb31c988` (case_memories — carries a Claude trailer the commit-msg hook forbids; **squash-merge removes it automatically**, else reword) · `670f9181a` (Patch 1) · `0fa1f6b56` (Patch 3) · doc-only Patch 4.
