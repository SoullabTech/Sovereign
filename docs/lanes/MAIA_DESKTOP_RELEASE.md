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

2026-10-02 · canonical observed `4aebf0d87bee845f063f44c38864206a371c9314` (#1680 merged). Exact release-SHA Mac Studio witness completed: clean install, offline webpack build with `isrFlushToDisk=false`, standalone containment/Next 16.3.8 census, **426/426 PASS**, signed package verification, offline runtime health + `/maia` 200, clean shutdown, unchanged strict codesign after first launch, Apple notarization/stapling, Gatekeeper acceptance, and fresh ZIP/DMG extraction/mount checks all passed.
· evidence: git + Mac Studio exact-SHA commands + Apple notary submissions `8ff8d1e7-7032-4858-ac98-d01d9f88a932` (ZIP) and `5961c41e-ba72-4455-942e-80cc766423cd` (DMG).

## Release SHA

**SET.** `4aebf0d87bee845f063f44c38864206a371c9314` is the canonical MAIA Desktop external-beta release SHA. It contains the nested-native signing repair, Soullab Desktop unification lineage, and the offline immutable-runtime repair. The exact-SHA artifact has passed local external-beta admission. Rejected predecessors remain historical provenance only and must never be renamed, re-signed, or represented as this release.

## Release order

1. ✅ Merged #1619 as `cf9624cdf` (Writer's Studio RC1 lineage; no pending migrations: its three
   migrations are already applied in production).
2. ✅ Merged #1616 as `ef511f0ef`; that SHA was later **rejected** after its Mac artifact census exposed unsafe repository over-tracing. It is historical provenance, not a release candidate.
3. ✅ Merged #1618 as `f2346dae11f5`, preserving the Desktop packaging lineage and a copy-stage refusal for `backups/` and `.next/cache`.
4. ✅ #1647 merged as `888646afc6de`; that exact canonical candidate passed containment and offline runtime witnesses but was rejected by Apple notarization for nested native-code trust.
5. ✅ #1695 merged as `f55b1ead65f2`, admitting the unified Soullab Desktop host. ✅ #1668 merged as `e95fba2a08b6`, admitting nested Cabin Mach-O Developer-ID signing/verification. ✅ #1680 merged as `4aebf0d87bee845f063f44c38864206a371c9314`; **that merge commit is the release SHA.**
6. ✅ Mac Studio exact-SHA witness on T7 completed: clean root `npm ci` → offline webpack build → standalone census (`458M`, server present, `.next/cache` absent, forbidden roots/credentials absent, Next `16.3.8`) → MAIA Desktop **426/426 PASS** → fresh signed package → `npm run verify:package` PASS with all 9 Cabin Mach-O binaries Developer-ID signed, securely timestamped and hardened-runtime valid.
7. ✅ Packaged app launched offline: `/api/cabin/health` returned `ready` / `offline` / build `4aebf0d87`; `/maia` returned HTTP 200; clean quit stopped the Cabin runtime. Post-launch strict codesign remained valid and no `.next/server/route-cache` was created inside the signed bundle. Immutable distributable digests recorded below.
8. ✅ Developer ID + `MAIA-BETA` trust chain completed. ZIP notarization submission `8ff8d1e7-7032-4858-ac98-d01d9f88a932` **Accepted**; app stapled and validated. Final stapled ZIP SHA-256: `6f8b8069246e85307e74c4992a246dd8e98098bf97f8e98c9b6176cbfc6ec012`. DMG notarization submission `5961c41e-ba72-4455-942e-80cc766423cd` **Accepted**; DMG stapled and validated. Final stapled DMG SHA-256: `2265c203dde4498e7e0c5f7d000df1a8b31da75291ace28a136d49bb04274943`.
9. ✅ `REQUIRE_EXTERNAL_BETA=1 npm run verify:package` PASS with `releaseClass: EXTERNAL_BETA`; Gatekeeper reports `accepted` / `source=Notarized Developer ID`. Fresh ZIP extraction and read-only DMG mount both preserved strict codesign, staple validation, and Gatekeeper acceptance.
10. ⏳ Untouched download accepted by Gatekeeper on a clean second Mac — **still required; not yet witnessed**.
11. Only then: release to the named small cohort (H4.6 contract). Tester release remains closed until step 10 passes.

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
| Canonical Desktop packaging lineage | #1618 merged as `f2346dae11f5`; #1647 added causal trace containment/package fail-closed guards; #1695 merged as `f55b1ead65f2` and carries both `cabin-runtime` and governed JARVIS realm resource; #1668 added nested Cabin Mach-O trust; #1680 merged as release SHA `4aebf0d87bee` and added immutable offline runtime. | git + required CI + exact-SHA Mac witness, 2026-10-02 |
| Desktop suite on current unified lineage | **426/426 PASS at exact release SHA `4aebf0d87bee`**, including immutable-runtime, nested-native signing-verifier, and Soullab Desktop unification falsifiers. | Mac Studio exact release-SHA run, 2026-10-02 |
| Exact final release-SHA standalone build | **PASS at `4aebf0d87bee`**: offline webpack exit 0; `isrFlushToDisk=false`; standalone `458M`; server present; `.next/cache` absent; Next `16.3.8`; forbidden roots/credential-like files absent. | Mac Studio exact-SHA build + census, 2026-10-02 |
| Offline trace containment | **PASS at release SHA `4aebf0d87bee`**: admitted runtime only; forbidden roots/credentials absent; Next `16.3.8`; no runtime disk cache in signed resources. | Mac Studio standalone + packaged-app census, 2026-10-02 |
| Artifact carries Next 16.3.8 | **PASS at release SHA `4aebf0d87bee`** | Mac Studio `verify:package`, 2026-10-02 |
| Packaged runtime healthy offline | **PASS at release SHA `4aebf0d87bee`**: health ready/offline, `/maia` 200, clean shutdown, strict codesign unchanged after first launch, no route-cache mutation. | Mac Studio live runtime + pre/post-launch strict codesign, 2026-10-02 |
| Developer ID Application | **PRESENT**: `32276A3F…55DB48 "Developer ID Application: Kelly Nezat (ZVK2X646Z2)"` | founder, `security find-identity -v -p codesigning`, 2026-10-01 |
| Notary profile `MAIA-BETA` | **PRESENT AND SUCCESSFULLY USED** for release SHA `4aebf0d87bee`: ZIP submission `8ff8d1e7-7032-4858-ac98-d01d9f88a932` Accepted; DMG submission `5961c41e-ba72-4455-942e-80cc766423cd` Accepted. Earlier invalid submission remains rejection provenance only. | Apple notary results, 2026-10-02 |
| Nested Cabin Mach-O trust | **PASS at release SHA `4aebf0d87bee`.** #1668 (`e95fba2a08b6`) signs every staged Cabin Mach-O with Developer ID + secure timestamp + hardened runtime; release verifier independently confirmed **9/9** packaged native binaries satisfy that trust. | #1668 merge + exact-SHA `verify:package`, 2026-10-02 |
| Notarize / staple | **PASS at release SHA `4aebf0d87bee`**. ZIP submission `8ff8d1e7-7032-4858-ac98-d01d9f88a932` Accepted; DMG submission `5961c41e-ba72-4455-942e-80cc766423cd` Accepted; app and DMG stapled/validated. | Apple notary + Mac Studio stapler, 2026-10-02 |
| Second-Mac Gatekeeper | **PENDING — only remaining admission gate**. Same-Mac fresh ZIP extraction and read-only DMG mount both Gatekeeper-accepted; a clean second Mac has not yet been witnessed. | — |
| Tester release | **CLOSED pending second-Mac witness** | H4.6 contract |

## Non-claims

The exact release-SHA artifact `4aebf0d87bee` is locally admitted as an **EXTERNAL_BETA** artifact and has been notarized/stapled, but it has **not been distributed or deployed**. Rejected and rehearsal artifacts remain non-release evidence only. Public `/cabin` is unchanged. Tester release remains closed until the clean second-Mac Gatekeeper witness passes.
