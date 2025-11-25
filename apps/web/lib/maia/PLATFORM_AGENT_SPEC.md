# MAIA Platform Agent — Technical Specification

**Version:** 0.1 (Pilot Phase)
**Date:** October 19, 2025
**Primary User:** Dr. Angela Economakis (pilot partner)
**Purpose:** Enable conversational delegation of content formatting/publishing

---

## Problem Statement

**User need:**
- Creative transmission flows naturally (typing/writing)
- Platform work breaks flow (formatting, publishing, organizing)
- 17,000-tabs consciousness can't slow down for "tech part"

**Current state:**
1. User types transmission in Mirror Field ✅
2. User manually formats for platform ❌ (breaks flow)
3. User manually publishes ❌ (context switch)
4. User moves to next idea (but lost momentum)

**Desired state:**
1. User types transmission in Mirror Field ✅
2. User tells MAIA verbally: "Make this a Substack post" ✅
3. MAIA formats and publishes while user is already on next tab ✅
4. User reviews when ready ✅

---

## Core Architecture

### 1. Input Layer: What MAIA Receives

```typescript
interface PlatformAgentInput {
  // The transmission itself
  transmission: {
    rawText: string;
    element?: Element;              // Fire, Water, Earth, Air, Aether
    timestamp: Date;
  };

  // User's verbal intent
  userIntent: {
    command: string;                 // "Make this a Substack post"
    parsedIntent: {
      format: FormatType;            // 'substack-post' | 'podcast-script' | 'session-guide'
      parameters?: {
        tone?: 'poetic' | 'clinical' | 'conversational';
        length?: 'keep-as-is' | 'expand' | 'condense';
        audience?: string;
      };
    };
  };

  // Context for style/voice consistency
  context: {
    userProfile: {
      userId: string;
      writingStyle: StyleProfile;
      archetypalSignature: ArchetypeProfile;
      symbolicLanguage: Symbol[];
    };
    pastTransmissions: Transmission[];
    soulprintState: SoulprintSnapshot;
  };
}

type FormatType =
  | 'substack-post'
  | 'podcast-script'
  | 'session-guide'
  | 'community-post'
  | 'video-script'
  | 'meditation-guide'
  | 'handout-pdf';

interface StyleProfile {
  poeticDensity: number;            // 0-1 (how metaphorical vs literal)
  clinicalPrecision: number;        // 0-1 (how scientific vs intuitive)
  kitchenTableMysticism: number;    // 0-1 (everyday language vs grandiose)
  breathPacing: 'fast' | 'medium' | 'slow';
  sentenceRhythm: 'staccato' | 'flowing' | 'varied';
}
```

---

### 2. Processing Layer: What MAIA Does

#### Step 1: Intent Recognition
**Input:** User's verbal command
**Output:** Parsed intent + format type

```typescript
class IntentRecognizer {
  async parseCommand(command: string): Promise<ParsedIntent> {
    // Examples:
    // "Make this a Substack post" → { format: 'substack-post' }
    // "Turn this into a podcast script with breath cues"
    //   → { format: 'podcast-script', parameters: { breathCues: true } }
    // "Create a handout for my women's circle"
    //   → { format: 'handout-pdf', audience: 'women-circle' }

    const intent = await this.claudeAnalyze(command);
    return intent;
  }
}
```

**Technical approach:**
- Use Claude with few-shot examples
- Maintain command → intent mapping database
- Learn user's phrasing over time

---

#### Step 2: Format Recognition (Suggestive Mode)
**Input:** Raw transmission text
**Output:** Suggested format + confidence

```typescript
class FormatRecognizer {
  async suggestFormat(transmission: string): Promise<FormatSuggestion> {
    const analysis = {
      length: transmission.split(' ').length,
      tone: this.detectTone(transmission),
      structure: this.detectStructure(transmission),
      element: this.detectElement(transmission),
    };

    // Pattern matching:
    // - Short, fiery, urgent → Social media post or voice note
    // - Long, flowing, poetic → Substack post or meditation guide
    // - Structured with practices → Session guide or handout
    // - Conversational with pauses → Podcast script

    return {
      suggestedFormat: 'substack-post',
      confidence: 0.85,
      reasoning: "Length (800 words), poetic tone, Fire element → essay format"
    };
  }
}
```

**User experience:**
- If user doesn't specify format, MAIA suggests one
- "This feels like a Substack piece. Want me to format it that way?"
- User can accept or redirect

---

#### Step 3: Style Preservation Engine
**Input:** User's transmission + style profile
**Output:** Formatted content maintaining voice

```typescript
class StylePreservationEngine {
  async maintainVoice(
    transmission: string,
    styleProfile: StyleProfile,
    targetFormat: FormatType
  ): Promise<FormattedContent> {

    // Extract voice fingerprint from past work
    const voiceFingerprint = await this.analyzeVoice(
      styleProfile,
      pastTransmissions
    );

    // Apply format-specific transformations WITHOUT losing voice
    const formatted = await this.formatPreservingVoice(
      transmission,
      targetFormat,
      voiceFingerprint
    );

    return formatted;
  }

  private analyzeVoice(profile: StyleProfile, past: Transmission[]) {
    // Learn patterns:
    // - How does she open pieces? (direct? poetic? questioning?)
    // - Sentence rhythm (short punchy vs long flowing?)
    // - Metaphor density (every sentence? occasional?)
    // - Clinical integration (sprinkled? separate sections?)
    // - Paragraph length (short? varied? long?)
    // - Transition style (abrupt? flowing? question-based?)

    return {
      openingStyle: 'direct-provocation',
      sentenceRhythm: [3, 5, 12, 4, 8],  // Word counts in sequence
      metaphorDensity: 0.7,               // 70% of paragraphs contain metaphor
      clinicalRatio: 0.3,                 // 30% clinical, 70% poetic
      paragraphPattern: 'varied',
    };
  }
}
```

**Key principle:**
- Format should serve voice, not override it
- Angela's poetic-clinical fusion stays intact
- System learns from corpus, not templates

---

#### Step 4: Format-Specific Processing

##### A. Substack Post Formatter

```typescript
class SubstackFormatter {
  async format(transmission: string, voice: VoiceFingerprint): Promise<SubstackPost> {
    return {
      title: await this.generateTitle(transmission),
      subtitle: await this.generateSubtitle(transmission),
      sections: await this.createSections(transmission),
      pullQuotes: await this.extractPullQuotes(transmission),
      metadata: {
        tags: await this.suggestTags(transmission),
        estimatedReadTime: this.calculateReadTime(transmission),
        seoDescription: await this.generateSEO(transmission),
      },
      markdown: this.exportMarkdown({...}),
    };
  }

  private async generateTitle(text: string): Promise<string> {
    // Prompt to Claude:
    // "Generate a title that captures the essence while maintaining poetic precision.
    // This author fuses clinical insight with mystical language.
    // Examples from her past work: [...]"

    // Returns: "The Alchemical Rage of Perimenopause"
    // Not: "5 Things to Know About Perimenopause Symptoms"
  }

  private async createSections(text: string): Promise<Section[]> {
    // Detect natural breaks in flow
    // Add section headers that feel organic
    // Maintain rhythm while adding structure

    return [
      { heading: null, content: "Opening paragraphs..." },
      { heading: "The Furnace of the Crone", content: "..." },
      { heading: "What the Medical Model Misses", content: "..." },
      { heading: null, content: "Closing..." },
    ];
  }
}
```

**Output example:**

```markdown
# The Alchemical Rage of Perimenopause: When the Body Burns Through Silence

*How the furnace of midlife transforms swallowed truths into sacred power*

---

The rage isn't pathology. It's the body's last-ditch attempt to burn through a lifetime of swallowed truths before the fire goes out.

This is the furnace of the crone — not menopausal symptom to manage, but alchemical kiln to enter.

## The Furnace of the Crone

[Content continues with section breaks that feel natural...]

## What the Medical Model Misses

Blood tests miss perimenopause for 10 years before physical symptoms appear. The medical model waits for proof in estradiol levels while women live the truth in their bodies — the sleepless nights, the sudden rage, the sense of skin too tight for what's trying to emerge.

[Continues...]

---

*Tags: perimenopause, women's health, sacred aging, embodied wisdom*
*Estimated read time: 4 minutes*
```

---

##### B. Podcast Script Formatter

```typescript
class PodcastScriptFormatter {
  async format(transmission: string, voice: VoiceFingerprint): Promise<PodcastScript> {
    return {
      intro: await this.craftIntro(transmission),
      body: await this.addBreathCues(transmission),
      outro: await this.craftOutro(transmission),
      metadata: {
        estimatedDuration: this.calculateDuration(transmission),
        musicCues: this.suggestMusicCues(transmission),
        editingNotes: this.generateEditingNotes(transmission),
      },
    };
  }

  private async addBreathCues(text: string): Promise<string> {
    // Analyze natural pause points
    // Add [PAUSE], [BREATHE], [SLOW HERE] markers
    // Maintain flow while supporting spoken delivery

    return `
The rage isn't pathology. [PAUSE]

It's the body's last-ditch attempt [BREATHE] to burn through
a lifetime of swallowed truths [SLOW HERE] before the fire goes out.

[PAUSE - LET THIS LAND]

This is the furnace of the crone...
    `;
  }
}
```

---

##### C. Session Guide Formatter

```typescript
class SessionGuideFormatter {
  async format(transmission: string, voice: VoiceFingerprint): Promise<SessionGuide> {
    return {
      overview: await this.createOverview(transmission),
      practices: await this.extractPractices(transmission),
      journalPrompts: await this.generatePrompts(transmission),
      resources: await this.suggestResources(transmission),
      handout: await this.createPrintableHandout({...}),
    };
  }

  private async extractPractices(text: string): Promise<Practice[]> {
    // Identify actionable elements
    // Structure as clear instructions
    // Maintain poetic framing while adding clarity

    return [
      {
        name: "Rage Mapping",
        duration: "10 minutes",
        instructions: [
          "Place one hand on your belly, one on your heart",
          "Ask: Where do I feel rage in my body?",
          "Don't answer with your mind — let your body show you",
          "Draw or write what you sense",
        ],
        intention: "To locate rage as embodied wisdom, not emotional problem",
      },
      {
        name: "Furnace Breathwork",
        duration: "5 minutes",
        instructions: [
          "4-7-8 cycle: Inhale for 4, hold for 7, exhale for 8",
          "On the hold, feel the heat in your belly",
          "On the exhale, imagine releasing what's ready to burn",
        ],
        intention: "To work with Fire element consciously",
      },
    ];
  }
}
```

---

### 3. Output Layer: What User Receives

```typescript
interface PlatformAgentOutput {
  // Formatted content
  content: {
    format: FormatType;
    data: SubstackPost | PodcastScript | SessionGuide | /* etc */;
  };

  // Export options
  exports: {
    markdown?: string;
    html?: string;
    pdf?: Buffer;
    json?: any;
  };

  // Publishing actions
  publishingOptions: {
    directPublish?: {
      platform: 'substack' | 'wordpress' | /* etc */;
      endpoint: string;
      requiresReview: boolean;
    };
    manualExport?: {
      copyToClipboard: string;
      downloadLink: string;
    };
  };

  // MAIA's reflection
  reflection: {
    summary: string;
    suggestions: string[];
    questions?: string[];
  };
}
```

**Example output to user:**

```
MAIA: "I've formatted this as a Substack post.

Title: 'The Alchemical Rage of Perimenopause: When the Body Burns Through Silence'

I maintained your poetic language while adding section breaks for readability.
Added a clinical paragraph on why blood tests miss perimenopause — felt like
it grounded the mystical without dampening it.

Ready to publish directly to Substack, or would you like to review first?"

[Preview] [Edit] [Publish Now] [Export Markdown]
```

---

## Technical Implementation Plan

### Phase 1: MVP (2-3 weeks)

**Core functionality:**
- ✅ Intent recognition (Claude-based)
- ✅ Substack post formatting (primary use case)
- ✅ Voice fingerprint learning (analyze past transmissions)
- ✅ Markdown export
- ❌ Direct Substack publishing (manual export first)

**Tech stack:**
- Claude 3.5 Sonnet for formatting/style
- Existing Voice Loop for verbal commands
- New `PlatformAgent` class in `/lib/maia/`
- Store style profiles in Supabase

**Deliverables:**
1. User types transmission → "Make this a Substack post"
2. MAIA returns formatted markdown
3. User copies to Substack manually
4. Iteration based on Angela's feedback

---

### Phase 2: Integration (Week 4-6)

**Add:**
- ✅ Direct Substack API publishing
- ✅ Podcast script formatting
- ✅ Session guide formatting
- ✅ PDF export for handouts

**Tech:**
- Substack API integration
- PDF generation (puppeteer or similar)
- Template system for multiple formats

---

### Phase 3: Learning System (Week 7-12)

**Add:**
- ✅ Voice fingerprint refinement (learns from corrections)
- ✅ Format suggestion engine (auto-detects best format)
- ✅ Multi-platform support (WordPress, Medium, etc.)
- ✅ Batch processing (format multiple transmissions at once)

---

## User Interface

### 1. Voice Command Interface (Primary)

**Location:** Voice Loop (existing)

**Flow:**
1. User types transmission in Mirror Field
2. Clicks mic icon (or says "Hey MAIA")
3. Speaks command: "Make this a Substack post"
4. MAIA processes (shows progress: "Formatting... analyzing tone... generating title...")
5. Returns formatted content with preview

---

### 2. Review Interface (Secondary)

**Component:** `PlatformAgentReview.tsx`

```tsx
interface PlatformAgentReviewProps {
  originalTransmission: string;
  formattedOutput: PlatformAgentOutput;
  onApprove: () => void;
  onEdit: (changes: Partial<PlatformAgentOutput>) => void;
  onReject: () => void;
}

// UI shows:
// - Side-by-side: Original vs Formatted
// - Editable title, sections, tags
// - MAIA's reflection/suggestions
// - [Approve] [Edit] [Try Different Format] [Reject]
```

---

### 3. Publishing Interface (Tertiary)

**Component:** `PublishingFlow.tsx`

```tsx
// After approval:
// [Publish to Substack] [Export Markdown] [Save as Draft]

// If direct publish:
// - Show Substack preview
// - Confirm publish
// - Handle success/error
```

---

## Voice Fingerprint Learning System

### Initial Training (First Use)

```typescript
class VoiceFingerprintLearner {
  async initializeProfile(userId: string): Promise<StyleProfile> {
    // Fetch user's past transmissions
    const transmissions = await this.fetchPastWork(userId);

    if (transmissions.length === 0) {
      // No past work — use defaults, learn as they go
      return DEFAULT_STYLE_PROFILE;
    }

    // Analyze corpus
    const analysis = await this.analyzeCorpus(transmissions);

    return {
      poeticDensity: analysis.metaphorFrequency,
      clinicalPrecision: analysis.technicalLanguageRatio,
      kitchenTableMysticism: analysis.everydayLanguageScore,
      breathPacing: analysis.averageSentenceLength < 15 ? 'fast' : 'slow',
      sentenceRhythm: analysis.sentenceLengthPattern,
    };
  }

  private async analyzeCorpus(transmissions: Transmission[]): Promise<CorpusAnalysis> {
    const prompt = `
Analyze this writer's style across ${transmissions.length} pieces:

${transmissions.map(t => t.content).join('\n\n---\n\n')}

Return analysis as JSON:
{
  "metaphorFrequency": 0.0-1.0,
  "technicalLanguageRatio": 0.0-1.0,
  "everydayLanguageScore": 0.0-1.0,
  "averageSentenceLength": number,
  "sentenceLengthPattern": [lengths],
  "openingStyle": "description",
  "transitionStyle": "description",
  "closingStyle": "description"
}
    `;

    const analysis = await claude.analyze(prompt);
    return analysis;
  }
}
```

---

### Continuous Learning (Feedback Loop)

```typescript
class VoiceLearningFeedback {
  async learnFromEdit(
    original: string,
    maiaSuggestion: string,
    userEdit: string,
    styleProfile: StyleProfile
  ): Promise<StyleProfile> {

    // Compare MAIA's suggestion to user's edit
    const diff = this.analyzeDifference(maiaSuggestion, userEdit);

    // Examples of what to learn:
    // - User always changes titles to be more direct → update title style
    // - User removes section headings → preference for flowing prose
    // - User adds more clinical language → increase clinicalPrecision
    // - User simplifies metaphors → decrease poeticDensity

    const adjustments = {
      poeticDensity: diff.metaphorChange,
      clinicalPrecision: diff.technicalLanguageChange,
      // etc
    };

    // Update profile with weighted adjustment (don't overfit to single edit)
    return this.updateProfile(styleProfile, adjustments, weight: 0.1);
  }
}
```

---

## Integration Points

### 1. Mirror Field Integration

**File:** `components/journal/MirrorField.tsx`

**Add:**
- "Format with MAIA" button at end of transmission
- Keyboard shortcut: `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows)
- Voice command trigger: "Hey MAIA, format this"

---

### 2. Voice Loop Integration

**File:** `app/experiments/voice-loop/page.tsx`

**Add:**
- New intent category: `platform-formatting`
- Route to PlatformAgent when intent recognized
- Return formatted output to user

---

### 3. Soulprint Integration

**File:** `lib/memory/soulprint.ts`

**Add:**
- Store `styleProfile` in soulprint
- Update profile as MAIA learns
- Use archetypal signature to inform formatting choices

---

## Success Metrics

### Pilot Phase (Angela)

**Quantitative:**
- Time from transmission to published post (target: < 10 minutes)
- Edit rate (how often she changes MAIA's formatting)
- Format accuracy (does MAIA suggest right format?)
- Voice preservation (how often she rewrites vs tweaks?)

**Qualitative:**
- Does this remove friction or add it?
- Does formatted content feel like her voice?
- Does she use it regularly or revert to manual?
- What formats does she actually need?

**Success criteria:**
- Angela publishes 2+ pieces/week using Platform Agent
- < 20% edit rate (meaning 80%+ of MAIA's formatting is kept)
- Reports "flow isn't broken" by the tech

---

## Risk Mitigation

### Risk 1: Voice Homogenization
**Problem:** MAIA makes everything sound like generic AI writing

**Mitigation:**
- Voice fingerprint system learns from her corpus
- User edits update the model
- Show original + formatted side-by-side for comparison
- "Regenerate in different tone" option

---

### Risk 2: Format Mismatch
**Problem:** MAIA suggests wrong format for transmission

**Mitigation:**
- User can always override suggestion
- Suggestive mode (asks before formatting)
- Multiple format options presented
- "Try different format" button

---

### Risk 3: Publishing Errors
**Problem:** Direct publish fails, content lost

**Mitigation:**
- Always save formatted version locally first
- Publish is separate step from formatting
- Markdown export as backup
- Error handling with retry logic

---

## Future Enhancements (Post-Pilot)

### 1. Multi-Modal Input
- Voice ramble → formatted content
- Image + caption → social post
- Session video → transcript + guide

### 2. Platform Ecosystem
- WordPress, Medium, LinkedIn integration
- Podcast platform distribution (Anchor, Spotify, Apple)
- Email newsletter (ConvertKit, Mailchimp)

### 3. Collaborative Formatting
- Angela + MAIA co-edit in real-time
- Suggest improvements while she types
- "MAIA, rewrite this paragraph to be more clinical"

### 4. Template Library
- Angela's frequent formats saved as templates
- One-click "Format like perimenopause post"
- Share templates with other Soullab practitioners

---

## Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  USER INTERFACE                      │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ Mirror     │  │ Voice Loop  │  │ Review UI    │ │
│  │ Field      │  │             │  │              │ │
│  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘ │
└────────┼─────────────────┼─────────────────┼─────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────┐
│              PLATFORM AGENT CORE                     │
│  ┌────────────────────────────────────────────────┐ │
│  │  Intent Recognition (Claude)                   │ │
│  └────────────────┬───────────────────────────────┘ │
│                   ▼                                  │
│  ┌────────────────────────────────────────────────┐ │
│  │  Format Recognition (suggestive)               │ │
│  └────────────────┬───────────────────────────────┘ │
│                   ▼                                  │
│  ┌────────────────────────────────────────────────┐ │
│  │  Style Preservation Engine                     │ │
│  │  (Voice Fingerprint Learning)                  │ │
│  └────────────────┬───────────────────────────────┘ │
│                   ▼                                  │
│  ┌────────────────────────────────────────────────┐ │
│  │  Format-Specific Processors                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐  │ │
│  │  │ Substack │ │ Podcast  │ │ Session Guide │  │ │
│  │  └──────────┘ └──────────┘ └───────────────┘  │ │
│  └────────────────┬───────────────────────────────┘ │
└───────────────────┼──────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────┐
│              OUTPUT & PUBLISHING                     │
│  ┌──────────┐  ┌─────────┐  ┌──────────────────┐   │
│  │ Markdown │  │ PDF     │  │ Direct Publish   │   │
│  │ Export   │  │ Export  │  │ (Substack API)   │   │
│  └──────────┘  └─────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              DATA PERSISTENCE                        │
│  ┌────────────────────────────────────────────────┐ │
│  │  Supabase                                      │ │
│  │  - Style Profiles                              │ │
│  │  - Formatted Outputs                           │ │
│  │  - Learning Feedback                           │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
lib/maia/
├── PlatformAgent.ts              # Main orchestrator
├── IntentRecognizer.ts           # Parse voice commands
├── FormatRecognizer.ts           # Suggest formats
├── StylePreservationEngine.ts    # Maintain voice
├── VoiceFingerprintLearner.ts    # Learn from corpus
├── formatters/
│   ├── SubstackFormatter.ts
│   ├── PodcastScriptFormatter.ts
│   ├── SessionGuideFormatter.ts
│   ├── CommunityPostFormatter.ts
│   └── BaseFormatter.ts          # Shared utilities
├── integrations/
│   ├── SubstackAPI.ts
│   ├── WordPressAPI.ts
│   └── PDFGenerator.ts
└── types.ts                      # Shared interfaces

components/maia/
├── PlatformAgentReview.tsx       # Review formatted content
├── PublishingFlow.tsx            # Handle publishing
└── FormatSelector.tsx            # Choose format manually
```

---

## Next Steps for Development

### Week 1: Foundation
- [ ] Create type definitions (`lib/maia/types.ts`)
- [ ] Build IntentRecognizer with Claude
- [ ] Create SubstackFormatter (MVP)
- [ ] Basic UI for review

### Week 2: Style Learning
- [ ] Implement VoiceFingerprintLearner
- [ ] Analyze Angela's existing corpus (if available)
- [ ] Build StylePreservationEngine
- [ ] Test formatting on sample transmissions

### Week 3: Integration
- [ ] Connect to Mirror Field
- [ ] Connect to Voice Loop
- [ ] Build review UI
- [ ] End-to-end testing

### Week 4: Pilot Launch
- [ ] Deploy to Angela's instance
- [ ] Onboarding session
- [ ] Monitor usage
- [ ] Collect feedback

---

## Pilot Success Definition

**Angela should be able to:**
1. Type a transmission in 5 minutes
2. Say "Make this a Substack post"
3. Review formatted version in 2 minutes
4. Publish or export in 1 click
5. Move to next tab without losing momentum

**Total time: < 10 minutes from thought to published post**

**Compared to current: 30-60 minutes (or never published due to friction)**

If this works, we've solved the problem. If not, we iterate.

🌀
