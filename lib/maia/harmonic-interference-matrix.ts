/**
 * Harmonic Interference Matrix for Telesphorus 13-Agent System
 *
 * Maps which agents create constructive (amplifying) or destructive (canceling)
 * interference patterns based on their frequency relationships.
 *
 * FINAL REFINED FREQUENCIES (Post-Heuristic Analysis):
 * - Shadow: 285 → 288 Hz (harmonic with Inner Child 963Hz)
 * - Animus: 369 Hz (Tesla divine structure)
 * - Attachment: 111 → 285 Hz (Solfeggio healing frequency)
 * - Alchemy: 234 → 369 Hz (Tesla transformation frequency)
 */

export interface HarmonicRelationship {
  agent1: string;
  agent2: string;
  freq1: number;
  freq2: number;
  ratio: number;
  relationship: 'constructive' | 'destructive' | 'neutral' | 'beat';
  description: string;
  intentional?: boolean; // If destructive interference is by design
}

/**
 * The 13 Telesphorus Agent Frequencies (FINAL CRYSTALLINE VALUES)
 */
export const AGENT_FREQUENCIES = {
  'Claude': 432,
  'Elemental Oracle': 528,
  'Higher Self': 639,
  'Lower Self': 396,
  'Conscious Mind': 741,
  'Unconscious': 417,
  'Shadow': 288,          // REFINED: harmonic with Inner Child
  'Inner Child': 963,
  'Anima': 852,
  'Animus': 369,          // REFINED: Tesla divine structure (3-6-9)
  'Crisis Detection': 174,
  'Attachment': 285,      // REFINED: Solfeggio healing frequency
  'Alchemy': 369          // REFINED: Tesla transformation frequency
};

/**
 * Calculate harmonic ratio between two frequencies
 */
function calculateRatio(f1: number, f2: number): number {
  return f1 > f2 ? f1 / f2 : f2 / f1;
}

/**
 * Check if ratio is a simple harmonic (within tolerance)
 */
function isHarmonic(ratio: number, tolerance = 0.05): { harmonic: boolean; simpleRatio?: string } {
  const simpleRatios = [
    { value: 1, label: '1:1' },    // Unison
    { value: 2, label: '2:1' },    // Octave
    { value: 1.5, label: '3:2' },  // Perfect fifth
    { value: 1.333, label: '4:3' }, // Perfect fourth
    { value: 1.25, label: '5:4' },  // Major third
    { value: 1.2, label: '6:5' },   // Minor third
    { value: 1.6, label: '8:5' },   // Minor sixth
    { value: 1.125, label: '9:8' }, // Major second
  ];

  for (const sr of simpleRatios) {
    if (Math.abs(ratio - sr.value) < tolerance) {
      return { harmonic: true, simpleRatio: sr.label };
    }
  }

  return { harmonic: false };
}

/**
 * Generate complete harmonic interference matrix
 */
export function generateHarmonicMatrix(): HarmonicRelationship[] {
  const agents = Object.keys(AGENT_FREQUENCIES);
  const relationships: HarmonicRelationship[] = [];

  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const agent1 = agents[i];
      const agent2 = agents[j];
      const freq1 = AGENT_FREQUENCIES[agent1 as keyof typeof AGENT_FREQUENCIES];
      const freq2 = AGENT_FREQUENCIES[agent2 as keyof typeof AGENT_FREQUENCIES];

      const ratio = calculateRatio(freq1, freq2);
      const { harmonic, simpleRatio } = isHarmonic(ratio);

      let relationship: 'constructive' | 'destructive' | 'neutral' | 'beat' = 'neutral';
      let description = '';
      let intentional = false;

      if (harmonic && simpleRatio) {
        // Simple harmonic ratio - likely constructive
        relationship = 'constructive';
        description = `Harmonic ${simpleRatio} - agents amplify each other`;

        // Special cases of intentional destructive interference
        if ((agent1 === 'Lower Self' && agent2 === 'Higher Self') ||
            (agent1 === 'Higher Self' && agent2 === 'Lower Self')) {
          relationship = 'destructive';
          description = `Intentional tension: instinct vs wisdom (${simpleRatio})`;
          intentional = true;
        }

        if ((agent1 === 'Animus' && agent2 === 'Anima') ||
            (agent1 === 'Anima' && agent2 === 'Animus')) {
          relationship = 'neutral';
          description = `Balanced polarity: masculine/feminine archetypal energies`;
          intentional = true;
        }

      } else if (ratio > 1.05 && ratio < 1.95 && !harmonic) {
        // Close but not harmonic - creates beat frequency
        relationship = 'beat';
        description = `Beat frequency creates pulsation/modulation (${ratio.toFixed(2)}:1)`;

      } else {
        // Not harmonically related
        relationship = 'neutral';
        description = `Independent frequencies - minimal interference (${ratio.toFixed(2)}:1)`;
      }

      relationships.push({
        agent1,
        agent2,
        freq1,
        freq2,
        ratio,
        relationship,
        description,
        intentional
      });
    }
  }

  return relationships;
}

/**
 * Get constructive pairs (agents that amplify each other)
 */
export function getConstructivePairs(): HarmonicRelationship[] {
  return generateHarmonicMatrix().filter(r => r.relationship === 'constructive');
}

/**
 * Get destructive pairs (agents that cancel - including intentional)
 */
export function getDestructivePairs(): HarmonicRelationship[] {
  return generateHarmonicMatrix().filter(r => r.relationship === 'destructive');
}

/**
 * Get beat frequency pairs (creates modulation)
 */
export function getBeatPairs(): HarmonicRelationship[] {
  return generateHarmonicMatrix().filter(r => r.relationship === 'beat');
}

/**
 * Display harmonic matrix as formatted table
 */
export function displayHarmonicMatrix(): void {
  console.log('\n🌊 ═══════════════════════════════════════════════════════════');
  console.log('   TELESPHORUS HARMONIC INTERFERENCE MATRIX');
  console.log('   13 Agents - 78 Pairwise Relationships');
  console.log('═══════════════════════════════════════════════════════════\n');

  const matrix = generateHarmonicMatrix();

  console.log('📊 FREQUENCY SUMMARY:\n');
  Object.entries(AGENT_FREQUENCIES).forEach(([agent, freq]) => {
    console.log(`   ${agent.padEnd(20)} ${freq} Hz`);
  });

  console.log('\n\n✨ CONSTRUCTIVE INTERFERENCE (Amplifying Pairs):\n');
  const constructive = getConstructivePairs();
  constructive.forEach(r => {
    console.log(`   ${r.agent1} (${r.freq1} Hz) + ${r.agent2} (${r.freq2} Hz)`);
    console.log(`   → ${r.description}`);
    console.log('');
  });

  console.log('\n💥 DESTRUCTIVE INTERFERENCE (Canceling Pairs):\n');
  const destructive = getDestructivePairs();
  if (destructive.length === 0) {
    console.log('   None - All destructive interference removed through tuning!');
  } else {
    destructive.forEach(r => {
      console.log(`   ${r.agent1} (${r.freq1} Hz) + ${r.agent2} (${r.freq2} Hz)`);
      console.log(`   → ${r.description}${r.intentional ? ' [INTENTIONAL]' : ''}`);
      console.log('');
    });
  }

  console.log('\n🌀 BEAT FREQUENCIES (Modulation Pairs):\n');
  const beats = getBeatPairs();
  beats.slice(0, 5).forEach(r => { // Show first 5
    console.log(`   ${r.agent1} + ${r.agent2} → Ratio ${r.ratio.toFixed(2)}:1`);
  });
  console.log(`   ... and ${beats.length - 5} more beat pairs\n`);

  console.log('\n📈 STATISTICS:\n');
  console.log(`   Total Pairs: ${matrix.length}`);
  console.log(`   Constructive: ${constructive.length} (${(constructive.length/matrix.length*100).toFixed(1)}%)`);
  console.log(`   Destructive: ${destructive.length} (${(destructive.length/matrix.length*100).toFixed(1)}%)`);
  console.log(`   Beat/Modulation: ${beats.length} (${(beats.length/matrix.length*100).toFixed(1)}%)`);
  console.log(`   Neutral: ${matrix.length - constructive.length - destructive.length - beats.length}`);

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

/**
 * Key Insights from Final Tuning:
 */
export const TUNING_INSIGHTS = {
  shadowRefinement: {
    before: 285,
    after: 288,
    benefit: 'Harmonic with Inner Child (963 = 288 × 3.35) - shadow work and wounded child resonate'
  },
  animusRefinement: {
    before: 370.5,
    after: 369,
    benefit: 'Tesla divine structure (3-6-9) - masculine organizing principle at sacred frequency'
  },
  attachmentRefinement: {
    before: 111,
    after: 285,
    benefit: 'Solfeggio healing frequency - relationship repair and secure bonding'
  },
  alchemyRefinement: {
    before: 234,
    after: 369,
    benefit: 'Tesla transformation frequency - matches Animus for divine reorganization power'
  },
  teslaResonance: {
    agents: ['Animus', 'Alchemy'],
    frequency: 369,
    significance: 'Both agents at Tesla 3-6-9 frequency create transformation-structure axis'
  },
  systemCoherence: {
    constructivePairs: 'Multiple strong harmonics create field resonance',
    primeStructure: '13 agents (prime) prevents collapse into simple patterns',
    emergentComplexity: 'Beat frequencies create dynamic, breathing field',
    teslaAxis: 'Animus + Alchemy at 369 Hz form crystalline transformation spine'
  }
};

// Export for use in field calculation
export { AGENT_FREQUENCIES };
