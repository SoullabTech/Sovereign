# Craftsman's Table R1 — Desktop Commander verification

Date: 7 October 2026
Standing: verified repair candidate; NOT a complete R1 product or production release.
Task: MAIA-SOVEREIGN-vf3
Remaining release gate: MAIA-SOVEREIGN-a96

## Authority and custody

Kelly requested continued development through Desktop Commander, following his
ruling that the manuscript is the craftsman's table, MAIA is the conversational
collaborator, and Hermes is invisible continuity. Wording suggestions may be
volunteered under the writer's setting; examples, edited suggestions and hybrid
copy must remain material the writer controls.

Execution was on Kellys-Mac-Studio.local through the connected Desktop Commander.
Worktree: /Users/soullab/ws-craftsmans-table-r1-20261007
Branch: feature/writers-studio-craftsmans-table-r1-20261006
Starting HEAD: 10b5c2117504d25cf2d9de1b4ad41b7aea428abc
The starting checkout was clean and matched its remote branch.

The older 3738 Studio and its worktree were not changed. The isolated R1 server
was already running on 3741. No production merge/deployment, database migration,
real manuscript edit, or MAIA model invocation was performed by this verification.
The existing layout and CSS were left unchanged.

## Reproduced failures, before repair

The existing nine selected suites passed all 53 tests, and the flagship typecheck
passed. Additional direct probes and executable tests nevertheless exposed:

- Grouped phrase edits lost internal whitespace: `old red boat` -> `new blue ship`
  reconstructed as `newblueship`.
- A keyword-based request detector interpreted `do not rewrite` and a question
  about a past rewrite as permission to generate a new revision.
- Accepted or locally edited portions of a proposal were reset when a newer MAIA
  candidate arrived. Only the separate full-passage manual path was preserved.
- Apply remained enabled for an older saved version while different unsaved
  wording was visible. Stale canonical text did not disable the UI act either.
- An intentional empty working passage was displayed as the original again.
- Switching from direct composition to Markup/Preview hid the draft just typed.

Before the repairs, the new copy/intent regressions produced 16 failures out of
27 tests, and six mounted-component interaction tests all failed. These were real
counterexamples, not tests weakened to match a preferred result.

## Repair scope

Copy composition now slices exact source and candidate intervals, including shared
whitespace, instead of concatenating only changed tokens. Unicode, paragraph
breaks, tabs, CRLF, empty strings and individual accepted subsets are exercised.

The incoming candidate and the version being shaped have separate identity.
Author decisions, local wording, direct composition and Stet survive later MAIA
alternatives. Preview, the copy passed to MAIA, and Save use the same working text.
An empty working string is not a missing value. A saved-version acknowledgement
can change identity without changing the words. Apply requires matching saved
member-version text and a current canonical anchor, with no pending composition.

Craft resolves suggestion policy from the writer's request and per-Work setting,
not prompt scaffolding or incidental quoted manuscript text. Reply-only actions
and explicit refusal take precedence. Edit latitude and a prior MAIA reply do not
independently permit volunteered wording in R1. The existing server outcome
vocabulary enforces the supplied reply-only policy; the legacy Write sequence
contract remains unchanged.

The per-Work setting exposes when restoration is complete. Automatic Craft arrival
waits for that state; it continues the carried intention without a replacement
proposal when unsolicited suggestions are off. An enabled setting permits the
provisional demonstration without falsely recording an explicit writer request.

## Verification results

- 17 selected suites: 132 tests passed, 0 failed.
- Includes eight tests mounting the actual Craftsman's Table React component,
  and one mounting the actual preference hook in an isolated DOM.
- Existing passage-carry, route, sequence and latitude tests remain in the run.
- `npm run typecheck:ws-flagship`: passed.
- `git diff --check`: passed.
- GET of the 3741 development page: HTTP 200; this is compilation/route evidence,
  not evidence of an authenticated editing session or a successful model response.

The interaction tests use synthetic prose and inert callbacks. They exercise
selection, local typing, later candidate arrival, Preview, Save's exact payload,
and explicit Apply dispatch. They do not apply anything to Kelly's manuscript.
Three source-shape assertions were aligned with the newer adapters. One direct-
only adapter assertion was already stale at the starting HEAD; its replacement
checks both the Craft adapter and the preserved legacy Write path.

Detailed local evidence: /tmp/ws-r1-dc-20261007/
- baseline-tests.log and baseline-typecheck.log
- reproduced-failures.log
- hybrid-interaction-before.log and hybrid-interaction-after.log
- final-tests.json and final-tests.log
- final-typecheck.log

## Still open — do not promote this to R1 delivery

A separate pure probe found that `Do not read the whole book. Just help with this
sentence.` still resolves to whole-manuscript scope. That probe did not commission
a read. MAIA-SOVEREIGN-a96 records the required scope-intent repair, truthful
partial-reading coverage, and the full real Chapter 10 acceptance session.

The real model-assisted primer / edited-suggestion / hybrid loop, reload/resume,
and receipt-backed Apply/Undo still require end-to-end verification. Professional
mark semantics and whole/part orchestration are not proven complete by these
component tests. No request is made for Kelly to pull or test another partial UI.
