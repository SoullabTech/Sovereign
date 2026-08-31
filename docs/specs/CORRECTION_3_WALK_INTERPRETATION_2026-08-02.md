# Correction 3 walk — interpretation record for F4 and capsule `draft`

**Date:** 2026-08-02 · **Status:** RECORDED. Interpretation of an existing frozen instrument.
Amends nothing in `CORRECTION_3_FEATURE_WALK_PROTOCOL.md`, which stays frozen. No code changed.

**Why this exists:** a debugging request began from the premise *"Bring into the Lab does not
transition `capsule.draft` from true to false."* That premise contradicts the frozen protocol.
The record is written so the next investigation starts from the walk contract rather than from
implementation vocabulary.

---

## The corrected contract

| Wrong framing | Frozen contract |
|---|---|
| "Bring into the Lab does not transition `draft` true → false" | "The declaration gesture **must not** mutate capsule draft state" |

`CORRECTION_3_FEATURE_WALK_PROTOCOL.md` **F4**:

> *Save for later* and *Keep in my Field* are visibly distinct acts; a not-yet-eligible capsule
> shows the declaration **disabled with an honest reason**, and reaching for it does **not** flip
> `draft`.

**F4 is satisfied when declaration leaves `draft` unchanged.** Any walk report expecting
`draft = false` after a declaration gesture is measuring the wrong invariant, and a "fix" that
made declaration flip `draft` would *break* F4 while appearing to resolve a bug.

---

## Three independent dimensions of a capsule

Collapsing these is the error this record guards against:

| Dimension | Question it answers | Changed by |
|---|---|---|
| **Existence / persistence** | does this capsule exist? | capture |
| **Review state** (`draft`) | have I finished working on it? | save / review / *Bring into the Lab* |
| **Field membership** | does this belong to my ongoing Field? | *Keep in my Field* (declaration) |

The tempting collapse is: *"if someone keeps something in their Field, they must be done with it."*
The design says the opposite is possible, and that is the stronger model of developmental work:

> **A person may recognize something as belonging to their ongoing Field before it is complete.**

Recognition is not completion. A capsule can be declared into the Field while still a draft, and
finishing it later changes nothing about that membership. This is consistent with Amendment 5 —
the declaration creates the Field Object; the source's own lifecycle is a separate matter.

---

## What the investigation measured

Recorded so the eliminated hypotheses are not re-explored.

**1. The `draft` write path works.** Empirically, against a real row — not inferred from reading:

```
before  draft = true
updateCapsule({ draft: false })
DTO     draft = false
DB      draft = false
```

Eliminated as causes: the zod schema (`CapsuleUpdateSchema.safeParse({draft:false})` →
`{"draft":false}`), the PATCH route, the dynamic SET-clause builder, `rowToDTO`, DB persistence,
and `Content-Type` (set for bodied requests on both the web and header-auth paths of `apiFetch`).

**2. The declaration path never touches `draft`.** All nine files changed by #905 were checked;
none references it. That is correct behaviour, not an omission.

**3. Two dead surfaces exist, and neither is on the F1–F10 path.**

- `lib/capsules/capsuleService.ts` → `bringIntoLab()` — **zero callers**. Live paths PATCH
  `/api/capsules/[id]` directly. Historical capability.
- `components/capsules/CapsuleEditor.tsx` — **zero render sites**, and its button is guarded by
  `{capsule.draft && onBringIntoLab && …}` where `onBringIntoLab` is optional and passed by no
  one. Unreachable twice over.

They are **cleanup candidates, not the cause** of any walk result.

---

## The one question this record does not answer

Whether a failed F4 observation actually occurred, or whether passing behaviour was read through
the old mental model. Answering it needs the walk record, not more code:

```
F-step:
Action:
Actor:
Surface:
Expected:
Observed:
Request:
Response:
DB state:
Rendered state after refresh:
```

Until that exists, no capsule code should change. Every attractive fix in this area was already
eliminated by measurement, and the frozen instrument's only statement about `draft` is a
prohibition the code currently honours.

**One thing worth watching if a real F4 failure does surface:** #905 added ~108 lines to
`CaptureSpiritPanel.tsx`, so *Save for later*, *Bring into the Lab* and *Keep in my Field* now
share one panel. F4 exists to keep those visibly distinct. If they have become confusable, the
defect is in that distinction — not in the write path, which is proven sound.
