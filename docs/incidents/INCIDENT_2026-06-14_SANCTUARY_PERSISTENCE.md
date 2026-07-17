# Privacy & Sovereignty Incident — Sanctuary Content Persistence — 2026-06-14

**Classification**: Privacy and sovereignty incident (internal unauthorized retention).
Not evidenced as external disclosure. **Incident ID**: `SANC-20260614-01`.

**STATUS: CLOSED (technical remediation) — 2026-07-17.** Remaining open item: member
notification (prepared, awaiting Kelly's fact-check and send — see
`MEMBER_NOTIFICATION_DRAFT_SANC-20260614-01.md`). Severity classification (Kelly,
2026-07-17): **Severity: Medium · Exposure: Limited · Members affected: 1 ·
Cross-member exposure: none evidenced · Human review: none evidenced · Promise
violation: confirmed.** The serious element is not scale but the discrepancy:
member expectation ≠ actual persistence behavior.

**Closure summary (all verified in production)**:
1. Escaped content deleted from all four lanes, count-verified (this document's
   execution log).
2. Store-boundary enforcement deployed (`33ec88ac6`): PR #629 — per-turn
   `TurnPosture`, refusal at TurnsStore / corpus-callosum / session-history lanes;
   merge-gated by runtime proofs A/B/C (13/13, incl. named assertion
   HISTORY_JSONB_ZERO_APPEND and mid-session transition with no retroactivity).
3. Legacy ungated oracle lane disabled (PR #630), live-verified: 410 before body read.
4. Episodic-mark server guard shipped separately (PR #625, interim defense-in-depth).
5. All 30 contaminated backup dumps intentionally destroyed ahead of retention,
   audit-first, with a verified clean backup preserved
   (`BACKUP_DESTRUCTION_AUDIT_SANC-20260614-01.md`).
6. Standing refusals recorded: R19 (lane disabled), R20 (Proposed — sanctuary content
   may never survive backup restoration; enforcement lands in S5), R21 (store-boundary
   refusal).

**Constitutional finding carried forward (Kelly)**: *Sanctuary is not a session
property. Sanctuary is a per-turn posture.* Session metadata alone cannot enforce
Sanctuary — the S5 provenance phase (turn-level `postureAtCreation`, deletion
manifests, restore filtering) is the next architectural priority after closure.

**Working statement (Kelly-ratified, 2026-07-17)**:
> On June 14, 2026, during one member's Sanctuary use, five requests resulted in ten
> conversation-turn records and forty-four corpus-callosum records being persisted
> despite the Sanctuary promise that the exchange would not be remembered. There is no
> current evidence of cross-member exposure or human review. The investigation did not
> inspect the content. The persistence resulted from the absence of
> server-authoritative, per-turn Sanctuary enforcement.

*(Derivative sweep on 2026-07-17 additionally identified 5 `integration_passes` rows
and 5 sanctuary-window entries inside the session's `conversation_history` jsonb — see
scope below. Counts updated accordingly; the mechanism finding is unchanged.)*

---

## Audit record (non-content, created BEFORE deletion)

| Field | Value |
|---|---|
| Incident ID | SANC-20260614-01 |
| Incident window | 2026-06-14 12:44:32 – 12:58:26 UTC (5 sanctuary requests; evidence: `runtime_events.is_sanctuary=true`, the only such rows in production history) |
| Affected member | 1 (member id prefix `ce284751`; identifiable to founder operationally) |
| Affected session | `session_1781360679324` |
| Route | `sovereign/app/maia/list` (live route) |
| Evidence basis | 5-for-5 minute-exact timestamp correlation in a sanctuary-only traffic window; content never read (counts/lengths/timestamps only) |
| Investigation content access | **None** — no content column was ever selected |

### Deletion scope (content-bearing records)

| Lane | Predicate | Expected rows |
|---|---|---|
| `conversation_turns` | `session_id='session_1781360679324' AND created_at BETWEEN '2026-06-14 12:43:30+00' AND '2026-06-14 13:00:00+00'` | 10 |
| `agent_runs` | same session + window | 44 (35 with non-empty `output_text`) |
| `integration_passes` | same session + window (`final_text`/`inputs` are content-bearing) | 5 |
| `maia_sessions.conversation_history` | remove jsonb array elements with `timestamp >= 2026-06-14T12:44:00Z` (5 of 12 entries — element timestamps match the sanctuary requests; filtering is by timestamp key only, content not read); 7 pre-sanctuary entries retained | 12 → 7 elements |

### Derivative lanes — verified findings (2026-07-17 sweep)

| Lane | Finding |
|---|---|
| `member_theme_signals` | **zero** (caller gate held) |
| `episodic_memories` | **zero** that day |
| `member_memory_atoms` | **zero** kept that day; lane otherwise *not attributable* (no session linkage exists) |
| `session_summary_queue` | zero for session |
| `maia_sessions.summary` | empty |
| `consciousness_traces`, `embedding_jobs`, `bardic_episode_embeddings`, `state_vectors` | **zero** in window/day |
| `journal_memory_packets` | **not applicable** (journal-derived, not conversation-derived) |
| `comms_analysis_queue` | not applicable (message-queue metadata; no conversation content path) |
| `runtime_events` | metadata only by design (`is_sanctuary` flag rows retained as incident evidence; `member_id_prefix` was correctly nulled) |
| **Database backups** | **CONFIRMED PRESENT**: 30 nightly `pg_dump` archives (`~/MAIA-SOVEREIGN/database/backups/maia_backup_*.sql.gz`, 2026-06-17 → 2026-07-17) all contain the escaped rows. Under immediate operational control but **not modified by this deletion**. They age out on ~30-day rotation (last contaminated dump expires ~2026-08-16) unless Kelly directs earlier destruction. Off-site: none (offsite pipeline not live; `offsite/` empty). |
| Immutable/external backups | none known |

### Residual uncertainty

- Any sanctuary use predating the observability layer or on non-instrumented routes
  would be invisible to this method; the five events are the only *traceable* use.
- `member_memory_atoms` is permanently unattributable for sanctuary origin (no
  session linkage). No positive evidence of an atom escape exists.
- Deletion from the live database does not remove the rows from the 30 existing
  nightly dump files (reported above; not claimed otherwise).

### Deletion execution

| Field | Value |
|---|---|
| Authorized by | Kelly (ruling K3, 2026-07-17) |
| Operator | Claude Code session (this document's author), executing under K3 |
| Method | Single psql transaction (BEGIN … COMMIT) on `maia-postgres` / `maia_consciousness` |
| Transaction reference | see appended execution log below |
| Verification | count-only re-queries of every predicate = 0 (and history = 7 elements), appended below |

### Corrective action shipped alongside

- PR #626 (merged `6243294df`): inferred themes removed from Circles pulse (separate
  defect, same governance phase).
- Sanctuary S1 PR (store-boundary refusal in `TurnsStore` + `corpusCallosumService` +
  `integration_passes` writer): opened this phase — closes the exact paths that
  persisted this incident's content.
- Legacy oracle lane containment: separate PR per K4.

---

## Execution log

**Executed**: 2026-07-17, single transaction on `maia-postgres` / `maia_consciousness`
(via `ssh soullab@minisforum`, `docker exec maia-postgres psql`).

```
BEGIN
DELETE 10   -- conversation_turns (sanctuary window of session_1781360679324)
DELETE 44   -- agent_runs (same session + window)
DELETE 5    -- integration_passes (same session + window)
UPDATE 1    -- maia_sessions.conversation_history: jsonb elements with
            -- timestamp >= 2026-06-14T12:44:00Z removed (filter by timestamp
            -- key only; content not read)
COMMIT
```

**Post-deletion verification (count-only)**:

```
turns_remaining               | 0
agent_runs_remaining          | 0
integration_remaining         | 0
history_elements              | 7   (was 12; 5 sanctuary entries removed)
pre_sanctuary_turns_retained  | 4   (legitimate non-sanctuary turns, kept)
```

**Result statement**:

```text
Deleted confirmed escaped content:
- 10 conversation turns
- 44 corpus-callosum agent_runs rows
- 5 integration_passes rows
- 5 sanctuary-window entries from maia_sessions.conversation_history

Zero records (verified):
- member_theme_signals, episodic_memories, member_memory_atoms (that day),
  session_summary_queue, maia_sessions.summary, consciousness_traces,
  embedding_jobs, bardic_episode_embeddings, state_vectors

Unverifiable / not attributable:
- member_memory_atoms as a lane (no session provenance exists — no positive
  evidence of escape, attribution permanently impossible)
- any sanctuary use outside the instrumented window

Not modified (reported, not erased):
- 30 nightly pg_dump archives (2026-06-17 → 2026-07-17) containing the
  now-deleted rows; ~30-day rotation expires the last contaminated dump
  ~2026-08-16 unless Kelly directs earlier destruction. No off-site copies.
```
