# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · Stage 2 — EDITORIAL ACTIVATION

**Status: ✅ ACTIVATED AND VERIFIED · smoke 14/0 · ✅ MACHINE-SIDE COMPLETE · ⚠️ four surface observations OWED · ⛔ Chapter 10 NOT OPENED**

```
production            ae27205d9   (unchanged — this was an activation, not a deployment)
editorial flag        OFF → ON
```

## The act, as run

```
hostname              soullab      reported, not gated
MAIA_HOST_ID          minisforum   reported, not gated

P1  container GIT_COMMIT   ae27205d9        image == :current   sha256:fcc30b53825c…
    lane deploy-lane · healthy · flag absent · migrations 7 · 17 other containers pinned
P2  lane lock acquired     pid 438226, entry ws-stage2-activation
P3  compose selects        maia-sovereign:prod → SAME ARTIFACT
P4  backup .env.production.pre-stage2.20260916T000313Z · flag written · --no-build
P5  GIT_COMMIT ae27205d9 · image sha256:fcc30b53825c… UNCHANGED · healthy · flag 1
    container recreated    7b45c6654b0a… → 0dfd55187bca…   (required)
    other containers       UNTOUCHED
```

⭐ **The distinction held exactly as designed.** The container ID changed — that is
how an env change lands, and had it NOT changed the flag reading would have come
from a process that never saw it. The image ID did not. ⭐ **Only
`maia-sovereign` was recreated**, against Stage 1's ten — the whole-stack diff
proved it rather than the act promising it.

## Smoke — read only, 14 passed · 0 failed

```
container is the pinned release ✅        editorial is ON ✅
chains 0 · versions 0 · authorizations 0 · threads 1   — unchanged before and after
adoption route        HTTP 401  reachable and protected (⛔ 404 would have been a FAIL)
relationships route   HTTP 401
Writer's Studio       HTTP 200
the Work · Chapter 10 scope  present
```

## ⚠️ ONE INSTRUMENT WEAKNESS, NAMED RATHER THAN LET PASS

The founder's acceptance list required **migrations 7/7 after activation**. The
post-check printed **`migrations (2026-09) 30`** — because I had written it to
count `filename LIKE '202609%'`, every September 2026 migration, instead of the
seven by name as P1 does.

⛔ **So "7/7 after activation" is NOT ESTABLISHED BY THIS RUN.** What the run
establishes is:

- **WITNESSED** — the seven, by name, `= 7`, immediately **before** the act (P1)
- **ENTAILED** — the act ran `up -d --no-deps --no-build maia`, touched no
  database and recreated no database container (the whole-stack diff proves
  `maia-postgres` was untouched), so no mechanism in it could change the ledger
- ✅ **MEASURED, 2026-09-16, founder-run** — the seven, by name, **after** activation: **`7`**

> ⭐ **The gap is closed by measurement, not by argument.** The line above stood
> as `⛔ NOT MEASURED` until the founder ran the query and it returned `7`; it is
> corrected here rather than rewritten, so the record shows that the entailment
> was held as entailment until evidence replaced it. ⚠️ An earlier attempt at the
> same query failed on shell quoting — ⛔ a failed command is not a measurement,
> and it was not counted as one; the literal rerun is the evidence.

⭐ **The number was never compared to anything, which is what made it worse than
a failure**: an unscored value printed beside scored ones reads as evidence and
is not. Repaired — the post-check now asks P1's question and STOPs on a mismatch.
⛔ The repair does not retroactively make today's run a measurement.

One line closes it whenever convenient:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -qtAX -U soullab maia_consciousness -c \"
  SELECT count(*) FROM schema_migrations WHERE filename IN (
   '20260914000001_proposal_succession.sql','20260914000002_manuscript_revision_offers.sql',
   '20260914000003_proposal_chains_member_identity.sql',
   '20260914000004_manuscript_revision_authorizations.sql',
   '20260914000005_editorial_ontology.sql',
   '20260915000001_ask_threads_subject_preparation.sql',
   '20260915000002_editorial_turn_bindings.sql');\""
```

⚠️ Also cosmetic, recorded so it is not mistaken for a defect: `git rev-parse
--short HEAD          # must print 2c0cc9842` returned `fatal: Needed a single
revision` — zsh passed the `#` comment as an argument. The worktree line above it
already read `HEAD is now at 2c0cc9842`.

## ⚠️ OWED — four observations only the founder can make

⛔ Not scored, and ⛔ not inferable from any row count:

1. Writer's Studio loads, and Chapter 10 is where you left it.
2. MAIA's ordinary conversation is present.
3. *"Work on an exact passage →"* is now **visible**. It was not, before.
4. Nothing opened by itself on arrival.

⛔ **Do not click into an editorial relationship to confirm the button works.**
Its visibility is observation 3; opening one is Chapter 10's act.

## Standing

```
Stage 1                    ✅ CLOSED
Stage 2 activation         ✅ VERIFIED
named migrations after     ✅ 7 / 7 MEASURED (founder-run, 2026-09-16)
machine-side record        ✅ COMPLETE — nothing automatable remains
production smoke           ✅ automated 14/0 · ⚠️ four observations OWED
REAL-WORK-ACCEPTANCE-01    ⛔ separate act, NOT OPENED
developmental-reading leg  ⛔ unresolved — no production subject or runtime,
                              and it gains no standing from this activation
```
