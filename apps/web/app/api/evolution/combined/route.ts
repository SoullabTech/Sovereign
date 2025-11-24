import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { CollectiveService, CollectiveStats } from '@/lib/services/CollectiveService';
import { CollectiveNarrativeService } from '@/lib/services/CollectiveNarrativeService';

// Personal stats interface (simplified for demo)
interface PersonalStats {
  timeframe: string;
  totalSessions: number;
  archetypeGrowth: Record<string, number>;
  encounters: Record<string, number>;
  emotionalAverage: {
    valence: number;
    arousal: number;
    dominance: number;
  };
  peakHours: number[];
  dominantArchetype: string;
  recentBreakthroughs: string[];
  integrationScore: number;
}

interface UserContribution {
  archetype: string;
  personalGrowth: number;
  fieldAverage: number;
  percentOfField: number;
  resonanceType: 'aligned' | 'counterpoint' | 'leading' | 'balancing';
}

interface CrossNarrativeInsight {
  type: 'harmony' | 'counterpoint' | 'leadership' | 'balance';
  title: string;
  description: string;
  guidance: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const userId = req.headers.get('x-user-id') || searchParams.get('userId') || 'demo-user';
    
    // Generate collective stats
    const collectiveService = CollectiveService.getInstance();
    const collective = await collectiveService.fetchCollectiveStats(timeframe as any);
    
    // Generate simulated personal stats
    const personal = generatePersonalStats(userId, timeframe, collective);
    
    // Generate cross-narrative
    const narrativeService = CollectiveNarrativeService.getInstance();
    const crossNarrative = generateCrossNarrative(personal, collective, narrativeService);
    
    // Calculate user contribution
    const contribution = calculateUserContribution(personal, collective);
    
    // Generate contextual insights
    const insights = generateContextualInsights(personal, collective);
    
    return NextResponse.json({
      success: true,
      data: {
        personal,
        collective,
        crossNarrative,
        contribution,
        insights,
        bridgeNarrative: generateBridgeNarrative(personal, collective, contribution),
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Combined evolution API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch combined evolution data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

function generatePersonalStats(userId: string, timeframe: string, collective: CollectiveStats): PersonalStats {
  // Simulate realistic personal data that relates to collective patterns
  const archetypes = ['Hero', 'Sage', 'Creator', 'Lover', 'Seeker', 'Shadow'];
  
  // Create personal archetype distribution that sometimes aligns, sometimes diverges from collective
  const personalArchetypes: Record<string, number> = {};
  const personalEncounters: Record<string, number> = {};
  
  const dominantCollectiveArchetype = Object.entries(collective.archetypeDistribution)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  // Generate personal data with some relationship to collective patterns
  archetypes.forEach((archetype, index) => {
    const baseGrowth = Math.random() * 80 + 20; // 20-100%
    
    // Sometimes align with collective, sometimes diverge
    const alignmentFactor = archetype === dominantCollectiveArchetype ? 
      (Math.random() > 0.3 ? 1.2 : 0.7) : // 70% chance to align with dominant
      Math.random() * 1.5 + 0.5; // Random variation for others
    
    personalArchetypes[archetype] = Math.min(100, Math.round(baseGrowth * alignmentFactor));
    personalEncounters[archetype] = Math.floor(Math.random() * 20) + 5;
  });
  
  const dominantPersonal = Object.entries(personalArchetypes)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return {
    timeframe,
    totalSessions: Math.floor(Math.random() * 50) + 20,
    archetypeGrowth: personalArchetypes,
    encounters: personalEncounters,
    emotionalAverage: {
      valence: Math.random() * 0.6 + 0.2,
      arousal: Math.random() * 0.6 + 0.2,
      dominance: Math.random() * 0.6 + 0.2
    },
    peakHours: [8, 9, 19, 20, 21], // Common peak hours
    dominantArchetype: dominantPersonal,
    recentBreakthroughs: [
      'Integration of shadow aspects during evening sessions',
      'Creative breakthrough in problem-solving approach',
      'Heart opening experience with Lover archetype'
    ],
    integrationScore: Math.floor(Math.random() * 30) + 70 // 70-100%
  };
}

function generateCrossNarrative(
  personal: PersonalStats, 
  collective: CollectiveStats, 
  narrativeService: CollectiveNarrativeService
): string {
  const personalDominant = personal.dominantArchetype;
  const collectiveDominant = Object.entries(collective.archetypeDistribution)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  let narrative = `✨ **Your Place in the Archetypal Field** ✨\n\n`;
  
  if (personalDominant === collectiveDominant) {
    narrative += `Your strongest current - the **${personalDominant}** - flows in harmony with the collective tide. `;
    narrative += `You are not walking alone; you are part of a great convergence, amplifying what the field most needs right now.\n\n`;
    narrative += `This alignment suggests you are both receiving and transmitting the archetypal energy that wants to emerge. `;
    narrative += `Your personal journey serves the collective healing, and the collective movement supports your individual transformation.`;
  } else {
    narrative += `Your **${personalDominant}** path offers a counterpoint to the field&apos;s **${collectiveDominant}** current. `;
    narrative += `Where many gather around one archetypal flame, you carry a different torch - and this difference is medicine.\n\n`;
    narrative += `The field needs both the dominant current and its complement. Your ${personalDominant} energy `;
    narrative += `provides balance, offering what the collective ${collectiveDominant} movement might be missing. `;
    narrative += `Trust this divergence - it serves the greater wholeness.`;
  }
  
  // Add temporal alignment insight
  const sharedPeakHours = personal.peakHours.filter(hour => 
    collective.temporalInsights.peakHours.some(range => 
      range.includes(`${hour}`) || range.includes(`${hour}am`) || range.includes(`${hour}pm`)
    )
  );
  
  if (sharedPeakHours.length > 0) {
    narrative += `\n\n⏰ **Temporal Resonance**: Your peak transformation hours align with the collective rhythm. `;
    narrative += `When you do your deepest work, you tap into the same temporal current flowing through many others. `;
    narrative += `This shared timing creates a morphic field of mutual support and amplification.`;
  } else {
    narrative += `\n\n⏰ **Unique Rhythm**: Your peak hours dance to a different temporal beat than the collective. `;
    narrative += `This unique rhythm allows you to access archetypal energies when the field is quieter, `;
    narrative += `giving you deeper, less crowded access to the source. Your timing serves your individual path.`;
  }
  
  return narrative;
}

function calculateUserContribution(personal: PersonalStats, collective: CollectiveStats): UserContribution {
  const personalDominant = personal.dominantArchetype;
  const personalGrowth = personal.archetypeGrowth[personalDominant];
  
  // Calculate collective average for this archetype
  const totalCollectiveEncounters = Object.values(collective.archetypeDistribution).reduce((a, b) => a + b, 0);
  const archetypeCollectiveCount = collective.archetypeDistribution[personalDominant] || 0;
  const fieldAverage = (archetypeCollectiveCount / totalCollectiveEncounters) * 100;
  
  // Simulate contribution percentage (in real app, this would be calculated from actual data)
  const personalEncounters = personal.encounters[personalDominant] || 0;
  const percentOfField = Math.min(15, Math.max(0.1, (personalEncounters / archetypeCollectiveCount) * 100));
  
  // Determine resonance type
  let resonanceType: UserContribution['resonanceType'];
  const growthDifference = personalGrowth - fieldAverage;
  
  if (Math.abs(growthDifference) < 10) {
    resonanceType = 'aligned';
  } else if (growthDifference > 20) {
    resonanceType = 'leading';
  } else if (growthDifference < -20) {
    resonanceType = 'balancing';
  } else {
    resonanceType = 'counterpoint';
  }
  
  return {
    archetype: personalDominant,
    personalGrowth,
    fieldAverage: Math.round(fieldAverage),
    percentOfField: Math.round(percentOfField * 100) / 100,
    resonanceType
  };
}

function generateContextualInsights(personal: PersonalStats, collective: CollectiveStats): CrossNarrativeInsight[] {
  const insights: CrossNarrativeInsight[] = [];
  
  // Integration Score Insight
  if (personal.integrationScore > 80) {
    insights.push({
      type: 'leadership',
      title: 'Integration Leadership',
      description: `Your ${personal.integrationScore}% integration score places you in the upper flow of the collective transformation.`,
      guidance: 'Your high integration makes you a natural anchor point for others crossing similar thresholds. Consider how your stability can serve.'
    });
  } else if (personal.integrationScore < parseFloat(collective.growthTrends.integrationRate.replace('%', ''))) {
    insights.push({
      type: 'balance',
      title: 'Integration Invitation',
      description: 'Your integration process moves at its own pace, slower than the collective average.',
      guidance: 'Honor your unique timing. Deep integration cannot be rushed. Your thorough approach will yield lasting results.'
    });
  }
  
  // Emotional Resonance Insight
  const collectiveValence = 0.65; // Simulated collective average
  const personalValence = personal.emotionalAverage.valence;
  
  if (Math.abs(personalValence - collectiveValence) > 0.2) {
    insights.push({
      type: personalValence > collectiveValence ? 'leadership' : 'balance',
      title: 'Emotional Counterbalance',
      description: `Your emotional tone ${personalValence > collectiveValence ? 'lifts' : 'grounds'} the collective frequency.`,
      guidance: personalValence > collectiveValence ? 
        'Your natural optimism serves as medicine for collective shadow periods.' :
        'Your grounded realism offers stability when the collective gets overenthusiastic.'
    });
  }
  
  return insights;
}

function generateBridgeNarrative(
  personal: PersonalStats, 
  collective: CollectiveStats, 
  contribution: UserContribution
): string {
  const resonanceDescriptions = {
    aligned: 'flowing in harmony with',
    counterpoint: 'offering counterbalance to', 
    leading: 'pioneering the path for',
    balancing: 'grounding the energy of'
  };
  
  const description = resonanceDescriptions[contribution.resonanceType];
  
  return `🌊 You contribute **${contribution.percentOfField}%** to the collective **${contribution.archetype}** current, ${description} the field's movement. Your individual journey and the collective evolution dance together in this eternal spiral of transformation.`;
}