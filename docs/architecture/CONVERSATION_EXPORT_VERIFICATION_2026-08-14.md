# Conversation Export — Step 1 Runtime Verification

**Date:** 2026-08-14
**Lane:** Conversation download — member availability
**Outcome:** **STEP 1 FAILED. Step 2 (placement) not entered.**

The sequence was: (1) verify the endpoint at runtime; (2) only if sound, propose placement;
(3) acceptance is a member witness. Step 1 does not pass. Placement is not proposed.

---

## Finding 1 — The endpoint does not function. It never has.

Runtime witness against production (`https://soullab.life`, unauthenticated, bogus userId):

```
HTTP 500
content-type: application/json
{"error":"Failed to retrieve conversations",
 "details":"relation \"conversation_messages\" does not exist"}
```

`app/api/conversations/export/route.ts:244,364` issues
`SELECT * FROM conversation_messages WHERE user_id = $1`.

**No table by that name exists in production.** Tables matching `%conversation%`:

```
conversation_insights
conversation_memory_uses
conversation_themes
conversation_turns
practitioner_ai_conversations
```

**Names are not identity.** The only `conversation_messages` in the repo is a **JSONB column**
inside a holoflower readings table (`database/migrations/20251223_create_holoflower_tables.sql:33`)
— not a relation. No migration ever created a `conversation_messages` table.

The only code that ever "wrote" to it, `lib/services/conversationStorageService.ts`, is a
`@ts-nocheck` `'use client'` prototype using a **Supabase** client (`.from('conversation_messages')`)
— a banned dependency under the project's sovereignty rules, and never ported to `lib/db/postgres.ts`.

**Classification:** not "built but unplaced." The capability is **representationally complete and
functionally absent** — component, formatters, MIME handling and filename logic all exist and are
real code, over a data source that does not exist.

## Finding 2 — No authentication, no ownership binding.

`GET`/`POST /api/conversations/export` take `userId` from the **query string / request body**.
The route performs no session check, no cookie read, no `getMemberFromRequest`, no ownership
comparison. Nothing binds the caller to the `userId` they request.

Nor does the perimeter cover it:

- `config/accessMatrix.ts` has **zero rules** matching `/api/conversations` (grep: no matches).
- `ACCESS_CONTROL_MODE` is **unset** on the production container → `getMode()` returns
  `'permissive'` (Mode A) → unmapped routes **pass through** the middleware.

Confirmed by the probe above: an unauthenticated request reached the handler and executed the SQL.

## Finding 3 — The dead table is the only thing preventing an IDOR. **This is the load-bearing finding.**

The real conversation store is live and substantial:

```
conversation_turns — 39,956 rows · 212 distinct user_id · latest 2026-08-14 18:06:54+00
columns: id, user_id, session_id, role, content, created_at, meta,
         parent_turn_id, visibility, exchange_id, seq, field_slug,
         posture_at_creation, provenance
```

The obvious repair — point the query at `conversation_turns` — **is the dangerous one.** It would
convert a broken endpoint into an unauthenticated full-history exfiltration endpoint: any caller,
with no credentials, could dump any of 212 members' complete conversation text by supplying a
`user_id`.

**No active exposure today.** The missing relation fails closed. But the defect is *latent, not
benign*, and the naive fix detonates it.

## Prerequisites before any repair (none authorized here)

1. **Authentication + ownership binding** — resolve the member server-side; refuse any `userId`
   that is not the caller's. Add an explicit `accessMatrix` rule rather than relying on Mode A.
2. **Sanctuary Mode exclusion** — Sanctuary content must never appear in an export. This is an
   absolute boundary, not a filter preference.
3. **`visibility` column** — a `SELECT *` port ignores it. Establish what each value means for export.
4. **`role` vocabulary** — the route assumes `'user' | 'oracle'`; verify against `conversation_turns`.
5. **Mode B** — the permissive unmapped-route default is a perimeter finding beyond this lane.

## False liveness copy — corrected, but NOT carried in this commit

`components/examples/ConversationDownloadDemo.tsx` asserts "Members can now download their
conversations" (line 16) and renders "✅ Fully Operational" (line 193). Both are false: the demo is
the component's only render site, it is imported by no page, and the endpoint returns HTTP 500.

A correction was drafted (replacing both claims with the verified runtime state and a
do-not-rename-the-table warning) and is **deliberately excluded from this commit**, which is scoped
to the security perimeter only. **The file is therefore still uncorrected on this branch.** Carrying
it needs its own authorization — it is documentation honesty, not an auth boundary, and mixing it
into a Class A security commit would blur the diff that governs admission.

---

# Unit 2 — Perimeter: auth + subject binding (authorized 2026-08-14)

Security only. The datasource is deliberately left broken; a secure broken endpoint is the
intended intermediate state.

## Changes

| File | Change |
|---|---|
| `app/api/conversations/export/route.ts` | GET + POST resolve the subject via `getMemberIdFromRequest` (auth_sessions-backed) before any query is constructed; 401 when unauthenticated; 403 on subject-widening; `EXPORT_SOURCE_TABLE` / `EXPORT_SANCTUARY_EXCLUSION` declared |
| `config/accessMatrix.ts` | `{ prefix: '/api/conversations', minTier: 'free' }` — no longer relies on the permissive unmapped default (#717) |
| `lib/auth/__tests__/conversationExportPerimeter.test.ts` | 16 guard tests, mutation-validated |

## The five requirements

1. **Route authentication** — mapped explicitly. **Caveat recorded in code:** this rule is
   perimeter, *not* authority. `middleware.ts:isAuthenticated()` accepts a bare unverified
   `x-member-id` header, so middleware alone would still admit a forged identity. The binding gate
   is the route-level `getMemberIdFromRequest`.
2. **Subject binding** — the subject is the verified session member. A caller-supplied `userId`
   carries no authority; if it names anyone else the request is refused 403 rather than silently
   serving the caller's own data under another name.
3. **Ownership** — *by construction.* `sessionId` is ANDed with the verified subject, so a foreign
   or guessed session matches nothing. The not-found response is uniform: "not yours" and "does not
   exist" are indistinguishable. No separate pre-check query was added, because that would require
   binding a datasource — deferred by design.
4. **Sanctuary** — **cannot be expressed as a column filter today.** `is_sanctuary` exists on
   `runtime_events`, `usage_events`, `usage_ledger` and `sanctuary` on `workbench_uploads` —
   **on no conversation table.** The current source returns nothing, so the exclusion holds
   *vacuously*; that is the only reason a null predicate is tolerable. Enforced by test, not by
   runtime block, so the authenticated own-request still reaches the broken source as specified.
5. **No data-source repair** — `EXPORT_SOURCE_TABLE` still `conversation_messages`.

### Sanctuary tripwire (founder ruling, 2026-08-14) — governing sentence for this path

> **No successful conversation export may be enabled until a concrete Sanctuary classification
> source for exported conversation data has been identified and enforced. The present absence of
> returned data is not a durable Sanctuary control.**

The vacuous exclusion is accepted **only** for this deliberately broken datasource state. The
sentence is recorded alongside `EXPORT_SANCTUARY_EXCLUSION` in the route itself, so that anyone
changing `conversation_messages → conversation_turns` meets it before turning a vacuous property
into a live privacy failure. The M1 mutation is the executable form of the same warning.

## Mutation validation (a passing test proves nothing unless it can fail)

| Mutation | Result |
|---|---|
| M1 — rename source to `conversation_turns` (*the dangerous fix*) | **RED** 1 failed |
| M2 — remove the GET auth check | **RED** 3 failed |
| M3 — drop the 403 subject-widening refusal | **RED** 1 failed |
| M4 — make the accessMatrix rule `public: true` | **RED** 1 failed |
| restored | **GREEN** 16/16 |

## Incidental finding — `accessMatrix.ts` defeats the shared comment stripper

`config/accessMatrix.ts` has **unbalanced `/*`**: 17 opens, 15 closes. One is inside a string
literal (the `/relationships` rule), one inside a `//` comment (the `dashboard/*` ordering note).
The `stripComments()` helper used by `journalGuardCoverage.test.ts` and siblings would therefore
delete every rule after line 247 and report a *present* rule as missing — the #787 failure mode
inside the detector itself. This test is line-scoped to avoid it. **Other guard tests that scan
`accessMatrix.ts` with that helper are suspect.** Not repaired here (adjacent defect).

## Gate results

- `lib/auth/__tests__` — **109/109 pass**, 6 suites.
- `npm run typecheck` — **FAILS, pre-existing.** Attribution probe: stashing all changes from this
  unit and re-running produces the **identical** failure (10 NEW diagnostics, 21 new program files)
  on the clean base. The diagnostics are in `app/api/focus/*`, `components/focus/*`,
  `app/wisdom-keepers/*`, `lib/relationships/detectRelationalSignal.ts` — none touched here. Zero
  diagnostics reference `conversations/export`. Branch debt, not this unit; not absorbed.

## Step 4 — RUNTIME SECURITY WITNESS: **NOT OBTAINED**

The acceptance witness (unauthenticated → refused before SQL; member A + member B's id → refused;
member + foreign sessionId → no disclosure; member + own request → still fails safely at the
datasource) is a **runtime** claim and cannot be established by source assertions. It requires a
deploy, which is not authorized in this unit. Until it is obtained:

```text
PERIMETER (source-level) ........ IMPLEMENTED + MUTATION-VALIDATED
PERIMETER (runtime) ............. NOT WITNESSED
```

Do not treat the passing suite as the security witness.

## Not done, deliberately

- **No placement proposed.** Gated on step 1, which failed.
- **No datasource repair.** `conversation_turns` untouched; no field map attempted.
- **No formatter changes.** They still embed raw `userId` / session ids in output; now the
  member's own, but review is a later unit.
- **Typecheck debt and the `accessMatrix.ts` stripper hazard** — reported, not absorbed.
- **Account "export all my data" omitting conversation text** — separate lane, not merged.
