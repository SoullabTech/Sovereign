/**
 * Practice Worlds - Prompt Registry
 *
 * Each world is a pluggable interpretive lens with its own:
 * - Insight prompts (what to notice)
 * - Experiment prompts (what to try)
 * - Vocabulary (markers to detect)
 * - Voice (how MAIA speaks about this world)
 */

import { somaticWorld } from './somatic';
import { partsIfsWorld } from './parts-ifs';
import { jungianWorld } from './jungian';
import { attachmentWorld } from './attachment';

export interface WorldPromptModule {
  code: string;
  name: string;
  domain: 'body' | 'mind' | 'relational' | 'creative' | 'spiritual' | 'integrative';

  // MAIA's voice when speaking about this world
  voice: {
    introduction: string;      // How MAIA introduces this lens
    noticing: string;          // "I'm noticing..." prefix
    invitation: string;        // How to invite exploration
    affirmation: string;       // Celebrating use of this world
  };

  // Insight generation
  insightPrompts: Record<string, {
    systemContext: string;
    userTemplate: string;
    exampleOutput: string;
  }>;

  // Experiment suggestions
  experimentPrompts: {
    forSession: string;        // Suggest experiment for this session
    forGrowth: string;         // Suggest experiment for practitioner growth
  };

  // Detection
  vocabulary: string[];        // Markers to detect this world in text
  openingQuestions: string[];  // Questions that open this world
}

// World registry
export const WORLD_PROMPTS: Record<string, WorldPromptModule> = {
  somatic: somaticWorld,
  parts_ifs: partsIfsWorld,
  jungian: jungianWorld,
  attachment: attachmentWorld
};

// Get prompt module for a world code
export function getWorldPrompts(worldCode: string): WorldPromptModule | null {
  return WORLD_PROMPTS[worldCode] || null;
}

// Build insight prompt for a specific world and insight type
export function buildWorldInsightPrompt(params: {
  worldCode: string;
  insightType: string;
  transcript: string;
  practitionerContext?: string;
}): string | null {
  const world = WORLD_PROMPTS[params.worldCode];
  if (!world) return null;

  const insight = world.insightPrompts[params.insightType];
  if (!insight) return null;

  return `${insight.systemContext}

${world.voice.introduction}

${params.practitionerContext ? `Practitioner context: ${params.practitionerContext}` : ''}

Transcript:
${params.transcript}

${insight.userTemplate}`;
}

// Build experiment suggestion prompt
export function buildExperimentPrompt(params: {
  worldCode: string;
  context: 'session' | 'growth';
  sessionSummary: string;
  practitionerEdges?: string[];
}): string | null {
  const world = WORLD_PROMPTS[params.worldCode];
  if (!world) return null;

  const template = params.context === 'session'
    ? world.experimentPrompts.forSession
    : world.experimentPrompts.forGrowth;

  return `${world.voice.introduction}

${template}

Session summary:
${params.sessionSummary}

${params.practitionerEdges ? `Practitioner's current edges: ${params.practitionerEdges.join(', ')}` : ''}

Suggest ONE small, concrete experiment. Frame as invitation, not prescription.`;
}

// Get all vocabulary for detection across worlds
export function getAllWorldVocabulary(): Array<{ code: string; markers: string[] }> {
  return Object.entries(WORLD_PROMPTS).map(([code, world]) => ({
    code,
    markers: world.vocabulary
  }));
}
