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
| 4 | **Sanctuary: the Work conversation stores the writer's question and MAIA's answer verbatim** | **STOP — founder ruling needed.** Pre-existing on canonical (its Ask route has no Sanctuary handling); this branch only added Sanctuary to what she is *given*. Conflicts with the project's Sanctuary invariant ("not stored, indexed…"). Not changed here |
| 5 | In Sanctuary she suggested granting the reading permission (which Sanctuary suspends) | Open, small (guidance) |
| 6 | The helper's-book "protect identities" note did not appear in two turns | Open; cause not established |
| 7 | The new stage has no way to commission a reading; readings sit behind lens cards in the old view | Open — founder direction: all of these through conversation with MAIA (G4) |
| 8 | Harness books have no saved revision, so readings are refused until a save | Open (harness) |

## Next authorized gate
Founder ruling on #4 (does Sanctuary govern Writer's Studio conversation retention?) · then G4 (readings and lenses through conversation) · fix #3 with a real-model check · the founder's own walk · independent Class A/R20 acceptance.
