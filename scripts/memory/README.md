# Memory integrity audit (`memory:audit`)

Read-only integrity audit for the session-memory system at
`~/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory/`.

**This instrument reports; it never edits the memory corpus.** Its only writes
are timestamped reports/findings in the output directory and — only when
explicitly invoked — the parked-lane baseline file.

## The three-role model it enforces

| Layer | Question it answers |
|---|---|
| `MEMORY.md` (live index) | What must be visible now? |
| Topic files (canonical record) | What must remain knowable? |
| Repo / PR history | What actually happened? |

Compaction rule preserved throughout: **relocate detail only after verifying its
canonical home (repo > records > topic file > hook) — never delete knowledge.**

## Ruling (2026-07-28) that scopes this tool

- Instrument lives in the repo (`scripts/memory/`), not inside the memory
  corpus: it is executable governance infrastructure, not memory content.
- **No nested git repo** in the memory directory. Reviewability comes from
  timestamped reports, machine-readable findings, and corpus hashes instead.
  (Status at ruling time: the memory dir is not tracked by any git repo; it is
  included in Time Machine — currently its only backup mechanism.)
- **Parked-lane check ratifies in two phases**: inherited violations (captured
  in `parked-baseline.json`) are warnings — a migration backlog; NEW or
  MODIFIED parked entries without a reopening observation are errors. After the
  backlog is triaged, the check promotes to failure outright.
- No automated compaction yet. `memory:compact` may be built only after the
  audit has proven itself across real consolidation cycles, and must only ever
  propose a reviewable patch — never apply one.

## Usage

```bash
npm run memory:audit                      # audit the live corpus
python3 scripts/memory/audit-memory.py --selftest   # run against bundled fixtures
```

Outputs land in `<memory-dir>/../memory-audit-reports/` (outside both the repo
and the recall corpus):

- `audit-<timestamp>.md` — human report, sections ordered ERROR → WARN → INFO
- `audit-<timestamp>.json` — machine-readable findings, counts, thresholds, and
  the corpus state it binds to (`index_sha256`, `corpus_manifest_sha256` —
  findings bind to the ref, not just the moment)

Exit codes: `0` no errors (warnings allowed) · `1` structural errors · `2` usage.

## Severity model

| Severity | Classes |
|---|---|
| ERROR | broken index/sub-index links · duplicate permanent IDs (frontmatter `name`) · ambiguous wikilinks · index over hard ceiling (24.4KB) · parked entry NEW or MODIFIED without a reopening observation |
| WARN | inherited parked entries (baseline backlog) · stale baseline rows · closed-plain entries in live index · index over target (17.1KB) · index lines >300 chars · topic files >10KB (flag >16KB) · unresolved wikilinks · wikilinks containing `.md` · prefix-omitted wikilinks · missing frontmatter/description |
| INFO | closed entries legitimately retained (open remainder / standing caution) · topic files with no discoverable index hook · shared fact tokens (duplicate-fact lead list) |

Notes:
- Unresolved `[[wikilinks]]` are *write-me-later markers* by convention —
  reported distinctly, never conflated with broken links.
- Prefix-omitted wikilinks resolve via type-prefix fallback; the report names
  the canonical target and proposes normalization. The audit does not rewrite
  links.
- `no_index_hook` is a classification triage (still-canonical → sub-index hook ·
  historical → `_archive_` · superseded · intentionally search-only), **not** a
  mandate to add hundreds of lines to `MEMORY.md`.

## Baseline lifecycle (`parked-baseline.json`)

1. Baseline captures the parked index entries that predate the 2026-07-27
   evidence-indexed-parking ratification. Each is keyed by its line's link
   targets plus a content hash.
2. Triage an entry by giving its index line a `▶️ Reopens when: <observation>`
   (or closing it), then remove it from the baseline —
   `--write-baseline <path>` regenerates from current state.
3. Editing a baselined line without adding a reopening observation trips
   `parked_modified` (error): touching the entry is the moment to fix it.
4. When the baseline is empty, the two-phase period ends and the check is a
   plain failure.

## Deferred (require their own authorization)

- `memory:compact` (patch-proposing only)
- Orphaned-file classification sweep (326 files; classify, don't mass-link)
- Oversized topic-file review (six files >50KB; split on semantic lifecycle
  boundaries, never on byte count alone)
- Wikilink normalization pass (56 prefix-omitted links)
