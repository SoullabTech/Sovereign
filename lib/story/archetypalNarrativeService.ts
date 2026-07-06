/**
 * Archetypal Narrative Service
 *
 * Uses Claude to generate personalized soul stories from birth chart data.
 * Not prediction, but mythic framework for understanding one's journey.
 *
 * "Everyone needs to be seen, experienced, to experience and
 * to play their worlds into being with a master!"
 */

import Anthropic from '@anthropic-ai/sdk';
import { BirthChartData, generateGenesisChapter } from './storyWeaver';
import { HOUSE_NEURAL_MAPPING } from '@/lib/astrology/neuroArchetypalMapping';
import { ZODIAC_ARCHETYPES } from '@/lib/astrology/archetypeLibrary';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface NarrativeRequest {
  chartData: BirthChartData;
  userId?: string;
  /** Focus areas - what the narrative should emphasize */
  focus?: ('identity' | 'purpose' | 'relationships' | 'growth' | 'shadow')[];
  /** Include transit context for current moment */
  includeTransitContext?: boolean;
  /** User's name for personalization */
  userName?: string;
}

export interface ArchetypalNarrative {
  /** The main soul story narrative */
  narrative: string;
  /** Key archetypal themes identified */
  themes: string[];
  /** The soul's central invitation/calling */
  invitation: string;
  /** Suggested reflection questions */
  reflections: string[];
  /** Timestamp of generation */
  generatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Narrative Generation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a complete archetypal narrative from birth chart data
 */
export async function generateArchetypalNarrative(
  request: NarrativeRequest
): Promise<ArchetypalNarrative> {
  const { chartData, focus = ['identity', 'purpose'], userName } = request;

  // Build rich context from chart data
  const chartContext = buildChartContext(chartData);
  const archetypeContext = buildArchetypeContext(chartData);

  // Generate the static foundation first
  const genesisFoundation = generateGenesisChapter(chartData);

  const prompt = buildNarrativePrompt({
    chartContext,
    archetypeContext,
    genesisFoundation,
    focus,
    userName,
  });

  // Call Claude to generate the dynamic narrative
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    // Sonnet 5 defaults to adaptive thinking; disable so content[0] stays text.
    // Cast: installed @anthropic-ai/sdk 0.27.3 types predate the thinking param.
    thinking: { type: 'disabled' },
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  } as any);

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === 'text');
  const rawResponse = textBlock?.type === 'text' ? textBlock.text : '';

  // Parse the structured response
  return parseNarrativeResponse(rawResponse);
}

/**
 * Generate a quick narrative summary (faster, less detailed)
 */
export async function generateQuickNarrative(
  chartData: BirthChartData
): Promise<string> {
  // Use the static generator for quick results
  return generateGenesisChapter(chartData);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Context Builders
// ═══════════════════════════════════════════════════════════════════════════════

function buildChartContext(chartData: BirthChartData): string {
  const lines: string[] = [];

  // Core Trinity
  lines.push('## Core Trinity');
  lines.push(`- Sun: ${chartData.sun.sign} in House ${chartData.sun.house} (${chartData.sun.degrees.toFixed(1)}°)`);
  lines.push(`- Moon: ${chartData.moon.sign} in House ${chartData.moon.house} (${chartData.moon.degrees.toFixed(1)}°)`);
  lines.push(`- Rising: ${chartData.rising.sign} (${chartData.rising.degrees.toFixed(1)}°)`);

  // Personal Planets
  if (chartData.mercury || chartData.venus || chartData.mars) {
    lines.push('\n## Personal Planets');
    if (chartData.mercury) {
      lines.push(`- Mercury: ${chartData.mercury.sign} in House ${chartData.mercury.house}${chartData.mercury.retrograde ? ' (Rx)' : ''}`);
    }
    if (chartData.venus) {
      lines.push(`- Venus: ${chartData.venus.sign} in House ${chartData.venus.house}`);
    }
    if (chartData.mars) {
      lines.push(`- Mars: ${chartData.mars.sign} in House ${chartData.mars.house}`);
    }
  }

  // Outer Planets
  if (chartData.jupiter || chartData.saturn) {
    lines.push('\n## Social Planets');
    if (chartData.jupiter) {
      lines.push(`- Jupiter: ${chartData.jupiter.sign} in House ${chartData.jupiter.house}${chartData.jupiter.retrograde ? ' (Rx)' : ''}`);
    }
    if (chartData.saturn) {
      lines.push(`- Saturn: ${chartData.saturn.sign} in House ${chartData.saturn.house}${chartData.saturn.retrograde ? ' (Rx)' : ''}`);
    }
  }

  // Soul Points
  if (chartData.chiron || chartData.northNode) {
    lines.push('\n## Soul Points');
    if (chartData.chiron) {
      lines.push(`- Chiron: ${chartData.chiron.sign} in House ${chartData.chiron.house}`);
    }
    if (chartData.northNode) {
      lines.push(`- North Node: ${chartData.northNode.sign} in House ${chartData.northNode.house}`);
    }
  }

  // Chart Pattern
  if (chartData.chartPattern) {
    lines.push(`\n## Chart Pattern: ${chartData.chartPattern}`);
    if (chartData.focalPlanet) {
      lines.push(`- Focal Planet: ${chartData.focalPlanet}`);
    }
  }

  // Elemental Balance
  if (chartData.dominantElement) {
    lines.push(`\n## Dominant Element: ${chartData.dominantElement}`);
  }

  // Angular Planets
  if (chartData.angularPlanets && chartData.angularPlanets.length > 0) {
    lines.push(`\n## Angular Planets: ${chartData.angularPlanets.join(', ')}`);
  }

  return lines.join('\n');
}

function buildArchetypeContext(chartData: BirthChartData): string {
  const lines: string[] = [];

  // Sun archetype
  const sunArchetype = ZODIAC_ARCHETYPES[chartData.sun.sign.toLowerCase() as keyof typeof ZODIAC_ARCHETYPES];
  if (sunArchetype) {
    lines.push(`## Sun Archetype (${chartData.sun.sign})`);
    lines.push(`- Facet: ${sunArchetype.facetName}`);
    lines.push(`- Element: ${sunArchetype.element}`);
    if (sunArchetype.archetypes.jungian) {
      lines.push(`- Jungian: ${sunArchetype.archetypes.jungian.join(', ')}`);
    }
  }

  // Moon archetype
  const moonArchetype = ZODIAC_ARCHETYPES[chartData.moon.sign.toLowerCase() as keyof typeof ZODIAC_ARCHETYPES];
  if (moonArchetype) {
    lines.push(`\n## Moon Archetype (${chartData.moon.sign})`);
    lines.push(`- Facet: ${moonArchetype.facetName}`);
    lines.push(`- Element: ${moonArchetype.element}`);
    if (moonArchetype.archetypes.jungian) {
      lines.push(`- Jungian: ${moonArchetype.archetypes.jungian.join(', ')}`);
    }
  }

  // House archetypes for key placements
  const sunHouseData = HOUSE_NEURAL_MAPPING[chartData.sun.house];
  if (sunHouseData) {
    lines.push(`\n## Sun's House Domain (House ${chartData.sun.house})`);
    lines.push(`- Archetype: ${sunHouseData.archetypeTitle}`);
    lines.push(`- Life Domain: ${sunHouseData.developmentalStage}`);
    lines.push(`- Invitation: ${sunHouseData.spiritualInvitation.slice(0, 200)}...`);
  }

  return lines.join('\n');
}

function buildNarrativePrompt(params: {
  chartContext: string;
  archetypeContext: string;
  genesisFoundation: string;
  focus: string[];
  userName?: string;
}): string {
  const { chartContext, archetypeContext, genesisFoundation, focus, userName } = params;

  const nameRef = userName ? userName : 'this soul';

  return `You are MAIA, a consciousness midwife helping souls author their living mythology.

Your task: Generate a personalized archetypal narrative based on the birth chart data provided.

## Your Voice
- Write with Tarnas-level archetypal depth, not pop astrology
- Poetic but precise - every word matters
- Not prediction, but recognition - "this is who you ARE, not who you MUST become"
- Frame as invitation, not fate
- Honor the complexity - no simplistic sun-sign generalizations

## Birth Chart Data
${chartContext}

## Archetypal Context
${archetypeContext}

## Foundation (Template-Based)
${genesisFoundation}

## Focus Areas
Emphasize: ${focus.join(', ')}

## Output Format
Generate a response with exactly these sections, using the markers:

---NARRATIVE---
Write 3-5 paragraphs of soul story for ${nameRef}. Begin with their core essence (Sun/Moon/Rising trinity), then weave in how the chart pattern and dominant element shape their journey. Use mythological and archetypal language. Make it personal, alive, revelatory.

---THEMES---
List 3-5 key archetypal themes in this chart (one per line, brief phrases)

---INVITATION---
One powerful sentence capturing the soul's central calling/invitation

---REFLECTIONS---
3-4 reflection questions this chart invites (one per line)

---END---

Remember: This is living mythology, not fortune-telling. The goal is recognition - "Yes, that's me" - not prescription.`;
}

function parseNarrativeResponse(rawResponse: string): ArchetypalNarrative {
  // Extract sections using markers
  const narrativeMatch = rawResponse.match(/---NARRATIVE---\s*([\s\S]*?)(?=---THEMES---|$)/);
  const themesMatch = rawResponse.match(/---THEMES---\s*([\s\S]*?)(?=---INVITATION---|$)/);
  const invitationMatch = rawResponse.match(/---INVITATION---\s*([\s\S]*?)(?=---REFLECTIONS---|$)/);
  const reflectionsMatch = rawResponse.match(/---REFLECTIONS---\s*([\s\S]*?)(?=---END---|$)/);

  const narrative = narrativeMatch?.[1]?.trim() || rawResponse;
  const themesRaw = themesMatch?.[1]?.trim() || '';
  const invitation = invitationMatch?.[1]?.trim() || 'Your soul invites you to become who you already are.';
  const reflectionsRaw = reflectionsMatch?.[1]?.trim() || '';

  // Parse themes and reflections as line-separated lists
  const themes = themesRaw
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter((line) => line.length > 0);

  const reflections = reflectionsRaw
    .split('\n')
    .map((line) => line.replace(/^[-•*\d.]\s*/, '').trim())
    .filter((line) => line.length > 0);

  return {
    narrative,
    themes: themes.length > 0 ? themes : ['Self-discovery', 'Transformation', 'Integration'],
    invitation,
    reflections: reflections.length > 0 ? reflections : [
      'What patterns in your life reflect these archetypal themes?',
      'Where do you feel most alive and authentic?',
      'What is your soul asking you to integrate?',
    ],
    generatedAt: new Date(),
  };
}
