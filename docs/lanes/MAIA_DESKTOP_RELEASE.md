# Lane state — MAIA Desktop release (H4.7)

**One record per release lane, kept on canonical, updated in place.**
Every session working this lane reads this file first and updates it last.
History lives in git (`git log -p docs/lanes/MAIA_DESKTOP_RELEASE.md`), not in
appended sections.

## Session protocol (mandatory)

1. `git fetch origin clean-main-no-secrets` and state canonical as
   `git rev-parse origin/clean-main-no-secrets`. Never take canonical from
   memory, a prior session's report, or this file's "last updated" line.
2. Read this file. If what you are about to build or sign is in **Rejected**,
   stop.
3. Before ending, update this file, including **Last updated**, from evidence
   you observed in this session. Name the kind of evidence: git, CI, or a Mac
   Studio command plus its output.

## Last updated

2026-10-01 · canonical at time of writing `ef511f0ef` (#1616 merged; Next 16.3.8)
· evidence: git + GitHub CI + founder Mac Studio command output.

## Release SHA

**`ef511f0efea38792c597da01e67299740210e903`**: the merge commit of PR #1616
into `clean-main-no-secrets` (after #1619 `cf9624cdf`). Verified in git: it contains
the fix `bdf95a8e1` and the #1619 merge, pins `next` 16.3.8, and has the
`cabin-runtime/node_modules` extraResources step. Desktop version
`0.1.0-beta.1`. Build **only** from this exact SHA. The `maiaBuildSha` embedded in
the app must read `ef511f0efea3`.

## Release order

1. ✅ Merged #1619 as `cf9624cdf` (Writer's Studio RC1 lineage; no pending migrations: its three
   migrations are already applied in production).
2. ✅ Merged #1616 as `ef511f0ef`. That is the release SHA.
3. Mac Studio, from the release SHA on the T7 build volume: root `npm ci` →
   `MAIA_CABIN_MODE=offline next build` → `maia-desktop` `npm ci` → `npm test` (**must report 408/408**)
   → `npm run dist:mac` → `npm run verify:package`. `verify:package` now
   fails unless `Resources/cabin-runtime/node_modules/next/package.json` exists
   **and** its version equals the root `package.json` pin (16.3.8).
4. Launch the packaged app offline through the Desktop host and witness
   `/api/cabin/health` and `/cabin`. Check that the embedded `maiaBuildSha`
   equals the release SHA. Record SHA-256 of the executable, `app.asar`, and
   the DMG/zip.
5. Signing identity: **present** (see Blockers). Store the notary profile.
6. Sign (hardened runtime) → `notarytool submit --wait` → `stapler staple` →
   `REQUIRE_EXTERNAL_BETA=1 npm run verify:package`.
7. Untouched download accepted by Gatekeeper on a clean second Mac.
8. Only then: release to the named small cohort (H4.6 contract).

## Rejected (never sign, never ship)

| Candidate | Where | Why |
|---|---|---|
| `c6102a347af1` | T7 `maia-desktop-artifacts/c6102a347/` | `cabin-runtime/node_modules/next` missing → `Cannot find module 'next'` |
| `147815873090` | T7 | same omission (repair 1 failed) |
| `e3688fce20dd` | T7 `maia-desktop-artifacts/e3688fce20dd/` | same omission; root cause found: electron-builder `FileMatcher` drops a root `node_modules` |
| `65e0f0e29` | `claude/cool-feynman-8kvyyc` | merges canonical with `e3688fce2` but **not** the working fix `bdf95a8e1`; its 4/4 packaging test passing proves only that the test is source-regex and cannot see the artifact. Do not open a PR from it. |

## Blockers

| Gate | State | Evidence |
|---|---|---|
| Packaging repair `bdf95a8e1` | in #1616 (the only carrier; #1624 closed), on `cf9624cdf` (post-#1619; #1619 changed no `maia-desktop/**`). Suite **408/408** under tsx (canonical 405/405). Packaging-test mutants M1 + M2 killed | git + local run; see H4-7-R1 record, Amendment 2 |
| Artifact carries next 16.3.8 | NOT WITNESSED | — |
| Packaged runtime healthy offline | NOT WITNESSED | — |
| Developer ID Application | **PRESENT**: `32276A3F…55DB48 "Developer ID Application: Kelly Nezat (ZVK2X646Z2)"` | founder, `security find-identity -v -p codesigning`, 2026-10-01 |
| Notary profile `MAIA-BETA` | ABSENT (last observed) | Mac Studio, 2026-10-01 |
| Notarize / staple | NOT YET | — |
| Second-Mac Gatekeeper | NOT YET | — |
| Tester release | CLOSED | — |

## Non-claims

No artifact has been signed, notarized, distributed, or deployed. Public
`/cabin` is unchanged. Packaging CI does not build the `.app`; only a Mac
Studio witness establishes the artifact rows above.
