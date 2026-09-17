# LF-SCOPE-01 — Canonical Integration Witness

**Date:** 2026-09-17
**Authority:** Founder adjudication MAIA-MAVEN-T1A J5 §8 — *"Open one repair locus only."*
**Parent record:** `MAVEN-CUSTODY-02_REMAINING_CUSTODY_KEEP_CONTINUE_2026-09-17.md`
**Original artifact:** `6adbc3bb5e10fac9c1aa6253e0800329a0d7286c` (ATTESTED IN CUSTODY / NOT CANONICAL)
**Integration base:** `clean-main-no-secrets` @ `97c7d94634b8ce1cebfbd8c9f7e6b934d016f472`
**Repair branch:** `claude/vibrant-johnson-qedi8k`

> Containment only. ⛔ No schema · ⛔ no migration · ⛔ no write path · ⛔ no Living
> Field redesign · ⛔ no `/maia` change · ⛔ no personal-Keep route · ⛔ no
> KEEP/CONTINUE recognition change · ⛔ no capability activation · ⛔ not merged ·
> ⛔ not deployed · production untouched.

---

## 1. Why this integration happened

MAVEN-CUSTODY-02 §1.2 established that the defect LF-SCOPE-01 repairs is **live
on canonical**: all three personal-Keep read paths carried only the
sacred/protected guards, so non-personal-scope, practitioner-authored and
member-rejected material could reach a personal surface — including
`encounterContext.ts`, which feeds MAIA cognition.

The founder reclassified the commit accordingly: no longer optional prior work,
but a current containment repair. This record is the integration's own evidence.

---

## 2. Divergence check — the stop-gate, and it did not fire

The adjudication required: *"If canonical drift materially changes the
predicate's meaning, STOP and record the divergence instead of forcing the old
patch through."*

**No material drift. Verified, not assumed.**

### 2.1 Imported symbol

`PRACTITIONER_ATTRIBUTION_GUARD` — the predicate's one imported dependency, and
the clause the original record says exists precisely so it *"cannot drift from
its origin"*:

```
lib/maia/memoryAtomsLoader.ts:185  export const PRACTITIONER_ATTRIBUTION_GUARD =
lib/maia/memoryAtomsLoader.ts:186    "(source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL)";
```

Present on canonical, exported, unchanged. The canonical loader itself still
pairs it with `member_response_status IS DISTINCT FROM 'rejected'`
(`:286-287`, `:356-357`), which is the pattern the predicate mirrors.

### 2.2 Every column the predicate names

| Column | Canonical origin |
|---|---|
| `status`, `primary_register`, `registers`, `source_type` | `20260521000001_member_memory_atoms.sql` |
| `memory_scope` | `20260630000005_memory_atoms_scope.sql` |
| `member_response_status` | `20260702000002_member_memory_atoms_response.sql` |
| `posture_at_creation` | `20260718000001_s5_provenance_substrate.sql:287-288` |
| `facilitator_id` | `20260624000001_practitioner_observation_provenance.sql` |

**8 of 8 present.**

### 2.3 Patch pre-images

All three read paths on current canonical were compared against the `-` side of
the attested diff and match **exactly** — the same three sacred/protected guard
lines, at the same indentation, in the same statements. The count query on
`app/api/maia/living-field/route.ts` is still the unjoined
`SELECT field_key, COUNT(*) FROM living_field_affinities`.

### 2.4 Applied-diff shape

| File | This integration | Attested `6adbc3bb` |
|---|---|---|
| `app/api/maia/living-field/[fieldKey]/gathering/route.ts` | +3 / −6 | +3 / −6 |
| `app/api/maia/living-field/route.ts` | +13 / −7 | +13 / −7 |
| `lib/maia/living-field/encounterContext.ts` | +2 / −3 | +2 / −3 |

New files carried byte-for-byte, confirmed by line count against the commit's
per-file additions: `atomEligibility.ts` **86**, the test suite **233**, the
witness SQL **218**. Reconciliation against the commit's stated 777 additions:
`18 + 222 + 233 + 86 + 218 = 777`. ✅

⭐ The predicate module was **not** edited on integration — not even its header.
Annotating it would have made it a different artifact from the one attested.
The integration is recorded here instead.

---

## 3. Evidence, independently re-earned

⛔ **Nothing below is copied from the original run.** The adjudication required
the evidence be *reproduced on the target tree*; it was.

### 3.1 Behavioural witness — PASS, and discriminating

A disposable PostgreSQL 16 cluster was initialised fresh, the real migrations
for the tables under test applied (`members` · `member_memory_atoms` +
breakthrough / practitioner-provenance / scope / response / s5-provenance ·
`living_field_affinities`), with minimal FK stubs for tables not under test
(`studio_teams`, `studio_people`, `encounters`, and — required by the s5
migration but outside this predicate — `conversation_turns`,
`episodic_memories`, `member_theme_signals`).

`psql -v ON_ERROR_STOP=1 -f scripts/witness/lf-scope-01-containment.sql` → **exit 0**

```
--- gathered set (expect exactly: a thing I kept) ---
 a thing I kept
(1 row)

NOTICE:  LF-SCOPE-01 PASS — 1 personal Keep visible; client-scope, practitioner
         observation, member-rejected and archived material all excluded;
         5 atoms and 5 affinities intact.

--- pre-repair predicate against the same fixtures (the leak) ---
 a thing I kept
 an observation about you
 client-scoped material
 material the member rejected
(4 rows)

NOTICE:  NEGATIVE CONTROL OK — the pre-repair predicate admits 4 rows where the
         repaired predicate admits 1. The witness is discriminating.

     verdict
------------------
 LF-SCOPE-01 PASS
ROLLBACK
```

⭐ **The negative control is the load-bearing line.** It reproduces the live
canonical defect on real rows — the three classes named in MAVEN-CUSTODY-02 §1.2
are exactly the three extra titles it admits — and then shows the repaired
predicate excluding them. Without it the PASS would be vacuous.

**Non-mutation** proved in the same transaction: 5 atoms and 5 affinity rows
intact after filtering. The run ends in `ROLLBACK`; the cluster was destroyed
afterwards.

### 3.2 Focused suite — 21/21 PASS

`npx jest lib/maia/living-field/__tests__/livingFieldScopeContainment.test.ts`
→ **Tests: 21 passed, 21 total.**

Covers the predicate's content, all three read variants, count/content
agreement, read-only-ness, and the three §3 departures pinned against a later
tidy. The db mock returns rows **unfiltered**, so each containment claim passes
only because the predicate genuinely reached the wire.

### 3.3 Gates

| Gate | Result |
|---|---|
| `npm run typecheck` | ✅ **229 errors vs baseline 239 · 0 regressions** (exit 0) |
| `npm run check:no-supabase` | ✅ clean (exit 0) |
| LF-SCOPE-01 suite | ✅ 21 / 21 |
| Adjacent (`lib/maia`, `lib/workbench`, `lib/psyche`, `lib/navigation`) | ✅ 37 suites · **671 tests pass** |

⚠️ **One pre-existing failure, verified NOT caused by this change — and verified
here rather than taken from the original record.**
`lib/maia/canonical-turn/__tests__/writersStudioRoom.test.ts` fails 3/51 on
`PRODUCER_REGISTRY` membrane entries (`writer_editorial_locus`,
`writer_editorial_history`, `writer_editorial_act`). This work was stashed and
the suite re-run on clean canonical: **identical 3 failed / 48 passed / 51
total.** ⛔ Reported, not repaired — it belongs to the Writer's Studio lane.

⭐ Every number here matches the original run independently (21/21 · 229 vs 239 ·
671 adjacent · 4-row negative control). That agreement is *corroboration*, not
the source: each was produced by a run in this session.

---

## 4. What this integration did NOT do

Held exactly to the authority granted:

- ⛔ **`lib/maia/living-field/indexAtom.ts` (the write path) — untouched.** It
  remains scope-blind. Carried forward as a standing observation, not repaired:
  with reads guarded, an unindexed row and an indexed-but-filtered row are
  member-indistinguishable.
- ⛔ No schema, no migration, no affinity data altered, no backfill.
- ⛔ No Living Field redesign, no `/maia` change, no new component or flag.
- ⛔ No personal-Keep READ route built. `/api/sovereign/keeps` untouched and
  **not** repurposed — it remains the Work/manuscript set (MAVEN-CUSTODY-02 §7.3).
- ⛔ No KEEP/CONTINUE recognition change. `lib/consciousness/keepIntent.ts` is
  untouched; the measured CONTINUE→KEEP non-conformance stands open for the
  intent-contract lane.
- ⛔ No capability infrastructure activated.
- ⛔ No P1 / EAA-03 material integrated.
- ⛔ Not merged. Not deployed. **No production read was performed in this session.**

### 4.1 Owed back to the founder, unchanged

The original record's §3(a) decision is **still open**: whether to take
`keep.ts`'s literal `generated_by = 'member-gesture'` allowlist, accepting that
it hides every pre-provenance Keep. The integration deliberately preserved the
`source_type` formulation rather than resolving this silently.

---

## 5. Standing

```text
Divergence check ................. ✅ NO MATERIAL DRIFT (symbol · 8/8 columns · pre-images)
Containment applied .............. ✅ all three read paths
Predicate ........................ ✅ single shared, byte-for-byte as attested
Behavioural witness .............. ✅ PASS · negative control DISCRIMINATING (re-earned)
Focused suite .................... ✅ 21 / 21
typecheck ........................ ✅ 229 vs baseline 239 · 0 regressions
check:no-supabase ................ ✅ clean
Adjacent suites .................. ✅ 37 / 671 · 1 pre-existing failure verified on clean canonical
Write path (indexAtom) ........... ⛔ UNTOUCHED — standing observation
§3(a) generated_by decision ...... ⛔ STILL OWED TO FOUNDER
MERGE ............................ ⛔ NOT AUTHORIZED — requires a subsequent gate
DEPLOY ........................... ⛔ NOT AUTHORIZED
PRODUCTION ....................... UNTOUCHED
```

Returned for the founder's merge gate. Per the adjudication's sequence, the
speech-act (KEEP/CONTINUE) contract follows **only** after this containment
lane is separately witnessed.
