# JARVIS-KP-01 / I5-P0R2 — REMEDIATION RUNBOOK (UNSPENT)

**Date**: 2026-09-22
**Artifact**: `scripts/witness/i5-p0r2-remediation.sh`
**Standing**: ⛔ **UNSPENT · refuses to run against its own draft · cannot be run from this container**

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Why a script and not prose

The remaining work is three production acts in a fixed order, with a dozen
invariants that must hold before, between and after them. Prose runbooks lose one
of those invariants under pressure. This expresses the draft `I5-P0R2`
authorization as **executable refusal**: every condition the act names is a stop
condition the script enforces, in order, and the instrument gates the mutation
rather than sitting beside it.

⛔ It is **not** authority. It refuses to run without `--authorization` naming an
issued record, and **it refuses when the record still declares itself a draft** —
verified:

```
REFUSED AUTHORIZATION_IS_A_DRAFT: …I5-P0R2_DRAFT_AUTHORIZATION_2026-09-22.md
    still declares itself a draft
```

⭐ So the script cannot be spent until the founder issues a record that no longer
says it is one. ⛔ It **cannot** verify that a named record is genuinely a founder
act — it can only require that the operator name it. That is its limit, stated,
not a claim.

---

## 2. Order, and what stops it

| Phase | Does | Stops on |
|---|---|---|
| 1 | binds image ID + running `GIT_COMMIT`; runs the git-side `check` and the **in-container** seam witness | `GIT_COMMIT=unknown`, seam refusal, `ANCESTRY_UNVERIFIABLE` |
| 2 | asserts all five flags are non-literal-`1` | any flag already `1` |
| 3 | records both row counts | either count unreadable |
| 4 | resolves the unique `admin_role = founder` identity | count ≠ 1 |
| 5 | **the only mutation**: two keys in `.env.production`, after a timestamped backup | a key appearing more than once; any flag found set to `1` |
| 6 | optional reload, `--no-deps --no-build maia` only | image ID changed |
| 7 | re-asserts flags OFF, allowlist = 1 + match, model set = 1, **row counts unchanged**, and **re-runs both seam checks** | any of them |

Default is **dry run**. Mutation requires `--apply`. Reload requires an explicit
`--reload compose-no-deps` — ⚠️ **FOUNDER DECISION 1 made explicit rather than
implicit**, because a bare `compose up -d` recreated nine containers on
2026-09-14.

The Founder identifier is **never printed**: the script emits `founder_count=1`,
a 12-character SHA-256 fingerprint, and `match=YES|NO`.

---

## 3. ⭐ One finding that changes what the witness can claim

`configuredRelationalFieldShadowMemberIds()` and
`configuredRelationalFieldShadowModels()` (`lib/maia/relational-field-shadow/runner.ts:29-38`)
both return `[]` when `MAIA_RELATIONAL_FIELD_SHADOW !== '1'`.

So while the outer flag is OFF — which this act requires — **the runtime's own
view of the allowlist and the model set is empty regardless of what the
environment contains.** The witness therefore reads the environment directly, and
what it establishes is **CONFIGURATION**, ⛔ not the runtime's effective view.

⛔ *"The runtime would admit exactly one member"* is **not** established by a
passing P0R2 and is **owed to P1**, where the flag is `1` and the two converge.
Reading the configuration check as the runtime check would be precisely the
substitution this lane exists to refuse.

⭐ The fail-closed direction is the safe one: a forgotten flag yields an empty
allowlist, never a wide one.

---

## 4. Verified here

Refusals fire, in a container with no docker daemon and no production route:

- `MISSING_AUTHORIZATION` · `AUTHORIZATION_NOT_FOUND` · `AUTHORIZATION_IS_A_DRAFT`
- `UNKNOWN_ARGUMENT` · `UNKNOWN_RELOAD_MODE`
- `STOP CONTAINER_UNREADABLE` when the container cannot be read — ⭐ the script
  stops at phase 1 rather than proceeding on assumptions

⛔ **Its mutating and production-reading paths are UNEXERCISED.** They cannot be
exercised from here, and a dry run on the real host is the first thing owed.

---

## 5. Sequence owed, in order

1. Founder **issues** `I5-P0R2` (amend the draft, resolve the two FOUNDER
   DECISIONS, and remove the draft declaration — the script keys on it).
2. On minisforum, from the checkout: **dry run** with `--authorization <issued>`.
   Read every phase-1 line before going further.
3. Same command with `--apply`, plus `--reload compose-no-deps` if the
   configuration mechanism needs it.
4. On `I5-P0 READY FOR FOUNDER P1 WITNESS`: **freeze** the instrument by blob
   hash — now that it has met a real production substrate, which is what the
   freeze was waiting for.
5. Only then, a separate founder act for P1.

---

## 6. Standing

Runbook **UNSPENT** · refusals **VERIFIED** · mutating paths **UNEXERCISED** ·
authorization **NOT ISSUED** · instrument **CANDIDATE, NOT FROZEN** · B1 and B2
**UNREPAIRED** · ⛔ no production read · ⛔ no flag enabled · ⛔ no shadow
executed · ⛔ no row written · ⛔ no migration · ⛔ no deploy · ⛔ I5-P1 NOT
OPENED · **PRODUCTION UNTOUCHED.**
