# Craft conversational restoration — 7 October 2026

Candidate branch: feature/writers-studio-craftsmans-table-r1-20261006. Base c4d8e0a538. Local port 3741.

## Report and observed cause

The writer accepted the Water suggestion `become -> be`, explained that movement toward presence is intentional, and said `yes put become back`. The command parser did not recognize that form. The wording-proposal detector also did not recognize it; with proactive suggestions off, the request reached the model as reply-only. MAIA returned discussion/instructions, not a replacement version or an executed canvas action. The writer subsequently chose Keep mine.

Before repair, live Water working text and the text supplied to the conversation controller both contained `become present`. The table showed `become` kept for this pass, no remaining edit marks, no busy request and no application. The stored Water thread had six turns and one existing MAIA proposal. This was a missed action command, not evidence of a delayed edit.

## Bounded repair

- Explicit `put <word> back` and `restore <word>` instructions, including `yes put become back`, use the existing exact keep-original canvas primitive.
- Original quoted phrases are supported; bare single words are supported. Unresolved pronouns, questions, deferrals, conditions, quoted speech and additional acts do not execute.
- Target must be a uniquely identifiable original span in the current, still-matching passage. The existing ambiguity, larger-edit and protected-span checks remain.
- Restoration preserves unrelated working-copy edits. It settles the named original choice for this pass.
- Changed text yields: `“become” restored in your working copy and kept for this pass. Not applied to the manuscript.`
- Already-present wording yields an already-present receipt, not a claim of another text change.
- No model call, broader reread, Save or Apply is needed for this exact restoration. No UI redesign, provider, credentials or persistence policy change.

## Verification

A new regression suite reproduced the missing command before the fix. After repair, 293 tests in 29 targeted suites passed; Writer's Studio flagship typecheck and diff check passed.

An isolated Safari window opened the existing Water thread, with all non-read network requests blocked. In that isolated copy, Use this selected the existing `become -> be` proposal. The actual MAIA conversation composer then submitted `yes put become back`.

Observed: working text immediately returned to the original; the parent conversation controller held the same restored wording; obsolete replacement marks disappeared; the named choice was settled; the last visible entries were the writer's command and the Canvas action receipt. Zero blocked requests were recorded, establishing that this gesture attempted no network write/model call. Preview showed the restored wording. Canonical manuscript and stored editorial thread compared unchanged.

The writer's original Water tab was separately compared before/after: working wording, settled choice, canonical manuscript and stored thread all unchanged by the repair. No manuscript application occurred. The isolated test window is not the writer's live editing state.

## Remaining scope

This establishes bounded original-word restoration, not arbitrary conversational editing, global replacement or durable automatic saving. Save/Apply/Undo and writer-first persistence retain their separately tracked gates. The semantic decision that becoming/presence is intentional remains the writer's decision, not a new generic rule to shorten process language.

Tracker: MAIA-SOVEREIGN-9ex. Local diagnostic records: /tmp/ws-restore-word-20261007.
