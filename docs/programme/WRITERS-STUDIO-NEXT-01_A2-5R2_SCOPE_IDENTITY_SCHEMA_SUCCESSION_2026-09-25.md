# WRITERS-STUDIO-NEXT-01 / A2-5R2
## SCOPE IDENTITY SCHEMA SUCCESSION + EDITORIAL DISCRIMINATOR IMPLEMENTATION

**Date:** 2026-09-25
**Parent candidate:** 9a08f84b5a876499272b6aa4d4ad11c221c0ac48
**Packet:** cb24d6c3fdedd3c9d704d6405344fb12ccf73d7754ebe378d69955c8ce0aa382 · 5,449 bytes · 173 lines
**Live relationshipId carriage:** NOT OPEN
**UI / Focus / deployment / A3:** NONE

## I. Result

A2-5R2 implements the A2-5R1 scope-identity successor without reopening live A2 relationship carriage.

Implemented:
- immutable nullable proposal-chain locus scope discriminator;
- server-authored section/passsage minting at the two existing Editorial open seams;
- historical NULL preservation;
- A2 episode manuscript-locus-scope succession;
- Review NULL-scope custody;
- Editorial scope-match validation in A2 custody;
- fail-closed migration refusal for pre-successor A2 episode populations.
## II. Proposal-chain scope discriminator

New schema:
- proposal_chains.locus_scope_kind TEXT NULL
- allowed values: section | passage
- NULL means historical / UNMEASURED

Existing proposal-chain immutability already refuses all UPDATE/DELETE, so locus_scope_kind inherits the same frozen-locus law.

New chain opening:
- openEditorialRelationship → section
- openEditorialRelationshipAtSelection → passage
- full-body selection remains passage

The route request contracts are unchanged and do not accept locusScopeKind.
## III. Historical standing

Existing proposal chains remain:
- locus_scope_kind = NULL
- lawful under their existing Editorial semantics
- readable
- not A2 manuscript-scope-admittable

No expectedText inference.
No route-history inference.
No timestamp inference.
No backfill.

Attempted UPDATE of historical NULL to section/passsage is refused by the existing proposal-chain immutability trigger.
## IV. A2 episode scope succession

Migration succeeds:
- requested_scope → manuscript_scope_requested
- executed_scope → manuscript_scope_executed

Both fields become nullable.

EDITORIAL_TURN:
- manuscript_scope_requested required
- manuscript_scope_executed required
- both section|passage
- values equal
- A2 store additionally proves value equals proposal_chains.locus_scope_kind

REVIEW_DISCUSS:
- both manuscript-scope fields NULL
- subject remains readingId + observationKey
- historical evidence remains child-authoritative.
## V. Migration fail-closed law

Before changing A2 episode scope semantics, migration 00006 checks for existing A2 episode rows.

Any pre-successor row causes migration refusal.

The refusal occurs inside the migration transaction, so:
- proposal_chains.locus_scope_kind addition rolls back;
- requested_scope/executed_scope names remain unchanged;
- existing A2 rows remain untouched.

This is deliberately stricter than reinterpretation.

A2-5R2 performs no historical data rewrite or deletion.
## VI. Implementation identities

Migration:
database/migrations/20260925000006_writer_editorial_scope_identity_successor.sql
SHA-256 a514c25540e88e1ef6b20ff49a1f205ddb94a4e95d3c7a1d616dcad8034a2154

Proposal-chain contract:
SHA-256 bb01478693536096125c53afe4a21cba3845dbfeb8df4efb19ca448321f86a98

Proposal-chain store:
SHA-256 1f89002cf3a5a257ae827392b92ee2ab1f4e7a0ff4538b53de787741ac6af2ac

Editorial open runtime:
SHA-256 14dfeae28e61a02f347934d7406be207b4b4feb269ea8f85484fe48d4524da27

A2 relationship custody store:
SHA-256 51cbc860926bfc8fafce8feee7c2d7375e7df4fb9c23cfc1e4627f7f59d3d3f0
Updated A2-4 DB witness:
SHA-256 c30ae56b482821dd095d40efbf4cdc77744e500247e40c4d5a9e4fbcf7208de9

A2-5R2 scope witness:
SHA-256 5446d5d43677884d067ead08433b3138e5134a05aac9df4e014b4b805a26f296

Fail-closed migration witness:
SHA-256 44a6bac96f6d5dae4db5d30eec44e508b7265dd3c6bce531e55277fc9feceb6c

Dedicated typecheck:
SHA-256 4a1252024cc1902b05413662027485dfc87e14453610fb150bc6cfdca3a981e0
## VII. Database witnesses

A2-5R2 scope witness: **11/11 PASS**

Proved:
- section-open mints section;
- passage-open mints passage;
- full-body selection remains passage;
- historical scope remains NULL/unmeasured;
- scope discriminator UPDATE refused;
- request contracts carry no client scope authority;
- matching Editorial A2 scope admitted;
- mismatched Editorial A2 scope refused;
- historical NULL Editorial A2 admission refused;
- Review A2 episode persists NULL manuscript scope;
- non-NULL Review manuscript scope is database-refused.

A2-4 custody witness on successor schema: **19/19 PASS**.
## VIII. Migration witnesses

Canonical empty-database reconstruction through 00006: **5/5 PASS**.

Pre-successor fail-closed witness:
- real schema built through A2-4 only;
- one pre-successor A2 Review episode inserted;
- applying 00006 refused;
- refusal reason observed;
- existing row remained;
- old requested_scope column remained;
- new manuscript_scope_requested absent;
- proposal_chains.locus_scope_kind absent.

Therefore refusal rolled back schema and data atomically.
## IX. Type and regression standing

Focused A2-5R2 typecheck: PASS.

The real Editorial runtime transitively exposes one pre-existing noImplicitAny diagnostic in intelligentVoiceAdaptation.ts; the dedicated config does not claim to repair that unrelated file.

Repository TypeScript no-regression gate:
- program files 4453;
- errors 226 vs baseline 239;
- 13 errors fixed since baseline;
- **no TypeScript regressions**.

Inherited:
- A2-5R1 18/18 GREEN · 18/18 DEAD
- A2-3 37/37 GREEN · 35/35 DEAD
- A2-2 55/55 GREEN · 30/30 DEAD
- A2-1 24/24 GREEN · 24/24 DEAD
- R2-2 17/17 GREEN
- editorial-runtime lethal · 0 failures
- proposal/selection tests 35/35 PASS
- Sanctuary Editorial 22/22 PASS
- Focus 64/64 PASS
## X. Succession note

A2-3 and A2-4 remain valid historical evidence for the custody architecture they established.

Their old generic requested/executed scope interpretation is superseded by A2-5R1/A2-5R2.

Current scope authority is:
- relationship frame ≠ child subject ≠ manuscript locus scope;
- Editorial has section/passsage manuscript locus scope;
- Review finding has no A2 manuscript locus scope;
- relationship-frame vocabulary grants no child authority.

No predecessor document or frozen matrix was edited to retroactively say this.
## XI. Product boundary

Changed runtime behavior is limited to chain creation:
- section-open records section;
- selection-open records passage.

No request/response shape changed.
No member-facing component/page changed.
No relationshipId is carried.
No A2 episode is written by live routes.
No Review route changed.
No Focus file changed.
No prompt/provider path changed.
No deployment performed.

## XII. Recommended successor

> **WRITERS-STUDIO-NEXT-01 / A2-5R3 — LIVE RELATIONSHIP IDENTITY CARRIAGE + EDITORIAL/REVIEW ATOMIC ADMISSION ONLY**

A2-5R3 may resume the previously blocked A2-5 live carriage using the now-truthful child scope identity.

It must still keep:
- relationship identity explicit;
- no latest/first inference;
- no Focus;
- no cognition carry;
- no UI composition beyond what is separately authorized.
## XIII. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-5R2 SCOPE IDENTITY SCHEMA SUCCESSION + EDITORIAL DISCRIMINATOR IMPLEMENTATION**

A2-5R2 STOPS BEFORE LIVE RELATIONSHIP IDENTITY CARRIAGE, UI, FOCUS, DEPLOYMENT OR A3.
