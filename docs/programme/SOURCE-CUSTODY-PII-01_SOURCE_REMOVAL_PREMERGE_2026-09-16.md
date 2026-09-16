# SOURCE-CUSTODY-PII-01 · Source Removal Pre-Merge Witness

**Date:** 2026-09-16
**Base:** `55577e45ec74ff46a5080904867aa3dad1019111`
**Branch:** `fix/source-custody-source-removal-20260916`

## Purpose

R3 production custody is already verified in governed `ops_contacts`, and R12 hashed invite custody is deployed. This act removes the remaining tracked human-record carriers from HEAD only after their runtime consumers have been migrated to governed storage.

This act does **not** claim erasure from Git history, clones, backups, old worktrees, or historical container images.

## Carriers removed from the candidate tree

- `lib/ganesha/contacts.ts`
- `lib/data/betaTesters.ts`
- `beta-tester-email.md`
- `scripts/source-custody-r3-migrate.ts` — completed one-time custody importer

The production precondition remains the verified governed custody population: 52 operational contacts, with 41 unique member links, 1 ambiguous match, and 10 unmatched records. No credential field was migrated into that substrate.
## Governed replacement

A shared server-side loader, `lib/ops/sourceCustodyContacts.ts`, now reads the migrated operational records from `ops_contacts` where `source = 'source-custody-migration'`.

Runtime recipient consumers migrated to that governed loader:

- `lib/services/emailService.ts`
- `scripts/send-beta-update-email.ts`
- `scripts/send-maia-ready-email.ts`
- `scripts/send-steward-invitation.ts`

There is no fallback from governed custody back to tracked roster files.

The recurring startup call to `scripts/source-custody-r3-migrate.ts` is removed because custody transfer is complete.

Campaign copy was also repaired so no script tells recipients to use retired `SOULLAB-[YOURNAME]` credentials and no script reads or redistributes legacy passcodes. Existing members are directed to sign in; people needing admission are directed to request a fresh invitation.

## Residual census

Executable references to the retired carriers/importer: **0**.

Legacy passcode access/campaign language in the migrated consumers: **0**.

Remaining textual mentions of `lib/ganesha/contacts` are limited to tests/comments/witness material that documents or attacks the historical boundary; they are not runtime imports.
## Boundary witnesses

The browser-boundary test was strengthened for the post-removal state:

1. the legacy human-record source carriers must be absent; and
2. no client module may transitively reach the governed `ops_contacts` loader.

The mutant reintroduces a client import of `lib/ops/sourceCustodyContacts` and the walker must kill it.

Focused source-removal/boundary tests: **8 / 8 PASS** across 2 suites.

Root TypeScript no-regression gate:

- candidate: **229 errors**
- baseline: **239 errors**
- regressions: **0**
- five baselined files are deleted from disk by this act; deletion is not counted as regression.

Provider governance: **PASS**.
No-Supabase: **PASS**.
Design canon: **PASS** — no member-facing UI surface changes.
`git diff --check`: **PASS**.
Full Next production build on the exact candidate tree: **RC = 0**.
## `typecheck:scripts` classification

`typecheck:scripts` is not green on canonical and is not reported as green here.

Measured on exact canonical base `55577e45ec74ff46a5080904867aa3dad1019111`:

- error lines: **40**
- unique error identities: **40**

Measured on the source-removal candidate:

- error lines: **40**
- unique error identities: **40**
- head-only identities: **0**
- base-only identities: **0**
- identity sets: **identical**

Classification: **legacy-red baseline · zero source-removal regression**.

## Post-merge production witness required

Before this act is called closed, production must prove:

1. the deployed image is built from the merged source-removal commit;
2. `lib/ganesha/contacts.ts`, `lib/data/betaTesters.ts`, `beta-tester-email.md`, and `scripts/source-custody-r3-migrate.ts` are absent from the deployed application filesystem;
3. governed `ops_contacts` remains **52 total / 41 unique member links / 1 ambiguous / 10 unmatched**;
4. no credential-shaped field has appeared in the governed contact metadata;
5. R12 invite plaintext remains zero.

Removal from HEAD/deployed image does not resolve historical Git/replica custody. History remediation remains a separate later act.