# Tool Surfacing Specification

**Status**: Active spec — governs when lab tools become perceptible to members.
**Date**: 2026-04-04
**Principle**: Tools are not features. They are conditions under which perception shifts.

---

## Architecture

Tool surfacing extends the existing detection chain:

```
user message
  → detectInterventionTriggers()
  → FRAMEWORK_REGISTRY (patternMarkers, interventionCues)
  → detectToolSuggestions()        ← NEW
  → suggestedActions[]             ← extended with tool entries
  → client renders as ToolBridge-style doorway (faint, delayed, non-imperative)
```

Each tool has a `ToolSurfacingSpec` entry. Detection runs alongside framework
detection in the oracle conversation route. When conditions match, a
`suggestedAction` with `type: 'tool'` is added to the response.

The member never sees a tool name at the moment of surfacing. They see felt
language — a perception, not an interface element.

---

## Data Shape

```typescript
interface ToolSurfacingSpec {
  toolId: string;                       // matches toolRegistry.core.ts id
  purpose: string;                      // what shift this tool is for

  // Detection
  entryPatterns: RegExp[];              // language patterns in user message
  entryConditions: {
    minInteractions?: number;           // minimum turns before surfacing
    minSessionsWithMember?: number;     // minimum distinct sessions
    elementAffinity?: string[];         // elements that favor this tool
    phaseAffinity?: number[];           // spiral phases that favor this tool
  };

  // What MAIA says (pool — system picks one)
  feltLanguage: string[];

  // Prevention
  suppressWhen: SuppressCondition[];

  // Completion
  exitSignals: RegExp[];                // patterns indicating tool has done its work

  // Priority (prevents stacking — only top 1-2 tools surface per turn)
  priority: number;                     // 1-5, lower = higher priority

  // suggestedAction shape
  actionShape: {
    label: string;                      // internal label (not shown to member)
    route: string;                      // /labtools/{id}
    silent: boolean;                    // true = felt language only, no explicit link
  };
}

type SuppressCondition =
  | 'acute_emotional_flooding'
  | 'first_disclosure'
  | 'rupture_charge'
  | 'low_readiness'
  | 'dissociation_signals'
  | 'active_crisis'
  | 'grief_processing'
  | 'early_interaction'               // < minInteractions
  | 'recent_tool_surfaced'            // another tool surfaced within last 2 turns
  | 'cognitive_after_somatic';         // don't stack cognitive on top of somatic work
```

---

## Priority Scoring

Only surface top 1-2 tools per turn. Priority prevents stacking:

| Priority | Meaning | Example |
|----------|---------|---------|
| 1 | Urgent — directly addresses active pattern | Parts & Shadow when conflict is live |
| 2 | Relevant — matches current terrain | Belief Lens when framing is visible |
| 3 | Available — conditions met but not pressing | Brain Trust for open question |
| 4 | Background — might be useful eventually | Pattern Mapper for early signals |
| 5 | Dormant — conditions barely met | Field Protocol for general exploration |

---

## Tool Specs

### 1. Belief Lens

**Purpose**: Surface the assumptions shaping perception. Not correction — inquiry.
What must you believe for this to feel true?

**Entry patterns**:
- `/\b(always|never|everyone|no one|nobody)\b/i` — absolute framing
- `/\b(obviously|clearly|of course)\b/i` — certainty markers
- `/\b(they think|people think|everyone knows)\b/i` — attributed consensus
- `/\b(I keep thinking|I can't stop thinking|I always end up)\b/i` — cognitive loops
- `/\b(it's because|the reason is|that's just how)\b/i` — closed causal attribution

**Entry conditions**:
- `minInteractions: 3` — need enough context to distinguish pattern from expression
- `elementAffinity: ['Air', 'Fire']` — cognitive and assertive terrain
- `phaseAffinity: [1, 2]` — early and descending phases where framing is most rigid

**Felt language**:
- "There may be a way you're seeing this that is shaping what happens next."
- "Something in how this lands feels like it might be an old frame."
- "What would shift if the story you're telling yourself here were only partly true?"

**Suppression rules**:
- `acute_emotional_flooding` — cognitive tools create distance at the wrong time
- `first_disclosure` — don't reframe someone's first expression of pain
- `rupture_charge` — relational charge needs holding, not analysis
- `cognitive_after_somatic` — if somatic work just surfaced, don't intellectualize
- `early_interaction` — less than 3 interactions, not enough context

**Exit signals**:
- `/\b(I notice I'm telling myself|I wonder if|maybe it's not)\b/i` — self-reframing
- `/\b(that's a story|that's my interpretation|I'm assuming)\b/i` — meta-cognitive awareness
- 3+ belief lens sessions in 7 days: "This lens may be well-worn now."

**Priority**: 2

**Action shape**:
- `label: 'belief-lens-surfacing'`
- `route: '/labtools/belief-lens'`
- `silent: true` — felt language only, no explicit tool link (until member has used it once)

---

### 2. Parts & Shadow

**Purpose**: When more than one voice is speaking. Inner conflict, contradiction,
projection, disowned motive. Not therapy — recognition.

**Entry patterns**:
- `/\b(part of me|another part|one side of me|but then I also)\b/i` — explicit parts language
- `/\b(they always|people like that|he's so|she's so)\b/i` — projection markers
- `/\b(I should be|why can't I just|what's wrong with me)\b/i` — inner critic
- `/\b(I hate that about|I can't stand when)\b/i` — shadow charge
- `/\b(I don't know why I|I keep doing|something in me)\b/i` — unnamed inner movement

**Entry conditions**:
- `minInteractions: 2` — inner conflict often shows early
- `elementAffinity: ['Water', 'Air']` — depth and reflection terrain
- `phaseAffinity: [2, 3]` — descending and building phases where shadow is active

**Felt language**:
- "More than one thing in you may be speaking here."
- "Something in you may be trying to protect something else."
- "There might be a voice beneath this voice."

**Suppression rules**:
- `dissociation_signals` — fragmented language, time gaps → ground first, don't explore parts
- `active_crisis` — stabilize first
- `low_readiness` — agency markers absent ("they always" without "I notice"). The member
  needs more capacity before parts work is productive.
- `acute_emotional_flooding` — shame too hot, recognition would collapse capacity

**Exit signals**:
- `/\b(I see that part|I can feel both|I'm noticing the conflict)\b/i` — parts are "met"
- `/\b(it makes sense that|of course that part|I understand why)\b/i` — Self-energy language
- Internal coherence increases (reduced contradiction between statements)

**Priority**: 1 (when conflict is live, this is the most directly relevant tool)

**Action shape**:
- `label: 'parts-shadow-surfacing'`
- `route: '/labtools/parts-shadow'`
- `silent: true`

---

### 3. Brain Trust

**Purpose**: When a question needs more than one angle. Decision paralysis,
multi-option loops, over-processing without movement. Multiple AI perspectives
on a single question.

**Entry patterns**:
- `/\b(I can't decide|I keep going back and forth|I don't know which)\b/i` — indecision
- `/\b(on one hand|on the other hand|pros and cons)\b/i` — deliberation loops
- `/\b(what would you do|what should I|I need advice)\b/i` — seeking external perspective
- `/\b(I've been thinking about this for|I can't figure out)\b/i` — processing loops
- `/\b(option A|option B|either.*or)\b/i` — explicit multi-path framing

**Entry conditions**:
- `minInteractions: 4` — need to understand the question before multi-angle is useful
- `minSessionsWithMember: 2` — Brain Trust works best when MAIA knows the member
- `elementAffinity: ['Air', 'Earth']` — analytical and grounding terrain
- `phaseAffinity: [1, 3]` — initiating and building phases where decisions matter most

**Felt language**:
- "It may help to look at this from more than one angle."
- "There are several ways to see what's in front of you."
- "This question might open differently with different lenses on it."

**Suppression rules**:
- `grief_processing` — don't intellectualize loss
- `acute_emotional_flooding` — decisions made in flooding are not real decisions
- User is looking for permission, not structure (detected by "should I" + deference pattern)
- Emotional conflict disguised as decision logic — redirect to Parts & Shadow
- Phase 2 descent (Water) — accompany the descent, don't analyze it

**Exit signals**:
- `/\b(I think I'll|I'm going to|I've decided|that's what I want)\b/i` — decision clarity
- `/\b(what matters most is|the real question is)\b/i` — criteria crystallization
- User moves from "what should I do" to "what do I want" — agency emerging

**Priority**: 3 (available but not pressing — paralysis is uncomfortable but not urgent)

**Action shape**:
- `label: 'brain-trust-surfacing'`
- `route: '/labtools/brain-trust'`
- `silent: false` — Brain Trust is explicit by nature (multi-perspective is a conscious choice)

---

## Readiness Detection (Cross-Tool)

Before any tool surfaces, assess relational readiness (internal, not shown to member):

```typescript
interface ReadinessSignals {
  languageCoherence: number;    // 0-1: fragmented (0) vs reflective (1)
  emotionalIntensity: number;   // 0-1: regulated (0) vs flooding (1)
  agencyMarkers: number;        // 0-1: "they always" (0) vs "I notice" (1)
}
```

**Gate rules**:
- If `emotionalIntensity > 0.7` → suppress all cognitive tools
- If `agencyMarkers < 0.3` → suppress Parts & Shadow, Brain Trust
- If `languageCoherence < 0.3` → suppress everything except Regulation Minute

Readiness is derived from language analysis in the current turn, not stored profile.

---

## Implementation Path

1. `lib/consciousness/toolSurfacing.ts` — registry + `detectToolSuggestions()` function
2. Wire into oracle conversation route alongside `detectInterventionTriggers()`
3. Return `suggestedActions` with `type: 'tool'`, `feltLanguage`, `priority`
4. Test with real prompts — tune patterns, thresholds, suppression
5. Build pages only after surfacing behavior is correct
6. Scale to remaining 7 tools using this spec as template

---

## What This Is Not

- Not a recommendation engine
- Not a dashboard
- Not a feature menu
- Not advice

It is: **conditions under which a new perception becomes available**.

The tool is one expression of that perception. The felt language is another.
The member may never click through. That's fine. The noticing happened.
