# CC HANDOFF
# `OBSERVATION-ADDRESS-01 / A0 — READ-ONLY SUBSTRATE CENSUS + MINIMUM DESIGN PROPOSAL`

Status: BOUNDED READ-ONLY INVESTIGATION  
Programme: `JARVIS-WRITERS-STUDIO-COMPLETE-01`

This act is **investigation only**.

It does not authorize:
- code changes;
- schema changes;
- migrations;
- fixture creation;
- package installation;
- branch restructuring;
- merge;
- deployment;
- production access/mutation.

If completing the investigation requires mutation, STOP and report exactly why.

---

# 1. Objective

Determine the **smallest existing-or-additive durable-place substrate** required to truthfully support:

1. durable member observations;
2. lawful returning-writer continuity;
3. stale-reading identity;
4. revision/history safety;
5. Review → passage → return trails;
6. reproducible beta fixture state.

Do not design a generic annotation platform.

Do not solve unrelated future features.

The output is a **current-repo census + minimal design proposal**, not an implementation.

---

# 2. Governing Product Law

Read in full before auditing:

- `SOULLAB_WRITERS_STUDIO_DURABLE_PLACE_AND_OBSERVATION_ADDRESS_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_CORE_OBJECT_AND_STATE_MODEL_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_FAILURE_RECOVERY_AND_CONCURRENCY_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_WORK_NAVIGATION_AND_DISCOVERY_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_FLAGSHIP_EVIDENCE_AND_READINESS_CANON_v1.md`
- `SOULLAB_WRITERS_STUDIO_BETA_READINESS_AND_DATA_RULING_v1.md`

If any required canon is unavailable in the CC session, STOP rather than reconstructing it from summaries.

---

# 3. Core Product Question

Answer:

> **What is the minimum durable object/address/version substrate that lets Writer's Studio remember meaningful authored place without silently inventing continuity or overbuilding infrastructure?**

---

# 4. Starting Principle

Do not assume the repo needs a new system.

First discover whether the required substrate already exists under different names.

Possible existing concepts may include:
- Work ids;
- manuscript ids;
- chapter/section ids;
- `placeInWork`;
- paragraph/span anchors;
- workbench scope;
- reading ids;
- document/version ids;
- edit history;
- provenance;
- session/thread ids;
- persistence adapters;
- DB models;
- local storage;
- server storage.

Names above are search hypotheses only, not claims.

---

# 5. A0-1 — Current Object Census

For each object below, report:

```text
EXISTS
PARTIAL
IMPLICIT
DUPLICATED
ABSENT
UNKNOWN
```

Objects:

1. Work
2. Work Version
3. Place / Address
4. Reading
5. Coverage
6. Observation
7. Member Observation
8. Relation / Thread
9. Conversation Seam
10. Revision Proposal
11. Applied Mutation
12. History Entry
13. Member Declaration
14. Template Choice
15. Resume State
16. Review Trail
17. Async Request

For every non-ABSENT object, record:

- exact type/interface/schema/component name;
- exact file path;
- stable id field;
- Work binding;
- version binding;
- locus/address representation;
- provenance;
- persistence class;
- creation path;
- retrieval path;
- deletion/edit semantics;
- known consumers.

No speculative filling.

---

# 6. A0-2 — Address Census

Find every current representation of manuscript place.

Search for:

- chapter index/id;
- section id;
- paragraph id;
- block id;
- offsets/ranges;
- text quote anchors;
- content hashes;
- selection serialization;
- `placeInWork`;
- return address;
- source span;
- evidence span;
- manuscript position;
- anchor;
- range;
- highlight;
- locus equivalents.

For each representation answer:

1. Is identity stable across insertion above the locus?
2. Stable across edit inside the locus?
3. Stable across section reorder?
4. Stable across section rename?
5. Stable across split?
6. Stable across merge?
7. Can it address historical text?
8. Can it resolve forward to current text?
9. Can it represent ambiguous resolution?
10. Can it represent missing/historical-only?

Do not infer. Cite exact implementation.

---

# 7. A0-3 — Work Version Census

Find how the system currently distinguishes authored states.

Report:

- version ids;
- updated timestamps;
- hashes;
- revision numbers;
- immutable snapshots;
- diff/history records;
- optimistic concurrency values;
- any source-of-truth manuscript record.

Answer:

> Can the current system truthfully establish that a passage changed after MAIA read it?

If YES:
- show exact path and mechanism.

If PARTIAL:
- say precisely what is missing.

If NO:
- do not propose UI copy that says it can.

---

# 8. A0-4 — Reading Identity Census

Find the current MAIA reading model.

Determine whether a reading has:

- stable id;
- Work id;
- Work version;
- authorized scope;
- completion state;
- coverage;
- timestamp;
- evidence;
- provider/model provenance where governed;
- stale/current status.

Also identify whether:
- reading state is persisted;
- only UI state exists;
- observations can outlive the reading that produced them.

---

# 9. A0-5 — Observation Identity Census

Find every current "observation-like" object, including differently named forms:

- finding;
- insight;
- pattern;
- review item;
- developmental note;
- continuity item;
- MAIA notice;
- member mark.

For each, answer:

- stable id?
- derived from rendered text?
- minted at admission?
- evidence?
- exact locus?
- provenance?
- coverage?
- reading id?
- freshness?
- durable?
- rendered in more than one mode?
- duplicate identity elsewhere?

Flag all shadow-object risk.

---

# 10. A0-6 — Member Observation Gap

Specifically determine what exists today for:

```text
Something I noticed
A question
A possibility
```

Answer:

- current UI exists?
- object exists?
- current-session state?
- persistence?
- owner field?
- edit?
- delete?
- retrieval after reload?
- exact locus?
- current-resolution behavior after edit?

Do not count a generic note object unless its semantics actually satisfy the requirement.

---

# 11. A0-7 — Revision + History Census

Find exact representation for:

```text
proposal
→ read in context
→ apply
→ mutation
→ receipt
→ history
→ undo
```

Determine:

- proposal identity vs mutation identity;
- target version binding;
- target place binding;
- stale-target protection;
- pre-image/post-image;
- post-version;
- actor;
- undo relationship;
- persistence.

Report whether stale Apply can currently overwrite later edits.

Read-only proof only.

Do not trigger destructive mutation merely to find out.

---

# 12. A0-8 — Resume / Returning-State Census

Find whether the system currently persists any lawful resume state.

Possible fields:
- last Work;
- last mode;
- chapter;
- section;
- locus;
- observation;
- conversation.

Distinguish:

```text
session UI state
browser-local state
server-persisted member state
derived state
```

Answer exactly which returning copy can be truthfully supported today.

Example table:

| Copy | Supported? | Evidence |
|---|---|---|
| Welcome back to {Work} | | |
| You last worked in Ch 6 | | |
| You left this question here | | |
| You were working on voice | | |

---

# 13. A0-9 — Review Trail Census

Find how the candidate currently preserves:

```text
Review
→ observation
→ passage
→ MAIA
→ Back to Review
```

Report:

- observation id;
- route/state identity;
- return location;
- browser history dependence;
- in-memory dependence;
- behavior after reload;
- behavior after Work changes.

Identify what is navigation-only vs durable.

---

# 14. A0-10 — Persistence Surface Census

List every persistence surface relevant to this programme.

For each:

- technology;
- authoritative owner;
- data stored;
- durability;
- per-member isolation;
- Work isolation;
- version semantics;
- privacy/retention implications;
- current production use.

Examples may include:
- DB;
- filesystem;
- browser storage;
- session store;
- API persistence;
- Git-backed fixture;
- in-memory state.

Do not introduce a new persistence surface in A0.

---

# 15. A0-11 — Privacy / Retention Consequence Census

For each proposed-to-be-durable object, identify whether persistence would add new retention obligations.

At minimum:

- member manuscript;
- member observation;
- MAIA reading;
- frozen evidence;
- revision history;
- resume state;
- conversation context.

Do not invent legal policy.

Report:
- what code currently does;
- what existing policy hooks exist;
- what remains unresolved.

---

# 16. A0-12 — Collision / Duplication Analysis

Identify places where current code has two or more objects that may be representing the same product concept.

Examples:

```text
review finding vs observation
analysis item vs observation
route selection vs place
chat thread vs conversation seam
edit history vs revision history
```

For every suspected collision:

- exact files/types;
- semantic overlap;
- meaningful distinction, if any;
- danger if both remain authoritative.

Do not merge them in this act.

---

# 17. A0-13 — Minimum Unlock Set

After the census, propose the **minimum set of substrate capabilities** needed to unlock:

## R5
member observation durability

## First Arrival
lawful returning state

## R9
seedable beta environment

## Stale Reading
historical/current identity

## Revision Safety
stale proposal / Undo truth

The proposal should explicitly separate:

```text
MUST HAVE FOR FLAGSHIP
CAN REMAIN EPHEMERAL
DEFER
```

---

# 18. A0-14 — Minimum Object Proposal

For each MUST HAVE object, propose only product-semantic fields.

Example structure:

```text
ObservationAddress
- id
- workId
- createdAtWorkVersion
- structuralAnchor
- localContentAnchor
- createdRange
- currentResolution
```

This is illustrative only.

Do not assume this exact schema.

The proposal must derive from the existing repo.

---

# 19. A0-15 — Resolution Algorithm Options

If current addressing is insufficient, present at most **three** bounded strategies.

Possible classes may include:

- stable block/section identity + range;
- quote/context anchoring;
- content hash/context;
- hybrid structural + textual anchor.

For each option:

- what existing substrate it reuses;
- ordinary-edit resilience;
- split/merge behavior;
- ambiguous matches;
- historical evidence;
- migration;
- complexity;
- privacy/storage consequence;
- failure mode.

Do not select a "best" by abstraction alone.

Recommend the smallest option that satisfies the actual flagship laws, with reasons.

---

# 20. A0-16 — Required Resolution States

Any proposed durable place mechanism must represent:

```text
EXACT
MOVED
CHANGED
SPLIT
MERGED
MISSING
AMBIGUOUS
HISTORICAL_ONLY
```

If the minimum v1 implementation cannot support all eight:

- say which can be supported;
- identify which must degrade to a coarser truthful state;
- never silently pretend exact resolution.

Example lawful v1 degradation:

```text
EXACT
CHANGED
AMBIGUOUS
MISSING/HISTORICAL_ONLY
```

if split/merge cannot yet be distinguished.

But say so explicitly.

---

# 21. A0-17 — Required Defeat Cases

The later implementation proposal must be able to falsify at least:

1. insertion above observation;
2. edit inside observation;
3. section reorder;
4. section rename;
5. passage deletion;
6. ambiguous duplicate text;
7. stale reading after edit;
8. stale proposal after edit;
9. reload/restart;
10. member observation retrieval;
11. wrong-Work isolation;
12. facet switch does not mint new observation;
13. reread does not overwrite historical reading;
14. Undo preserves mutation lineage.

Do not execute mutation in A0 unless an existing non-destructive fixture already covers it.

---

# 22. A0-18 — Seedable Beta Requirement

Propose how a future bounded beta-fixture act could reproducibly instantiate:

### Work A
ordinary current reading + observations

### Work B
reading at Vn + current Work Vn+1

### Work C
under-covered state

### Work D
read / zero admissible observations

### Work E
not read

A0 only specifies requirements.

Do not create fixtures.

---

# 23. A0-19 — Evidence Status

Every finding must be labeled:

```text
VERIFIED IN SOURCE
VERIFIED BY EXISTING TEST
INFERRED
UNKNOWN
```

Do not silently upgrade inference to fact.

If an existing test asserts behavior but implementation reading contradicts it:
> report CONFLICTING EVIDENCE.

---

# 24. A0-20 — Required Deliverable

Return one structured report:

## I. Exact repo standing
- branch;
- HEAD;
- canonical/base used;
- worktree cleanliness;
- no mutation attestation.

## II. Object census
table for all 17 objects.

## III. Address census

## IV. Version/read/freshness census

## V. Observation/member-observation census

## VI. Revision/history census

## VII. Resume/navigation census

## VIII. Persistence/privacy surfaces

## IX. Collision/duplication findings

## X. Minimum unlock set

## XI. At most 3 substrate options

## XII. Preferred minimum proposal
with exact reasons.

## XIII. Required migrations
or `NONE`.

## XIV. Privacy/retention implications

## XV. Falsifier plan

## XVI. Beta fixture implications

## XVII. Known unknowns

## XVIII. Exact next bounded act proposal

---

# 25. No-Write Attestation

End the report with:

```text
OBSERVATION-ADDRESS-01 / A0
READ-ONLY CENSUS COMPLETE

source changes: none
schema changes: none
migrations: none
dependencies: none
fixtures: none
production: untouched

implementation authority: NOT GRANTED
next act: founder adjudication required
```

If that statement cannot be truthfully made:
STOP and explain what changed before proceeding further.

---

# 26. Stop Conditions

STOP immediately if:

- repo HEAD/canonical assumption is stale and changes the census target;
- required canon is unavailable;
- answering requires schema write;
- answering requires production access/mutation;
- a destructive runtime test would be needed;
- persistence provider cannot be inspected without credentials not already authorized;
- a migration is discovered that would be required before safe implementation;
- privacy behavior is ambiguous enough that a product promise cannot be stated truthfully.

A STOP is a valid outcome.

---

# 27. What Success Looks Like

A0 succeeds when we can answer:

> **Here is what already exists.**
>
> **Here is what is missing.**
>
> **Here are the concepts currently duplicated.**
>
> **Here is the minimum durable-place substrate that unlocks the flagship.**
>
> **Here is what it would require to implement.**
>
> **Nothing was changed to learn that.**

---

# 28. Programme Principle

> **Inspect the substrate before inventing the substrate.**

And:

> **Persistence should be introduced only where it preserves authorship, provenance, truthful return, or reproducibility.**

