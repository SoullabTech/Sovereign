/**
 * Core Council Module
 *
 * The constitutional layer of the AIN committee system.
 *
 * Architecture:
 * - Core agents = psychic functions (Navigator, Guardian, Regulator, Mythopoet, Skeptic, Integrator)
 * - Framings = lenses that agents invoke
 * - Synthesis = the Integrator's domain (the conductor)
 *
 * Philosophy: "Rightful weighting + protected minority voice"
 * Not flattening, but bounded hierarchy that preserves augmentation.
 */

// Types
export * from './types';

// Framing affinities (lens → function mapping)
export {
  framingAffinities,
  getFramingAffinity,
  getPrimaryFunctions,
  getFramingsForFunction,
} from './framingAffinities';

// Charter loading
import { readFileSync } from 'fs';
import { join } from 'path';
import type { CouncilCharters, CoreAgentCharter, CoreAgentId } from './types';

// Cached charters (loaded once)
let _cachedCharters: CouncilCharters | null = null;

/**
 * Load the core council charters
 */
export function loadCoreCharters(): CouncilCharters {
  if (_cachedCharters) return _cachedCharters;

  const chartersPath = join(__dirname, 'coreCouncil.charters.json');
  const content = readFileSync(chartersPath, 'utf-8');
  _cachedCharters = JSON.parse(content) as CouncilCharters;
  return _cachedCharters;
}

/**
 * Get a specific agent's charter
 */
export function getAgentCharter(agentId: CoreAgentId): CoreAgentCharter | undefined {
  const charters = loadCoreCharters();
  return charters.agents.find(a => a.id === agentId);
}

/**
 * Get weight bounds for an agent
 */
export function getAgentWeightBounds(agentId: CoreAgentId): { min: number; max: number } {
  const charter = getAgentCharter(agentId);
  return charter?.weight_policy ?? { min: 0.10, max: 0.35 };
}

/**
 * Check if an agent should lead given context signals
 */
export function shouldAgentLead(
  agentId: CoreAgentId,
  signals: {
    activationLevel?: number;
    traumaSignals?: boolean;
    highStakes?: boolean;
    meaningThemes?: boolean;
    practicalRequest?: boolean;
  }
): boolean {
  // Regulator leads on high activation or trauma
  if (agentId === 'regulator') {
    return (signals.activationLevel ?? 0) > 0.6 || signals.traumaSignals === true;
  }

  // Guardian leads on high stakes
  if (agentId === 'guardian') {
    return signals.highStakes === true;
  }

  // Mythopoet leads on meaning themes (if not activated)
  if (agentId === 'mythopoet') {
    return signals.meaningThemes === true && (signals.activationLevel ?? 0) < 0.6;
  }

  // Navigator leads on practical requests
  if (agentId === 'navigator') {
    return signals.practicalRequest === true;
  }

  // Others don't typically "lead" — they contribute
  return false;
}
