# Commons Contribution System

*Members building the commons together — with care, not chaos.*

---

## Philosophy

The Commons is not a content platform. It's a **shared offering space** where members contribute wisdom earned through practice. Every contribution is a gift to the community, not a performance for an audience.

**Core principles:**
- **Offering over posting** — Contributions are gifts, not content
- **Earn and steward** — Trust builds through participation, not payment
- **Safety over volume** — Quality curation protects the space
- **First-person over prescription** — "This helped me" not "You should"

---

## Contributable Objects

### Phase 1 (Safe + Useful)

| Type | Description | Risk Level | Review Speed |
|------|-------------|------------|--------------|
| **Reflection Prompts** | Short, reusable questions for inquiry | Low | Fast |
| **Micro-Practices** | Brief exercises with attribution | Medium | Standard |
| **Agreements & Templates** | Circle agreements, boundary scripts | Low | Fast |
| **Resource Links** | Non-affiliate, curated resources | Medium | Standard |
| **Stories of Practice** | "What I tried / what happened" | Low | Fast |

### Not in Phase 1 (Too Risky)

- Member coaching offers inside the commons
- Diagnostic or clinical claims
- Medical or supplement protocols
- Anything positioned as crisis intervention
- Paid services or products

---

## The Contribution Ladder

### Level 0: Submitter (Everyone)

**Access:** All members
**Can do:**
- Create drafts (private until submitted)
- Submit contributions for review
- Edit their own drafts

**Must agree to:**
- No sales or upsells
- No diagnostic claims
- No exclusivity demands
- No affiliate links

### Level 1: Contributor (Earned)

**Unlocked by:**
- Account age ≥ 30 days AND
- Completed "Safety & Boundaries" orientation AND
- Either: 2+ accepted contributions OR 1 steward endorsement

**Can do:**
- Everything at Level 0
- Submissions reviewed with lighter touch
- Can suggest edits to published content (creates revision)

### Level 2: Curator (Stewards/Helpers)

**Assigned by:** Admin or existing Curator
**Requirements:** Stewardship tier + demonstrated care

**Can do:**
- Review and approve submissions
- Request revisions with feedback
- Merge duplicate contributions
- Add safety notes and contraindications
- Archive or retire content
- Flag content for safety review
- Endorse members for Contributor level

---

## Contribution Pipeline

```
┌─────────┐    ┌───────────┐    ┌────────────────┐    ┌───────────┐
│  Draft  │ →  │ Submitted │ →  │ Needs Revision │ →  │ Published │
└─────────┘    └───────────┘    └────────────────┘    └───────────┘
     ↑              │                    │                   │
     │              │                    │                   ↓
     └──────────────┴────────────────────┘            ┌──────────┐
                                                      │ Archived │
                                                      └──────────┘
                                          ┌──────────┐
                                          │ Flagged  │ (safety concern)
                                          └──────────┘
```

### Status Definitions

| Status | Visibility | Who Can Edit | Notes |
|--------|------------|--------------|-------|
| `draft` | Creator only | Creator | Work in progress |
| `submitted` | Creator + Curators | Creator (limited) | In review queue |
| `needs_revision` | Creator + Curators | Creator | Feedback provided |
| `published` | All members | Curators only | Live in commons |
| `archived` | Hidden | Curators only | Superseded or retired |
| `flagged` | Curators only | Curators only | Safety review needed |

### Review Guidelines

**Fast track (prompts, agreements, stories):**
- Clear language check
- No prescription or diagnosis
- No promotional content
- Attribution if applicable

**Standard review (practices, resources):**
- All fast track checks PLUS
- Attribution required for practices
- "When helpful" section required
- "When not" / contraindications required
- Bias disclosure for resources (no affiliate links)

---

## Guardrails

### Hard Boundaries (Auto-reject)

- Direct upsells or sales language
- "DM me for sessions" or similar solicitation
- Affiliate links or promotional codes
- Claims of curing, healing, or guaranteeing outcomes
- Medical advice or supplement protocols
- Crisis intervention positioning

### Soft Boundaries (Curator discretion)

- Prescriptive language ("You should...") → Request revision to first-person
- Missing "When not" section → Request addition
- Unclear attribution → Request clarification
- Duplicate of existing content → Merge or archive

### Safety Keywords (Flag for review)

Contributions containing these trigger manual review:
- "cure," "heal," "guarantee," "promise"
- "diagnosis," "disorder," "treatment"
- "medication," "supplement," "dosage"
- "suicide," "self-harm," "crisis"
- "I can help you," "reach out to me"

---

## Data Model

### `commons_contributions` table

```sql
CREATE TABLE commons_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core content
  type VARCHAR(20) NOT NULL CHECK (type IN ('prompt', 'practice', 'agreement', 'resource', 'story')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'needs_revision', 'published', 'archived', 'flagged')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,

  -- Metadata
  tags JSONB DEFAULT '[]',  -- [{element: 'fire', facet: 'passion'}, {domain: 'grounding'}]
  attribution TEXT,          -- Source, tradition, inspiration
  safety_notes TEXT,         -- Curator-added warnings
  when_helpful TEXT,         -- When to use
  when_not TEXT,             -- Contraindications

  -- Authorship
  created_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Review
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Metrics (optional, non-social)
  usage_count INTEGER DEFAULT 0,  -- "Used in X circles"
  save_count INTEGER DEFAULT 0    -- "Saved by X members"
);

-- Indexes
CREATE INDEX idx_contributions_status ON commons_contributions(status);
CREATE INDEX idx_contributions_type ON commons_contributions(type);
CREATE INDEX idx_contributions_created_by ON commons_contributions(created_by);
CREATE INDEX idx_contributions_tags ON commons_contributions USING GIN(tags);
```

### `contribution_levels` table (member permissions)

```sql
CREATE TABLE contribution_levels (
  member_id UUID PRIMARY KEY REFERENCES members(id),
  level INTEGER NOT NULL DEFAULT 0 CHECK (level IN (0, 1, 2)),
  orientation_completed BOOLEAN DEFAULT FALSE,
  accepted_count INTEGER DEFAULT 0,
  endorsed_by UUID REFERENCES members(id),
  endorsed_at TIMESTAMPTZ,
  promoted_to_curator_at TIMESTAMPTZ,
  promoted_by UUID REFERENCES members(id)
);
```

---

## Routes & Components

### Information Architecture

```
/maia/community/commons
  ├── /prompts           → Published prompts library
  ├── /practices         → Published practices library
  ├── /agreements        → Published agreements/templates
  ├── /resources         → Published resource links
  ├── /stories           → Published stories of practice
  ├── /contribute        → Contribution form
  ├── /my-offerings      → Member's contribution dashboard
  └── /review            → Curator review queue (Level 2 only)
```

### Components

| Component | Purpose | Access |
|-----------|---------|--------|
| `ContributionForm` | Create/edit contributions | All members |
| `ContributionCard` | Display single contribution | All members |
| `ContributionLibrary` | Browse published contributions | All members |
| `MyOfferingsBoard` | Member's drafts + published | Creator only |
| `ReviewQueue` | Curator approval workflow | Level 2 only |
| `ContributionGuidelines` | Orientation content | All members |

### Permission Integration

```typescript
// Example permission check
function canSubmit(member: Member): boolean {
  return member.tier !== undefined; // Any authenticated member
}

function canReview(member: Member, contributionLevel: number): boolean {
  return contributionLevel >= 2; // Curator level
}

function canPublish(member: Member, contributionLevel: number): boolean {
  return contributionLevel >= 2; // Curator level
}

function isLightTouch(member: Member, contributionLevel: number): boolean {
  return contributionLevel >= 1; // Contributor level = faster review
}
```

---

## UX Patterns

### "Offer to the Commons" Button

Appears on:
- Micro-practices library
- Reflection prompts library
- Agreements library

Copy: "Offer to the Commons"
Tooltip: "Share something that has helped you"

### Contribution Form (Ceremonial)

```
┌─────────────────────────────────────────────┐
│  Offer to the Commons                       │
│                                             │
│  What are you offering?                     │
│  ○ Reflection Prompt                        │
│  ○ Micro-Practice                           │
│  ○ Agreement / Template                     │
│  ○ Resource Link                            │
│  ○ Story of Practice                        │
│                                             │
│  Title                                      │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Content                                    │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  When is this helpful?                      │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  When is this NOT helpful?                  │
│  (contraindications, cautions)              │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Attribution (optional)                     │
│  Where did this come from? Tradition,       │
│  teacher, personal practice?                │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Tags                                       │
│  [fire] [grounding] [transition] [+]        │
│                                             │
│  ┌────────────────┐  ┌──────────────────┐  │
│  │  Save Draft    │  │  Submit for      │  │
│  │                │  │  Review          │  │
│  └────────────────┘  └──────────────────┘  │
│                                             │
│  By submitting, you agree to our            │
│  contribution guidelines.                   │
└─────────────────────────────────────────────┘
```

### My Offerings Dashboard

```
┌─────────────────────────────────────────────┐
│  Your Offerings                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Grounding Before Difficult       │   │
│  │   Conversations                     │   │
│  │   Practice • Published              │   │
│  │   Used in 14 circles               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ○ What would I tell my younger     │   │
│  │   self?                            │   │
│  │   Prompt • Submitted               │   │
│  │   Waiting for review               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Weekly Check-In Template         │   │
│  │   Agreement • Needs Revision       │   │
│  │   Feedback: "Could you add..."     │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Reflection Prompts (Lowest Risk)

1. Database migration
2. ContributionForm (prompts only)
3. MyOfferingsBoard
4. ReviewQueue (basic)
5. Prompts library integration

### Phase 2: Practices & Agreements

1. Extend form for practices (attribution required)
2. Add "When not" validation for practices
3. Extend library pages

### Phase 3: Resources & Stories

1. Extend form for resources (bias disclosure)
2. Stories section
3. Flagging system

### Phase 4: Contribution Levels

1. Orientation flow
2. Automatic level promotion
3. Curator endorsement system

---

## Anti-Patterns to Avoid

| Pattern | Why It's Bad | What We Do Instead |
|---------|--------------|-------------------|
| Like counts | Creates performance anxiety | Optional "saved by X" only |
| Comment sections | Turns offerings into content | Separate discussion spaces |
| Follower counts | Creates hierarchy | Contribution levels based on care |
| Trending/hot | Rewards controversy | Curated featured selections |
| Unlimited posting | Floods the commons | Thoughtful submission flow |

---

*Last updated: January 2026*
