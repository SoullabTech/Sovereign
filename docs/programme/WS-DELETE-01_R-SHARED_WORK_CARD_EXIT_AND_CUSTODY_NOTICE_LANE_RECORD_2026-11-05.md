# WS-DELETE-01 · R-SHARED — Work-card Delete: the shared-writing exit and the custody notice (lane record)

## 0. Lane preamble (manual §27)

```
Class:                 A (an irreversible member act, deletion consent copy, and what the member is told about what survives)
Governing authority:   WS-DELETE-01 founder ruling 2026-09-07 (docs/programme/WS-DELETE-01_TOTAL_ERASURE_RULING_2026-09-07.md): Delete means deletion;
                       a manuscript declared by more than one Work is REFUSED, never destroyed ("a future ruling may narrow this; until then the refusal never
                       destroys"); no detached state; no optimistic success. WORK-SHELF-01 founder ruling 2026-09-08, as recorded in the header of
                       lib/writersStudio/deleteWork.ts: "Remove Work, keep writing" is a DIFFERENT act, never a softening of Delete, and its label may not outrun
                       the act. Founder production report 2026-11-05 (browser console and screenshot) and the instruction "If we need to Jarvis flow then do it".
                       That instruction authorizes building and evidencing a candidate. It does NOT authorize a PR, a merge or a deploy.
                       FOUNDER HOLD, 2026-11-05, after the candidate existed: "dont deploy! we test it locally first." Deploy is closed. Local testing by the
                       founder precedes any PR. Nothing in this lane has been pushed to a deploy path, and none ever is by this lane.
                       FOUNDER INSTRUCTION, 2026-11-05, after the first review: "I want a full review here! No more half measures and kicking the can down the
                       road." That is the authority for the widening recorded in the amendment below; it is NOT a ruling on the questions section 6.4 returns upward.
Current gate:          One gate: when the live Home Work card's Delete is refused because the writing is shared, or succeeds but custody is unconfirmed, does the
                       member get a true sentence and a lawful way forward, without the refusal rule or the erase mechanism changing?
Evidence subject:      local branch claude/ws-delete-shared-and-custody-notice-20261105 on canonical commit:`dcdffad2`. Evidence about code under jsdom, hermetic
                       jest, and a disposable local PostgreSQL 16 holding fictional rows. Nothing about production, a real browser, real R20/KMS or real vault bytes.
Stop boundary:         ORIGINAL (kept for the record): this lane may not change the server's shared-writing refusal (eraseManuscript.ts), what Delete erases,
                       or Delete's own copy; may not deploy, migrate, read production, touch AWS, Caddy, compose or the release authority; may not rewrite the lane
                       that shipped the Work-card Delete (#2111) beyond the two named deficits; may not open a PR or merge without the founder's explicit ask. The
                       frozen branch claude/happy-cannon-17pn9x is untouched.
                       AMENDED 2026-11-05: see "Amendment" below. Deploy, migration, production, AWS/Caddy/compose/release authority, PR and merge stay closed.
```

**Order of events, stated as it was.** The build came before this preamble. The founder reported the failure; I diagnosed it from the console and the code, built the candidate and its tests, started
an independent review, and only then, on "if we need to Jarvis flow then do it", opened the lane properly. Manual §27 asks for the preamble before any action. It is written now and says so.
(The same lateness is recorded for H1 in `WRITER-SOURCE-INTAKE-LIFT_H1_HARDENING_LANE_RECORD_2026-11-03.md` section 0.)

### Amendment — the stop boundary was crossed, on purpose, and here is exactly where

The original charter said not to touch `eraseManuscript.ts`, what Delete erases, or Delete's copy. The first independent review found, and the lane's own PostgreSQL probe ST-2 demonstrates, that the
original candidate left a harm in place: after one of two Works is removed, a stale card for the removed Work could still send a Delete that **erased the other Work and the shared writing**. The
founder then instructed a full review with no deferral. The lane therefore crossed the boundary in the places below. Each is listed with what it changes and what it does not, because a crossing that
is not recorded is the failure this record exists to prevent.

| # | Crossing | What it changes | What it does NOT change |
|---|---|---|---|
| X1 | `eraseManuscript(…, {viaWorkId})`: a new refusal `work_no_longer_holds_it`, checked inside the transaction before anything is deleted, and `not_found` (done) when the writing is already gone | Strictly narrows: a request that names a Work which no longer holds the writing is refused instead of acting on whichever Work is left | The shared-writing refusal (`claims.rows.length > 1` → 409) is byte-for-byte unchanged; requests that name no Work (loose writing, History) behave as before |
| X2 | `DELETE /api/sovereign/manuscripts/[id]` reads `?workId=`; a malformed value is 400; the 409 body carries `refusal` (and `works` only for the shared refusal) | An API contract addition owned by the WS-DELETE-01 ruling | Authentication, member scoping, status codes of every existing outcome |
| X3 | Lock order in `eraseManuscript`: the Work rows are locked before the expression rows | Removes a measured ~1-in-80 PostgreSQL deadlock between Delete and Remove (a 500 for an act that did not happen) | What is read, what is deleted, the advisory lock, the order of the deletes |
| X4 | Custody (`sweptAll`) is decided from THIS deletion's own queue rows, and the sweep works through them first | Another member's stuck queue row (or a backlog over 100) no longer turns this member's Delete into a custody alarm | What is queued, what is destroyed, the R20 seal condition |
| X5 | `DELETE /api/sovereign/living-works/[id]`: if the removed Work's own image bytes are still owed, the answer is 500 `{removed:true, refusal:'image_bytes_owed'}` instead of plain success | The Work route stops reporting "finished" about bytes it has only queued | What the route deletes; the queue; the sweep |
| X6 | Delete's own confirmation copy is now per state (loose writing, writing + Work, writing in a Work that stays, a Work with no writing), and the custody sentences name each unconfirmed thing with its own verb | The confirmation says what the erase actually reaches | What Delete erases |

**Returned upward, not decided here:** X1 and X2 change the API contract of the ratified erase; X6 changes ratified copy. The lane's position is that all of them are narrowing or truth-restoring and
should be ratified; the founder's ratification is requested in section 6.4.

## 1. Charter (manual §27 template)

**Parent flow:** WS-DELETE-01 (Delete Work: total erasure), with the WORK-SHELF-01 act (Remove Work, keep writing). Not H1: H1's question ("can original-file intake be lifted?") is not the
question this lane answers (§20: success here does not answer H1's governing question).
**Reason opened:** RETURN, from a runtime observation. The founder saw two failures in production on the Work-card Delete that the live Home gained from PR #2111 (a different lane).
**Base:** canonical commit:`dcdffad2`.
**Standing:** the WS-DELETE-01 ruling and its closure conditions are untouched and remain as they were. The 409 refusal stays exactly as ruled.

### Gate question
For two Works that hold one writing, and for a delete the server committed but could not confirm, does the Work card tell the member the truth and offer a lawful next step?

### In scope
- Carry the server's refusal classification on the delete outcome, and turn ONLY `declared_in_other_works` into a distinct error that offers the container-only act the existing `removeWork` performs,
  as its own named confirmation (`Remove this Work`), saying what goes and what stays.
- Hoist every message the member must still see out of the Work card (the card unmounts when the list is re-read) onto the page, in every Home layout that shows Work cards, as a list that a later
  message cannot overwrite.
- Added by the full review: a door for every Work (the hero Work, and a Work with several writings), a Delete confirmation that says what is true of that Work, honest wording for outcomes the
  client cannot know, no stale-card path that can erase another Work's writing, and the server changes in the amendment.

### Out of scope
- The 409 refusal itself and the erase mechanism (what is deleted, in what order, by what authority).
- The older, unmounted `app/writers-studio/HomeView.tsx` and its own removal door.
- The hidden MAIA reply (PR #2125) and every other finding in the pending-deploy inventory.

### Evidence inherited
- `WRITER-SOURCE-INTAKE-LIFT_H1_PENDING_DEPLOY_INVENTORY_2026-11-05.md` finding L3 (R20 ledger configuration absent from every tracked compose/env) and P1 (custody message dropped).
- The founder's console and screenshot: DELETE `eff1f605…` 409 twice; DELETE `21d05bdf…` 500 followed at once by GET living-works and GET manuscripts.

### Required falsifier (weaker candidates that must fail)
Every decision in the changed code has a defeat candidate: the plausible, wrong, smaller version of it. They live in `tests/constitutional/ws-delete/mutants/run.mjs` (run it with `--list`),
not in this prose, so the claim "all killed" is reproducible. The named ones from the charter: reword the copy only; offer removal through the manuscript erase route; classify every failure as
shared; keep the message inside the card; render the notice twice; leave the dialog open; claim "nothing is deleted" in the removal copy.

### Exit
PASS (as code): the candidate is fit to enter canonical, subject to the founder's local test, the ratification in section 6.4, and the founder's PR and merge acts. STOP: any survivor, any untrue
sentence in the copy, or any path by which the writing is erased or orphaned.

## 2. State recovery and cross-lane custody (manual §14, §25, §41)

- Canonical `dcdffad2` at the start; the branch carries the commits listed in section 3.
- **Authority direction.** Runtime evidence (founder) goes up to the WS-DELETE-01 ruling; implementation sits below it. This lane returns its findings upward and, by the founder's instruction, fixed
  the findings of the full review in code another lane shipped (#2111, branch `claude/ws-delete-work-20261104`) and in the erase it depends on, recorded in the amendment.
- **Concurrent lanes discovered, not duplicated.** No open PR touches the Work-card Delete. #2125 ("hidden MAIA reply") addresses a different inventory finding; #2113 ("a repeat upload no longer
  creates another manuscript and Work") may be related to how two Works came to hold one writing. Not verified; this lane does not rely on it.

## 3. What was built

| Area | Files |
|---|---|
| Server | `lib/manuscript/source/eraseManuscript.ts` (X1, X3, X4), `app/api/sovereign/manuscripts/[id]/route.ts` (X2), `app/api/sovereign/living-works/[id]/route.ts` (X5, comments) |
| Client command | `lib/writersStudio/deleteWork.ts` (`deleteWork`, `removeWork`, `runDeleteWork`, `runRemoveWork`, every member-facing sentence), `app/writers-studio/useLivingWorks.ts` and `useCurrentManuscript.ts` (a re-read now reports whether it worked) |
| Home | `app/dev/writers-studio-pc3-live/P4R1HomeController.tsx`, `P4R1HomeView.tsx`, `useWorkDeleteDoor.tsx` (new: one door for the hero Work and every shelf card), `WorkRemoveConfirm.tsx` (new), `WritingDeleteConfirm.tsx` |
| History | `app/writers-studio/historyActions.ts`, `app/dev/writers-studio-pc3-live/P4R1HistoryPage.tsx` |
| Tests (default `npx jest`) | `homeWorkDeleteSharedAndCustody.test.ts`, `homeWorkDeleteRound2.test.ts`, `homeDeleteWriting.test.ts` (renamed from `.tsx`, which jest never matched), `historyPage.test.tsx`, `historyActions.test.ts`, `deleteWork.test.ts`, `deleteWorkTruth.test.ts`, `removalCopyDrift.test.ts`, `deleteWorkParam.test.ts` (route contract), `eraseManuscriptGuard.test.ts` (refusal order and lock order) |
| Physical probes (need root + postgres binaries) | `tests/constitutional/ws-delete/dynamic/sharedWriting.probe.test.ts`, `clientAndRace.probe.test.ts`, run by `run-local-pg16.sh` |
| Defeat candidates | `tests/constitutional/ws-delete/mutants/run.mjs` |

Commits (all local): `e6ce0aa94` initial fix · `038cabfbe` lane record opened · `dd99d8c1c` founder hold · `e7d39b3ca` PG16 probes · `8c284f9e4` first review fixes · `a6f1f6778` contract tests ·
`5d218365d` second audit fixes · `f15a09c20` runner, probes, drift guard · `7041ac507` final independent review fixes.

## 4. Evidence packet

```
subject          local branch above, HEAD 7041ac507 plus the closing record commit
scope            the member-facing Work-card Delete surface and the three server files in the amendment; no schema, no migration, no deploy
instruments      jest (jsdom mounts of the real Home view, hermetic route and erase tests, runtime tests of the page-level act, a static drift guard over every migration);
                 a disposable loopback PostgreSQL 16 running the REAL route handlers with the client's own functions pointed at them, including interleavings held by a
                 second connection's lock (no sleeps) and a 400-pair deadlock sweep; the repository typecheck gate; a committed defeat-candidate runner
results          {{TESTS}}
                 PostgreSQL 16 probes: {{PROBES}}
                 defeat candidates: {{MUTANTS}}
                 wide regression (app/writers-studio, app/dev, lib/writersStudio, lib/manuscript/source, the manuscripts and living-works routes): {{WIDE}}
                 typecheck gate: {{TYPECHECK}}
independent review   three rounds (section 6.1)
post-state       local commits only. Not pushed. No PR.
```

**Found on the way, left open (not delete-related):** seven other `.tsx` test files are never matched by jest's `testMatch` and so never run in the default suite (placeStubAndReadability, house
accountMenu, WriterField.dom, craftFocusActionsR1.interaction, jarvisActualWriteCraftEntryR1.interaction, useVoiceInput.rerender, useVoiceInput.v5witness.dom). This lane's own tests are `.ts` so that they do run.

## 5. Diagnosis of the production 500 (from the code; production itself was not read)

The founder's second screenshot shows DELETE 500 followed at once by GET living-works and GET manuscripts. In the old controller a refresh followed only the `removed:true` answer, so that 500 was
`{removed:true, refusal:'custody_incomplete'}`: **the rows were gone and custody was not confirmed.** The repository says which conditions produce that answer (`sweptAll` is false when the deletion's
own queued bytes are not destroyed OR the R20 recovery seal could not be written):

| Mode | Cause | Operator signature (container log) | Note |
|---|---|---|---|
| R1 | The R20 ledger is not configured. `sealR20DeletionLedger()` throws unless `R20_LEDGER_FILE`, `R20_HIGH_WATER_FILE` and `R20_LEDGER_KEY_FILE` are set to absolute paths (`lib/recovery/r20DeletionLedger.ts:264-266`), and, once set, unless the ledger and high-water files exist or `R20_LEDGER_ALLOW_INITIALIZE=true` | `[MAIA/press] R20 recovery seal still owed { code: R20_LEDGER_FILE_MISSING }` (or `…HIGH_WATER…`, `…KEY_FILE…`) | **The most likely.** The pending-deploy inventory (L3) already found the three names in no tracked compose or env template. In this mode EVERY delete ends in the alert |
| R2 | This deletion's own original-file bytes could not be destroyed (permissions, read-only mount, a symlinked or hard-linked path the vault refuses) | `[MAIA/press] vault erasure still owed (errno=EACCES)` with `artifactsQueued: N`, no `R20 recovery seal still owed` line | Only for a writing that had an original file |
| R3 | **Before this review only:** any OTHER row stuck in the shared erasure queue (another member's, or an old one) | `vault erasure still owed` with `artifactsQueued: 0` | Fixed by X4: this no longer raises the alert, though the log line remains for an operator |

A bare 500 `{error:'Failed to remove manuscript'}` is a different thing: the erase transaction threw and rolled back, **nothing was deleted** (probe F-2).

**Read-only checks for the founder** (names and counts only; never print values): `docker exec maia-sovereign env | grep -E '^R20_' | sed 's/=.*/=<set>/'` · `docker logs maia-sovereign --since 6h 2>&1 | grep -E "manuscript erased|DELETE error|Transaction rolled back|R20 recovery seal still owed|vault erasure still owed"` ·
the browser Network tab response body of the failing DELETE (`removed:true` or not) · `docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT count(*), max(attempts) FROM vault_erasure_queue"`.
**This record does not claim the founder's production 500 is fixed.** It claims the member is now told the truth about it, and that R3 no longer causes it.

### 5.1 Testing it locally (the founder's hold)

1. Get the branch: the lane has not pushed. Patch files and a git bundle are in the scratchpad (path in the closing report); or ask for the branch to be pushed (no PR).
2. Run the app against a local database as usual. **Without R20 configured every delete will end in the custody alert (mode R1). That is the notice working, not a failure.** To see a clean success
   locally, point the three variables at throwaway files and set `R20_LEDGER_ALLOW_INITIALIZE=true`.
3. Click through, in this order: (a) two Works sharing one writing → Delete on one → the removal question → Remove → the writing and the other Work remain; (b) Delete on the other → the writing and
   the Work go; (c) a Work with several writings shows **Remove**, not Delete; (d) the Work you land on (the large one) has the same door; (e) a Work with one writing and a second part
   → Delete says the Work stays, and its card does not turn into "was deleted"; (f) delete your last Work → the welcome screen carries any notice; (g) History: a writing held by two Works shows no Delete
   and says where to go; (h) with two browser tabs, remove a Work in one and press Delete on its stale card in the other → "That Work has changed…", and the other Work's writing survives.
4. The physical probes: `WS_DELETE_OUT=<dir> tests/constitutional/ws-delete/dynamic/run-local-pg16.sh` on a host with postgres binaries (root), or provision a disposable loopback database named
   `ws_delete_fictional` and follow the header of that script. The probes refuse any other database.

## 6. Independent review, adjudication and closure

### 6.1 What was reviewed, and by whom

| Round | Subject | Method | Result |
|---|---|---|---|
| 1 | candidate `e6ce0aa94` | four read-only lenses, a skeptic on every medium-or-higher finding (workflow `wf_d3c1a42a-60d`) | findings folded into `8c284f9e4` |
| 2 | head `e7d39b3ca` | state-matrix, copy-truth, test-strength and record-truth lenses, three skeptics per finding, 39 agents (`wf_14e193a2-5c7`) | findings folded into `5d218365d` |
| 3 | head `f15a09c20` | server, client, UI, copy, tests and governance lenses plus a completeness critic; **three skeptics per finding** (execute / trace / ruling); 160 agents (`wf_b1b8e77a-57e`) | 51 findings reported, **48 stood, 3 refuted**; all folded into `7041ac507` or recorded below |
| 4 | the delta `f15a09c20..HEAD` | {{DELTA}} | {{DELTAR}} |

### 6.2 Disposition of round 3 (each of the 48 that stood)

| Finding(s) | Disposition |
|---|---|
| CL-1, UI-3 stale 409 was a silent no-op | FIXED: the page is re-read first; if it still cannot see the other Work the card shows the server's sentence; tests at every call site |
| CL-2, C3 "Home now shows what is current" asserted although a failed re-read is undetectable | FIXED: the list loads now report success; the sentence is said only when the re-read worked |
| CL-3, UI-4, GOV-3 a message dropped when the re-read removes the card (unknown outcome) | FIXED: a message the member has not seen is handed to the page when its card unmounts |
| CL-4, C7 History / loose-writing confirmations omitted that the Work goes too | FIXED: both say what that deletion reaches, per state |
| CL-5, F1 custody decided from the whole shared queue | FIXED (X4) with probes FQ-1/FQ-2 |
| CL-6, CL-7, C9, GOV-2 unknown refusal codes; failed follow-through; the 404 follow-through removed a Work that was to stay | FIXED: unknown codes never read "nothing was removed"; a Work that stays loses only the dangling declaration (probe CE-5b); a failed follow-through re-reads and keeps its own truth |
| C1, UI-1 hero Work state followed the slot | FIXED: keyed by Work |
| C2, UI-2 deleting a Work's writing replaced the surviving Work with a ghost | FIXED: a page notice instead |
| C4 "stays in your other Work" asserted from a stale read; singular for many | FIXED: the notice asserts only what removal guarantees; the dialog is count-aware |
| C5 a label that is not on screen | FIXED |
| C6, GOV-7 the deletion record described as something to destroy | FIXED: the file is "destroyed", the independent record is "sealed" |
| C10 drift guard defeatable by a neighbouring CASCADE; sees only direct references | FIXED for the parser (clause-bounded) and extended to tables that carry a Work id with no foreign key; **second-level cascades (e.g. `ask_turns` via its thread) are not scanned**: recorded in 6.3 |
| C11 removal copy promised where conversations live | FIXED: claim removed. The two origin tables are retained by design and recorded (6.3) |
| E1 shared flow tested at 2 of 7 call sites | FIXED: every layout × both Works; per-site `allWorks` defeat candidates A1–A7 |
| E2, F2 the deadlock | FIXED (X3); probes DL-1 (deterministic) and DL-2 (400 pairs); the declared "theoretical" label was wrong and is withdrawn |
| E3, GOV-8 the runner could report kills with a red baseline or a stale PG log; leftover `.mutbak` | FIXED: green baseline first, a kill needs a parsed failing assertion, the PG log is removed before each run, the runner refuses to start over a `.mutbak` |
| E4, E5 loose-writing path had no behavioural test | FIXED |
| E6, F5 the order of the two refusals was undefended | FIXED: probe ST-8, hermetic test, defeat candidates S8/J5 |
| E7, GOV-4 probes `TRUNCATE members CASCADE` on any loopback database | FIXED: they refuse any database not named `ws_delete_fictional` |
| E8, F6 repeat Delete told "nothing was deleted" | FIXED (X1: `not_found` when the writing is gone); DR-5 title now true |
| E9 "choose Remove this Work" on a screen without it | FIXED: "when asked"; History no longer offers the doomed Delete |
| E10 two branches untested | FIXED |
| UI-5 a later notice erased an earlier one | FIXED: notices stack and dismiss individually |
| UI-6, UI-8 default focus untested; body not tied to the dialog | FIXED |
| GOV-1 stop boundary crossed | RECORDED: the amendment in section 0; ratification requested in 6.4 |
| GOV-6, COMP-3, COMP-4 comments and test titles stating superseded law | FIXED |
| COMP-1 server half had no always-run test | FIXED: hermetic route and erase tests |
| COMP-2 local test cannot reach a clean success without R20 | RECORDED in 5.1 |
| F3 a declaration added while a Delete is in flight | OPEN (6.3) |
| F4 offline-cabin branch | OPEN (6.3) |
| UI-7 notice lost on navigation | OPEN (6.3) |

Refuted by the skeptics (not acted on): C8 (the Remove question silently turns into the Delete question), C12 (a known-false older copy is exported), GOV-5 (commit trailer vs the commit hook).

### 6.3 Open findings, with what each needs

| Finding | Why it is open | Owner / next |
|---|---|---|
| F3 A declaration added to a Work while a Delete of that writing is in flight can leave the Work naming a gone writing | In the declaration route (`living-works/[id]/expressions`), not the delete surface; its own test file cannot load on canonical (a `server-only` import). The consequence is now recoverable: Delete on that Work answers 404 and the follow-through withdraws the dangling declaration. Low | The declaration route's lane; a `FOR SHARE` on the manuscript row inside one transaction is the shape of the fix; a probe is sketched in the round-3 result |
| F4 The offline-cabin branch of the manuscripts route ignores `workId` and the shared refusal | `MAIA_CABIN_MODE=offline` is not exercised by any test here | The cabin lane |
| UI-7 A page notice is component state; it is lost if the member leaves Home | Surviving a navigation needs persisted or server-held custody state, a product decision. The server obligation (the queue) is unaffected | Founder |
| Retry after a lost response reports plain success and loses the custody caveat | Same root: no persisted custody status the client can read | Founder |
| Remove takes no `soullab:r20:recovery-capture` lock and writes no tombstone | Whether the R20 "wholly before or wholly after a recovery point" contract covers container removal is an unruled question. A restore from a pre-Remove backup would bring the Work back with its conversations | Founder |
| Editorial conversation history after Remove | The origin records and the conversations bound to the writing's proposal chain are retained by design (migration 20261020000001) and are reachable only through the Work they were opened from; the copy therefore no longer promises where they live. Whether "retained but unreachable" is acceptable after a member's Remove is a ruling | Founder |
| Second-level cascades are not scanned by the drift guard | They follow their parents; a new first-level parent is what the guard catches | Accepted |
| Legacy `developmental_reviews`, `studio_companion_turns` cascade from a Work and have no live writer in this tree | Production row counts unknown | Accepted; listed in the guard |
| CI runs no unit test (repo-wide) | A policy decision; these tests protect only when someone runs them | Founder |
| Seven unrelated `.tsx` tests are never matched by jest | Not delete-related (section 4) | Whoever owns them |
| "Delete permanently" vs the backup qualifier | The body says earlier backups retire on their schedule; the button says permanently | Founder (copy) |
| The unmounted older `HomeView.tsx` still carries older copy | It is not mounted anywhere | Accepted |
| `living-works/[id]/visual` still reports `bytesDestroyed` from the global queue | Not part of the delete surface | Whoever owns the visual route |

### 6.4 Questions returned upward (the lane does not decide these)

1. Ratify X1–X6 (section 0). They narrow or restore truth; they are crossings of the original stop boundary.
2. Should container removal (Remove) take the R20 recovery-capture lock and write a deletion record?
3. Is "editorial conversation history retained but unreachable after Remove" acceptable, or must Remove refuse a Work that has any?
4. Should a custody-unconfirmed message be durable (survive navigation and reload)?

### 6.5 Adjudication and closure fields (manual §18, §30)

```
Adjudication         {{ADJ}}
What this lane did not establish   production's configuration (which R mode occurred); a real browser; real R20/KMS; real vault bytes; the full production schema
                     (the probes use a stub schema plus four real migrations; the Work-level tables are covered by the static drift guard, not by a physical cascade)
Holds in force       no deploy · no PR · no merge · no push without the founder's explicit ask · dispositions.json unchanged · frozen branch untouched
Residual risk        the open findings in 6.3; the questions in 6.4
```
