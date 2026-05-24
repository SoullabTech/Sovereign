# Memory Pill — Color Source Mapping (Data-Only, No Implementation)

**Date**: 2026-05-23
**Status**: Diagnostic map. No color changes. Decision pending.
**Scope**: Map what data sources already exist for coloring the memory indicator pill
in `components/ui/ModernTextInput.tsx`. Compare three options. Identify sovereignty
risk per option. Recommend sequencing.

---

## 0. What the pill currently is

**Location**: `components/ui/ModernTextInput.tsx:377-384`

```jsx
<div
  className="mt-2 mb-3 pl-28 pr-1 flex items-center gap-1.5
             text-[10px] uppercase tracking-[0.15em]
             text-gold-divine/30 select-none pointer-events-none"
  aria-label="memory status indicator"
  role="status"
>
  <span>memory · continuity active</span>
  <span className="text-white/20 normal-case tracking-normal">
    {/* companion text */}
  </span>
</div>
```

**Current binding**: None. The pill is a static string. The hue (`gold-divine/30`)
is decorative chrome, not data-driven. The companion span is the only dynamic slot
and currently carries no live signal.

**Implication for this map**: We are not "changing the color of a live pill." We are
deciding whether the pill should *become* data-bound, and if so, to which source.

---

## 1. Option A — Conductor / User-State Signal

### Where the data lives
- `lib/voice/conductor.ts` — produces `{ element, phase, motion, intensity }`
  via hysteresis-buffered consensus across turn signals.
- `lib/consciousness/spiralStatePersistence.ts` — `SpiralState` interface with
  `dominant_element`, `phase`, `motion`, `intensity`, `relational_phase`,
  `autonomy_streak`, `return_count`.
- Table: `member_spiral_state` (Bridge D, migration `20260213200001_member_spiral_state.sql`).

### Already observable on client?
**Yes.** `app/api/oracle/conversation/route.ts:1013-1019` already attaches
`spiralState` to the response payload:

```ts
spiralState: spiralState ? {
  dominant_element: spiralState.dominant_element ?? null,
  phase: spiralState.phase ?? null,
  motion: spiralState.motion ?? null,
  intensity: spiralState.intensity ?? null,
  relational_phase: spiralState.relational_phase ?? null,
} : null
```

Client already receives this per turn. No new wiring required.

### Inference required?
None *new* — but the signal itself **is already inference**. The conductor's
`dominant_element` is the system's read of the user, derived from message content
via hysteresis across recent turns. Surfacing it as color makes that inference
user-facing.

### Sovereignty risk
**High.**

- Direct violation of the structural law in [Spiral Continuity Engine canon](../canon/SPIRAL_CONTINUITY_ENGINE.md):
  *unconfirmed recurrence is session-local only; cross-domain inferred is NO; voice
  must not be shaped by states the member has not declared.*
- Atmospheric framing does not prevent decoding. Within ~1 week of use, members
  will learn *"blue = relational, amber = fire, etc."* and begin to notice when
  their color shifts — at which point the pill has become a **typing surface**.
- This is the *schema-beautiful / ontology-flipped* failure mode the canon warns
  about. The hue map looks elegant; the operative ontology is silent classification.
- Failure of [Outside-Life Test](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md): a member
  who knows "the system reads me as X today" carries that read out of the room.
  That is exactly the externalization the canon refuses.

### Should it be visible in UI now?
**No.** Even though the data is the cheapest to wire, the cost is structural,
not technical.

---

## 2. Option B — Memory-Health / System-Weather Signal

### Where the data lives
- `lib/maia/memoryHealth.ts` — `MemoryHealth` interface:
  - 12 per-layer statuses (`LayerStatus = 'ok' | 'empty' | 'error'`):
    `recentTurns`, `session`, `conversational`, `episodic`, `semantic`,
    `relational`, `developmental`, `pattern`, `somatic`, `breakthrough`,
    `field`, `meta`.
  - `continuityConfidence: 'high' | 'medium' | 'low'`, derived from base-chain status.
- `lib/maia/maiaRuntimeContext.ts:336` — `PROMPT_BLOCK_CHARS` (total addenda chars).
- `promptBlock.layers: Record<string, boolean>` — which layers contributed to the
  prompt this turn.
- Atoms count: `app/api/sovereign/app/maia/list/route.ts:714` —
  `[MAIA/sovereign] atoms loaded: { count, userId }` (currently log-only).

### Already observable on client?
**Partial.**
- `memoryHealth` is **built per turn** at `route.ts:2394` (`buildMemoryHealth({...})`).
- It is **logged** to console and recorded to `runtime_events` for the substrate
  monitor.
- It is **NOT currently attached to the response payload returned to the client.**
- Atoms count is logged but not surfaced.

So: data fully exists server-side; needs one new field on the response JSON.
Adding `memoryHealth: { continuityConfidence, ...layers }` and `atomsLoaded: number`
to the response is mechanical — no new inference, no new computation.

### Inference required?
**None.** This is observation, not interpretation. The signals describe what the
system *has access to*, not what the system *thinks the user is*.

### Sovereignty risk
**Low.**

- Aligns with the current pill's literal text: *"memory · continuity active."*
  The pill already gestures at availability; coloring would make that gesture
  legible.
- Does not violate the Spiral Continuity Engine — system-weather is not a
  continuity-bearing inference about the member; it is the system's report on
  itself.
- Survives the Outside-Life Test: a member who learns "blue = many memories
  available today, dim = thin layer access" carries information about the system,
  not a categorization of themselves.
- Aligns with [Substrate Monitor doctrine](../../) (three-layer architecture):
  *first wisdom must be boring; report telemetry, not metaphysics.*
- Aligns with [The Clearing](../canon/THE_CLEARING.md): the architecture reports
  on itself; it does not represent the member.

### Plausible hue mapping (illustrative only — not a decision)
- `continuityConfidence: high` → warmer, more saturated gold (current default,
  alive)
- `continuityConfidence: medium` → current gold/30 (current resting state)
- `continuityConfidence: low` → dimmer, cooler tone (visibly thinner)
- `semantic: 'ok'` + `atomsLoaded > 0` → slight luminous shift (atoms available)
- `semantic: 'empty'` → no luminous shift
- Degraded base chain → small but noticeable desaturation

**This is not an elemental palette.** It's a continuity-weather palette — depth,
warmth, availability. It does not encode element identity at all.

### Should it be visible in UI now?
**Yes — if any change is made at all.** This is the safe first cut.

---

## 3. Option C — Exchange-Blend Signal

### Where the data would live
- Conductor `element` + `intensity` (Option A)
- `memoryHealth.continuityConfidence` + atoms (Option B)
- Recency (turns since last session, gap duration)
- Optionally: relational_phase, motion

### Already observable on client?
**Partially** (Option A's pieces ship in payload; Option B's pieces do not).
But the *blend* does not exist anywhere — it would need to be computed.

### Inference required?
**Yes — new derivation.** The blend function itself is a new piece of inference.
"Mostly blue + silver" or "amber + green" is not a raw signal; it is an
interpretation produced by combining multiple signals through a weighting scheme.

### Sovereignty risk
**Medium-high.**

- The blend *appears* less legible than Option A — three inputs hiding behind a
  single hue feels softer than a direct element-to-color map.
- But opacity does not prevent decoding over time. Members will still notice
  patterns: *"the pill goes amber-ish when I'm activated."* The blend just makes
  the pattern slower to learn, not absent.
- More importantly: **the blend itself becomes a new inference layer** with no
  prior canon coverage. We would be introducing a model of the exchange, then
  rendering it back to the member as ambient atmosphere. That is exactly the
  pattern Spiral Continuity Engine refuses: *system draws an edge, then shapes
  the field around the edge.*
- The "tonal field" framing is aesthetically powerful but structurally heavier
  than Option B. It looks light because it's blurred.

### Should it be visible in UI now?
**No.** Not until (a) Option B has run for weeks of real use, and (b) we have a
canon position on whether the system may render aggregate inferences about the
exchange itself.

---

## 4. Comparison Table

| Option | Data Lives | Client-Observable | New Inference | Sovereignty Risk | Ship Now? |
|---|---|---|---|---|---|
| **A. Conductor / User-State** | conductor + `member_spiral_state` | yes (payload already carries it) | none new (signal already is inference) | **High** — types the member, decodable, violates SCE | **No** |
| **B. Memory-Health / System-Weather** | `memoryHealth.ts` + atoms count | partial (server has it, client doesn't yet) | none — pure observation | **Low** — reports system, not member | **Yes (if anything ships)** |
| **C. Exchange-Blend** | would require new aggregation across A+B+recency | no — blend doesn't exist | yes — new derivation | **Medium-high** — opacity hides inference but doesn't remove it | **No** |

---

## 5. Recommendation

**Sequence**:

1. **Now**: No color change. Pill stays as static chrome.
2. **If/when ready for first cut**: Option B. Surface `memoryHealth.continuityConfidence`
   + `atomsLoaded` to the client by appending to the response payload. Map to
   warmth/saturation/luminosity of the existing gold-divine hue — *not* to an
   elemental palette. The pill says *what is available*, not *what mode you're in*.
3. **Weeks of real use**: Observe whether the system-weather signal proves
   readable as availability rather than as a score. Watch the Outside-Life Test.
   Watch for users developing intuitions about the indicator that map to
   self-evaluation.
4. **Only after Option B is proven non-totalizing**: Consider whether elemental
   tinting could be added as a *secondary* slow background drift — and revisit
   canon position first.
5. **Option C remains gated** on canon coverage for rendering aggregate exchange
   inferences. Do not implement without canon work.

---

## 6. Drift Canaries

If Option B ships and is later proposed to be extended:

- **"It feels lifeless without elemental color"** → check whether the actual
  argument is "the member can't read what mode the system thinks they're in."
  That would mean we are arguing *for* the typing surface, not against it.
- **"Just a hint of element, not a full mapping"** → the gradient case for
  Option A. Atmosphere is not a sovereignty boundary. Either the hue is decoded
  or it is not. If it is decoded, it is typing.
- **"The blend is too opaque to type the user"** → Option C's defense. Opacity
  is a delay, not an absence. Members read patterns over weeks.

---

## 7. What this map does NOT decide

- Whether the pill should be data-bound at all.
- Whether the pill should remain a single line or expand.
- Whether memory health belongs in the input chrome vs. a separate surface.
- Whether the substrate monitor should be the canonical surface for these signals
  (avoiding any per-turn pill mutation entirely).

Those are upstream decisions. This map only establishes: *if we wire the pill to
data, here is what the data is, where it lives, and what each option costs.*

---

## 8. Closing

The current pill is honest: it asserts presence without claiming knowledge of the
member. Any change should preserve that honesty. Option B preserves it. Option A
breaks it. Option C trades visible breakage for slower breakage.

> *The pill should say what MAIA has available to draw from. Not what MAIA
> thinks the member is. That is the relational contract.*

---

## 9. Addendum — Option D selected (2026-05-23, later same day)

After review of this map, the decision was made not to wire the pill to any signal.
A stronger move surfaced in dialogue: **remove the pill entirely.**

### Reasoning

The pill currently reads *"memory · continuity active."* That is not a status
indicator — it is an **assertion**. It claims the property is active. Since the
pill is static (not data-bound to any continuity signal), it will keep asserting
"active" even if continuity is degraded. That is the static-passive shape of the
*infrastructure failure disguised as relational language* canary (2026-05-22):
a UI claim that does not follow underlying state.

Compounding considerations:

- The pill resolves experientially as **noise** before it resolves as orientation,
  atmosphere, usefulness, or coherence — it is not earning its cognitive weight.
- MAIA/Soullab already operates near the edge of over-meaning, projection,
  symbolic inflation, and interpretive gravity. A meaningless-but-suggestive
  symbol invites users to unconsciously construct explanations for it, producing
  covert typing, false patterning, imagined system intelligence, or mystical
  authority leakage.
- Stronger continuity signals already exist: the memory band, pacing,
  conversational continuity, tone, return-awareness, elemental language elsewhere,
  and the actual interaction itself. The pill is redundant against these.

### Principle named

> *No static UI should claim continuity unless it is bound to verified continuity
> state.*

### Action taken

- **Removed** the visible memory pill JSX block from
  [`components/ui/ModernTextInput.tsx`](../../components/ui/ModernTextInput.tsx)
  (the `{hasMemory && (...)}` `motion.div` formerly at lines 368-389).
- **Not replaced** with an aria-live status container or decorative rule —
  either would be a quiet invitation to re-symbolize the slot later.
- **Submit error banner preserved** — sits in its own `AnimatePresence` block
  with independent positioning and was not touched.
- **No changes** to runtime observability, routing, memory transport, schema,
  `member_spiral_state`, `memoryHealth`, `runtime_events`, conductor state, or
  MAIA response logic. The substrate monitor at `/admin/maia/substrate` remains
  the canonical surface for memory-health signals.
- **Props `hasMemory` and `lastConnectionTime`** remain in the component interface
  because they are still consumed by other logic in the same file (line 134-135).

### What this map now records

Options A, B, C documented and rejected. Option D (remove) executed. If the
question of memory-pill visibility returns in the future, this map is the prior
record of the reasoning that led to removal — start here before re-introducing.
