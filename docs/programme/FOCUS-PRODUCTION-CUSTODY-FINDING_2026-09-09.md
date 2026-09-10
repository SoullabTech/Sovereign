# FOCUS · PRODUCTION CUSTODY FINDING

**2026-09-09 · confirmed from the running container.** ⛔ Nothing changed in
production by this record.

## What the read-only witness established (the question we asked)

```text
4 subject relations              PRESENT
section_addressable_at           PRESENT
manuscript_working_drafts_round_trip()   PRESENT
20260830000001                   applied 2026-09-03 13:50:26Z
ledger entries                   529
manuscripts 13 · drafts 10 · addressable 3 · draft sections 699
transaction ROLLBACK · writes NONE · exit 0
```

⭐ **Ruling: do not migrate production.** The substrate 01B needs is already there,
and 3 addressable Works means the second possible blocker is absent too.

⭐ **The custody correction earned itself.** "Absent from production" would have
been the wrong conclusion: the baseline was captured 2026-09-01, the migration
landed 2026-09-03. *A snapshot is a reading at a time.*

## Finding 1 · the production walk is blocked on the SUBJECT, not the schema

Production serves **`5f65038d2`** — the #1276 merge commit — confirmed from the
container's own `GIT_COMMIT`, not inferred from the ledger or the 405.

```text
production schema        READY
addressable Works        READY (3)
production Focus code    WRONG SUBJECT — 01A and 01B NOT PRESENT
production walk          BLOCKED
```

The deployed assembler is the pre-01A one: `JOIN manuscripts m … m.user_id`
(relations that do not exist), `[...text].slice()`, `join('\n\n')`. ⛔ A walk run
against production today would witness **a different implementation from the one
we falsified and repaired**.

## Finding 2 · merge-to-canonical is operationally a deploy authorization

#1276 merged at **2026-09-09 23:47:35Z**; the migration was in production at
**23:59:24Z** — twelve minutes later. The PR itself said *"Deploy is not
authorized by this PR"*, recorded the human witness as unspent and manual testing
as not performed.

> ⭐⭐ **In the present system, merge-to-canonical is operationally a deployment
> authorization whether the programme treats it that way or not.**
>
> ⭐ **A document saying "deploy not authorized" currently has no mechanical
> force.**

⚖️ **Attribution, stated precisely (founder):** the merge event is attributed to
the `Soullab` account with `performed_via_github_app: null`. ⛔ **This evidence
does not support a claim that Claude performed the merge**, and none is made. The
GitHub gate established merge *eligibility* only — its bot comment says branch
protection determines that — and no human PR review is recorded.

⚠️ This is the **same defect CLAUDE.md already records from 2026-09-07**,
recurring: a lane's migration reaches canonical, and the next deploy applies it.
The founder gate sits on the deploy decision; **nothing gates the branch.**

⛔ **Not this session's commits.** `10cdc7bc4` and `43ad6890…` are not ancestors
of `5f65038d2`; a parallel copy carried the work in.

## Ruled next move — witness environment, not another production merge

```text
KEEP production Focus flag OFF · NO production migration · NO production walk
NO #1275 movement · NO corrective production deploy yet

serve exact 43ad6890…  in an isolated witness environment
verify runtime SHA  ==  43ad6890880be776b98d8e7cdff295d7bae7e919
use the existing schema substrate
run the held Focus walk there
```

⭐ The deployed inert Focus route is **left alone**: the flag is off, and there is
no reason to make another production change to undo an inactive one before the
deployment-control failure is understood.

## ⚠️ Owed before that walk — which database?

The walk **writes**: a consent row and a disclosure receipt, at minimum. So the
witness environment's `DATABASE_URL` is a containment decision, not a detail.

- Pointed at **production** → the walk writes receipts and turns into production,
  which contradicts `NO production walk`.
- Pointed at a **local** database → confirm it carries the schema **and** at least
  one addressable Work with real authored text, or steps 2–4 have nothing to read.

⭐ The read-only instrument already answers this against any database:

```bash
psql "$LOCAL_DATABASE_URL" -f scripts/witness/production-focus-schema-witness.sql
```

⛔ Do not resolve the fork by pointing the witness at production because the local
substrate is thin. That would spend the containment to save a fixture.

## Standing

```text
01A instrument           edf6352f9adcc73b68ce688de9a97c835833b58e
01B implementation       43ad6890880be776b98d8e7cdff295d7bae7e919
production serving       5f65038d2  (wrong subject, flag OFF, inert)

production schema        READY — migration NOT NEEDED
production walk          BLOCKED
witness environment      not yet established
custody defect           OPEN — own bounded lane
#1275                    FROZEN
```
