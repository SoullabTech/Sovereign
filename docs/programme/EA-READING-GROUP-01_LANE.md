# EA-READING-GROUP-01 — Elemental Alchemy Reading Group Instance

```text
LANE            EA-READING-GROUP-01
STATE           INSTANCE OPEN  ·  founder act 2026-09-04
AUTHORITY       instance / configuration only
TIMING          before Stage 7 closes — deliberately, not incidentally
NAMING RULING   docs/programme/READING-ROOM-01_NAMING_RULING_2026-09-04.md
CENSUS          docs/programme/EA-READING-GROUP-01_SUBSTRATE_CENSUS_2026-09-04.md
CONFIGURATION   docs/programme/EA-READING-GROUP-01_CONFIGURATION_DECISION_2026-09-04.md
WRITER'S STUDIO unaffected — BUILD-07B remains the only open Studio unit
```

> **What this lane is, in the only words that are accurate:**
>
> **The first Reading Group instance running on existing Soullab substrate.**
>
> ⛔ It is **not** a "prototype Reading Room." That phrase is forbidden in this lane. It subtly
> authorizes approximating a future capability; the accurate phrase tells the session exactly
> what not to invent.

---

## 1. The founder ruling (2026-09-04)

> `EA-READING-GROUP-01` opens now, on existing substrate, before Stage 7 closes.
>
> The product instance does not have to wait for the product abstraction.

Elemental Alchemy already exists as a Work. The membership/group substrate already exists. The
reader, practice, journal and reflection surfaces already exist. Andrea can host a real human
reading experience using those existing capabilities.

Waiting for Stages 7–14 would create the wrong dependency: it would make a **specific human use of
existing infrastructure** wait on a **future generalized authoring capability**. That is backwards.

What must wait is the act of saying *"we have learned enough from this first instance to encode
Reading Room as a reusable platform capability."*

## 2. Direction of dependency — binding

```text
EA-READING-GROUP-01 experience → evidence → generic requirements → Stage 15 Reading Room capability
```

**not**

```text
Stage 15 Reading Room capability → permission for Andrea and readers to begin
```

This is how Elemental Alchemy teaches the architecture without becoming the architecture.

## 3. Authority — what this lane may do

May **configure existing things**:

- Elemental Alchemy as the Work, and a selected reading sequence through it
- existing group/circle membership, invitation, consent and sharing
- Andrea as a **typed human host**
- existing member-facing reading / practice / reflection surfaces
- ordinary group participation

## 4. Not authorized by this lane

- `Reading Room` (the platform capability)
- `Reading Group Template` (the generic configuration layer)
- a Writer's Studio reading-group feature
- another group / community primitive
- Stage 15 authoring integration
- any Writer's Studio `BUILD-07C`–`07H` work

Those remain downstream. This lane does not compete for the Stage 7 build slot.

## 5. The hard boundary — finding classification

⛔ **The instance may not repair awkwardness by inventing generic infrastructure.** Every gap
encountered is classified before anything is written:

| Finding | What happens |
|---|---|
| Existing capability, needs configuration | **Use it** |
| Small instance-specific content / config | **Allowed in this lane** |
| Missing generic Reading Room behavior | **Record** for the future template / capability |
| Requires a new group primitive | **STOP** |
| Requires a Writer's Studio architecture change | **STOP** |
| Requires cross-member MAIA synthesis | **FORBIDDEN** |
| Requires Andrea-derived material to become generic | **Provenance / licensing decision first** |

### 5a. Feedback is not facilitation material

Binding on how findings are classified, recorded 2026-09-04 before any extraction is contemplated:

> **A host's feedback about what the platform needs is not the same thing as that host's
> facilitation material.**
>
> *"I need to be able to see which chapter we're discussing"* is a **product requirement** Soullab
> may learn from. A three-part inquiry sequence Andrea devises for Chapter 4 is **her material**,
> and does not become part of a reusable template merely because it revealed a useful pattern.

The last row of the table above turns on this distinction. When a finding is derived from observing
a host at work, classify which of the two it is **before** recording it in the Discovery Ledger.
Where it is genuinely both, or unclear, it is treated as material: ambiguous provenance does not
generalize (`READING-ROOM-01` §7).

A `STOP` is not a failure of the lane. It is the lane producing its most valuable output: a
grounded requirement for the future capability, discovered by a real group instead of inferred.

Findings accumulate in the **Discovery Ledger** (§7). They are what *the lane* carries forward;
they are not what the group is for (§7).

## 6. Constitutional constraints — inherited, binding

From `READING-ROOM-01_NAMING_RULING_2026-09-04.md` §4, unchanged:

- **C1** The group is Developmental Ecology, not a rung. Authority moves upward only, through the
  member's own authored experience. The group may not manufacture meaning about a member.
- **C2** MAIA does not host, facilitate, or synthesize across members. Andrea hosts; the host role
  is typed human. No aggregate reading of the group is produced, ever.
- **C3** Reflection is default-private; sharing is a member act, never a host setting or a flag.
- **C4** The host cannot read what a member has not shared.
- **C5** No progress obligation; no attendance or keeping-up signal shown back to the member.
- **C6** The author of the Work may be absent from a room opened on it. Kelly's role in this
  instance is recorded explicitly.

## 7. Discovery questions — first-order, not settings

⛔ **The group does not exist as research for Soullab.** It exists for Andrea and the readers to
engage the Work. These are questions Soullab is deliberately **not deciding in advance**; the
group's ordinary life may nevertheless teach us the answers. Framing them as the group's purpose
instrumentalizes the people in it, and that framing is forbidden in this lane's language, internal
and external alike.

Recording an answer requires observed evidence from the running group, attributed to what was
observed — never to what the architecture expected.

1. What does a human host actually need?
2. What do participants expect to be **private** versus **shared**?
3. What cadence feels supportive, and where does it turn coercive?
4. Do people move through the Work synchronously at all?
5. Where does discussion naturally want to live?
6. Do practices belong to the **Work** or to the **gathering**?
7. What do people want MAIA involved in — and what feels invasive?
8. What should persist when someone disappears for three weeks and comes back?

### 7a. The club / cohort question — held open on purpose

⛔ **Do not collapse this into a `group_type` enum.** Not yet, and not in this lane.

```text
COHORT   temporal geometry    we begin → travel together → reach something → conclude
CLUB     relational geometry  this place persists → people enter and leave →
                              the Work remains available → participation waxes and wanes
```

They generate **different expectations around absence, progress, notification, memory,
facilitation and belonging**. Those are not two values of one field. The difference is one Soullab
does not yet know, and will not resolve in advance of seeing how a real group actually lives.

> Evidence note (census §3): `app/api/studio/groups` **already** encodes
> `group_type ∈ {cohort, ongoing, program, category}`. That enum is a pre-made answer to this
> lane's open question. Adopting it would import the fossilization the ruling forbids — one of
> several reasons the census rules Circles, not `client_groups`, as this instance's substrate.

## 8. Owed before real readers

- **Andrea agreement** — plain-language written understanding of role, contribution, time and
  compensation, how either party stops, and what may later be generalized (`READING-ROOM-01` §7).
  Not retroactive. Draft v0 exists and is **NOT AGREED**
  (`EA-READING-GROUP-01_ANDREA_UNDERSTANDING_DRAFT_v0.md`). **v1 records Andrea's own terms — she
  has genuine authorship over them, not merely assent — and v1 is the gate**, not the draft.
- **Co-Lab release gate** — `verify-colab-boundaries.ts` at `31 passed · 0 failed · 0 warned` in
  production. Triggered by invitations/roles, sessions, sharing and memory atoms.
- **Kelly's role recorded** — author, host, participant, or absent (C6).

## 9. Closure

This lane does not close by shipping a feature. It closes when the founder judges that enough
grounded evidence has accumulated to state generic Reading Room requirements — at which point
`READING-ROOM-01` becomes proposable, and this lane's Discovery Ledger is its input.

If the group runs well and Soullab learns little from it, **the lane** has underperformed — the
group has not. A group that serves its readers and teaches us nothing has still done the only
thing it exists to do.

## 10. Live state

```text
STATE            INSTANCE OPEN
SUBSTRATE        RULED — Circles; client_groups excluded (census §2, founder 2026-09-04)
CONFIGURATION    DECIDED — A · B · C · D · E complete
                 C6: Kelly is author/steward, facilitator DECLINED (founder 2026-09-04)
CREATED          nothing — no circle, memberships, invitations, routes or migrations
GROUP RUNNING    no
DISCOVERY LEDGER empty
ANDREA AGREEMENT not established        ← hard gate before any real reader
                 draft v0 written, NOT AGREED:
                 EA-READING-GROUP-01_ANDREA_UNDERSTANDING_DRAFT_v0.md
CO-LAB GATE      not run for this lane  ← hard gate before any real reader
```

> **Board note.** This lane is deliberately **not** written into
> `WRITERS_STUDIO_PROGRAMME_BOARD.md`. That board is the Writer's Studio live cockpit; recording a
> non-Studio instance lane there would imply Studio ownership and a competing build slot, both of
> which this ruling denies. This section is this lane's own live state.
