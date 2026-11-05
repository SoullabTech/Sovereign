# WRITER-SOURCE-INTAKE-LIFT · H1 — Hardening before the acceptance run (lane record)

## 0. Lane preamble (manual §27) — ADDED RETROSPECTIVELY, 2026-11-04

Manual §27 requires this preamble **before any action**. It was not written then. H1 was built and merged (commit:`8a93b5d4`) first; the founder's
"make sure if needed we are doing a Jarvis flow" is what led to this record, and the follow-up work (sections 10 and 11, PR #2107) was started
without a preamble of its own. Adding it now changes no evidence and no standing. It exposes the authority the lane already carried, and it
records the order of events as it was rather than as the manual prescribes.

```
Class:                 A (consent, retention and deletion copy on the original-file intake path; needs a person's approval)
Governing authority:   Founder 2026-11-03: "yes" to decisions D1-D6 and D9 on a separate branch; "1 yes 2 approved 3 merge";
                       "yes" to combining the follow-ups into one PR. Runbook WRITER_SOURCE_KMS_RULING_AND_INTAKE_LIFT_RUNBOOK_2026-11-01.md
                       section 4, steps 3 and 6. Manual section 20 (a lane inside an existing flow, not a new flow).
Current gate:          H1 follow-ups: harden and verify the paths the acceptance run (step 3) and production witness (step 6) will exercise.
                       One gate. The acceptance run and the witness are separate gates and are not opened here.
Evidence subject:      PR #2107 at its head when merged (CI is evidence about that exact head), onto canonical clean-main-no-secrets.
                       H1 itself: PR #2088, merged as commit:`8a93b5d4`. Neither says anything about production.
Stop boundary:         This lane may not deploy, configure or touch an AWS key or credential, edit Caddy or compose, change
                       releaseAuthority.ts, admit member data, schedule or wire the sweep, rule a disposition, or un-freeze
                       claude/happy-cannon-17pn9x. It does not merge around a missing approval.
```

```
FLOW:      The founder's intake-lift runbook, docs/programme/WRITER_SOURCE_KMS_RULING_AND_INTAKE_LIFT_RUNBOOK_2026-11-01.md §4
           (six ordered steps). Not a new flow: this lane answers the same governing question as that runbook
           ("can original-file intake be lifted lawfully?"), so under JARVIS manual §20 it is a LANE inside it.
LANE:      H1 — harden the paths the runbook's step 3 (acceptance run) and step 6 (production witness) will exercise:
           upload, reopen, discard, Delete Work.
SUBJECT:   PR #2088, branch claude/writer-source-intake-hardening, onto canonical clean-main-no-secrets.
STANDING:  MERGED to canonical as commit:`8a93b5d4` (2026-11-03 14:26 UTC). Adjudicated PASS for merge-readiness as CODE (section 5). NOT DEPLOYED.
           ⚠️ Section 3 and docket D-01 were written on a wrong premise and are CORRECTED in section 10; read section 10 first.
           ⚠️ Section 10's production baseline was ALSO wrong (2026-11-05): the repository records two later cutovers, and the second one carries
           this lane's hardening. Read section 12 before acting on section 10's inventory or on D-01.
           Merged after a person's approval and CI on its head; the follow-ups (suite repair, fail-closed gate, closure notes) travel in one
           separate Class A PR (section 10). The Caddy edge holds' current state is unevidenced; the last dated reading (2026-11-01) showed both present.
AUTHORITY: Founder, 2026-11-03: "yes" to making decisions D1-D6 and D9 on a separate branch; "1 yes 2 approved 3 merge"
           (D4 as an atomic refusal; build the abandoned-upload sweep; merge). The founder then enabled auto-merge and twice used
           "Update branch" on the PR. Interpretations I made are listed in section 7, not hidden.
DOES NOT:  lift a hold · configure a key · touch AWS or a credential · edit Caddy or compose · change releaseAuthority.ts ·
           deploy · run a migration · admit member data · un-freeze claude/happy-cannon-17pn9x · mark any disposition ruled.
```

## 1. Gate question

Is the hardened intake path fit to enter canonical **as code**, so that the acceptance run (runbook step 3) and the production
witness (step 6) are run against it rather than against the unhardened path?

This gate does **not** ask whether intake may be lifted, whether the AWS configuration is right, or whether anyone may deploy.

## 2. State recovery (manual §25), as of 2026-11-03

- **Canonical:** `clean-main-no-secrets` at commit:`85750933` when last read. It moved repeatedly while this lane was open.
- **Reconciliation:** every canonical merge was enumerated and compared by path against this lane's changes. Overlap occurred
  once (`p4r1-live.css`, two sides appended independent rules; both kept). The founder's two "Update branch" merges
  (commit:`0790da24`, commit:`7840f375`, merging canonical into the branch) brought in unrelated Writer's Studio UI work and did not overlap.
  Decisive evidence was re-run on the reconciled tree (section 4).
- **Concurrent lane on the same subject:** PR #2066 (commit:`25e911f8`), "release original-file intake in source authority",
  set `sourceIntakeReleased: true` and was merged 2026-11-02. A companion change (commit:`80405a17`) mounts a KMS credential
  file in the production compose file. That lane did not touch the files this lane changes.
- **The branch policy:** `claude/*` branches are allowed (2026-10-01 ruling). The frozen branch `claude/happy-cannon-17pn9x`
  is untouched at commit:`937bc77e`.

## 3. Finding for the founder: step 4 crossed ahead of steps 1 to 3 (SUPERSEDED IN PART by section 10)

The runbook says each step needs the one before it. In canonical today:

| Runbook step | State |
|---|---|
| 1. AWS key and IAM principal (founder only) | Not evidenced anywhere in the repository |
| 2. `WRITER_SOURCE_*` configuration and credential file on minisforum, taken through a lane deploy | The compose mount is merged; the values were absent from `.env.production` when the runbook read production on 2026-11-01. Not re-read since |
| 3. Acceptance run on fake data against a real key | Not run |
| 4. Release in source (`sourceIntakeReleased: true`) | **Merged** (PR #2066) |
| 5. Remove the two Caddy holds | Not evidenced; both were present on 2026-11-01 |
| 6. Production witness | Not run |

PR #2066's own description says: "Do not deploy this before the key configuration is in place", and that a deployed copy would show
the file chooser and then fail with `writer_source_key_provider_missing` (or a Caddy 423). Merge is not deploy, so nothing is
violated yet. But **merge to canonical is latent deploy authorization** (the 2026-09-07 finding): the next full deploy of canonical,
for any reason, carries the flag. This lane does not decide that. It is docket item D-01.

## 4. Evidence packet

```
subject            commit:`7840f375` (PR head after the founder's second "Update branch"); canonical commit:`85750933`
scope              D1 roster + 20/h limit · D3 empty/NUL text refused before custody · D4 original claimed inside the Work-creation
                   transaction · D6 posture required, Sanctuary refused (both clients) · D9 KMS timeouts and awaited replay · D5 Delete
                   copy · D2 plaintext workbench upload held when the manifest releases intake · member removal door · abandoned-upload
                   sweep (library + operator script, UNWIRED) · classification of a refused claim into retryable / permanent
authority          see header
pre-state          canonical with sourceIntakeReleased: true and none of the above guards on the released route
instruments        jest (unit, route, DOM interaction); PostgreSQL 16 + real vault + FAKE KMS (31 probes); npm run typecheck gate;
                   source-reading guards; mutation checks; two independent agent review passes with a refutation stage
result             re-run on the reconciled tree commit:`7840f375`: typecheck 214 = baseline 214 (no regression) · the intake-related jest
                   set (2,820 tests) fails exactly 6 suites / 10 tests, and canonical ALONE at commit:`85750933` fails the identical 6 suites /
                   10 tests by name (transportBoundary F7 x3, export-certification fence, JARVIS unsent-composer custody, readings route,
                   and two JARVIS source-reading tests, jarvisApplyCurrentPostureGuard and jarvisMemberSaveReceiptWiring, that PR #2089's
                   Focus option card broke) · PG16 31 of 31 on the same code (commit:`06d031d5` onward) · CI 12 of 12 green on
                   commit:`558b13d6`; every later head re-ran, and the final head's run is its own evidence
counterexamples    37 mutants killed in this stage across the fixes (10 server, 14 client, 8 unit/PG, 5 re-review). One further mutant
                   survived because the code it changed was redundant; the code was removed. Two tests of mine were found vacuous
                   by surviving mutants and were repaired. The first-pass count in the hardening record read "all killed" for 33
                   including that redundant one; this record corrects it
independent review pass 1: 19 agents / 6 lenses -> 8 confirmed (2 medium, 6 low after the skeptic stage), 5 refuted, all 8 fixed. pass 2 on the fix commit:
                   8 agents / 3 lenses -> 2 confirmed (both low after the skeptic stage), 3 refuted, both fixed. A skeptic tried to refute every finding
post-state         PR open; CI re-running on each head; no human review yet
```

Detail, per-defect tables and the refuted findings: `docs/programme/WRITER_SOURCE_INTAKE_HARDENING_BRANCH_2026-11-02.md`.

## 5. Adjudication

**PASS (bounded): the candidate is fit to enter canonical as code.**

*This proves:* the changed code paths behave as specified under the tests and probes listed, including the failure branches (a claim
that cannot bind rolls back everything; a refusal says only what is true; removal markers use the database's spelling of an id; the
sweep refuses what it must); no regression against canonical's own failing set (compared by test name on both trees); typecheck did not move.

*This does not prove:* anything about **real AWS KMS** (every KMS result is a recording fake); anything in a **browser** (no manual
run); that the rate limit holds **across processes** (it is in-process); that the sweep is safe on **production data** (it has never been
run against any); that agents' review is **sufficient** (it is not a human review, and a reviewer finding nothing is not evidence of
soundness); or **anything about production**. The acceptance instrument (twenty falsifiers, matrix) lives on the docs branch, is
stale against canonical, and is not merged by this lane.

*Opens:* nothing automatically. Merge needs the approval GitHub requires and the final head's CI. It does not open a deploy.

## 6. Closure fields (manual §18), to be completed at merge

```
lane / gate        WRITER-SOURCE-INTAKE-LIFT / H1
final evidence     section 4
adjudication       PASS (bounded), section 5
canonical SHA      commit:`8a93b5d4` (merge of PR #2088; final PR head commit:`18d23c6c`)
                   follow-ups, PR #2107: commit:`f10bb264` (head commit:`36c54112`), merged 2026-11-04 22:50 UTC with the head pinned
what changed       the product files listed in PR #2088; the hardening record; this record
untouched          releaseAuthority.ts · Caddyfile · compose · env · AWS · migrations · the frozen branch · the instrument (docs branch)
now proved         section 5, "this proves"
still unproved     section 5, "this does not prove"
authority closed   deploy · key configuration · hold removal · member data · sweep scheduling · retention of recorded-unclaimed arrivals
next exact act     founder rules D-01 and D-02; then runbook steps 1 to 3
```

## 7. Interpretations I made, stated

- "approved" (the sweep) was read as: build the documented bounded sweep for abandoned incomplete upload intents. It is **unwired,
  unscheduled and dry-run by default**. It does not touch a recorded arrival. The separate 24-hour policy for recorded-but-unclaimed arrivals,
  documented in the retention-index migration, is **not applied**.
- "merge" was read as: get the hardening branch into canonical through a pull request on green CI. I did not merge by hand. The
  instrument on the docs branch is not part of it.
- The posture claim is client-asserted (the server cannot see the member's Sanctuary setting). That matches every other posture
  gate in the product, but it is a trust boundary, not an enforcement.

## 8. Founder decision docket

**D-01 · (REFRAMED in section 10: production already runs the flag; the question is now deploying the hardened canonical.) Original text, kept: Deploy ordering with the flag already true (most consequential).** Canonical carries `sourceIntakeReleased: true`; production
configuration for the key was absent on 2026-11-01. Options: (a) hold every deploy of canonical until runbook steps 1 and 2 exist;
(b) deploy with the flag reverted until then; (c) accept a deploy where the member sees the file chooser and the upload fails with
`writer_source_key_provider_missing`. Recommendation: (a), because any lane's next deploy otherwise ships (c) unannounced. Your earlier
direction, "just deploy and we will meet it in the beta", may already answer this: please say whether it covers (c).

**D-02 · Which image the acceptance run uses.** The step 3 run exercises upload, reopen, discard and Delete Work, which this lane
changed. Recommendation: merge #2088 first and build the acceptance image from canonical after it.

**D-03 · Approval of #2088.** It is Class A (consent, retention, deletion copy). It has had two agent review passes and no human review.
Your approval is the one thing the checks cannot supply. If you want a human read first, the highest-value files are
`app/api/sovereign/manuscripts/route.ts`, `lib/manuscript/source/discardIncompleteLanding.ts`, `lib/manuscript/source/sweepAbandonedLandings.ts`.

**D-04 · Recorded-but-unclaimed arrivals.** Apply the 24-hour retention policy documented in the retention-index migration, or leave
them until the member removes them. Deleting something already recorded as received is a larger decision than clearing a stalled upload.

**D-05 · The sweep.** Who runs it, and how often. Until someone does, an abandoned upload stays until the member removes it.

**D-06 · The workbench upload hold (D2).** On merge it becomes active in code for the plaintext workbench upload POST, a founder-facing tool.
Confirm that is intended, or ask for the workbench store to be envelope-encrypted instead.

**D-07 · Canonical's six red suites / ten tests** (transportBoundary F7 x3, export-certification fence, JARVIS unsent-composer custody,
readings route, and, since PR #2089, jarvisApplyCurrentPostureGuard and jarvisMemberSaveReceiptWiring). All fail on canonical alone, by
the same test names. The first four belong to the release lane, the last two to the Focus-card lane. CI does not run unit tests
(`canonical-pr-quality.yml` says so), which is why they merge red. Assign them, or tell me to take them as a separate repair lane.

## 9. Non-authorizations

No deploy. No migration. No AWS resource, credential or key. No Caddy or compose edit. No change to `releaseAuthority.ts`.
No member data. No scheduling or wiring of the sweep. The frozen branch is untouched. Nothing here is **LIVE**: this is a code candidate
tested against a fake KMS.

## 10. Closure, and a correction to this record (written after the merge)

**Merge.** PR #2088 merged into `clean-main-no-secrets` as commit:`8a93b5d4` on 2026-11-03 at 14:26:12 UTC, by the founder's account; the PR head at
merge was commit:`18d23c6c`. The GitHub review list showed no review at the last read. Nothing is deployed from this lane.

**Correction: production already runs `sourceIntakeReleased: true`.** Sections 3 and 8 (D-01) assumed the next deploy would be the first to carry the
released flag. That was wrong, and I had not looked. The repository's own production witnesses
(`WRITERS-STUDIO-SEMANTIC-FIELD-01_STUDIO_GUIDE_WITNESS_RESULT_2026-11-02.md` sections 7 and 8, and
`WRITERS-STUDIO-SEMANTIC-FIELD-01_FUNCTION_CASE_STUDY_2026-11-03.md`) record three founder-authorized cutovers, each of which contains the flag flip
(commit:`25e911f8` is an ancestor of all three):

| Runtime | Cutover (UTC) |
|---|---|
| commit:`da55740ae` | 2026-11-02 21:02:52 (carries PR #2066 original-file intake) |
| commit:`f21fda83a` | 2026-11-03 00:29:54 |
| commit:`374c472a9` | 2026-11-03 11:47:23 (latest witnessed WHEN THIS TABLE WAS WRITTEN; superseded, see the two rows below and section 12) |
| commit:`857509331` | 2026-11-03 13:14:57 (added 2026-11-05 from the case study section 9; carries #2089) |
| commit:`88fc9cc78` | 2026-11-03 15:05:09 (same source; carries #2090 and #2088, this lane's hardening) |

At the first of them the witness recorded: the Import control "accepts `.docx .pdf .epub .txt .md .markdown`, up to 25 MB, with no hold message";
"KMS credential mount readable"; and "Nothing was uploaded, so KMS encryption itself is not witnessed".

**What that changes.**
- ⚠️ **SUPERSEDED by section 12 (2026-11-05).** The next three bullets and the inventory paragraph after them rest on a baseline that was not the latest
  recorded cutover. The original text is kept below unedited, as the history of what I believed.
- The hardening (this lane) is **not** in the running production build, which predates the merge. Until a deploy, production's ingest route has none of: the
  roster gate (the Import page is roster-gated but the API route is excluded from the proxy), the rate limit, the posture requirement, the
  all-or-nothing custody claim, the removal door.
- So D-01 is not "hold deploys". It is: **deploy the hardened canonical**, and the urgency is higher than this record said.
- Not established by any record I have: whether `WRITER_SOURCE_KEY_PROVIDER`, `WRITER_SOURCE_KMS_KEY_ARN` and a region are set in the production
  environment, whether the AWS key and IAM principal exist, and whether any original has been uploaded in production. Names only, no values, from minisforum:
  `docker exec maia-sovereign sh -c 'env | grep -E "^(WRITER_SOURCE_KEY_PROVIDER|WRITER_SOURCE_KMS_KEY_ARN|WRITER_SOURCE_KMS_REGION|AWS_SHARED_CREDENTIALS_FILE)=" | sed "s/=.*/=<set>/"'`
  (no output means none is set), and
  `docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT state, count(*) FROM writer_source_landing_intents GROUP BY 1"` for what has landed.

**[SUPERSEDED by section 12: wrong baseline again.]** **Pending-deploy inventory, recomputed against the right baseline** (production commit:`374c472a9`; canonical commit:`88fc9cc7`; 68 commits, 8 first-parent merges): PR #2090
(Use this keeps Undo), PR #2088 (this lane), PR #2089 (the Focus option card), PR #2080 (Soullab Home link), and four documentation merges (#2062, #2070, #2083,
#2050). **No migration. No change to the compose file, Caddyfile, deploy scripts or Dockerfile. No change to the release authority.** (The earlier inventory in the
conversation used the 2026-11-01 runtime commit:`3dd8dd287` as its baseline and was wrong for that reason.)

**Revised D-01: deploy the hardened canonical?** Recommendation: yes, through the immutable-SHA lane, after the read-only configuration check above. Both
candidates ship in one follow-ups PR with this record (branch `claude/writer-source-intake-lift-h1-followups`): the fail-closed check (commit:`9f38d4f7`, makes a released route with
no key provider refuse honestly before storing anything, which turns a false "retry the same file" into a true sentence if the configuration is absent) and
the suite repair (commit:`95c68e49`, section 11). Integrating them needed one more change: the repaired F7 tests run the released route through to a 200, so they now run as a
configured process (they set `WRITER_SOURCE_KEY_PROVIDER=local-test`); the gate itself is pinned in `intakeRefusals.test.ts`.

## 11. Canonical's six red suites, triaged

Read-only triage by four agents with a skeptic re-deriving each verdict, then verified. **Nine of the ten failing tests were stale; one was a real defect.**

| Tests | Cause | Verdict |
|---|---|---|
| transportBoundary F7 x3, routeHold export fence | PR #2066 released intake; the tests still expected the 423 hold | stale; rewritten to pin the released route's true boundaries |
| jarvisApplyCurrentPostureGuard x3, jarvisMemberSaveReceiptWiring x1 | PR #2089 moved the posture-checked Apply and Save bodies; the tests sliced the old function boundaries | stale; **the Sanctuary posture checks are intact** (read at the gesture, again after the settle await, before the only adoption call), tests re-anchored and strengthened |
| readings route x1 | a refusal now carries `completion` and `attribution` (PR #1268, September); the test pinned the old keys | stale; red since September, unnoticed because CI does not run unit tests |
| jarvisMaiaUnsentComposerCustodyR1 x1 | PR #2076 stripped Studio markers from the writer's own "You" bubble | **real defect**, a fidelity one: the writer's words were shown trimmed and with typed marker-shaped text removed. Not a privacy leak (the sent text was unchanged). Fixed in code; only the writer is exempt |

The repair is commit:`95c68e49` (it ships in the follow-ups PR): 82 tests across the seven related files pass; 20 mutants killed; the
wide run has 3,026 passing and none failing, the only failing suites being the seven `listen`/`publish` suites that fail to load in this environment and are untouched.
The composer defect is live in production if the Craft companion is reachable there (not established).

**One finding, not fixed here:** `app/writers-studio/canvas/EditorialConversation.tsx` `adopt()` posts to the adoption endpoint without reading the member's posture (its own send
gesture does), and the server adoption route has no posture handling. The main Writer's Studio Apply path is guarded; this canvas surface is reachable only when
`WRITERS_STUDIO_EDITORIAL_ENABLED=1`, which I cannot read from here. Class A. Docket D-08.

**D-08 · The canvas EditorialConversation adoption has no Sanctuary guard.** Decide whether that surface is live; if it is, it needs the same guard as the main Apply path (a small,
tested client change).

## 12. Second correction, and the pending-deploy inventory (2026-11-05)

Section 10 said the hardening was not in the running production build and named `374c472a9` as the latest witnessed cutover. Both statements were wrong.
The case study that section 10 itself cites (`WRITERS-STUDIO-SEMANTIC-FIELD-01_FUNCTION_CASE_STUDY_2026-11-03.md`) records, in its section 9 (added by PR #2091
after the snapshot I read), two later founder-authorized cutovers: commit:`857509331` (2026-11-03 13:14:57Z, carries #2089) and commit:`88fc9cc78`
(2026-11-03 15:05:09Z, "fix #2090 + #2088"). commit:`8a93b5d4` (#2088, this lane) is an ancestor of commit:`88fc9cc78`. So, per the repository's own records, **the
hardening has been in the last recorded production build since 2026-11-03 15:05Z**. What is not in it is #2107 (the fail-closed configuration gate and the suite
repairs) and thirteen other merges. This is the second wrong production premise from this lane; the cause both times was relying on a snapshot instead of
re-reading the latest record before asserting production state.

**What it changes.** D-01 ("deploy the hardened canonical, urgency higher") is withdrawn: a deploy of commit:`f10bb264` does not switch the hardening on. The
production questions that matter are configuration ones (are the key variables set, is the R20 ledger provisioned) and the Delete and Studio changes that are
new in the delta. The full inventory, with skeptic verdicts, the founder's read-only checks and the corrected recommendation, is in
`WRITER-SOURCE-INTAKE-LIFT_H1_PENDING_DEPLOY_INVENTORY_2026-11-05.md`.

**Still unknown to this lane:** production's current commit (anything after 2026-11-03 15:05:09Z is unrecorded in the repository), and every environment value.
