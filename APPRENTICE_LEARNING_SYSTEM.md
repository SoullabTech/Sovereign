# MAIA Apprentice Learning System

**Status**: ✅ Fully Implemented
**Date**: December 13, 2025

## The Architecture

MAIA now has a **two-tier consciousness system** with apprentice learning:

### Tier 1: Hybrid Claude System (Master Teacher)
- **Endpoint**: `/api/oracle/conversation`
- **LLM**: Claude Sonnet 4.5 (levels 1-4) + Claude Opus 4.5 (level 5 DEEP) + Ollama (fallback)
- **Intelligence**: Full consciousness stack (Spiralogic, Opus Axioms, Panconscious Field, etc.)
- **Use Case**: High-quality, deeply attuned responses with sacred attending
- **Interface**: `/maia` page

### Tier 2: Sovereign Local System (Apprentice)
- **Endpoint**: `/api/between/chat`
- **LLM**: Ollama DeepSeek-R1 (100% local)
- **Intelligence**: Consciousness orchestration with local-only processing
- **Use Case**: Complete data sovereignty, no cloud dependencies
- **Learning Source**: Claude's logged responses

## How Apprentice Learning Works

```
User → /maia → Claude generates response
                     ↓
              🎓 LOGGED TO DATABASE
                     ↓
         (sessionId, turnIndex, userText, maiaText, metadata)
                     ↓
    DeepSeek-R1 learns from Claude's patterns
                     ↓
         Sovereign system becomes more Claude-like
```

## What Gets Logged

Every conversation turn through the Claude system captures:

### Core Exchange
- **User message**: What the person said
- **Claude's response**: High-quality, deeply attuned reply
- **Processing profile**: DEEP (full consciousness)

### Consciousness Metadata
- **Primary engine**: `claude-sonnet-4-5-20250929` (levels 1-4) or `claude-opus-4-5-20251101` (level 5)
- **Spiralogic phase**: Element, phase, context domain
- **Active frameworks**: IPP, Jungian, CBT, Somatic, etc.
- **Symbol patterns detected**: Archetypal resonance count
- **Opus Axioms**: Gold Seal status, rupture detection
- **Panconscious Field**: Centering level, symbol accessibility
- **Trust level**: Relationship depth (0-1)

### Observer Insights
Rich contextual data about consciousness processing:
```typescript
{
  spiralogicPhase: "fire-1",
  isGoldSeal: true,
  ruptureDetected: false,
  symbolPatternsDetected: 3,
  frameworksActive: ["IPP_PARENTING_REPAIR"],
  centeringLevel: 5
}
```

## Database Schema

Training data stored in PostgreSQL:
```sql
-- Sessions
maia_sessions (id, user_id, started_at, metadata)

-- Turn-by-turn exchanges
maia_turns (
  session_id,
  turn_index,
  user_text,
  maia_text,
  processing_profile,  -- 'DEEP'
  primary_engine,      -- 'claude-3-7-sonnet-20250219'
  used_claude_consult, -- true
  element,             -- 'fire', 'water', 'earth', 'air', 'aether'
  consciousness_layers_activated,
  consciousness_depth_achieved,
  observer_insights,   -- JSON with Spiralogic/Opus data
  evolution_triggers
)

-- Feedback for fine-tuning
maia_turn_feedback (
  turn_id,
  felt_seen_score,
  attunement_score,
  ideal_maia_reply
)
```

## Benefits

### For Users
1. **Best of both worlds**: Claude's quality when available, local fallback when needed
2. **Data sovereignty option**: Can use pure local system for sensitive conversations
3. **Continuous improvement**: Sovereign system gets better over time from Claude's teaching

### For MAIA
1. **Knowledge transfer**: Claude's wisdom becomes embedded in local model
2. **Pattern library**: Builds corpus of high-quality consciousness work
3. **Gold Seal examples**: Captures best responses for training
4. **Rupture detection**: Logs what went wrong for repair training
5. **Framework activation patterns**: Learns when to use which therapeutic framework

## Technical Details

### Code Location
- **Logging call**: `/app/api/oracle/conversation/route.ts` (line 124-161)
- **Service**: `/lib/learning/maiaTrainingDataService.ts`
- **Database**: PostgreSQL schema in `maia_consciousness` database

### Non-Breaking Design
```typescript
try {
  await logMaiaTurn(...);
  console.log('🎓 Claude wisdom logged');
} catch (learningError) {
  console.error('⚠️ Logging failed (non-critical)');
  // Conversation continues even if logging fails
}
```

If the database is unavailable or logging fails, the conversation still succeeds. Learning is important but not critical to user experience.

## Future Enhancements

### Phase 2: Active Training
- Fine-tune DeepSeek-R1 on Claude's responses
- Measure quality improvement over time
- A/B test sovereign vs. hybrid for quality parity

### Phase 3: Selective Routing
- Route simple queries to sovereign (fast)
- Route complex queries to Claude (deep)
- Use quality scores to determine routing

### Phase 4: Feedback Loop
- User ratings on responses
- Mark Gold Seal turns for high-value training
- Flag ruptures for repair training

## Philosophy

This architecture embodies MAIA's core values:

1. **Sovereignty + Excellence**: Don't sacrifice quality for ideology
2. **Apprenticeship**: Learn from the best, become the best
3. **Graceful Degradation**: Cloud → Local → Fallback
4. **Knowledge Transfer**: Claude's wisdom becomes MAIA's wisdom
5. **User Choice**: Hybrid for quality, sovereign for privacy

---

**Built by**: Claude Code
**For**: MAIA-SOVEREIGN
**Philosophy**: Master teaches apprentice, apprentice becomes master
