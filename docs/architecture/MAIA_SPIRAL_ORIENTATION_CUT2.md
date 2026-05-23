# MAIA Spiral Orientation — Cut 2 Architecture

**Date**: 2026-05-23  
**Status**: Design complete → Implementation  
**Layer**: Developmental Continuity (sits between Layer 5/Semantic and Layer 6/Developmental in the 15-layer stack)  
**Canon constraint**: Read-only. No new tables. No writes. No phase assertions. Evidence → questions, not conclusions.

---

## What this is NOT

- Not a psychometric profile
- Not per-domain phase assignment (canon-conflict trap — phase is a unitary Spiralogic signal, not decomposable by life domain)
- Not cross-domain synthesis (violates `crossing_allowed = FALSE` spirit even without atoms table)
- Not a developmental trajectory claim
- Not triggered synthesis or unsolicited reflection

## What this IS

A read-only computed view over existing substrate, surfaced once per conversation turn, that lets MAIA know:
1. **What domains the member has declared intention around** (trajectory_focus)
2. **What Spiralogic process themes are in motion** (member_theme_signals, 14-day window)
3. **What threshold crossings have been marked recently** (threshold_events, 60-day window)
4. **What thinking threads are active** (member_ideas with recent decision activity)
5. **What the memory texture looks like by register** (member_memory_atoms grouped by primary_register)

The output is passed as context, not assertion. MAIA uses it to ask better questions, not to declare what the member is experiencing.

---

## Schema Reality Check

Original design assumed domain-level atoms bucketing. Actual schemas:

| Table | Keyed by | Notes |
|-------|----------|-------|
| `trajectory_focus` | `domain` (career/relationship/identity/health/creative/spiritual/boundaries/integration) | UNIQUE per member+domain. The only true domain map. |
| `member_memory_atoms` | `registers[]` (episodic/thematic/developmental/archetypal/relational/threshold/witnessed/sacred_protected) | Memory TYPES, not life domains. Group by primary_register. |
| `member_theme_signals` | `theme` (field_awareness/pattern_recurrence/embodied_coherence/adaptive_unfolding/wise_acceptance/ripeness) | Spiralogic process themes. Not life domains. |
| `threshold_events` | `event_type` (decision/commitment/boundary/role_shift/collapse/initiation/completion/kairos_crossing) | With element + intensity. No domain field. |
| `member_ideas` | unstructured (tags array) | Active thinking threads with decision timestamps. |

---

## Function: `buildMemberSpiralOrientation`

**File**: `lib/maia/spiralOrientation.ts`  
**Input**: `memberId: string`  
**Output**: `SpiralOrientationResult` (full type definition in module)

### Queries

1. **Declared intentions** — `trajectory_focus` WHERE member_id = $1 ORDER BY updated_at DESC
2. **Memory register distribution** — `member_memory_atoms` grouped by primary_register, status IN (active, still_alive), excludes sacred_protected
3. **Active process themes** — `member_theme_signals` last 14 days, grouped by (theme, signal_type), averaged resonance
4. **Recent threshold crossings** — `threshold_events` last 60 days, ORDER BY created_at DESC LIMIT 10
5. **Thinking threads** — `member_ideas` WHERE status = 'active', last_touched DESC LIMIT 8

### Output shape

```typescript
{
  memberId: string,
  computedAt: Date,
  activeIntentions: { domain, intention, elementTone?, since }[],
  memoryProfile: { register, count }[],
  activeThemes: { theme, signalType, resonanceStrength?, recentCount }[],
  recentThresholds: { eventType, element?, intensity, summary, source, when }[],
  thinkingThreads: { title, status, hasRecentDecision, lastDecisionAt? }[],
  suggestedQuestions: string[],   // generated from data, for MAIA to invite
  uncertainty: string[],           // what cannot be determined
  dataPresence: {
    hasIntentions, hasMemory, hasThemes, hasThresholds, hasThreads
  }
}
```

---

## Suggested Question Generation Logic

Generated programmatically from data — NOT from inference or synthesis:

- **trajectory_focus domain present** → "You named [domain] as a place of intention. Where is that sitting right now?"
- **active theme with high signal count** → "I notice [theme] showing up in recent conversations. What's alive in that for you?"
- **recent threshold event** → "You [marked/experienced] [eventType] around [summary snippet]. Is that still in motion?"
- **idea with no recent decision** → "The idea around [title] hasn't had a decision recently. Is it parked or still live?"
- **No data in category** → question becomes more open ("What's in motion for you right now?")

Questions are offered to MAIA as *possible inquiry*, not scripted. MAIA exercises judgment about which (if any) to surface.

---

## Wire Points

### Cut 2 (this cut):
- Module built and callable: `lib/maia/spiralOrientation.ts`
- Added to API response in `app/api/sovereign/app/maia/list/route.ts` as `spiralOrientation` field (read-only, visible for observation)
- NOT yet injected into prompt block — observe data quality first

### Cut 3 (deferred):
- Add to `memoryHealth` as Layer 6 signal
- Inject `activeIntentions` and `activeThemes` into MAIA's context block (formatted, non-assertive)
- Log per-turn for observability dashboard

---

## Canon Compliance Check

| Constraint | Status |
|-----------|--------|
| No new tables | ✅ Pure reads over existing substrate |
| No crossing_allowed violation | ✅ No cross-atom synthesis; atoms grouped by register only |
| No phase numbers per domain | ✅ Phase absent from return type |
| No trajectory/destiny claims | ✅ Evidence + uncertainty, not conclusions |
| No unsolicited reflection | ✅ suggestedQuestions are tools for MAIA, not delivered to member |
| No sacred_protected surfacing | ✅ SQL explicitly excludes sacred_protected register |
| Read-only | ✅ No INSERT, UPDATE, or UPSERT anywhere |
| Graceful degradation | ✅ Each query wrapped individually, failure = empty array |
