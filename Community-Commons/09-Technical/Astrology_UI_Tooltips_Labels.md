# Astrology UI Tooltips + Labels

## Module Header

### Title
**Astrology with MAIA**

### Subtitle
**Paste your chart or birth info. Choose a lens. Get a clear, grounded reading.**

---

## Input Field

### Placeholder Text
"Paste birth info, placements, or a chart dump (Astro.com / Solar Fire). Add your question at the end."

### Helper Text (Below Input)
"Don't have your chart? Just enter your birth date, time, and location."

---

## Lens Selector

### Section Label
**Choose Your Lens**

### Tooltip (Info Icon)
"Different lenses emphasize different aspects of your chart. Let MAIA choose, or pick one yourself."

### Lens Options + Tooltips

| Lens | Label | Tooltip |
|------|-------|---------|
| Developmental | Developmental | "Inner growth, shadow patterns, maturation path." |
| Mythic | Mythic | "Archetypes, soul-story, initiation themes, meaning." |
| Timing | Timing | "Transits/progressions/returns — what's activating now and next." |
| Integration | Integration | "Practical next steps, somatic support, journaling prompts." |
| Spiralogic | Spiralogic | "Elemental balance + facet phase + coherence practices." |
| Auto | Let MAIA Choose | "MAIA picks the best lens based on your question." |

---

## House System Selector

### Section Label
**House System**

### Tooltip (Info Icon)
"Choose a house system, or leave default. Whole Sign is the cleanest for developmental reads."

### Options + Tooltips

| System | Label | Tooltip |
|--------|-------|---------|
| whole_sign | Whole Sign | "Clean archetypal containers. Best for developmental clarity." |
| placidus | Placidus | "Psychological nuance. Needs accurate birth time." |
| porphyry | Porphyry | "Balanced approach. Good angle-based narrative." |
| equal | Equal | "Stable, consistent. Good when birth time is uncertain." |
| koch | Koch | "Subjective inner experience. Some resonate strongly." |

---

## Toggle Options

### Compare Two House Systems
**Label:** Compare house systems

**Tooltip:** "See how Whole Sign vs Placidus shifts emphasis."

**Sub-label when on:** "Showing: Whole Sign + Placidus comparison"

### Include Timing
**Label:** Include timing

**Tooltip:** "Adds transits/progressions if you provided dates or current context."

### Depth Level
**Label:** Reading depth

**Options:**
- Short — "Quick overview, 1-2 paragraphs"
- Medium — "Standard depth, covers key themes"
- Deep — "Comprehensive, multiple sections"

---

## Output Section Headers

### Core Pattern
**Label:** Core Pattern

**Tooltip:** "The essential signature of your chart — what's structurally true."

### Current Activation
**Label:** Current Activation

**Tooltip:** "What transits or progressions are live right now."

### Integration Path
**Label:** Integration Path

**Tooltip:** "Practical steps, practices, and next moves."

### Archetypal Story
**Label:** Archetypal Story

**Tooltip:** "The mythic narrative active in your life. (Mythic lens)"

### Elemental Balance
**Label:** Elemental Balance

**Tooltip:** "Your Fire/Water/Earth/Air/Aether distribution. (Spiralogic lens)"

### Facet Phase
**Label:** Facet Phase

**Tooltip:** "Where you are in the 12-facet Spiralogic cycle."

### Timing Windows
**Label:** Timing Windows

**Tooltip:** "When specific transits peak and what they activate. (Timing lens)"

---

## Action Buttons

### Generate Reading
**Label:** Generate Reading

**Loading state:** "Reading your chart..."

### Ask Follow-Up
**Label:** Ask a Follow-Up

**Placeholder:** "What else would you like to explore?"

### Save Reading
**Label:** Save Reading

**Tooltip:** "Save this reading to your profile."

### Share Reading
**Label:** Share

**Tooltip:** "Copy a shareable summary."

---

## Empty States

### No Chart Data
**Headline:** No chart yet

**Body:** "Paste your birth info or chart placements above to get started."

### No Timing Data
**Note (inline):** "Add transits or current dates to see timing analysis."

---

## Error States

### Invalid Birth Data
"Couldn't parse birth info. Please check the format: date, time (optional), location."

### Chart Calculation Failed
"Something went wrong calculating your chart. Please try again."

### Timeout
"Reading took too long. Try a shorter question or simpler input."

---

## Accessibility Labels

### Lens Selector
`aria-label="Select astrology lens for reading"`

### House System Selector
`aria-label="Select house system for chart calculation"`

### Output Sections
`role="region" aria-label="[Section name] section"`

### Toggles
`role="switch" aria-checked="[true/false]"`
