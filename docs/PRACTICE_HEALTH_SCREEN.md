# Practice Health Screen

**A single view for practitioner sustainability — without metrics creep**

This document specifies the design for the primary dashboard view in the Relational Practice Ledger. Every element has been evaluated against [RELATIONAL_LEDGER_ANTI_FEATURES.md](./RELATIONAL_LEDGER_ANTI_FEATURES.md).

---

## Design Principles

1. **Present state, not trajectory** — Show where you are, not where you're "going"
2. **Capacity, not growth** — "How full am I?" not "How much am I growing?"
3. **Care, not conversion** — Relationships, not leads
4. **Sustainability, not success** — Enough, not more
5. **Client-visible safe** — Nothing you'd hide from those you serve

---

## The Screen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Practice Health                                            January 2026    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CURRENT CAPACITY                            │   │
│  │                                                                      │   │
│  │     ████████████████████░░░░░░░░░░                                  │   │
│  │                                                                      │   │
│  │     12 active relationships                                         │   │
│  │     of 18 you said feels right                                      │   │
│  │                                                                      │   │
│  │     ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ · · · · · ·                            │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐   │
│  │      THIS MONTH              │  │      CARE HORIZON                │   │
│  │                              │  │                                  │   │
│  │  Received      $2,840        │  │  Today                           │   │
│  │  Expected      $3,200        │  │    9:00  Sarah — regular         │   │
│  │  ─────────────────────       │  │    2:00  Marcus & Diane — couple │   │
│  │  Still coming  $360          │  │                                  │   │
│  │                              │  │  Tomorrow                        │   │
│  │                              │  │    10:00  James — check-in       │   │
│  │  Sessions held    14         │  │                                  │   │
│  │  Sessions ahead    6         │  │  This week                       │   │
│  │                              │  │    8 sessions scheduled          │   │
│  │                              │  │                                  │   │
│  └──────────────────────────────┘  └──────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      NEEDS ATTENTION                                │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ○  Inquiry from Elena — 12 days                            │   │   │
│  │  │     Reached out about grief work. You haven't responded.    │   │   │
│  │  │                                              [View] [Close] │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ○  Paused: Michael — 94 days                               │   │   │
│  │  │     Paused in October. May need a clean closing.            │   │   │
│  │  │                                              [View] [Close] │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  ○  Agreement ending: Priya — Feb 15                        │   │   │
│  │  │     6-session package completing. Discuss continuation?     │   │   │
│  │  │                                              [View]         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      RECENT CLOSURES                                │   │
│  │                                                                      │   │
│  │  Jan 8   Tom — completed (natural)        "Good work, clean end"   │   │
│  │  Dec 20  Rivera family — referred         → Dr. Okafor             │   │
│  │                                                                      │   │
│  │                                                   [View all →]      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Current Capacity

**Purpose:** Answer "How full am I?" without implying more is better.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CURRENT CAPACITY                            │
│                                                                      │
│     ████████████████████░░░░░░░░░░                                  │
│                                                                      │
│     12 active relationships                                         │
│     of 18 you said feels right                                      │
│                                                                      │
│     ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ · · · · · ·                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Progress bar:** Filled portion = active relationships, unfilled = remaining capacity
- **Count:** "12 active relationships"
- **Reference:** "of 18 you said feels right" — practitioner sets their own capacity
- **Dots:** Visual representation — filled dots are people, empty dots are open capacity

**What's NOT here:**
- No "you could fit 6 more clients"
- No comparison to last month
- No growth percentage
- No "utilization rate"

**Capacity setting:** Practitioner defines their own number in settings. The system never suggests they should take more.

---

### 2. This Month (Financial)

**Purpose:** Answer "Am I stable?" without growth framing.

```
┌──────────────────────────────┐
│      THIS MONTH              │
│                              │
│  Received      $2,840        │
│  Expected      $3,200        │
│  ─────────────────────       │
│  Still coming  $360          │
│                              │
│  Sessions held    14         │
│  Sessions ahead    6         │
│                              │
└──────────────────────────────┘
```

**Elements:**
- **Received:** What's come in this month
- **Expected:** Based on active agreements
- **Still coming:** Simple subtraction
- **Sessions held/ahead:** Activity count, not productivity metric

**What's NOT here:**
- No comparison to previous months
- No "you're up/down X%"
- No revenue "goal"
- No projections or forecasts
- No "if you added 2 more clients..."

---

### 3. Care Horizon

**Purpose:** Answer "What's coming up?" — a schedule, not a pipeline.

```
┌──────────────────────────────────┐
│      CARE HORIZON                │
│                                  │
│  Today                           │
│    9:00  Sarah — regular         │
│    2:00  Marcus & Diane — couple │
│                                  │
│  Tomorrow                        │
│    10:00  James — check-in       │
│                                  │
│  This week                       │
│    8 sessions scheduled          │
│                                  │
└──────────────────────────────────┘
```

**Elements:**
- **Today's sessions:** Name and type only
- **Tomorrow:** Same
- **This week:** Count only (not a detailed list)

**What's NOT here:**
- No "overdue follow-ups"
- No "you haven't contacted X in Y days"
- No engagement scoring
- No suggested outreach

---

### 4. Needs Attention

**Purpose:** Surface things that need practitioner discernment — not system-driven nudges.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NEEDS ATTENTION                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ○  Inquiry from Elena — 12 days                            │   │
│  │     Reached out about grief work. You haven't responded.    │   │
│  │                                              [View] [Close] │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ○  Paused: Michael — 94 days                               │   │
│  │     Paused in October. May need a clean closing.            │   │
│  │                                              [View] [Close] │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ○  Agreement ending: Priya — Feb 15                        │   │
│  │     6-session package completing. Discuss continuation?     │   │
│  │                                              [View]         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**What surfaces here:**

| Item | Threshold | Language |
|------|-----------|----------|
| Unanswered inquiries | >7 days | "You haven't responded" |
| Long pauses | >90 days | "May need a clean closing" |
| Ending agreements | <30 days | "Discuss continuation?" |
| Missing closures | Container inactive >60 days | "Needs a clean ending" |

**Language principles:**
- Factual, not urgent ("12 days" not "OVERDUE")
- Suggestive, not directive ("May need" not "You should")
- The practitioner decides what to do

**What's NOT here:**
- No "re-engage this client"
- No "this lead is going cold"
- No urgency colors (red/yellow)
- No priority scoring
- No automated suggestions

**Actions:**
- **[View]** — Opens the container
- **[Close]** — Opens closure flow (not "dismiss")

---

### 5. Recent Closures

**Purpose:** Honor endings. Make them visible, not hidden.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      RECENT CLOSURES                                │
│                                                                      │
│  Jan 8   Tom — completed (natural)        "Good work, clean end"   │
│  Dec 20  Rivera family — referred         → Dr. Okafor             │
│                                                                      │
│                                                   [View all →]      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Date of closure
- Name
- Closure type
- Brief note or referral destination

**Why this matters:**
- Closures are not failures
- Endings deserve visibility
- Referrals are successes, not losses
- This normalizes completion

---

## What's Deliberately Absent

This screen does **not** include:

| Absent Element | Why |
|----------------|-----|
| Growth chart | Implies more is better |
| Comparison to last month | Creates performance pressure |
| "New clients this month" | Acquisition framing |
| "Churn" or "lost clients" | Loss framing for natural endings |
| Conversion rate | Pipeline thinking |
| Revenue per client | Reduces people to value |
| Client engagement scores | Surveillance |
| "Top clients" | Ranking people |
| Suggested actions | System shouldn't direct care |
| Notifications badge | Urgency manipulation |

---

## Color & Visual Language

**Palette:**
- Warm neutrals (not corporate blue)
- No red for "alerts" — red implies urgency/danger
- Amber for items needing attention (warm, not alarming)
- Soft green for "received" payments (not "success" green)

**Typography:**
- Relationship names are prominent
- Numbers are secondary
- No bold "targets" or "goals"

**Iconography:**
- Dots for people (not user icons)
- Simple circles for status
- No charts, graphs, or trend lines

---

## Mobile View

On mobile, stack the components:

```
┌─────────────────────────┐
│    Practice Health      │
│    January 2026         │
├─────────────────────────┤
│                         │
│   CURRENT CAPACITY      │
│   ████████████░░░░░░    │
│   12 of 18              │
│                         │
├─────────────────────────┤
│                         │
│   TODAY                 │
│   9:00  Sarah           │
│   2:00  Marcus & Diane  │
│                         │
├─────────────────────────┤
│                         │
│   THIS MONTH            │
│   $2,840 received       │
│   $360 still coming     │
│                         │
├─────────────────────────┤
│                         │
│   NEEDS ATTENTION (3)   │
│   › Elena — inquiry     │
│   › Michael — paused    │
│   › Priya — ending      │
│                         │
└─────────────────────────┘
```

---

## Settings (Practitioner-Defined)

The practitioner controls:

| Setting | Purpose |
|---------|---------|
| Capacity number | "How many relationships feels right?" |
| Inquiry threshold | Days before inquiry surfaces in "Needs Attention" |
| Pause threshold | Days before paused relationship surfaces |
| Financial visibility | Show/hide the money section |

The system never suggests these settings. The practitioner knows their own limits.

---

## Implementation Notes

### Data Sources

```typescript
interface PracticeHealthData {
  capacity: {
    active: number;
    practitionerMax: number;  // Set by practitioner
  };

  thisMonth: {
    received: number;
    expected: number;
    sessionsHeld: number;
    sessionsAhead: number;
  };

  careHorizon: {
    today: Session[];
    tomorrow: Session[];
    thisWeekCount: number;
  };

  needsAttention: AttentionItem[];

  recentClosures: Closure[];
}

interface AttentionItem {
  type: 'inquiry' | 'paused' | 'ending' | 'incomplete';
  containerId: string;
  containerName: string;
  daysInState: number;
  description: string;
}
```

### API Endpoint

```
GET /api/practice/health

Returns: PracticeHealthData
```

Single endpoint, single query pattern. No polling, no real-time updates needed.

---

## The Nervous System Test

Before shipping any change to this screen, ask:

1. Would I show this to a client? (If no, remove it)
2. Does this create pressure to grow? (If yes, remove it)
3. Does this rank or score people? (If yes, remove it)
4. Does this automate relational decisions? (If yes, remove it)
5. Does this feel like a CRM? (If yes, start over)

---

## Related Documents

- [RELATIONAL_LEDGER_ANTI_FEATURES.md](./RELATIONAL_LEDGER_ANTI_FEATURES.md) — What this screen must never become
- [RELATIONAL_LEDGER_DATA_MODEL.md](./RELATIONAL_LEDGER_DATA_MODEL.md) — Underlying data structures
- [ACCOMPANIMENT_MODEL.md](./ACCOMPANIMENT_MODEL.md) — Philosophical foundation

---

**Last updated:** 2026-01-20
