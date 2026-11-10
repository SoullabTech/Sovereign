# WS-WORK-CONTINUITY — returning-writer browser walk (2026-11-08)

Candidate: branch `feature/ws-work-continuity-part-a-suite` (PR #2188, draft) + the two UI fixes below. Run by Claude Code, on the Mac Studio, in the
in-app browser against a LOCAL next dev server (worktree) on a disposable loopback Postgres 16, with a loopback stand-in for the model API
(nothing left the machine). One fictional writer, one three-chapter fictional manuscript. Production untouched. Not a founder walk.

## Evidence class: BROWSER (real UI, real routes, real DB; scripted model). NOT model behaviour, NOT production.

## Walked
| Step | Result |
|---|---|
| Sign in through the real endpoint, open Develop, open the MAIA conversation | works; the new control shows "MAIA reads only the passage you are in" |
| Ask about "Return" while at "The Harbour", NO grant | MAIA was given only "The Harbour"; no permission; 0 receipts |
| Grant via the real button, then ask | **DEFECT (fixed)**: UI said MAIA may read, but the read was withheld because the writer's Sanctuary setting had never been stored on this device (fail-closed). The panel now says so |
| Reload (leave and return) | the grant survived; the conversation resumed |
| After "opening MAIA once" (setting stored), whole-book question in the resumed thread | MAIA was given all three chapters under permission; **3 receipts, standing_authorization, crossed** |
| Press Stop, ask again in the same thread | MAIA was given only "The Harbour"; permission absent (revocation effective mid-thread, from the UI) |
| Two conversations on the Work | **DEFECT (fixed)**: Send is blocked (`blocked:choosing`) with no stated reason. The panel now says: choose one or start a new one; Send waits |

## Not walked / unknown
- Sanctuary ON from the real UI toggle (covered at route level only, route walk W5/W5b).
- A real model answer, quote fidelity against real MAIA output, the founder's exact "Read this chapter" flow (the long wait and the lost-chapter handoff
  after a deliberate reading are NOT exercised; without a grant that handoff still delivers only the passage the writer is at).
- Interruption/recovery of a long request; no timeout exists on the reading request (code-read only).
- Mobile/narrow layouts, accessibility, multi-device.
- Shadow-schema gap: `members.must_reset_password` was added by hand; not a product claim.

## Corrections made
1. `ReadScopeControl`: when the grant is on but the Sanctuary setting is unreadable, say that only the passage is being read and how to fix it.
2. `WorkConversation` conversation chooser: state that Send waits until a conversation is chosen or a new one started.
