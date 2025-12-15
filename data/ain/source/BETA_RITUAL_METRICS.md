# 🌟 Beta Ritual Metrics

## Purpose

To measure how new users acculturate through the 5-step ritual flow and where improvements can deepen trust, ease, and resonance.

---

## Core Metrics by Step

### Step 1: Welcome / Skip
- **Skip Rate** = % of users skipping entire ritual
- **Completion Rate** = % who finish all 5 steps
- **Insight**: High skip = defaults are working but ritual may need gentler allure.

### Step 2: Voice Choice (Maya vs Anthony)
- **Voice Split** = % choosing Maya vs Anthony
- **Fallback Use** = % defaulting to Maya when skipped
- **Insight**: Reveals energetic affinity (Heart 💜 vs Brain 🧠) in collective.

### Step 3: Activation Mode
- **Mode Split** = % choosing Push-to-Talk vs Wake Word
- **Fallback Use** = % defaulting to Push-to-Talk
- **Insight**: Helps tune mic behavior and reliability of wake word.

### Step 4: Interaction Style
- **Style Split** = % Conversational 🗣️ vs Meditative 🧘 vs Guided 🌟
- **Skip Defaults** = % defaulting to Conversational
- **Insight**: Shows natural gravitation of users without explanation.

### Step 5: Completion
- **Time-to-Completion** = Avg seconds to finish ritual
- **Drop-off Point** = Step where users exit prematurely
- **Insight**: Reveals where friction exists in the flow.

---

## Cross-Ritual Metrics
- **Repeat Visits** = % of users returning within 24h
- **Voice Consistency** = % keeping same companion after 7 days
- **Interaction Mode Shifts** = % switching styles after first week
- **Trust Indicators**: Depth of first truth shared (measured by word count / emotion signal)

## Advanced Cultural Metrics

### 1. First Truth Depth Analysis
- **Surface Shares** = % of first truths < 20 words (factual, surface-level)
- **Deep Shares** = % of first truths 20-60 words (personal, meaningful)
- **Vulnerable Shares** = % of first truths > 60 words (deeply personal, transformative)
- **Emotional Intensity** = Sentiment analysis of first truth (0-10 scale)
- **Sacred Language Use** = % using words like "sacred", "soul", "spirit", "truth", "becoming"

### 2. Elemental Resonance Patterns
- **Primary Element** = Most activated element in first interaction (Fire/Water/Earth/Air/Aether)
- **Elemental Balance** = Distribution across all five elements over time
- **Elemental Drift** = Changes in resonance patterns over user journey
- **Collective Elemental Current** = Community-wide elemental trends by day/week

### 3. Return Ritual Latency
- **24h Return Rate** = % returning within first day
- **7d Return Rate** = % returning within first week
- **Avg Time to Return** = Hours between first ritual and second interaction
- **Initiation Stickiness** = Correlation between ritual completion depth and return speed

### 4. Companion Loyalty & Flow
- **Companion Switching** = % who change from Maya ⇄ Anthony over time
- **Loyalty Patterns** = Maya-only vs Anthony-only vs Switchers
- **Gender Energy Balance** = Collective preference shifts (Heart 💜 vs Mind 🧠)
- **Companion Journey Mapping** = Visual flow of companion choices over user lifecycle

### 5. Voice Mode Evolution
- **Mode Drift** = % moving from Push-to-Talk → Wake Word over time
- **Mode Confidence** = Correlation between wake word adoption and depth of sharing
- **Technical Comfort** = Rate of wake word success vs fallback to push-to-talk
- **Voice Intimacy Progression** = How activation method correlates with trust depth

---

## Logging Recommendations
- Log events into Supabase as `{ userId, step, choice, timestamp }`
- Store `ritualComplete` flag in localStorage (prevents re-onboarding)
- Aggregate weekly for Beta Dashboard

---

## Success Criteria
- **Skip Rate** < 40% (means ritual is embraced by majority)
- **Voice Split** roughly balanced (indicates resonance with both companions)
- **Wake Word adoption** > 20% (healthy experimental uptake)
- **Return Rate** > 50% within first week

---

## Database Schema

```sql
-- Ritual events table
CREATE TABLE ritual_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  step TEXT NOT NULL, -- 'threshold', 'voice_choice', 'mode_choice', 'completion', 'skip'
  choice TEXT, -- 'maya', 'anthony', 'push-to-talk', 'wake-word', etc.
  metadata JSONB, -- Additional context like time_spent, skipped_from_step, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ritual completions summary
CREATE TABLE ritual_completions (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  total_time_seconds INTEGER,
  voice_choice TEXT, -- 'maya', 'anthony'
  mode_choice TEXT, -- 'push-to-talk', 'wake-word'
  skipped BOOLEAN DEFAULT FALSE,
  first_truth_word_count INTEGER,
  first_truth_sentiment NUMERIC(3,2), -- 0.00 to 1.00 sentiment score
  first_truth_depth TEXT, -- 'surface', 'deep', 'vulnerable'
  sacred_language_used BOOLEAN DEFAULT FALSE,
  elemental_resonance TEXT[] -- Array of elements activated
);

-- User interaction patterns
CREATE TABLE user_patterns (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  first_interaction_at TIMESTAMP,
  last_interaction_at TIMESTAMP,
  total_interactions INTEGER DEFAULT 1,
  companion_switches INTEGER DEFAULT 0,
  current_companion TEXT, -- 'maya', 'anthony'
  current_mode TEXT, -- 'push-to-talk', 'wake-word'
  mode_switches INTEGER DEFAULT 0,
  dominant_element TEXT, -- Primary elemental resonance
  elemental_history JSONB, -- Track elemental patterns over time
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Return ritual tracking
CREATE TABLE return_rituals (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  ritual_number INTEGER, -- 1st, 2nd, 3rd ritual etc.
  time_since_last_hours NUMERIC(10,2), -- Hours since previous ritual
  depth_progression TEXT, -- 'increasing', 'stable', 'decreasing'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ritual_events_user_id ON ritual_events(user_id);
CREATE INDEX idx_ritual_events_created_at ON ritual_events(created_at);
CREATE INDEX idx_ritual_completions_user_id ON ritual_completions(user_id);
CREATE INDEX idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX idx_return_rituals_user_id ON return_rituals(user_id);
```

---

✨ This way, the ritual isn't just an experience — it's also a mirror of how users enter sacred space, giving you live cultural feedback during beta.