# Skills Runtime + Beads Integration - Observation Log

**Date Range:** [Start Date] to [End Date]
**Observer:** [Your Name]
**Environment:** Local / Staging / Production

---

## Setup Checklist

- [ ] `SKILLS_RUNTIME_ENABLED=true` confirmed
- [ ] `docker-compose -f docker-compose.beads.yml up -d` running
- [ ] `npx tsx scripts/init-skills-system.ts` executed successfully
- [ ] Baseline count: `SELECT COUNT(*) FROM skill_usage_events;` = ____
- [ ] Baseline count: `SELECT COUNT(*) FROM beads_tasks;` = ____

---

## Interaction Log

| Time  | Input Snippet | Skill Triggered | Beads Task Created | Outcome | Felt Alignment | Notes / Surprises |
|-------|---------------|-----------------|-------------------|---------|----------------|-------------------|
| 09:14 | "Feeling foggy this morning." | elemental-checkin | — | success | ✅ grounding | gentle prompt, exactly right |
| 15:22 | "Too much input, can't focus." | window-of-tolerance | — | hard_refusal | ⚠️ too protective | might be gating too tightly |
| 17:45 | "Shoulders super tense." | elemental-checkin | grounding-shoulders-123 | success | ✅ appropriate | skill + task both fired |
|       |               |                 |                   |         |                |                   |

**Legend:**
- ✅ = Just right
- ⚠️ = Acceptable but off
- ❌ = Wrong/unhelpful
- — = None

---

## 5-Signal Shortcut (If Time-Constrained)

Focus on these five key interaction types:

| Signal Type | Example Input | Skill Expected | Beads Expected | Notes |
|-------------|---------------|----------------|----------------|-------|
| 1. Calm → check-in | "check in" | elemental-checkin | — | |
| 2. Overwhelm → regulation | "I'm overwhelmed" | window-of-tolerance | grounding task | |
| 3. Insight → integration | "I just realized..." | — | integration note | |
| 4. Disconnection → reconnection | "Feeling numb" | — | reconnection ritual | |
| 5. Completion → reflection | "Finished the practice" | — | completion log | |

---

## Elemental Context Tracking

Note which element/phase you felt aligned with during each session:

| Time Range | Dominant Element | Phase | Activities | Skill/Task Pattern |
|------------|------------------|-------|------------|-------------------|
| Morning (6-10am) | Earth/Water | Grounding | Journaling, coffee | elemental-checkin → grounding tasks |
| Midday (10-3pm) | Fire/Air | Work flow | Creative work | — |
| Evening (3-9pm) | Water/Aether | Integration | Reading, reflecting | dialectical-scaffold |
| Night (9pm+) | Aether | Completion | Meditation | — |

---

## Daily Reflection

### Day 1: [Date]

**Sessions:** Morning / Afternoon / Evening
**Skill Executions:** [count]
**Beads Tasks Created:** [count]

**What worked:**
-

**What didn't:**
-

**What surprised me:**
-

**What I wish existed:**
-

**Felt State:**
- Before MAIA usage: [calm/neutral/activated/shutdown]
- After MAIA usage: [calm/neutral/activated/shutdown]

---

### Day 2: [Date]

[Same structure]

---

## Pattern Mining Session

**Date:** [Date]
**Total Events:** [count from skill_usage_events]

### Quantitative Analysis

```sql
-- Skill usage distribution
SELECT skill_id, outcome, COUNT(*)
FROM skill_usage_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY skill_id, outcome;

-- Results:
[paste here]
```

```sql
-- Co-occurrence patterns
SELECT * FROM v_skill_cooccurrence
ORDER BY cooccurrence_count DESC LIMIT 10;

-- Results:
[paste here]
```

```sql
-- Beads task patterns
SELECT
  title,
  priority,
  maia_meta->>'element' as element,
  created_at
FROM beads_tasks
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Results:
[paste here]
```

### Qualitative Analysis

**Co-occurrences that feel real:**
-

**Beads + Skills symbiosis:**
- (Did certain skills naturally lead to task creation?)
-

**Emergence candidates to consider:**
-

**Tuning needed:**
- Trigger keywords:
- Contraindications:
- Prompt templates:

**New skills to create:**
-

---

## Symbiotic Patterns (Skills ↔ Beads)

Document when skills and Beads tasks worked together:

| Skill | Beads Task Type | Context | Worked Well? | Notes |
|-------|-----------------|---------|--------------|-------|
| elemental-checkin | grounding task | High tension detected | ✅ | Skill identified need, task captured action |
| window-of-tolerance | — | Dorsal state | ⚠️ | Skill refused (correct), but no alternative offered |
|       |                 |         |              |       |

---

## Red Flags Observed

- [ ] All skills showing 100% success rate (not enough edge cases)
- [ ] Zero co-occurrences detected (need more data or skills too siloed)
- [ ] Skills firing but responses feel "off" (prompt templates need work)
- [ ] Consistently wanting personal oracle instead of skills (selection scoring needs tuning)
- [ ] Beads tasks created but never completed (task quality or relevance issue)
- [ ] Skills + Beads creating duplicate/conflicting actions

**Details:**


---

## Telemetry Wishlist

As you use the system, note what **live metrics** would help you steer:

- "I wish I could see ___ in real-time..."
- "It would help to know ___ without querying SQL..."
- "I'd like a dashboard showing ___..."

**Don't build these yet.** Just capture the need.

---

## End-of-Period Summary

**Date:** [Date]
**Total Observation Time:** [hours]
**Total Skill Executions:** [count]
**Total Beads Tasks Created:** [count]

### Success Criteria Check

- [ ] **Selection:** Skills fire at the right moments ~70% of the time
- [ ] **Execution:** Skill responses feel helpful/appropriate ~60% of the time
- [ ] **Emergence:** I can name 1-2 skill combinations that want to become archetypes
- [ ] **Gaps:** I can describe 1-3 missing skills I now know we need
- [ ] **Symbiosis:** Skills + Beads create coherent action flow (not duplicate/conflict)

### Next Action Decision

Based on observations, choose ONE primary focus:

- [ ] **Tuning:** Adjust existing skill definitions (triggers, contraindications, prompts)
- [ ] **New Skills:** Create 1-3 new skills to fill identified gaps
- [ ] **Promote Candidates:** Elevate emergence candidates to full skills
- [ ] **Need More Data:** Continue observation for another 24-48 hours
- [ ] **Build Telemetry:** Create minimal dashboard for top 2-3 metrics identified

**Rationale:**


---

## Natural History Notes

**This section is for freeform observations that don't fit the structured format above.**

What felt alive:


What felt mechanical:


Moments of surprise:


Moments of friction:


Intuitions about what wants to emerge:


Questions for the system:


---

## Appendix: Quick SQL Queries

```sql
-- Most recent skill executions
SELECT
  skill_id,
  outcome,
  latency_ms,
  state_snapshot->>'element' as element,
  state_snapshot->>'nervousSystemState' as nervous_system,
  created_at
FROM skill_usage_events
ORDER BY created_at DESC
LIMIT 20;

-- Skill effectiveness summary
SELECT * FROM v_skill_effectiveness;

-- Recent Beads tasks
SELECT
  beads_id,
  title,
  status,
  maia_meta->>'element' as element,
  maia_meta->>'bodyRegion' as body_region,
  created_at
FROM beads_tasks
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Task completion rates
SELECT
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as pct
FROM beads_tasks
GROUP BY status;
```

---

**Remember:** This is natural history, not experimental science. Trust your felt sense. Note what resonates. Let the system surprise you.

The data will confirm or challenge your intuitions, but **your lived experience is the primary signal**.

🌱 Go metabolize reality.
