# C7B — did this experience help the person move their work forward?

**Programme:** SOULLAB-CONSTELLATION-01
**Act:** C7B1 — participation and usefulness interaction rehearsal
**Predecessor:** SOULLAB-CONSTELLATION-01_C7_LEARNING_LOOP_2026-10-03.md
**Standing:** REVIEW-ONLY CANDIDATE BUILT — 104 Constellation tests pass, eight named wrong designs fail, focused strict typecheck and local interaction rehearsal pass. No member enrollment, feedback collection, storage, merge, or production activation.

## Why this act is bounded

The founder requested continuation of C7B after the C7A read-only report. C7A explicitly deferred new collection. The first C7B act therefore makes the proposed human experience inspectable without silently authorizing a new retention policy, research participation, or marketing use. The next necessary human decision concerns the pilot's data custody, not a software checkbox.

Base: `cde5299a6b4c45339b707a2b504133a9c515f39e`, which contains C7A and an arrival null-path fix committed in the original branch during orientation. The original worktree was already being edited; this act uses its own worktree and branch and does not claim authorship of that repair. Parent PR: #1769. No merge or deploy is performed.

## Proposed first pilot

One voluntary report after one Writer's Studio experience. No longitudinal study yet. No account creation, page load, or edit acceptance counts as usefulness. A writer can find value in rejecting an edit; preserving their original wording remains a valid outcome.

Ask only:

1. What did you try? Discussing a passage or considering a revision are separate descriptions, selected by the person.
2. Did that help you move your work forward? Yes, partly, not yet sure, no, and prefer not to answer remain distinct and none is preselected.
3. Optionally, may the report include the invitation you recognize arriving through? This starts off and is independent of participation.

The report is explicitly **member-reported**, not a server-witnessed completion or causal estimate. The first pilot must not claim to measure all new visitors, campaign conversion, or return. Nonresponse and declining have no recorded meaning. No automatic recruitment, nagging, or follow-up contact.

## Candidate boundaries, specified before implementation

B1: entering the Studio is not participation. The rehearsal starts at an invitation, with a clear skip path.
B2: participation does not grant attribution, contact, referral, training, publication, or testimonial permission. Attribution is a separate optional act; other permissions are absent.
B3: an activity is not a usefulness judgment. Each is chosen separately. Changing the activity clears the old usefulness answer.
B4: review the exact categorical draft before finishing the rehearsal. No free text, manuscript identifier, member identifier, timestamps, birth data, or conversation may enter it.
B5: attribution only names a recognized invitation expressly included by the person. An unknown invitation is not laundered into a valid source; a clicked URL alone establishes no durable identity or consent.
B6: changing one's mind clears every preview answer and attribution selection, including after review or completion. No hidden draft survives in component state.
B7: the preview never reports a submitted, enrolled, persisted, or withdrawn-server state. It holds choices in browser memory only and ends with **Nothing was sent**. It has no network or storage capability and is not mounted in the member Studio or doorway.
B8: no campaign outcome is published to the C7A report. A preview draft is explicitly branded `preview_only_not_submitted`; it cannot be mistaken for an observed event.
B9: founder preview page requires server-side founder authorization, independently of parent layout visibility. No client flag or query parameter may bypass it. Its code is excluded from native static export by the existing `/founder/constellation` exclusion.
B10: instructions and draft policy are proposals, not ratified law. Source evidence, software verification, founder acceptance, rollout authorization, and member permission remain different facts.

## Preview location

`/founder/constellation/participation` — founder-only interaction rehearsal. All buttons say preview where consent or submission would otherwise be implied. A separate temporary development wrapper may be used for browser tests with a conspicuous synthetic banner; it must be deleted before commit.

## Custody recommendation for founder decision — not implemented

Start with **one experience, no return tracking or marketing contact**. Each real report would be deletable by its author and excluded immediately upon withdrawal. Retention is proposed at **30 days**, after which the identifiable report is removed; no permanent report-derived aggregate is retained in this first pilot. The exact storage design must demonstrate deletion, expiry, and replay safety before collection can open. Backup retention and what withdrawal can actually remove must be stated honestly before any consent text promises it.

Neither a preview agreement nor the founder reviewing this page creates member consent. No schema, migration, enrollment endpoint, reporter, expiry job, or withdrawal API is included in C7B1. The existing beta-feedback table is not repurposed to carry this new meaning.

## Verification plan

Test each transition on the actual reducer; hostile cases include preparing without participation, bundled attribution, inferred usefulness, stale answers after an activity change, unknown invitation ids, completion without exact review, and ineffective clearing. Pair key laws with deliberately weakened adapters and demonstrate they fail for the named reason. Test the page's auth-first ordering. Browser-walk the actual component on desktop and mobile, including skipping, optional attribution, review, returning to edit, completion, and clearing. Verify no interaction causes a data request or storage write. Synthetic evidence never becomes a campaign result.

## Kelly's World

Explicit Programme/Act/Standing fields allow the existing read-only programme projector to show C7B1 as a review-only candidate. It does not become a live Monitor metric. The public-growth Constellation remains distinct from the Living Constellation member graph.

## Verification results

- `npm test -- --runInBand lib/constellation/__tests__`: 12 suites, 104 tests PASS, including 47 new C7B1 checks.
- Eight deliberate wrong-design adapters fail their named checks; the actual reducer passes those same checks. This is local transition evidence, not a guarantee about any future server or lived human experience.
- `tsc -p tsconfig.constellation-learning.json --pretty false`: focused standard-strict typecheck PASS over the founder report and its new child page/component.
- Actual component through temporary wrapper: full desktop 1440x1000 and mobile 390x844 interaction passes. No preselection; no usefulness before an activity; independent attribution; activity changes invalidate the old answer; exact review; return to edit; completion explicitly not sent; complete clearing; restart and reload reset.
- Both interaction windows recorded zero fetch/XHR/non-GET requests and zero Storage.setItem writes. This is bounded observation of this preview, not an audit of the whole application.
- Real signed-out local founder page does not mount the preview. Authenticated production access remains unwitnessed.
- All four screenshots visually inspected. An inherited shell audio-unlock toast briefly overlapped the first mobile review capture; final review captures were taken after it disappeared naturally. No shell code was changed or hidden.
- The first fresh-worktree Jest run printed a pre-existing duplicate `maia-desktop` package-name warning; the test run completed successfully. No tooling baseline changed.

Durable browser evidence: `docs/programme/evidence/SOULLAB-CONSTELLATION-01/C7B1-browser-witness.json`.

The isolated reducer also passes TypeScript with `--strict --noUncheckedIndexedAccess`. The full-repository build/typecheck was not run locally for this slice.

The existing Kelly's World projector resolves this candidate through the explicit predecessor record and carries the review-only standing. Its current implementation hard-codes `needs_founder: []`, so this witness does not establish a new Needs Kelly alert; the custody question is carried in this record and the founder preview, not an invented dashboard notification. No projector code or installed Desktop runtime changed. Evidence: `docs/programme/evidence/SOULLAB-CONSTELLATION-01/C7B1-world-projection.json`.

## What remains before live participation

Founder agreement on one-experience scope, retention, withdrawal and backup limits; then a narrowly scoped storage/receipt implementation, author-bound deletion, expiry/replay tests, truthful consent text, and separately authorized member rollout. No deployment or schema authority follows from this preview passing tests.

Follow-up tracker: `MAIA-SOVEREIGN-c9r` — C7B2 custody decision, open; no implementation authority implied.
