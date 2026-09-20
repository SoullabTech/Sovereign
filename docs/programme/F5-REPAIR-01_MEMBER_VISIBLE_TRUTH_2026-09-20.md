# F5-REPAIR-01 — MEMBER-VISIBLE TRUTH

**Opened:** 2026-09-20 by founder act (narrow scope, named below)
**Standing on close:** TRUTHFULNESS REPAIRED · **F5 ERASURE CONFORMANCE STILL FAIL / STOP**

---

## 1. The act that opened this lane

The founder opened the F5 repair lane at **truthfulness scope only**:

> stop returning `success: true` on failure, surface the governed 409 reason in
> Account Settings, close the `requestDataDeletion` stub. No schema, no FK, no
> cascade, no `developmental_memories` work.

This lane removes false statements to members. **It does not implement erasure**,
and nothing in it may later be cited as evidence that erasure works.

Authority carried in: `docs/programme/F5_ERASURE_TRACE_ADJUDICATION_2026-09-17.md`
§4, which earned the requirement this lane discharges:

> An erasure refusal is not complete merely because the server knows why it
> refused. The member must receive the governed reason and an unambiguous
> statement of whether anything changed.

---

## 2. What was wrong

Three surfaces reported outcomes they did not produce.

### 2.1 `POST /api/sovereignty/delete-my-memory`

| link | finding |
|---|---|
| target tables | `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`, `elemental_personalities`, `maia_adaptations` |
| deployed schema | **none of the five appear in `database/baseline/0001_baseline_2026-09-01.sql`.** Their `CREATE TABLE` statements live under `db/migrations/`, which the deployed runner does not read (`scripts/run-sql-migrations.sh` reads `database/migrations`) |
| live memory substrate | **never referenced** — `developmental_memories`, `member_sessions`, `conversation_memory_uses`, `member_spiral_state`, `agent_runs`, `member_daily_anchors` |
| failure branch | returned `{ success: true, message: 'Memory deletion request processed successfully', details: '... your request has been queued' }`. **Nothing was queued by that branch.** |

The incompleteness is a defect. Telling the member it had happened is the incident.

### 2.2 `components/account/AccountSettings.tsx`

`/api/members/delete-account` already refuses correctly with a governed 409
(`accountChanged: false`, `retained`, `nextStep`) — that route was repaired
under the 2026-07-28 containment act. The client branched on `res.ok` alone, so
the refusal never reached the member: the button returned to idle with no
message. **A member could not distinguish a refusal from a success.**

The panel copy additionally read *"Permanently delete your account and all
associated data"* — a completeness claim `accountDeletionHonesty.test.ts`
explicitly forbids the route from making.

### 2.3 `lib/storage/sovereign.ts` — `requestDataDeletion()`

Logged and returned `{ success: true }` without requesting anything. No callers.

---

## 3. What was repaired

| surface | change |
|---|---|
| `app/api/sovereignty/delete-my-memory/route.ts` | Refuses truthfully: `503`, `success: false`, `deleted: false`, `accountChanged: false`, governed prose, `nextStep`. No longer reaches the Express-era service; no longer names the five absent tables; no longer reads the confirmation phrase (reading it would imply it authorizes something). |
| `components/account/AccountSettings.tsx` | Reads the response body on non-ok, renders the governed message, the retained classes, and — unless the server explicitly says `accountChanged: true` — the line **"Nothing has been changed or removed."** Panel copy no longer claims "all associated data". A transport failure does **not** claim nothing happened server-side, because that is not known. |
| `lib/storage/sovereign.ts` | `requestDataDeletion()` throws. A stub that reports success is worse than a missing function: it can acquire a caller silently. |
| `app/labtools/sovereignty/page.tsx` | Prefers the server's governed prose over the error code. `deleteComplete` stays false on refusal. |

Posture taken is the one already ratified for `delete-account`
(`CONTAINMENT_POSTURE = 'refuse'`): **refusing is reversible; a false completion
claim is not.**

Falsifiers: `lib/auth/__tests__/erasureTruthfulness.test.ts` (sibling of
`accountDeletionHonesty.test.ts`) — 13 obligations across the three surfaces.

---

## 4. Explicitly NOT repaired

Unchanged, and out of the authorized scope: FK changes · cascade changes ·
schema changes · new erasure tables · Writer's Studio deletion · Circles
deletion or revocation repair · `developmental_memories` repair · backfills ·
SPM implementation · erasure completeness of any kind.

**The identity defect in `delete-my-memory` is NOT repaired.** The route never
resolved a session; it took `userId` from the request body, and no access-matrix
prefix covers `/api/sovereignty`. The route now performs no deletion, so the
defect is presently unreachable — but it is unrepaired, and it is a further
reason the route must not perform deletion while it stands.

---

## 5. Routed out — named, not owned, not repaired

1. **`updateStorageConsent()`** (`lib/storage/sovereign.ts`) — discards a
   member's consent change and returns as though it persisted. Same defect class
   (silent false success), but consent rather than erasure. No callers. The
   governed write is `POST /api/account/storage-consent`. Flagged in source.
2. **`lib/storage/sovereign.ts` is a declared stub** (`// Stub: TODO: Implement
   full sovereignty storage`) exposing `StorageMode` including `local_only` and
   per-datatype `saveLocal`/`saveServer`, surfaced in Account Settings. Server
   enforcement of `member_settings.storage_consent` was located at exactly **one**
   site: `app/api/journal/quick/audio/route.ts:140`. A member-facing control
   whose enforcement is one site is an I-02-class defect — the surface collects a
   sovereign act the system may not honour.
3. **Export completeness.** The Account Settings export panel says *"Download all
   your data"*; `app/api/members/export-data/route.ts` covers five tables
   (`members`, `member_settings`, `member_sessions`, `developmental_memories`,
   `google_calendar_credentials`). Same completeness-overclaim class as §2.2, but
   export is not erasure and sits outside this lane.
4. **`lib/consciousness/LocalFirstMemory.ts`** — 466 lines of IndexedDB +
   WebCrypto E2EE with **zero importers**, whose header describes "optional
   encrypted sync to Supabase". Dead code that reads like a capability, and names
   a prohibited dependency. Deletion not authorized here.

⛔ None of the four may be absorbed into this lane.

---

## 6. Standing

**F5 ERASURE CONFORMANCE — FAIL / STOP** (unchanged)

**MEMBER-VISIBLE TRUTH — REPAIRED at the three named surfaces**

⛔ No schema change · ⛔ no migration · ⛔ no deploy · ⛔ production untouched ·
⛔ erasure not implemented · ⛔ organism conformance not established.

The outward-claim consequence, for the marketing-claim lane: while erasure is
FAIL/STOP, **no Live claim of member data deletion, "right to be forgotten", or
device-side data sovereignty may be made.** What is Live is: self-hosted
infrastructure with no third-party processor, and Sanctuary Mode non-retention.
Those are different guarantees and may not be blended into the deletion claim.
