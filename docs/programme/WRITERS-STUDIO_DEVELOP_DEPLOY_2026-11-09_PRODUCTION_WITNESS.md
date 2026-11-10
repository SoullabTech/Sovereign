# Writer's Studio Develop deploy · Production witness (2026-11-09)

```
DEPLOYED:   946e1f121c3b6a455e3dd896e8f7440f11c4ebf4 (canonical: aead4f6b1 = PR #2194, plus PR #2195, the plan; docs only)
OLD READER: 84e12cf00562069fad4550b6a8eea3742d58c874 (now maia-sovereign:previous)
PLAN:       docs/programme/WRITERS-STUDIO_DEVELOP_DEPLOY_FOUR_MIGRATION_REVIEW_PLAN_2026-11-09.md
            SHA-256 5e3316284f45b7f36375a45dfe91bfb468612923ea830c45595bb317f0a116ef
STANDING:   deployed and verified by its operator; not yet walked in a browser.
```

The plan is left byte-for-byte as reviewed, because the admitted review is bound to its SHA-256.

## 0. Why the deployed SHA is not `aead4f6b1`

The founder authorized deploying PR #2194 (`aead4f6b1`). The first attempt
(`deploy-production.sh deploy aead4f6b1`) built and then refused at the Review Custody gate:
four migrations were pending and no bound review existed. The gate reads the bound plan from the
deploy target (`git show <target>:<plan>`), so the plan has to be inside the commit that is
deployed. As on 2026-11-06 (`5772caf`), the plan was merged to canonical as PR #2195 and the
merge `946e1f121` was deployed. `git diff aead4f6b1 946e1f121` is that one Markdown file and
nothing else.

A second `deploy-production.sh deploy aead4f6b1` (pid 3325828, 19:04:14Z) was observed holding
the lock; it was not started by this lane, and it ended without changing production
(`GIT_COMMIT` still `84e12cf00` afterwards).

## 1. Review custody

- Bundle `~/review-custody-946e1f1` (Mac Studio), built by
  `scripts/migration-compatibility-review-bundle.sh 84e12cf00 946e1f121`.
- Independent reviewer: a separate `claude -p` process, `--tools Read,Grep,Glob`,
  `--strict-mcp-config`, model `claude-fable-5-1`, session `7e20e443-595c-483d-a2af-5813a04672c6`,
  cwd the bundle root, stream captured as the trace. 28 Read events.
- Verdict **APPROVED**; compatibility **COMPATIBLE**; failure prefixes
  **ALL_PREFIXES_COMPATIBLE** (four prefixes); findings high 0 · medium 0 · low 4; 8 limitations.
  First review, no REVISE.
- Bound 19:22:19Z, admitted 19:28:15Z (`--repo-root` = bundle root); coverage witness: 28 attested
  files each carry a read event. Review SHA-256 `cba36a04d409f0a8…`. The migration gate was also
  run locally against the target before the deploy and applied.
- Evidence: Mac Studio `~/rc-evidence-946e1f1/`; minisforum `~/review-custody-946e1f1/`
  (record, review, trace, prompt, schema, session id).

## 2. Deploy

On minisforum: `scripts/deploy-production.sh deploy 946e1f121…` with
`REVIEW_CUSTODY_RECORD/REVIEW/TRACE` set; log
`~/review-custody-946e1f1/deploy-20261109T192838Z.log`, captured from its first line. Exit 0.
Every deploy helper in the shared checkout (`deploy-production.sh`, `deploy-lock.sh`,
`deploy-tag.sh`, `run-sql-migrations.sh`, `pre-deploy-gate.sh`, the review-custody and
migration-compatibility scripts, `rollback-guards/`) already matched the target; nothing in the
checkout was changed.

Witnessed in the log, in order: lock acquired; built-image provenance `GIT_COMMIT=946e1f121`; the
gate ("Migration review custody + old-reader compatibility apply to the exact pending set");
old reader `84e12cf00` re-witnessed immediately before migration; "Applied 4 new migrations";
"Migrations applied before candidate swap"; running provenance verified three ways; smoke tests.

## 3. Production state after the deploy (read 2026-11-09 ~19:38Z)

- Live: `GIT_COMMIT=946e1f121`, container created 19:35:36Z, `DEPLOY_LANE=deploy-lane`.
- Tags: `current` = `ee9eb0709032` (`946e1f121`); `previous` = `a1573dfba544` (`84e12cf00`).
- Ledger: `20261108000001_work_reading_scope.sql` 19:35:27.806Z ·
  `…000002_writer_decision_events.sql` 19:35:27.876Z · `…000003_living_work_kind.sql`
  19:35:27.935Z · `…000004_development_plans.sql` 19:35:28.014Z, all before the swap.
- `/api/health` (from inside the container): ok, `version` 946e1f121, uptime 153 s.
- Smoke: health, version, ready, main page, build-status lock, build-alert lock and
  constitutional verification PASS. WARN: deploy alert not sent (`alert_smtp_not_configured`;
  already in `docs/ops/NON_DELIVERY_REGISTER.md`).
- Co-Lab release gate (`scripts/verify-constitution-colab.ts`, in the container):
  **32 passed · 0 failed · 0 warned**.
- New tables exist, each with 0 rows; `living_works.kind` set on 0 rows; 41 receipts unchanged.

## 4. The review's low findings

- **F1** (constraint name of `participation_basis`). The reviewer could not see production's
  constraint names. Read before the deploy, the name was `context_disclosure_receipts_participation_basis_check`;
  after it, `context_disclosure_receipts` has exactly one CHECK per column for boundary,
  participation_basis and gesture, each with the widened set, plus `…_standing_has_scope`
  (10 CHECKs in all, 9 before). **Closed by observation.**
- **F2** (rollback to `84e12cf00`). The old reader's account deletion does not list the three new
  RESTRICT tables. The reviewer found that any member with such rows also has a `living_works`
  row, which already blocks that old reader's deletion, so a rollback adds no new block; it would
  surface as a 500 rather than the truthful 409. No rollback guard exists for `84e12cf00`.
- **F3** (migration runner). The runner's outer `BEGIN/COMMIT` wrap is redundant with each file's
  own, and the ledger INSERT runs without `ON_ERROR_STOP`. Already recorded (2026-09-14 S3 O1
  observations); bounded here because all four files are re-run safe. Seen in the log as the
  "already a transaction in progress" / "no transaction in progress" warnings.
- **F4** (target code, outside the migration act). `app/api/sovereign/manuscripts/[id]/plans/route.ts`
  confirms each disclosure receipt with the boolean `confirmDisclosureCrossed`, ignores a `false`,
  and still saves the plan: a receipt can stay `attempted` while a plan made from that text is
  recorded. The same shape the S3 lane repaired for the Ask route. **Open; not fixed here.**

## 5. Not established

No browser walk of the new Develop, decisions, reading-scope or plan surfaces. No independent
Class A/R20 code review of PR #2194 (the founder chose to deploy without it). Public-path
reachability through DNS and the router was not checked from outside; health was read inside the
container and by the deploy's smoke tests.
