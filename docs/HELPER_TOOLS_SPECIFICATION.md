# Helper Tools Specification
## Features for Members Helping Others

*Extracted from personal development industry, reimagined with integrity.*

---

## Philosophy

These tools exist to empower genuine peer support—not to create dependency, extract data for manipulation, or manufacture false urgency. Each feature serves the member's autonomy and their capacity to hold space for others.

**Guiding Principles:**
- Sovereignty over surveillance
- Progress over performance
- Connection over conversion
- Depth over dopamine

---

## 1. Assessment & Reflection Tools

### 1.1 Intake Reflection Forms

**What it is:** Structured questions that help someone articulate where they are and what they're seeking.

**Industry exploitation:** Used to segment users for targeted upselling, create artificial "diagnosis" that only paid programs can solve.

**Our approach:**
- User owns all responses locally by default
- No algorithmic scoring or categorization
- Optional sharing with chosen supporters
- Questions invite exploration, not extraction

**Implementation:**
```typescript
interface ReflectionForm {
  id: string;
  title: string;
  purpose: string; // "Helps you articulate..." not "We assess your..."
  sections: ReflectionSection[];
  ownershipNote: string; // Always visible: "Your responses stay with you"
}

interface ReflectionSection {
  prompt: string;
  type: 'open' | 'scale' | 'choice' | 'timeline';
  followUp?: string; // Deepening question based on response
}
```

**Example Forms:**
- "Where Am I Now?" - Life area reflection
- "What Am I Seeking?" - Intention clarification
- "What Support Feels Right?" - Support style preferences

---

### 1.2 Progress Witnessing

**What it is:** Tools for tracking and honoring growth over time.

**Industry exploitation:** Gamified streaks that create anxiety, public leaderboards that shame, badges that manufacture false achievement.

**Our approach:**
- Private by default, share by choice
- Witness growth patterns, not streaks
- No comparison to others
- Recognition of cycles (rest is valid, not "broken streak")

**Implementation:**
```typescript
interface ProgressWitness {
  memberId: string;
  domain: string; // "meditation", "journaling", "community presence"
  entries: WitnessEntry[];
  patterns: {
    rhythms: string[]; // "You tend to practice more on quiet mornings"
    themes: string[];  // "Connection appears when you journal"
  };
}

interface WitnessEntry {
  date: Date;
  present: boolean;
  reflection?: string;
  context?: string; // "traveling", "difficult week", etc.
}
```

**UI Principles:**
- Show patterns, not scores
- Honor gaps as part of the rhythm
- "You've returned" not "You broke your streak"
- Seasonal/cyclical visualizations over linear progress bars

---

### 1.3 Personal Milestone Recognition

**What it is:** Acknowledging meaningful moments in someone's journey.

**Industry exploitation:** Manufactured milestones tied to purchases, public celebrations designed to trigger FOMO.

**Our approach:**
- Self-defined milestones (user sets what matters)
- Private acknowledgment or chosen witnesses
- Depth over frequency
- No artificial urgency

**Implementation:**
```typescript
interface Milestone {
  id: string;
  memberId: string;
  title: string;
  significance: string; // Why this matters to them
  date: Date;
  witnesses?: string[]; // Member IDs who can see
  reflection?: string;
  linkedEntries?: string[]; // Journal entries, readings, etc.
}
```

---

## 2. Peer Support Features

### 2.1 Holding Space Circles

**What it is:** Small groups for mutual support and witnessing.

**Industry exploitation:** Cohort pressure to keep paying, artificial intimacy that serves the platform.

**Our approach:**
- Self-organizing, not algorithmically matched
- Clear containers (time-bounded or ongoing by choice)
- No facilitator hierarchy required
- Shared agreements, not platform rules

**Implementation:**
```typescript
interface HoldingCircle {
  id: string;
  name: string;
  intention: string;
  members: CircleMember[];
  container: {
    startDate: Date;
    endDate?: Date; // Optional - some circles are ongoing
    rhythm: 'weekly' | 'biweekly' | 'monthly' | 'as-needed';
    agreements: string[]; // Set by the circle
  };
  gatherings: Gathering[];
}

interface CircleMember {
  memberId: string;
  role: 'member' | 'anchor'; // Anchor holds logistics, not authority
  joinedAt: Date;
}

interface Gathering {
  id: string;
  date: Date;
  type: 'sync' | 'async';
  topic?: string;
  presences: string[]; // Who was there
  sharedReflection?: string; // Optional group reflection
}
```

---

### 2.2 Accountability Partnerships

**What it is:** One-on-one mutual support for intentions and practices.

**Industry exploitation:** Paid "accountability coaches" who create dependency, shame-based check-ins.

**Our approach:**
- Peer-to-peer, no hierarchy
- Mutual (both supporting each other)
- Flexible rhythm set by partners
- Compassion-based, not shame-based

**Implementation:**
```typescript
interface AccountabilityPartnership {
  id: string;
  partners: [string, string]; // Two member IDs
  intentions: {
    [memberId: string]: PartnerIntention[];
  };
  rhythm: 'daily' | 'weekly' | 'custom';
  checkIns: CheckIn[];
  agreements: string[];
}

interface PartnerIntention {
  description: string;
  why: string; // Why this matters
  supportNeeded: string; // What kind of support helps
  notHelpful?: string; // What doesn't help
}

interface CheckIn {
  date: Date;
  from: string;
  content: string;
  responseFrom?: string;
  responseContent?: string;
}
```

---

### 2.3 Support Request & Offer Board

**What it is:** A space where members can ask for and offer specific support.

**Industry exploitation:** Lead generation disguised as community, gamified "helping" for status points.

**Our approach:**
- No points or public recognition
- Clear, specific asks and offers
- Connection happens privately
- Time-bounded (requests expire, not accumulate)

**Implementation:**
```typescript
interface SupportPost {
  id: string;
  memberId: string;
  type: 'request' | 'offer';
  title: string;
  description: string;
  domain: string; // "grief", "career transition", "creative practice", etc.
  specificity: string; // "Looking for someone who has navigated..."
  expiresAt: Date; // 30 days default
  connections: Connection[]; // Private
}

interface Connection {
  fromMemberId: string;
  message: string;
  respondedAt: Date;
  status: 'pending' | 'connected' | 'declined';
}
```

---

### 2.4 Trigger-Aware Sharing

**What it is:** Content warnings and filters that protect without censoring.

**Industry exploitation:** Often absent, or used to silence difficult conversations.

**Our approach:**
- Author-applied content notes
- Reader-controlled filters
- Gradual reveal (summary first, details on choice)
- No suppression of difficult topics

**Implementation:**
```typescript
interface ContentNote {
  categories: ContentCategory[];
  authorNote?: string; // "This discusses my experience with..."
  revealLevel: 'title-only' | 'summary' | 'full';
}

type ContentCategory =
  | 'grief-loss'
  | 'health-body'
  | 'family-origin'
  | 'relationships'
  | 'trauma-general'
  | 'spiritual-crisis'
  | 'financial-stress'
  | 'other';

interface MemberContentPreferences {
  memberId: string;
  defaultReveal: 'title-only' | 'summary' | 'full';
  filteredCategories: ContentCategory[]; // Hidden by default
  trustedAuthors: string[]; // Always show full from these members
}
```

---

## 3. Learning & Practice Tools

### 3.1 Micro-Practices Library

**What it is:** Brief, accessible practices members can share with those they support.

**Industry exploitation:** Teaser content designed to upsell, gamified "unlocking" of basic practices.

**Our approach:**
- All practices available to all members
- Curated by practitioners, not algorithms
- Shareable with anyone (not platform-locked)
- Attribution to source traditions

**Implementation:**
```typescript
interface MicroPractice {
  id: string;
  title: string;
  duration: '1-min' | '5-min' | '10-min' | '15-min';
  domain: PracticeDomain;
  tradition?: string; // "Buddhist mindfulness", "Somatic", etc.
  attribution: string;
  instructions: string;
  variations?: string[];
  whenHelpful: string[]; // "When feeling anxious", "Before difficult conversations"
  shareable: boolean; // Can be shared outside platform
}

type PracticeDomain =
  | 'grounding'
  | 'breath'
  | 'movement'
  | 'reflection'
  | 'connection'
  | 'rest'
  | 'transition';
```

---

### 3.2 Reflection Prompts

**What it is:** Questions that invite deeper inquiry, shareable with others.

**Industry exploitation:** AI-generated generic prompts, prompts designed to surface pain points for sales.

**Our approach:**
- Curated by practitioners and community
- Tiered depth (entry to deep inquiry)
- Contextual (linked to life events, seasons, transits)
- Community can contribute and refine

**Implementation:**
```typescript
interface ReflectionPrompt {
  id: string;
  prompt: string;
  depth: 'surface' | 'medium' | 'deep';
  context?: PromptContext[];
  source: 'practitioner' | 'community' | 'tradition';
  attribution?: string;
  followUps?: string[]; // Deepening questions
  caution?: string; // "This may surface difficult memories"
}

type PromptContext =
  | 'new-beginning'
  | 'ending-completion'
  | 'transition'
  | 'conflict'
  | 'celebration'
  | 'grief'
  | 'saturn-return'
  | 'eclipse-season'
  | 'retrograde';
```

---

### 3.3 Practice Tracking (Private)

**What it is:** Personal log of practices engaged, patterns noticed.

**Industry exploitation:** Data mining for "personalization" (manipulation), public displays creating comparison.

**Our approach:**
- Entirely private
- Pattern recognition serves the member
- No "should" language
- Cycles honored (low periods valid)

**Implementation:**
```typescript
interface PracticeLog {
  memberId: string;
  entries: PracticeEntry[];
  patterns: {
    mostNurturing: string[]; // Practices that correlate with wellbeing
    rhythms: string[]; // "You tend to need more grounding in autumn"
    integrations: string[]; // Practices that build on each other
  };
}

interface PracticeEntry {
  date: Date;
  practiceId: string;
  duration?: number;
  context?: string; // "feeling scattered", "before big meeting"
  reflection?: string;
  felt?: 'nourishing' | 'neutral' | 'effortful' | 'not-right-now';
}
```

---

## 4. Helper Capacity Tools

### 4.1 Helper Self-Assessment

**What it is:** Tools for members to understand their capacity and boundaries.

**Industry exploitation:** Assessments that always conclude you need more training (their training).

**Our approach:**
- Self-inquiry, not diagnosis
- Explores limits as wisdom, not deficiency
- Regular check-ins on capacity
- No credentialing pressure

**Implementation:**
```typescript
interface CapacityCheckIn {
  memberId: string;
  date: Date;
  currentCapacity: 'full' | 'available' | 'limited' | 'depleted';
  domains: {
    [domain: string]: {
      capacity: 'can-hold' | 'can-witness' | 'need-distance';
      notes?: string;
    };
  };
  selfCare: string[]; // What would replenish
  boundaries: string[]; // What to protect right now
}
```

---

### 4.2 Resource Library (Curated)

**What it is:** Vetted resources for helpers to share with those they support.

**Industry exploitation:** Affiliate links, sponsored content disguised as recommendations.

**Our approach:**
- Practitioner-curated
- No affiliate relationships
- Includes free resources prominently
- Clear about what requires payment
- Community can contribute and flag

**Implementation:**
```typescript
interface Resource {
  id: string;
  title: string;
  type: 'book' | 'article' | 'video' | 'course' | 'practitioner' | 'service';
  domain: string[];
  description: string;
  curatedBy: string; // Practitioner or community member
  cost: 'free' | 'paid' | 'sliding-scale' | 'insurance';
  accessibility: string[]; // "audio available", "spanish", etc.
  caution?: string; // Any concerns about this resource
  communityNotes?: string[]; // Member experiences
}
```

---

### 4.3 Supervision & Consultation

**What it is:** Structured support for members in helper roles.

**Industry exploitation:** Mandatory paid supervision that creates dependency.

**Our approach:**
- Peer consultation circles (free)
- Practitioner consultation (available, not required)
- Clear scope: peer support is not therapy
- When to refer is honored, not shamed

**Implementation:**
```typescript
interface ConsultationRequest {
  memberId: string;
  type: 'peer' | 'practitioner';
  situation: string; // Anonymized description
  question: string; // What guidance seeking
  urgency: 'reflective' | 'timely' | 'urgent';
  anonymous: boolean;
}

interface ConsultationCircle {
  id: string;
  type: 'peer' | 'practitioner-led';
  rhythm: string;
  focus?: string; // "grief support", "general", etc.
  members: string[];
  guidelines: string[];
}
```

---

## 5. Safety & Boundaries

### 5.1 Crisis Recognition & Referral

**What it is:** Clear guidance on recognizing when professional help is needed.

**Industry exploitation:** Often absent or buried to keep users on platform.

**Our approach:**
- Prominent, not hidden
- Clear indicators that suggest professional support
- Local resources integration
- No shame in referring

**Implementation:**
```typescript
interface CrisisGuidance {
  indicators: {
    category: string;
    signs: string[];
    response: 'hold-space' | 'encourage-professional' | 'immediate-resources';
  }[];
  localResources: LocalResource[];
  languageGuide: {
    helpful: string[];
    avoid: string[];
  };
}

interface LocalResource {
  name: string;
  type: 'crisis-line' | 'service' | 'professional';
  contact: string;
  availability: string;
  cost: string;
  region?: string;
}
```

---

### 5.2 Boundary Templates

**What it is:** Pre-crafted language for setting and maintaining boundaries.

**Industry exploitation:** Rarely provided; platforms benefit from over-giving.

**Our approach:**
- Normalize boundary-setting
- Provide language that is kind AND clear
- Regular boundary check-ins
- Model in community guidelines

**Templates:**
- "I'm honored you shared this with me. This feels beyond what I can hold well. Can I help you find someone with more expertise?"
- "I need to step back from this conversation right now. I care about you and want to return when I have more capacity."
- "I notice I'm feeling overwhelmed. I need to pause here."

---

## Implementation Priority

### Phase 1: Foundation
1. Reflection Forms (intake + ongoing)
2. Holding Space Circles infrastructure
3. Crisis Recognition & Referral (safety first)
4. Micro-Practices Library

### Phase 2: Connection
5. Support Request & Offer Board
6. Accountability Partnerships
7. Trigger-Aware Sharing
8. Boundary Templates

### Phase 3: Depth
9. Progress Witnessing
10. Practice Tracking
11. Helper Self-Assessment
12. Consultation Circles

### Phase 4: Scale
13. Resource Library (curated)
14. Personal Milestone Recognition
15. Reflection Prompts (community-contributed)
16. Supervision structures

---

## Integration with Existing Features

| Existing Feature | Helper Tool Integration |
|-----------------|------------------------|
| Journal | Reflection Forms, Practice Tracking, Progress Witnessing |
| Oracle | Reflection Prompts (contextual), Practice suggestions |
| Community Commons | Holding Circles, Support Board, Trigger-Aware Sharing |
| Astrology | Progress Witnessing (cycle-aware), Contextual prompts |
| Membership Tiers | Consultation access, Circle anchoring capacity |

---

## Metrics That Matter

**Track:**
- Circles formed and sustained
- Resources shared (not clicked)
- Time to referral when needed
- Member-reported sense of support

**Don't track:**
- Engagement streaks
- Help "given" (gamification)
- Public recognition of helpers
- Time on platform

---

*Last updated: January 2026*
