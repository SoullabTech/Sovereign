# DREAM-01R1 — Canonical Dream Object + Legacy Authority Reconciliation

**Programme:** SOULLAB-LIVING-ORIENTATION / DREAM-01R1  
**Date:** 2026-09-27  
**Scope:** object identity, substrate reconciliation, and authority contract only. No new Dream room, no new route, no schema migration, no new crossing implementation.

## 1. Decision

A **Dream in Soullab is one member-owned remembered dream with one primary identity and one primary body**.

Dream is a first-class House facet because of the quality of relationship and exploration around that object, not because it requires a separate content table.

The canonical primary object is therefore the existing member-owned Journal Dream record:

- storage substrate: `quick_journal_entries`;
- discriminator: `entry_type = 'dream'`;
- identity: existing UUID `quick_journal_entries.id`;
- primary body: `content`;
- lived/recorded time: `created_at`;
- provenance: `source` + bounded `meta`;
- optional audio provenance: existing audio/transcript fields.

This is a conceptual ruling, not a table-renaming decision. The implementation table name does not determine the ontology.

## 2. Why this object wins

### It is already live member substrate

The current local database contains real Journal Dream rows.

At the DREAM-01R1 witness:

- `quick_journal_entries`: 19 total rows;
- Journal Dream rows: 3;
- `dream_entries`: table not present in the live local database.

### It is already in the accepted member experience

The canonical Journal room already supports:

- Day / Dream convention;
- Dream-first writing;
- keeping the entry;
- exact reading;
- explicit Dream reflection with MAIA;
- provenance and return.

### It avoids duplicate truth

Creating a second content object merely because the member enters a first-class Dream room would create two competing bodies for the same remembered dream.

The rule is therefore:

> **A new room may create a new relationship to an object. It does not need to create a duplicate object.**

## 3. Status of `dream_entries`

The repository contains:

- migration `20260404000001_dream_entries.sql`;
- `/api/dreams` CRUD routes;
- founder/lab Dream surfaces that target those routes.

But in the witnessed local runtime:

- the `dream_entries` table does not exist;
- the member-facing accepted Journal Dream path does not depend on it;
- non-backend runtime references are concentrated in lab/founder tooling and old Dream components.

Therefore `dream_entries` is **not canonical Dream authority**.

DREAM-01R1 does not delete it.

It is classified as:

> **legacy / unadmitted parallel substrate pending future migration review**

No new member-facing Dream implementation should begin writing to it.

## 4. Canonical Dream identity contract

A canonical Dream reference is:

```
facet: dream
dreamRefId: <quick_journal_entries.id>
sourceKind: journal-dream
sourceRefId: <same UUID>
```

At first implementation, `dreamRefId` and `sourceRefId` may be the same UUID.

That is intentional.

A separate Dream-level UUID should only be introduced if a future substrate requirement genuinely needs an identity distinct from the primary remembered dream. It must not be introduced merely for architectural neatness.

## 5. Dream capture contract

Dream may be captured from:

- Journal using the Dream convention;
- the future Dream room;
- voice capture;
- text capture;
- later, a supported image/handwriting transcription path.

All of those should converge on the same canonical primary object.

For a new Dream-room capture, the default future write target should be the canonical Dream record substrate, not `dream_entries`.

The future Dream room may present a richer interface while preserving the same underlying primary dream identity.

## 6. Primary record fields

### Canonical / member fact

These may be treated as facts of the record:

| Field | Standing |
| --- | --- |
| id | canonical identity |
| member ownership | canonical ownership |
| content | primary member-authored dream body |
| created / recorded time | factual provenance |
| capture source | factual provenance |
| audio path / MIME / duration | factual provenance |
| transcript source / confidence | factual technical metadata |
| member-authored place | member-authored context |

### Member-authored enrichment

These may be added around the dream when the member explicitly authors or chooses them:

- title;
- remembered images;
- figures / characters;
- setting;
- affect words;
- bodily residue;
- personal associations;
- waking-life associations;
- member-recognized recurring motifs;
- chosen archetypal language;
- chosen spiritual significance;
- chosen tags;
- remembered sleep / waking context.

These enrich the object without replacing the dream body.

## 7. Computational sensitivity layer

Computational inference may quietly help MAIA become more perceptive across one dream or a dream series.

Possible internal signals include:

- image recurrence;
- figure recurrence;
- location recurrence;
- affect recurrence;
- archetypal salience;
- elemental patterning;
- Spiralogic movement;
- possible compensation;
- possible prospective movement;
- possible shadow dynamics;
- numinous intensity;
- unusual dream-type hypotheses;
- similarities across dreams;
- sleep / timing context;
- candidate amplifications;
- candidate questions.

These signals may influence:

- which image MAIA returns to;
- which question she asks;
- whether she slows down;
- whether she notices a transformation across a series;
- whether an amplification might be useful;
- whether a prior dream may be relevant.

They do not automatically become member-facing labels or canonical facts.

The governing law is:

> **Computational memory may deepen attention without becoming interpretation authority.**

## 8. Translation law

When an internal signal becomes relevant to the conversation, MAIA should usually translate it into humane observation or inquiry.

Prefer:

> “The house has appeared in several of these dreams, but this is the first time you were inside it. What is that like to notice?”

over:

> “Recurring setting detected: HOUSE. Integration score increased.”

Prefer:

> “There is something different in your relationship to this figure now.”

over:

> “Shadow integration stage: 72%.”

Prefer:

> “This one has a different scale and atmosphere from the dreams around it. Does it feel different to you?”

over:

> “Big Dream classified.”

The computational layer exists to serve encounter.

## 9. Interpretation objects are not the Dream

Any future persisted material created during exploration must have a different identity and authorship class from the primary dream.

Possible secondary artifacts:

- member association;
- MAIA hypothesis;
- amplification offered;
- member recognition;
- active-imagination continuation;
- integration thread;
- chosen Reflection;
- Daily Anchor carry;
- explicit relation to another dream.

None may overwrite `content`.

None becomes “the interpretation.”

## 10. Dream series identity

A dream series is not a second copy of dreams.

It is a relationship among canonical Dream identities.

A future series substrate may hold edges such as:

- explicit member linkage;
- literal repeated token/image evidence;
- machine-proposed similarity;
- member-confirmed recurrence.

Those edge types must remain distinguishable.

A machine-proposed similarity may inform MAIA before the member ever sees it.

If surfaced, it should enter as an invitation to notice, not as a declared personal pattern.

## 11. Journal ↔ Dream identity law

Journal and Dream are two valid ways of encountering the same primary Dream object.

### Journal

Journal emphasizes:

- writing;
- lived date and place;
- continuity with day writing;
- minimal capture friction.

### Dream

Dream emphasizes:

- re-membering;
- encounter;
- amplification;
- dream series;
- integration;
- relational exploration with MAIA.

The object does not duplicate when the member moves between these facets.

Therefore the future gesture:

> **Explore this dream**

should open the Dream facet at the same canonical Dream UUID.

And:

> **Return to Journal**

should reopen the same UUID in Journal.

The relationship is:

```
one dream
    ├── encountered as Journal writing
    └── encountered as Dream work
```

not:

```
journal copy → duplicated dream copy
```

## 12. Returnability

Every first-class Dream view must be identity-addressable.

Required future properties:

- exact Dream URL carries only identity, never dream text;
- ownership is resolved server-side;
- return to Journal reopens the exact source dream;
- Dream → MAIA context is loaded from the owned source object, not accepted from URL/body text;
- missing/deleted source fails closed;
- secondary artifacts may survive source deletion only if their own custody law explicitly says so.

## 13. Legacy field reconciliation

The old Dream schemas contain useful ideas but mixed epistemic classes.

DREAM-01R1 classifies them as follows:

| Legacy concept | New standing |
| --- | --- |
| raw content / narrative | primary dream body or member-authored enrichment |
| setting / characters | member-authored enrichment |
| symbols | member-authored or computational candidate |
| archetypes | member-authored language or computational sensitivity |
| emotional tone | member-authored if stated; otherwise computational sensitivity |
| lucidity | member-authored / factual self-report |
| sleep quality | member-authored self-report |
| lunar / timing context | factual contextual data if actually calculated/recorded |
| shadow aspects | computational sensitivity / conversational hypothesis |
| integration level | computational sensitivity only; never member score |
| processing stage | computational sensitivity only |
| spiritual significance | member-authored recognition; computation may notice numinosity |
| elemental balance | computational sensitivity / optional amplification |
| spiral phase | computational sensitivity / optional lens |
| related dreams | explicit relation, literal evidence, or proposed similarity — distinguish source |
| oracle interpretation | secondary artifact only |
| AI insights | secondary MAIA contribution, never primary dream truth |
| action items | not canonical Dream structure; integration remains member-chosen |

## 14. What DREAM-01R1 does not do

This act does not:

- create a Dream route;
- add Dream to House navigation;
- alter Journal UI;
- migrate or delete `dream_entries`;
- create a new table;
- copy existing Journal dreams;
- create Dream → MAIA runtime;
- implement series detection;
- expose computational scores;
- redesign old lab Dream surfaces.

## 15. Successor boundary

With the canonical Dream object settled, the next act may finally concern the experience.

> **DREAM-02 — WORLD-CLASS DREAM ROOM EXPERIENCE ARCHITECTURE + STATE MODEL ONLY**

That design should define the actual member journey through:

1. Arrival
2. Re-member
3. Dream page
4. Encounter
5. Amplify
6. Series
7. Integrate
8. Return / crossing

It should design the conversation, spatial hierarchy, and progressive revelation of depth before runtime implementation.

**STOP before build.**
