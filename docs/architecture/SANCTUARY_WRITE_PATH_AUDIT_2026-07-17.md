# Sanctuary Write-Path Audit & Isolated Patch Plan — 2026-07-17

**Status**: Audit + patch plan (register D4). Read-only audit; **no code changed in this
phase**. The episodic-mark server-side guard is being fixed in a separate isolated
session and is included in the table for completeness only.

**Governing rule (ratified, register R10)**: *Sanctuary content may not cross its
boundary because a client failed to hide a control.* Server-side enforcement, by
container provenance, is required.

---

## 1. Headline finding — Sanctuary has no server-authoritative provenance

Sanctuary state is a **client-asserted, per-request boolean** (`sanctuary` /
`meta.sanctuary` in the request body: `app/api/between/chat/route.ts:841`,
`app/api/sovereign/app/maia/list/route.ts:408`, `lib/sovereign/maiaService.ts:~3037`,
`lib/sovereign/maiaOrchestrator.ts:370`).

`maia_sessions` has `mode`/`privacy_mode` columns admitting `'sanctuary'` (migration
`20260210200001`), but the mode is only reliably set at session close — and no
content-bearing table (`conversation_turns`, `member_theme_signals`, `agent_runs`,
`integration_passes`, `member_memory_atoms`, `member_spiral_state`) carries a sanctuary
flag or a reliable FK to join against it. The only per-row sanctuary provenance in the
system is `runtime_events.is_sanctuary` — and that table holds no content by design.

**Consequence**: no write route can independently verify that a given
`session_id`/`turn_id` originated in Sanctuary. Every guard in the system ultimately
trusts the client flag on that request, and most guards live in *callers*, not at the
store boundary — the exact shape R10 prohibits.

## 2. Write-path table

| # | Path | Persists content? | Sanctuary check today | Smallest reliable enforcement point |
|---|------|-------------------|-----------------------|-------------------------------------|
| 1 | `app/api/sovereign/episodes/mark/route.ts` | verbatim episodic mark | **client-side only** (UI hides the control) | route body — **in-flight fix, separate session** |
| 2 | `app/api/sovereign/quotes/candidates/route.ts` | **nothing** ("proposes, never keeps") | n/a | none needed ✓ |
| 3 | `app/api/psyche/portfolio/keep` → `keepSource` → INSERT `member_memory_atoms` (`lib/psyche/portfolio.ts:373`) | kept atom title/body | **none server-side** (shape validation only); route receives **no session_id at all** | `keepSource` (store boundary) |
| 4 | `storeThemeSignal` → `member_theme_signals` (`participatoryRealityHelper.ts:100`) | theme + context | caller-gated (`between/chat:1985`, `maiaService:~3585` check `!isSanctuary`); the store itself writes unconditionally | the store function |
| 5 | Turns: `TurnsStore.addExchange` | full user + assistant content | caller-gated in `maiaService:3038` and `voice/persist:39`; **ungated callers exist**: `sessionManager.ts:81`, `MemoryOrchestrator.ts:617`. A proposed `shouldPersistTurn` guard (`sanctuaryGuards.ts`) exists but is **not wired** | `TurnsStore.addExchange` (store boundary) |
| 5b | Summaries: `SessionSummaryStore.writeSessionRecord:56` | summary | **boundary-enforced ✓** (`isSanctuary → null`) | already correct — the model to copy |
| 5c | `sessionFinalizer.ts:125` | sanctuary handling = **after-write purge** (`deleteBySessionId`) + metadata row | yes, but purge-shaped: a **race window** exists between mid-session turn writes and finalize; a crash before finalize leaves content | superseded once 5 is boundary-enforced (write-suppression beats purge) |
| 6 | Anchors | anchor creation gated at `between/chat:2211` (`!sanctuary`); no dedicated write route found | caller-gated | store/service boundary when touched next |
| 7 | Corpus callosum `logAgentRun`/`logIntegrationPass` (`corpusCallosumService.ts:113,167`) | **yes — `input_summary` + `output_text` are content** | **none in service**; caller-gated only (`maiaOrchestrator:802`, `maia/list:1156`); the service has no sanctuary parameter | the service (add param + early return) |
| 8 | `upsertSpiralState` → `member_spiral_state` (`spiralStatePersistence.ts:148`) | structural only (element/phase, no content) | none — **acceptable**: metadata-only by design | none needed (document as metadata-class) |
| 9 | `sessionMemoryService.storeSessionPattern` (`app/api/oracle/conversation/route.ts:1445`) | **full messages array** | **NONE** — the oracle route has no `isSanctuary` variable; relies on an unverified comment that sanctuary "structurally does not reach" it (`:2445`) | route gate or retirement (see §4) |
| 9b | `storeCMLayerSignal` (`oracle/conversation:2355`) | `message.substring(0,200)` — content | **none** | same as 9 |
| 10 | `runtime_events` (`substrateObservability.ts:117`) | metadata only; sets `is_sanctuary`, nulls member prefix under sanctuary | **boundary-safe ✓** | none needed ✓ |
| 11 | `sessionManager.addConversationExchange` | `conversation_history` jsonb + turns | **none** | via 5's store-boundary fix |

## 3. Upstream-gate assessment

The **live** route (`app/api/sovereign/app/maia/list/route.ts`) has a coherent gate:
`isSanctuary` computed once (L408) and every memory writer/loader wrapped
(L440, 649, 700, 1156, 1174, 1193, 1233). `maiaService`/`maiaOrchestrator` re-check
independently. So on the primary traffic path, the boundary **is** enforced — but by
caller discipline over a client flag, which fails R10 in principle and has already
failed in fact at every path listed above that sits outside the gate.

**Writers outside any gate**: the legacy `oracle/conversation` route (9, 9b — plus its
persistTrace/upsert calls), `sessionManager.ts:81`, `MemoryOrchestrator.ts:617`, and
every store that is caller-enforced rather than boundary-enforced (4, 5, 7, and
`keepSource`, which cannot even see a session).

## 4. Has escape already occurred?

**Cannot be determined from the schema — and that is itself the finding.** With no
sanctuary provenance on content tables, there is nothing to join against.
`member_memory_atoms` has **no session_id column at all** and is permanently
un-auditable for sanctuary origin. Partial checks are possible only where
`maia_sessions.mode='sanctuary'` was populated at finalize:

```sql
-- Valid only for sessions that reached finalize with mode recorded:
SELECT ct.*  FROM conversation_turns ct  JOIN maia_sessions s ON s.id = ct.session_id  WHERE s.mode = 'sanctuary';
SELECT ar.session_id, ar.turn_id FROM agent_runs ar JOIN maia_sessions s ON s.id = ar.session_id WHERE s.mode = 'sanctuary';
SELECT mts.* FROM member_theme_signals mts JOIN maia_sessions s ON s.id = mts.session_id WHERE s.mode = 'sanctuary';
```

These should be run on the production database (minisforum) as the first act of the
patch phase. Zero rows would be reassuring, not conclusive.

**Classification**: no *confirmed* active content escape on the live traffic path (the
maia/list gate is coherent). But the boundary is **structurally unenforced** — ungated
legacy writers are deployed, the purge design has a race window, and the whole scheme
trusts the client. Under R10 this is a **sovereignty defect** requiring an isolated
patch, prioritized ahead of all reflection work (register P1), even though it does not
trigger the "confirmed active escape → drop everything" clause. If the production
queries above return rows, that clause triggers and the patch becomes the immediate
implementation priority.

## 5. Isolated patch plan (not combined with reflection architecture)

Ordered so each step is independently shippable and testable:

1. **Run the §4 production queries** on minisforum; record results in the register.
2. **Store-boundary enforcement** (the smallest reliable fix — copy the
   `SessionSummaryStore` pattern of suppress-at-write):
   - Wire `shouldPersistTurn` into `TurnsStore.addExchange` (closes 5, 5c's race, 11).
   - Add an explicit `isSanctuary` parameter with early-return to
     `corpusCallosumService.logAgentRun`/`logIntegrationPass` (7), `storeThemeSignal`
     (4), and `storeCMLayerSignal` (9b). Callers that cannot supply it fail closed.
   - Guard `keepSource` (3): the keep route must carry session provenance; until it
     does, keeps made during a sanctuary session must be refused client-and-server
     (design note: keeping *is* a member gesture, but Sanctuary invariant 6 is absolute
     — no save even by member request; the UI already hides the control, the server
     must refuse too).
3. **Retire or gate the legacy lane**: `oracle/conversation/route.ts` writers (9, 9b)
   either get the same `isSanctuary` gate as maia/list or — preferable given its
   near-zero traffic — the route is disabled pending the long-planned cleanup.
4. **Provenance foundation** (the durable fix): record sanctuary at session *start* —
   set `maia_sessions.mode='sanctuary'` on open, not only at finalize — so any writer
   holding a `session_id` can verify server-side. Add `session_id` to
   `member_memory_atoms` writes going forward (schema change; needs the standard
   migration + covenant path — flagged, not designed here).
5. **Constitutional tests**: refusal-registry checks asserting (a) each §2 store
   refuses sanctuary-flagged writes, (b) no content table gains rows for a sanctuary
   session in an end-to-end fixture, (c) the mark route (from the parallel fix) denies
   by provenance. Pattern: `tests/constitutional/refusal-registry/refusal-02*`.
6. **Verify in production** per the standard deploy-verification path, then re-run the
   §4 queries as a standing periodic check until provenance (step 4) makes them
   real-time enforceable.

Steps 1–3 need no schema change and constitute the minimum honest claim of "server-side
enforced." Step 4 is what makes R10's "deny by container provenance" literally true.

## 6. Interaction with the in-flight mark-route fix

The separate session fixing `episodes/mark` addresses row 1 only. Its fix should adopt
step 4's provenance source once available; until then it can only check what exists
(session-state resolution at write time). This audit supersedes neither — it places that
fix as one item in the full closure set.
