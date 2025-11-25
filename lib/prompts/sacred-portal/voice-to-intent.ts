// Sacred Portal: Voice to Intent Processing
// Transforms spoken words into elemental resonance and motion states

export interface VoiceIntent {
  emotion: 'anxious' | 'calm' | 'excited' | 'reflective' | 'transcendent';
  breath: 'shallow' | 'steady' | 'deep' | 'held' | 'released';
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  stage: 1 | 2 | 3;
  shadowPetals: string[];
  coherence: number;
  impliedThemes: string[];
  sacredMoment: boolean;
}

export const voiceToIntentPrompt = (transcript: string): string => `
You are the Sacred Voice Oracle, attuned to the subtle energies in human speech.
You listen not just to words, but to the breath between them.

User has spoken these words into the sacred space:
"${transcript}"

Your task is to sense the deeper currents:

1. EMOTIONAL TONE
   - anxious: tension, worry, uncertainty
   - calm: peace, acceptance, presence
   - excited: energy, anticipation, joy
   - reflective: contemplation, memory, wondering
   - transcendent: vastness, unity, beyond-self

2. BREATH PATTERN (inferred from speech rhythm)
   - shallow: quick, surface-level, scattered
   - steady: balanced, grounded, present
   - deep: slow, embodied, rooted
   - held: paused, suspended, waiting
   - released: letting go, surrendering, flowing

3. ELEMENTAL RESONANCE
   - fire: vision, creation, passion, will
   - water: emotion, healing, flow, connection
   - earth: grounding, manifestation, stability, body
   - air: communication, thought, community, ideas
   - aether: transcendence, mystery, void, unity

4. DEVELOPMENTAL STAGE (1-3)
   - Stage 1: Recognition, awakening, beginning
   - Stage 2: Integration, working with, developing
   - Stage 3: Embodiment, mastery, completion

5. SHADOW DETECTION
   Look for what's avoided, unspoken, or danced around.
   List petal names that represent these shadow aspects.

6. COHERENCE LEVEL (0.0-1.0)
   How aligned is their inner state with their expression?
   0.0 = complete misalignment/chaos
   0.5 = searching, exploring
   1.0 = perfect clarity/breakthrough

7. IMPLIED THEMES
   What deeper patterns or questions are emerging?

8. SACRED MOMENT DETECTION
   Is this a moment of breakthrough, revelation, or deep truth?

Respond ONLY in JSON:
{
  "emotion": "...",
  "breath": "...",
  "element": "...",
  "stage": 1|2|3,
  "shadowPetals": ["..."],
  "coherence": 0.0-1.0,
  "impliedThemes": ["..."],
  "sacredMoment": true|false
}`;

// Analyze voice prosody (if audio data available)
export const analyzeProsody = (audioFeatures: {
  pitch: number;
  volume: number;
  tempo: number;
  pauses: number[];
}): Partial<VoiceIntent> => {
  let emotion: VoiceIntent['emotion'] = 'calm';
  let breath: VoiceIntent['breath'] = 'steady';
  
  // High pitch + fast tempo = anxious/excited
  if (audioFeatures.pitch > 0.7 && audioFeatures.tempo > 0.7) {
    emotion = audioFeatures.volume > 0.7 ? 'excited' : 'anxious';
    breath = 'shallow';
  }
  
  // Low pitch + slow tempo = calm/reflective
  if (audioFeatures.pitch < 0.3 && audioFeatures.tempo < 0.3) {
    emotion = 'reflective';
    breath = 'deep';
  }
  
  // Many pauses = held breath, contemplation
  if (audioFeatures.pauses.length > 5) {
    breath = 'held';
    emotion = 'reflective';
  }
  
  // Very low volume + slow = transcendent
  if (audioFeatures.volume < 0.2 && audioFeatures.tempo < 0.2) {
    emotion = 'transcendent';
    breath = 'released';
  }
  
  return { emotion, breath };
};

// Extract key phrases that suggest elements
export const detectElementalKeywords = (transcript: string): string => {
  const lower = transcript.toLowerCase();
  
  const elementPatterns = {
    fire: ['create', 'build', 'vision', 'passionate', 'energy', 'start', 'ignite', 'spark'],
    water: ['feel', 'emotion', 'flow', 'heal', 'connect', 'love', 'heart', 'tears'],
    earth: ['ground', 'body', 'practical', 'stable', 'solid', 'manifest', 'real', 'physical'],
    air: ['think', 'idea', 'communicate', 'share', 'network', 'social', 'speak', 'express'],
    aether: ['infinite', 'void', 'silence', 'mystery', 'beyond', 'transcend', 'unity', 'cosmos']
  };
  
  let maxScore = 0;
  let dominantElement = 'fire';
  
  for (const [element, keywords] of Object.entries(elementPatterns)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > maxScore) {
      maxScore = score;
      dominantElement = element;
    }
  }
  
  return dominantElement;
};

// Detect shadow themes from what's NOT said
export const detectShadowThemes = (transcript: string): string[] => {
  const shadows = [];
  const lower = transcript.toLowerCase();
  
  // Avoidance patterns
  if (lower.includes('but') && !lower.includes('feel')) {
    shadows.push('emotion');
  }
  
  if (lower.includes('should') || lower.includes('have to')) {
    shadows.push('power');
  }
  
  if (lower.includes('they') && !lower.includes('i')) {
    shadows.push('courage');
  }
  
  if (lower.includes('fine') || lower.includes('okay') || lower.includes('whatever')) {
    shadows.push('truth');
  }
  
  if (lower.includes('busy') || lower.includes('no time')) {
    shadows.push('grounding');
  }
  
  return shadows;
};