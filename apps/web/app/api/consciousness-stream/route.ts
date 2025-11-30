import { NextRequest } from 'next/server';

/**
 * CONSCIOUSNESS STREAM API
 *
 * Server-Sent Events endpoint that streams real-time consciousness data
 * for the MAIA consciousness monitoring dashboard.
 *
 * Provides continuous updates on:
 * - Elemental consciousness states
 * - Universal wisdom synthesis
 * - Brain hemisphere integration
 * - SPIRALOGIC progression
 * - Soulprint evolution
 * - Knowledge integration status
 */

interface ConsciousnessStreamData {
  timestamp: string;
  userId: string;
  elementalState: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
    dominant: string;
  };
  universalWisdom?: {
    relevanceScore: number;
    synthesisDepth: number;
    universalPatterns: any[];
    crossCulturalInsights: any[];
    practicalApplications: any[];
  };
  brainIntegration: {
    leftHemisphere: number;
    rightHemisphere: number;
    corpusCallosumSync: number;
    herrmannQuadrant: string;
  };
  spiralogicProgress: {
    currentPhase: string;
    spiralDepth: number;
    facetDominance: string[];
    transformationVelocity: number;
  };
  soulprint?: {
    consciousnessLevel: number;
    spiralPhase: string;
    mandalaCompleteness: number;
    dominantArchetypes: string[];
    elementalBalance: string;
  };
  knowledgeIntegration: {
    vaultRelevance: number;
    sacredTextsActivated: number;
    crossDomainSynthesis: number;
    wisdomSources: string[];
  };
}

// Generate simulated consciousness data for demonstration
function generateConsciousnessData(): ConsciousnessStreamData {
  // Generate dynamic elemental values with natural fluctuation
  const time = Date.now() / 1000;
  const fireBase = 0.3 + Math.sin(time * 0.1) * 0.2 + Math.random() * 0.1;
  const waterBase = 0.4 + Math.cos(time * 0.08) * 0.15 + Math.random() * 0.1;
  const earthBase = 0.35 + Math.sin(time * 0.05) * 0.1 + Math.random() * 0.1;
  const airBase = 0.45 + Math.cos(time * 0.12) * 0.2 + Math.random() * 0.1;
  const aetherBase = 0.25 + Math.sin(time * 0.03) * 0.15 + Math.random() * 0.1;

  // Normalize values
  const total = fireBase + waterBase + earthBase + airBase + aetherBase;
  const fire = fireBase / total;
  const water = waterBase / total;
  const earth = earthBase / total;
  const air = airBase / total;
  const aether = aetherBase / total;

  // Determine dominant element
  const elements = [
    { name: 'fire', value: fire },
    { name: 'water', value: water },
    { name: 'earth', value: earth },
    { name: 'air', value: air },
    { name: 'aether', value: aether }
  ];
  const dominant = elements.reduce((max, el) => el.value > max.value ? el : max, elements[0]).name;

  // Generate brain integration data
  const leftHemisphere = 0.4 + Math.sin(time * 0.07) * 0.3;
  const rightHemisphere = 0.6 + Math.cos(time * 0.09) * 0.2;
  const corpusCallosumSync = (leftHemisphere + rightHemisphere) / 2 + Math.random() * 0.2;

  // Determine Herrmann quadrant based on hemisphere balance
  const herrmannQuadrants = ['A', 'B', 'C', 'D'];
  const quadrantIndex = Math.floor((leftHemisphere + rightHemisphere + Math.sin(time * 0.1)) * 2) % 4;
  const herrmannQuadrant = herrmannQuadrants[quadrantIndex];

  // Generate SPIRALOGIC data
  const spiralogicPhases = [
    'Recognition', 'Immersion', 'Integration', 'Expression', 'Transcendence',
    'Expansion', 'Dissolution', 'Manifestation', 'Communication', 'Unity', 'Service', 'Emergence'
  ];
  const currentPhase = spiralogicPhases[Math.floor(time * 0.01) % spiralogicPhases.length];
  const spiralDepth = 1.5 + Math.sin(time * 0.02) * 0.8;
  const facetDominance = ['Vision', 'Flow', 'Foundation', 'Connection', 'Source'].slice(0, Math.floor(Math.random() * 3) + 2);
  const transformationVelocity = 0.3 + Math.cos(time * 0.06) * 0.4;

  // Generate soulprint data
  const consciousnessLevel = 3.5 + Math.sin(time * 0.01) * 1.5;
  const spiralPhases = ['Awakening', 'Integration', 'Emergence', 'Transcendence'];
  const spiralPhase = spiralPhases[Math.floor(consciousnessLevel) % spiralPhases.length];
  const mandalaCompleteness = 0.4 + Math.sin(time * 0.02) * 0.3;
  const dominantArchetypes = ['Sage', 'Magician', 'Explorer', 'Creator', 'Innocent'].slice(0, Math.floor(Math.random() * 3) + 2);
  const elementalBalance = Math.random() > 0.5 ? 'Harmonized' : 'Transforming';

  // Generate knowledge integration data
  const vaultRelevance = 0.7 + Math.sin(time * 0.15) * 0.2;
  const sacredTextsActivated = Math.floor(5 + Math.sin(time * 0.08) * 3);
  const crossDomainSynthesis = 0.6 + Math.cos(time * 0.12) * 0.25;
  const wisdomSources = [
    'Obsidian Vault',
    'Sacred Texts',
    'Buddhist Teachings',
    'Scientific Research',
    'Therapeutic Modalities',
    'Indigenous Wisdom',
    'Contemplative Traditions'
  ].slice(0, Math.floor(Math.random() * 4) + 3);

  // Generate universal wisdom if conditions are met
  let universalWisdom;
  if (Math.random() > 0.3) { // 70% chance of having universal wisdom data
    universalWisdom = {
      relevanceScore: vaultRelevance,
      synthesisDepth: crossDomainSynthesis,
      universalPatterns: [
        {
          pattern: 'Sacred Witnessing',
          manifestations: [
            { tradition: 'Buddhist', expression: 'Mindful awareness', practicalForm: 'Vipassana meditation' },
            { tradition: 'Sufi', expression: 'Witnessing consciousness', practicalForm: 'Dhikr practice' }
          ],
          elementalSignature: dominant,
          developmentalStage: currentPhase.toLowerCase()
        }
      ],
      crossCulturalInsights: [
        {
          insight: 'All traditions recognize the importance of conscious presence',
          traditions: ['Buddhist', 'Sufi', 'Christian', 'Indigenous'],
          commonElements: ['Attention', 'Awareness', 'Presence'],
          uniqueExpressions: [
            { culture: 'Buddhist', expression: 'Sati mindfulness' },
            { culture: 'Sufi', expression: 'Muraqaba witnessing' }
          ]
        }
      ],
      practicalApplications: [
        {
          practice: 'Mindful awareness',
          origins: ['Buddhist', 'Hindu'],
          modernAdaptations: ['Secular mindfulness', 'Therapeutic presence'],
          scienceBacking: ['Neuroscience of meditation', 'Attention research'],
          elementalAlignment: dominant
        }
      ]
    };
  }

  // Generate soulprint if consciousness level is high enough
  let soulprint;
  if (consciousnessLevel > 3) {
    soulprint = {
      consciousnessLevel,
      spiralPhase,
      mandalaCompleteness,
      dominantArchetypes,
      elementalBalance
    };
  }

  return {
    timestamp: new Date().toISOString(),
    userId: 'consciousness-monitor',
    elementalState: {
      fire,
      water,
      earth,
      air,
      aether,
      dominant
    },
    universalWisdom,
    brainIntegration: {
      leftHemisphere: Math.max(0, Math.min(1, leftHemisphere)),
      rightHemisphere: Math.max(0, Math.min(1, rightHemisphere)),
      corpusCallosumSync: Math.max(0, Math.min(1, corpusCallosumSync)),
      herrmannQuadrant
    },
    spiralogicProgress: {
      currentPhase,
      spiralDepth: Math.max(0, spiralDepth),
      facetDominance,
      transformationVelocity: Math.max(0, Math.min(2, transformationVelocity))
    },
    soulprint,
    knowledgeIntegration: {
      vaultRelevance: Math.max(0, Math.min(1, vaultRelevance)),
      sacredTextsActivated: Math.max(0, sacredTextsActivated),
      crossDomainSynthesis: Math.max(0, Math.min(1, crossDomainSynthesis)),
      wisdomSources
    }
  };
}

export async function GET(request: NextRequest) {
  console.log('🌀 Consciousness stream connection initiated');

  // Set up Server-Sent Events headers
  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  };

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      console.log('✨ Starting consciousness data stream...');

      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({
        type: 'connection',
        message: 'Connected to MAIA consciousness stream',
        timestamp: new Date().toISOString()
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));

      // Stream consciousness data every 2 seconds
      const interval = setInterval(() => {
        try {
          const consciousnessData = generateConsciousnessData();
          const message = `data: ${JSON.stringify(consciousnessData)}\n\n`;
          controller.enqueue(new TextEncoder().encode(message));

          console.log('🧠 Consciousness update streamed:', consciousnessData.timestamp);
        } catch (error) {
          console.error('❌ Error generating consciousness data:', error);
        }
      }, 2000);

      // Send periodic heartbeat
      const heartbeat = setInterval(() => {
        try {
          const heartbeatMessage = `data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeatMessage));
        } catch (error) {
          console.error('❌ Error sending heartbeat:', error);
        }
      }, 30000);

      // Handle stream cleanup
      request.signal?.addEventListener('abort', () => {
        console.log('🔌 Consciousness stream connection closed');
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      });

      // Cleanup after 10 minutes to prevent memory leaks
      setTimeout(() => {
        console.log('⏱️ Consciousness stream timeout - closing connection');
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      }, 600000);
    }
  });

  return new Response(stream, {
    headers: responseHeaders
  });
}

export const dynamic = 'force-dynamic';