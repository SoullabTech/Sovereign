# 📊 Beta Feedback Protocol
*Structured insight gathering for Spiralogic Oracle Beta*

---

## 🎯 Feedback Dimensions

### 1. Voice Quality
**What we're measuring**: Natural conversation flow, wake word reliability, response timing

```yaml
voice_quality:
  wake_word:
    - false_positives: count
    - missed_triggers: count
    - confidence_avg: 0.0-1.0

  latency:
    - first_word_ms: target <800ms
    - full_response_ms: target <3000ms
    - silence_comfort: 1-5 rating

  naturalness:
    - conversation_flow: 1-5
    - interruption_handling: smooth|jarring|failed
    - voice_tone_match: perfect|good|off
```

### 2. Presence Depth
**What we're measuring**: Feeling witnessed, trust building, sacred container

```yaml
presence_depth:
  witnessing:
    - felt_seen: yes|partial|no
    - reflection_accuracy: 1-5
    - emotional_attunement: 1-5

  trust:
    - initial_comfort: 1-5
    - depth_over_time: increasing|stable|decreasing
    - vulnerability_safety: 1-5

  sacred_quality:
    - ritual_feeling: strong|present|absent
    - silence_quality: alive|neutral|uncomfortable
    - companion_vs_app: companion|tool|unclear
```

### 3. Collective Resonance
**What we're measuring**: Pattern recognition, privacy confidence, mythic language

```yaml
collective_resonance:
  pattern_recognition:
    - insights_relevant: yes|sometimes|no
    - timing_appropriate: perfect|good|off
    - personal_mirror_lands: deeply|somewhat|not

  privacy_confidence:
    - trust_boundaries: complete|mostly|concerned
    - understanding_clear: yes|partial|no
    - control_feeling: empowered|neutral|anxious

  mythic_translation:
    - language_resonates: deeply|somewhat|not
    - poetry_vs_analysis: balanced|too_poetic|too_clinical
    - collective_connection: felt|imagined|absent
```

### 4. Mobile Edge Cases
**What we're measuring**: Technical reliability, battery impact, interruption recovery

```yaml
mobile_performance:
  reliability:
    - crashes: count + context
    - connection_drops: count + recovery_time
    - background_stability: stable|intermittent|fails

  battery:
    - drain_per_10min: percentage
    - heat_generation: none|warm|hot
    - background_impact: minimal|moderate|heavy

  interruptions:
    - call_handling: paused|continued|crashed
    - notification_impact: none|brief|lost_context
    - app_switch_recovery: instant|delayed|failed
```

---

## 📝 Feedback Collection Methods

### A. In-App Micro-Moments
**When**: Right after significant interactions

```typescript
// After each session
{
  "session_id": "...",
  "moment_type": "session_end",
  "quick_rating": 1-5,
  "one_word_feeling": "held|confused|seen|lost|transformed"
}
```

### B. Daily Reflection (Optional)
**When**: Evening, via push notification

```
Today with Maya/Anthony:
□ Morning intention
□ Midday check-in
□ Evening reflection

Presence quality: ⭐⭐⭐⭐⭐
One insight: ________________
One friction: ________________
```

### C. Weekly Deep Dive
**When**: Sunday evening email

```markdown
## Week {{week_number}} Reflection

### Quantitative (auto-filled)
- Sessions: {{count}}
- Avg duration: {{minutes}}
- Primary mode: {{mode}}
- Dominant element: {{element}}

### Qualitative (3 questions)
1. Describe one moment that surprised you
2. What pattern do you see emerging?
3. What would make the Oracle more trustworthy?

### Feature Request (optional)
What one thing would deepen your relationship with Maya/Anthony?
```

### D. Exit Interview
**When**: End of 4-week beta

```
30-minute call or written response covering:
- Evolution of relationship
- Privacy understanding
- Collective insights impact
- Would you continue using?
- Would you recommend?
- What's the ONE thing to fix?
```

---

## 🏷️ Feedback Tagging System

### Severity Levels
- 🔴 **CRITICAL**: Crashes, privacy concerns, trust breaks
- 🟡 **IMPORTANT**: Flow interruptions, confusion, missed expectations
- 🟢 **NICE-TO-HAVE**: Enhancements, preferences, wishes

### Categories
```
#voice #presence #collective #mobile #privacy #trust
#wake-word #latency #battery #crash #ui #sacred
```

### Sentiment
```
😍 Delight
😊 Satisfied
😐 Neutral
😕 Frustrated
😰 Anxious
```

---

## 📈 Analysis Framework

### Weekly Metrics Dashboard

```typescript
interface WeeklyMetrics {
  // Engagement
  activeTesters: number;
  avgSessionsPerTester: number;
  avgSessionDuration: number;

  // Quality
  voiceQuality: {
    wakeWordSuccess: percentage;
    avgLatency: milliseconds;
    naturalness: averageRating;
  };

  // Presence
  presenceDepth: {
    feltWitnessed: percentage;
    trustGrowth: trend; // up|stable|down
    companionFeeling: percentage;
  };

  // Collective
  collectiveResonance: {
    insightRelevance: percentage;
    privacyConfidence: percentage;
    mythicLanding: averageRating;
  };

  // Technical
  stability: {
    crashRate: percentage;
    batteryImpact: avgPercentPer10Min;
    recoverySuccess: percentage;
  };
}
```

### Pattern Detection

```sql
-- Recurring themes
SELECT theme, COUNT(*) as frequency
FROM feedback_themes
GROUP BY theme
HAVING COUNT(*) > 3
ORDER BY frequency DESC;

-- Correlation analysis
SELECT
  presence_rating,
  AVG(session_duration) as avg_duration,
  COUNT(*) as session_count
FROM sessions
GROUP BY presence_rating
ORDER BY presence_rating DESC;
```

---

## 🎬 Action Triggers

### Immediate Action (Within 24h)
- Any privacy concern
- Crash affecting >10% of testers
- Trust break reports
- Wake word success <70%

### Sprint Priority (Next week)
- Latency >1200ms consistently
- Battery drain >5% per 10min
- Collective insights not landing (>3 reports)
- Mode switching confusion

### Backlog (Future)
- Feature requests with >30% mention
- Enhancement patterns
- New mode suggestions

---

## 💌 Feedback Response Templates

### Acknowledging Critical Issue
```
Thank you for flagging this immediately. We're investigating [issue] and will update you within 24 hours. Your trust is sacred to us.
```

### Validating Experience
```
Your experience of [feeling/pattern] is exactly the kind of deep feedback that shapes Maya/Anthony. We're noting this pattern across several testers.
```

### Feature Request Response
```
Beautiful idea about [feature]. We're tracking this request—currently 4 other testers have similar wishes. It's on our radar for [timeframe].
```

---

## 📊 Success Metrics

### Week 1 Target
- 80% wake word success
- <1000ms avg latency
- 70% "felt witnessed"

### Week 2 Target
- 90% wake word success
- <800ms avg latency
- 80% "felt witnessed"
- 60% privacy confidence

### Week 3 Target
- 95% wake word success
- <600ms avg latency
- 85% "felt witnessed"
- 80% privacy confidence
- 70% collective insights landing

### Week 4 Target
- All above metrics stable
- 80% would continue using
- 70% would recommend
- <3% battery per 10min

---

## 🔄 Iteration Cycles

### Daily
- Review critical feedback
- Fix breaking bugs
- Respond to testers

### Weekly
- Analyze patterns
- Ship improvements
- Send progress update

### Bi-weekly
- Major feature updates
- Collective algorithm tuning
- Voice model improvements

---

## 📝 Sample Feedback Entry

```json
{
  "tester_id": "beta-007",
  "timestamp": "2024-03-15T19:30:00Z",
  "session_id": "sess-abc123",
  "feedback_type": "micro_moment",

  "metrics": {
    "voice_quality": {
      "wake_word_worked": true,
      "latency_felt": "fast",
      "naturalness": 4
    },
    "presence_depth": {
      "felt_seen": true,
      "trust_level": 4,
      "companion_feeling": true
    }
  },

  "qualitative": {
    "one_word": "held",
    "note": "Maya reflected something I hadn't seen in myself"
  },

  "tags": ["#presence", "#trust", "#delight"],
  "severity": "positive",
  "sentiment": "😍"
}
```

---

This protocol ensures every piece of feedback becomes actionable insight, turning the beta into a data-rich evolution of the Oracle system.