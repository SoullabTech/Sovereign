# Craftsman's Table R1 — focus handoff gate

Date: 2026-10-07
Candidate: feature/writers-studio-craftsmans-table-r1-20261006
Base inspected: df8190e62
Issue: MAIA-SOVEREIGN-jnp
Status: focus handoff verified on the local candidate; not full Studio delivery.

## The interaction

The manuscript remains the workbench. One compact Focus row provides Stay here, Choose passage, and Ask MAIA where next. Selecting original words in the manuscript offers Work here; selection alone does not move the editing target. The chooser also offers paragraphs, a whole section, and earlier work held during this page session. The existing adjustable columns remain.

Exact quotations in MAIA's current response can identify unique paragraph doorways. Those doorways say Work here; they neither apply wording nor rank every quoted passage as an editorial recommendation. Non-unique or stale coordinates are refused rather than choosing the first apparent match.

Keeping an original word produces a visible kept choice and a factual receipt. The kept word is no longer displayed as an active red deletion. Reopen is explicit. A focus move reports that no wording changed. A working-copy edit reports that it has not been applied to the manuscript.

A small, deterministic conversation-command vocabulary supports explicit quoted Keep requests, unique named focus changes, Stay here, Markup/Preview, and literal quoted replacements in the working copy. Questions, conditional requests, quoted instructions, and Apply are not executed by that command parser. This is not a claim that every possible natural-language instruction has a complete canvas action binding, nor a claim about microphone input.

## Preservation and provenance

Moving focus snapshots the actual local draft, pending direct-composition editor, custom wording, chosen marks, candidate version, preview state and kept choices. Returning restores that state. These drafts are held on the current page, not silently saved to the manuscript or promised to survive closing/reloading the page. An unload warning protects unsaved state.

The conversation stays mounted across focus changes. Earlier editorial context crosses the API as source thread and exact boundary identifiers. The server checks both owners, the Work, editorial-chain membership and the historical MAIA boundary before loading or persisting a new turn. Author and MAIA words remain separate.

Large prior conversations carry a bounded contiguous suffix of exact recent exchanges rather than an invented summary. The context explicitly reports how many older turns were omitted. The source thread inspected in the live witness had more than 55,000 code points in its last twelve turns; the previous fixed budget would have blocked the next passage. The bounded carry now retains recent complete exchanges within its budget and makes its limited coverage explicit.

## Verification

- 24 targeted Jest suites passed; 222 tests passed, zero failed.
- Writer's Studio flagship TypeScript check passed.
- git diff --check passed.
- The 3741 candidate page returned HTTP 200.
- Mounted-component tests cover original-word settlement, literal working-copy replacements, stale-target refusal, direct original-text selection, unfinished draft return, and restoration of accepted mark decisions with the original editorial thread.
- Parser tests refuse questions and conditional Keep requests instead of turning them into immediate actions.
- Route tests resolve historical carry before a new author turn is persisted, reject unavailable/foreign carry, require a paired historical boundary, reject client-provided transcripts, and refuse Sanctuary before carry resolution or persistence.

## Actual-browser witness

An isolated Safari tab used the running 3741 candidate and the existing Chapter 10 Fire session. Non-GET fetch requests were blocked in that witness tab to prevent model calls, saves, application or other mutations during these checks. No blocked request was attempted.

1. The existing edit tool kept notice and displayed the kept-choice receipt.
2. MAIA's quoted Amplifying reference offered Work here.
3. Work here moved focus to the full Amplifying paragraph, exact canonical interval 596–975, with the receipt: Focus moved to Amplifying. No wording changed.
4. A synthetic unfinished draft was typed only in the isolated working canvas.
5. Original manuscript words from the Actualization paragraph were selected. Selection offered Work here but did not change the active focus.
6. Work here moved to that exact paragraph, interval 1195–1357, and reported that the previous draft was held on the page.
7. Return here reopened Amplifying with the editor still open and the synthetic text exactly preserved. The controller's working text also matched that draft, so subsequent conversation receives the actual copy being shaped.
8. The synthetic draft was cancelled through the UI and the witness returned to the opening.
9. Canonical manuscript content and revision remained identical, the existing editorial thread remained identical, and its application field remained null.

The browser witness did not invoke a new MAIA response after the focus move. The server carry and ingress were verified with controlled tests. The full real-model refinement / Save / Apply / Undo sequence remains a separate gate.

## Repairs made during verification

- Returning with a thread version could overwrite restored chosen marks because its version effect used the previous focus's render state. A failing mounted-component test now passes.
- Keep questions and conditional clauses could be parsed as commands. Those tests now refuse execution.
- A stale duplicate of the active draft could remain in the held-draft map after returning. Active ownership now removes that duplicate.
- Apply still requires a bound editorial thread and a matching writer version even though a newly focused passage can be composed locally before its thread opens.

## Remaining boundary

Saving a new writer-authored focus without first receiving a MAIA proposal is not claimed complete here. Local composition and same-page draft carriage work; first-save independence and the full real-manuscript Apply/Undo witness remain follow-up work. No production deployment or canonical manuscript application was performed in this gate.
