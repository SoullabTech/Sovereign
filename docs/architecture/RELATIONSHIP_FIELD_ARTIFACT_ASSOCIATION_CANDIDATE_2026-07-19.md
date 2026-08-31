# Relationship Field ⇄ Artifact Association — Candidate Direction

**Status: CANDIDATE — preserved direction (Cat 1). This document does not authorize build.**
**Source: Kelly, 2026-07-19, immediately following the session-label fix (PR #662).**
**Gate to lift: Kelly directive after a sitting; reconciliation with the Session Room Threshold spec (Step 2) and the relationship-memory work is prerequisite to any spec.**

---

## Where this came from

PR #662 gave a witness session a human-recognizable, member-authored label —
*"Witness session — with Cece"* — stored verbatim, owned by the practitioner,
removable, absent by default, and non-authoritative. Kelly's ruling on why that
implementation is sound is recorded below because it is the constitutional
floor for everything in this document:

> It helps recognition without manufacturing identity.
>
> The label is: member-authored · stored exactly as entered · owned by the
> practitioner who owns the session · removable · absent by default ·
> non-authoritative.
>
> This is a small but strong example of the architecture learning the
> difference between **helping someone recognize an experience** and
> **claiming to know who participated in it**. The first is hospitality.
> The second would be epistemic overreach.

#662 is therefore an **interim recognition affordance**. It solves recognition.
It does not solve the underlying relationship problem — and it was correct not
to try.

## The underlying problem

When a member brings material into the system (transcript, recording, note,
document), the people involved may be: an existing client, a colleague, a
collaborator, a team member, a friend or family member, a prospective client,
or someone not yet represented anywhere in the system.

So the durable solution is not "add a label to the session." It is:

> **Let the member identify the people connected to the material and add them
> to their relationship field.**

## The direction (Kelly's words, lightly structured)

### Flow

After an upload (or on a labeled session), MAIA may ask: **"Who was part of
this?"** — then offer exactly three moves:

1. Choose an existing person.
2. Add a new person.
3. **Leave unidentified for now** — a first-class, permanently acceptable
   answer, not a nag target.

When adding someone, the member chooses the relationship context: Client ·
Colleague · Collaborator · Team · Friend · Family · Mentor · Practitioner ·
Other.

### One directory, not parallel lists

These contexts should **not** become separate lists unless there is a strong
practical reason. A person may be both a colleague and a friend, a client and
a collaborator, a team member who later becomes a partner. The durable model:

> **One People / Relationships directory, with roles and contexts attached.**

### What the system stores per artifact

```text
Artifact
- transcript / recording / note / document
- uploaded by member
- people connected to it
- relationship roles
- member-authored session label
- attribution status
- consent and visibility status
```

This separates things that must never be confused:

| Layer | Question it answers | Authority |
|---|---|---|
| Member-authored association | Who does the member say was present? | Member's word, verbatim |
| Verified attribution | Who can the system actually attribute speech to? | Evidence only (speaker screen, Step 2) |
| Consent / visibility | Who has consented to storage or sharing? | Explicit consent acts |
| Relationship role | How does this person relate to the member? | Member-chosen context |

> Adding "Cece" to a relationship list does not prove that Speaker 2 was Cece.
> It simply says the member associates Cece with the session. **That epistemic
> distinction should remain explicit** — in the schema, in the UI, and in what
> MAIA is allowed to say.

### The label as doorway, not dead end

The `summary.clientLabel` field from #662 becomes the first step toward
linking, never auto-resolved:

```
With Cece
Not yet linked to a person
[Link to existing person]  [Create Cece]
```

Once linked:

```
With Cece
Colleague
[View relationship]
```

The simple interaction is preserved; the system becomes structurally coherent
over time — by member acts, one at a time.

### The broader principle

Uploaded materials should not live as isolated files. They belong within a
field of people, relationships, sessions, projects, teams, and developmental
history:

> Every transcript, recording, and session may be connected to one or more
> people in the member's relationship field — even when those people were not
> previously in the system — **while explicitly retaining the distinction
> between member-authored association and verified attribution.**

## Constitutional constraints (carried forward, not new)

- **No auto-creation, no auto-linking.** Association is always a member act.
  Extends unassigned-first (#660) and the Parent Update no-synthetic-rl_session
  ruling.
- **Recognition precedes identification** — show the material before asking
  anyone to name or categorize it (standing feedback, from #645).
- **Invariant 14** — the member's words for their relationships ("client,"
  "friend," "mentor") are preserved, never translated into system vocabulary.
- **Consent for third parties** — the threshold spec's consent/provenance
  screen (minors, sensitive third parties) gates before any person-linking on
  imported material, not after.
- **MAIA never asks twice.** "Leave unidentified" is remembered, not re-litigated.

## Reconciliation map (prerequisite reading for any future spec)

| Existing asset | Relationship to this direction |
|---|---|
| `SESSION_ROOM_THRESHOLD_2026-07-19.md` Step 2 (on #661) | Speaker-confirmation screen = the *verified attribution* layer; this candidate adds the *association* layer beside it, never merged with it |
| `practitioner_clients` (+ identity encryption, emergency info, invites migrations) | Existing client-typed directory — the likely seed of the unified directory; "Client" becomes one role among several, not the container |
| `feat/relationship-memory-phase1-attach` (branch) | Prior attach-people-to-memory work; reconcile before designing schema |
| `feat/relationship-roles-additive` (branch) | Prior additive-roles work; same |
| PR #662 `summary.clientLabel` | The doorway field; untouched until this candidate is lifted |
| Personal / Contribution Field candidate (ADR-010 family) | The "relationship field" named here must land inside that architecture, not beside it |

## What this document is not

Not a spec. Not a schema. Not a build authorization. It preserves the
direction and its constitutional perimeter so that when the sitting takes it
up, the starting point is Kelly's articulation rather than a reconstruction.
