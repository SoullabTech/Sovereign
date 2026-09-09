# EVIDENCE-NAMING-01 — name the observation before naming its meaning

> ⭐⭐ **The specificity of a claim may not exceed the specificity of the evidence that supports it.**
> ⭐⭐ **A measurement should not acquire a diagnosis merely by being given one as a name.**

**Opened 2026-09-09.** Discovered by the *Sacred Is Not A Symptom* audit; ⛔ **not a violation of that
canon.** Its mechanism is vocabulary-invariant and it **passes** that canon's substitution falsifier.
It read as a sacred-as-symptom defect only because of what it is called.

⭐ **This rule will be needed in far more places than spirituality.**

## The instance

`lib/memory/ConsciousnessMemoryLattice.ts:643`

```ts
if (mentalCount > emotionalCount * 3) patterns.push('potential_spiritual_bypassing');
```

**What the evidence can establish:**

```text
mental_tagged_events > 3 × emotional_tagged_events   over a seven-day window
```

**What the name claims:** *spiritual bypassing* — a relationship to experience, over an unbounded
time frame, with an attributed motive. ⛔ **The ratio supports none of that.**

## ⚠️ The existing gloss is ALSO too strong

`lib/memory/stores/PatternMemoryStore.ts:47` describes the same pattern as:

> *"Mental insights without emotional integration"*

⭐ **That is a second overclaim, and a subtler one.** The ratio establishes **fewer emotional-tagged
events** — not *lack of emotional integration*. **Integration is another inference**, requiring
evidence about how material was metabolized, which no event count carries. A member may integrate
emotionally without generating emotional-tagged events at all.

## Owed

Rename toward the measurement, e.g. `high_mental_to_emotional_ratio` or
`mental_emotional_imbalance_signal`, described as:

> *"Mental-tagged events exceeded emotional-tagged events by more than 3:1 over the observed window."*

⭐ **Then something later may interpret what that means, with additional evidence.** The
interpretation is not forbidden — it is simply not this measurement's to assert.

⛔ **NOT REPAIRED.** Requires a census of readers of `potential_spiritual_bypassing`
(`ConsciousnessMemoryLattice:674`, `PatternMemoryStore`) before the identifier changes, since a
rename that leaves a consumer matching the old string silently disables the pattern.

## Register

```text
Instance         ConsciousnessMemoryLattice:643  ·  PatternMemoryStore:13,47
Mechanism        seven-day event-count ratio; vocabulary-invariant
Canon violated   EVIDENCE-NAMING (not Sacred-as-Symptom)
Status           OPEN
```

---

# Liveness & memory census — 2026-09-09

> ⭐⭐ **Renaming an inference does not repair the downstream meanings already derived from it.**
> ⭐⭐ **Correcting the present label does not correct a false meaning already persisted, embedded,
> and retrievable.**

⚠️ **This is NOT a string rename.** It is a provenance-and-memory migration investigation.

## VERDICT — **OPERATIVE and PERSISTED. Egress to cognition is POSSIBLE.**

⭐ **Materially different from Instance 2, which was latent.**

| Hop | Finding |
|---|---|
| **A · PRODUCTION** | 🔴 **LIVE.** `lib/sovereign/maiaService.ts:3577` calls `lattice.integrateEvent()` in the primary service, gated on `allowLatticeWrite && shouldElevate` — i.e. **longterm memory mode**. A second caller, `app/api/consciousness/memory/integrate/route.ts:76`, is a live API route. |
| **B · PERSISTENCE** | 🔴 **YES.** Detected patterns go to `PatternMemoryStore.upsertByKey()` at confidence `0.7` → `developmental_memories` as `memory_type = 'emergent_pattern'`, storing **key · description · `content_text` · a locally generated EMBEDDING of the description**. ⭐ **`potential_spiritual_bypassing` may already exist in production data.** |
| **C · CONSUMPTION** | `memoryResult.insights` at the maiaService site is **console-logged only** — it does not enter the prompt there. ⚠️ **But `app/api/consciousness/memory/integrate` returns `{ success: true, ...result }` — so the insights EGRESS over an API response.** Whether a member-facing client calls it is a further question. |
| **D · EGRESS to cognition** | ⚠️ **POSSIBLE.** `lib/maia/memoryLoaders.ts:101` selects from `developmental_memories` **with no `memory_type` filter** — `WHERE user_id = $1 AND valid_to IS NULL`, ordered by significance. **Pattern rows are eligible for the memory bundle.** A `content_text` format guard filters the *directional cue*, not the *row*. |

## 🔴 The rename would fracture identity, not fix it

`PatternMemoryStore` uses **the pattern key as identity** (`upsertByKey`, `getByKey`), and the
**embedding is generated from the description**. So a naive rename would:

```text
new detections  → a NEW pattern identity, correctly named
historical rows → REMAIN under `potential_spiritual_bypassing`, with the old
                  description and an embedding computed FROM that description
                  → old and new semantics coexist in the same member's memory
```

⛔ **A rename alone therefore leaves the false meaning intact and adds a second, disconnected one.**

## Three separate semantic targets — ⛔ do not assume one rename fixes all

**1 · The observation name.** ⚠️ Even `imbalance` is too strong — it already asserts the ratio is
undesirable. Closer to what was measured: `high_mental_to_emotional_event_ratio`.

**2 · The stored description.** *"Mental insights without emotional integration"*
(`PatternMemoryStore:47`) must go **independently**. The counts establish neither *insights* nor
*integration*. ⭐ **And it is the description that was embedded** — so this string is not merely
displayed, it is the vector under which the row is semantically retrievable.

**3 · The generated insight.** `synthesizeInsights()` turns the identifier into
*"You're processing mentally more than emotionally…"* — a claim about **how the person is
processing**, from a seven-day event count. ⛔ If that path proves member-facing it needs its own
**Interface Humility** treatment; it must not inherit the new identifier and remain unchanged.

## Untyped seams flagged

```text
maiaService:3577   the `conversationEvent` literal is assembled inline and carries
                   `bypassing: false` — ⚠️ a hard-coded claim of its own, unrelated
                   to the ratio, and worth its own look
integrate route    `event` arrives from an untyped request body
```

## Owed before a character changes

```text
1  Is any historical row present in production under the old key?     UNREAD
2  Does any member-facing client call /api/consciousness/memory/integrate?  UNREAD
3  Do pattern rows actually surface in the bundle, or are they filtered
   out in practice by significance ordering?                          UNREAD
4  Then decide: migrate · invalidate · supersede · or retain as
   explicitly deprecated records
```

⛔ **Nothing renamed. Nothing repaired.** ⭐ A rename before (1)–(3) would be a schema act performed
without knowing what it breaks — and would silently split one member's history into two identities.

---

# ⭐⭐ THE RENAMING TARGET, RECONSIDERED — "Air without Water"

**Founder, 2026-09-09:** *"Mental insights without emotional integration is equivalent to air without
water, in our model."*

⭐ **That is the key to this defect, and it moves the repair.**

## What the measurement actually is

`ConsciousnessMemoryLattice:620-644` counts `lattice_nodes` rows with `event_type = 'mental'` against
`event_type = 'emotional'` over seven days. In Soullab's own model — Water as feeling
(`holoflower/facets-interpretation.ts`, the Water Agent as *Emotional Healing*), Air as the path of
intellect and clear seeing — **that is an AIR-TO-WATER ACTIVITY RATIO.**

## 🔴 So the description is an ELEMENTAL claim wearing CLINICAL clothes

> *"Mental insights without emotional integration"*

**translates an elemental configuration into a deficit diagnosis.** The same state, in the
platform's own language, is *"more Air than Water lately"* — ⭐ **a position in the model, not a
disorder in a person.**

And Chapter 4 — **the very chapter being written in Writer's Studio** — says this configuration is
ordinary and universal:

> *"It is common to find ourselves primarily connected to one element of experience, often
> neglecting the others."*

Each path alone *"becomes a kind of prison"* — said of **all four**, as the human condition. ⛔ **The
model treats one-sidedness as the starting point of development, not as pathology.** The description
inverts that.

## ⭐ This is the sacred-as-symptom rule from the other side

```text
THE SACRED IS NOT A SYMPTOM     sacred VOCABULARY may not become evidence of pathology
AND                             an elemental CONFIGURATION may not either
```

**Air-heavy is not a symptom. It is a place in the model.**

## 🔴 The embedding consequence is sharper than the label's

The description **is what gets embedded** (`PatternMemoryStore:105`). So the row's vector sits in
**clinical semantic space** rather than elemental semantic space. ⭐⭐ **Two members with identical
Air/Water configurations — one described elementally, one clinically — become semantically distant,
and the clinical one retrieves against pathology-adjacent language.** The naming defect is not
cosmetic; it determines what the memory is *near*.

## Where this leaves the repair

⭐ **The MEASUREMENT is closer to lawful than the census implied. What is unlawful is the RENDERING.**

```text
NAME THE OBSERVATION   high_mental_to_emotional_event_ratio
                       — faithful to what was counted: 'mental' and 'emotional'
                         event types, not 'air' and 'water' columns
DESCRIBE IT PLAINLY    "Mental-tagged events exceeded emotional-tagged events by
                       more than 3:1 over the observed window."
THE ELEMENTAL READING  "more Air than Water lately" is an INTERPRETATION MAIA may
                       offer — lawful, native, non-pathologizing — but held loosely
                       and never stored as the observation's identity
```

⚠️ **Do not rename the key to `high_air_to_water_ratio`.** The counted columns are `mental` and
`emotional`; naming the row elementally would embed an interpretation as though it were the
measurement — the same error one layer up. ⭐ **Name the observation by what was counted; let the
elemental reading be something MAIA says, not something the database asserts.**

> ⭐⭐ **Name the observation before naming its meaning — and when the meaning is finally named, name
> it in the language the model actually uses about people, not the language of diagnosis.**
