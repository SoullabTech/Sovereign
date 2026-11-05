# WRITER-SOURCE-INTAKE-LIFT · H1 — Pending-deploy inventory, and correction of the production baseline (2026-11-05)

```
Class:                 C (documentation only; changes no code, no authority and no evidence about production)
Governing authority:   Founder 2026-11-04: "yes" to a pending-migration and pending-deploy inventory, in answer to "Shall I start on the migration
                       inventory now?". Parent: WRITER-SOURCE-INTAKE-LIFT / H1, lane record section 12. Manual section 20 (a lane inside an existing flow).
Current gate:          Docket D-01 and D-02: what does deploying canonical change, compared with what production last ran?
Evidence subject:      canonical commit:`f10bb264` (merge of PR #2107) compared with the last RECORDED production cutover commit:`88fc9cc78`.
                       Static reading of the repository only. Nothing was run, and production was not read.
Stop boundary:         No deploy, no production read, no migration, no AWS or credential, no Caddy or compose edit, no release-authority change,
                       no member data, no un-freezing of claude/happy-cannon-17pn9x. Merge is not deploy.
```

## 1. Correction: the hardening is already in the last recorded production build

Lane record section 10 said the hardening was not in the running production build and named commit:`374c472a9` as the latest witnessed cutover. Both were wrong.

- `WRITERS-STUDIO-SEMANTIC-FIELD-01_FUNCTION_CASE_STUDY_2026-11-03.md` section 9 (added by PR #2091, after the snapshot I read) records two later, founder-authorized
  cutovers: commit:`857509331` (2026-11-03 13:14:57Z, carries #2089) and commit:`88fc9cc78` (2026-11-03 15:05:09Z, "fix #2090 + #2088"), each with
  `printenv == Config.Env == asserted`.
- commit:`8a93b5d4` (PR #2088, this lane's hardening) is an ancestor of commit:`88fc9cc78` (`git merge-base --is-ancestor`, checked). It is not an ancestor of commit:`857509331`.
- So, per the repository's own records, the roster gate, rate limit, posture requirement, atomic custody claim, KMS timeouts and removal door have been live since
  2026-11-03 15:05Z. What the recorded build lacks is PR #2107 (the fail-closed configuration gate and the suite repairs) and fourteen other merges.

This is the second wrong production premise from this lane. Both times the cause was the same: I asserted production state from a snapshot instead of re-reading the
newest record first. Lane record section 12 marks the affected passages as superseded in place. `CLAUDE.md` is corrected in the same change.

**Not known to this lane:** production's current commit (anything after 2026-11-03 15:05:09Z is unrecorded in the repository), and every environment value.

## 2. What deploying commit:`f10bb264` would change

Delta from commit:`88fc9cc78`: 84 commits, 15 first-parent merges. **No file under `database/migrations`, and none of the compose file, Caddyfile, Dockerfile, deploy scripts,
release authority or `package.json`, changed in that range** (`git diff --name-only`, 0 files).

| PR | What it is |
|---|---|
| #2091 | documentation (step 3 witness) |
| #2092 | Focus: three starter cards and two follow-up buttons instead of many; shorter Discuss reply |
| #2065 | retires a canary |
| #2096 | admin Monitor: Writer's Studio pilot tab and API route (new) |
| #2086, #2084, #2093, #2095, #2097, #2094 | Writer's Studio fixes; Craftsman's Table folded and its room retired |
| #2099, #2100, #2102 | "gates as MAIA" wording and presentation, Home shelf (enforcement unchanged, per the census) |
| #2111 | Delete on every Work card in Home (new, default-on, no flag) |
| #2107 | fail-closed configuration gate, suite repairs, record |

### 2a. Canonical has moved past the inventory subject (not inventoried)

At the time of writing canonical is at commit:`f90d03fb`. Three merges after commit:`f10bb264` were **not** scanned:

- #2101 adds migration `20261104000001_astrology_pro_saved_charts.sql` and Astrology Pro routes. I read the migration: it is additive (`CREATE TABLE IF NOT EXISTS`,
  one index, no `ALTER`/`DROP`/`UPDATE`), and it stores birth details a Pro member typed for other people plus the owner's permission attestation. It is another
  lane's work. Merging it is latent schema-deploy authorization (the 2026-09-07 finding): a full deploy of the tip applies it. #2121 is that lane's migration review plan.
- #2118 restores the Craftsman's Table. This probably removes the unsaved-wording gap in finding P3 below; I have not verified it.

**So "deploy canonical" no longer means "no schema change".** The statement "no migration in range" holds for commit:`f10bb264` only.

## 3. Method and limits

Seven read-only scans (five PR clusters, one schema-dependence scan, one environment/route scan), 23 agents including a skeptic on every medium-or-higher finding,
asked to refute it. The scans were set against commit:`374c472a9` (the baseline I then believed); that is why some findings concern PRs that are already in the recorded
build, and section 4 separates those from the genuinely pending ones.

**This proves:** the findings below were each traced through the code by at least two readers and not refuted. One (P1) I also read myself.
**It does not prove:** anything about production. It does not prove behaviour (nothing was run, no browser, no database). Agents finding nothing in a cluster is not
evidence it is sound. Severities are the skeptic-adjusted ones.

## 4. Findings

### Pending: new on a deploy of commit:`f10bb264`

| # | Sev | Finding | PR |
|---|---|---|---|
| P1 | medium | Deleting from a **Work card** drops the "we could not confirm the original file was destroyed" message. `P4R1HomeView.tsx` `WorkShelfCard` catches `DeletionUnconfirmed` and only closes the dialog; the writing-card path sets and shows `deleteNotice`. The Work vanishes with no caveat, which contradicts the file's own "no optimistic success" contract. No test covers it. A small client fix. (Read by me directly, lines 196 and 351-353.) | #2111 |
| P2 | low | The Work-level Delete confirmation names only the writing; the act also removes the Work and its dependents (Work-subject conversations, materials links, image). For a Work with no manuscript it uses a route that records no deletion manifest or tombstone. The act is irreversible. | #2111 |
| P3 | medium | After the Craftsman's Table room was retired, the unsaved-wording guard (`beforeunload` and room-switch warning) is never installed, while the Home link adds a one-click exit on the same screen. A member can lose unsaved working wording silently. Saved versions and the manuscript are unaffected. May be mooted by #2118. | #2095 |
| P4 | low | The new admin pilot route's "Studio access" uses a different test from the real Writer's Studio gate, so it can show access the gate denies. The route has no access-matrix rule, admits every admin role (including `tester`), and returns names, usernames and invitee emails. Counts and timestamps only for content. | #2096 |
| P5 | low | The #2107 gate checks three env names only. A mistyped ARN, a missing credentials file or an unreachable KMS passes it; the route then fails later with the old, less honest error. | #2107 |

### Already in the recorded build (not pending), but unresolved and worth a check

| # | Sev | Finding | PR |
|---|---|---|---|
| L1 | medium | "Use this" applies MAIA's wording even if the card is showing the diff of the writer's own saved version (after Adjust, then Save my version). The writer sees one diff and applies another. Undo exists; no data loss. Reachable only if `WRITERS_STUDIO_EDITORIAL_ENABLED=1` (the server routes 404 otherwise). | #2089 |
| L2 | medium | A MAIA text-only reply that follows an existing option is hidden inside the collapsed "More" fold, so a question can look unanswered. Same flag condition. | #2089 |
| L3 | medium | The member removal door commits the row delete, key loss, tombstone and erasure-queue entry in one transaction, then seals the R20 deletion ledger. `R20_LEDGER_FILE`, `R20_HIGH_WATER_FILE` and `R20_LEDGER_KEY_FILE` appear in no tracked compose or env template (checked by grep). If they are unset in production, every removal answers 202 "Removal started" and never confirms. The wording is honest; the removal still never completes. | #2088 |
| L4 | low | Intended consequences of D1-D6: non-roster members see the Import file chooser on `/press/manuscript` and then get 403; the founder-only plaintext workbench upload returns 423; pasted-text import is now atomic and fails closed; a browser tab opened before the cutover gets 428 until reloaded. | #2088 |

## 5. What the founder can check on minisforum (read-only, names only, no values)

1. The running commit, which decides whether this baseline is right: `docker exec maia-sovereign printenv GIT_COMMIT` (expect `88fc9cc78` unless a later cutover happened).
2. Environment names, values masked:
   `docker exec maia-sovereign sh -c 'env | grep -E "^(WRITER_SOURCE_[A-Z_]+|AWS_SHARED_CREDENTIALS_FILE|R20_[A-Z_]+|WRITERS_STUDIO_EDITORIAL_ENABLED|PRESS_SOURCE_INTAKE_RELEASED)=" | sed "s/=.*/=<set>/"'`
   (an absent name means unset).
3. Whether the newest schema the code relies on is applied (six rows expected):
   `docker exec maia-postgres psql -U soullab maia_consciousness -Atc "SELECT filename FROM schema_migrations WHERE filename IN ('20261026000001_writer_source_encrypted_landing.sql','20260907000001_vault_erasure_queue.sql','20260904000001_developmental_readings.sql','20260901000001_ask_threads.sql','20260906000001_manuscript_section_heading_depth.sql','20261101000002_astro_pro_tester_grants.sql') ORDER BY 1"`
4. What has landed: `docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT state, count(*) FROM writer_source_landing_intents GROUP BY 1"`.

A full deploy applies every migration file missing from the production ledger, not only what this range adds (and now includes `20261104000001`); the deploy script derives that set
read-only and refuses to proceed without a witnessed review of each pending file. The quick `deploy-maia` path runs no migration at all.

## 6. Recommendation

1. Run checks 1-4. They decide whether anything is urgent: if the key variables are set and the holds are gone, members are already using the hardened path, and L3 is the
   item to settle first.
2. Do not deploy to "switch on the hardening". It is recorded as already live.
3. Before deploying commit:`f10bb264` or a later tip, fix P1 (and the P2 copy) in the Delete lane. It is an irreversible act and the first is a small client change.
4. If the tip is the deploy target, decide the astro-pro migration consciously; it is another lane's, and its review plan is #2121.
5. Docket D-04 (24-hour retention of recorded-but-unclaimed arrivals) and D-05 (who runs the sweep) are unchanged: leave the arrivals until the member removes them, and keep the
   sweep manual and dry-run-first.

## 7. Closure fields (manual section 18)

```
lane / gate        WRITER-SOURCE-INTAKE-LIFT / H1, pending-deploy inventory (D-01, D-02)
subject            canonical commit:`f10bb264` vs recorded production cutover commit:`88fc9cc78`; tip commit:`f90d03fb` noted, not inventoried
final evidence     static reading, 23 agents, one finding re-read by me; nothing run
adjudication       RETURN: the baseline correction stands; the deploy decision is the founder's after checks 1-4
canonical SHA      (record at merge of this documentation)
what changed       lane record sections 0-12 annotations, this record, the CLAUDE.md entry
untouched          code, migrations, releaseAuthority.ts, compose, Caddyfile, env, AWS, the frozen branch
now proved         the hardening is an ancestor of the last recorded production cutover; no migration or infra file differs between that cutover and commit:`f10bb264`
still unproved     production's current commit and environment; behaviour of any finding; anything about real AWS KMS
authority closed   deploy · key configuration · hold removal · member data · sweep scheduling · retention of unclaimed arrivals
next exact act     founder runs checks 1-4; then rules D-01 (deploy or not, and which SHA), D-04 and D-05
```

## 8. Non-authorizations

No deploy. No migration. No AWS resource, credential or key. No Caddy or compose edit. No change to `releaseAuthority.ts`. No member data. The frozen branch is untouched.
