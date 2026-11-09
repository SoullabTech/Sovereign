# Real-MAIA walk — evidence report (2026-11-09)

Run by Claude Code in the app's browser pane at the founder's request, on the local harness (throwaway DB, fictional books), **real model under the founder's own key**. Evidence class: real-model, agent-driven, local. ⛔ Not the founder's own experience, not production, not Class A/R20. Merge, migration, deploy and release stay HOLD.

## Confirmed facts
**Configuration and isolation (non-secret metadata only):** the first 401s were a 5-character key reaching the app (the hidden-prompt paste failed); with the full key (length 108, `sk-ant-` prefix — values never printed) calls succeed. The app process's environment holds only: the local DB (`127.0.0.1:54329`), the key, and the harness's own flags — no provider endpoint override, no production database, no other secrets. The worktree has no `.env`/`.env.local`/`.env.development*` for Next.js to load (templates only). The harness DB is an ad hoc fixture built by tolerant migration; **it is not production-shaped evidence** — that remains the separate isolated qualification (production-derived baseline + production runner, recorded in `WS-DEVELOP-STUDIO_INTEGRATION_QUALIFICATION_2026-11-09.md`).

**G6 acceptance — a persisted reading informs a later conversation, under the right member, Work, revision and consent:**
- Reading `9576b584-9f69-4e61-8940-b61c588116d5` · lens `overview` · scope: Return only (`bodyScope` = Return; 1 chapter read in full; The Harbour, Salt, The Letter not read) · revision 1 · 4 observations persisted · 24 s.
- Next conversation, **no reading permission**: "What did you notice about Return when you read it?" → she named "an overview-lens reading on 9 November, from revision 1", recounted her observations in her own words, stated the limit ("depends entirely on the three sections I hadn't read"), and did **not** send the writer back to read again.
- Provenance in the answer's own row: `carriedReadings: [{readingId: 9576b584…, revisionNumber: 1}]` (and on the following turns). Standing-read receipts minted only after permission was granted.
- Quoting: she quoted Return correctly (the passage the writer is at) and distinguished it from what her reading was made from.

**Plan (real model):** five steps, every anchor an exact sentence across all four chapters, directions not prose, coverage 4/4 stated.

**Helper's book:** first names only (never surname, hospital or depot) unless asked directly; raised "job and place in the first line" as a question to the writer.

## Defects found by this walk (and status)
| # | Defect | Status |
|---|---|---|
| 1 | Carried readings read field `text`; the contract field is `observation` — real readings would have been carried with **no observations** (fixtures used the wrong shape) | **Fixed**; fixtures now use the contract shape; reading-carry 10/10 |
| 2 | Plan forced its tool on the conversation model, which rejects forced tool choice (400) | **Fixed**: plans use the developmental reader's model; real plan succeeded |
| 3 | When the passage the writer is at changes between turns, she blames herself for her earlier (correct) quotation | **Open**: the change is now recorded per answer (`answer_provenance.locus` digest) and stated to her; she still self-blames in a fresh conversation. Prompt-level notice is not enough; needs a stronger design (e.g. show what she said vs what is there now) and a real-model check |
| 4 | **Sanctuary: the Work conversation stored the writer's question and MAIA's answer verbatim** | **Fixed under founder ruling (2026-11-09, "do what is best")**, applying the Sanctuary invariant as written. Inherited from canonical (its Ask route had no Sanctuary handling), not introduced by G6. Now in Sanctuary: no thread is created and no turn is written, fresh or continuing; the answer is returned once, marked not kept, and shown in the conversation without storage. The writer's manuscript, edits, plans and decisions are unaffected. Route test (fresh, ordinary→Sanctuary mid-conversation) passes and fails if storage is forced; real MAIA: answered, `threadId: null`, 0 rows stored |
| 5 | In Sanctuary she suggested granting the reading permission (which Sanctuary suspends) | Open, small (guidance) |
| 6 | The helper's-book "protect identities" note did not appear in two turns | Open; cause not established |
| 7 | The new stage has no way to commission a reading; readings sit behind lens cards in the old view | **G4 first slice built (founder, "Yes, start G4")** — see below. Not yet walked with real MAIA |
| 8 | Harness books have no saved revision, so readings are refused until a save | Open (harness); the G4 path saves a draft revision first when a reading needs one |
| 9 | **The Sanctuary exchange (fix #4) was rendered inside the "Correct MAIA" menu**, so in the page it never showed; nothing was stored either way | **Fixed**: moved to the end of the conversation. A display test fails on the earlier code and passes now. The real-model check had measured storage (0 rows), not display |

## Next authorized gate
Founder ruling on #4 (does Sanctuary govern Writer's Studio conversation retention?) · then G4 (readings and lenses through conversation) · fix #3 with a real-model check · the founder's own walk · independent Class A/R20 acceptance.

## Sanctuary — what is settled and what is not
- **PASS:** in Sanctuary nothing of the Work conversation is stored (route test with failure-proof; real-model check: 0 rows). No reading permission, no carried readings, no settled decisions reach her in Sanctuary (route tests).
- **RULED (founder, 2026-11-09, "Yes, in the moment"):** in Sanctuary MAIA may still *see*, for that answer only, the passage the writer is at, the earlier ordinary turns of a conversation being continued, and the writer's own declared notes about the Work. Nothing from the Sanctuary exchange is kept. The standing reading permission, carried readings and settled decisions stay withheld in Sanctuary, as built.
- **Not changed:** Write-room (passage desk) conversations under Sanctuary are a separate route; not examined in this walk.

## PASS / FAIL / UNKNOWN (this report)
- PASS: G6 acceptance (persisted reading → later conversation, correct member/Work/revision/consent, provenance in the answer row) · isolation (non-secret metadata) · real plan · observation-field and plan-model fixes · Sanctuary stores nothing.
- FAIL (open): MAIA self-blames when the passage changes between turns · the identity-protection note did not appear · no conversational way to commission a reading on the stage.
- UNKNOWN: Write-room Sanctuary behaviour · why the identity note did not appear.
- RULED: Sanctuary in-the-moment inputs (founder, "Yes, in the moment").

## G4 — readings through conversation (first slice, 2026-11-09)
Founder ruling "Yes, start G4", recorded as a **narrow amendment to Design 1B**: one offered control acts — **Read this chapter**. Every other offer stays navigation-only.
- MAIA may offer `[[studio:read-chapter]]` or name a lens (`[[studio:read-chapter:arc]]`); the lens must be one of the reading contract's own lenses (`DEVELOPMENTAL_LENSES`), anything else falls back to overview. Only the Work conversation offers it; passage Focus does not. No other action accepts a parameter.
- **Only the writer's click starts a reading.** She is told she never starts one herself. The reading covers the chapter the writer is in; if it needs a saved revision, the draft is saved first (as "Save current draft & read" does). Nothing in the writing changes.
- While it runs, the conversation shows honest elapsed time (the same `readingProgressText` as the old view); when done: "MAIA has read X. Ask her what she noticed." Nothing is sent to MAIA on the writer's behalf; the next answer carries the reading (G6).
- **Sanctuary:** a reading is kept, so in Sanctuary the click reads nothing and says why. If the posture cannot be read (no saved settings), the reading proceeds (Sanctuary defaults off).
- Where a room cannot start a reading (Write, Review, canvas), the offer becomes the existing navigation to Develop rather than a button that does nothing; with no handler at all, no button.
- Tests: offer parsing and instruction (studioActions), click-only, lens passed, progress, success, refusal, Sanctuary, degraded rooms (workConversationStudioActions). Type gate: no regressions. Wider suites: only the 8 inherited failures.
- ⚠️ Observed, not changed: the old Develop view's lens-card reading buttons do not check Sanctuary at all.
- ⛔ Not yet: a real-model walk of this path; lenses beyond the current chapter (whole book, chosen chapters).
