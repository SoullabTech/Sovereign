# Writer source intake · hardening branch record (2026-11-02)

```
STANDING:  CANDIDATE CODE, TESTED, PROPOSED FOR MERGE TO CANONICAL on the founder's "merge" (2026-11-03). NOT deployed.
           A merge to canonical is a code merge only: this branch carries NO migration, so it is not a schema-deploy authorization.
BRANCH:    claude/writer-source-intake-hardening  (descends from claude/writer-source-intake-acceptance-plan)
BASE:      canonical c051385be80ad29c42ae40806bc3acf062f52cda (canonical has since moved; see section 3a)
AUTHORIZED BY: founder "yes" to making the plan's decisions D1-D4, D5, D6 and D9 as small tested changes on their own branch;
           founder "1 yes 2 approved 3 merge" (2026-11-03): D4 as an atomic refusal, the abandoned-upload sweep, and merge.
DOES NOT:  lift either Caddy hold · change releaseAuthority.ts (canonical's own change to it, section 3a, is not this branch's) · create an AWS resource · touch a credential ·
           admit member data · un-freeze claude/happy-cannon-17pn9x · mark any disposition ruled.
CLAIM STATE: DESIGNED + TESTED IN ISOLATION. Nothing here is LIVE, and merging does not make it live: only a deploy does, and
           that is not part of this change. "Tests pass" is a claim about code, not about MAIA.
PLAN:      docs/programme/WRITER_SOURCE_INTAKE_ACCEPTANCE_PLAN_2026-11-02.md (section 11 holds D1-D11)
```

## 1. What is on the branch

| Commit | Decision | Change |
|---|---|---|
| `24d613c0` | replay await | Every `return loadRecordedArrival(` is now `return await ...`, so a database fault on replay is wrapped as `source_landing_incomplete` instead of leaking raw. |
| `c1b7d008` | D9 | KMS client gets `connectionTimeout` 3 s and `requestTimeout` 10 s **with `throwOnRequestTimeout: true`**. Bounded env overrides, malformed values refused. |
| `311c2d5d` | D1, D3, D6 (server) | Ingest route: pilot-roster check (403), 20/hour/member limit (429), posture header required (428 missing or malformed, 423 Sanctuary), whitespace-only text 422 and NUL-containing text 422 **before** any custody write. |
| `40165214` | D6 (client) | Import room reads the live posture at the act, sends it, refuses to send an original in Sanctuary, and does not mislabel the 423. |
| `5d4ae6ef` | D5 | Delete Work copy no longer says nothing is kept; it names pre-today backups. `permanentErasureCertified` stays false. |
| `e142a3a7` | D4 (first pass) | Labelled-honestly fallback. **Superseded by `41744030`**, which restores the decision as written. |
| `4deb4c09` | D3 (door) | `discardIncompleteLanding` + `listMemberUnfinishedUploads`. |
| `fc9aad14` | D3 (routes) | `GET /api/sovereign/manuscripts/unfinished-uploads`, `POST .../discard`. |
| `5f856eae` | D3 (screen) | Import room lists what is held and offers a two-step Remove. |
| `0d87ff7c` | D2 | Workbench upload POST held in code once the manifest releases member intake; sources POST hold pinned. |
| `27c6550a` | D5 (completed) | The one-line hint beneath Delete (live copy and the design fixture that mirrors it) no longer says "Permanently". Found by running falsifier SF-17 against this branch; the first D5 pass reworded only the confirmation body. |
| `41744030` | D4 (as decided) | The original's claim now runs **inside the transaction that creates the Work**. If it cannot bind, nothing is saved, the member is told so plainly and may retry (409 `source_custody_not_bound`, content-free log). No Work exists without its source, and no refused import leaves a half-saved Work. |
| `06305637` | D3 (sweep) | `sweepAbandonedLandings` + `scripts/ops/sweep-abandoned-landings.ts`. **Designed, unwired, dry-run by default.** Deletes only incomplete upload intents older than a 24-hour floor with no live write lease, through the member door with its own authority record. Never touches a recorded arrival. Applying needs `--apply` and `WRITER_LANDING_SWEEP_CONFIRM=delete-abandoned-uploads`. |
| `f328d22b` | D6 (second client) | The Press Manuscript Room (`app/press/manuscript/page.tsx`) is a second client of the ingest route and had not been taught the posture claim; once released it would have been refused 428 on every upload. Fixed, and a source-reading guard now requires every client of the route to read and send the posture. Found while trial-merging against current canonical. |
| (this commit) | review fixes | The eight findings of section 3b. |

## 2. Evidence, with its limits

| Check | Result |
|---|---|
| Dynamic probes, real landing library, real PostgreSQL 16, real vault, **fake KMS** | 29 of 29 pass (S5a-S5e removal; S6a-S6d the atomic claim; S7a-S7d the sweep); PDF fixtures 2 of 2 under `tsx` |
| D4 atomic claim | 10 route-outcome tests (transaction double records commit and rollback), 18 import-Work tests, 14 integrated import interaction tests; the mutants of the claim path were killed on named tests (a redundant `!fileArrivalId &&` clause I had introduced survived as an equivalent mutant and was removed, with precedence now pinned) |
| Sweep | 42 unit and script tests; library mutants SW1-SW10 and unit/script mutants SC1-SC10 all killed (confirm gate, floors, truthy `apply`, authority record, exit codes, error-name-only logging, no raw member id) |
| Press page posture guard | 4 tests; six page mutants and an unguarded third client caught, a comment-only mention correctly ignored |
| Removal library mutations (lease guard, tombstone, erasure queue, seal handling, destroy handling, member filter, recorded-arrival guard, obligation cleanup, shared-reference guard) | 9 of 9 killed, each on a named probe. M9 first **survived**, which exposed a missing probe (S5e). |
| Route mutations (routing, pending-as-removed, trusted body or query identity, raw error logging, uuid check, roster gate, status mapping, auth, caching) | 12 of 12 killed. R8 first **survived** (no test sent a competing identity to the list route). |
| UI mutations (17: pending shown as removed, no confirmation, failure drops row, no in-flight guard, HTML filename, posture header, local-review mount, empty card, id in DOM, hard-coded kind, silent unavailable, gated on release, no refresh, unfocused safe choice, unfiltered items, success on any 200) | 17 of 17 killed. U11 first **survived** (only the unclaimed row was ever removed in tests). |
| D2 mutations (inverted or fail-open predicate, ignored or truthy encryption flag, flipped constant, no hold, wrong order, wrong status, cacheable, sources reading the manifest or parsing first) | 14 of 14 killed. |
| `npm run typecheck` (the no-regression gate) | **Passes: 214 errors, baseline 214.** It first FAILED with 46 new `@prisma/client` diagnostics; the identical 46 appear on untouched canonical in this container because the Prisma client was never generated (`npm ci --ignore-scripts`). After `npx prisma generate` the gate is green. No diagnostic sits in any of the 26 TypeScript files this branch changes. |
| Surrounding regression (`app/writers-studio`, `lib/writersStudio`, `lib/manuscript`, `app/api/sovereign`, `app/api/writers-studio`, `app/api/book-studio`, `lib/workbench`) | At `06305637`: 346 suites pass, 17 fail, 4129 tests pass, 13 fail. **The same 17 failing suites and 13 failing tests fail on the untouched docs tree** (canonical at the old base plus docs only; compared by failing test name; 7 are the listen/publish set, 10 are others). None is caused by this branch. |
| Trial merge of current canonical (`21663ec6`) into this branch, in a throwaway worktree | **No textual conflicts** (the only file both sides touched is `app/dev/writers-studio-p4r1/p4r1-live.css`, merged automatically). On the merged tree `npm run typecheck` passes (gate green) and `npm run ci:sovereignty` and `npm run check:phi-gate` pass. The intake-related jest suites show the same failures as **canonical alone**: see section 3a. `check:record-shas` could not run (shallow clone in this container); it is a CI check and every `commit:` reference this branch adds is a pushed commit. |
| `homeDeleteWriting.test.tsx` (skipped by the default jest match) | 10 of 10 pass with `--testMatch '**/homeDeleteWriting.test.tsx'` |

**Ceiling.** KMS is a recording fake, the schema is the witness script's stub plus three migrations, the R20 ledger is mocked, and no
HTTP server is involved except where a test stands one up on loopback. None of this is evidence about real AWS, real production
data, or the live Caddy configuration. The earlier AWS-reach incident (plan section 10.1) stands as disclosed.

## 3. Where the branch departs from what was decided

1. **D4 (resolved).** The first pass labelled instead of refusing, because the claim ran after the Work had committed. The founder
   approved moving the claim into the Work-creation transaction (`41744030`), so the branch now refuses as the decision was written.
   A refusal returns 409 with a plain message and `retryable: true`; nothing is saved. A pasted import is treated the same way.
2. **D2 is a conditional hold, not an unconditional one.** The workbench upload is a live founder tool (`UploadDropzone`) and the
   repository has no Caddy rule for it; the live Caddyfile is unread. The route is held only when the manifest releases member intake
   and the store is not envelope-encrypted, which is exactly the moment the edge rule is removed. Before that, behaviour is unchanged.
   "Tied to the manifest" cannot mean "open when released": that would open a plaintext store.
3. **D3's sweep (resolved, with limits).** The founder approved it. It is built (`06305637`) but **unwired and unscheduled**: nothing
   calls it, and an operator must run it with an explicit confirmation. It covers **incomplete upload intents only**. A recorded
   arrival that was never claimed by a Work has its own 24-hour policy documented in the retention-index migration; **that policy is
   deliberately not applied here**, because deleting something the system already recorded as received is a larger decision than
   clearing a stalled upload. Scheduling the sweep, and applying the second policy, are separate founder decisions. No member-facing
   copy may say abandoned uploads are cleared automatically.
4. **The list mounts whenever the Import room is a server session, including while intake is held.** Removal is the member's right
   over what is held for them and must not wait on the hold. When deployed this adds one request to a page that is currently held.

## 3a. Canonical moved while this branch was open

Between the branch base and 2026-11-03, canonical gained 89 commits. The one that matters here is PR #2066 (`25e911f8`): it sets
`sourceIntakeReleased: true` in `lib/writersStudio/releaseAuthority.ts` (manifest `...-intake-released-20261102`). That was a separate
lane's act; this branch does not touch that file. Consequences of merging this branch onto that canonical:

- **D2 becomes active.** The workbench upload POST (`app/api/book-studio/workbench/uploads`) is held in code exactly when the manifest
  releases member intake and its store is not envelope-encrypted. With the manifest now released, merging turns that hold on for the
  plaintext workbench store (a founder-facing tool, `UploadDropzone`). This is the behaviour D2 was designed to have; it is stated
  here so it is not discovered after a deploy. Nothing is deployed by this change.
- **D1, D3, D6 and D4 now sit on a released route**, which is where they were meant to matter: any signed-in member could otherwise
  upload, with no roster, rate limit, posture, empty-text or custody-refusal guard.
- **Three suites fail on canonical itself** after that flip, with the same failing tests with or without this branch:
  `ingest/__tests__/transportBoundary.test.ts` (the three F7 "Source 423 hold" tests still expect a 423 hold that a released manifest no
  longer produces), the production-default export-certification fence, and `jarvisMaiaUnsentComposerCustodyR1.interaction.test.ts`
  (plus the pre-existing `readings` route test). They belong to the release lane and are **not** altered here: the F7 tests assert a hold,
  and deciding what they should assert once intake is released is that lane's call. Anyone reading a red check on this merge should
  compare it against canonical before blaming this branch.

## 3b. Independent adversarial review of this PR (2026-11-03), and what it changed

After the PR was opened, six read-only reviewers (ingest route and clients; the D4 claim transaction; data deletion and the sweep; KMS and landing;
holds and copy; cross-cutting privacy) each read the product-code diff, and a separate skeptic then tried to REFUTE every finding before it was
believed. 19 agents, no write access, no database. **8 findings stood; 5 were refuted.** None was a blocker or high. All 8 were defects in this
branch's own changes and are fixed in the commit that carries this section:

| # | Sev. | Finding | Fix |
|---|---|---|---|
| 1 | medium | A save whose response was lost (first save committed) retried into a permanent 409 that said "Nothing was changed. You can try again." A Work from the first save existed. | The refusal is classified: `source_already_attached` (a Work of the member's already holds it) and `source_original_unavailable` (no unclaimed original held, or its bytes are gone) are **non-retryable** with true copy; only a thrown claim stays `retryable`. Both clients drop the dead reference and return to the source step. |
| 3 | low | Every falsy claim was one retryable message, and the clients kept resending the dead id. | Same fix. A lookup that cannot establish the cause stays the retryable refusal: a cause that was not established is never presented as permanent. |
| 5 | medium | The removal door listed the original the import in progress still held; removing it stranded the import behind the 409. | `P4R1UnfinishedUploads` takes `heldArrivalId`; the Import room passes the arrival it holds; that one is not offered. |
| 4 | low | An uppercase UUID wrote the refusal marker under the caller's spelling, which no reader matches. | The route lowercases after validation; the library writes the id the database returned. |
| 6 | low | `--limit` above 500 exited 1 (a failure) instead of 2 (a refusal). | The script enforces the library's ceiling before any connection. |
| 2 | low | An unresolved posture told the member to use "Quick Settings", which is on neither upload screen. | Both clients now use the sentence the other Writer surfaces use ("...Open MAIA here once, then try again."); a guard forbids the phrase on any ingest client. |
| 7, 8 | low | The Delete copy said backups "made before today" can hold a copy; the newest backup, taken earlier today, can. | "Private backups already taken". |

Refuted (and why they are not fixed): `Retry-After: 900` against a 3600 s window (a hint, and a refused-late client is told again); paste-path atomicity without a
default-run test (covered by the PG16 probes S6a-S6d); KMS timeout not bounding a stalled body after headers (the SDK's own limit; not introduced here); the D5 backup
sentence shown only on the hint path (the confirmation is the main path); rate-limit counter written before the posture gate (identity-keyed counter only, no content).

Each fix was mutation-checked: 10 server, 14 client, and 9 unit/PostgreSQL mutants, all killed. The check also caught **two vacuous tests of mine**: the first uppercase-UUID
route test used a digits-only id (which has no case, so a route that did not lowercase passed it), and one mutant (`.toLowerCase()` on an id that the database already
returns lowercase) survived as redundant and was removed rather than excused. PostgreSQL 16 probes: **31 of 31** (new S5f, S5g).

**What this review is not.** It is a read-only pass by agents with a skeptic stage, not an audit and not a human review; a reviewer finding nothing in an area is not evidence the area is
sound. It could not run anything that needs real KMS, AWS or a browser.

**Instrument fixtures, re-measured.** Canonical changed the DOCX parser on 2026-11-03 (`8337a1ca`: tables that cannot be gridded are kept as text; `89cffd7a`: embedded pictures are
brought in), so two fixture expectations in `tests/constitutional/writer-source-intake/fixtures.mjs` (`docx-table-no-header`, `docx-embedded-image`), recorded as "refused, inferred from source",
were wrong; the dynamic probe P1 measured it and they now say "accepted". The fixtures module's own self-test was **already red before that edit** (37 of 39: source-anchor drift from canonical's DOCX
change and from this branch's route changes) and is **39 minus 4 after it**: the module's independent model still carries the old source facts, so it now also disagrees with the re-measured
entries. That model has not been re-pinned; it is the same requalification section 5a says the instrument owes before it is relied on. Nothing is wired to it.

## 4. Findings made while building

- `requestTimeout` alone only logs a warning in this SDK's handler; without `throwOnRequestTimeout: true` a stalled KMS call is never
  aborted. Measured against a silent loopback server; the rejection now arrives in about 1.6 s after three attempts.
- A `BYTES_VERIFIED` intent keeps its 10-minute write lease (schema CHECK), and the guard trigger forbids any update of that row except
  its single transition, so its lease can only lapse with time. Removal therefore refuses for up to ten minutes after the last write.
- `manuscript_source_arrivals.artifact_ref` has no uniqueness constraint, so a shared reference is constructible; the removal door
  refuses to destroy bytes another record references (probe S5e).
- `POST /api/writers-studio/sources` was a hard 423 that **no test pinned**. It is pinned now, including when the manifest releases.
- **Residual not closed:** a writer whose lease has expired but whose process is merely slow can still publish a file after a removal
  commits. Its own database update then fails (epoch fencing), but the unreferenced file waits for an operator sweep.

## 5. Still owed, and still the founder's

Not done: the three AWS steps and key policy (plan phases 0 and 2) · reading the live Caddyfile · any run against real KMS ·
removing either Caddy hold · **deploy** · scheduling or wiring the sweep · the recorded-but-unclaimed arrival retention policy ·
ratifying `dispositions.json` (still `"ruled": false`). Note: `sourceIntakeReleased` is now `true` on canonical by another lane's act
(section 3a); whether a deploy of that state is acceptable before the AWS steps are done is the founder's call, and this record does not
assert that it is.

Built since this record was first written, on the docs branch `claude/writer-source-intake-acceptance-plan` (head `d6c327a71da6c4470765cad125c4e85303c70c89`): 20 static
falsifiers, a rebuilt receipt, a lethality matrix and a STATUS file. They are not frozen, not wired, and authorize nothing. See that branch's
`tests/constitutional/writer-source-intake/STATUS.md` for what is measured and what is not.

## 5a. This branch measured against those falsifiers

> **Dated, and not carried by this merge.** The twenty falsifiers, the matrix and the receipt live on the docs branch
> `claude/writer-source-intake-acceptance-plan`; this branch carries only an earlier work-in-progress slice of the instrument
> (fixtures, scanners, receipt, tree and strip libraries, the dynamic probes). The measurements below were taken **before** the atomic
> D4 claim, the sweep and the press-page fix, and against canonical **before** `sourceIntakeReleased` became `true`. Several falsifiers
> declare today's state as `released: false`. **Before the docs branch merges, the instrument must be re-run and re-baselined against
> current canonical**: the SF-03 inventory and SF-18 hold-pinning set (below), SF-10 (a sweep now exists, but the law still names
> `inspectMemberIncompleteLandings`), SF-09 (now a true refusal), and every `expectedToday` that assumes a held route. Merging this
> branch does not discharge that, and the "owed by whoever merges" item below transfers to whoever merges the instrument.

Run on this branch's tree, 14 of the 20 are GREEN (docs tree: 8). Six flipped from RED as intended: SF-02 (D2), SF-04 (D1), SF-05 (D3), SF-08 (D6),
SF-11 (await), SF-12 (D9); SF-09 (D4) and SF-17 (D5) also read GREEN. Findings that came out of the cross-check:

- **SF-17 found an incomplete fix of mine** (the Delete hint), now fixed in `27c6550a`.
- **SF-09 stayed RED at first because the falsifier could not follow a value stored in a ref**, not because of a gap; the falsifier was extended, with a
  fix case that fails against the old recogniser and three decoys that fail against two over-permissive ones.
- **Six stay RED and are not this branch's to close:** SF-10 (the retention sweep is not built, and the law also names a function this branch bypasses),
  SF-13 (KMS Decrypt inside the claim transaction), SF-15 and SF-16b (infrastructure), plus **SF-03 and SF-18, which go RED correctly because this
  branch moves what they inventory.**
- **Owed by whoever merges this branch, in the same change:** update the suite's declared inventory for `app/api/book-studio/workbench/uploads/route.ts`
  (SF-03: it is now release-gated, no longer plaintext-founder-only) and its declared hold-pinning test set (SF-18: three new tests pin held state).
  Neither is a defect in this branch; they are the instrument noticing the code moved.

Open reviewer defects remain in `receipt.mjs`'s documented limits (a runner that lies consistently still yields a valid receipt) and the self-tests of the harness
are about two-thirds mutation-tight (70 of 96 sampled mutants killed); both are stated in the STATUS file.

## 6. Reproduce

```
# unit and interaction (default jest config)
npx jest --config jest.config.js --ci --coverage=false \
  lib/manuscript/source app/api/sovereign/manuscripts app/writers-studio lib/workbench \
  app/api/book-studio app/api/writers-studio/sources
# real PostgreSQL 16 + vault, fake KMS (needs root and the postgres 16 server binaries; elsewhere set DATABASE_URL to a disposable loopback db)
bash tests/constitutional/writer-source-intake/dynamic/run-local-pg16.sh
# typecheck gate (generate the Prisma client first on a fresh container)
npx prisma generate && npm run typecheck
```
