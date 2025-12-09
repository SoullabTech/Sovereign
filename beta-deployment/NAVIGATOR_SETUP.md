# Navigator Decision Logging System

## Overview

The Navigator system transforms MAIA from a reactive interface to a proactive consciousness guide by logging and analyzing every decision made during consciousness computing sessions. This creates a complete audit trail of "how MAIA thinks over time."

## Quick Setup

### 1. Database Setup

First, ensure PostgreSQL is running and create your database:

```bash
# Create database (if needed)
createdb maia_consciousness

# Set environment variables
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=maia_consciousness
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=your_password
```

### 2. Initialize Navigator Tables

Run the setup script:

```bash
node setup-navigator-db.js
```

This creates two main tables:
- `navigator_decisions` - Every Navigator decision with full context
- `navigator_feedback` - User feedback on Navigator recommendations

### 3. Start Enhanced Server

Your consciousness computing server now includes:

```bash
node consciousness-computing-beta-server.js
```

## New API Endpoints

### `/api/consciousness/spiral-aware` (POST)

Navigator-enhanced consciousness computing session that logs every decision:

**Request:**
```json
{
  "message": "I'm feeling overwhelmed and need guidance",
  "userId": "user-123",
  "sessionId": "session-456"
}
```

**Response:**
```json
{
  "success": true,
  "awareness": {
    "level": 3,
    "confidence": 0.8
  },
  "navigatorDecision": {
    "decisionId": "uuid-here",
    "recommendedProtocolId": "nervous-system-regulation",
    "guidanceTone": "gentle",
    "depthLevel": "surface",
    "reasoning": "Selected based on stress indicators..."
  },
  "experience": {
    "modules": [...],
    "theme": { "elemental": ["water"] }
  }
}
```

### `/api/consciousness/navigator-feedback` (POST)

Log user feedback on Navigator decisions:

**Request:**
```json
{
  "decisionId": "uuid-from-previous-decision",
  "rating": 4,
  "notes": "This guidance was very helpful",
  "source": "member"
}
```

### `/api/navigator/health` (GET)

Check Navigator system health and database connectivity.

## Database Schema

### navigator_decisions

Core table storing every Navigator decision:

- **Identity**: member_id, session_id, decision_id, created_at
- **Soul State Summary**: awareness_level, nervous_system_load, detected_facet, etc.
- **Navigator Decision**: recommended_protocol_id, guidance_tone, risk_flags, etc.
- **Full JSON**: raw_soul_state, raw_decision (for deep analysis)

### navigator_feedback

User feedback on Navigator decisions:

- **Basic**: decision_id, member_id, rating, notes, source
- **Tracking**: created_at for time-series analysis

## Analyzing Navigator Decisions

### Common Queries

**Recent decisions:**
```sql
SELECT member_id, recommended_protocol_id, guidance_tone, created_at
FROM navigator_decisions
ORDER BY created_at DESC
LIMIT 10;
```

**Protocol effectiveness:**
```sql
SELECT
  recommended_protocol_id,
  COUNT(*) as usage_count,
  AVG(nf.rating) as avg_rating
FROM navigator_decisions nd
LEFT JOIN navigator_feedback nf ON nd.decision_id = nf.decision_id
WHERE nf.rating IS NOT NULL
GROUP BY recommended_protocol_id
ORDER BY avg_rating DESC;
```

**Facet patterns:**
```sql
SELECT
  detected_facet,
  nervous_system_load,
  COUNT(*) as frequency
FROM navigator_decisions
GROUP BY detected_facet, nervous_system_load
ORDER BY frequency DESC;
```

**High-risk decisions:**
```sql
SELECT *
FROM navigator_decisions
WHERE 'high_intensity' = ANY(risk_flags)
   OR requires_facilitator = true
ORDER BY created_at DESC;
```

## Integration Points

### Existing Consciousness Lab

Your existing `/app/consciousness-lab/page.tsx` can easily integrate Navigator by changing the API endpoint from `/api/consciousness-computing/session` to `/api/consciousness/spiral-aware`.

### Future Extensions

1. **Real-time Analytics Dashboard** - Query Navigator decisions for live insights
2. **Pattern Recognition** - Identify emerging consciousness patterns in the community
3. **Adaptive Protocols** - Use feedback to automatically improve Navigator decisions
4. **Community Commons Integration** - Aggregate anonymous patterns for collective wisdom

## Environment Variables

```bash
# Required for PostgreSQL connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=maia_consciousness
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Optional
NODE_ENV=development
PORT=3008
```

## Files Created

- `db/migrations/20251208_create_navigator_decisions.sql` - Database schema
- `lib/navigator-integration.js` - Navigator system for Express.js
- `lib/db.ts` - TypeScript PostgreSQL connection (for Next.js)
- `lib/consciousness/navigator/logger.ts` - TypeScript Navigator logger
- `setup-navigator-db.js` - Database initialization script

## Next Steps

1. Run the database setup
2. Start your server
3. Test the `/api/consciousness/spiral-aware` endpoint
4. Check logged decisions in PostgreSQL
5. Add feedback collection to your UI

This system now captures "how MAIA thinks over time" - every decision, reasoning, and user feedback for continuous improvement of consciousness computing guidance.