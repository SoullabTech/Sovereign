# SOURCE-CUSTODY-PII-01 — Integration Provenance

**Date:** 2026-09-15
**Integration branch:** `fix/source-custody-integration-20260915`
**Target:** `clean-main-no-secrets`
**Target tip used for integration:** `ae27205d953c`
**Source lane:** `claude/happy-cray-xhwn4z` @ `7299cf3fb23a`
**Source-lane merge on this branch:** `52046a8beffc`

## Custody

The shared Mac Studio checkout was detached and dirty with unrelated Voice/Jarvis material. It was not modified. Integration was performed in an isolated worktree rooted at current `origin/clean-main-no-secrets`.

The source lane's 22 paths had zero path overlap with changes made on `clean-main-no-secrets` after the lane's merge-base. The lane was merged intact before integration hardening; no source-lane history was rewritten.

A final `git fetch origin clean-main-no-secrets` immediately before this record confirmed the target remained `ae27205d953c`.

## Source-lane substance retained

- client value-access to `lib/ganesha/contacts.ts` severed; module is `server-only`;
- onboarding admission moved server-side and format-only admission removed;
- abuse containment on admission endpoints;
- redundant tester-email source copies removed only where redundancy had been established;
- corpus membership changed from directory inheritance to explicit, fail-closed declaration;
- zero-admission `--force` embedding rebuild refuses before `TRUNCATE`;
- retrieval evidence ruling and production result sequence preserved;
- declared-membership document remains **candidate / not ratified**.
## Integration hardening added during takeover

1. **DB error logging:** raw parameter values were already removed by the source lane, but its replacement logged string length plus an 8-character SHA-256 digest. That remains an offline oracle for weak credentials and common identifiers. Integration reduces parameter logging to coarse positional types only; no value-derived hash, length, boolean value, or array length remains.
2. **Recognition response:** `/api/onboarding/recognize-key` now returns admission only. A legacy passcode does not authorize disclosure of the matched person's name.
3. **Corpus rule matching:** admission prefixes are path-segment bounded. A declaration for `data/ain/source` cannot accidentally govern a sibling such as `data/ain/source-private`.
4. **Next member check:** `/api/members/check` is rate-limited, non-cacheable, no longer logs the submitted passkey, and no longer returns member/inviter identity fields to an unauthenticated passkey holder.
5. **Standalone MAIA API:** `apps/api` contained an independent `/v1/members/check` implementation with the retired format-only `SOULLAB-*` / `MAIA-*` admission rule. That rule is removed. The route now uses database evidence only, returns no member/inviter identity, logs no passkey value, is non-cacheable, and carries both per-IP and process-global containment ceilings.
6. **Registration logging:** `/api/members/register` no longer emits submitted passkeys in application logs.

These are containment/integration repairs. They do **not** convert the legacy 48-contact corpus or the separate beta-passcode corpus into trusted secrets. Credential retirement and hashed, individually revocable invitation storage remain separate work.

## Final exact-tree witnesses

- focused Jest suites: **6/6 PASS · 55/55 tests**;
- standalone `apps/api` typecheck: **PASS**;
- standalone `apps/api` build: **PASS**;
- root TypeScript no-regression gate: **229 errors vs baseline 239 · 0 regressions**;
- `npm run check:no-openai`: **PASS — no new OpenAI surface**;
- `npm run check:no-supabase`: **PASS**;
- `git diff --check`: **PASS**;
- final `npm run build`: **PASS / exit 0**.
### Final browser-artifact privacy witness

The final build's `.next/static` contained **1,742 files**. The witness derived markers from the server-only contact corpus without printing any personal value.

- consumer-domain email markers examined: **37**; present in `.next/static`: **0**;
- legacy contact passcode markers examined: **48**; present in `.next/static`: **0**.

This establishes post-repair absence for those marker sets in the final browser artifacts. It does not rewrite the pre-repair evidence class and does not prove universal absence of every possible personal identifier.

### Existing repository warnings not promoted to lane failures

The successful Next build retains pre-existing warn-only conditions, including unresolved internal aliases, the Next/SWC patch-version mismatch, stale Browserslist data, and a trace-copy warning on an existing backup path. The repository-wide `guardrails` command also remains red on the current canonical `@ts-nocheck` inventory; this integration did not introduce a new `@ts-nocheck` directive. None is recorded here as a passed gate.

## Explicit holds after integration

- **Production deploy:** not performed; requires its own act.
- **Corpus rebuild / embedding:** remains held; no corpus job was invoked.
- **Corpus classification:** legacy corpus remains fail-closed until governed classification.
- **R11 / D1 identity reconciliation:** not performed.
- **R12 credential migration:** not performed; no new plaintext credential generation is authorized by this integration.
- **Git-history rewrite / branch or tag destruction / registry purge:** not performed.
- **Declared-membership candidate:** not ratified by this integration.

The branch is an integration candidate against `clean-main-no-secrets`, not evidence of production behavior. Production acceptance remains a separate witness.

## Design-canon reconciliation

The first integration commit attempt was refused by the operative design-canon hook because the two changed onboarding components had no Experience Contract. The hook was not bypassed.

- `SacredSoulInduction.tsx` is covered by an **experiential** Onboarding Threshold contract with final-build desktop/mobile screenshots captured from `/partner/research` in system Chrome and a synthetic format-shaped key refusal witnessed against the running final build.
- `BetaTesterGateway.tsx` has zero repository consumers and is covered by a deliberately narrow **structural** dormant-component contract. The contract grants no authority to reactivate it; a future consumer must reopen experiential review.

No browser package installation was required: the already-installed system Chrome supplied the evidence.

## Merge-review amendment — 2026-09-15

Independent PR review found two defects before merge; neither was accepted as harmless drift.

1. **Legacy-key parity:** the server-side shared-key set carried `BETA-TESTER-2025` but accidentally omitted `SOUL-PIONEER-2025`, which the live `SacredSoulInduction` had admitted before this lane. R12 explicitly holds credential retirement, so containment had no authority to retire one legacy key by omission. The key is restored server-side and a regression test requires both legacy shared keys to remain admitted until R12 disposes them.
2. **Error-object disclosure:** `lib/db/postgres.ts` stopped logging raw query parameters but still logged the full PostgreSQL error object. PostgreSQL `message`/`detail` fields may contain row values (for example a unique-key email). Error logging now admits only structural metadata (`name`, SQLSTATE/code, severity, schema/table/column/dataType/constraint/routine); free-form text, stack, detail and hint are excluded.

The review also removed dead client branches that expected `/api/onboarding/recognize-key` to return a person's name after the integration had deliberately made that response admission-only.

### Post-review exact-tree evidence

- focused Jest: **6/6 suites · 57/57 tests PASS**;
- standalone `apps/api` typecheck + build: **PASS**;
- root TypeScript no-regression: **229 vs baseline 239 · 0 regressions**;
- design-canon: **PASS**;
- provider governance + no-Supabase: **PASS**;
- `git diff --check`: **PASS**;
- full `npm run build`: **PASS / exit 0**;
- final `.next/static`: **1,742 files**; **0/48 non-Soullab email markers**, **0/48 contact passcodes**, and **0 `SOUL-PIONEER-2025` occurrences**.

No production act is authorized by this amendment. The prior holds remain unchanged.

## Merge-review amendment 2 — Living Library ingestion bypass

A repository-wide source-root census found a third substantive issue before merge: `scripts/ingest-library.ts` independently walked `data/ain/source/` and wrote admitted content into `library_sources` / `library_chunks` without consulting the new corpus declaration. Its legacy `isOperationalFile()` filter classified the former tester-email filenames as non-operational, so it was not an equivalent privacy boundary.

The Living Library bulk ingestion path now uses the same `loadDeclaration()` → `decideAdmission()` boundary as the AIN corpus. Undeclared / `unclassified_legacy` material is excluded by default, and a declared file carrying a human-record signal refuses the run rather than being skipped silently.

A new T10 guard asserts that every current bulk `data/ain/source` ingestion path reaches the declaration boundary: compiled corpus builder → `decideAdmission`; AIN embedding → guarded `processAllSources`; `ChunkingService.processAllSources` → `decideAdmission`; Living Library ingestion → `decideAdmission`.

`repairIdentity.ts` was reviewed separately and is not an ingestion bypass: it uses exact checksum matches only to repair metadata on already-existing `library_sources` rows and never inserts chunks/content.

### Script typecheck evidence

`npm run typecheck:scripts` is red on canonical before this change. A detached `origin/clean-main-no-secrets` worktree and this amended head each produce the same **40 TypeScript errors**: **0 new, 0 resolved**. Neither `scripts/ingest-library.ts` nor `lib/corpus/admission.ts` appears in the error set. Therefore the evidence is **script typecheck no-regression against a red baseline**, not a green scripts typecheck.

Focused custody/admission tests after this amendment: **6/6 suites · 58/58 tests PASS**.

## Merge-review amendment 3 — Living Library force composition hazard

Applying the admission boundary to Living Library changed the possible output of Phase A to legitimately empty. Review of the consumer found that `scripts/ingest-library.ts --force` deleted all `library_chunks` and `library_sources` **before** source admission was evaluated. With the current declaration admitting zero legacy source files, `--force --skip-wisdom` would erase the library and rebuild nothing; ordinary `--force` would silently drop all Phase A material and rebuild only Phase B.

The script now resolves source admission before Ollama, database connection, or any destructive act. If source ingestion is in scope and `--force` would proceed with zero admitted source files, it refuses non-zero before either DELETE. `--skip-sources` remains an explicit operator choice to rebuild Phase B only.

T11 asserts the zero-admission force refusal textually precedes both destructive DELETE statements. This is a composition witness: the admission guard's own correctness is not treated as evidence that its consumer is safe under the newly possible empty output.

Post-amendment evidence: **6/6 focused suites · 59/59 tests PASS**; root typecheck **229 vs 239 · 0 regressions**; standalone API typecheck PASS; provider/no-Supabase PASS; scripts typecheck remains the exact canonical **40-error** set with **0 new / 0 resolved**, and neither changed ingestion file appears in it.
