# Writer source-intake acceptance instrument · STATUS (2026-11-03)

```
STANDING:  PHASE 1A COMPLETE AS A CANDIDATE. Built, self-tested, mutation-checked, cross-checked against the repository.
           NOT frozen. NOT wired into CI, npm scripts or any gate. Authorizes nothing.
           Lifts no hold, changes no product source, creates no AWS resource, touches no member data.
           No human has reviewed it. The reviews below were run by agents and by me; they are not a ruling.
PLAN:      docs/programme/WRITER_SOURCE_INTAKE_ACCEPTANCE_PLAN_2026-11-02.md (+ APPENDIX)
PRODUCT FIXES: live on a SEPARATE branch, claude/writer-source-intake-hardening (not merged, not deployed).
               See section 5 for what that branch and this one must do together.
```

Plain Node ESM, zero npm dependencies, fictional data only. Every module is run directly: `node <file>` prints its
self-test and exits 0 or 1. **A passing self-test means a module agrees with its own checks. It does not mean the module is
right.** The columns below say what was added to that: a mutation audit, an adversarial review, a cross-check.

## 1. What exists (all re-measured on 2026-11-03 by running them, not copied from agent reports)

| Module | Self-test | Mutation evidence | Adversarial review |
|---|---|---|---|
| `lib/strip.mjs` comment strippers (TS/JS, SQL, YAML, shell, Dockerfile, dotenv, Caddyfile) | PASS 264 | own audit: **177 of 177** mutants killed | done, repaired. 180 further generated mutants are *believed* equivalent, not proven. |
| `lib/tree.mjs` immutable overlay tree | PASS 140 | own audit: **243 of 243** killed | done, repaired. `code()` still returns RAW text for kinds with no stripper; use `codeStrict()` or check `codeKind()`. |
| `fixtures.mjs` fictional manuscripts (29 files) | PASS 41 (needs `unzip`, poppler, `xmllint`; fails closed without them unless waived) | seeded sweep: see section 3 | done, repaired. **Every expectation is still `inferred-from-source`**; see section 4. |
| `scanners.mjs` content-free residue scanners | PASS 78 | own audit: **48 of 48** killed | done, repaired. Compressed originals armed from siblings can still misreport about 1% of unseen same-template uploads. |
| `receipt.mjs` per-obligation receipt + independent validator | PASS 179 | seeded sweep: see section 3 | done, repaired (sealed ruling, table digest, evidence rules). A runner that lies consistently still yields a valid receipt. |
| `falsifiers-a.mjs` SF-01 to SF-09 | PASS 643 (81 defeats, 89 decoys) | seeded sweep: see section 3 | done, repaired. |
| `falsifiers-b.mjs` SF-10 to SF-19 | PASS 1017 (160 defeats, 26 decoys) | seeded sweep: see section 3 | done, repaired. |
| `matrix.mjs` the lethality matrix (this directory) | its steps are proven to FAIL on injected faults | n/a | not reviewed |

## 2. The twenty falsifiers, measured on two real trees

GREEN = the law holds. RED = it is violated. `docs tree` is canonical plus this branch; `hardening` is the product-fix branch.
Every docs-tree verdict except SF-18 was confirmed by reading the cited repository lines, not by trusting the agents; SF-18 (1,514 test files) was validated by sensitivity instead: it flagged exactly the three new tests on the hardening tree.

| | docs tree | hardening branch | note |
|---|---|---|---|
| SF-01 sources POST hard-held | GREEN | GREEN | |
| SF-02 plaintext upload route held at the lift | RED | **GREEN** | D2 |
| SF-03 upload-door inventory | GREEN | **RED** | correct: D2 makes the declared disposition of the workbench route stale; requalify at merge |
| SF-04 audience enforced at ingest | RED | **GREEN** | D1 |
| SF-05 empty text refused before custody | RED | **GREEN** | D3 |
| SF-06 gate order | GREEN | GREEN | |
| SF-07 export/erasure certification independent | GREEN | GREEN | |
| SF-08 posture consulted | RED | **GREEN** | D6 |
| SF-09 failed claim not shown as held | RED | **GREEN** | D4 (labelled, not refused; see the hardening record) |
| SF-10 stranded-intent door | RED | RED | the sweep is not built (real); the law also names a function the branch bypasses (over-specific) |
| SF-11 awaited replay loads | RED | **GREEN** | |
| SF-12 KMS timeouts | RED | **GREEN** | D9 |
| SF-13 no KMS Decrypt inside the claim transaction | RED | RED | not addressed |
| SF-14 KMS call model | GREEN | GREEN | static model equals the separately measured counts (1 GenerateDataKey; 2, 3, 4 Decrypts) |
| SF-15 worker mount parity | RED | RED | infrastructure, not code |
| SF-16a no static credential committed | GREEN | GREEN | |
| SF-16b credential channel | RED | RED | infrastructure |
| SF-17 Delete Work copy honesty | RED | **GREEN** | D5 (first pass was incomplete: two more sentences; found by this falsifier) |
| SF-18 hold-pinning test inventory | GREEN | **RED** | correct: the branch adds three tests that pin held state; requalify at merge |
| SF-19 local-test provider confined | GREEN | GREEN | |

The static falsifiers cite **28 of 98** obligations. The other 70 rest on dynamic probes (`dynamic/`), the founder's AWS steps, or are not built.

## 3. The matrix, and what it found

`node matrix.mjs` (quick), `--full` (adds the three shipped audits), `--sweep[=N]` (seeded source mutants of the four modules that
have no audit of their own). Verdicts are `PASS_COMPLETE`, `PASS_PARTIAL` (names what did not run) or `FAIL`. A step that did not run
is never counted as passed.

- Steps A selftests, H content-free, C integrity, D reality, E no-laundering: **PASS**. Each was shown to FAIL on an injected fault
  (a canary-shaped token printed by a module; a falsifier citing an unknown obligation; a falsifier declaring the wrong state; the
  receipt rule "unruled is never STEP4_READY" removed from builder and validator together).
- Step E is discriminating: the best-case input is `PROVISIONAL` (reason `NOT_RULED`) unruled and `STEP4_READY` once ruled.
- **Finding:** the obligation index's `expectedRedToday` flag is title-derived (26 of 98) and understates what is red: seven falsifiers
  verified RED (SF-02, 04, 11, 12, 13, 15, 16b) cite no obligation the index marks expected-RED. `coveredToday` is true for all 98
  and carries no information. The index was not rewritten; the matrix enforces only the direction that can contradict (a GREEN
  falsifier may not cite an expected-RED obligation) and reports the rest.
- Shipped audits (step B): strip 177/177, tree 243/243, scanners 48/48 mutants killed. **PASS.**
- **Sweep (step F): FAIL, and that is the honest result.** Seed 20261102, 24 seeded source mutants per module for the four modules with no
  audit of their own: **60 of 96 killed, 36 survived** (fixtures 11/24, receipt 19/24, falsifiers-a 18/24, falsifiers-b 12/24). A survivor
  means the module's own self-test still exits 0 after a change to its logic. Many sit in the self-test code itself, where an
  inverted operator means a check that cannot fail. Each is either an equivalent mutant (needs a stated reason, recorded in
  `matrix-survivors.json`) or a gap that a new check must close; none has been classified yet. The first one probed
  (`fixtures.mjs`, the EPUB entry-count boundary) is a computed boolean that does not decide the outcome. Triage tool:
  `node matrix.mjs --probe=MODULE:FINGERPRINT`.

## 4. What is still inferred, not measured

- **Fixture expectations.** The repaired fixture table (29 files) has not been checked against the real `parseUpload`. The earlier
  16-file generation was (dynamic probe P1, 2 PDFs under `tsx`). Re-running probe P1 on the repaired set is queued, not done.
- No run against real KMS, a real vault host, or the live Caddy configuration. Every KMS result so far is a recording fake.
- The EPUB total-size guard cannot be shown to bound work (jszip inflates every entry before it runs); a fixture can only show the refusal.
- Static falsifiers read text. A hold written as a ternary or `&&` statement, a pin written without a marker, a callee reached by
  dynamic dispatch, a guard that delegates its throw to a helper: each reads as RED or as unseen, never as a pass.

## 5. Open items that belong to a person, not to this instrument

1. `dispositions.json` stays `"ruled": false`. Until a founder ruling act seals it, no receipt can read `STEP4_READY`
   (matrix step E proves this on the best-case input). Nine BLOCKERs depend on DECLARED_GAP prerequisites; that is a ruling, not a repair.
2. **Cross-branch requalification.** When the hardening branch merges it must, in the same change, update this suite: the declared
   inventory for `app/api/book-studio/workbench/uploads/route.ts` (SF-03) and the declared hold-pinning set (SF-18, three new tests).
   The two branches currently disagree on purpose: the instrument is correct that the code moved.
3. SF-10's law names `inspectMemberIncompleteLandings`, which the hardening branch bypasses with a lister that returns what a member needs
   to recognise an item. Decide whether the law should be about "a deployed lister" or about that function; and whether the expiry sweep
   is required (it needs a member-approved retention policy).
4. The index flags (section 3) need a decision: keep as plan annotations, or derive from measured falsifier state.

## 6. Not built

- Route-level dynamic probes for size and text caps, the 25 MiB boundary and header sanitising (the route is held at module load; a
  flag-true harness image is needed).
- Any run against real KMS (founder AWS steps, plan phases 0 and 2).
- A frozen suite. Nothing here is frozen, and a freeze is a founder act.

## Rules for anyone extending this

Fictional data only. A scanner, evidence line or receipt may name a path, a line number, a count and an encoding, never matched
content. A check that cannot fail is not an instrument: every check needs a known-wrong input proven to fail. A passing self-test is not
a review. A surviving mutant repairs the SUITE, never the candidate. Commit references use the full SHA.
