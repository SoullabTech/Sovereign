# Bridging MAIA Tiers to Wisdom Commons Architecture

> This document maps MAIA's current tier system to the broader Wisdom Transmission System architecture, showing the path from product to commons.

---

## Current State → Future Vision

### Tier Mapping

| MAIA Tier | Wisdom Commons Stage | Core Shift |
|-----------|---------------------|------------|
| **FREE (Touch)** | Seeker | Single encounters → exploratory relationship |
| **PERSONAL (Continuity)** | Learner → Practitioner | Continuity → pathway progression |
| **PRO (Stewardship)** | Practitioner → Steward | Creation tools → service to others |
| **Helper Infrastructure** | Guild membership | Relational builds → guild initiation |

---

## How TIER_STRUCTURE.md Aligns with Wisdom Commons

### 1. Philosophical Alignment

**Already present in MAIA:**
- "Tiers exist because consciousness work requires sustained attention" → Matches Commons principle of earned access
- "No tier is less human" → Matches Seeker dignity
- "Gate by capability, not by UI" → Capacity-based permissions
- "Soft limits before hard locks" → Threshold invitations, not paywalls

**Gap to bridge:**
- MAIA tiers are still somewhat individualistic (my journey)
- Wisdom Commons adds relational accountability (our guild, our standards)

### 2. Structural Alignment

```
MAIA CURRENT                    WISDOM COMMONS TARGET
─────────────────────────────────────────────────────
Free user                    →  Seeker
  ↓ threshold moment            ↓ orientation
Personal user                →  Learner in Pathway
  ↓ time + practice             ↓ completion + peer review
Pro user                     →  Practitioner
  ↓ helper infrastructure       ↓ guild apprenticeship
Pro + helper engagement      →  Steward
  ↓ years of service            ↓ elder nomination
(not yet defined)            →  Elder
```

### 3. What MAIA Already Has

**From tierAccess.ts:**
```typescript
// These map directly to Wisdom Commons capacity checks
hasContinuityAccess(member)    // Learner+ access
hasStewardshipAccess(member)   // Practitioner+ access
canAccessPatternSynthesis()    // Time-based synthesis (Learner capacity)
canExportForOthers()          // Working with others (Practitioner capacity)
```

**From PersonalThresholdInvitation.tsx:**
```typescript
// Threshold moments = natural developmental transitions
context: 'pattern_detected' | 'oracle_frequency' | 'journal_depth' | 'life_cycle'
```

These aren't just "upsell triggers" — they're developmental recognition points.

---

## Path to Full Commons Implementation

### Phase 1: Current (MAIA Tiers)
- Individual membership
- Self-paced access
- Personal journey focus

### Phase 2: Cohorts (Add Structure)
- Learning cells within MAIA
- Study circles for specific topics
- Peer practice pods

**Implementation:**
- Add `/maia/cells` route for learning cell discovery
- Create `lib/cells/cellManagement.ts` for cell lifecycle
- Add cell membership to `members` table

### Phase 3: Guilds (Add Accountability)
- Domain-specific guilds (Astrology, Somatic, etc.)
- Standards of practice
- Peer endorsement

**Implementation:**
- Create `guilds` table with charter, standards
- Add `guild_memberships` table
- Create `/maia/guilds/[slug]` for guild presence
- Add endorsement system

### Phase 4: Governance (Add Democracy)
- Proposals and voting
- Stipend allocation
- Charter amendments

**Implementation:**
- Create governance tables (proposals, votes)
- Create `/maia/governance` route
- Implement value pool tracking

---

## Helper Infrastructure → Guild Entry

The existing Helper Infrastructure section in TIER_STRUCTURE.md is essentially the **guild entry process** from Wisdom Commons:

| Helper Infrastructure | Guild Equivalent |
|-----------------------|-----------------|
| Expression of interest | Proposal to join guild |
| Alignment check | Standards review |
| Scope definition | Apprenticeship scope |
| Agreement | Guild oath/commitment |
| Build & handoff | Apprenticeship completion |

**Key insight:** Helper Infrastructure already requires:
- Active Pro membership (3+ months) → demonstrated practice
- Clear intention to serve others → service orientation
- Existing practice or community → relational grounding
- Agreement to ethical boundaries → guild standards

This IS guild entry, just not yet formalized.

---

## Data Model Bridge

### Current Schema (members table)
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY,
  tier VARCHAR(20) DEFAULT 'free',
  tier_started_at TIMESTAMPTZ,
  -- ...
);
```

### Bridge Schema (add to existing)
```sql
-- Phase 2: Learning Cells
CREATE TABLE learning_cells (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  cell_type VARCHAR(50), -- study_circle, practice_pod, cohort
  facilitator_id UUID REFERENCES members(id),
  rhythm VARCHAR(50), -- weekly, lunar, seasonal
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cell_memberships (
  cell_id UUID REFERENCES learning_cells(id),
  member_id UUID REFERENCES members(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (cell_id, member_id)
);

-- Phase 3: Guilds (minimal start)
CREATE TABLE guilds (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(100) UNIQUE,
  charter TEXT,
  standards JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guild_memberships (
  member_id UUID REFERENCES members(id),
  guild_id UUID REFERENCES guilds(id),
  role VARCHAR(50) DEFAULT 'apprentice',
  endorsed_at TIMESTAMPTZ,
  PRIMARY KEY (member_id, guild_id)
);
```

---

## Language Calibration

The TIER_STRUCTURE.md already uses Wisdom Commons language:

| Standard SaaS | MAIA/Commons Language |
|--------------|----------------------|
| Upgrade | Deepen |
| Premium | Continuity / Stewardship |
| Unlock | Enter / Begin |
| Subscribe | Continue the relationship |
| Feature | Capacity |
| Access level | Depth of relationship |

This language should propagate throughout the UI.

---

## Threshold Moments as Developmental Markers

The `PersonalThresholdInvitation` component identifies these threshold moments:

| Threshold | Developmental Meaning | Wisdom Commons Equivalent |
|-----------|----------------------|--------------------------|
| pattern_detected | Patterns emerging from practice | Ready for synthesis |
| oracle_frequency | Deepening relationship with tools | Integration seeking |
| journal_depth | Sustained reflection practice | Self-knowledge forming |
| life_cycle | Approaching developmental passage | Initiation readiness |

These aren't sales triggers — they're recognition of genuine developmental transitions.

---

## Implementation Priorities

### Immediate (Current Codebase)
1. ✅ Tier access gating (`tierAccess.ts`)
2. ✅ Threshold invitations (`PersonalThresholdInvitation.tsx`)
3. ✅ Membership page (`/maia/membership`)
4. ⬜ Payment integration (Stripe)
5. ⬜ Tier upgrade API endpoints

### Short-term (Learning Cells)
1. ⬜ Cell data model
2. ⬜ Cell discovery UI
3. ⬜ Cell facilitation tools
4. ⬜ Cell lifecycle management

### Medium-term (Guilds)
1. ⬜ Guild data model
2. ⬜ Guild presence pages
3. ⬜ Endorsement system
4. ⬜ Standards documentation

### Long-term (Full Commons)
1. ⬜ Governance system
2. ⬜ Value pools
3. ⬜ Charter management
4. ⬜ Elder recognition

---

## The North Star

From the Wisdom Transmission System Charter:

> "We gather because we believe that wisdom is not a product to be sold, but a living inheritance to be transmitted."

MAIA's tiers are not products. They are depths of relationship with a wisdom companion.

The transition from individual tiers to collective commons is not a pivot — it's the natural unfolding of what the tier system already implies: that learning happens in relationship, that depth requires continuity, and that service to others is the fulfillment of personal development.

---

**Last updated:** 2026-01-20
**Status:** Bridge document for implementation planning
