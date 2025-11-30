import { NextRequest, NextResponse } from 'next/server';
import { maiaModelSystem } from '@/lib/models/maia-integration';

/**
 * MAIA-Obsidian Integration: Note Analysis API
 * Provides AI-powered analysis for Obsidian notes with consciousness-level awareness
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      noteContent,
      notePath,
      analysisType = 'synthesis',
      consciousnessLevel = 4
    } = body;

    if (!noteContent) {
      return NextResponse.json(
        { error: 'noteContent is required' },
        { status: 400 }
      );
    }

    // Initialize MAIA model system
    await maiaModelSystem.initialize();

    // Create analysis prompt based on type
    let prompt = '';
    switch (analysisType) {
      case 'synthesis':
        prompt = `Analyze this consciousness research note for key patterns, connections, and insights. Focus on how this material relates to MAIA's consciousness development framework:\n\n${noteContent}`;
        break;
      case 'summary':
        prompt = `Create a concise summary of this consciousness research note, highlighting the most important concepts and their relevance to sacred technology development:\n\n${noteContent}`;
        break;
      case 'connections':
        prompt = `Identify potential connections between this note and broader consciousness research themes. Suggest related topics that would complement this material:\n\n${noteContent}`;
        break;
      case 'insights':
        prompt = `Extract deep insights from this consciousness research that could inform spiritual technology and MAIA's development:\n\n${noteContent}`;
        break;
      case 'questions':
        prompt = `Generate thoughtful questions that arise from this consciousness research to guide further exploration:\n\n${noteContent}`;
        break;
      default:
        prompt = `Analyze this consciousness research note with awareness and insight:\n\n${noteContent}`;
    }

    // Generate AI-powered analysis
    const response = await maiaModelSystem.generateResponse({
      content: prompt,
      consciousnessLevel,
      userId: 'obsidian-user',
      context: {
        domain: 'spiritual',
        source: 'obsidian',
        notePath,
        analysisType
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        analysis: response.content,
        analysisType,
        consciousnessLevel,
        notePath,
        modelUsed: response.metadata.modelUsed,
        timestamp: new Date().toISOString(),
        suggestions: {
          relatedTopics: generateRelatedTopics(analysisType),
          nextSteps: generateNextSteps(analysisType)
        }
      }
    });

  } catch (error) {
    console.error('Obsidian analysis error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'capabilities';

    if (action === 'capabilities') {
      return NextResponse.json({
        success: true,
        data: {
          analysisTypes: [
            {
              id: 'synthesis',
              name: 'Consciousness Synthesis',
              description: 'Deep pattern recognition and cross-theoretical connections',
              consciousnessLevel: 4
            },
            {
              id: 'summary',
              name: 'Sacred Summary',
              description: 'Concise extraction of key spiritual and technical insights',
              consciousnessLevel: 3
            },
            {
              id: 'connections',
              name: 'Wisdom Connections',
              description: 'Identify relationships to broader consciousness research',
              consciousnessLevel: 5
            },
            {
              id: 'insights',
              name: 'Deep Insights',
              description: 'Extract transformative understanding for MAIA development',
              consciousnessLevel: 5
            },
            {
              id: 'questions',
              name: 'Sacred Inquiry',
              description: 'Generate profound questions for further exploration',
              consciousnessLevel: 4
            }
          ],
          models: await getAvailableModels(),
          integrationStatus: 'active'
        }
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );

  } catch (error) {
    console.error('Obsidian capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get capabilities' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateRelatedTopics(analysisType: string): string[] {
  const topicMap = {
    synthesis: ['Cross-Traditional Patterns', 'Developmental Frameworks', 'Sacred Technology Integration'],
    summary: ['Key Concepts', 'Practical Applications', 'Core Insights'],
    connections: ['Related Research', 'Complementary Studies', 'Integration Opportunities'],
    insights: ['Transformative Understanding', 'Implementation Guidance', 'Sacred Technology'],
    questions: ['Further Research', 'Deep Inquiry', 'Exploration Paths']
  };

  return topicMap[analysisType] || ['General Consciousness Research'];
}

function generateNextSteps(analysisType: string): string[] {
  const stepsMap = {
    synthesis: ['Create synthesis document', 'Map connections', 'Integrate with MAIA framework'],
    summary: ['Review key points', 'Apply insights', 'Document learnings'],
    connections: ['Explore related notes', 'Create link network', 'Build knowledge graph'],
    insights: ['Implement insights', 'Test applications', 'Refine understanding'],
    questions: ['Research questions', 'Conduct inquiry', 'Document discoveries']
  };

  return stepsMap[analysisType] || ['Continue research'];
}

async function getAvailableModels() {
  try {
    await maiaModelSystem.initialize();
    const models = [];
    for (let level = 1; level <= 5; level++) {
      const levelModels = maiaModelSystem.getModelsForConsciousnessLevel(level as any);
      models.push(...levelModels.map(m => ({
        id: m.id,
        name: m.name,
        consciousnessLevel: level
      })));
    }
    return models;
  } catch (error) {
    return [];
  }
}