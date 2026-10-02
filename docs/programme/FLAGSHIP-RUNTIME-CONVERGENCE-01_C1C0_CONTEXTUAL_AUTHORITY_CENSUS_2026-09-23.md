# FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C0 — Contextual MAIA + Editorial Authority Census

**Date**: 2026-09-23
**Act**: C1C0 — read-only census before any contextual capability is mounted into the live Write host
**Against**: accepted flagship candidate `5e91b5cb5` (C1B) · canonical `b23ae2d7f`
**Source changes**: none. One documentary record (this file).
**Evidence labels**: VIS = read directly from source · ENT = entailed from read source · UNK = not established

---

## 0. Standing at the top

- **Every contextual capability the legacy host has is reachable through exactly two server seams**, both founder-gated and 404-off-by-default: `/api/writers-studio/focus` (one crossing, one receipt, one canonical MAIA turn; response not durable as a Work object) and the editorial family (`/thread` · `/rebuild/editorial/thread` · `/turn` · `/version` · `/adoption` · `/undo` · `/relationships`; durable, locus-bound, version-checked). Nothing in `RebuildStudioClient` is an authority in its own right: it is presentation plus **51 state atoms** that shadow those seams.
- **The live host already holds the exact identity the editorial seam wants** (`HeldPassageAt` = draft section id + code-point range; `writing.currentRevisionId()` = the draft version the seam checks). ⭐ No new held-passage owner is needed for a first contextual act.
- **The smallest lawful C1C1 is a Discuss-only vertical slice on the editorial thread seam**, not on `/focus`: the editorial seam binds the response to manuscript · draft · base version · section · exact expected text · thread id, durably; `/focus` binds only a crossing receipt to a scope and leaves the response unbound to any locus. §7 states it exactly.
- **Only one flagship tab is lawful today**: `Discuss`. `Revise` has substrate but needs a proposal→alternatives bridge that does not exist. `Reason` and `Teach` reuse the same seam only as further *conversation turns* (no admitted observation object exists on a passage held from Write). `What MAIA read` has no member-facing coverage on either seam.
- ⛔ Nothing here is mounted. ⛔ No state was copied between owners. Unknowns are recorded as unknowns.

## 1. The current-state authority map

Column key: **gesture** · **state owner today** (legacy host unless stated) · **request identity** · **endpoint** · **scope/locus carried** · **version carried** · **response identity** · **durable object** · **mutation authority** · **recovery/undo** · **flagship target**.

| Member act | Gesture | State owner today | Request identity | Endpoint | Locus carried | Version carried | Response identity | Durable object | Mutation authority | Undo / recovery | Flagship target |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Hold a passage** | select text in `RebuildAuthoredBody` | legacy `selectedPassage` {draftSectionId,start,end,text,revisionNumber}; **live host `HeldPassageAt`** (C1B) | none (client) | none | section + code-point range | `writing.currentRevisionId()` at hold | — | none | none | — | `passage-held` phase; MaiaPanel `heldEcho` |
| **Ask MAIA about the passage** (legacy Ask/Interpret/Explore tabs) | type + `Ask MAIA` | `maiaAsk` · `maiaBusy` · `maiaResponse` · `sessionIdRef` | server-minted `requestId` + `disclosureId`; client `sessionId` (`writers-studio-rebuild-<uuid>`) | `POST /api/writers-studio/focus` (`WRITERS_STUDIO_FOCUS_ENABLED`) | `workRef` (living work id) · `scopeKind` passage/section/whole_work · `sectionRef` = **Source section id** · `range` | ⛔ **none** — `focusRequest` drops `revisionNumber`; the receipt carries no version | `{state,message,actions,response}`; response is a bare string | `context_disclosure_receipts` (the crossing) + `runtime_consent_state`; the **response** enters only the general canonical session exchange stream, keyed by sessionId/exchangeId, ⛔ **not by section/range/version** | none (read-only crossing) | none | `conversation` phase (Discuss) — ⚠️ only if a locus-bound response is acceptable; see §7 |
| **Continue the conversation** (editorial) | type in RevisionDesk `Discuss this passage` | `editorialThread` · `editorialDraft` · `editorialBusy` · `lastEditorialInstruction` | server-minted `exchangeId` per turn; thread id | `POST /api/writers-studio/editorial/turn` (`WRITERS_STUDIO_EDITORIAL_ENABLED`) | thread → `proposal_chains.locus` {workId, draftId, baseVersion, targetSectionId, expectedText} | `baseVersion` = `revision_count` at open; selection open checks `draft_version === revisionNumber` else `selection_stale` | `{threadId, memberTurnIndex, version?, voice?}` | `ask_threads` · `ask_turns` (member + MAIA) · `editorial_turn_bindings` · `proposal_chains` · versions | none on the Work (proposal only) | thread is append-only; undo n/a | `conversation` phase (Discuss) · `reasoning` (Reason) · `teaching` (Teach) as further turns |
| **Request editorial alternatives** (legacy Suggest) | same seam; MAIA may `reply_with_proposal` | `suggestedVersionId` · `showChanges` · `voiceNotice` · `selectedEdits` | as above | as above (+ `scope` latitude) | as above | as above | `version.id` (a proposal version in the chain) | `RebuildEditorialVersion` rows (author maia/member, supersedes, rationale) | none | — | `alternatives` phase — ⚠️ **one proposal per turn, a chain over time; ⛔ not a peer set of N** (§4) |
| **Read an alternative in context** | `Show changes` / marked page | `inlinePreview` · `ManuscriptPassage` diff | client-only (`editorialSegments`) | none | locusText vs version wording | — | — | none | none | — | `context-review` phase (`fs-del`/`fs-ins`) |
| **Apply a selected revision** | `Use this revision` / `Use all of these changes` | `adoptionBusy` · `adoptionOutcome` · `appliedVersionId` · `writingEpoch` | thread id + version id | `POST /api/writers-studio/editorial/adoption` | chain locus (expectedText re-located) | `stale_base` → `work_moved` refusal; `expected_text_absent/ambiguous` → `work_moved` | `AdoptionOutcome` kind applied · work_moved · system_refusal · legacy_locus · protected_quotation · relationship_refusal + `resultingVersion` | `manuscript_revision_authorizations` + `manuscript_application_recovery` (snapshot) + new draft version | ⭐ **the one Work mutation on this seam**, executed server-side; client then `refreshContext()` + `writingEpoch++` (remounts the boundary) | `undo` below | `applied` phase + receipt |
| **Partial composition** (a subset of marks) | `Use selected changes` | `selectedEdits` · `composition` | thread id | `POST /api/writers-studio/editorial/version` (member version) → then adoption | thread | 409 if the thread gained a version | `versionId` | member-authored version | none until adopted | — | ⛔ no flagship analogue (alternatives are whole) |
| **Undo** | `Undo` | `undoMessage` · `writingEpoch` | `authorizationId` | `POST /api/writers-studio/editorial/undo` | application row | refused `work_moved` unless `current_version === resulting_version` | `{kind:'undone', resultingVersion}` or refused reason | `manuscript_application_recovery.undone_at` + new version | server-side restore from snapshot | ⭐ exact-or-stop (C8) is **server law** | `undone` phase; receipt `Undo` |
| **Version / history receipt** | `View history` | none durable in host; `thread.versions` | thread id | `GET /api/writers-studio/editorial/thread` | thread | — | thread view | `working_draft_revisions` (Keep-a-version) + chain versions | none | — | `VersionHistoryDrawer` (`overlay.history`) — ⚠️ flagship expects `{when,time,what,current}`; no adapter exists |
| **Reasoning / explanation** (legacy `challenge` action) | click a mark → `Why did you change…` | `sendEditorial(ask)` | new turn | `/editorial/turn` | thread | — | a MAIA turn | `ask_turns` | none | — | `reasoning` phase — ⚠️ flagship expects `Reasoning{text,limits}` with permanent non-conclusions; the turn returns prose only |
| **Teaching** (legacy `learn` action) | click a mark → `What writing technique…` | `sendEditorial(ask)` | new turn | `/editorial/turn` | thread | — | a MAIA turn | `ask_turns` | none | — | `teaching` phase — ⚠️ flagship expects `Teaching{text,drawnFrom}`; the turn returns prose only |
| **Chapter / section reading** | `Review this chapter` | `review` · `reviewPhase` · `reviewProgress` · manifest | commission per lens | `runChapterReview` → `requestDevelopmentalReading` per lens; manifest at `/api/sovereign/manuscripts/[id]/chapter-reviews` | chapter section ids | `draftRevision` in manifest; `reviewNeedsRefresh` on drift | `developmental_readings` ids | frozen readings (immutable) + manifest | none | — | Review room (`overlay.review`) — ⛔ **out of C1C scope** |
| **Arrival from a finding** | `insightReading`+`insightObservation`+`s` params | `arrivalInsight` · `workspaceInsight` · `workspaceReturn` | reading id + observation key | `loadCanvasInsight` (reads a frozen reading) | passage refs from the observation | reading's revision digest | `CanvasInsight` | frozen reading | none; may `reviseInsightPassage` → hold | `returnToStartingPassage` (client scroll/address restore) | `ARRIVE_AT_PASSAGE` + `trail` — ⚠️ the trail object (`from,index,total,backLabel`) has **no legacy owner** |
| **Listen** | `♫ Listen to MAIA` | `MaiaListen` local | — | `/api/voice/openai-tts` | — | — | audio | none | — | — | ⛔ not in the flagship reference; ⚠️ route name carries a vendor token (provider-governance question, outside C1C) |

## 2. Vocabulary reconciliation — ⛔ not by word similarity

| Legacy | What it actually does (VIS) | Flagship | Verdict |
|---|---|---|---|
| **Ask** | `/focus` with `gesture:'ask_maia'`; the tab changes only the composer placeholder | `Discuss` | **same capability under different copy — but on a different seam** (§7 decides which seam Discuss should use) |
| **Interpret** | identical request to Ask; placeholder *“What do you notice here?”* | `Discuss` | **legacy-only copy distinction**; no separate capability |
| **Explore** | identical request to Ask; placeholder *“Explore this with me…”* | `Discuss` | **legacy-only copy distinction**; no separate capability |
| **Suggest** | the editorial desk: open/resume a thread, `discourse` turns, one proposal per turn, marks, member version, adopt, undo | `Revise` | **same capability family, different shape**: legacy = one proposal at a time on a chain; flagship = a peer set of N alternatives (`AlternativeSet`, unranked). ⚠️ The peer set has **no substrate**: nothing returns N proposals for one ask |
| **chapter / passage MAIA modes** | `maiaMode` toggles review scope vs passage focus | — | **legacy-only interaction machinery**; the flagship has no mode, it has phases |
| accept · keep · change · challenge · learn (per-mark actions) | selection of existing marks (no call), open the draft, or a new `/turn` with a fixed ask | `Reason` (challenge) · `Teach` (learn) | **same seam, fixed prompts**; ⚠️ flagship types `Reasoning.limits` / `Teaching.drawnFrom` are not produced by the seam |
| — | — | `What MAIA read` | **currently without substrate on the passage seam**: `coverage.display` is `partial`; the editorial seam records `locusText`, not coverage; `/focus` records a receipt, not what was read |

## 3. Duplicate-state-owner census (the C0 list)

| Concept | Legacy owner | Flagship-machine owner | Durable / server owner | Must survive into the live runtime |
|---|---|---|---|---|
| **held passage** | `selectedPassage` (+ `revisionNumber`) | `Phase.passage: PassageRef {sectionId, codePointStart, codePointEnd}` | none until a thread opens; then `proposal_chains.locus.expectedText` | ⭐ **the C1B host's `HeldPassageAt`** — it already carries section + code points; `revisionNumber` is read from `writing.currentRevisionId()` at the gesture. ⛔ The machine's `PassageRef` must be *derived* from it, never a second store |
| **conversation** | `editorialThread` (+ `maiaResponse` for /focus, a lone string) | `Phase.observation` + tabs | `ask_threads` / `ask_turns` (editorial only) | **the server thread**; the host holds only `threadId` + a fetched view. ⛔ `/focus`'s `maiaResponse` string has no durable owner and no locus — it must not become the conversation |
| **proposal / revision** | `suggestedVersionId` · `showChanges` · `voiceNotice` · `inlinePreview` | `AlternativeSet.items[]` | chain versions | **the chain**; presentation derives from `thread.versions` |
| **selected alternative** | `suggestedVersionId` (which version is “current”) | `Phase.selected` | `headVersionId` | ⚠️ two meanings: legacy “version in view” vs flagship “chosen to read in context”. ⛔ Not the same; must not be collapsed |
| **applied revision** | `appliedVersionId` · `adoptionOutcome` | `RevisionEvent {alternativeId, alternativeName, …}` | `manuscript_revision_authorizations` + `thread.application` | **the application row** (`thread.application` after reread) |
| **history / undo** | `undoMessage`; `thread.application.canUndo` | `StudioState.history[]` · `version` | `manuscript_application_recovery` · `working_draft_revisions` | **server**; `canUndo` is computed there (`current_version === resulting_version`) |
| **trail / arrival** | `arrivalInsight` · `workspaceReturn` (scroll + address) | `Trail {from,index,total,backLabel}` | frozen reading + URL params | ⚠️ **no durable owner for the trail set**; arrival exists, the set does not. ⛔ Out of C1C1 |
| **MAIA tab** | `passageTab` (ask/interpret/suggest/explore) | `MaiaTab` (Discuss/Revise/Teach/Reason/What MAIA read) — a *filter*, not a phase | none | **host presentation state only**; ⛔ never a request parameter |
| **reading state** | `review*` (chapter) · `arrivalInsight` | `Freshness` · `LensAvailability` | `developmental_readings` + manifest | ⛔ out of C1C scope (Review/Develop) |

⛔ **Not solved by copying**: the legacy `selectedPassage`, `editorialThread`, `suggestedVersionId` triple is the legacy host's *cache* of server truth. The live host should hold **identity only** (`HeldPassageAt`, `threadId`) and render from a fetched thread view, exactly as `readBoundEditorialThread` already forces (locus check on every read).

## 4. Flagship-tab capability map

| Tab | Backing capability today | Identity semantics verified? | Lawful for the first live act? |
|---|---|---|---|
| **Discuss** | editorial `discourse` turn on a passage-opened thread (durable, locus-bound) | ✅ thread → chain locus → section + expected text + base version; turn `exchangeId` server-minted | **YES** (the only one) |
| **Revise** | one `reply_with_proposal` per turn, adopt/undo server-side | ✅ for a single proposal · ⛔ **no peer-set substrate**; `Phase.alternatives` requires N candidates | ⛔ not yet — needs a ratified bridge (one proposal ⇒ a set of one? or N turns ⇒ a set?) — **founder question** |
| **Reason** | a further turn with a fixed *why* ask | ⚠️ returns prose; `Reasoning.limits` (permanent non-conclusions) is a flagship type the seam does not populate | ⛔ not as `reasoning` phase; lawful only as *another Discuss turn* |
| **Teach** | a further turn with a fixed *technique* ask | ⚠️ same; `Teaching.drawnFrom` not produced; FACETS-01 §X *describes-not-prescribes* is UNKNOWN — REQUIRES HUMAN WITNESS | ⛔ not as `teaching` phase |
| **What MAIA read** | none on the passage seam (`coverage.display` partial; receipts record scope, not coverage) | — | ⛔ absent |

A convincing dead tab is forbidden: the first live MaiaPanel must render **one tab**.

## 5. Failure / concurrency map — what actually proves each law today

| Ratified law | Editorial seam | `/focus` seam | Legacy host presentation | Proof that exists |
|---|---|---|---|---|
| **late response stays at original locus** (C4) | thread id is bound to a section; `readBoundEditorialThread(threadId, visibleSection)` refuses `locus_mismatch` on every read | ⛔ response is a bare string; `maiaResponse` is set whenever the promise resolves — **a late `/focus` answer lands on whatever section is now focused** (VIS: single `setMaiaResponse`, no locus check) | `bindEditorialThread` re-checks `targetSectionId === focusId` | editorial: `threadMatchesVisibleSection` + `locus_mismatch` (VIS) · focus: **none** |
| **changed passage does not silently receive a stale answer** (C3) | open-at-selection refuses `selection_stale` (draft version ≠ revisionNumber); adoption refuses `work_moved` (stale_base / expected text moved) | ⛔ no version in the request; the receipt carries scope only | `settleWriting()` before every act (flush + wait ≤5 s, refuse on conflict/error) | editorial: `thread.ts:131-133`, `adoption.ts:215-217` (VIS) · focus: **none** |
| **duplicate click does not duplicate acts** (C5) | `exchangeId` server-minted per turn; adoption is an authorization row | `disclosureId` new per act (⛔ replay of a prior id refused) | `editorialBusy` / `maiaBusy` / `adoptionBusy` guards | client guards only + server per-act ids; ⛔ no idempotency key on `/turn` (a double POST = two member turns) — **UNK whether the seam dedupes** |
| **partial response is not admitted as complete** (C6) | structured outcome admitted whole or refused (`structured_refused`) | `handoff` awaited before confirm; generation awaited after | n/a | `turn.ts` admission · `focusCrossing.ts` H1 (VIS) |
| **stale proposal cannot overwrite current authorship** (C3/C7) | adoption re-locates `expectedText` against the current body; `stale_base` → `work_moved` | n/a | `writingEpoch++` remounts the boundary after apply | `adoption.ts` (VIS) |
| **dismissal ≠ cancellation unless implemented** (C11) | no cancel exists; a turn in flight completes and persists | a crossing in flight completes; receipt stays `attempted`/`crossed` | `closeWorkspace` refuses while busy; nothing aborts a request | ⚠️ **there is no cancel anywhere** — dismissal must be presented as *hide*, never *stop* |
| **failure returns to the Work** (C13) | every refusal is a sentence + the manuscript unchanged | `did_not_cross` / `prior_unresolved` states with `continue_without_focus` | inline messages; manuscript untouched | copy exists; ⛔ no mechanical proof in the legacy host |
| **executed scope is the agreed scope** (C15) | `scope` latitude sent with the turn; server holds it (409 with counts) | `scopeKind` is the receipt's scope; ⛔ no scope substitution on refusal | scope label rendered before the act | `focusCrossing.ts` C4 comment + `turn.ts` scope gate (VIS) |

## 6. The ten critical questions

1. **Can the host open contextual MAIA from `HeldPassageAt` without another owner?** **Yes.** `openBoundEditorialPassage(sectionId, {start,end}, writing.currentRevisionId())` takes exactly what the host holds. The machine's `PassageRef` is a derivation, not a store.
2. **Which seam is the lawful first conversation act?** **The editorial thread seam** (`/rebuild/editorial/thread` at selection → `/turn` with `act:'discourse'`). ⛔ Not `/focus`: its response is unbound to locus and version, which breaks C3/C4 by construction for a passage conversation. ⛔ Not embedded MAIA (no Work boundary).
3. **Which identity binds a response?** Editorial: `threadId` → `proposal_chains.locus{workId, draftId, baseVersion, targetSectionId, expectedText}` + `ask_turns.turn_index` + server `exchangeId`. ⛔ The **code-point range is consumed at open** (projected to `expectedText`) and not stored as a range; re-location is by exact text (`locateUniquePassage`, must be unique). Focus: `requestId` + `disclosureId` + scope; ⛔ no version, no thread.
4. **Writer edits the held passage while MAIA responds?** Editorial: the turn completes against the thread's frozen `expectedText`; nothing mutates. Any later *adoption* re-locates the text and refuses `work_moved` if it moved. ⚠️ The **conversation display** must re-check that `locusText` still occurs uniquely in the live body before drawing a held highlight (legacy does this via `selectionFromThread`); otherwise the answer is shown against words that no longer exist. Focus: **unprotected**.
5. **Writer moves to another section before the response arrives?** Editorial: `readBoundEditorialThread(threadId, newSection)` returns `locus_mismatch` — the answer cannot attach to the new section (VIS). ⚠️ The host must **keep the thread id keyed to its section** and not render it elsewhere. Focus: **the answer lands wherever `maiaResponse` renders** (defect in the legacy host; ⛔ must not be reproduced).
6. **Can `MaiaPanel` render without owning request state?** **Yes.** It takes `phase · copy · tab · heldEcho` and emits `data-event` only; request state stays in the host. ⚠️ `MaiaCopy.opening` is required: for Discuss it is the last MAIA turn's body; before the first turn there is no truthful `opening` — the panel needs an honest *no turn yet* state or the host must not open it until a turn exists.
7. **Does the editorial thread suffice for `Revise`, or is a bridge required?** **A bridge is required**: `Phase.alternatives` needs an `AlternativeSet` (N peers, unranked, each `text|null` with `rationale`); the seam yields one proposal per turn on a chain with `supersedes`. Mapping N chain versions to a peer set is a **semantic decision** (are superseded versions peers?) — founder question.
8. **Which tabs are lawful today?** `Discuss` only (§4).
9. **Is `What MAIA read` backed on this seam?** **No.** Neither seam records coverage of a passage conversation.
10. **Can `Teach` / `Reason` reuse admitted content without commissioning?** **Only as further conversation turns** (no new reading; the seam does not commission). ⛔ They cannot populate `Reasoning`/`Teaching` typed objects, so the `reasoning`/`teaching` phases must not be entered; and §16 *Teach me does not create a new observation* is satisfied trivially because no observation object exists on this path.

## 7. Smallest lawful next act — **C1C1 proposal**

```text
existing HeldPassageAt (C1B host)
        ↓  one explicit gesture: “Ask MAIA about this passage” (a host-supplied WriteFrame action)
        ↓  openBoundEditorialPassage(sectionId, {start,end}, writing.currentRevisionId())
             refusals surface verbatim: selection_stale · selection_ambiguous · unavailable
        ↓  ONE `discourse` turn on /api/writers-studio/editorial/turn (scope: most protective; mayProposeImmediately=false)
        ↓  readBoundEditorialThread(threadId, heldSectionId) → render the last MAIA turn in MaiaPanel, tab = Discuss ONLY
             the panel’s heldEcho and highlight are drawn ONLY if locusText still occurs uniquely in the live body
        ↓  dismiss = RELEASE (hide; ⛔ never called “cancel”); the thread persists server-side
        ↓  writer remains in the Work: no scroll, no focus change, manuscript column unmoved (C1B W-4 law reused)
```

**Owners in C1C1**: host = `HeldPassageAt` · `threadId` · a fetched thread view · busy flag. Server = everything durable. Machine = phase derived (`passage-held` → `conversation`) from those two facts; ⛔ no `StudioState` store of its own for passage or observation. **Out**: alternatives, apply, undo, history, Reason/Teach phases, What MAIA read, chapter review, arrival trail, Develop, Review.

**Preconditions to name before authorization**: (a) `WRITERS_STUDIO_EDITORIAL_ENABLED` standing in production is **UNK from the repository** (declared in no compose/env file; enabled only in witness procedures) — the live act must 404 honestly and offer nothing when the flag is absent; (b) `MaiaCopy.opening` must be allowed to be *the last MAIA turn* rather than an *observation opening* — a small presentation ruling, not a substrate change; (c) the `observation`-typed `conversation` phase in `machine.ts` requires an `Observation` object that a passage conversation does not have — C1C1 either derives phase without the machine or the founder rules that a Discuss-only conversation may enter `conversation` with the held passage as its sole content. ⛔ Not decided here.

**Defeat candidates C1C1 must kill**: response rendered on a section other than the thread's (C4) · answer shown after the held text no longer occurs (C3) · `/focus` used as the Discuss seam (unbound response) · second held-passage store (a `PassageRef` written independently of `HeldPassageAt`) · a second tab drawn · dismiss labelled as cancel · a proposal turn (`mayProposeImmediately`) slipped into Discuss.

## 8. Routed out (⛔ no lane, ⛔ none repaired)

- **R-1** Legacy `/focus` answers are unbound to locus/version and land on the current section (`setMaiaResponse` has no locus check). The live host must not reproduce it; a repair of the legacy host is outside C1C.
- **R-2** No cancellation exists on either seam; every “dismiss” in the product is a hide.
- **R-3** `MaiaListen` calls `/api/voice/openai-tts` — a route name carrying a vendor token on a sovereign voice path; provider-governance question, not C1C's.
- **R-4** The editorial `/turn` has no idempotency key; a double POST is two member turns (client `busy` guard only).

## 9. Attestation

- source changes: none · schema: none · migrations: none · production: untouched · legacy capability: untouched
- **Next act: founder authorization of C1C1** as proposed in §7, or a ruling on its three named preconditions. ⛔ C1C0 STOPS HERE.
