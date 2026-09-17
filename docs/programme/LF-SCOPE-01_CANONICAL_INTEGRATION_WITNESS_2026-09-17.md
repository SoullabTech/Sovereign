# LF-SCOPE-01 — CANONICAL INTEGRATION WITNESS

**Date:** 2026-09-17  
**Lane:** MAIA-MAVEN-T1A J5 remediation — containment first  
**Canonical base:** `83fce8edbdae32770849cdf71b6b6350543d5885` (`clean-main-no-secrets`)  
**Attested source:** `6adbc3bb5e10fac9c1aa6253e0800329a0d7286c`  
**Integration commit:** `544528bcfbdc9e22a48e2eda91685b30f2ecea75`  
**Standing:** INTEGRATED ON CONTAINED REPAIR BRANCH · NOT MERGED · NOT DEPLOYED

## 1. Drift check — PASS

LF-SCOPE-01 was not assumed current. Its parent (`9ec3be6d`) was compared with the actual canonical head.
For each of the three modified runtime files, the pre-repair blob at the LF-SCOPE parent is byte-identical to the blob on canonical `83fce8ed`:

| Path | LF parent blob | canonical blob | Result |
|---|---|---|---|
| `app/api/maia/living-field/[fieldKey]/gathering/route.ts` | `7f369f9f…` | `7f369f9f…` | identical |
| `app/api/maia/living-field/route.ts` | `b5301909…` | `b5301909…` | identical |
| `lib/maia/living-field/encounterContext.ts` | `60d88bbf…` | `60d88bbf…` | identical |

The four artifacts added by LF-SCOPE-01 were absent on canonical: the shared predicate, focused test, SQL witness, and programme record.

**Conclusion:** there is no semantic drift on the repair seam. The attested patch may be integrated exactly; no reinterpretation is required.

## 2. Containment integrated

The exact LF-SCOPE-01 repair was cherry-picked onto the contained branch. It:

- applies one shared `livingFieldAtomGuards()` predicate to field counts, gathering content, denominator counts, and MAIA encounter context;
- constrains Living Field to `memory_scope = 'personal'`;
- excludes practitioner-attributed observations from material presented as the member's own Keeps;
- excludes material the member explicitly rejected through `member_response_status`;
- preserves the pre-existing sacred/protected/archived boundaries;
- makes no schema, migration, affinity-data, write-path, or `/maia` visual change.

The deliberate LF-SCOPE departures remain unchanged: no `generated_by = 'member-gesture'` allowlist; status remains a denylist; `return_preference` is not filtered on a member-opened Living Field surface.

## 3. Evidence rerun on current canonical base

| Gate | Result |
|---|---|
| `livingFieldScopeContainment.test.ts` | ✅ 21 / 21 |
| `npm run check:no-supabase` | ✅ clean |
| `npm run typecheck` | ✅ 229 diagnostics vs baseline 239 · 0 regressions |

The focused suite still asserts the predicate at the SQL wire, all three read variants, count/content agreement, read-only behavior, and the deliberate departures.

The original LF-SCOPE record also carries a discriminating PostgreSQL shadow witness: repaired predicate admits 1 legitimate personal Keep; the pre-repair predicate admits 4 rows against the same fixture set. That witness artifact is carried unchanged into this integration.

## 4. Containment conclusion

The live canonical containment defect identified by J5 has a mechanically clean, previously attested repair that remains valid on the latest canonical base.

This closes the **repair-candidate uncertainty**, not the release gate:

```text
LF-SCOPE-01 semantics ............. ✅ RECONCILED TO CURRENT CANONICAL
contained branch integration ...... ✅ PASS
canonical merge ................... ⛔ NOT PERFORMED
production deployment ............. ⛔ NOT PERFORMED
Living Field redesign ............. ⛔ NONE
write/schema change ............... ⛔ NONE
```

The next authorized locus is the distinct KEEP / CONTINUE act-recognition contract.
