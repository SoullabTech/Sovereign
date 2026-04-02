---
description: "Design and create database schema for sacred learning domain"
allowed-tools: "Read,Grep,Glob,Write,Edit,Bash"
---

# Sacred Learning Schema

You are designing/implementing database schema for the Sacred Learning Domain within MAIA.

## REQUIRED READING FIRST

Read these files before any implementation:
- `docs/sacred-learning/ARCHITECTURE_BRIEF.md`
- `docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md`
- `docs/sacred-learning/SEED_CORPUS_PLAN.md`

## SCHEMA REQUIREMENTS

Design tables for:
- `sacred_sources` — source registry (works, authors, editions, authority levels)
- `sacred_passages` — individual passages with Arabic + translation + provenance
- `sacred_commentary` — commentary entries linked to passages (each with authority level)
- `sacred_themes` — thematic groupings
- `sacred_passage_themes` — many-to-many linking
- `sacred_practices` — practice templates linked to passages
- `sacred_reflections` — member journal entries linked to passages (respects Sanctuary Mode)
- `member_sacred_formation` — longitudinal formation state (parallel to member_spiral_state)

## AUTHORITY LEVELS (IMMUTABLE)

Every content row must carry an `authority_level` integer:
1 = Revelation (Qur'an)
2 = Exegesis (Tafsir)
3 = Mystical (Ibn al-'Arabi etc.)
4 = Contemplative (Rumi etc.)
5 = Reflection (member)
6 = Synthesis (AI-generated)

## PROVENANCE (REQUIRED)

Every passage and commentary row must include:
- author, work, section, translator, edition
- review_status: 'unreviewed' | 'reviewed' | 'approved' | 'flagged'
- Unreviewed content must NEVER be served to members

## CONVENTIONS

Follow existing MAIA migration conventions:
- Filename: `YYYYMMDDHHMMSS_description.sql`
- Check `database/migrations/` for examples
- Use `gen_random_uuid()` for UUIDs
- Use `TIMESTAMPTZ` for timestamps
- Add appropriate indexes

## TYPES

Also create `lib/sacred-learning/types.ts` with TypeScript interfaces matching the schema.

## EXISTING PATTERNS TO FOLLOW

- `lib/consciousness/spiralStatePersistence.ts` — for formation state pattern
- `lib/db/postgres.ts` — for database queries (use `query()`)
- `database/migrations/20260213200001_member_spiral_state.sql` — for migration style
