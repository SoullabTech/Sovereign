# JARVIS-KP-01 / I5-P0R2 — FOUNDER AUTHORIZATION (ISSUED)

STATUS: ISSUED
**SUPERSEDED IN PART** — §I.2's expected full-scope digest `195b16bc…` was re-pinned
to `b828400c…` by founder disposition (a), 2026-09-22, after review of the only
movement in the declared seam. See
`JARVIS-KP-01_I5-P0R2R2_REPIN_AND_BOUNDARY_WITNESS_2026-09-22.md`. Every other
clause stands unchanged, and the text below is preserved verbatim.
**Date**: 2026-09-22
**Act**: `I5-P0R2` — Founder-scope configuration remediation + property-bound readiness witness
**Instrument accepted at**: `e2f7d806d69576cc36a17f4ea6ba8747b1d877da`
(`scripts/witness/i5-p0r2-remediation.sh` · `docs/programme/JARVIS-KP-01_I5-P0R2_RUNBOOK_2026-09-22.md`)

> NO SEMANTIC JOIN WITHOUT A WARRANT.

This file is the record the execution instrument names with `--authorization`. It
records the act as issued. The instrument is **not** frozen by blob hash by this
act; freeze is owed only after the first successful production-substrate
execution.

---

## Accepted dispositions

- `I5-P0` — NOT READY: production mutated during the witness.
- `I5-P0R1` — NOT READY: both exact-SHA anchors were stale before the mutation window.

Both failures were **anchor drift**. Neither established a failure of the
isolation, telemetry, representation or authority architecture.

## I. Property-bound substrate authority

Authorized while, and only while, every step satisfies all of:

1. the production running SHA is contained in current canonical, ancestry verdict
   `ANCESTOR`; `ANCESTRY_UNVERIFIABLE` is a STOP;
2. the git-side seam witness passes against
   `195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b`;
3. the running-container seam witness passes against
   `a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51`;
4. the production image ID remains unchanged throughout the act.

A canonical or production SHA advance is not by itself a STOP if these properties
remain satisfied. A seam-identity change or a production-image change is a STOP.

## II. Authorized configuration remediation

Exactly two corrections in `/home/soullab/MAIA-SOVEREIGN/.env.production`:

- `MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS` → the unique member identity whose
  database standing is `admin_role = founder`. Cardinality exactly 1; no
  wildcard; no second member; no practitioner class; no beta/tester class. The
  raw identifier must never be printed or recorded in programme evidence —
  evidence may carry only count, `match=YES|NO`, and a non-reversible fingerprint.
- `MAIA_RELATIONAL_FIELD_SHADOW_MODELS=qwen2.5:14b-instruct`. Exactly one model,
  already present on the production Ollama host; no fallback; no family
  substitution; no inheritance from live routing; no model execution under this act.

No other `.env.production` mutation is authorized. A timestamped pre-mutation
backup is required.

## III. All activation flags remain OFF

`MAIA_RELATIONAL_FIELD_SHADOW` · `MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW` ·
`AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED` · `MAIA_RELATIONAL_FIELD_H8` ·
`MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION` must remain non-literal-`1` before and
after remediation. This act configures future P1 scope only; it enables and
executes no shadow.

## IV. Service reload — RESOLVED

A reload is authorized only if required to load the remediated configuration into
the running MAIA service. The only authorized Compose form is the instrument's
bounded service recreation:

```
docker compose -f docker-compose.production.yml up -d --no-deps --no-build maia
```

The running production image ID must be bound before recreation and proven
identical afterward.

Prohibited: bare `docker compose up -d`; dependency recreation; rebuilding; image
pulling; code deployment; image-tag movement; migrations; PostgreSQL restart;
Caddy restart; Ollama restart; recreation of any unrelated service. The
nine-container recreation blast radius observed on 2026-09-14 is not authorized.

## V. No shadow execution or database effect

Record `maia_relational_field_shadow_runs` and
`maia_epistemic_join_integration_shadow_runs` row counts before mutation; both
must be unchanged after configuration load and stabilization. Require zero new
rows of either kind attributable to this act, zero shadow-execution log markers
attributable to this act, and no Ollama `/api/generate` request initiated by this
act. Any such occurrence is a STOP.

## VI. Readiness witness

Re-run both seam witnesses after remediation. Require: unchanged production image
ID; all five activation flags still OFF; configured Founder allowlist count
exactly 1; configured Founder identity `match=YES`; configured model count
exactly 1; configured model exactly `qwen2.5:14b-instruct`; required model present
locally; no fallback configured; both recorded row counts unchanged.

**Accepted epistemic limitation.** While `MAIA_RELATIONAL_FIELD_SHADOW !== '1'`
the runtime helpers intentionally return an empty effective member/model set.
`I5-P0R2` may therefore establish **CONFIGURATION READINESS ONLY**. It may not
claim that the live runtime would admit exactly one member or one model. That
runtime-effective admission claim is owed to P1.

## VII. P1 parameters — RESOLVED BY DEFERRAL

This act does not determine, infer or authorize P1 turn count, P1 observation
window, or P1 abort thresholds. Those must be fixed explicitly in the separate
Founder act that authorizes P1. A successful P0R2 may only return a proposed
bounded P1 witness; it may not execute P1.

## VIII. Explicit non-authority

Does not authorize: enabling either shadow flag; executing a shadow model;
creating a shadow research row; creating an I4 telemetry row; I3 persistence; H8;
cross-session evidence; migration; evidence deletion; deployment; code change;
response influence; memory mutation; graph mutation; projection mutation; routing
changes; provider changes; `I5-P1`; `I6`; `I7`.

## IX. Required execution order

On the production host:

1. execute the remediation instrument in dry-run mode against this issued record;
2. inspect and accept every Phase 1–4 result before mutation;
3. only then execute with `--apply`;
4. use `--reload compose-no-deps` only under §IV;
5. complete the post-witness;
6. return only `I5-P0 READY FOR FOUNDER P1 WITNESS` or `I5-P0 NOT READY` with the
   exact blocker.

On `READY`, stop. Do not execute P1. The successful production-tested instrument
must then be frozen separately by exact blob hash before any P1 authorization is
issued.
