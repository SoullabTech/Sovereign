---
name: Sacred Learning Domain
description: MAIA-integrated sacred text learning system centered on Qur'an, tafsir, Ibn al-'Arabi, Rumi — governed by source integrity policy with 6-level authority hierarchy
type: project
---

Sacred Learning Domain is a governed knowledge + formation module inside MAIA, not a separate product.

**Why:** The founder wants a respectful, rigorous, source-aware system for Qur'anic study, contemplation, remembrance, and transformation — integrated with MAIA's existing member system, memory, sovereignty, and oracle infrastructure.

**How to apply:** All sacred learning work must follow the architecture brief and source integrity policy in `docs/sacred-learning/`. The 6-level authority hierarchy (Revelation > Exegesis > Mystical > Contemplative > Reflection > Synthesis) is non-negotiable. AI never claims doctrinal authority. Every content block carries provenance and visible source labels.

**Constitutional docs (created 2026-04-01):**
- `docs/sacred-learning/ARCHITECTURE_BRIEF.md` — system design, file placement, MAIA integration points
- `docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md` — authority hierarchy, labeling, AI constraints, editorial review
- `docs/sacred-learning/MVP_SCOPE.md` — daily encounter flow, phased implementation
- `docs/sacred-learning/SEED_CORPUS_PLAN.md` — 4 launch themes (Remembrance, Heart, Light, Trust), ~28 passages

**Claude Code skills (invoke with /command):**
- `/sacred-learning-schema` — database migrations + types
- `/sacred-learning-ingestion` — corpus ingestion pipeline
- `/sacred-learning-retrieval` — API endpoints + retrieval logic
- `/sacred-learning-ui` — components + pages
- `/sacred-learning-agent` — AI behavior + oracle lens
- `/sacred-learning-audit` — integrity audit checklist

**Key architectural decisions:**
- Reuses: member auth, PostgreSQL, Sanctuary Mode, memory palace, feature flags, fire-and-forget pattern
- Separate: source authority hierarchy, provenance tracking, editorial review gate, retrieval ranking
- Oracle integration: new lens type (like therapeutic frameworks), injected via same prompt composition pattern
- New tables: sacred_sources, sacred_passages, sacred_commentary, sacred_themes, sacred_practices, sacred_reflections, member_sacred_formation
- Feature flag: `sacredLearning` (default false)

**MVP validation question:** Can this system deliver a daily sacred encounter that preserves source integrity and invites genuine formation?

**Decisions confirmed (2026-04-01):**
- Public name: **Wisdom Keepers** (top-level) → **Sacred Study** (module) → **Qur'an & Mystics** (track)
- Qur'an translation: **Abdel Haleem** (OUP 2004). Schema supports multiple translations for Phase 2.
- Rumi: **Nicholson** primary (public domain). Barks excluded from canonical layer (strips Islamic context). Can add later as "modern poetic adaptation" with clear label.
- Seed corpus review: **Founder curates personally** for MVP. One external reviewer before launch (tone calibration, not approval).
- WisdomCorpus (~/Documents/): **Do not ingest directly.** Filter first → map to authority levels → check provenance → then consider.
- Layer visibility toggle: add early — user controls: text only / text+meaning / text+full layers
