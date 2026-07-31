# MANUSCRIPT_INGEST_SPEC_2026-07-21.md

**Status:** CANDIDATE spec — small by design. Proposes one primitive + one door; authorizes nothing until Kelly's build word + placement ruling.
**Purpose:** the minimal build that lets a body-of-work entrant (first: Kimberly Daugherty) walk `Manuscript → Recognition → Placement → Discovery` on existing architecture.
**Companions:** `docs/specs/BOOK_STUDIO_SOULBOOK_EXPLORATION_2026-07-13.md` (incl. §0 ontology rulings) · `docs/pitch/DEVELOPMENTAL_PUBLISHING_SYSTEM_CANDIDATE.md` (merged, PR #607) · live route `app/api/sovereign/quotes/candidates` (PR #608, prod `a77ca38f6`).

---

## 1. Why ingest is the load-bearing piece

Every downstream provenance claim — "these are her exact words," the colophon, the verifiable-authorship moat — rests on what ingest asserts. Upload introduces a provenance class the platform has never had: **`member_uploaded`** — *member-asserted* authorship ("this is mine, I wrote it") rather than *platform-witnessed* authorship (words typed/spoken inside the system). The class must travel with the material forever and appear wherever the material is cited. The system records the assertion; it never verifies, doubts, or upgrades it.

## 2. Schema (two tables — the whole migration)

```sql
member_manuscripts (
  id uuid PK,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  title text NOT NULL,                -- member-given; no default, no suggestion
  provenance text NOT NULL DEFAULT 'member_uploaded',
  created_at timestamptz DEFAULT now()
)

manuscript_sections (
  id uuid PK,
  manuscript_id uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  position int NOT NULL,
  heading text,                       -- from the document itself; member-editable; system never invents
  body text NOT NULL                  -- verbatim; no trim, no normalization (mark-route discipline)
)
```

No interpretive columns exist to leave NULL — by construction there is nothing the system *could* annotate. Deletion is the member's, total, hard (her material; mirrors the moments-room removal posture).

## 3. Ingest flow

1. **Upload** — paste text or upload a file (.txt/.md/.docx → text extraction; no OCR, no audio in v1). Member supplies the title.
2. **Segmentation** — split on document headings (markdown `#`/`##`, docx heading styles); fallback = whole text as one section. **Member confirms/edits the segmentation before save** — chapter boundaries are structure, structure is authorship, so the final cut is hers. The system proposes splits mechanically (heading detection only), never semantically.
3. **Provenance moment** — one sentence at save, evidence-register: "Saved as your words, as you wrote them." The `member_uploaded` assertion is recorded on the manuscript row. No checkbox ceremony; the upload act is the assertion.

Sanctuary note: manuscripts are deliberate placements, not conversation — no Sanctuary surface is involved; no Sanctuary content can reach ingest.

## 4. Extraction at manuscript scope

Extend the live candidates route (or sibling route `POST /api/sovereign/quotes/candidates` with `{manuscriptId}`):
- scope = that manuscript's sections; `kind: 'manuscript'` (already implemented in `extractQuotes`);
- per-section chunking (sections are natural chunks; corpus caps become per-request section windows);
- response identical in discipline to PR #608: exact text · context · `provenance: 'verbatim'` · source pointer (`manuscript_sections.id` + heading + position) · **`resonance`/`score` never leave the server**.

## 5. The door (one page, member-pulled throughout)

A single place (placement on the map = Kelly's ruling):
1. **Upload** (§3) → sections list, shown as *her* table of contents — headings and positions only, no summaries, no system commentary.
2. **"Find lines that still feel alive"** — member-pulled action (Kelly's copy, ratified); results words-large / source-small ("Chapter 4 — the heading she gave it"); **keep** (existing mark route, with manuscript source pointers) or **pass** (nothing recorded).
3. Nothing else in v1. No themes, no arcs, no gatherings, no counts — those surfaces come only after recognition evidence exists, and each arrives under the `report when pulled, never notice when idle` rule (spec §0.4).

Compliance checklist (per surface, at review): member-summoned only · no characterization (juxtapose/enumerate/date/ask) · no system-scored significance displayed · keep = the only write · copy passes the three-second test.

## 6. What v1 deliberately refuses

- Corpus/multi-file import (one manuscript first; the primitive generalizes later)
- Voice, OCR, photos, social imports
- Any arc surface, any recurrence surface, any gathering UI
- System-proposed titles, headings, summaries, or segmentations beyond mechanical heading detection
- Any ambient surfacing of anything, ever

## 7. Evidence this build is for

Kimberly's walk, observed A/B/C/D plus **arc-events**. The target sentence that would constitute the first non-founder phenomenological proof:

> "I didn't realize this manuscript was already trying to become this book."

## 8. Build estimate

Migration (2 tables) + ingest route + extraction scope + one page ≈ 2–3 sessions. No changes to existing routes' behavior; PR #608's journal path remains untouched. Class A PR (member-content surface), revert-sufficient, quick-deploy after the migration runs via full deploy path.
