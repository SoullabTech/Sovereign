# WS2-07 · BUILD-07B — Developmental Reader · Witness Record

```text
UNIT               BUILD-07B DEVELOPMENTAL READER
STATUS             CLOSED / ACCEPTED — Gate A PASS · Gate B PASS (founder-run, 2026-09-04) · canonical on merge
CANDIDATE          421f25bd6  (claude/writer-author-studios-roadmap-b2tqf5)
BUILT AGAINST      canonical 201649426 (implementation opened, PR #1189)
CONTRACT           docs/programme/WS2-07-BUILD-07B_READER_CONTRACT_2026-09-04.md — binding as merged; unchanged
READER             DEVELOPMENTAL-READER-01
PROMPT CONTRACT    fe83e6326b64e1ce647e015ec0e057b7b149c96499f1667f9fdec58a4d3a5981
CLOSURE RULE       two gates (lane doc, 2026-09-04 opening block): Gate A → STRUCTURALLY PROVED;
                   Gate B → CLOSED / ACCEPTED
```

## 1 · What was built — the enumerated unit, nothing else

```text
lib/manuscript/developmentalReader/
  contract.ts    closed vocabularies (7 lenses · 8 non-conclusions) · 60,000 code-point ceiling ·
                 DevelopmentalReaderRequest · ReaderClaimDraft · typed refusals · claims | none | refused
  render.ts      constant system prompt · one tool `draft_reader_claims` · DEVELOPMENTAL-READER-01 ·
                 promptContractHash(system ⧺ NUL ⧺ tool) · deterministic renderRequest
  validate.ts    pre-seam: lens · per-section digest integrity vs the frozen state · body-depth set
                 equality · whole sections only · ceiling refused whole
  parse.ts       fail-closed parser: foreign fields · second tool / read-request · malformed · empty
                 text · non-conclusions
  read.ts        host loop validate → render → runStructured → parse → bindEvidence → Result;
                 no client / provider / mode option; seam refusals unchanged; resolved model from
                 the seam; readerIdentity(); no state, no store

gates
  developmentalReader/__tests__/readerCannotBypass.test.ts   NEW one-way gate (A6, F3): reader
                 imports only development/{evidenceRef,readState,resolve}, development/bind (host
                 only), structure/readerProvenance (type), ai/structured/{router,types}, crypto;
                 negative control red on capture / live loader / DB / structure reader / Ask
  development/__tests__/evidenceCannotAct.test.ts            EXTENDED: names `developmentalReader`
                 among the substrate's forbidden imports — the reverse gate holds

tests            developmentalReader/__tests__/contract.test.ts — F1–F20 with fixture blocks; F14
                 under MAIA_INFERENCE_MODE=sovereign with the adapter mocked to throw if loaded
witness          scripts/ws2-07b-reader-gate-a.ts — founder-runnable Gate A (no DB, no network)
                 scripts/ws2-07b-reader-gate-b.ts — Gate B machinery, pinned to the candidate's
                 reader blob ids; refuses to witness any other reader
```

Two interpretations the implementation had to make inside the closed refusal vocabulary, recorded so
they are visible rather than silent:

- **Body-depth set equality.** A recovered body for a section not at body depth is
  `recovered_not_body_coverage` (contract). The inverse — coverage says `body` but no recovered text
  was supplied — is refused `recovered_integrity_failure`, because the request's recovered set does
  not have integrity against its own coverage (the model would see less than coverage claims).
- **Whole sections only.** A passage-sliced `Recovered` value digests differently from the frozen
  section digest and is `recovered_integrity_failure`; the range is also checked explicitly
  (`0 … sectionLength`).

Neither adds a refusal name; both are documented in `validate.ts`.

## 2 · Gate A — structural (2026-09-04)

```text
RUN                npx tsx scripts/ws2-07b-reader-gate-a.ts   (seam refusing by policy; adapter hooked)
RESULT             36 checks · 0 failure(s)
CANDIDATE          git HEAD 421f25bd6
JEST               developmentalReader/__tests__/{contract,readerCannotBypass}.test.ts — 42 passed
                   development/__tests__/evidenceCannotAct.test.ts — 6 passed (reverse gate)
TYPECHECK          module + tests clean under tsconfig.json (scratch project);
                   npm run typecheck — "No TypeScript regressions"; scripts tsconfig — 0 errors in ws2-07b-*
GOVERNANCE         check:no-supabase ✅ · check:no-openai ✅ · check:no-direct-anthropic ✅ ·
                   check:phi-gate ✅ · check:design-canon ✅
```

| Falsifier | Result | Witnessed by |
|---|---|---|
| F1 prose only via `recoverEvidence` under the request's state; one altered code point refuses | PASS | gate-a · contract.test |
| F2 evidence cannot act (development/** → reader/AI impossible) | PASS | evidenceCannotAct.test · gate-a |
| F3 reader cannot bypass evidence (allowed-import gate + negative control) | PASS | readerCannotBypass.test · gate-a |
| F4 exactly one canonical lens; lens on a claim is foreign | PASS | gate-a · contract.test |
| F5 60,000 code points passes; 60,001 refused whole; astral counted as one | PASS | gate-a · contract.test |
| F6 body-depth sections only, same evidence object, no neighbours | PASS | gate-a · contract.test |
| F7 structure only from `readState.structureContext`; absent → structural claim refuses whole | PASS | gate-a · contract.test |
| F8 every ref binds or the whole result refuses (never the subset) | PASS | gate-a · contract.test |
| F9 ≥1 closed non-conclusion; empty → missing; foreign → unknown | PASS | gate-a · contract.test |
| F10 no 07C-shaped field in schema or parser; any such field → foreign | PASS | gate-a · contract.test |
| F11 claims / none / refused distinct; none carries identity | PASS | gate-a · contract.test |
| F12 no `request_sections`; asking for more → `read_request_attempted` | PASS | gate-a · readerCannotBypass.test |
| F13 malformed output refused, never coerced to none | PASS | gate-a · contract.test |
| F14 sovereign mode → `structured_inference_unavailable`; adapter never loads; invalid mode refuses | PASS | gate-a (module hook) · contract.test (mock) |
| F15 no heading channel; nothing outside recovered prose names a heading | PASS | gate-a · contract.test |
| F16 no table write, no apply/adopt path, no network except the seam | PASS | readerCannotBypass.test |
| F17 identity: DEVELOPMENTAL-READER-01, hash over system + tool, model from the seam | PASS | gate-a · contract.test |
| F18 a draft is text · refs · doesNotEstablish; cannot stand as an observation | PASS | gate-a · contract.test |
| F19 stateless; no module-level cache | PASS | readerCannotBypass.test · gate-a |
| F20 deterministic rendering; code points not UTF-16 | PASS | gate-a · contract.test |

```text
O1 Boundary integrity    PASS   F1 F2 F3 F15 F16
O2 Commission discipline PASS   F4 F5 F6 F12 F19
O3 Claim accountability  PASS   F7 F8 F9
O4 Sub-observation       PASS   F10 F18
O5 Refusal discipline    PASS   F11 F13 F14
O6 Provenance            PASS   F17 F20

GATE A                   PASS — BUILD-07B CANDIDATE 421f25bd6 · STRUCTURALLY PROVED · NOT CLOSED
```

Note on F14 in the remote session: the seam refused by policy (`sovereign`), and the module hook
recorded that the provider adapter was never loaded. This container also holds no provider key, so
no live call was possible here under any mode — which is the correct state for Gate A.

## 3 · Gate B — bounded live reader witness (PASS, founder-run 2026-09-04)

Protocol (founder ruling, 2026-09-04), as `scripts/ws2-07b-reader-gate-b.ts` implements it:

```text
FIXTURE            one INVENTED six-section manuscript in memory ("The Lantern Road"); never a
                   member's Work; never the database; body depth w1 w2 w3 w5 — w4 and w6 at
                   position depth ON PURPOSE so coverage is partial; two authored parts supplied
CANDIDATE          the script computes git blob ids of the five reader files on disk and REFUSES
                   unless they equal the candidate's (421f25bd6); a later docs-only commit is the
                   same reader; a changed reader cannot be witnessed under this record
CALL               exactly one `readDevelopmentally` → one `runStructured`; MAIA_INFERENCE_MODE
                   unset (primary); provider key from the founder's environment only
RECORDS            resolved model (from the seam) · reader version · prompt-contract hash ·
                   rendered-request digest · latency · outcome · claims (text, refs,
                   doesNotEstablish) · B1–B10 rows · verdict → JSON file (--out)
ROWS               B1 seam call completed · B2 claims or legitimate none · B3 resolved model
                   recorded · B4 identity + hash · B5 every ref re-binds · B6 ≥1 closed
                   non-conclusion per claim · B7 no foreign field · B8 no prose ref into a
                   position-depth section · B9 non-empty text · B10 one read, no expansion
QUESTION           did the actual reader execute the proved contract? — not whether the
                   noticing is good
ON FAIL            classify before touching anything: reader defect → repair inside the unit;
                   contract defect → ruling. No tuning from output quality.
RUN (Mac Studio)   cd <checkout at or above 421f25bd6> && MAIA_INFERENCE_MODE= npx tsx \
                   scripts/ws2-07b-reader-gate-b.ts --lens development --out ~/maia-witness-logs/ws2-07b-gate-b.json
```

Dry run in the remote session (no key): the candidate-identity check passed, the fixture froze,
prose recovered, the request validated (under ceiling, structure supplied), and the single seam
call was refused by the provider layer — B1 FAIL, recorded honestly, machinery proven. That run is
not Gate B evidence and is not cited as such.

### The run

```text
WHERE              Mac Studio · isolated worktree /Volumes/T7 Shield/maia-07b-gate-b @ caa11e77d
                   (records-only tip; reader module byte-identical to candidate 421f25bd6 — the
                   script verified the five blob ids before proceeding)
KEY                founder's shell environment; no .env file sourced by the run
MODE               MAIA_INFERENCE_MODE unset → primary; one runStructured call
FIXTURE            "The Lantern Road" · 6 sections · body w1 w2 w3 w5 · 902 / 60,000 code points ·
                   structure supplied · lens development
IDENTITY           DEVELOPMENTAL-READER-01 · prompt fe83e6326b64e1ce… · request 22fb7becc9a64bd6…
RESOLVED MODEL     claude-opus-5 (recorded from the seam, B3)
LATENCY            24,828 ms
RECORD             /Users/soullab/maia-witness-logs/ws2-07b-gate-b.json (founder custody)

B1  one real seam call completed                                   PASS
B2  outcome is claims or a legitimate none                         PASS
B3  resolved model recorded from the seam                          PASS  claude-opus-5
B4  identity DEVELOPMENTAL-READER-01 + prompt-contract hash        PASS
B5  every returned ref re-binds against the frozen evidence        PASS
B6  every claim carries ≥ 1 closed non-conclusion                  PASS
B7  no claim carries a foreign / 07C-shaped field                  PASS
B8  no claim cites prose from a position-depth section             PASS
B9  claim text is non-empty                                        PASS
B10 exactly one read; no second capture, no scope expansion        PASS

10 checks · 0 failure(s)
GATE B             PASS — the reader executed the proved contract
```

Two prior runs on the same worktree are recorded as what they were: environment failures, not
reader evidence. The first exported an empty key (`.env.local` carries none); the second used the
Mac's `.env.docker` key, which the provider rejected as invalid (401). In both the request was
well-formed and the candidate check passed; B1 failed at the provider layer before any read.
Neither run was rerun until classified, and no code changed between them and the passing run.

Gate B answered its one question — did the actual reader execute the contract Gate A proved —
and nothing else. Whether the claims it drafted are *good* is not adjudicated here; that belongs
to BUILD-07C and the eventual real-Work proof.

## 4 · Closure — 2026-09-04

```text
GATE A             PASS · 36 / 0 on 421f25bd6 · F1–F20 · O1–O6         STRUCTURALLY PROVED
GATE B             PASS · 10 / 0 · founder-run · claude-opus-5           EXECUTED THE CONTRACT
CANDIDATE          421f25bd6 — code unchanged since; records only above it
CLOSURE            BUILD-07B DEVELOPMENTAL READER — CLOSED / ACCEPTED (founder, 2026-09-04)
                   canonical on merge of the candidate PR
BUILD-07C          NOT opened by this closure; opens only by its own lane act
```

## 5 · What this record does not do

```text
no claim that the reader's noticing is good — Gate B adjudicated execution of the contract only
no route · no surface · no persistence · no DevelopmentalReading · no observation · no phenomenon
no change to the contract, the ceiling, the lens list, or the non-conclusion vocabulary
no opening of BUILD-07C
```
