# WS-DELETE-01 · CABIN-PARITY — cabin manuscript Delete ends the Work's declaration (lane record)

## 0. Lane preamble

```
Class:                 A (an irreversible member act, and the WS-DELETE-01 promise "no detached state", in the offline cabin)
Governing authority:   WS-DELETE-01 founder ruling 2026-09-07 (docs/programme/WS-DELETE-01_TOTAL_ERASURE_RULING_2026-09-07.md): Delete means
                       deletion; no detached state; a writing declared by more than one Work is REFUSED, never destroyed.
                       Task instruction 2026-11-06: give the cabin branch of DELETE /api/sovereign/manuscripts/[id] the web path's observable
                       contract, in one cabin-store transaction; web path, deploy and migrations out of scope; no push or PR unless asked.
                       Later founder instructions: "push when ready" (the branch), "if it is the correct thing to do" (a PR), "ready" (out of draft).
                       The founder armed auto-merge themself and merged the base into the branch four times. GitHub merged the PR. This lane did
                       not merge it, approve it, or apply any label.
Current gate:          One gate: after Delete in the offline cabin, does any Work still declare a writing that no longer exists, and does the cabin
                       answer the web path's contract (statuses, bodies, check order)?
Evidence subject:      PR #2166, merged 2026-11-08T12:45:59-05:00 as 03f0d2052; last PR head 533163323. Evidence is about code under hermetic Jest
                       against a real CabinLocalStore on a temp SQLite file. Nothing about a running cabin, a browser, production or any deployed build.
Stop boundary:         No deploy, no migration, no production read, no change to the web path. Merge is not deploy.
```

## 1. What prompted it, and a premise that did not hold

The offline-cabin branch of `DELETE /api/sovereign/manuscripts/[id]` called `store.deleteManuscript()`, which removes the writing and its sections and
nothing else. `living_work_expressions.expression_id` has no foreign key to `member_manuscripts` (a Work's expressions are open by design), so a Work
that declared the deleted writing kept naming it: the detached state the ruling forbids by name. The cabin also ignored `workId`, had no
shared-writing refusal, and answered `{ removed: true }` with no `workRemoved`.

**The task described the web contract as already present** (`?workId=` validation, `work_no_longer_holds_it`, `workRemoved`, two reference tests). In the
checkout it was not: none of those strings existed on any ref the session could see. The cabin side was built from the task's description, flagged as
unverified in the PR body, and re-checked when the web lane turned up on the base (commits `e6ce0aa94` … `f220b9ed9`, the series ending "close the sixth
independent review of Work-card Delete"). Reading the real `eraseManuscript.ts` and its `deleteWorkParam` test found **four differences** in the first
version, all fixed before merge:

1. Writing already gone, named Work still declares it: the web path ends that declaration (and the Work, if it declares nothing else) and answers 200.
   The first cabin version answered 404 and left the detached declaration.
2. 400 body: web is `{ error: 'Bad request' }`; the cabin had its own string.
3. A repeated `workId` uses the first value (`searchParams.get`); the cabin had rejected repeats.
4. `workId` is lower-cased before comparison; the cabin compared case-sensitively, so an upper-case UUID read as a stale card.

## 2. What was built

`CabinLocalStore.eraseManuscript(memberId, manuscriptId, workId?)` (`lib/cabin/localStore.ts`), one `BEGIN IMMEDIATE` transaction; every refusal returns
before any write. Ending a declaration is one shared helper (`endDeclaration`) for the live and already-gone paths. The route's cabin branch
(`app/api/sovereign/manuscripts/[id]/route.ts`) reads `workId` as the web path does and answers:

| Case | Cabin answer | Same as web |
|---|---|---|
| `workId` present and not a UUID | 400 `{ error: 'Bad request' }`, store never opened | yes |
| writing gone, named Work still declares it | declaration ends; Work goes if empty; 200 `{ removed, workRemoved }` | yes |
| writing gone, no Work named or Work does not declare it | 404 | yes |
| named Work no longer declares the writing | 409 `{ refusal: 'work_no_longer_holds_it' }` (checked before sharing) | yes |
| more than one Work declares it | 409 `{ refusal: 'declared_in_other_works', works: n }` | yes |
| otherwise | writing, the named Work's declaration, and the Work if empty; 200 `{ removed, workRemoved }` | yes |

Deliberately different: no custody step (the cabin has no vault bytes or R20 ledger); the session cookie is set on refusals as well as success. With
`workId` omitted, the one declaring Work's declaration still ends, so nothing is left naming a gone writing.

`living-works/[id]` DELETE (cabin) was checked for the same gap and has none (declarations cascade; nothing references a Work; the cabin has no
Work-visuals table). It is pinned by a test, not changed.

## 3. Evidence packet

| Claim | Class | Source |
|---|---|---|
| Cabin code, route change and both test files are on the base | WITNESSED | `git show origin/clean-main-no-secrets:<path>` after the merge |
| CI green on `b3c0309d8` (12/12), `f07bbb332` (12/12), `dd959d33f` (12/12), `4f174bf30` (11/11) | WITNESSED | check runs read through the GitHub API, including the TypeScript no-regression gate, `build`, `covenant-gates`, `sovereignty` |
| CI green on the final head `533163323` | ENTAILED, not read | a `check_suite.completed` event said no suite running or failed, and GitHub merged; that head's check runs were not read |
| The cabin tests pass (`cabinDelete` 30 cases, `cabinWithdraw` 3) | AUTHOR-RUN ONLY | scratch Jest toolchain in the authoring container; 22 suites / 272 tests across `lib/cabin`, `app/api/cabin`, `app/cabin`, both route test directories and `deleteWork`, including the web path's own `deleteWorkParam` and living-works `deleteRoute` tests, on the merged tree at `f07bbb332` |
| The tests can fail | AUTHOR-RUN ONLY | 12 deliberate mutants against the final code, each killed by its intended test (check order, unconditional Work delete, no transaction, gone-writing cleanup missing / too wide / on a guess, case-sensitive `workId`, cabin-specific 400 body, repeats rejected, validation after store open, lone declaration not ended, cookie only on success) |
| Route and store typecheck | WITNESSED | the TypeScript no-regression gate (`app/**` plus the import graph) |

**Correction.** The PR body said "CI is the evidence of record" and ticked "Unit tests pass". For these tests that overstated it. No PR-time workflow
runs the general Jest suite. The only direct Jest invocations in `.github/workflows` are two fixed-file runs for unrelated lanes (astro-pro, iOS client
lifecycle). Of the 13 npm scripts that wrap Jest, the only one any workflow calls is `npm test` in `mobile-deploy.yml`, as a non-blocking step
(`|| echo`); `deploy.yml` runs `test:ci` and `test:integration` with `|| true`. So the two new test files are **not run by CI**; the green checks
above cover types and the repository gates, not these assertions. The tick rests on the author's own run. (Checked 2026-11-08 by reading the
workflow files and `package.json`; a workflow added later, or one invoked indirectly through a script this check did not follow, would change that.)

## 4. Open items, and what each needs

1. **Run the cabin tests where they count (founder's machine).** They are not in CI, so the repository's own convention applies (the founder's run is
   the evidence of record). One command, Node 22 (the cabin store uses `node:sqlite`):
   `npx jest --config jest.config.js cabinDelete cabinWithdraw`. Whether to add them to a PR-time workflow is a separate decision.
2. **Class A sign-off is not recorded.** The PR template says Class A needs founder or mentor approval (a maintainer may bridge it with the
   `covenant-signoff` label). The PR carried neither and was merged by the founder's auto-merge. If WS-DELETE-01 wants a recorded decision, it needs
   one line here or on the PR.
3. **PHI position and the free-text ruling** — see section 5.
4. **Existing cabin databases.** A cabin that deleted a writing before this change may hold declarations naming it. They are cleaned only when the
   member presses Delete on that Work's card (item "writing gone, named Work still declares it" above). A bulk repair is a separate data-repair decision;
   a read-only count on a real cabin database should come first. That count has to run where the cabin database lives; this lane could not.
5. **Reach.** Merged is not deployed. This record establishes nothing about where, or whether, an offline-cabin build ships.
6. **Housekeeping.** The remote branch `claude/optimistic-hamilton-qrvmnw` is merged and can be deleted.

## 5. PHI position (the PR's unticked box)

The PR template asks the author to attest "This PR does not touch PHI-related paths/tables." The box was left unticked on the stated ground that the
project's PHI definition could not be checked. **That ground was wrong:** the definition exists (`docs/security/phi-columns.md`, with
`docs/security/phi-encryption-do-not-break.md` and `docs/security/free-text-phi-doctrine.md`); the first search used the wrong patterns.

Read afterwards:

- **Canonical column list.** None of `member_manuscripts`, `manuscript_sections`, `living_works`, `living_work_expressions` appears in any of the three
  documents. They are tables in the cabin's local SQLite, not the Postgres clinical schema.
- **What the PR does to data.** It deletes rows. It adds no logging, returns no content, and changes nothing about how any text is stored, logged or
  encrypted. The PHI Encryption Checklist is about reads and writes of PHI columns, which this PR does not do.
- **Position:** by the canonical list, the box could honestly have been ticked.
- **Not settled by this lane.** `free-text-phi-doctrine.md` is status **Draft** and says free text that "may reference a client" is PHI by default. Read
  literally, a member's manuscript is free text. This lane reads the doctrine as aimed at practitioner and client data; that reading is not a ruling.
  The cabin SQLite is plaintext by design and was before this PR.

## 6. Questions returned upward (this lane does not decide them)

1. **Is a member's own writing in scope of the free-text PHI doctrine?** If no, the doctrine should say so, and the PHI box is a plain tick for
   Writer's Studio PRs. If yes, the manuscript tables (web Postgres and cabin SQLite) are missing from the PHI column list and owe an encryption lane.
   Today's state is an implicit "no".
2. **Should a Class A decision be recorded for this lane**, given the PR merged without one?
3. **Should the cabin tests join a PR-time workflow**, so that "unit tests pass" is something CI can witness rather than the author?
