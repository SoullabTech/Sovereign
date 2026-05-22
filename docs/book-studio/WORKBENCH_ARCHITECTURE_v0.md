# Workbench — v0 Architecture

**Companion to:** [`WORKBENCH_SPEC_v0.md`](./WORKBENCH_SPEC_v0.md).
**Posture:** small enough to ship and watch. Over-engineering is the failure mode the spec was written to refuse.

The spec defines *what the room is and is not*. This doc maps that to **files, routes, schema, and a build order** that lets v0 reach Karen's recipes within one buildable slice.

---

## 1. Slicing

v0 ships in **three slices**, smallest-useful-thing first. Each slice is independently shippable.

### Slice 1 — Typed material end-to-end (the MVP)
The arranger uploads typed recipes, they enter the Shelf, get dragged onto a Table, and graduate to a Book Studio draft. No OCR yet, no cross-source reach yet.
- DB: `workbench_uploads`, `workbench_tables`.
- Filesystem: `uploads/workbench/<arranger-id>/<upload-id>/`.
- Upload + extract for `.txt`, `.md`, `.docx`, text-extractable `.pdf`.
- Shelf reads only the Uploaded source.
- Table supports drag, group, name, reorder, persist.
- Graduation pipe: `POST /api/book-studio/drafts/from-group`.

**Shipping criterion:** Karen's typed recipes can move from upload → arrangement → Book Studio draft, by Kelly's hands, end-to-end.

### Slice 2 — Handwritten material
Local OCR for image + scanned-PDF uploads. Review-before-indexing UI.
- Local Tesseract for `.jpg`/`.png`/`.heic`/scanned `.pdf`.
- New states on `workbench_uploads`: `transcription_status ∈ {extracting, draft, reviewed}`.
- Transcription review component.

**Shipping criterion:** A photo of one of Karen's handwritten recipe cards reaches the Shelf as a reviewed, searchable card.

### Slice 3 — Kelly's own captures join the Shelf
Adapters for Keep, Ideas, Journals, Decisions. Cards are pointers to existing capture rows.
- Source-adapter interface; one file per source.
- Sanctuary exclusion at the adapter layer.

**Shipping criterion:** The Shelf query reaches all five sources and respects Sanctuary.

**Out of v0 entirely:** voice-note transcription, shared/multi-user tables, auto-clustering, theme inference, ambient surfacing.

---

## 2. File layout (where each piece lives)

```
app/
  book-studio/
    workbench/
      page.tsx                          ← the room (Shelf + Table)
      table/[id]/page.tsx               ← optional dedicated Table view
      layout.tsx                        ← founder-gate via requireFounder()

  api/
    book-studio/
      workbench/
        shelf/route.ts                  ← GET — search across sources
        tables/route.ts                 ← GET, POST — list / create
        tables/[id]/route.ts            ← GET, PATCH, DELETE
        uploads/route.ts                ← POST (multipart)
        uploads/[id]/route.ts           ← GET, PATCH, DELETE
        uploads/[id]/file/route.ts      ← GET — stream original file
      drafts/
        from-group/route.ts             ← graduation pipe (extends from-idea)

lib/
  workbench/
    sources/
      types.ts                          ← WorkbenchSource interface, WorkbenchCardRef type
      uploaded.ts                       ← Slice 1
      ideas.ts                          ← Slice 3
      keep.ts                           ← Slice 3
      journals.ts                       ← Slice 3
      decisions.ts                      ← Slice 3
    extract/
      text.ts                           ← .txt, .md (Slice 1)
      docx.ts                           ← mammoth (Slice 1)
      pdf.ts                            ← pdf-parse, text-only path (Slice 1)
      ocr.ts                            ← Tesseract (Slice 2)
    storage.ts                          ← filesystem paths, write/read, delete
    sanctuary.ts                        ← uniform Sanctuary filter applied to every source

components/
  book-studio/
    workbench/
      Room.tsx                          ← layout shell
      Shelf.tsx                         ← search + filters + results
      Table.tsx                         ← drag/drop surface
      Card.tsx                          ← single card (pointer)
      Group.tsx                         ← named group on the Table
      UploadDropzone.tsx
      TranscriptionReview.tsx           ← Slice 2

database/
  migrations/
    20260522000003_workbench_v0.sql     ← Slices 1 + 2 schema
```

---

## 3. Database schema

One migration covers Slices 1 and 2. Slice 3 needs no schema (read-only adapters over existing capture tables).

```sql
-- 20260522000003_workbench_v0.sql

create table workbench_uploads (
  id              uuid primary key default gen_random_uuid(),
  arranger_id     uuid not null references members(id) on delete cascade,
  original_name   text not null,
  mime_type       text not null,
  size_bytes      bigint not null,
  storage_path    text not null,            -- relative to uploads/workbench/
  source_kind     text not null,            -- 'typed_text' | 'typed_doc' | 'handwritten_image' | 'scanned_pdf'
  transcription_status text not null
    default 'extracting'
    check (transcription_status in ('extracting','draft','reviewed','error')),
  transcription_draft text,                 -- raw OCR/extract output (Slice 1: same as reviewed for text)
  transcription_reviewed text,              -- the indexable text — only set when arranger confirms
  sanctuary       boolean not null default false,
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index workbench_uploads_arranger_idx on workbench_uploads(arranger_id);
create index workbench_uploads_status_idx on workbench_uploads(transcription_status);
-- Full-text search over reviewed transcription only (drafts never appear in Shelf):
create index workbench_uploads_fts_idx on workbench_uploads
  using gin (to_tsvector('english', coalesce(transcription_reviewed, '')));

create table workbench_tables (
  id              uuid primary key default gen_random_uuid(),
  arranger_id     uuid not null references members(id) on delete cascade,
  name            text not null default 'Untitled table',
  layout          jsonb not null default '{"groups": []}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index workbench_tables_arranger_idx on workbench_tables(arranger_id);
```

**Layout JSON shape:**
```jsonc
{
  "groups": [
    {
      "id": "g_<uuid>",
      "name": "Cardamom dishes",
      "cards": [
        { "id": "c_<uuid>", "source": "uploaded", "ref": "<workbench_uploads.id>" },
        { "id": "c_<uuid>", "source": "ideas", "ref": "<idea_id>" }
      ]
    }
  ]
}
```

Cards as pointers — `source` + `ref` resolve to live capture data at read time. Deleting a capture removes the card from view; the layout is not silently rewritten.

---

## 4. Filesystem storage

```
uploads/
  workbench/
    <arranger-id>/
      <upload-id>/
        original.<ext>          ← exactly as uploaded
        draft.txt               ← Slice 2: OCR/extract output before review
        reviewed.txt            ← canonical, indexed in DB column too
```

`lib/workbench/storage.ts` is the only module that reads/writes this tree. All paths go through it. Hard-delete removes the directory.

**Not** in S3, not in any cloud bucket. Stays on the host. Same sovereignty stack as the rest of the system.

---

## 5. Source adapter interface

```ts
// lib/workbench/sources/types.ts

export type WorkbenchSourceKind =
  | 'uploaded'
  | 'ideas'
  | 'keep'
  | 'journals'
  | 'decisions';

export interface WorkbenchCardRef {
  source: WorkbenchSourceKind;
  ref: string;                  // source-native id (uuid for uploads, idea_id for ideas, etc.)
  title: string;                // short display
  preview: string;              // first ~140 chars of content
  createdAt: string;            // ISO
  tags?: string[];
}

export interface WorkbenchSourceQuery {
  arrangerId: string;
  text?: string;
  from?: string;                // ISO date
  to?: string;
  tag?: string;
}

export interface WorkbenchSource {
  kind: WorkbenchSourceKind;
  search(q: WorkbenchSourceQuery): Promise<WorkbenchCardRef[]>;
  resolve(ref: string, arrangerId: string): Promise<{ content: string; meta: Record<string, unknown> } | null>;
}
```

**Every adapter applies Sanctuary filtering before returning.** `lib/workbench/sanctuary.ts` exports a single `isSanctuary(source, ref)` checker each adapter calls. Belt and suspenders — the Shelf is not the only place this matters.

The Shelf endpoint fans out across all enabled adapters, merges, sorts by relevance/date, and returns. Slice 1 enables only `uploaded`. Slice 3 enables the rest.

---

## 6. API contracts

All routes founder-gated (`requireFounder()` in the route handler, matching `/book-studio/canvas` posture).

| Route | Method | Purpose |
|---|---|---|
| `/api/book-studio/workbench/shelf` | GET | `?text=&source=&from=&to=&tag=` — returns `WorkbenchCardRef[]` |
| `/api/book-studio/workbench/tables` | GET | List tables for arranger |
| `/api/book-studio/workbench/tables` | POST | Create table (body: `{ name }`) |
| `/api/book-studio/workbench/tables/[id]` | GET | Read full table incl. resolved card content |
| `/api/book-studio/workbench/tables/[id]` | PATCH | Update `name` or `layout` |
| `/api/book-studio/workbench/tables/[id]` | DELETE | Hard delete |
| `/api/book-studio/workbench/uploads` | POST | Multipart upload; returns `{ id, transcription_status }` |
| `/api/book-studio/workbench/uploads/[id]` | GET | Metadata + current transcription |
| `/api/book-studio/workbench/uploads/[id]` | PATCH | Body `{ transcription_reviewed, sanctuary? }`; flips status → `reviewed` |
| `/api/book-studio/workbench/uploads/[id]` | DELETE | Hard delete file + DB row; remove from any table layouts referencing it |
| `/api/book-studio/workbench/uploads/[id]/file` | GET | Stream original |
| `/api/book-studio/drafts/from-group` | POST | Body `{ tableId, groupId }` — writes `docs/book-studio/drafts/<slug>.md`, returns studio URL |

`from-group` reuses the slugify + markdown-write logic from `from-idea/route.ts`. The new pipe assembles markdown from the group's resolved cards (in arranger-set order), uses the group name as the draft title, and stamps a `<!-- workbench-source -->` comment block at the top with card refs for round-trip traceability.

---

## 7. Extraction + OCR pipeline

**Slice 1 — synchronous, fast:**
- `.txt`/`.md`: read file, store as `reviewed` directly. `status = 'reviewed'` on upload.
- `.docx`: `mammoth` → markdown → store as `reviewed`. `status = 'reviewed'`.
- `.pdf` (text-extractable): `pdf-parse` → text → store as `draft`. Arranger still reviews because PDF text extraction is uneven. `status = 'draft'`.

**Slice 2 — asynchronous, OCR:**
- `.jpg`/`.png`/`.heic`/scanned `.pdf`: queue OCR job. On accept, the upload row is created with `status = 'extracting'`. Background worker runs Tesseract, writes `draft.txt`, sets `status = 'draft'`.
- Arranger opens upload → `TranscriptionReview` shows original side-by-side with editable draft → save → `status = 'reviewed'`.
- Only `reviewed` content enters the Shelf full-text index.

**OCR engine:** Tesseract via `node-tesseract-ocr` CLI binding, calling a local `tesseract` binary installed in the `maia-sovereign` container. No third-party OCR APIs. Confirmed in spec §5.3.

**Whisper for voice notes:** explicitly out of v0; the `maia-whisper` container is already in the stack but wiring it in is deferred until lived contact says voice notes matter.

---

## 8. Sovereignty enforcement map (where each spec rule lives)

| Spec invariant | Enforcement point in code |
|---|---|
| Sanctuary captures excluded from Shelf | `lib/workbench/sources/*.ts` — every adapter calls `isSanctuary()` before returning |
| Sanctuary applies to uploads | `workbench_uploads.sanctuary` column + Shelf query `WHERE sanctuary = false` |
| Cards are pointers, not copies | `workbench_tables.layout` stores `{ source, ref }` only; content resolved at read |
| No third-party transmission | OCR via local Tesseract; extraction libs run in-process; storage on host filesystem |
| Founder-only | `requireFounder()` in every workbench route + page layout |
| No inference / clustering / theme detection | No model calls anywhere in `lib/workbench/`; absence is auditable |
| Hard delete | `DELETE /uploads/[id]` removes filesystem directory + DB row + scrubs references in tables |
| Review before indexing | DB constraint: FTS index built on `transcription_reviewed` only, never on `transcription_draft` |

---

## 9. Frontend posture

- Server-render the page shell + auth check (matches `/book-studio` pattern).
- Shelf and Table are client components — search and drag/drop need it.
- Drag library: native HTML5 DnD for Slice 1 (no new dependency); if it gets awkward in practice, revisit `dnd-kit` in Slice 2.
- Card content is loaded on hover/expand, not all upfront — keeps the Shelf snappy with many results.

The room is silent in v0 — no MAIA voice present inside the Workbench (spec §13). The only MAIA-adjacent surface is the Shelf's search, which is a retrieval primitive, not synthesis.

---

## 10. Dependencies to add

Slice 1:
- `mammoth` — .docx → markdown
- `pdf-parse` — text from .pdf

Slice 2:
- `node-tesseract-ocr` — CLI binding
- `tesseract-ocr` binary installed in the `maia-sovereign` Dockerfile (apt package)

No new cloud dependencies. No model APIs. No analytics. All additions are local libraries.

---

## 11. Order of build (concrete)

1. Write the migration (`20260522000003_workbench_v0.sql`) and apply locally.
2. `lib/workbench/storage.ts` + `lib/workbench/sources/types.ts` + `lib/workbench/sources/uploaded.ts`.
3. Upload route + extract pipeline for typed files.
4. Shelf route (uploaded-source only) + Shelf component.
5. Tables route + Table component (vertical groups, drag within group, name groups).
6. `from-group` route + graduation button.
7. **Stop. Ship Slice 1. Use it on Karen's typed material. Notice what hands reach for.**
8. Slice 2: Tesseract install, OCR job pipeline, `TranscriptionReview` component, image upload paths.
9. **Stop. Use it on a handwritten recipe card. Notice what reviewer's hands reach for.**
10. Slice 3: source adapters for Ideas/Keep/Journals/Decisions. Each lights up a checkbox on the Shelf.

The pauses between slices are part of the architecture, not just shipping discipline. The spec's whole posture is *spec after watching yourself do it.* Slices are the same idea at the build layer.

---

## 12. What this architecture deliberately leaves undefined

These are spec §13 questions translated to architecture — still deferred to lived contact:

- Whether the arranger wants multiple Tables or one persistent one (schema supports many; v0 UI ships with one).
- Whether cards on the Table want free 2D placement (v0 ships with vertical lists inside named groups — simpler, fewer decisions).
- Whether MAIA's voice eventually enters the room (architecture leaves no hooks for it — adding them later is cheap; adding them now is the failure mode).
- Whether graduated drafts should be able to round-trip back into the Workbench (the `<!-- workbench-source -->` comment block in the draft is a small affordance for future round-tripping, costs nothing to leave in).

Each undefined point is a place where Slice 1's lived contact is the next epistemic source.

---

## Closing

The architecture is sized to the spec: small, observable, and structurally honest about its own unknowns. Slice 1 reaches Karen's typed recipes. Slice 2 reaches her notebooks. Slice 3 reaches your own captures. The room stays a room — retrieval and arrangement only, no synthesis, no inference, no ambient claims.

Ready to build Slice 1 when you say.
