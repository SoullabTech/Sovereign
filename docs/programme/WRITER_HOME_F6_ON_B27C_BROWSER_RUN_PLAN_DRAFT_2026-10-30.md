# Writer Home/F6 on `b27c92d6` — browser run plan (DRAFT, for founder approval)

Status: **PROPOSED**. Nothing in this plan has run. No custody, fixture, harness or source file has changed. One local branch was created (below). Nothing pushed.

## 1. What would be tested

Candidate: `ca3264462d20fec710fbfc8712f661de0a7a0dee` · tree `0a00810da23b81aa91930da300d2391275091f4c`
Local branch `fix/writer-home-f6-on-b27c-20261030`, worktree `/Users/soullab/.review-worktrees/writer-home-f6-on-b27c-20261030`, parent `b27c92d6` (current candidate of record, #1800 comment 6525442571).

| Commit | Carried from | What |
|---|---|---|
| `22364eda5` | `5927e6192` | Home view half only: unclaimed writing and its controls come before the creation controls |
| `4a240e1fe` | `b8ba698f2` | emailRouter imports `ResendProvider` from its module (fixes a NEW typecheck diagnostic that is also on bare b27c) |
| `81607b2d2` | `4a328ae9a` | test: Home declaration controls reachable on return |
| `905fa8035` | `518ecd5e1` | F6: a retried Home gesture reuses the Work it already created (auto-merged with 0829's `open(…, newImport)`) |
| `ca3264462` | `8ff7f16da` | **test only** |

**Dropped as superseded by `0829f54e` (already in the base):** the WorkConversation halves of `5927e6192` and `8ff7f16da`. 0829 keys the conversation per member/Work/manuscript, fences double sends synchronously, clears the draft by edit revision, and confirms before departure. My custody suite passes 3/3 on **bare** b27c. Note: 0829 deliberately **discards** unsent text on a Work change (with a confirm before leaving). My earlier commit kept it. 0829's ruling governs.

Six files changed versus b27c (2 components, 1 import line, 3 tests). `app/home/page.tsx` and `package-lock.json` are unchanged, so the runner's HOME_POSTIMAGE and LOCK pins still hold.

## 2. Local evidence already gathered

- On bare b27c, the Home-controls suite fails 4/6 and F6 fails 2/2. On the candidate, both pass.
- Writer suites (`app/writers-studio`, `app/dev/writers-studio-pc3-live`, `lib/writersStudio`): 2015 passed, 1 failed, 4 suites failing. **The same 4 suites fail on bare b27c**: `smallBetaAuthorship` (reorientation test vs 0829 behaviour), `p4r1CanonicalRouteCompatibility` (SyntaxError on load), and `listen/wavExport` and `listen/readingAtmosphere` (fail to load).
- `npm run typecheck`: bare b27c has **2** NEW diagnostics; the candidate has **1** (`P4R1Pc3WriteEditView.tsx:1022` TS2322, from 0829). The 3 coverage-lost files (`lib/encounters/recordingCoordinator.ts`, `lib/encounters/roomDoor.ts`, `lib/http/rateLimit.ts`) are identical on both. No regression from these commits. Base defects are owner items, not absorbed here.

## 3. Harness (read, not run): hashes verified 2026-10-30

Unchanged across 5ef5 → 0829 → b27c: `canonical_journey.cjs` d07f4af4…, `run_h0_exact_successor.py` 116fbab3…, `worker.cjs` 8348496f…, `simulated_smtp.cjs` 6b2a7b03…, `maia_wire_fixture.cjs` cdfe62e0…, `chromium-wrapper` 6b10c84a…, `schema_presence_preflight.sql` d328038a…, `SCHEMA_STATIC_REVIEW.json` 1953dec8….
Images: browser/build `sha256:bea45fad…`, PostgreSQL 16.13 `sha256:7d400e34…`.
Runner properties (read): `git archive` of the exact commit · `--network=none`, no published ports · read-only · `no-new-privileges` · memory/CPU caps · fictional Alice/Bob `example.invalid` · simulated SMTP and MAIA wire fixture · labelled containers removed at the end · `release: HOLD` written into the receipt · refuses unless invoked by the custody engine with a matching grant.
The candidate's objects are already in the shared store (`ws-classa-v4-r99-qa-20261022/.git`), so no fetch or push is needed.

## 4. Proposed run (each step needs the founder's yes on this plan)

1. **Owner act (founder): custody admission.** Move the custody control from `admitted_head=b27c92d6` (HOLD / explicit_release) to `ca3264462` / tree `0a00810d`, by the same engine admission used for b27c. This is the one authority step. I do not take it.
2. **Successor fixture, no network.** Create `H0_EXACT_SUCCESSOR_FIXTURE_CA326446_20261030/fixture` by copying the b27c fixture. Only `capture_public_fonts.py` and `validate_font_inputs.py` change: the destination-name literal, `…_B27C92D6_…` → `…_CA326446_…`. Write an INSTALL_RECEIPT in the b27c format. **Fonts: copy** `H0_PUBLIC_FONT_INPUTS_B27C92D6_20261030` byte-for-byte to `…_CA326446_…` and verify its manifest hashes. **Do not re-capture**, because re-capturing fetches from fonts.googleapis.com. If the validator refuses copied bytes, STOP and report; do not capture.
3. **Guarded wrapper.** Copy `run_guarded_b27c92d6.py` (sha256 befed448…) to `run_guarded_ca326446.py`, changing only HEAD/TREE, paths, the approval reference (the founder's yes on #1800) and the new work dir `H0_EXACT_SUCCESSOR_CA326446_FULL_R1`. Show the diff before the run.
4. **Preflight:** clean source, custody HOLD at the new head with no active grant, all pins match, ≥25 GiB free, no existing work dir.
5. **Run once:** budget 1020 s (build ≤600 s, browser ≤540 s). No retry on failure; a failure is reported as it is.
6. **Return custody:** explicit release → `HOLD / explicit_release`. Containers, volume and socket removed. Independent readback of cleanup.
7. **Report on #1800:** receipt hashes, step counts, observation holds. Compare against b27c's 56/56 `APPLICATION_STEPS_PASS_OBSERVATION_HOLD`.

**Pass:** 56/56 application steps, 0 failed, 0 unreached, with the same four onboarding observation holds and no new ones. The new Home and F6 behaviour is covered by the mounted suites. The journey proves nothing regressed end to end; it does not by itself exercise the F6 retry.

## 5. Not authorized by this plan

Push, merge, deploy, production, migrations, member data, real providers or SMTP, invitations, release, font re-capture, harness edits beyond the name/pin substitutions above, and re-baselining the typecheck. Release state stays **HOLD**.
