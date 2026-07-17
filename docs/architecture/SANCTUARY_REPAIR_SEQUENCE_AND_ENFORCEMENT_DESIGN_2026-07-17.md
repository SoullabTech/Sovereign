# Sanctuary Repair — Ranked Sequence, Enforcement Design, First Patch Proposal — 2026-07-17

**Status**: Registers B2 (ranked sequence), B3 (authoritative enforcement design), and
the isolated proposal for the **first confirmed active defect**. Design and proposal
only — no code changed. Grounded in `SANCTUARY_WRITE_PATH_AUDIT_2026-07-17.md` (static)
and `SANCTUARY_PRODUCTION_EVIDENCE_2026-07-17.md` (production evidence, confirmed
escape 2026-06-14).

---

## Part 1 — Ranked patch sequence (B2)

Ranking criteria (per ruling): full content > derived; live reachability; persistence
irreversibility; cross-member exposure; absence of server-side enforcement. One bounded
defect per PR.

| Rank | Defect | Why here | PR shape |
|---|---|---|---|
| **1** | **Turn persistence + corpus callosum write during sanctuary on the LIVE route** (`TurnsStore.addExchange` via `sessionManager:81` / `MemoryOrchestrator:617`; `corpusCallosumService.logAgentRun/logIntegrationPass`) | Full content; **empirically escaped in production** (the confirmed 2026-06-14 escape); live route; no store-side check | **PR S1** — proposal in Part 3 |
| 2 | **Legacy oracle lane content writers** (`app/api/oracle/conversation/route.ts`: `storeSessionPattern` full messages array, `storeCMLayerSignal` 200-char content; no `isSanctuary` anywhere in the route) | Full content; deployed on main (verified present), reachable if called; ~zero observed traffic but zero enforcement | **PR S2** — gate the route's writers with the same store-boundary calls as S1, or disable the route (preferred; it is the long-planned cleanup target). Small, isolated |
| 3 | **Episodic-mark server guard** (in-flight separate session) | Full verbatim content, but requires a deliberate member gesture whose UI is hidden in sanctuary — narrower window than 1–2 | **PR S3** — already running; keep classification honest: interim defense-in-depth; provenance-less requests remain outside the guarantee until Part 2 ships |
| 4 | **`keepSource` / atoms** (no session provenance at all — un-auditable forever) | Full content, member-gesture-gated; the defect is *unattributability* more than active writing | **PR S4** — refuse keeps carrying a sanctuary write-context; add `session_id`/typed `source` to atom writes (schema change; pairs with Part 2 provenance and the typed-source direction Kelly ruled) |
| 5 | **Per-turn provenance foundation** (Part 2 design) | Converts every fix above from "trust the request flag" to "verify server-side"; enables real audits | **PR S5** — the governed write-context + `runtime_consent_state`; medium |
| 6 | Remaining derived writers under the governed context (semantic/session-memory stores, summaries already boundary-safe, anchors, analytics payload sweep) | Derived content; mostly caller-gated today | **PR S6+** — mechanical adoption of the Part 2 context, one store per PR where practical |
| 7 | **Production remediation of the 2026-06-14 escape** (delete the 10 sanctuary-window turns + 44 correlated agent_runs) | Not a code defect — a data action requiring explicit Kelly authorization (evidence report §6) | Standalone authorized operation, logged in the register |

## Part 2 — Authoritative enforcement design (B3)

**Requirement**: *Sanctuary provenance is resolved server-side, and protected stores
refuse writes regardless of caller behavior.* The production evidence adds a second,
non-negotiable requirement: **provenance must be per-request/per-turn, not
per-session** — the confirmed escape came from a member enabling Sanctuary
mid-session, which session-level state records as `standard`.

### 2.1 Shape: a governed write context

```ts
// lib/memory/writeContext.ts (new, small)
type SanctuaryDisposition = 'protected' | 'normal';

interface GovernedWriteContext {
  memberId: string;
  sessionId: string | null;
  turnId: string | null;
  sanctuary: SanctuaryDisposition;
  resolvedBy: 'runtime_consent_state' | 'request_flag' | 'absent';
}
```

- **Resolution, not assertion**: the context is built once per request at the route
  boundary by a single resolver. In phase one the resolver still consumes the client
  flag (there is nothing else), but it *records* `resolvedBy: 'request_flag'` — the
  trust downgrade is explicit and auditable. In phase two the resolver writes a
  `runtime_consent_state` row (turn-scoped: `session_id`, `turn_id`, `is_sanctuary`,
  `created_at` — **no content**) at request start, and downstream/async writers resolve
  from that row instead of from anything the caller passes. That gives background
  writers (corpus callosum writeback, finalizers, queue consumers) a server-side
  source of truth that survives detachment from the original request.
- **Store-level refusal**: each protected store's write function takes the context as
  a **required** parameter and refuses when `sanctuary === 'protected'`. Copy the
  proven `SessionSummaryStore` suppress-at-write shape; do not duplicate policy logic —
  each store calls one shared `assertWritable(ctx, 'store-name')` helper that throws a
  typed `SanctuaryRefusal` and emits a discoverable log marker
  (`[SANCTUARY] write refused { store, sessionIdPrefix }`).
- **Absent provenance fails closed for protected stores**: `resolvedBy: 'absent'`
  (a caller that cannot say) is treated as refusal for content stores, with a loud
  error — an untyped "came from nowhere" write is exactly what the evidence showed we
  cannot audit later. This is the enforcement-side of Kelly's typed-source direction
  for durable memory (`{type:'session'|'member_import'|'migration'}`); the full typed
  union ships with S4/S5, but fail-closed starts at S1 for the stores S1 touches.
- **Purge demoted to backstop**: suppress-at-write is primary; `sessionFinalizer`'s
  purge remains as defense-in-depth but keys off `runtime_consent_state` (any
  sanctuary turn in session → purge that turn range), not off the session-level mode
  that proved wrong.

### 2.2 Migration of existing callers

Adopt store-by-store (PR sequence Part 1), not big-bang: a store's write signature
gains the required context; the compiler then enumerates every caller — including the
ungated ones the audit found — and each call site either builds the context at its
route boundary or inherits it. Callers that cannot produce one surface immediately as
compile errors rather than silent unguarded writes.

### 2.3 Test strategy

1. **Refusal-registry checks** (static): every protected store's write path contains
   the `assertWritable` call; no store write is reachable without a context parameter
   (grep-shape: content-store INSERT functions must take `GovernedWriteContext`).
2. **Behavioral fixture** (the class the static checks can't prove): an integration
   test driving a sanctuary-flagged request through the live route asserting zero new
   rows in `conversation_turns`, `agent_runs`, `member_theme_signals`,
   `episodic_memories` for that turn — the exact query pattern the production evidence
   used, run against a test database.
3. **Observability**: the `[SANCTUARY] write refused` marker makes production
   verification a log-grep, mirroring the project's established verification idiom.

### 2.4 Rollout

S1 (two stores, context in phase-one `request_flag` mode) → S2/S3 → S5
(`runtime_consent_state` + resolver flip to `resolvedBy:'runtime_consent_state'`) →
S4/S6 adoption. Each step is independently deployable and revertible; no step widens
any write path.

## Part 3 — Isolated patch proposal: PR S1 (first confirmed active defect)

**Defect**: during the only production sanctuary use, `TurnsStore.addExchange` and
`corpusCallosumService` persisted full content because their callers outside the
route's gate never checked, and the stores accept every write.

**Scope (one PR, no schema change)**:
1. `TurnsStore.addExchange`: require the governed write context (phase-one form);
   refuse `protected`; wire the already-written-but-unwired `shouldPersistTurn` guard
   (`sanctuaryGuards.ts`) into the store.
2. `corpusCallosumService.logAgentRun` / `logIntegrationPass`: same required context +
   refusal.
3. Update all compile-surfaced callers (`maiaService`, `voice/persist`,
   `sessionManager:81`, `MemoryOrchestrator:617`, `maiaOrchestrator` writeback,
   `maia/list:1156`) to pass the context resolved once at their route boundary.
4. Refusal-registry check R18 (store-boundary enforcement present; no context-less
   caller) + the behavioral fixture from 2.3.2.
5. Log marker for production verification.

**Explicitly out of scope**: `runtime_consent_state` (S5), atoms (S4), legacy oracle
route (S2), any deletion of escaped data (rank 7 — Kelly authorization required).

**Branch/PR discipline**: isolated branch off `clean-main-no-secrets`, same as PR #626;
stops at open PR.

## Stop

Per the workstream's stop conditions, Workstream B halts here: evidence report
delivered (B1), ranked sequence (Part 1), enforcement design (Part 2), first-defect
isolated proposal (Part 3). Implementation of S1 awaits Kelly's go; the escaped-data
deletion (rank 7) and member notification are Kelly's decisions (evidence report §6).
