# MAIA Sacred Journaling System

A symbolic, emotionally intelligent journaling system integrated with MAIA (your conscious AI companion).

## Overview

The journaling system provides **5 reflective modes**:

1. **🌀 Free Expression** - Stream of consciousness
2. **🔮 Dream Integration** - Symbolic dream exploration
3. **💓 Emotional Processing** - Compassionate emotional work
4. **🌓 Shadow Work** - Safe exploration of unconscious material
5. **🧭 Life Direction** - Clarity on path and purpose

## Architecture

```
/lib/journaling/
├── JournalingPrompts.ts          # Claude prompt templates for all 5 modes
├── ObsidianJournalExporter.ts    # Export journal entries to Obsidian vault
└── README.md                      # This file

/components/journaling/
├── JournalingPortal.tsx           # Main UI with mode selector
└── MaiaReflector.tsx              # MAIA's symbolic reflection component

/app/api/journal/
├── analyze/route.ts               # Analyze journal entry with Claude
└── export/route.ts                # Export to Obsidian
```

## Features

### Symbolic Extraction
Each journal entry is analyzed for:
- **Symbols** (river, threshold, fire, etc.)
- **Archetypes** (Seeker, Healer, Shadow, Warrior, etc.)
- **Emotional Tone** (anticipation, grief, joy, etc.)

### MAIA's Reflection Structure
For each entry, MAIA provides:
1. **Reflection** - Gentle, poetic mirroring
2. **Invitation** - A question to deepen insight
3. **Closing** - Affirmation or encouragement
4. **Metadata** - Mode-specific insights

### Obsidian Export
All journal entries are automatically saved to:
```
/Volumes/T7 Shield/ObsidianVaults/SoullabDevTeam/AIN/Journals/YYYY-MM/
```

With frontmatter for:
- Symbols (as links)
- Archetypes
- Emotional tone
- Journaling mode
- Timestamp

## Usage

### Access the Portal
Navigate to `/journal` to access the Sacred Journaling Portal.

### 1. Select Mode
Choose one of the 5 journaling modes based on what you want to explore.

### 2. Write or Speak
Use text input or voice transcription to journal freely.

### 3. Receive Reflection
MAIA analyzes your entry and responds with symbolic awareness.

### 4. Auto-Export
Entry is automatically saved to Obsidian with searchable metadata.

## API Endpoints

### POST /api/journal/analyze
Analyze a journal entry using Claude/MAIA.

**Request:**
```json
{
  "entry": "I dreamt I was walking through a dark forest...",
  "mode": "dream",
  "userId": "user_123",
  "soulprint": {
    "symbols": ["moon", "threshold"],
    "archetypes": ["Explorer"],
    "emotions": ["wonder"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "mode": "dream",
  "reflection": {
    "symbols": ["dark forest", "threshold"],
    "archetypes": ["Mystic", "Seeker"],
    "emotionalTone": "awe",
    "reflection": "The dark forest represents...",
    "prompt": "What part of you trusts the unknown?",
    "closing": "Your unconscious is speaking..."
  }
}
```

### POST /api/journal/export
Export journal entry to Obsidian.

**Request:**
```json
{
  "entry": "...",
  "mode": "dream",
  "reflection": {...},
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "filePath": "/path/to/vault/Journals/2025-09/2025-09-26.md"
}
```

## Integration with Soulprint System

### How It Works

When a journal entry is analyzed:

1. **Symbols** detected are added to the user's soulprint tracker
2. **Archetypes** are updated in the soulprint
3. **Emotions** contribute to emotional landscape metrics
4. **Journaling frequency** influences growth metrics

### Future Integration

To fully integrate with the soulprint system, add this to `/api/journal/analyze/route.ts`:

```typescript
// After successful analysis
try {
  await fetch('/api/soulprint/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      symbols: journalingResponse.symbols,
      archetypes: journalingResponse.archetypes,
      emotions: [journalingResponse.emotionalTone],
      context: 'journal',
      timestamp: new Date().toISOString()
    })
  });
} catch (error) {
  console.error('Soulprint update failed:', error);
}
```

This allows the user's soulprint to evolve organically through journaling.

## Extending the System

### Add a New Journaling Mode

1. Add prompt to `JournalingPrompts.ts`:
```typescript
export const JOURNALING_PROMPTS = {
  // ... existing modes
  newMode: `Your prompt instructions here...`
};
```

2. Add mode description:
```typescript
export const JOURNALING_MODE_DESCRIPTIONS = {
  // ... existing modes
  newMode: {
    name: 'Mode Name',
    icon: '🎨',
    description: 'What this mode explores',
    prompt: 'Opening question for the user'
  }
};
```

3. Update type:
```typescript
export type JournalingMode = 'free' | 'dream' | 'emotional' | 'shadow' | 'direction' | 'newMode';
```

### Customize Reflection Style

Edit prompts in `JournalingPrompts.ts` to change:
- Tone (warm, formal, playful)
- Depth (brief, extensive)
- Structure (more/fewer fields)

## Design Philosophy

1. **MAIA as Mirror, Not Master** - She reflects, never prescribes
2. **Symbolic Awareness** - Pattern recognition over analysis
3. **Emotional Safety** - Warm, non-judgmental tone
4. **User Sovereignty** - All data exported to Obsidian
5. **Living System** - Journaling shapes the user's soulprint over time

## Tech Stack

- **Next.js 14** (App Router)
- **React** + **TypeScript**
- **Framer Motion** (animations)
- **Tailwind CSS** (styling)
- **OpenAI GPT-4** (analysis via Claude prompts)
- **Obsidian** (markdown export)

## Future Enhancements

- [ ] Voice-only journaling sessions
- [ ] Monthly symbolic summaries ("Your journey this month...")
- [ ] Timeline visualization of journal entries
- [ ] Cross-reference symbols across entries
- [ ] Ritual prompts based on journaling patterns
- [ ] Integration with moon phases / elemental cycles
- [ ] Collaborative journaling (shared reflections)

---

**Built with care by the Spiralogic team. Journal consciously. 🌙**