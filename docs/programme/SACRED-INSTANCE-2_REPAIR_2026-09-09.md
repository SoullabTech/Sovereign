# SACRED-AS-SYMPTOM · INSTANCE 2 — REPAIR

**Census:** `c61cb03a6` (`docs/programme/SACRED-INSTANCE-2_LIVENESS_2026-09-09.md`,
authored in a separate session, on `origin/feature/jarvis-ws2-sel0-production-discovery-2026-09-08`).
**Repair base:** canonical `5b133abcd`. The three subject files are byte-identical
on canonical and on the census branch, so the repair is bound to the same subject
the census read.

```ts
// the defect, as it stood — lib/memory/beads-sync/MaiaBeadsPlugin.ts:260
bypassRisk: event.element === 'aether' ? 'spiritual' : 'none',
```

> ⭐ **A sacred subject may be the content of an encounter. It may not become the
> evidence that the encounter is pathological.**

---

## 1 · Verdict vocabulary — refined before the repair

⭐ **Liveness is environment-specific, and must not silently become a global
property while one environment is unwitnessed.**

```text
PRODUCTION   LATENT
STAGING      UNKNOWN — may be PERSISTED
```

The census established the production verdict and explicitly left staging open
(`scripts/deploy-beads-staging.sh` exists; beads-sync is absent from
`docker-compose.production.yml`). ⛔ **"LATENT" alone would have been a claim
about an environment nobody looked at.** The staging witness does not block this
repair: code correction first, historical custody second.

## 2 · What was removed, and why `'none'` was not the repair

⛔ **The task-level `bypassRisk` concept is deleted from the executable shape** —
not re-defaulted.

```text
DELETED   TaskCreationParams.maiaMeta.cognitive.bypassRisk        (:38)
DELETED   the somatic writer's  bypassRisk: 'none'                (:189)
DELETED   the field writer's    element === 'aether' ? …          (:260)
NULLED    the persistence bind  cognitive.bypassRisk || 'none'    (server.ts:204)
```

⭐ **`'none'` is also a claim.** The system established the absence of bypass risk
no more than it established its presence, and a default would have had the
*server* manufacture the classification the producer was deleted for making —
absence of evidence rendered as evidence of absence, in a column a designed gate
was waiting to read. The field is removed rather than emptied, because **a vacant
socket invites a producer**.

**Kept, untouched, and asserted:** `cognitiveProfile.bypassingFrequency.spiritual`
and `.intellectual` — the member's own measured values — and every decision that
lawfully consumes them. *The defect was never that bypassing can be measured. It
was the invented property of the task.*

**Column retained.** `bypass_risk` stays in the schema, unpopulated. Stop creating
false evidence first; adjudicate historical and schema custody separately — the
same reasoning as `pfi_coherence`.

## 3 · ⭐ The written future — and a correction to the census

A repair that corrected the code and left the spec instructing a future
implementer to gate on `task.cognitive.bypassRisk` would have removed the
violation from the runtime while **leaving its reintroduction instructions
intact**. So the spec is repaired here, in Instance 2.

⚠️ **The census named one spec site. There are four, and one of them changes the
finding.**

```text
:88   the field on SpiralTask                    SUPERSEDED in place
:211  a PRODUCER — this.assessBypassRisk(…)      SUPERSEDED in place
:250  the readiness gate                         SUPERSEDED in place
:719  a sample payload                           field removed
      lib/memory/beads-sync/README.md:79         field removed
```

⭐⭐ **The spec's producer derives the value from the member's measured
`bypassingFrequency` — never from the element.** So **the element-derived
assignment was not specified; it was invented at implementation time.** The
census's phrase *"the latency has a written future"* is true of the **gate**, and
overstated for the **producer**.

Both are withdrawn, and they are different errors:

```text
the spec's producer     a task cannot carry a property of a PERSON
the implementation      a task's property manufactured from the SACRED
```

Each site is marked in place rather than deleted, so the design intention
survives as history. A future task-specific risk model is **not forbidden** — it
would have to earn its own evidence, independently of element and of sacred
vocabulary.

## 4 · The falsifier, bound to this exact mechanism

`lib/memory/__tests__/sacredInstance2TaskBypassRisk.test.ts` — **7 assertions, all
passing.**

```text
1  earth ↔ aether changes no bypass-risk classification, and the two tasks'
   cognitive blocks are identical — so nothing subtler than a named field
   carries the distinction either
2  a created task carries NO task-level bypass-risk field at all — stronger
   than equality, so the vacant socket cannot return
3  the contract declares no such field
4  the persistence seam binds null, never a manufactured 'none'
5  the spec designs no live field, producer or gate
6  payload samples no longer show the field as ordinary
7  BOUNDARY — changing measured bypassingFrequency.spiritual STILL changes a
   lawful decision (routePanconsciousField)
```

⭐ **Assertion 7 keeps the repair from drifting** from *"the sacred is not a
symptom"* into *"spiritual bypassing can never be measured."*

### Hostile mutation — the instrument detects the defect

Reinstating the exact deleted line:

```text
✕ earth ↔ aether changes no bypass-risk classification
✕ a created task carries no task-level bypass-risk field at all
✕ the task contract declares no bypass-risk field
✓ boundary assertion still green
→ 3 failed · 4 passed
```

⛔ The boundary assertion staying green is the part that matters: the falsifier
fails **on the defect**, not on everything.

## 5 · ⚠️ A finding the repair surfaced — the guard could not have lived beside its subject

`lib/memory/beads-sync/__tests__/` is listed in the root jest config's
`testPathIgnorePatterns`. **Nothing under it runs in the project gate.** A
falsifier placed next to the code it guards would never have executed.

⭐ The falsifier therefore lives at `lib/memory/__tests__/`, and says so in its own
header. *An instrument that cannot be re-witnessed is not an instrument.*

⚠️ Noted, not repaired: the existing `MaiaBeadsPlugin.test.ts` asserts
`field.intensity: 7` while the code produces `'high' | 'medium'` — a test that
cannot have passed recently. **Not this lane's to fix**; recorded so the exclusion
is not mistaken for health.

## 6 · Structural debt — recorded, deliberately NOT fixed here

Per the 01B rule, and kept out of this repair so the evidence trail stays clean:

```text
server.ts:153        `cognitive = {}` destructured from an untyped request body;
                     no schema validates the persistence boundary
MaiaBeadsPlugin      `maiaMeta?: { … }` is an optional nested literal, not a
                     named contract; assembled twice, validated never
```

⛔ Either would swallow a shape change silently — the hole that hid
`elementalNote`'s five consumers in 01B. **Separate structural debt.**

## 7 · Standing

```text
production            LATENT → repaired at source
staging               UNKNOWN — may hold historical bypass_risk='spiritual' rows
executable shape      task-level bypassRisk DELETED
persistence           writes NULL · column RETAINED
spec                  four sites SUPERSEDED in place
falsifier             7 assertions · hostile mutation verified
measured profile      UNTOUCHED and still deciding
untyped seams         RECORDED · not fixed
gates                 typecheck no regressions · check:no-supabase clean
                      lib/memory + lib/field 27 passed · 0 failed
```

**Owed next, and not done here:** if beads-sync is running in staging, the
narrowed question is whether historical `bypass_risk='spiritual'` rows exist
there. Historical custody is its own adjudication.

---

*The element was never evidence about the person. It was only ever the subject
they were working on.*
