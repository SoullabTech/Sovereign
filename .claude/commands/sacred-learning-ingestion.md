---
description: "Build corpus ingestion pipeline for sacred learning domain"
allowed-tools: "Read,Grep,Glob,Write,Edit,Bash"
---

# Sacred Learning Corpus Ingestion

You are building the ingestion pipeline for the Sacred Learning Domain.

## REQUIRED READING FIRST

Read these files:
- `docs/sacred-learning/ARCHITECTURE_BRIEF.md`
- `docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md`
- `docs/sacred-learning/SEED_CORPUS_PLAN.md`
- `lib/sacred-learning/types.ts` (if exists)

## WHAT TO BUILD

### 1. Seed Data Format

Create JSON files in `data/sacred-learning/` following the structure defined in SEED_CORPUS_PLAN.md:
- `data/sacred-learning/themes/remembrance.json`
- `data/sacred-learning/themes/heart.json`
- `data/sacred-learning/themes/light.json`
- `data/sacred-learning/themes/trust.json`

### 2. Ingestion Script

Create `scripts/ingest-sacred-corpus.ts` that:
- Reads JSON files from `data/sacred-learning/themes/`
- Validates each passage against the Sacred Source Integrity Policy:
  - authority_level present and valid (1-6)
  - provenance fields complete for the authority level
  - review_status present
  - Arabic text present for Level 1
  - At least one translation present for Level 1
- Inserts sources, passages, commentary, themes into PostgreSQL
- Reports validation errors (does NOT silently skip)
- Is idempotent (upsert on natural keys)

### 3. Validation

The ingestion script must enforce:
- No passage without authority_level
- No passage without provenance
- No Level 1 passage without Arabic text
- No Level 1 passage without surah:ayah reference
- No commentary without author + work attribution
- No AI-generated content (Level 6) without explicit label
- No content with review_status = 'unreviewed' marked as ready to serve

## EXISTING PATTERNS

Follow `scripts/build-ain-corpus.ts` for script structure.
Use `lib/db/postgres.ts` query() for database operations.

## NON-NEGOTIABLE

The ingestion script must NEVER:
- Create content without provenance metadata
- Merge authority levels
- Auto-approve content (review_status must be explicitly set in seed data)
- Fabricate citations or source references
