# CRP-U001 — UNIT RETURN

Conforms to `CRP-001-UNIT-RETURN-SCHEMA-v1` (sha256 `fac499a6…`), read with
`CRP-001-SCHEMA-FREEZE-RECORD.md` §5.1 — §2.6 minima are **PROVISIONAL**.

---

## IDENTITY

```text
unit / finding ID     CRP-U001
canonical ref + SHA   origin/clean-main-no-secrets @ 52a3b924b7cf52013c1c8b0d635359c2cad672fc
deployed runtime      REFERENT UNBOUND — docker unreachable from this host;
                      no GIT_COMMIT obtained. NOT inferred from MIR's earlier
                      "deployed is an ancestor of trunk, 4 behind": trunk has
                      moved twice since that measurement, which breaks it.
instrument + version  manual source trace at canonical ref; no automated
                      instrument exists yet (that is the finding)
observed_on           canonical trunk 52a3b924…
production_transfer   NOT ESTABLISHED
```

## VALIDITY

**evidence** — live member path anchored to MIR's own artifact, not guessed:

```text
entry      app/api/sovereign/app/maia/route.ts:22  → getMaiaResponse
           (app/api/maia/chat/route.ts is DEAD — returns 410 Gone, names the
            sovereign route as its replacement)
service    lib/sovereign/maiaService.ts
selection  lib/memory/MemoryBundle.ts:400  ← facetMatch, the exact signal MIR
           found inert on the live route. Anchor confirmed.
audit      lib/memory/MemoryBundle.ts:104-120
render     lib/memory/MemoryBundle.ts:604-608
```

Selection **preserves** candidate identity (`MemoryBundle.ts` ~461):

```js
return {
  id: candidate.id || undefined,  // Preserve for audit trail
  content,
```

Prompt render **drops** it (604-608):

```js
const bulletText = bundle.memoryBullets
  .map(b => `• [${b.source}${b.facet ? `/${b.facet}` : ''}] ${b.content}`)
  .join('\n');
parts.push(`\n📚 RELEVANT MEMORIES:\n${bulletText}`);
```

Breakthroughs render with **neither id nor source** (612): `• ${b}`.

An audit side-channel exists (104-120), recording `id, source, retrievalScore,
semanticScore, confidenceScore, usedAs` — but explicitly **"BEFORE
compression"**, over `allCandidates`. It records what was *retrieved*, never
what reached the request. CRP-001 §5: *"No upstream inventory may substitute."*

**evidence window** — exchanges: 0 · sessions: 0 · leave/return: 0 · subjects:
0 (static source trace, no execution). Below the single-exchange minimum for
this crossing, which is consistent with the classification below: the crossing
could not be executed against, because no admissible instrument exists.

**positive control** — NOT CONSTRUCTIBLE. Selecting a known candidate and
demonstrating it in the request requires a candidate identifier in the request.
**negative control** — NOT CONSTRUCTIBLE. Same reason: an unselected candidate
cannot be shown absent when no candidate is identifiable.
**instrument admissibility** — INADMISSIBLE (no negative control, per §16).
**referent re-bind** — trunk re-read at `52a3b924…` after adjudication; blob
identities unchanged.

## JUDGMENT

```text
classification        INADMISSIBLE TO TEST
disposition           NO DISPOSITION
exact broken crossing ASSEMBLED → FINAL MODEL REQUEST
```

**Established:** on the observed path at canonical trunk, candidate identity is
preserved through selection and **dropped at prompt render**. What crosses into
the final model request is `• [source/facet] content` — a class label and
truncated prose. No candidate identifier is present.

**Does NOT establish:**

- `ASSEMBLED → FINAL MODEL REQUEST` — not failed, not passed. **Unprovable at
  this boundary** in the current architecture.
- `FINAL MODEL REQUEST → USED`
- `USED → OBSERVABLE IN RESPONSE`
- `OBSERVABLE IN RESPONSE → EXPERIENCED CONTINUITY`
- anything about the **deployed runtime**
- any upstream crossing (`RETRIEVED → SELECTED`, `SELECTED → ASSEMBLED`)
- that memory fails to reach the model. **It very likely does reach it
  semantically.** The claim is narrower and sharper: *the system has destroyed
  the provenance needed to prove which memory reached the model.*
- behavior of memory classes outside the two render sites read

**counterevidence — searched:**

- *Could content-string matching reconcile prompt text to a candidate?*
  Partially, and unreliably. Content is truncated to 150 chars (447-463), and
  dedupe collapses on the **first 100 normalized chars** (~423-429) — so the
  corpus provably contains items with identical openings. Reconciliation is
  ambiguous exactly where dedupe is lossy. Not mechanically sound.
- *Does the audit side-channel rescue it?* No — it is pre-compression and
  candidate-scoped, never request-scoped.
- *Is `source`/`facet` enough?* No — a class label identifies a category, not
  a record.
- *Is there another render site that keeps ids?* Two found (605, 612); neither
  does. Other assembly sites unexamined — see does-not-establish.
- *Wrong path?* Guarded: the dead 410 route was rejected, and the live path is
  anchored to `facetMatch`, MIR's own observed signal.

## REPAIR

**smallest repair proposed** — none yet. Read-only unit; remediation is a
separate work unit and is not entailed by this finding.

Shape, for the record only: the render must emit a candidate-bound token the
witness can reconcile against request bytes. Not designed, not authorized.

**falsifier** — exhibit any render site on the live path that emits a stable
candidate identifier into the final model request, or a transformation
mechanically reconcilable to a specific candidate without content-string
collision. That falsifies INADMISSIBLE and makes the crossing testable.

**authority required** — none sought. **scope / non-goals** — no product change,
no schema change, no member data touched, synthetic/static only.

## PROOF · DELIVERY

`N/A — diagnostic unit, no repair authorized.`

## OUTCOME

```text
Broken crossing:   ASSEMBLED → FINAL MODEL REQUEST
Before:            unknown — never witnessed
After:             unchanged (read-only)
Proven by:         manual source trace @ 52a3b924…
Classification:    INADMISSIBLE TO TEST
Disposition:       NO DISPOSITION

Does not establish:
- ASSEMBLED → FINAL MODEL REQUEST (unprovable, not failed)
- FINAL MODEL REQUEST → USED
- USED → OBSERVABLE IN RESPONSE
- OBSERVABLE IN RESPONSE → EXPERIENCED CONTINUITY
- RETRIEVED → SELECTED, SELECTED → ASSEMBLED
- deployed-runtime behavior
- memory classes outside the two render sites read

Next adjacent crossing:  SELECTED → ASSEMBLED
                         (upstream; unblocked by this finding. The downstream
                          crossings stay unreachable until provenance survives
                          render.)

Remaining unknowns:
- deployed runtime SHA
- other assembly/render sites on the live path
- whether any non-prose channel carries candidates into the request
```

**The architectural statement, precisely bounded:** MAIA very likely receives
memory semantically. What the system cannot currently do is **prove which
memory reached the model**. Those are different propositions, and only the
second is established here.

---

## LOG

- **2026-08-12** — Unit executed read-only at canonical trunk. Nothing
  modified, no member data accessed, no repair proposed.
