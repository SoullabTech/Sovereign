# PT-3 Falsifier — proposed design

**Return gate:** FOUNDER RULING — WRITER'S STUDIO · LIFE OF A WORK (2026-09-08).
**Status:** ⛔ DESIGN ONLY — proposed for founder review. Not built, not authorized.

> Can we prove that every content-working path available to Writer's Studio acts only upon a
> descendant representation and cannot mutate the historical Source?

---

## 1. The question PT-3 does not yet answer: *which* Source?

Before a falsifier can be written, the referent of "the historical Source" must be settled, because
**the repository contains two objects that both currently answer to the name, and they are not the
same thing.**

```
ARRIVAL          manuscript_source_arrivals   the bytes/text as they arrived  (immutable witness)
     ↓ segment()                              ← an INTERPRETATION happens here
SECTION CUT      manuscript_sections          headings fused with the text between them
     ↓ convertDraft()
WORKING DRAFT    manuscript_working_drafts / manuscript_draft_sections / working_draft_revisions
```

The WS-01 custody migration says so in its own header: *"what the product called 'source' was already
an interpretation, and arriving lines could be discarded before the member ever opened the Work."*
And `manuscript_working_drafts.base_source_hash` hashes **the section cut**, not the arrival.

So PT-3's phrase *"the historical Source **from which a Working Draft was created**"* points, on the
literal wiring, at `manuscript_sections` — while the object that actually deserves the constitutional
word *historical* is `manuscript_source_arrivals`.

**A falsifier that silently picks one proves the wrong theorem.** The proposal below therefore tests
**both tiers separately** and reports them separately. Whether PT-3's custody promise covers the
arrival only, or the arrival *and* the section cut, is a founder question this design surfaces rather
than resolves. It is the first thing the review should answer.

---

## 2. Mutation-boundary census (read-only, performed 2026-09-08)

Every write reaching a Source-tier table in shipped code (`app/**`, `lib/**`, tests and witness
scripts excluded):

| # | Site | Table | Statement | Classification |
|---|---|---|---|---|
| S1 | `app/api/sovereign/manuscripts/route.ts:232` | `manuscript_sections` | `INSERT` | **Creation** — the import that makes the cut |
| S2 | `lib/manuscript/source/arrivals.ts` | `manuscript_source_arrivals` | `INSERT` / `UPDATE` | **Creation + claim** (`claimArrival`) |
| S3 | `lib/manuscript/source/arrivals.ts:144` | `member_manuscripts` | `UPDATE source_custody` | **Custody bookkeeping** |
| S4 | `lib/manuscript/source/eraseManuscript.ts` | `member_manuscripts` + cascade, `vault_erasure_queue` | `DELETE` / `INSERT` | **Member-directed lifecycle** — PT-3's amendment, explicitly legitimate |

Every content-working module writes **only** descendant tables:

| Module | Writes |
|---|---|
| `lib/manuscript/sections/saveSection.ts` | `manuscript_draft_sections`, `manuscript_working_drafts` |
| `lib/manuscript/sections/convertDraft.ts` | `manuscript_draft_sections`, `working_draft_revisions`, `manuscript_working_drafts` |
| `lib/manuscript/sections/normalizeLegacyScaffold.ts` | `working_draft_revisions`, `manuscript_draft_sections`, `manuscript_working_drafts` |
| `app/api/sovereign/manuscripts/[id]/draft/route.ts` | the three draft tables |
| `lib/manuscript/structure/authorStructure.ts` | `manuscript_structure_units`, `_members`, `_proposals` |

### The finding that makes the falsifier worth building

**PT-3 currently holds as a property of the code, not as a boundary.**

There is no constraint, no trigger, no grant, and no seam that would refuse a content-working act
that reached for `manuscript_sections`. The section cut is an ordinary mutable table sitting inside
the same connection, the same transaction helper, and the same privileges as the draft tables. Today
nothing writes it; **tomorrow a `WRITE` gesture, a formatting correction, a Restore implementation,
or an LLM-proposed repair could, and nothing in the system would notice.**

That is exactly the condition PT-2 anticipates when it says the authority axis must ultimately be
enforced *at the mutation boundary* rather than treated as descriptive state.

**A falsifier that only demonstrates the happy path would therefore return GREEN today and would have
returned GREEN on the day the breach shipped.** It must be built to fail.

---

## 3. Proposed design

Form follows the existing precedent, `scripts/verify-ws01-source-custody.ts`: real database, real
file vault, disposable fixture member, explicit confirmation env var, everything it creates deleted.
Proposed name `scripts/witness/pt3-source-custody-falsifier.ts`.

### 3.1 Leg A — STATIC: the census, made executable

Scan shipped source for any write statement targeting a Source-tier table, and require every hit to
appear on a **named allowlist of four**, S1–S4 above, each with its classification.

- A new Source write anywhere in `app/**` or `lib/**` **fails the gate** until it is classified and
  admitted by a ruling.
- Comments are stripped before scanning (C21 precedent — a file that documents its own compliance
  must not read as the violation).
- The allowlist is **named, never a count**: FR-14 discipline. *An instrument can satisfy all of its
  remaining questions by forgetting to ask the difficult ones.*

Leg A is what makes PT-3 durable. It converts "nothing currently does this" into "nothing may begin
doing this silently."

### 3.2 Leg B — BEHAVIOURAL: drive the real content-working paths, then diff the Source

Fixture: one member, one arrival (both `artifact_extraction` and `member_supplied_text`), one claimed
manuscript, one working draft.

Take a **before witness** of both Source tiers — arrival row + `artifact_hash` + `source_text_hash` +
recoverable vault bytes; and the full `manuscript_sections` set with a digest over
`(position, heading, body, heading_depth, heading_signal)`.

Then exercise **every content-working path reachable in Writer's Studio**, through its real code path,
not a reimplementation: section save · draft convert · legacy-scaffold normalize · structure
proposal accept · heading-depth confirm · keep-a-version · render/export · Develop and Ask (read-only
by contract — included precisely to prove the contract) · any WRITE gesture reachable from Canvas.

After **each** act: re-witness both tiers and require **byte-identical** results — arrival hashes
unchanged and bytes still recoverable, section digest unchanged, row count unchanged.

### 3.3 Leg C — ADVERSARIAL: attempt the breach

The founder's requirement is that the falsifier *attempt to break PT-3*. Five attacks, each of which
**must be refused or must be reported as an unenforced boundary**:

| | Attack | What a pass means |
|---|---|---|
| **B1** | A content-working act with a **crafted section-shaped payload** — a save whose target id names a `manuscript_sections` row rather than a `manuscript_draft_sections` row. | The path resolves ids in a tier-scoped way; a Source id cannot be smuggled into a draft mutation. |
| **B2** | **Direct write with the application's own credentials**: `UPDATE manuscript_sections SET body = …` on the fixture, exactly as a future feature would issue it. | ⚠️ **This is expected to SUCCEED today.** That success is the finding, and the falsifier must report it as `PT-3 UNENFORCED AT THE DATABASE BOUNDARY`, not as a test failure to be worked around. |
| **B3** | **Erasure is not editing**: run `eraseManuscript` and require the Source to be *gone*, not *altered*. PT-3's amendment protects the member's lifecycle authority; it must not be implemented as immutability that traps them. | Custody is against working acts, not against the owner. |
| **B4** | **Custody without bytes is not custody** (inherited from the WS-01 negative leg): delete the vault artifact, leave every column intact, require verification to FAIL. | A hash over unrecoverable bytes proves nothing. |
| **B5** | **Re-import / re-claim collision**: a second arrival claimed onto an existing manuscript must not rewrite the first arrival's row. | A returned Work cannot overwrite its own history by arriving again. |

### 3.4 Reporting

`PASS` requires: Leg A allowlist exact · Leg B all digests identical · B1, B3, B4, B5 as specified.
**B2 is reported as a named standing condition, not silently absorbed** — and it is the substantive
output of the first run.

Anticipated first-run verdict, stated in advance so the run cannot be read as vindication:

> **PT-3 holds behaviourally and is unenforced structurally.** No content-working path mutates the
> Source. Nothing prevents one from doing so.

---

## 4. What this design deliberately does not decide

- **Which tier PT-3 protects** (§1) — founder question, first item for review.
- Whether B2 should be **closed** (a `BEFORE UPDATE` refusal trigger on `manuscript_sections`, a
  separate least-privilege role for content-working paths, or a seam that owns all Source writes) or
  **left open and watched** by Leg A. Closing it is a schema/grant act and is **not authorized here**.
- Whether `manuscript_structure_*` counts as descendant or as Source-adjacent (it references section
  ids without mutating them).
- Anything downstream on the authorized sequence: Encounter, hierarchy, intention authority, quiet
  manuscript, Restore, lineage.

**Nothing above is built.** The next act is founder review of §1 and of the B2 disposition.
