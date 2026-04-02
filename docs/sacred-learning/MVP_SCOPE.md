# Sacred Learning Domain — MVP Scope

**Status:** Implementation planning
**Date:** 2026-04-01

---

## MVP Definition

The MVP validates one question: **Can this system deliver a daily sacred encounter that preserves source integrity and invites genuine formation?**

Everything in the MVP serves this single flow.

---

## The One Flow: Daily Encounter

```
Member opens /sacred-learning
  |
  +-- Today's passage (Qur'an ayah, Arabic + translation)
  |     Source label: "Qur'an — Al-Baqarah 2:152"
  |
  +-- Context note (brief, 2-3 sentences)
  |     Source label: "Study Note"
  |
  +-- Commentary layers (toggleable)
  |     Tafsir: "Tafsir — Ibn Kathir"
  |     Mystical: "Mystical Commentary — Ibn al-'Arabi"
  |     Contemplative: "Contemplative — Rumi (tr. Nicholson)"
  |
  +-- Contemplative question
  |     Source label: "Reflection Prompt (AI-composed)"
  |
  +-- Practice invitation
  |     Source label: "Practice Invitation (AI-composed)"
  |
  +-- Journal
  |     Open text field, linked to today's passage
  |
  +-- Save to collection
```

---

## MVP Features (in implementation order)

### Phase 0: Policy (complete)
- [x] Architecture brief
- [x] Sacred source integrity policy

### Phase 1: Schema + Types
- [ ] `sacred_sources` table — source registry (works, authors, editions)
- [ ] `sacred_passages` table — individual passages with Arabic + translation
- [ ] `sacred_commentary` table — commentary entries linked to passages
- [ ] `sacred_themes` table — thematic groupings
- [ ] `sacred_passage_themes` table — many-to-many linking
- [ ] `sacred_practices` table — practice templates
- [ ] `sacred_reflections` table — member journal entries linked to passages
- [ ] `member_sacred_formation` table — longitudinal formation state
- [ ] TypeScript types in `lib/sacred-learning/types.ts`

### Phase 2: Seed Data
- [ ] Seed corpus JSON files (see SEED_CORPUS_PLAN.md)
- [ ] Ingestion script: `scripts/ingest-sacred-corpus.ts`
- [ ] Verify all seed data passes integrity policy checks

### Phase 3: API
- [ ] `GET /api/sacred-learning/daily` — today's encounter (passage + layers)
- [ ] `GET /api/sacred-learning/passage/[id]` — single passage detail
- [ ] `POST /api/sacred-learning/reflection` — save reflection
- [ ] `GET /api/sacred-learning/saved` — member's saved passages
- [ ] `POST /api/sacred-learning/save` — save a passage to collection

### Phase 4: UI Components
- [ ] `SourceLabel` — authority level badge (6 variants)
- [ ] `PassageView` — Arabic + translation + reference
- [ ] `CommentaryLayers` — toggleable commentary sections
- [ ] `ReflectionPrompt` — contemplative question display
- [ ] `PracticeInvitation` — practice suggestion display
- [ ] `ReflectionJournal` — text input linked to passage
- [ ] `DailyEncounter` — full daily flow wrapper

### Phase 5: Pages
- [ ] `/sacred-learning` — daily encounter page
- [ ] `/sacred-learning/passage/[id]` — passage detail page
- [ ] `/sacred-learning/saved` — saved passages page

### Phase 6: Feature Flag + Integration
- [ ] `sacredLearning` feature flag (default: false)
- [ ] Navigation entry in sidebar/drawer (gated)
- [ ] Sanctuary Mode integration for reflections

---

## MVP Excludes

| Feature | Why excluded | Phase |
|---|---|---|
| Arabic reading/learning support | Significant scope | 2 |
| Thematic journey navigation | Needs more content first | 2 |
| Adaptive passage selection | Needs usage data | 2 |
| Oracle wisdom lens mode | Daily encounter validates concept first | 2 |
| Full Qur'an corpus | Start with curated selection | 2 |
| Hadith integration | Requires careful curation methodology | 3 |
| Search across corpus | Needs larger corpus | 2 |
| Recitation audio | Audio infrastructure | 3 |
| Facilitator/practitioner views | After member experience is proven | 3 |
| Formation analytics | After longitudinal data exists | 3 |
| Multi-tradition expansion | After Islamic layer is properly grounded | 4+ |

---

## Implementation Estimates

| Phase | Work | Dependencies |
|---|---|---|
| Phase 1: Schema | 6-8 migrations, types file | Architecture brief |
| Phase 2: Seed Data | Corpus curation + ingestion script | Schema, editorial review |
| Phase 3: API | 5 endpoints | Schema, seed data |
| Phase 4: Components | 7 components | API |
| Phase 5: Pages | 3 pages | Components |
| Phase 6: Integration | Flag + nav + sanctuary | Pages |

**Critical path:** Seed data curation is the bottleneck. Schema and API can be built without final content, but the system cannot be tested meaningfully without real passages.

---

## Launch Criteria

Before activating the feature flag:

- [ ] All seed passages reviewed and approved
- [ ] All provenance metadata complete
- [ ] Authority labels render correctly at all 6 levels
- [ ] Commentary layers toggle properly
- [ ] Reflections save and retrieve correctly
- [ ] Sanctuary Mode blocks reflection storage when active
- [ ] Arabic text renders correctly
- [ ] Mobile layout works (passage view, commentary, journal)
- [ ] No AI-generated content presented without explicit label
- [ ] At least 2 weeks of daily encounters available in seed data
