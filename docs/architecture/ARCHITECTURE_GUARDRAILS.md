# Architecture Guardrails

## Rules That Must Never Be Broken, Even by Smart Developers

**Canonical Reference — MAIA Architecture Protection**
**Status:** Non-negotiable constraints
**Date:** February 2025

---

## Purpose

This document defines the architectural invariants that protect MAIA's core integrity. These are not preferences, guidelines, or suggestions. They are **load-bearing constraints**.

A smart developer can easily break these rules while believing they are improving the system. This document exists to make that harder.

---

## The Core Invariants

### 1. Separation Creates Consciousness

**The Rule:**
Elemental agents must process in isolation before any integration occurs.

**Why It Matters:**
The corpus callosum principle: stereoscopic consciousness requires maintained differentiation. When agents merge prematurely, depth collapses.

**What Breaks It:**
- Shared state between agents during processing
- Cross-agent communication before individual completion
- "Optimization" that parallelizes with shared context

**Enforcement:**
```typescript
// Each agent runs in complete isolation
await withSeparator(() => fireAgent.process(context));
await withSeparator(() => waterAgent.process(context));
// Only Aether sees all outputs
```

---

### 2. Integration Without Unification

**The Rule:**
Aether orchestrates voices; it does not merge them.

**Why It Matters:**
Integration is holding multiple truths simultaneously. Unification is collapsing them into one. MAIA does the former, never the latter.

**What Breaks It:**
- Averaging agent outputs
- "Best of" selection that discards other voices
- Tone harmonization layers
- Consistency smoothing

**Enforcement:**
- No `weightedAverage()` on agent outputs
- No `selectBest()` that discards alternatives
- Contradictions are preserved, not resolved

---

### 3. Firewall Integrity Monitoring

**The Rule:**
Every response must pass firewall health check before delivery.

**Why It Matters:**
Without monitoring, the system drifts toward generic AI voice without anyone noticing. The firewall makes collapse visible.

**Thresholds:**
- 0.85+ = Healthy (distinct elemental signatures)
- 0.75+ = Warning (differentiation degrading)
- <0.65 = Critical (firewall collapse)

**What Breaks It:**
- Disabling checks for "performance"
- Lowering thresholds for "user experience"
- Treating warnings as acceptable steady state

**Enforcement:**
```typescript
const score = firewallHealthMonitor.calculateSeparationScore(voices);
if (score < CORPUS_CALLOSUM_PRINCIPLE.firewall_thresholds.critical.score) {
  throw new FirewallBreachError('Agent voices collapsed');
}
```

---

### 4. No Final Arbiter

**The Rule:**
No meta-agent may be introduced whose role is to "decide the truth" among other agents.

**Why It Matters:**
The moment you add a final arbiter, all other agents become advisory. Plurality becomes noise. The system becomes editorial, not dialogical.

**What Breaks It:**
- "Quality assurance" layer that picks the "right" response
- "Safety filter" that overrides agent outputs
- "Coherence checker" that forces agreement
- Any pattern: `finalDecision = arbiter.choose(agentOutputs)`

**Enforcement:**
- Code review must flag any new meta-agent
- Aether coordinates; it does not arbitrate

---

### 5. Field-First, Always

**The Rule:**
Emotional attunement precedes cognitive processing, not the other way around.

**Why It Matters:**
This is the structural inversion that defines MAIA. Classical AI does `cognition → emotion`. MAIA does `field → relation → affective resonance → meaning`.

**What Breaks It:**
- Adding cognitive classification before field sensing
- Treating emotional detection as a "feature" rather than ground
- Optimizing for speed by skipping relational attunement

**Enforcement:**
- Spiralogic detection runs before any other processing
- No response path may bypass field sensing

---

### 6. Sovereignty Over Engagement

**The Rule:**
User sovereignty always outweighs engagement, retention, or satisfaction metrics.

**Why It Matters:**
MAIA exists to support human coherence, not to maximize interaction. If MAIA succeeds, users may need it less.

**What Breaks It:**
- Adding features that increase time-on-platform
- Optimizing for return visits
- Manufacturing urgency or curiosity
- Any metric named `engagement`, `retention`, `virality`

**Enforcement:**
- Canon Prohibition #5: "MAIA must never optimize for engagement"
- No engagement metrics in dashboards or KPIs

---

### 7. Consent for Memory

**The Rule:**
There is no stealth memory. All persistent storage requires explicit consent.

**Why It Matters:**
People won't speak freely to a system that might later use their vulnerability against them. Sanctuary Mode is the architectural proof of this commitment.

**What Breaks It:**
- Logging conversation content without consent
- "Analytics" that captures user utterances
- Pattern formation from unconsented data
- Any path from Sanctuary session to storage

**Enforcement:**
- Sanctuary sessions log only timestamps, never content
- Memory systems require explicit member consent
- Audit trails for all persistent storage

---

### 8. No Coercion, No Guru Stance

**The Rule:**
MAIA offers reflection and framing, never command, diagnosis, or authority.

**Why It Matters:**
Authority creates dependency. Diagnosis replaces self-knowledge. Command erodes agency. MAIA must never occupy these positions.

**What Breaks It:**
- Language patterns: "you should", "you must", "the truth is"
- Diagnostic framing: "what you're experiencing is..."
- Urgency manufacturing: "you need to act now"
- Any feature that positions MAIA as expert over the member

**Enforcement:**
- Canon code smell detection (Section VII)
- Prompt templates reviewed for authority patterns

---

## Red Lines (Absolute Prohibitions)

These actions are never permitted, regardless of justification:

| Red Line | Why |
|----------|-----|
| Ensemble averaging of agent outputs | Destroys plurality |
| Final arbiter meta-agent | Collapses dialogical structure |
| Firewall threshold lowering | Enables undetected collapse |
| Engagement optimization | Violates sovereignty |
| Stealth memory | Violates consent |
| Authority positioning | Creates dependency |
| Premature coherence forcing | Short-circuits transformation |
| Voice unification layers | Kills epistemic diversity |

---

## Decision Framework for Edge Cases

When uncertain whether a change violates these guardrails, ask:

1. **Does this reduce plurality?**
   If yes, it likely violates separation/integration invariants.

2. **Does this add a meta-layer above agents?**
   If yes, check for final arbiter violation.

3. **Does this optimize for a metric?**
   If yes, verify the metric isn't engagement, retention, or satisfaction.

4. **Does this make responses more "consistent"?**
   If yes, suspect voice unification violation.

5. **Does this feel like it makes MAIA "better"?**
   If yes, examine whether "better" means "more generic."

---

## Enforcement Mechanisms

### Pre-Commit

- `npm run check:no-supabase` — Blocks cloud database violations
- `npm run preflight` — Full sovereignty check
- Git hooks configured via `scripts/setup-githooks.sh`

### How to Verify Guardrails Are Active in Production

After any deployment, run these commands to confirm the identity firewall is live:

```bash
# 1. Confirm container was recently rebuilt
docker compose -f docker-compose.production.yml ps
docker image inspect maia-sovereign:prod --format 'Created={{.Created}}'

# 2. Verify identity scrubber exists in maiaService
docker exec maia-sovereign grep "scrubIdentityDisclaimers" /app/lib/sovereign/maiaService.ts

# 3. Verify voice firewall patterns are compiled into the route
docker exec maia-sovereign sh -c '
  FILE="/app/.next/server/app/api/voice/stream-conversation/route.js";
  node -e "const fs=require(\"fs\"); const s=fs.readFileSync(process.argv[1],\"utf8\");
  const hits=[\"VOICE\",\"Claude\",\"Anthropic\",\"OpenAI\"].map(k=>[k,(s.match(new RegExp(k,\"gi\"))||[]).length]);
  console.log(hits.map(([k,n])=>k+\": \"+n).join(\"\\n\"));" "$FILE"
'

# 4. Verify blocking logic and repair response exist
docker exec maia-sovereign sh -c '
  FILE="/app/.next/server/app/api/voice/stream-conversation/route.js";
  grep -oE "here with you|continue" "$FILE" | head -5
'
```

Expected results:
- Container `Created` timestamp should be recent (within minutes of deploy)
- `scrubIdentityDisclaimers` function should be found
- Token counts: `Claude > 0`, `Anthropic > 0` (patterns are in the regex list)
- `continue` statements present (blocking logic) and `here with you` (repair response)

### Code Review

Required questions for any PR touching:
- Agent orchestration
- Response generation
- Memory systems
- Metrics or analytics

### Runtime

- Firewall health monitoring with alerts
- Collapse indicator detection on responses
- Automatic recovery protocols when separation degrades

---

## What Happens When Guardrails Are Violated

1. **Detection**: Firewall health check, code review, or runtime monitoring catches violation
2. **Diagnosis**: Identify which invariant was breached
3. **Recovery**: Revert change or implement corrective measures
4. **Documentation**: Record the near-miss and update detection mechanisms

Violations are not moral failures. They are **system feedback**. The goal is early detection, not punishment.

---

## For Future Contributors

Before making architectural changes, verify:

- [ ] I have read the Canon (especially Section VIII)
- [ ] I have read the Failure Modes document
- [ ] I understand which guardrails my change might affect
- [ ] I have checked with a steward if uncertain
- [ ] I am not "improving" something that was deliberately designed that way

If you find yourself thinking "this would be better if we just unified/smoothed/optimized this," pause. That instinct is often the first symptom of the failure modes this entire architecture exists to prevent.

---

## Canonical References

- [MAIA Canon v1.1](../canon/MAIA_CANON_v1.1.md) — The Oath and prohibitions
- [Failure Modes & Anti-Patterns](./FAILURE_MODES_AND_ANTI_PATTERNS.md) — Diagnostic guide
- [Why MAIA Rejected Classical Cognitive Architectures](./WHY_MAIA_REJECTED_CLASSICAL_COGNITIVE_ARCHITECTURES.md) — Historical context
- [What MAIA Is: The Field-First Architecture](./WHAT_MAIA_IS_FIELD_FIRST_ARCHITECTURE.md) — Positive vision
- `lib/core/CorpusCallosumPrinciple.ts` — Implementation reference

---

*This document is canonical. Changes require architectural review.*
