# WS2-07-F1 · BUILD-07C POST-ACCEPTANCE CONTRACT CORRECTION — DESIGN

**2026-09-04 · design only · implementation NOT AUTHORIZED · no code, no migration executed.**
Lane: `JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01` → 07D → WS2-07-F1.

---

## 0 · The defect, as ruled

> A descriptive taxonomy was accidentally given veto power over developmental
> observation.

More precisely, and this is the distinction the evidence forced:

```text
phenomenon is NOT load-bearing for downstream developmental reasoning
phenomenon IS  load-bearing for ADMISSION into the frozen reading
```

Nothing branches on the label (complete census: `developPresentation.ts`
displays it, witnesses assert on it, `assess.ts` never reads it). But
`classifier_unclassifiable` refuses the whole freeze, so a contextual ranking
can determine whether an otherwise valid developmental observation is allowed
to exist at all.

The `-04` production-shaped evidence established that placement is a function
of claim-set composition, not of the claim alone — two claims were unanimous
across three calls in one composition and unanimous on a *different* label in
another. For claims that instantiate several phenomena, the classifier is not
determining what is present; it is ranking legitimate memberships. That is
tolerable as description. It is not tolerable as a condition of survival.

## 0.1 · Governance frame

```text
BUILD-07C   CLOSED / ACCEPTED historically — acceptance stands
                +
            POST-ACCEPTANCE CONTRACT CORRECTION, authorized from later evidence
```

**Not** "07C was never closed." **Not** a silent migration. 07C was accepted
against the contract and evidence available then; production-shaped evidence
gathered afterwards exposed a defect that acceptance could not have revealed.
Acceptance history is immutable; corrective evolution is recorded forward —
the same principle applied to the `-04` witness record earlier today.

---

## 1 · `phenomenon` becomes optional descriptive metadata

**Current** (`developmentalReading/contract.ts:141`):

```ts
/** What the reading noticed, classified (INV-12). From the closed v1 family. */
phenomenon: DevelopmentalPhenomenon;
```

**Corrected**:

```ts
/** DESCRIPTIVE. Absent when classification was attempted and declined.
 *  Its absence never invalidates the observation. */
phenomenon?: DevelopmentalPhenomenon;
```

Required fields are unchanged and remain required:

```text
observation          REQUIRED   the reader's verbatim claim text
evidenceRefs         REQUIRED   non-empty, re-bound at the freeze
lens                 REQUIRED   copied from the commission
doesNotEstablish     REQUIRED   non-empty
structureDependency  REQUIRED   derived from the bound refs
key                  REQUIRED   reading-internal, position-ordered
phenomenon           OPTIONAL   descriptive
```

**Decision for review — per-observation, not per-reading.** The classifier
answers per claim index. One claim being unclassifiable should leave that one
observation without a phenomenon and the rest classified. The alternative
(any decline drops the label from all) would preserve the all-or-nothing
character that is itself the defect.

## 2 · `unclassifiable` no longer refuses an otherwise valid reading

```text
OLD   unclassifiable -> refuse the whole freeze
NEW   unclassifiable -> observation survives, phenomenon absent,
                        provenance records the non-classification
```

**The virtue is preserved and its pathology removed.** *Do not stretch a
category to fit* stays exactly as written in the classifier prompt. What
changes is only the consequence of honouring it.

**A distinction the correction must not blur.** Two things currently both
refuse, and only one of them is an epistemic refusal:

| current refusal | nature | disposition |
| --- | --- | --- |
| `classifier_unclassifiable` | the model honestly declined | **no longer refuses** |
| `unknown_phenomenon` | a value outside the eight — malformed output | **still refuses** |
| `classification_count_mismatch` | indices don't line up with claims — contract violation | **still refuses** |
| `claim_unbindable`, `fingerprint_mismatch`, `empty_observation`, `reader_refused`, `classifier_presence_mismatch` | evidence, provenance, scope | **still refuse** |

Inability to assign a taxonomy badge stops being grounds for destroying a
reading. Malformed output, broken evidence binding and scope violations remain
grounds, untouched.

## 3 · Historical frozen readings remain intact

**No backfill. No rewrite. No re-validation.**

Every existing row carries a singular phenomenon from the eight — a valid
artifact of the contract and the reader/classifier versions under which it was
frozen. Those values are provenance, not data to be homogenised.

This is safe by construction: the migration *relaxes* a constraint, so existing
rows satisfy the relaxed form automatically, and the validation is a write-time
trigger that does not re-fire on rows already stored.

## 4 · Migration — forward-compatible only

**Current** (`20260904000001_developmental_readings.sql`):

```sql
-- :118  any key outside this set raises
IF k NOT IN ('key','lens','phenomenon','evidenceRefs','observation',
             'doesNotEstablish','structureDependency') THEN

-- :128  a value outside the eight raises
IF (o->>'phenomenon') NOT IN ( ...the eight... ) THEN
```

**Corrected shape** — replace the validation function; the table, its rows and
its insert-only character are untouched:

```text
key allowlist        UNCHANGED — an unknown key still raises
phenomenon present   must be one of the eight, else raise   (unchanged)
phenomenon absent    PERMITTED                              (new)
phenomenon null      decide: permit, or require absence
required keys        observation, evidenceRefs, lens, doesNotEstablish,
                     structureDependency, key — a missing one still raises
```

**Decision for review — absent vs `null`.** JSONB distinguishes them. I would
permit **absence only** and reject explicit `null`, so that "no phenomenon" has
one representation rather than two. Naming it because a permissive choice here
is hard to tighten later.

## 5 · Version and provenance must distinguish the corrected contract

**Finding that shapes this: there is no contract version.** The only versions
are `READER_VERSION` (`DEVELOPMENTAL-READER-02`) and `CLASSIFIER_VERSION`
(`DEVELOPMENTAL-PHENOMENON-04`). Neither is the right place — the correction
changes neither the reader's prompt nor the classifier's; it changes the shape
a reading is allowed to have.

**Proposed**: a new `READING_CONTRACT_VERSION`, stamped into
`DevelopmentalReadingProvenance`, `-01` for the pre-correction shape and `-02`
after. A reading then says which contract it was frozen under, and a future
reader of an old record can tell that its singular phenomenon was mandatory
rather than merely present.

**And a second provenance problem, which is easy to miss.** Today:

```ts
/** Present iff the reading has observations (a `none` reading classified nothing). */
classifier: ClassifierIdentity | null;
```

`null` currently means *no classifier ran*. After the correction there are
**three** states, not two:

```text
no observations              -> no classifier ran          -> classifier: null
observations, classified     -> classifier ran, succeeded  -> classifier: {...}
observations, all declined   -> classifier RAN and DECLINED -> ???
```

The third state is new and must not collapse into either neighbour. A reading
whose classifier ran and declined is not a reading with no classifier. INV-25
("present iff the reading has observations") needs restating, and the shape of
the non-classification record is a decision for review — a flag on the identity,
a distinct provenance field, or per-observation absence alone carrying it.

## 6 · Historical witnesses and pins stay untouched

`ws2-07b-reader-gate-a.ts`, `ws2-07b-reader-gate-b.ts`,
`ws2-07c-reading-gate-a.ts`, `ws2-07c-reading-gate-b.ts` and
`lib/writersStudio/__tests__/developPresentation.test.ts` pin
`DEVELOPMENTAL-READER-01` / `DEVELOPMENTAL-PHENOMENON-01`.

**Not repinned, not "cleaned up."** They are the acceptance evidence for closed
units and must continue to attest what they attested. Repointing them at
current versions would make an old witness appear to have exercised a semantic
contract it never saw.

New coverage for the corrected contract belongs in new checks, not in edits to
old ones.

## 7 · 07D consumes the corrected shape honestly

`developPresentation.ts:204-205` currently assumes presence:

```ts
phenomenon: o.phenomenon,
phenomenonLabel: phenomenonLabel(o.phenomenon),
```

**Requirement**: the member-facing surface must render an unclassified
observation as a complete observation, not as a damaged one. What it must not
do is imply the observation is lesser, provisional, or failed — the
developmental content is identical; only a descriptive badge is absent.

**Open for founder wording** — the presented sentence when phenomenon is
absent. This is member-facing language and belongs to the founder, not to a
contract spec. What the spec fixes is only that absence is representable and
non-degrading.

---

## Decisions this design puts to the founder

1. **Per-observation** absence rather than per-reading — §1.
2. **Absence only**, rejecting explicit `null` — §4.
3. **`READING_CONTRACT_VERSION`** as the place the correction is recorded — §5.
4. **How the third provenance state is represented** — classifier ran and
   declined, distinct from no classifier — §5.
5. **Member-facing wording** when phenomenon is absent — §7.

## What this design does not do

No plural phenomenon membership. Plural may prove useful for Field View and
whole-Work patterning later, but the present evidence does not establish that
Writer's Studio needs a multi-label ontology now, and building one would turn a
discovered defect into a taxonomy feature.

No `-05`. No classifier change. No reader change. `classify.ts` frozen. No
07D acceptance work. 07E unopened. No implementation until this design and its
migration are reviewed and implementation is authorized by its own act.

**Carried caution.** That the four claims which moved under composition are the
four that instantiate several phenomena, and the seventeen that held instantiate
one, is the adjudicated reading of one fixture — 21 claims, one manuscript, one
lens. It is not a law of the classifier, and `act2/o3` is a partial
counterexample. The correction does not rest on that generalisation; it rests
on the narrower established fact that a descriptive label can veto an
authoritative observation.

Evidence: `WS2-07-F1_ACT3_FIXED_CLAIM_WITNESS_2026-09-04.md`,
`WS2-07-F1_PHENOMENON-04_FIXED21_STRESS_WITNESS_2026-09-04.md`,
`WS2-07-F1_PRODUCTION_SHAPED_BATCH_WITNESS_2026-09-04.md`.
