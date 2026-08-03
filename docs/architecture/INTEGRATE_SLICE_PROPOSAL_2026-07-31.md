# Explicit Insertion — substrate finding + smallest vertical slice

> **Status: PROPOSAL — awaiting authorization. No code, schema, or migration written.**
> Verified against canonical `clean-main-no-secrets` only (not the working branch, not
> worktrees).

## Three layers, kept distinct

| Layer | Name | Where it lives |
| --- | --- | --- |
| Practice | **Integrate** | architecture / design language — never in the interface |
| Member language | **Bring in** *(or Use here / Add to draft — founder's call)* | the button |
| Engineering capability | **Explicit Insertion** | the code, this slice |

**The primitive is explicit insertion into the field — not "Keeps into the draft."**
Keeps are simply the **first substrate**. Journal passages, transcripts, voice notes,
conversations, and previous chapters are the same capability with a different source.
The slice must not couple to Keeps.

## Part 1 — Substrate finding

**Working Draft surface.** `app/press/manuscript/WorkingDraftEditor.tsx` — plain
controlled `<textarea>`, **no ref, no `selectionStart`/`selectionEnd` anywhere.** This is
the whole reason integration does not exist: *no caret position → no insertion → no
integration → Gather is storage.*

**Every mutation of draft content (canonical, complete):**

| Mutation | Whole / partial | Caret-aware | Provenance | Undo point |
| --- | --- | --- | --- | --- |
| `POST` create — `draft/route.ts:62` + rev `:71` | whole | no | `base_source_hash`, `saved_by` | yes (rev 1) |
| `PUT` checkpoint — `draft/route.ts:158` + rev `:170` | whole | no | `saved_by`, `note` | **yes** |
| `PUT` autosave — `draft/route.ts:182` | whole | no | `updated_at` only | **no** |
| `POST` restore — `draft/revisions/route.ts:101` + rev `:110` | whole | no | `saved_by`, auto note | yes |
| client `putDraft` — `workingDraftClient.ts:132` | whole | no | passes `note` | only if `checkpoint` |
| client `beginDraft` `:104` / `restoreRevision` `:172` | whole | no | server-side | yes |
| `createDraftSaver` `:276` | whole | no | — | no |

**Findings that matter:** four SQL writers, all in two route files, **all `SET content =
$N` full replacement** — one write *shape*, no second model. **Zero positional mutation
exists anywhere** (no splice, offset, range, or diff). One client funnel: every browser
write goes through `createDraftSaver`/`putDraft`. Revisions are **append-only**, enforced
by a `BEFORE UPDATE` trigger. No script, service, admin route, or backfill writes draft
content. `content` state has exactly **four set-sites** (init `:57`, reload `:98`,
onChange `:182`, begin `:199`).

**Conclusion:** caret insertion **cannot create a second editing model** — it computes a
new whole string, calls `setContent` (a fifth site), and queues the existing saver.

**Preserved material already available:** Keeps ride along on
`/api/sovereign/manuscripts/[id]` as `data.keeps` (`manuscript_keeps.verbatim_text`).
Member-chosen vs system-surfaced is already encoded (`marked_by_member`,
`return_preference`, `surface_preference`, `provenance`).

**Two risks to design around (found in the inventory):**
1. **Autosave creates no undo point** — so the insertion must take its own checkpoint
   *before* mutating.
2. **`endExclusive({flushPending:false})` (`:265`) can drop a queued write** during an
   in-flight checkpoint/restore — so insertion must not fire while the exclusive lane is
   held.

## Part 2 — The slice

> **Explicit insertion at the caret: a member chooses one piece of their own preserved
> material and places it into the Working Draft as ordinary editable text — checkpoint
> first, provenance in the revision note, no new persistence model.**

Flow: member is writing → chooses one item from their own preserved material (**Keeps of
this manuscript as the first substrate**) → presses the gesture → *checkpoint taken* →
verbatim text spliced at `selectionStart` → `setContent` + existing saver → it is now
ordinary draft text. Gesture disabled while the exclusive lane is held.

**No migration. No new API route. No new table.**

### 1. Existing primitives reused
`WorkingDraftEditor` textarea + single `content` atom · `putDraft(checkpoint, note)` ·
`working_draft_revisions` + `restoreRevision` (append-only, trigger-protected) ·
`createDraftSaver` · `data.keeps` already on the page.

### 2. Protected experiential property this moves
**What was preserved becomes part of what is made** — the first crossing from preserved
material into authored text; the point at which gathering stops being storage.

### 3. Constitutional refusal preserved
The system never chooses, suggests, summarizes, rewrites, classifies, or places. Nothing
inserted automatically. The source row is **never mutated or marked used**. MAIA silent
unless invited. *Why is this here — because the creator put it here.*

### 4. Creator failure removed
The **retype tax**: material the member already decided mattered is unreachable at the
one moment it is wanted, so it is retyped from memory, mis-transcribed, or abandoned.

### 5. Deliberately unbuilt
Gather room · Shelf/unattached captures · sources beyond the first substrate (journal,
transcripts, voice, conversations, prior chapters — same capability, later) · any
draft↔source link table · AI selection, placement, or transitions · navigation changes ·
exposure of internal vocabulary · elevating Integrate to a constitutional act.

### Open, for the founder
The member-facing verb — *Bring in* · *Use here* · *Add to draft*.

---

**Authorization gate:** the pre-code inventory is complete and clears (no second editing
model). Nothing proceeds — no code, no branch — until the slice is explicitly authorized.
