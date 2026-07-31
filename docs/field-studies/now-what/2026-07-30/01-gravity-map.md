# Gravity Map

**Produced first, before any narrative.** It asks what the environment is *actually*
organizing around — not what it claims to organize around.

Four gravities measured independently, then compared. **The finding is the disagreement.**

**Observed build:** production `db245336d` · **Instrument:** `84dde085c5d8`
(review `b5faaf622`, merged `ea39fe3b0`). See `OBSERVATION_DECLARATION.md`.

**Scope:** the **unauthenticated public journey only.** Everything past the door is
Unavailable behind an authorization boundary this observer will not cross.

---

## Measurement limits (stated before the findings)

- ⚠️ **`/pitch` is a slideshow.** `innerText` renders one slide (120 words). Its row below is
  **slide 1 only**, not the surface. A single measurement of a paged surface is one frame.
  → **I-9:** the visual-gravity instrument assumes a static page and has no procedure for
  paged surfaces. Recorded; **not** applied to the method doc.
- ⚠️ **Temporal gravity cannot be measured in this sitting.** Return behaviour is the best
  evidence and requires member data. Logged **Needs consent**; not reached for.

---

| Surface | Visual | Interaction | Temporal | Relational | Reading |
|---|---|---|---|---|---|
| `/welcome` | "Flourishing in the Midst of a Busy Life" (36px, single focal point) | → `/now-what` · → `/pitch` | Needs consent | **the room** (room 3 · MAIA 1 · Larry 0) | Place-centred |
| `/pitch` (slide 1) | "Welcome." (34px, single focal point) | → `/now-what/room?…fieldContext=now-what-demo` | Needs consent | **Larry** (Larry 2 · MAIA 0 · room 0) | Practitioner-centred |
| `/arrive` uninvited | "Welcome back." | sign-in only | Needs consent | **none named** (Larry 0 · MAIA 0) | Centre unoccupied |
| `/arrive` eligible | "You were invited here." | create key · sign in | Needs consent | **none named** (Larry 0 · MAIA 0) | Centre unoccupied |

### Interaction graph (Class A)

```text
/now-what ──307──▶ /now-what/room ──unauth──▶ /now-what/arrive?next=…&rid=…
/welcome ──"Enter the room"──▶ /now-what           (→ same chain, UNINVITED branch)
/welcome ──"Program overview"──▶ /pitch
/pitch   ──"the room"──▶ /now-what/room?phase=fire_1&fieldContext=now-what-demo
                                                    (→ arrive, ELIGIBLE branch)
```

> **Only temporal gravity remains intentionally unmeasured. The other three dimensions were
> measured directly from publicly observable evidence.** The blank is a held boundary, not an
> omission of the same kind as a gap elsewhere in this map.

## Alignments (coherent places)

- **Visual gravity is coherent everywhere.** Every surface has exactly one dominant focal
  point; none presents competing focal points.
- **Interaction gravity is unambiguous and single-centred: the door.** Every public path
  terminates at `/now-what/arrive`.

## Disagreements (structural findings)

⭐⭐ **Relational gravity does not agree with itself across the public journey, and does not
agree with interaction gravity.**

- `/pitch` is **practitioner-centred** — "NOW WHAT? · WITH LARRY CLOSS."
- `/welcome` is **place-centred** — the room named 3×, MAIA once, **Larry absent**.
- `/arrive` — the surface **every** public path terminates at — names **neither**. The
  relational centre at the door is **unoccupied**.

Relational gravity is **three-valued and unstable**, and is **strongest on the two surfaces
that are not on the default path.**

⭐ The two paths also reach *different branches* of the same door: `/welcome` → **uninvited**,
`/pitch` → **eligible**. Same destination, different assertion about why the person is there.

### Kelly's open question, left open

> *What is the primary relationship being introduced?* Three candidates observed:
> **Larry** · **the room** · **the practice itself**.

**Not resolved here.** The measurement establishes that the public journey **does not
currently answer it consistently.** It does not establish which answer is correct.

### ⭐⭐ Convergence with D9 — the disagreement is downstream of an unruled decision

`/now-what` lands on the **room** (D9 — unruled, settled by default since 2026-07-08). The two
surfaces that *do* establish a relational centre are **both off that default path**, and
`/welcome` has **zero inbound links by design**.

> **A first-time arrival at `/now-what` meets the one surface that names no relational
> centre at all.**

Structural, not presentational: **D9 does not merely decide a landing route — it decides
which relationship, if any, the environment introduces first.** That materially enlarges
D9's scope beyond navigation.

⚠️ Stated as an observed structural consequence. Whether it *should* be otherwise is a founder
question and is **not** answered by this map.

---

## Findings register

| ID | Class | Statement |
|---|---|---|
| G-1 | A | Interaction gravity is single-centred: all public paths terminate at `/now-what/arrive`. |
| G-2 | A | Relational gravity is three-valued and disagrees across `/welcome`, `/pitch`, `/arrive`. |
| G-3 | A | The default arrival surface names no relational centre. |
| G-4 | B | G-3 is a consequence of D9's unruled default. **Assumption named:** that `/now-what` is the predominant first-arrival route — **unverified**, requires route telemetry. |
| G-5 | — | Temporal gravity **Needs consent** — a governance result (correctly-drawn boundary), not a product gap and not an instrument gap. |
| I-9 | — | Instrument: no procedure for paged/slideshow surfaces. |

⛔ No recommendations. Founder decisions are revealed, never resolved.
