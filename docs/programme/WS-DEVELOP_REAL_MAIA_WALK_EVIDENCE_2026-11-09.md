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

## Sanctuary closure — fail closed (founder ruling 2026-11-09, "yes")
Rule: **a conversation turn or a reading is kept only when the request declared an ordinary posture.** A writer who has never saved settings declares ordinary (canon: Sanctuary is off by default). A posture that exists but cannot be read (storage blocked, corrupt, not a boolean) is **undeclared**, and an undeclared request keeps nothing.
- Client: one helper, `declaredSanctuaryPosture()` (`lib/sanctuary/currentClientPosture.ts`), used by every request to these routes (`askClient` ask, the developmental body protocol, `askLivingWork`, `developClient` readings, and the Work conversation).
- **Work conversation** (manuscript): Sanctuary or undeclared → answers in the moment, keeps nothing (no thread, no turn), fresh or continuing.
- **Living Work conversation** (before a manuscript): previously had no Sanctuary handling at all. Now the same: Sanctuary or undeclared keeps nothing; a non-boolean posture is malformed (400).
- **Structure and developmental conversations** (anchored to kept readings): refused **before any write** (`409 sanctuary_not_kept` / `posture_undeclared`), with the writer told why. Building a not-kept answer for these lanes is not done.
- **Readings** (incl. G4 *Read this chapter* and the old lens cards): refused before commissioning in Sanctuary or undeclared; MAIA is never called.
- Tests: real PostgreSQL 16 (production-derived baseline + 90 migrations, 0 errors), real routes, scripted model: four closure tests (Work undeclared fresh+continuing; structure+developmental refuse with no thread row; Living Work; readings), **each fails on the previous routes and passes now**; reading-carry suite 32/32. Client helper unit test (saved / none saved / unreadable / blocked / no storage). Readings route unit test 13/13. Type gate: no regressions. Wider suites: the failing set is **identical** with and without this change (31 suites, all inherited).

### What this does NOT close (owed, in order)
1. **The server trusts the browser's declaration.** `sanctuary: false` from the client is not independent proof of the member's current setting; Sanctuary posture lives only in the browser today. Making the server verify it needs a server-side record of posture — a design decision, not yet made.
2. **Storage-layer enforcement.** The thread store (`openThread` / `appendTurn` / the living-work variants) still accepts writes without a verified posture; the protection is at the three routes. Requiring a resolved posture at the store is the next step and touches every caller.
3. The shared resolver `TurnPosture.resolve()` still reads absence as ordinary; these routes no longer rely on it for the keep decision, but other MAIA routes do.
4. G4 isolation beyond start/switch: late responses after switching, recovery, reopening, Sanctuary→ordinary transitions — not yet tested. `writerCorrections` in Sanctuary not yet reconciled against the in-the-moment ruling.
5. Provider-off negative suite on one frozen SHA (contradictory posture, direct store bypass, cross-member, concurrency, failed writes/retries).

### Found while testing (not changed; reported)
- **G6 vs D5 conflict.** When a question names no chapter, G6 carries MAIA's latest readings of the whole book — including observations the writer marked *keep* or left *unresolved* — while D5's narrow rule says only *dismissed* observations reach her as her earlier words. It also carries readings that covered no chapter text. `ws-decision-continuity` D5 fails on this since G6 (also at the previous commit). Needs a founder ruling: does carrying her readings override D5, or must carried observations respect the writer's standing?
- **Inherited test failures:** `sanctuary-editorial` and `sanctuary-keep` matrices fail on canonical's own editorial routes (also with canonical's route file swapped in); `ws-delete` dynamic probes create members without `passkey`, which the production-derived baseline requires (fixture, not route).

### Account default for devices with no saved setting (founder ruling 2026-11-09, "yes")
Corrects a gap in the closure above: "no saved settings ⇒ ordinary" would have kept the conversations of a member whose **account default is Sanctuary** on any new device.
- The client now says `sanctuary: 'no_live_settings'` instead of `false`. The server (`lib/sanctuary/studioPosture.ts`, read-only, never creates a settings row) uses the member's account default it already holds (`member_settings.default_memory_mode`, the same one `SANCTUARY-DEFAULT-RESOLVE-01` treats as authoritative): `sanctuary` keeps nothing; anything else — including no row — is ordinary (the column's own default is `continuity`, so "never chose" and "chose Continuity" coincide). If the account default cannot be read, nothing is kept. A nested `meta.sanctuary` can only make it stricter.
- The live per-session switch (`true`/`false`) still wins for that session, as the member's own act on that device.
- Applies to the Work and Living Work conversations, the structure/developmental refusals and readings.
- Test (real PostgreSQL 16): account default Sanctuary → nothing kept (Living Work, Work, readings refused); turning Sanctuary off on the device → kept; Continuity → kept; no settings row → kept and no row created. **Fails on the previous routes, passes now.** Related suites 155/155; type gate clean.
- ⛔ Still not done here: verifying the per-session switch on the server needs session state and belongs to `SANCTUARY-INIT-GATE-01` (not built). Until then the server trusts the device's explicit `true`/`false`.

## Sanctuary across every Writer's Studio write (founder ruling 2026-11-09, third: "yes")
Rule: **Sanctuary blocks every write of something MAIA keeps or learns; it never blocks the writer's own manuscript work, and never a deletion.** Decisions and corrections count as MAIA-kept; a refused one leaves the writer's text where it was and says why.

**Store.** `KeepWitness` (`lib/sanctuary/studioPosture.ts`) is minted only from an explicit `false` or from an ordinary account default — never from absence. `openThread`, `openLivingWorkThread`, `appendTurn` and `appendTurnWithClient` refuse without one, before any SQL (forged object, `null`, `true`, missing: all refused; 26 unit tests with a statement-recording double). Every caller states its source: Ask (Work, structure, developmental), Living Work, review-discuss, and the editorial lane's member act and MAIA outcome (from the posture its route already requires).

**Routes (audit of 50 route files, classified by reading what each writes):** gated with `keepGate` (refuses before reading the Work; otherwise strips `sanctuary` so each route's own strict checks are unchanged): corrections to MAIA · writer understanding · settled decisions · plans (make, edit, step links) · chapter-review runs · structure reads and proposal reviews · themes · Focus crossings · readings · standings. Already gated: review-discuss, Keeps, the editorial turn.
- ⚠️ **Defect fixed:** plans and settled decisions were sent with a **hard-coded `sanctuary: false`** by all three callers (`KeepNotePrompt`, `SettledDecisions`, the Develop plan) — the server trusted it. Clients now declare the member's real posture; the browser-side checks in the two decision surfaces remain.
- ⚠️ **Defect fixed:** the Focus client sent no posture and the route used `TurnPosture.resolve(body)`, so every Focus crossing (which writes a disclosure receipt) was treated as ordinary. Now gated; in Sanctuary Focus says why and sends nothing.
- Not gated, by the rule: draft saves, checkpoints, sections, adopted structure, imports, renders, Work title/kind edits, materials, visuals, sources, editorial adoption/undo, and all deletions/withdrawals/revocations. The relationships route creates an empty container only; the editorial route that writes into it refuses Sanctuary.
- Tests (real PostgreSQL 16): every gated route, in Sanctuary, undeclared (absent, `'false'`, `0`, `null`, `'yes'`) and contradictory (`false` + `meta.sanctuary: true`), answers 409 with its reason and changes **no row** in any table it could write (counts scoped to the probe's member/manuscript; MAIA's model is wired to throw). **Fails on the previous routes, passes now.** Ordinary still passes every gate. DB suites 120/121 (the one failure is the G6/D5 conflict below); broad suites: failing set identical to before (31 inherited); type gate clean.

**Open — need a ruling (classification UNCLEAR):** Work-material "maybe / not now" considerations · declaring the Work's kind · granting MAIA reading permission (a consent record, not content) · Press collections (they group Keeps, which are Sanctuary-bound) · where-you-left-off markers. Left ungated pending a ruling.
**Conflict with the rule, not changed (other lane):** manuscript **import** (`manuscripts/ingest`) refuses Sanctuary via the `x-maia-sanctuary` header; under this rule imports are the writer's own work and should never be blocked.
**Still owed:** server-side verification of the per-session switch (`SANCTUARY-INIT-GATE-01`) · G4 isolation (late replies, switching mid-request, mode changes) · frozen-SHA negative suite (concurrency, failed writes, retries, cross-member) · G6/D5 ruling.
