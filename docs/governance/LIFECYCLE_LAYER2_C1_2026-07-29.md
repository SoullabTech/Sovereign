# Layer 2 · C1 — Authority is not inferred merely from file location

**Opened:** 2026-07-29
**Status:** RULED — AFFIRMED as **independent necessary property**, 2026-07-29T18:54:35Z by Kelly
Nezat (see [RULING](#ruling) below and *Standing state after this ruling*). Durable `78d9fb388`.
⚠️ *Header hygiene, 2026-08-09: this line read `OPEN — awaiting founder ruling` while the ruling it
was waiting for was already recorded further down in this same file. Nothing was decided by this
edit; the header was made to agree with the founder's act already in the document.*
**Upstream:** Layer 1 AFFIRMED `448cb7eda` · Layer 2 gate RULED (type-only) `500b37f6f`
**Gate disposition carried in:** C1 = **property candidate**
**Authority:** Kelly only. Claude may open the slot and give an evidentiary read; Claude may not rule.

---

## The question

> **Must any valid response to the lifecycle gap prevent file location from being mistaken as the
> source of authority?**

*(Narrowed 2026-07-29. The earlier phrasing invited the positive causal claim `authority → location`,
which this evidence base does not establish. The question is the prohibition only.)*

---

## Excluded from this room

- Instrument selection · ledger adoption · automation/enforcement.
- Directory redesign · what the directories should be · naming rules.
- Artifact movement or migration · canon restructuring.
- C2, C3, C4 — closed until C1 completes.
- Layer 3 — closed.

---

## Evidence base (verified on canonical, 2026-07-29 — not carried from memory)

**E1 — location over-claiming.** `THE_HOUSE.md` sat at a path that implied a status its ruling state did
not support. It now exists on canonical as `docs/governance/candidates/THE_HOUSE_CANDIDATE.md` — the
path itself carries `candidates/`. Established prior finding: **path ≠ status**.

**E2 — placement without status change.** PR #814, merged 2026-07-29T16:24:48Z, is titled
**"chore(governance): preserve the governance record — no status change."** It moved 10 governance
artifacts onto canonical — including `THE_HOUSE_CANDIDATE.md` — while explicitly declaring that
**no authority changed**.

⚠️ *E2 is stronger evidence than "relocation can express an already-established state." It is a
founder act that separated **placement** from **authority** outright, and said so in the commit title.*

---

## The causality framing (as offered) — and a caveat

Offered framing:

```
wrong:  location → authority
valid:  authority → location
```

⚠️ **Claude's read: E2 does not fit either arrow.** #814 placed artifacts on the record while asserting
*no status change* — placement with **no authority claim in either direction**. So the evidence
supports at least three relations:

| Relation | Instance | Legitimate? |
|---|---|---|
| location → authority | `THE_HOUSE.md` over-claiming by path | **No** — this is the failure C1 names |
| authority → location | *(no verified instance in this evidence base)* | untested here |
| location ⊥ authority | #814 — preserve the record, no status change | **Yes** — demonstrated |

This matters for the ruling: if C1 is affirmed as *"location must never be the source of authority,"*
it is supported. If it is affirmed as *"authority determines location,"* that is a **stronger and
different claim**, and the third row shows placement can be legitimate while carrying no authority at
all. ⚠️ Do not let the second arrow ride in on the first.

---

## The two cases

**Necessary property.** The lifecycle gap is precisely a divergence between what an artifact's presence
suggests and what was actually ratified. A mechanism that permits location to supply authority
reproduces the defect by construction — it would let a state become ratified-looking through placement
rather than through an authoring act. Any valid response must therefore forbid the inference.

**Useful preference.** The prohibition describes good hygiene, not a structural necessity. A mechanism
could allow location to carry authority *provided the placement act is itself attributable and
verified* — in which case the authority comes from the recorded act, not the path, and C1 collapses
into a restatement of Layer 1 rather than an independent requirement.

---

## What C1 does NOT require (scope, if affirmed)

C1 is **not a directory philosophy.** Row three (`authority ⊥ location`, #814) establishes that it does
not require: every authority state to have a unique path · every path to encode authority · every
relocation to mean reclassification · any particular repository structure.

It protects against exactly one error:

> **A reader cannot infer that a thing is authoritative merely because of where it sits.**

If affirmed, the authorization is *not* "directories matter." It is: **any mechanism addressing the
lifecycle gap must preserve the distinction between where something is located and why it has
authority.**

---

## RULING

**C1 disposition** — one of:

| | Disposition | Meaning |
|---|---|---|
| ☑ | **NECESSARY PROPERTY** ✅ **RULED** | Any valid mechanism must prevent the inference. |
| ☐ | Useful preference | Real and desirable, but a mechanism could omit it and still be valid. |
| ☐ | Not independent of Layer 1 | Required, but already carried by `ratified → recorded → verifiable`; does not stand as a separate Layer 2 property. |

**C1 is an independent necessary property.** Any mechanism that helps move a ratified state into
recorded and verifiable form **must not allow its representation location to become the source of
authority**. Future mechanisms must demonstrate this property.

⚠️ *The two non-affirming options are **not** the same. "Useful preference" says the property is
**optional**. "Not independent" says it is **binding but redundant** — already secured upstream. They
have different consequences for what a mechanism must demonstrate.*

**Scope (carried if affirmed):** the property prohibits location from *creating* authority. It does not
prescribe a directory structure and does not require authority to be *expressed* by location.

⛔ *The positive claim `authority → location` is **not** on this ruling surface and must not ride in on
an affirmation.*

**This affirmation does NOT mean:** directories become governance instruments · paths determine status ·
every state needs a special folder · relocation itself changes authority.

**Ruled by:** Kelly Nezat  **Timestamp (UTC):** 2026-07-29T18:54:35Z

**Recorded to canonical (merge SHA):** _______________ ⬅ *unfilled until Kelly merges*

---

## Standing state after this ruling

| | |
|---|---|
| Layer 1 — lifecycle gap | AFFIRMED, durable `448cb7eda` |
| Layer 2 gate — type classification | RULED, durable `500b37f6f` |
| **Layer 2 · C1** | **AFFIRMED — independent necessary property** |
| Layer 2 · C2 — states distinguishable | OPEN (state set unresolved; `Living` unadmitted) |
| Layer 2 · C3 — verification referent | OPEN — decision fork, unresolved |
| Layer 2 · C4 — anti-recreation | OPEN — validation-test candidate, unconverted |
| Layer 3 — instrument | CLOSED |

---

## Next

C2 opens only after C1 is ruled and merged. C3 remains a fork. C4 remains a validation-test candidate.
Layer 3 closed.
