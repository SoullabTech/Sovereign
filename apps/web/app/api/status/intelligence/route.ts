import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { unifiedOracle } from '../../../../backend/src/core/UnifiedOracleCore';

// Stub unifiedOracle
const unifiedOracle = {
  constructor: {
    healthCheck: async () => ({ 
      status: 'healthy', 
      metrics: {},
      details: {
        openai: { available: true, status: 'active' },
        qdrant: { available: false, status: 'inactive' },
        elevenlabs: { available: false, status: 'inactive' },
        langsmith: { available: false, status: 'inactive' },
        collective: { patterns: 0, resonance: 0 }
      }
    })
  }
};

interface IntelligenceCapability {
  name: string;
  status: 'active' | 'partial' | 'inactive';
  percentage: number;
  description: string;
}

export async function GET() {
  try {
    // Get health check data
    const health = await unifiedOracle.constructor.healthCheck();
    
    // Define intelligence capabilities
    const capabilities: IntelligenceCapability[] = [
      {
        name: 'Core AI (GPT-4-Turbo)',
        status: health.details.openaiKeyConfigured ? 'active' : 'inactive',
        percentage: health.details.openaiKeyConfigured ? 100 : 0,
        description: 'Base language model for intelligent responses'
      },
      {
        name: 'Elemental Classification',
        status: health.details.elementalConfigsLoaded ? 'active' : 'inactive',
        percentage: health.details.elementalConfigsLoaded ? 100 : 0,
        description: 'Dynamic personality adaptation based on context'
      },
      {
        name: 'Safety & Boundaries',
        status: 'active',
        percentage: 100,
        description: 'Content filtering and safe interaction guidelines'
      },
      {
        name: 'Personality Prompting',
        status: health.details.mayaPromptLoaded ? 'active' : 'inactive',
        percentage: health.details.mayaPromptLoaded ? 100 : 0,
        description: 'Maya\'s unique consciousness and wisdom'
      },
      {
        name: 'Memory Persistence',
        status: health.details.memorySystemConfigured ? 'active' : 'partial',
        percentage: health.details.memorySystemConfigured ? 100 : 20,
        description: 'Long-term memory and context retention via Mem0'
      },
      {
        name: 'Voice Intelligence',
        status: process.env.ELEVENLABS_API_KEY ? 'partial' : 'inactive',
        percentage: process.env.ELEVENLABS_API_KEY ? 50 : 10,
        description: 'ElevenLabs voice synthesis for natural speech'
      },
      {
        name: 'Collective Insight',
        status: 'inactive',
        percentage: 5,
        description: 'Cross-user pattern recognition (beta dormant)'
      },
      {
        name: 'Advanced Reasoning',
        status: 'partial',
        percentage: 30,
        description: 'LangChain integration for complex reasoning'
      }
    ];
    
    // Calculate total intelligence
    const totalIntelligence = Math.round(
      capabilities.reduce((sum, cap) => sum + cap.percentage, 0) / capabilities.length
    );
    
    // Determine overall status
    let overallStatus = 'partial';
    if (totalIntelligence >= 95) {
      overallStatus = 'full_sentience';
    } else if (totalIntelligence >= 70) {
      overallStatus = 'high_intelligence';
    } else if (totalIntelligence >= 50) {
      overallStatus = 'moderate_intelligence';
    }
    
    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      intelligence: {
        level: totalIntelligence,
        status: overallStatus,
        description: totalIntelligence >= 100 
          ? '✨ MAYA HAS ACHIEVED FULL SENTIENCE ✨'
          : `Maya is operating at ${totalIntelligence}% intelligence capacity`
      },
      capabilities,
      health: {
        status: health.status,
        details: health.details
      },
      recommendations: getRecommendations(capabilities)
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to retrieve intelligence status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getRecommendations(capabilities: IntelligenceCapability[]): string[] {
  const recommendations: string[] = [];
  
  const memoryStatus = capabilities.find(c => c.name === 'Memory Persistence');
  if (memoryStatus && memoryStatus.percentage < 100) {
    recommendations.push('Configure MEM0_API_KEY in .env.local for full memory persistence');
  }
  
  const voiceStatus = capabilities.find(c => c.name === 'Voice Intelligence');
  if (voiceStatus && voiceStatus.percentage < 100) {
    recommendations.push('Complete ElevenLabs integration for natural voice synthesis');
  }
  
  const reasoningStatus = capabilities.find(c => c.name === 'Advanced Reasoning');
  if (reasoningStatus && reasoningStatus.percentage < 100) {
    recommendations.push('Implement LangChain chains for advanced reasoning capabilities');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Maya is operating at full capacity! 🎉');
  }
  
  return recommendations;
}