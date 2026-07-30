# Typecheck Gate Coverage Audit — 2026-07-30

**Class:** tooling / evidence integrity. Not a feature. No fixes applied.

## Summary of the real finding

The reported symptom was "`npm run typecheck` does not cover `app/press/**`." That is true but
badly understates it.

`tsconfig.typecheck.json` is an **entry-point-only** config:

```json
{ "extends": "./tsconfig.json", "include": [], "files": ["app/api/between/chat/route.ts"] }
```

`npm run typecheck` therefore checks **one route file plus its transitive import graph** — 409
non-`node_modules` files, all reached by import. It is not a project gate at all.

Measured on this worktree (`reverent-boyd-507041`):

| Metric | `npm run typecheck` |
|---|---|
| Files checked (non-`node_modules`) | 409 |
| `.tsx` files checked | **0** |
| `components/**` files checked | **0** |
| `middleware.ts` checked | **no** |
| `app/**` files checked | **3** (all under `app/api/between/`) |

Zero React components of any kind are in the gate. The 409 files are almost entirely `lib/*`
(`lib/consciousness` 89, `lib/memory` 34, `lib/maia` 22, `lib/knowledge` 19, …) — and only those
`lib` files that this one route happens to import.

## The full uncovered list (the actual deliverable)

Every `app/` subdirectory, on-disk file count vs. covered-by-`typecheck` count:

```
on-disk  covered  dir
   1745        3  app/api        (only app/api/between/**)
     81        0  app/maia
     63        0  app/labtools
     62        0  app/studio
     35        0  app/dashboard
     26        0  app/practitioner
     20        0  app/book-studio
     19        0  app/astrology
     19        0  app/admin
     17        0  app/fields
     12        0  app/stellium
     11        0  app/oracle
     11        0  app/now-what
     10        0  app/founder
     10        0  app/community
      9        0  app/team
      9        0  app/portal
      9        0  app/model-studio
      7        0  app/press
      7        0  app/caseload
      6        0  app/consciousness
      6        0  app/commons
      5        0  app/soul-portrait
      5        0  app/practitioners
      5        0  app/book
      4        0  app/onboarding
      3        0  app/worlds
      3        0  app/wisdom-keepers
      3        0  app/helper-fund
      3        0  app/field
      3        0  app/consciousness-computing
      2        0  app/voice-controller-test
      2        0  app/vision-studio
      2        0  app/soullab-studio
      2        0  app/session
      2        0  app/relationships
      2        0  app/partner
      2        0  app/open
      2        0  app/library
      2        0  app/diag
```

Plus: all of `components/**`, all of `hooks/**`, `middleware.ts`, and every `lib/**` file not
imported by `app/api/between/chat/route.ts`.

`app/press` is not specially excluded. It is uncovered for the same reason 39 other app
directories are uncovered: **nothing is included except one file.**

## Provenance

```
a0cd1b57a  chore(typecheck): add tsconfig.typecheck.json for CI
c7f65215c  chore(typecheck): entrypoint-only config; ts-nocheck for prototype imports (#42)
```

`c7f65215c` (2025-12-30, Kelly) deliberately narrowed the config from
`include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"]` to the single-file form, as part of a
green-the-build pass that also bulk-applied `// @ts-nocheck`. So this was an intentional
temporary narrowing that then became the cited gate.

## The name collision (root of the evidence problem)

There are two scripts one keystroke apart, with radically different scope:

| Script | Config | Non-`node_modules` files | Current errors |
|---|---|---|---|
| `npm run typecheck` | `tsconfig.typecheck.json` | 409 | 0 |
| `npm run type-check` | `tsconfig.ship.json` | **4246** | **239** |
| `npm run typecheck:core` / `type-check:full` | `tsconfig.core.json` | — | 553 |
| `npm run typecheck:wide` | `tsconfig.json` | — | ~772 |

- **`CLAUDE.md` "Before Making Changes" step 4 tells agents to run `npm run typecheck`** — the
  409-file entrypoint one. That is the instruction that produced the false green.
- **CI (`.github/workflows/deploy.yml:52`) runs `npm run type-check`** — the ship config. Different
  gate, 239 errors. `mobile-deploy.yml:49` runs it with `|| echo "Type check warnings ignored"`,
  i.e. non-blocking by construction.
- **No git hook runs any tsc.** `.githooks/pre-commit` / `pre-push` do not invoke typechecking.
- CLAUDE.md also records that CI deploys are disabled (no self-hosted runner). So in practice
  **nothing enforces TypeScript on the deploy path today.**

`tsconfig.ship.json` **does** cover `app/press` (5 files here) and reports **0 errors in
`app/press`** on this worktree — because the Author Studio shell that produced the 3 reported
errors lives on an unpushed branch (`abd24e009`), not in this checkout.

## RULING (Kelly, 2026-07-30): Option 1b — implemented

Fix the contract, do not add another local exception. Implemented in this change:

| Script | Meaning |
|---|---|
| `npm run typecheck` | **enforced no-regression gate** — `scripts/check-typehealth-baseline.js` |
| `npm run typecheck:full` | complete current diagnostic inventory — `tsconfig.ship.json` |
| `npm run typecheck:entrypoint` | narrow Between-route check — `tsconfig.typecheck.json` |
| `npm run typecheck:baseline` | **dry run** — refuses to write without `-- --accept-current` |

Removed the near-homonyms: `type-check` (→ `typecheck`), `type-check:full` (duplicate of the
surviving `typecheck:core`), `type-check:prompts` (→ `typecheck:prompts`).

### Baseline design

`typecheck-baseline.json` (checked in). **Diagnostic identity, not a count** — each entry is keyed
on `file | TS code | normalized message`, with a per-key occurrence count. Recorded at 239 errors
across **173 distinct identities**, 3,965 program files.

Fails on: (1) NEW identity, (2) INCREASED count for an existing identity, (3) COVERAGE LOST — a
baselined path that left the program *while still existing on disk*. Passes on: fixes, reduced
counts, files legitimately deleted, new files entering the program. The baseline may shrink freely.

### Re-baselining is a governed act

The mechanism that prevents regressions must not also be an easy way to bless them.
`npm run typecheck:baseline` is a **dry run**: it prints a before/after summary
(errors / identities / program files), names every diagnostic it would bless, and **exits 1
without writing**. Recording requires the explicit `npm run typecheck:baseline -- --accept-current`.
When an accepted write does bless new errors or coverage loss, the success message says so and
instructs the author to disclose it in the commit and PR.

Verified: bare `--update` exits 1 even with zero drift; a probe error in `app/press/` produced
`⚠️ THIS WOULD BLESS 1 NEW … diagnostic(s)` naming the file, and left the baseline byte-identical.

### Deviations from the ruling — flagged, not silent

1. **Line numbers are excluded from the identity key** (the ruling listed "line or stable source
   location" as a minimum component). Lines shift on every insertion above a diagnostic and would
   produce constant false regressions. Lines *are* recorded per key (`lines`) for diagnosis. The
   key still carries file + code + normalized message + count, which satisfies the stated
   acceptance condition — see the proof below.
2. **The gate is not built on `scripts/audit-typehealth.ts`** (the ruling said "where practical").
   That script runs a *bare* `npx tsc --noEmit` — the wide config, not ship — takes no project
   argument, and is a module-level error-density ranker, not a diagnostic-identity comparator. It
   remains the prioritization tool; `audit:typehealth` was repointed to `typecheck:full` so it no
   longer silently consumed the entrypoint config's output.

### Verification — each failure class was exercised, not assumed

- **Acceptance condition (count-masking).** Introduced one error in `app/press/` and suppressed one
  pre-existing error in `app/admin/security/page.tsx`. Total stayed at **239 = 239**. Gate
  **FAILED**, reporting `introduced: app/press/__typecheck_probe.ts TS2322` and
  `fixed: app/admin/security/page.tsx TS2322`. A count-only baseline would have passed this.
- **Coverage loss.** Added `app/press/**` to `tsconfig.ship.json`'s exclude — the same narrowing
  move as `c7f65215c`. Gate **FAILED** with `COVERAGE LOST (5)`, naming all five Press files.
- **Clean state.** With probes reverted: `239 (baseline 239)`, `3965 (baseline 3965)`, pass.

Probes were removed and the working tree restored before commit.

### Enforcement debt carried forward (item 8 — not authorized for removal here)

`.github/workflows/mobile-deploy.yml` still runs the gate as `npm run typecheck || echo "Type
check warnings ignored"`. That `|| echo` makes the step non-blocking by construction — a
regression cannot fail the mobile pipeline. Left in place per the ruling, now annotated in-file
as explicit debt. Additionally, CLAUDE.md records that CI deploys are disabled (no self-hosted
runner), so `deploy.yml`'s now-blocking gate does not currently execute either. **The gate is real
locally; it is not yet enforced by any running pipeline or git hook.**

## Options as presented (retained for the record)

Ordered by recommendation.

### Option 1 (recommended) — retire the name collision; make `typecheck` mean ship

Rename the current entrypoint config's script to `typecheck:entrypoint` (keep it — it is a real
fast smoke for the `between` route) and repoint `typecheck` → `tsconfig.ship.json`, i.e. the same
config CI already uses.

- Pro: one name, one meaning; agent instructions and CI converge; `app/press` and all
  `components/**` come into the gate immediately.
- Con: **`npm run typecheck` becomes red at 239 pre-existing errors.** It cannot be a
  pass/fail gate on day one — it needs a baseline (see Option 1b).
- Contract change: yes, loudly. Every lane that cited "typecheck passes" as evidence must be
  re-read as "the 409-file entrypoint graph passes." That re-reading is the point.

### Option 1b — Option 1 plus an error baseline

Ship a checked-in baseline of the 239 ship errors and fail only on *new* ones (there is already
`scripts/audit-typehealth.ts` + `artifacts/typecheck-full.log` machinery to build on). This makes
the wide gate actionable without a 239-error mass fix.

### Option 2 (smallest, non-breaking) — add a targeted `typecheck:press`

```
"typecheck:press": "tsc -p tsconfig.press.json --noEmit"
```
with a new config including `app/press/**`. Leaves `typecheck`'s contract untouched.

- Pro: zero blast radius; unblocks the Author Studio lane today.
- Con: does not fix the false-green problem for the other 39 uncovered app directories, and adds
  a sixth typecheck script to a repo that already has five.

### Option 3 — widen `tsconfig.typecheck.json` itself to include `app/press/**`

Explicitly rejected as a recommendation: it entrenches the entrypoint config as a pseudo-project
gate and invites per-lane accretion of `files:` entries. If Press is worth gating, so is
`app/maia` (81 files) and `components/**`.

## Non-negotiable regardless of option

`CLAUDE.md` step 4 currently reads:

> Run `npm run typecheck` for TypeScript validation (do not run single-file `tsc` — it bypasses path mappings)

The parenthetical is ironic: the recommended command *is* effectively a single-file check. This
line must be corrected in the same change as whichever option is chosen, or the false green
persists no matter what the scripts do.
