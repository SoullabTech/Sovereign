# Constellation — learning from what people choose to share

**Programme:** SOULLAB-CONSTELLATION-01
**Act:** C7A — read-only founder learning report
**Standing:** CANDIDATE BUILT — 57 Constellation tests and focused strict typecheck pass; synthetic presentation and signed-out local HTTP verified. Not merged, not deployed. Authenticated production read remains unwitnessed. No new collection enabled.

## Scope

Founder direction: continue the Constellation learning loop. First deliver an inspectable founder report over existing, explicitly submitted Writer's Studio beta feedback. Do not introduce passive tracking to fill missing campaign measurements. This growth programme is distinct from Living Constellation and inherits no authority over that programme's member graph.

Source: `writer_studio_beta_feedback`, created by `database/migrations/20260929000005_writer_studio_beta_feedback.sql`. The source declares explicit writer-authored beta feedback only. The Beta note gesture at `app/dev/writers-studio-p4r1/P4R1BetaFeedback.tsx` submits one chosen signal; it is not a passive observation. Reading these already-submitted signals for internal product feedback is not permission to mine private manuscripts, conversations, chart data, or optional free-text notes.

## Before implementation: acceptance contract

1. Founder authorization precedes every source read, both on the page and API. A browser flag, URL, or claimed member id grants nothing.
2. Only aggregate chosen-signal counts cross the source adapter. Notes, manuscript identities, member identities, orientation context, and exact event times never enter the report.
3. The query is SELECT-only inside a read-only transaction, bounded to 28 completed UTC days; no caller-controlled dates, cohorts, filters, or exports. No schema or consent changes.
4. Count feedback submissions, not people or meaningful acts. Repeated submissions do not manufacture independent corroboration.
5. A positive signal count is displayed only with at least five distinct contributors to that signal. Otherwise it is withheld, not rounded to zero. No totals or contributor counts are returned that would reveal suppressed cells. This is data minimization, not a claim of anonymity or differential privacy.
6. Successful empty reads, unavailable reads, and withheld small groups remain distinct. Unknown source shapes refuse the measurement rather than being silently dropped.
7. Campaign attribution, arrival, useful first acts, return, cross-room invitations, and contribution are NOT MEASURED until their own lawful source exists. No guessed funnel or conversion rate.
8. The report makes no diagnosis, engagement score, attachment score, causal claim, or automatic campaign recommendation. Optional feedback is a self-selected sample.
9. No new client tracker, cookie, local storage, pixel, model call, identity join, or person-level event store. No change to MAIA's prompts or referral behavior in C7A.
10. Kelly's World receives the programme standing through its existing read-only programme projector. It does not acquire a new analytics database or permission to probe production. Work/System carry provenance; Graph may show documentary lineage only; Monitor must not claim a live feed; Today must not invent a founder emergency.

## Discriminating tests

Reject candidates that convert an unavailable source to zero, reveal a count supported by one person submitting many times, leak notes/identities, double-count duplicate signal groups, fabricate campaign conversions, or read before founder authorization. Verify the real report builder and route behavior against these distinctions. Browser layout fixtures, signed-out HTTP checks, and authenticated production observations must be reported as separate evidence classes.

## Destinations

Founder page: `/founder/constellation`.
Founder API: `/api/founder/constellation`.
Both reuse `requireFounder()` and refuse before reading when unauthorized. Their data is not cached publicly. The existing founder navigation receives one entry, **Doorway learning**.

## Delivery boundary

C7A is the first learning report, not the completed campaign measurement system. C7B will require explicit member-facing participation and provenance for prospective attribution/first-use/return evidence. No retrospective reconstruction from private records. The Astrology doorway has no admitted feedback source in this slice. Case Study 001 has a public method, not yet a set of published outcome examples. C5 currently supplies prompt-level referral instructions; it is not a deterministic enforcement or witnessed model-behavior guarantee.

## Verification

- `npm test -- --runInBand lib/constellation/__tests__`: 9 suites, 57 tests PASS. Forty-one tests were added for C7A: pure report laws, mocked read-only database behavior, independently guarded API/page access, mobile export boundaries, and synthetic component output.
- `tsc -p tsconfig.constellation-learning.json --pretty false`: focused strict typecheck PASS, including the new server/page/API source and its imported types. This is not a full-repository typecheck.
- An exploratory stronger `noUncheckedIndexedAccess` check found the existing generic return at `lib/db/postgres.ts:325` could be undefined. That shared file was not modified. The committed scoped config uses standard strict mode; no existing guard or baseline was weakened.
- Browser checks: desktop 1440x1100 and mobile 390x844 synthetic renders PASS; empty, withheld, and unavailable fixture states PASS. Screenshots were visually inspected and retain their invented-data banner. No horizontal overflow, including expanded provenance.
- Real local signed-out API: HTTP 401, private/no-store, no feedback disclosed. Signed-out page: no feedback disclosed. These checks do not prove an authorized founder can read the live production database.
- No new database table, tracker, cookie, local-storage entry, scheduled job, model call, or external analytics provider. No private feedback notes, manuscripts, conversations, or birth data were read to make the witnesses.
- `bash -n scripts/capacitor-patch-routes.sh`: PASS. Only the new founder report subtree is additionally web-only; other founder routes retain their prior classification.
- Synthetic preview route removed. Production deployment, authenticated source availability, full repository lint/build, and the installed Kelly's World runtime remain separate gates.

The existing Kelly's World programme projector was run read-only against the C7A working-tree candidate. It resolved `SOULLAB-CONSTELLATION-01` to this dated record by its explicit Programme declaration, carried the bounded candidate standing, and did not invent a founder need. This is documentary propagation, not a live report feed or an installed Desktop witness. Evidence: `docs/programme/evidence/SOULLAB-CONSTELLATION-01/C7A-world-projection.json`.

Machine-readable browser evidence: `docs/programme/evidence/SOULLAB-CONSTELLATION-01/C7A-browser-witness.json`.

## Follow-up boundary

C7B is not implemented: prospective participation and source-bound evidence are needed to answer which invitation led to an actual useful first act and whether the person chose to return. No existing private history is eligible as a substitute. C7A is safe to review independently of that future design.
