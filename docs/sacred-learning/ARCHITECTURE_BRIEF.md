# Sacred Learning Domain — MAIA Architecture Brief

**Status:** Constitutional document (pre-implementation)
**Domain name:** `sacred-learning-domain`
**Public name:** Wisdom Keepers (or Sacred Study — to be decided)
**Date:** 2026-04-01

---

## 1. What This Is

A governed knowledge and formation module inside MAIA that supports study, contemplation, remembrance, practice, and longitudinal transformation centered on:

- The Qur'an (revelation / sacred source)
- Tafsir / classical exegesis
- Ibn al-'Arabi (mystical metaphysics)
- Rumi (contemplative poetry)
- Related Islamic contemplative sources
- Member reflection and lived integration

This is not a content app, quote engine, or chatbot skin. It is a formation system with source integrity.

## 2. What This Is Not

- Not a separate product — it is a MAIA domain
- Not a generic spirituality platform — it is rooted in Islamic tradition with explicit authority hierarchy
- Not an AI theology engine — AI serves as librarian/companion, never as authority
- Not a replacement for scholarship — it surfaces sources, it does not replace teachers

## 3. Where This Lives in MAIA

### Architectural placement

```
MAIA (experiential companion)
  |
  +-- Oracle (conversation engine)
  |     +-- Existing: elemental/spiralogic lenses
  |     +-- NEW: sacred-learning lens (wisdom oracle mode)
  |
  +-- Sacred Learning Domain (governed knowledge + formation)
  |     +-- Corpus (Qur'an, tafsir, mystical, poetic)
  |     +-- Daily Encounter (passage + layers + practice)
  |     +-- Thematic Journeys
  |     +-- Arabic Reading Support (future)
  |
  +-- Wisdom Keepers (curated source library)
  |     +-- Source registry with authority levels
  |     +-- Provenance tracking
  |     +-- Editorial review status
  |
  +-- Member Memory (existing, extended)
        +-- Sacred reflections (journal entries with source links)
        +-- Formation tracking (longitudinal return patterns)
        +-- Saved passages
```

### File system placement

```
lib/
  sacred-learning/           # NEW — domain logic
    types.ts                 # Source types, authority levels, passage model
    sourceRegistry.ts        # Authority hierarchy, provenance rules
    passageRetrieval.ts      # Retrieval with source-aware ranking
    dailyEncounter.ts        # Daily passage selection + layer assembly
    formationTracking.ts     # Longitudinal learning state
    sacredLearningLens.ts    # Oracle lens injection (like therapeuticFrameworks.ts)

  wisdom/                    # EXISTING — extend
    wisdomCorpus.ts          # NEW — corpus ingestion + indexing
    wisdomSources.ts         # NEW — source metadata registry

app/
  api/
    sacred-learning/         # NEW — API surface
      daily/route.ts         # Daily encounter endpoint
      passage/[id]/route.ts  # Single passage with layers
      journey/route.ts       # Thematic journey navigation
      reflection/route.ts    # Save reflection linked to passage
      search/route.ts        # Source-aware search

  sacred-learning/           # NEW — UI pages
    page.tsx                 # Sacred learning home / daily encounter
    passage/[id]/page.tsx    # Passage detail with commentary layers
    journey/[id]/page.tsx    # Thematic journey view
    saved/page.tsx           # Saved passages and reflections

components/
  sacred-learning/           # NEW — UI components
    PassageView.tsx          # Passage with Arabic + translation
    CommentaryLayers.tsx     # Toggleable tafsir / mystical / poetic layers
    SourceLabel.tsx          # Authority level badge
    DailyEncounter.tsx       # Daily flow wrapper
    ReflectionPrompt.tsx     # Contemplative question + journal
    PracticeInvitation.tsx   # Embodied practice suggestion
    SavedPassages.tsx        # Collection view

database/
  migrations/
    YYYYMMDDHHMMSS_sacred_learning_sources.sql
    YYYYMMDDHHMMSS_sacred_learning_passages.sql
    YYYYMMDDHHMMSS_sacred_learning_commentary.sql
    YYYYMMDDHHMMSS_sacred_learning_journeys.sql
    YYYYMMDDHHMMSS_sacred_learning_reflections.sql
    YYYYMMDDHHMMSS_sacred_learning_formation.sql

data/
  sacred-learning/           # NEW — seed corpus
    quran/                   # Qur'anic passages (JSON)
    tafsir/                  # Tafsir excerpts (JSON)
    mystical/                # Ibn al-'Arabi passages (JSON)
    poetic/                  # Rumi passages (JSON)
    themes/                  # Thematic journey definitions
    practices/               # Practice templates

scripts/
  ingest-sacred-corpus.ts    # NEW — corpus ingestion pipeline
```

## 4. What MAIA Services This Reuses

| Existing Service | Reuse | How |
|---|---|---|
| **Member system** | Full | Same auth, same `members` table, same session |
| **PostgreSQL** | Full | New tables in same database |
| **Sanctuary Mode** | Full | Sacred reflections respect sanctuary boundary |
| **Memory Palace** | Partial | Sacred reflections bridge to episodic memory |
| **Oracle route** | Extended | New lens type for wisdom-mode conversations |
| **Journal system** | Extended | Reflections linked to passages (new `source_passage_id` FK) |
| **Feature flags** | Full | `sacredLearning: false` until ready |
| **Epistemic source tagger** | Extended | New source type: `'sacred'` alongside existing `curated/archive/pattern/present` |
| **Fire-and-forget pattern** | Full | All tracking writes are non-blocking |
| **Sovereignty model** | Full | Same consent, same non-coercion, same agency principles |
| **Daily check-in** | Parallel | Daily encounter is a sibling surface, not a replacement |
| **Spiral state persistence** | Parallel | Formation state uses same pattern (load early, upsert late) |

## 5. What Must Remain Separate

| Concern | Why separate |
|---|---|
| **Source authority hierarchy** | Sacred text != therapeutic framework. Authority levels (revelation > exegesis > mystical > poetic > reflection > AI) are a new dimension not present in existing lens system |
| **Provenance tracking** | Every passage must trace to exact source, edition, translator. Existing memory doesn't need this granularity |
| **Content editorial review** | Sacred material requires human curation review before serving. Existing content doesn't have this gate |
| **Retrieval ranking** | Source-aware ranking differs from memory resonance ranking. Qur'an always outranks commentary in display hierarchy |
| **AI behavior constraints** | Wisdom oracle has stricter limits than general oracle — no doctrinal claims, no theological synthesis, explicit humility language |

## 6. Source Authority Hierarchy

This is the constitutional distinction. Six levels, never flattened:

```
Level 1: REVELATION     — Qur'an (Arabic + translation)
Level 2: EXEGESIS       — Tafsir (classical commentary)
Level 3: MYSTICAL       — Ibn al-'Arabi, classical Sufi metaphysics
Level 4: CONTEMPLATIVE  — Rumi, contemplative poetry
Level 5: REFLECTION     — Member's own journaling and reflection
Level 6: SYNTHESIS      — AI-generated study aids, connections, prompts
```

**Display rule:** Every piece of content shown to the user carries a visible authority label. Level 6 content is always marked as AI-generated and never presented alongside Level 1 content without clear visual separation.

**Retrieval rule:** When assembling a passage view, sources are presented in authority order. Higher-authority sources are never subordinated to lower ones in layout or emphasis.

**Composition rule:** The oracle, when operating in sacred-learning mode, must cite sources by level and never blend levels in a single paragraph without attribution.

## 7. How Retrieval Differs from General Oracle

The existing oracle retrieves memory resonance and applies therapeutic lenses.
The sacred learning retrieval is fundamentally different:

| Dimension | General Oracle | Sacred Learning |
|---|---|---|
| **Primary source** | Member's own history + spiralogic | Curated corpus (Qur'an, tafsir, etc.) |
| **Ranking** | Resonance / relevance | Authority hierarchy + thematic relevance |
| **Labeling** | Epistemic source type (4 types) | Authority level (6 levels) + full citation |
| **AI role** | Reflective companion | Librarian / study guide / contemplative mirror |
| **Generation** | Free response shaped by lenses | Structured response: source first, then layers, then invitation |
| **Safety** | Field safety + canon compliance | Field safety + canon + sacred source integrity policy |

### Response structure in sacred-learning mode

```
1. Source passage (Qur'an ayah, Arabic + translation, with surah:ayah reference)
2. Contextual note (brief historical/linguistic context)
3. Commentary layer (tafsir excerpt, fully cited)
4. Mystical reflection (Ibn al-'Arabi or similar, fully cited)
5. Contemplative resonance (Rumi or similar, fully cited)
6. Contemplative question (AI-generated, labeled as such)
7. Practice invitation (AI-generated, labeled as such)
```

Not every response includes all layers. The system selects layers based on:
- user's current journey/theme
- passage type
- time of day
- formation state
- explicit user request

## 8. Oracle Lens Integration

The sacred learning domain adds a new lens type to the existing therapeutic framework architecture.

```typescript
// In lib/sacred-learning/sacredLearningLens.ts

export type SacredLearningMode =
  | 'study'           // Emphasis on source + exegesis + context
  | 'contemplation'   // Emphasis on mystical + poetic + silence
  | 'practice'        // Emphasis on embodied practice + ethical formation
  | 'recitation'      // Emphasis on Arabic reading + sound + repetition
  | 'reflection'      // Emphasis on journaling + personal integration

export function getSacredLearningPromptBlock(
  mode: SacredLearningMode,
  passage: PassageWithLayers
): string {
  // Returns a prompt block injected into the oracle system prompt
  // Similar to therapeuticFrameworks.getFrameworkPromptAddendum()
  // but with sacred-source-specific constraints
}
```

**Injection point:** Same as care lens — appended to `finalSystemPrompt` in oracle route when `sacredLearningMode` is present in request body.

## 9. Daily Encounter Flow (MVP Surface)

This is the single user flow that validates the whole system.

```
Member opens Sacred Learning → Daily Encounter

1. PASSAGE
   - Qur'anic ayah (Arabic + translation)
   - Surah name, ayah number, translator attribution
   - Authority label: "Qur'an"

2. CONTEXT (expandable)
   - Brief historical/linguistic note
   - Authority label: "Study Note"

3. COMMENTARY LAYERS (toggleable)
   - Tafsir excerpt (if available for this passage)
     Authority label: "Tafsir — [Source Name]"
   - Mystical reflection (if available)
     Authority label: "Mystical Commentary — [Author]"
   - Poetic resonance (if available)
     Authority label: "Contemplative — [Author]"

4. CONTEMPLATIVE QUESTION
   - One question for sitting with
   - Authority label: "Reflection Prompt (AI-composed)"

5. PRACTICE INVITATION
   - One embodied or ethical practice
   - Authority label: "Practice Invitation (AI-composed)"

6. JOURNAL
   - Open text field for member reflection
   - Linked to today's passage
   - Stored with passage reference

7. SAVE / RETURN
   - Save passage to collection
   - Return to previous encounters
```

### Daily passage selection logic

Phase 1 (MVP): Curated sequence — passages assigned to themes, themes assigned to weeks. No algorithmic selection.

Phase 2: Adaptive selection based on member's formation state, recent reflections, and thematic journey progress.

Phase 3: AI-assisted thematic connections across member's full formation history.

## 10. Formation Tracking

New table: `member_sacred_formation` (parallel to `member_spiral_state`)

```sql
CREATE TABLE member_sacred_formation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  current_journey_id UUID REFERENCES sacred_journeys(id),
  journey_position INT DEFAULT 0,
  passages_encountered INT DEFAULT 0,
  reflections_written INT DEFAULT 0,
  practices_engaged INT DEFAULT 0,
  last_encounter_at TIMESTAMPTZ,
  formation_phase TEXT DEFAULT 'beginning',  -- beginning, deepening, returning
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id)
);
```

**Pattern:** Same as spiral state — `loadFormationState()` at encounter start, `upsertFormationState()` fire-and-forget at end.

## 11. Feature Flag

```typescript
// In lib/utils/feature-flags.ts
sacredLearning: false,           // Master gate for sacred learning domain
sacredLearningDaily: false,      // Daily encounter surface
sacredLearningJourneys: false,   // Thematic journey navigation
sacredLearningOracleLens: false, // Oracle wisdom lens mode
```

## 12. MVP Scope

### MVP includes:
- [ ] Sacred source integrity policy (document)
- [ ] Content model + schema (6 migrations)
- [ ] Seed corpus (20-30 passages across 3-4 themes)
- [ ] Ingestion script for seed data
- [ ] Daily encounter API endpoint
- [ ] Daily encounter UI page
- [ ] Passage detail view with commentary layers
- [ ] Source authority labels (component)
- [ ] Reflection journal linked to passages
- [ ] Saved passages
- [ ] Feature flag gating
- [ ] Sacred learning oracle lens (basic)

### MVP excludes (Phase 2+):
- Arabic reading support / learning progression
- Thematic journey navigation
- Adaptive passage selection
- Full Qur'an corpus
- Hadith integration
- Facilitator/practitioner views
- Multi-tradition expansion
- AI-powered thematic connections
- Recitation audio support
- Community features
- Search across corpus

## 13. Implementation Order

```
Phase 0: Policy + Design (no code)
  1. Sacred Source Integrity Policy
  2. Content model finalization
  3. Seed corpus curation plan

Phase 1: Schema + Data (backend foundation)
  4. Database migrations
  5. Type definitions
  6. Ingestion script
  7. Seed corpus preparation + ingestion

Phase 2: Retrieval + API (backend logic)
  8. Source registry service
  9. Passage retrieval service
  10. Daily encounter endpoint
  11. Reflection storage endpoint

Phase 3: UI (frontend)
  12. Feature flag
  13. PassageView component
  14. CommentaryLayers component
  15. SourceLabel component
  16. DailyEncounter page
  17. ReflectionPrompt + journal
  18. SavedPassages view

Phase 4: Oracle Integration (intelligence)
  19. Sacred learning lens
  20. Oracle route extension
  21. Formation tracking

Phase 5: Polish + Launch
  22. Smoke tests
  23. Seed corpus review
  24. Feature flag activation
```

## 14. Sovereignty Alignment

Every sovereignty invariant from `MAIA_SOVEREIGNTY_INVARIANTS.md` applies:

- **Does this increase user agency?** Yes — it surfaces primary sources, not filtered interpretations. The member encounters the text directly.
- **Does this push life outward?** Yes — practice invitations orient toward embodied ethics, not screen time.
- **Does this reduce system centrality?** Yes — the system presents sources and steps back. The member's own reflection is the center.

Additional sacred-learning-specific sovereignty rules:

- The system never interprets scripture for the user — it surfaces scholarly interpretation and invites the user's own encounter.
- The system never claims to know the "true meaning" of any passage.
- The system never substitutes AI synthesis for human scholarship.
- The system always makes it possible to see where every piece of content came from.
- Sanctuary Mode applies fully — sacred reflections can be held in sanctuary and never stored.

---

## Dependencies

- Existing member system (no changes needed)
- Existing PostgreSQL (new tables only)
- Existing oracle route (extension via lens pattern)
- Existing journal system (extension via passage FK)
- Existing feature flag system (new flags)
- Existing sovereignty model (no changes needed)
- **New:** Curated seed corpus (human editorial work required)
- **New:** Sacred source integrity policy (human-authored document)

---

## Open Questions

1. **Public name:** "Wisdom Keepers" vs "Sacred Study" vs "The School of Return" — decision needed
2. **Translation choice:** Which English Qur'an translation(s) to include at launch?
3. **Tafsir selection:** Which classical tafsir to excerpt? (Ibn Kathir? Tabari? Both?)
4. **Ibn al-'Arabi sources:** Which works? (Fusus al-Hikam? Futuhat? Both?)
5. **Rumi sources:** Which translations? (Barks? Nicholson? Arberry?)
6. **Arabic text rendering:** How to handle Arabic script in the UI? (existing font support?)
7. **Editorial review:** Who reviews seed corpus for accuracy and appropriateness?
8. **Relationship to existing Wisdom Keepers corpus:** The 67 files in `~/Documents/WisdomCorpus/` — are any of these Islamic sources?
