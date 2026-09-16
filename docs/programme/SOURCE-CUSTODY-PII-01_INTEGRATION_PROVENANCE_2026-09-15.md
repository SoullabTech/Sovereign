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
