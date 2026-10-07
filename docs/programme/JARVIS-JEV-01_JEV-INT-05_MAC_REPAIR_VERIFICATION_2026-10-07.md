# JEV-INT-05 — Mac repair verification and residual stop window

Date: 2026-10-07. Status: **REVIEWED CANDIDATE; OFF; NOT RATIFIED; NOT READY FOR LIVE EXECUTION.**

## Scope and exact identity

Reviewed HEAD: `765c236e1228f09b939a8eee87edc71635040af5`.
Code/test commit: `63cf4d921ef8ae92f1cf61c0a548c0aa09cac2b9`.
Repair implementation commit: `39d712fbc2efc1b46ff4f0c9f3f9a14022a2a8b1`.
Only the repair-evidence Markdown file differs between the tested code commit and reviewed HEAD.

This act adds evidence under docs only, on its own branch. It does not change runtime source,
tests, package scripts, the frozen J1 objects, the Claude-owned branch, authorizations or provider policy.
No provider client was constructed; no credential was accessed; no inference or spending occurred.
All exercised transports were fake. The committed schema gate remains false and a control confirmed zero sends.
PILOT-01 remains deferred. No pilot files, judgments, backups, reminders or labeling server were touched.

## The missing handoff and schema checks are resolved here

The original eight payload files in the bounded repair ZIP were rehashed in the ChatGPT working
container: 8/8 match their original manifest and are byte-identical to the earlier review ZIP.
All ten entries in the outer handoff manifest also match; the standalone instruction is byte-identical.
`bundle-verification.json` records these checks and exact hashes. This is a new reviewer check,
not a retroactive claim that the Claude session received or inspected the bundle.

The exact public schema snapshot is included at:
`docs/programme/evidence/jev-wire-repair-mac-20261007/typesafe-openapi.json`.
SHA-256: `a191f8a7df6bd6fedced8120dd0fd106f88575d1d1c8360d08900a6c7c0360d5`.
It matches both the prior Mac snapshot and the original handoff snapshot.
Its original retrieval receipt is included unchanged: unauthenticated HTTP 200 public documentation,
not an inference call. The public endpoint was also read by the web tool in this review session.

Schema facts: response model identity is top-level `model`; the other listed root properties are
`answers` and `usage`. `answers.Q_RISK` is the expected keyed answer, with `type` and `noul`.
Usage lists `input_tokens` and `output_tokens`. There are no other listed root properties in this
captured schema. The schema does not globally set `additionalProperties: false`; exact-member
rejection is the experiment's stricter policy, not a vendor promise.

The repaired descriptor's field sets match this snapshot. A documented-shape synthetic response
is accepted by the repaired parser. No descriptor or question-table change was made in this review.
The epistemic schema question is resolved; this does not open the committed gate or grant execution.

Public reference: https://api.typesafe.ai/openapi.json

## Independent Mac execution

Clean detached source checkout at the reviewed HEAD, before any review documentation was added.
Installed project dependency tree was symlinked, not installed again. Node v22.22.3, tsx 4.21.0,
TypeScript 5.9.3, @types/node 25.0.9. This is strict J1 typecheck, not the full application's typecheck.

- Old-candidate reproductions: 8/8 findings reproduced (expected defect result).
- Repaired-candidate reproductions: 0/8 findings reproduced (specified reproductions no longer fail).
- Wire proof: 34/34 PASS.
- Wire matrix: 41/41 candidates killed on their named checks as reported by its committed runner.
- J1 host: 26/26 PASS; freeze: 0 violations.
- Frozen J1 matrix: 63/63 named kills; 0 survivors, unclassified, or stale.
- Strict J1 typecheck: exit 0.

Every log includes command, exact HEAD, timestamps and explicit exit code. The silent compiler log
is nonempty. Source was clean after all checks. This confirms the reported suites, not all possible
failure paths. Full logs and receipt are in the adjacent evidence directory. Committed log copies use the
`.log.txt` suffix to follow repository file rules; their bytes and hashes equal the local `.log` files.

| Check | Exit | Full log SHA-256 |
|---|---:|---|
| findings-old | 0 | `5a2a82fb5d11f0ccfbdec4f428aaf78681f90620ffff111b0396fb4f6696a4c0` |
| findings-new | 0 | `f80aacd9e31f5bfcff6bde1f65cc8f3ff7ec4f2bb5b8815d862f6a80cdc957a0` |
| wire-proof | 0 | `c72ea179c112c9b0a69c77b1e7aad6bd1e0518d4726697193c25f32f48e1f488` |
| wire-matrix | 0 | `9e6331be858d296b1c2e8d2281e58fec7e0d3383a0d9613b7bdf69bc060b7193` |
| J1-freeze | 0 | `ccf40ef47c1dcabd42252627d91613c409b14d286590362adc29da1fe03bd29d` |
| J1-host | 0 | `a3c43764a7a9aa93a5db267094f7ea0f90761a05fd4168cdfe7cc08be35ba34a` |
| J1-matrix | 0 | `4b1e4d523327adaf45ee8661c10fa440337a7b077b2bdc99046bd6359b942f9e` |
| J1-typecheck | 0 | `47eb706e84f50a98a5fd2a25751ccfb73d48ff496afab842afd78a2573c35d9a` |

Mac execution receipt SHA-256:
`8b8630b21804498da79c3fb2864463f08aa5b514dc3a4551b1110cd9a7e24fbd`.

## One residual stop-rule defect, four reproductions

The repair fixes process loss with an unresolved reservation. It does not fix a later boundary:
**the failing attempt is settled, then its required halt is written in a second append.**
If the process exits after the settled append but before the halt append, restart sees neither an
unresolved attempt nor a halt and permits the next dispatch. This is not the disclosed valid-prefix
truncation limitation: the surviving ledger is the exact unedited bytes produced before the crash.

The new witness intercepts `ledger.append` only to exit a disposable child immediately after the
real settled append has fsynced and returned. It changes no production method. Only the existing
test helper opens the schema flag inside a temporary module copy; every send is fake.

| Stop condition | Child exit | Next fake sends after restart | Required |
|---|---:|---:|---:|
| Transport error / crossing unknown | 47 | 1 | 0 |
| Malformed provider response | 47 | 1 | 0 |
| Returned model drift | 47 | 1 | 0 |
| Usage exceeds reserve | 47 | 1 | 0 |

The error handler's claim that an unresolved reservation always covers a failed halt append is
false when settlement already succeeded. A head hash alone does not repair this semantic gap:
it can faithfully anchor the settled-but-not-halted prefix.

Bounded correction: make required stop status inseparable from the authoritative attempt outcome,
or conservatively derive it from durable history before any next reservation. Preserve failure
classification and unknown-usage reservations. Exercise process loss and persistence failure at
this exact boundary, plus late response handling. Do not merely retry the missing halt write.
The regression must prove zero subsequent dispatch for all four cases without relying on a
human to remember that the previous process had an error.

The parser also accepts `output_tokens = 9007199254740992`, which is not a safe JavaScript integer.
The original handoff specified nonnegative safe-integer token counts. Use safe-integer checks for
both usage fields and add a targeted refusal test; this requires no schema or authority widening.

Run the committed reviewer witness from repository root:
```bash
node docs/programme/evidence/jev-wire-repair-mac-20261007/schema-stop-witness-portable.mjs . docs/programme/evidence/jev-wire-repair-mac-20261007/typesafe-openapi.json
```
Exit 0 means the measurements completed. Inspect each `stop_invariant_holds` field. It is not an
acceptance-suite pass. The script writes only new synthetic temporary directories and uses fake
transports. It leaves the committed candidate and its false schema flag untouched.

## Previously disclosed runtime limits remain

Returning `ledger_head` is not external-anchor enforcement. Before any live execution, the runtime
owner must choose durable storage, persist and compare an independent last-known head/experiment
identity, and refuse unexpected truncation or replacement/re-initialization. Establishment and
resumption must be explicit. A stale lock must remain a refusal pending inspection, not be deleted
automatically on the assumption it is old. These are activation requirements, not new blanket
claims that every ledger primitive has failed.

J1R5-WIRE ratification, the Route A authorization/assignment chain, bounded execution/network/spend/
disclosure grants, applicable terms review, credential and a real adapter remain separate and unopened.
No permission can be inferred from this review, schema receipt, test result, or docs commit.

## Handoff

Do not repeat the broad four-area repair pass or reopen PILOT-01. Close the settled-before-halt
window and safe-integer guard with focused regressions and named defeat candidates, then rerun
existing suites. Use this repository-hosted schema rather than a missing ZIP. Keep the candidate off.
The earlier eight reproductions are fixed on their tested paths; restart-safe stop semantics are
not yet complete, so this review does not approve live activation.
