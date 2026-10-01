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

2026-10-01 · canonical observed `16e6cfbbdc4f`; #1647 is merged in canonical. Exact canonical release witness `888646afc6de` built cleanly with a 458 MiB standalone trace and 411/411 tests, but Apple notarization rejected the signed artifact because native Mach-O binaries inside `cabin-runtime` were not Developer-ID signed/timestamped/hardened. Native-signing repair is now in progress on `fix/desktop-cabin-native-signing-20261001`.
· evidence: git + Mac Studio build/package census + Apple `notarytool log`.

## Release SHA

**OPEN.** `888646afc6de4b40b6d2874355fc33ee0d6a3529` is a valid containment witness but is no longer sufficient for external-beta release because Apple rejected its nested Cabin native binaries at notarization. The next release SHA will be the canonical merge commit carrying the Cabin native-signing repair; no branch-only commit is to be called the release SHA.

## Release order

1. ✅ Merged #1619 as `cf9624cdf` (Writer's Studio RC1 lineage; no pending migrations: its three
   migrations are already applied in production).
2. ✅ Merged #1616 as `ef511f0ef`; that SHA was later **rejected** after its Mac artifact census exposed unsafe repository over-tracing. It is historical provenance, not a release candidate.
3. ✅ Merged #1618 as `f2346dae11f5`, preserving the Desktop packaging lineage and a copy-stage refusal for `backups/` and `.next/cache`.
4. ✅ #1647 merged; canonical containment witness `888646afc6de` built with a 458 MiB standalone runtime, Next 16.3.8, no forbidden trees/credentials, and **411/411 PASS**.
5. ❌ Apple notarization job `2f638ee1-ed5b-43ad-9181-a16c209c458a` rejected the `888646afc6de` signed artifact because nested Cabin Mach-O binaries were not Developer-ID signed/timestamped/hardened. That artifact is rejected.
6. Merge `fix/desktop-cabin-native-signing-20261001` through required CI. **Its canonical merge commit becomes the next release SHA.**
7. Mac Studio, from that exact new release SHA: offline webpack build → containment census → Desktop suite (**at least 412/412; lower requires explicit explanation**) → unsigned pre-trust bundle/digests → signed package → recursive native-signature verifier.
8. Launch the signed package offline through the Desktop host and witness `/api/cabin/health` and `/cabin`; then submit with `notarytool --wait`, staple, and run `REQUIRE_EXTERNAL_BETA=1 npm run verify:package`.
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
| `888646afc6de` signed artifact | T7 / Apple notarization job `2f638ee1-ed5b-43ad-9181-a16c209c458a` | Containment passed (458 MiB standalone; no forbidden trees; Next 16.3.8), but Apple rejected nested Prisma, esbuild and Sharp Mach-O binaries for missing Developer ID signature / secure timestamp / hardened runtime. **Never submit or ship this artifact again.** |

## Blockers

| Gate | State | Evidence |
|---|---|---|
| Canonical Desktop packaging lineage | #1618 merged as `f2346dae11f5`; #1647 reconciliation retains its copy-stage refusal for `backups/` and `.next/cache` while adding causal trace containment and package fail-closed guards | git + merge-sensitive tests, 2026-10-01 |
| Desktop suite | `888646afc6de` exact-release suite **411/411 PASS**; native-signing repair branch **412/412 PASS** after adding the nested Mach-O signing regression test. Full suite must be rerun at the next canonical release SHA. | founder, Mac Studio, 2026-10-01 |
| Exact final release-SHA standalone build | `888646afc6de` build **PASS** but that SHA is superseded for external release by the native-signing defect. Next exact release build is pending repair merge. | Mac Studio, 2026-10-01 |
| Offline trace containment | **PASS at `888646afc6de`**: standalone 458 MiB; forbidden trees absent; credential-like files absent; `.next/cache` absent; Next 16.3.8. Must be re-witnessed at the next release SHA. | Mac Studio census, 2026-10-01 |
| Artifact carries Next 16.3.8 | **PASS at `888646afc6de` pre-trust bundle**; must be re-witnessed after native-signing repair merges. | Mac Studio artifact census, 2026-10-01 |
| Packaged runtime healthy offline | NOT WITNESSED at the final release SHA | — |
| Developer ID Application | **PRESENT**: `32276A3F…55DB48 "Developer ID Application: Kelly Nezat (ZVK2X646Z2)"` | founder, `security find-identity -v -p codesigning`, 2026-10-01 |
| Notary profile `MAIA-BETA` | **PRESENT**; authenticated history now includes rejected job `2f638ee1-ed5b-43ad-9181-a16c209c458a`, whose Apple log established the nested Mach-O signing defect. | Mac Studio + Apple notary service, 2026-10-01 |
| Nested Cabin native signing | **REPAIR IN PROGRESS**: staged Mach-O binaries are signed with Developer ID + hardened runtime + secure timestamp; verifier recursively checks signature, timestamp, runtime flag and TeamIdentifier. Repair suite **412/412 PASS**. | `fix/desktop-cabin-native-signing-20261001`, Mac Studio, 2026-10-01 |
| Notarize / staple | Prior notarization **INVALID**; resubmission blocked until native-signing repair is canonical and rebuilt. | Apple job `2f638ee1-ed5b-43ad-9181-a16c209c458a` |
| Second-Mac Gatekeeper | NOT YET | — |
| Tester release | CLOSED | — |

## Non-claims

No post-containment external-beta artifact has been admitted, notarized, distributed, or deployed. Rejected and rehearsal artifacts remain non-release evidence only. Public `/cabin` is unchanged. Packaging CI does not build the final signed `.app`; only an exact-release-SHA Mac Studio witness establishes the final artifact rows above.
