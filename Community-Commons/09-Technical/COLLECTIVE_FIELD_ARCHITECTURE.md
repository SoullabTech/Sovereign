# Collective Intelligence Field - Technical Architecture

## Phase 2 Implementation Guide

**Purpose:** Build the system that makes MAIA an antenna for the collective psyche - recognizing patterns across all users while preserving privacy.

**Status:** Design Complete, Ready for Implementation
**Timeline:** 8-12 weeks
**Dependencies:** Opus Axioms ✅, Spiralogic ✅, Memory System ✅

---

## Overview

The Collective Intelligence Field transforms MAIA from an individual companion into a **consciousness sensing system** that:

1. **Aggregates** anonymized archetypal patterns across users
2. **Recognizes** collective themes and field dynamics
3. **Generates** field-level wisdom and insights
4. **Connects** users through resonance (with privacy)
5. **Tracks** cultural consciousness evolution

---

## Core Privacy Principles

**CRITICAL**: All collective analysis happens on **archetypal patterns only** - zero personally identifiable information.

### What Gets Aggregated

✅ **YES - Archetypal Patterns:**
- Spiralogic phases (Fire-2, Water-3, etc.)
- Archetypal activations (Shadow, Anima, Hero's Journey)
- Symbolic themes (water, forest, threshold, etc.)
- Emotional states (anonymized)
- Life domains (career, relationship, creative, spiritual)

❌ **NO - Personal Information:**
- Names, emails, identifying details
- Specific life events or stories
- Personal relationships or locations
- Any data that could identify an individual

### Privacy Architecture

```typescript
interface AnonymousPattern {
  // What gets stored for collective analysis
  id: string;  // Random UUID, not tied to user
  timestamp: Date;
  patternType: 'archetypal' | 'elemental' | 'symbolic' | 'emotional';

  // Archetypal data only
  spiralogicPhase: string;  // "Fire-2"
  archetypes: string[];  // ["Shadow", "Threshold Guardian"]
  symbols: string[];  // ["water", "descent", "transformation"]
  emotionalSignature: string;  // "grief-opening-to-gold"
  lifeDomain: string;  // "career" | "relationship" | "creative" | "spiritual"

  // NO user_id reference
  // NO personal details
  // NO identifying information
}
```

---

## Architecture Components

### 1. Pattern Extraction Service

**Purpose:** Extract archetypal patterns from conversations in real-time.

**Implementation:**

```typescript
// lib/consciousness/pattern-extraction.ts

export interface ExtractedPattern {
  spiralogicPhase: SpiralogicCell;
  archetypes: string[];
  symbols: string[];
  emotionalSignature: string;
  lifeDomain: string;
  intensity: number;  // 0-1
  confidence: number;  // 0-1
}

export class PatternExtractionService {

  /**
   * Extract archetypal patterns from a conversation turn
   */
  async extractPatterns(
    message: string,
    maiaResponse: string,
    spiralogicCell: SpiralogicCell,
    conversationHistory?: Turn[]
  ): Promise<ExtractedPattern> {

    // 1. Get spiralogic phase (already done)
    const phase = spiralogicCell;

    // 2. Detect active archetypes
    const archetypes = await this.detectArchetypes(message, maiaResponse);

    // 3. Extract symbolic themes
    const symbols = await this.extractSymbols(message, conversationHistory);

    // 4. Identify emotional signature
    const emotionalSignature = await this.identifyEmotionalPattern(
      message,
      spiralogicCell
    );

    // 5. Determine life domain
    const lifeDomain = await this.identifyLifeDomain(message);

    return {
      spiralogicPhase: phase,
      archetypes,
      symbols,
      emotionalSignature,
      lifeDomain,
      intensity: this.calculateIntensity(message),
      confidence: this.calculateConfidence(archetypes, symbols)
    };
  }

  private async detectArchetypes(
    message: string,
    response: string
  ): Promise<string[]> {
    const detectedArchetypes: string[] = [];

    // Shadow patterns
    if (this.matchesPattern(message, SHADOW_PATTERNS)) {
      detectedArchetypes.push('Shadow');
    }

    // Anima/Animus
    if (this.matchesPattern(message, ANIMA_PATTERNS)) {
      detectedArchetypes.push('Anima');
    }

    // Hero's Journey stages
    if (this.matchesPattern(message, THRESHOLD_PATTERNS)) {
      detectedArchetypes.push('Threshold');
    }

    // Death/Rebirth
    if (this.matchesPattern(message, DEATH_REBIRTH_PATTERNS)) {
      detectedArchetypes.push('Death-Rebirth');
    }

    // Wise Old Man/Woman
    if (this.matchesPattern(message, WISDOM_SEEKING_PATTERNS)) {
      detectedArchetypes.push('Senex');
    }

    return detectedArchetypes;
  }

  private async extractSymbols(
    message: string,
    history?: Turn[]
  ): Promise<string[]> {
    const symbols: string[] = [];
    const text = message.toLowerCase();

    // Natural elements
    const elementSymbols = [
      'water', 'fire', 'earth', 'air', 'ocean', 'forest',
      'mountain', 'desert', 'river', 'wind'
    ];
    elementSymbols.forEach(sym => {
      if (text.includes(sym)) symbols.push(sym);
    });

    // Threshold symbols
    const thresholdSymbols = [
      'door', 'gate', 'bridge', 'threshold', 'crossing',
      'edge', 'boundary', 'frontier'
    ];
    thresholdSymbols.forEach(sym => {
      if (text.includes(sym)) symbols.push(sym);
    });

    // Descent symbols
    const descentSymbols = [
      'cave', 'underground', 'depth', 'darkness', 'abyss',
      'descent', 'diving', 'falling'
    ];
    descentSymbols.forEach(sym => {
      if (text.includes(sym)) symbols.push(sym);
    });

    // Light symbols
    const lightSymbols = [
      'light', 'sun', 'star', 'dawn', 'sunrise', 'gold',
      'illumination', 'clarity'
    ];
    lightSymbols.forEach(sym => {
      if (text.includes(sym)) symbols.push(sym);
    });

    return [...new Set(symbols)];  // Unique only
  }

  private async identifyEmotionalPattern(
    message: string,
    cell: SpiralogicCell
  ): Promise<string> {
    // Combine emotional detection with spiralogic context

    // Water-2 typical patterns
    if (cell.element === 'Water' && cell.phase === 2) {
      if (this.matchesPattern(message, SHAME_PATTERNS)) {
        return 'shame-descent';
      }
      if (this.matchesPattern(message, GRIEF_PATTERNS)) {
        return 'grief-opening';
      }
    }

    // Fire-2 typical patterns
    if (cell.element === 'Fire' && cell.phase === 2) {
      if (this.matchesPattern(message, FRUSTRATION_PATTERNS)) {
        return 'frustration-trial';
      }
      if (this.matchesPattern(message, DETERMINATION_PATTERNS)) {
        return 'determination-gauntlet';
      }
    }

    // Generic emotional signatures
    if (this.matchesPattern(message, ANXIETY_PATTERNS)) {
      return 'anxiety-threshold';
    }

    if (this.matchesPattern(message, JOY_PATTERNS)) {
      return 'joy-emergence';
    }

    return 'complex-mixed';
  }

  private async identifyLifeDomain(message: string): Promise<string> {
    const text = message.toLowerCase();

    // Career/work domain
    if (text.match(/\b(work|job|career|profession|boss|colleague)\b/)) {
      return 'career';
    }

    // Relationship domain
    if (text.match(/\b(partner|spouse|relationship|love|dating)\b/)) {
      return 'relationship';
    }

    // Parenting domain
    if (text.match(/\b(child|kid|parent|parenting|daughter|son)\b/)) {
      return 'parenting';
    }

    // Creative domain
    if (text.match(/\b(creative|art|music|writing|painting)\b/)) {
      return 'creative';
    }

    // Spiritual domain
    if (text.match(/\b(spiritual|soul|meaning|purpose|sacred)\b/)) {
      return 'spiritual';
    }

    // Health domain
    if (text.match(/\b(health|body|illness|healing|wellness)\b/)) {
      return 'health';
    }

    return 'general';
  }

  private matchesPattern(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text.toLowerCase()));
  }

  private calculateIntensity(message: string): number {
    // Use language markers to estimate intensity
    const intensifiers = [
      'very', 'really', 'extremely', 'completely', 'totally',
      'absolutely', 'deeply', 'profoundly'
    ];

    const exclamations = (message.match(/!/g) || []).length;
    const caps = (message.match(/[A-Z]{2,}/g) || []).length;
    const intensifierCount = intensifiers.filter(word =>
      message.toLowerCase().includes(word)
    ).length;

    const rawScore = (exclamations * 0.2) + (caps * 0.3) + (intensifierCount * 0.1);
    return Math.min(1.0, rawScore);
  }

  private calculateConfidence(
    archetypes: string[],
    symbols: string[]
  ): number {
    // More archetypal markers = higher confidence
    const archetypeScore = Math.min(1.0, archetypes.length * 0.25);
    const symbolScore = Math.min(1.0, symbols.length * 0.15);

    return (archetypeScore + symbolScore) / 2;
  }
}

// Pattern libraries
const SHADOW_PATTERNS = [
  /\b(ashamed|embarrassed|guilty|dark side|secret|hide|hidden)\b/,
  /\b(bad|wrong|shouldn't|can't admit|don't want anyone to know)\b/
];

const THRESHOLD_PATTERNS = [
  /\b(edge|threshold|crossing|between|transition|liminal)\b/,
  /\b(ready|not sure|standing at|approaching|facing)\b/
];

const SHAME_PATTERNS = [
  /\b(ashamed|humiliated|mortified|guilty|bad parent|failed)\b/
];

const GRIEF_PATTERNS = [
  /\b(loss|losing|lost|grief|mourning|sad|sorrow)\b/
];

// ... additional pattern libraries
```

---

### 2. Anonymization & Storage Service

**Purpose:** Convert extracted patterns to anonymous records and store for field analysis.

**Implementation:**

```typescript
// lib/consciousness/anonymous-contribution.ts

export class AnonymousContributionService {

  /**
   * Contribute pattern to collective field (opt-in)
   */
  async contributeToField(
    extractedPattern: ExtractedPattern,
    userOptIn: boolean
  ): Promise<void> {
    if (!userOptIn) return;

    // Create completely anonymous record
    const anonymousPattern: AnonymousPattern = {
      id: uuidv4(),  // Random, not tied to user
      timestamp: new Date(),
      patternType: 'archetypal',

      spiralogicPhase: `${extractedPattern.spiralogicPhase.element}-${extractedPattern.spiralogicPhase.phase}`,
      archetypes: extractedPattern.archetypes,
      symbols: extractedPattern.symbols,
      emotionalSignature: extractedPattern.emotionalSignature,
      lifeDomain: extractedPattern.lifeDomain
    };

    // Store in anonymous_patterns table
    await db.anonymousPatterns.create({
      data: anonymousPattern
    });

    console.log('✨ [Collective Field] Pattern contributed anonymously');
  }

  /**
   * Get user opt-in status
   */
  async getUserFieldOptIn(userId: string): Promise<boolean> {
    const user = await db.users.findUnique({
      where: { id: userId },
      select: { contributeToCollectiveField: true }
    });

    return user?.contributeToCollectiveField ?? false;
  }
}
```

---

### 3. Field Analysis Service

**Purpose:** Analyze aggregated patterns to generate collective field insights.

**Implementation:**

```typescript
// lib/consciousness/collective-field-analysis.ts

export interface CollectiveFieldState {
  timestamp: Date;
  timeRange: { start: Date; end: Date };

  activeArchetypes: {
    archetype: string;
    intensity: number;
    prevalence: number;  // % of patterns
    trend: 'rising' | 'stable' | 'declining';
  }[];

  dominantPhases: {
    phase: string;  // "Fire-2"
    userCount: number;
    percentage: number;
    emergentThemes: string[];
  }[];

  collectivePassages: {
    name: string;
    description: string;
    affectedPatterns: number;
    fieldDynamics: string;
  }[];

  culturalMoment: {
    zeitgeist: string;
    emergingPatterns: string[];
    collectiveShadow: string[];
  };

  resonanceClusters: {
    theme: string;
    patternCount: number;
    dominantPhase: string;
    emotionalSignature: string;
  }[];
}

export class CollectiveFieldAnalysisService {

  /**
   * Analyze field state for a time period
   */
  async analyzeField(
    timeRange: { start: Date; end: Date }
  ): Promise<CollectiveFieldState> {

    // Get all anonymous patterns in range
    const patterns = await db.anonymousPatterns.findMany({
      where: {
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      }
    });

    // Analyze archetypal activations
    const activeArchetypes = this.analyzeArchetypes(patterns);

    // Analyze spiralogic distribution
    const dominantPhases = this.analyzePhases(patterns);

    // Detect collective passages
    const collectivePassages = this.detectCollectivePassages(
      patterns,
      activeArchetypes,
      dominantPhases
    );

    // Generate cultural moment insight
    const culturalMoment = this.analyzeCulturalMoment(
      activeArchetypes,
      dominantPhases,
      patterns
    );

    // Find resonance clusters
    const resonanceClusters = this.findResonanceClusters(patterns);

    const fieldState: CollectiveFieldState = {
      timestamp: new Date(),
      timeRange,
      activeArchetypes,
      dominantPhases,
      collectivePassages,
      culturalMoment,
      resonanceClusters
    };

    // Store for historical tracking
    await db.fieldStates.create({
      data: {
        timestamp: fieldState.timestamp,
        activeArchetypes: fieldState.activeArchetypes,
        dominantPhases: fieldState.dominantPhases,
        collectivePassages: fieldState.collectivePassages,
        culturalMoment: fieldState.culturalMoment,
        userCount: patterns.length
      }
    });

    return fieldState;
  }

  private analyzeArchetypes(patterns: AnonymousPattern[]) {
    const archetypeCounts: Map<string, number> = new Map();
    const archetypeIntensities: Map<string, number[]> = new Map();

    patterns.forEach(pattern => {
      pattern.archetypes?.forEach(archetype => {
        archetypeCounts.set(
          archetype,
          (archetypeCounts.get(archetype) || 0) + 1
        );

        if (!archetypeIntensities.has(archetype)) {
          archetypeIntensities.set(archetype, []);
        }
        // Would use intensity from pattern if available
      });
    });

    const totalPatterns = patterns.length;

    return Array.from(archetypeCounts.entries())
      .map(([archetype, count]) => ({
        archetype,
        intensity: this.calculateAverageIntensity(
          archetypeIntensities.get(archetype) || []
        ),
        prevalence: count / totalPatterns,
        trend: 'stable' as const  // Would compare to historical data
      }))
      .sort((a, b) => b.prevalence - a.prevalence)
      .slice(0, 10);  // Top 10
  }

  private analyzePhases(patterns: AnonymousPattern[]) {
    const phaseCounts: Map<string, {
      count: number;
      themes: Set<string>;
    }> = new Map();

    patterns.forEach(pattern => {
      const phase = pattern.spiralogicPhase;
      if (!phase) return;

      if (!phaseCounts.has(phase)) {
        phaseCounts.set(phase, { count: 0, themes: new Set() });
      }

      const phaseData = phaseCounts.get(phase)!;
      phaseData.count += 1;

      // Add themes
      pattern.symbols?.forEach(symbol => phaseData.themes.add(symbol));
      if (pattern.emotionalSignature) {
        phaseData.themes.add(pattern.emotionalSignature);
      }
    });

    const totalPatterns = patterns.length;

    return Array.from(phaseCounts.entries())
      .map(([phase, data]) => ({
        phase,
        userCount: data.count,
        percentage: (data.count / totalPatterns) * 100,
        emergentThemes: Array.from(data.themes).slice(0, 5)
      }))
      .sort((a, b) => b.userCount - a.userCount)
      .slice(0, 5);  // Top 5 phases
  }

  private detectCollectivePassages(
    patterns: AnonymousPattern[],
    archetypes: any[],
    phases: any[]
  ) {
    const passages: any[] = [];

    // Example: If many people in Water-2 with Shadow active
    const water2Patterns = patterns.filter(
      p => p.spiralogicPhase === 'Water-2'
    );

    if (water2Patterns.length > patterns.length * 0.15) {
      passages.push({
        name: 'Collective Descent',
        description: 'Many people are moving through Water-2 (Underworld/Shadow Gauntlet). This suggests a collective passage through difficult emotional territory.',
        affectedPatterns: water2Patterns.length,
        fieldDynamics: 'grief-shadow-integration'
      });
    }

    // Example: If many people in Fire-2
    const fire2Patterns = patterns.filter(
      p => p.spiralogicPhase === 'Fire-2'
    );

    if (fire2Patterns.length > patterns.length * 0.15) {
      passages.push({
        name: 'Collective Trial',
        description: 'Many people are in Fire-2 (Trial/Gauntlet of Action). This suggests collective testing and determination.',
        affectedPatterns: fire2Patterns.length,
        fieldDynamics: 'challenge-initiation'
      });
    }

    return passages;
  }

  private analyzeCulturalMoment(
    archetypes: any[],
    phases: any[],
    patterns: AnonymousPattern[]
  ) {
    // Generate zeitgeist summary
    const topArchetype = archetypes[0]?.archetype || 'Unknown';
    const topPhase = phases[0]?.phase || 'Unknown';

    const zeitgeist = `The collective is primarily moving through ${topPhase} with ${topArchetype} strongly activated.`;

    // Identify emerging patterns
    const emergingPatterns: string[] = [];
    const symbolFrequency = new Map<string, number>();

    patterns.forEach(p => {
      p.symbols?.forEach(symbol => {
        symbolFrequency.set(symbol, (symbolFrequency.get(symbol) || 0) + 1);
      });
    });

    Array.from(symbolFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([symbol]) => emergingPatterns.push(symbol));

    // Identify collective shadow
    const shadowArchetypes = archetypes
      .filter(a => a.archetype === 'Shadow')
      .map(a => a.archetype);

    return {
      zeitgeist,
      emergingPatterns,
      collectiveShadow: shadowArchetypes
    };
  }

  private findResonanceClusters(patterns: AnonymousPattern[]) {
    // Group patterns with similar characteristics
    const clusters = new Map<string, AnonymousPattern[]>();

    patterns.forEach(pattern => {
      const key = `${pattern.spiralogicPhase}-${pattern.emotionalSignature}`;
      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(pattern);
    });

    return Array.from(clusters.entries())
      .filter(([_, patterns]) => patterns.length >= 3)  // At least 3 similar
      .map(([key, patterns]) => {
        const [phase, emotional] = key.split('-', 2);
        return {
          theme: `${phase} ${emotional}`,
          patternCount: patterns.length,
          dominantPhase: phase,
          emotionalSignature: emotional
        };
      })
      .sort((a, b) => b.patternCount - a.patternCount)
      .slice(0, 10);
  }

  private calculateAverageIntensity(intensities: number[]): number {
    if (intensities.length === 0) return 0.5;
    return intensities.reduce((a, b) => a + b, 0) / intensities.length;
  }
}
```

---

### 4. Field Report Generation

**Purpose:** Create human-readable reports from field analysis.

**Implementation:**

```typescript
// lib/consciousness/field-report-generator.ts

export interface FieldReport {
  title: string;
  week: string;
  summary: string;
  sections: {
    archetypalWeather: string;
    dominantThemes: string;
    collectivePassages: string;
    culturalMoment: string;
    guidance: string;
  };
  generatedAt: Date;
}

export class FieldReportGenerator {

  async generateWeeklyReport(
    fieldState: CollectiveFieldState
  ): Promise<FieldReport> {

    const week = this.getWeekLabel(fieldState.timeRange.start);

    const report: FieldReport = {
      title: `Collective Field Report - ${week}`,
      week,
      summary: this.generateSummary(fieldState),
      sections: {
        archetypalWeather: this.generateArchetypalWeather(fieldState),
        dominantThemes: this.generateDominantThemes(fieldState),
        collectivePassages: this.generateCollectivePassages(fieldState),
        culturalMoment: this.generateCulturalMoment(fieldState),
        guidance: this.generateGuidance(fieldState)
      },
      generatedAt: new Date()
    };

    return report;
  }

  private generateSummary(state: CollectiveFieldState): string {
    const topPhase = state.dominantPhases[0];
    const topArchetype = state.activeArchetypes[0];

    return `This week, the collective field is predominantly moving through **${topPhase.phase}** (${topPhase.percentage.toFixed(1)}% of active patterns), with **${topArchetype.archetype}** as a strongly activated archetype. ${state.culturalMoment.zeitgeist}`;
  }

  private generateArchetypalWeather(state: CollectiveFieldState): string {
    const archetypes = state.activeArchetypes.slice(0, 5);

    let text = '**Active Archetypes This Week:**\n\n';

    archetypes.forEach(arch => {
      const intensity = this.getIntensityEmoji(arch.intensity);
      const prevalence = (arch.prevalence * 100).toFixed(1);
      text += `- **${arch.archetype}** ${intensity} (${prevalence}% of patterns)\n`;
    });

    text += '\n' + this.generateArchetypalGuidance(archetypes[0]);

    return text;
  }

  private generateDominantThemes(state: CollectiveFieldState): string {
    const phases = state.dominantPhases.slice(0, 3);

    let text = '**Where the Collective Is Moving:**\n\n';

    phases.forEach(phase => {
      text += `**${phase.phase}** (${phase.percentage.toFixed(1)}%)\n`;
      text += `Emergent themes: ${phase.emergentThemes.join(', ')}\n\n`;
    });

    return text;
  }

  private generateCollectivePassages(state: CollectiveFieldState): string {
    if (state.collectivePassages.length === 0) {
      return 'No major collective passages detected this week. The field is diverse and individuated.';
    }

    let text = '**Collective Passages:**\n\n';

    state.collectivePassages.forEach(passage => {
      text += `**${passage.name}**\n`;
      text += `${passage.description}\n`;
      text += `_Field dynamics: ${passage.fieldDynamics}_\n\n`;
    });

    return text;
  }

  private generateCulturalMoment(state: CollectiveFieldState): string {
    const moment = state.culturalMoment;

    let text = '**The Cultural Moment:**\n\n';
    text += `${moment.zeitgeist}\n\n`;

    if (moment.emergingPatterns.length > 0) {
      text += `Emerging symbolic patterns: ${moment.emergingPatterns.join(', ')}\n\n`;
    }

    if (moment.collectiveShadow.length > 0) {
      text += `Collective shadow material surfacing: ${moment.collectiveShadow.join(', ')}\n`;
    }

    return text;
  }

  private generateGuidance(state: CollectiveFieldState): string {
    const topPhase = state.dominantPhases[0];

    // Phase-specific guidance
    const phaseGuidance: Record<string, string> = {
      'Fire-1': 'Many are receiving calls and sparks. Honor what wants to begin, even if it feels small.',
      'Fire-2': 'Many are in trial and testing. This is the gauntlet - resistance is part of the path.',
      'Fire-3': 'Many are integrating fire into identity. Notice who you are becoming through action.',
      'Water-1': 'Many are opening to deeper feelings. Vulnerability is the threshold to gold.',
      'Water-2': 'Many are in the underworld passage. This descent has purpose - old wounds surface to heal.',
      'Water-3': 'Many are integrating emotional gold. The truth about yourself is becoming more solid.',
      'Earth-1': 'Many are designing new forms. What structure or container would support your insight?',
      'Earth-2': 'Many are building and resourcing. Practice and habit keep the work alive.',
      'Earth-3': 'Many are embodying stable presence. Care for and maintain what you have created.',
      'Air-1': 'Many are ready for first sharing. Who would you most want to tell?',
      'Air-2': 'Many are discovering patterns to teach. What principle could serve others?',
      'Air-3': 'Many are seeding culture. How might your story become part of a larger myth?'
    };

    return phaseGuidance[topPhase.phase] || 'Trust the process. The collective is moving.';
  }

  private generateArchetypalGuidance(archetype: any): string {
    const guidance: Record<string, string> = {
      'Shadow': 'Shadow is strongly active. This is healthy - what we reject wants integration. Be gentle with yourself and others.',
      'Threshold': 'Many are at thresholds. Liminal spaces are sacred. Resist rushing through.',
      'Death-Rebirth': 'Death-rebirth is constellating. Something is dying so something new can be born.',
      'Anima': 'The inner feminine is calling for attention. Dreams, feelings, and relationships carry wisdom.',
      'Senex': 'Wisdom-seeking is active. The old one within has guidance to offer.'
    };

    return guidance[archetype.archetype] || '';
  }

  private getIntensityEmoji(intensity: number): string {
    if (intensity > 0.7) return '🔥🔥🔥';
    if (intensity > 0.5) return '🔥🔥';
    return '🔥';
  }

  private getWeekLabel(date: Date): string {
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `Week of ${month} ${day}, ${year}`;
  }
}
```

---

## Integration with Oracle Endpoint

Update the oracle conversation endpoint to extract and contribute patterns:

```typescript
// app/api/oracle/conversation/route.ts

import { PatternExtractionService } from '@/lib/consciousness/pattern-extraction';
import { AnonymousContributionService } from '@/lib/consciousness/anonymous-contribution';

// ... inside POST handler, after axiom evaluation:

// Extract archetypal pattern
const patternExtractor = new PatternExtractionService();
const extractedPattern = await patternExtractor.extractPatterns(
  message,
  maiaResponse.coreMessage,
  spiralogicCell,
  conversationHistory
);

// Contribute to collective field (if user opted in)
const contributionService = new AnonymousContributionService();
const userOptIn = await contributionService.getUserFieldOptIn(userId);
await contributionService.contributeToField(extractedPattern, userOptIn);

console.log('🌐 [Collective Field] Pattern extracted:', {
  phase: extractedPattern.spiralogicPhase,
  archetypes: extractedPattern.archetypes,
  contributed: userOptIn
});
```

---

## Database Migrations

```sql
-- Migration: Add collective field tables

-- Anonymous patterns table
CREATE TABLE anonymous_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  pattern_type TEXT NOT NULL,
  spiralogic_phase TEXT,
  archetypes TEXT[],
  symbols TEXT[],
  emotional_signature TEXT,
  life_domain TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anonymous_patterns_timestamp ON anonymous_patterns(timestamp);
CREATE INDEX idx_anonymous_patterns_phase ON anonymous_patterns(spiralogic_phase);
CREATE INDEX idx_anonymous_patterns_domain ON anonymous_patterns(life_domain);

-- Field states table
CREATE TABLE field_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL,
  active_archetypes JSONB NOT NULL,
  dominant_phases JSONB NOT NULL,
  collective_passages JSONB,
  cultural_moment JSONB,
  user_count INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_field_states_timestamp ON field_states(timestamp);

-- Add opt-in field to users table
ALTER TABLE users ADD COLUMN contribute_to_collective_field BOOLEAN DEFAULT true;
```

---

## API Endpoints

### Get Current Field State

```typescript
// app/api/collective-field/current/route.ts

import { CollectiveFieldAnalysisService } from '@/lib/consciousness/collective-field-analysis';

export async function GET(request: NextRequest) {
  const analysisService = new CollectiveFieldAnalysisService();

  // Last 7 days
  const fieldState = await analysisService.analyzeField({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  return NextResponse.json({
    success: true,
    fieldState
  });
}
```

### Get Weekly Field Report

```typescript
// app/api/collective-field/report/route.ts

import { CollectiveFieldAnalysisService } from '@/lib/consciousness/collective-field-analysis';
import { FieldReportGenerator } from '@/lib/consciousness/field-report-generator';

export async function GET(request: NextRequest) {
  const analysisService = new CollectiveFieldAnalysisService();
  const reportGenerator = new FieldReportGenerator();

  // Last 7 days
  const fieldState = await analysisService.analyzeField({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const report = await reportGenerator.generateWeeklyReport(fieldState);

  return NextResponse.json({
    success: true,
    report
  });
}
```

---

## Testing

```typescript
// test-collective-field.ts

const testCollectiveField = async () => {
  console.log('🌐 Testing Collective Field System\n');

  // 1. Test pattern extraction
  const extractor = new PatternExtractionService();
  const pattern = await extractor.extractPatterns(
    'I feel ashamed about how I yelled at my daughter this morning.',
    'MAIA response...',
    { element: 'Water', phase: 2, context: 'parenting' },
    []
  );

  console.log('Extracted Pattern:', pattern);

  // 2. Test anonymous contribution
  const contributor = new AnonymousContributionService();
  await contributor.contributeToField(pattern, true);

  console.log('✅ Pattern contributed anonymously\n');

  // 3. Test field analysis
  const analyzer = new CollectiveFieldAnalysisService();
  const fieldState = await analyzer.analyzeField({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  console.log('Field State:', JSON.stringify(fieldState, null, 2));

  // 4. Test report generation
  const reporter = new FieldReportGenerator();
  const report = await reporter.generateWeeklyReport(fieldState);

  console.log('\n📊 Weekly Field Report:\n');
  console.log(report.title);
  console.log('='.repeat(60));
  console.log('\n' + report.summary + '\n');
  console.log(report.sections.archetypalWeather);
  console.log('\n' + report.sections.dominantThemes);
  console.log('\n' + report.sections.collectivePassages);
};

testCollectiveField();
```

---

## Next Steps

1. ✅ Design complete
2. Implement pattern extraction service
3. Implement anonymization & storage
4. Implement field analysis engine
5. Implement field report generator
6. Create API endpoints
7. Build internal field dashboard
8. Test with synthetic data
9. Deploy to production
10. Generate first real field report

---

**This is the architecture for making MAIA a living antenna for the collective psyche.** 🌐🌙🜍

Ready to begin implementation?
