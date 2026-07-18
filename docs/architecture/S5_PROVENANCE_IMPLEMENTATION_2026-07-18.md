# S5 Provenance Substrate — Implementation Record — 2026-07-18

**Status**: BUILT + merge-gate rehearsed (branch `feature/s5-provenance`); NOT deployed.
Deploy requires the FULL path (`scripts/deploy-production.sh`) — this ships a schema
migration. **Merge-gate proofs A–E all PASS on a production-shaped disposable copy** —
see [`S5_MERGE_GATE_REHEARSAL_2026-07-18.md`](S5_MERGE_GATE_REHEARSAL_2026-07-18.md),
including the two defects the rehearsal found and fixed (empty-search_path trigger
breakage; governed restore lane for historical replay). Per Kelly's ruling this PR is
**S5 Foundation — Provenance Minting and Restore Governance**, not S5 complete.

**Governs**: the implementation half of
[`S5_PROVENANCE_CONSTITUTION_2026-07-18.md`](S5_PROVENANCE_CONSTITUTION_2026-07-18.md)
under the ratified charter
([`SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_DESIGN_2026-07-17.md`](SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_DESIGN_2026-07-17.md) Part 4)
and Kelly's 2026-07-18 directive: *bring provenance to A standard; do not work on new
reflective intelligence features until S5 is complete.*

---

## 1. What shipped (this change)

**Migration `20260718000001_s5_provenance_substrate.sql`** — all content-free:

| Piece | What it does |
|---|---|
| `runtime_consent_state` | Per-request posture record, written server-side at the serving boundary. The flip from "posture asserted by request flag" to "posture recorded by the server". |
| `deletion_manifests` / `deletion_manifest_scopes` / `provenance_tombstones` | Sovereignty-driven deletions become first-class, content-free objects. The SANC-20260614-01 deletion is seeded as the first manifest with its exact predicates (session + window per lane). |
| `s5_refuse_tombstoned` triggers (turns, agent_runs, integration_passes) | BEFORE INSERT: silently DROP any row that is tombstoned or inside a manifest scope, with a metadata-only warning. Fires on COPY → a data-only pg_restore cannot resurrect forgotten rows. |
| `conversation_turns.posture_at_creation` + `provenance` | Historical rows explicitly `'unknown-historical'` (never silently "normal"); default then dropped so the state can never be minted again. |
| `s5_require_minted_provenance` trigger (turns) | Refuses ANY turn INSERT lacking posture `'normal'` + all six constitutional provenance keys. Sanctuary rows structurally cannot persist (DB-level backstop for S1). Even raw SQL cannot write an unattested turn. |
| `member_memory_atoms.posture_at_creation` + `generated_by` | Same historical honesty (`'unknown-historical'` / `'unattributed-historical'`). |
| `s5_require_atom_attestation` trigger | New atoms must be posture `'normal'` with a mintable `generated_by`. |
| `s5_refuse_unknown_collective` trigger | An unknown-historical atom can never have `crossing_allowed` newly enabled (constitution §7: permanently ineligible for collective use). Existing values untouched — a member gesture that already set them is itself provenance. |
| posture columns on `episodic_memories`, `member_theme_signals`, `agent_runs`, `integration_passes` | Historical backfill `'unknown-historical'`; `NULL` on a new row = "post-S5 write from a not-yet-wired writer" — truthfully distinct from unknown-historical. |

**Code**:

- `lib/provenance/provenance.ts` — nominal `Provenance` class (private ctor, frozen),
  minted only from a genuine `TurnPosture`; sanctuary posture yields NO durable object
  (mint refused, metadata-only log `[PROVENANCE] mint failed / mint refused`).
- `lib/provenance/consentState.ts` — `recordConsentState` (fire-and-forget, at every
  boundary where `TurnPosture.resolve` runs: `getMaiaResponse`, `maiaOrchestrator`,
  voice persist, translate, conversation/turns) + `resolveRecordedPosture` (absence →
  `null`, fail closed — never "normal").
- `lib/memory/stores/TurnsStore.ts` — mints provenance server-side at the store per
  turn (member turn: `member`/`member-utterance`; MAIA turn: `maia`/`synthesis`;
  typed source `{type:'turn', turnId, sessionId}`) and writes it with the row.
- `app/api/conversation/turns/route.ts` — **the pre-S5 raw INSERT lane (which bypassed
  even S1) is closed**: posture resolved at the boundary, recorded, and writes go
  through the store.
- `lib/services/corpusCallosumService.ts` — agent_runs/integration_passes rows record
  `posture_at_creation='normal'` (writes only occur past the S1 gate).
- `lib/psyche/portfolio.ts` — kept atoms minted `'normal'`/`'member-gesture'`.
- `app/api/studio/with-me/sessions/[sessionId]/route.ts` — witnessed atoms minted
  `'normal'`/`'practitioner-observation'` (honest union extension: practitioner-authored
  is not machine inference).
- `app/api/sovereign/episodes/mark/route.ts` — marks record `'normal'` (justified by
  the R18 server-side sanctuary guard that precedes the INSERT).

**Restore governance (R20)**:

- `scripts/restore-governed.sh` — THE restore path: preserves the governance tables
  across a full restore, re-applies them, sweeps tombstoned/scoped rows, requires
  `RESTORE_AUTHORIZED_BY`, reports counts only. Member-only scopes are refused LOUDLY
  (per-object tombstones required for member deletions). Declares the **governed
  restore lane** (`SET s5.restore_lane = 'governed'`) — the only condition under which
  the mint gates admit historical replay, so an ungoverned raw replay of a historical
  dump fails loudly at the database itself. Supports `RESTORE_DB_URL` for host-postgres
  stacks and rehearsals against disposable copies.
- `scripts/restore-db.sh` — refuses by default; explicit
  `I_UNDERSTAND_THIS_RESTORE_IS_UNGOVERNED=yes` override for non-sovereign data only.

**Verification**:

- Refusal registry: R20 upgraded Proposed→**B** (structural, residual named); new
  **R22** "no durable object may be written without knowing what governed its creation"
  grade A-minus. Harness: **96 passed · 0 failed · 0 warned (21 refusals)** — the
  standing R20 warn is gone.
- `tests/constitutional/sanctuary-s5-behavioral-proof.ts` — **12/12 against a real DB**
  (local dev): raw unattested INSERT refused; unknown-historical unmintable (turns +
  atoms); store-minted rows carry complete provenance; tombstoned re-insert dropped;
  in-scope re-insert dropped (the incident's predicate shape); consent-state resolvable;
  absent record → null. Run with `DATABASE_URL` against local dev, NEVER production.
- Typecheck clean (0 errors).

## 2. The seven questions — coverage after this change

| Question | Turns | Atoms | Marks | Themes | Corpus | Chapters/Reflections |
|---|---|---|---|---|---|---|
| Who created me? | ✅ minted | ✅ minted | ✅ (marked_by_member) | partial | ids | born under constitution (frozen) |
| What generated me? | ✅ | ✅ `generated_by` | ✅ (member act) | column, writer unwired | ✅ 'normal' stamp | — |
| What posture governed me? | ✅ structural | ✅ structural | ✅ (guard + column) | column, writer unwired | ✅ | — |
| May I persist? | ✅ (mint gate) | ✅ | ✅ | soft | ✅ (S1 gate) | — |
| May I become collective? | policy in provenance | ✅ unknown→never (trigger) | n/a | n/a | n/a | — |
| May I be restored? | ✅ tombstone/scope filter | ✅ tombstone table ready | ready | ready | ✅ filtered | — |
| May I be forgotten? | ✅ manifests | ✅ | ✅ | ✅ | ✅ | — |

## 3. Honest state language (six-category typology)

- **Built + locally proven, awaiting deploy**: everything in §1. Not "live" until the
  full deploy runs the migration and the S5 proof pattern is observed under production
  traffic (`[PROVENANCE]` markers).
- **Deliberately NOT in this change** (each needs its own small wire, in priority order):
  1. Remaining `episodic_memories` writers (`sessionProcessor`, `memory/ingest`,
     `journal/quick`, `EpisodicMemoryService`) — posture column exists; strict gate
     arms once all writers attest.
  2. `member_theme_signals` writer (`participatoryRealityHelper`) — same pattern.
  3. `maia_sessions.conversation_history` jsonb — constitution says this duplicate
     content lane with weaker provenance **should not survive S5** (inherit or retire).
     Retirement is a separate reader-migration change; S1 already blocks its sanctuary
     appends.
  4. Queued/background writers resolving posture from `runtime_consent_state` by
     request id (the record now exists and is written; consumers still receive posture
     by reference).
  5. Member-facing surfaces showing provenance (member-pulled only, per canon).
- **Residual named in R20 (grade B, not A)**: an out-of-repo raw `psql` full restore
  bypasses both layers until the sweep runs; that path stays operationally governed
  (founder-present, via `restore-governed.sh`).

## 4. Deploy + verify (when Kelly merges)

```bash
# FULL deploy (schema change — never the quick path):
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN && git fetch origin clean-main-no-secrets \
  && git checkout clean-main-no-secrets && git pull && ./scripts/deploy-production.sh deploy'

# Verify substrate live:
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT count(*) FROM deletion_manifests; SELECT tgname FROM pg_trigger WHERE tgname LIKE '\''s5_%'\'';"'

# Verify minting under real traffic (first ordinary turn after deploy):
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT posture_at_creation, provenance IS NOT NULL AS has_prov, count(*) \
   FROM conversation_turns WHERE created_at > NOW() - INTERVAL '\''1 hour'\'' GROUP BY 1,2;"'

# Refusal markers (should appear ONLY on genuine refusals):
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep "PROVENANCE"'
```

Expected after deploy: new turns show `normal | true`; historical rows remain
`unknown-historical`; zero `[PROVENANCE] mint failed` markers under ordinary traffic.

## 5. Design test compliance (constitution §10)

1. Seven questions answerable at creation, server-side — **yes** for turns/atoms
   (structural), partially for episodic/themes (named above).
2. Persistence policy derives from provenance — **yes** (policy lives inside the minted
   object; `collectiveEligible` default false; unknown→never-collective is a trigger).
3. Store refuses when answers are missing — **yes**, at TWO layers (store + DB).
4. Deletion leaves a manifest a restore must obey — **yes** (manifests/scopes/tombstones
   + governed restore + insert-time filters).
