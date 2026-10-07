# Craftsman’s Table R1 — selection typography and provider failure

Date: 2026-10-07. Local candidate: port 3741.
Branch: feature/writers-studio-craftsmans-table-r1-20261006.

## Selection repair

The old focused renderer used raw imported hard wraps and split surrounding
paragraphs only on blank lines. This differed from the whole-section typesetter.
It also reserved a 210px editorial gutter even when there were no edits.

The candidate now maps the whole section’s typeset blocks back to exact source
code-point intervals. Focus does not rewrite source whitespace or manuscript
content. The selected passage reflows normally, surrounding paragraphs retain
their spacing, and a single red focus bracket replaces cloned blue line boxes.
Empty editorial margins are absent. Actual proposal deletions and insertions
retain their existing red/blue marks and individual author decisions.

Suggest an edit / Discuss / Write here appear directly beneath the focused
passage. Selection alone sends no AI request. Suggest an edit explicitly requests
one bounded proposal; Discuss is reply-only; Write here opens the author’s current
working copy. Save/Apply remain separate and unchanged.

## Actual browser observations

At a workbench width of about 815px, text width increased from about 394px to
714px after the empty margin was removed. Focused text changed from pre-wrap to
normal prose flow. The red focus bracket has 2px strokes. All three immediate
editing actions were enabled. The Fire body still matched the pre-repair body
exactly, and canonical manuscript revision remained 2.

The failed Amplifying thread had zero MAIA turns, zero proposal versions, and
no application. No manuscript change was made by that request.

## Why the live suggestion did not produce edit marks

The provider response observed at 2026-10-07T18:29 UTC was HTTP 400:
“Your credit balance is too low to access the Anthropic API.”

This is a provider-account billing block, not a focus-selection failure or a
model-produced refusal of the writer’s editing request. The app had flattened
it into structured_refused / provider_unavailable.

The server now distinguishes the confirmed provider_billing_required category.
The client renders a fixed explanation of low API credit and unchanged copy,
without exposing raw provider response bodies. Unknown failures remain unknown;
rate limits and local exceptions are not relabelled as low credit. Dispatch
observations are preserved. No automatic retry, provider switch, credit purchase,
or credential change was added or performed.

## Verification

- 29 targeted suites: 256 tests passed.
- Writer’s Studio flagship typecheck passed.
- git diff --check passed.
- Mounted component tests cover preserved typography, source fidelity, immediate
  editing actions, actual proposal markup, draft preservation and focus return.
- Provider/client tests cover known billing errors, unknown errors, no retry and
  no fallback.
- Live Amplifying proposal-generation gate remains BLOCKED by low API credit.
  Passing component tests do not constitute a successful live model response.

## Next real action

The account owner must replenish the API organization’s credits. Then request
Suggest an edit once on the already focused Amplifying passage. Verify one
bounded proposal and its red/blue marks before any Save or Apply.
