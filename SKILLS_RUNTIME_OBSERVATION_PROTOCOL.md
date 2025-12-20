# Skills Runtime - Usage Observation Protocol

**Duration:** 24-48 hours
**Goal:** Gather real signals to guide next development layer
**Method:** Use MAIA naturally, note what's alive

---

## Setup

Before starting your observation period:

```bash
# 1. Verify deployment
psql $DATABASE_URL -c "SELECT COUNT(*) FROM skills_registry;"
# Expected: 3

# 2. Confirm feature flag
grep SKILLS_RUNTIME_ENABLED .env.local
# Expected: SKILLS_RUNTIME_ENABLED=true

# 3. Check server logs
docker logs -f maia-app | grep "Skills Runtime"
# Should see initialization messages

# 4. Create observation log
touch ~/skills-runtime-observations.md
```

---

## What to Track (Simple Template)

### Each Time a Skill Executes

**Copy this template into your observation log:**

```markdown
## [Timestamp]

**Your input:** "..."

**Skill triggered:** elemental-checkin | window-of-tolerance | dialectical-scaffold | none

**Expected this skill?** yes | no | unsure

**Response quality:**
- Timing: too-early | just-right | too-late
- Depth: too-shallow | appropriate | too-deep
- Helpful: not-helpful | somewhat | very

**Somatic response:** (How did your body respond?)

**What happened next:** (Did you continue the conversation? Change topics? Log off?)

**Notes:** (Anything surprising, awkward, or delightful)

---
```

---

## Key Questions to Notice

You don't need to answer these explicitly - just hold them lightly while using MAIA:

### 1. Skill Selection (Does it choose wisely?)

- **Right skill, right time?** When you type "check in", does elemental-checkin feel appropriate?
- **False negatives?** Times when you *expected* a skill but got personal oracle instead?
- **False positives?** Times when a skill fired but you wanted conversational oracle?

### 2. Skill Execution (Does it feel natural?)

- **Pacing:** Does FAST feel fast? Does CORE feel substantive?
- **Voice:** Does the skill response sound like MAIA, or does it feel "templated"?
- **Transitions:** If you engage with skill output, does MAIA stay coherent in follow-up?

### 3. Gating (Are safety boundaries working?)

- **Appropriate refusals?** If you're in sympathetic/dorsal, does MAIA hold good boundaries?
- **Unnecessary blocks?** Times when you were gated from a skill but it felt overly cautious?
- **Contraindication clarity?** If refused, was the reasoning clear and respectful?

### 4. Co-occurrence Patterns (What wants to cluster?)

- **Natural sequences?** Do you notice yourself using skills in predictable orders?
  - E.g., "check in" → get grounded → then "I'm stuck between..." dialectical scaffold?
- **Element alignment?** Do water-heavy days tend toward certain skills?
- **Time-of-day patterns?** Morning vs. evening skill preferences?

### 5. What's Missing?

- **Gaps you notice:** Moments where you wished for a skill that doesn't exist yet?
- **Trigger words that don't work:** Phrases you expected to activate a skill but didn't?
- **Desired tier:** Times you wanted FAST but got CORE, or vice versa?

---

## Minimum Viable Observations

If you're time-constrained, focus on these **three critical signals**:

### Signal 1: Selection Accuracy (First Impressions)

For the first 10 skill triggers, note:
- ✅ = Right skill
- ⚠️ = Wrong skill but acceptable
- ❌ = Wrong skill, wanted oracle

**Target:** 70%+ ✅ means selector is working

### Signal 2: Execution Quality (Felt Sense)

For each skill execution, rate on gut feel:
- 👍 = Helpful
- 👌 = Neutral/acceptable
- 👎 = Unhelpful/jarring

**Target:** 60%+ 👍 means skill definitions are sound

### Signal 3: Natural Sequences (Emergence Hints)

Just notice:
- Did any skills appear together in the same session?
- Did one skill naturally lead to wanting another?
- Note these pairs/triplets even if you don't analyze yet

**This is raw material for pattern miner.**

---

## End-of-Period Reflection (10 minutes)

After 24-48 hours, before running pattern miner:

### Quantitative Check

```sql
-- How many skill executions?
SELECT COUNT(*) FROM skill_usage_events;

-- Which skills were used?
SELECT skill_id, COUNT(*) as uses
FROM skill_usage_events
GROUP BY skill_id;

-- Success rate?
SELECT
  outcome,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as pct
FROM skill_usage_events
GROUP BY outcome;
```

**Minimum for meaningful pattern mining:** 20+ events

### Qualitative Questions

1. **What surprised you?**
   - Which skill fired when you didn't expect it?
   - Which skill response felt unexpectedly good/bad?

2. **What felt smooth?**
   - Any interaction where skill → response → continuation felt seamless?

3. **What felt awkward?**
   - Timing issues?
   - Voice/tone mismatches?
   - Transitions that broke flow?

4. **What's missing?**
   - Skill you wished existed?
   - Trigger phrase that should work but doesn't?
   - Tier (FAST/CORE/DEEP) that's under-represented?

5. **What wants to emerge?**
   - Any sense of skills wanting to cluster together?
   - Elemental patterns? (e.g., water days = certain skill combos?)
   - Nervous system patterns? (e.g., window state = different needs?)

---

## Pattern Miner Preparation

Once you have **20+ events** and your qualitative observations:

### Run the Miner

```bash
npx tsx scripts/pattern-miner.ts
```

### Compare Miner Output to Your Felt Sense

```sql
SELECT * FROM v_skill_cooccurrence;
```

**Key question:** Do the data-detected co-occurrences match your lived experience?

- **Strong match** = Pattern miner is picking up real signal
- **Mismatch** = Either (a) not enough data yet, or (b) scoring algorithm needs tuning
- **Surprising patterns** = Emergence working! The system sees what you didn't consciously notice

### Review Emergence Candidates

```sql
SELECT
  archetypal_name,
  cooccur_skills,
  support_count,
  avg_success_rate
FROM agent_emergence_candidates
WHERE status = 'monitoring'
ORDER BY support_count DESC;
```

**For each candidate, ask:**

1. **Does this combination feel coherent?**
   - Would you describe it as a "thing" that belongs together?

2. **Would you use it intentionally?**
   - If this became a single skill, would you invoke it?

3. **What would you name it?**
   - Does the LLM-suggested archetypal name resonate?
   - What would you call it instead?

---

## Deciding What to Build Next

After pattern miner run + reflection, you'll have **three types of signals**:

### Type 1: Tuning Existing Skills
- Trigger keywords to add/remove
- Contraindications to adjust
- Prompt templates to refine

**Action:** Edit skill definitions in `/skills/`, re-sync registry

### Type 2: New Skills to Create
- Gaps you noticed during usage
- Missing tiers (e.g., no DEEP skills yet)
- Missing elements (e.g., no fire-specific skills)

**Action:** Create new skill directories, following starter skill pattern

### Type 3: Emergent Archetypes to Promote
- Co-occurrence patterns that feel coherent
- High support + high success rate
- Clear archetypal name

**Action:** Promote candidate to new skill, mark as emergent category

---

## Red Flags to Watch For

### 🚩 All skills showing 100% success rate
**Means:** Not enough edge cases, or gating is too permissive
**Action:** Try using MAIA in dorsal/sympathetic states intentionally

### 🚩 Zero co-occurrences detected
**Means:** Skills not being used in same sessions
**Action:** Either (a) need more data, or (b) skills are too siloed

### 🚩 Skills firing but responses feel "off"
**Means:** Prompt templates need work, or context variables missing
**Action:** Read skill execution logs, check what context was passed

### 🚩 You keep wanting personal oracle instead of skills
**Means:** Skills are too rigid, or selection scoring needs adjustment
**Action:** Review shortlistSkills() logic, possibly lower trigger thresholds

---

## Optional: Telemetry Wishlist

As you use the system, notice what **live metrics** would help you steer:

- "I wish I could see ___ in real-time..."
- "It would help to know ___ without querying SQL..."
- "I'd like a dashboard showing ___..."

**Don't build these yet.** Just note them.

After pattern mining, we'll know which 2-3 metrics actually matter, and build **only those** into a minimal telemetry view.

---

## Success Criteria for This Phase

You'll know this observation period was valuable if you can answer:

✅ **Selection:** "Skills fire at the right moments ~70% of the time"
✅ **Execution:** "Skill responses feel helpful/appropriate ~60% of the time"
✅ **Emergence:** "I can name 1-2 skill combinations that want to become archetypes"
✅ **Gaps:** "I can describe 1-3 missing skills I now know we need"

**If you have these four signals, you're ready to evolve the system.**

If not, run another 24 hours or lower your expectations for early-stage data.

---

## Template: Quick Daily Log

Copy this into your observation file:

```markdown
# Skills Runtime Observation Log

## Day 1: [Date]

### Morning Session
- Skill executions: [count]
- Notable: [what stood out]

### Afternoon Session
- Skill executions: [count]
- Notable: [what stood out]

### Evening Session
- Skill executions: [count]
- Notable: [what stood out]

### End of Day Reflection
- What worked:
- What didn't:
- What surprised me:
- What I wish existed:

---

## Day 2: [Date]

[Same structure]

---

## Pattern Miner Run: [Date]

### Quantitative
```sql
[paste SQL results]
```

### Qualitative
- Co-occurrences that feel real:
- Emergence candidates to consider:
- Tuning needed:
- New skills to create:

### Decision
Next action: [tuning | new skills | promote candidates | need more data]
```

---

## Final Note

**This is natural history, not experimental science.**

You're not testing hypotheses - you're **observing what's alive** in the system.

Trust your felt sense. Note what resonates. Let the system surprise you.

The data will confirm or challenge your intuitions, but your lived experience is the primary signal.

**Discrete, gated, logged, versioned** enables evolution.
**Your attention** is what guides it.

Go metabolize reality. 🌱
