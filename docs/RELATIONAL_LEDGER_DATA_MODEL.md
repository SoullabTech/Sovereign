# Relational Practice Ledger: Data Model

**Technical specification for practice stewardship infrastructure**

This document defines the data structures for the Relational Practice Ledger. All designs must comply with [RELATIONAL_LEDGER_ANTI_FEATURES.md](./RELATIONAL_LEDGER_ANTI_FEATURES.md).

---

## Core Principle

The primary object is the **container**, not the person.

Instead of: `Client → sessions → payments`

We model: `Container → people → agreements → sessions`

This matters because:
- Containers can close cleanly
- Containers can change scope
- People don't become "lost opportunities"
- The same person can have multiple containers over time (different engagements)

---

## Entity Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PRACTITIONER                         │
│                   (the steward)                         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ holds
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 RELATIONSHIP CONTAINER                  │
│            (the bounded care agreement)                 │
│                                                         │
│  state: inquiry | active | paused | completed | referred│
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┼───────────┬───────────┐
          │           │           │           │
          ▼           ▼           ▼           ▼
      ┌───────┐  ┌─────────┐  ┌───────┐  ┌───────┐
      │PEOPLE │  │AGREEMENT│  │SESSION│  │ NOTE  │
      └───────┘  └─────────┘  └───────┘  └───────┘
                      │
                      ▼
                 ┌─────────┐
                 │ PAYMENT │
                 └─────────┘
```

---

## 1. Practitioner

The steward who holds relationship containers. Links to the existing `members` table.

```sql
-- No new table needed; uses existing members table
-- Practitioners are Pro-tier members with stewardship access

-- View for practitioner-specific data
CREATE VIEW practitioner_summary AS
SELECT
  m.id,
  m.name,
  m.tier,
  COUNT(DISTINCT rc.id) FILTER (WHERE rc.state = 'active') as active_containers,
  COUNT(DISTINCT rc.id) FILTER (WHERE rc.state = 'inquiry') as pending_inquiries
FROM members m
LEFT JOIN relationship_containers rc ON rc.practitioner_id = m.id
WHERE m.tier = 'pro'
GROUP BY m.id;
```

---

## 2. Relationship Container

The bounded care agreement. This is the primary object.

```sql
CREATE TABLE relationship_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES members(id),

  -- Identity
  name VARCHAR(255) NOT NULL,           -- How practitioner refers to this container
  description TEXT,                      -- What this relationship is for

  -- State (not a pipeline stage)
  state relationship_state NOT NULL DEFAULT 'inquiry',
  state_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Boundaries
  scope TEXT,                            -- What is this container for?
  not_scope TEXT,                        -- What is explicitly outside?

  -- Lifecycle
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  closure_type closure_type,
  closure_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- State enum: honest, non-directional
CREATE TYPE relationship_state AS ENUM (
  'inquiry',      -- Initial contact, no commitment yet
  'active',       -- Ongoing relationship with commitments
  'paused',       -- Temporarily inactive, by mutual agreement
  'completed',    -- Natural ending, work is done
  'referred'      -- Handed to another practitioner
);

-- Closure type: how did it end?
CREATE TYPE closure_type AS ENUM (
  'natural',      -- Work completed, mutual recognition
  'transition',   -- Moving to different support
  'pause',        -- Taking a break, may return
  'boundary',     -- Practitioner set a limit
  'withdrawn',    -- Person chose to leave
  'referred'      -- Referred to another practitioner
);

-- Index for practitioner's view
CREATE INDEX idx_containers_practitioner_state
  ON relationship_containers(practitioner_id, state);
```

### State Transitions

States are **descriptive**, not **directional**. There is no "forward" or "backward."

```
                    ┌─────────────┐
                    │   inquiry   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ active  │  │completed│  │referred │
        └────┬────┘  └─────────┘  └─────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
   ┌─────────┐ ┌─────────┐
   │ paused  │ │completed│
   └────┬────┘ └─────────┘
        │
        ▼
   ┌─────────┐
   │ active  │  (can return from pause)
   └─────────┘
```

**Not allowed:**
- No "conversion" from inquiry to active (it's "beginning," not "converting")
- No tracking of "how long in inquiry" as a pressure metric
- No "win/lose" framing for any transition

---

## 3. Container People

People involved in a relationship container. A container can have multiple people (couples, families, groups).

```sql
CREATE TABLE container_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,

  -- Identity (minimal, respectful)
  name VARCHAR(255) NOT NULL,
  preferred_name VARCHAR(100),
  pronouns VARCHAR(50),

  -- Contact (optional, practitioner's choice)
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Context (not surveillance)
  initial_context TEXT,                  -- What brought them here?

  -- Role in container
  role container_role DEFAULT 'primary',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE container_role AS ENUM (
  'primary',      -- Main person in the relationship
  'partner',      -- Partner in couples work
  'family',       -- Family member in family work
  'guardian',     -- For work with minors
  'support'       -- Support person (friend, etc.)
);

-- No tracking of:
-- - engagement_score
-- - last_contact_date (as pressure metric)
-- - lifetime_value
-- - lead_source
```

---

## 4. Agreements

What has been committed to. Agreements belong to containers.

```sql
CREATE TABLE agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,

  -- What is the agreement?
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Type
  agreement_type agreement_type NOT NULL,

  -- Boundaries
  scope TEXT,                            -- What does this cover?
  frequency VARCHAR(100),                -- e.g., "weekly", "as needed"
  duration VARCHAR(100),                 -- e.g., "3 months", "ongoing"

  -- Financial (if applicable)
  rate_amount DECIMAL(10,2),
  rate_type rate_type,

  -- State
  state agreement_state NOT NULL DEFAULT 'proposed',
  state_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Lifecycle
  starts_at DATE,
  ends_at DATE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE agreement_type AS ENUM (
  'ongoing',      -- Regular sessions, no fixed end
  'package',      -- Fixed number of sessions
  'project',      -- Specific deliverable or goal
  'consultation', -- One-time or limited engagement
  'sliding',      -- Sliding scale arrangement
  'pro_bono'      -- No-fee arrangement
);

CREATE TYPE rate_type AS ENUM (
  'per_session',
  'monthly',
  'package',
  'project',
  'sliding',
  'free'
);

CREATE TYPE agreement_state AS ENUM (
  'proposed',     -- Offered, not yet accepted
  'active',       -- Currently in effect
  'paused',       -- Temporarily suspended
  'completed',    -- Fulfilled
  'cancelled'     -- Ended before completion
);
```

---

## 5. Sessions

What happened when you met. Sessions record encounters, not metrics.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,
  agreement_id UUID REFERENCES agreements(id),

  -- When
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- What
  session_type session_type DEFAULT 'regular',
  modality session_modality DEFAULT 'video',

  -- State
  state session_state NOT NULL DEFAULT 'scheduled',

  -- Notes (practitioner's reflection, not surveillance)
  practitioner_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE session_type AS ENUM (
  'regular',      -- Standard session
  'intake',       -- Initial meeting
  'closing',      -- Final session
  'check_in',     -- Brief check-in
  'crisis',       -- Unscheduled urgent support
  'group'         -- Multiple people
);

CREATE TYPE session_modality AS ENUM (
  'in_person',
  'video',
  'phone',
  'text',
  'async'         -- Asynchronous (email, voice notes)
);

CREATE TYPE session_state AS ENUM (
  'scheduled',    -- Planned, not yet occurred
  'completed',    -- Happened
  'cancelled',    -- Called off
  'no_show',      -- Person didn't attend
  'rescheduled'   -- Moved to different time
);

-- No tracking of:
-- - client_engagement_score
-- - session_quality_rating
-- - client_satisfaction
```

---

## 6. Payments

Financial transactions. Clean, simple, no extraction metrics.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id),
  container_id UUID NOT NULL REFERENCES relationship_containers(id),

  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- What is this for?
  description VARCHAR(255),

  -- State
  state payment_state NOT NULL DEFAULT 'pending',

  -- When
  due_at DATE,
  paid_at TIMESTAMPTZ,

  -- Method (optional)
  method VARCHAR(50),                    -- "stripe", "cash", "check", etc.
  external_id VARCHAR(255),              -- Stripe payment ID, etc.

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE payment_state AS ENUM (
  'pending',      -- Expected but not yet received
  'received',     -- Payment completed
  'waived',       -- Practitioner chose not to collect
  'refunded',     -- Returned to person
  'failed'        -- Payment attempt failed
);

-- No tracking of:
-- - lifetime_value
-- - payment_reliability_score
-- - upsell_potential
```

---

## 7. Notes

Practitioner's reflections. Private, not shared with the person unless explicitly chosen.

```sql
CREATE TABLE container_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES relationship_containers(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id),        -- Optional: linked to specific session

  -- Content
  content TEXT NOT NULL,

  -- Type
  note_type note_type DEFAULT 'reflection',

  -- Visibility
  is_private BOOLEAN DEFAULT TRUE,       -- Private to practitioner

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE note_type AS ENUM (
  'reflection',   -- General practitioner reflection
  'session',      -- Notes from a specific session
  'pattern',      -- Something recurring noticed
  'care_plan',    -- Thoughts on direction
  'supervision',  -- Notes from supervision discussion
  'closure'       -- Reflections on ending
);
```

---

## 8. Closures

Clean endings deserve their own record.

```sql
CREATE TABLE closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID NOT NULL REFERENCES relationship_containers(id),

  -- How did it end?
  closure_type closure_type NOT NULL,

  -- Practitioner's reflection
  reflection TEXT,

  -- What was accomplished?
  what_worked TEXT,
  what_was_incomplete TEXT,

  -- Referral (if applicable)
  referred_to VARCHAR(255),
  referral_notes TEXT,

  -- Door status
  door_status door_status DEFAULT 'open',

  -- When
  closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE door_status AS ENUM (
  'open',         -- Person can return
  'closed',       -- Relationship complete
  'boundary'      -- Practitioner set a limit
);
```

---

## Allowed Views

These views support integrity, not growth.

### Relationship Index
```sql
-- Who am I in active relationship with?
CREATE VIEW relationship_index AS
SELECT
  rc.id,
  rc.name,
  rc.state,
  rc.scope,
  array_agg(cp.name) as people,
  rc.opened_at
FROM relationship_containers rc
LEFT JOIN container_people cp ON cp.container_id = rc.id
WHERE rc.state IN ('active', 'paused')
GROUP BY rc.id
ORDER BY rc.name;
```

### Commitment Load
```sql
-- How many active containers do I hold?
CREATE VIEW commitment_load AS
SELECT
  practitioner_id,
  COUNT(*) FILTER (WHERE state = 'active') as active_count,
  COUNT(*) FILTER (WHERE state = 'paused') as paused_count,
  COUNT(*) FILTER (WHERE state = 'inquiry') as inquiry_count
FROM relationship_containers
GROUP BY practitioner_id;
```

### Care Horizon
```sql
-- What's upcoming that requires attention?
CREATE VIEW care_horizon AS
SELECT
  rc.id as container_id,
  rc.name as container_name,
  s.scheduled_at,
  s.session_type,
  a.title as agreement
FROM sessions s
JOIN relationship_containers rc ON rc.id = s.container_id
LEFT JOIN agreements a ON a.id = s.agreement_id
WHERE s.scheduled_at > NOW()
  AND s.state = 'scheduled'
ORDER BY s.scheduled_at;
```

### Closure Hygiene
```sql
-- What needs a clean ending?
CREATE VIEW closure_hygiene AS
SELECT
  rc.id,
  rc.name,
  rc.state,
  rc.state_changed_at,
  EXTRACT(days FROM NOW() - rc.state_changed_at) as days_in_state
FROM relationship_containers rc
WHERE
  (rc.state = 'paused' AND rc.state_changed_at < NOW() - INTERVAL '90 days')
  OR (rc.state = 'inquiry' AND rc.state_changed_at < NOW() - INTERVAL '30 days')
ORDER BY rc.state_changed_at;
```

### Sustainability View
```sql
-- Am I financially stable this month?
CREATE VIEW monthly_sustainability AS
SELECT
  DATE_TRUNC('month', p.paid_at) as month,
  SUM(p.amount) as total_received,
  COUNT(DISTINCT p.container_id) as containers_paying
FROM payments p
WHERE p.state = 'received'
  AND p.paid_at > NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', p.paid_at)
ORDER BY month DESC;
```

---

## Prohibited Fields

These fields must **never** be added:

| Field | Why Prohibited |
|-------|----------------|
| `lead_source` | Frames people as acquisitions |
| `conversion_date` | Implies pipeline thinking |
| `lifetime_value` | Reduces people to revenue |
| `engagement_score` | Surveillance of behavior |
| `last_contacted` (as metric) | Pressure to contact |
| `churn_risk` | Predictive manipulation |
| `upsell_potential` | Extraction framing |
| `referral_source` | Attribution tracking |
| `client_rating` | Ranking people |

---

## API Endpoints (Specification)

### Containers
```
GET    /api/practice/containers              -- List practitioner's containers
GET    /api/practice/containers/:id          -- Get single container
POST   /api/practice/containers              -- Create new container
PATCH  /api/practice/containers/:id          -- Update container
POST   /api/practice/containers/:id/close    -- Close container (with closure record)
```

### People
```
GET    /api/practice/containers/:id/people   -- List people in container
POST   /api/practice/containers/:id/people   -- Add person to container
PATCH  /api/practice/people/:id              -- Update person
```

### Agreements
```
GET    /api/practice/containers/:id/agreements
POST   /api/practice/containers/:id/agreements
PATCH  /api/practice/agreements/:id
```

### Sessions
```
GET    /api/practice/containers/:id/sessions
POST   /api/practice/containers/:id/sessions
PATCH  /api/practice/sessions/:id
```

### Views
```
GET    /api/practice/views/relationship-index
GET    /api/practice/views/commitment-load
GET    /api/practice/views/care-horizon
GET    /api/practice/views/closure-hygiene
GET    /api/practice/views/sustainability
```

---

## Migration

```sql
-- Migration: 20260120000001_relational_practice_ledger.sql

-- Enums
CREATE TYPE relationship_state AS ENUM ('inquiry', 'active', 'paused', 'completed', 'referred');
CREATE TYPE closure_type AS ENUM ('natural', 'transition', 'pause', 'boundary', 'withdrawn', 'referred');
CREATE TYPE container_role AS ENUM ('primary', 'partner', 'family', 'guardian', 'support');
CREATE TYPE agreement_type AS ENUM ('ongoing', 'package', 'project', 'consultation', 'sliding', 'pro_bono');
CREATE TYPE rate_type AS ENUM ('per_session', 'monthly', 'package', 'project', 'sliding', 'free');
CREATE TYPE agreement_state AS ENUM ('proposed', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE session_type AS ENUM ('regular', 'intake', 'closing', 'check_in', 'crisis', 'group');
CREATE TYPE session_modality AS ENUM ('in_person', 'video', 'phone', 'text', 'async');
CREATE TYPE session_state AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled');
CREATE TYPE payment_state AS ENUM ('pending', 'received', 'waived', 'refunded', 'failed');
CREATE TYPE note_type AS ENUM ('reflection', 'session', 'pattern', 'care_plan', 'supervision', 'closure');
CREATE TYPE door_status AS ENUM ('open', 'closed', 'boundary');

-- Tables (see full definitions above)
-- ... relationship_containers
-- ... container_people
-- ... agreements
-- ... sessions
-- ... payments
-- ... container_notes
-- ... closures

-- Views
-- ... relationship_index
-- ... commitment_load
-- ... care_horizon
-- ... closure_hygiene
-- ... monthly_sustainability
```

---

## Related Documents

- [RELATIONAL_LEDGER_ANTI_FEATURES.md](./RELATIONAL_LEDGER_ANTI_FEATURES.md) — What this system must never become
- [ACCOMPANIMENT_MODEL.md](./ACCOMPANIMENT_MODEL.md) — The philosophical foundation
- [TIER_STRUCTURE.md](./TIER_STRUCTURE.md) — Stewardship tier definition

---

**Last updated:** 2026-01-20
