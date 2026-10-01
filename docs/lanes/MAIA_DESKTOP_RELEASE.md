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

2026-10-01 · canonical observed `a2652d01d64b` (#1648 merged after #1618); #1647 reconciled onto that canonical as candidate `1f26fa7ae15b`. `ef511f0ef` remains rejected.
· evidence: git + GitHub PR/CI state + founder Mac Studio command output.

## Release SHA

**OPEN.** `ef511f0efea38792c597da01e67299740210e903` is no longer admissible
as an external-beta release SHA. Its offline standalone trace expanded to ~4.8 GiB
and included repository-internal material that must not ship. The next release SHA
will be the canonical merge commit carrying the offline trace-containment repair;
no branch-only commit is to be called the release SHA.

## Release order

1. ✅ Merged #1619 as `cf9624cdf` (Writer's Studio RC1 lineage; no pending migrations: its three
   migrations are already applied in production).
2. ✅ Merged #1616 as `ef511f0ef`; that SHA was later **rejected** after its Mac artifact census exposed unsafe repository over-tracing. It is historical provenance, not a release candidate.
3. ✅ Merged #1618 as `f2346dae11f5`, preserving the Desktop packaging lineage and a copy-stage refusal for `backups/` and `.next/cache`.
4. #1647 must pass required CI and merge into current `clean-main-no-secrets`. **That canonical merge commit becomes the only release SHA.**
5. Mac Studio, from that exact release SHA on the T7 build volume: clean root install/build → `MAIA_CABIN_MODE=offline npm run build` (webpack) → inspect the actual `.next/standalone` root, forbidden paths, credentials, symlinks, and Next 16.3.8 → `maia-desktop` tests (**at least 411/411; any lower total is a failure unless explicitly explained**) → fresh package → `npm run verify:package`.
6. Launch the packaged app offline through the Desktop host and witness `/api/cabin/health` and `/cabin`. The embedded `maiaBuildSha` must equal the release SHA. Record immutable artifact digests; never rename or re-sign a rejected candidate.
7. Developer ID identity and `MAIA-BETA` notary profile are **present** (see Blockers). Produce the signed hardened-runtime artifact from the exact release SHA, record the signed digest, submit with `notarytool --wait`, and staple.
8. Run `REQUIRE_EXTERNAL_BETA=1 npm run verify:package` and Gatekeeper assessment on the signed/stapled artifact.
9. Untouched download accepted by Gatekeeper on a clean second Mac.
10. Only then: release to the named small cohort (H4.6 contract).

## Rejected (never sign, never ship)

| Candidate | Where | Why |
|---|---|---|
| `c6102a347af1` | T7 `maia-desktop-artifacts/c6102a347/` | `cabin-runtime/node_modules/next` missing → `Cannot find module 'next'` |
| `147815873090` | T7 | same omission (repair 1 failed) |
| `e3688fce20dd` | T7 `maia-desktop-artifacts/e3688fce20dd/` | same omission; root cause found: electron-builder `FileMatcher` drops a root `node_modules` |
| `65e0f0e29` | `claude/cool-feynman-8kvyyc` | merges canonical with `e3688fce2` but **not** the working fix `bdf95a8e1`; its 4/4 packaging test passing proves only that the test is source-regex and cannot see the artifact. Do not open a PR from it. |
| `ef511f0efea3` | T7 release worktree / failed package | signing stopped on broken `backups/ultimate-consciousness-system/latest`; census then showed ~4.8 GiB Cabin runtime containing `docs/`, `data/ain/source`, copyrighted/source corpora, repo scripts/artifacts/database material, Android debug APKs and env templates. No private keys were found. **Never sign or ship.** |
| `5eee48caf508` | T7 `maia-desktop-artifacts/5eee48caf/` branch-candidate package | first containment pass reduced Cabin runtime to ~827 MiB and removed the original forbidden trees, but a second census found `books/staging/` full-text works, `Community-Commons/`, tests and platform-source trees still bundled. Packaging was terminated before signing/notarization. **Never sign or ship.** |
| `9656405caaa3` | T7 `maia-desktop-artifacts/symlink-fix/` unsigned rehearsal | Cabin runtime reduced to ~801 MiB and carried Next 16.3.8 with no credential-like files or previously named forbidden trees, but artifact-level census still found broad repository-root material including `.git`, `.github`, internal Markdown/configuration, Docker, test and development files. **Negative witness only; never sign or ship.** |

## Blockers

| Gate | State | Evidence |
|---|---|---|
| Canonical Desktop packaging lineage | #1618 merged as `f2346dae11f5`; #1647 reconciliation retains its copy-stage refusal for `backups/` and `.next/cache` while adding causal trace containment and package fail-closed guards | git + merge-sensitive tests, 2026-10-01 |
| Desktop suite on containment lineage | **411/411 PASS** on causal lineage; current #1618/#1647 reconciliation tests **8/8 PASS**. Full suite at the final canonical release SHA is still required. | founder, Mac Studio, 2026-10-01 |
| Exact final release-SHA standalone build | **PENDING** until #1647 merges and the canonical merge SHA is known | — |
| Offline trace containment | **CANDIDATE IN #1647**: offline-only tracing exclusions + causal supervision-storage path fix + #1618 copy-stage backup/cache filter + root allowlist/credential/size verifier + portable public-symlink materialization. No post-reconciliation external-beta artifact is admitted yet. | git + 411/411 causal suite + 8/8 reconciliation suite + pre-commit governance, 2026-10-01 |
| Artifact carries Next 16.3.8 | rejected `9656405caaa3` rehearsal carried 16.3.8; **final exact release-SHA artifact not yet witnessed** | Mac Studio artifact census, 2026-10-01 |
| Packaged runtime healthy offline | NOT WITNESSED at the final release SHA | — |
| Developer ID Application | **PRESENT**: `32276A3F…55DB48 "Developer ID Application: Kelly Nezat (ZVK2X646Z2)"` | founder, `security find-identity -v -p codesigning`, 2026-10-01 |
| Notary profile `MAIA-BETA` | **PRESENT**; `xcrun notarytool history --keychain-profile MAIA-BETA` authenticated and returned `No submission history.` | founder, Mac Studio, 2026-10-01 |
| Notarize / staple | NOT YET | — |
| Second-Mac Gatekeeper | NOT YET | — |
| Tester release | CLOSED | — |

## Non-claims

No post-containment external-beta artifact has been admitted, notarized, distributed, or deployed. Rejected and rehearsal artifacts remain non-release evidence only. Public `/cabin` is unchanged. Packaging CI does not build the final signed `.app`; only an exact-release-SHA Mac Studio witness establishes the final artifact rows above.
