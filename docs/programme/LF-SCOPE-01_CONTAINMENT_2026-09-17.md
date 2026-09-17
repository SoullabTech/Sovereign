# LF-SCOPE-01 — Living Field context containment

**Date:** 2026-09-17
**Authority:** EAA-03 / P1-C §I (P0 interrupt)
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ REPAIR COMPLETE · ✅ TESTS PASS · ✅ BEHAVIOURAL WITNESS PASS · ⛔ P1 NOT BEGUN

> Containment only. No schema, no migration, no affinity data altered, no
> practitioner-observation semantics changed, no Living Field redesign, no P1.

---

## 1. What was wrong

The Living Field read paths carried the sacred/protected guards and **nothing
else**. They did not carry the scope boundary the canonical memory-atoms path
(`lib/maia/memoryAtomsLoader.ts:248`) has enforced since `20260630000005`.

Three classes of material could therefore reach a **personal** surface:

| Class | Why it should not appear |
|---|---|
| Non-personal scope (`colab` / `client` / `encounter`) | Belongs to a Co-Lab or client boundary, not the member's private field |
| `practitioner_observation` | Written **about** the member **by** a practitioner — shown under copy reading *"Keeps you have held"* |
| `member_response_status = 'rejected'` | The member's own verdict declining an observation about themselves |

Only the first is a scope defect. The second and third are **authorship**
defects: the row is in the right member's pool and is still not the member's
own kept material. All three are closed.

---

## 2. What changed

**New — `lib/maia/living-field/atomEligibility.ts`.** One predicate,
`livingFieldAtomGuards(alias)`, reused by every Living Field read.

**Patched — all three read variants of the affinity path.** This is the point:
a fix that protected the count and left content reachable through the encounter
path would have satisfied a narrower reading of the ruling and still leaked.

| Read variant | File | What it serves |
|---|---|---|
| Counts + denominator | `app/api/maia/living-field/route.ts:60,76` | Field list `gathered_count` |
| Member-visible list | `app/api/maia/living-field/[fieldKey]/gathering/route.ts:51,61` | The gathered Keeps a member opens |
| **MAIA cognition** | `lib/maia/living-field/encounterContext.ts:115` | Encounter + refine prompt assembly |

**Additionally corrected: counts now agree with content.** The
`gathered_count` query previously counted `living_field_affinities` rows with
**no join to atoms and no atom guards at all**, so a count could exceed — and
disagree with — the material the member could actually open, and could include
since-protected rows. It now joins the atoms it counts and applies the same
predicate the list applies.

### Not a second interpretation of the boundary

Every clause is taken from an existing canonical reader:

| Clause | Origin |
|---|---|
| `memory_scope = 'personal'` | `lib/maia/memoryAtomsLoader.ts` (scope model) |
| `PRACTITIONER_ATTRIBUTION_GUARD` | **imported symbol** from that loader — cannot drift from its origin |
| `member_response_status IS DISTINCT FROM 'rejected'` | `lib/maia/memoryAtomsLoader.ts:287` |
| `posture_at_creation IS DISTINCT FROM 'sanctuary'` | `lib/workbench/sources/keep.ts` |
| `source_type <> 'practitioner_observation'` | the operative form of §I.3 (see §3) |

---

## 3. Three judgment calls, stated rather than silently taken

**(a) `generated_by` is NOT restricted to `'member-gesture'`. ⚠️ The one place
I did not follow `keep.ts` literally.**

`keep.ts`'s `ATOM_GUARDS` carries `generated_by = 'member-gesture'`, which would
exclude all practitioner observations in one clause. But that column was added
by `20260718000001` with `DEFAULT 'unattributed-historical'`, so **every atom
minted before 2026-07-18 carries `'unattributed-historical'`**. Copying the
allowlist would have silently emptied the Living Field of every pre-provenance
Keep — a behaviour change, not containment, and a direct breach of *"existing
legitimate personal behavior remains intact."*

The authorship boundary that allowlist enforces is instead enforced directly on
`source_type`, with the imported attribution guard kept beneath it as defence in
depth, so that relaxing the first — if a future act decides attributed
observations may appear **with** attribution — cannot silently re-admit the
unattributed historical rows too.

**If the founder prefers the literal `keep.ts` allowlist, that is a one-line
change — but it should be taken knowingly, because it hides historical member
Keeps.**

**(b) `status` stays a denylist.** The canonical readers use
`status IN ('active','still_alive')`; Living Field has always used
`NOT IN ('protected','archived')`, which additionally admits `set_aside`.
Narrowing it would remove material members can see today. Left as found.

**(c) `return_preference` is NOT filtered.** The canonical loader restricts it
because MAIA surfaces material unbidden there. Living Field is a surface the
member deliberately opens, and **opening it is asking** — filtering
`member_pulled` would withhold material from the member's own direct request.

---

## 4. Deliberately NOT done

- ⛔ `living_field_affinities` — untouched. No schema, no scoring, no migration, no backfill.
- ⛔ `lib/maia/living-field/indexAtom.ts` (the **write** path) — untouched. It remains
  scope-blind. The ruling scoped this repair to **read paths**, and with reads guarded
  an unindexed row and an indexed-but-filtered row are member-indistinguishable.
  Recorded as a standing observation, not repaired.
- ⛔ Practitioner-observation semantics — unchanged. An excluded atom is untouched and
  still reachable everywhere it was legitimately reachable before.
- ⛔ The gathering route's `criterion` copy — unchanged, and now **true**: with
  practitioner observations excluded, *"Keeps you have held"* is accurate.
- ⛔ No P1. No new route, component, CSS or flag.

---

## 5. Proof

### 5.1 Unit suite — 21/21 PASS

`lib/maia/living-field/__tests__/livingFieldScopeContainment.test.ts`

Mock discipline follows `lib/workbench/__tests__/keepSourceAdapter.test.ts`: the
db mock **records calls and returns canned rows unfiltered**, never simulating a
guard — so a test passes only because the predicate really reached the wire.

Covers: the predicate's content · all three read variants · the count/content
agreement · read-only-ness · and the three departures in §3 pinned so a later
tidy cannot take them silently.

### 5.2 Behavioural witness — PASS, and discriminating

`scripts/witness/lf-scope-01-containment.sql`, run against a disposable
PostgreSQL 16 shadow built from the **real migrations** for the tables under
test (`members`, `member_memory_atoms` + breakthrough/provenance/scope/response,
`living_field_affinities`). Single transaction, ends in `ROLLBACK`.

Five fixtures gather into one dimension, so only the predicate can separate them:

```
--- gathered set (expect exactly: a thing I kept) ---
 a thing I kept
(1 row)

NOTICE:  LF-SCOPE-01 PASS — 1 personal Keep visible; client-scope, practitioner
         observation, member-rejected and archived material all excluded;
         5 atoms and 5 affinities intact.
```

**Negative control — the leak, reproduced.** The pre-repair predicate against
the *same* fixtures:

```
--- pre-repair predicate against the same fixtures (the leak) ---
 a thing I kept
 an observation about you
 client-scoped material
 material the member rejected
(4 rows)

NOTICE:  NEGATIVE CONTROL OK — the pre-repair predicate admits 4 rows where the
         repaired predicate admits 1. The witness is discriminating.
```

Without this control the PASS would be vacuous. With it, the defect is
demonstrated on real rows and the repair is shown to be what closes it.

**Non-mutation proved in the same run:** 5 atoms and 5 affinity rows intact
after filtering — exclusion is a read-time `WHERE` clause, never a deletion.

### 5.3 Required proofs, mapped

| Required (P1-C §I) | Evidence |
|---|---|
| personal member Keeps still appear | Witness positive control — the one row returned |
| non-personal atoms do not contribute to counts | Unit: count SQL carries `a.memory_scope = 'personal'`; witness excludes client-scoped |
| non-personal atoms cannot appear in gathering/detail | Unit (gathering + encounter); witness |
| practitioner observations do not masquerade as Keeps | Unit + witness — `an observation about you` excluded |
| existing legitimate personal behaviour intact | §3 departures; witness positive control; 671 adjacent tests pass |
| no schema or writes changed | No migration added; unit asserts no read path emits DML; witness rolls back |

### 5.4 Gates

| Gate | Result |
|---|---|
| `npm run typecheck` | ✅ **229 errors vs baseline 239 · 0 regressions** |
| `npm run check:no-supabase` | ✅ clean |
| LF-SCOPE-01 suite | ✅ 21/21 |
| Adjacent suites (`lib/maia`, `lib/workbench`, `lib/psyche`, `lib/navigation`) | ✅ 37 suites / 671 tests pass |

⚠️ **One pre-existing failure, verified NOT caused by this change.**
`lib/maia/canonical-turn/__tests__/writersStudioRoom.test.ts` fails 3/51 on
`PRODUCER_REGISTRY` membrane entries (`writer_editorial_history`,
`writer_editorial_act`). Confirmed by stashing this work and re-running on clean
HEAD: **identical 3 failed / 48 passed.** Reported, ⛔ not repaired — it belongs
to the Writer's Studio lane.

### 5.5 Not established

- ⛔ **No production read was performed.** Whether the affinity backfill has run in
  production (census U1) remains **UNKNOWN**, and the repair does not depend on it:
  with reads guarded, an indexed out-of-scope row can no longer surface either way.
- ⚠️ The shadow carried the real migrations for the tables under test, **not** the
  full production schema; `studio_teams`, `studio_people` and `encounters` were
  created as minimal FK stubs. That is sufficient for a predicate witness and is
  **not** a full-schema deployment rehearsal.

---

## 6. Standing

**LF-SCOPE-01 ✅ COMPLETE · CONTAINMENT PROVEN · NEGATIVE CONTROL DISCRIMINATING ·
⛔ NO SCHEMA · ⛔ NO MIGRATION · ⛔ NO AFFINITY DATA ALTERED · ⛔ WRITE PATH UNTOUCHED ·
⛔ P1 NOT BEGUN · ⛔ NOT DEPLOYED · PRODUCTION UNTOUCHED.**

Returned for adjudication. P1 follows only on the founder's word.

One item is owed back to the founder as a decision, not a defect: **§3(a)** — whether
to take `keep.ts`'s literal `generated_by = 'member-gesture'` allowlist and accept
that it hides every pre-provenance Keep.

---

## 7. Canonical integration — 2026-09-17 (added by `MAVEN-CUSTODY-02` §8 authority)

⚠️ **Sections 1–6 above are the original record, carried forward byte-for-byte
from `6adbc3bb5e10fac9c1aa6253e0800329a0d7286c`.** They are not edited to read
as though they had always been canonical. The branch named in the header
(`claude/magical-archimedes-dcsry5`) is the *original* custody branch and is
left as written.

This repair is no longer branch-local. Under the founder adjudication of
2026-09-17 (MAIA-MAVEN-T1A J5), LF-SCOPE-01 was reclassified from prior
experimental work to a **current containment repair awaiting canonical
integration**, because its defect was verified LIVE on canonical.

Integration evidence — including the divergence comparison against current
canonical, and the independently re-earned witness and gate runs — is recorded
separately in:

**`docs/programme/LF-SCOPE-01_CANONICAL_INTEGRATION_2026-09-17.md`**

⛔ The evidence in §5 above is the ORIGINAL run. It is not the basis on which
this integration was accepted; the integration record carries its own.
