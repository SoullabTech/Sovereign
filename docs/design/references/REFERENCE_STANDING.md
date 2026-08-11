# Reference Standing — vocabulary and register

**Founder ruling, 2026-08-10.** Establishes the standing vocabulary for design
references, and the register of what currently holds which standing.

> The distinction this exists to protect:
> **an approved *experience* is not the same as an established *implementation*.**
> Screenshots and source are not reconciled by default, and pretending they are is
> how source ambiguity turns into false canon.

---

## The vocabulary

| Standing | Means |
|---|---|
| `EXPERIENTIALLY_APPROVED` | The founder walked this and said yes. The experience is authoritative. |
| `CANONICAL_IMPLEMENTATION` | The exact code / commit producing it is established and durable. |
| `PROVISIONAL_REFERENCE` | Useful evidence. Not yet canonical. |
| `REJECTED` | The founder explicitly rejected this experience. |
| `SUPERSEDED` | Previously approved, since replaced. Retained as history. |

`EXPERIENTIALLY_APPROVED` and `CANONICAL_IMPLEMENTATION` are **independent axes**.
A reference may hold the first without the second — that is precisely the Journal's
situation today, and the register must be able to say so.

**Rule.** The Room Character Register may label a code path as the canonical
implementation of an approved experience **only** when the lineage chain is
established:

```
approved screenshot / walk
      ↓  which dev server?
      ↓  which worktree?
      ↓  which branch?
      ↓  which commit?
      ↓  which files generated that rendering?
```

Until that chain resolves, the standing is `NEEDS RECOVERY` and no code path may be
described as canonical.

---

## Register — as of 2026-08-10

| Reference | Experience standing | Implementation standing |
|---|---|---|
| **Journal** (arrival · writing · reading · MAIA reflection · return) | `EXPERIENTIALLY_APPROVED` | ⚠️ **NEEDS RECOVERY** — no lineage found in this repository ([finding](JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md#lineage-recovery-result)) |
| **Relationships** | `PROVISIONAL_REFERENCE` — evolving; current pass not accepted | not established; visual redesign paused pending substrate repair + [`RELATIONSHIP_ROOM_CONSTITUTION.md`](../../canon/RELATIONSHIP_ROOM_CONSTITUTION.md) ratification |
| **Author Studio** phase-b studies (`docs/design/author-studio/phase-b/*.html`) | `PROVISIONAL_REFERENCE` | in-repo static studies; **not** the Journal, despite sharing a literary register |
| **Now What?** mockups (`docs/design/now-what/mockups/*.html`) | `PROVISIONAL_REFERENCE` | in-repo static studies |

⛔ **Do not** promote a row's implementation standing by pointing at code that merely
resembles the approved experience. Resemblance is not lineage.

---

## How this is used

- The **Experience Contract** gate (`docs/design/contracts/`) requires
  `reference_surfaces:` — entries there should name references from this register,
  and a contract must not claim a reference is canonical when this register says
  `NEEDS RECOVERY`.
- The **Room Character Register** (next step) consumes this file to decide which
  rooms may be described canonically.
- The **JARVIS memory layer** (step 3) writes here: approvals, rejections, and
  supersessions accumulate as standing changes, not as prose.

Sequence: enforcement gate ✅ → **reference standing (this)** → room character
register → JARVIS memory layer → golden references → Experience Contract
auto-attached to every UI work packet.
