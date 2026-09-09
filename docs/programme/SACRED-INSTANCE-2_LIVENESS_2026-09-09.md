# SACRED-AS-SYMPTOM · INSTANCE 2 — liveness census (read-only)

```ts
// lib/memory/beads-sync/MaiaBeadsPlugin.ts:260
bypassRisk: event.element === 'aether' ? 'spiritual' : 'none',
```

> ⭐ **Liveness determines the BLAST RADIUS — not whether the assignment violates the canon.** The
> assignment is already the pure violation: a psychological/safety classification created **solely
> from the element name**, inside `maiaMeta.cognitive` on a task raised for a field-imbalance event.

## VERDICT — **LATENT canon violation**

**Not operative. Not persisted in production. Not spoken to anyone.**

| Hop | Finding |
|---|---|
| **A · PRODUCER** | `onFieldImbalance()` has exactly one non-test caller: `maiaServiceIntegration.ts:107`. ⭐ **Nothing in the application imports that module.** Its wiring exists only as an **unapplied `.patch` file** (`lib/memory/beads-sync/maiaService.integration.patch`). Neither `maiaService.ts` nor the live route imports the plugin. |
| **B · PERSISTENCE** | Implemented but unreachable: `server.ts:204` binds `cognitive.bypassRisk \|\| 'none'` as an SQL parameter. ⛔ **beads-sync is NOT in `docker-compose.production.yml`** — only `Dockerfile.beads-sync` and a **staging** deploy script. |
| **C · CONSUMPTION** | **No reader exists in code.** `bypassRisk` appears only at its declaration (`:38`), its two writes (`:189`, `:260`), and the persistence bind (`server.ts:204`). |
| **D · EGRESS** | **None.** No member UI, no practitioner UI, no MAIA prompt, no provenance header, no telemetry. |

⭐ **The repository's own map already says so**: `lib/maia/substrateMap.ts:254` classifies
`lib/memory/beads-sync/` as **`legacy` — "Maia Beads — test phase."**

⚠️ **One thing this census cannot establish from here:** whether the beads-sync service is currently
running in **staging**. `scripts/deploy-beads-staging.sh` exists. If it is running, hop B becomes
live *in staging* — a persisted false classification, still with no consumer.

## 🔴 The latency has a specified future

`docs/SPIRAL_MEMORY_MESH_SPEC.md:250` designs the consumer that does not yet exist:

```ts
// Bypassing risk gate
if (task.cognitive.bypassRisk === 'spiritual' &&
    cognitiveProfile.bypassingFrequency.spiritual > 0.3) {
  return false;
}
```

⭐⭐ **So the design intends this value to GATE what a member is offered.** The moment that gate is
implemented, an Aether task is withheld from anyone whose measured spiritual-bypassing frequency is
above 0.3 — **because the task concerned the sacred element, not because of anything the member
did.** ⛔ **A latent violation with a written plan to become operative is not the same as dead code**,
and should not be filed as such.

## Untyped seams on the path (per the 01B rule)

> ⭐⭐ **A clean typecheck proves only what the type system can see. `any` converts
> missing-contract errors into silence.**

```text
server.ts:153     `cognitive = {}` destructured from an untyped request body —
                  no schema validates bypassRisk at the persistence boundary
MaiaBeadsPlugin   `maiaMeta?: { … }` is an optional nested literal, not a named
                  contract; it is assembled at :179 and :250 and never validated
```

⚠️ **Both would have swallowed a shape change silently** — the same hole that hid `elementalNote`'s
five consumers in 01B.

## Verdict vocabulary, for reuse

```text
LATENT      the classification exists but nothing runs it          ← INSTANCE 2 today
PERSISTED   it runs and is stored, but no consumer reads it
OPERATIVE   a consumer changes routing, eligibility or cognition
SPOKEN      it or something derived reaches a member or practitioner
```

⭐ **This vocabulary exists to stop "exists" being promoted into "is spoken"** — the mistake made
about STATE 2 and corrected by trace.

## Owed

Repair **alone**, with the sacred-language substitution test attached to **this exact mechanism**:
changing only the element must not change any risk classification. ⛔ Do not repair alongside
`EVIDENCE-NAMING-01`.

**Standing: LATENT · repair not begun · nothing changed by this census.**
