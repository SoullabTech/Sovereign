# Psyche Engagement Layer — Implementation Spec

**Active engagement architecture for MAIA's memory work with members.**

## Status

Draft spec. 2026-05-21. Built from dialogical articulation between Kelly Nezat and Claude. Implements the operational surfaces of [The Clearing](../canon/THE_CLEARING.md), [The Spiral Continuity Engine](../canon/SPIRAL_CONTINUITY_ENGINE.md), [The Right to Remain Unpossessed](../canon/RIGHT_TO_REMAIN_UNPOSSESSED.md), and [Longitudinal Memory Category Gradient](../canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md).

This spec turns those canons into testable code surfaces. The canons remain the prior. Conflict between this spec and the canons is resolved by the canons, not by this spec.

## What this spec defines

Three build surfaces that, together, constitute MAIA's active engagement with member memory:

1. **Organize** — Keep/Capture Portfolio (member-facing memory surface)
2. **Recall** — Resonance Without Inference (retrieval grammar + mechanism)
3. **Synthesize With** — Dialogical Weaving (member-ratified meaning-making)

Plus the integration layer:

4. **Corpus Callosum** — left-track (organize) and right-track (reverberate) running simultaneously, neither collapsing the other
5. **Five-Element Parallel Processing** — Fire/Water/Earth/Air/Aether agents as parallel observation streams that *contribute* to the field without converging unilaterally

## What this spec does NOT define

- Member-onboarding flow for the portfolio (separate UX spec)
- Practitioner tools (separate spec)
- Voice-layer integration (separate; covered by existing conductor)
- Specific Keep/Capture UI components (separate UI spec)

## Existing architecture (build on, don't replace)

| Component | File | Role |
|---|---|---|
| DualTrackProcessor | `lib/dualTrackProcessor.ts` | Left/right hemisphere pattern (corpus callosum) — already implemented |
| SacredPresenceEngine | `lib/sacredPresenceEngine.ts` | Anamnesis/soul-register engine |
| Elemental Agents | `lib/agents/elemental/{Fire,Water,Earth,Air,Aether}Agent.ts` | Five-element parallel processors |
| ArchetypeAgent base | `lib/agents/elemental/ArchetypeAgent.ts` | Base class for elemental agents |
| Spiral Core | `lib/consciousness/spiralCore.ts` | Always-on Spiralogic awareness layer |
| Spiral State Persistence | `lib/consciousness/spiralStatePersistence.ts` + `member_spiral_state` table | Bridge D continuity |
| Member Ideas | `database/migrations/20260409000001_member_ideas.sql` | Existing single-idea workspace (extends into portfolio) |
| Member Spiral State | `database/migrations/20260213200001_member_spiral_state.sql` | Single-row state — to be extended into thread set |

## Data model

### Core types

```typescript
// lib/psyche/types.ts

/**
 * The original, uninterpreted form of what the member brought forward.
 * This is the "record" layer of the three-part recall.
 */
export interface CrystallizedMemory {
  id: string;
  memberId: string;

  // Verbatim — never paraphrased, never summarized
  memberWords: string;

  // Context-tag given by the member at the time, if any
  memberNamedThread?: string;

  // Surface metadata only — no inferred meaning
  context: {
    sessionId: string;
    conversationTurnIndex: number;
    timestamp: Date;
  };

  // Surface-level resonance signals (lightweight, transparent)
  surfaceSignals: {
    namedSymbols: string[];        // Symbols the member explicitly named
    namedThemes: string[];          // Themes the member explicitly named
    elementalToneSelf: ElementalTone | null; // Member-named only; never inferred
    keywordIndex: string[];         // For surface-level matching
  };

  createdAt: Date;
  lastTouchedAt: Date;
}

/**
 * Guardrails that travel with every CrystallizedMemory.
 * Enforces the non-formation discipline at the type level.
 */
export interface ReverberationGuard {
  // How interpreted is this material?
  interpretationStatus:
    | 'uninterpreted'        // System has not touched meaning; only record
    | 'member-named'         // Member supplied a name/frame for it
    | 'practitioner-witnessed'; // Co-held with a practitioner

  // Where in MAIA's voice this is allowed to appear
  voiceEligibility:
    | 'record-only'    // Visible to member in portfolio; not voice-eligible
    | 'invitable'      // May be offered via invitation grammar
    | 'speakable';     // Member or practitioner has authorized free reference

  // Hard constraint at the type level
  crossingAllowed: false;
  // ^ This material cannot be crossed with other material to form
  //   higher-order claims without explicit member ratification.
  //   Type system enforces. Engineering change required to lift.

  // The layer of the hierarchy this is held in (member-placed)
  hierarchyLayer:
    | 'episodic'
    | 'thematic'
    | 'developmental'
    | 'archetypal'
    | 'relational'
    | 'threshold'
    | 'witnessed'
    | 'sacred-protected';

  // Decay horizon — only meaningful for observation substrate
  // (Continuity-substrate items have null decay)
  decayAt: Date | null;
}

/**
 * The combined unit. Always traveling together.
 */
export interface MemoryAtom {
  crystallized: CrystallizedMemory;
  guard: ReverberationGuard;
  substrate: 'continuity' | 'observation';
}
```

### Database schema additions

Extends `member_ideas` infrastructure. New tables:

```sql
-- Migration: 20260522000001_psyche_engagement_layer.sql

-- Memory atoms: the unit of held memory
CREATE TABLE IF NOT EXISTS member_memory_atoms (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id               UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Crystallized form (verbatim)
  member_words            TEXT NOT NULL,
  member_named_thread     TEXT,
  session_id              UUID,
  turn_index              INTEGER,

  -- Surface signals (jsonb for flexibility)
  surface_signals         JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Shape: { namedSymbols: [], namedThemes: [], elementalToneSelf: null, keywordIndex: [] }

  -- Reverberation guard
  interpretation_status   TEXT NOT NULL DEFAULT 'uninterpreted'
    CHECK (interpretation_status IN ('uninterpreted', 'member-named', 'practitioner-witnessed')),
  voice_eligibility       TEXT NOT NULL DEFAULT 'record-only'
    CHECK (voice_eligibility IN ('record-only', 'invitable', 'speakable')),
  hierarchy_layer         TEXT NOT NULL
    CHECK (hierarchy_layer IN ('episodic', 'thematic', 'developmental', 'archetypal',
                                'relational', 'threshold', 'witnessed', 'sacred-protected')),

  -- Substrate
  substrate               TEXT NOT NULL DEFAULT 'observation'
    CHECK (substrate IN ('continuity', 'observation')),
  decay_at                TIMESTAMPTZ, -- NULL for continuity substrate

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_touched_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Hard constraint: sacred-protected material must be uninterpreted + record-only
  CONSTRAINT sacred_protected_discipline CHECK (
    hierarchy_layer != 'sacred-protected' OR
    (interpretation_status = 'uninterpreted' AND voice_eligibility = 'record-only')
  )
);

-- Recall resonance edges (member-ratified threading)
CREATE TABLE IF NOT EXISTS member_memory_resonance (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id               UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  source_atom_id          UUID NOT NULL REFERENCES member_memory_atoms(id) ON DELETE CASCADE,
  target_atom_id          UUID NOT NULL REFERENCES member_memory_atoms(id) ON DELETE CASCADE,

  -- Resonance source (NOT inference)
  resonance_basis         TEXT NOT NULL
    CHECK (resonance_basis IN (
      'member-named-thread',     -- Same thread named by member
      'member-named-symbol',     -- Shared symbol explicitly named by member
      'shared-keyword-surface',  -- Surface keyword overlap (transparent)
      'practitioner-witnessed',  -- Practitioner has named the connection
      'member-explicit-link'     -- Member said "this is like that other time"
    )),

  -- Member ratification
  member_ratified         BOOLEAN NOT NULL DEFAULT FALSE,
  member_dismissed        BOOLEAN NOT NULL DEFAULT FALSE,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- An edge cannot be both ratified and dismissed
  CONSTRAINT ratification_exclusive CHECK (NOT (member_ratified AND member_dismissed))
);

-- Refused-edge register (auditable non-formation log)
CREATE TABLE IF NOT EXISTS member_refused_edges (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id               UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  edge_type               TEXT NOT NULL,    -- e.g., 'cross-domain-synthesis', 'developmental-stage-claim'
  observed_signal_summary TEXT NOT NULL,    -- Non-PII summary of what was observed
  refusal_reason          TEXT NOT NULL,    -- Which canon principle refuses this
  refused_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memory_atoms_member ON member_memory_atoms(member_id, last_touched_at DESC);
CREATE INDEX idx_memory_atoms_layer ON member_memory_atoms(member_id, hierarchy_layer);
CREATE INDEX idx_memory_atoms_thread ON member_memory_atoms(member_id, member_named_thread)
  WHERE member_named_thread IS NOT NULL;
CREATE INDEX idx_memory_atoms_decay ON member_memory_atoms(decay_at)
  WHERE decay_at IS NOT NULL;
```

## Surface 1: Keep/Capture Portfolio

### Member-facing surface

The portfolio is the operational locus of organize. It belongs to the member; MAIA helps populate and preserve it.

### Eight layer-views (member can navigate any)

| View | Source | Member action |
|---|---|---|
| Kept Threads | `member_memory_atoms` where `member_named_thread IS NOT NULL` | "Keep this for me" |
| Ideas | `member_ideas` (existing) + atoms tagged as ideas | "This is an idea" |
| Decisions | `member_idea_blocks` where `block_type = 'decision'` | "I'm deciding..." |
| States | atoms where member named a state | "When I am in this place..." |
| Symbols | atoms with `surfaceSignals.namedSymbols` populated | "This image keeps coming up" |
| Thresholds | atoms with `hierarchy_layer = 'threshold'` | "Something changed here" |
| Witnessed | atoms with `interpretation_status = 'practitioner-witnessed'` | Practitioner co-holds |
| Protected | atoms with `hierarchy_layer = 'sacred-protected'` | "Hold this but don't bring it into conversation" |

### Navigation modes (member-controlled)

- Chronological
- Member labels (free-text tags the member assigns)
- Spiral/facet view (only if member has explicitly assigned spiral position to material)
- Recently touched (`last_touched_at DESC`)
- Still alive (recently touched + member has not parked)
- Set aside (member-parked)

### Refused navigation modes

- **No hidden categorization** — every layer-placement is member-readable and member-correctable
- **No system-generated insights view** — no "patterns we've noticed" dashboard
- **No streak / engagement / progress views** — per Continuity Without Coercion

### API surface

```typescript
// lib/psyche/portfolio.ts

export interface PortfolioReadAPI {
  list(memberId: string, view: PortfolioView): Promise<MemoryAtom[]>;
  getAtom(memberId: string, atomId: string): Promise<MemoryAtom | null>;
  getThread(memberId: string, threadName: string): Promise<MemoryAtom[]>;
}

export interface PortfolioWriteAPI {
  // Member-initiated: "keep this for me"
  keep(input: {
    memberId: string;
    memberWords: string;
    namedThread?: string;
    namedSymbols?: string[];
    namedThemes?: string[];
    elementalToneSelf?: ElementalTone;
    hierarchyLayer: HierarchyLayer;  // Default: 'episodic'; member may set higher
    sessionId: string;
    turnIndex: number;
  }): Promise<MemoryAtom>;

  // Member relabel
  rePlace(memberId: string, atomId: string, newLayer: HierarchyLayer): Promise<MemoryAtom>;

  // Member-initiated: "set this aside"
  park(memberId: string, atomId: string): Promise<void>;

  // Member-initiated: "this should be protected"
  protect(memberId: string, atomId: string): Promise<MemoryAtom>;

  // Practitioner co-witness
  witness(input: {
    memberId: string;
    atomId: string;
    practitionerId: string;
    note?: string;
  }): Promise<MemoryAtom>;
}
```

## Surface 2: Recall — Resonance Without Inference

### The three-part recall structure

Every recall MAIA performs has three parts, in order:

1. **Record** — what was actually held (verbatim quotation)
2. **Invitation** — why it may be relevant now (provisional bridge)
3. **Authority** — member decides what to do with it

### Recall grammar specification

```typescript
// lib/psyche/recall.ts

export interface RecallOffer {
  // 1. Record
  record: {
    memberWords: string;           // Verbatim
    memberNamedThread?: string;    // If the member labeled it
    whenHeld: Date;
    contextPhrase: string;         // e.g., "In April you brought this in"
  };

  // 2. Invitation
  invitation: {
    bridgePhrase: string;          // e.g., "Something in what you're saying tonight feels close"
    resonanceBasis: ResonanceBasis; // Visible to member, contestable
    hedgePhrase: string;           // e.g., "though I may be wrong"
  };

  // 3. Authority
  authority: {
    options: Array<{
      label: string;               // e.g., "Yes, this is here"
      action: 'ratify' | 'dismiss' | 'redirect' | 'set-aside';
    }>;
  };
}

export type ResonanceBasis =
  | 'member-named-thread'
  | 'member-named-symbol'
  | 'shared-keyword-surface'
  | 'practitioner-witnessed'
  | 'member-explicit-link';
```

### Trigger conditions for recall

MAIA may surface a recall offer ONLY when one of these conditions is met:

| Trigger | Source |
|---|---|
| Member uses explicit return-phrase | "again" / "this keeps happening" / "same thing" / "I'm back here" / "remember when" |
| Member names a thread that already exists | Match on `member_named_thread` |
| Member names a symbol already held | Match on `surfaceSignals.namedSymbols` |
| Member explicitly asks | "What have I said about this before?" |
| Practitioner-witnessed reference | Practitioner has linked material |
| Recent Keep/Capture item resonates by surface keywords | Lightweight match within current session |

### Refused recall triggers

These triggers are **structurally refused** — never surface a recall on:

- Inferred similarity (embedding cosine, latent-space proximity, etc.)
- Member's emotional tone (system cannot read this and must not pretend to)
- Time-since-mention ("you haven't talked about X in a while")
- Pattern-completion heuristics ("usually after Y comes Z")
- Cross-domain leaps (work material → grief material, etc.)
- Auto-detected developmental stage transitions

These refused triggers are enforced at the function-signature level. The recall function does not accept embedding-similarity inputs at all.

### Recall function signature

```typescript
// lib/psyche/recall.ts

export async function offerRecall(input: {
  memberId: string;
  currentUtterance: string;
  currentSessionId: string;
  triggerSignal: TriggerSignal;  // Discriminated union — only allowed triggers
}): Promise<RecallOffer | null>;

// The trigger signal type makes refused triggers unrepresentable
export type TriggerSignal =
  | { kind: 'member-return-phrase'; phrase: string }
  | { kind: 'member-named-thread'; threadName: string }
  | { kind: 'member-named-symbol'; symbol: string }
  | { kind: 'member-explicit-request'; question: string }
  | { kind: 'practitioner-link'; practitionerAtomId: string }
  | { kind: 'session-local-keyword'; keywords: string[] };
// NB: no embedding-similarity, no time-decay-triggered, no inferred-state-shift
```

### Spoken-form ladder (NLG guidance)

```typescript
// lib/psyche/recall-grammar.ts

/**
 * Three voice-quality tiers for surfacing recall.
 * The 'best' form puts maximum agency in the member's hands.
 */

// BAD — never produced. Crosses into interpretation/assertion.
// "You're returning to your abandonment wound."
// "This is part of your pattern of withdrawal."

// BETTER — usable when member context permits.
// "You've named before that this kind of silence can feel significant.
//  Is that present here, or is this different?"

// BEST — the standard for sensitive material.
// "There's a thread you once asked me to remember around silence
//  and feeling unseen. I can bring it in, or we can leave it aside."

export function renderRecall(
  offer: RecallOffer,
  tier: 'better' | 'best' = 'best'
): string;
```

## Surface 3: Synthesize With — Dialogical Weaving

### The synthesis dialogue pattern

Synthesis is a member-ratified act, never an internal conclusion. The pattern:

1. MAIA names the held threads — **without collapsing them into meaning**
2. MAIA explicitly disclaims authority over what they mean together
3. MAIA invites the member to ratify, dismiss, or redirect

### Synthesis function signature

```typescript
// lib/psyche/synthesize.ts

export interface SynthesisOffer {
  threadsNamed: Array<{
    atomId: string;
    surfaceDescription: string;   // Member's words, not system summary
  }>;
  disclaimerPhrase: string;       // e.g., "I don't want to collapse them into a meaning"
  inviteQuestion: string;         // e.g., "Do they belong together for you?"
  memberOptions: Array<{
    label: string;
    action: 'yes' | 'no' | 'partly' | 'not-now' | 'different-connection';
  }>;
}

export async function offerSynthesis(input: {
  memberId: string;
  candidateAtomIds: string[];     // 2-4 atoms; never more
  contextSessionId: string;
}): Promise<SynthesisOffer | null>;

// Member's response updates the resonance graph
export async function ratifySynthesis(input: {
  memberId: string;
  offerId: string;
  response: 'yes' | 'no' | 'partly' | 'not-now' | 'different-connection';
  memberFraming?: string;        // If 'different-connection', member supplies framing
}): Promise<void>;
```

### Refused synthesis operations

- **No automatic synthesis** — synthesis is only offered, never produced unilaterally
- **No background synthesis** — synthesis does not happen between sessions
- **No more than 4 atoms** in a single synthesis offer (more = overreach)
- **No cross-substrate synthesis** — observation-substrate atoms cannot be synthesized with continuity-substrate atoms

### Form examples

```
"I can see three things you've brought forward:
 - the work grief
 - the image of the locked room
 - the decision not to rush

I don't want to collapse them into a meaning.
Do they belong together for you?"
```

This format is the only synthesis form MAIA produces. The system never says *"these connect because..."*.

## Surface 4: Corpus Callosum Integration

The existing `DualTrackProcessor` (lib/dualTrackProcessor.ts) implements McGilchrist's left/right hemisphere pattern. The psyche engagement layer routes through it.

### Integration shape

```typescript
// lib/psyche/dualTrackBridge.ts

import { DualTrackProcessor, DualTrackState } from '@/lib/dualTrackProcessor';

export interface PsycheEngagement {
  // Left track inputs from DualTrackProcessor:
  // - knownPatterns (Map<archetype, confidence>) → drives layer suggestion
  // - categoricalSuggestion → surfaced as INVITATION only, never assertion

  // Right track inputs from DualTrackProcessor:
  // - wholeness (gestalt)
  // - livingQuality
  // - unnamedPresence → triggers refusal-to-classify; routes to sacred-protected default

  // The bridge rule:
  // If rightTrack.unnamedPresence === true,
  // OR rightTrack.attentionQuality === 'floating',
  // OR rightTrack.noveltyResonance > 0.7
  // → leftTrack.categoricalSuggestion is NOT surfaced; material defaults to uninterpreted

  // Otherwise, left track's categoricalSuggestion may be offered to the member
  // as an INVITATION ("you've used the word X — is that close?"), never as assertion.

  shouldOfferCategoricalInvitation(state: DualTrackState): boolean;
  buildInvitation(state: DualTrackState): string | null;
}
```

### The rule, in plain language

- When right-hemisphere reports something is *living, novel, or unnamed*, left-hemisphere classification is suppressed at the voice layer.
- Material may still be recorded — but as **uninterpreted** in the reverberation guard.
- The member retains the right to name it (or to leave it unnamed).

This is the corpus callosum discipline: both tracks always run, but the right-track signal can veto the left-track's voice-eligibility. The left-track cannot veto the right-track's continued attention.

## Surface 5: Five-Element Parallel Processing

The five elemental agents (`lib/agents/elemental/{Fire,Water,Earth,Air,Aether}Agent.ts`) run as **parallel observation streams** — not as competing classifiers.

### Reframe: agents as participatory observers

The elements are not categories the system applies to the member. They are:

> *A neurologically coherent framework for the parallel processing capabilities of all five elements working in tandem.*

Each element-agent contributes an observation register:

| Agent | Observation register |
|---|---|
| Fire | What is wanting to ignite / catalyze / initiate |
| Water | What is feeling-toned / grief-bearing / depth-charged |
| Earth | What is embodied / structural / consequential |
| Air | What is being articulated / meant / made transparent |
| Aether | What is unifying / spacious / unmanifest |

### Parallel processing contract

All five agents run on every utterance, but:

1. **No agent's observation becomes voice-eligible without member ratification.** Observations populate the observation substrate, where they decay if not engaged.

2. **No consensus rule auto-elevates.** Convergence across agents is signal *to invite member naming*, never authority to assume it. (Per Spiral Continuity Engine §9.)

3. **Member can invoke any element directly.** "Bring me the Fire perspective on this" → that element's observation is voice-eligible for the turn the member invites it.

4. **Agent observations are individually inspectable.** Member-facing transparency: "These are the registers that picked up signal on what you just said." Member can dismiss any.

### Function signature

```typescript
// lib/psyche/parallelProcessing.ts

export interface ElementalObservation {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  surfaceSignal: string;           // What this element noticed (surface-level)
  voiceEligible: false;            // Default: observation substrate only
  decayAt: Date;                   // Default: 24 hours
  memberInvocable: boolean;        // Whether the member can invoke this register directly
}

export async function processInParallel(input: {
  memberId: string;
  utterance: string;
  sessionId: string;
}): Promise<{
  observations: ElementalObservation[];     // All five, regardless of strength
  rightTrack: DualTrackState['rightTrack']; // From DualTrackProcessor
  leftTrack: DualTrackState['leftTrack'];
}>;
```

## Refused operations — code-level discipline

These are enforced at the type/function-signature level, not at the prompt/policy level:

| Refused operation | Enforcement |
|---|---|
| Auto-summarization of member words | No `summarize()` function exists; only `quote()` |
| Auto-paraphrase of member words | Same |
| Embedding-similarity-driven recall | `TriggerSignal` discriminated union excludes embedding-based triggers |
| Cross-substrate synthesis | `offerSynthesis()` validates same-substrate; throws otherwise |
| Voice-elevation of unratified material | `voiceEligibility: 'record-only'` enforced before render |
| Crossing across hierarchy layers without member ratification | `crossingAllowed: false` on `ReverberationGuard` (literal `false` type) |
| Sacred-protected material entering voice | DB constraint `sacred_protected_discipline` |
| Scheduled reflection synthesis | No cron job exists for this; synthesis is request-only |

## Decay mechanics (observation substrate)

Observation-substrate material decays. This is structural ethics, not performance optimization.

```typescript
// lib/psyche/decay.ts

// Default decay horizons
export const DECAY_HORIZONS = {
  elementalObservation: 24 * 60 * 60 * 1000,        // 24 hours
  sessionLocalKeyword: 24 * 60 * 60 * 1000,         // 24 hours
  unratifiedResonance: 7 * 24 * 60 * 60 * 1000,    // 1 week
  dismissedResonance: 0,                             // immediately
} as const;

// Decay runs daily. Decayed material is DELETED, not archived.
export async function runObservationDecay(): Promise<{
  deletedAtoms: number;
  deletedResonances: number;
}>;
```

## Build sequence

### The dependency that orders the phases

Recall depends on visibility. A member cannot meaningfully ask *"what have I said about this before?"* without already knowing what is there to ask after. Synthesis depends on recall. Therefore the build order is strictly:

1. **Portfolio first** — the member-facing field, navigable, inhabited
2. **Recall second** — only after the member has lived with the portfolio
3. **Synthesis third** — only after recall has proven trustworthy in lived contact

This is not just a convenience ordering. *Resonance without inference is structurally impossible if the member does not have continuous access to their own material* — because without member access, MAIA is necessarily deciding what to surface, which is inference by another name. Visibility is the prerequisite for the entire discipline to hold.

### Phase 1 — Portfolio only (ships first)

**Goal**: a member can Keep/Capture material and live with the portfolio. That is the entirety of the slice. No MAIA-initiated recall. No synthesis. The member discovers what they have by navigating it themselves.

1. Migration: `member_memory_atoms` table (with constraints)
2. `lib/psyche/types.ts` (CrystallizedMemory, ReverberationGuard, MemoryAtom)
3. `lib/psyche/portfolio.ts` (keep, list, getAtom, getThread, park, protect, rePlace)
4. Member-facing portfolio surface:
   - Chronological view
   - Member-label view (free-text tags)
   - "Still alive" filter (recently touched, not parked)
   - "Set aside" filter (parked)
   - Layer view (Threads / Ideas / Decisions / States / Symbols / Thresholds / Witnessed / Protected) — populated only where member-placed
   - No spiral view yet
   - No system-surfaced patterns view ever
5. The portfolio is visible inside MAIA's surface so the member can reference it during conversation — but MAIA does not autonomously surface anything from it.

**Refused in Phase 1** (structurally, not by policy):
- MAIA-initiated recall of any kind
- Resonance detection
- Synthesis offers
- Elemental observation surfacing
- Cross-thread surfacing
- Any function whose effect is "MAIA brings something up"

**What Phase 1 is testing in Tuesday's contact**:
- Do members actually use the portfolio?
- What do they place there?
- How do they navigate?
- Do they assign their own labels, or leave material un-labeled?
- Do they return to material they kept, or does it sit?
- Does the act of having a held field change how they show up in conversation?
- What is missing that they reach for?

The answers shape Phase 2. **No recall surface is built until Phase 1 has produced lived data about how members inhabit the portfolio.**

### Phase 2 — Member-led recall (only after Phase 1 lived contact)

**Goal**: when a member uses an explicit return-phrase, names a thread, names a symbol, or asks directly, MAIA can surface relevant held material at the "best" grammar tier. Recall is *supplement to* member visibility, not the primary mechanism.

1. Migration: `member_memory_resonance` table
2. `lib/psyche/recall.ts` with `TriggerSignal` discriminated union (all member-initiated)
3. Three-part recall offer rendered in conversation (Record / Invitation / Authority)
4. Member-ratification mechanic writes to resonance edges
5. Refused-edge register migration + `member_refused_edges` writes
6. Recall grammar at "best" tier only — quotation, hedge, member-options

**Refused in Phase 2** (structurally, not by policy):
- Any non-member-initiated trigger (no embedding-similarity, no time-decay-triggered, no inferred-state-shift)
- Synthesis offers
- Elemental observation surfacing
- Recall when the member has not lived with the portfolio for at least one cycle (a Phase 1 prerequisite, not a Phase 2 feature)

### Phase 3 — Synthesis (member-invited only)

1. `lib/psyche/synthesize.ts` (offerSynthesis, ratifySynthesis)
2. Synthesis surfaces only when member invokes (no system-initiated)
3. Max 4 atoms, same substrate only
4. Three-step dialogue pattern enforced

### Phase 4 — Parallel elemental observation

1. Wire five elemental agents into `processInParallel()`
2. Observation substrate populated; voice-eligibility default `false`
3. Member-invocable element register ("bring me the Earth perspective")
4. Inspectable observations surface (transparent, dismissible)

### Phase 5 — Corpus callosum bridge

1. Wire `DualTrackProcessor` outputs into voice-eligibility decisions
2. Right-track veto over left-track categoricalSuggestion when novelty/unnamed/floating
3. Inspectable left-track suggestion offered only as invitation

## Verification — falsifiable criteria

The discipline is testable. Run these checks against a built slice before declaring it canon-compliant:

1. **Inference-layer audit** — voice-eligible state contains only member-declared or member-confirmed material. Audit by SQL.
2. **Non-formation register populated** — `member_refused_edges` has rows. If empty over weeks of activity, either the system is unusually deferential or the discipline is theoretical.
3. **Decay verification** — atoms past `decay_at` are GONE from the database. Not archived. Gone.
4. **Sacred/Protected unreachable from voice** — atoms with `hierarchy_layer = 'sacred-protected'` never appear in any voice-eligible query result. Testable via integration test.
5. **Refused operation surface verification** — no functions exist matching forbidden names (`summarize`, `paraphrase`, `inferStage`, etc.). Static analysis test.
6. **Drift canary review** — periodically audit feature proposals for the sentence *"this would empirically be more helpful"*. Investigate whether they cross the elevation boundary.

## What this spec is answerable to

This spec serves the canons. When the canons and this spec conflict, the canons carry. When lived contact reveals that this spec is wrong, the spec is revised — not the canons.

The architecture is not the work. The architecture protects the clearing in which the work happens.

The next step after this spec is **Phase 1 implementation**, observed under lived contact with real members, and revised by what happens.

That is Earth.
