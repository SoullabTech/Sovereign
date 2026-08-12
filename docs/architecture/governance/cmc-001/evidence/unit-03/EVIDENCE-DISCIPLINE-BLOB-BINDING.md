> **SUPERSEDED 2026-08-12** by \`../unit-04/SOURCE-IDENTITY-RESOLUTION-DISCIPLINE.md\`.
>
> Not withdrawn and not rewritten. The evidence and reasoning below stand. This record is
> superseded because its *scope* was too narrow: it framed the hazard as "ambiguous filenames."
> Unit 4 reconciliation established 327 colliding basenames across 2,581 files (24% of the tree),
> and a worse class — an *identifier* (`memoryBridge`), not a filename, resolvable only through
> import lineage. The superseding rule binds source identity by resolution, not by name.
>
> Preserved per CMC-001 §XXIV: mark superseded, preserve why, do not erase.

# CMC-001 · EVIDENCE DISCIPLINE — Blob Binding for Ambiguous Filenames

Ruled by founder act 2026-08-12, arising from Unit 3 evidence.

**This is a CMC evidence discipline, not a MAIA architectural conclusion.** It governs how the census records claims. It says nothing about how MAIA should be built.

---

## The rule

From here forward, evidence records involving ambiguous filenames must bind:

**full path + canonical SHA + blob SHA**

Path and line alone are insufficient.

---

## Why — the demonstrated hazard

Two distinct files at the bound referent share the basename `awareness-levels.ts`:

| Path | Blob SHA-1 |
|---|---|
| `lib/consciousness/awareness-levels.ts` | `3ee205fcad47c341a513d5ffadd38cd884a127b6` |
| `lib/ain/awareness-levels.ts` | `03231cb3a4e62779e1cd7a5e1a5d10989b63a94c` |

`adaptResponsePromptWithPolicy` — the function on which Unit 2's open question F-4 turned — is defined only in the first, at `:401`.

During adjudication of Unit 3, a verification pass resolved the basename to `lib/ain/awareness-levels.ts` and returned nothing. Line `:401` of the wrong file is not an error; it is simply different code. Had that file happened to contain a plausible function at that line, the verification would have produced a confident wrong answer rather than an empty result.

**The blob SHA is what disambiguated it.** The executor's record carried `3ee205fc…`, which matched exactly one file.

## Relation to §IV

This is a `SURFACE_SUBSTITUTION` variant: a basename substituted for a file identity. The cheap observation — "the file called `awareness-levels.ts`" — is not the authoritative surface. The authoritative surface is content-addressed.

It is a near neighbour of the failure that produced the dead-import citation in `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`, and of the `consciousness-orchestrator` seam claim corrected in Unit 3 (C-3), where a comment in one file bounded a claim about code in another. All three share a shape: **an identifier was trusted to name one thing when it named more than one.**

## Practical form

A citation is complete when a reader can recover the exact bytes without judgement:

```
lib/consciousness/awareness-levels.ts:401
  @ 52a3b924b7cf52013c1c8b0d635359c2cad672fc
  blob 3ee205fcad47c341a513d5ffadd38cd884a127b6
```

`SOURCE-MANIFEST.md` already provides this binding per unit. Where a record's prose cites an ambiguous basename inline, it must carry the blob SHA at the point of citation, not only in the manifest.

## Scope

Applies to all CMC-001 units from Unit 4 forward, and to any re-reading of Units 1–3. It does not invalidate prior records: their manifests bind blob SHAs already, so their citations remain recoverable.
