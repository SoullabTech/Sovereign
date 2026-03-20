# Wisdom Keepers Fields — Specification

> "We gather because we believe that wisdom is not a product to be sold, but a living inheritance to be transmitted."

**Status:** Proposed — awaiting implementation
**Relation to existing architecture:** Extends Circles + Wisdom Commons Bridge. Sits at Phase 3 of the Commons roadmap (guild-equivalent, but organized around a master's body of work rather than a practice domain).

---

## What a Wisdom Keepers Field Is

A **Wisdom Keepers Field** is a community gathering space organized around a master's body of work — past or present. It is not a study group in the ordinary sense. It is a living field: members bring their own experience, questions, integrations, and encounters with the work. The field holds that collective intelligence without MAIA becoming the interpreter.

**A Field is not:**
- An AI chatbot that speaks in the master's voice
- A content library or summary engine
- A fan community or admiration space
- A debate forum seeking consensus

**A Field is:**
- A commons where the master's work is held with care
- A space for members to bring their own encounter with the work
- A container for integration, not information
- Governed by the community, not by MAIA

---

## Two Field Types

The critical distinction is the master's relationship to AI — and therefore MAIA's posture within the field.

### Type 1 — Past Master Fields

Masters whose primary work is historically established and publicly accessible (not living, or explicitly open to engagement).

**Examples:** Carl Jung, Rumi, Thich Nhat Hanh (public teachings), James Hillman, Simone Weil, Meister Eckhart, Marie-Louise von Franz

**AI posture: `contextual`**
MAIA can:
- Help members explore and illuminate concepts from the work
- Offer spiralogic framing of ideas when asked
- Facilitate synthesis between a member's personal experience and the work
- Respond to questions about the work as a thoughtful companion *studying alongside* the member

MAIA must not:
- Speak as or for the master
- Claim authority over interpretation
- Generate content that purports to be the master's voice or teaching
- Replace direct encounter with the primary texts

**Prompt constraint (all Past Master fields):**
*"You are not [Master]. You are a thinking companion exploring [Master]'s work alongside the member. Reflect and illuminate — never speak as the source."*

---

### Type 2 — Living Master Fields (AI-Minimal)

Masters who are alive and whose orientation toward AI is uncertain, skeptical, or explicitly opposed — but whose work is making a genuine difference and deserves a gathering space.

**Examples:** Iain McGilchrist, Gabor Maté, Robin Wall Kimmerer, Thomas Hübl, Charles Eisenstein

**AI posture: `none`**
MAIA does not speak in these fields. At all.

The field infrastructure provides:
- A commons page for the master's profile and works catalog
- Member contributions (reflections, questions, integrations)
- Community replies between members
- Study circles that can emerge from the field (using the Circles system)

What is absent:
- No MAIA response to contributions
- No AI analysis of the master's work
- No AI-generated summaries of their texts
- No oracle mode within the field context

**Why this matters:**
If a living master like McGilchrist were to discover their work was being mediated, interpreted, and synthesized by an AI system — even a sovereign, consent-based one — that would be a violation. His entire intellectual project is a critique of the left-hemisphere's instrumental grasp on reality. An AI "helping" members understand his work would be precisely what he is warning against. The right posture is to hold the space and step back entirely.

This is not a limitation. It is respect as architecture.

---

## What Every Field Provides

Regardless of type, every Wisdom Keepers Field includes:

### 1. Master Profile
- Name, dates, tradition/domain
- Brief orientation (written by a field steward, not AI-generated)
- Link to primary works and official resources
- A note on the field's AI posture (transparent to members)

### 2. Works Catalog
A curated list of the master's works — not stored content, but referenced pointers:
- Title, year, type (book / essay / lecture / interview)
- Brief description (human-written)
- Where to find it (publisher, archive, official site)

The catalog is a guide to the primary source. It does not replace it.

### 3. Member Contributions
Members can post:

| Type | Description |
|------|-------------|
| `reflection` | Personal encounter with the work — what it opened, disturbed, confirmed |
| `question` | A question the work raises — not seeking an answer, holding the inquiry |
| `integration` | How the work has entered lived experience |
| `application` | Use of the work in practice (therapeutic, creative, relational, etc.) |

Each contribution is member-owned. Members can revoke at any time.

### 4. Community Replies
Members reply to each other's contributions. No voting, no ranking. Threaded, chronological.

### 5. Study Circles
Any member can spawn a Circle from the field — a smaller, consent-governed gathering around a specific aspect of the work. The Circle uses the existing Circles system and retains its own consent/role architecture.

---

## Data Model

```sql
-- The field itself
CREATE TABLE wisdom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) UNIQUE NOT NULL,
  master_name VARCHAR(120) NOT NULL,
  master_dates VARCHAR(60),               -- e.g. "1875–1961" or "b. 1953"
  master_domain VARCHAR(120),             -- e.g. "Analytical psychology, alchemy"
  field_type VARCHAR(30) NOT NULL         -- 'past_master' | 'living_master'
    CHECK (field_type IN ('past_master', 'living_master')),
  ai_posture VARCHAR(20) NOT NULL         -- 'contextual' | 'none'
    CHECK (ai_posture IN ('contextual', 'none')),
  orientation TEXT,                       -- human-written orientation paragraph
  ai_posture_note TEXT,                   -- visible to members: why AI is present/absent
  visibility VARCHAR(20) DEFAULT 'open'   -- 'open' | 'invite_only'
    CHECK (visibility IN ('open', 'invite_only')),
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Field membership
CREATE TABLE wisdom_field_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  role VARCHAR(30) DEFAULT 'member'       -- 'member' | 'steward'
    CHECK (role IN ('member', 'steward')),
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'left')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (field_id, member_id)
);

-- Works catalog
CREATE TABLE wisdom_field_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  title VARCHAR(240) NOT NULL,
  year VARCHAR(10),
  work_type VARCHAR(40)                   -- 'book' | 'essay' | 'lecture' | 'interview' | 'other'
    CHECK (work_type IN ('book', 'essay', 'lecture', 'interview', 'other')),
  description TEXT,
  external_url TEXT,
  added_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member contributions
CREATE TABLE wisdom_field_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  contribution_type VARCHAR(30) NOT NULL  -- 'reflection' | 'question' | 'integration' | 'application'
    CHECK (contribution_type IN ('reflection', 'question', 'integration', 'application')),
  work_id UUID REFERENCES wisdom_field_works(id) ON DELETE SET NULL, -- optional: tied to a specific work
  title VARCHAR(120),
  body TEXT NOT NULL,
  revoked_at TIMESTAMPTZ,                 -- member can retract
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community replies (member-to-member)
CREATE TABLE wisdom_field_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID REFERENCES wisdom_field_contributions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sub-circles spawned from a field (links existing circles to a field)
CREATE TABLE wisdom_field_circles (
  field_id UUID REFERENCES wisdom_fields(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (field_id, circle_id)
);

-- Indexes
CREATE INDEX idx_wf_memberships_member ON wisdom_field_memberships(member_id);
CREATE INDEX idx_wf_contributions_field ON wisdom_field_contributions(field_id);
CREATE INDEX idx_wf_contributions_member ON wisdom_field_contributions(member_id);
CREATE INDEX idx_wf_replies_contribution ON wisdom_field_replies(contribution_id);
```

---

## AI Engagement Rules (enforced at API layer)

```typescript
// lib/wisdom-fields/types.ts

export type FieldType = 'past_master' | 'living_master';
export type AIPosture = 'contextual' | 'none';
export type ContributionType = 'reflection' | 'question' | 'integration' | 'application';
export type FieldRole = 'member' | 'steward';

// When a member asks MAIA a question while in a field context,
// the oracle route checks this before generating a response.
export function canMAIARespond(field: WisdomField): boolean {
  return field.ai_posture === 'contextual';
}

// System prompt prefix for Past Master fields
export function getFieldSystemPromptPrefix(field: WisdomField): string {
  if (field.ai_posture === 'none') {
    throw new Error('MAIA must not generate responses in ai_posture:none fields');
  }
  return [
    `You are exploring the work of ${field.master_name} alongside the member.`,
    `You are not ${field.master_name}. You do not speak as or for them.`,
    `Your role is to illuminate, reflect, and hold space for the member's encounter with this body of work.`,
    `Always return authority to the member and to the primary source — never to yourself.`,
  ].join(' ');
}
```

---

## Sovereignty Alignment

This feature passes all four sovereignty tests:

1. **Does this increase user agency?**
   Yes — members engage directly with primary work rather than being mediated by an AI summary. The `none` posture removes AI entirely where that's the right call.

2. **Does this push life outward into the world?**
   Yes — fields point toward books, essays, direct encounter with the master's work. The catalog is a map to primary sources.

3. **Does this reduce the system's psychological centrality over time?**
   Yes — community replies happen between members. Study circles are member-governed. MAIA's absence in `living_master` fields is architecturally enforced.

4. **Invariant 2 (No Exclusive Bond):**
   Fields explicitly direct members toward other humans and toward the master's work. MAIA is a context-holder, not the source of wisdom.

---

## What MAIA Does NOT Do in Any Field

Across both field types, MAIA never:
- Speaks as the master or in the master's voice
- Claims interpretive authority over the master's meaning
- Generates new content attributed to the master
- Summarizes or condenses primary works in ways that substitute for reading them
- Discourages direct engagement with the primary source
- Positions itself as a better guide to the work than the work itself

---

## Seed Fields (Proposed First Set)

### Past Master (ai_posture: contextual)
| Master | Domain |
|--------|--------|
| Carl Jung | Analytical psychology, alchemy, individuation |
| Marie-Louise von Franz | Jungian alchemy, fairy tale interpretation |
| James Hillman | Archetypal psychology, soul |
| Rumi | Sufi mysticism, poetry, love |
| Simone Weil | Attention, affliction, the sacred |
| Meister Eckhart | Christian mysticism, detachment |
| Thich Nhat Hanh | Engaged Buddhism, interbeing |

### Living Master (ai_posture: none)
| Master | Domain |
|--------|--------|
| Iain McGilchrist | Hemispheric mind, attention, meaning |
| Robin Wall Kimmerer | Indigenous botany, reciprocity, plant intelligence |
| Gabor Maté | Trauma, authenticity, compassionate inquiry |
| Thomas Hübl | Collective trauma healing, field consciousness |
| Charles Eisenstein | Sacred economics, the more beautiful world |
| Joanna Macy | Active hope, the work that reconnects |

---

## Implementation Path

### Phase 1 — Foundations
- [ ] DB migration: all six tables above
- [ ] `lib/wisdom-fields/types.ts` — types + AI posture logic
- [ ] `lib/wisdom-fields/fieldService.ts` — CRUD + membership
- [ ] `app/api/wisdom-fields/` — REST endpoints
- [ ] Seed data: first 2-3 fields (one past, one living)

### Phase 2 — Field Pages
- [ ] `/commons/fields` — directory of all fields
- [ ] `/commons/fields/[slug]` — field page (profile, works, contributions)
- [ ] Contribution submit form (with type selector)
- [ ] Community replies UI

### Phase 3 — MAIA Integration (Past Master only)
- [ ] Oracle route: detect field context from conversation metadata
- [ ] Apply `getFieldSystemPromptPrefix()` when `ai_posture === 'contextual'`
- [ ] Hard block when `ai_posture === 'none'` — no path through to LLM

### Phase 4 — Study Circles
- [ ] "Start a Study Circle" action on field page
- [ ] `wisdom_field_circles` join table populated
- [ ] Circle page back-links to its parent field

---

## Language

| Standard | Field Language |
|----------|---------------|
| "Join the group" | "Enter the field" |
| "Post" | "Offer a reflection" / "Bring a question" |
| "Comment" | "Reply" |
| "Admin" | "Steward" |
| "AI disabled" | "MAIA is quiet in this field" |

The UI copy for `ai_posture: 'none'` fields:
> *MAIA is quiet here. This field belongs to the community and to [Master]'s work.*

---

## Open Questions

1. **Steward nomination** — who can become a field steward, and how? Self-selection vs. existing stewards?
2. **Works moderation** — who can add to the catalog? Any member, or stewards only?
3. **Contribution privacy** — are contributions visible to all members, or only within the field?
4. **Field creation** — is this admin-only initially, or can members propose new fields?
5. **McGilchrist's own response** — if a living master ever objects to even having a community field around their work, what's the removal path?

---

*This document is the design anchor. Implementation follows from here.*
*Last updated: 2026-03-19*
