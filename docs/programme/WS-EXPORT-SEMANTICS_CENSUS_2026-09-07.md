# Export semantics — what each gesture claims, and what it reads

**Read-only reconciliation.** ⛔ No repair, no design. Evidence class `L`.

Founder question: *what does each existing export button claim to export, and which state does it
actually read?*

---

## The answer, first

**There are two manuscript exports and NEITHER exports the writer's draft.** One exports kept
passages; the other exports the Source. **No gesture anywhere exports what the writer is actually
writing** — so the export gap is not that marks would be missing from an export of the draft. It is
that *there is no export of the draft*.

## The three gestures

### 1 · Studio rail → **Export** · *"Take your writing out."*

`studioMap.ts:232` → `/press/manuscript?tab=export`. **A route, not an act** — it navigates to the
tab below. The note *"Take your writing out"* is the strongest claim of the three and the one
furthest from what arrives.

### 2 · The export tab → **Download as Markdown**

> *"Download what you kept and what you placed — your exact words, with the section each came from."*

Reads `keeps` + `collections`. **Claim and behaviour agree exactly** — this is honest and precise,
and it is the only one of the three that is. ⛔ It is not a manuscript export and does not pretend
to be. Marks are irrelevant to it: a keep is a passage, and the promise is *your exact words*.

### 3 · `POST /manuscripts/[id]/render` → `.docx` / `.pdf`

```sql
SELECT heading, body FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position
```

**`manuscript_sections` is the SOURCE table.** Its own header says *"The author's own words, set as a
book — their sections, in order, verbatim."* True of the Source. ⚠️ **Not true of the draft**: every
edit a writer has made in WRITE lives in `manuscript_draft_sections`, and this reader never touches
it.

⛔ **So today a writer can revise a chapter in WRITE, export to `.docx`, and receive the
pre-revision text — silently.** The export succeeds. Nothing refuses. This is not caused by marks and
is not created by adding them; the census merely found it.

## What that does to the ruling

The founder's rule — *text and marks must come from one custody state; never SOURCE text + DRAFT
marks* — is already violated in its first half, before formatting exists:

```text
RULED       one revision:  content · section_partition · section_marks
TODAY       render reads SOURCE; the draft is not exported at all
```

**So the three-way disambiguation the founder asked for resolves as:**

| gesture | what it is | what it needs |
|---|---|---|
| Download as Markdown | keeps export | nothing — honest today |
| render `.docx`/`.pdf` | **Source export**, misnamed | to be named as Source export, OR rebuilt against a draft revision |
| rail "Export" | navigation | to stop promising "your writing" while it leads to the above |

⛔ **And the authorship constraint bites here.** A draft-backed export cannot silently checkpoint to
obtain a frozen revision — *a version the writer did not choose to keep is still not a kept
version.* Two shapes remain, and both are the founder's to rule:

- export the **latest kept version** (a real frozen revision: `content` + `section_partition` +
  `section_marks`), saying which one and when it was kept; or
- export a **read-only snapshot of the current draft**, minting no revision, and saying plainly that
  it is the draft as it stands rather than a kept state.

## Standing

⛔ Nothing repaired. The Source/draft export divergence is **pre-existing and independent of
formatting** — it should not be absorbed into a marks lane, and marks should not be blamed for it.

The formatting substrate is otherwise constituted: one code-point coordinate space, a sidecar shape
with precedent, a text-only digest, and the marks-only staleness rule ruled. **What remains before
bold + italic can ship end to end is an export that reads the draft at all.**
