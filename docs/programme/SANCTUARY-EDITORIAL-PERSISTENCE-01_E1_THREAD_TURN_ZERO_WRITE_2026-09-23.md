# SANCTUARY-EDITORIAL-PERSISTENCE-01 / E1 — Request-Scoped Thread + Turn Zero-Write Boundary

**Date**: 2026-09-23
**Act**: E1 (founder-authorized after C1C0 surfaced the gap)
**Against**: flagship candidate `6f19ff1b9` (C1C0) · canonical `b23ae2d7f` — unmoved
**E1 lineage**: suite → repair + witness → this record (SHAs in §8)
**Authority**: persistence boundary only. ⛔ No contextual MAIA mounted. ⛔ No production flag enabled. ⛔ Merge/deploy: NOT authorized. ⛔ STOPPED for founder adjudication.

---

## 0. Standing at the top

- **The gap was real on all three durable editorial POSTs, and it was reproduced first.** Against the unrepaired routes the E1 suite reported LIVE routes **2/9** and LIVE helpers **0/4**. One detail the census had not seen: the two thread-open routes could not even *receive* a posture — their closed body shapes refused the `sanctuary` key (`unknown field(s): sanctuary`).
- **Repaired as ruled.** Each POST requires an explicit boolean `sanctuary` before anything about the selection, section or act is examined; absence or any other shape is `400 posture_required · persisted:false`; Sanctuary is `409 sanctuary_unavailable · persisted:false`; the posture is minted from the whole body so a contradictory nested affirmative still fails closed. Ordinary paths are byte-for-byte the same calls with the same arguments.
- **Helpers now require posture** as an argument and never default it: unresolved → `posture_unresolved`, no network. **Every product caller reads posture at the gesture** with the S1 reader.
- **Matrix lethal + discriminating**: reference doubles 9/9 + 4/4; **fourteen candidates dead** (the founder's eleven, three of them with a client half), collateral classified; LIVE routes **9/9**, LIVE helpers **4/4**, static guards 4/4.
- **DB-backed witness 9/9** on a disposable full-schema shadow: every Sanctuary / missing / malformed open and turn produced **zero** new rows in `proposal_chains · ask_threads · ask_turns · editorial_turn_bindings`; the one ordinary open produced exactly one chain and one thread; GET stayed readable.
- **Gates**: editorial-runtime matrix lethal · editorial-reading matrix 15/15 · 218 neighbouring jest tests · S1 matrix 27/27 · ship typecheck 226 vs 239, 0 regressions · design-canon ✅ · `ci:sovereignty` ✅ · no-supabase ✅.

## 1. ⚠️ A population finding the authorization did not carry

The authorization names `RebuildStudioClient` as *the current non-test caller*. It is not the only one: the **Canvas** surface POSTs to both routes directly — `app/writers-studio/canvas/CanvasClient.tsx` (section open) and `app/writers-studio/canvas/EditorialConversation.tsx` (turn) — and neither carried Sanctuary awareness. Requiring posture on the routes would have fail-closed the Canvas conversation with a bare 400. The authorization's own law — *any product caller must read posture at the editorial gesture* — covers them, so both were included with the minimum gesture-time carriage and honest refusal copy, and the widening is disclosed here rather than left silent. ⛔ Neither surface was redesigned.

## 2. Changed-file population (exact)

| File | Change |
|---|---|
| `app/api/writers-studio/rebuild/editorial/thread/route.ts` | `sanctuary` admitted to the closed body; posture-first gate (boolean required → 400; `TurnPosture.resolve(body).sanctuary` → 409) before any field validation or open |
| `app/api/writers-studio/editorial/thread/route.ts` | same gate on POST; **GET untouched** |
| `app/api/writers-studio/editorial/turn/route.ts` | `parseClosed` requires the boolean (was `b.sanctuary === true`, absence ordinary); route maps to `400 posture_required · persisted:false`; existing 409 gains `persisted:false`; posture minted from the whole body |
| `lib/writersStudio/rebuild/editorialCollaboration.ts` | `openBoundEditorialThread(sectionId, posture)` · `openBoundEditorialPassage(sectionId, range, revision, posture)` · `sendBoundEditorialTurn(threadId, sectionId, text, posture, scope?)` — required `CurrentPostureRead`; unresolved never fetches; new outcome reasons `posture_unresolved` · `sanctuary_unavailable` |
| `app/writers-studio/rebuild/RebuildStudioClient.tsx` | `startNewEditorial` / `sendEditorial` read `readCurrentSanctuaryPosture()` at the gesture; two honest refusal sentences. ⛔ Not remounted, not redesigned |
| `app/writers-studio/canvas/CanvasClient.tsx` · `EditorialConversation.tsx` | gesture-time posture; unresolved posts nothing and says so; Sanctuary 409 no longer reported as *“Your words are saved”* (§1) |
| `lib/writersStudio/rebuild/__tests__/editorialCollaboration.test.ts` | one call updated for the required argument |
| `docs/design/contracts/writers-studio-rebuild.md` | `CanvasClient.tsx` named (it was covered by no contract; its sibling already was) |
| `tests/constitutional/writers-studio/sanctuary-editorial/{harness,laws,candidates,matrix.test}.ts` · `tests/__integration__/sanctuary-editorial/…` · `package.json` (`matrix:ws-sanctuary-editorial` · `witness:sanctuary-editorial`) | suite + witness |

⛔ Untouched: `lib/sanctuary/turnPosture.ts` · `lib/sanctuary/currentClientPosture.ts` · editorial stores · proposal-chain stores · schema · migrations · `machine.ts` · `WriteFrame` · flagship tabs · C1B host · authorship substrate · production.

## 3. Laws (`npm run matrix:ws-sanctuary-editorial`)

**Server** L1 passage-open Sanctuary → 409, zero lib calls · L2 passage-open missing + 8 malformed → 400 posture_required, zero calls · L3/L4 section-open likewise · L5/L6 turn likewise (before `persistMemberEditorialAct`) · L7 ordinary paths unchanged (same lib called once with the same arguments; turn persists then runs) · L8 GET readable with or without a Sanctuary hint · L9 refusals distinct (409 vs 400) and content-free.
**Caller** C1 posture read at each gesture (false→true→false on one caller) · C2 explicit boolean on every body, other fields intact · C3 no live key + account default present → never posts · C4 malformed / unavailable storage → never posts.
**Static** S1 no session/settings table in any route · S2 no `resolve({})` · S3 all three helpers take a required `CurrentPostureRead` · S4 every product gesture handler (`startNewEditorial` · `sendEditorial` · `openEditorialConversation` · `send`) reads posture inside the gesture, none at mount.

**Candidates — 14/14 DEAD on their named law, collateral classified (reason beside each in `candidates.ts`)**: D1 client-only guard (route half + client half) · D2 missing→ordinary · D3 passage opens then refuses · D4 section opens then refuses · D5 member turn persists then refuses · D6 session/account default substituted (route half + client half) · D7 string coercion (route half + client half) · D8 turn guarded, both opens writable · D9 passage guarded, section writable · D10 posture snapshotted at mount · D11 GET blocked.

## 4. DB-backed witness (`DATABASE_URL=<shadow> npm run witness:sanctuary-editorial`)

Real routes with the flag set **for the test process only** · real `resolveCanonicalIdentity` via `x-session-token` · real editorial runtime · real `pg` · counts before/after. Shadow: disposable PostgreSQL 16, 441 migrations applied / 56 refused (the same set every prior witness saw).

```
W-0  baseline chains=0 threads=0 turns=0 bindings=0
W-1  passage-open sanctuary:true              → 409 sanctuary_unavailable · all deltas 0
W-2  passage-open missing · 'false' · 0 · null → 400 posture_required   · all deltas 0
W-3  section-open sanctuary:true              → 409                     · all deltas 0
W-4  section-open missing · 'true' · 1        → 400                     · all deltas 0
W-5  passage-open sanctuary:false             → 200 · chains +1 · threads +1 · turns 0 · bindings 0
W-6  GET thread (with a Sanctuary hint)       → 200 · same threadId · targetSectionId = the section
W-7  turn sanctuary:true on that thread       → 409 persisted:false · turns 0 · bindings 0
W-8  turn missing · 'false' · 0               → 400 posture_required · turns 0 · bindings 0
9 passed · exit 0
```
⚠️ Teardown observation: `proposal_chains` refuses `DELETE` by trigger and holds the member row by foreign key, so the shadow retained one chain and one member row until it was destroyed. Recorded, ⛔ not repaired — chain immutability is that store's law, and the shadow is disposable. ⛔ No ordinary turn was sent (it needs a model); ordinary turn behaviour is covered by the editorial-runtime matrix and the 218 neighbouring tests, all green.

## 5. Instrument findings

1. **The thread routes' closed body shapes refused `sanctuary` outright** — a fact the C1C0 census read as *carries no posture* but which is stronger: no caller could have carried one. Admitted to both closed lists; the closed shape otherwise unchanged.
2. **A first repair script aborted on a blank line** its search string lacked, leaving the turn route untouched while the matrix reported the two thread routes green and the turn route red — the matrix said exactly which half was missing.
3. **A helper narrowing that TypeScript cannot see**: a shared refusal function did not narrow `CurrentPostureRead`, so the ship gate rose 226→229. Narrowed inline; back to 226.

## 6. Routed out (⛔ none repaired)

- **R-1** `/api/writers-studio/editorial/version` (member version) and `/adoption` are durable POSTs outside E1's named population; `version` accepts no posture. Same class, separate act.
- **R-2** `proposal_chains` deletion refusal + member FK — lawful for the store, noted for future witnesses' teardown.

## 7. What E1 does not establish

⛔ Not deployed · ⛔ the production standing of `WRITERS_STUDIO_EDITORIAL_ENABLED` remains unknown · ⛔ no contextual MAIA mounted · ⛔ no member-witnessed behaviour (E4-level).

## 8. Lineage and attestation

Commits in this act carry the lineage: suite with known-bad RED → repair + witness → record. Population exactly §2. Shadow and its rows destroyed after the run.
**Next act: founder adjudication of E1, then `FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — DISCUSS-ONLY CONTEXTUAL MAIA` with the three C1C0 rulings carried forward.** ⛔ E1 STOPS HERE.
