# EDITORIAL-LOCUS-ALIGNMENT-01 · PHASE A — READ-ONLY CENSUS

**Canonical** `212f417da`. ⛔ No repair · ⛔ no heading stripping by assumption ·
⛔ no adoption merge · ⛔ no change to `stale_base` semantics · ⛔ no widening of
editorial relationship scope.

> **THE SOLE QUESTION:** what exact textual locus does an editorial
> relationship authorize — the stored section representation, or the
> editable/projected passage within it?

---

## 0 · THE ANSWER

⭐⭐ **The contract already decided, and it says PROJECTED PASSAGE.** There is
**one producer** of `proposal_chains.expected_text` and it is the only thing in
the system that disagrees with it.

```
ProposalLocus.expectedText, in the contract's own words:

    "THE LAW ACCEPTANCE USES — the exact characters this chain may replace,
     REQUIRED TO OCCUR EXACTLY ONCE AT THE TARGET."
```

*Occur exactly once at the target* is only meaningful against the text the
target actually holds for editing — and every consumer computes it that way.

⛔ **This is therefore not a heading-stripping question.** It is narrower and
more decidable: one writer is storing a different KIND of object than the one
the type it writes into is defined to hold.

---

## 1 · PRODUCERS — there is exactly one

| site | what it writes as `expected_text` |
|---|---|
| `lib/manuscript/editorialRuntime/thread.ts:74` | ⚠️ `row.text` — the **STORED** section, heading prefix included |
| `lib/manuscript/editorialWorkspace/store.ts:376` `openChainWithInsight` | ⭐ **ZERO CALLERS** — it takes whatever its caller passes, and nothing calls it |
| `lib/manuscript/proposalChain/store.ts:222` `openChain` | reached only via the two above |

⭐⭐ **So `openEditorialRelationship` is the ONLY live producer**, and its
`SELECT` does not even join `manuscript_sections` — it has no access to the
heading it would need in order to write a projected body:

```sql
SELECT s.draft_id, d.manuscript_id, d.revision_count, s.text
  FROM manuscript_draft_sections s
  JOIN manuscript_working_drafts d ON d.id = s.draft_id
 WHERE s.id = $1 AND d.member_id = $2
```

## 2 · CONSUMERS — six, and all six read the PROJECTED body

| site | comparison |
|---|---|
| `revisionAuthorization/contract.ts:330` `resolveGuard` | `occurrences(reading.textAtTarget, chain.locus.expectedText)` |
| `revisionAuthorization/contract.ts:415` | `occurrences(reading.textAtTarget, guard.expectedText) === 1` |
| `revisionAuthorization/executionFit.ts:59` | `occurrences(reading.textAtTarget, binding.expectedText)` |
| `revisionAuthorization/execute.ts:144` | `applyExactlyOnce(split.body, guard.expectedText, replacement)` |
| `revisionAuthorization/status.ts:156` | `locate(split.body, g.expectedText, …)` |
| `proposalChain/proposalWorkTarget.ts:141` | `occurrences(section.body, expected)` |

And `textAtTarget` is itself the projection, at every site that builds it —
`store.ts:410`, `execute.ts:127`, `status.ts:142` all read
`splitStoredSection(s.text, ms.heading).body`.

```
PRODUCERS reading the stored text    1   (and it is the only live one)
CONSUMERS reading the projected body 6
```

---

## 3 · THE PROJECTION UTILITY

`splitStoredSection(text, heading)` — `lib/manuscript/sections/saveSection.ts:60`,
pure, and the single authority on what the member's editable body is.

```
heading null/blank      → { headingPrefix: '',  body: text }      ⭐ DEGENERATE
text === heading        → { headingPrefix: h,   body: '' }
text starts 'h\n'/'h\n\n' → prefix sliced off,  body: the rest
otherwise               → null                                    ⛔ unprojectable
```

⭐⭐ **The degenerate branch is why the defect hid.** With no heading,
`stored === projected`, so the one producer's output is accidentally a valid
member of the type it was supposed to be writing. Every green test and every
green witness leg used a heading-less section.

⚠️ And the writer half is the mirror image: `saveSectionInTransaction` stores
`split.headingPrefix + body`, so a replacement computed against the STORED text
would be written back **with the heading prefix inside the body** and the prefix
re-prepended — the heading duplicated. ⛔ That is why "align the consumers to the
producer" is not a candidate; see §6.

---

## 4 · THE THREE CASES

| case | what happens today |
|---|---|
| **unheaded section** | ⭐ works. `stored === projected`, `occurrences = 1`, adoption executes. Witnessed: ADOPTION-01 legs A–E, 56/0. |
| **headed section** | ⛔ **structurally impossible.** `expected_text` = `"Chapter Ten\n\nThe spiral…"`, body = `"The spiral…"`, `occurrences = 0` → `expected_text_absent` → classified **`work_moved`** → the member is told *"You've written here since this version was made"*, **which is false**. Witnessed: ADOPTION-01 leg F. |
| **body-only selected passage** | ⭐⭐ **does not exist as a gesture, and it is what the contract was written for.** `openEditorialRelationship`'s input is `sectionId` alone — *"THE ONLY THING THE MEMBER NAMES: the section they selected."* The original EDITORIAL-WRITE-01 fixtures use `expectedText: ', fixated'`, a FRAGMENT; `applyExactlyOnce` and the *exactly once* rule only earn their keep against fragments. The whole-section case is the degenerate member of that design, not its subject. |

⭐ So the surviving question is not *"should the heading be stripped?"* but
*"which text does the relationship point at?"* — and §0 shows the contract
already answered.

---

## 5 · IS THE CANONICAL EDITABLE LOCUS DEFINED ELSEWHERE? — ⭐ YES, TWICE

1. **`splitStoredSection(...).body`** is the single projection authority, used by
   the writing surface (`loadEditableSections`), the section writer, and all
   three authorization reads.
2. **`ProposalWorkLocation` / `locateInWork`** already names the coordinate
   space explicitly:

```ts
range: { space: 'projected_section_body', start, end }
```

⭐⭐ **`projected_section_body` is a NAMED COORDINATE SPACE in shipped code.**
`ChangeLocator` requires it and has no default, because *"FOCUS-W3 cost this
programme two days because offsets travelled without saying what text they
addressed."* ⛔ The one producer writes into that space without ever naming it,
and writes the wrong space's text.

---

## 6 · THE SMALLEST ALIGNMENT — identified, ⛔ NOT TAKEN

**Candidate A — the producer writes the projected body.** `openEditorialRelationship`
joins `manuscript_sections` for the heading, projects with
`splitStoredSection`, freezes `split.body` as `expectedText`, and **refuses**
(`section_unreadable`) when the split returns `null`.

```
scope      one SELECT gains a join · one expression · one new refusal
consumers  ⛔ unchanged, all six
stale_base ⛔ untouched
scope of the relationship ⛔ unwidened — still one section, still no passage picker
```

⭐ It makes opening and fit compare the same thing by moving the **one** thing
that disagrees, and it converts the silent falsehood into an honest refusal in
the unprojectable case.

**Candidate B — the consumers read the stored text.** ⛔ **Refused, and it is not
close.** `applyExactlyOnce` would produce a body containing the heading, which
`saveSectionInTransaction` would then prefix again; `ChangeLocator.range` would
address a different space than the one it declares; and `stale_base` semantics
sit downstream of both. It fails the ⛔ *no change to `stale_base` semantics*
boundary by consequence, not by intent.

**Candidate C — a member-selected passage locus.** ⭐ The contract's full intent,
and ⛔ out of scope: it widens the editorial relationship and needs its own act.
⚠️ Named here only because Candidate A is a **strict subset** of it — the whole
projected body is one lawful fragment — so A does not foreclose C.

### ⚠️ TWO QUESTIONS CANDIDATE A DOES NOT ANSWER, AND MUST NOT ANSWER SILENTLY

1. **Existing chains.** `proposal_chains` rows are immutable by design — *"a
   chain whose locus would need to change is not that chain any more."* Any
   relationship already opened on a headed section carries a heading-prefixed
   `expected_text` **for its life** and can never be adopted. ⛔ A repair cannot
   reach them, and rewriting them would be exactly the mutation the contract
   forbids. Whether they are left as permanently unadoptable, or closed, or
   re-opened as new chains, is a founder ruling.
2. **Classification.** After alignment, `expected_text_absent` becomes a true
   manuscript fact again *for aligned chains*. ⛔ But it is still reported as
   `work_moved` for chains that can never match — so the false sentence survives
   for the legacy rows unless (1) is answered. ⛔ Not reclassified here: *fix the
   locus, not the explanation.*

---

## 7 · STANDING

```
sole question                  ✅ ANSWERED — the projected passage, by contract
live producers                 1   ⚠️ and it writes the stored representation
consumers                      6   ⭐ all read the projected body
canonical locus defined?       ✅ YES — splitStoredSection + `projected_section_body`
smallest alignment             ✅ IDENTIFIED (Candidate A)

repair                         ⛔ NOT TAKEN — Phase A is read-only
existing headed chains         ⚠️ RULING OWED
refusal classification         ⛔ NOT TOUCHED
adoption merge                 ⛔ NOT AUTHORIZED
production                     UNTOUCHED
```
