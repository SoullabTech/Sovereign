# F5-CONFORMANCE-REPAIR-01 - P5-E EXECUTOR + RESTORE REHEARSAL - WITNESS

**Date:** 2026-09-17
**Subject:** `6df34018547c71c218230d8d826ce5a6f7136cb8`
**Environment:** fresh local PostgreSQL 17.7, loopback only

## 1 - Bootstrap, migration, seed and backup

The canonical baseline bootstrapped and the unmodified migration runner applied all migrations including P5-A and repaired P5-D. A synthetic target member and control member were then created. The target occupied only adjudicated account/session and Circle participation surfaces. The control member owned the Circle and inquiry so the erasure subject did not occupy unadjudicated `created_by` / `opened_by` custody.

Synthetic pre-erasure state:

```text
target member       1
auth sessions       1
member settings     1
member sessions     1
active memberships  1
active shares       1
live responses      1
```

A pre-erasure data-only backup was created before any executor call.

```text
backup SHA-256
6df4e4fda1e247b541d92e7f91824ed40fdee49b79dc4968558293375e9caac1
```

## 2 - Mandatory read-only activation preflight

The first temporary harness failed before database logic because top-level `await` was compiled as CommonJS. The harness was corrected to an async `main()` wrapper and rerun against the unchanged database. That tooling error has no erasure standing.

The actual read-only preflight then returned:

```text
outcome           evidence_incomplete
activationReady   false
executor invoked  no
```

No destructive path was entered.

## 3 - Direct-locus runtime mismatch

The activation registry declares 319 direct member-bound loci. The fully migrated runtime schema resolves 318 of them with the expected identity-column shape. The sole stale declared locus is:

```text
dream_entries
```

Runtime evidence:

```text
expected loci       319
runtime resolved    318
missing                1
shape drift            0
```

## 4 - FK collector representation defect

`runtimeMemberForeignKeys()` selects `array_agg(att.attname ...)`. PostgreSQL reports the result type as:

```text
name[]
```

The TypeScript contract declares `local_columns: string[]`. Node/Postgres therefore delivers values such as `{member_id}` rather than an actual JavaScript string array. The identifier guard correctly rejects that string, and FK occupancy becomes `unknown` instead of being guessed.

This explains the broad `runtime FK occupancy query failed` blockers, but it is not the whole runtime-authority gap.

## 5 - Runtime FK authority differs from migration declarations

After independently casting the PostgreSQL catalog columns to `text`, the canonical migrated runtime contains:

```text
runtime FK constraints          316
runtime table/action groups     294
registry declarations           289
registry table/action groups    264

runtime-only effect groups      36
registry-only effect groups     6
count-mismatch groups           2
```

### Runtime groups absent from the activation registry

- `artifact_accretions|CASCADE` (1 runtime constraint)
- `audit_results|SET NULL` (1 runtime constraint)
- `contrast_events|NO ACTION` (1 runtime constraint)
- `daily_checkins|CASCADE` (1 runtime constraint)
- `developmental_findings|CASCADE` (1 runtime constraint)
- `developmental_missions|CASCADE` (1 runtime constraint)
- `developmental_reviews|CASCADE` (1 runtime constraint)
- `field_artifacts|SET NULL` (1 runtime constraint)
- `field_idea_iterations|SET NULL` (1 runtime constraint)
- `field_ideas|SET NULL` (1 runtime constraint)
- `member_attunement_profiles|NO ACTION` (1 runtime constraint)
- `member_creations|CASCADE` (1 runtime constraint)
- `member_first_descent|CASCADE` (1 runtime constraint)
- `member_interaction_signals|NO ACTION` (1 runtime constraint)
- `member_intervention_outcomes|NO ACTION` (1 runtime constraint)
- `member_sacred_formation|CASCADE` (1 runtime constraint)
- `memory_tool_store|NO ACTION` (1 runtime constraint)
- `sacred_reflections|CASCADE` (1 runtime constraint)
- `sacred_saved_passages|CASCADE` (1 runtime constraint)
- `session_events|NO ACTION` (2 runtime constraints)
- `studio_companion_turns|CASCADE` (1 runtime constraint)
- `studio_materials|CASCADE` (1 runtime constraint)
- `studio_meetings|CASCADE` (1 runtime constraint)
- `studio_people|SET NULL` (1 runtime constraint)
- `symbol_library|SET NULL` (1 runtime constraint)
- `symbol_meanings|CASCADE` (1 runtime constraint)
- `wisdom_entries|CASCADE` (1 runtime constraint)
- `wisdom_field_contributions|CASCADE` (1 runtime constraint)
- `wisdom_field_core_ideas|NO ACTION` (1 runtime constraint)
- `wisdom_field_evolution_entries|CASCADE` (1 runtime constraint)
- `wisdom_field_memberships|CASCADE` (1 runtime constraint)
- `wisdom_field_replies|CASCADE` (1 runtime constraint)
- `wisdom_field_works|NO ACTION` (1 runtime constraint)
- `wisdom_fields|NO ACTION` (1 runtime constraint)
- `wisdom_submissions|SET NULL` (1 runtime constraint)
- `with_me_sessions|NO ACTION` (2 runtime constraints)

### Registry groups absent from the migrated runtime

- `dream_entries|CASCADE` (registry declarations: 1)
- `invites|SET NULL` (registry declarations: 2)
- `members|SET NULL` (registry declarations: 1)
- `practitioner_clients|CASCADE` (registry declarations: 1)
- `practitioners|NO ACTION` (registry declarations: 2)
- `wisdom_submissions|NO ACTION` (registry declarations: 1)

### Same group, different constraint count

- `pattern_ledger|CASCADE` registry=2 runtime=1
- `practitioner_clients|SET NULL` registry=3 runtime=1

This establishes that migration-source declarations are provenance, but are not identical to the final migrated runtime FK graph. P5-D already intended the runtime constraint catalog to be execution truth; P5-E has now shown that its governed declaration authority has not yet been reconciled to that truth.

## 6 - No-change proof

After the failed preflight:

```text
account_erasure_acts     0
member tombstones        0
target member present    1
```

The executor did not run, no erasure act was minted, no member tombstone was written, and the backup/restore rehearsal was not started.

Evidence hashes:

```text
direct-locus diff  2d5eda14020efcf2d7a8b5bfbd8a39041789b1665a723a358d1081b549b02dd9
FK graph diff       9b3d9414f357e06ea3e3c22fe6be71612b478fb522fa2f08e0aa0367743577ba
preflight log       3233fe1b74aa47defa208ae5935a8504579da29e7accc813760f59d80d1813dc
pre-erasure backup  6df4e4fda1e247b541d92e7f91824ed40fdee49b79dc4968558293375e9caac1
```
