# Writer source intake · hardening branch record (2026-11-02)

```
STANDING:  CANDIDATE CODE ON A SEPARATE BRANCH. Tested. NOT merged. NOT deployed. NO pull request.
BRANCH:    claude/writer-source-intake-hardening  (descends from claude/writer-source-intake-acceptance-plan)
BASE:      canonical c051385be80ad29c42ae40806bc3acf062f52cda
AUTHORIZED BY: founder "yes" to making the plan's decisions D1-D4, D5, D6 and D9 as small tested changes on their own branch.
DOES NOT:  lift either Caddy hold · change releaseAuthority.ts · create an AWS resource · touch a credential ·
           admit member data · un-freeze claude/happy-cannon-17pn9x · mark any disposition ruled.
CLAIM STATE: DESIGNED + TESTED IN ISOLATION. Nothing here is LIVE. "Tests pass" is a claim about code, not about MAIA.
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
| `e142a3a7` | D4 | Work creation that could not bind the original is labelled honestly, logged content-free, and the member is told once before the Work opens. **See section 3: this deviates from the decision as written.** |
| `4deb4c09` | D3 (door) | `discardIncompleteLanding` + `listMemberUnfinishedUploads`. |
| `fc9aad14` | D3 (routes) | `GET /api/sovereign/manuscripts/unfinished-uploads`, `POST .../discard`. |
| `5f856eae` | D3 (screen) | Import room lists what is held and offers a two-step Remove. |
| `0d87ff7c` | D2 | Workbench upload POST held in code once the manifest releases member intake; sources POST hold pinned. |
| `27c6550a` | D5 (completed) | The one-line hint beneath Delete (live copy and the design fixture that mirrors it) no longer says "Permanently". Found by running falsifier SF-17 against this branch; the first D5 pass reworded only the confirmation body. |

## 2. Evidence, with its limits

| Check | Result |
|---|---|
| Dynamic probes, real landing library, real PostgreSQL 16, real vault, **fake KMS** | 21 of 21 pass (S5a-S5e are the new removal probes); PDF fixtures 2 of 2 under `tsx` |
| Removal library mutations (lease guard, tombstone, erasure queue, seal handling, destroy handling, member filter, recorded-arrival guard, obligation cleanup, shared-reference guard) | 9 of 9 killed, each on a named probe. M9 first **survived**, which exposed a missing probe (S5e). |
| Route mutations (routing, pending-as-removed, trusted body or query identity, raw error logging, uuid check, roster gate, status mapping, auth, caching) | 12 of 12 killed. R8 first **survived** (no test sent a competing identity to the list route). |
| UI mutations (17: pending shown as removed, no confirmation, failure drops row, no in-flight guard, HTML filename, posture header, local-review mount, empty card, id in DOM, hard-coded kind, silent unavailable, gated on release, no refresh, unfocused safe choice, unfiltered items, success on any 200) | 17 of 17 killed. U11 first **survived** (only the unclaimed row was ever removed in tests). |
| D2 mutations (inverted or fail-open predicate, ignored or truthy encryption flag, flipped constant, no hold, wrong order, wrong status, cacheable, sources reading the manifest or parsing first) | 14 of 14 killed. |
| `npm run typecheck` (the no-regression gate) | **Passes: 214 errors, baseline 214.** It first FAILED with 46 new `@prisma/client` diagnostics; the identical 46 appear on untouched canonical in this container because the Prisma client was never generated (`npm ci --ignore-scripts`). After `npx prisma generate` the gate is green. No diagnostic sits in any of the 26 TypeScript files this branch changes. |
| Surrounding regression (`app/writers-studio`, `lib/writersStudio`, `lib/manuscript`, `app/api/sovereign`, `app/api/writers-studio`, `app/api/book-studio`, `lib/workbench`) | 344 suites pass, 17 fail, 4076 tests pass, 13 fail. **All 17 failing suites fail identically on untouched canonical** (compared by failing test name on both trees; 7 are the listen/publish set, 10 are others). None is caused by this branch. |
| `homeDeleteWriting.test.tsx` (skipped by the default jest match) | 10 of 10 pass with `--testMatch '**/homeDeleteWriting.test.tsx'` |

**Ceiling.** KMS is a recording fake, the schema is the witness script's stub plus three migrations, the R20 ledger is mocked, and no
HTTP server is involved except where a test stands one up on loopback. None of this is evidence about real AWS, real production
data, or the live Caddy configuration. The earlier AWS-reach incident (plan section 10.1) stands as disclosed.

## 3. Where the branch departs from what was decided

1. **D4 was "refuse"; the branch does not refuse.** By the time the original fails to bind, the Work has already committed.
   Refusing would mean deleting a just-saved Work, which is a larger harm than telling the member. The branch saves the words, labels
   the Work `legacy_interpreted_import`, shows a one-time notice, and logs the failure without content. Refusing earlier requires
   moving the claim ahead of Work creation. **That is a design change for the founder, not something to do silently.**
2. **D2 is a conditional hold, not an unconditional one.** The workbench upload is a live founder tool (`UploadDropzone`) and the
   repository has no Caddy rule for it; the live Caddyfile is unread. The route is held only when the manifest releases member intake
   and the store is not envelope-encrypted, which is exactly the moment the edge rule is removed. Before that, behaviour is unchanged.
   "Tied to the manifest" cannot mean "open when released": that would open a plaintext store.
3. **D3's bounded sweep is NOT built.** The member door is. A sweep deletes a member's held data on a clock, and the existing discard
   code states that scheduled retention needs a separate member-approved policy. Without a sweep, an abandoned upload stays until the
   member removes it. That is a known cost and a founder decision.
4. **The list mounts whenever the Import room is a server session, including while intake is held.** Removal is the member's right
   over what is held for them and must not wait on the hold. When deployed this adds one request to a page that is currently held.

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

Not done: the three AWS steps and key policy (plan phases 0 and 2) · reading the live Caddyfile · any run against real KMS · flipping
`sourceIntakeReleased` · removing either Caddy hold · deploy · opening this branch as a pull request · the D3 sweep policy · the D4
design choice above · ratifying `dispositions.json` (still `"ruled": false`).

Built since this record was first written, on the docs branch `claude/writer-source-intake-acceptance-plan` (head `d6c327a71da6c4470765cad125c4e85303c70c89`): 20 static
falsifiers, a rebuilt receipt, a lethality matrix and a STATUS file. They are not frozen, not wired, and authorize nothing. See that branch's
`tests/constitutional/writer-source-intake/STATUS.md` for what is measured and what is not.

## 5a. This branch measured against those falsifiers

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
