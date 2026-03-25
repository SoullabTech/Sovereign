/**
 * PERSONA BUILDER
 *
 * Synthesizes training inputs (corrections, examples, preferences) into
 * a versioned persona build. Uses Claude to analyze patterns and generate
 * coherent voice + stance blocks.
 *
 * Architecture:
 *   Training inputs → Builder → Draft build → Validation → Activation
 *
 * The builder NEVER overwrites MAIA base identity.
 * It produces voice_block + stance_block that get layered on top at runtime.
 *
 * Three layers are kept separate:
 *   Voice    — how the practitioner sounds
 *   Stance   — how the practitioner frames, challenges, refrains
 *   Knowledge — what the practitioner knows (V2, null for now)
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  listCorrections,
  listExamples,
  listPreferences,
  getLatestVersion,
  insertBuild,
} from './trainingData';
import { getPersonaById } from './personas';
import type {
  PersonaBuild,
  PersonaCorrection,
  PersonaExample,
  PersonaPreference,
  BuildInputSummary,
  TrainingLayer,
  PreferenceCategory,
} from './trainingTypes';

const MAX_CORRECTIONS = 50;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ============================================
// MAIN BUILD FUNCTION
// ============================================

/**
 * Build a persona from training inputs.
 * Returns a DRAFT build (is_active = false, validation_status = 'draft').
 * Must be validated + activated separately.
 */
export async function buildPersona(
  personaId: string,
  practitionerId: string
): Promise<PersonaBuild> {
  // 1. Gather all inputs in parallel
  const [corrections, examples, preferences, persona, latestVersion] =
    await Promise.all([
      listCorrections(personaId),
      listExamples(personaId),
      listPreferences(personaId),
      getPersonaById(practitionerId, personaId),
      getLatestVersion(personaId),
    ]);

  if (!persona) {
    throw new Error(`Persona ${personaId} not found for practitioner ${practitionerId}`);
  }

  // 2. Apply correction guardrails
  const { usable, clustered, contradictory } = filterCorrections(corrections);

  // 3. Group by layer
  const voiceExamples = examples.filter(e => e.layer === 'voice');
  const stanceExamples = examples.filter(e => e.layer === 'stance');
  const voicePrefs = preferences.filter(p => p.category === 'voice');
  const stancePrefs = preferences.filter(p => p.category === 'stance');
  const boundaryPrefs = preferences.filter(p => p.category === 'boundary');

  // 4. Build synthesis prompt
  const synthesisPrompt = buildSynthesisPrompt({
    personaName: persona.persona_name,
    modality: persona.modality,
    corrections: usable,
    voiceExamples,
    stanceExamples,
    voicePrefs,
    stancePrefs,
    boundaryPrefs,
  });

  // 5. Call Claude for synthesis
  const { voice_block, stance_block } = await synthesize(synthesisPrompt);

  // 6. Compose system_prompt_block (voice + stance, no base — added at runtime)
  const system_prompt_block = [
    voice_block ? `## Voice\n${voice_block}` : '',
    stance_block ? `## Guidance Stance\n${stance_block}` : '',
    boundaryPrefs.length > 0
      ? `## Boundaries\n${boundaryPrefs.map(p => `- ${p.key}: ${p.value}`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  // 7. Build input summary
  const examplesCount = countByLayer(examples);
  const prefsCount = countByCategory(preferences);

  const buildInputSummary: BuildInputSummary = {
    corrections_count: usable.length,
    examples_count: examplesCount,
    preferences_count: prefsCount,
    corrections_clustered: clustered,
    corrections_contradictory: contradictory,
    built_at: new Date().toISOString(),
    previous_version: latestVersion > 0 ? latestVersion : null,
  };

  // 8. Store as draft
  const build = await insertBuild(personaId, {
    version: latestVersion + 1,
    voice_block,
    stance_block,
    knowledge_block: null, // V2
    system_prompt_block,
    base_system_block: null, // base is in oracle route, not stored per-build
    build_input_summary: buildInputSummary as unknown as Record<string, unknown>,
    validation_status: 'draft',
  });

  console.log(
    '[PersonaBuilder] Draft build v%d for persona %s: %d corrections, %d examples, %d preferences',
    build.version,
    personaId,
    usable.length,
    examples.length,
    preferences.length
  );

  return build;
}

// ============================================
// CORRECTION GUARDRAILS
// ============================================

interface FilteredCorrections {
  usable: PersonaCorrection[];
  clustered: number;
  contradictory: number;
}

function filterCorrections(
  corrections: PersonaCorrection[]
): FilteredCorrections {
  // Cap at most recent N
  const recent = corrections.slice(0, MAX_CORRECTIONS);

  // Simple dedup: if two corrections have very similar original_response, keep latest
  const seen = new Map<string, PersonaCorrection>();
  let clustered = 0;

  for (const c of recent) {
    const key = normalizeForComparison(c.original_response);
    if (seen.has(key)) {
      clustered++;
    } else {
      seen.set(key, c);
    }
  }

  // Detect contradictions: same original, opposite corrections
  // Simple heuristic: if two corrections for similar originals have very different corrections
  let contradictory = 0;
  const usable: PersonaCorrection[] = [];
  const correctionsByKey = new Map<string, PersonaCorrection[]>();

  for (const c of seen.values()) {
    const key = normalizeForComparison(c.original_response);
    const group = correctionsByKey.get(key) ?? [];
    group.push(c);
    correctionsByKey.set(key, group);
  }

  for (const group of correctionsByKey.values()) {
    if (group.length > 1) {
      // Multiple corrections for same-ish original — flag as contradictory, use latest only
      contradictory += group.length - 1;
      usable.push(group[0]); // most recent (already sorted desc)
    } else {
      usable.push(group[0]);
    }
  }

  return { usable, clustered, contradictory };
}

/**
 * Normalize text for comparison: lowercase, collapse whitespace, strip punctuation.
 */
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200); // compare first 200 chars only
}

// ============================================
// SYNTHESIS PROMPT
// ============================================

interface SynthesisInput {
  personaName: string;
  modality: string;
  corrections: PersonaCorrection[];
  voiceExamples: PersonaExample[];
  stanceExamples: PersonaExample[];
  voicePrefs: PersonaPreference[];
  stancePrefs: PersonaPreference[];
  boundaryPrefs: PersonaPreference[];
}

function buildSynthesisPrompt(input: SynthesisInput): string {
  const sections: string[] = [];

  sections.push(`You are synthesizing a persona profile for "${input.personaName}" (modality: ${input.modality}).`);
  sections.push(`Your task: analyze the training data below and produce TWO distinct blocks — a VOICE block and a STANCE block.`);
  sections.push(`These blocks will be used as part of an AI companion's system prompt. They must be written as clear directives.`);

  sections.push(`\nIMPORTANT RULES:
- Keep voice and stance SEPARATE. Voice is HOW the person sounds. Stance is HOW the person thinks and responds.
- Do NOT include any base system identity (that's handled separately).
- Do NOT include safety rules or non-negotiable boundaries (those are added at a higher layer).
- Write in second person ("You speak..." / "You tend to...").
- Be specific and concrete. Use examples from the training data.
- Keep each block under 3000 characters.`);

  // Corrections
  if (input.corrections.length > 0) {
    sections.push(`\n--- CORRECTIONS (${input.corrections.length}) ---`);
    sections.push(`These show what the practitioner changed about MAIA's responses. Extract voice and stance patterns.`);
    for (const c of input.corrections.slice(0, 30)) {
      sections.push(`Original: "${truncate(c.original_response, 300)}"`);
      sections.push(`Corrected: "${truncate(c.correction, 300)}"\n`);
    }
  }

  // Voice examples
  if (input.voiceExamples.length > 0) {
    sections.push(`\n--- VOICE EXAMPLES (${input.voiceExamples.length}) ---`);
    for (const e of input.voiceExamples.slice(0, 15)) {
      sections.push(`User: "${truncate(e.user_message, 200)}"`);
      sections.push(`Ideal: "${truncate(e.ideal_response, 300)}"\n`);
    }
  }

  // Stance examples
  if (input.stanceExamples.length > 0) {
    sections.push(`\n--- STANCE EXAMPLES (${input.stanceExamples.length}) ---`);
    for (const e of input.stanceExamples.slice(0, 15)) {
      sections.push(`User: "${truncate(e.user_message, 200)}"`);
      sections.push(`Ideal: "${truncate(e.ideal_response, 300)}"\n`);
    }
  }

  // Voice preferences
  if (input.voicePrefs.length > 0) {
    sections.push(`\n--- VOICE PREFERENCES ---`);
    for (const p of input.voicePrefs) {
      sections.push(`${p.key}: ${p.value}`);
    }
  }

  // Stance preferences
  if (input.stancePrefs.length > 0) {
    sections.push(`\n--- STANCE PREFERENCES ---`);
    for (const p of input.stancePrefs) {
      sections.push(`${p.key}: ${p.value}`);
    }
  }

  sections.push(`\n--- OUTPUT FORMAT ---
Return a JSON object with exactly two keys:
{
  "voice_block": "Your voice directives here...",
  "stance_block": "Your stance directives here..."
}

Each block should be a coherent set of directives, written in plain text with bullet points or short paragraphs. Do not use markdown headers within the blocks — those are added by the system.`);

  return sections.join('\n');
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

// ============================================
// CLAUDE SYNTHESIS CALL
// ============================================

async function synthesize(
  prompt: string
): Promise<{ voice_block: string; stance_block: string }> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 4096,
    system:
      'You are a persona synthesis engine. You analyze training data and produce structured persona blocks. Always return valid JSON.',
    messages: [{ role: 'user', content: prompt }],
  });

  const text =
    response.content[0]?.type === 'text' ? response.content[0].text : '';

  // Extract JSON from response (may be wrapped in ```json blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Builder synthesis did not return valid JSON');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      voice_block: parsed.voice_block ?? '',
      stance_block: parsed.stance_block ?? '',
    };
  } catch {
    throw new Error('Builder synthesis returned malformed JSON');
  }
}

// ============================================
// HELPERS
// ============================================

function countByLayer(
  examples: PersonaExample[]
): { voice: number; stance: number; knowledge: number } {
  const counts = { voice: 0, stance: 0, knowledge: 0 };
  for (const e of examples) {
    counts[e.layer as TrainingLayer]++;
  }
  return counts;
}

function countByCategory(
  preferences: PersonaPreference[]
): { voice: number; stance: number; boundary: number } {
  const counts = { voice: 0, stance: 0, boundary: 0 };
  for (const p of preferences) {
    counts[p.category as PreferenceCategory]++;
  }
  return counts;
}
