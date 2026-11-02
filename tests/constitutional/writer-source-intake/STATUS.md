# Writer source-intake acceptance instrument · STATUS (2026-11-02, checkpoint)

```
STANDING:  WORK IN PROGRESS. A checkpoint, not a finished instrument.
           Not frozen. Not wired into CI, npm scripts, or any gate. Authorizes nothing.
           Lifts no hold, changes no product source, creates no AWS resource, touches no member data.
PLAN:      docs/programme/WRITER_SOURCE_INTAKE_ACCEPTANCE_PLAN_2026-11-02.md (+ APPENDIX)
```

Plain Node ESM, zero npm dependencies, fictional data only. Every module is run directly: `node <file>` prints its
self-test and exits 0 or 1. A self-test passing means the module agrees with its own author's checks; it does **not**
mean the module has survived an adversarial review. The review column says which have, and what is still open.

## What exists

| Module | Self-test | Adversarial review | Open |
|---|---|---|---|
| `lib/strip.mjs` comment strippers (TS/JS/SQL/YAML) | PASS 216/216 | done; repair **partly** applied | 31 of 40 reviewer mutants survived the first self-test; shell/Dockerfile/`.env` files are returned **unstripped** (`codeKind()` says `none`). Callers must say so in evidence. |
| `lib/tree.mjs` immutable overlay tree | PASS 128/128 | done; repair **partly** applied | models the working directory, not the commit (untracked/ignored files are visible); `code()` is raw for kinds with no stripper. |
| `fixtures.mjs` fictional manuscripts | PASS | done; repair applied (12 fixes), 8 items remain | **HIGH:** the per-fixture expectation table (`expectedParse`, status class) is not pinned by the self-test. The independence cross-checks pass vacuously when `unzip`/poppler/`xmllint` are absent. Expectations are `inferred-from-source`, the parser has not been run on them. |
| `scanners.mjs` content-free residue scanners | PASS 61/61 | done; **1 HIGH fixed** (see below) | 4 medium: probe windows can land on template boilerplate; some accidental-leak encodings undetected (`JSON.stringify(Uint8Array)`); unreadable/too-deep paths not pinned by the self-test; chunk-carry aliasing mutant survives. |
| `receipt.mjs` per-obligation receipt + independent validator | PASS 74/74 | done; **repair not applied** | 7 medium, see below. **Do not rely on a `STEP4_READY` verdict from this module yet.** |

**Fixed since review:** `scanBuffer` and `Matcher.feed` silently matched nothing on a plain `Uint8Array` (a key in one read
CLEAN). Reproduced, fixed, and pinned by check `A0`, which fails against the unfixed code.

## Receipt: why READY is not yet trustworthy

Open reviewer findings, none yet repaired: evidence is judged only as "three non-blank strings", so placeholder text and one
shared triple cited by all 98 obligations pass; the receipt carries no digest of `obligation-index.json` /
`dispositions.json`; synthetic/fixture evidence can reach `STEP4_READY` (it should cap at `PROVISIONAL`); `dependsOn`
is ignored (9 BLOCKERs depend on DECLARED_GAP obligations); `NOT_RUN` entries are counted into per-environment tallies;
the canary rule guards only one paragraph of fixture prose; several self-test branches are not lethal.
**Mitigation in force:** `dispositions.json` has `"ruled": false`, so no run can currently exceed `PROVISIONAL`.

## Dynamic probes (added after the checkpoint)

`dynamic/observations.test.ts` runs the REAL landing library against a real PostgreSQL 16 and a real vault, with the AWS
SDK client replaced by a recording fake through the library's own seam. `dynamic/run-local-pg16.sh` provisions a local
cluster (container-class hosts: needs root and the postgres server binaries; elsewhere point `DATABASE_URL` at any
disposable loopback database). `dynamic/gen-fixtures.mjs` writes the fictional fixtures, `dynamic/parse-pdf-fixtures.mts`
checks the PDFs under `tsx` because pdfjs cannot run in jest's sandbox.

- **Result:** 15 of 15 probes pass, the PDF check 2 of 2. Measured values are in plan record section 10.
- **Lethal:** four temporary mutations of the library (client option added, plaintext key logged, context field added,
  row lock removed) were each killed by the intended probe, and the library was restored each time. The first mutation run
  found probe L1 vacuous (its key list was wiped by a per-test reset); it now uses a cumulative list and an arming assertion.
- **Ceiling:** fake KMS, stub schema, no HTTP route. Not evidence about real AWS.
- **INCIDENT:** the first run reached real AWS KMS (rejected). The fake had been silently dropped by a cache-clear helper,
  and the host's ambient `AWS_*` credentials were picked up by the SDK default chain. Three guards now prevent a repeat; see
  the INCIDENT note at the top of `observations.test.ts` and plan record section 10.1.

## Not built yet

1. `falsifiers-a.mjs`, `falsifiers-b.mjs`, `static-falsifiers.mjs`: the 18 executable static falsifiers (SF-01 … SF-19)
   that encode plan findings F1 to F13 with defeat candidates. **Their authors hit a usage limit; nothing was written.**
2. `matrix.mjs`: the lethality matrix that runs everything against known-wrong inputs.
3. Route-level dynamic probes (size/text caps, 25 MiB boundary, header sanitising): the route is held at module load; needs a flag-true harness image.
4. Any run against real KMS. That needs the founder's AWS steps (plan §6, phases 0 and 2).

## Measured baselines taken in this lane (not in this directory)

Run on canonical `c051385b`, dependencies installed with `npm ci --ignore-scripts`:

- Six hold-pinning and key-authority suites: **6 suites, 66 of 66 tests pass.**
- `encryptedLandingPg16.test.ts` against a local Postgres 16 cluster: **12 of 12 pass.** Caveats: fake `local-test` key
  provider, the witness script's hand-built stub schema plus three migrations, R20 ledger mocked. **This is library
  evidence only. It says nothing about real KMS or a production-shaped schema.**
- The first PG16 attempt failed 12 of 12 because the runner named the vault directory wrongly. That was an instrument
  fault, not a result, and the suite's own guard refused it as designed.

## Rules for anyone extending this

Fictional data only. A scanner, evidence line or receipt may name a path, a line number, a count and an encoding, never
matched content. A check that cannot fail is not an instrument: every check needs a known-wrong input proven to fail.
A passing self-test is not a review. Commit references use the full SHA.
