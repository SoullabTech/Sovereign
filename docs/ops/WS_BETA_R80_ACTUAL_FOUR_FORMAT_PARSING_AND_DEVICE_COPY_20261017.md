# R80 — Real four-format parser and writer-owned device-copy acceptance

**2026-10-17 · isolated fictional data · beta/production HOLD**

## Why this is a separate lane from R79

R79 already implements the held, encrypted **fictional** MAIA-author choice and
is independently qualifying its PostgreSQL/real WebKit Apply/Undo sequence.
R78's parallel shipping lane addresses application TypeScript errors. R80
does not modify either source, any source file they change, or any backend
route. It fills a different launch evidence gap: whether the four accepted
import formats are actually readable and can be carried into a writer-owned,
portable copy **without silently rewriting original words**.

R80 branches from the accepted R77P/R78 merge
`e6818c7502eadc38750a2cd7b981bdd5b18585bd`.
The work is additive tests and scoped test configuration only.

## What was physically exercised

The new suite
`lib/manuscript/ingest/__tests__/r80ActualFourFormatRoundTrip.test.ts`
uses real, unmocked `parseUpload()`, the existing mechanical `segment()`
and the actual `prepareDeviceManuscriptCopy()`.

- **TXT**: exact UTF-8 author words, CRLF line endings, tab and whitespace,
  mechanical chapter detection, and body preservation in portable copies.
- **Markdown**: original complete Markdown bytes, chapter and nested heading
  signals, author punctuation, same writer-owned text carried into portable
  TXT/MD/JSON output.
- **DOCX**: the repository's actual `sample.docx` and real Mammoth
  conversion, intact quoted words, H1/H2 heading semantics and no HTML anchor
  artifacts in manuscript words.
- **PDF**: an actual **two-page text-layer PDF** generated in memory with
  jsPDF. The real ESM-based pdf-parse extracts typed author wording from both
  pages, without mock worker or fabricated page boundary markers.
- **Scanned/image-only PDF**: a genuine valid PDF with no text layer remains
  empty and returns a clear warning, rather than inventing text or silently
  pretending OCR happened.
- An unsupported ZIP upload is refused, rather than imported as manuscript
  prose.
- For every accepted format the resulting mechanical sections are passed
  through the existing **writer-owned device-copy** builder as portable TXT,
  Markdown and JSON. The tests check relevant exact author phrases, the
  number/order of sections and truthful metadata; JSON reimport has **not**
  been certified.

The first Jest invocation without an ESM VM flag failed in PDF worker setup,
not while parsing the PDF itself. The repair is to run the physical PDF test
with `NODE_OPTIONS=--experimental-vm-modules`. This is a test-harness
requirement, not a production source change, and the failing log was retained.

## Independent PDF provenance witness

The existing real extractor witness
`scripts/witness/pdf-page-marker-witness.ts` was run independently under
`tsx` (outside Jest). **All 11/11 checks passed**. It verifies the
unmodified extractor adds synthetic page markers, the cleaned importer
suppresses those at their origin, and an author-written marker with identical
characters survives exactly once. It also verifies scanned PDF refusal with
no manufactured text.

## Evidence (precommit)

- `/Volumes/T7 Shield/ws-beta-r80-combined-v4-jest.log`: six existing/new
  suites, **56/56 tests PASS**, including 10 new R80 assertions (actual PDF
  and actual DOCX; not mocked).
- `/Volumes/T7 Shield/ws-beta-r80-real-pdf-marker-witness.log`: **11/11**
  real PDF parser checks PASS, zero failures.
- `/Volumes/T7 Shield/ws-beta-r80-scope-typecheck-v2.log`: strict scoped
  TypeScript PASS.
- No real member material, API credentials, network provider call, database
  mutation, production access, GitHub push, PR, protected-branch merge or
  deployment occurred.

## What this does NOT release

These are **real parser and device-copy** tests, not a full physical Safari
upload-to-Source-to-Work browser journey for all four file types. Current
writer beta still requires that next application/API test, file-arrival
ownership and encryption/retention proof for each format, and confirmation
that the full writer export is usable on Mac and physical iPhone Safari.
PDF scans intentionally remain unsupported without OCR; the UI must say so.

Neither R79's fictional private author choice nor this R80 parser test implies
actual member-consented MAIA inference or an authorized production model
proposal. Production encrypted Source/Draft/SQL/WAL/backup, cold/offsite
restore, whole-app shipping TypeScript and signed rollback, and
founder-approved member canary all remain blockers. Advanced independent
sovereign KMS is later/optional for the standard writer beta; do not
downgrade already protected Works.

**Disposition: parser/device-copy source-level ACCEPTANCE CANDIDATE.
Release/Beta HOLD. Exact-commit requalification required.**
