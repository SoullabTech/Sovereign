# Now What? — Larry Pilot Test Plan

```text
Status: DRAFT — NOT RULED
Purpose: Frozen pilot definition — the target implementation builds against
Implementation authorization: none
Deployment authorization: none
Pilot execution authorization: none
Supersession authority: none
```

**Authored by:** Kelly (founder), 2026-08-03. **Recorded by:** Claude.
⛔ Not ratified, **not frozen**. A pilot definition that is not frozen is not a target.

---

## 0. Flags

### 0.1 ⚠️ Three names were proposed for what may be one artifact

`NOW_WHAT_LARRY_PILOT_V1` · `NOW_WHAT_CLIENT_HOME_PILOT_V1_TEST.md` ·
`NOW_WHAT_LARRY_PILOT_TEST_PLAN_2026-08-03.md`

**One artifact was created**, under the third name, because creating three would reproduce
the collision this message is about. ⛔ **Which name governs is unruled.**

### 0.2 ⚠️⚠️ Deployment is gated, and the gates are unchanged

This plan describes a test deployment. **Nothing here authorizes one.** Standing gates:

- **Phase 1 is failed at W8**; no new implementation lane opens until Phase 1 is a finished
  release object.
- The **Now What? Client Home lane is design-through-Phase-1, not implemented.**
- The absent **`coach_*` tables are a protected boundary** — gate `1d` asserts their absence.
  A build creating them trips a control placed deliberately.
- The **Larry IP one-pager gates activation.**
- **Correction 3 ratification is unissued**; its acceptance path is not yet governed.

⭐ *The system does not outrun the evidence.* That principle applies to this document.

---

## 1. The governing artifact chain

```text
AIN OS Constitution          — what must remain true
        ↓
Now What? Design Principles  — how those truths become experience
        ↓
Experience Architecture      — how the user encounters it
        ↓
Larry Pilot Walk             — whether a human actually understands it
        ↓
Implementation
        ↓
Testing
```

⭐⭐⭐ **No one artifact competes with another.** Each answers a different question.

⚠️ *Now What? Design Principles* has no canonical artifact yet — the chain names a link that
does not exist.

⭐⭐⭐ **A missing link is evidence of a gap, not permission to invent the link.** ⛔ Do not
fill it merely because the chain wants one.

⚠️ **A second referent is present but not durable:** the Nav/Arrival Design Specification
exists only as an untracked working file. The chain is therefore visible with one link
*absent* and one link *non-durable* — different problems, recorded separately.

## 2. The two Larry surfaces — proposed relationship

| Artifact | Role | Asks |
|---|---|---|
| `NOW_WHAT_PRACTICE_WORKSPACE_LARRY_WALK_01` (#929) | **Acceptance test** | Can Larry experience the platform correctly? |
| `NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE` | **Design specification** | Can the environment orient a human correctly? |
| **this document** | **Evidence-gathering instrument** | What did a real human actually do and understand? |

⛔⛔ **Related but not interchangeable.** The common failure to refuse:

> *"The pilot worked, therefore the design is accepted."*

That collapses **evidence into authorization** — the same collapse as *merged = accepted* and
*a finding = an authority*, one layer over.

```text
Experience Architecture  →  Larry Pilot Walk  →  Evidence
```

⭐⭐⭐ **They are not competing — they are two layers.** The design does not prove itself.
**Larry's confusion, hesitation, and questions become the evidence.**

⛔ Proposed, **not ruled**.

## 3. What is being tested

Not *"is the whole platform finished?"* but:

> **Can Larry and a real client understand and use the first expression of AIN OS
> principles?**

1. Does this feel familiar enough for a CEO/practitioner?
2. Does the navigation make sense without explanation?
3. Does the client feel accompanied rather than managed?
4. Do the trust boundaries feel natural rather than restrictive?

## 4. The test surface

### Larry — home

```text
Now What?

Clients

Senja
Leadership Transition

Current shared work
Upcoming session
Recent shared notes
```

### Client — home

```text
Your work with Larry

Leadership Transition

Continue your work

What you are carrying
Shared with Larry
Next conversation
```

### Navigation shells

```text
Practice                 My Work
│                        │
├── Clients              ├── Continue
├── Programs             ├── Reflections
├── Sessions             ├── Shared Items
├── Resources            └── Sessions
└── Timeline
```

⭐ **The philosophy is underneath. The interface is familiar.** Do not expose the deeper
architecture yet.

## 5. What is intentionally absent

⭐⭐ **Absence is the design, not a shortfall.** Not in the test build:

- encrypted coach notes
- full practitioner intelligence
- MAIA reflection engine
- analytics
- scores, progress metrics, inferred patterns, AI interpretations

## 6. Test data scenario

One relationship: **Larry ↔ Senja.**

| Visible to both | Client only |
|---|---|
| program | personal reflection |
| stage | selected focus |
| shared material | |

**Then verify Larry does not see:** private reflection · private focus · activity indicators.

⭐⭐⭐ **This is the AIN OS difference, and it is the most important test in the pilot.** It
is a *boundary* test, not a feature test — **it passes by what fails to appear.**

### The absence tests

A normal product demo asks: *does the feature appear? · does the flow work? · does the user
like it?* This architecture requires three more:

1. **What information appears that should not?**
2. **What relationship is silently changed?**
3. **What ownership boundary disappeared?**

⚠️⚠️ **These are harder because success looks like nothing happening** — and because the
failure is not a visible bug, it is a **relationship violation**:

```text
✅  Client reflects privately
        ↓
    MAIA supports reflection
        ↓
    Larry supports the coaching relationship

⛔  Client reflects privately
        ↓
    System extracts insight
        ↓
    Coach receives hidden intelligence
```

Nothing in the second path throws an error. Every screen renders. That is why it must be
tested for directly rather than noticed.

⚠️ Fixture discipline applies: baseline recorded **before** any mutation; the relationship
built through real member paths, not direct insert; restoration to baseline is a closing
obligation.

## 7. Deployment sequence

```text
Freeze this pilot definition
     ↓
Build only the test surface   (navigation · home · relationship context · shared/private)
     ↓
Deploy to staging/beta        (Larry account · one client account · controlled data)
     ↓
Run the walk
     ↓
Revise
```

⛔ Each arrow is a separate authorization. None is granted by this document.

## 8. The acceptance question

The test is **not** *"did Larry click the buttons?"*

| Who | Passes when they can say |
|---|---|
| **Larry** | *Do I understand where I am and what I can do?* |
| **Client** | *Do I feel this belongs to me?* |

| Criterion | What would count as passing |
|---|---|
| Larry orientation without explanation | *(unauthored)* |
| Client sense of ownership | *(unauthored)* |
| Boundary holds — private material never surfaces to Larry | *(unauthored)* |
| Trust boundaries feel natural, not restrictive | *(unauthored)* |
| Return without friction | *(unauthored)* |

⛔ **Criteria unauthored.** The questions are the founder's; what counts as a passing answer
is not yet written, and authoring it before the walk is the founder's act.

## 9. Ratification and freeze

⬜ **Not ratified. Not frozen.**

| Field | Value |
|---|---|
| Ratified by | |
| Date | |
| Sections in force | |
| Artifact name ruled (§0.1) | |
| Two-surface relationship ruled (§2) | |

*Unfilled means unruled. Implementation must build against a **frozen** target — this one is
not yet frozen, and building against it now would reproduce the design-while-building pattern
it exists to prevent.*
