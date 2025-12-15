# Beta Cohort Tracking System (50-100 Users)

## Cohort Definitions

### Cohort A: Contemplative Practitioners (20-30 users)
- Meditation/mindfulness background
- Familiar with non-directive approaches
- **Hypothesis**: Longest sessions, deepest engagement, lowest escape hatch usage

### Cohort B: AI-Curious Explorers (20-30 users)  
- Heavy ChatGPT/Claude users
- Seeking novel AI experiences
- **Hypothesis**: Initial confusion, then either deep engagement or quick dropout

### Cohort C: Self-Discovery Seekers (15-25 users)
- Active therapy/coaching participants
- Journaling practice
- **Hypothesis**: Medium-long sessions, high return rate, occasional help requests

### Cohort D: Skeptical Testers (15-25 users)
- Expect traditional AI assistance
- May challenge the paradigm
- **Hypothesis**: Shortest initial sessions, highest escape hatch usage, valuable edge case insights

## Tracking Metrics by Cohort

```typescript
interface CohortMetrics {
  cohortId: 'A' | 'B' | 'C' | 'D';
  cohortSize: number;
  aggregateMetrics: {
    // Engagement
    avgSessionDuration: number;        // minutes
    avgExchangesPerSession: number;    
    returnRate: number;                // % who return after first session
    dailyActiveRate: number;           // % active daily
    
    // Paradigm Alignment  
    escapeHatchTriggers: {
      crisis: number;
      explicitHelp: number;
      frustration: number;
    };
    witnessModeMaintenance: number;    // % time in pure witness mode
    
    // Evolution Patterns
    dominantElements: Record<string, number>;
    averageDepthProgression: 'increasing' | 'stable' | 'decreasing';
    trustLevelProgression: number[];   // Over time
    
    // Satisfaction Signals
    naturalCompletionRate: number;     // % sessions ending naturally
    avgSessionsPerUser: number;
    recommendationLikelihood: number;  // NPS-style
  };
  
  individualHighlights: {
    lighthouseUsers: string[];         // User IDs showing exemplary engagement
    strugglingUsers: string[];         // Need additional support
    paradigmChallengers: string[];      // Pushing boundaries productively
  };
}
```

## Behavioral Pattern Comparison

### Key Comparison Points Across Cohorts

1. **First Session Behavior**
   - Time to first meaningful exchange
   - Confusion indicators
   - Engagement depth

2. **Evolution Over Time**
   - Session length trajectory
   - Depth progression
   - Element preference stabilization

3. **Crisis & Help Patterns**
   - When escape hatches trigger
   - Recovery from directive moments
   - Adaptation to witness paradigm

4. **Natural Language Patterns**
   ```
   Cohort A: "I'm noticing..." "What emerges is..."
   Cohort B: "Why won't you just..." → "Oh, I see what this is..."
   Cohort C: "This reminds me of therapy..." "It's like you're holding space..."
   Cohort D: "This is broken" → "Actually, this is interesting..." (or dropout)
   ```

## Weekly Cohort Analysis Template

```markdown
## Week [X] Cohort Analysis

### Cohort A: Contemplative Practitioners
- Active users: X/Y (Z%)
- Avg session: X min (Δ from last week)
- Escape hatch triggers: X
- Notable insight: [Qualitative observation]

### Cohort B: AI-Curious
- Active users: X/Y (Z%)
- Paradigm adaptation rate: X%
- Most common friction point: [Description]
- Success story: [User example]

### Cohort C: Self-Discovery  
- Active users: X/Y (Z%)
- Depth progression: [Increasing/Stable/Variable]
- Therapeutic parallels noted: X times
- Integration success: [Example]

### Cohort D: Skeptical
- Active users: X/Y (Z%)
- Dropout rate: X%
- Valuable challenges raised: [List]
- Surprising converts: X users

### Cross-Cohort Insights
- Universal success patterns: [What works across all]
- Cohort-specific needs: [Unique requirements]
- Onboarding adjustments needed: [Based on cohort struggles]
```

## Screening Questions by Cohort

### Universal Questions (All Cohorts)
1. "How comfortable are you with uncertainty?"
2. "Are you looking for answers or exploration?"
3. "Describe a time you found your own answer"

### Cohort-Specific Questions

**Cohort A**: "What's your experience with contemplative practice?"

**Cohort B**: "What's missing from current AI assistants for you?"

**Cohort C**: "What are you hoping to discover about yourself?"

**Cohort D**: "What would convince you this is valuable?"

## Onboarding Variants by Cohort

### Cohort A: Contemplative
"Maya practices sacred witnessing, like a meditation teacher who holds space without directing."

### Cohort B: AI-Curious  
"Maya is radically different from ChatGPT - she won't give advice. She's an AI that practices presence."

### Cohort C: Self-Discovery
"Think of Maya like a therapist who uses only reflection and curious questions - never advice."

### Cohort D: Skeptical
"Fair warning: Maya might frustrate you at first. She won't answer directly. Still interested?"

## Example Exchange to Set Expectations

**User**: "I'm overwhelmed with my work situation"

**Typical AI**: "Here are 5 strategies to manage workplace overwhelm..."

**Maya**: "Something about your work situation feels really heavy right now. What part of it wants your attention most?"

**User**: "I guess... the feeling that I can't keep up"

**Maya**: "That feeling of not keeping up... what does it know that you might not be seeing yet?"

## Success Metrics by Cohort Size

### 50 Users (10-15 per cohort)
- Personal review possible
- Individual journey tracking
- Direct user contact feasible

### 100 Users (20-30 per cohort)
- Statistical patterns emerge
- Cohort-level insights clear
- Automated tracking essential
- Focus on outliers and patterns

## Beta Evolution Pathway

**Weeks 1-2**: Small cohorts (10-15 each), close observation
**Weeks 3-4**: Expand to 20-25 each, pattern recognition
**Weeks 5-6**: Full 100 users, statistical validation
**Week 7-8**: Identify optimal user profile for wider launch

## Risk Monitoring by Cohort

**Cohort A**: Risk of over-identification, treating Maya as guru
**Cohort B**: Risk of trying to "hack" Maya into traditional AI
**Cohort C**: Risk of therapeutic transference
**Cohort D**: Risk of public criticism if paradigm isn't understood

---

This cohort approach lets you maintain quality insights even at 100 users while identifying which user types most benefit from Maya's witness paradigm.