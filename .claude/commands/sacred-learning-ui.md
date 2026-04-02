---
description: "Build UI components and pages for sacred learning domain"
allowed-tools: "Read,Grep,Glob,Write,Edit,Bash"
---

# Sacred Learning UI

You are building the frontend components and pages for the Sacred Learning Domain.

## REQUIRED READING FIRST

Read these files:
- `docs/sacred-learning/ARCHITECTURE_BRIEF.md` (especially sections 6, 9)
- `docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md` (especially section 3: Labeling Rules)
- `docs/sacred-learning/MVP_SCOPE.md`

## DESIGN PRINCIPLES

The experience should feel:
- Reverent and spacious
- Clear and grounded
- Not performative or ornamental
- Not like a productivity app or social media
- Source-aware at every moment

## COMPONENTS TO BUILD

### `components/sacred-learning/SourceLabel.tsx`
Authority level badge. 6 variants matching the authority hierarchy:
- Level 1 (Revelation): Gold/amber
- Level 2 (Exegesis): Deep blue
- Level 3 (Mystical): Purple
- Level 4 (Contemplative): Teal/green
- Level 5 (Reflection): Warm gray
- Level 6 (Synthesis): Light gray with border

Label formats defined in Sacred Source Integrity Policy section 3.

### `components/sacred-learning/PassageView.tsx`
Displays a Qur'anic passage:
- Arabic text (RTL, proper Arabic font)
- Translation below (with translator attribution)
- Surah name + ayah reference
- SourceLabel component for authority marking

### `components/sacred-learning/CommentaryLayers.tsx`
Toggleable commentary sections:
- Each layer is collapsible/expandable
- Each carries its own SourceLabel
- Order: Tafsir → Mystical → Contemplative
- Never shown without source attribution

### `components/sacred-learning/ReflectionPrompt.tsx`
Contemplative question display:
- Visually distinct from source material (Level 6 styling)
- Clear "AI-composed" label
- Spacious layout inviting pause

### `components/sacred-learning/PracticeInvitation.tsx`
Practice suggestion:
- Visually distinct (Level 6 styling)
- Clear "AI-composed" label
- Oriented toward embodied action, not screen time

### `components/sacred-learning/ReflectionJournal.tsx`
Text input linked to passage:
- Simple textarea
- Saves via `/api/sacred-learning/reflection`
- Respects Sanctuary Mode
- Shows previous reflections on return visits

### `components/sacred-learning/DailyEncounter.tsx`
Full daily flow wrapper combining all above in sequence:
PassageView → CommentaryLayers → ReflectionPrompt → PracticeInvitation → ReflectionJournal

## PAGES TO BUILD

### `/sacred-learning` (page.tsx)
Daily encounter page. Feature-flagged (`sacredLearning`).
Fetches from `/api/sacred-learning/daily`.

### `/sacred-learning/passage/[id]` (page.tsx)
Single passage detail view.
Fetches from `/api/sacred-learning/passage/[id]`.

### `/sacred-learning/saved` (page.tsx)
Saved passages collection.
Fetches from `/api/sacred-learning/saved`.

## EXISTING PATTERNS TO FOLLOW

- Check `components/checkin/DailyCheckin.tsx` for step-based flow pattern
- Check existing page layouts for MAIA's visual language
- Use existing Tailwind classes and design tokens
- Follow existing component file structure

## ARABIC TEXT REQUIREMENTS

- Arabic text must render RTL
- Use a proper Arabic typeface (Amiri, Scheherazade, or system Arabic)
- Arabic text should be visually larger/more prominent than translation
- Ensure proper harakat (vowel marks) display

## NON-NEGOTIABLE UI RULES

- Every content block carries a visible SourceLabel — labels cannot be hidden or toggled off
- Level 6 content is NEVER adjacent to Level 1 without clear visual separation
- Arabic text is never replaced with transliteration
- Commentary layers show author + work attribution, not just the text
- The journal respects Sanctuary Mode — if active, show indication that reflection won't be stored
