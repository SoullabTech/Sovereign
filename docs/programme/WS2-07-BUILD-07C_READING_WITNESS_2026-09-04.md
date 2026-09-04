# WS2-07 · BUILD-07C — Developmental Reading · Witness Record

```text
UNIT               BUILD-07C DEVELOPMENTAL READING
STATUS             GATE A PASS — STRUCTURALLY PROVED · NOT CLOSED · GATE B PENDING
CANDIDATE          8a26a8971  (claude/writer-author-studios-roadmap-b2tqf5) — supersedes 0ae75d2a2 (two-table draft, never witnessed as a candidate)
BUILT AGAINST      canonical b20f2742e (BUILD-07B closed); opening record 0f92fbb24 (first commit on this branch)
CONTRACT           WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md INV-0 … INV-25 + the founder's
                   2026-09-04 07C opening rulings (lane doc) — binding; unchanged
READER             DEVELOPMENTAL-READER-01 (unchanged, blobs = 07B candidate 421f25bd6)
CLASSIFIER         DEVELOPMENTAL-PHENOMENON-01 (prompt-contract hash recorded by the witness)
CLOSURE RULE       Gate A structural → STRUCTURALLY PROVED · Gate B one live commission on an
                   invented fixture, frozen, retrieved by identity, superseded by an edit and
                   shown three-state → CLOSED / ACCEPTED
PHENOMENA V1       recurrence · unresolved-thread · register-shift · prospective-reference ·
                   re-explanation-first-mention · movement · term-drift · positional-asymmetry
```

## 1 · What was built — the enumerated unit

```text
lib/manuscript/developmentalReading/
  contract.ts    DevelopmentalReading (outcome-discriminated: reading | none), DevelopmentalObservation
                 (key · lens · phenomenon · evidenceRefs · observation · doesNotEstablish ·
                 structureDependency), ReadingScope, provenance { reader, classifier | null, frozenAt },
                 the eight UNDERSTAND §4 phenomena, observationKey(i) = o<i+1>
  freeze.ts      pure: accepted 07B result → ReadingToFreeze. Refs RE-BOUND against the request's
                 evidence (one failure refuses the whole freeze); fingerprint equality; text VERBATIM;
                 lens copied; phenomenon per claim from the classifier; structureDependency from
                 refs; none → complete none reading. Typed refusals.
  classify.ts    ONE bounded seam call: claims + lens + doesNotEstablish in, phenomenon per index
                 out; tool-forced; every index exactly once; unclassifiable → refuse; pinned to the
                 reader's resolved model (a seam that sent another refuses); identity + hash
  store.ts       INSERT / SELECT only. Mints id and stamps frozenAt at the write. Member-scoped
                 loads. Refuses a state payload with a text-bearing key. Touches only its one table.
  assess.ts      pure three-state per observation (07A observationLocation); reading summary; a
                 none reading by its body scope
  commission.ts  capture → recover → read → classify → freeze → store → load. One commission, one
                 reading; a refusal at any stage stores nothing and names the stage.

database/migrations/20260904000001_developmental_readings.sql — ONE additive table (founder shape)
  developmental_readings (id DEFAULT gen_random_uuid() · manuscript_id → member_manuscripts CASCADE ·
  member_id · draft_id · revision_number · commissioned_lens CHECK · scope · read_state · coverage ·
  input_fingerprint · outcome CHECK reading|none · observations JSONB · reader_provenance JSONB ·
  classifier_provenance JSONB | NULL · frozen_at DEFAULT now())
  CHECK  outcome none ⇔ zero observations ∧ classifier NULL; reading ⇔ ≥1 observation ∧ classifier present (INV-0)
  TRIGGER UPDATE refused (INV-4 — insert-only); INSERT validates every observation: exactly the seven
  v1 fields (any other key — interpretation, questions, possibilities, uncertainty, severity … —
  refused), keys o1…oN in order, lens in the seven, phenomenon in the eight, non-empty text, refs,
  non-conclusions. Class B; additive; idempotent (applied twice on the scratch DB).
  ROLLBACK POSTURE  code reverts cleanly; the table is left INERT if it has ever received a reading —
  no destructive DROP is promised (INV-22); no existing manuscript schema is rewritten.

gates
  developmentalReading/__tests__/readingBoundaries.test.ts   per-module allowed imports; store
                 INSERT/SELECT only and its one table; freeze assigns claim.text with no
                 transformation; classifier has no prose path; observation-only fields; migration
                 has no 07D+ column; no manuscript-mutating path
  developmentalReader/__tests__/readerCannotBypass.test.ts   EXTENDED: the reader cannot reach
                 the reading unit (negative control added)
  development/__tests__/evidenceCannotAct.test.ts            EXTENDED: the substrate cannot reach
                 the reading unit; the "no migration" gate names the 07C schema as another unit's
                 so its claim (the evidence object has no table) stays exact
tests            freeze (8) · classify (8) · assess (6) · boundaries (7) · plus 07B's 42 and 07A's 6
witness          scripts/ws2-07c-reading-gate-a.ts — C0–C22 against a UTF-8 scratch DB
                 scripts/ws2-07c-reading-gate-b.ts — Gate B machinery (pinned to the candidate)
```

Two interpretations made inside the ratified object, recorded so they are visible:

- **`workId` → `manuscriptId`.** DECIDE §1 names `workId`. BUILD-07A evidence is keyed by
  manuscript and draft; the Work relation (`living_works` → expressions) is not re-derived here.
  The reading stores `manuscript_id` with CASCADE, exactly as proposals do.
- **`doesNotEstablish` is carried onto the observation.** It is the reader's statement of
  evidentiary limit (07B A7), not DECIDE's optional `uncertainty`, which stays absent in v1.

## 2 · Gate A — structural (2026-09-04)

```text
RUN                DATABASE_URL=<UTF8 scratch, baseline + chain through 20260904000001>
                   npx tsx scripts/ws2-07c-reading-gate-a.ts   (seam refusing; adapter hooked)
RESULT             27 checks · 0 failure(s) on 8a26a8971
SCRATCH DB         PostgreSQL 16 (remote session), UTF8, pgvector; bootstrap 634 tables · 504 ledger
                   rows; chain → 640 tables; migration applied twice, second run a no-op
JEST               developmentalReading (30) · developmentalReader (42) · evidenceCannotAct (6) — 78 passed
TYPECHECK          module + tests clean (scratch tsconfig); npm run typecheck — no regressions;
                   scripts tsconfig — 0 errors in ws2-07c-*
GOVERNANCE         check:no-supabase ✅ · check:no-openai ✅ · check:no-direct-anthropic ✅ ·
                   check:phi-gate ✅ · check:design-canon ✅
```

| # | Falsifier | Derived from | Result |
|---|---|---|---|
| C0 | server_encoding UTF8; migration 20260904000001 in the ledger | 07A precondition | PASS |
| C1 | an accepted reader result freezes into one observation per claim | A1 handoff | PASS |
| C2 | observation text is the claim text verbatim, not even trimmed | founder: no rewriting | PASS |
| C3 | keys `o1…oN` by position | INV-2 | PASS |
| C4 | lens copied from the commission; phenomenon from the classifier | INV-10, INV-12 | PASS |
| C5 | structureDependency derived from refs: independent · authored-structure | INV-16 | PASS |
| C6 | observation carries exactly seven fields; nothing 07D+-shaped | v1 observation-only | PASS |
| C7 | a none result freezes as a complete none reading with state, coverage, provenance | INV-23/24 | PASS |
| C8 | typed refusals: reader_refused · claim_unbindable (whole) · unknown_phenomenon | INV-5/8, §10 | PASS |
| C9 | phenomenon family = the eight UNDERSTAND §4 values, in the tool schema verbatim | founder ruling | PASS |
| C10 | classifier request carries claim text · lens · non-conclusions, no section text | founder ruling | PASS |
| C11 | unclassifiable → refusal, never an invented category | founder ruling | PASS |
| C12 | sovereign mode → seam refuses; adapter never loaded; classifier version + hash | INV-25 | PASS |
| C13 | the store mints the id and stamps frozenAt at the write | INV-1, INV-25 | PASS |
| C14 | loaded by identity: outcome, observations by key, verbatim text, refs, non-conclusions, provenance, fingerprint | INV-2, INV-3 | PASS |
| C15 | another member cannot load it | scope | PASS |
| C16 | UPDATE on the reading — outcome or observations — is refused by the database | INV-4 | PASS |
| C17 | a none reading persists as a complete reading | INV-23 | PASS |
| C18 | outcome ⇔ observations enforced by CHECK; the insert trigger refuses a foreign phenomenon, a v1-unauthorized field, a misnumbered key | INV-0, v1 ceiling | PASS |
| C19 | listing: newest-first summaries with observation counts | retrieval | PASS |
| C20 | a state payload carrying prose is refused before any write; nothing written | no prose | PASS |
| C21 | three-state per observation: unchanged → current; s0 edited → o1 superseded (section-text s0), o2 current; unloadable → unmeasured | INV-20, INV-21 | PASS |
| C22 | assessment re-anchors nothing; the stored reading is retained unchanged | INV-19, INV-22 | PASS |

```text
GATE A             PASS — BUILD-07C CANDIDATE 8a26a8971 · STRUCTURALLY PROVED · NOT CLOSED
```

One seam Gate A found and the witness absorbed honestly: the shared 07A in-memory fixture names its
draft `draft-1`, while real drafts and the store column are `uuid`. The witness freezes its own
fixture with a uuid draft id; the schema was not loosened to `text`.

## 3 · Gate B — bounded live commission (PENDING)

```text
FIXTURE            one INVENTED manuscript created through the real draft route (section-addressable
                   from birth, revision 1 with partition), two authored parts through
                   structureService — never a member's Work; a scratch or founder-run database
CANDIDATE          the script verifies the reading module, the reader module and the migration on
                   disk are byte-identical to the candidate's blobs, else REFUSES
COMMISSION         commissionReading({ lens: development, bodyScope: first four sections,
                   withStructure: true }) — one reader call, one classifier call, one freeze
ROWS               D1 commission frozen (or a legitimate none) · D2 id minted, frozenAt stamped ·
                   D3 loaded by identity equals the commissioned reading · D4 every observation:
                   verbatim text, phenomenon in the family, refs re-bind, ≥1 non-conclusion ·
                   D5 reader provenance = DEVELOPMENTAL-READER-01 with resolved model; classifier
                   provenance present iff observations · D6 assessment before edit: all current ·
                   D7 the author edits one section through the draft route (PUT) · D8 assessment
                   after edit: observations depending on that section superseded (section-text
                   named), others current — scoped, never whole · D9 UNMEASURED is a distinct,
                   reachable state: assessment against a Work that cannot be loaded is unmeasured,
                   never current · D10 the stored reading is byte-identical before and after (never
                   re-anchored, retained) · D11 a second commission after the edit is a NEW reading
                   with a new id; the first remains loadable · D12 no manuscript row changed by the
                   commission itself; exactly two seam calls (reader + classifier), no retry
QUESTION           did the unit execute the proved contract on a real read? — not whether the
                   observations are good
RUN                DATABASE_URL=<UTF8 scratch> MAIA_INFERENCE_MODE= npx tsx scripts/ws2-07c-reading-gate-b.ts \
                   --out ~/maia-witness-logs/ws2-07c-gate-b.json   (provider key in the shell)
```

```text
GATE B             PENDING
CLOSURE            on Gate B PASS → BUILD-07C CLOSED / ACCEPTED → STOP · BUILD-07D by its own act
```

## 4 · What this record does not do

```text
no closure of BUILD-07C · no claim that any reading has been made live
no route · no surface · no interpretation · no questions · no possibilities
no change to DECIDE, the phenomenon family, or the 07B reader
no opening of BUILD-07D
```
