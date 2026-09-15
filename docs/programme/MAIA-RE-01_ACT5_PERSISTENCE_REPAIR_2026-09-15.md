# MAIA-RE-01 / ACT 5 — RE-009 Persistence Repair

**Status:** ⚠️ **REPAIR IMPLEMENTATION COMPLETE · ACCEPTANCE INCOMPLETE.**
⛔ **ACT 5 closure NOT YET EARNED** (founder standing correction, 2026-09-15).
F8 (three-route live witness) **OWED** · F5 carries a **legacy-state qualification** (§4).
**Date:** 2026-09-15. **Authority:** `docs/canon/PERCEPTION_WITHOUT_POSSESSION.md`.
**Fixes:** the ACT 4 confirmed Act 5 NONCONFORMS.
**Touched:** `lib/consciousness/relationalObserver.ts` (+1 guard test). **Nothing else.**

---

## 1. The repair

**Removed** — durable system attribution:
- `relationship_entries.pattern_hint` is **no longer written**.
- The fan-out loop writing `relationship_entry_patterns` (`pattern_id`, `confidence`,
  `evidence`, `expires_at`) is **deleted entirely**.
- `DEFAULT_PATTERN_TTL_DAYS` import dropped — there is no longer an expiring attribution to
  expire.

**Preserved** — perception:
- `detectPatterns(userMessage)` **still runs**, on the member's message only.
- Hits remain available to the conversational act and are logged as an **operation**
  (`pattern ids @ confidence`, **no member identifier on the line**), so the detector firing
  stays observable without recording what the member *is*.

**Preserved** — evidence:
- `relationship_entries` still carries `content` (the member's own words, ≤200 chars, no AI
  interpretation), `kind`, and `confidence` — RE-009 §5's permissible category.

> ⭐ **The smallest-repair rule held.** The detector was not removed and pattern recognition
> was not stopped. **Detection was separated from durable attribution** — which is the only
> change that satisfies both constitutional arms.

---

## 2. ⭐ The guard, and proof that it is lethal

`lib/consciousness/__tests__/relationalObserverPossessionGuard.test.ts` — static source
guard, **comments stripped, string literals deliberately NOT stripped** (the table and column
names it must scan *are* string literals).

**Both arms asserted, which is the whole point:**

```
POSSESSION ARM   no pattern_hint · no relationship_entry_patterns
                 · write targets within allowlist · no attribution field in the
                   persisted payload · no expiry on a detection row
PERCEPTION ARM   detectPatterns(userMessage) still runs
                 · member's own words still persisted
PRESERVED        sanctuary refusal · required consent posture
```

**Mutation results — the guard passes the repaired source and kills all four mutants:**

| Mutant | Killed by |
|---|---|
| **M1** — the founder's named mutant: restore the durable `pattern_hint` write, keep member-facing language humble | `no pattern_hint` · `entries payload carries no attribution` |
| **M1b** — same attribution via a **renamed carrier + expiry** (`relational_signal_cache.signal_ref`) | `write targets within allowlist` · `no expiry on detection` |
| **M2** — **delete the detector**: database becomes clean, MAIA goes blind | `detection still runs` |
| **M3** — over-deletion: drop the member's evidence too | `evidence still persisted` |

⭐ **M1 and M2 are the two failure modes the founder named, and the guard kills both.** A
guard with only the possession arm is a possession test that a lobotomy passes; a guard with
only the perception arm is the disclosure test RE-009 exists to refuse.

⚠️ **INSTRUMENT DEFECT FOUND AND REPAIRED BEFORE THE GUARD WAS TRUSTED.** The first draft
stripped string literals before scanning and therefore **reported a false FAIL against a
correctly repaired file** — it could not see `insertOne('relationship_entries'` because it
had blanked the string. *An instrument that cannot see the thing it exists to check will
report cleanly about something else.* Corrected, re-run, and recorded here rather than
silently fixed.

---

## 3. The acceptance gate

| | Criterion | Result |
|---|---|---|
| **F1** | relational detection still operates | ✅ guard PERCEPTION ARM · M2 killed |
| **F2** | member-originated evidence may still be retained | ✅ guard · M3 killed |
| **F3** | system attribution not durably written before member participation | ✅ M1 killed |
| **F4** | no `pattern_hint`/`pattern_id` equivalent survives through another carrier | ✅ write-target allowlist · M1b killed |
| **F5** | no session-crossing read-back can reconstruct the removed attribution | ⚠️ **CONDITIONAL — see §4** |
| **F6** | Sanctuary behavior unchanged | ✅ untouched; guard asserts |
| **F7** | explicit-handoff / fallback controls unchanged | ✅ read path not in the diff |
| **F8** | three live routes witnessed | ⛔ **OWED — see §5** |
| **F9** | no Act 3 / Act 6 / dormant-writer / essence / canon / memory repair smuggled in | ✅ `git diff --stat`: **1 source file, 30 insertions, 23 deletions** |

---

## 4. ⚠️ F5 — the residue, named rather than cleaned

> ⭐ **FOUNDER STANDING CORRECTION, 2026-09-15.** F5 is **not** one question. The witness
> must distinguish two, and they are not the same kind of fact:
>
> ```
> NEW WRITE CONFORMITY   Does the repaired runtime create any new prohibited attribution?
> LEGACY STATE           Do pre-repair prohibited attributions remain present?
> ```
>
> ⭐ **The second is a migration/disposition question, NOT evidence that the forward repair
> failed.** Conflating them would either understate the repair (by scoring it against rows
> it did not write) or overstate it (by treating a clean forward path as a clean database).
>
> ⛔ **And the disposition needs its own authorization**, because deleting, transforming,
> expiring, quarantining, and ignoring historical member-linked data are **materially
> different acts** with different consequences for the member. ⛔ F5 is not weakened, and
> historical data is not deleted opportunistically to make a gate green.

**The repaired path writes no new attribution.** But `pattern_hint` values written **before**
this repair are still in the database, and:

- ⭐ **`relationship_entries` has no TTL.** Unlike `relationship_entry_patterns` (30-day
  `expires_at`, so those rows self-expire within 30 days of this repair), **`pattern_hint`
  persists indefinitely.**
- It remains readable through the live explicit-handoff path
  (`relationshipContextService` → `salientThemes` → `formatRelationalContextForPrompt`).

**So a session-crossing read-back can still surface pre-repair attributions.** F5 is met
going forward and **not met for historical rows.**

⛔ **Deliberately not cleaned here.** Deleting member-scoped production rows is a destructive
data act requiring its own authorization; this lane has not touched production, and quietly
purging rows to make a gate go green is the shape of thing this lane exists to refuse.
**Recorded as owed, with the distinguishing fact stated: the side table self-expires, the
column does not.**

---

## 5. ⛔ F8 — why ACT 5 does not close

The founder's instruction is explicit: *"The repair is not complete from static inspection."*
Each of the three live observer routes must be driven with a pattern-triggering message and
both witnesses demonstrated — **perception witness** (detector still identifies the
candidate) and **persistence witness** (no unadopted attribution survives durably).

⛔ **Not performed.** This container has **no `node_modules` and no reachable database**, so
no route can be driven and no store inspected. *That is a statement about the environment,
not a deferral, and static evidence is not being offered in its place.*

**What the witness must cover when run:**
1. All three routes — `app/api/oracle/conversation/route.ts:1638`,
   `app/api/sovereign/app/maia/route.ts:438`, `app/api/sovereign/app/maia/list/route.ts`.
2. Inspect `relationship_entries.pattern_hint` **and** `relationship_entry_patterns` after
   each turn.
3. ⚠️ **The writer is fire-and-forget** (`_observeAsync`, not awaited) — so *"the row isn't
   there immediately"* proves nothing. The witness must re-check after the background write
   would have settled.
4. Confirm the member's `content` row **is** present (F2 must not pass by over-deletion).
5. Confirm Sanctuary still writes nothing at all.

---

## 6. Held open, deliberately untouched

| Item | State |
|---|---|
| Act 3 operational-use ambiguity (*"You may know more than you say"*) | ⏸ **PRESERVED** — prompt not rewritten; owed its own behavioral witness |
| Act 6 promotion ambiguity | ⏸ **PRESERVED** — no adoption mechanism manufactured to save the old persistence path |
| `Unresolved Relational Field` | ⏸ **UNTOUCHED** — not renamed, not redesigned |
| `saveConversationTheme` · `saveRelationshipPattern` | ⚠️ latent hazards; zero callers ≠ live path |
| `relationship_essences` | ? **UNVERIFIED** — the known violation was not allowed to bootstrap an accusation against a different carrier |
| `relationship_entries.kind` (`'rupture'` etc.), computed from member + MAIA text | ⚠️ **NEW OBSERVATION, ROUTED OUT** — event-typing rather than person-attribution, and not the confirmed defect. ⛔ No lane opened. |

---

## 7. Standing

```
ACT 5 REPAIR              ✅ LANDED — detection separated from durable attribution
GUARD                     ✅ LETHAL — passes repaired source, kills M1 · M1b · M2 · M3
GATE                      F1 F2 F3 F4 F6 F7 F9 ✅ · F5 ⚠️ CONDITIONAL · F8 ⛔ OWED
ACT 5                     ⛔ CLOSURE NOT YET EARNED (founder, 2026-09-15)
  implementation          ✅ complete
  static gates            ✅ except the F5 legacy-state qualification
  live-route witness      ⏳ OWED
  legacy attribution      ⏳ REQUIRES SEPARATE DISPOSITION ACT
HISTORICAL pattern_hint   ⚠️ RESIDUE · no TTL · readable · ⛔ NOT PURGED (separate act)
FILES CHANGED             1 source + 1 test
READ PATH · PROMPTS       ⛔ UNTOUCHED
CANON                     ⛔ UNCHANGED
PRODUCTION                ⛔ UNTOUCHED · NOT DEPLOYED
```

> ⭐ The runtime is now capable of **perception without possession** on the repaired path —
> it still sees the pattern, and no longer keeps it. ⛔ Whether it *does* so in production is
> what F8 exists to establish, and that has not been shown.
