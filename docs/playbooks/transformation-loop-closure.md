# Transformation Loop Closure — Claude Code Playbook

## Core Anchor (keep in view)

This system already has most of the transformation loop. Do not invent a new one.

**Existing:**
- Spiralogic defines "better"
- Oracle/AIN deliver interventions
- Theme signals capture post-response movement

**Missing:**
- Member-specific synthesis of what interventions appear to create movement
- Feeding that synthesis back into future prompt assembly

Implement the smallest viable closure of that loop.

**Protect the catalyst invariant:** MAIA must help the member become more coherent and less dependent over time. Do not optimize for engagement. Optimize for movement, integration, autonomy, and reduced centrality of MAIA.

---

## Operating Sequence

### Pass 1 — Recon

Use: Architecture Recon Prompt

### Pass 2 — Design

Use:
- Gap-Closing Design Prompt
- Catalyst Invariant Prompt
- No-New-Abstractions Prompt

### Pass 3 — Implement

Use:
- Loop-Closure Implementation Prompt
- Exact File-Target Prompt

### Pass 4 — Validate

Use: Testing Prompt

---

## Prompt Suite

### 1. MASTER IMPLEMENTATION PROMPT

```
You are working inside the Soullab / MAIA codebase.

Your task is to help close the transformation loop that already exists in the system.

Do not invent a new architecture unless absolutely necessary.

The existing loop already includes:
- Program / definition of "better" = Spiralogic field definition
- Editable layer / intervention delivery = Oracle responses + AIN phase sequencing
- Evaluation / signal capture = theme signals + AIN shape metrics

The missing piece is:
- feeding accumulated member-specific outcome patterns back into future response generation

Your job is to:
1. inspect the existing implementation
2. preserve current abstractions where possible
3. add only the minimum structure required to:
   - tag interventions
   - link interventions to post-interaction signals
   - synthesize what appears to work for this member
   - inject that synthesis into prompt assembly
4. protect the catalyst invariant:
   - MAIA must become less central over time, not more
   - do not optimize for engagement
   - optimize for increased coherence, increased self-trust, reduced dependence, and real movement

Constraints:
- prefer extending existing files, services, and tables over introducing new systems
- do not create speculative abstractions
- do not break current oracle behavior
- preserve field-aware, spiral-aware, and signal-aware architecture
- always show exact file targets and insertion points
- when proposing code changes, explain how they fit into the existing route and data flow
- favor additive, testable changes

Output format:
1. What already exists
2. What is missing
3. Smallest viable implementation plan
4. Exact files to edit
5. Exact code changes
6. Risks / invariants to protect
```

### 2. ARCHITECTURE RECON PROMPT

```
Read the current transformation-related flow in this codebase.

Focus on these concerns:
- state detection
- spiral state persistence
- AIN phase sequencing
- intervention delivery
- theme signal capture
- prompt assembly
- member-specific memory or historical pattern injection

Start by tracing the flow through likely files such as:
- app/api/oracle/conversation/route.ts
- lib/maia/spiralogicReference.ts
- participatoryRealityHelper.ts
- any spiral state persistence helpers
- prompt assembly or system prompt builder files
- member_theme_signals table access points
- member_spiral_state load/save points

Return:
1. existing loop steps already implemented
2. exact files/functions responsible for each step
3. where signals are captured but not fed back
4. where intervention type could be tagged with the least disruption
5. where accumulated member-specific pattern synthesis should be injected into prompt assembly
6. any missing linkage tables or metadata fields

Do not suggest a rewrite. Do not generalize. Stay specific to this codebase.
```

### 3. GAP-CLOSING DESIGN PROMPT

```
Based on the current codebase, design the smallest viable implementation for closing the existing transformation loop.

The loop already includes:
- state detection
- intervention delivery
- post-interaction signal capture

The missing layer is:
- storing and synthesizing what kinds of interventions appear to create movement for this member
- feeding that synthesis back into future oracle prompt assembly

Design this using existing infrastructure wherever possible.

Required outcomes:
- intervention type becomes explicit and machine-readable
- interventions can be linked to subsequent signal patterns
- a lightweight member-specific effectiveness summary can be computed
- that summary can be injected into prompt assembly as background shaping, not hard control logic

Honor the catalyst invariant:
- the loop must support reduced dependence over time
- avoid engagement-maximizing logic
- avoid addictive or sticky optimization patterns

Return:
1. recommended minimal data additions
2. recommended write path additions
3. recommended read path additions
4. recommended prompt injection block shape
5. fallback behavior when no prior data exists
6. exact files to touch
7. why this is the smallest viable path
```

### 4. INTERVENTION TAXONOMY PROMPT

```
Create a minimal intervention taxonomy for the existing MAIA / AIN response system.

This taxonomy must map cleanly onto current behavior, including existing AIN shapes such as:
- mirror
- bridge
- next_step
- pass

Your goal is not to create a complex ontology. Your goal is to make intervention types explicit enough to:
- tag oracle outputs
- compare interventions against later theme signals
- learn what tends to create movement for a member

Requirements:
- keep the taxonomy small
- align with existing route behavior
- distinguish between response shape and intervention function
- support future synthesis without forcing new architecture

Return:
1. intervention taxonomy list
2. definition of each type
3. how each maps to current AIN shapes
4. where it should be stored in the existing flow
5. example metadata structure
```

### 5. OUTCOME LINKAGE PROMPT

```
Design the linkage between:
- a delivered intervention
- the next observed signals for the same member
- a lightweight interpretation of whether movement occurred

Use current infrastructure first:
- member_theme_signals
- member_spiral_state
- any existing conversation turn storage
- AIN shape metrics or participatory signal helpers

Goal: Create a reliable-enough "what seemed to work" signal without pretending to measure inner life perfectly.

Constraints:
- do not create fake certainty
- do not overfit one exchange
- support pattern accumulation across time
- preserve the distinction between signal and interpretation

Return:
1. the event chain to link
2. recommended identifier or metadata additions
3. the logic for associating future signals with prior intervention
4. a simple scoring or classification model
5. exact code insertion points
6. how to avoid misleading conclusions
```

### 6. MEMBER EFFECTIVENESS SYNTHESIS PROMPT

```
Create a member-specific effectiveness synthesis layer.

This layer should answer questions like:
- what kinds of interventions tend to create movement for this member?
- what tends to produce clarity, grounding, or follow-through?
- what tends not to work?
- is the member moving toward greater self-trust and less dependence?

This synthesis must be:
- lightweight
- background-only
- probabilistic rather than authoritative
- safe to inject into prompt assembly

Do not produce absolute claims. Do not flatten complexity.

Return:
1. the exact synthesis object shape
2. the fields it should contain
3. how it should be computed from existing signals
4. when it should be refreshed
5. how it should degrade gracefully when data is sparse
6. exact file/service location where it belongs
```

### 7. PROMPT ASSEMBLY INJECTION PROMPT

```
Identify where in oracle prompt assembly to inject a new background block representing member-specific transformation learning.

This block should summarize:
- intervention tendencies that seem effective
- intervention tendencies that seem unhelpful
- current developmental trajectory signals
- catalyst-sensitive guidance:
  MAIA should support increased coherence and autonomy, not increase dependence

Requirements:
- inject as background shaping only
- do not let it dominate the oracle voice
- do not force deterministic behavior
- preserve current spiral state and field context precedence

Return:
1. exact prompt builder location
2. recommended block text structure
3. ordering relative to spiral state, care lens, mentor stance, and continuity blocks
4. exact code diff plan
5. any feature flag recommendation
```

### 8. CATALYST INVARIANT PROMPT

```
Before implementing anything, evaluate the proposed change against the catalyst invariant.

The catalyst invariant means:
- the system should support real transformation, not dependency
- success is not more engagement
- success is greater self-recognition, greater coherence, stronger self-trust, and less need for MAIA over time
- the system must not manipulate for retention, attachment, or emotional reliance

Review the proposed implementation and answer:
1. how could this accidentally optimize for dependence?
2. how could it accidentally centralize MAIA too much?
3. how can it be adjusted to strengthen autonomy?
4. what metric or signal should be used instead of engagement?
5. should any parts be weakened, delayed, or backgrounded?

Be strict. Preserve the soul of the system.
```

### 9. NO-NEW-ABSTRACTIONS PROMPT

```
Stop and simplify.

Rework the plan using the smallest possible extension of the existing codebase.

Rules:
- no new orchestration layer unless truly unavoidable
- no new standalone subsystem if an existing helper/service can carry the behavior
- no speculative abstractions
- no platform rewrite
- no future-perfect architecture

Use:
- current oracle route
- current spiral state
- current theme signal infrastructure
- current prompt assembly flow
- current persistence patterns

Return only:
1. smallest viable change set
2. exact files
3. exact data additions
4. why each change is necessary
```

### 10. EXACT FILE-TARGET PROMPT

```
Give implementation instructions in exact file-based form.

Requirements:
- specify the actual file path
- specify exactly where in the file the code goes
- label each code block clearly
- if a change is backend, label it BACKEND
- if a change is frontend, label it FRONTEND
- do not give abstract suggestions
- do not say "somewhere near" or "where appropriate"

Output format:
1. file path
2. why this file is being changed
3. exact insertion point
4. full code block
5. any required follow-up edits in other files
```

### 11. LOOP-CLOSURE IMPLEMENTATION PROMPT

```
Implement the smallest viable version of transformation loop closure in this codebase.

Goals:
- add explicit intervention tagging
- link intervention metadata to later signals
- compute a lightweight member-specific "what seems to work" synthesis
- inject that synthesis into future prompt assembly
- preserve catalyst invariant
- do not break current oracle behavior

Process:
1. inspect existing flow before editing
2. identify exact write/read points
3. implement incrementally
4. keep changes small and reversible
5. show all diffs clearly

Deliver:
- exact files changed
- exact data model additions
- exact prompt injection block
- brief rationale for each change
- any migration needed
- a simple test plan
```

### 12. TESTING PROMPT

```
Create a focused test plan for the closed transformation loop.

Test these concerns:
- intervention type is persisted correctly
- post-interaction signals can be linked to prior intervention
- member-specific synthesis is computed correctly
- sparse-data fallback works safely
- prompt injection occurs only when appropriate
- catalyst invariant is preserved in behavior

Return:
1. unit tests to add
2. integration tests to add
3. fixtures or seed data needed
4. edge cases
5. how to validate that the system becomes more precise without becoming more dependency-inducing
```

---

## Strategic Center

The real sophistication is not "self-improving AI."

It is this: **the system learns how to become less necessary while becoming more precise.**

That is the right center for Soullab.
