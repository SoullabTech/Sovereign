# F5-CONFORMANCE-REPAIR-01 · P5-D RESULT

**Date:** 2026-09-17
**Parent:** `d17d13d1a04d4c7ccd6830f67cb8abd033869427`
**Authority record:** `docs/programme/F5-CONFORMANCE-REPAIR-01_P5D_FOUNDER_AUTHORIZATION_2026-09-17.md`
**Result:** **PASS — bounded canonical-integration candidate constructed**
**Production standing:** **UNWITNESSED / UNDEPLOYED**

## 1 · What P5-D changed

P5-D succeeds the P5-B shadow-only boundary without rewriting its historical v2
registry. The live candidate now has a distinct v3 activation authority:

- `319` direct member-bound loci remain declared;
- `313` remain `refuse` by default;
- `289` migration FK declarations remain provenance;
- those declarations collapse to `264` disposition-consistent runtime FK effect
  classes;
- the frozen candidate plan contains `321` direct/domain/synthetic entries plus
  `264` runtime FK effect entries = **585 immutable disposition rows**.

Unknown table/column/FK/Circle evidence is never treated as absence. It produces an
unavailable/no-change outcome. An occupied unadjudicated locus produces a governed
refusal/no-change outcome.

## 2 · Canonical execution sequence

After the pre-existing verified-session and username-confirmation gates, the canonical
route delegates to one governed executor. For an activation-ready plan:

1. mint a durable `account_erasure_acts` row;
2. enter one `SERIALIZABLE` transaction;
3. collect runtime direct-locus, FK, Circle, and lineage facts;
4. insert all 585 plan rows and freeze the plan;
5. record `execution_started`;
6. create the S5 deletion manifest and per-object/state fences;
7. revoke auth sessions and erase supported settings/session rows;
8. for every active Circle, reuse the existing shared-revoke → response-tombstone →
   membership-left lifecycle;
9. mint the `members` subject tombstone only after those pre-identity acts;
10. delete the member identity row;
11. rerun the full governed census inside the same transaction;
12. record per-disposition success + verification and only then `act_completed`.

If execution fails, the destructive transaction rolls back. The separately durable act
may close as `act_failed`; it is not rewritten into completion.

## 3 · Member-visible truth

`AccountSettings` no longer promises “all associated data” in advance and no longer
ignores 409/503 responses.

It redirects away only when the durable projection is both:

- `state = completed`; and
- `accountChanged = true`.

Refused/unavailable/failed outcomes remain visible with their message, governed
categories, and content-free act reference. If transport fails after the executor has
been invoked and the durable result cannot be projected, the route returns
`state = unknown` / `accountChanged = null`; it does not invent either success or
rollback.

## 4 · S5 / restore succession

Candidate migration `20260917000002_account_erasure_p5d_s5_fences.sql` makes the
member subject tombstone an anti-resurrection fence while preserving the P4 distinction
between absence and Circle historical tombstones.

On governed restore:

- ordinary member-bound rows for an erased subject are removed;
- active Circle shares become revoked;
- Circle inquiry responses become withdrawn with payload nulled;
- Circle memberships become `left`;
- the erased member row is removed last.

If an older restore contains a relationship that cannot be lawfully reconciled, the
member-row delete fails loudly rather than silently resurrecting the account.

This is structural candidate evidence only. **No restore rehearsal was run in P5-D.**

## 5 · Mechanical evidence

### Focused + succession tests

Final governed suite:

- **13 test suites PASS**
- **122 / 122 tests PASS**

This includes P5-A ledger, P5-B shadow planner, P5-C legacy retirement, P5-D activation
registry/facts/plan/executor/S5/Circles, canonical route/member truth, and disclosure
custody succession.

Canonical route + member-truth focused set after the final uncertainty correction:

- **15 / 15 PASS**

### Type health

Ship TypeScript:

- baseline diagnostics: `239`
- P5-D diagnostics: `229`
- new regressions: `0`

Scripts TypeScript was compared by compiling the exact P5-C parent in a separate detached
worktree and comparing diagnostic identities:

- P5-C parent: `40`
- P5-D candidate: `40`
- new diagnostics: `0`
- resolved diagnostics: `0`

The scripts config remains repository-red with its inherited 40 diagnostics; P5-D adds
none.

### Governance / CI

- `check:erasure-registry` — PASS
- `check:erasure-activation` — PASS
- `check:legacy-erasure-retired` — PASS
- `ci:sovereignty` — PASS
- member-ID log — `532 / 532`, `0` new
- PHI log gate — PASS, with the pre-existing `20260117000001_invites_and_member_columns.sql` warning
- design-canon — PASS, 1 changed member-facing surface covered by 2 contracts
- `bash -n scripts/restore-governed.sh` — PASS
- `git diff --check` — PASS

## 6 · Critical candidate custody

| Artifact | Git blob |
|---|---|
| `config/governance/account-erasure-registry.v3.json` | `1b3f8ccdf06a84becc190089f3c1343b63376d6a` |
| `database/migrations/20260917000002_account_erasure_p5d_s5_fences.sql` | `9d53480570da1a65c42dbbdfe007757bf1a94ddb` |
| `lib/erasure/accountErasureActivationRegistry.ts` | `05d83f9dfc18f6efcf455e598f0e696f49f8cf98` |
| `lib/erasure/accountErasureFacts.ts` | `80a7c08f68b8e4997e5b937ac91f9fe1a402ef16` |
| `lib/erasure/accountErasureActivationPlan.ts` | `8e3928e75bafb28f6cb9d3e3f879bf7f4fe67f43` |
| `lib/erasure/accountErasureExecutor.ts` | `7d9e107f7e8b78f2b7d6ec3f18fba3225e123a95` |
| `app/api/members/delete-account/route.ts` | `b9f95b7160ed3794b12e3085005960cdabb32edb` |
| `components/account/AccountSettings.tsx` | `9cf42aeeb8b8cd25f8d983880b7a69fdd2fa7028` |
| `lib/circles/membershipService.ts` | `69f6bf1925311fecbe18846d426f5cde02b79604` |
| `scripts/restore-governed.sh` | `de06624d1612ed85ef956b012055215e2888c7f4` |
| `scripts/check-account-erasure-activation.ts` | `22180aa67493d450cd57cafb9727573d4af93fdf` |
| `docs/design/contracts/account-erasure.md` | `3686dc61838cd16d6a6e1ea5058c6cedf2146ff2` |
| `package.json` | `5e86864311db823d9c54a93dbad5919e6db5478f` |
| `.githooks/pre-commit` | `979ffdc261785f343977cc596285547b19a27201` |
| `.github/workflows/sovereignty-gate.yml` | `037e0e04147c53602f28d7ae06bfb626fddeb237` |
| `docs/programme/F5-CONFORMANCE-REPAIR-01_P5D_FOUNDER_AUTHORIZATION_2026-09-17.md` | `2f7d172f58a3ee5039168d182575e1a83bc6917a` |

## 7 · What this PASS does not establish

P5-D does **not** establish that production currently has either candidate migration, or
that a real member account can yet be erased in production. It does not establish a
production restore witness, backup/recovery ledger replay, or operational rollout.

In particular:

- migrations `20260917000001` and `20260917000002` remain **unapplied by this lane**;
- no production database was read or written;
- no real account-erasure request was executed;
- no disaster-recovery restore was rehearsed;
- the 313 refuse-by-default direct loci remain unadjudicated for destructive handling;
- the source-lineage specificity debt remains separate and unresolved where previously
  recorded;
- no canonical merge, release, or deployment is authorized by this result.

## 8 · Standing / next gate

**P5-D candidate implementation: PASS.**

The candidate may be committed and pushed to the existing F5 branch for independent
review. After that, **STOP**.

**P5-E — migration/application witness, disposable/live-environment falsification,
restore rehearsal, and any rollout decision — remains CLOSED pending a new founder act.**
