# JARVIS-KP-01 / I5-P0R2 — DRAFT FOUNDER AUTHORIZATION (CANDIDATE TEXT)

**Date**: 2026-09-22
**Standing**: ⛔ **DRAFT. NOT A FOUNDER ACT. NOT AUTHORIZED. NOTHING BELOW IS IN FORCE.**
**Purpose**: the text the founder would issue to make `I5-P0` spendable, prepared
so the next act does not have to be composed from scratch a fourth time.

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## Why this draft exists

`I5-P0` and `I5-P0R1` both died on anchor drift, not on architecture. Re-issuing
the same exact-SHA form would die the same way on the next unrelated deploy. The
draft below changes **one thing** — how the act binds to the substrate — and
carries everything else forward unchanged.

⚠️ Two judgment calls are flagged inline as **FOUNDER DECISION** rather than
resolved. A draft that silently resolves them would be a proposal wearing an
authorization's clothes.

---

## DRAFT TEXT BEGINS

```
FOUNDER AUTHORIZATION — AUTHORIZE `JARVIS-KP-01 / I5-P0R2 —
FOUNDER-SCOPE CONFIGURATION REMEDIATION + PROPERTY-BOUND READINESS WITNESS` ONLY.

Accept the completed dispositions:

  I5-P0   NOT READY  (production mutated during the witness)
  I5-P0R1 NOT READY  (both exact-SHA anchors stale before the mutation window)

Accept the finding that both failures were ANCHOR DRIFT, and that no isolation,
telemetry, representation or authority falsifier has failed in either act.

Preserve:

  NO SEMANTIC JOIN WITHOUT A WARRANT.

## I. BINDING — PROPERTY, NOT POINT SHA

This act is NOT bound to a production SHA or a canonical SHA. It is bound to the
seam identity of the I5 runtime surface, which both prior acts asserted had not
moved and which is now mechanically checkable.

Authorize the act while, and only while, ALL of the following hold at the moment
of each step:

  1. the production running SHA is CONTAINED IN canonical
     (`ancestry` verdict = ANCESTOR; a verdict of ANCESTRY_UNVERIFIABLE is a
     STOP, never treated as a negative and never treated as a pass);

  2. `npm run witness:seam-identity -- check --production-sha <running SHA>
      --canonical-rev origin/clean-main-no-secrets
      --expect 195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b`
     exits 0;

  3. inside the running container,
     `node /app/scripts/witness/seam-identity-container.mjs
      --expect a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51`
     exits 0, and its `entailed_only` line is recorded as ENTAILED, never as
     witnessed;

  4. the production IMAGE ID is unchanged across the whole act.

A canonical or production SHA that advances mid-act is NOT a stop condition
provided 1–4 still hold. A seam digest that moves IS a stop condition, whatever
the SHAs say.

⭐ This replaces falsifier 22. What must not happen is a SUBSTRATE CHANGE UNDER
THE WITNESS — not any commit anywhere during the window. Conflating the two is
what made the previous two acts unspendable.

## II. AUTHORIZED CONFIGURATION REMEDIATION

Unchanged from I5-P0R1 §II. Set, in `/home/soullab/MAIA-SOVEREIGN/.env.production`:

  MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS = <the unique member identity whose
  database standing is `admin_role = founder`>

    - cardinality exactly 1
    - no wildcard, no second member, no practitioner class, no beta/tester class
    - do NOT print or record the raw identifier in programme evidence; record
      only count = 1, match = yes, and a non-reversible fingerprint

  MAIA_RELATIONAL_FIELD_SHADOW_MODELS = qwen2.5:14b-instruct

    - exactly one model, already present on the production Ollama host
    - no fallback, no family substitution, no inheritance from live routing
    - no model execution during this act

## III. FLAGS THAT MUST REMAIN OFF

MAIA_RELATIONAL_FIELD_SHADOW · MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW ·
AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED · MAIA_RELATIONAL_FIELD_H8 ·
MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION

Every one must remain non-literal-`1`. This act configures future P1 scope only.
It does not launch a shadow.

## IV. SERVICE RELOAD AUTHORITY

If the configuration mechanism requires it, authorize recreation/restart of
`maia-sovereign` FROM THE IMAGE IT IS ALREADY RUNNING — bind the image ID before
and require it identical after.

Do NOT: rebuild, pull code, deploy a new SHA, move image tags, run migrations, or
restart PostgreSQL / Caddy / Ollama. Do not restart merely for ceremony.

⚠️ FOUNDER DECISION 1 — `docker compose up -d` with no service argument
recreated NINE containers on 2026-09-14, not one. If the reload path is compose,
authorize it explicitly as `--no-deps maia-sovereign`, or accept the wider blast
radius knowingly. Do not leave it implicit.

## V. NO SHADOW EXECUTION DURING REMEDIATION

Before mutation, record the relational-field research row count and the I4
telemetry row count. After configuration load and stabilization, require both
UNCHANGED, plus: zero new shadow rows, zero new I4 telemetry rows, zero shadow
execution log markers attributable to R2, and no Ollama /api/generate request
initiated by this act.

Because the outer shadow flag remains OFF, any new row is a STOP condition.

## VI. READINESS RE-WITNESS

Re-run the I5-P0 falsifier set (1–21, plus §I.1–4 in place of 22) against the
substrate the binding admits. Additionally require:

  - Founder allowlist count = 1 AND match = YES
  - shadow model count = 1 AND exact model = qwen2.5:14b-instruct
  - that model present on local Ollama
  - no fallback model configured

## VII. IF THE WITNESS PASSES

Return a proposed bounded Founder P1 witness. Do NOT execute P1.

⚠️ FOUNDER DECISION 2 — P1 turn count, observation window and abort thresholds
are not predeclared by this act and must be fixed by the act that authorizes P1,
not inferred from this one.

## EXPLICIT NON-AUTHORITY

This act does NOT authorize: enabling either shadow flag; executing a shadow
model; producing a shadow research row or an I4 telemetry row; I3 persistence;
H8; cross-session evidence; migration; evidence deletion; deployment; code
change; response influence; memory/graph/projection mutation; routing or provider
changes; I5-P1; I6; I7.

Return only `I5-P0 READY FOR FOUNDER P1 WITNESS` or `I5-P0 NOT READY` with exact
blockers. Stop before P1.
```

## DRAFT TEXT ENDS

---

## What this draft deliberately does NOT do

- ⛔ It does not **freeze** the instrument. A freeze before the instrument has
  ever met a real production substrate would pin bytes that may still need
  repair — and on this project's own law, *a probe is not the record*. The freeze
  belongs after the first successful container-side run, not before.
- ⛔ It does not widen the seam, narrow the seam, or remove the 16 `__tests__`
  files from it. Those are founder calls.
- ⛔ It does not assert the seam digests are **correct** — only that they have not
  moved. Correctness of the epistemic-join architecture is the subject of the
  falsifier set, not of this binding.
- ⛔ It resolves neither flagged FOUNDER DECISION.

## Standing

⛔ **DRAFT · NOT ISSUED · NOT IN FORCE** · instrument **CANDIDATE, UNWIRED** ·
B1 and B2 **UNREPAIRED** · ⛔ no production read · ⛔ no flag enabled · ⛔ no
shadow executed · ⛔ I5-P1 NOT OPENED · **PRODUCTION UNTOUCHED.**
