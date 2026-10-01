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

2026-10-01 · canonical observed `a999932df7aa`. #1647 merged as `888646afc6de`; its exact-SHA signed artifact passed containment, 16.3.8, offline runtime, and local package verification, then Apple notarization rejected nested unsigned Cabin Mach-O binaries. Release SHA reopened for the nested-native signing repair.
· evidence: git + Mac Studio artifact/runtime witness + Apple notary submission `2f638ee1-ed5b-43ad-9181-a16c209c458a`.

## Release SHA

**OPEN.** `888646afc6de4b40b6d2874355fc33ee0d6a3529` was the first exact canonical post-containment release SHA, but its Apple notarization failed because three Mach-O binaries copied inside `cabin-runtime` were not Developer-ID signed with secure timestamp/hardened runtime. The next release SHA will be the canonical merge commit carrying the nested-native signing + verification repair; no rejected or branch-only artifact may be renamed, re-signed, or called the release.

## Release order

1. ✅ Merged #1619 as `cf9624cdf` (Writer's Studio RC1 lineage; no pending migrations: its three
   migrations are already applied in production).
2. ✅ Merged #1616 as `ef511f0ef`; that SHA was later **rejected** after its Mac artifact census exposed unsafe repository over-tracing. It is historical provenance, not a release candidate.
3. ✅ Merged #1618 as `f2346dae11f5`, preserving the Desktop packaging lineage and a copy-stage refusal for `backups/` and `.next/cache`.
4. ✅ #1647 merged as `888646afc6de`; that exact canonical candidate passed containment and offline runtime witnesses but was rejected by Apple notarization for nested native-code trust. The nested-native repair must merge into current `clean-main-no-secrets`; **that new canonical merge commit becomes the only release SHA.**
5. Mac Studio, from that exact release SHA on the T7 build volume: clean root install/build → `MAIA_CABIN_MODE=offline npm run build` (webpack) → inspect the actual `.next/standalone` root, forbidden paths, credentials, symlinks, and Next 16.3.8 → `maia-desktop` tests (**at least 413/413; any lower total is a failure unless explicitly explained**) → fresh package → `npm run verify:package`, which must report every Cabin Mach-O as Developer-ID signed with secure timestamp and hardened runtime.
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
| `888646afc6de` | T7 `maia-desktop-artifacts/888646afc6/` | Exact canonical post-containment artifact; containment, Next 16.3.8, 411/411 suite, signed package verification, `/api/cabin/health`, `/cabin`, and build binding passed. Apple notarization submission `2f638ee1-ed5b-43ad-9181-a16c209c458a` returned **Invalid**: Prisma query engine, esbuild, and Sharp Mach-O binaries inside `cabin-runtime` lacked valid Developer ID signatures; esbuild also lacked hardened runtime; Apple reported missing secure timestamps. **Never ship or re-sign.** |

## Blockers

| Gate | State | Evidence |
|---|---|---|
| Canonical Desktop packaging lineage | #1618 merged as `f2346dae11f5`; #1647 reconciliation retains its copy-stage refusal for `backups/` and `.next/cache` while adding causal trace containment and package fail-closed guards | git + merge-sensitive tests, 2026-10-01 |
| Desktop suite on containment lineage | `888646afc6de` exact canonical candidate **411/411 PASS**; nested-native repair branch **413/413 PASS** (two additive signing-verifier tests). Full suite must rerun at the next canonical release SHA. | founder, Mac Studio, 2026-10-01 |
| Exact final release-SHA standalone build | `888646afc6de` completed and was later rejected only at notarization; **next release SHA OPEN** pending nested-native repair merge and exact-SHA rebuild | Mac Studio, 2026-10-01 |
| Offline trace containment | **PASS on rejected `888646afc6de` artifact**: packaged root reduced to admitted runtime trees; forbidden credentials/content absent; Next 16.3.8 present. Containment is preserved by the nested-native repair and must be re-witnessed on the next exact canonical artifact. | Mac Studio packaged-app census, 2026-10-01 |
| Artifact carries Next 16.3.8 | **PASS on rejected `888646afc6de` artifact**; must be re-witnessed on next release SHA | Mac Studio artifact census + `verify:package`, 2026-10-01 |
| Packaged runtime healthy offline | **PASS on rejected `888646afc6de` artifact**: `/api/cabin/health` ready/offline/build `888646afc`; `/cabin` HTTP 200; embedded `maiaBuildSha=888646afc6de`. Must rerun on next release SHA. | Mac Studio live packaged-app witness, 2026-10-01 |
| Developer ID Application | **PRESENT**: `32276A3F…55DB48 "Developer ID Application: Kelly Nezat (ZVK2X646Z2)"` | founder, `security find-identity -v -p codesigning`, 2026-10-01 |
| Notary profile `MAIA-BETA` | **PRESENT**; `xcrun notarytool history --keychain-profile MAIA-BETA` authenticated and returned `No submission history.` | founder, Mac Studio, 2026-10-01 |
| Nested Cabin Mach-O trust | **REPAIR IN PROGRESS** on `fix/desktop-notary-nested-native-20261001`: build discovers every staged Mach-O and Developer-ID signs it with secure timestamp + hardened runtime; verifier independently requires the same evidence. Suite 413/413 PASS. | Apple rejection log + Mac Studio tests, 2026-10-01 |
| Notarize / staple | `888646afc6de` submission **INVALID**; next exact canonical artifact must be submitted fresh after nested-native repair. No stapling performed. | Apple submission `2f638ee1-ed5b-43ad-9181-a16c209c458a`, 2026-10-01 |
| Second-Mac Gatekeeper | NOT YET | — |
| Tester release | CLOSED | — |

## Non-claims

No post-containment external-beta artifact has been admitted, notarized, distributed, or deployed. Rejected and rehearsal artifacts remain non-release evidence only. Public `/cabin` is unchanged. Packaging CI does not build the final signed `.app`; only an exact-release-SHA Mac Studio witness establishes the final artifact rows above.
