# `OBSERVATION-ADDRESS-01` — READ-ONLY CENSUS + SPECIFICATION PROPOSAL

Authority to produce this: `HOME_ARRIVAL_AND_OBSERVATION_ADDRESS_RULING_v1.md` §11.5
(*prepare a read-only dependency/specification proposal, not implementation*).
Question set: `DURABLE_PLACE_AND_OBSERVATION_ADDRESS_CANON_v1.md` §28.

⛔ **This opens nothing.** No schema · no migration · no code · no lane.
⛔ The flagship candidate is unmutated by this document.

---

# PART I — THE CENSUS

## ⭐⭐ HEADLINE: THREE OF THE CANON'S FOUR PLACES ALREADY EXIST AND ARE STRONG. THE FOURTH HAS ZERO SUBSTRATE.

| §3 | Place | Substrate |
|---|---|---|
| B | Historical authored place | ✅ **STRONG** — frozen `DevelopmentalReadState`, per-section digests, immutable readings |
| C | Reading evidence place | ✅ **STRONG** — `EvidenceRef` × 6 kinds, code-point ranges, `recoverEvidence` digest-verified |
| A | Current authored place | ⚠️ **PARTIAL** — `locateCurrent` resolves **three** states; the canon names **eight** |
| D | **Member relationship place** | ⛔ **NONE** — no table, no type, no resolver, nothing |

⭐ That asymmetry is the whole finding. `BUILD-07A` built a rigorous address
system **for MAIA's evidence**, anchored BACKWARD by design. The canon's §3D —
the place *the member* meant, which must survive ordinary editing FORWARD — was
never in that lane's scope, and nothing has built it since.

---

## Q1 · Work and version identity — ✅ EXISTS, and it is sequenced

`member_manuscripts(id)` · `manuscript_working_drafts(id)` ·
`working_draft_revisions(draft_id, revision_number)` with
`UNIQUE (draft_id, revision_number)` and `revision_number > 0`.

⭐ **§17's worry is already answered**: *"a timestamp alone may be insufficient
if multiple mutations occur within one time window"* — revision identity is an
**integer sequence**, not a timestamp. Two mutations in the same millisecond are
still two revisions.

## Q2 · Address objects — ✅ EXIST, six kinds

`SectionRef` · `PassageRef` · `SectionRunRef` · `StructureUnitRef` ·
`StructureUnitsRef` · `StructureTopologyRef`. ⭐ Three are textual, three
structural, and the split is already the canon's own §19 distinction.

## Q3 · Are section ids stable across edits? — ⚠️ STABLE, BUT NOT BY INVARIANT

`manuscript_sections.id` is a uuid, and **only one code path inserts these rows**
(`app/api/sovereign/manuscripts/route.ts`, at ingest). ⛔ No path deletes or
recreates them, so ids are stable in practice.

⚠️ **But that is a consequence, not a guarantee.** Nothing refuses a future
re-ingest that recreates rows, and the day one does, every stored member
observation detaches silently. ⭐ If durable member place is built on
`section_id`, that stability must become an enforced invariant, ⛔ not a
property inherited from the absence of a feature.

## Q4 · How are ranges represented? — ✅ `CodePointRange`, and correctly

Inclusive start, exclusive end, **Unicode code points, never UTF-16 units**.
⭐ Already better than the canon's D-A1 shape in the axis that silently
corrupts non-ASCII text.

## Q5–Q7 · What persists, and where

| Object | Store | Mutability |
|---|---|---|
| Source sections | `manuscript_sections` | insert-at-ingest |
| Draft revisions | `working_draft_revisions` | **append-only**, UPDATE refused |
| MAIA readings | `developmental_readings` | **immutable**, UPDATE aborts |
| Observation standing | `developmental_observation_standing_events` | append-only event stream |
| **Member observations** | ⛔ **nowhere** | — |
| **Last place** | ⛔ **nowhere** | — |

## Q8 · Is there already a content-hash / anchor mechanism? — ✅ YES, THREE

Per-section `digest` in the frozen read state · `input_fingerprint` on the
reading · `structureFingerprint`.

⭐⭐ **So change DETECTION is solved. Change RELOCATION is not.** The system can
already say *this is not what MAIA read*; ⛔ it cannot say *and here is where it
went*. That one sentence is the lane.

## Q9 · How does the current address behave under insertion/deletion? — ⚠️ SPLIT

- **Cross-section edit** → `sectionId` unaffected; the address survives.
- **Intra-section edit above the range** → the code-point offsets shift; the
  address now names different characters.

⭐ For MAIA evidence this is CORRECT and not a bug: the offsets are frozen
against `revision_number`, the digest catches the divergence, and the answer
*superseded* is the honest one. ⛔ For a member's own mark it is the canon's
**D-A2** exactly — *editing paragraphs above an observation detaches it*.

## Q10 · Schema-backed vs in-memory

⛔ **The entire flagship Studio is in-memory.** `lib/writersStudio/studio/**`
holds the machine, capability resolver, language guard and observation
constructors; none writes anything. ⚠️ That is the §23 hazard stated plainly:
every mark the flagship can currently make is **EPHEMERAL** while its surface
reads as durable.

## Q11 · Privacy / retention

Readings cascade from `member_manuscripts`; standing events use
`ON DELETE RESTRICT` on the member so *a member is not deleted out from under
their own record*. ⭐ §22's minimisation posture therefore has precedent to
follow rather than invent.

## Q12 · Migrations that would be required

1. member observations — **new table**;
2. durable last place — **new table or column**;
3. reading evidence — ⛔ **NONE**. It is already schema-backed and immutable.

---

# PART II — ⭐⭐ THE TENSION THE SPEC MUST RESOLVE

The canon (§6) requires eight resolution states. `locateCurrent` returns three:
`current` · `superseded` · `unmeasured`.

⛔ **`superseded` collapses MOVED, CHANGED, SPLIT, MERGED and MISSING into one
word.** For the member those need different sentences and different actions —
*this passage moved* and *this wording is no longer in your draft* are not the
same news.

⭐ **But this is NOT a defect in `locateCurrent`, and widening it would be a
mistake.** That resolver is documented *never fuzzy*, and deliberately so: the
canon's MOVED means *the same material can be **confidently located** elsewhere*,
which is a **matching** operation. Teaching the evidence resolver to match would
give MAIA's evidence a capability its lane explicitly refused it — and the first
casualty would be D-A3, *stale evidence silently updates to current wording*.

⭐⭐ **THE CANON ALREADY CONTAINS ITS OWN ANSWER, IN §4: DO NOT COLLAPSE THE
FOUR.** Evidence place resolves backward and never guesses. Member place
resolves forward and may guess — **provided it discloses that it guessed**.
They are two mechanisms because they are two different promises.

⛔ So the spec must NOT extend `locateCurrent`. It must add a sibling.

---

# PART III — SMALLEST LAWFUL BOUNDARY (Q13 · Q15)

⭐ §29: *not a generalized annotation platform* — the minimum that truthfully
unlocks R5, returning state and R9.

**IN SCOPE — two objects and one resolver:**

1. **`member_observations`** — owner · Work · durable id · `section_id` ·
   `CodePointRange` · `revision_number` at creation · member wording · kind
   (`noticed | question | possibility`) · created/edited · resolution state.
   ⭐ The address is a `PassageRef` **plus the revision it was made against** —
   reusing the existing type rather than inventing a second address vocabulary.

2. **`member_last_place`** — Work · mode · section · optional locus · timestamp.
   ⛔ One row per member per Work, **overwritten**, never an event stream:
   §14's *not surveillance-like replay*, made structural. An append-only table
   here would BE D-A10.

3. **`resolveMemberPlace()`** — the forward resolver, returning the canon's
   eight states, ⛔ never silently choosing among them.

**OUT OF SCOPE, and each needs its own act:** related passages · declared maps ·
templates · proposals · applied-revision lineage · cross-reading reconciliation ·
MAIA-observation durability beyond what `developmental_readings` already holds.

⚠️ **One thing the minimum does NOT unlock, stated so it is not discovered later:**
a seedable beta environment (§25) needs **revision + Undo lineage** too, and that
is the applied-revision object listed as out of scope. ⭐ So this substrate
unlocks R5 and returning state **fully**, and R9 **partially**. ⛔ Claiming
otherwise would repeat the defect this whole lane exists to refuse.

---

# PART IV — FALSIFIERS (Q14)

Each must go RED against a candidate that lacks the property.

| # | Falsifier | Kills |
|---|---|---|
| MA-F1 | Insert a paragraph **above** a member observation in the same section; it still names the member's words | D-A2 |
| MA-F2 | Reword the marked passage; the observation reports **CHANGED**, keeps the original wording, and does not repoint | D-A3 |
| MA-F3 | Split the section; the observation reports **SPLIT**, ⛔ does not pick one | D-A8 |
| MA-F4 | Delete the marked text; reports **MISSING** and is ⛔ **not dropped** | D-A7 |
| MA-F5 | Two plausible matches → **AMBIGUOUS** with both offered | D-A8 |
| MA-F6 | Reload after sign-out; the observation is still there | D-A12 |
| MA-F7 | Surfaced anywhere, it reads **you noticed this** | D-A6 |
| MA-F8 | Arrival with no durable last place omits the sentence entirely | D-A5 |
| MA-F9 | `member_last_place` holds **exactly one row** after fifty navigations | D-A10 |
| MA-F10 | An EPHEMERAL note is visually distinguishable from a durable one | D-A12 |
| MA-F11 | `manuscript_sections` row identity cannot be recreated for an existing Work | Q3's latent hazard |

⭐ **MA-F11 is mine, not the canon's**, and it is the one a competent
implementation omits: every other falsifier assumes `section_id` is stable, and
Q3 shows that today it is stable only because nothing re-ingests.

---

# PART V — WHAT THIS DOCUMENT DOES NOT DO

⛔ Does not open the lane · propose a migration file · choose a matching
algorithm (MOVED's *confidently* is a product threshold and is **founder
territory**, since it decides when the Studio may guess on a member's behalf) ·
authorise any schema change · claim R9 is unblocked.

⭐ **The narrowest next act**, if the founder opens one: ratify the
**two-resolver separation** — evidence resolves backward and never guesses,
member place resolves forward and always discloses. Everything else in Part III
follows from it; ⛔ and if it is decided the other way, Part III is the wrong
design and should be rewritten rather than amended.
