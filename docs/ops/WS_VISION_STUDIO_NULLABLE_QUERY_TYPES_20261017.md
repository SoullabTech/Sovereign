# Vision Studio nullable search parameters — isolated R62V shipping repair

**October 17, 2026 | Mac Studio | Separate from R62/R63 protected-author security branches**

## Narrow target

The exact accepted R61 source commit is
3301401918534600f358f143c3e76ebe1dce1508.

Its unchanged full shipping compiler identified four TS18047 nullability errors
in app/maia/vision-studio/page.tsx. The Next.js useSearchParams hook is
allowed to return null during route hydration and cannot be assumed to
represent a current member query.

The existing page accepts Vision Studio, Practice Field and an explicit
Living Field crossing. Vision phase and opaque fieldContext belong to the
member's actual currently selected route; they must not be silently invented
or lost during a tab change.

## Source edits

- New lib/maia/visionStudioRouteR62V.ts reads exactly the resolved query.
  A missing Next query produces an explicit unresolved result, not an
  inferred author context. A resolved query retains the prior tab default
  ("vision"), Spiralogic phase default ("fire_1") and exact opaque
  fieldContext. Existing unrecognized tab behavior remains unchanged.
- Clicking Vision or Practice changes only the tab parameter, preserving
  every existing phase, fieldContext and other query key. Living Field
  remains an explicit, distinct room path. A click before query resolution
  is ignored instead of fabricating a new tab/path.
- The actual app/maia/vision-studio/page.tsx displays its EXISTING
  "Opening the field…" Suspense-language when the Next query is unresolved.
  No authentic Vision, Practice or other member field is rendered against
  a missing context. Resolved page structure, CSS, child components, API
  calls, private document access and persistence are unchanged.
- Strict test tsconfig includes the repository's existing ambient
  lib/types/speechRecognition.d.ts; no production speech API or voice
  functionality is modified. The first narrowly configured project was
  held until this required type declaration was included.

## Fictional tests and real UI witness

- Nine focused SSR and pure-query unit tests pass: null refusal, no
  fabricated tab navigation, existing defaults, exact Unicode/special
  fieldContext preservation, practice/vision distinction, and explicit
  Living Field crossing.
- Precommit inherited Studio, Source, consent, security, mobile and new
  Vision tests: **98/98 suites and 1,074/1,074 tests pass**.
- Strict scoped TypeScript PASS.
- Global shipping TypeScript on this candidate: R61 **181** errors →
  candidate **177**, exactly four Vision Studio TS18047 errors removed
  and zero added; the production shipping build is still FAIL.
- Genuine Next.js actual Vision Studio WebKit rehearsal with a disposable
  PostgreSQL 16 fictional member session: anonymous admission refused to
  /signin, then signed-in desktop Vision Studio rendered the requested
  phase=water_2 / fieldContext=fictional-R62V. Clicking Practice and
  returning preserved the context. A fictional mobile Practice Field
  route rendered its exact separately requested phase/context.
  **12 browser checks**, **13 infrastructure/cleanup checks** passed,
  with no external/provider requests or content writes.
- Both reviewed screenshots live in:
  docs/design/contracts/screenshots/vision-studio-query-desktop.png
  and vision-studio-query-mobile.png, with their contract at
  docs/design/contracts/vision-studio-query-readiness.md.
  The interface honestly reported "Your wider field is unavailable"
  because all real member API requests were blocked; it did not show or
  silently recover another member's personal field. The mobile Practice
  Field still has compact navigation/form spacing that requires separate
  aesthetic review.
- The isolated reusable fixture code includes
  scripts/ops/wsBetaVisionQueryNextPG16.py (bound to cached real
  postgres:16.13 and a nonmember fsync vault) and
  scripts/ops/wsBetaVisionQueryWebKit.cjs (genuine WebKit,
  explicit session cookie, no accepted content writes). The source of
  the SQL fixture is the reviewed R52 actual Next Writer PG16 runner,
  but its route/assertions are changed to Vision Studio. It does NOT
  claim a real signed-in account, a production Vision edit or that a
  physical iPhone was witnessed.

All precommit test evidence is preserved under:
/Volumes/T7 Shield/ws-beta-vision-query-evidence-20261017/

Exact-source acceptance still requires a clean committed SHA, replayed
unit/regression/PG16 browser tests and a full shipping compiler baseline
comparison, plus governance/release-gate verification.

## Limits

This is a Vision Studio route/nullability correction, NOT the R62/R63
independent authorization/key convergence work. Those security lanes
must be integrated and separately qualified rather than overwritten
by a low-risk UI/type branch.

No real members, provider calls, deployed services, production/legacy SQL,
Work keys, original Source, manuscript content, beta invitations or GitHub
release branches were touched. A clean global production build,
operational key/revocation custody, historical plaintext migration,
offsite encrypted recovery, genuine Mac/physical iPhone Safari and
founder exact-image launch authorization remain blocking requirements.

**Decision: Vision Studio R62V local candidate only; Writer five-tester
production beta HOLD.**
