# Audiobook Manuscript Formatting Guide
## Preparing Your Elemental Alchemy Book for ElevenLabs

---

## File Format: Use EPUB

**Best practice:** Export your manuscript as EPUB with proper heading structure.

> "EPUB is the best file format to use. If the EPUB is well-structured and correctly formatted, it will automatically split each chapter into its own chapter in Studio."

### Heading Hierarchy

| Element | Format As | Example |
|---------|-----------|---------|
| Chapter titles | **Heading 1** | "Chapter One: The Element of Fire" |
| Section titles | **Heading 2** | "The Three Fires" |
| Subsections | **Heading 3** | "Working with Natural Fire" |
| Body text | Normal/Paragraph | Regular content |

---

## Pause & Transition Syntax

### Method 1: SSML Break Tags (Recommended for precise control)
```
<break time="1.0s" />   — 1 second pause
<break time="1.5s" />   — 1.5 second pause
<break time="2.0s" />   — 2 second pause
<break time="3.0s" />   — 3 second max
```

**Note:** Eleven v3 model doesn't support SSML. Use punctuation methods instead if using v3.

### Method 2: Punctuation (Works with all models)
```
—              Single em-dash = short pause
— —            Double em-dash = medium pause
— — —          Triple em-dash = longer pause
...            Ellipsis = hesitant/contemplative pause
```

### Method 3: Studio Timeline
After generation, use the Studio timeline to:
- Adjust timing between paragraphs
- Trim clip edges
- Insert breaks via the "Insert break" button

---

## Formatting Different Elements

### Chapter Openings

**BEFORE (raw manuscript):**
```
Chapter Three
The Element of Water
After the fire comes the water...
```

**AFTER (formatted for audiobook):**
```
Chapter Three.

<break time="1.5s" />

The Element of Water.

<break time="2.0s" />

After the fire comes the water...
```

### Section Transitions

**BEFORE:**
```
...may your fire burn true.

The Three Fires

In alchemical tradition, we speak of three distinct types of Fire...
```

**AFTER:**
```
...may your fire burn true.

<break time="2.0s" />

The Three Fires.

<break time="1.0s" />

In alchemical tradition, we speak of three distinct types of Fire...
```

### Subsection Headers

**BEFORE:**
```
Working with Fire: Practices

Let me offer several practices...
```

**AFTER:**
```
<break time="1.5s" />

Working with Fire — Practices.

<break time="1.0s" />

Let me offer several practices...
```

### Lists and Enumerations

**BEFORE:**
```
The seven classical operations are:
First, calcination
Second, dissolution
Third, separation
```

**AFTER:**
```
The seven classical operations are as follows:

<break time="0.5s" />

First — calcination — the burning by fire.

<break time="0.5s" />

Second — dissolution — the dissolving in water.

<break time="0.5s" />

Third — separation — the discernment of air.
```

### Segment/Part Transitions

For major transitions between parts of the book:

```
<break time="3.0s" />

Part Two.

<break time="1.5s" />

Water and the Descent.

<break time="3.0s" />
```

---

## Elements to REMOVE Before Import

Delete these from your manuscript—they shouldn't be read aloud:

- [ ] Page numbers
- [ ] Footnote markers (¹ ² ³)
- [ ] "See page XX" references
- [ ] Figure/image captions (unless you want them read)
- [ ] Table of contents (handle separately)
- [ ] Index entries
- [ ] ISBN/copyright boilerplate
- [ ] "Continued on next page" text
- [ ] Headers/footers

---

## Elements to REWRITE for Audio

### Visual References
**Before:** "As shown in the diagram below..."
**After:** "As we explore in this section..."

### Page References
**Before:** "Return to page 42 for the fire meditation."
**After:** "Return to the fire meditation in Chapter Two."

### Parenthetical Citations
**Before:** "The alchemists understood (Jung, 1953) that..."
**After:** "The alchemists understood that..." (or read the citation if important)

### Complex Tables
Convert to narrative form or omit

### URLs
**Before:** "Visit www.elementalalchemy.com/resources"
**After:** "Visit elemental alchemy dot com slash resources" (or omit)

---

## Emphasis and Pronunciation

### Emphasis (Capitalization)
```
This is NOT about escaping the body.
The goal is incarnation — IN-carnation — spirit made flesh.
```

### Pronunciation Guidance (IPA)
For unusual words, use SSML phoneme tags:
```
The <phoneme alphabet="ipa" ph="əˈθænɔːr">athanor</phoneme> is the alchemical furnace.
```

Or spell it out:
```
The athanor (ah-THAN-or) is the alchemical furnace.
```

### Foreign/Latin Terms
```
Solve et coagula — (SOL-vay et co-AG-u-la) — means dissolve and coagulate.
```

---

## Practical Manuscript Template

Here's how a formatted chapter should look:

```markdown
# Chapter Two

<break time="2.0s" />

# The Element of Fire

<break time="2.5s" />

## Fire Awakens

<break time="1.0s" />

We begin with Fire because Fire is the beginning of all alchemical work. Before anything can be transformed, it must first be ignited. The prima materia — the raw material of the self — lies dormant until Fire awakens it.

<break time="0.5s" />

Picture yourself standing before a great fire. Not a comfortable hearth fire, but something larger — more primal. A fire that demands your attention. A fire that could consume you if you approach carelessly.

<break time="1.0s" />

## The Three Fires

<break time="1.0s" />

In alchemical tradition, we speak of three distinct types of Fire, each with its own nature and application.

<break time="0.5s" />

The first is Natural Fire — the fire of ordinary combustion, of digestion, of the body's metabolism. This is the fire that keeps you alive.

<break time="0.5s" />

The second is Artificial Fire — the fire of effort, discipline, and directed will. This is the fire you bring to your practice.

<break time="0.5s" />

The third is Supernatural Fire — the fire of divine inspiration, of grace, of awakening that comes from beyond the personal self.

<break time="2.0s" />

## Working with Fire — Practices

<break time="1.0s" />

Let me offer several practices for developing your relationship with Fire.

<break time="0.5s" />

First — candle gazing.

Sit in a darkened room with a single candle flame at eye level, about two feet in front of you. Gaze softly at the flame without straining or staring. Allow the flame to fill your vision and your awareness. Do this for ten to twenty minutes.

<break time="1.0s" />

Second — breath of fire.

Sitting comfortably with a straight spine, begin rapid, rhythmic breathing through the nose, emphasizing the exhale with a sharp contraction of the lower belly.

<break time="2.0s" />

## Closing

<break time="1.0s" />

Fire is the great initiator — the spark that begins all transformation.

<break time="0.5s" />

May your fire burn true.

<break time="3.0s" />
```

---

## ElevenLabs Studio Workflow

### Step 1: Import
1. Go to ElevenLabs Studio
2. Click "New audiobook"
3. Upload your formatted EPUB
4. Chapters auto-detect from Heading 1 tags

### Step 2: Assign Voice
1. Select your cloned voice
2. Apply to entire project or specific chapters

### Step 3: Generate & Refine
1. Generate audio chapter by chapter
2. Use timeline to adjust pauses
3. Use "Insert break" for additional pauses
4. Regenerate any sections that need adjustment

### Step 4: Export
1. Export each chapter as separate MP3/WAV
2. Or export full audiobook

---

## Quick Reference: Pause Durations

| Transition Type | Recommended Pause |
|-----------------|-------------------|
| Between sentences | Natural (no tag needed) |
| Between paragraphs | 0.5s - 1.0s |
| Before/after subsection title | 1.0s |
| Before/after section title | 1.5s |
| Before/after chapter title | 2.0s - 2.5s |
| Between major parts | 3.0s |
| End of chapter | 3.0s |

---

## Checklist Before Upload

- [ ] Manuscript saved as EPUB
- [ ] Chapter titles = Heading 1
- [ ] Section titles = Heading 2
- [ ] Page numbers removed
- [ ] Footnotes removed or converted
- [ ] Visual references rewritten
- [ ] Break tags added at transitions
- [ ] Foreign terms have pronunciation guides
- [ ] Complex sentences simplified for listening
- [ ] Test first chapter before processing entire book
