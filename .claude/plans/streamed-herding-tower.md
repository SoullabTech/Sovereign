# Continuity Without Display — Integration & Deploy

## Context
Integrate the "continuity without display" principle as tone tuning across three surfaces. No new features, no new persistence, no routing changes. Just restraint and familiarity.

## Changes
1. **Greeting tone** (`lib/relational/relationalStance.ts`) — bias SEASONAL_RETURN and MIRROR stances toward quiet familiarity
2. **OpenThreads wording** (`components/field/OpenThreads.tsx`) — softer, sparser, 1-2 strong threads > 3 weak
3. **Conversation entry** — continuation language in sacred attending prompt builder

## Deploy
Merge to main, `docker compose up -d --build maia`, smoke test /maia, /maia/chat, /fields, /build.
