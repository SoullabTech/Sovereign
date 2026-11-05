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
Current gate:          One gate: when the live Home Work card's Delete is refused because the writing is shared, or succeeds but custody is unconfirmed, does the
                       member get a true sentence and a lawful way forward, without the refusal rule or the erase mechanism changing?
Evidence subject:      local commit e6ce0aa9 on branch claude/ws-delete-shared-and-custody-notice-20261105, base canonical commit:`dcdffad2`. Evidence about code under jsdom
                       and static reading only. Nothing about production, a database, a real server or a browser.
Stop boundary:         This lane may not change the server's shared-writing refusal (eraseManuscript.ts), what Delete erases, or Delete's own copy; may not deploy, migrate,
                       read production, touch AWS, Caddy, compose or the release authority; may not rewrite the lane that shipped the Work-card Delete (#2111) beyond the two
                       named deficits; may not open a PR or merge without the founder's explicit ask. The frozen branch claude/happy-cannon-17pn9x is untouched.
```

**Order of events, stated as it was.** The build came before this preamble. The founder reported the failure; I diagnosed it from the console and the code, built the candidate and its tests, started
an independent review, and only then, on "if we need to Jarvis flow then do it", opened the lane properly. Manual §27 asks for the preamble before any action. It is written now and says so.
(The same lateness is recorded for H1 in `WRITER-SOURCE-INTAKE-LIFT_H1_HARDENING_LANE_RECORD_2026-11-03.md` section 0.)

## 1. Charter (manual §27 template)

**Parent flow:** WS-DELETE-01 (Delete Work: total erasure), with the WORK-SHELF-01 act (Remove Work, keep writing). Not H1: H1's question ("can original-file intake be lifted?") is not the
question this lane answers (§20: success here does not answer H1's governing question).
**Reason opened:** RETURN, from a runtime observation. The founder saw two failures in production on the Work-card Delete that the live Home gained from PR #2111 (a different lane).
**Base:** canonical commit:`dcdffad2`.
**Standing:** the WS-DELETE-01 ruling and its closure conditions are untouched and remain as they were. The 409 refusal stays exactly as ruled.

### Gate question
For two Works that hold one writing, and for a delete the server committed but could not confirm, does the Work card tell the member the truth and offer a lawful next step?

### In scope
- Carry the server's refusal classification on the delete outcome (`lib/writersStudio/deleteWork.ts`).
- Turn ONLY `declared_in_other_works` into a distinct error, and offer the container-only act the existing `removeWork` already performs, as its own named confirmation (`Remove this Work`),
  saying what goes and what stays (`REMOVE_SHARED_WORK_COPY`, `WorkRemoveConfirm.tsx`, the controller's `onRemoveWork`, the card state).
- Hoist the custody-unconfirmed message out of the Work card (the card unmounts when the list is re-read) and render it in every Home layout that shows Work cards, once.
- Tests with defeat candidates.

### Out of scope
- The 409 refusal itself and the erase transaction. Delete's copy, including the confirmation wording that names only the writing (inventory finding P2, still open).
- Why production returned 500 custody_incomplete (a configuration or state question: see section 5, diagnosis).
- The hidden MAIA reply (PR #2125 is acting on it) and every other finding in the pending-deploy inventory.
- The older, unmounted `app/writers-studio/HomeView.tsx` and its own removal door.
- Any change to the living-works route.

### Evidence inherited
- `WRITER-SOURCE-INTAKE-LIFT_H1_PENDING_DEPLOY_INVENTORY_2026-11-05.md` findings P1 (custody message dropped, read by me directly) and the shared-writing dead end (rated low there; the founder's screenshot shows it is not).
- The founder's console and screenshot: DELETE `eff1f605…` 409 twice; DELETE `21d05bdf…` 500 followed at once by GET living-works and GET manuscripts.
- `eraseManuscript.ts` (the 409 comes from `claims.rows.length > 1`; the 500 from `sweptAll === false` or a caught exception).

### Required falsifier (weaker candidates that must fail)
Each is a plausible, wrong, smaller fix. The suite must kill every one (section 4).
- Reword the refusal copy only (the dead end survives).
- Offer removal that goes through the manuscript erase route, or call Delete again.
- Classify every failure as "shared", or none.
- Show the custody message inside the card (it unmounts), or only in the layouts that have loose writing.
- Render the notice twice where loose writing is present.
- Let Keep it leave the card in the removal state; leave the dialog open after the custody notice.
- State that "nothing is deleted" in the removal copy (the Work, its MAIA conversations and its image do go).

### Exit
PASS (as code): the candidate is fit to enter canonical, subject to the founder's PR and merge acts. STOP: any survivor, any untrue sentence in the removal copy, or any path by which the writing is erased or orphaned.

## 2. State recovery and cross-lane custody (manual §14, §25, §41)

- Canonical `dcdffad2` at the start; the branch is one commit (e6ce0aa9) on it.
- **Authority direction.** Runtime evidence (founder) goes up to the WS-DELETE-01 ruling; implementation sits below it. This lane returns its findings upward and fixes only the two named deficits in code
  another lane shipped (#2111, branch `claude/ws-delete-work-20261104`). It does not adjudicate that lane's other choices.
- **Concurrent lanes discovered, not duplicated.** No open PR touches the Work-card Delete. #2125 ("hidden MAIA reply") addresses a different inventory finding; #2113 ("a repeat upload no longer creates another
  manuscript and Work") may be related to how two Works came to hold one writing. I have not verified that, and this lane does not rely on it.

## 3. What was built

| File | Change |
|---|---|
| `lib/writersStudio/deleteWork.ts` | outcome carries `refusal`; `DeletionSharedMaterial`; `REMOVE_SHARED_WORK_COPY` |
| `app/dev/writers-studio-pc3-live/P4R1HomeController.tsx` | maps only `declared_in_other_works` to `DeletionSharedMaterial`; `onRemoveWork` (existing `removeWork`); passes it down |
| `app/dev/writers-studio-pc3-live/P4R1HomeView.tsx` | card state for the shared case; hoisted notice; notice rendered in returnWork, continue and many-Works layouts (no duplicate beside loose writing) |
| `app/dev/writers-studio-pc3-live/WorkRemoveConfirm.tsx` | the removal confirmation (new) |
| `app/dev/writers-studio-pc3-live/__tests__/homeWorkDeleteSharedAndCustody.test.ts` | 23 tests (new) |

## 4. Evidence packet (as of the candidate commit)

```
subject        local commit e6ce0aa9 on canonical commit:`dcdffad2`
scope          the two deficits above; no server, schema, route or copy-of-Delete change
instruments    jest (jsdom mount of the real P4R1HomeView, unit tests on deleteWork/removeWork, comment-stripped source-reading guards on the controller);
               the repository's typecheck gate; a mutation script; an independent four-lens read-only review with a skeptic on every medium-or-higher finding
result         new file 23 of 23 pass. Wider run (app/writers-studio, app/dev, lib/writersStudio, app/api/sovereign/manuscripts, app/api/sovereign/living-works): 2,821 passed,
               0 failed tests; 8 suites fail to LOAD: 7 in lib/writersStudio/listen and publish (checked against canonical earlier in this session) and the living-works expressions route.test.ts
               (run on canonical alone just now: the same failure, a server-only import). Typecheck gate: no TypeScript regressions, exit 0.
counterexamples  16 mutants (one per falsifier above), all killed. One survived the first run (V7: a duplicated notice beside loose writing) because my test used the one layout that never carries the
               new notice; the SUITE was repaired (two layouts added), not the code, and V7 then died.
independent review   see section 6
post-state     local commit only. Not pushed. No PR.
```

**Found on the way, left open:** `app/dev/writers-studio-pc3-live/__tests__/homeDeleteWriting.test.tsx` is not matched by jest's `testMatch` (the config lists individual `.tsx` files; this one is absent), so the existing
Delete-writing tests do not run in the default suite. This lane's own test is a `.ts` file so that it does.

## 5. Diagnosis of the production 500 (not part of the candidate)

See the independent review's diagnosis in section 6. The repository cannot say which mode occurred; it can say which log lines and which configuration would distinguish them.

## 6. Independent review, adjudication and closure

(To be completed when the review reports: findings, skeptic verdicts, fixes, final adjudication and the closure fields of manual section 18/30.)
