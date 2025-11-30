import { NextRequest, NextResponse } from 'next/server';
import { maiaModelSystem } from '@/lib/models/maia-integration';

/**
 * MAIA-Obsidian Batch Processing API
 * Handles batch analysis of multiple notes for vault-wide insights
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      notes,
      analysisType = 'vault-synthesis',
      consciousnessLevel = 5
    } = body;

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json(
        { error: 'notes array is required' },
        { status: 400 }
      );
    }

    await maiaModelSystem.initialize();

    const results = [];

    switch (analysisType) {
      case 'vault-synthesis':
        // Create comprehensive synthesis of all notes
        const allContent = notes.map(note =>
          `**${note.path}:**\n${note.content}\n\n`
        ).join('');

        const synthesis = await maiaModelSystem.generateResponse({
          content: `Create a comprehensive synthesis of this consciousness research vault. Identify major themes, patterns, and insights that emerge across all documents. Focus on how these materials collectively inform MAIA's sacred technology development:\n\n${allContent}`,
          consciousnessLevel: 5,
          userId: 'obsidian-batch',
          context: {
            domain: 'spiritual',
            source: 'obsidian-vault',
            analysisType: 'vault-synthesis'
          }
        });

        results.push({
          type: 'vault-synthesis',
          content: synthesis.content,
          metadata: synthesis.metadata
        });

        break;

      case 'cross-connections':
        // Analyze connections between notes
        const connections = await analyzeConnections(notes);
        results.push({
          type: 'cross-connections',
          content: connections
        });

        break;

      case 'individual-summaries':
        // Process each note individually
        for (const note of notes) {
          const summary = await maiaModelSystem.generateResponse({
            content: `Create a focused summary of this consciousness research note, highlighting its unique contribution to the overall research:\n\n${note.content}`,
            consciousnessLevel: 3,
            userId: 'obsidian-batch',
            context: {
              domain: 'spiritual',
              source: 'obsidian',
              notePath: note.path
            }
          });

          results.push({
            type: 'individual-summary',
            notePath: note.path,
            content: summary.content,
            metadata: summary.metadata
          });
        }

        break;

      case 'research-gaps':
        // Identify gaps in research coverage
        const gaps = await identifyResearchGaps(notes);
        results.push({
          type: 'research-gaps',
          content: gaps
        });

        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        analysisType,
        consciousnessLevel,
        notesProcessed: notes.length,
        results,
        timestamp: new Date().toISOString(),
        suggestions: {
          nextActions: generateBatchNextActions(analysisType),
          integrationOpportunities: generateIntegrationOpportunities(results)
        }
      }
    });

  } catch (error) {
    console.error('Obsidian batch analysis error:', error);
    return NextResponse.json(
      {
        error: 'Batch analysis failed',
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
    const action = searchParams.get('action') || 'batch-types';

    if (action === 'batch-types') {
      return NextResponse.json({
        success: true,
        data: {
          batchAnalysisTypes: [
            {
              id: 'vault-synthesis',
              name: 'Vault Synthesis',
              description: 'Comprehensive analysis of entire consciousness research vault',
              consciousnessLevel: 5,
              timeEstimate: 'Long (2-5 minutes)'
            },
            {
              id: 'cross-connections',
              name: 'Cross-Note Connections',
              description: 'Map relationships and patterns between all notes',
              consciousnessLevel: 4,
              timeEstimate: 'Medium (1-3 minutes)'
            },
            {
              id: 'individual-summaries',
              name: 'Individual Summaries',
              description: 'Generate focused summaries for each note',
              consciousnessLevel: 3,
              timeEstimate: 'Variable (depends on note count)'
            },
            {
              id: 'research-gaps',
              name: 'Research Gap Analysis',
              description: 'Identify missing areas and research opportunities',
              consciousnessLevel: 4,
              timeEstimate: 'Medium (1-2 minutes)'
            }
          ]
        }
      });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );

  } catch (error) {
    console.error('Batch capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to get batch capabilities' },
      { status: 500 }
    );
  }
}

// Helper functions
async function analyzeConnections(notes: any[]) {
  const connectionPrompt = `Analyze the connections and relationships between these consciousness research notes. Create a network of ideas showing how different concepts relate to each other:

${notes.map((note, i) => `**Note ${i + 1} (${note.path}):**\n${note.content.substring(0, 500)}...\n\n`).join('')}

Focus on:
1. Recurring themes across notes
2. Complementary concepts that build on each other
3. Potential synthesis opportunities
4. Gaps where connections could be strengthened`;

  const response = await maiaModelSystem.generateResponse({
    content: connectionPrompt,
    consciousnessLevel: 4,
    userId: 'obsidian-connections',
    context: {
      domain: 'spiritual',
      source: 'obsidian-vault',
      analysisType: 'connections'
    }
  });

  return response.content;
}

async function identifyResearchGaps(notes: any[]) {
  const gapPrompt = `Analyze this consciousness research collection to identify gaps and opportunities for further research:

${notes.map((note, i) => `**${note.path}:**\n${note.content.substring(0, 400)}...\n\n`).join('')}

Identify:
1. Missing perspectives or traditions
2. Unexplored connections between existing concepts
3. Practical applications that could be developed
4. Research questions that arise from the current material
5. Areas where MAIA's sacred technology could benefit from additional research`;

  const response = await maiaModelSystem.generateResponse({
    content: gapPrompt,
    consciousnessLevel: 4,
    userId: 'obsidian-gaps',
    context: {
      domain: 'spiritual',
      source: 'obsidian-vault',
      analysisType: 'research-gaps'
    }
  });

  return response.content;
}

function generateBatchNextActions(analysisType: string): string[] {
  const actionMap = {
    'vault-synthesis': [
      'Review synthesis for key insights',
      'Create master integration document',
      'Apply insights to MAIA development'
    ],
    'cross-connections': [
      'Map visual connection network',
      'Create cross-reference documents',
      'Strengthen weak connections'
    ],
    'individual-summaries': [
      'Review all summaries',
      'Create summary index',
      'Identify standout insights'
    ],
    'research-gaps': [
      'Prioritize research opportunities',
      'Plan new research areas',
      'Seek additional sources'
    ]
  };

  return actionMap[analysisType] || ['Review results', 'Plan next steps'];
}

function generateIntegrationOpportunities(results: any[]): string[] {
  return [
    'Integrate insights into MAIA consciousness framework',
    'Create new synthesis documents',
    'Update research roadmap',
    'Enhance sacred technology development',
    'Connect to broader consciousness research community'
  ];
}