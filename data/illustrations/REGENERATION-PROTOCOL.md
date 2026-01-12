# Regeneration Protocol

How to safely refine illustrations without style drift.

---

## Core Principle

**Constraint preserves coherence.**

Every regeneration decision should answer: "Does this serve the visual cosmology, or just my mood right now?"

The style bible is law. Deviation requires conscious amendment, not casual drift.

---

## When to Regenerate

### Valid Reasons

| Reason | Action |
|--------|--------|
| Image is too busy/cluttered | Simplify prompt, add "minimal, sparse" |
| Wrong color palette | Specify exact palette in prompt |
| Figure too detailed/literal | Add "simple silhouette only, no details" |
| Feels modern/cinematic | Add temporal quality: "primordial, ancient" |
| Doesn't match adjacent images | Regenerate with reference to working images |
| Technical issue (artifacts, wrong aspect) | Regenerate same prompt |

### Invalid Reasons

| Reason | Why to Resist |
|--------|---------------|
| "I like this other style better" | Style bible exists for a reason |
| "Let's try something different" | Consistency > novelty |
| "This one is almost perfect but..." | Almost perfect is often good enough |
| "What if we made it more..." | More is usually wrong |
| Boredom | Take a break instead |

---

## The Three-Strike Rule

Before regenerating any image:

1. **Strike 1:** Does it violate the style bible? (If no, keep it)
2. **Strike 2:** Does it clash with adjacent images? (If no, keep it)
3. **Strike 3:** Is the issue fixable with minor prompt adjustment? (If yes, try once)

If an image survives all three strikes, **it stays**.

Your first instinct after seeing 4 variations is usually correct. Trust it.

---

## Prompt Modification Hierarchy

When refining, modify in this order (least to most disruptive):

### Level 1: Add Constraints (Safe)
```
Original: "A human silhouette standing..."
Modified: "A human silhouette standing... simple form, no details, minimal"
```

### Level 2: Specify Parameters (Safe)
```
Original: "Warm amber palette..."
Modified: "Warm amber #D97706 to white-gold #FBBF24 palette..."
```

### Level 3: Adjust Composition (Moderate)
```
Original: "Center-weighted composition..."
Modified: "Lower-third anchored composition, more negative space above..."
```

### Level 4: Change Subject Treatment (Risky)
```
Original: "A human silhouette..."
Modified: "An abstract form suggesting human presence..."
```

### Level 5: Rewrite Core Concept (Dangerous)
Only do this if the original concept fundamentally doesn't work.
Requires style bible review before proceeding.

---

## Reference Image Protocol

When regenerating to match existing images:

1. **Identify the anchor** — Which existing image best represents the target style?
2. **Extract its qualities** — What specifically makes it work? (luminosity, negative space ratio, color temperature, line weight)
3. **Add those qualities to prompt** — Be explicit: "matching luminosity of threshold-ch05"
4. **Generate in same session** — Style consistency is higher within a single generation session

### Using Midjourney's Reference Features

```
/imagine [your prompt] --sref [URL of anchor image] --sw 50
```

- `--sref` = style reference
- `--sw` = style weight (0-100, start at 50)

Use sparingly. Over-reliance on style reference creates homogeneity.

---

## Version Control for Images

### Naming Convention
```
threshold-ch05-sacred-flame-v1.png  (first accepted version)
threshold-ch05-sacred-flame-v2.png  (if regenerated)
threshold-ch05-sacred-flame.png     (current/final, no version suffix)
```

### Archive Structure
```
public/
  illustrations/
    thresholds/
      threshold-ch05-sacred-flame.png      # Current
    _archive/
      threshold-ch05-sacred-flame-v1.png   # Previous versions
      threshold-ch05-sacred-flame-v2.png
```

### Decision Log
Keep a simple log of why images were regenerated:

```markdown
## Regeneration Log

### 2026-01-12
- threshold-ch05 v1→v2: Too literal, flame looked like actual fire. Added "abstract light form, not literal fire"
- vignette p-03 v1→v2: Figure too detailed. Added "simple silhouette only"
```

---

## Style Drift Detection

Warning signs that you're drifting:

| Symptom | Diagnosis |
|---------|-----------|
| New images feel "off" next to old ones | Style drift in progress |
| Prompts getting longer and longer | Over-specification, return to core |
| Adding new style terms not in bible | Unauthorized expansion |
| Spending more than 3 regenerations on one image | Decision fatigue, step away |
| "This is good but not quite right" loop | Perfectionism, accept good enough |

### Recovery Protocol

If drift is detected:

1. **Stop generating**
2. **Return to style bible** — Re-read core principles
3. **Review anchor images** — The first 3-4 that felt right
4. **Simplify prompts** — Strip back to essential elements
5. **Generate one test image** — Using simplified prompt
6. **Compare to anchors** — Does it belong in the same world?

---

## Batch Coherence Strategy

When generating a set (e.g., all 12 thresholds):

### Session Discipline
- Generate all images in **one or two sessions**
- Don't spread across days/weeks (model versions change, your eye drifts)
- Use same Midjourney settings throughout

### Selection Discipline
- Select all "keepers" before any refinement
- Compare keepers as a set before finalizing
- Ask: "Do these 12 images feel like they came from the same manuscript?"

### The Squint Test
- View all images at thumbnail size (100px)
- Do they have consistent:
  - Luminosity?
  - Color temperature?
  - Density/negative space?
  - Silhouette language?

If one stands out as "different," that's your problem image.

---

## Amendment Process

If the style bible itself needs updating:

1. **Document the case** — Why does current guidance fail?
2. **Propose specific change** — Not "make it better" but "add X constraint"
3. **Test with 2-3 images** — Does the amendment improve coherence?
4. **Update bible explicitly** — Add to the document, date the change
5. **Note in regeneration log** — "Style bible amended: [change]"

The bible can evolve, but evolution must be conscious and recorded.

---

## Emergency Stops

### When to Abandon an Image Entirely
- After 5+ regenerations with no improvement
- When the concept itself doesn't translate visually
- When every variation violates the style bible

### What to Do Instead
- Skip to next image, return later with fresh eyes
- Consider whether the concept needs rethinking (content issue, not execution)
- Ask: "Is this image necessary, or can the sequence work without it?"

---

## Final Checklist Before Finalizing Any Image

```
[ ] Does it align with style bible principles?
[ ] Does it match the elemental color palette?
[ ] Is the temporal quality right (ancient, not modern)?
[ ] Does it have generous negative space?
[ ] Is the figure (if any) archetypal, not individual?
[ ] Does it pass the squint test with adjacent images?
[ ] Would I recognize its element at thumbnail size?
[ ] Does it feel recovered, not rendered?
```

If all boxes checked: **Ship it.**

---

*Regeneration Protocol for Elemental Alchemy Illustrations*
*Constraint preserves coherence*
