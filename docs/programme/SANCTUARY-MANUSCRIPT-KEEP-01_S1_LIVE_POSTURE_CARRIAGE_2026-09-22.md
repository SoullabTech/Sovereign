# SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — Live Posture Carriage + Zero-Write Enforcement

**Date**: 2026-09-22
**Act**: S1 (founder-authorized, with the founder's correction to the S0 proposal)
**Canonical**: `b23ae2d7fd31ee56841af3930b31658ab286a2a3` — unmoved
**Branch**: `claude/trusting-fermat-ju3quz`
**Candidate lineage**: suite `46dcfc2cf` → repair `6d36484d9` → this record
**Authority**: implementation authority for exactly the S1 population, granted by the founder's S1 authorization. ⛔ Merge, deploy, production: NOT authorized. ⛔ STOPPED for founder adjudication.

---

## 0. Standing at the top

- **The gap is closed on the candidate.** The live keeps route satisfies all twelve server laws; the Press caller seam satisfies all five caller laws; five static guards hold.
- **Suite came first and was proved lethal against the unrepaired route** (LIVE 5/12 RED on `SK-1 · SK-2 · SK-4 · SK-5 · SK-6 · SK-7 · SK-8`), then the repair, then the same suite GREEN.
- **DB-backed witness clean on a disposable shadow**: sanctuary:true → delta 0 · missing → 0 · malformed → 0 · sanctuary:false → +1 · DELETE → back to baseline. Real route, real `pg`, real auth lookup, real rows counted.
- **Project gate**: typecheck no-regression **226 vs baseline 239 · 0 regressions** · `check:no-supabase` clean · neighbouring suites green.
- ⛔ No schema. No migration. No new store. Production untouched.

## 1. The founder's correction, carried in

S0 proposed `TurnPosture.resolve(body)` on the route alone. The founder correctly refused it: absence resolves to ordinary, so today's Press body `{ sectionId, text }` would have passed a guard that looked constitutional. S1 therefore has two halves and neither is sufficient alone:

- **Caller carriage** — Press reads the member's current posture *at the gesture* and sends `sanctuary: boolean`.
- **Server refusal** — the route requires the boolean; absence or any other shape is `400 posture_required` with zero reads and zero writes; ⛔ `TurnPosture.resolve({})` is never called.

Also carried: ⛔ no `memberConfirmed` flag (the POST is the gesture); Sanctuary refusal is a **200 receipt** `{ success:true, sanctuary:true, persisted:false }`, distinguishable from the 400; DELETE untouched; GET untouched.

## 2. Changed-file population (exact)

| File | Change |
|---|---|
| `app/api/sovereign/manuscripts/[id]/keeps/route.ts` | POST: posture-first gate (`typeof sanctuary !== 'boolean'` → 400; `TurnPosture.resolve(body)`; `contentWritable(posture,'manuscript_keeps')` → 200 receipt) placed **before** the ownership SELECT. Header doctrine extended. DELETE byte-identical. |
| `app/press/manuscript/page.tsx` | `keepCurrent()` reads `readCurrentSanctuaryPosture()` inside the handler, builds the body via `buildKeepRequestBody`, refuses to POST when unresolved (notice), holds the card on a Sanctuary receipt (notice) instead of advancing; `advance()` clears the notice; one `<p>` renders `keepNotice`. |
| `lib/sanctuary/currentClientPosture.ts` | **new, tiny, shared**: reads `localStorage["maia_settings"].sanctuary` per call; `{resolved:true,sanctuary}` only for a boolean; absent / non-boolean / unreadable / unavailable → `{resolved:false, reason}`. Never caches. Never reads the account default. |
| `app/press/manuscript/keepRequest.ts` | **new, pure**: `buildKeepRequestBody(card, posture)` → body or `posture_unresolved`; `interpretKeepReply(status,json)` → `kept · not_persisted_sanctuary · posture_required · failed`. |
| `tests/constitutional/writers-studio/sanctuary-keep/{harness,laws,candidates,matrix.test}.ts` | the suite (§4) |
| `tests/__integration__/sanctuary-keep/zero-write-witness.integration.test.ts` | the DB-backed witness (§6) |
| `package.json` | `matrix:ws-sanctuary-keep` · `witness:sanctuary-keep` |

⛔ Untouched: schema · migrations · any other manuscript-writing route · Writer's Studio flagship/rebuild · B-I/B-IR1 · F5 · F7 · F8 · C1 · `lib/sanctuary/turnPosture.ts` · `lib/settings/*` · production.

## 3. Why the posture source is lawful

The canonical live authority is `localStorage["maia_settings"].sanctuary` — the key Quick Settings, the voice HUD and `OracleConversation` already read and write. `getInitialSessionSettings()` always writes `sanctuary` as a boolean, so once the key exists the value is a boolean; the strict read costs nothing and refuses to manufacture a posture from a missing field. ⛔ Not read: `maia_account_settings.defaultMemoryMode` (a default, not a posture), any session row, any auth session.

**Consequence, named**: on a browser where `maia_settings` has never been written (MAIA never opened on that device), the Press Keep is refused client-side with *“Your Sanctuary setting could not be read on this device, so this line was not kept. Open MAIA here once, then try again.”* — fail closed, visible, ⛔ not silently ordinary. Making the setting present earlier is `SANCTUARY-INIT-GATE-01`'s question, outside S1.

## 4. The suite (`npm run matrix:ws-sanctuary-keep`)

**Server laws** SK-1 refused-with-receipt · SK-2 sanctuary-touches-no-store (zero query calls) · SK-3 ordinary-writes-exactly-once (SELECT before INSERT, 201) · SK-4 missing-posture-fails-closed · SK-5 malformed-posture-fails-closed (`'true' 'false' 1 0 null 'yes' {} []`, each 400 + zero statements) · SK-6 refusals-distinguishable · SK-7 refusal-carries-no-content (no passage, no `keep`) · SK-8 contradiction-fails-closed (`sanctuary:false` + `meta.sanctuary:true` → no INSERT) · SK-9 delete-reachable-under-sanctuary · SK-10 ordinary-checks-preserved (404 / 422, no INSERT) · SK-11 no-session-substitution (no statement over `maia_sessions|auth_sessions|maia_settings|member_settings` in the whole run) · SK-12 unauthenticated-refused.

**Caller laws** CK-1 reads-setting-at-gesture-time (false→true→false across three gestures on one keeper) · CK-2 explicit-boolean-no-authority-flag · CK-3 absence-is-unresolved (even with an account default present) · CK-4 malformed-is-unresolved · CK-5 storage-failure-is-unresolved.

**Static guards** G-1 gate before SELECT before INSERT · G-2 boolean check precedes `TurnPosture.resolve(` and no `resolve({})` · G-3 no session table in the route · G-4 DELETE carries no posture logic · G-5 `readCurrentSanctuaryPosture(` appears only inside `keepCurrent`, never in a `useState` initializer; no `memberConfirmed`.

**Defeat candidates — all DEAD on their named law; collateral CLASSIFIED (every entry adjudicated as irreducible, reason in `candidates.ts`)**

| Candidate | Named kill | Founder-required? |
|---|---|---|
| DS-1 client-only-guard (the canonical route) | SK-1 | yes |
| DS-2 absence-resolves-ordinary (`resolve(body)` with no requirement) | SK-4 | yes |
| DS-3 session-substitution (`maia_sessions` when missing) | SK-11 | yes |
| DS-4 guard-after-select | SK-2 | yes |
| DS-5 guard-after-insert (write then compensate) | SK-2 | yes |
| DS-6 string-coercion (`'false'` → ordinary) | SK-5 | — |
| DS-7 sanctuary-as-error (403) | SK-1 | — |
| DS-8 refusals-conflated (missing → Sanctuary receipt) | SK-6 | — |
| DS-9 receipt-echoes-passage | SK-7 | — |
| DS-10 top-level-only (ignores nested affirmative) | SK-8 | — |
| DS-11 delete-gated | SK-9 | yes |
| DS-12 posture-replaces-containment | SK-10 | — |
| DC-1 snapshot-at-mount | CK-1 | yes |
| DC-2 omits-posture (today's body) | CK-2 | yes |
| DC-3 absence-is-ordinary | CK-3 | — |
| DC-4 default-preference-fallback | CK-3 | — |
| DC-5 string-coercion | CK-4 | — |
| DC-6 storage-failure-is-ordinary | CK-5 | — |
| DC-7 member-confirmed-flag | CK-2 | — |

Result: reference server **12/12** · reference caller **5/5** · **19/19 candidates DEAD** · **LIVE route 12/12** · G-1…G-5 PASS · `27 passed, 27 total`.

## 5. Three instrument findings, ⛔ none repaired by weakening a law

1. **DC-6 survived its first run.** It wrapped the conforming reader in try/catch, but that reader never throws, so the candidate's *“a storage failure is ordinary”* branch was unreachable — it did not embody its error. Repaired by making the candidate read raw storage. *A candidate that delegates to the thing it is meant to get wrong proves nothing.*
2. **DS-3 died on a law it should not have touched** (SK-8): it minted from the top-level boolean alone, which is DS-10's error, not session substitution. Isolation repaired (`resolve({ ...body, sanctuary })`). Each candidate now replaces exactly one decision.
3. **A cross-lane guard fired, correctly.** `lib/settings/__tests__/sessionSanctuaryInit.test.ts` asserts *no product file references that module* (it is deliberately unwired, `SANCTUARY-DEFAULT-RESOLVE-01`). My helper first imported its key constant, then — after removing the import — still named the file in a comment; the guard scans by token, so both tripped it. ⛔ The guard was not touched. The helper names the key as a literal (as six other product readers already do) and refers to the unit by lane name only. **Routed out, not repaired**: that guard reads prose as wiring — the C21 shape — and would refuse a file for documenting its own compliance. Its owner may want the comment-stripping discipline C6/C21 adopted.

## 6. DB-backed zero-write witness (`DATABASE_URL=<shadow> npm run witness:sanctuary-keep`)

**Evidence class**: real route handlers (`POST`, `DELETE`) → real `getMemberIdFromRequest` via the `x-session-token` path against a real `auth_sessions` row → real `lib/db/postgres` pool → `manuscript_keeps` rows **counted** before and after. The one shim: `next/headers` `cookies()` returns no cookie (it cannot exist outside a Next request scope), so auth takes the header path the route already serves for Safari/iOS. ⛔ The witness refuses a `DATABASE_URL` that looks like production.

**Shadow**: disposable PostgreSQL 16 cluster in this container (`initdb`, port 5499, trust auth, destroyed after), with exactly `20260103000001_members` · `20260119000001_auth_sessions` · `20260721000003_press_manuscript_room` applied.

**Run of record** (identifiers + counts only; no `verbatim_text` in the record):

```
W-0 baseline_count=0
W-1 status=200 json={"success":true,"sanctuary":true,"persisted":false} count=0 delta=0
W-2 status=400 error=posture_required count=0 delta=0
W-3 status=400 error=posture_required count=0 delta=0      (sanctuary:'false')
W-4 status=201 keep_id=<uuid> count=1 delta=1              (sanctuary:false)
W-5 status=200 removed=true count=0 delta=0                (DELETE with ?sanctuary=true + x-sanctuary header)
6 passed, 6 total · fixture rows removed · shadow manuscript_keeps=0, members=0 afterwards
```

The refusal log line observed was `[SANCTUARY] write refused { store: 'manuscript_keeps', sessionIdPrefix: null }` — metadata only.

## 7. Gates

- `npm run matrix:ws-sanctuary-keep` — **27/27**
- `npm run witness:sanctuary-keep` (shadow) — **6/6**
- `npm run typecheck` — **226 errors vs baseline 239 · 0 regressions · exit 0** (run twice: after the repair, and after the comment-only change)
- `npm run check:no-supabase` — clean
- neighbouring: `lib/sanctuary/__tests__` · `keepsReadDoctrine` · `manuscripts/blank` route · `sessionSanctuaryInit` — all PASS

## 8. What S1 does not establish

- ⛔ Not deployed; not merged; production still carries the canonical route.
- ⛔ Not a member-witnessed behaviour: the Press notice copy is rendered by a controlled test, not seen by a member (E4-level, not E5).
- ⛔ Not a Writer's Studio boundary — no Writer's Studio surface writes `manuscript_keeps`; when one does, it must carry posture the same way.
- ⛔ Not a Sanctuary read-suppression law; GET unchanged.

## 9. Attestation

- population: exactly §2 · schema: none · migrations: none · new store: none · `turnPosture.ts`: untouched · C1 files: untouched · production: untouched
- serving model: this act was built under a session whose serving model flickered between the configured `claude-fable-5-1` and a fallback during the turn; commit attribution follows the harness's per-commit instruction.
- **Next act: founder adjudication of S1.** Then `FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1A` (separately authorized; opened after this record, on its own lineage).
