/**
 * PERSONA EXPORT / IMPORT
 *
 * Sovereignty portability: export all training data as a JSON bundle,
 * import into a different instance or restore from backup.
 *
 * Source of truth = your DB.
 * No dependency on vendor-side memory.
 * Export persona as JSON bundle when needed.
 */

import { getPersonaById } from './personas';
import {
  listCorrections,
  listExamples,
  listPreferences,
  listBuilds,
} from './trainingData';
import type { PersonaBundle } from './trainingTypes';

/**
 * Export a complete persona bundle — all training data, ready for backup or migration.
 */
export async function exportPersonaBundle(
  practitionerId: string,
  personaId: string
): Promise<PersonaBundle> {
  const [persona, corrections, examples, preferences, builds] = await Promise.all([
    getPersonaById(practitionerId, personaId),
    listCorrections(personaId),
    listExamples(personaId),
    listPreferences(personaId),
    listBuilds(personaId),
  ]);

  if (!persona) {
    throw new Error(`Persona ${personaId} not found`);
  }

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    persona: {
      name: persona.persona_name,
      modality: persona.modality,
    },
    corrections,
    examples,
    preferences,
    builds,
  };
}
