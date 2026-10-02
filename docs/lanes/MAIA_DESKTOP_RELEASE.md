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

2026-10-02 · canonical observed `f1c1f96f8531`. #1695 merged as `f55b1ead65f2`, admitting the unified Soullab Desktop host (MAIA/member realm + JARVIS/Kelly’s World operator realm). Canonical has since advanced through Writer’s Studio, AIN master-field, safety-delivery, crisis-detector, developmental-ancestry and Living Field work, including newer MAIA Desktop packaging/unification code. PR #1680 is reconciled onto that current lineage. Exact combined Desktop suite: **426/426 PASS**; offline immutable-runtime config witness remains `isrFlushToDisk=false` while ordinary web remains `true`.
· evidence: git + Mac Studio exact combined-tree tests/config witness. Apple rejection provenance remains submission `2f638ee1-ed5b-43ad-9181-a16c209c458a`; separate post-launch strict-codesign witness also proved route-cache mutation invalidated the sealed `888646afc6` app.

## Release SHA

**OPEN.** `888646afc6de4b40b6d2874355fc33ee0d6a3529` was the first exact canonical post-containment release SHA, but it is rejected for **two independent trust defects**: first launch wrote Next route-cache files into the signed `cabin-runtime`, invalidating sealed resources, and Apple notarization later rejected three nested Mach-O binaries that lacked complete Developer-ID timestamp/hardened-runtime trust. The next release SHA must be the canonical merge commit carrying **both** the immutable-runtime repair (#1680) and the nested-native signing + verification repair (#1668); no rejected or branch-only artifact may be renamed, re-signed, or called the release.

## Release order

1. ✅ Merged #1619 as `cf9624cdf` (Writer's Studio RC1 lineage; no pending migrations: its three
   migrations are already applied in production).
2. ✅ Merged #1616 as `ef511f0ef`; that SHA was later **rejected** after its Mac artifact census exposed unsafe repository over-tracing. It is historical provenance, not a release candidate.
3. ✅ Merged #1618 as `f2346dae11f5`, preserving the Desktop packaging lineage and a copy-stage refusal for `backups/` and `.next/cache`.
4. ✅ #1647 merged as `888646afc6de`; that exact canonical candidate passed containment and offline runtime witnesses but was rejected by Apple notarization for nested native-code trust.
5. ✅ #1695 merged as `f55b1ead65f2`, admitting the unified Soullab Desktop host. The immutable-runtime repair (#1680) and nested-native repair (#1668) must both merge on top of current unified canonical; **the canonical commit containing both repairs becomes the only release SHA.**
6. Mac Studio, from that exact release SHA on the T7 build volume: clean root install/build → `MAIA_CABIN_MODE=offline npm run build` (webpack) → inspect the actual `.next/standalone` root, forbidden paths, credentials, symlinks, JARVIS packaged resource, and Next 16.3.8 → run the MAIA Desktop population and require **no failures beyond the exact canonical baseline plus the two additive signing tests passing**; also require the signing/unification targeted suite **32/32 PASS** → fresh package → `npm run verify:package`, which must report every Cabin Mach-O as Developer-ID signed with secure timestamp and hardened runtime.
7. Launch the packaged app offline through the Desktop host and witness `/api/cabin/health`, `/cabin`, and the packaged JARVIS realm. The embedded `maiaBuildSha` must equal the release SHA. Record immutable artifact digests; never rename or re-sign a rejected candidate.
8. Developer ID identity and `MAIA-BETA` notary profile are **present** (see Blockers). Produce the signed hardened-runtime artifact from the exact release SHA, record the signed digest, submit with `notarytool --wait`, and staple.
9. Run `REQUIRE_EXTERNAL_BETA=1 npm run verify:package` and Gatekeeper assessment on the signed/stapled artifact.
10. Untouched download accepted by Gatekeeper on a clean second Mac.
11. Only then: release to the named small cohort (H4.6 contract).

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
| `888646afc6de` | T7 `maia-desktop-artifacts/888646afc6/` | Exact canonical post-containment artifact. Containment, Next 16.3.8, runtime health and build binding passed, but it has **two independent fatal trust defects**: first launch wrote `.next/server/route-cache/**` into the signed bundle and strict codesign then reported added sealed resources; Apple notarization submission `2f638ee1-ed5b-43ad-9181-a16c209c458a` also returned **Invalid** because Prisma query engine, esbuild, and Sharp Mach-O binaries inside `cabin-runtime` lacked complete Developer-ID timestamp/hardened-runtime trust. **Never ship or re-sign.** |

## Blockers

| Gate | State | Evidence |
|---|---|---|
| Canonical Desktop packaging lineage | #1618 merged as `f2346dae11f5`; #1647 added causal trace containment/package fail-closed guards; #1695 merged as `f55b1ead65f2` and now canonically carries both `cabin-runtime` and the governed JARVIS realm resource. | git + merge-sensitive tests + #1695 CI, 2026-10-02 |
| Desktop suite on current unified lineage | PR #1680 reconciled onto canonical `f1c1f96f8531`: **426/426 PASS** under the canonical tsx runner, including immutable-runtime, nested-native signing-verifier, and Soullab Desktop unification falsifiers. Final combined suite must rerun at the canonical release SHA. | Mac Studio exact combined-tree run, 2026-10-02 |
| Exact final release-SHA standalone build | `888646afc6de` completed but is rejected for launch-time seal mutation **and** nested-native notarization trust. **Next release SHA OPEN** pending merge of #1680 + #1668 and exact-SHA rebuild. | Mac Studio, 2026-10-01/02 |
| Offline trace containment | **PASS on rejected `888646afc6de` artifact**: packaged root reduced to admitted runtime trees; forbidden credentials/content absent; Next 16.3.8 present. Containment is preserved by the nested-native repair and must be re-witnessed on the next exact canonical artifact. | Mac Studio packaged-app census, 2026-10-01 |
| Artifact carries Next 16.3.8 | **PASS on rejected `888646afc6de` artifact**; must be re-witnessed on next release SHA | Mac Studio artifact census + `verify:package`, 2026-10-01 |
| Packaged runtime healthy offline | Runtime health **PASS** on rejected `888646afc6de`, but first launch mutated signed route-cache resources and invalidated the code seal. #1680 disables Next ISR disk flush only in offline Cabin. Final witness must prove health **and** unchanged strict codesign before/after launch. | Mac Studio live runtime + strict codesign witness, 2026-10-01/02 |
| Developer ID Application | **PRESENT**: `32276A3F…55DB48 "Developer ID Application: Kelly Nezat (ZVK2X646Z2)"` | founder, `security find-identity -v -p codesigning`, 2026-10-01 |
| Notary profile `MAIA-BETA` | **PRESENT AND USED**; Apple submission `2f638ee1-ed5b-43ad-9181-a16c209c458a` authenticated successfully but returned **Invalid** for nested native-code trust. | founder + Apple notary result, 2026-10-01 |
| Nested Cabin Mach-O trust | **PR #1668 still OPEN.** Build discovers every staged Cabin Mach-O and Developer-ID signs it with secure timestamp + hardened runtime; verifier independently requires the same evidence. It must be reconciled with #1680/current canonical before the release SHA can close. | Apple rejection log + #1668 lineage, 2026-10-02 |
| Notarize / staple | `888646afc6de` submission **INVALID**; next exact canonical artifact must be submitted fresh after nested-native repair. No stapling performed. | Apple submission `2f638ee1-ed5b-43ad-9181-a16c209c458a`, 2026-10-01 |
| Second-Mac Gatekeeper | NOT YET | — |
| Tester release | CLOSED | — |

## Non-claims

No post-containment external-beta artifact has been admitted, notarized, distributed, or deployed. Rejected and rehearsal artifacts remain non-release evidence only. Public `/cabin` is unchanged. Packaging CI does not build the final signed `.app`; only an exact-release-SHA Mac Studio witness establishes the final artifact rows above.
