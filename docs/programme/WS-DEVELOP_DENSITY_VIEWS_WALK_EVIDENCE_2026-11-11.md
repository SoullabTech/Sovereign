# WS-DEVELOP density views — candidate walk evidence (2026-11-11)

**Tested source:** canonical `17e51546b0` (contains #2208 merge `92f69025` and #2215). **Evidence class:** browser walk on a local dev server (built-in browser pane), throwaway PostgreSQL 16 from `scripts/witness/ws-continuity-walk.sh` (pass 2: 492 clean, 53 refused), fictional writer `bwriter`, fictional novel *The Long Harbour*, stand-in model (nothing sent to a provider). **Not** authenticated real-model behaviour, **not** production. Viewport 800×600. A separate harness from 2026-11-09 (port 3111, worktree `ws-work-continuity-part-a`) was left running and untouched.

| # | Witness | Result | Observation |
|---|---|---|---|
| 1 | Default view is Quiet; labels Quiet / Balanced / All tools; control names the current view | PASS | `focused`; aria "View: Quiet…" |
| 2 | All tools opens tools beside the chapter, chapter stays readable | PASS | plan + starters below chapter; More hidden |
| 3 | Switching view keeps the unsent MAIA message and focus | PASS | draft and focus unchanged |
| 4 | View stored per writer | PASS (single account) | key `writers-studio:presentation:v1:<memberId>`; unscoped key absent |
| 5 | Reload restores the View | PASS | `full` after reload |
| 6 | Reopening Develop restores the chosen chapter | **FAIL** | chose Salt; reopening the Develop link opened The Harbour (chapter only survives via `&s=` in the URL) |
| 7 | Unsent message survives reload | **FAIL** (if required) | draft empty after reload |
| 8 | Lens route keeps the manuscript central | PASS | Structure lens: chapter in centre, "Your chapter, beside MAIA's structure reading" |
| 9 | Lens route keeps the View | PASS | All tools carried into the lens page |
| 10 | Lens route keeps the MAIA conversation and unsent message | **FAIL** | lens page has no message box; returning via "Back to the reading" restores the stage with the draft empty |
| 11 | Reading completion leaves chapter, scroll, selection, View and conversation alone | NOT TESTED | "Read this chapter with MAIA" made no request: the fictional writer had not granted MAIA permission to read saved work |
| 12 | Observation index / explicit observation entry; no auto-select of observation 1 | NOT TESTED | needs a completed reading (11) |
| 13 | Delayed reading cannot interrupt an active exchange | NOT TESTED | as 11 |
| 14 | Account switching cannot carry another writer's View or conversation | NOT TESTED in browser | harness has one fictional account; covered by unit tests only (`presentationScope.test.ts`) |
| 15 | Balanced differs from Quiet on the stage | NOT IMPLEMENTED | identical on the stage by design of #2208; recorded honestly, not a pass |

**Also seen:** a second, separate "View ▾" button in the top Studio bar beside Preferences (not the density control); two controls named View is a likely confusion, unexamined.

**Acceptance blockers (P0 still HOLD):** 6, 10 (and 7 if unsent work must survive reload) are failures; 11–14 need a run with read permission granted and a second fictional account. No merge, deploy or release implied.

## Repairs (same day, branch `feature/ws-develop-keep-place-20261111`)
- **#6 reopening Develop forgets the chapter → REPAIRED, re-walked PASS.** `lib/writersStudio/developPlace.ts`: last chosen chapter remembered per writer and per manuscript in this browser; the address still wins; a deleted chapter falls back to the first; no writer → nothing stored; observation focus deliberately not remembered. Re-walk on the same harness: chose Salt, reopened the plain Develop link → opened on Salt. Unit tests 7/7 (incl. a second writer on the same browser). Controller suites 209/210; the one failure (`houseStudioH1Access` "House emits explicit H1 addresses…") fails identically on canonical.
- **#10 lens page drops the MAIA conversation and unsent message → NOT repaired here.** Draft PR #2218 (relational architecture step 3, stacked on #2217/#2216) already changes exactly this ("lens beside the chapter; conversation never re-created"). Repairing it separately would collide; re-walk #10 on #2218's candidate.
- **#7 CORRECTED — not a witnessed loss.** `WorkConversation` already guards unsent text: while the writer has typed text it registers a `beforeunload` warning ("Leave and discard?"), by a deliberate rule (`0829f54eb8`, 2026-10-30; restated `3620c7eed1`): *unsent text stays in the mounted conversation; leaving is an explicit discard; neither browser storage nor a server turn is created for it.* The walk's automated reload almost certainly passed that prompt without a person seeing it, so the table's FAIL for #7 overstated the evidence: real-person behaviour on reload is NOT TESTED. Founder said "yes, keep it" (survive reload); that collides with the rule above (and with Sanctuary: unsent text written to browser storage would persist Sanctuary words) — held for a founder ruling, not built.
