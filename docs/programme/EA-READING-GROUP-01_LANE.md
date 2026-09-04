# EA-READING-GROUP-01 — Elemental Alchemy Reading Group Instance

```text
LANE            EA-READING-GROUP-01
STATE           INSTANCE OPEN  ·  founder act 2026-09-04
AUTHORITY       instance / configuration only
TIMING          before Stage 7 closes — deliberately, not incidentally
NAMING RULING   docs/programme/READING-ROOM-01_NAMING_RULING_2026-09-04.md
CENSUS          docs/programme/EA-READING-GROUP-01_SUBSTRATE_CENSUS_2026-09-04.md
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

A `STOP` is not a failure of the lane. It is the lane producing its most valuable output: a
grounded requirement for the future capability, discovered by a real group instead of inferred.

Findings accumulate in the **Discovery Ledger** (§7) and are the lane's primary deliverable
alongside the group itself.

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

These are **open questions this instance exists to answer**, deliberately not decided in advance.
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
facilitation and belonging**. Those are not two values of one field. EA exists in part to
discover the actual difference before it is fossilized.

> Evidence note (census §3): `app/api/studio/groups` **already** encodes
> `group_type ∈ {cohort, ongoing, program, category}`. That enum is a pre-made answer to this
> lane's open question. Adopting it would import the fossilization the ruling forbids — one of
> several reasons the census rules Circles, not `client_groups`, as this instance's substrate.

## 8. Owed before real readers

- **Andrea agreement** — plain-language written understanding of role, contribution, and what may
  later be generalized (`READING-ROOM-01` §7). Not retroactive.
- **Co-Lab release gate** — `verify-colab-boundaries.ts` at `31 passed · 0 failed · 0 warned` in
  production. Triggered by invitations/roles, sessions, sharing and memory atoms.
- **Kelly's role recorded** — author, host, participant, or absent (C6).

## 9. Closure

This lane does not close by shipping a feature. It closes when the founder judges that the
running group has produced enough grounded evidence to state generic Reading Room requirements —
at which point `READING-ROOM-01` becomes proposable, and this lane's Discovery Ledger is its
input.

An instance that runs well and produces no findings has failed at half its job.

## 10. Live state

```text
STATE            INSTANCE OPEN
SUBSTRATE        ruled — see census §5
CONFIGURATION    not begun
GROUP RUNNING    no
DISCOVERY LEDGER empty
ANDREA AGREEMENT not established
CO-LAB GATE      not run for this lane
```

> **Board note.** This lane is deliberately **not** written into
> `WRITERS_STUDIO_PROGRAMME_BOARD.md`. That board is the Writer's Studio live cockpit; recording a
> non-Studio instance lane there would imply Studio ownership and a competing build slot, both of
> which this ruling denies. This section is this lane's own live state.
