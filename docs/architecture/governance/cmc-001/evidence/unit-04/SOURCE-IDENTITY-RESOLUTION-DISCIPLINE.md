# CMC-001 · EVIDENCE DISCIPLINE — Source Identity by Resolution

**Supersedes** `docs/architecture/governance/cmc-001/evidence/unit-03/EVIDENCE-DISCIPLINE-BLOB-BINDING.md` (ruled 2026-08-12, same day).

The prior record is **not withdrawn and not rewritten**. Its evidence stands and its reasoning holds. It is superseded because its *scope* was too narrow: it framed the hazard as "ambiguous filenames," and the reconciliation established a repository condition and an identifier class the earlier rule does not cover.

Ruled by founder act 2026-08-12, arising from Unit 4 reconciliation.

**This is a CMC evidence discipline, not a MAIA architectural conclusion, and not a call to rename anything.** It governs how the census establishes what it is looking at.

---

## The rule

> **Architectural evidence must identify source by resolution — repository-relative path, canonical SHA, blob SHA, and, where execution identity matters, the binding import or call lineage. Never by name.**

"Name" covers both filenames and code identifiers. Both have now failed.

---

## Why the prior rule was insufficient

### 1. The hazard is a repository condition, not an occasional collision

At canonical `52a3b924b7cf52013c1c8b0d635359c2cad672fc`:

**327 colliding basenames across 2,581 files — 24% of the tree.**

The prior record treated `awareness-levels.ts` as a notable instance. It is not notable; it is typical. Roughly one file in four shares its basename with at least one other. A discipline written for exceptions cannot govern a condition that holds for a quarter of the repository.

### 2. `memoryBridge` is a worse class — an identifier, not a filename

The prior rule says bind the *file*. But `memoryBridge` is a property on `this.systems`, assigned from a class (`MemorySystemsBridge`) that is *imported*. A basename search for `memoryBridge` resolved to `app/api/_backend/src/services/psiMemoryBridge.ts` — an unrelated file that never participates in the traced path.

No amount of care about filenames catches this. The identifier had to be resolved through its **import lineage** to establish what it actually names in that scope.

### 3. The failure mode is silent

A wrong-file lookup that returns *nothing* is survivable — it announces itself. A wrong-file lookup that returns *something plausible at the cited line* is not, and nothing about it announces itself. With 327 collisions, the probability that a wrong resolution lands on plausible-looking code is not small.

---

## Complete citation form

A citation is complete when a reader can recover the exact bytes, and confirm the code participates in the traced path, without exercising judgement:

```
lib/consciousness/consciousness-layer-wrapper.ts:347
  @ 52a3b924b7cf52013c1c8b0d635359c2cad672fc
  blob 42dd2c210cf22cd2c2d0a3e8a800fa6b9e32c29f
  reached via: route.ts:88 → maiaService.ts:8 → consciousness-layer-wrapper.ts:8
```

Path and line alone establish nothing. Path + blob establishes *which bytes*. Only import lineage establishes *whether those bytes run on the path under investigation*.

## Relation to §III and §IV

This is `SURFACE_SUBSTITUTION` in its most ordinary form: a name substituted for an identity. The cheap observation — "the file called X," "the thing called `memoryBridge`" — is not the authoritative surface. Content addressing and call lineage are.

Three failures at this referent now share the shape: the dead-import citation in `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`, the `consciousness-orchestrator` seam claim corrected as Unit 3 C-3, and the two lookups above. In every case **an identifier was trusted to name one thing when it named more than one.**

## Scope

Binds all CMC-001 units from this point forward, and any re-reading of Units 1–4. Prior units' manifests already bind blob SHAs, so their citations remain recoverable; what they may lack is import lineage, which is why prior findings whose *execution identity* matters are subject to re-verification rather than assumed sound.
