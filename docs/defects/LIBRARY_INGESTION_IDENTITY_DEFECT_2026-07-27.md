# Class A Defect — Library Ingestion Cannot Prove the Identity or Completeness of a Canonical Text

**Date filed**: 2026-07-27
**Status**: OPEN — defect record only; no remediation implemented (implementation boundary closed pending founder ruling)
**Class**: A — constitutional. The platform must be able to establish, preserve, and prove the identity of a canonical text over time. Today it cannot.
**Founder confirmation (2026-07-27)**: ratified as a *memory-integrity* defect requiring full resolution. D1 (identity: *did the system correctly identify what this work is?*) and D2 (completeness: *did the system completely ingest the work it identified?*) remain **separate acceptance criteria** — a work can be complete but misidentified (this case) or correctly identified but incomplete (a different defect). Identity is a first-class ingestion invariant.

**Governance sequence to gate-opening (founder-stated)**:
1. Founder designates the authoritative published artifact (print PDF or EPUB).
2. D1 remediated and demonstrated on the founder-canon ingestion path.
3. D2 criteria demonstrated on that same path.
4. Existing corpus reconciled against the designated artifact.
5. Only then does founder-canon implementation proceed.
**Discovered during**: Elemental Alchemy founder-canon spec work (`docs/specs/ELEMENTAL_ALCHEMY_FOUNDER_CANON_SPEC_2026-07-27.md`).

## Summary

Two distinct failures, one constitutional root: **ingestion records what it did, not whether what it did corresponds to the work.**

### D1 — Provenance destruction at ingest (verified instance)

The complete Elemental Alchemy manuscript **was fully ingested** on 2026-01-30 and has been present ever since:

- Source `5c20ee56-daa8-4ec2-a13c-5d89ae3af220`, file_path `Soullab Dev Team/Elemental Alchemy Book/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`
- 3,676 chunks · 922,989 tokens · all 3,676 chunks embedded · checksum matches the repo copy `data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md` byte-for-byte

But its recorded identity is: **title `#`, author `would like`.** The title extractor took a bare markdown heading marker; the author extractor took a content fragment. Result: the founder's central work sat complete and embedded in the corpus while being invisible to every title-based inspection — including two review passes in the session that discovered this. The failure mode is the inverse-drift pattern (*"we didn't see X was in there"*): a canonical work present, live-retrievable-if-armed, and unattributable.

Constitutional statement: **a work whose identity fields are destroyed cannot carry provenance, and content without provenance must not be presentable as knowledge.** Had any consultation gate been armed, MAIA could have surfaced the founder's book text attributed to author "would like."

### D2 — Completion status is self-referential (systemic gap)

Sibling source `58c87fb5-ac02-48ee-925e-9fde71e872d4` — a short *note about* the book, titled nearly identically — reads `ingestion_status = 'completed'`, 3 chunks, 577 tokens. Internally consistent, and indistinguishable in status from the real 923k-token ingest. There is **no expected-vs-actual contract**: "completed" means "processed whatever it received," not "the whole designated work arrived." A truncated or wrong input yields the same confident success as a full one. (Survey 2026-07-27: 1,752 completed / 475 skipped / 1 failed; only 1 chunk-count mismatch — the bookkeeping is consistent; the contract is what's missing.)

## Acceptance criteria for remediation (founder-stated 2026-07-27, extended by D1)

Completeness contract (Kelly's five):
1. An ingest either completes successfully or fails explicitly.
2. Expected vs. actual chunk count is recorded (expected derived from the designated artifact, not from what was read).
3. Ingest status is persisted: `pending` / `complete` / `failed` / `partial`.
4. Partial ingests are never eligible for retrieval.
5. The UI communicates incomplete ingestion rather than appearing successful.

Identity contract (from D1):
6. Title and author come from declared metadata or validated extraction; junk identity (`#`, empty, emoji-only, content fragments) fails validation and blocks `complete` status.
7. Identity-invalid sources are never eligible for retrieval.
8. One-time audit sweep of the existing 2,228 sources for junk identity (the first library listing shows `#`, `**🌱`, `**🎭**` and similar at the top of the title sort — the instance is not unique).

## Audit sweep results (run 2026-07-27, read-only)

Of **2,228** sources: **731 (33%) junk titles** (leading punctuation/emoji or <4 chars) · **914 (41%) suspect authors** (non-capitalized content fragments like "would like") · **477 (21%) zero-chunk sources** · **0 duplicate checksums** (deduplication held). The Elemental Alchemy case is the *norm-scale* failure of this pipeline, not an outlier: roughly a third of the corpus cannot prove what it is. Remediation therefore has two arms: the forward arm (validation on the ingest path, criteria 1–7) and the corrective arm (re-derive identity for the 731 from their source files — which still exist at the recorded vault-relative paths in `data/ain/source/` and the minisforum vault copy — with checksum verification).

## Related finding — the upstream source is itself stale (session 2026-07-27)

The corpus's upstream, the Obsidian AIN vault, is live and growing (7,451 notes on the Mac Studio iCloud vault, edited 2026-07-27). But production's copy (`/home/soullab/AIN` on minisforum, bind-mounted to `/app/data/ain-vault` and **read live** by the flag-enabled field-context adapter) is frozen at **2026-01-23 with 559 files** — the same date `vault_symbols` went stale, i.e. the last vault sync. Full resolution of "MAIA's relationship to the vault" therefore has three layers: identity-valid ingestion (this defect) · corpus recency (last library ingest 2026-04-26) · source recency (vault copy frozen 2026-01-23).

**Architectural ruling (founder, 2026-07-27) — Vault → Library is an explicit publication boundary, not a synchronization problem.** Exact ruling text (founder, session of 2026-07-27):

> Vault = personal working environment.
> Library = explicitly published or explicitly ingested corpus.
> Movement from Vault → Library is an intentional act with provenance.

*Paraphrase of the surrounding ruling (authoritative source: the same 2026-07-27 session ruling):* automatic synchronization is refused — turning a private thinking space into retrievable material is an authorship and consent boundary, not an engineering tradeoff; under this ruling the January snapshot is not primarily a sync bug but evidence that the prior implementation never clearly distinguished working thought from retrievable knowledge. No sync mechanism is to be built.

## Containment (current facts, no action taken)

- **No live exposure**: no production route consults the library (`library_search_log` dark since 2026-04-26; the /maia route has no library wire).
- **All 2,228 sources sit at `review_status = 'uploaded'`** — none ratified. The founder-canon spec's retrieval predicate (`review_status = 'ratified' AND …`) would therefore currently retrieve nothing; the planned backfill of legacy rows is confirmed as a genuine governance decision, not a formality.
- **Recommended holds (await founder ruling, no DB mutation performed)**:
  - Source `5c20ee56` (full book, derived from the founder **working master**, not the published edition): reconciliation input for founder-canon ingestion only — never ratify as canon itself; quarantine from any future general-library retrieval.
  - Source `58c87fb5` (note fragment): quarantine pending reconciliation, per existing ruling — its "book-shaped" title must not be allowed to masquerade as the work.

## Remediation status (2026-07-27)

Remediation architecture **accepted** (founder, 2026-07-27); PR #760 authorized to proceed through **formal review**. Merge and production execution **not yet authorized**. Production sequence after merge authorization, each step separately evidenced (founder-stated):

1. Confirm the exact merged SHA.
2. Apply the additive migration.
3. Generate and preserve the BEFORE audit.
4. Run repair in dry-run mode.
5. Review dry-run totals and unresolved rows.
6. Explicitly authorize `--execute`.
7. Execute the repair.
8. Generate the AFTER audit.
9. Verify retrieval exclusion and ingest-status behavior.
10. Record the production evidence and close — or narrow — the defect.

Repair-tool invariants (founder-stated): repairs only from exact checksum-matched sources; ambiguous or still-invalid cases remain **unchanged** and appear in an explicit unresolved section; `evaluated = already_valid + repairable + unresolved`; `executed_repairs <= repairable`. No founder-canon ingestion begins as a consequence of this remediation.

## Relationship to the founder-canon spec

The designation record answers *"what is canon?"* This defect answers *"did canon actually arrive?"* They are separate constitutional guarantees, and the spec's implementation gate stays closed until **both** hold: the authoritative artifact is explicitly designated, **and** the ingestion pipeline can demonstrate the designated artifact was ingested completely and verifiably (criteria 1–7 above, applied at minimum to the founder-canon ingest path).
