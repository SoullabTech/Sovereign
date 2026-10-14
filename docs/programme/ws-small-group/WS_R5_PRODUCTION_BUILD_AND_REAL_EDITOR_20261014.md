# Writer’s Studio R5 — production-shaped build and actual editor acceptance

**14 October 2026 · Source-only release qualification · DRAFT / production HOLD**
**Scoped goal:** one small invitation-only test group, beginning with two verified real writers only after release acceptance.
**Exact application code built:** `f818f874f2fafa7a2aeaff2e20069e26200f10fd` from draft PR #1820. Changes to the browser test harness came afterward and do not alter the built application's TS/TSX source.
**Host:** authorized Mac Studio, isolated `/Volumes/T7 Shield/ws-small-group-integrated-two-writer-20261014`. No live member DB/vault, NAS, cloud account, CI deployment, or consent state changed.

## TypeScript — triage, not a waiver

- Initial full `tsc --noEmit` with 8-GiB Node heap: **959 diagnostic lines** across hundreds of inherited files. Of these, 71 originate in Writer-related `__tests__` files (not release runtime modules). No direct runtime Writer's Studio route/editor module received a TS diagnostic in the parsed full run.
- Core `tsc -p tsconfig.core.json` before Prisma client generation: **562 diagnostics**. This is the actual core/build-focused tsconfig, not the entire repository.
- After isolated `prisma generate --schema prisma/schema.prisma` (no provider/db calls), repeat core typecheck: **516 diagnostics**, 276 distinct parsed files. **0 direct Writer's Studio runtime-path diagnostics** in `app/writers-studio`, `lib/writersStudio`, `app/api/writers-studio`, `app/api/sovereign/manuscripts`, `lib/manuscript` or `proxy.ts`.
- **48** parsed errors remain in shared **MAIA route / MAIA and memory** files, including 18 at `app/api/sovereign/app/maia/list/route.ts`. This is release-relevant because MAIA conversation and consent are promised in the Studio experience. The 516 diagnostics must not be hand-waved away as unimportant.
- Child PR #1820 adds no TypeScript/TSX source: only Docker rollback contract, Bash, JS browser test and docs. It has **not introduced** changed TS code paths. Source and build validation remain separate.
- `next.config.js` explicitly sets `typescript.ignoreBuildErrors=true`, meaning a passing production build **does not establish TypeScript acceptance**. This must be independently adjudicated with severity and inherited-baseline accounting; no configuration was relaxed.

## Production-shaped local compilation

- Exact isolated npm lockfile dependencies installed via `npm ci --offline --ignore-scripts` (2,342 packages). Initial `npm run build` completed webpack compilation but failed route-data collection because skipped postinstall left `.prisma/client/default` absent. This was preparation, not an identified Writer source defect.
- Ran `./node_modules/.bin/prisma generate --schema prisma/schema.prisma` with only an intentionally unreachable fake DB URL. Succeeded, no database contacted.
- Retried `npm run build` with Next.js **16.3.8 webpack**, **dummy** provider/audit credentials and unreachable fake DB; **production compilation succeeded**, 823/823 static pages, generated `.next/BUILD_ID`, `.next/static`, and `.next/standalone/server.js`.
- Existing import checker reports **44 WARN-only unresolved internal imports** in older unrelated or shared source; no direct Writer path among displayed warnings. This is not a clean source-policy qualification.
- Initial standalone smoke had an EMPTY page because the **test packaging copy** nested static files under `.next/standalone/.next/static/static` and `public/public`. The fix was to copy **contents** into `.next/standalone/.next/static/` and `.next/standalone/public/` via `rsync -a` and restart only the disposable server. Test asset path then returned **HTTP 200**. No application source was modified.
- This is a **real production-mode standalone build run locally on macOS**, NOT the independently verified `linux/amd64` Docker image or install/rollback rehearsal. No GitHub merge or production traffic swap.

## Actual browser acceptance — real editing, not route-only

The isolated standalone server used `127.0.0.1:3776` and a dedicated named fictional PostgreSQL witness DB over loopback. The suite refused to run without explicit `WS_COHORT_SYNTHETIC_ONLY` opt-in, exact DB name/address/port guard and absence of fixed fake IDs.

**Chrome: 28/28 PASS. Playwright WebKit: 28/28 PASS.**

Both engines exercised *two separate admitted fictional writers plus one excluded generic active-beta fictional account*. All members had distinct fake sessions and manuscript sections. The checks included:

1. Server-derived exact member grant; uninvited status 403 and redirect, unauthenticated denial.
2. Both authors' actual Writer’s Studio Home → Develop → Write → Review rooms and refresh.
3. Each author’s real `[data-write-editor][contenteditable="plaintext-only"]` writing surface: loaded exact own saved passage, accepted new synthetic keystroke text, then persisted it into that author's draft, verified via owner-authenticated API.
4. Each author clicked the real **Save a copy** menu and downloaded TXT. Exact current browser-edited text was present; the other writer’s synthetic text was absent.
5. Cross-writer manuscript read and write refused, and revoked fake session immediately refused.
6. Exact post-run database witness: **0 residual fixture member rows and 0 generic beta contacts**; browser contexts closed, no test service left for members.

An earlier draft of the test incorrectly expected a visible `Edit` button or textarea, but the actual editor is a plaintext-only contenteditable textbox. That inaccurate test assumption was corrected. Prior production-browser failures caused by missing static copy were also test package preparation and were resolved without source changes. Only final successful post-correction runs receive PASS attribution.

**Mac Safari and physical iPhone Safari have NOT been tested.** Playwright's WebKit engine on the Mac is not proof of a physical mobile Safari session; although CoreDevice listed a paired iPhone 16 Pro Max, no process was launched and nothing on it was opened or inspected.

## Exact remaining holds before any real writer

- No full TypeScript zero-diagnostic acceptance (core 516) or qualified Linux Docker digest/SBOM/security and exact image rollback witness.
- Real physical iPhone Safari and authenticated account-switch/cross-tab session tests pending; two fictional browser sessions are not actual member accounts.
- No real external MAIA conversation, provenance-scoped memory consent, Learn/Listen audio behavior, Review-generation provider flow, full signed-in import or complete writer click-flow beyond tested UI edit/download/navigation.
- No accepted compatible emergency Chapter Review rollback. Draft guard only **refuses** seven-lens rollback to old reader, does not protect all ingress or supply a rollback target.
- No independently governed real PostgreSQL+complete original Source-vault encrypted backup/restore, historical plaintext/NAS Recycle all-copy irrecoverability, or independent R20 signer/high-water. Founder's strict Delete Work erasure law remains binding.
- No independent human Class A security/privacy review or founder exact-image release GO; invite and production deployment stay **HOLD**.

**Evidence logs, all local/fictional only:**
`/tmp/ws-two-writer-production-build-20261014-r2.log`
`/tmp/ws-two-writer-core-ts-postprisma-20261014.log`
`/tmp/ws-two-writer-production-real-editor-20261014.log`
`/tmp/ws-two-writer-production-real-editor-webkit-20261014.log`

**Next prioritized engineering:** isolate risk-relevant shared MAIA/consent TS errors and missing-import warnings, independently qualify one exact Linux image and rollback, and close real-device authenticated Safari and protected manuscript restoration before opening the two-person canary.
