# Export settle reachability — closing the guard

**Lane**: Writer's Studio · export semantics · act 2 of 2
**Branch**: `fix/export-current-draft`
**Founder ruling**: 2026-09-07 — *"a reachability defect inside the already-authorized export repair, not a new capability"*
**Status**: BUILT · tests green · ⛔ NOT MERGED · ⛔ NOT DEPLOYED · ⛔ NOT WITNESSED

---

## 1 · The defect

`7616f5418` fixed *which state the renderer reads*. It did not close the export promise: the
`draftVersion` guard was **optional and enforced when present**, and the only caller posted
`{ format }`. The route said so in its own comment — *"a caller that omits it gets no settle
guarantee"* — and shipped anyway.

> **A guard nothing is obliged to reach is not a weaker guard. It is an absent one dressed as a
> present one.**

## 2 · Two changes, and the second is architectural

### 2a · The claim is obligatory, and the read is one statement

`draftVersion` is now **required whenever a draft exists** → `409 settle_required`. A claim that
disagrees → `409 unsettled_draft`. A claim about a draft that does not exist → `409`. A manuscript
that has **never been drafted** needs no claim: the Source *is* the current state there.

⛔ **The version and the text now come from ONE statement.** The founder's extra condition, and the
load-bearing part of this act:

```sql
SELECT wd.version, wd.content, (wd.section_addressable_at IS NOT NULL) AS addressable,
       COALESCE((SELECT json_agg(ds.text ORDER BY ds.position ASC)
                   FROM manuscript_draft_sections ds WHERE ds.draft_id = wd.id), '[]'::json)
  FROM manuscript_working_drafts wd
 WHERE wd.manuscript_id = $1 AND wd.member_id = $2
```

Two statements — `SELECT version` then `SELECT text` — would make the guard a **precheck**, with a
window between *"the version is the one you settled"* and *"these are the characters"*. A save
landing in that window exports text the caller never acknowledged **while the version check says it
did**. Same shape the Circles FR-18 repair removed: *the authority is the READ, not something asked
before it.* PostgreSQL evaluates one statement against one snapshot.

### 2b · ⭐ The export gesture moved to where settling is possible

**The Press room cannot honour the ruling.** It does not own the writing queue, so it cannot flush a
save still in flight in the writing room. Asked to export at that moment it would read a version the
server agrees with, the pending sentence would land a moment later, and the writer would receive a
book missing the paragraph they had just typed — **successfully, with nothing raised**.

Only the surface holding the pending edit can settle it. So Export now exists **in the writing
surface**, beside Keep a version, and the settle and the export are one act:

| surface | promise |
|---|---|
| writing room (`TakeItOut`) | **settles** — flush, wait for quiet, name the acknowledged version, or refuse |
| Press room (`exportWithoutSettling`) | **movement detection only** — reads the acknowledged version and names it; holds no queue, so it settles nothing |

⛔ The weaker path is a **separately named function**, not a flag. A boolean would let a call site
opt out of the guarantee while still reading as the guaranteed path; a different name makes the
weaker promise visible where it is chosen. Its residual window — a save from the writing room
landing between its version read and the server's read — is **stated, not closed**, and is the
reason the writing room has its own Export.

### 2c · One settle, not two look-alikes

`lib/writersStudio/settleDraft.ts` — flush → wait for quiet or refuse → read the version. Keep a
version was refactored **onto** it rather than beside it. Two gestures that name a draft state must
not each grow their own idea of when a draft is settled: both would still "settle", just not the
same way, and the drift would be invisible. `settleDraft` returns the version it settled to, so
nothing reads the queue again beside it.

⛔ Step order is the guarantee: the queue's version advances as saves are acknowledged, so a version
read mid-flight names a state that is **about to stop being true** — and the server, told it, would
agree with a claim the writer never made.

## 3 · The decisive falsifier, as pinned

> Edit a sentence, press Export while that edit is still pending, and the exported file must either
> **contain** that sentence or **refuse**. It may never successfully download without it.

`lib/writersStudio/__tests__/exportSettle.test.ts` drives a modelled save lane whose version advances
only when the save lands:

- **CONTAINS it** — the save lands during the settle; the export carries the pending sentence.
- **OR REFUSES** — a draft that moved after settling returns `moved`; no file.
- **⛔ NEVER downloads without it** — an unsettled lane makes **no request at all**. Not merely no
  file: no request, so no provenance, no file, no 120s of pandoc.
- **⛔ never retried into a newer state** — a retry would settle again, get the *newer* version, and
  export that. The writer settled one state and would receive another. One call, then the refusal.
- the claim is an **omitted field**, never `null` — the server distinguishes *"no draft to claim"*
  from *"a claim about version N"*, and a `null` is a third thing neither side has a meaning for.

Founder's four extra conditions, each pinned in
`app/api/sovereign/manuscripts/[id]/render/__tests__/route.test.ts`:

- `409` → **no render provenance row** (a recorded render that never happened is a false provenance
  entry, and provenance is the only durable claim this route makes) and **no file emitted**;
- **continuous draft follows the same settle rule** — the refusals run before the
  addressable/continuous branch is chosen, so it is not a second path with second manners;
- **never-drafted Source needs no claim** — and refuses a false one;
- the **one-read** property asserted behaviourally as well as by source scan: an unmocked query
  throws, so a re-introduced second read turns the suite red.

## 4 · Gates

- `app/api/sovereign/manuscripts/[id]/render` — **34 passed · 0 failed**
- `lib/writersStudio/__tests__/exportSettle.test.ts` — **13 passed · 0 failed**
- `writersStudio · press/manuscript · canvas` — **549 passed · 0 failed**
- `npm run typecheck` — **229 vs baseline 239 · 0 regressions**
- `npm run check:no-supabase` — clean
- **Full suite diffed against a stashed clean tree: 37 failing suites before, 37 after, `NEW: (none)`.**
  Pre-existing failures are untouched and unclaimed.

One test regression was caused and repaired in the making: `keepAVersion.test.ts` pinned the settle
as *inlined lines* (`writing.flushPending()`, `writing.currentRevisionId()`), so extracting the
shared helper turned it red. Rewritten to pin the **contract** — settle before checkpoint, the guard
is the settled version, and now explicitly **one** `settleDraft(` call site in the file, with the
timeout constants gone from it.

## 5 · What this does not do

⛔ Not merged · ⛔ not deployed · ⛔ no production witness · ⛔ no schema change · ⛔ no migration ·
⛔ inline marks not opened.

**Sequence from here, per the founder:**

```
1. Export settle reachability     ← this act
2. Five-point production witness  ← NEXT, and a founder act
3. Inline marks substrate
4. Bold + italic editor
5. Marks through current-draft export
```

Step 2 is a lived gate that has now outlived several correct repairs. Deployed ≠ demonstrated;
**built is not even deployed.**
