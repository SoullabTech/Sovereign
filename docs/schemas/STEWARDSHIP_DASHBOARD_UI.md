# Stewardship Dashboard UI Component Map

## Design Philosophy

This is a **Stewardship Dashboard**, not a Business Dashboard.

Everything is framed as:
- **Clarity** (what's true right now)
- **Responsibility** (what needs attention)
- **Closure** (what's ending well)
- **Capacity** (what you can hold)
- **Sustainability** (what keeps you going)

Not success. Not growth. Not optimization.

---

## Page Structure

```
/practitioner/dashboard
├── Header
│   ├── Practice name
│   ├── Date/time (in practice timezone)
│   └── Quick actions (+ Session, + Task)
│
├── Section A: Commitments
│   └── CommitmentCards
│
├── Section B: Care Horizon
│   ├── UpcomingSessions (14 days)
│   └── UpcomingTasks (14 days)
│
├── Section C: Capacity
│   └── CapacityIndicator
│
├── Section D: Sustainability
│   └── FinancialSummary
│
└── Section E: Hygiene
    ├── AttentionNeeded
    └── PendingAgreements
```

---

## Component Specifications

### 1. CommitmentCards

**Purpose:** Show current relational commitments at a glance.

**Data:**
```typescript
interface CommitmentData {
  active: number;
  paused: number;
  closing: number;
  inquiry: number;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  COMMITMENTS                                        │
├─────────────┬─────────────┬─────────────┬──────────┤
│   Active    │   Paused    │   Closing   │ Inquiry  │
│     12      │      2      │      1      │    3     │
│   ○ ○ ○ ○   │    ○ ○      │     ○       │  ○ ○ ○   │
└─────────────┴─────────────┴─────────────┴──────────┘
```

**Behavior:**
- Each number is clickable → opens filtered container list
- No colors that imply good/bad (use neutral tones)
- Dots are visual anchors, not progress indicators

**Component:**
```tsx
// components/practitioner/dashboard/CommitmentCards.tsx

interface CommitmentCardsProps {
  active: number;
  paused: number;
  closing: number;
  inquiry: number;
  onFilterClick: (status: ContainerStatus) => void;
}
```

---

### 2. UpcomingSessions

**Purpose:** Show what's scheduled in the care horizon (14 days).

**Data:**
```typescript
interface UpcomingSession {
  id: string;
  scheduledStartAt: string;
  sessionType: SessionType;
  containerId: string;
  containerScope: string;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  CARE HORIZON · Sessions                            │
├─────────────────────────────────────────────────────┤
│  Today                                              │
│  ├─ 10:00am  Session · Sarah (weekly therapy)      │
│  └─ 2:00pm   Check-in · Michael (closing)          │
│                                                     │
│  Tomorrow                                           │
│  └─ 11:00am  Intake · New inquiry                  │
│                                                     │
│  Thu, Jan 23                                        │
│  └─ 3:00pm   Group · Thursday circle               │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Grouped by day (relative: Today, Tomorrow, then dates)
- Click session → opens session detail/edit
- Subtle indicator for closing containers
- No ranking, no priority colors

**Component:**
```tsx
// components/practitioner/dashboard/UpcomingSessions.tsx

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
  onSessionClick: (sessionId: string) => void;
}
```

---

### 3. UpcomingTasks

**Purpose:** Show tasks in the care horizon.

**Data:**
```typescript
interface UpcomingTask {
  id: string;
  title: string;
  dueAt: string | null;
  containerId: string | null;
  containerScope: string | null;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  CARE HORIZON · Tasks                               │
├─────────────────────────────────────────────────────┤
│  ○  Follow up with Sarah about referral   · Thu    │
│  ○  Send closing summary to Michael       · Fri    │
│  ○  Review intake form                    · Today  │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Simple list with due dates
- Click to complete or edit
- No urgency colors (due date is informational)

**Component:**
```tsx
// components/practitioner/dashboard/UpcomingTasks.tsx

interface UpcomingTasksProps {
  tasks: UpcomingTask[];
  onTaskClick: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
}
```

---

### 4. CapacityIndicator

**Purpose:** Show felt capacity reality, not optimization metrics.

**Data:**
```typescript
interface CapacityData {
  sessionsThisWeek: number;
  maxSessionsPerWeek: number | null;
  bufferIntegrity: 'ok' | 'tight' | 'none';
  recoveryBlocksPresent: boolean;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  CAPACITY                                           │
├─────────────────────────────────────────────────────┤
│  Sessions this week     15 / 20                     │
│  ════════════════░░░░░                              │
│                                                     │
│  Buffer integrity       OK                          │
│  Recovery blocks        Present                     │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Bar is neutral (not green/red based on fullness)
- "Tight" buffer shows gentle notice, not alarm
- No "you could fit more!" messaging

**Component:**
```tsx
// components/practitioner/dashboard/CapacityIndicator.tsx

interface CapacityIndicatorProps {
  sessionsThisWeek: number;
  maxSessionsPerWeek: number | null;
  bufferIntegrity: 'ok' | 'tight' | 'none';
  recoveryBlocksPresent: boolean;
}
```

---

### 5. FinancialSummary

**Purpose:** Simple sustainability check, not revenue dashboard.

**Data:**
```typescript
interface FinancialData {
  paidThisMonthCents: number;
  pendingCents: number;
  outstandingInvoices: number;
  currency: string;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  SUSTAINABILITY                                     │
├─────────────────────────────────────────────────────┤
│  Paid this month        $4,500                      │
│  Pending                $300                        │
│  Outstanding invoices   2                           │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Just the numbers, no trends or comparisons
- Click outstanding → opens billing list filtered to outstanding
- No "you're doing great!" or "revenue down" messaging

**Component:**
```tsx
// components/practitioner/dashboard/FinancialSummary.tsx

interface FinancialSummaryProps {
  paidThisMonthCents: number;
  pendingCents: number;
  outstandingInvoices: number;
  currency: string;
  onOutstandingClick: () => void;
}
```

---

### 6. AttentionNeeded

**Purpose:** Surface containers that may need practitioner review.

**Data:**
```typescript
interface AttentionItem {
  containerId: string;
  containerScope: string;
  reason: 'closing_no_next_session' | 'no_recent_session';
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  HYGIENE · Containers                               │
├─────────────────────────────────────────────────────┤
│  ⚬  Michael (closing) — no closing session scheduled│
│  ⚬  Alex (therapy) — no session in 30+ days        │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Informational, not alarming
- Reasons are descriptive, not judgmental
- Click → opens container detail
- Empty state: "All containers look good"

**Component:**
```tsx
// components/practitioner/dashboard/AttentionNeeded.tsx

interface AttentionNeededProps {
  items: AttentionItem[];
  onContainerClick: (containerId: string) => void;
}
```

---

### 7. PendingAgreements

**Purpose:** Show agreements awaiting acceptance.

**Data:**
```typescript
interface PendingAgreementsSummary {
  count: number;
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  HYGIENE · Agreements                               │
├─────────────────────────────────────────────────────┤
│  3 agreements pending acceptance                    │
│                                    [View all →]     │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Simple count
- Click → opens agreements list filtered to pending
- Empty state: "All agreements signed"

**Component:**
```tsx
// components/practitioner/dashboard/PendingAgreements.tsx

interface PendingAgreementsProps {
  count: number;
  onViewAll: () => void;
}
```

---

## Full Dashboard Component

```tsx
// components/practitioner/dashboard/StewardshipDashboard.tsx

interface StewardshipDashboardProps {
  practiceId: string;
  practiceName: string;
  timezone: string;
}

export default function StewardshipDashboard({
  practiceId,
  practiceName,
  timezone
}: StewardshipDashboardProps) {
  const { data, isLoading } = useDashboardData(practiceId);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light text-stone-800">{practiceName}</h1>
          <p className="text-sm text-stone-500">
            {formatDate(new Date(), timezone)}
          </p>
        </div>
        <div className="flex gap-2">
          <QuickActionButton icon={Calendar} label="Session" />
          <QuickActionButton icon={CheckSquare} label="Task" />
        </div>
      </header>

      {/* Commitments */}
      <section className="mb-8">
        <CommitmentCards
          {...data.commitments}
          onFilterClick={handleFilterClick}
        />
      </section>

      {/* Care Horizon */}
      <section className="mb-8 grid md:grid-cols-2 gap-6">
        <UpcomingSessions
          sessions={data.careHorizon.sessions}
          onSessionClick={handleSessionClick}
        />
        <UpcomingTasks
          tasks={data.careHorizon.tasks}
          onTaskClick={handleTaskClick}
          onTaskComplete={handleTaskComplete}
        />
      </section>

      {/* Capacity + Sustainability */}
      <section className="mb-8 grid md:grid-cols-2 gap-6">
        <CapacityIndicator {...data.capacity} />
        <FinancialSummary
          {...data.sustainability}
          onOutstandingClick={handleOutstandingClick}
        />
      </section>

      {/* Hygiene */}
      <section className="grid md:grid-cols-2 gap-6">
        <AttentionNeeded
          items={data.hygiene.containersNeedingAttention}
          onContainerClick={handleContainerClick}
        />
        <PendingAgreements
          count={data.hygiene.agreementsPending}
          onViewAll={handleViewAgreements}
        />
      </section>
    </div>
  );
}
```

---

## Visual Design Notes

### Colors
- **Background:** Warm neutral (`#f8f7f5` → `#f0efec`)
- **Cards:** White with subtle border (`border-stone-200/60`)
- **Text:** Stone palette (`stone-800`, `stone-600`, `stone-400`)
- **Accent (rare):** Sage for positive states (`#5a7a6f`)
- **No red/green for good/bad** — information is neutral

### Typography
- **Headers:** Light weight, wide tracking
- **Body:** Regular weight, comfortable reading
- **Numbers:** Slightly larger, tabular figures

### Spacing
- Generous whitespace
- Clear section separation
- Breathing room between items

### Interactions
- Subtle hover states
- No animations that demand attention
- Click targets are generous

---

## What This Dashboard Does NOT Show

- Conversion rates
- Client lifetime value
- Retention metrics
- Revenue trends
- Performance comparisons
- "Your busiest day"
- "Most profitable client type"
- Growth projections
- Utilization optimization suggestions

---

**End of UI Component Map**
