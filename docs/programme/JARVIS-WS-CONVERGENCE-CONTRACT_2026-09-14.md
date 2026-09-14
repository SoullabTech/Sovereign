# JARVIS · WRITER'S STUDIO CONVERGENCE CONTRACT — 2026-09-14

Status: **conductor instrument, not a lane.** Authored above the lanes; confers no
authority over any of them. Measured, not asserted.

## 1. Lane coordinates (verified against `origin`, 2026-09-14)

| Lane | Ref | Tip | Nature |
|---|---|---|---|
| Editorial | `claude/proposal-authorization-integration` | `ab416cc5b` | code + docs, W1 and W2 landed |
| Bounded cognition / whole-view | `claude/bold-bohr-pmtynu` | `19c957d4f` | **docs + `lib/boundedCognition` only** |
| S3 programme | (own refs) | — | substrate / disclosure / deployment |

Merge-base of the two active lanes: `e1c6f527`.

## 2. The contested set is EMPTY — ⛔ SUPERSEDED BY §8 (same day)

> This section's headline claim is WRONG and is kept verbatim as the state at the
> time it was written. The intersection below filtered `__tests__/` out of both
> diffs before intersecting, which hid the one real collision. The unfiltered
> measurement is in §8. The file-count and `app/`-touch findings in this section
> are unaffected and still hold.


```
editorial lane non-doc, non-test files    215
whole-view lane non-doc, non-test files    13
files touched by BOTH                       0
```

`bold-bohr-pmtynu` touches **zero** files under `app/` or `components/`. Its thirteen
code files are `lib/boundedCognition/*` plus five `recurrence_sweep` migrations. Its
eight most recent commits are all `docs(programme)`.

**The stated collision — `canvas/page.tsx`, reveal behaviour, Whole/Section
navigation — does not exist as a collision.** Those files are already held by the
editorial lane alone:

- `app/writers-studio/canvas/page.tsx` — editorial lane only
- `app/writers-studio/canvas/revealWithin.ts` — editorial lane only

## 3. The real hazard is sequencing, and it runs one way

The whole-view repair is **ruled but unimplemented**. Its F1 ruling (`19c957d4`,
*"wrong name, not wrong behaviour; GO TO CHANGE"*) concludes the defect is the
affordance, not the mechanism — so its eventual patch lands in `canvas/page.tsx`
and the reveal path, which the editorial lane is actively rewriting underneath it.

> **The risk is not two lanes editing one file today. It is one lane ruling on a
> file another lane is remodelling, and landing its patch into ground that has
> moved.**

Adjudication rule that follows:

1. The editorial lane **owns** `canvas/page.tsx` and `revealWithin.ts` while W1–W3
   are open. It does not implement the whole-view return semantics.
2. The whole-view lane **owns the semantics** of locus return and the affordance
   name. It does not implement them into contested files while W1–W3 are open.
3. Before the whole-view lane writes code, it re-reads those two files at the
   editorial tip. A ruling made against `e1c6f527` is not automatically valid
   against `ab416cc5b`.
4. S3 keeps sovereign jurisdiction over schema, disclosure boundaries and write
   authority. No UI change may introduce a migration, widen a boundary vocabulary,
   or create a new write path. Those route to S3 as findings, never as patches.

## 4. Convergence gate

One deliberate convergence commit, only when **both** contributing lanes are green:
the accepted whole-view return behaviour is brought into the editorial workspace,
never solved twice.

## 5. Routed observations (findings, not patches)

From the live Whole-view surface, `Elemental Alchemy`, proposal panel open:

- **F-a (whole-view lane)** — panel attributes the proposal to *Section 23 · "THE
  SPIRALING PATH OF PERSONAL DEVELOPMENT"* while the viewport sits at `-- 34 of 216 --`
  in different prose. The locus strike *is* rendered and on screen, so the mechanism
  reached the right characters. This is exactly the F1 shape: the naming is wrong,
  the behaviour is not.
- **F-b (editorial lane, W3)** — *"Remove one exact passage."* and *"It describes 1
  change to the manuscript."* are database language. The proposed cut is `, fixated`,
  two words, with **no rationale offered at all**. The panel cannot say why.
- **F-c (editorial lane, W3)** — the sovereignty paragraph occupies three lines above
  the only two controls. Reduce to *"Nothing changes until you explicitly adopt a
  version."*; move custody to a disclosure.
- **F-d (editorial lane)** — MAIA pane renders ~340px. Target 460–560px, expanding
  when comparison or conversation is active.

## 6. Non-authoritative material

`claude/ws-editorial-workspace-convergence-01` — 0 commits, unpushed, unmerged,
**FROZEN SCRATCH**. Interaction ideas only. The editorial lane is ahead of it.

Note on provenance: commit `e27db04b` (*"replacement architecture charter — record
only"*) is real and lives on the editorial lane. An earlier session reported it
absent; that report was made before fetching the branch and was an artifact of an
unfetched object store, not evidence the work did not exist.

---

# 7. FOUNDER RULING — EDITORIAL DISCOURSE IS ITS OWN DURABLE OBJECT (2026-09-14)

> **Editorial discourse receives its own durable object. ProposalVersion remains
> exact candidate wording only. A conversational act may causally produce a version
> but is never stored inside, derived from, or conflated with that version.**

## 7.1 Rejected

- ⛔ Deriving conversation from version lineage.
- ⛔ Attaching the writer's direction text to the version it caused.
- ⛔ A generic `comment` table, which flattens editorial acts of differing authority
  into chat messages.
- ⛔ The claim that *"the conversation and the version lineage are the same object."*
  They are **one experience, not one object.**

## 7.2 Why attaching direction to the version is false provenance

A member DIRECTION that causes a MAIA SUGGESTION is **two authored acts**. Storing
the direction on the version makes a MAIA-authored object carry member-authored
instruction text — precisely the confusion succession was built to prevent.

## 7.3 Three layers

```
editorial_threads    one editorial encounter around a locus / ruling
editorial_turns      insight | direction | question | response | recommendation
proposal_versions    exact candidate wording only
```

```
editorial_turns                     proposal_versions
--------------                      -----------------
id                                  id
thread_id                           chain_id
author     member | maia            author           member | maia
kind       (see table below)        replacement_text
content                             rationale?
responds_to_turn_id?                supersedes
created_at                          caused_by_turn_id?
                                    authored_at
```

**`caused_by_turn_id` is provenance, not ownership.** It says *this version arose in
response to that conversational act*. It does not say *that act is part of this version*.

## 7.4 Authority per act — the reason kinds are not interchangeable

| Act | Can contain wording? | Can be authorized? |
|---|---|---|
| Insight | no | no |
| Question | no | no |
| Direction | no | no |
| Explanation / discourse | no | no |
| Recommendation to keep | no | no |
| Suggestion / ProposalVersion | yes | **yes** |
| Authorization | points to exact version | executes permission |

## 7.5 The discriminator

Turn 9 — *MAIA · INSIGHT: "Actually, I think v3 should remain unchanged."* — creates
**no version at all**. A conversation derived from proposal versions literally cannot
represent it. Any candidate design that cannot express this turn is refused.

## 7.6 The separations the surface conceals

```
conversation  ≠ formulation
formulation   ≠ authorization
authorization ≠ execution
```

The writer experiences *"MAIA and I are working on this paragraph."* The architecture
preserves all four as distinct.

## 7.7 Disposition

- ⛔ **No new implementation lane.** No succession rebuild, no migration from this
  checkout.
- The north-star artifact is **design evidence only**; its repository conclusions are
  not authoritative.
- This ruling is handed to **`claude/proposal-authorization-integration`** (at `ab416cc5b`,
  W2 landed), which implements it. It is not implemented here.
- This document is a conductor record. It is not a lane and carries no code.

---

# 8. CORRECTED COLLISION FINDING — CAPABILITY-BASED COORDINATION (2026-09-14)

> **CURRENT FILE COLLISION: effectively none except one existing test.
> PROSPECTIVE SEMANTIC COLLISION: one narrow Whole-view voluntary-return seam.
> Coordination is therefore capability-based, not branch-wide or file-wide.**

## 8.1 The true contested set

Unfiltered intersection, `e1c6f527` → `ab416cc5b` ∩ `e1c6f527` → `19c957d4f`:

```
lib/manuscript/development/__tests__/evidenceCannotAct.test.ts
```

Exactly one file. §2 reported zero because it filtered `__tests__/` out of both
diffs before intersecting — the filter hid the only real collision. Reconcile this
test separately; it is not part of the seam below.

## 8.2 The prospective seam, measured

C10 names its implementation subject as `ProposalEvidenceInWork` ↕
`WholeManuscriptSurface` / `renderProposalEvidence`. Presence at each tip:

| File | Editorial `ab416cc5b` | C10 `19c957d4f` | Status |
|---|---|---|---|
| `app/writers-studio/canvas/ProposalWorkSurface.tsx` | present | **ABSENT** | Editorial object; C10 behavioural dependency |
| `app/writers-studio/canvas/WholeManuscriptSurface.tsx` | present | present | **Narrow convergence seam** |
| `app/writers-studio/canvas/page.tsx` | present | present, unchanged by C10 | Shared only if the proof demands it |

The absence of `ProposalWorkSurface.tsx` at the C10 tip independently confirms that
lane's own plan: half its intended seam is not in its checkout.

## 8.3 No broad mutual freeze

Neither lane stops. Editorial keeps advancing workspace, succession, composer,
lineage, authorship and conversational work. C10 keeps doing bounded proof work.
There is no physical reason to serialise the programme.

## 8.4 C10 must not build against its stale half-seam — load-bearing

Once RED earns implementation, C10 **must not invent local substitutes** for
`ProposalEvidenceInWork` or `renderProposalEvidence`. That would create two
Whole-return architectures. **The editorial branch is the authoritative substrate
for the repair.**

## 8.5 Ownership: objects vs invariant

```
EDITORIAL LANE owns          C10 owns
  ProposalEvidenceInWork       voluntary Whole-return completion semantics
  proposal/version selection   pending-until-locus-exists
  the reveal act the UI emits  consume exactly once
  workspace composition        never passive-trigger
```

C10's jurisdiction is exactly one behaviour: *a voluntary Whole-view return remains
pending until the exact proposal locus has actually been addressed.* It does **not**
own the editorial panel, proposal wording, version succession, the composer,
automatic arrival, Section behaviour, passive-scroll semantics, visual redesign, or
general virtualisation.

**This prevents file ownership from becoming ontology ownership.**

## 8.6 The RED transfers before the repair does

```
Q1–Q4 read → capability falsifier → untouched-source RED for the right reason → STOP
```

On acceptance the conductor transfers the **requirement + lethal witness** into the
editorial substrate. The smallest implementation is then made against the real
proposal-work code, never against a half-present checkout.

## 8.7 Integration is one tiny convergence act

Expected surface: `WholeManuscriptSurface.tsx`, `ProposalWorkSurface.tsx`, and
`page.tsx` **only if** act/pending plumbing genuinely requires it. Containing
`revealToken` does not by itself authorise touching `page.tsx`: if the invariant can
be satisfied without altering that producer, leave it untouched.
**The implementation earns every file it touches.**

## 8.8 ⛔ Do not merge the `bold-bohr` branch into the editorial branch

That branch carries a large bounded-cognition history and migrations unrelated to
this repair. The transferable unit is **C10's accepted invariant + falsifier +
smallest implementation patch** — never the branch ancestry.

---

# 9. HELD · W5-0 PREDECLARATION — UNOPENED ACT

**Status: preserved for continuity only.**

⛔ **W5-0 is not opened by this record. No census, schema, migration,
implementation, or persistence work is authorized.** The presence of this text is
not authorization and may not be cited as such.

## 9.1 Chronology correction

The discourse-object ruling was transferred **after** W3 and W3.1 had already
landed. Its operative binding target is **W5 and everything downstream of W5**.
Earlier wording referring to *"W3/W5"* — in PR #1294's title and in the merged
ruling's closing section — names the broader editorial programme lane, **not an
uncompleted W3 act**. The merged record is deliberately left unedited.

## 9.2 Predeclared discriminator for any future W5-0 census

> Can any existing durable substrate represent **MAIA recommending that the current
> wording remain unchanged**, as an authored editorial turn, while creating **zero
> `ProposalVersion` rows**?

A **YES** answer must prove all four:

1. **Explicit authorship** — the durable act can truthfully distinguish
   MAIA-authored from member-authored discourse.
2. **Structural non-authorizability** — the act cannot itself be passed to proposal
   authorization or execution.
3. **Causal relation** — if a later `ProposalVersion` arises from the turn, that
   causal relation can be represented without placing the turn inside the version
   or falsifying either author.
4. **Zero-version case** — *"keep the current wording"* is durably representable
   with **no `ProposalVersion` created**.

**Anything less is NO.**

## 9.3 Why predeclared

Declaring the test before the census runs prevents it being satisfied by forgetting
to ask the hard question. A census that asks only *does something exist* is answered
by any table with a content column; requiring proof on all four means an existing
object earns the role or the answer is NO.
