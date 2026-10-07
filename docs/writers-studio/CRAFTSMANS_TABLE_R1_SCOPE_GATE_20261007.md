# Craftsman's Table R1 — reading-scope gate

Date: 7 October 2026
Task: MAIA-SOVEREIGN-a96
Standing: bounded reading-scope repair verified on the candidate; full real editing-session witness still open.
Starting commit: bfe67438c27dc136a859d5264b07d50c774564fb
Branch: feature/writers-studio-craftsmans-table-r1-20261006
Worktree: /Users/soullab/ws-craftsmans-table-r1-20261007
Execution: Kelly's Mac Studio, through Desktop Commander.

## Authority

Kelly asked to continue to the next gate after the prior Desktop Commander
verification. This act fixes the named negative-scope and partial-coverage
failures, preserves the existing interface, and prepares the Chapter 10 witness.
No canonical merge, deployment, database migration, or manuscript Apply is part
of this act. The previous verification record remains historical and unchanged.

## Reproduction

The former detector treated a scope mention as a commission. New executable
cases produced 31 failures out of 39 before repair: negations, quoted instructions,
past/hypothetical/future readings, narrower requests alongside whole-book mentions,
and an irrelevant lens in a preceding sentence.

## Repair

`detectCraftRereadIntent` now uses a conservative affirmative-present request
grammar, strips quoted/code/blockquoted material, respects refused scopes and
selects the target of the requested act rather than the widest phrase anywhere.
Ambiguous/unrecognized language stays local; the editorial context directs MAIA
to clarify when a wider read is necessary rather than claim one occurred.
This is a bounded request grammar, not proof of general natural-language intent
understanding. Its admitted examples and counterexamples are executable tests.

`runCraftReread` composes the existing commissioned-reading and fetch APIs. It
creates no separate reader, uploads no substitute manuscript, and does not change
the legacy whole-manuscript review implementation. Each result is checked against
the commissioned reading ID, manuscript, requested lens, canonical revision,
current assessment, exact requested section set and body-depth coverage.

A broad run that stops after some verified lenses reports PARTIAL, names the
uncompleted lenses, and can discuss only the verified results. No result with
unverified identity or coverage is promoted. A no-observation outcome is still a
completed read when its coverage is verified. No transport failure is retried.

The controller checks current privacy before commissioning, locks against duplicate
in-flight Craft requests, and checks originating Work/passage/working-copy/revision
continuity before each read/fetch and before sending the editorial reply. Leaving
the place or changing privacy stops subsequent calls. Already-started external
requests cannot be retracted; their results are not reused under the new context.

Coverage is a quiet status line beside the existing conversation, not a dashboard.
It survives the subsequent model reply. Both the notice and the model context
distinguish the saved manuscript that was read from the unsaved working passage
being compared against it. No broader read licenses a broader rewrite or Apply.

## Verification

- 20 selected suites: 187 tests passed; 0 failed.
- Includes the prior 132 tests, 39 scope-request examples, 15 commission-boundary
  tests with inert service doubles, and one mounted-companion coverage test.
- The service-boundary cases prove zero commission calls for the named negative,
  quoted and mention-only requests; exact chapter/lens commissioning; honest
  partial results; identity/revision/coverage refusals; and interruption behavior.
- Existing eight actual workbench interaction tests and preference-hydration
  test remain green. No model-quality claim is inferred from those doubles.
- `npm run typecheck:ws-flagship`: passed.
- `git diff --check`: passed.
- Source-shape assertions were moved to the new adapter address; their bounded
  reading and canonical-versus-working-copy distinctions were preserved.

Evidence on the Mac: /tmp/ws-r1-scope-gate-20261007/
- intent-before.log (31/39 failed before repair)
- intent-after.log
- reread-gate.log
- final-tests.json and final-tests.log
- final-typecheck.log

## Real Safari arrival witness — limited scope

A separate Safari window was opened on localhost:3741; existing tabs and the
older 3738 worktree were not changed. The original Chapter 10 Craft crossing
parameters were reused, not reconstructed as a new conversation.

Observed in the actual DOM:
- Craftsman's Table R1 mounted.
- MAIA companion mounted.
- Active section is the Fire / Activating, Amplifying, Actualizing section.
- The current source locus is 151 Unicode code points; exact-match attribute true.
- Privacy selection is unresolved on this origin.
- No red/blue proposal marks are present before that selection.

The writer's Ordinary/Sanctuary choice was NOT supplied on his behalf. No model
request, suggested wording, saved alternative, or manuscript Apply was initiated
by this browser witness. Normal page loading may record the return location;
this is not a claim that no application metadata was written.

## Next live gate

The retained Craft-session witness awaits Kelly's explicit privacy choice in the
new 3741 window. After that: inspect MAIA's carried understanding and actual
response, exercise primer / edited suggestion / hybrid refinement, verify reload
and return, and separately witness receipt-backed Apply/Undo only under explicit
manuscript-mutation authority or in a clearly isolated disposable test Work.

This record does not close R1, does not assert a completed Chapter 10 creative
loop, and does not authorize a deployment. The chapter text remains unchanged.
