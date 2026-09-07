# SALON — INVOKE DESIGN THREAD v0.1

**Lane** `JARVIS-CIRCLES-01` · `CIRCLE-05 · INVOKE`
**Date** 2026-09-07
**Opened by** founder act, same day, explicitly **before Circle discovery is finished** — because
Salons may materially simplify how people encounter one another without exposing member interest
profiles.
**Status** ⛔ **DESIGN ONLY.** No implementation, migration, schema, API, UI or deploy.

---

## 1 · What a Salon is

**Not another field type.** A **temporary gathering form**: a member-initiated encounter around
something worth exploring.

| | **Salon** | **Circle** |
|---|---|---|
| nature | temporary gathering | ongoing relational field |
| purpose | encounter · explore · converse | develop relationship and shared inquiry |
| initiated by | a Soullab member | one or more people intentionally forming a Circle |
| commitment | attend this gathering | enter an ongoing field |
| membership | **none** | explicit Circle membership |
| duration | one gathering or a short series | as long as the relationship continues |
| boundary | gathering-specific | durable relational membrane |
| outcome | **may simply end** | may mature · rest · complete · birth another field |
| can lead to a Circle? | **yes — by explicit new act** | already is one |

Four words, four distinct claims:

> A **Circle** says *we are in relationship.*
> A **Salon** says *come be in conversation for a while.*
> A **Commons** says *this is something many of us care about.*
> A **Co-Lab** says *let's make something together.*

**The progression:**

```
interest → Interest Commons → Salon → human encounter
        → "we want to continue this." → explicit Circle formation
```

⭐ Salons are **the missing middle** between *"I am interested in this"* and *"I want an ongoing
relationship with these people"* — a far more natural human progression than an algorithm announcing
*"here are six people you should connect with."*

---

## 2 · What this does to D-J2 — precisely

D-J2 asked: *how do people find one another around a shared interest without turning declarations into
public profiles?*

Salons offer a different mechanism:

```
Kelly declares Shadow Work — privately
        ↓  Soullab shows Kelly the Shadow Work Commons
        ↓  Kelly sees a Salon: "Shadow and Relationship"
        ↓  Kelly chooses to attend
        ↓  Kelly meets Maria there
```

> ⭐ **The gathering creates visibility through participation.**

The declaration stays private and still does real work. No `Kelly · Maria · David are interested in
Shadow Work` roster is ever rendered.

### ⚠️ But D-J2 is displaced, not answered

This is the precision worth holding. What changes is **the kind** of question:

| | before Salons | with Salons |
|---|---|---|
| disclosure is | a **standing property** of a person — their declaration, visible or not | a **member act at a moment of their choosing** — attending this gathering |
| the risk is | a people-search database | an attendee roster that becomes one |

**Attending is itself a disclosure** — to the host, and to whoever else is there. So the open question
becomes narrower and better-shaped: **what does attendance disclose, to whom, and for how long?**

⛔ The failure mode to name now: **a browsable attendee list is a people-search database with extra
steps.** The rule that prevents it —

> **A roster is a consequence of co-presence, not a directory.**

You see who is *here, now, with you*. It is not a queryable index, not a list you can pull up later to
mine, and not something that accumulates into a profile of who someone gathers with. Recorded as
**D-L2**, because "for how long" is a genuine founder call.

**D-J2 stays open** and is now materially easier: a Commons may not need human-visible declarations at
all if Salons carry the meeting.

---

## 3 · Member-initiated, and what that forbids

Soullab must not be the programmer of every conversation. A member says: *"I'd like to host a Salon
about grief and creativity."*

The whole creation experience:

```
Host a Salon

What would you like to gather around?    [ Grief and Creativity ]
A few words of invitation                [ I've been wondering what grief
                                           does to the creative life... ]
Within                                   [ Grief & Loss Commons ]
When                                     [ Tuesday 7:00 PM ]
Format                                   [ Online ] [ In person ]
Approximate duration                     [ 90 minutes ]

                                                    Create Salon
```

⛔ **Structurally absent, and this is FR-08.7, not taste:** engagement optimization · "grow your
audience" · followers · host rankings · host ratings · "top Salon" · attendance counts · repeat-attendee
tallies · trending. Every one of them rebuilds `contribution_points` in a new surface.

> **The host is the person tending this particular gathering.** Not a creator, not a channel, not a
> brand.

**Two forms, one mechanism:** *Soullab Salons* (hosted by Soullab, practitioners, invited thinkers)
and *Member Salons* (initiated from inside the ecology). The second is where the network becomes
**generative rather than programmed by Soullab** — and the mechanism must be the same one, or the
first quietly becomes a broadcast tier.

---

## 4 · The membrane — every crossing independent

A Salon **inherits no Circle authority**. Attending must never cause:

```
Salon attendee → Circle member → interest publicly visible
              → followable person → added to someone's network
```

None of those as side effects. Each crossing is its own act:

```
attend Salon                 explicit
connect with another person  explicit
enter Dyadic Field           explicit
form Circle                  explicit
join Circle                  explicit
offer Salon material onward  explicit
```

This is the constitutional law already built, in its cleanest form:

> ⭐ **Connection may increase reach, but may never lower consent.**

It is also **FR-08.5** exactly — *a crossing creates no membership* (asserted today by T5) — arriving
one layer out.

### 4.1 A Circle may host a Salon

```
Jungian Shadow Practice Circle
        │ chooses to host
        ▼
Salon: "Projection and the Stranger"
        │
        ▼
people from the Shadow Work Commons attend
```

⭐ The Salon is **a membrane crossing authored by the Circle** — a new member-facing invitation, not
access to the Circle interior. Afterward the Circle remains itself and **the guests do not become
members**. Nothing of the interior (members, count, FORMING/ACTIVE, inquiries, offerings, journey)
becomes visible by attending.

Authority to host on a Circle's behalf runs into the same gap as everything else: no code path writes
`facilitator`, `created_by` is provenance not ownership (D-I6, CA-15) → **D-L4**.

---

## 5 · What remains when a Salon ends

⭐ **Default afterlife: nothing.** The founder's own table says a Salon *may simply end*, and that
should be the literal behavior, not a shrug.

⛔ No automatic transcript. No automatic MAIA extraction. No summary generated on the group's behalf.
A gathering is where the no-stealth-memory vow bites hardest — people speak differently when a machine
is listening for them.

If something should remain, a person **explicitly Offers or Keeps a representation afterward** — the
same membrane as everywhere else. Note the shape this shares with **D-K2** in the interior model:
material with no durable field to live in. A Salon has no interior to hold anything, which is why the
default of nothing is the coherent answer rather than a limitation.

---

## 6 · The minimum objects

Proposed shapes only. **No migration.**

| object | why it must exist | note |
|---|---|---|
| `salons` | the gathering: what it gathers around, words of invitation, the Interest Commons it sits within, when, format, duration, host, optional hosting Circle | ⛔ no counts, no ratings, no derived popularity |
| `salon_attendance` | the explicit act of attending | ⭐ the **narrowest** object in the design. Not a membership, not a relationship, not a network edge. **D-L2** governs its lifetime and visibility. |

⛔ **Structurally absent:** attendee counts on the salon row · host aggregate stats · any `*_score` ·
any cross-Salon attendance history queryable by another member.

⚠️ **The dangerous convenience to refuse in advance:** a "people you've gathered with" surface. It
would be trivial to build from `salon_attendance` and it is precisely the profile this whole design
avoids. **Connect stays an explicit act between two people who were in the same room** — never a
suggestion derived from co-attendance.

---

## 7 · Proposed future obligations

⛔ **IDs RESERVED, NOT REGISTERED** (FR-14: a MISSING required obligation never discharges). Numbered
clear of I1's C23–C26 / T11–T18 and the interior model's C27–C30 / T19–T24.

| id | obligation |
|---|---|
| **C31** | no Salon surface renders an attendance count, host ranking, rating, or trending signal |
| **C32** | no exported contract returns one member's attendance across Salons to another member |
| **T25** | attending a Salon creates no Circle membership and no Commons declaration |
| **T26** | attending a Circle-hosted Salon exposes no Circle interior — members, count, constitution state, inquiries, offerings, journey |
| **T27** | a Salon ending persists no content absent an explicit member Offer or Keep |
| **T28** | co-attendance produces no connection, no suggestion, and no network edge |
| **T29** | a private interest declaration is never rendered to another member as a consequence of Salon eligibility |

---

## 8 · Founder docket

| # | Question | Blocks |
|---|---|---|
| **D-L1** | **Salon ↔ Commons binding.** Must every Salon sit within an Interest Commons, or may one exist unattached? Requiring it makes Commons the organizing spine; allowing free Salons makes the Commons optional and weakens the progression. | Salon creation |
| **D-L2** | ⭐ **What does attendance disclose, to whom, and for how long?** Before · during · after. The roster-vs-directory line (§2). This is now the live descendant of D-J2. | Attendance |
| **D-L3** | **Host authority within a gathering.** May a host decline or end someone's attendance for safety — and can that exist without a reputation record or an accusation log (the D-K5 problem, one layer out)? | Safety |
| **D-L4** | **Who may host on a Circle's behalf?** Same CA-15 / D-I6 gap. | Circle-hosted Salons |
| **D-L5** | **Series.** "A short series" implies recurrence. Is a series one object or several, and does attending one instance imply the next? (Proposed: it does not.) | Scheduling |
| **D-L6** | **Soullab-hosted vs member-hosted** — same object and same mechanism, or a distinguished form? If distinguished, what stops it becoming a broadcast tier with an audience? | Both forms |
| **D-L7** | **Does a Circle removal bar attendance at a Salon that Circle hosts?** A Salon is not the Circle, so FR-18 does not reach it on its own terms — but a Circle authoring an invitation outward may have a stake. My reading is that removal does not automatically bar attendance and that D-L3 is the right instrument; that is an inference, not a ruling. | Circle-hosted Salons |

⛔ None answered to shorten the list.

---

## 9 · Standing and sequence

```
SALON DESIGN THREAD   v0.1 · DESIGN ONLY
IMPLEMENTATION        NOT AUTHORIZED
I1 (Interest Commons) DESIGN OPEN — D-J2 still open, now materially narrowed
CIRCLE INTERIOR       v0.1 DESIGN — separate record
PRODUCTION            UNCHANGED · UNMIGRATED · UNDEPLOYED
```

⭐ **Sequencing act recorded:** the founder opened this thread **before Circle discovery is finished**.
The dependency it changes is real — **I1 may not need to resolve human-visible declarations at all** if
Salons carry the meeting. D-J2 is not thereby closed; it is narrowed to D-L2, and asked of a member act
rather than of a standing property of a person.
