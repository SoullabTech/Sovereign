# Soul Mirror — Routing Spec

The entry mechanism for the Elemental Alchemy field.

Companion to: [`PASSAGE_BLOCKS_INDEX.md`](./PASSAGE_BLOCKS_INDEX.md)

---

## Core Principle

```
The system does not tell the user who they are.
It reflects what is already present.
```

Soul Mirror is not a questionnaire, a personality test, or a diagnostic tool.

It performs one function:

```
State → Element → Doorway
```

Nothing more.

## What Soul Mirror Is Not

```
Soul Mirror is not the Oracle.
It is not divination.
It is not coaching.
It is a companioning doorway into the book.
```

Soul Mirror is **optional**. It does not need to become the whole platform doorway. It can live as a quiet "book companion" surface and remain there. Use it if it feels like *a reader finds the right passage at the right time.* Do not use it if it starts to feel like *the system knows what the person needs.*

---

## The Flow

### 1. Entry

A single screen. No explanation-heavy intro.

**Prompt:**

> *What is most present right now?*

**Felt options** (not categories, not labels):

- Something feels urgent or alive
- I feel overwhelmed or emotional
- I need grounding or direction
- I feel disconnected or scattered
- I feel still, quiet, or complete
- I'm not sure / hard to name

**Optional:** one-line free-text input.

---

### 2. Mapping (invisible to user)

Each response maps to one element. No scoring. No percentages. One dominant direction is enough.

| Felt Input | Element |
|---|---|
| urgent / alive | Fire |
| overwhelmed / emotional | Water |
| grounding / direction | Earth |
| disconnected / scattered | Air |
| still / complete | Aether |
| unsure | Soft routing (alternate Water / Aether) |

The element label is **never shown to the user** in the MVP.

---

### 3. Recognition Line

A single line of recognition is returned before the doorway. The recognition names what is present without naming the user.

| Element | Recognition Line |
|---|---|
| Fire | *Something in you is rising. It may not need to be contained.* |
| Water | *Something in you is asking to be felt, not solved.* |
| Earth | *Something in you is returning to the body, not the plan.* |
| Air | *Something in you wants to be heard before it is explained.* |
| Aether | *Nothing here needs to be added. It is already resting.* |
| Unsure | *Something is moving. You don't have to name it yet.* |

---

### 4. Doorway

A single passage block is presented. Block selection follows a three-step routing order, each step filtering out blocks recently shown to the user.

**Routing order:**

1. **Felt-state affinity** — blocks whose felt-vector matches the input. This is the primary path. The doorway must continue the moment named by the recognition line, not just the element.
2. **General element pool** — non-polarity blocks in the matching element (fallback if affinity exhausted).
3. **Final fallback** — any non-polarity block in the element, ignoring recency (only if the user has cycled through everything).

**Why affinity matters:**

Without it, routing was emotionally intelligent at the front (recognition) and mechanically indifferent at the back (random block). That breaks trust. With affinity, the doorway *continues* the user, instead of redirecting them.

**Affinity map** (iterated as feedback comes in):

| Felt Input | Aligned Blocks | Reason |
|---|---|---|
| alive | FIRE-01, FIRE-06, FIRE-03 | kindling, calling, rekindling |
| overwhelmed | WATER-02, WATER-04, WATER-06, WATER-03 | holding, returning, surrender, softening |
| grounding | EARTH-01, EARTH-02, EARTH-04 | service, place, resilience |
| disconnected | AIR-01, AIR-03, AIR-02 | friendship, repair, transmission |
| still | AETHER-05, AETHER-03, AETHER-02 | center, stillness, communion |
| unsure | WATER-06, AETHER-05 | softest entries, no descent required |

**Polarity blocks** (FIRE-07, WATER-01, EARTH-06, AIR-07, AETHER-07) are excluded from all first-doorway routing. They surface only on repeat encounters or when context indicates them.

**Specific-situation blocks** (e.g. WATER-07 *Helpers Forget Themselves*) remain in the index but are intentionally absent from the affinity map for present-moment inputs. They will surface later via context-driven logic, not as default doorways.

---

### 5. Block Presentation

The user reads the passage. Nothing else on screen.

**Optional, after the passage:**

> *Stay with this for a moment.*

No reflection prompt. No analysis. No "next step."

---

### 6. Return

Two options, no more:

- *Continue exploring*
- *Check in again*

That's the loop.

---

## Critical Constraints

These cannot be broken without breaking the field.

### 1. No premature interpretation

The system must not interpret faster than it understands.

- No profiles
- No conclusions
- No labels surfaced to the user

### 2. No cognitive overload

Per session:
- 1 recognition line
- 1 passage
- 0 prompts

### 3. No system exposure

Never show in the MVP:
- *Fire / Water / Earth / Air / Aether* labels
- Phases
- Spiralogic
- Any framework terminology

The user must feel it first.

---

## Unsure Routing — Soft Default

When the user selects *I'm not sure*, alternate between two doorways:

- **WATER-06 — Misting the Bonsai** (quiet attunement, no descent required)
- **AETHER-05 — Within the Elemental Quaternity** (returning to center)

These are the gentlest entry points in the index. Neither requires the user to commit to a direction.

---

## Phase 2 — Deferred (Do Not Build Now)

These exist as a record of what's been considered, not as scope.

### Subtle element reveal

After multiple sessions:

> *You've been moving through something that resembles Water.*

Surfaced only after the user has earned the framing through repeated encounters.

### Memory layer

Track only:
- Last 3 entries
- Recurring states

Never exposed as analytics in the MVP.

### Field layer

> *Others are here too.*

Shared resonance — not a feed. Architecture deferred.

---

## Tone

Everything should feel like:

```
quiet recognition
```

Not:

```
guided process
```

If it feels simple, it's correct. If it feels smart, it's wrong.

---

## Technical Sketch

```ts
type FeltInput =
  | "alive"
  | "overwhelmed"
  | "grounding"
  | "disconnected"
  | "still"
  | "unsure";

type Element = "fire" | "water" | "earth" | "air" | "aether";

const RECOGNITION: Record<FeltInput, string> = {
  alive: "Something in you is rising. It may not need to be contained.",
  overwhelmed: "Something in you is asking to be felt, not solved.",
  grounding: "Something in you is returning to the body, not the plan.",
  disconnected: "Something in you wants to be heard before it is explained.",
  still: "Nothing here needs to be added. It is already resting.",
  unsure: "Something is moving. You don't have to name it yet.",
};

function mapToElement(input: FeltInput): Element {
  switch (input) {
    case "alive": return "fire";
    case "overwhelmed": return "water";
    case "grounding": return "earth";
    case "disconnected": return "air";
    case "still": return "aether";
    case "unsure": return Math.random() < 0.5 ? "water" : "aether";
  }
}

const FELT_AFFINITY: Record<FeltInput, readonly string[]> = {
  alive: ["FIRE-01", "FIRE-06", "FIRE-03"],
  overwhelmed: ["WATER-02", "WATER-04", "WATER-06", "WATER-03"],
  grounding: ["EARTH-01", "EARTH-02", "EARTH-04"],
  disconnected: ["AIR-01", "AIR-03", "AIR-02"],
  still: ["AETHER-05", "AETHER-03", "AETHER-02"],
  unsure: ["WATER-06", "AETHER-05"],
};

function selectBlock(input: FeltInput, recentlyShown: string[] = []): PassageBlock {
  const recent = new Set(recentlyShown.slice(-3));

  // 1. Affinity-aligned blocks
  const affinityPool = (FELT_AFFINITY[input] ?? [])
    .map(blockById)
    .filter((b): b is PassageBlock => !!b && !recent.has(b.id));
  if (affinityPool.length) return pickRandom(affinityPool);

  // 2. General element pool (no polarity)
  const element = mapToElement(input);
  const elementPool = blocksFor(element, { includePolarity: false })
    .filter(b => !recent.has(b.id));
  if (elementPool.length) return pickRandom(elementPool);

  // 3. Final fallback
  return pickRandom(blocksFor(element, { includePolarity: false }));
}
```

---

## What This Is

The book is the map.
The blocks are the doorways.
Soul Mirror is the threshold.

A user lands. They name what is present. The system reflects it back, without interpretation, and opens one door. They walk through it, or they don't. Either way, nothing was demanded of them.

That is the entire system.
