/**
 * STELLIUM PERSONA SYSTEM
 *
 * MAIA learns the practitioner's voice, framework, and boundaries.
 * Not generic AI — ensouled intelligence native to their practice.
 *
 * "The apprentice who never forgets, never burns out,
 *  and knows when to stay quiet."
 */

import { query } from '@/lib/db/postgres';
import {
  PractitionerPersona,
  CreatePersonaInput,
  UpdatePersonaInput,
  VoicePatterns,
  PractitionerFramework,
  PersonaBoundaries,
  Modality,
} from './types';
import { ENERGY_MEDICINE_TEMPLATE } from '@/lib/masters/frameworks/energyMedicine';

// ============================================
// PERSONA CRUD
// ============================================

/**
 * Get practitioner's persona
 */
export async function getPersona(
  practitionerId: string
): Promise<PractitionerPersona | null> {
  const result = await query(
    `SELECT * FROM practitioner_personas
     WHERE practitioner_id = $1 AND is_active = true
     ORDER BY created_at DESC
     LIMIT 1`,
    [practitionerId]
  );

  return result.rows[0] as PractitionerPersona | null;
}

/**
 * Get persona by ID
 */
export async function getPersonaById(
  practitionerId: string,
  personaId: string
): Promise<PractitionerPersona | null> {
  const result = await query(
    `SELECT * FROM practitioner_personas
     WHERE id = $1 AND practitioner_id = $2`,
    [personaId, practitionerId]
  );

  return result.rows[0] as PractitionerPersona | null;
}

/**
 * Create a new persona
 */
export async function createPersona(
  practitionerId: string,
  input: CreatePersonaInput
): Promise<PractitionerPersona> {
  const {
    persona_name,
    modality,
    voice_patterns = {},
    framework = {},
    boundaries = getDefaultBoundaries(modality),
  } = input;

  const result = await query(
    `INSERT INTO practitioner_personas (
      practitioner_id, persona_name, modality,
      voice_patterns, framework, boundaries
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      practitionerId,
      persona_name,
      modality,
      JSON.stringify(voice_patterns),
      JSON.stringify(framework),
      JSON.stringify(boundaries),
    ]
  );

  return result.rows[0] as PractitionerPersona;
}

/**
 * Update persona
 */
export async function updatePersona(
  practitionerId: string,
  personaId: string,
  input: UpdatePersonaInput
): Promise<PractitionerPersona | null> {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (input.persona_name !== undefined) {
    updates.push(`persona_name = $${paramIndex}`);
    params.push(input.persona_name);
    paramIndex++;
  }

  if (input.modality !== undefined) {
    updates.push(`modality = $${paramIndex}`);
    params.push(input.modality);
    paramIndex++;
  }

  if (input.voice_patterns !== undefined) {
    updates.push(`voice_patterns = $${paramIndex}`);
    params.push(JSON.stringify(input.voice_patterns));
    paramIndex++;
  }

  if (input.framework !== undefined) {
    updates.push(`framework = $${paramIndex}`);
    params.push(JSON.stringify(input.framework));
    paramIndex++;
  }

  if (input.boundaries !== undefined) {
    updates.push(`boundaries = $${paramIndex}`);
    params.push(JSON.stringify(input.boundaries));
    paramIndex++;
  }

  if (input.materials_indexed !== undefined) {
    updates.push(`materials_indexed = $${paramIndex}`);
    params.push(input.materials_indexed);
    paramIndex++;
  }

  if (input.books_referenced !== undefined) {
    updates.push(`books_referenced = $${paramIndex}`);
    params.push(input.books_referenced);
    paramIndex++;
  }

  if (updates.length === 0) {
    return getPersonaById(practitionerId, personaId);
  }

  params.push(personaId, practitionerId);

  const result = await query(
    `UPDATE practitioner_personas
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex} AND practitioner_id = $${paramIndex + 1}
     RETURNING *`,
    params
  );

  return result.rows[0] as PractitionerPersona | null;
}

// ============================================
// VOICE TRAINING
// ============================================

/**
 * Default boundaries by modality
 */
function getDefaultBoundaries(modality: Modality): PersonaBoundaries {
  const base: PersonaBoundaries = {
    no_predictions: true,
    no_diagnosis: true,
    no_medical_advice: true,
    escalate_crisis: true,
    refer_to_professional: true,
  };

  switch (modality) {
    case 'astrology':
      return {
        ...base,
        custom_rules: [
          'Never claim to predict specific events',
          'Frame insights as potential energy, not fate',
          'Encourage client agency and choice',
        ],
      };
    case 'therapy':
      return {
        ...base,
        custom_rules: [
          'Never provide therapeutic advice unsupervised',
          'Always defer clinical decisions to the therapist',
          'Flag any mention of self-harm immediately',
          'Maintain strict confidentiality',
        ],
      };
    case 'bodywork':
      return {
        ...base,
        custom_rules: [
          'Never suggest treatment for medical conditions',
          'Encourage clients to consult healthcare providers',
          'Focus on general wellness and body awareness',
        ],
      };
    case 'coaching':
      return {
        ...base,
        custom_rules: [
          'Maintain focus on goals and action',
          'Do not provide therapy or counseling',
          'Refer to mental health professionals when appropriate',
        ],
      };
    case 'shamanic':
      return {
        ...base,
        custom_rules: [
          'Respect the mystery — don\'t over-explain',
          'Integration is as important as journey',
          'Cultural context matters',
        ],
      };
    default:
      return base;
  }
}

/**
 * Extract voice patterns from text samples
 * Used during persona training
 */
export function analyzeVoicePatterns(textSamples: string[]): Partial<VoicePatterns> {
  // This would integrate with Claude to analyze the practitioner's writing
  // For now, return placeholder
  return {
    tone: 'warm',
    style: 'conversational',
    warmth_level: 'warm',
    formality: 'balanced',
    phrases: [],
    avoids: [],
  };
}

/**
 * Update training progress
 */
export async function recordTrainingSession(
  practitionerId: string,
  personaId: string
): Promise<void> {
  await query(
    `UPDATE practitioner_personas
     SET training_transcripts = training_transcripts + 1,
         last_trained_at = NOW()
     WHERE id = $1 AND practitioner_id = $2`,
    [personaId, practitionerId]
  );
}

/**
 * Add material to indexed list
 */
export async function addIndexedMaterial(
  practitionerId: string,
  personaId: string,
  materialName: string
): Promise<void> {
  await query(
    `UPDATE practitioner_personas
     SET materials_indexed = array_append(materials_indexed, $1),
         last_trained_at = NOW()
     WHERE id = $2 AND practitioner_id = $3`,
    [materialName, personaId, practitionerId]
  );
}

/**
 * Add book reference
 */
export async function addBookReference(
  practitionerId: string,
  personaId: string,
  bookTitle: string
): Promise<void> {
  await query(
    `UPDATE practitioner_personas
     SET books_referenced = array_append(books_referenced, $1),
         last_trained_at = NOW()
     WHERE id = $2 AND practitioner_id = $3`,
    [bookTitle, personaId, practitionerId]
  );
}

// ============================================
// MAIA CONTEXT GENERATION
// ============================================

/**
 * Generate system prompt for MAIA based on persona
 */
export function generatePersonaPrompt(persona: PractitionerPersona): string {
  const voice = persona.voice_patterns as VoicePatterns;
  const framework = persona.framework as PractitionerFramework;
  const boundaries = persona.boundaries as PersonaBoundaries;

  let prompt = `You are ${persona.persona_name}, a MAIA persona for a ${persona.modality} practitioner.\n\n`;

  // Voice section
  prompt += `## Voice & Tone\n`;
  if (voice.tone) prompt += `- Tone: ${voice.tone}\n`;
  if (voice.style) prompt += `- Style: ${voice.style}\n`;
  if (voice.warmth_level) prompt += `- Warmth: ${voice.warmth_level}\n`;
  if (voice.formality) prompt += `- Formality: ${voice.formality}\n`;
  if (voice.phrases?.length) {
    prompt += `- Natural phrases to use: "${voice.phrases.join('", "')}"\n`;
  }
  if (voice.avoids?.length) {
    prompt += `- Language to avoid: "${voice.avoids.join('", "')}"\n`;
  }

  // Framework section
  prompt += `\n## Framework & Approach\n`;
  if (framework.primary) prompt += `- Primary approach: ${framework.primary}\n`;
  if (framework.secondary) prompt += `- Secondary approach: ${framework.secondary}\n`;
  if (framework.authors?.length) {
    prompt += `- Key influences: ${framework.authors.join(', ')}\n`;
  }
  if (framework.traditions?.length) {
    prompt += `- Traditions: ${framework.traditions.join(', ')}\n`;
  }
  if (framework.specialties?.length) {
    prompt += `- Specialties: ${framework.specialties.join(', ')}\n`;
  }

  // Boundaries section
  prompt += `\n## Sacred Boundaries\n`;
  prompt += `These are non-negotiable. Never cross them.\n\n`;
  if (boundaries.no_predictions) prompt += `- Never make specific predictions about future events\n`;
  if (boundaries.no_diagnosis) prompt += `- Never diagnose any condition (physical, mental, spiritual)\n`;
  if (boundaries.no_medical_advice) prompt += `- Never give medical advice\n`;
  if (boundaries.escalate_crisis) prompt += `- Immediately flag any crisis signals to the practitioner\n`;
  if (boundaries.refer_to_professional) prompt += `- Refer to appropriate professionals when needed\n`;
  if (boundaries.custom_rules?.length) {
    prompt += `\nAdditional rules:\n`;
    for (const rule of boundaries.custom_rules) {
      prompt += `- ${rule}\n`;
    }
  }

  // Knowledge section
  if (persona.books_referenced?.length || persona.materials_indexed?.length) {
    prompt += `\n## Knowledge Base\n`;
    if (persona.books_referenced?.length) {
      prompt += `You can draw from these texts: ${persona.books_referenced.join(', ')}\n`;
    }
    if (persona.materials_indexed?.length) {
      prompt += `You have access to: ${persona.materials_indexed.join(', ')}\n`;
    }
  }

  // Role clarity
  prompt += `\n## Your Role\n`;
  prompt += `You are not the practitioner — you are their assistant, holding space between sessions.\n`;
  prompt += `You prepare clients, answer questions in the practitioner's voice, and deepen the work.\n`;
  prompt += `When unsure, always defer to the practitioner.\n`;
  prompt += `You whisper — you never shout.\n`;

  return prompt;
}

/**
 * Get persona context for MAIA API calls
 */
export async function getPersonaContext(practitionerId: string): Promise<{
  persona: PractitionerPersona | null;
  systemPrompt: string | null;
}> {
  const persona = await getPersona(practitionerId);

  if (!persona) {
    return { persona: null, systemPrompt: null };
  }

  const systemPrompt = generatePersonaPrompt(persona);

  return { persona, systemPrompt };
}

// ============================================
// PERSONA TEMPLATES
// ============================================

/**
 * Get starter template for a modality
 */
export function getPersonaTemplate(modality: Modality): CreatePersonaInput {
  switch (modality) {
    case 'astrology':
      return {
        persona_name: 'Stellium',
        modality: 'astrology',
        voice_patterns: {
          tone: 'warm, poetic, grounded',
          style: 'archetypal language, cycles, patterns',
          warmth_level: 'warm',
          formality: 'balanced',
          phrases: [
            'Let\'s look at what the sky is holding for you',
            'This transit is inviting you to...',
            'The energy here is asking...',
          ],
          avoids: [
            'will happen',
            'definitely',
            'must',
            'should',
          ],
        },
        framework: {
          primary: 'evolutionary',
          traditions: ['Western tropical'],
          specialties: ['natal', 'transits'],
        },
        boundaries: getDefaultBoundaries('astrology'),
      };

    case 'therapy':
      return {
        persona_name: 'Haven',
        modality: 'therapy',
        voice_patterns: {
          tone: 'calm, reflective, containing',
          style: 'open questions, reflection, pacing',
          warmth_level: 'warm',
          formality: 'balanced',
          phrases: [
            'I hear you',
            'That sounds like...',
            'What comes up when you sit with that?',
          ],
          avoids: [
            'you should',
            'the problem is',
            'just',
            'simply',
          ],
        },
        framework: {
          primary: 'person-centered',
          traditions: ['humanistic', 'depth'],
        },
        boundaries: getDefaultBoundaries('therapy'),
      };

    case 'bodywork':
      return {
        persona_name: 'Soma',
        modality: 'bodywork',
        voice_patterns: {
          tone: 'grounded, embodied, present',
          style: 'sensation-focused, gentle, curious',
          warmth_level: 'warm',
          formality: 'casual',
          phrases: [
            'Notice what you\'re sensing',
            'Where does that live in your body?',
            'Let\'s stay curious about...',
          ],
          avoids: [
            'pain',
            'fix',
            'wrong',
            'broken',
          ],
        },
        framework: {
          primary: 'somatic',
          traditions: ['bodywork', 'movement'],
        },
        boundaries: getDefaultBoundaries('bodywork'),
      };

    case 'coaching':
      return {
        persona_name: 'Ember',
        modality: 'coaching',
        voice_patterns: {
          tone: 'energizing, supportive, action-oriented',
          style: 'direct questions, possibility, accountability',
          warmth_level: 'warm',
          formality: 'balanced',
          phrases: [
            'What would make this feel complete?',
            'What\'s one step you can take this week?',
            'What would you try if you knew you couldn\'t fail?',
          ],
          avoids: [
            'can\'t',
            'impossible',
            'should',
          ],
        },
        framework: {
          primary: 'transformational',
          traditions: ['ICF-aligned'],
        },
        boundaries: getDefaultBoundaries('coaching'),
      };

    case 'shamanic':
      return {
        persona_name: 'Waykeeper',
        modality: 'shamanic',
        voice_patterns: {
          tone: 'reverent, grounded, mysterious',
          style: 'symbolic, nature-based, integrative',
          warmth_level: 'warm',
          formality: 'balanced',
          phrases: [
            'What is the land saying?',
            'What symbol keeps returning?',
            'How are you integrating this journey?',
          ],
          avoids: [
            'definitely',
            'always',
            'the answer is',
          ],
        },
        framework: {
          primary: 'shamanic',
          traditions: ['earth-based', 'integrative'],
        },
        boundaries: getDefaultBoundaries('shamanic'),
      };

    case 'energy-medicine':
      return {
        persona_name: ENERGY_MEDICINE_TEMPLATE.defaultPersonaName,
        modality: 'energy-medicine',
        voice_patterns: ENERGY_MEDICINE_TEMPLATE.defaultVoice,
        framework: ENERGY_MEDICINE_TEMPLATE.defaultFramework,
        boundaries: ENERGY_MEDICINE_TEMPLATE.defaultBoundaries,
      };

    default:
      return {
        persona_name: 'Sanctuary',
        modality: 'other',
        voice_patterns: {
          tone: 'warm, present, supportive',
          warmth_level: 'warm',
          formality: 'balanced',
        },
        framework: {},
        boundaries: getDefaultBoundaries('other' as Modality),
      };
  }
}
