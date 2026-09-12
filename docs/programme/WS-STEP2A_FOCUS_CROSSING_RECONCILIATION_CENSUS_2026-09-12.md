# Step 2A — Focus crossing reconciliation census

**Lane** JARVIS — DEVELOPMENTAL CREATIVE INTELLIGENCE 01
**Act** READ ONLY. No file under `lib/writers-studio/`, `lib/disclosure/` or
`app/api/writers-studio/focus/` was modified by this census.
**Date** 2026-09-12
**Branch** `claude/s3-implementation` @ `efded195d`

---

## The question

> Can the current crossing represent a `FocusSet { members[], activeIndex }`?

## The answer

**No — four of seven obligations cannot be expressed, and one of the four is a
hard refusal in the receipt contract rather than a missing feature.**

But the extension is **not invention**. The N-scope disclosure pattern this
needs is already built, ratified and running — on a *different* boundary. See
§3.

---

## 1 · The seven obligations, against `/api/writers-studio/focus`

| # | obligation | verdict | where it is decided |
|---|---|---|---|
| 1 | one Focus Set | ⛔ **NO** | `FocusCrossingRequest` carries one `scopeKind`, one optional `sectionRef`, one optional `range`. There is no cardinality above one anywhere on the path |
| 2 | N independently authorized members | ⛔ **NO here** · ⭐ **YES elsewhere** | one `establishDisclosureBoundary` call, one `disclosureId`. The Ask boundary does N — §3 |
| 3 | one optional active edit target | ⛔ **NO** | nothing in the request, the producer or the receipt can say "these five, acting on this one". `label` is a display string on the single focus |
| 4 | one member act | ⚠️ **PARTIAL** | one `requestId` + one `disclosureId` per call, so a call *is* an act. But there is no act identity that survives a retry — no `pendingAskRef`, no atomic claim. The Ask path has both |
| 5 | one coherent MAIA turn | ✅ **YES** | `constructWriterTurn` → one `CanonicalTurn`, one `member.writer_focus` producer, tier-invariant membership enforced before handoff |
| 6 | disclosure provenance for exactly those members | ⛔ **NO** | `contextDisclosureReceipt.ts:175` **refuses** `sectionRef` when `scopeKind !== 'section'`. Five members need five receipts; this crossing mints exactly one |
| 7 | no widening to whole Work | ⚠️ **NOT STRUCTURAL** | `whole_work` is an accepted `scopeKind` and `assembleFocus` joins every section. **BAD B is available today** — nothing prevents it but the caller's discipline |

### The shape of the blocker

The producer contract is where a Focus Set dies quietly:

```ts
// lib/writers-studio/canonicalWriterTurn.ts
readonly focus: { workRef; scopeKind; label? };
readonly workContext: string;      // ⛔ ONE flattened blob
```

`workContext` is a single string. Five members reaching MAIA through it arrive
concatenated, with **no member identity inside** — MAIA cannot tell §45 from
§62, cannot be told which is the active target, and cannot attribute anything
it says to a place. That is BAD A and BAD C collapsing into the same defect:
the distributed attention is lost at the last inch, after the boundary did its
work correctly.

---

## 2 · What the Focus Set adds that the contract never anticipated

The crossing was designed when a focus was **one scope**. Three things are new:

1. **Cardinality.** Members are a set, not a scope.
2. **The active target** — `activeIndex`, which is *not* more authorized than
   the other members. It answers only "which of these are we acting on right
   now?" Nothing in the current contract has a place for a distinction that
   carries no additional authority.
3. **Anchor currency** (ruled 2026-09-12). A member is `current`,
   `unverified`, or invalid. The founder's ruling is explicit that an
   `unverified` member **may not be disclosed to MAIA as though its current
   text were the historical subject**.

That third one produces a property the existing crossing has no vocabulary for:

> **Declared attention ≠ disclosed text.**
>
> A five-member set may legitimately cross with three bodies read.

---

## 3 · ⭐⭐ The census finding: this is already solved on the other boundary

`app/api/sovereign/manuscripts/[id]/ask/route.ts` — boundary
`writers_studio.ask->maia_developmental` — **already does N-scope disclosure**,
and does it under law this lane would otherwise have to re-derive:

```text
ONE requestId, N section-scoped receipts
  "an auditor grouping by it sees ONE member act carrying N independently
   section-scoped crossings … authority stays section-scoped, and what is
   shared is the request, never the permission."

ALL BOUNDARIES BEFORE ANY BODY IS LOADED
  a boundary that succeeds inside a multi-boundary attempt stays `attempted`
  until the ONE authorized handoff occurs — a later failure never promotes an
  earlier success

ONE HANDOFF → CONFIRM ALL
  for (const id of established) await confirmDisclosureCrossed(id)

ALL-OR-NONE SCOPE          BODY_SCOPE_INCOMPLETE, nothing crossed
ACT IDENTITY               pendingAskRef + atomic claim, ACT_ALREADY_PROCESSED
THE SIXTH STATE            DISCLOSURE_UNAVAILABLE · actSpent: true
INDEPENDENT SCOPE CHECK    enforceW2SectionBoundary reads what was RECOVERED,
                           never `requiredSections === authorizes`
```

It even already uses the gesture token **`work_with_this`**.

⛔ **This does not mean route the Focus Set through the Ask boundary.** They are
different crossings with different destinations: Ask goes to the *developmental
reader* (`askMaiaDevelopmental`), Focus goes to *canonical MAIA*
(`getMaiaResponse` via `CanonicalTurn`). Sending Focus through Ask would be the
boundary collapse this lane exists to prevent — in the opposite direction.

**It means the law is written and proven, and Step 2B ports the law, not the
route.** Six of the eight behaviours above were walked green in the Step 7
witness of 2026-09-10 (`60 passed · 0 failed`).

---

## 4 · What Step 2B would have to extend, deliberately

Not a wiring job. Four contracts change:

| contract | change |
|---|---|
| `FocusCrossingRequest` | `scopeKind`/`sectionRef`/`range` → `members: FocusMemberScope[]` + `activeIndex: number \| null` |
| `performFocusCrossing` | the boundary **loop**, ported from the Ask route verbatim — all before any read, none promoted until the one handoff, all confirmed after it |
| `FocusAssembler` | one scope → one text becomes N scopes → N **labelled** pieces |
| `WriterFocusParticipation` | ⭐ **the real new work.** `workContext: string` must become a structure the renderer can express as `DECLARED ATTENTION F1 §45 · F2 §56 …` / `ACTIVE TARGET F2`, at every tier, tier-invariantly |

Plus `focusDisclosureSurface` presentation states for an N-scope outcome.

---

## 5 · Two questions this census cannot answer — founder rulings owed

**Q1 · May MAIA be told that an undisclosed member exists?**

A five-member set with two `unverified` members crosses with three bodies.
MAIA can be given:

- **(a)** the three bodies only — MAIA does not know the set was larger, and
  will reason as though three places are the whole of the writer's attention;
- **(b)** the three bodies plus the *existence and position* of the other two,
  with no text — MAIA knows the attention is wider than what it can see, and
  can say so.

(b) is more truthful about the writer's act and better for the eventual
RevisionProposal. It also discloses *something* about a member the boundary did
not authorize: that it exists, where it sits, that the writer is attending to
it. That may be within `member_invoked` participation, or may be a scope the
receipt has to record. **Not decided here.**

**Q2 · Does the active target need its own receipt vocabulary?**

`activeIndex` carries no additional authority — the ruling is explicit. But an
auditor reading five identical section receipts cannot reconstruct which place
the writer was acting on, and that is exactly the fact a future RevisionProposal
will be anchored to. Either the receipt learns the distinction, or the act
record does, or it is deliberately not recorded. **Not decided here.**

---

## 6 · Standing

```text
Step 2A                     COMPLETE · read-only · nothing modified
current crossing            CANNOT represent a Focus Set (4 of 7 NO)
N-scope disclosure law      ALREADY BUILT on writers_studio.ask->maia_developmental
                            — port the law, never the route
Step 2B                     NOT OPENED · requires deliberate contract extension
                            and the two rulings in §5
BAD A / BAD B / BAD C       all three remain available today; none is taken
HELD                        RevisionProposal · staged diff · manuscript mutation
                            · write authority
```

> Do not encode a distributed Focus Set into a single-scope contract and call it
> integration.
