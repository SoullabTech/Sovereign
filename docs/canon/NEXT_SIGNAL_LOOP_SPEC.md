---
level: protocol
---

# Next Signal Loop — Specification

**Status:** Draft specification. Not implemented.
**Scope:** Backend prompt scaffold, both question builders, both consult routes, a minimal frontend continuation component, and evaluator extensions.
**Target branch for implementation:** follow-up session on top of `claude/dreamy-allen` (which already contains the observability package and evidence-limits awareness).

## 1. Intent

The council consultation surfaces (Changes and Decisions) currently support iteration through `IterationContext` / `ChangeIterationContext`, but each consultation still lands as a one-shot synthesis. The iteration plumbing is there; the *loop shape* is not.

The Next Signal Loop turns consultation into a feedback loop that evolves with the practitioner's reality:

> provisional read → test in the world → return with signal → refine → repeat

Each cycle earns the next layer of precision. Early turns hold low confidence and high optionality; later turns narrow based on observed signal — not on reinterpretation of the same data.

This spec is deliberately light. It does not introduce a new architecture. It makes the loop visible, measurable, and resistant to drift.

## 2. Invariants

The loop must uphold these at all times:

1. **No advancement without new signal.** If iteration number > 1 and no new signal has been reported since the prior turn, the synthesis must explicitly say so and keep moves exploratory. It must not produce a narrower or more confident reading of the same data.
2. **Evidence is tagged.** When the practitioner returns with input, that input is classified as Observed, Reported, or Inferred. The synthesis reasons explicitly from these categories.
3. **Moves generate signal.** When evidence is limited, recommendations are prioritized for their ability to produce observable information, not for closure.
4. **Next signal is named.** Every response emits a concrete "Next Signal to Bring Back" — specific enough to test in the real world, simple enough to gather in one step, and tied to which interpretations it would distinguish.
5. **The Changes intervention contract is preserved.** The "next smallest useful intervention" discipline is not weakened. In the loop, "next signal" and "next intervention" are the same object: an action that generates signal by being taken.
6. **Sovereignty.** The loop supports practitioner judgment; it does not replace it. The synthesis proposes; the practitioner decides what to test and what to report back.

## 3. Scaffold Changes — `lib/ain/synthesis/dialectical.md`

### 3.1 New required output section

Insert immediately after `### Recommended Action`, before `### What to Hold Open`:

```markdown
### Next Signal to Bring Back

[Required. Specify 1–2 concrete observations that would most reduce uncertainty in the next turn. These must:
- be observable in the real world (not internal reflection alone)
- help distinguish between the main plausible interpretations named above
- be simple enough to gather in one step (a conversation, an action, or an intervention)

Do not ask generic reflective questions. Do not repeat earlier questions. This is a practical instruction for what to test or notice before the next consultation.]
```

### 3.2 New task item in the numbered list

Insert as task #7 (after the current #6 "Provides Recommendation"):

```markdown
7. **Names Next Signal to Bring Back**
   - When evidence is limited, prioritize actions that generate signal over actions that presume understanding.
   - Specify 1–2 observations — not reflections — that would distinguish between the live interpretations.
   - Keep the next signal small enough to gather in a single practitioner step (conversation, action, or intervention).
   - If this is iteration > 1 and no new signal has been reported since the prior turn, explicitly say so and keep moves exploratory. Do not narrow or increase confidence without new evidence.
```

### 3.3 Anti-pattern addition

In the `## Anti-Patterns` list:

```markdown
- Don't narrow interpretation without new signal — reinterpretation of the same data is not learning.
```

## 4. Builder Changes

### 4.1 Shared pattern

Both builders need three additions to their iteration handling:

1. Relabel `WHAT HAS HAPPENED SINCE` as `OBSERVED SIGNAL SINCE LAST TURN` when the practitioner returns with tagged evidence.
2. Render structured evidence tags (Observed / Reported / Inferred) when present.
3. Emit a `NO NEW SIGNAL REPORTED SINCE ITERATION N-1` block when iteration > 1 and no evidence is attached — mirroring the absent-bundle pattern already committed in `9e34922d6` and `1a86e21ef`.

### 4.2 Decisions — `lib/studio/leadership/situationTypes.ts`

Current iteration handling (around line 304):

```ts
if (iteration.sessionNotes) {
  parts.push('', `WHAT HAS HAPPENED SINCE:`, iteration.sessionNotes);
}
```

Replace with:

```ts
if (iteration.returnSignal) {
  // Structured return: observed / reported / inferred
  parts.push('', '--- OBSERVED SIGNAL SINCE LAST TURN ---');
  if (iteration.returnSignal.observed?.length) {
    parts.push('OBSERVED (directly witnessed by practitioner):');
    iteration.returnSignal.observed.forEach(o => parts.push(`  - ${o}`));
  }
  if (iteration.returnSignal.reported?.length) {
    parts.push('REPORTED (spoken by others, not directly observed):');
    iteration.returnSignal.reported.forEach(r => parts.push(`  - ${r}`));
  }
  if (iteration.returnSignal.inferred?.length) {
    parts.push('INFERRED (practitioner interpretation, label as such):');
    iteration.returnSignal.inferred.forEach(i => parts.push(`  - ${i}`));
  }
  parts.push('--- END OBSERVED SIGNAL ---');
} else if (iteration.sessionNotes) {
  // Backward-compat: free-text notes, classify as Reported by default
  parts.push('', 'OBSERVED SIGNAL SINCE LAST TURN (free-form, treat as Reported):', iteration.sessionNotes);
} else {
  // No new signal — the synthesis must not narrow
  parts.push(
    '',
    '--- NO NEW SIGNAL SINCE ITERATION ' + (iteration.iterationNumber - 1) + ' ---',
    'The practitioner has returned without new evidence. The synthesis must explicitly acknowledge this and keep moves exploratory. Do not narrow interpretations or increase confidence. Prefer reaffirming the Next Signal to Bring Back from the prior turn.',
    '--- END NO NEW SIGNAL ---',
  );
}
```

And extend `IterationContext` in `lib/studio/leadership/types.ts`:

```ts
export interface ReturnSignal {
  observed?: string[];
  reported?: string[];
  inferred?: string[];
}

export interface IterationContext {
  iterationNumber: number;
  priorTensions: string[];
  priorRecommendation: string;
  priorInsights: string[];
  sessionNotes?: string;         // kept for backward-compat
  returnSignal?: ReturnSignal;   // new, preferred
}
```

### 4.3 Changes — `lib/studio/changes/changeTypes.ts`

Parallel change around the current iteration block (near line 327):

```ts
if (iteration.sessionNotes) {
  parts.push('', 'WHAT HAS HAPPENED SINCE:', iteration.sessionNotes);
}
```

Replace with the same structured-evidence-tag pattern as 4.2, and extend `ChangeIterationContext` in `lib/studio/changes/types.ts` with the same `ReturnSignal` shape.

The Changes INTERVENTION DESIGN synthesis-instructions block (lines 350-363) stays untouched. The loop integrates with it, not around it.

## 5. API Route Changes

### 5.1 Changes consult — `app/api/studio/changes/[id]/consult/route.ts`

Current request body accepts (around line 40-50):

```ts
let sessionNotes: string | undefined;
sessionNotes = body.sessionNotes?.trim() || undefined;
```

Extend to accept structured return signal:

```ts
let sessionNotes: string | undefined;
let returnSignal: ReturnSignal | undefined;

sessionNotes = body.sessionNotes?.trim() || undefined;

if (body.returnSignal && typeof body.returnSignal === 'object') {
  const rs = body.returnSignal;
  returnSignal = {
    observed: Array.isArray(rs.observed) ? rs.observed.filter((s: unknown) => typeof s === 'string' && s.trim()) : undefined,
    reported: Array.isArray(rs.reported) ? rs.reported.filter((s: unknown) => typeof s === 'string' && s.trim()) : undefined,
    inferred: Array.isArray(rs.inferred) ? rs.inferred.filter((s: unknown) => typeof s === 'string' && s.trim()) : undefined,
  };
}
```

Pass both into the `iterationContext` built around line 112. Persist `returnSignal` alongside `sessionNotes` in `change_iterations` (new JSONB column) — see 5.3.

### 5.2 Decisions consult — `app/api/studio/decisions/[id]/consult/route.ts`

Same pattern. Free-text remains accepted for backward compat; structured tags preferred.

### 5.3 Schema migration

Add new JSONB columns to both `change_iterations` and the Decisions equivalent iteration table:

```sql
ALTER TABLE change_iterations
  ADD COLUMN IF NOT EXISTS return_signal JSONB;

ALTER TABLE decision_iterations
  ADD COLUMN IF NOT EXISTS return_signal JSONB;
```

File: `database/migrations/YYYYMMDD_return_signal.sql`. Follow the migration hygiene pattern in `CLAUDE.md` — apply and register in `schema_migrations`.

## 6. Frontend Component Contract

Minimal. No dashboards. No heavy state.

### 6.1 Component: `ContinuationBlock`

**Location:** `components/studio/council/ContinuationBlock.tsx`
**Rendered at:** end of the council result view in both Changes and Decisions surfaces.

**Props:**

```ts
interface ContinuationBlockProps {
  surface: 'change' | 'decision';
  targetId: string;              // change.id or decision.id
  nextSignalToBringBack: string; // from synthesis output section
  iterationNumber: number;
  onSubmit: (payload: ContinuationPayload) => Promise<void>;
}

interface ContinuationPayload {
  returnSignal: {
    observed?: string[];
    reported?: string[];
    inferred?: string[];
  };
  sessionNotes?: string; // optional free-text alongside structured
}
```

**UI states:**

1. **Collapsed** — shows the header `Continue this consultation` and the `Next signal to bring back` line from the prior synthesis. Expand control.
2. **Expanded — input mode selection:**
   - *Free text* — single textarea, classifies as Reported on submit
   - *Quick tags* — pre-defined chips: "People understood it", "People misunderstood it", "No response", "Strong resonance", "Resistance / confusion", "Something unexpected happened"
   - *What I noticed* — radio list: emotional shift / behavior change / nothing changed / new question emerged
3. **Submit** — `Continue with new information` button. Posts to the same consult endpoint used for the initial consultation. The server recognizes iteration > 1 via existing `iteration_count` logic.
4. **Empty-signal branch** — if the practitioner opens the block but submits without input, surface a small warning: *"No new signal reported. The next turn will keep moves exploratory and re-affirm the prior Next Signal."* Allow continuation.

### 6.2 Minimum-viable scope for first frontend pass

Build only *Free text* + *Empty-signal branch*. The quick-tag chips and structured what-I-noticed radio can follow in a second UI pass once the loop has been exercised.

## 7. Evaluator Extensions

Fixture additions to `tests/fixtures/council/gold-standard-support-network-synthesis.json`:

### 7.1 New required concepts

```json
{
  "name": "emits_next_signal_to_bring_back",
  "description": "Synthesis must name a concrete observable signal for the next turn.",
  "any_of": [
    "next signal (to bring back|to observe|to gather)",
    "observe (before|for) (the )?next (consultation|turn)",
    "(before the|come back with|return with).{0,60}(signal|evidence|observation)",
    "what would (most )?reduce uncertainty"
  ]
}
```

### 7.2 New structural rule

```ts
// In checkStructuralRules:
out.push({
  rule: 'emits next-signal section',
  pass: /next signal to bring back/i.test(text) || /next signal to (observe|gather)/i.test(text),
  detail: 'expected "Next Signal to Bring Back" section (or equivalent header)',
});
```

### 7.3 New iteration-2 fixture

Author a second fixture that simulates iteration 2 with *no new signal*, verifying the synthesis stays exploratory:

**File:** `tests/fixtures/council/gold-standard-iteration2-no-signal.json`

Required concepts must include:
- `acknowledges_no_new_signal` — regex: `no new signal|without new (evidence|signal|observation)|nothing (has |)been (reported|observed)`
- `stays_exploratory` — regex: `keep (moves|this) exploratory|not (yet )?narrow|insufficient (evidence|signal) to narrow`

Forbidden (for this fixture only):
- `we now know` / `we can now conclude` / `this confirms`

### 7.4 Runner additions

Two new runners parallel to the existing ones:

- `tests/council/run-council-iteration2.ts` — invokes `consultChangeCouncil` with a synthetic prior iteration + no new signal
- `tests/council/run-decision-iteration2.ts` — same for Decisions

Both reuse `evaluateCouncilSynthesis` with the iteration-2 fixture.

## 8. Guardrail Summary

- **No new signal → no narrowing.** Enforced at builder level (absent-signal block), scaffold level (task #7), and evaluator level (iteration-2 fixture).
- **Evidence is tagged.** Enforced at builder level (structured rendering), API level (accepted in body), frontend level (optional structured input).
- **Backward compat.** Free-text `sessionNotes` continues to work and is classified as Reported. No existing integration breaks.
- **Changes contract preserved.** The INTERVENTION DESIGN synthesis instructions in `changeTypes.ts` are untouched. The loop and the intervention contract compose; they do not conflict.

## 9. Explicit Non-Goals

- No dashboards.
- No heavy iteration-tracking state machine. The existing `iteration_count` + `change_iterations` / `decision_iterations` tables are sufficient.
- No audit trail UI.
- No cross-consultation pattern mining (belongs to a future Pattern Ledger commit, not this loop).
- No automated evidence classification (the practitioner tags; the system does not guess).
- No changes to temperature, model selection, or L5 cap (those are separate tuning questions).

## 10. Implementation Order (Suggested)

1. Schema migration (5.3) — smallest, lowest risk, unlocks everything downstream
2. Type additions — `ReturnSignal` in both types files
3. Builder changes (4.2, 4.3) — scaffold + absent-signal branch
4. Scaffold changes (3.1, 3.2, 3.3) — `dialectical.md`
5. API route acceptance (5.1, 5.2)
6. Evaluator extensions (7.1, 7.2) — verify before frontend
7. Frontend component (6.1, 6.2) — MVP: free-text + empty-signal branch
8. Iteration-2 fixture + runner (7.3, 7.4) — live verification

Each step is independently reviewable. Ship in one commit or several — the git discipline from `9e34922d6` and `1a86e21ef` (observability separate from behavior) applies here too: backend behavior separate from frontend surface separate from measurement extension.

## 11. What Success Looks Like

After implementation and one verification pass:

- Every council response ends with a concrete, observable Next Signal to Bring Back.
- When the practitioner returns with no new signal, the synthesis explicitly acknowledges this and keeps moves exploratory.
- When the practitioner returns with tagged evidence, the synthesis reasons from Observed vs Reported vs Inferred categories and narrows accordingly.
- The iteration-2 no-signal fixture passes on both surfaces.
- The Changes intervention contract remains intact.
- No banned phrases, no regressions on existing concepts, no temperature tuning required.

## 12. Out of Scope for This Spec

- Pattern Ledger (cross-consultation pattern mining across a member's arc)
- Session-Room continuity (live practitioner dashboard)
- Multi-practitioner field signals (group consultation)
- Automated signal classification (LLM-tagging practitioner input as Observed/Reported/Inferred)

These are real and worthwhile, but each deserves its own spec and its own commit boundary.
