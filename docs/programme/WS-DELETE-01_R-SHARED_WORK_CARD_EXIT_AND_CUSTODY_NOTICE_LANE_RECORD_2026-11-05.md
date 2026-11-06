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
| X1 | `eraseManuscript(…, {viaWorkId})`: a new refusal `work_no_longer_holds_it`, checked inside the transaction before anything is deleted | Strictly narrows: a request that names a Work which no longer holds the writing is refused instead of acting on whichever Work is left | The shared-writing refusal (`claims.rows.length > 1` → 409) is unchanged **for a writing that exists**; requests that name no Work (loose writing, History) behave as before for a writing that exists. (For a writing that is already gone the answer is now `not_found`, or the X8 cleanup, before any count of holders: a shared refusal about a writing that does not exist would be untrue.) |
| X2 | `DELETE /api/sovereign/manuscripts/[id]` reads `?workId=`; a malformed value is 400; the 409 body carries `refusal` (and `works` only for the shared refusal) | An API contract addition owned by the WS-DELETE-01 ruling | Authentication, member scoping, status codes of every existing outcome |
| X3 | Lock order: in `eraseManuscript` the Work rows are locked before the expression rows, and in the Work route (Remove) the Work row is locked before the Work's image row and before the delete | Removes two measured PostgreSQL deadlocks between Delete and Remove (a 500 for an act that did not happen): ~1 in 80 on the expression rows (probes DL-1, DL-2), and, for a Work with an image, a cycle the first version of the image-row lock introduced and the fifth review found (guarded by probe DL-3, DL-2\'s sole-claimant pairs, the hermetic LOCK ORDER test and candidates S21 and J23). In the Work route this adds one locking read (`SELECT id FROM living_works … FOR UPDATE`) and an early 404 for a Work that is not the member\'s | What is deleted, the advisory lock, the order of the deletes |
| X4 | Custody (`sweptAll`) is decided from THIS deletion's own queue rows, and the sweep works through them first | Another member's stuck queue row (or a backlog over 100) no longer turns this member's Delete into a custody alarm | What is queued, what is destroyed, the R20 seal condition |
| X5 | `DELETE /api/sovereign/living-works/[id]`: if the removed Work's own image bytes are still owed, the answer is 500 `{removed:true, refusal:'image_bytes_owed'}` instead of plain success | The Work route stops reporting "finished" about bytes it has only queued | What the route deletes; the queue; the sweep |
| X6 | Delete's own confirmation copy is now per state (loose writing, writing + Work, writing in a Work that stays, a Work with no writing), and the custody sentences name each unconfirmed thing with its own verb | The confirmation says what the erase actually reaches | What Delete erases |
| X7 | The manuscripts route's answers now say whether the Work went (`workRemoved`, on the 200 and on the 500), and the 500 `custody_incomplete` body says WHICH of this deletion's own obligations is unconfirmed (`unconfirmed:{originalFile, image, deletionRecord}`); the same for the Work route's `image_bytes_owed` | The sentence the member reads names exactly what is owed and nothing else; before, it always named two things whatever had failed | Whether `sweptAll` is true: it is still true only when nothing of this deletion's own is owed |
| X8 | When the writing is ALREADY GONE and the Work the card named still declares it (a declaration that outlived its writing: the detached state the ruling forbids by name), the SERVER ends that declaration inside the same transaction (and the Work with it only if it then declares nothing; a Work that holds anything else stays). It never touches a Work the request did not name, a Work that does not declare the gone writing, or another member's Work | Replaces a client-side second request (which could remove a Work that had changed since the member confirmed) with one server act that cannot | The erase of a LIVE writing; the shared-writing refusal for a writing that exists; a request that names no Work still answers 404 for a gone writing. **It writes no deletion manifest and no tombstone for a Work it ends** (the same as Remove, and unlike a Work that goes with a LIVE writing, which is tombstoned): see 6.3 and 6.4 Q2 |

**Returned upward, not decided here:** X1, X2 and X7 change the API contract of the ratified erase; X6 changes ratified copy; **X8 adds a destructive path** (a request that used to answer 404 now ends a declaration and, if the Work then declares nothing, the Work itself, without a tombstone). The lane's position is that X1–X7 are narrowing or truth-restoring and that X8 is the same act the member confirmed, finished where it cannot go wrong; all eight are put to the founder in section 6.4.

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
Each decision the independent reviews called out has at least one defeat candidate: the plausible, wrong, smaller version of it. They live in `tests/constitutional/ws-delete/mutants/run.mjs` (run it with `--list`),
not in this prose, so the claim "all killed" is reproducible. **This is not a claim that every decision in the changed code has one**: each review round has found decisions that had none, and each such gap was closed by adding the candidate and the test (the history is in section 6). Candidates marked `(textual guard)` are caught only by a test that reads source text; they guard a structure, they do not prove behaviour. The named ones from the charter: reword the copy only; offer removal through the manuscript erase route; classify every failure as
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
| Server | `lib/manuscript/source/eraseManuscript.ts` (X1, X3, X4, X7, X8), `app/api/sovereign/manuscripts/[id]/route.ts` (X2, X7), `app/api/sovereign/living-works/[id]/route.ts` (X5, X7, comments) |
| Client command | `lib/writersStudio/deleteWork.ts` (`deleteWork`, `removeWork`, `runDeleteWork`, `runRemoveWork`, `reReadAll`, every member-facing sentence; ONE request per act, a 404 is done), `app/writers-studio/useLivingWorks.ts`, `useCurrentManuscript.ts` and `useStudioHistory.ts` (a re-read now reports whether it worked) |
| Home | `app/dev/writers-studio-pc3-live/P4R1HomeController.tsx` (the re-read covers Works, writings and Home's own short History), `P4R1HomeView.tsx` (the page holds every Work's door state, keyed by Work id), `useNoticeStack.tsx` (new: the stack of notices, shared with History), `useWorkDeleteDoor.tsx` (new: one door for the hero Work and every shelf card), `WorkRemoveConfirm.tsx` (new), `WritingDeleteConfirm.tsx` |
| History | `app/writers-studio/historyActions.ts`, `app/dev/writers-studio-pc3-live/P4R1HistoryPage.tsx`, `app/api/sovereign/studio/history/route.ts` (the offline cabin answers the acts its tables can establish instead of 401) |
| Tests (default `npx jest`) | `homeWorkDeleteSharedAndCustody.test.ts`, `homeWorkDeleteRound2.test.ts` (the real event order of a re-read that unmounts the card), `homeDeleteWriting.test.ts` (renamed from `.tsx`, which jest never matched), `historyPage.test.tsx`, `historyContainerAndNotices.test.ts` (the container that re-reads, and notices that outlive the History view), `homeHistoryNotices.test.ts` (the same through the REAL Home view), `studio/history/__tests__/cabinBranch.test.ts`, `historyActions.test.ts`, `deleteWork.test.ts`, `deleteWorkTruth.test.ts`, `removalCopyDrift.test.ts`, `listReloadReports.test.ts`, `deleteWorkParam.test.ts` (manuscripts route contract), `living-works/[id]/__tests__/deleteRoute.test.ts` (Work route contract), `eraseManuscriptGuard.test.ts` (refusal order, lock order, the gone-writing cleanup, custody arithmetic in both directions) |
| Physical probes (need root + postgres binaries) | `tests/constitutional/ws-delete/dynamic/sharedWriting.probe.test.ts`, `clientAndRace.probe.test.ts`, run by `run-local-pg16.sh` |
| Defeat candidates | `tests/constitutional/ws-delete/mutants/run.mjs` (`--list`, `--check`, `--jest-only`, `--pg-only`, by id) |

Commits (all local): `e6ce0aa94` initial fix · `038cabfbe` lane record opened · `dd99d8c1c` founder hold · `e7d39b3ca` PG16 probes · `8c284f9e4` first review fixes · `a6f1f6778` contract tests ·
`5d218365d` second audit fixes · `f15a09c20` runner, probes, drift guard · `7041ac507` final independent review fixes · `f91723936` the three survivors of the first full run · `4ffc14da0` the fixes for the fourth review (and the six survivors of its full run) · `8b91799d4` the fixes for the fifth review · `08dc16f97` the lane record · `f220b9ed9` the fixes for the sixth review.

## 4. Evidence packet

```
subject          local branch above, code HEAD 4997939c9 plus the closing record commit
scope            the member-facing Work-card Delete surface and the three server files in the amendment; no schema, no migration, no deploy
instruments      jest (jsdom mounts of the real Home view, hermetic route and erase tests, runtime tests of the page-level act, a static drift guard over every migration);
                 a disposable loopback PostgreSQL 16 running the REAL route handlers with the client's own functions pointed at them, including interleavings held by a
                 second connection's lock (no sleeps) and a 400-pair deadlock sweep; the repository typecheck gate; a committed defeat-candidate runner
results          jest: 3258 passed, 92 skipped (the PostgreSQL probes skip without their harness) across the surface above; 8 suites fail to LOAD on canonical and failed identically before this lane (listen/* x6, publish/kdpCoverGeometry, living-works/[id]/expressions)
                 PostgreSQL 16 probes: 59 passed in 2 suites (including DL-3, the deterministic Delete/Remove lock-order interleaving, and 200 sole-claimant Delete/Remove pairs with an image) (loopback cluster, fictional rows, stub schema plus four real migrations)
                 defeat candidates: 207 (184 jest, 23 PostgreSQL), all killed on the committed tree in one full run (207 of 207, both baselines green first; before that, two earlier full runs each left a candidate the hardened runner refused to count as a kill and that was then repaired: L42 as COMPILE-ERROR, and a run whose PostgreSQL baseline went red because the disk was full); each kill is a parsed failing test (timeouts, hook errors, compile errors, and SQL parameter-count, parameter-type or syntax errors do not count); 17 are labelled (textual guard) or (static guard) because only a test that reads source text, SQL text or migrations kills them
                 typecheck gate: 214 errors against a baseline of 214, no regression (npm run typecheck)
independent review   six rounds (section 6.1)
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
| R1 | The R20 ledger is not configured. `sealR20DeletionLedger()` throws unless `R20_LEDGER_FILE`, `R20_HIGH_WATER_FILE` and `R20_LEDGER_KEY_FILE` are set to absolute paths (`lib/recovery/r20DeletionLedger.ts:264-266`), and, once set, unless the key file EXISTS and holds 32 bytes (raw, 64 hex characters or base64; otherwise `R20_LEDGER_KEY_UNAVAILABLE` / `R20_LEDGER_KEY_INVALID`) and the ledger and high-water files exist or `R20_LEDGER_ALLOW_INITIALIZE=true` | `[MAIA/press] R20 recovery seal still owed { code: R20_LEDGER_FILE_MISSING }` (or `…HIGH_WATER…`, `…KEY_FILE_MISSING`, `…KEY_UNAVAILABLE`, `…KEY_INVALID`) | **The most likely.** The pending-deploy inventory (L3) already found the three names in no tracked compose or env template. In this mode EVERY delete ends in the alert; the body says `unconfirmed:{deletionRecord:true}` and the member is told only that |
| R2 | This deletion's own original-file bytes could not be destroyed (permissions, read-only mount, a symlinked or hard-linked path the vault refuses) | `[MAIA/press] vault erasure still owed (errno=EACCES)` with `artifactsQueued: N`, no `R20 recovery seal still owed` line | Only for a writing that had an original file. The body says `unconfirmed:{originalFile:true}` (probe SB-1) |
| R3 | **Before this review only:** any OTHER row stuck in the shared erasure queue (another member's, or an old one) | `vault erasure still owed` with `artifactsQueued: 0` | Fixed by X4: this no longer raises the alert, though the log line remains for an operator (probes FQ-1, SB-4, SB-5) |
| R4 | Removing a Work (the Work route, or a Delete that takes its Work with it): the Work's own image bytes are owed | `[living-works] Work removed; its image bytes are still owed destruction`, or the manuscript route's `vault erasure still owed` | The body says `unconfirmed:{image:true}`; the member is told about the image, not the original file (probe WI-1) |

A bare 500 `{error:'Failed to remove manuscript'}` is a different thing, and it is **not** proof that nothing was deleted: it is what an exception inside the erase transaction produces (rolled back, nothing deleted: probe F-2) and also what an exception AFTER the commit would produce (the sweep or the custody read failing). The client therefore treats it as "we could not confirm", re-reads Home, and never says "nothing was removed" about it.

**Read-only checks for the founder** (names and counts only; never print values): `docker exec maia-sovereign env | grep -E '^R20_' | sed 's/=.*/=<set>/'` · `docker logs maia-sovereign --since 6h 2>&1 | grep -E "manuscript erased|DELETE error|Transaction rolled back|R20 recovery seal still owed|vault erasure still owed"` ·
the browser Network tab response body of the failing DELETE (`removed:true` or not) · `docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT count(*), max(attempts) FROM vault_erasure_queue"`.
**This record does not claim the founder's production 500 is fixed.** It claims the member is now told the truth about it, and that R3 no longer causes it.

### 5.1 Testing it locally (the founder's hold)

1. Get the branch: it was pushed on the founder's ask (2026-11-06, branch only, no PR). Use a separate `git worktree add` so a working checkout with uncommitted changes is not disturbed; copy the gitignored env files in by absolute path. Patch files and a git bundle remain in the scratchpad.
2. Run the app against a local database that has **every migration this tree carries applied** (section 6.6: a database 28 migrations behind answered "could not confirm", not the custody alert). **Without R20 configured every delete will end in the custody alert (mode R1). That is the notice working, not a failure.** To see a clean success
   locally, point the three variables at throwaway files, make the key file hold 32 bytes (`head -c 32 /dev/urandom > <key file>`, or 64 hex characters; it must exist), and set `R20_LEDGER_ALLOW_INITIALIZE=true`. The Studio is invitation-only (section 6.6): the test member needs a roster row.
3. Click through, in this order: (a) two Works sharing one writing → Delete on one → the removal question → Remove → the writing and the other Work remain; (b) Delete on the other → the writing and
   the Work go; (c) a Work with several writings shows **Remove**, not Delete; (d) the Work you land on (the large one) has the same door; (e) a Work with one writing and a second part
   → Delete says the Work stays, and its card does not turn into "was deleted"; (f) delete your last Work → the welcome screen carries any notice; (g) History: a writing held by two Works shows no Delete
   and says where to go; (h) with two browser tabs, remove a Work in one and press Delete on its stale card in the other → "That Work has changed…", and the other Work's writing survives; (i) History: delete a writing so that custody is unconfirmed (R20 not configured), then press Back to Home → the alert is still there.
4. The physical probes: `WS_DELETE_OUT=<dir> tests/constitutional/ws-delete/dynamic/run-local-pg16.sh` on a host with postgres binaries (root), or provision a disposable loopback database named
   `ws_delete_fictional` and follow the header of that script. The probes refuse any other database.

## 6. Independent review, adjudication and closure

### 6.1 What was reviewed, and by whom

| Round | Subject | Method | Result |
|---|---|---|---|
| 1 | candidate `e6ce0aa94` | four read-only lenses, a skeptic on every medium-or-higher finding (workflow `wf_d3c1a42a-60d`) | findings folded into `8c284f9e4` |
| 2 | head `e7d39b3ca` | state-matrix, copy-truth, test-strength and record-truth lenses, three skeptics per finding, 39 agents (`wf_14e193a2-5c7`) | findings folded into `5d218365d` |
| 3 | head `f15a09c20` | server, client, UI, copy, tests and governance lenses plus a completeness critic; **three skeptics per finding** (execute / trace / ruling); 160 agents (`wf_b1b8e77a-57e`) | 51 findings reported, **48 stood, 3 refuted**; all folded into `7041ac507` or recorded below |
| 4 | the delta `f15a09c20..f91723936` | six read-only lenses (server, client, UI, copy, tests, break-it), three skeptics per finding (execute / trace / ruling); 103 agents | 32 findings reported, **29 stood, 3 refuted**; all folded into `4ffc14da0` |
| 5 | the delta `f91723936..4ffc14da0` | seven read-only lenses (server, client, door and page, History and loose writing, tests and instruments, record and copy truth, break-it), three skeptics per finding; 118 agents | 37 findings reported, **27 stood, 10 refuted**; all folded into `8b91799d4` (6.2c). One of them was a defect round 4's own fix had introduced (a lock-order cycle, reproduced on PostgreSQL 16) |
| 6 | the delta `4ffc14da0..08dc16f97` | six read-only lenses (locks and server, client command and door, Home page / History / notices, tests and instruments, record and copy truth, break-it), three skeptics per finding; 81 agents (a container restart killed the first run; it was resumed from its journal, which kept the completed agents) | 25 findings reported, **15 stood, 10 refuted**; none was a locking or erase defect; all folded into `f220b9ed9` (6.2d) |
| 7 | the delta `08dc16f97..4e74fe72d` | five read-only lenses (client command and door, cabin History route and re-read, tests and instruments, record and copy truth, break-it), three skeptics per finding; 44 agents | 13 findings reported, **9 stood, 4 refuted**; all low; none touched the locking, the erase or the door's end states; all folded into the final commit (6.2e) |

### 6.2 Disposition of round 3 (each of the 48 that stood)

| Finding(s) | Disposition |
|---|---|
| CL-1, UI-3 stale 409 was a silent no-op | FIXED: the page is re-read first; if it still cannot see the other Work the card shows the server's sentence; tests at every call site |
| CL-2, C3 "Home now shows what is current" asserted although a failed re-read is undetectable | FIXED: the list loads now report success; the sentence is said only when the re-read worked |
| CL-3, UI-4, GOV-3 a message dropped when the re-read removes the card (unknown outcome) | FIXED: a message the member has not seen is handed to the page when its card unmounts |
| CL-4, C7 History / loose-writing confirmations omitted that the Work goes too | FIXED: both say what that deletion reaches, per state |
| CL-5, F1 custody decided from the whole shared queue | FIXED (X4) with probes FQ-1/FQ-2 |
| CL-6, CL-7, C9, GOV-2 unknown refusal codes; failed follow-through; the 404 follow-through removed a Work that was to stay | FIXED: a 5xx that does not say what it did never reads "nothing was removed" (a 4xx is a rejection before any act, including one with a code the client does not know); a Work that stays loses only the dangling declaration (probe CE-5b); a failed follow-through re-reads and keeps its own truth |
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

### 6.2b Disposition of round 4 (each of the 29 that stood)

The round found that two of round 3's own answers were wrong in the real event order, and that the cleanup of a vanished writing was done on the wrong side of the wire. The fixes changed the design in
two places, so they are described first.

- **One request, and the server finishes what it can finish.** The client used to send a second request when the first said the writing was gone. That second request could remove a Work that had
  changed since the member confirmed (SRV-1). `deleteWork` now sends one request and a 404 is done. The one case that needed a second step, a Work still declaring a writing that is already gone, is now
  done by the server inside the same transaction, for the named Work only (X8).
- **No hand-over from an unmounting card.** Round 3 let a card pass an unseen message to the page as it unmounted. In the real order the re-read runs BEFORE the error reaches the card, so the card is already
  gone (CD-1, UI-D1, BR-1). The message now travels as its own error class (`DeletionNotice`) and goes to the page directly; every Work's door state lives in the page, keyed by Work id, so a re-read that
  re-mounts a card cannot reset what the member was looking at (UI-D2).

| Finding(s) | Disposition |
|---|---|
| SRV-1 a stale-card 404 made the client remove a Work that had changed | FIXED by construction: there is no second request. X8 + probes CE-5, CE-5b, CE-5c, CE-5d, CE-5e; candidates J9, J7, S15, S16, S17 |
| SRV-2, T-1 custody was unpinned in the under-reporting direction | FIXED: hermetic arithmetic tests in both directions (own original, own image, foreign rows, backlog first) and probes SB-1..SB-5; candidates J11–J14, J17, S10, S18, S19 |
| SRV-3 a shared writing that is already gone still got the shared refusal | FIXED: the writing-held check comes first |
| SRV-4 the Work's image path was read without a lock | FIXED in both routes (`FOR UPDATE`); not testable on a single connection, so the candidates J18 and W4 are labelled **textual guards** |
| CD-1, UI-D1, BR-1 the unseen-message hand-over fails in the real event order | FIXED: `DeletionNotice`; the real event order is the test (`homeWorkDeleteRound2.test.ts`); candidates H14a/b, L12a–c |
| UI-D2, UI-D5 a stale 409 is a silent no-op when the re-read reorders Home; the stale sentence lingers | FIXED: door state held by the page; the fallback sentence is shown only while the server's answer is the newest word (V18, V19, H17, H21, H23) |
| CD-2, UI-D3 loose-writing and History deletions had no hand-over | FIXED: every outcome goes to the page; candidates V15–V17 |
| CD-3 refused-as-shared on a loose writing lost its explanation | FIXED: a status notice naming the writing |
| CD-4 "the Work stays" asserted without evidence | FIXED: no follow-through can make it false any more, and the sentence no longer asserts it outright: "The Work stays if it still holds anything else." (true in every case, including a second device removing the other parts in the same moment) |
| CD-5, UI-D4 a failed re-read after a successful Delete left a live card beside "was deleted" | FIXED: `{refreshed:false}` reaches the page and the notice tells the member to reload (H19, H20, V17) |
| copy-1, T-3, BR-2 deleting the writing of a Work that stays, with custody unconfirmed, ghosted the surviving Work as "removed" | FIXED: that kind never settles into a "removed" card (H15, H12) |
| copy-2 the custody sentence always named two things | FIXED (X7); candidates L3, L24, L18, L18b, L23 |
| copy-3 History named the writing as the Work | FIXED: a kind of its own (`writing-from-work`) with the right subject (L29, Y3) |
| copy-4 the drift guard missed `REFERENCES living_works` with no column list | FIXED in the parser; a test pins it |
| copy-6 History told the member to "remove" a Work that Home calls Delete | FIXED: the sentence names the choice the dialog offers |
| T-2 the loaders' boolean was unpinned | FIXED: `listReloadReports.test.ts`; candidates LD1–LD6 |
| T-4 the runner accepted timeouts and hook errors as kills; DL-2 was load-sensitive | FIXED: a timeout or a hook-only failure is its own verdict, never a kill; DL-2 stops at the first 5xx, fails past a deadline, and asserts all 400 pairs ran |
| T-5 J8 is behaviourally equivalent and was labelled as if it were behaviour | FIXED: relabelled **textual guard** (J6, J8, J18, W4) |
| T-6 the runner could not be stopped cleanly or run off the container host | FIXED: asynchronous child, signals restore the files, an explicit PG-harness availability check (exit 3, not a false kill) |
| UI-D6 History's notices did not stack and named no writing | FIXED |
| UI-D7 History computed a reason it never rendered | FIXED: both reasons render, with tests |
| SRV-4 (pre-existing) see above | |

Refuted by the skeptics (not acted on): CD-6 (the 404 follow-through question dissolved with the follow-through itself), CD-7, copy-5.

### 6.2c Disposition of round 5 (each of the 27 that stood)

Round 5 reviewed the round-4 fixes and found that one of them was itself a defect, and that the page still guessed in one place. Both are closed in the design, not in a test.

- **The image-row lock inverted the lock order (found, reproduced on PostgreSQL 16, and mine).** Round 4 added `FOR UPDATE` to the Work's image row in both routes (SRV-4). In the Work route the image row was read, and so locked, BEFORE the Work row; the erase locks the Work row first. For any Work that has an image, a Delete of its writing and a Remove of the Work could deadlock (40P01, one of them a 500 for an act that did not happen). The probes had not seen it because no probe drove a Delete and a Remove of the SAME Work that has an image (DL-2's pair, a loose Delete of a writing two Works hold, refuses 409 before it ever reads an image row, so even an image on that Work could not expose the cycle: the sixth review showed this). Remove now locks the Work row first. DL-3 holds a Delete part-way (it holds the Work row, waiting at the writing's source arrival) and sends the Remove, so the old order cannot pass; DL-2 now alternates its old topology with sole-claimant pairs that can reach the image row.
- **The server says what became of the Work; the page does not guess.** Round 4 still chose between "this card becomes a *deleted* card" and "the Work stays" from the card's own picture of the Work (kind `writing` vs `writing-keeps-work`). A card with a stale picture could turn a Work the server kept into a permanent "was deleted" card, hiding a live Work from Home. The manuscripts route now answers `{removed, workRemoved}` on the 200 as well as on the 500; the client carries it (`ActResult`, `DeletionUnconfirmed.workRemoved`); the door settles into a "deleted"/"removed" card only on `workRemoved: true`, says "The Work stays" only on `workRemoved: false`, and says only "that writing was already gone" when the server did not say (a 404). The card's picture still decides the wording of the question BEFORE the act, which is the member's to confirm.

| Finding(s) | Disposition |
|---|---|
| server-lock-order-inversion-remove-vs-delete, record-x3-lockorder-visual, breakit-1 | FIXED as above. Probes DL-3 and DL-2 (sole-claimant pairs); hermetic LOCK ORDER test; candidates S21, J23 |
| client-1, page-1, record-ghost-card-stale-kind, breakit-2 (a Work the server kept becomes a permanent ghost) | FIXED as above. Probes KEEP-1/2/3; door tests for stays, goes, unsaid, and custody-unconfirmed with each; candidates H15, H24, H25, L34–L36, J22, S23 |
| client-3, page-2, history-refresh-flag-dropped-on-committed-and-shared-outcomes, record-cd5-fixed-partial, breakit-4 (a failed re-read was dropped on the committed-but-unconfirmed and shared paths) | FIXED: both messages end with the reload line when the re-read failed; tests for Delete, Remove and shared; candidates L37, L39, L40 |
| page-3 (the controller-owns-no-outcome-mapping guard was deleted) | FIXED: the three assertions are back; candidate C6 injects a mapping |
| history-error-body-says-nothing-changed-after-delete | FIXED: the text no longer claims nothing changed; a History that could not be re-read after an act reports it (HY1, HY5) |
| history-several-writings-sentence-points-at-a-control-that-is-not-there | FIXED: it names the door that exists (Remove on Home) and what Remove takes (HY6) |
| history-notices-lost-when-leaving-history-or-mid-flight | FIXED: History's notices live in Home's stack; Back to Home keeps them; an outcome that arrives after Back is delivered (tests; HY4) |
| history-shared-and-notice-test-second-case-cannot-fail | FIXED: one fresh page per case |
| history-notice-appears-off-screen-in-a-long-history | FIXED: one stack, one scroll-into-view, both views (V13, test) |
| history-home-recent-history-not-in-the-re-read | FIXED: Home's short History is part of the re-read (`useStudioHistory` reports whether it read); candidates C5b, LD7–LD9 |
| tests-1 (the History container had no test) | FIXED: `historyContainerAndNotices.test.ts`; candidates HY1–HY3 |
| tests-2 (`workRemoved` for a live writing whose Work stays was unpinned) | FIXED: hermetic cases (with and without custody) and probes KEEP-1/2; candidates J24, S22 |
| tests-5 (`writingDeleteKindFor` untested) | FIXED: unit tests; candidates WK1, WK2 |
| tests-6 (the custody sentence's subject for a Work with no writing) | FIXED: the opening sentence is asserted for the Work route and for a body that does not say; candidates L33, L43 |
| tests-9 (the claim that every decision has a candidate; an unpinned reload sentence) | FIXED: the claim is reworded (section 1); the reload sentence of the Work-stays notice has its test |
| record-ratification-omits-x7-x8 | FIXED: 6.4 Q1 and the "Returned upward" paragraph cover X1–X8; X8 is named as a destructive path |
| record-x1-x8-unchanged-claim-false | FIXED: X1 and X8 now say what SRV-3 changed |
| record-stale-comments-and-claims | FIXED: four comments/titles and the CL-6 line corrected |

Refuted by the skeptics (not acted on, except where noted): server-cleanup-removes-work-without-tombstone (the point is recorded as an open question, 6.3 and 6.4 Q2, not as a defect), client-2, history-loose-delete-destroys-unseen-work and breakit-3 (see the loose-writing line in 6.3), history-one-delete-opens-a-dialog-on-every-act-of-that-writing, tests-3, tests-4, tests-7 (the runner now refuses an empty selection anyway), tests-8, record-5-1-r20-existing-files.

### 6.2d Disposition of round 6 (each of the 15 that stood)

Round 6 found no new locking or erase defect. What stood: a message still dropped at one door, wording that claimed more than the server had said, a regression the previous round had introduced in the offline cabin, and tests and accounting that credited coverage they did not have.

| Finding(s) | Disposition |
|---|---|
| client-1, breakit-2 (the Work card discards the shared refusal's reload line) | FIXED: the error carries whether the page was re-read (`DeletionSharedMaterial.reloaded`); the card's fallback sentence ends with the reload line when it was not; door tests with and without a working re-read; candidates L45, H27, H28 |
| client-2, breakit-4, page-cabin-history-refresh-always-false-and-already-gone (a 200 that does not say whether the Work went was worded "that writing was already gone") | FIXED: a 404 is `alreadyGone`; a 200 without the word says only "The writing in X was deleted"; a custody sentence says "This work was removed" only on evidence (the Work route, or `workRemoved: true`), otherwise "This writing was deleted"; candidates L33, L44, H29 |
| page-cabin-history-refresh-always-false-and-already-gone, breakit-4 (offline cabin: Home's re-read now includes History, which answered 401) | FIXED: the cabin History route answers 200 with the acts the cabin's own tables can establish (a Work begun, something declared in a Work; no source custody, revisions or keeps exist there), in the web route's shape, with its own tests; candidate J26 (an earlier version of this fix answered an empty list on the premise that the cabin records nothing; the seventh review showed the premise false, and the page would have told a member with Works that nothing had been recorded). The cabin's manuscripts DELETE branch still ignores `workId` and answers no `workRemoved` (the open cabin item, 6.3); its answer is now worded neutrally |
| tests-2, page-home-to-history-notice-wiring-unguarded (the Home-to-History hand-over was tested only against a stand-in parent) | FIXED: `homeHistoryNotices.test.ts` mounts the real Home view (Back keeps the alert; a late outcome is delivered; dismissal is single); candidate HY8 |
| locks-1, tests-1 (DL-1/DL-2 were credited with a guard they could not give) | FIXED: DL-1's comment and the record now name the real guards (DL-3, DL-2's new sole-claimant pairs, the hermetic LOCK ORDER test, S21, J23); DL-2 alternates its old topology with pairs that can reach the image row |
| tests-3, record-s17-candidate-dies-of-sql-error (S17 "died" of a bind-parameter error on every request) | FIXED: S17 keeps its parameter and is killed by CE-5d alone; a bind-parameter error now counts as a broken candidate (COMPILE-ERROR), never a kill |
| tests-4 (the "textual guard" label was unreliable) | FIXED: C1–C3, C5, C5b, C6 carry it; D1, D2, D4, D5 are labelled static (they read the migrations; D3 mutates a copy constant and is also killed by a rendering test, so it is not); J23, killed by behavioural tests over a scripted transaction, no longer carries it; W2 and W6 (killed only by SQL-text assertions) do; the record's count follows the runner |
| tests-6 (a test pinned "This work was removed" for a body that does not say) | FIXED with client-2 above: the unsaid case is now the weaker, always-true sentence |
| record-evidence-packet-stale | FIXED: "six rounds"; the blank wide-regression line is removed (the jest line is that measurement) |
| record-section3-x3-q2-small-inaccuracies | FIXED: section 3 lists `useStudioHistory.ts` and the History route; X3 says the Work route gains one locking read and an early 404; Q2 asks for a tombstone for X8 and a lock and a tombstone for Remove |

Refuted by the skeptics (not acted on): locks-2 and locks-3 (outside this delta: other writers of Work children and concurrent image uploads), tests-5, record-superseded-sentence-rows, record-test-comment-route-contract-and-pinned-guess (the pinned-guess half is tests-6, above), record-comments-two-lists-stale, record-6-3-omits-work-stays-race, breakit-1, breakit-3, breakit-5.

### 6.2e Disposition of round 7 (each of the 9 that stood)

| Finding(s) | Disposition |
|---|---|
| cabin-1, record-cabin-history-nothing-recorded-claim, breakit-cabin-history-nothing-recorded (the cabin History answered an empty list on the false premise that the cabin records no acts; the page would tell a member with Works that nothing had been recorded) | FIXED: the cabin answers the acts its tables can establish (a Work begun, something declared in a Work), in the web route's shape, newest first, member-scoped, with the route's limit; the comment, the test header and this record no longer say the cabin keeps nothing; `cabinBranch.test.ts` (6 cases) |
| client-3, tests-h26-candidate-no-longer-embodies-its-named-error, breakit-h26-names-a-branch-it-no-longer-mutates (H26 was silently retargeted by the alreadyGone / unsaid split; two lines had no candidate) | FIXED: H26 now mutates the already-gone notice's own sentence, H30 the unsaid-answer notice, L46 the pass-through of `alreadyGone` from the command to the page |
| tests-w6-w2-unlabelled-text-only, record-d3-static-label-not-only-static (the textual/static labels were not exact in both directions) | FIXED: W2 and W6 are labelled; D3 is not; the count follows the runner (17) |
| tests-compile-regex-too-narrow-for-sql-parameter-errors | FIXED: the broken-candidate guard also matches a parameter-type error and a syntax error, not only the parameter-count message |

Refuted by the skeptics (not acted on): client-1, client-2, cabin-2, breakit-runner-environmental-kills.

### 6.3 Open findings, with what each needs

| Finding | Why it is open | Owner / next |
|---|---|---|
| F3 A declaration added to a Work while a Delete of that writing is in flight can leave the Work naming a gone writing | In the declaration route (`living-works/[id]/expressions`), not the delete surface; its own test file cannot load on canonical (a `server-only` import). The consequence is now recoverable: a Delete from that Work finds the writing gone and the server ends the dangling declaration in the same transaction (X8, probe CE-5). Low | The declaration route's lane; a `FOR SHARE` on the manuscript row inside one transaction is the shape of the fix; a probe is sketched in the round-3 result |
| F4 The offline-cabin branch of the manuscripts route ignores `workId`, does not end the Work\'s declaration and answers no `workRemoved` (the page words that neutrally: "The writing in X was deleted"), and ignores the shared refusal | `MAIA_CABIN_MODE=offline` is not exercised by any test here except the History route\'s | The cabin lane |
| UI-7 A page notice is component state; it is lost if the member leaves Home | Surviving a navigation needs persisted or server-held custody state, a product decision. The server obligation (the queue) is unaffected | Founder |
| Retry after a lost response reports plain success and loses the custody caveat | Same root: no persisted custody status the client can read | Founder |
| X8 (the server ends a Work whose declaration outlived its writing) and Remove both delete a Work row without a tombstone, while a Work that goes with a LIVE writing is tombstoned | Whether the R20 contract ("wholly before or wholly after a recovery point", and a tombstone so a restored backup cannot bring the object back) covers container removal is an unruled question; the two paths are consistent with each other and inconsistent with the third | Founder (6.4 Q2) |
| Delete from a loose-writing line or History names no Work, so if the page's list of Works is stale the Work that holds only that writing goes with it although the dialog may not have said so | The dialog says so whenever the page knows (`writingDeleteKindFor`); a Work declared elsewhere moments ago is not known to it. The act is the ruling's (a Work that held only the writing goes with it) and the member confirmed deleting the writing | Accepted |
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

1. Ratify X1–X8 (section 0). X1–X7 narrow or restore truth; X8 is a destructive path added to the erase (the server ends a declaration that outlived its writing, and the Work with it only if it then declares nothing); all are crossings of the original stop boundary.
2. Should container removal take the R20 recovery-capture lock and write a deletion record? Remove: a lock and a tombstone for the Work row. The Work ended by X8: a tombstone for the Work row (it already runs inside the erase transaction).
3. Is "editorial conversation history retained but unreachable after Remove" acceptable, or must Remove refuse a Work that has any?
4. Should a custody-unconfirmed message be durable (survive navigation and reload)?

### 6.5 Adjudication and closure fields (manual §18, §30)

```
Adjudication         PASS as code, not as a release: the candidate is fit to enter canonical, subject to the founder's local test, the ratification of X1–X8 (6.4 Q1), and the founder's PR and merge acts. All 207 defeat candidates are killed in one full run on the committed tree; 59 PostgreSQL probes pass; the typecheck gate shows no regression; seven independent review rounds are closed (rounds 6 and 7 found no locking or erase defect, and round 7 only low findings, all closed). This is NOT a statement that the founder's production 500 is fixed (section 5): it is a statement that the member is now told the truth about it, and that the dead end and the deadlock are gone.
What this lane did not establish   production's configuration (which R mode occurred); a real browser beyond one founder run in Safari on a migrated copy (section 6.6); real R20/KMS; real vault bytes; the full production schema
                     (the probes use a stub schema plus four real migrations; the Work-level tables are covered by the static drift guard, not by a physical cascade)
Holds in force       no deploy · no PR · no merge · no push without the founder's explicit ask (the branch was pushed on that ask, 2026-11-06) · dispositions.json unchanged ("ruled": false) · frozen branch untouched
Residual risk        the open findings in 6.3; the questions in 6.4
```

### 6.6 Local verification on the founder's Mac (2026-11-06)

**Setting.** A `git worktree` of the pushed branch (head `c1513b7d2`); `npm ci`; `next dev`; Safari; Homebrew PostgreSQL 17.7. Database `maia_consciousness` first, then a copy `ws_delete_test` (section 6.6.2). Member: the demo account `demo.practitioner` with a throwaway password set for the test. Fictional test Works named "DELETE TEST A/B/C/D". No production system was touched and nothing was deployed. The local database holds accounts beyond fixtures (79 members, 39 of them test fixtures), so the copy `ws_delete_test` was made from a database that may hold real people's rows; every action in the run was scoped to the demo member.

**6.6.1 What ran, and what it showed**

| Evidence | Result |
|---|---|
| Nine jest suites (section 4 list) on the founder's machine | 264 tests pass. jest reads path arguments as regular expressions, so a path containing `[id]` needs `--runTestsByPath` or it silently matches nothing (8 of 9 ran at first) |
| Server, real routes, signed in (curl): delete the shared writing through one of its two Works | `409 {"refusal":"declared_in_other_works","works":2}`. Nothing was deleted |
| Server: delete the writing of a throwaway one-writing Work | `200 {"removed":true,"workRemoved":true}`; `ledger.json` and `high-water.json` were created next to the key |
| Screen: Delete on a Work whose writing a second Work holds | First dialog "Delete “…”?" with the list of what goes with a Work → **Delete permanently** → the dialog became **"Remove “…” and keep the writing?"** (copy of `removeSharedWorkCopy(1)`: "This writing is also in another of your Works…") with **Remove this Work** / **Don’t remove** |
| Screen: Remove this Work | Notice "“DELETE TEST A” was removed. The writing itself was not deleted." The Work card went; the other Work still listed its 2 manuscripts |
| Database after that | writing 1 · removed Work 0 · the other Work still declares the writing 1 |
| Screen: Delete on a one-writing Work (C) | The card went and no custody notice appeared (screenshot). **A database confirmation of this row had not been returned when this record was written** |

**6.6.2 Environment findings (none is a defect of this branch)**

1. **The local database was 28 migrations behind this tree.** The first delete returned a bare 500 and the page said "We could not confirm whether that work was deleted. Home now shows what is current, so check it before you try again." The database was unchanged (rolled back). The server log: `function r20_erase_writer_editorial_history(uuid, uuid, uuid) does not exist` (created by `20261021000002` and `20261025000001`); `writer_source_landing_intents` (`20261026000001`) was also absent. The unexpected-database-error path therefore behaved as designed: no claim of success, no claim of failure, state unchanged, Home re-read.
   Remedy used: a copy of the database (`pg_dump` from the PostgreSQL 17 tools; a version 14 `pg_dump` refuses a 17.7 server), then the pending migrations applied to the copy only, in order, each file stopping at its first error. 26 applied. Two were refused: `20260926000002_writer_studio_work_themes` (adds a CHECK of eight lens names; the data holds 36 `overview` rows, a ninth lens added later by `20261002000002`, so the old migration cannot be replayed over later data) and `20260926000003_writer_studio_theme_occurrences` (depends on the first). Neither is on the delete path: nothing in the delete code, the R20 function or the later migrations references them. Not retried.
2. **The Studio is invitation-only in this tree.** `writersStudioBetaAccess`: `admin_role` founder or cto, or an active `beta_tester` contact with `metadata.writers_studio_beta = true`. A signed-in member without it is redirected to the public doorway `/explore/writers-studio?access=invitation-required` (a generic per-product doorway page with the shared "All doorways" and "Sign in" header). For the test a roster row was added in the local database only; no code was touched.
3. **Without R20 settings every writing delete ends in `custody_incomplete`** (`R20_LEDGER_FILE_MISSING` is caught, `recoverySealed = false`). That is the expected custody path and the shape of the production symptom. The production configuration remains unread.
4. **How the shared state is reached.** Home's "Add to a Work" appears only for a writing that is in no Work, so Home's buttons cannot put one writing in a second Work. The declaration route (`POST /api/sovereign/living-works/:id/expressions`) accepts a second Work (the schema deliberately leaves exclusivity unruled), which is how the test state was built. How the state arose in production was not investigated.
5. **Observation (design, not a defect).** The first dialog describes deleting the Work's writing even when that writing is shared; the page learns "shared" only from the server's 409. Nothing is destroyed on that path. A pre-warning in the first dialog is a possible later refinement and a product decision.

**6.6.3 Not exercised in this run.** Section 5.1 (c) to (i); the custody notice on screen (the key file was moved aside and restored twice with no delete between, so the failure was never induced); the notice surviving "Back to Home" from History in a browser; real KMS; production.

**6.6.4 Incidents during the run (recorded, not hidden).** (a) An instruction of mine copied the main checkout's `.env` over an existing `~/.env` in the founder's home folder; the original was not saved (recoverable from Time Machine if it mattered). (b) The test member's password hash was replaced without saving the old one (local database only). Neither touched the repository, production or another member.

**6.6.5 Recommendations on 6.4 (recommendations only: the founder has not ruled, and `dispositions.json` stays `"ruled": false`).**

1. X1–X8: ratify.
2. Tombstone and recovery-capture lock for Remove and X8: a separate lane, after this one merges.
3. Retained content-free editorial origin records after Remove: accept for now; revisit together with question 2.
4. A durable custody message: yes eventually, as its own decision (it needs a persisted status the client can read; today the notice is client state).
5. New, from 6.6.2 item 5: whether the first dialog should warn that a writing is shared. Product decision, not a safety one.
