# R77 — Scribe report export: real owned transcript data and privacy gate

**2026-10-17 | Isolated Mac Studio source-only correction | production / five-person Writer’s Studio beta HOLD**

## Starting point and motivation

The accepted R75 Writer's Studio source is pinned at
`cb4bf897efe6364c0c83f27ace33146989c41c78`.
A separate R76 lane is handling encrypted pending MAIA suggestions and was
intentionally NOT edited or merged into this branch.

The whole-app shipping TypeScript source showed ten failures in
`app/api/scribe/export-report/route.ts`: it requested
`getCompletedSessionData().transcript/markers/container/sessionClosed/`
fields that were NEVER supplied. `getCompletedSessionData` is an
intentionally tiny metadata-only legacy helper used in another route,
and broadening it would risk silently changing those consumers.

More seriously, this export route previously authenticated a member but
did not check that the requested scribe session belonged to that member
before attempting to assemble material for an LLM prompt. A bare session UUID
cannot grant transcript access.

## Bounded source changes

- `lib/scribe/ownedReportDataR77.ts` uses existing verified
  `verifySessionOwnership` and exact UUID validation. It denies
  wrong/nonexistent member/sessions before reading any transcript.
- Explicit `consent_status='confirmed'` and
  `transcript_enabled=true` are required. Pending, declined and
  transcription-disabled sessions fail closed.
- `memory_policy='sealed'` is refused *before any LLM call*. The existing
  shared provider's `forceOllama` mode may fail over to cloud, so it cannot
  honestly guarantee a sealed transcript stays local.
- The existing canonical `loadReviewTurns` supplies the genuine assembled
  (or raw fallback) transcript. Markers are fetched from a fresh
  member-owned and confirmed-consent SQL JOIN.
- The session owner, consent, transcript enablement and sealed policy are
  checked **again** after loading and before returning data for the LLM.
  Empty transcripts produce a truthful 422 rather than a fabricated
  synthetic report. The route then operates on the actual fields.
- The route validates JSON lens/format, supports existing JSON/Markdown
  outputs, sets `Cache-Control: private, no-store` and does not return
  raw provider exception strings to the client. No database mutations or
  model-selection changes were made.
- This is not operational provider authorization: a learning-policy,
  owner-consented report may still use the shared tier-selected provider.
  A separate reviewed provider-destination notice, key/storage audit and
  record retention contract are required before real-member launch.

## Test results before exact commit

The two new isolated mocked test suites verify invalid IDs, foreign owner,
pending/declined consent, transcript disabled, sealed policy, successful
owner transcript and chronological markers, revocation while loading,
empty transcript refusal, missing session, private no-store JSON/Markdown,
non-revealing errors and no provider call on any denial.

**19/19 focused tests passed**, and selected R75+R77 regression
**113/113 suites, 1,181/1,181 tests passed**.

The full unsuppressed shipping TypeScript diagnostics dropped from
**113 to 103** (10 resolved, zero introduced), without exclusions,
`@ts-ignore`, `as any` or weakened checks. The full build still fails;
a production image is NOT qualified. Precommit evidence must be rerun after
the source is committed.

## Release boundary

This repair does not touch Writer's Studio canonical Work, original Source,
one-use Apply, separate Undo or MAIA author provenance. No live member
sessions, Scribe recordings, clinician data, model endpoints, credentials,
Linux production backups, or paid model calls were accessed. No protected
branch merge, GitHub push, PR, invitation or deployment.

The independent R76 confidential pending-proposal work remains separately
under development. Standard private writer beta still requires
production SQL/WAL/vault/NAS/offsite encryption and a genuine cold restore,
103 remaining TypeScript issues, truthful provider consent and exact model,
physical Safari/iPhone and founder-approved two-writer canary.
Optional sovereign independent KMS is a future upgrade.

**Disposition: local held source candidate, never production beta GO.**
