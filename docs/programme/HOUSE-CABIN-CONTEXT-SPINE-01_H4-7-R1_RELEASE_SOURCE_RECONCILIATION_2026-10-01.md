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

---

## Amendment 1 — founder rulings and refreshed base (same day)

### Rulings

1. **The release SHA is the merge commit this PR produces on canonical.** `65e0f0e29`
   is withdrawn as a candidate.
2. **Ordering:** **#1619** (Writer's Studio RC1 onto canonical) merges first. This PR
   is then updated onto that canonical, and the merge commit it then produces is the
   release SHA. The Desktop bundles its own copy of the web app
   (`cabin-runtime/` is the Next standalone server), so a release SHA that predates
   #1619 would ship beta testers an older Writer's Studio than production.
   ⛔ **This PR must not merge before #1619.**
3. **Signing.** A Developer ID Application certificate now exists on the Mac Studio. The
   remaining blocker is the notary profile: create an App Store Connect API key, then
   run `xcrun notarytool store-credentials "MAIA-BETA"` on the Mac Studio. That is a
   founder act, and this container cannot perform it.

### Refreshed base

The canonical picture in the body above is superseded. Canonical is now
`8f8ba73b83397c716722c7c9f5835c02d131cae8`: #1614 (beta-tester roster) merged, then
#1615 bumped `next` to **16.3.8** (`package.json` and the lockfile both resolve
`next-16.3.8.tgz`). It was merged into this branch as `726b426dc`. The diff against
canonical is still exactly the Desktop repair (`build.mjs` and its packaging test)
plus records, with no conflict.

This aligns with the other session that named `8f8ba73b8` as the only valid Desktop
build parent. ⚠️ Once #1619 lands, that parent is superseded too: the build parent
is the post-#1619 merge commit of this PR, and nothing earlier.

### Test-count reconciliation (394 here vs 405 cited earlier)

These are the same suite, counted differently. Without `tsx`, `node --test` counts
each of the three files it cannot load (`cabin-local-store` · `cabin-memory-source` ·
`cabin-work-projection`) as **one** failed test. That hides the tests inside them,
which a source count puts at 13 + 2 + 1 = 16.

| Tree | `node --test` here | Derived `npm test` (tsx) total |
|---|---|---|
| canonical | 392 (389 pass, 3 file-level fail) | 392 − 3 + 16 = **405**, matching the earlier session |
| this branch | 394 (391 pass, 3 file-level fail) | 394 − 3 + 16 = **407** (+2 new packaging tests) |

The 16 comes from a source grep and is **derived, not run**. ⭐ **R2 acceptance:**
`npm test` on the Mac Studio at the release SHA must report **407 tests, 407 pass**,
unless #1619 changes the Desktop suite, in which case the delta must be named. A
total below the expected count is a failure, even if every test reported passes.

### R2 additions

- The `node_modules/next` witness is checked on the **packaged bundle**.
  `Resources/cabin-runtime/node_modules/next/package.json` must exist **and** report
  `"version": "16.3.8"`. A folder that exists with any other version is a failure.
- Carried unchanged: verify the packaged app rather than the build step; give a
  definite answer on whether `/_document` reproduces; record digests before and after
  signing; never re-sign the T7 `e3688fce20dd` bundle.

### Standing (amended)

**H4.7-R1 RECONCILED ONTO `8f8ba73b8` (Next 16.3.8) as `726b426dc` · PR OPEN, ⛔ HOLD
until #1619 merges and this branch is updated onto it · RELEASE SHA = that merge
commit · Developer ID PRESENT · `MAIA-BETA` notary profile OWED (founder) · R2–R8 NOT
STARTED · TESTER RELEASE CLOSED.**

---

## Amendment 2 — carrier corrected; counts measured, not derived (same day)

Moved here from `claude/cool-feynman-8kvyyc` (PR #1624, **closed**). Amendment 1 and
everything above it are kept as written. This amendment supersedes them where they
conflict.

### The reconciliation candidate was missing the repair

`65e0f0e29` and `726b426dc` merged canonical with `e3688fce2`. That is the candidate
`MAIA-DESKTOP-CABIN-ARTIFACT-DIAGNOSIS_2026-10-01.md` already **rejected** for shipping
without `cabin-runtime/node_modules/next`. They did **not** contain the working fix
`bdf95a8e1`. At `3e869c45b`, `maia-desktop/scripts/build.mjs` has no
`cabin-runtime/node_modules` extraResources step. The "4/4 pass" packaging result above
shows only that the test was source-regex and could not see the omission. #1624 is
closed. **The only Desktop repair carrier is PR #1616**, which contains `bdf95a8e1`.
Amendment 1's release-SHA rule carries over to #1616 unchanged: the release SHA is
#1616's merge commit, landed after #1619.

### Suite totals (measured under `tsx`, not derived)

| Tree | `npx tsx --test 'test/*.test.mjs'` |
|---|---|
| canonical `8f8ba73b8` | **405 tests · 405 pass · 0 fail** |
| #1616 (merged onto `8f8ba73b8`) | **408 tests · 408 pass · 0 fail** |

The delta is +3, all in `test/cabin-runtime-packaging.test.mjs` (2 → 5 tests). The
test file set is identical. Amendment 1's **407** was derived for the #1624 tree and
does not apply. **R2 acceptance: `npm test` on the Mac Studio at the release SHA
reports 408 / 408**, unless #1619 changes `maia-desktop/test/**`, in which case the
delta must be named. A lower total is a failure, even if every reported test passes.

### Packaging-test mutation witness

Both mutants were run on a throwaway copy of `maia-desktop/{scripts,test,package.json}`.

| Mutant | Before tightening | After tightening |
|---|---|---|
| M1: remove the whole node_modules extraResources block | **killed** (test 2) | killed |
| M2: keep every line, but point the copy back at `cabinSource` (the `e3688fce2` defect class) | **SURVIVED, 5/5 pass** | **killed** (test 2) |

M2 survived because the patterns matched declarations, not the object actually
staged. The test now also requires
`extraResources.push({ from: cabinNodeModulesSource, to: cabinNodeModulesDestination, …`
and the matching staged-entry lookup.

⚠️ A source-pattern test stays a proxy. The artifact-level check is
`verify-package.mjs`, which on the built `.app` requires
`cabin-runtime/node_modules/next/package.json` with a version equal to the root pin
(16.3.8). The build itself is witnessed only on the Mac Studio.

### Standing (amended)

**R1 CARRIER = PR #1616 · #1624 CLOSED · suite 408/408 measured · M1 + M2 killed ·
release SHA = #1616 merge commit after #1619 · `MAIA-BETA` notary profile OWED ·
R2–R8 NOT STARTED · TESTER RELEASE CLOSED.**
