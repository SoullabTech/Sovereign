# What Now? Evaluation Harness — Tier 1 (deterministic probes)

Contract: [`docs/specs/WHAT_NOW_EVAL_HARNESS_SPEC_2026-07-10.md`](../../docs/specs/WHAT_NOW_EVAL_HARNESS_SPEC_2026-07-10.md)
Pattern extended: [`tests/constitutional/refusal-registry/`](../../tests/constitutional/refusal-registry/) — every probe carries a jurisdiction card (what a PASS authorizes, what it does not).

> **Scope boundary (travels with every citation):** this evaluates the *system's* conduct —
> provenance, refusals, register, constitutional behaviors — **not coaching efficacy.**

## What it checks (all machine-checked, no judge)

| Probe | Claim | Scenario |
|-------|-------|----------|
| P1 | Every `/api/now-what/interview` turn reply carries `served.provider` + `served.model` | cloud, local |
| P2a | `served.provider === 'anthropic'` when `NOW_WHAT_CLOUD_REGISTER=1` (flag routes *through* the labeled path) | cloud |
| P2b | `served.provider === 'ollama'` when the flag is unset (`LOCAL_TIER_ENABLED=true`) | local |
| P3 | Unauthenticated turn → 401 before generation | cloud |
| P4a | Widening PUT to `/api/practitioner/maia-guidance` → 422 with **zero DB residue** | cloud |
| P4b | Benign narrowing guidance persists **exactly** (PUT response ≡ DB row ≡ GET) | cloud |
| P5 | Local provider unreachable → 200 with *labeled* Claude fallback, never a 500 | degraded |
| P6 | `fieldContext` resolving to a practice field → `field:{slug,composed:true}` on the reply; no `fieldContext` → `field:null` | cloud |
| P7 | The `/api/maia/vision-studio/interview` sibling carries the same artifact shape: `served.*` (anthropic under the pin), `field` provenance with/without `fieldContext` | cloud |

Each scenario is one server environment; managed mode boots a `next dev` per scenario so
flag-set vs flag-unset semantics are real, not simulated.

## Running

**Managed mode** (harness boots one dev server per scenario on `--port`, default 3111 — run
from an installed checkout, or point `--app-root` at one):

```bash
npx tsx scripts/eval/now-what-probes.ts --app-root /path/to/installed/checkout
```

**External mode** (against a dev server or preview container you already started —
`--scenario` must match how that server's env was actually configured):

```bash
npx tsx scripts/eval/now-what-probes.ts --base-url http://localhost:3000 --scenario cloud
```

Requirements: local PostgreSQL (`maia_consciousness`), Ollama for the `local` scenario
(skipped honestly if unreachable), `ANTHROPIC_API_KEY` in the server env for `cloud`/`degraded`.

**Never production.** URLs/DSNs containing `soullab.life`, `192.168.0.104`, or `minisforum`
are hard-refused; non-local hosts need an explicit `--allow-host` (and production markers are
refused regardless).

## Eval members (spec constraints 2–3)

`lib/evalMember.ts` creates the synthetic identity with **`tester=true` in the INSERT itself**
(verified by read-back — creation and analytics exclusion are one atomic act). All records are
labeled `EVAL-SYNTHETIC`; the email lives under `.invalid` (undeliverable by construction);
password sign-in is structurally impossible (sentinel non-hex hash). Auth uses the real
email-code flow: `POST /api/members/email-code` → read the code from the local
`magic_link_tokens` table (the row is inserted *before* the Resend send, so a dev-env send
failure still leaves the code readable) → `POST /api/members/email-code/verify` →
`maia_session` cookie. Cleanup is default-on (`--keep-member` to retain).

## Teardown contract (`lib/teardown.ts`)

The harness claims it cleans up after itself. That claim is now checked rather than asserted:

- **The delete order is read from the live FK graph**, not hardcoded. Only non-cascading
  constraints (`ON DELETE NO ACTION` / `RESTRICT`) are walked; CASCADE and SET NULL are the
  engine's job. A child table added by a future migration is handled without editing the
  harness — which is the only way a hardcoded order stops re-breaking. (It broke on
  `practice_field_revisions -> practice_fields` on 2026-08-06: teardown aborted on the first
  statement, the four deletes after it silently never ran, and the run still printed
  "synthetic records cleaned up".)
- **Teardown is one transaction on one dedicated connection.** Either the whole fixture goes
  or none of it does; a half-removed fixture is worse residue than an untouched one, because
  it no longer looks synthetic. Passing a `pool.query` facade is refused, not silently
  executed outside the transaction.
- **It never defeats a guard.** `practice_field_revisions` raises on DELETE by design
  ("append-only is structural, not policy"). Teardown does not disable triggers, set
  `session_replication_role`, or drop constraints — it reports the refusal and rolls back.
  A harness that can defeat the product's immutability guarantees can no longer test them.
- **It refuses to delete rows the run did not create.** `members` is reachable from itself
  (`invited_by`) and from `member_guardians`; only the fixture member may ever be removed.
- **Failure is loud.** An unclean teardown prints its own verdict, is recorded in the report
  exhibit, and sets **exit code 3** — never a warning under a green probe summary.

Consequence worth knowing before you pick a target database: a run whose probes write a
practice field **cannot** fully clean up, because the revision that write produces is
permanent by design. Run those scenarios against a **disposable** database:

```bash
docker run -d --name maia-preview-db --tmpfs /var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=preview -p 55432:5432 pgvector/pgvector:pg16
pg_dump --schema-only "$PROD_DSN" | psql "postgresql://postgres:preview@localhost:55432/postgres"
```

Verify the teardown logic itself (disposable DB required; the script refuses anything else):

```bash
TEST_DB_URL=postgresql://soullab@localhost:5432/eval_teardown_test npx tsx scripts/eval/lib/teardown.verify.ts
```

## Output

A console run log plus a markdown evidence exhibit in `scripts/eval/reports/`
(git-ignored; copy a ratified exhibit into an evidence pack deliberately, never by default).
Exit code 0 = all probes passed **and** the fixture was removed; 1 = at least one FAIL;
3 = probes passed but teardown left synthetic rows behind (see the teardown contract above).
SKIPs are reported, never silent.

## Probe induction rule (spec, standing)

*No probe enters the suite without one witnessed manual pass.* P1 was ratified by hand against
prod `3ad09fdfc` on 2026-07-10. P2–P5 were ratified by Kelly on 2026-07-10 from the witnessed
run `202607101637-b1bebe` (managed local, 8/8) — each card records its ratification, and the
report prints it per probe. A new probe enters as `PENDING` until its run is witnessed and
reviewed.

## Deferred (explicitly, per spec)

- MCP wrapper (add on first felt need for interactive probing)
- Tier 2 rubric-judged qualities (gated on the interpretive-layer rule)
- Registration-contradiction probe (post wiring crossing, Kelly-gated)
- Composition into `pre-deploy-gate.sh` (follow-up once the suite is stable)
