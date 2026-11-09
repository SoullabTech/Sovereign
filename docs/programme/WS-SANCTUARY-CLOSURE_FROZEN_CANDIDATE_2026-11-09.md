# Sanctuary closure — frozen candidate and negative suite (2026-11-09)

Lane: Writer's Studio (#1800, SOULLAB-CONTINUITY #1982). Founder rulings 2026-11-09: Sanctuary keeps nothing; a device with no saved setting follows the member's account default; Sanctuary blocks every write of something MAIA keeps or learns, never the writer's own manuscript work or a deletion; reading-permission grants and Press collections are refused in Sanctuary, revoking/removing never.
Evidence class: local, disposable PostgreSQL 16 (production-derived baseline 2026-09-01 + 90 migrations, 0 errors), fictional rows, provider-off (scripted model). ⛔ Not production, not Class A/R20, not the founder walk. Merge, migration, deploy and release stay HOLD.

## Frozen candidate
**SUPERSEDED as the review candidate by `0c55564b862f324e4a62122359f7f9154e81b27a`** (adds the G6 × D5 ruling: carried readings leave out dismissed observations; readings with no chapter text are not carried). The negative suite was re-run against it, clean tree: **8/8 in three consecutive runs** (N3 ordinary successes 2/4/4, turns added always 2 × successes — no half-written turn). Database suites at that SHA: 130/130. The text below records the earlier freeze as it was.

**Product source frozen at `94175aff4f4fcfec0c7c917bc47f69085ddf3605`** (branch `feature/ws-work-continuity-part-a-suite`, clean tree = remote at freeze). The suite and this record were added afterwards in test/doc-only commits: `git diff --name-only 94175aff4 -- . ':!tests' ':!docs'` is empty.
Commits in the closure, in order: `92ad371db` routes fail closed · `cb5f33a37` account default · `52cacca95` store witness · `fafa31bd2` every MAIA-kept write · `9bfef81e2` reading permission + collections · `94175aff4` G4 isolation (with `e16149e3b` clearing not-kept exchanges, `a5ac8929f` G4 offer).

## Negative suite — `tests/constitutional/ws-sanctuary-closure/frozen.probe.test.ts` (8/8, three consecutive runs)
Every not-kept request carries a unique marker; durable stores are inspected directly (ask turns and their provenance, decisions, corrections, plans, readings, themes, writer understanding) — never the HTTP response alone.
- **N1** absent, `null`, `'false'`, `0`, `1`, `'yes'`, `{}`, `[]`, `'true'`, `true` and a contradiction (`false` + `meta.sanctuary: true`): the Work conversation answers not-kept; the Living Work conversation answers not-kept or refuses a malformed posture (400); zero threads/turns added.
- **N2** posture changing within one conversation (ordinary → Sanctuary → undeclared → ordinary): exactly the two ordinary questions are kept, in order.
- **N3** ten concurrent requests on one conversation, half Sanctuary: all five Sanctuary answered, none kept. Ordinary ones that lost the known turn-index race (`THREAD_STORE_CONCURRENT_TURN_COLLISION`, routed to its owner, not this lane) failed **without a half-written turn** (turns added = 2 × successes in every run: 4/1, 3/2, 4/1).
- **N4** a Sanctuary retry after an injected-failure setup keeps nothing; an ordinary retry keeps exactly once. ⚠️ The injected failure itself is not asserted to have fired here (database-level setting reaches new pool sessions only); the half-written ordinary case is proven separately by the reading-carry FAILURE INJECTION test.
- **N5** another member, in every posture, reaches neither the Work conversation, the Living Work conversation nor an existing thread (404); no rows change for either member.
- **N6** readings, plans, decisions and corrections in Sanctuary, undeclared and `'false'`: 409, nothing kept, MAIA not asked.
- **N7** direct store calls with no / forged / `true` / string witness: refused before SQL; no rows.
- **N8** final inspection: no marker from 40+ not-kept requests exists in any of those stores.

## Also at this candidate
Database suites in band 129/130 (the one failure is the G6/D5 conflict, awaiting a founder ruling). Broad suites: failing set identical to before the closure (31, inherited). Type gate: no regressions. Each mechanism's lethality was shown when it landed (its tests fail on the previous code); this suite has not itself been run against pre-closure code.
Write-room desk: audited, no change needed — its client never sends an unreadable posture (it asks the writer to choose), all five desk routes require an explicit posture and refuse Sanctuary, and the store now refuses without a witness. The editorial lane's own Sanctuary matrices fail on canonical too (inherited).

## Not established / still owed
Server verification of the per-session switch (`SANCTUARY-INIT-GATE-01`, not built; until then the server trusts the device's explicit `true`/`false`) · G6/D5 founder ruling · manuscript import refusing Sanctuary (other lane; conflicts with the ruling) · independent Class A/R20 review · the founder walk · production schema read.

## Re-run on `e2811581c` (Develop redesign + MAIA offers), 2026-11-09
Run by the lane's owning session on its disposable DB: **DB suites 130/130** (ws-sanctuary-closure 8/8 + ws-work-read-scope + ws-develop-studio + ws-decision-continuity, in band); WorkConversation + `lib/sanctuary` **121/121**. ⚠️ The worktree also held another session's staged-but-uncommitted prompt-rule files (`editorialDepth.ts`, craft-convention tests and witness files) during the run; they change prompt rules only, not storage. So the evidence is for `e2811581c` plus those files, not `e2811581c` alone. ws-delete probes need a database named `ws_delete_fictional` and fail at HEAD on a fixture `passkey` issue (inherited).

### Recipe (disposable DB)
- PostgreSQL 16 at `/opt/homebrew/opt/postgresql@16`. Fresh cluster: `initdb -A trust -U fictional -E UTF8`; start on `127.0.0.1:54331` with `unix_socket_directories=/tmp/wsq` and `LC_ALL=en_US.UTF-8`; `createdb q`.
- `DATABASE_URL=postgresql://fictional@127.0.0.1:54331/q bash scripts/bootstrap-database.sh`, then `scripts/run-sql-migrations.sh` with `/app/database/migrations` replaced by the checkout's path (90 applied, 0 errors).
- `DATABASE_URL=postgresql://fictional@127.0.0.1:54331/q WS_READ_SCOPE_DYNAMIC=fictional-only npx jest --runInBand tests/constitutional/ws-sanctuary-closure tests/constitutional/ws-work-read-scope tests/constitutional/ws-develop-studio tests/constitutional/ws-decision-continuity`
- Stop the cluster afterwards.
