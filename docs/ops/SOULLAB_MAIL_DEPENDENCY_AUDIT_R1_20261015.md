# Soullab Mail — deployment dependency security qualification

**Date:** 2026-10-15
**Parent source:** c673ae15bf6d9699ba3a33a7ef2530c5c0764feb (draft PR #1830).
**Standing:** isolated candidate only. No production change or relaxation of any security gate.

## Problem reproduced

The deployment script `scripts/deploy-production.sh` invokes `npm audit --omit=dev --audit-level=moderate` and refuses to deploy on a nonzero result.

On the parent lockfile, that exact production audit found **15 advisories (2 critical, 6 high, 7 moderate)**. Thus the Docker build and TypeScript CI greens did NOT mean the full deployment preflight was ready.

## Least-disruptive correction

1. Move `concurrently` (development desktop process runner) and `tailwindcss` (build-time CSS tool) from production dependencies to development dependencies. The actual production Compose build uses `Dockerfile`, whose builder installs full dependencies; the emitted Next standalone runtime does not require Tailwind's compiler. The older alternate `Dockerfile.production` has a production-only builder and remains a separate legacy compatibility concern; do not claim that alternate build was qualified.
2. Upgrade transitive `source-map-js` 1.2.1 → 1.2.2, resolving its published CPU exhaustion advisory.
3. Upgrade the gray-matter YAML engine dependency from js-yaml 3 to js-yaml 4 through npm overrides, and use an explicit maintained `load`/`dump` YAML engine wherever Soullab calls gray-matter. This preserves the front-matter/body delimiter interface while avoiding the old `safeLoad` API removed by js-yaml 4.
4. Upgrade only mammoth's command-line `argparse` dependency to version 2; mammoth's DOCX conversion library APIs are unchanged. Preserve the same Mammoth version.
5. Add maintained `js-yaml` as a declared runtime dependency and its type definitions as a build-time dependency.

The final lockfile preserves pre-existing package versions except the source-map patch and one added type package; three obsolete nested YAML/argument-parser resolutions are removed. Existing overrides remain intact.

## Isolated evidence

- Exact deployment-rule audit `npm audit --omit=dev --audit-level=moderate`: **PASS; 0 advisories** after correction.
- Clean `npm ci --dry-run --ignore-scripts --legacy-peer-deps` on a separate copied manifest/lock/workspace structure: PASS, without changing other worktrees' dependency installations.
- A real standalone, minimal installation using the new YAML and argparse override versions: gray-matter YAML parsing PASS; Mammoth DOCX library API PASS; Mammoth CLI `--help` PASS.
- New YAML 4 front-matter tests on a real AIN framing, BOM/CRLF, ordinary Markdown, anchors and invalid YAML: **5/5 PASS**.
- Integrated email, Soul Portrait and content-focused tests: **17/17 suites, 147/147 PASS** in the isolated source tree. Jest still uses `--forceExit` due a pre-existing test-harness open-handle warning.

## Residual development-tool risk, honestly separated

A full `npm audit` including development/build dependencies still reports **87 advisories (5 critical, 57 high, 17 moderate, 8 low)**. Those do not trigger the configured production-only deploy audit, and many originate from legacy Storybook, Tailwind, and test/build tooling. The separate build-time supply-chain threat is not proven safe merely because production runtime audit is clean. Do NOT claim the entire tree is vulnerability-free; prioritize further scoped remediation separately without a forced Tailwind 3→4 application restyle.

## Required before use

- Run the exact candidate in GitHub CI for TypeScript no-regression, Sovereignty and Docker build, plus source and scholarly import/compatibility tests where relevant.
- Independently review dependency classification and the YAML 4 engine change; verify compiled production assets and unaffected Writer's Studio experiences.
- Preserve PR #1830's separate human security/migration review, protected R20 restore, and authorization for production Proton token mount, SMTP configuration and consented real delivery witness.
- **Do not re-enable Resend, weaken the audit, alter production configuration, send member email, or merge automatically.**
