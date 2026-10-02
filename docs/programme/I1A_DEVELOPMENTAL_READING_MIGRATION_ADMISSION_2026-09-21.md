# I1A — DEVELOPMENTAL-READING OBSERVATION IDENTITY MIGRATION · CANONICAL ADMISSION RECORD

**This record exists so the schema dependency is mechanically discoverable at
the deployment boundary rather than found in a diff.** ⭐ It is the second of
two governance records; the first admits the C5/C6 code.

---

## §1 — THE ARTIFACT

- `database/migrations/20260921000001_developmental_reading_observation_identity_compatibility.sql`
- SHA-256 `bab0ac6a8c5d50072008a30b7785d3da127b65df90ca70290293c5dea0a9e11b` · 172 lines
- Inherited into the C5/C6 branch through `fix/ws-observation-identity-i1a-20260921`.
- Branch interval from merge-base `ff2f03f68`: **`A`** — this is the ONLY
  migration the branch adds.
- Authority: `WRITERS-STUDIO-OBSERVATION-IDENTITY-01 / I1A`.

**Verified content, ⛔ not restated from the header.** A scan for
`INSERT · UPDATE · DELETE · TRUNCATE · ALTER TABLE · DROP TABLE · CREATE TABLE ·
CREATE INDEX` returns **nothing**. The whole file is one transaction containing
one `CREATE OR REPLACE FUNCTION developmental_readings_observations_check()`.

⭐ So: ⛔ no row is mutated, ⛔ no table or index changes, ⛔ no backfill. What
changes is the validator, and nothing else.

---

## §2 — WHAT IT DOES

The observations trigger's **closed key set widens from seven to eleven**,
admitting the I1 identity group — `observationId · admissionIndex ·
basisFingerprint · position`.

- ⭐ **All-or-none.** Legacy observations carry none of it; canonical ones carry
  all of it; ⛔ partial identity is refused.
- ⭐ **Unknown keys stay refused** — JSONB is storage, ⛔ not an open schema.
- ⭐ **`position` is nullable by design**: structural-only evidence has no place
  in the prose, and ⛔ a position is never invented.
- ⭐ **The legacy shape remains lawful**, which is what makes the ordering
  asymmetric below.

---

## §3 — ⛔⛔ THE ORDERING IS ASYMMETRIC, AND THE DANGEROUS ORDER IS THE DEFAULT

| Order | Consequence |
|---|---|
| **migration → code** | ⭐ Safe. The validator widens; nothing yet emits the new fields; legacy readings stay lawful. |
| **code → migration** | ⛔ **Every developmental reading fails at the write.** The new identity shape meets the legacy validator and is refused. |

⚠️⚠️ **THIS IS NOT HYPOTHETICAL.** It was observed locally: each lens completed
a full model read and then died at the database boundary, and to the writer it
looked like MAIA thinking slowly and then failing. Production still runs the
legacy validator.

⚠️⚠️ **AND THE DEPLOY PATH DEFAULTS TO THE UNSAFE ORDER.**
`scripts/deploy-production.sh` runs **build → swap → verify → migrate**, so code
serves before schema. ⭐ A migration that runs only after the swap does not
satisfy the safety relation. ⚠️ A failed migrate step only `log_warn`s while the
deploy still reports *Deployment complete!*, so ⛔ **deploy-time migration
cannot presently be treated as a backstop.**

---

## §4 — THE SAFETY RELATION A LAWFUL DEPLOYMENT MUST ESTABLISH

```
required migration → verified compatible schema → code swap
```

or any mechanism that **proves the required schema is already present before the
dependent code becomes serving**. ⛔ Nothing weaker.

---

## §5 — STANDING

```
experiential programme      CLOSED / PASS
code admission              AUTHORIZED
schema migration present    YES
migration artifact          20260921000001_…_observation_identity_compatibility.sql
migration admission record  THIS DOCUMENT
production deploy           ⛔ NOT AUTHORIZED
production schema mutation  NONE YET
latent schema deployment    YES — canonical will hold a pending migration
code/schema ordering risk   ⛔ OPEN
```

⛔ **DEPLOYMENT HOLD, EXPLICIT:** do not expose the new developmental-reading
code to production while production still runs the legacy validator. ⛔ Canonical
admission authorizes no deployment, and the next qualifying full deploy — **for
this programme or any other** — would apply this migration under the September 7
latent-schema finding.
