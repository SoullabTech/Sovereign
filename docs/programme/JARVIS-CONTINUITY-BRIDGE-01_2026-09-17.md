# JARVIS-CONTINUITY-BRIDGE-01

**Opened:** 2026-09-17 · founder direction: “let's do it”
**Canonical base:** `clean-main-no-secrets @ 11e5d2254335`
**Branch:** `feature/jarvis-nemotron-c3-20260917`

```text
Class: A — development-memory custody / disclosure boundary
Governing authority: JARVIS Instructional Manual §§24, 25, 42–43 + founder direction 2026-09-17
Current gate: LOCAL CONTINUITY + BRANCH-AWARE RECALL IMPLEMENTED AND PROVEN; merge/deploy unopened
Evidence subject: local Claude Code MAIA archive + this branch at the canonical base above
Stop boundary: no external disclosure, no automatic frontier injection, no Claude-source mutation, no merge/deploy
```

## Purpose

Move development continuity out of any one model's private session memory and into a
JARVIS-owned local projection that can survive model changes while preserving source
provenance and founder authority.

The source archive remains authoritative. The continuity database is disposable and
rebuildable; it may orient a worker but cannot establish current repository/runtime truth.

## Invariants

1. **Source custody stays put.** Claude files under `~/.claude` are read, never rewritten.
2. **Projection is not authority.** Retrieval relevance never promotes a remembered claim.
3. **Local by default.** Every imported source/chunk enters as `LOCAL_ONLY`.
4. **No inferred disclosure.** `external_eligible=0` unless a later explicit founder act changes it.
5. **Current truth wins.** Repository, runtime, rulings, and witnesses supersede conversational memory.
6. **Exact provenance.** Session results retain source path, JSONL line, role, timestamp, and hashes.
7. **Noise is not memory.** Tool calls/tool results are excluded from the first index.
8. **External bundle fails closed.** If any selected material lacks explicit external eligibility,
   bundle construction refuses rather than silently omitting or leaking it.

## Implemented in this lane

- `scripts/builder/jarvis-continuity.py`
  - incremental Claude archive import
  - SQLite FTS5 local index
  - search with exact source provenance
  - bounded model-neutral context bundle
  - external-audience refusal gate
- `scripts/builder/jarvis-recall.py`
  - model-neutral recall across local history and live Git branch records
  - branch/programme authority labeling
  - mechanically extracted stage and declared state
  - deterministic branch summary before model consumption
- `scripts/builder/__tests__/jarvis-continuity-proof.py`
- `scripts/builder/__tests__/jarvis-recall-proof.py`

## First local witness

Imported from:
`~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN`

Observed:
- 403 Claude session JSONL sources
- 1,584 curated Claude project-memory documents
- 1,987 total sources
- 44,408 searchable continuity chunks
- local index: `~/.jarvis/continuity/continuity.sqlite3`
- every source: `LOCAL_ONLY`
- every source: `external_eligible=0`
- `TURN-03` retrieval: hits returned with path / session / line provenance
- same retrieval as `--audience external`: **REFUSED**

No Claude archive file was modified. No continuity content was sent to a remote model.

## Second witness — model-independent recall

Claude history alone proved insufficient for work whose governing records lived on a
noncanonical branch. `scripts/builder/jarvis-recall.py` therefore adds a second evidence
class:

- `BRANCH_RECORD_NONCANONICAL` — programme records recovered from live Git refs;
- `HISTORICAL_ORIENTATION` — Claude conversation/project memory.

Branch recall mechanically extracts stage and declared state and emits a deterministic
branch summary before any model receives the evidence.

TURN-03 witness:
- located `feature/voice-acoustic-turn-projection-20260916 @ b6882e2a6802`;
- recovered the charter plus A4 founder-admission, human-shadow, and instrumentation records;
- deterministic summary: `highest_stage=A4`;
- A4 states preserved separately: ADMITTED / INSTRUMENTED / SEALED, all NOT EXECUTED;
- charter state preserved separately: OPEN · SHADOW ONLY · NO LIVE TURN AUTHORITY;
- local Qwen consumed the bounded recall and reproduced the branch/live-authority boundary;
- external recall of the same LOCAL_ONLY material: **REFUSED**.

## Desktop / OpenCode consumption

- JARVIS Desktop Work view now has read-only **Recall prior work** search.
- Results visibly distinguish noncanonical branch records from historical continuity.
- `jarvis-local` (Qwen3-Coder 30B) may call local recall.
- `jarvis-frontier` (Nemotron) has a wildcard tool deny and no continuity permission.
- continuity is never attached to the Nemotron task by default.

## Next gate

Merge/deploy remains unopened. A later founder act may define an explicit
`EXTERNAL_SAFE` classification workflow for selected non-confidential material; until
then, continuity stays local and all external bundle construction fails closed.
