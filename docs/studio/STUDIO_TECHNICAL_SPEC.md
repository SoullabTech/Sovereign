# Soullab Studio: Technical Specification

## Internal Codename: STUDIO_TEEN

**Status:** Spec Ready for Implementation
**Priority:** High — enables pilot with real users
**Target:** 2-week MVP for pilot cohort

---

## Architecture Overview

```
Soullab Studio
├── Teen Space (Student Experience)
│   ├── /studio/welcome      — Orientation + consent
│   ├── /studio/checkin      — Daily weather check
│   ├── /studio/lands        — Inner Lands territory map
│   ├── /studio/lands/[id]   — Territory view + encounters
│   ├── /studio/journal      — Private reflection vault
│   └── /studio/mark         — Progress visualization
│
├── Guardian Mirror (Parent Experience)
│   ├── /guardian/dashboard  — Weather overview
│   ├── /guardian/weekly     — Weekly digest
│   └── /guardian/settings   — Notification preferences
│
└── Development Engine (Internal)
    ├── Autonomy detection
    ├── Posture modulation
    └── Crisis detection
```

---

## Layer 1: Teen Space (Student Experience)

### 1.1 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/studio` | StudioHome | Entry point, shows current territory + check-in prompt |
| `/studio/welcome` | StudioOnboarding | First-time orientation, consent, privacy explanation |
| `/studio/checkin` | DailyCheckIn | "What's the weather inside?" flow |
| `/studio/lands` | InnerLandsExplorer | Territory map (existing component) |
| `/studio/lands/[id]` | TerritorySession | Deep encounter work |
| `/studio/journal` | JournalVault | Private reflections, optional share toggle |
| `/studio/mark` | TheMarkView | Quiet progress visualization |

### 1.2 Daily Check-In Component

**File:** `components/studio/DailyCheckIn.tsx`

```typescript
interface CheckInData {
  id: string;
  memberId: string;
  date: string;                    // YYYY-MM-DD
  weather: WeatherMetaphor;
  settledScore?: 1 | 2 | 3 | 4 | 5;
  bodyLocation?: string;
  onMind?: string;
  carryForward?: string;
  setDown?: string;
  createdAt: Date;
}

type WeatherMetaphor =
  | 'sunny' | 'cloudy' | 'stormy' | 'foggy'
  | 'calm' | 'choppy' | 'frozen' | 'electric'
  | 'heavy' | 'light' | 'scattered' | 'still'
  | 'custom';
```

**UI Flow:**
1. "What's the weather inside today?" + weather picker (icons)
2. Optional: "Where do you feel that in your body?" (text)
3. Optional: settled score (1-5 slider)
4. Optional: "Anything on your mind?" (text)
5. Close: "Carry forward / Set down" (two text fields)

**Storage:** PostgreSQL `studio_checkins` table

### 1.3 Journal Vault

**File:** `components/studio/JournalVault.tsx`

```typescript
interface JournalEntry {
  id: string;
  memberId: string;
  territoryId?: string;           // Which territory, if any
  encounterId?: string;           // Which encounter, if any
  content: string;                // Encrypted at rest
  isPrivate: boolean;             // Default true
  sharedWithGuardian: boolean;    // Explicit opt-in per entry
  createdAt: Date;
  updatedAt: Date;
}
```

**Key features:**
- Entries are private by default
- "Share this entry" toggle per entry (not global)
- Guardian sees only entries explicitly shared
- Sanctuary Mode entries not stored

### 1.4 The Mark Visualization

**File:** `components/studio/TheMark.tsx`

Extends existing `TraceMark` component from InnerLandsExplorer.

**Display:**
- Territory footprints (which lands visited)
- Encounter traces (which encounters opened)
- MAIA contact points (where they talked to MAIA)
- Return pattern (coming back, not just arriving once)

**No:**
- Completion percentages
- Streaks
- Levels
- Badges
- Leaderboards

---

## Layer 2: Guardian Mirror (Parent Experience)

### Core Principle

> **Your parents see your weather, not your words.**

Parents don't need content. They need signals of safety and stability.

**The reassurance triangle (what parents need to hear):**
1. I'm not shut out
2. They're not being monitored
3. I'll be told if something's wrong

**The rule:**
> Patterns, not content. Signals, not stories.

### 2.1 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/guardian` | GuardianDashboard | Overview of weather, trends, flags |
| `/guardian/weekly` | WeeklyDigest | Formatted weekly summary |
| `/guardian/settings` | GuardianSettings | Notification preferences |

### 2.2 Guardian Dashboard

**File:** `components/guardian/GuardianDashboard.tsx`

**What it shows:**

```typescript
interface GuardianDashboardData {
  studentName: string;
  currentWeek: number;

  // Engagement
  sessionsThisWeek: number;
  sessionsPlanned: number;
  checkInsCompleted: number;
  currentTerritory: string;
  encountersOpened: number;
  maiaContacts: number;

  // Emotional climate
  weatherTrend: WeatherMetaphor[];    // Last 7 days
  settledScoreTrend: number[];        // Last 7 days
  stabilityDirection: 'improving' | 'stable' | 'concerning';

  // Flags
  safetyFlags: SafetyFlag[];
  engagementFlags: EngagementFlag[];
  positiveSignals: PositiveSignal[];

  // Shared content (explicit opt-in only)
  sharedEntries: JournalEntry[];
}
```

**What it does NOT show:**
- Conversation transcripts
- Private journal entries
- What they said to MAIA
- Content of their reflections

### 2.3 Weekly Digest

**File:** `components/guardian/WeeklyDigest.tsx`

Auto-generated from dashboard data, formatted as the template in `GUARDIAN_MIRROR_TEMPLATE.md`.

Delivery options:
- In-app view
- Email digest (weekly, configurable day)
- PDF export

---

## Layer 3: Development Engine (Internal)

### 3.1 Autonomy Detection

**File:** `lib/studio/autonomy-detection.ts`

```typescript
interface AutonomySignals {
  // Decision posture
  decisionRequests: number;        // "Should I...?" patterns
  decisionReports: number;         // "I decided..." patterns
  decisionRatio: number;           // reports / (requests + reports)

  // Regulation arrival
  sessionStartStability: number[]; // Last N session-start scores
  stabilityTrend: 'improving' | 'stable' | 'declining';

  // Meaning source
  userInitiatedInsights: number;
  maiaInitiatedInsights: number;
  insightRatio: number;            // user / (user + maia)
}

interface AutonomyScore {
  overall: number;                 // 0-1
  decision: number;
  regulation: number;
  meaning: number;
  trend: 'growing' | 'stable' | 'declining';
  posture: 'companion' | 'peer' | 'threshold' | 'graduation';
}
```

**Pattern detection (regex-based, no ML):**

```typescript
const DECISION_REQUEST_PATTERNS = [
  /\bshould I\b/i,
  /\bwhat would you do\b/i,
  /\btell me what to\b/i,
  /\bis this the right\b/i,
  /\bdo you think I should\b/i,
];

const DECISION_REPORT_PATTERNS = [
  /\bI decided\b/i,
  /\bI'm going to\b/i,
  /\bI tried\b/i,
  /\bI chose\b/i,
  /\bI'm leaning toward\b/i,
];

const MEANING_REQUEST_PATTERNS = [
  /\bwhat does this mean\b/i,
  /\bwhy do I keep\b/i,
  /\bcan you explain\b/i,
];

const MEANING_OFFER_PATTERNS = [
  /\bI think this means\b/i,
  /\bI noticed\b/i,
  /\bmy read on this\b/i,
];
```

### 3.2 Posture Modulation

**File:** `lib/studio/posture-modulation.ts`

Based on autonomy score, adjust MAIA's behavior:

| Autonomy | Posture | MAIA Behavior |
|----------|---------|---------------|
| 0.0-0.3 | companion | Full guidance, grounding, explicit support |
| 0.3-0.6 | peer | More questions, fewer interpretations |
| 0.6-0.8 | threshold | Minimal intervention, reflects back |
| 0.8-1.0 | graduation | Offers transition, celebrates separation |

**Integration point:** Inject posture into system prompt for Oracle/LLM calls.

### 3.3 Crisis Detection

**File:** `lib/studio/crisis-detection.ts`

Extends existing safety systems. Specific patterns for teens:

```typescript
const CRISIS_PATTERNS = {
  selfHarm: [
    /\bcut myself\b/i,
    /\bhurt myself\b/i,
    /\bwant to die\b/i,
    /\bkill myself\b/i,
  ],
  eatingDisorder: [
    /\bhaven't eaten\b/i,
    /\bpurge\b/i,
    /\bfat.*ugly\b/i,
    /\bcalories.*control\b/i,
  ],
  abuse: [
    /\bhits me\b/i,
    /\btouched me\b/i,
    /\bscared of.*parent\b/i,
  ],
  hopelessness: [
    /\bno point\b/i,
    /\bno one cares\b/i,
    /\bwish I wasn't here\b/i,
  ],
};
```

**False positive handling:**
- "lol I'm dead" ≠ crisis
- Context awareness for teen slang
- Confirmation before escalation

**Response protocol:**
1. Immediate: Show crisis resources in conversation
2. Same-day: Notify guardian (if threshold crossed)
3. Log: Metadata only, never content

---

## Database Schema

### New Tables

```sql
-- Teen check-ins
CREATE TABLE studio_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) NOT NULL,
  date DATE NOT NULL,
  weather VARCHAR(20),
  settled_score INTEGER CHECK (settled_score BETWEEN 1 AND 5),
  body_location TEXT,
  on_mind TEXT,
  carry_forward TEXT,
  set_down TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, date)
);

-- Private journal entries
CREATE TABLE studio_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) NOT NULL,
  territory_id VARCHAR(20),
  encounter_id VARCHAR(50),
  content TEXT,                    -- Consider encryption at rest
  is_private BOOLEAN DEFAULT TRUE,
  shared_with_guardian BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guardian relationships
CREATE TABLE studio_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES members(id) NOT NULL,
  guardian_id UUID REFERENCES members(id) NOT NULL,
  relationship VARCHAR(20),        -- parent, guardian, mentor
  consent_signed_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, guardian_id)
);

-- Autonomy tracking (per session)
CREATE TABLE studio_autonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) NOT NULL,
  session_id UUID,
  decision_requests INTEGER DEFAULT 0,
  decision_reports INTEGER DEFAULT 0,
  session_start_stability NUMERIC(2,1),
  user_insights INTEGER DEFAULT 0,
  maia_insights INTEGER DEFAULT 0,
  autonomy_score NUMERIC(3,2),
  posture VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crisis logs (metadata only)
CREATE TABLE studio_safety_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) NOT NULL,
  session_id UUID,
  flag_type VARCHAR(30),           -- selfHarm, eatingDisorder, abuse, hopelessness
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  action_taken VARCHAR(50),        -- resourcesShown, guardianNotified, etc.
  guardian_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NO content column. Never store what they said.
);
```

---

## API Endpoints

### Teen Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/studio/checkin` | POST | Submit daily check-in |
| `/api/studio/checkin/[date]` | GET | Get check-in for date |
| `/api/studio/journal` | POST | Create journal entry |
| `/api/studio/journal` | GET | List own journal entries |
| `/api/studio/journal/[id]/share` | POST | Toggle share with guardian |
| `/api/studio/trace` | GET | Get trace data for The Mark |
| `/api/studio/session` | POST | Start territory session |

### Guardian Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/guardian/dashboard` | GET | Get dashboard data for student |
| `/api/guardian/weekly` | GET | Get weekly digest data |
| `/api/guardian/shared-entries` | GET | Get explicitly shared journal entries |
| `/api/guardian/settings` | GET/PUT | Notification preferences |

### Internal Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/studio/autonomy` | POST | Log autonomy signals (internal) |
| `/api/studio/safety` | POST | Log safety flag (internal) |

---

## Build Phases

### Phase 1: MVP (Week 1-2)

**Must have for pilot:**

- [ ] `/studio` route with basic home
- [ ] DailyCheckIn component + API
- [ ] InnerLandsExplorer integration (already exists)
- [ ] Basic trace storage (extend existing)
- [ ] Guardian consent flow

**Can be manual for pilot:**
- Guardian Mirror (you observe, track in notes)
- Autonomy detection (you track the three signals)
- Weekly digest (you fill out template)

### Phase 2: Guardian Mirror (Week 3-4)

- [ ] `/guardian` route with dashboard
- [ ] WeeklyDigest component
- [ ] Email digest integration
- [ ] Guardian auth flow

### Phase 3: Development Engine (Week 5-6)

- [ ] Autonomy detection integration
- [ ] Posture modulation in prompts
- [ ] Crisis detection refinement
- [ ] Graduation threshold logic

### Phase 4: Polish (Week 7+)

- [ ] The Mark visualization
- [ ] Journal vault encryption
- [ ] Onboarding refinement
- [ ] Tone/copy refinement based on feedback

---

## Integration with Existing MAIA

### Uses existing:
- `lib/youth/ageTierEngine.ts` — Tier determination
- `components/academy/InnerLandsExplorer.tsx` — Territory system
- `lib/academy/innerLandsTrace.ts` — Trace system
- `lib/maia/state-vector/` — State tracking
- `lib/ain/knowledge-gate.ts` — Source weighting

### Extends:
- Auth system (teen + guardian accounts)
- Member model (guardian relationships)
- Session management (studio context)

### Does not touch:
- Adult MAIA flow
- Spiralogic core
- Voice/TTS systems (yet)

---

## Success Metrics (Pilot)

**What we measure:**
- Check-in completion rate
- Territory engagement (which lands, how often)
- Return rate (coming back, not just arriving)
- Guardian Mirror utility (does it feel useful?)
- Autonomy signal trends (are they growing?)

**What we don't measure:**
- Time on platform
- Session length
- "Engagement"
- Completion percentage

**The north star:**
> % of users whose session frequency decreases over time while reported agency increases.

That's not churn. That's success.

---

## Document History

- v0.1: Initial technical spec for pilot
- Aligned with SOULLAB_STUDIO_CURRICULUM.md
- Ready for implementation review
