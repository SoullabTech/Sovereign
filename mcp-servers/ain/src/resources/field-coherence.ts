/**
 * AIN Field Coherence Resource
 *
 * Provides real-time collective field coherence metrics.
 * Updates every 30 seconds with latest field state.
 */

export interface FieldCoherenceResource {
  coherence: number;
  stability: number;
  amplitude: number;
  activeParticipants: number;
  dominantElement: 'fire' | 'earth' | 'air' | 'water';
  elementalBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  collectivePhase: 'rest' | 'rising' | 'peak' | 'integration' | 'transition';
  resonanceQuality: 'chaotic' | 'organizing' | 'coherent' | 'crystalline';
  timestamp: string;
  nextUpdate: string;
}

// Cache for field state (30 second TTL)
let cachedState: FieldCoherenceResource | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

function generateFieldState(): FieldCoherenceResource {
  // In production, would aggregate from actual participant data
  // Simulating realistic field dynamics

  const coherence = 0.5 + Math.random() * 0.4;
  const stability = 0.5 + Math.random() * 0.4;
  const amplitude = 0.4 + Math.random() * 0.5;
  const activeParticipants = Math.floor(80 + Math.random() * 150);

  // Elemental balance
  const fireBase = 0.15 + Math.random() * 0.2;
  const earthBase = 0.15 + Math.random() * 0.2;
  const airBase = 0.15 + Math.random() * 0.2;
  const waterBase = 0.15 + Math.random() * 0.2;
  const total = fireBase + earthBase + airBase + waterBase;

  const elementalBalance = {
    fire: Math.round((fireBase / total) * 100) / 100,
    earth: Math.round((earthBase / total) * 100) / 100,
    air: Math.round((airBase / total) * 100) / 100,
    water: Math.round((waterBase / total) * 100) / 100,
  };

  // Find dominant element
  const elements: Array<'fire' | 'earth' | 'air' | 'water'> = ['fire', 'earth', 'air', 'water'];
  const dominantElement = elements.reduce((max, el) =>
    elementalBalance[el] > elementalBalance[max] ? el : max
  );

  // Determine collective phase based on hour of day and coherence
  const hour = new Date().getHours();
  let collectivePhase: FieldCoherenceResource['collectivePhase'];
  if (hour >= 5 && hour < 9) {
    collectivePhase = 'rising';
  } else if (hour >= 9 && hour < 12) {
    collectivePhase = 'peak';
  } else if (hour >= 12 && hour < 17) {
    collectivePhase = 'integration';
  } else if (hour >= 17 && hour < 21) {
    collectivePhase = 'transition';
  } else {
    collectivePhase = 'rest';
  }

  // Determine resonance quality
  let resonanceQuality: FieldCoherenceResource['resonanceQuality'];
  if (coherence > 0.85 && stability > 0.8) {
    resonanceQuality = 'crystalline';
  } else if (coherence > 0.7) {
    resonanceQuality = 'coherent';
  } else if (coherence > 0.5) {
    resonanceQuality = 'organizing';
  } else {
    resonanceQuality = 'chaotic';
  }

  const now = new Date();
  const nextUpdate = new Date(now.getTime() + CACHE_TTL_MS);

  return {
    coherence: Math.round(coherence * 100) / 100,
    stability: Math.round(stability * 100) / 100,
    amplitude: Math.round(amplitude * 100) / 100,
    activeParticipants,
    dominantElement,
    elementalBalance,
    collectivePhase,
    resonanceQuality,
    timestamp: now.toISOString(),
    nextUpdate: nextUpdate.toISOString(),
  };
}

export async function getFieldCoherence(): Promise<FieldCoherenceResource> {
  const now = Date.now();

  // Return cached state if still valid
  if (cachedState && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedState;
  }

  // Generate new state
  cachedState = generateFieldState();
  cacheTimestamp = now;

  return cachedState;
}

// For testing/reset
export function resetFieldCoherenceCache(): void {
  cachedState = null;
  cacheTimestamp = 0;
}
