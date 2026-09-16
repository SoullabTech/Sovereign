# SOURCE-CUSTODY-PII-01 · Source Removal Production Closure

**Date:** 2026-09-16
**Canonical / deployed subject:** `93b2000f1cfa6622ad6d1203942aed783ef61c9c`
**PR:** `#1307` — `fix(custody): remove tracked human-record source carriers`

## Scope

This record closes the current-source and deployed-image portion of SOURCE-CUSTODY-PII-01 source removal.

It does **not** claim removal from Git history, clones, old worktrees, backups, registries, or historical container images. Those remain a separate history/replica remediation act.

## Merge and deployment

PR #1307 merged only after the exact reviewed head `f4e8339d43cb8900b71b21d2b790722df944d41d` passed the Class A CI matrix, including Docker Build Check and Canonical PR Quality.

Production was then deployed through the immutable-SHA deploy path to merge commit `93b2000f1cfa6622ad6d1203942aed783ef61c9c`.

Post-deploy container state:

- `maia-sovereign`: healthy
- `maia-api`: healthy
- `maia-postgres`: healthy
- `GIT_COMMIT=93b2000f1`
## Deployed image witness

The production container was checked at `/app` after the deploy transaction completed.

All four retired carriers/importer are absent at their canonical paths:

- `/app/lib/ganesha/contacts.ts` — **ABSENT**
- `/app/lib/data/betaTesters.ts` — **ABSENT**
- `/app/beta-tester-email.md` — **ABSENT**
- `/app/scripts/source-custody-r3-migrate.ts` — **ABSENT**

A recursive filesystem search for those exact source paths / filenames returned **0 matches**.

This establishes absence from the currently deployed application image only.

## Governed custody witness

Counts-only production query against `ops_contacts` where `source='source-custody-migration'` and `deleted_at IS NULL` returned:

- total governed contacts: **52**
- rows with durable `member_id`: **41**
- `unique_member_match`: **41**
- `ambiguous_member_match`: **1**
- `no_member_match`: **10**
## Credential-metadata witness

A recursive credential-shaped JSON-key scan across all 52 governed rows returned **0 rows** containing keys matching:

`passcode | passkey | credential | secret | token | password`

The complete top-level metadata key set is:

- `groups`
- `join_date`
- `legacy_source`
- `reconciliation_state`
- `source_custody_key`
- `tags`

No credential field was migrated into governed contact custody.

## R12 continuity witness

Production `invites` remains hash-only after the source-removal deploy:

- rows with plaintext `passkey IS NOT NULL`: **0**
- pending rows missing `passkey_hash`: **0**

Source removal therefore did not regress the R12 invitation-custody boundary.
## Closure classification

Current-source / deployed-image source removal is **VERIFIED**.

The evidence supports exactly these claims:

- tracked human-record carriers are absent from canonical HEAD;
- the same carriers are absent from the deployed application image;
- operational custody remains present in `ops_contacts` at `52 / 41 / 1 / 10`;
- governed contact metadata contains no credential-shaped keys;
- R12 invite plaintext remains zero.

It does **not** support a historical erasure claim.

Standing after this witness:

`HEAD / deployed image source carriers = REMOVED · VERIFIED`

`Git history / replicas / old images = REMEDIATION STILL OPEN`
