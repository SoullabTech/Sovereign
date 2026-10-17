# R83 — Strict real Next.js application build with pinned original fonts

**2026-10-17 · isolated Mac Studio T7 source · production/five-member beta HOLD**

## Source custody and governing changes

R83 branches only from the clean, exact accepted R82 commit
`18f88aff688fa7cc5ef30c10427c22c1cd652530`. No protected branch,
production code, GitHub push, production database, real member content,
credential, paid model, deployed instance or beta admission was touched.

R82 had physically proven the full unsuppressed **shipping-entrypoint**
checker (`tsc -p tsconfig.ship.json --noEmit`) at **0 errors** from an
original 103, plus 1,193/1,193 selected tests and the 116/116 WebKit,
75/75 PostgreSQL writer acceptance. However, the actual Next build still
selected `tsconfig.core.json` (with 291 broader legacy errors) and used
`ignoreBuildErrors: true`. That was NOT acceptable as a certified build.

R83 changes only the **existing build configuration** to point at the
shipping-entrypoint scope:
`typescript.tsconfigPath = 'tsconfig.ship.json'`
and `typescript.ignoreBuildErrors = false`. All routes are still compiled;
direct runtime imports remain reachable to the selected type program.
The broad legacy core program still has 291 errors and is **not** being
represented as clean. No application screen, member flow or visual design
is changed by this configuration correction.

## Original fonts — proof, not a visual substitute

The four original accepted type families remain
**Inter, Newsreader, Cinzel and Quicksand**. R83 does not change any
`next/font/google` call, CSS typography token, weight/style choice,
layout or font fallback policy.

The installed Next.js font loader explicitly accepts
`NEXT_FONT_GOOGLE_MOCKED_RESPONSES`: a build-time, source-verified CSS
response fixture with local font-file URLs. R83 fetched the actual public
CSS requests and WOFF2 binaries once from only `fonts.googleapis.com`
and `fonts.gstatic.com` with no cookies, accounts, credentials or model
provider. These were stored in a local, permissions-restricted mirror
OUTSIDE the shipping source:

`/Volumes/T7 Shield/ws-beta-r83-local-approved-font-cache-20261017/`

There are **18 genuine WOFF2 binary files**, not dummy stand-ins:
seven Inter, six Newsreader, two Cinzel and three Quicksand. Independent
SHA-256 comparison found that **7/7 Inter and 6/6 Newsreader** binaries
are byte-identical to those rendered by the previously accepted local
Writer's Studio Next development build. The remaining five binaries are
the correct named public Cinzel and Quicksand families. After
compilation, the production `.next/static/media` directory contained
**18/18 SHA-256-matching binaries** from this fixed mirror.

The pinned normalized public CSS request/binary-URL SHA-256 is:
`b519e8cfec61c69b9209f2bd85e2009baf75532802f41f29ca7f2da599da197a`

The exact fixed local Next/font CSS fixture SHA-256 is:
`fc29c110251b2c00375122f88598f4f5b929a3d71a10aaaf7deb64749e39451c`

`scripts/ops/wsBetaR83ExactPublicFonts.py` requires an explicit
public-font-only opt-in and **rejects upstream drift** from those pins.
`scripts/ops/wsBetaR83StrictOfflineBuild.py` independently verifies
all file hashes and the exact source pin *before* invoking the build.
No font binary is committed to this change or shared externally.

## Real Next.js production-build proof

A genuine `next build --webpack`, not a mocked webpack/compiler call,
ran inside macOS `sandbox-exec`. Its network policy denied
**all outbound networking**, verified separately with a localhost
socket EPERM negative control. The build received only a synthetic
clean HOME, exact font fixture location, small environment allowlist
without any member tokens, API credentials, database URL or paid model
configuration, and the normal declared 8 GB Node heap budget.

The initial build:

- Next.js v16.3.8 successfully read `tsconfig.ship.json`.
- **Optimized webpack compilation passed in 118 seconds**.
- **Next's own TypeScript check passed with build-error suppression disabled**.
- Static generation **826/826** passed, with page optimization and
  build trace collection completed.
- `next build` exited **0** after **219.05 seconds**.
- Generated `.next/BUILD_ID`, `.next/routes-manifest.json`,
  `.next/prerender-manifest.json`,
  `.next/server/next-font-manifest.json`, the canonical
  `.next/server/app/writers-studio/page.js`, and
  `.next/standalone/server.js`.
- **18/18** font files in emitted assets match the pinned source.
- No remote font fetch was permitted during this build; no
  provider call, subscription action, model cost or production write.

**Precommit evidence**:
`/Volumes/T7 Shield/ws-beta-r83-precommit-strict-font-pinned-build-20261017.log`
and adjacent JSON receipt. The first development configuration was
later supplemented with fixed upstream font hashes; the next action is
**exact-commit qualification** of those pinned, otherwise identical
instructions.

## What “reproducible” will and will not mean

A committed exact-source build, using the same locked 18 assets and
OS network denial, must run successfully a second time before R83 is
fully accepted. Its expected font SHA and route structure must remain
stable. Next's existing `NEXT_PUBLIC_BUILD_TIME` timestamp and Next
`BUILD_ID` are intentionally honest build-time identity and may vary
between runs; the build is therefore not claimed to be byte-for-byte
deterministic unless that variability is formally scoped and tested.
Do not replace the build timestamp with a fake constant merely to
manufacture identical SHA values.

The font mirror currently lives at a specific local T7 path. That is
**not a distribution-ready vendored asset package** or attestation
that another computer can reproduce the build without the mirror.
Production publication requires pin-preserving asset custody, signed
runtime artifact and independently verified rollback/restart.

## Outstanding release gates

Actual source encryption and recoverable SQL/WAL/vault/legacy/NAS/backups
with cold/offsite restore; an authorized real MAIA provider call with
default-off disclosure consent and confidential attribution/author action;
physical Mac Safari and iPhone Safari signed-in import/Edit/Apply/Undo;
founder-ratified real consent notice and controlled two-writer canary;
deployment readiness, signed image and rollback. No independent sovereign
KMS is required to *start* ordinary beta if conventional custody passes,
but any already stronger-protected Work must not be silently downgraded.

**Disposition: strict Next.js offline production compilation PASS in
isolated precommit test; actual release remains HOLD.**
