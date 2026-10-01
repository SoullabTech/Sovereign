# HOUSE-CABIN-CONTEXT-SPINE-01 · H4.7-R1 — Release Source Reconciliation

## Boundary

H4.7 produced a real arm64 MAIA Desktop bundle on T7 Shield:

`/Volumes/T7 Shield/maia-desktop-artifacts/e3688fce20dd/mac-arm64/MAIA Desktop.app`

(`CFBundleIdentifier=life.soullab.maia.desktop` · `CFBundleVersion=0.1.0-beta.1` ·
`Signature=adhoc` · `TeamIdentifier=not set`.)

It was built from `e3688fce20dde0b539988ebdd27c06162783a1ea`, a tip of
`fix/desktop-cabin-artifact-runtime-preserve-20261001`. The H4.7 record named
`2e657fa0dd6261584dd77463ced7782d80906d7d` as canonical. The two are siblings off
`c6102a347af14600ea49edc108dd720f649d7e2c`, not ancestor and descendant.

**The existing bundle cannot be bound to a canonical SHA.** It is kept as a
development-packaging witness only. It is not signed, notarized, digested for release,
or described as canonical.

This unit's job is narrower: produce one source commit that contains both canonical
and the Desktop repair, so that R2 can rebuild from it.

## Facts (repository, verified in-session)

| Fact | Value |
|---|---|
| Canonical at reconciliation | `9c608128361eadd2e6ba2c6c1371353bdb0d7ebe` (PR #1610), **15 commits past `2e657fa0d`** |
| `2e657fa0d` ancestor of canonical | yes |
| `e3688fce2` / `147815873` ancestor of canonical | **no** (repair branch unmerged) |
| Canonical commits touching `maia-desktop/` since `c6102a347` | **0** |
| Canonical non-doc changes since `c6102a347` | `tests/constitutional/jarvis-o5-r5/**`, `scripts/verify-jarvis-o5-r5-freeze.mjs`, all test/freeze instruments with no Desktop or Cabin runtime path |
| `git merge-tree` canonical × `e3688fce2` | **clean** |

So the sibling divergence has no semantic overlap. Canonical moved only in O5-R5
instruments. The repair moved only `maia-desktop/scripts/build.mjs`, its packaging
test and two records.

## Reconciliation candidate

`65e0f0e29a425582e6c986290a477a1c797bd3bb` is a merge commit with
parents `9c608128` (canonical) and `e3688fce2` (repair).

The diff against canonical is exactly four files:

- `maia-desktop/scripts/build.mjs`, which stages the Cabin standalone source outside both
  the electron-builder project and its staging parent, and refuses to package if
  `node_modules/next/package.json` is absent;
- `maia-desktop/test/cabin-runtime-packaging.test.mjs`;
- `docs/programme/MAIA-DESKTOP-CABIN-ARTIFACT-REPAIR_2026-10-01.md`;
- `docs/programme/MAIA-DESKTOP-CABIN-ARTIFACT-REPAIR-02_2026-10-01.md`.

`maia-desktop/package.json` is byte-identical to canonical. `147815873` changed it and
`e3688fce2` changed it back.

## Gates run here (Linux container, no project `node_modules`)

| Gate | Candidate | Canonical baseline |
|---|---|---|
| `node --test test/cabin-runtime-packaging.test.mjs` | **4/4 pass** | 2/2 (pre-repair test) |
| `node --test test/*.test.mjs` (maia-desktop) | 391 / 394 | 389 / 392 |
| Failures, by name | `cabin-local-store` · `cabin-memory-source` · `cabin-work-projection` | **identical** |

The three failures are `ERR_MODULE_NOT_FOUND` on extensionless `.ts` imports
(`lib/provenance/provenance`). The package's own `npm test` runs them under `tsx`,
which is not installed here. They fail the same way at canonical, so the merge
introduces **0 new failures**. ⛔ This is not reported as a full pass. The Mac Studio
`npm test` run is the evidence of record.

⛔ Repository CI gates were not run in this container. They run on the PR.

## The release-SHA ruling this unit asks for

There are two candidates for "ONE release SHA":

1. **`65e0f0e29` itself.** It is available now, but it is a branch commit. An artifact built
   from it would repeat the same defect H4.7 just caught: a release SHA that canonical
   does not contain.
2. **⭐ Recommended: the canonical commit produced when the reconciliation merges into
   `clean-main-no-secrets`.** The release SHA is then canonical by ancestry, CI-gated, and
   needs no future explanation.

Merging to canonical is a founder act, and so is choosing the SHA. Under (2), R2 waits
on that merge.

## Carried into R2 (the rebuild); no gate is skipped

- The bundle must be rebuilt from the ruled SHA in a **clean detached worktree on T7**.
  The existing `e3688fce20dd` bundle is never re-signed or renamed.
- ⚠️ **The `node_modules/next` witness is owed on the new artifact.** Repair-02 records
  it as *"fresh artifact witness pending"*, and the H4.7 report of the `e3688fce20dd`
  bundle does not state that `Resources/cabin-runtime/node_modules/next/package.json`
  is present. R2 asserts it on the packaged bundle. The build-time assertion alone does
  not count, because electron-builder is exactly where it was lost twice.
- The H4.7 local Next build hit `PageNotFoundError: /_document` during page-data
  collection. R2 must state whether that reproduces at the ruled SHA. It is not
  inferred away from the fact that a later Desktop packaging run succeeded.
- `build-info.json` inside the bundle must name the ruled SHA. The R3 digest (e.g.
  `shasum -a 256` over a `ditto -c -k --keepParent` archive plus a per-file manifest)
  is computed **before** signing and again after, and both are recorded.

## Non-claims

- No artifact was built, signed, or digested in this unit.
- No Developer ID identity exists. The `Apple Development` and `iPhone Distribution`
  identities are not substitutes.
- No `MAIA-BETA` notary profile exists.
- No Gatekeeper, second-Mac or cohort claim is made.
- Production was untouched. Public `/cabin` remains 404.

## Standing

**H4.7-R1 RECONCILIATION CANDIDATE `65e0f0e29` · CLEAN · 0 NEW TEST FAILURES ·
⛔ NOT CANONICAL · RELEASE SHA = FOUNDER RULING (recommend: post-merge canonical) ·
R2–R8 NOT STARTED · TESTER RELEASE CLOSED.**
