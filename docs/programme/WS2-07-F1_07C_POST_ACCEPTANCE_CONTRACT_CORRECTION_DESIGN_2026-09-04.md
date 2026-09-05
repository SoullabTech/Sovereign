# WS2-07-F1 · BUILD-07C POST-ACCEPTANCE CONTRACT CORRECTION — DESIGN

**2026-09-04 · design only · implementation NOT AUTHORIZED · no code, no migration executed.**
Lane: `JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01` → 07D → WS2-07-F1.

---

## 0 · The governing principle

> **Observation has ontological priority over classification: the taxonomy may
> describe a developmental observation, but it may neither manufacture one nor
> veto one.**

That sentence is the whole correction, and it is why per-observation absence is
the right shape: the developmental reader owns the observation; the classifier
owns only the optional taxonomy claim about it.

## 0.0 · The defect, as ruled

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

**Ruled**: a new `READING_CONTRACT_VERSION` stamped into
`DevelopmentalReadingProvenance`. The corrected contract is **v2**.

**v1 is identified by the ABSENCE of the field, and is never backfilled.**
Calling the corrected contract v1 would erase the governance history being
preserved; stamping `-01` onto historical rows would do the same by rewriting
them. So:

```text
v1   accepted contract — an observation REQUIRED a phenomenon classification
     identified by: no READING_CONTRACT_VERSION field present
     historical rows keep their existing shape, untouched

v2   corrected contract — a developmental observation MAY exist without one
     identified by: READING_CONTRACT_VERSION present, v2
     new readings only
```

The absence of the field on a historical row is itself the evidence of the
legacy contract. The correction moves forward; it does not reach back.

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

## Decisions — ADJUDICATED 2026-09-04

All five were put to the founder and all five are ruled. Recorded as ruled, not
as proposed.

**1 · Absence is per observation.** A reading is a collection of observations;
classification success or refusal belongs to each independently. One declined
classification may not erase taxonomy from its siblings. This also keeps the
correction minimal — taxonomy loses its veto over an observation, it is not
weakened everywhere.

**2 · Absence by omission only.** `phenomenon?: DevelopmentalPhenomenon`, never
`| null`. One representation for "no classification was assigned", so a missing
field means precisely that and nothing else. Two serialized states with no
semantic distinction between them is the thing being avoided.

**3 · `READING_CONTRACT_VERSION` is introduced.** The correction changes neither
what the reader prompt means nor what the classifier taxonomy means; it changes
what constitutes a valid persisted reading. So neither existing version absorbs
it. `DEVELOPMENTAL-READING-CONTRACT-02`, with the existing shape understood as
`-01`. **Model provenance and reading-contract provenance are separate
dimensions**, and the contract version is never inferred from the classifier
version. A frozen reading should eventually be able to say which reader produced
the claims, which classifier interpreted them, and which contract admitted them.

**4 · Ran-and-declined is derived, not stored.** `classifier: null` keeps its
meaning — *no classification act ran*. A classifier that ran and declined
everything is still identified by `classifier`, because it did run. No
reading-level `classifierDeclined` flag: it is derivable, and storing redundant
state invites later contradiction with the observations themselves.

```text
no observations                  -> classifier: null
observations, some classified    -> classifier: identity, some carry phenomenon
observations, all declined       -> classifier: identity, none carry phenomenon
```

**5 · Member-facing: no replacement badge.** When phenomenon is present, the
existing human-readable label stands. When absent, **nothing** is shown in its
place — not "Unclassified", "Other", "Unknown", "No phenomenon", or "MAIA
couldn't classify this". Each of those turns taxonomy absence into content and
subtly degrades the observation. The observation stands on its own. Inspection
and provenance views may state it precisely — *"Phenomenon classification: not
assigned"* — but that belongs to provenance, not the ordinary writer
experience. Where a surface genuinely needs explanatory microcopy, the ruled
wording is *"No current phenomenon label applies."* — and most ordinary
member-facing surfaces should simply omit the label rather than reach for it. The writer came to Develop to encounter what MAIA noticed, not to
watch the taxonomy fail gracefully.

### INV-25, replacement text

> `classifier === null` iff classification was not invoked. A persisted reading
> containing observations retains classifier identity even when the classifier
> makes zero phenomenon claims.

**And the stronger persisted form holds in this pipeline — verified, not
assumed.** `commission.ts:70-78` invokes `classifyClaims` unconditionally
whenever `result.outcome === 'claims'`, so classification is always attempted
when there are claims. Therefore:

> **observations present ⇒ `classifier !== null`**

is a persistable invariant, not merely a description, and may be enforced. The
existing `classifier_presence_mismatch` refusal already guards its converse.

---

## Implementation plan — bounded, NOT AUTHORIZED

Nine deltas. Each names its site. Nothing here is written.

### A finding that shapes the whole plan

**The classifier's semantics need no change at all.** `CLASSIFIER_SYSTEM:78`
already instructs the model to answer `unclassifiable` **for that claim** — per
claim, not per reading. The prompt has always been right. The defect is
entirely downstream, in what the parse does with that answer:

```ts
// classify.ts, inside parseClassifierBlocks
if (c.phenomenon === UNCLASSIFIABLE) {
  return refuse('classifier_unclassifiable', `claim ${c.index} ...`, c.index);
}
```

It returns on the **first** decline and discards every later one. So a
per-observation correction cannot be implemented outside this function: the
refusal carries one index, and the information about the others is destroyed
before any other module sees it.

**Decision required before implementation.** `classify.ts` is frozen. This plan
needs a return-shape change inside it — and **no change to its prompt, rules,
family, or version**. Either:

- **(i)** the freeze is understood as *semantic* — prompt, rules, taxonomy,
  version — in which case plumbing changes are in scope for the corrective
  unit; or
- **(ii)** the freeze is literal on the file, and `parseClassifierBlocks` must
  be lifted into the corrective unit's own module.

I recommend **(i)**. Option (ii) fragments one classifier contract across two
modules for a governance reason rather than a design reason, and the frozen
thing everyone has been protecting — the semantics — is untouched either way.

### The nine deltas

| # | delta | site |
| --- | --- | --- |
| 1 | `phenomenon` becomes optional | `developmentalReading/contract.ts:141` |
| 2 | parse returns per-index `phenomenon \| undefined` instead of refusing on first decline; `ClassifyOutcome.phenomena` widens | `classify.ts` — `parseClassifierBlocks`, `classifyClaims` |
| 3 | freeze accepts `undefined` and omits the key; keeps refusing a defined non-member | `freeze.ts:118` (`unknown_phenomenon`) |
| 4 | trigger permits the key's absence; still raises on unknown keys and on a present value outside the eight | new migration replacing the function in `20260904000001_developmental_readings.sql` |
| 5 | `READING_CONTRACT_VERSION` added and stamped into `DevelopmentalReadingProvenance` | `contract.ts`, `freeze.ts` |
| 6 | INV-25 replaced with the text above | `contract.ts` doc comment |
| 7 | presentation emits no badge when absent | `developPresentation.ts:204-205` |
| 8 | tests: historical rows still valid under the relaxed trigger; no backfill executed; declined observation survives; sibling keeps its label | new checks only |
| 9 | `unknown_phenomenon` refusal preserved verbatim | `freeze.ts` — asserted, not edited |

**Also touched, not in the founder's list:** `commission.ts:72-78` currently
does `if (!phenomena.ok) return refused('classify', ...)`, which is the second
place a decline kills the commission. It must stop treating a decline as a
classify-stage refusal while continuing to propagate every other classifier
refusal unchanged.

**Not touched:** `store.ts` (never references `phenomenon`), `assess.ts` (never
did), the reader, the eight, the prompt, `CLASSIFIER_VERSION`, `READER_VERSION`,
and every 07B/07C acceptance witness with its `-01` pins.

### Refusal disposition, restated for implementation

```text
classifier_unclassifiable      NO LONGER REFUSES   observation survives, phenomenon omitted
unknown_phenomenon             STILL REFUSES       malformed output, not an honest decline
classification_count_mismatch  STILL REFUSES       contract violation
claim_unbindable               STILL REFUSES       evidence
fingerprint_mismatch           STILL REFUSES       evidence
empty_observation              STILL REFUSES       no content
reader_refused                 STILL REFUSES       nothing to freeze
classifier_presence_mismatch   STILL REFUSES       provenance
```

The virtue *do not stretch a category to fit* is untouched in the prompt. Only
the consequence of honouring it changes.

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
