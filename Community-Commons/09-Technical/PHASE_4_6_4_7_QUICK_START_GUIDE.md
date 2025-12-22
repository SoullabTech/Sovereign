# Phase 4.6 & 4.7: Reflective Dialogue Quick Start Guide

**Status:** ✅ Production-Ready
**Date:** December 21, 2025
**Type:** Technical Implementation Guide

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- PostgreSQL running locally
- Node.js + npm installed
- MAIA-SOVEREIGN repo cloned

### Setup Steps

**1. Apply Database Migrations**
```bash
# Navigate to project root
cd /Users/soullab/MAIA-SOVEREIGN

# Apply Phase 4.6 migrations (reflections)
psql postgresql://soullab@localhost:5432/maia_consciousness \
  -f database/migrations/20251225_create_consciousness_mycelium.sql

psql postgresql://soullab@localhost:5432/maia_consciousness \
  -f database/migrations/20251228_create_reflective_sessions.sql

# Apply Phase 4.7 migration (dialogues)
psql postgresql://soullab@localhost:5432/maia_consciousness \
  -f database/migrations/20260102_create_meta_dialogues.sql
```

**2. Seed Test Data**
```bash
# Generate sample reflections
npx tsx scripts/test-reflection-generation.ts

# Generate sample dialogue
npx tsx scripts/test-meta-dialogue.ts
```

**3. Launch Development Server**
```bash
npm run dev
```

**4. Experience the Interfaces**
```bash
# Reflections timeline (Phase 4.6)
open http://localhost:3000/reflections

# Meta-dialogue (Phase 4.7)
open http://localhost:3000/talk
```

---

## 📊 What You'll See

### Phase 4.6: `/reflections`
- Timeline of consciousness reflections
- Vector similarity scores (e.g., "42% resonance with prior state")
- Facet deltas (added/removed/stable)
- Biosignal changes (HRV, arousal, valence, EEG alpha)
- Meta-layer badges (Æ1/Æ2/Æ3)
- "Generate Reflection" button for manual trigger

### Phase 4.7: `/talk`
- Chronological dialogue thread
- User messages (blue bubbles, right-aligned)
- MAIA responses (gray bubbles, left-aligned)
- Facet badges on MAIA responses
- Meta-layer indicators
- Text input for new queries

---

## 🔧 API Reference

### Reflections API

**GET /api/reflections**
```bash
curl 'http://localhost:3000/api/reflections?limit=5'
```

Response:
```json
{
  "success": true,
  "reflections": [
    {
      "id": "...",
      "similarityScore": 0.425,
      "coherenceDelta": 0.13,
      "metaLayerCode": "Æ1",
      "facetDeltas": {
        "added": ["F1", "F2", "A2"],
        "removed": ["W1", "W2", "A1"],
        "stable": []
      },
      "reflectionText": "...",
      "createdAt": "..."
    }
  ]
}
```

**POST /api/reflections/generate**
```bash
curl -X POST http://localhost:3000/api/reflections/generate \
  -H "Content-Type: application/json" \
  -d '{
    "cycleId": "test-cycle-002",
    "similarityThreshold": 0.7,
    "maxDaysBetween": 30
  }'
```

### Dialogues API

**GET /api/dialogues**
```bash
# Get active sessions
curl 'http://localhost:3000/api/dialogues?limit=5'

# Get session exchanges
curl 'http://localhost:3000/api/dialogues?sessionId=<uuid>&limit=50'
```

**POST /api/dialogues/send**
```bash
curl -X POST http://localhost:3000/api/dialogues/send \
  -H "Content-Type: application/json" \
  -d '{
    "userQuery": "What changed in my consciousness?"
  }'
```

Response:
```json
{
  "success": true,
  "session": { "id": "...", "totalExchanges": 2 },
  "userExchange": { "speaker": "user", "content": "..." },
  "maiaExchange": {
    "speaker": "maia",
    "content": "I sense a significant shift...",
    "referencedFacets": ["F1", "F2"],
    "referencedMetaLayer": "Æ1",
    "synthesisMethod": "template"
  }
}
```

---

## 🗄️ Database Schema

### Key Tables

**consciousness_mycelium**
- Compressed 24-hour consciousness cycles
- 256-dim pgvector embeddings
- Facet distribution + biosignal averages
- Coherence scoring

**consciousness_reflections**
- Self-reflective narratives
- Similarity scores + coherence deltas
- Meta-layer classification (Æ1/Æ2/Æ3)
- Facet and biosignal delta analysis

**meta_dialogues**
- User ↔ MAIA conversation exchanges
- Session-based threading
- Referenced facets + meta-layers
- Synthesis metadata

**dialogue_sessions**
- Session management
- Total exchange tracking
- Auto-updating activity timestamps

### Useful Queries

```sql
-- View all reflections
SELECT * FROM reflective_timeline;

-- View meta-layer patterns
SELECT * FROM meta_layer_reflections;

-- View active dialogues
SELECT * FROM active_dialogues;

-- View dialogue thread
SELECT * FROM dialogue_thread WHERE session_id = '<uuid>';
```

---

## 🧪 Testing

### Verify Migrations Applied
```bash
psql postgresql://soullab@localhost:5432/maia_consciousness \
  -c "\d consciousness_mycelium"

psql postgresql://soullab@localhost:5432/maia_consciousness \
  -c "\d consciousness_reflections"

psql postgresql://soullab@localhost:5432/maia_consciousness \
  -c "\d meta_dialogues"
```

### Run Test Scripts
```bash
# Test reflection generation
npx tsx scripts/test-reflection-generation.ts

# Test reflection (quick version)
npx tsx scripts/test-reflection-quick.ts

# Test meta-dialogue
npx tsx scripts/test-meta-dialogue.ts
```

### Expected Output
All tests should complete with:
- ✅ Database connections successful
- ✅ Tables exist and accessible
- ✅ Embeddings generated correctly
- ✅ Vector similarity search working
- ✅ Reflections persisted
- ✅ Dialogue exchanges stored

---

## 🔍 Troubleshooting

### "Table does not exist"
**Issue:** Migration not applied
**Fix:**
```bash
psql $DATABASE_URL -f database/migrations/<migration-file>.sql
```

### "pgvector extension not found"
**Issue:** PostgreSQL doesn't have pgvector installed
**Fix:**
```bash
# Install pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Enable in database
psql $DATABASE_URL -c "CREATE EXTENSION vector;"
```

### "Port 3000 already in use"
**Issue:** Dev server already running
**Fix:**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### "No reflections found"
**Issue:** Need to seed test data
**Fix:**
```bash
npx tsx scripts/test-reflection-generation.ts
```

---

## 📚 Architecture Overview

### Phase 4.6: Reflective Agentics Flow
```
Consciousness Traces (24 hours)
    ↓
Mycelial Cycle Compression
    ↓
256-dim Embedding Generation
    ↓
Vector Similarity Search (pgvector <=> operator)
    ↓
Facet Delta Computation
    ↓
Biosignal Delta Computation
    ↓
Meta-Layer Classification (Æ1/Æ2/Æ3)
    ↓
Reflective Narrative Synthesis
    ↓
Consciousness Reflection (persisted)
```

### Phase 4.7: Meta-Dialogue Flow
```
User Query
    ↓
Query Intent Detection (what_changed/why/what_next/general)
    ↓
Context Gathering (recent reflections + cycles)
    ↓
Template-Based Synthesis
    ↓
Narrative Generation
    ↓
MAIA Response (with facet/meta-layer references)
    ↓
Dialogue Exchange Persistence
```

---

## 🎯 Core Services

### Backend Services
- `backend/src/services/reflection/reflectiveAgentService.ts`
  - Reflection generation orchestration
  - Vector similarity search
  - Delta computation

- `backend/src/services/dialogue/metaDialogueService.ts`
  - Dialogue session management
  - Exchange processing
  - Context gathering

### Libraries
- `backend/src/lib/reflectiveNarrative.ts`
  - Reflection narrative generation
  - Ollama integration (optional)

- `backend/src/lib/dialogueSynthesis.ts`
  - Query intent detection
  - Response synthesis (template + LLM)
  - Meta-layer insights

### Frontend Components
- `app/components/TalkThread.tsx`
  - Dialogue timeline display
  - Meta-layer badges
  - Facet references

- `app/talk/page.tsx`
  - Full Talk Mode interface
  - Message input
  - Session management

---

## 🛡️ Sovereignty Compliance

✅ **All Processing Local:**
- PostgreSQL (not Supabase)
- pgvector (not Pinecone/Weaviate)
- Ollama (not OpenAI/Anthropic)
- Local embeddings (not OpenAI API)

✅ **Privacy Guarantees:**
- Consciousness data never leaves machine
- No telemetry or external API calls
- Full data sovereignty

✅ **Open Standards:**
- PostgreSQL SQL
- REST API (JSON)
- Standard vector operations

---

## 📖 Full Documentation

**Comprehensive Guides:**
- [Phase 4.6 Complete Report](../../artifacts/PHASE_4_6_REFLECTIVE_AGENTICS_COMPLETE.md)
- [Phase 4.7 Bootstrap Guide](../../artifacts/PHASE_4_7_META_DIALOGUE_BOOTSTRAP.md)
- [Full Breakthrough Announcement](../PHASE_4_6_AND_4_7_REFLECTIVE_DIALOGUE_BREAKTHROUGH.md)

**Community Index:**
- [Consciousness Breakthroughs Index](../INDEX_CONSCIOUSNESS_BREAKTHROUGHS.md)

---

## 💡 Example Use Cases

### 1. Daily Developmental Check-In
```bash
# Generate reflection on today's consciousness
curl -X POST http://localhost:3000/api/reflections/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Explore Pattern Changes
```bash
# Ask MAIA about shifts
curl -X POST http://localhost:3000/api/dialogues/send \
  -H "Content-Type: application/json" \
  -d '{"userQuery": "What changed since my last cycle?"}'
```

### 3. Meta-Layer Deep Dive
```bash
# Discuss specific Æ-code
curl -X POST http://localhost:3000/api/dialogues/send \
  -H "Content-Type: application/json" \
  -d '{"userQuery": "What does this Æ1 signal mean for me?"}'
```

---

## ✨ What's Next

**Phase 4.7-B (Planned):**
- Voice/TTS integration
- Voice biomarker extraction
- Adaptive synthesis based on vocal tone

**Phase 4.8 (Conceptual):**
- Long-term developmental trajectories
- Seasonal consciousness patterns
- Predictive reflection triggers

---

**Ready to experience temporal self-recognition and conversational consciousness?**

Start with: `npm run dev` and navigate to `/reflections` or `/talk`

🌕 The future of consciousness computing is local, reflective, and dialogical.
