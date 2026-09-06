# WS2-07 · BUILD-07F — DEVELOPMENTAL DECISIONS · standing census

> **BUILD-07F is OPEN (founder act, 2026-09-05). This is its FIRST act: a read-only census of
> existing standing / disposition / decision primitives. It designs nothing and builds nothing.
> No runtime bytes.**

```text
UNIT             BUILD-07F  DEVELOPMENTAL DECISIONS
STATE            OPEN — census only; design NOT authorised by this document
CANONICAL        cff8123bc
PRIOR UNIT       BUILD-07E CLOSED / ACCEPTED at 6ff0beafc
```

The question 07F answers:

> Can the writer change their own standing toward something MAIA noticed, without changing what
> MAIA originally observed?

## 0 · The census verdict, first

```text
DOES 07F EXTEND AN EXISTING SPINE?

  ADDRESSING        YES — reuse the 07E anchor `{ on: 'observation', readingId,
                    observationKey }`. It is already the ratified address of an
                    observation (DECIDE INV-2) and already has a coherence rule.

  PERSISTENCE       NO — nothing in the tree stores a member's standing toward an
                    observation, and the nearest structures are the wrong shape.
                    `ask_threads` is an append-only CONVERSATION; a standing is a
                    mutable STANCE. Storing one in the other would either make
                    standing append-only or make the thread mutable.

  VOCABULARY        PARTLY — `concern` already exists, dormant, in `AskAnchor`, and it
                    is NOT the same concept (§3).

  PDC-1             NO. Shares the word "disposition" and nothing else (§2).
```

So: **one new durable object, addressed the way 07E already addresses observations.** That is the
smallest extension the question admits, and the census's job was to establish it rather than
assume it.

## 1 · What was searched

Beyond `standing`: decision · verdict · status · resolution · `resolved_at` · disposition ·
accepted · dismissed · keep · reject · concern · participation disposition · observation
decisions · any per-member judgment attached to a frozen object. Migrations, `lib/`, `app/`.

**Nothing in the tree is keyed on an observation.** No table, no service, no route. The only
thing that addresses `(readingId, observationKey)` at all is `ask_threads.anchor`, as jsonb,
added by 07E.

Twelve decision-shaped migrations exist and all belong to other domains — Co-Lab team decisions,
field decisions, SMS delivery status, bug reports, portal status, attention items. None concerns a
member's stance toward something an intelligence noticed about their own work.

## 2 · PDC-1 is not the spine — and the distinction is the point

`lib/maia/canonical-turn/participationDisposition.ts` (`pdc-1`, CMT-01) adjudicates whether a
**memory candidate may participate in one MAIA turn**. Read against 07F:

```text
                  PDC-1 disposition            07F standing
OBJECT            a memory candidate           a frozen developmental observation
DECIDED BY        the system, adjudicating     the writer
LIFETIME          one turn                     durable
PERSISTENCE       "no persistence implied"     the whole point
CHANGES           nothing the member holds     the writer's own relation
```

Its own header is explicit: *"HELD ≠ EXCLUDED … Ephemeral; no persistence implied; no gain in
authority; a later turn may reconsider."* That is a machine's momentary ruling about its own
inputs. 07F is a person's durable stance about their own work.

⛔ **Do not reuse `ParticipationClass`, `Authority`, or the reason families.** They are a
constitution for what MAIA may think with. Borrowing them would import a system-authority
vocabulary into a member act — precisely the direction the Constitutional Direction of Authority
forbids.

## 3 · `concern` — dormant, adjacent, and NOT standing

`AskAnchor` has carried `{ on: 'concern'; sectionIds; unitId? }` since WS2-05B-8B-02c-2. It is
declared, has a coherence rule that degrades rather than refuses, and has reader copy: *"The
author has brought you something THEY see, not something you raised. Help them think it through;
do not redirect to your own reading."* It is **not parseable at the HTTP boundary** and reachable
from no surface.

It is the writer raising something **of their own**. 07F is the writer taking a position on
something **MAIA raised**. Opposite directions of origin; the same author. Worth knowing it is
there — and worth not conflating, because "the writer's concern" and "the writer's standing
toward an observation" would collapse into one table very easily and should not.

## 4 · The real prior art: `member_memory_atoms`

This is the codebase's existing model for a member's standing toward a stored thing, and 07F
should be read against it rather than against the decision tables.

```text
is_breakthrough       BOOLEAN NOT NULL DEFAULT FALSE
                      "The system NEVER auto-sets is_breakthrough."
                      A member mark, and only a member mark.

return_preference     TEXT NOT NULL DEFAULT 'member_pulled'
                      CHECK IN (member_pulled | contextual_doorway | ritual_review_opt_in)
                      The member's standing toward how material returns to them.
                      Its default was changed once, by governed act
                      (20260523000001), not by drift.
```

**What to carry:** an enumerated standing with a database CHECK, a default that is a decision
rather than an accident, and the discipline that the system never sets a member's mark.

⚠️ **What NOT to carry.** The atoms model also has `surface_count` and a Phase-2 rule by which
*"after decline-twice, `return_preference` auto-reverts to `member_pulled`"* — the **system**
changing a **member's** standing. Whatever its merits for surfacing cadence, that pattern is
forbidden in 07F: a standing the system can revert is not the writer's standing. This is the most
important negative finding in the census, because it is the one a careful implementer would copy
in good faith.

## 5 · The identity triple — right invariant, and not for the obvious reason

The founder fixed the identity as `(memberId, readingId, observationKey)`. The census establishes
something that must be recorded honestly:

```text
member_manuscripts        no team, studio, share or visibility column
developmental_readings    member_id NOT NULL — "The member whose evidence was
                          captured. Scopes every read."
```

**Today, `readingId` already implies exactly one member.** A manuscript belongs to one member; a
reading of it belongs to one member; every read is scoped by `member_id` in the SQL. So the
`memberId` component is, at this moment, **redundant for correctness**.

That is not an argument against it. It is the argument *for* it, stated accurately:

> Deriving standing ownership from the reading would make correctness depend on a fact that may
> change. Storing the member explicitly makes it depend on nothing.

Co-Lab already scopes people, DMs, sessions, files and memory atoms. Manuscripts are outside that
today. The day any sharing reaches a Work — a co-writer, a coach, a practitioner reading a
member's manuscript — a standing derived from `readingId` silently becomes *the observation's*
standing rather than *a reader's*, and one person's dismissal would be read as the other's. The
triple prevents a defect that does not exist yet, which is the only cheap time to prevent it.

**Census recommendation:** store all three, and write the reason in the migration, so a later
reader does not "simplify" the redundancy away.

## 6 · What the invariants imply for the eventual design

Not a design. The shape the fixed invariants already rule in or out:

```text
UNSET IS A STATE, NOT AN ABSENCE
  The four values are keep · dismiss · unresolved · investigate, and `unset` is none of
  them. A nullable column defaulting to NULL would represent it, but a row that does not
  exist represents it too — and those are different claims about whether the writer has
  ever considered the observation. 07E's `unmeasured` doctrine applies verbatim: a surface
  that cannot say "no standing has been taken" will say one of the four.

STANDING IS MUTABLE; ITS HISTORY MAY NOT BE REWRITTEN
  A standing changes — that is the capability. Whether prior standings are retained is a
  founder question, not an implementation default. Note the asymmetry with everything else
  in Stage 7: readings are frozen, threads are append-only, evidence is digest-verified.
  07F introduces the FIRST mutable member-owned object in this lane, and that is exactly why
  the mutation boundary in §7 has to hold at the database, not in a service.

ONE STANDING PER (member, reading, observation)
  A unique constraint, not a convention — otherwise "the writer's standing" is a query with
  an ordering, and an ordering is a silent rule about which one counts.

THE OBSERVATION MUST REMAIN UNREADABLE-AS-JUDGED
  A reading rendered with standings mixed into it would let a dismissal read as MAIA having
  withdrawn the observation. What she noticed does not change because the writer disagreed.
```

## 7 · The mutation boundary, restated as the census found it

```text
standing may change
frozen observation may NOT           — enforced today by a DB trigger on developmental_readings
reading may NOT                      — same trigger
another member's standing may NOT    — nothing enforces this yet; it does not exist yet
```

The third line is the new one, and it is the one with no existing enforcement to inherit.

## 8 · Open questions for the founder — not decided here

```text
Q1  Is a standing's HISTORY kept? Stage 7 is append-only everywhere else; a mutable row
    with no history would be the lane's first place where a member's earlier position is
    silently lost. "The writer changed their mind" may be worth keeping, or may be
    surveillance of their own thinking. This is a sovereignty question, not a schema one.

Q2  Does a standing survive its observation being SUPERSEDED? 07E ruled that a superseded
    observation still opens a thread, as superseded. The analogue — a `keep` on an
    observation whose evidence has since moved — is not settled by that ruling.

Q3  Does MAIA SEE the writer's standing? A dialogue where she knows the writer dismissed
    the observation is a different relationship from one where she does not. Either answer
    is defensible; neither should be arrived at by whichever is easier to wire.

Q4  Are the four values final for v1, and are they mutually exclusive? `unresolved` and
    `investigate` are close enough that a writer may not distinguish them; that may be
    fine, or may mean three.
```

## 9 · What this census does not do

```text
no design · no schema · no route · no surface · no types
no authorisation to build — the founder's sequence is census → adjudicate → then design
no opening of 07G or 07H
nothing absorbed from the parked ledger
```
