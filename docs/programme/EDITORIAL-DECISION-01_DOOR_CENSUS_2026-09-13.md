# EDITORIAL-DECISION-01 — door census

**Lane** Writer's Studio · editorial continuity
**Status** READ-ONLY CENSUS · nothing built · nothing authorized by this document
**Law** *Before inventing something, find out whether Soullab already built 80% of it somewhere else.*

---

## 1. ⭐⭐ THE 80% EXISTS, and it is closer than expected

`developmental_observation_standing_events` — migration `20260906000001`.

```sql
member_id · reading_id · observation_key · event_index · standing · recorded_at
UNIQUE (member_id, reading_id, observation_key, event_index)
CREATE FUNCTION dose_no_update()   -- UPDATE is refused by trigger
```

What it already is:

- **Append-only, enforced** — a trigger refuses UPDATE. Not a convention.
- **Member-authored** — the row is a member act, not a system inference.
- **Per-observation** — keyed exactly where an editorial decision belongs.
- **Superseded by the successor** — `event_index` ascends; the current standing is
  the highest index. ⭐ **This is the Authority × Time shape already implemented**:
  succession carried BY the successor, `superseded_by` derived and never stored.
- **Optimistically concurrent** — `expectedCurrentEventId` on write; `appended`
  vs `unchanged` are distinguished, and a 409 is returned to the writer rather
  than retried, *because retrying would make machine scheduling the ordering
  authority over two member acts.*
- **UNKNOWN ≠ UNSET, rigorously** (`observationStanding.ts`):
  *"A failed lookup rendered as UNSET would tell a writer they have never ruled
  on something they may have ruled on, and would then let them overwrite that
  ruling from a state they never saw."*

⛔ **Do not build a second decision store beside this.** Whatever
EDITORIAL-DECISION-01 becomes, this is the substrate it should extend or mirror,
and these five properties are already paid for.

## 2. THE GAP — a standing is a verdict; a decision has content

```text
Standing = 'keep' | 'dismiss' | 'unresolved'
```

That is a **disposition toward an observation**. It cannot carry:

> *The campfire is phenomenological first. Recurrence stays; each return must
> advance its function — lived scene → interpretation → presence → sustaining →
> embers. Remove only language that repeats without advancing that progression.*

An editorial decision has **authored content, a craft principle, and a scope**.
A standing has a verdict and nothing else. So the gap is real, and it is
narrower than "build a decision system": it is *what a member-authored
decision's body is, and how it relates to the standing that already exists.*

⚠️ **Open question for the founder, not decided here:** does an editorial
decision EXTEND the standing chain (a richer event on the same spine) or sit
beside it (a second append-only chain that references it)? Both are defensible;
they differ in whether "I decided how to handle this" and "I decided to keep
this" are one act or two.

## 3. ⛔ THE "COMMONS" TRAP, THIRD INSTANCE — seven tables named `decision`, none of them this

| table | what it actually is |
|---|---|
| `maia_decisions` (`decision_trace_clean`) | one row **per assistant reply** — orchestrator candidates and votes. Runtime telemetry. |
| `studio_decisions` | a **consultant's** tool: *"a moment where a leader faces a choice"*, runs the AIN council, prepares questions for a leader. |
| `decision_chain` | **life decisions** with parent/child spawning — *"Should I leave my job?" → "How do I negotiate the exit?"* |
| `decision_iterations` · `decision_experiences` | the same consultant lane's sub-records |
| `field_decisions` | Field lane |
| `colab_decision_task_provenance` | Co-Lab task provenance |

⛔ **None of these is an editorial decision about a manuscript.** Reusing any
would import another product's semantics wholesale — exactly the I0 finding
where *"Commons" denoted three different existing things and none matched the
ratified definition*, and where reuse *"would import a status economy on day
one."* **Third instance of that pattern in this codebase.** The name collision
is not evidence of a door; it is evidence that the word is overloaded.

## 4. The two relation types — one exists, one does not

```text
STRUCTURAL   observation ↔ section · automatic · digest-driven
             EXISTS: lib/manuscript/development/resolve.ts + readState digests
             + locateCurrent's three-state answer. This is the edge that must
             fire automatically when the Work changes, and it is already built.

EDITORIAL    decision → observation · decision → later decision
             authored or explicitly confirmed · NEVER inferred into authority
             NO SUBSTRATE ANYWHERE. Nothing in the repository expresses
             "this ruling governs how that observation is read."
```

⛔ Keep them apart in the schema, not only in the prose. o1 and o22 share **no**
sections: derived from overlap alone the edge is missed; derived from judgment
alone the edges are invented.

## 5. Authority × Time — a document, not an implementation

`docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md`
exists and is the right decomposition. But `supersedes` appears in code only in
unrelated places (`houseDestinations`, `soulPortrait`, `pfiMindEntrypoint`).

⭐ **The standing event chain in §1 is the only working implementation of that
doctrine in the codebase**, and it was built without reference to it. That is
worth knowing before anyone writes a framework: the pattern has already proven
itself once, in the exact domain this lane serves.

## 6. What the census concludes

```text
FOUND          append-only member-authored per-observation event chain
               with successor-carried supersession and UNKNOWN ≠ UNSET
               → EXTEND OR MIRROR. Do not rebuild.

FOUND          the structural relation, automatic and digest-driven
               → REUSE AS IS.

MISSING        an authored decision BODY — principle, scope, craft ruling
MISSING        the editorial relation between decisions and observations

TRAP           seven tables named `decision`, none of them editorial.
               ⛔ Reuse imports another product's semantics.
```

⛔ **Nothing is built and nothing is designed by this document.** The two open
questions — whether a decision extends or parallels the standing chain, and what
an authored decision body contains — are founder rulings, not census findings.
