# House Boundary Dispositions — Book Studio, Lab Tools, and the drift blind spot

**Date:** 2026-08-04 · **Authority:** Kelly (founder) · **Status:** RULED
**Enforced by:** `lib/navigation/__tests__/houseDispositions.test.ts`

---

## The blind spot this closes

Retiring the feature rail (2026-07-22) dropped destinations reachable by URL and by
nothing else. The recovery pass caught the ones **hardcoded** in the rail (Keeps,
Co-lab). It could not catch the ones properly **registered** in `MAIA_BOUNDARIES` that
never migrated into `HOUSE_DESTINATIONS`.

`houseNavDrift` walks House → allowlist → bundle. **Nothing walked
`MAIA_BOUNDARIES` → House.** So Book Studio and Lab Tools sat undispositioned for two
weeks, invisible to both checks — the same failure the recovery commit warned about,
one layer up.

### The guard does NOT require universal migration

⛔ It must **not** assert *"every boundary appears in the House."* That would turn the
House back into a complete registry — the taxonomy the House was created to leave
behind. It asserts instead:

1. every `MAIA_BOUNDARY` has a **declared** House disposition;
2. every `offered` / `offered_restricted` boundary resolves to a valid House destination;
3. every House destination resolves back to a registered boundary **or** carries an
   explicit exception with a reason;
4. `withheld` / `contextual` / `superseded` boundaries are **not** treated as orphans.

**Not every registered place must be in the House, but none may remain silently
undispositioned.** Absence becomes a recorded decision, never an unnoticed loss.

Mutation-verified: removing the Lab Tools disposition fails 4 assertions.

---

## Three axes, never collapsed

```text
Navigation     → what is PRESENTED       → disposition
Authorization  → what may be ENTERED     → authorization
Identity       → which rules APPLY       → not modeled; unresolved
```

⚠️ `interimAudience` is the closest gate `HouseAudience` can express today
(`'all' | 'founder'`). It is an **interim rendering control, not the authorization it
approximates.** A list filter is not an authorization boundary.

### Vocabulary invariant (added 2026-08-04, before merge)

> **Disposition values describe House presentation state — not member class,
> founder status, audience, or ownership.**

Three questions, three axes:

| Question | Axis |
|---|---|
| What kind of work happens here? | the room's own identity (not modeled here) |
| Who does the House offer this door to? | **disposition** |
| Who is authorized to enter? | **authorization** |

The value set originally shipped `founder_only`. That smuggled the *audience*
answer onto the *presentation* axis and read as a claim about the room's **nature**
("the nature of this room is founder-only") — directly contradicting the ruling
that the House must not encode founder-vs-member into a studio's identity.
Renamed **`founder_only` → `offered_restricted`** before merge.

**The House can decide what it OFFERS without deciding what something IS.**

Enforced by the *disposition vocabulary* suite: a future value containing
audience or ownership vocabulary (`founder`, `member`, `steward`, `practitioner`,
`admin`, `tester`, `owner`, `private`, `public`, …) fails the build.
Mutation-verified: reintroducing `founder_gated` fails 4 assertions.

This is the same class of defect as the drift blind spot, caught at a different
layer — *the guard caught the historical implementation bug; the naming review
caught the future conceptual one.* Both are boundaries that are technically
correct but invite the wrong mental model.

### Studios are Steward-level offerings

The House must **not** encode founder-vs-member into a studio's *identity*. It encodes
who currently has permission to enter.

| Studio | Long-term | Current beta |
|---|---|---|
| Writer's Studio | Steward | Beta testers |
| Vision Studio | Steward | Beta testers |
| Pro Studio | Steward | Beta practitioners |
| Book Studio | Steward (specialized) | Beta testers / authorized |

---

## Ruling 1 — Book Studio: RESTORED (migration omission)

Its absence was **not** a disposition. Canon ratifies it live and distinct
(`AUTHOR_STUDIO_THREE_LAYER_RULING.md` §2 — *"/book-studio = Book Studio. Unchanged."*);
it was a registered rail boundary; no ruling withheld it.

Restored as a House destination → `/book-studio`, `nativePolicy: 'web'` (desktop
authoring environment, web-only by design — not a bar; Astrology and Circles are the
same).

⛔ **Distinct from Writer's Studio and never merged into it.**

> **Writer's Studio** — how a life becomes a book (create, discover, revise, develop).
> **Book Studio** — how a finished manuscript becomes a published book (production,
> editions, layout, release, publishing operations).

Adjacent stages, different work. The distinction is **the work being done, not the
status of the person entering the room** — even though some people use both.

⛔ This ruling concerns **navigational availability only.** It does not authorize
redesigning Book Studio.

## Ruling 2 — Lab Tools: INTENTIONALLY WITHHELD from the House

`/labtools` is **not** a House destination. Its organizing principle is
**instrumentation** — a taxonomy of instruments and activities — rather than a human
mode of work. Promoting it into Rooms would reintroduce the rail logic the House was
built to leave behind (2026-07-22: *"the rail failed because it was a taxonomy"*).
Consistent with the 2026-05-27 directive that the labtools convention is
reflection/experimental.

`/labtools` **remains fully available** as a functional environment via contextual
entry points · MAIA's routing · adopted-tool surfaces such as My Lab · direct access ·
tester/admin routes under their existing gates.

⛔ **This absence is a RULING. Do not mistake it for another lost migration.**
It rules only its relationship to the House, not `/labtools` itself.

---

## Correction absorbed

An earlier framing described Writer's Studio as interim at `/press/manuscript`. That is
stale: on 2026-07-30 the House was corrected **off** `/press/manuscript` (it dropped
members onto a bare upload surface with no Studio around it), and
`AUTHOR_STUDIO_THREE_LAYER_RULING.md` §2 ratified `/press/studio` as the permanent
Layer 2 environment. The House points there. ⛔ Do not repoint it.

## Still unresolved

Route authorization. `interimAudience: 'founder'` on Book Studio and Pro Studio is the
closest available gate, **not** the Steward authorization it stands in for. Nothing here
demonstrates that an unauthorized person is refused at either route.
