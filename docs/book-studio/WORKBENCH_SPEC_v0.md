# Workbench — v0 Feature Spec

**Status:** v0 draft. Written before lived contact. Expects to be wrong in ways only Karen's and Jason's cookbooks will reveal.

**Position in stack:** between Captures (Keep, Ideas, Journals, Decisions) and Book Studio. Below Book Studio in the doctrine hierarchy: answerable to The Clearing, the Oath, and the Sovereignty Invariants.

---

## 1. What the Workbench is

The Workbench is the **arrangement surface** between captures and form.

- **Captures** are about not losing the moment.
- **Book Studio** is about form.
- The Workbench is about **seeing** — laying things on a table, finding what has mass, noticing what keeps returning.

It is a different cognitive act than capturing or writing. It needs its own room.

## 2. What the Workbench is not

- Not a synthesis engine. It does not cluster captures by inferred theme. It does not propose through-lines. It does not suggest chapters.
- Not a second Ideas page. Ideas is for live thinking. Workbench is for *retrospective arrangement*.
- Not a memory layer. It reads from captures; it does not form long-term inference about the member.
- Not a feature whose value is measured in engagement, retention, or output volume. Its value is measured by whether the arranger sees more clearly afterward.

## 3. The unanswered question this spec is built on top of

> **What medium does the arranger instinctively reach for when something needs to be sorted — not ideally, but actually?**

The author of *Elemental Alchemy* could not answer this when asked. Either (a) the arrangement happened in a medium that wasn't noticed, (b) it happened in his head and the friction is being retroactively smoothed, or (c) the book found its shape through writing rather than pre-arrangement.

Each of those produces a different Workbench. **v0 must not commit to one before the answer is real.** Karen's and Jason's cookbooks are the live experiment.

This question is load-bearing for v0. It must remain visible in the spec, not designed past.

## 4. Sovereignty invariants (non-negotiable)

These hold regardless of what shape v0 takes.

1. **Sanctuary captures cannot enter the Workbench.** Ever. Not by user request, not by override, not by export. Sanctuary's absolute boundary extends here.
2. **No auto-clustering, no auto-themes, no auto-arcs.** The arrangement is the arranger's. MAIA's presence, if any, is retrieval only.
3. **No inference about the arranger.** Cards arranged on the Workbench do not become member memory, do not form patterns, do not enter Spiral State or Continuity Engine.
4. **Retrieval over synthesis.** MAIA may answer *"show me the times I returned to grief in a kitchen"* (retrieval). MAIA may not answer *"these form a chapter on embodied loss"* (synthesis).
5. **Observable on intent, invisible by default.** No ambient cards, no surfaced clusters, no "you have 14 captures that might belong together" notifications. The Workbench is a room the arranger walks into.
6. **Cards are pointers, not copies.** A card on the Workbench references the underlying capture; deleting the card does not delete the capture, editing the capture updates the card.

## 5. The two primitives (v0 only)

v0 ships **two primitives** and nothing else. Everything else waits for lived contact.

### 5.1 The Shelf

A retrieval surface that reads across capture sources:

- Keep (`/maia/keep-capture`)
- Ideas (`/maia/ideas`)
- Journals (`/journal`, `/maia/community/*/journal`)
- Decisions (`/studio/decisions`)
- **Uploaded** — material that originated outside MAIA: typed documents, handwritten pages, recipe cards, notebook scans, voice notes. See §5.3.

The Shelf is **search + filter only**, not feed. The arranger queries it; it does not query the arranger.

Query primitives in v0:
- Free-text search across capture content (including transcribed uploads).
- Filter by source (Keep / Ideas / Journals / Decisions / Uploaded).
- Filter by date range (capture date or upload date).
- Filter by capture tag (where the source supports tags).

**Not in v0:** semantic clustering, inferred themes, "related captures," recommendation.

### 5.3 Uploads + Transcription

The Workbench accepts material that never passed through MAIA's capture surfaces. This is load-bearing for non-founder use cases — Karen's and Jason's cookbook material almost certainly lives in notebooks, recipe cards, and Word docs, not in Keep or Ideas.

**Accepted upload types (v0):**
- Typed text files: `.txt`, `.md`, `.docx`, `.pdf` (text-extractable).
- Handwritten images and scans: `.jpg`, `.png`, `.heic`, scanned PDFs.
- Typed images (e.g., a photo of a typed page).

**Transcription path:**
1. Arranger uploads a file. The Workbench stores the file and a generated text-extraction draft alongside it.
2. For text-extractable files, extraction is direct.
3. For images and scanned PDFs, OCR produces a draft transcription. **The arranger reviews and corrects the transcription before it becomes a card on the Shelf.** No transcription enters the Shelf unreviewed.
4. The reviewed text is what the Shelf indexes for search. The original file remains as the source-of-truth and is shown when a card is opened.

**Sovereignty invariants for uploads:**
- Uploaded material is treated the same as a capture: no inference, no clustering, no training use, no pattern formation.
- Uploaded files are stored in the arranger's own scope. Founder-only in v0 means: only the founder can upload.
- OCR must run locally (Tesseract or equivalent) or via a transcription path that does not transmit content to a third party. **No uploaded material leaves the host.** This matches the broader sovereignty stack (Anthropic API is the only outbound call, and it is for live conversation, not stored material).
- If the upload contains material the arranger marks as Sanctuary, it is excluded from the Shelf and no Workbench card is created for it.
- Deletion of an upload removes the file, the transcription, and any cards pointing to it. There is no undelete.

**Voice notes (v0 stretch, not required):**
- If included, voice notes use the existing Whisper service (`maia-whisper` container) for local transcription.
- Same review-before-indexing rule applies.

**Not in v0:**
- Automatic tagging of uploaded content.
- Inferring author intent, theme, or category from uploaded material.
- Cross-upload synthesis ("you mentioned cardamom in three different notebook pages").
- Bulk-folder import that auto-classifies.

### 5.2 The Table

A blank surface where the arranger drags cards from the Shelf and arranges them. Arrangement is purely spatial — position, grouping, ordering. No imposed schema.

- A card on the Table references a capture (pointer, not copy).
- Cards can be moved, grouped, stacked, ordered.
- Groups can be named by the arranger (never by MAIA).
- The Table persists per-arranger.

**Not in v0:** auto-layout, suggested groupings, "this cluster looks like X," outline generation, chapter inference.

## 6. The graduation pipe

A named group on the Table can **graduate** to a Book Studio draft.

- Reuses the existing `POST /api/book-studio/drafts/from-idea` pattern, extended to accept a group of capture references.
- New route: `POST /api/book-studio/drafts/from-group`.
- The route emits a single markdown draft into `docs/book-studio/drafts/<slug>.md` containing the captures in the order the arranger placed them, with the group name as the draft title.
- The doctrine from `from-idea` extends: **"Graduate only when this wants form."**

Graduation is initiated by the arranger, not suggested by the system.

## 7. Access model

- **v0:** founder-only, same gate as the rest of `/book-studio`. The Workbench is built and used by the founder first, on real material (cookbooks for Karen and Jason), before any access model widening is considered.
- **Not in v0:** collaborator access, multi-user Workbenches, shared Tables. Those questions wait until the storage model moves off localStorage and onto the DB (Book Studio Phase C).

## 8. Storage

- **Table state (arrangements, groups, card positions):** localStorage in v0, scoped per arranger. Matches Book Studio Canvas's Phase A0 posture. Arrangements are device-local; clearing site data loses the arrangement. The underlying captures are unaffected (cards are pointers).
- **Uploaded files + transcriptions:** filesystem from v0, *not* localStorage. localStorage cannot practically hold images or PDFs, and treating uploaded notebook pages as ephemeral is unacceptable. Files live under `uploads/workbench/<arranger-id>/<upload-id>/` on the host; transcription drafts live as sibling `.txt` files; reviewed transcriptions and metadata write to PostgreSQL (`workbench_uploads` table). This is a v0 deviation from Canvas's all-localStorage Phase A0 — uploads force the DB and filesystem decisions earlier because the alternative loses real source material.
- **Phase B (after lived contact):** migrate Table state to PostgreSQL alongside Book Studio Canvas's Phase C migration.

## 9. Routes

- `/book-studio/workbench` — the room itself.
- `/book-studio/workbench/shelf` — the Shelf (or rendered as a side panel inside the room; v0 detail).
- `/book-studio/workbench/table/[id]` — a specific Table (the arranger may have several; one per project, or one per shape they're sorting).

API:
- `GET /api/book-studio/workbench/shelf` — search across capture sources (Keep, Ideas, Journals, Decisions, Uploaded).
- `GET /api/book-studio/workbench/tables` — list tables.
- `GET|POST|PATCH|DELETE /api/book-studio/workbench/table/[id]` — table CRUD.
- `POST /api/book-studio/workbench/uploads` — accept file upload, run transcription, return upload ID + draft transcription for review.
- `PATCH /api/book-studio/workbench/uploads/[id]` — submit reviewed transcription; card becomes Shelf-indexable.
- `DELETE /api/book-studio/workbench/uploads/[id]` — hard delete file, transcription, and any cards.
- `POST /api/book-studio/drafts/from-group` — graduation pipe.

All routes founder-gated via `requireFounder()`.

## 10. What v0 deliberately omits

These are anti-features for v0. Each one re-enters consideration only after lived contact with Karen and Jason's cookbooks produces evidence the arranger actually wants it.

- AI-suggested clusters
- AI-suggested through-lines or chapter arcs
- "Related captures" surfacing
- Ambient notifications about Workbench state
- Engagement metrics, return cadence, time-on-table
- Multi-user collaboration
- Sharing or exporting Tables outside the graduation pipe
- Templates for arrangement shape (kanban, outline, mindmap) — v0 is a blank table only

## 11. Falsifiability — how we know v0 is wrong

The honest answer to *"is the Workbench v0 the right shape?"* will come from one of three signals during the cookbook builds:

1. **Hand-reach signal.** When the arranger needs to sort captures for Karen's cookbook, does he open the Workbench, or does he reach for something else (paper, a doc, a wall, his head)? If he reaches elsewhere, v0 is wrong about *medium*.
2. **Friction signal.** When the arranger does use the Workbench, where does his hand stop? What does he wish were there? What feels like the wrong shape under his fingers?
3. **Graduation signal.** When a group graduates to Book Studio, is the resulting draft useful, or does the arranger have to re-arrange inside Book Studio anyway? If the latter, v0's graduation pipe is wrong.

These signals are observation, not metrics. They are not instrumented. They are noticed.

## 12. What "ready to ship v0" means

- Shelf reads across all four capture sources.
- Table supports drag, group, name, reorder, persist.
- Graduation pipe writes a draft Book Studio can pick up.
- Founder-only gate active.
- Sanctuary exclusion enforced at the Shelf layer (Sanctuary captures never enter the query result).
- No synthesis, no clustering, no inference. The room is a blank table.

## 13. Open questions deferred to lived contact

- Is the Table one persistent space, or one per project, or ephemeral?
- Are cards visual (with content preview) or minimal (title only, content on hover)?
- Does the arranger want vertical lists, free 2D placement, or both?
- Does the graduation pipe preserve card order, group structure, or just capture references?
- Should MAIA's retrieval voice be present in the room at all in v0, or should v0 be silent and only the arranger speaks?

Each of these is a small design decision that becomes a large UX decision. v0 picks the simplest answer for each (one persistent Table per arranger; cards show title + first line; vertical lists with grouping; graduation preserves order; MAIA silent in v0 except via the Shelf search) and **expects to be wrong on at least two of them.**

---

## Closing

The Workbench is the missing room between *not losing the moment* and *form*. Its job is to make seeing possible. Its danger is becoming a synthesizer that does the seeing for the arranger — the moment that happens, the Interpretive Displacement Canary fires and the room has become the failure mode it was built to prevent.

v0 holds the line by shipping retrieval and arrangement primitives only, and by leaving the medium-shape question deliberately unanswered until Karen's and Jason's cookbooks reveal what the arranger's hands actually reach for.

Build it small. Use it. Notice. Then revise.
