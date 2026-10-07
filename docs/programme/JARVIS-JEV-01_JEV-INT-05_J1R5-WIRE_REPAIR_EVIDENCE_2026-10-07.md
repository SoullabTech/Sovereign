# JARVIS-JEV-01 / JEV-INT-05 — Bounded Repair: Evidence and Disposition

**Date:** 2026-10-07 · **Status:** ⭐ REVIEWABLE CANDIDATE · ⛔ **OFF · NOT RATIFIED · AUTHORIZES NOTHING**
**Reviewed candidate:** `12890c6fba9e8820188387e7be3ccb81367a785e` · **Repaired HEAD:** `63cf4d921ef8ae92f1cf61c0a548c0aa09cac2b9`
**All transports fake · no credential · no provider registration/assignment · no authorization record · no inference · no spend · no ratification · no merge · no deploy · PILOT-01 deferred, no labels requested or altered.**

## 0 · Handoff package: NOT VERIFIED

`JEV_WIRE_BOUNDED_REPAIR_20261007.zip`, `REPAIR_INSTRUCTION.md` and the handoff note were **not present in
this container**; only `baseline-summary.json` and `independent-findings.json` were. **Checksum
verification of the eight original files: NOT RUN.** The repair was scoped from the instruction text in
the conversation, the two JSON files, and the review summary. The captured schema was likewise not
readable here: it is cited by its SHA-256 `a191f8a7…60d5` only.

## 1 · Scoped commits (this branch, in order)

```text
12890c6fb  reviewed candidate (26-check proof, 26-candidate matrix)
39d712fbc  repair: exact response shape · durable observation · owned deadline · bound/validated/locked ledger
63cf4d921  tests: executable reproductions of the eight findings (old fails all, repair fails none)
```
(this record is committed after `63cf4d921`; it changes only documentation)

## 2 · Eight-finding disposition

| Finding | Old candidate `12890c6fb` | Repaired `63cf4d921` | Regression check · defeat candidates |
|---|---|---|---|
| S1 documented `answers` envelope | REPRODUCED | not reproduced | W27, W34 · `DC-OLD-RESPONSE-ENVELOPE` |
| S2 non-closed parser | REPRODUCED | not reproduced | W27 · `DC-EXTRA-ROOT/USAGE/ANSWER-ACCEPTED`, `DC-CONFIDENCE-FIELD-ACCEPTED` |
| D1 observation not persisted | REPRODUCED | not reproduced | W28 · `DC-OBSERVATION-NOT-PERSISTED`, `DC-OK-ON-PERSIST-FAILURE` |
| T1 never-settling transport | REPRODUCED | not reproduced | W29 · `DC-NO-DEADLINE`, `DC-AUTO-RETRY` |
| D2 resume after ambiguous crash | REPRODUCED | not reproduced | W30 · `DC-UNRESOLVED-ATTEMPT-IGNORED` |
| D3 valid-JSON invalid ledger | REPRODUCED | not reproduced | W31 · `DC-UNKNOWN-EVENT-IGNORED`, `DC-TRANSITIONS-UNCHECKED`, `DC-CHAIN-UNCHECKED` |
| D4 missing ledger allows replay | REPRODUCED | not reproduced | W32 · `DC-MISSING-LEDGER-AUTO-INITIALIZED`, `DC-BINDING-UNCHECKED` |
| D5 two-process same-attempt race | REPRODUCED (2 sends) | not reproduced (1 send) | W33 · `DC-NO-CROSS-PROCESS-LOCK` |

The old-vs-new columns come from `jev-wire-v1-findings-repro.mjs old|new`, which loads the reviewed
module straight from git (`git show 12890c6fb:…`) so the demonstration is against the actual old bytes,
not a reconstruction. The response-shape gate is opened only inside temp copies; the committed flag is
`witnessed: false` and W20 proves every send is refused.

## 3 · Commands, exit codes, evidence

Run from a clean tree at `63cf4d921` (`git status` empty before and after), this container, Node v22.22.0.
Toolchain for the two TypeScript checks was installed **in the session scratchpad** (TypeScript 5.6.3,
tsx 4.21.0, @types/node 22), **not** the project's own `node_modules` — the Mac run remains the record.

| # | Command | Exit | Result | Log sha256 |
|---|---|---|---|---|
| 1 | `node scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs old` | 0 | 8/8 findings reproduce (expectation met) | `3953f2a0b6d3…fae926` |
| 2 | `node scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs new` | 0 | 0/8 reproduce (expectation met) | `816de9258ec1…561cee4`* |
| 3 | `node scripts/builder/__tests__/jev-wire-v1-proof.mjs` | 0 | 34 passed · 0 failed | `b96b2956d246…725759b4e`* |
| 4 | `node scripts/builder/__tests__/jev-wire-v1-matrix.mjs` | 0 | 41/41 killed on named check · 0 problems | `0b889494b39f…9d4c07`* |
| 5 | `node scripts/verify-jarvis-jev-j1-freeze.mjs` | 0 | 0 violations · FREEZE INTACT | `c77942443850…df5f17`* |
| 6 | `node scripts/builder/__tests__/jev-judgment-host-v1-proof.mjs` | 0 | HOST MEMBRANE PASS | `2272eddabf1b…de6ac1`* |
| 7 | `tsx tests/constitutional/jarvis-jev-j1/matrix.ts` | 0 | MATRIX LETHAL + DISCRIMINATING · survivors 0 · unclassified 0 · stale 0 | `9ba90f54d0ff…dffa80`* |
| 8 | `tsc -p tsconfig.jarvis-jev-j1.json --typeRoots <scratch>/@types --types node` | 0 | strict, no diagnostics (empty log) | `e3b0c44298fc…b855` (sha256 of empty output) |

\* abbreviated; full digests were printed in the session transcript. Logs are in the session scratchpad and
are not committed.

## 4 · Hashes (git blob ids at `63cf4d921`; content-free)

```text
scripts/builder/jev-wire-v1.mjs                          3c668d5e614d0d39d9a98395b926df238b0d9172
scripts/builder/__tests__/jev-wire-v1-proof.mjs          c9a731a6bb02f8ce893402846ee486b4662b7837
scripts/builder/__tests__/jev-wire-v1-matrix.mjs         1381de08d37ed94947685f953eef07b17ffa7f01
scripts/builder/__tests__/jev-wire-v1-findings-repro.mjs 0c10c3e708a13994437332312f64f5ef9a44d151
scripts/builder/__tests__/jev-wire-variant-lib.mjs       7a3692957f14b9250650f49dfeeb0b83b5f7e7cf
scripts/builder/jev-judgment-host-v1.mjs                 8138beeb387b1264ce386163ea7468108f2d7451   (UNCHANGED since 12890c6fb)
question table (canonical JSON, sha256)                  6bb269d84c674d14730ecd0519ef48caef430e764fde9e32eb2f1f267610064e   (jev-wire-q2)
fixture list   (id + body hash, sha256)                  a0f4a26cea085527783a62c8875fdf60f2fed93d1f4ff48d2285ab5288c24f60   (unchanged)
response schema snapshot (reviewer-captured, sha256)     a191f8a7df6bd6fedced8120dd0fd106f88575d1d1c8360d08900a6c7c0360d5
```

## 5 · Genuine remaining blockers (the candidate stays OFF)

1. **Handoff bundle unavailable here:** the captured schema and `REPAIR_INSTRUCTION.md` could not be read;
   checksums NOT VERIFIED. In particular the **model-identity field path is unconfirmed** (`model` is an
   assumption that fails closed) and any extra top-level schema members must be added to the descriptor.
2. **`RESPONSE_SHAPE.witnessed` remains `false`** by design. Opening it is a separate founder act after the
   schema witness.
3. **Ledger residuals:** truncation to a valid prefix, or deleting the file and re-initializing, needs an
   external anchor (`ledger_head` is returned for that). A stale `.lock` after a crash inside the lock fails
   closed and needs manual inspection. The ledger's durable location is not chosen.
4. **Not yet built or authorized:** a real transport/adapter (and its own deadline ownership), J1R5-WIRE
   ratification as a J1 reopening, the Route A chain, execution/spend grants, the DPA/retention review,
   credential and billing terms.
5. **Toolchain:** items 7–8 ran on a scratchpad toolchain; the project's own `npm`-resolved run (Mac) is the
   evidence of record for the J1 TypeScript checks at this HEAD.
