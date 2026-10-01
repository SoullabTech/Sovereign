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

2026-10-01 · canonical observed `298414555bbe`; `888646afc6de` is rejected after first packaged launch wrote Next route-cache files into the signed Cabin resource tree and invalidated the Developer ID seal. Immutable-runtime repair is on `fix/desktop-cabin-immutable-runtime-20261001`.
· evidence: git + Mac Studio package verification + `codesign --verify --deep --strict --verbose=4`.

## Release SHA

**OPEN.** `888646afc6de4b40b6d2874355fc33ee0d6a3529` is no longer admissible
as an external-beta release SHA. Its contained runtime packaged correctly and
carried Next 16.3.8, but first launch caused Next to write route-cache files under
`Contents/Resources/cabin-runtime/.next/server/route-cache`, mutating sealed
resources and invalidating the Developer ID signature. The next release SHA is
the canonical merge commit carrying the offline immutable-runtime repair; no
branch-only commit is to be called the release SHA.

## Release order

1. ✅ Merged #1619 as `cf9624cdf` (Writer's Studio RC1 lineage; no pending migrations: its three
   migrations are already applied in production).
2. ✅ Merged #1616 as `ef511f0ef`; that SHA was later **rejected** after its Mac artifact census exposed unsafe repository over-tracing. It is historical provenance, not a release candidate.
3. ✅ Merged #1618 as `f2346dae11f5`, preserving the Desktop packaging lineage and a copy-stage refusal for `backups/` and `.next/cache`.
4. ✅ #1647 merged as `888646afc6de`; that exact contained artifact is now **rejected after launch-time seal mutation**. The immutable-runtime repair must merge next; its canonical merge commit becomes the only release SHA.
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
| `888646afc6de` | T7 `maia-desktop-artifacts/888646afc6/` | exact canonical contained build (~472 MiB packaged Cabin, Next 16.3.8) signed with Developer ID, but first launch wrote `.next/server/route-cache/**` inside the sealed app bundle; subsequent strict codesign verification reports added sealed resources. **Never sign or ship.** |

## Blockers

| Gate | State | Evidence |
|---|---|---|
| Canonical Desktop packaging lineage | #1618 merged as `f2346dae11f5`; #1647 reconciliation retains its copy-stage refusal for `backups/` and `.next/cache` while adding causal trace containment and package fail-closed guards | git + merge-sensitive tests, 2026-10-01 |
| Desktop suite on containment lineage | **411/411 PASS** on causal lineage; current #1618/#1647 reconciliation tests **8/8 PASS**. Full suite at the final canonical release SHA is still required. | founder, Mac Studio, 2026-10-01 |
| Exact final release-SHA standalone build | `888646afc6de` built cleanly and contained correctly but is rejected for launch-time seal mutation. **PENDING** for the canonical merge SHA carrying immutable-runtime repair. | Mac Studio build + package census, 2026-10-01 |
| Offline trace containment | **PASS ON REJECTED `888646afc6de` ARTIFACT**: standalone ~427 MiB / packaged Cabin ~472 MiB, forbidden top-level trees absent, Next 16.3.8 present. Rejection is now solely due to post-launch sealed-resource mutation. | Mac Studio exact-SHA build + artifact census, 2026-10-01 |
| Artifact carries Next 16.3.8 | rejected `9656405caaa3` rehearsal carried 16.3.8; **final exact release-SHA artifact not yet witnessed** | Mac Studio artifact census, 2026-10-01 |
| Packaged runtime healthy offline | **BLOCKED BY IMMUTABILITY DEFECT** at rejected `888646afc6de`: runtime became healthy enough to write Next route-cache entries into its own signed resource tree. Repair sets `experimental.isrFlushToDisk=false` only for offline Cabin; post-repair artifact witness required. | Mac Studio launch + strict codesign census, 2026-10-01 |
| Developer ID Application | **PRESENT**: `32276A3F…55DB48 "Developer ID Application: Kelly Nezat (ZVK2X646Z2)"` | founder, `security find-identity -v -p codesigning`, 2026-10-01 |
| Notary profile `MAIA-BETA` | **PRESENT**; `xcrun notarytool history --keychain-profile MAIA-BETA` authenticated and returned `No submission history.` | founder, Mac Studio, 2026-10-01 |
| Notarize / staple | NOT YET | — |
| Second-Mac Gatekeeper | NOT YET | — |
| Tester release | CLOSED | — |

## Non-claims

No post-containment external-beta artifact has been admitted, notarized, distributed, or deployed. Rejected and rehearsal artifacts remain non-release evidence only. Public `/cabin` is unchanged. Packaging CI does not build the final signed `.app`; only an exact-release-SHA Mac Studio witness establishes the final artifact rows above.
