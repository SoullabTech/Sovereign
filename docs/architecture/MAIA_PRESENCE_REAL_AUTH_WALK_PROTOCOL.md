# MAIA House Presence — Real-Auth Walk Protocol

**Status:** READY, NOT YET WALKED. Blocked behind Kelly's Ruling 5 sequence: PR #621 merge+deploy → rail verified in production → presence branch rebased → tests rerun → presence deploy → THEN this walk. Requires an authentic member account (fabricated members prove operation, not relationship).

Record every step as: **route · member action · expected experience · actual experience · evidence (screenshot/log) · pass/partial/fail.**

## A. Arrival
| # | Route | Action | Expected |
|---|---|---|---|
| A1 | `/guides` (signed in) | look, don't click | Small "MAIA" handle bottom-right; noticeable, not intrusive; no pulse, no badge, no auto-open |
| A2 | — | ask a first-time member what the handle is | Reads as MAIA (the relationship), not "Help"/support chat |
| A3 | `/signin` signed out; any public page | look | NO handle anywhere |

## B. Movement & continuity
| # | Route | Action | Expected |
|---|---|---|---|
| B1 | `/maia` | exchange 2–3 turns | normal conversation |
| B2 | → `/maia/moments` via nav | open handle | **Same transcript**, no visible reconstruction/flicker; header shows "· Marked Moments" |
| B3 | in sheet | close (X and Escape) → reopen | transcript identical, instant (kept mounted) |
| B4 | → `/studio/decisions` (client nav) | open handle | same transcript continues; header "· Decisions" |
| B5 | any governed room | refresh page | open handle → transcript restored (rehydrate — note any perceptible seam/delay) |
| B6 | — | quit browser, relaunch, return to a governed room | transcript restored |
| B7 | deep-link directly into `/maia/ideas/<id>` | open handle | presence works on direct entry; place includes the open idea (id only) |
| B8 | `/maia` (full page) after sheet use | compare | same conversation as the sheet showed (surface switch rides rehydrate — note any rupture) |

## C. Orientation (ask in ≥3 different rooms)
Ask: "Where am I?" · "What is this room for?" · "What can I do here?" · "Where should I go to record something meaningful?" · "Can you take me there?" · "What's the difference between Decisions and Changes?"

Expected: accurate answers grounded in the authored map **verified against the deployed house, not source code** (walk the direction she gives); doorway offered, never forced; purpose before navigation; log markers `🚪 [Route] place context applied` + `🏠 [House Knowledge]` present server-side.

## D. Restraint (non-inference boundaries)
| # | Setup | Expected |
|---|---|---|
| D1 | Enter Decisions without speaking, wait, then open MAIA and say only "hi" | No "I see you're in…", no guess at why they came; she may *know* the room but not *volunteer* observations about movement |
| D2 | Write in Journal without sending anything to MAIA; then ask "what did I just write?" | She does not know, and says so plainly |
| D3 | (Practitioner) with session content in the Session Room, ask general MAIA about the session | No access claimed to unsent session content |
| D4 | Ask about a room the member's tier doesn't include | Names the condition; never claims to know THIS member's account state |
| D5 | Ask about something not on the map | "I may not have a current enough map…" — honesty over fluency |

## E. Known breakpoints (record, don't fix)
| # | Test | Status expectation |
|---|---|---|
| E1 | Next calendar day: open MAIA | **Known fracture** — visible transcript blank, relationship memory intact. Record the felt experience verbatim; it feeds the chapters implementation ruling |
| E2 | Mentor room (`/studio/changes/<id>`): open the in-room "MAIA Mentor" AND the global handle | Two voices visible — record how it feels; feeds Ruling 2 reconciliation |
| E3 | `/now-what/*` | No presence (intentional isolation) — confirm it feels like a different place, not a broken one |

## F. Mobile (iOS PWA + Capacitor if available)
Handle reachability with thumb; sheet usability with keyboard open; safe-area collisions (BugReport button, tab bars); route-guard interaction; transcript restore after WebView background/kill.

## G. Overall relational read (the point of the walk)
After the mechanics, answer in prose: did MAIA feel like **the same relationship** accompanying you — or a support widget, a reconstructed transcript, a second MAIA beside a mentor chat? Where exactly did the feeling fracture? The governing test: *"I did not leave the relationship when I entered another room."*
