# House IA Ruling — Studio is One Threshold

**Date:** 2026-08-04
**Authority:** Kelly (founder)
**Type:** Navigation / information-architecture ruling — **not** a UI preference
**Status:** RULED. Enforced by `lib/navigation/__tests__/houseDestinations.test.ts`
(`describe('Studio is ONE threshold — mode is not an address')`).

---

## The ruling

> **Studio is one threshold. Mode is revealed after entry.**

The House registers **one** door to the practitioner workspace:

| Room | Route | Audience |
|---|---|---|
| **Pro Studio** | `/studio` | `founder` |

`Personal Field` and `Practice Portal` are the two **modes** of that one surface
(`StudioMode` in `hooks/useStudioData`, rendered by `MODE_CONFIG` in
`components/studio/TeamSwitcher.tsx`). They are **not** House destinations, not
routes, and not labels in `HOUSE_DESTINATIONS`.

```text
HOUSE
  Rooms
    …
    Pro Studio  ──────────────▶  /studio
                                   [ Personal ]  [ Practice ]
                                   └── the switch is contextual,
                                       inside, after entry
```

## The general rule this instance expresses

> **Navigation reveals a place. It should not expose the architecture underneath.**

A useful internal distinction must not be allowed to become two artificial
places. The member should not have to understand the object model in order to
find where they work.

## What was rejected, and why

### Rejected — two Rooms, same surface

```text
Personal Field → /studio?mode=personal
Pro Studio     → /studio?mode=practice
```

This reads clean and is the tidier-looking refactor, which is exactly why it is
the standing risk. It asserts a **false ontology**: *the person has two places.*
They do not. They have **one workspace entered in different relational
contexts**. Splitting the door splits the person.

Two further consequences: `Personal Field` is not a destination — it is a
relationship mode; and `Pro Studio` is not a **peer room** to the member
environment, so listing it beside its own sibling mode mis-states its rank.

### Rejected — neither (leave `/studio` out of the House)

Preserves the prior ambiguity and states, by omission, that the practitioner has
no place and the member has no coherent relationship to practice. It leaves the
unresolved state visible in the navigation itself.

## Relationship to the same principle elsewhere

This is the same rule as the flourishing layer in **Now What?**. A participant
does not enter *Reflection Module · Growth Module · Purpose Module*; they enter a
living environment. Likewise the practitioner does not enter *Personal Field App*
and *Pro Studio App* — they enter **the Studio**, and the relationship changes.

See `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` — the design test
*"what layer does this belong to?"* applies to navigation as much as to
authority. A mode is not a layer.

## Disposition — four states, kept separate

Founder direction, 2026-08-04. Do **not** collapse these into "shipped".

| # | Concern | State |
|---|---|---|
| 1 | **IA ruling** — one threshold, mode after entry | ✅ **Complete and implemented** |
| 2 | **House-list visibility** | ✅ Implemented, via the current `founder` audience class |
| 3 | **Route authorization** (`/studio` server-side) | 🔴 **Unresolved and not demonstrated** |
| 4 | **Rendered acceptance** | ⏳ Gated on an authenticated founder walk |

(2) is a list filter. It is **not** (3). Nothing on this branch demonstrates that
an unauthorized person is refused at `/studio`.

## What this ruling does NOT settle

⚠️ **The server-gate question remains open.** Three answers existed for *how a
practitioner reaches their field*; this ruling resolves the **placement** axis
only (a Room in the House, entering `/studio`). It does **not** resolve:

> Is the door **rendered to every member**, or **absent server-side** for
> non-practitioners?

The founder direction of 2026-07-13 was that the practitioner section is *absent
from the member-received page* — not filtered, not hidden. `HouseAudience` can
only express `'all' | 'founder'`, so the entry ships as `audience: 'founder'`,
matching the Circles / Vision Studio precedent. That is the **closest available
gate, not a ruling on the gate.** Do not cite this document as settling it.

⛔ **Do not widen this branch to solve it.** When the server gate is taken up, it
must settle at least three distinct identities rather than forcing them into the
current binary type:

```text
member
practitioner
founder
```

Possibly also staff/admin — but that identity must **not** be introduced by this
branch.

Also unchanged: **no separate practitioner login.** Practitioner is a role held
by an authenticated member (`app/api/practitioners/verify-passcode/route.ts`
calls `getAuthenticatedMember` first). A `/practitioner/login` would be a second
identity system for one person.

And unchanged: **the practitioner field is not a backend copy of the member
field.** It is a separate perspective; the connection between them is the
gesture of sharing, never automatic access. The two fields share a *person*, not
a *data path*.

## Enforcement

The ruling is connected to a mechanism, not merely described:

- exactly one House destination may open `/studio`
- no destination route may encode `?mode=` / `&mode=`
- no destination may be **labelled** `Personal Field` or `Practice Portal`

A future refactor that splits the door fails the suite.

## Acceptance walk (on deploy)

Verify **only the ruling this branch claims** — six checks:

1. The House shows **Pro Studio once**.
2. It **follows Vision Studio** in Rooms.
3. It opens **`/studio` with no query parameters**.
4. **Author Studio** still opens its own interim route (`/press/studio`).
5. **No** Personal Field or Practice Portal doorway appears.
6. A non-founder / non-practitioner **cannot infer authorization** merely from
   the House's filtering behavior.

⚠️ Item 6 is **observation of the unresolved seam, not acceptance of it.** It
records state (3) above; passing it does not close (3).

## Files

- `lib/navigation/houseDestinations.ts` — `pro-studio` destination + policy comment
- `lib/navigation/__tests__/houseDestinations.test.ts` — enforcing suite
- `components/studio/TeamSwitcher.tsx` — where the mode switch lives (unchanged)
