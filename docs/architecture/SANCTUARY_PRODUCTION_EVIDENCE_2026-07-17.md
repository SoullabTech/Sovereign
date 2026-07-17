# Sanctuary Production Evidence Report — 2026-07-17

**Status**: Register B1, delivered. Read-only queries against production
(`maia-postgres` on minisforum, database `maia_consciousness`), run 2026-07-17. **No
production data was modified. No content columns were read** — all queries returned
counts, distinct-counts, timestamps, lengths, and mode flags only.

**Language discipline (per ruling)**: findings below distinguish *traceable* from
*occurred*. "No traceable escape found" is never represented as "no escape occurred."

---

## 1. Headline: one confirmed full-content escape, one day, one member

**Sanctuary has been used exactly once in production history**: five sanctuary requests
on **2026-06-14, 12:44–12:58 UTC**, all on the live route `sovereign/app/maia/list`
(evidence: `runtime_events.is_sanctuary = true` — 5 rows, the only such rows ever;
`member_id_prefix` correctly nulled by the observability layer).

During those minutes, content-bearing writes occurred and **remain in the database 33
days later**:

| Table | Rows in sanctuary window | Content? | Still present |
|---|---|---|---|
| `conversation_turns` | 10 (of the session's 14) — write minutes match the five sanctuary events **5-for-5** (12:44, 12:46, 12:47, 12:49, 12:58) | full user + assistant turn content | **yes** |
| `agent_runs` | 44, single session, single user | 35 rows with non-empty `output_text` | **yes** |
| `member_theme_signals` | 0 | — | the `!isSanctuary` caller gate **held** for themes |
| `episodic_memories` | 0 that day | — | no mark was attempted |

**Attribution basis — correlation, not recorded provenance**: the window contained
*only* sanctuary traffic (every `runtime_events` row in 12:43–13:00 has
`is_sanctuary = true`), all writes belong to one session (`session_1781360679324`) and
one user, and turn-write minutes match sanctuary-event minutes exactly. This is a
**confirmed full-content escape with high confidence**; it is not content-verified
because verifying would mean reading the member's sanctuary content, which we will not
do. The four turn rows before 12:44 are consistent with the member conversing normally
(first turn 12:41:53) and then enabling Sanctuary mid-session.

**Affected**: 1 member, 1 session, 1 day. Storage lanes: `conversation_turns` (full
content), `agent_runs` (content in `output_text`/`input_summary`). Date range:
2026-06-14 only.

## 2. The provenance record is not just absent — it is wrong

The escaped session's `maia_sessions` row reads **`mode = 'continuity'`,
`privacy_mode = 'standard'`** — while the runtime events prove five of its requests
were sanctuary. Consequences:

1. The audit's planned session-level joins return **zero rows by construction** —
   `maia_sessions` has no sanctuary-flagged rows in its entire history. Session-level
   queries are therefore *incapable* of finding this class of escape; the escape above
   was found only via `runtime_events` timestamp correlation.
2. The purge-at-finalize design (`sessionFinalizer` → `deleteBySessionId`) **could
   never have fired**: finalize consults a session record that says "standard."
3. Sanctuary is evidently **per-request state within a session** (the member toggled
   mid-session). Any session-level provenance design is structurally insufficient;
   provenance must be **per-turn/per-request**. This materially shapes the B3
   enforcement design.

## 3. Why the escape happened (mechanism, tied to the audit)

The live route gates its own writers on the client flag (`maia/list` L440–L1233), and
the theme-signal gate demonstrably worked (0 rows). But the turn-persistence and
corpus-callosum writes fired anyway — consistent with the audit's finding that writers
outside the route's own call sites (`sessionManager.addConversationExchange`,
`MemoryOrchestrator:617`, the `maiaOrchestrator` writeback path) call
`TurnsStore.addExchange` and `corpusCallosumService` **without any sanctuary check**,
and the stores themselves accept every write. Caller-convention enforcement failed in
production on the first real sanctuary use. This is the empirical case for
store-boundary enforcement (B3).

## 4. What cannot be reconstructed (stated plainly)

- **`member_memory_atoms`**: no `session_id` column — sanctuary origin is permanently
  unattributable. No traceable atom escape exists; whether one occurred cannot be
  determined from data. (Mitigation: keeps require a deliberate member gesture whose
  UI is hidden in Sanctuary; the client-side-only nature of that hiding is the known
  defect.)
- **Any sanctuary use that produced no `runtime_events` row** (e.g. before the
  observability layer existed, or on routes not instrumented) is invisible to this
  method. The five events are the only *traceable* sanctuary use; they are not proof
  that sanctuary was never used elsewhere.
- **Semantic/summary derivatives**: same-day derived writes (summaries, semantic
  memory) were not individually attributable; the summary store's boundary enforcement
  (`SessionSummaryStore` nulls under `isSanctuary`) depends on the same per-request
  flag its caller received, and cannot be retro-audited.

## 5. Circles field-pulse exposure sizing (companion query, containment plan §6)

`member_theme_signals` totals: **1,349 signals across 13 members, 2026-03-16 →
2026-07-13**. The ≥2-member/14-day aggregation returns **zero rows today** — no circle
currently displays inferred-theme pulse content. The Circles defect is therefore
**structural but not currently manifesting**; PR #626 closes it before it ever
manifests again. (It cannot be determined from present data whether past 14-day
windows ever crossed the threshold; the pulse computes live and stores nothing.)

## 6. Required remediation for the confirmed escape (for Kelly's decision)

The ten sanctuary-window turn rows and the 44 correlated `agent_runs` rows of
`session_1781360679324` still exist. Deleting them is **modifying production data**,
which this phase's ruling forbids without explicit authorization. Recommendation:
authorize a targeted, logged deletion of those rows (turns in the 12:44–12:59 window
of that session + the window's `agent_runs`), with the four pre-sanctuary turns
retained, and record the deletion in the decision register. The affected member is
identifiable to the founder operationally; whether to inform them is Kelly's call —
the Sanctuary promise ("this session won't be remembered") was not kept for those five
exchanges until deletion completes.

## 7. Summary against the directive's checklist

- Traceable sanctuary-derived writes: **yes** — `conversation_turns` (10),
  `agent_runs` (44/35-with-content), 2026-06-14, one member, one session.
- Full-content escape confirmed: **yes, by correlation** (sanctuary-only window,
  minute-exact match, single session).
- Derived-content escape confirmed: theme signals **no** (gate held); other derived
  lanes **unattributable**.
- Records unattributable due to discarded provenance: all `member_memory_atoms`;
  any non-instrumented route/time.
- Reconstruction limits: §4.
- Production data modified: **none**.
