# `WRITERS-STUDIO-CONVERGENCE-01` / C5 — REFERENCE CENSUS AND BOUNDED ACT PROPOSAL

**Read-only.** No code written. No branch merged. No authorization claimed.

- Convergence line head: `405660695` (`claude/ws-convergence-c2-c4`), descends from A1 (`e001cd7e5`) and I1A (`7a91d6992`).
- Reference implementation: `origin/feature/ws-manuscript-margins-20260919` @ `e255688c9`.
- Merge base: `80667d4c9`. 17 commits · 25 files · +1,597 / −277.

---

## §1 — THE HEADLINE CORRECTION

⭐⭐ **THE REVISION OFFER PATH IS LIVE, UNDER A DIFFERENT NAME, AND IT IS ALREADY ON THE
CONVERGENCE LINE.**

I previously reported that MAIA has *no route by which to offer a revision*, on the
strength of `lib/manuscript/revisionAuthorization/contract.ts` declaring
*"`RevisionOffer` — ⛔ NO PERSISTENCE, AND NONE AUTHORIZED."* That is true of
`RevisionOffer`. ⛔ **It is not true of the capability.**

`lib/writersStudio/rebuild/editorialCollaboration.ts` is present on the convergence
line **today** and exports the whole loop:

| Act | Function | Route |
|---|---|---|
| bind a passage | `openBoundEditorialPassage(sectionId, range, revision)` | `POST editorial/passage` |
| MAIA proposes | `sendBoundEditorialTurn(...)` → `producedVersionId` | `POST editorial/turn` |
| member revises the proposal | `POST editorial/version` | live |
| apply | `adoptBoundEditorialVersion(threadId, sectionId, versionId)` | `POST editorial/adoption` |
| undo | `POST editorial/undo` | live |
| recover after reload | `discoverEditorialRelationships` / `readBoundEditorialThread` | live |

`RevisionOffer` is a **second, unbuilt ontology for the same act**. It does not need to
be built. ⛔ **Building it would create the duplicate mechanism the OBSERVATION-IDENTITY
ruling refused in another place.**

**Consequence for scope**: the act the founder described — *connect Guided reading →
member declaration → "then let's change it" to the existing substrate* — requires
**no new persistence and no new route**. It is a composition act.

---

## §2 — PROVEN PATTERNS, PORTABLE

The reference branch's `app/writers-studio/__tests__/sharedEditingJourney.test.ts` drives
the real client functions through **finding → proposal → preview → apply → undo →
recovery**, and ends on `/writers-studio/develop` (⭐ no loss of place). It is a component
journey test — ⛔ not evidence of model quality and ⛔ not evidence of durable writes.

**P1 · Understand before change.** With no version present the desk offers
*Help me understand* · *Explain what I meant* · *Explore another approach* · **Try a
revision** · *Edit my words* · *Keep my wording*. The foot reads
*"Highlighted text is the passage we are discussing. No edit proposed yet."*
⭐ This is the answer to *"she is smart enough to allow the writer edit options"*:
MAIA proposes **on invitation**, and the invitation is one button, not a mode.

**P2 · `Notice → Discuss → Try → Decide`**, rendered as four `data-state` steps.
Orientation without navigation.

**P3 · `Read in context` gates `Use this revision`.** `previewReviewed` — the member
cannot apply a change they have not seen inside its paragraph. ⭐ A consent gate that is
not a modal.

**P4 · Staleness guards.** `matchesLocus` (`thread.locusText === currentText`) and
`version.id !== appliedVersionId`. A proposal against moved text never previews and never
applies.

**P5 · Repetition-function discipline, in the instrument.** The turn prompt carries
*"Do not assume a noticed pattern is a defect or that agreement is required … Consider
the strongest case for the original."* ⭐ This is the founder's *understand its function
before treating it as a problem*, already written down.

**P6 · The disagreement law, implemented ahead of ratification.** *"My explanation may
change your interpretation: acknowledge that explicitly when it does."* ⚠️ The law itself
(*evidence revises the reading, ⛔ does not delete it, ⛔ does not automatically win*)
remains **NOT RATIFIED**; the prompt is a behaviour, ⛔ not the law.

**P7 · The elemental direction, member-authored.** Fire·Inspiration · Water·Meaning ·
Earth·Form · Air·Relationship, stored in the **existing** `work.purpose`, the member's own
sentences under a member-selected dimension. Unreached dimensions are **absent** from the
serialization, ⛔ not blank and ⛔ not written as *Still discovering* — which is exactly
what the arrival design candidate required.

**P8 · Plurality where a single edit would assert consequence.** *Explore another
approach* asks for **two approaches including keeping it as it is**. ⭐ Two options say
*here is the space*; one says *this is wrong*. Same capability, no verdict.

---

## §3 — DEFECTS FOUND IN THE REFERENCE, NAMED BEFORE PORTING

⛔ These are the reasons the branch is **reference, not merge**.

**D-A · `parseWorkDirection` classifies legacy free text as Fire.**
`if (!sawHeader) parsed.fire = value.trim();` — an existing `work.purpose` written before
the elemental form is assigned the **Inspiration** dimension the member never chose.
⛔ FR-06 (*free text is expressive only, never inferred into taxonomy*) and the arrival
law (*the writer's OWN SENTENCES are stored, never an elemental classification inferred
from free text*). **Must not port as written.**

**D-B · *Leave open for now* is indistinguishable from never-reached.**
Both serialize to absence. The arrival design candidate ruled **three** states —
never-declared · declared-open · declared — and this carries **two**. ⚠️ Acceptance
condition 3 fails in data, not only in visual design.

**D-C · The direction is a de-facto schema inside a free-text column.** Round-tripped by
the `^(Fire|Water|Earth|Air) · (Inspiration|Meaning|Form|Relationship)$` regex. A member
who writes that string in their own words corrupts the parse. Low severity, real.

**D-D · ⚠️⚠️ THE DIRECTION ENTERS THE EDITORIAL PROMPT WITHOUT A PER-TURN MEMBER ACT.**
`RebuildStudioClient.tsx:804` prepends `work.purpose` to every editorial turn, labelled
*"use it as orientation, never as authority over the author."*

- ✅ **Not a §E breach.** `DevelopmentalReaderRequest` carries exactly
  `commissionedLens · evidence · recovered`. The **reader** is untouched. This is the
  revision *conversation*, a different boundary.
- ⚠️ **But the mitigation is a sentence in a prompt, and a prompt string is not a guard.**
  §10.3 holds that the Compass *licenses nothing about the text* and *may never be
  restated as an observation*. Nothing structural prevents a turn from answering
  *"the book does X"* on the strength of the declaration.
- ⛔ **NOT RULED.** This is the one genuinely open constitutional question in the port,
  and it should be answered before the direction is wired, not after.

---

## §4 — THE BOUNDED ACT PROPOSED (⛔ NOT AUTHORIZED)

`WRITERS-STUDIO-CONVERGENCE-01 / C5 — GUIDED EDITORIAL LOOP`, from `405660695`.

**One composition act.** ⛔ No new table · ⛔ no new route · ⛔ no new ontology ·
⛔ no facet selector · ⛔ no Commission layer · ⛔ no Editorial Reading · ⛔ no ranking ·
⛔ no pass synthesis · ⛔ no deploy.

**In scope — port P1–P6 and P8 onto the current line:**
1. `RevisionDesk` inline branch: the pre-version action set, the four-step path, the
   `Read in context` → `Use this revision` gate, the staleness guards, and the two prompt
   disciplines (P5, P6).
2. Keep the C2–C4 shell as it stands; ⛔ do not import the reference branch's rail,
   `DevelopRoom` rewrite, or `WholeManuscriptSurface` changes wholesale.
3. Port `lib/writersStudio/developReadingContext.ts` unchanged — it is pure and depends
   only on `sectionIdsOf`.

**In scope — P7 with D-A and D-B repaired:**
4. `parseWorkDirection` must **refuse to classify** unheadered text: it is returned as a
   legacy statement displayed as the member wrote it, ⛔ never placed under Fire.
5. A dimension the member explicitly left open must be **representable and distinct** from
   one never reached. If that cannot be done in `work.purpose` without a schema, then
   ⛔ P7 does not ship in this act and the direction block stays as it is today.

**Held out of scope pending a founder ruling:**
6. **D-D** — whether the Work direction may enter the editorial turn prompt automatically,
   or only on the member's *"Use this in our conversation"* act. ⛔ Until ruled, the port
   carries the direction **only on that explicit member act**, which is the narrower and
   reversible reading.

**Acceptance (structural, mechanical):**
- A1: with no version, `Try a revision` is present and reachable; the foot says no edit is
  proposed.
- A2: `Use this revision` is disabled until `Read in context` has been taken.
- A3: a version whose `locusText` no longer matches the section text never previews and
  never applies.
- A4: the turn prompt for a proposal contains the strongest-case-for-the-original clause
  and the pattern-is-not-a-defect clause.
- A5: unheadered legacy `work.purpose` round-trips **unclassified** — no elemental
  dimension is asserted. (Kills D-A.)
- A6: `DevelopmentalReaderRequest` still carries exactly
  `commissionedLens · evidence · recovered` — type-level, over everything handed to
  `renderRequest`. (The §E guard, unchanged.)
- A7: the C2–C4 gates still pass; nothing left the studio map.

**Founder witness owed, ⛔ not substitutable:** whether the loop reads as *one
conversation about my sentence* rather than *a tool I am operating*; and §X — whether the
teaching describes technique rather than prescribing quality. ⭐ **UNKNOWN — REQUIRES
HUMAN WITNESS.**

---

## §5 — STANDING

REFERENCE CENSUS ✅ COMPLETE (read-only) · REVISION SUBSTRATE ⭐ FOUND LIVE ON THE
CONVERGENCE LINE · `RevisionOffer` ⛔ NOT NEEDED · FOUR REFERENCE DEFECTS NAMED ·
D-D ⛔ NOT RULED · C5 ⛔ PROPOSED, NOT AUTHORIZED · ⛔ NO MERGE OF
`feature/ws-manuscript-margins-20260919` · ⛔ NO CODE WRITTEN · PRODUCTION UNTOUCHED.
