# Inline authorial marks — storage census

**Read-only. Storage and persistence only; ⛔ no toolbar design.** Evidence class `L`.

Founder ruling 2026-09-07: *formatting may describe the text; it may not become the text.*
Canonical prose stays plain; marks are separate code-point ranges, versioned with the manuscript,
and the text digest stays uncontaminated.

---

## 0 · The finding that makes this safe

**There is one coordinate space, and it is Unicode code points.** This was not always true, and the
repair is worth knowing before anything is built on it.

`20260902000002` introduced `section_partition` and documented its offsets as **UTF-16 code units**.
`20260902000003` corrects the record: they never were. PostgreSQL's `length(text)` counts code
points and the trigger always enforced that, while the application built ranges with JavaScript's
`.length`. The two agree on the BMP and disagree on every astral character —

```
'A😀B'   JavaScript .length = 4      PostgreSQL length() = 3
```

— so **an author writing an emoji made ordinary draft creation fail.** The application was moved to
code points rather than the trigger to code units, on the reasoning that *code points mean the same
thing on both sides of the wire; UTF-16 is one runtime's encoding detail.*

So `section_partition`, `EvidenceRef`, the read ceiling and `readState`'s ranges are all code
points. **Marks in code-point ranges join an existing space rather than introducing a second one.**
⚠️ Anything built with `String.length` reintroduces the exact bug this migration fixed.

## 1 · Where section state serializes today

| where | holds | prose? |
|---|---|---|
| `manuscript_draft_sections.text` | live section text, every character exactly | **yes — canonical** |
| `working_draft_revisions.content` | flattened whole draft at a checkpoint | yes |
| `working_draft_revisions.section_partition` `jsonb` | section ids + code-point ranges | **no — "IT CARRIES NO PROSE"** |
| `readState.sections[id]` | `(revisionNumber, range, digest)` | no |
| render/export | reads `manuscript_sections` — **SOURCE**, not draft | yes |

## 2 · The smallest place — and it already exists in shape

**`section_partition` is the precedent, and marks are the same object.** A jsonb sidecar on the
revision, keyed to sections, holding code-point ranges, carrying no prose — that is a description of
what marks are. Nothing new has to be invented; a sibling column mirrors a column already ruled,
already triggered, already understood.

```text
LIVE STATE      manuscript_draft_sections.marks        jsonb   (nullable)
VERSIONED       working_draft_revisions.section_marks  jsonb   (nullable)
```

Nullable in both places for the reason `section_partition` is: **NULL means never observed**, not
"no marks". A draft that predates this must not read as a draft the writer chose to leave plain.

⛔ **Not a `marks` table.** A row per italic span would make formatting a first-class object with
its own lifecycle, and then something will eventually reference one. Marks are an attribute of a
section's text at a revision — the same thing the partition is.

## 3 · The digest is already clean, by accident of good design

```
readState.ts:379   const digest = sha256(draft.sections[i].text);
readState.ts:390   const revisionDigest = sha256(revision.content);
```

**Both digest text only.** So the founder's requirement — *changing italics must not falsely tell
BUILD-07A that the prose changed* — holds with **no change to the digest**, provided marks stay out
of `text` and out of `content`.

⚠️ **That is the whole invariant, and it is one line from being broken.** The day anyone flattens
marks into `content` for convenience — an export, a diff, a "human-readable snapshot" — every
`EvidenceRef` range in the revision store silently shifts. A test should assert `sha256` of a
section is unchanged by a marks-only edit.

⚠️ And the converse needs a decision the ruling implies but does not state: **a marks-only change
must still advance revision state** (it is authorial), while leaving the text digest identical. The
two facts diverge for the first time here. `computeStaleness` has five dimensions and `inputMoved`
means *the prose changed* — a marks-only change must not set it.

## 4 · Export is a real gap, not a detail

`render` reads **`manuscript_sections`** — the SOURCE table. Marks would live on the **draft**. So
on the current path, **italics a writer applies would not reach their exported book**, and the
failure is silent: the export succeeds and simply lacks them.

⛔ Not this census's to fix, and not a reason to store marks on the source instead — that would put
formatting on the layer the writer does not edit. Recorded as owed before anyone claims formatting
"survives export".

## 5 · What the ruling's persistence list costs

| must survive | reached by | cost |
|---|---|---|
| autosave | `PUT /draft` sections payload | carry `marks` per section |
| reload | `write-state` → `WriteStateSection` | one field |
| Keep a version | checkpoint writes `section_marks` beside `section_partition` | mirrors an existing write |
| revision history | the column above | — |
| export | ⛔ **§4** | unresolved |

## 6 · Standing

⛔ Nothing built. No migration authored. No toolbar. First marks remain **bold · italic** only;
headings, lists and block quotes are structural and were ruled out of this cut.

Owed before BUILD: the export gap (§4), and whether a marks-only change advances revision state
without setting `inputMoved` (§3).
