import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// Spiralogic-IPP Knowledge Base Integration API
// This endpoint integrates IPP content with MAIA's knowledge base for intelligent responses

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      userId,
      sessionId,
      context,
      element,
      phase, // 'assessment', 'imagery', 'integration', 'support'
      personalizations
    } = await request.json();

    if (!query) {
      return NextResponse.json({
        error: 'Query is required for knowledge base search'
      }, { status: 400 });
    }

    // Load all Spiralogic-IPP content
    const knowledge = await loadIPPKnowledgeBase();

    // Search and rank relevant content
    const relevantContent = searchKnowledge(query, knowledge, {
      element,
      phase,
      context
    });

    // Generate contextual response based on query type
    const response = generateContextualResponse(query, relevantContent, {
      userId,
      sessionId,
      element,
      phase,
      personalizations
    });

    return NextResponse.json({
      success: true,
      query,
      context: { element, phase },
      response,
      sources: relevantContent.map(item => ({
        file: item.source,
        section: item.section,
        relevance: item.relevance
      })),
      suggestions: generateFollowUpSuggestions(query, phase, element),
      metadata: {
        searchResults: relevantContent.length,
        timestamp: new Date().toISOString(),
        sessionId,
        phase,
        element
      }
    });

  } catch (error) {
    console.error('Knowledge base integration error:', error);
    return NextResponse.json({
      error: 'Failed to process knowledge query',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for knowledge base status and capabilities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const info = searchParams.get('info') || 'status';

    const contentPath = join(process.cwd(), 'apps', 'web', 'docs', 'community-library', 'spiralogic-ipp');

    if (!existsSync(contentPath)) {
      return NextResponse.json({
        status: 'not_available',
        error: 'Spiralogic-IPP content directory not found'
      }, { status: 404 });
    }

    const files = readdirSync(contentPath).filter(file =>
      file.endsWith('.md') || file.endsWith('.pdf')
    );

    if (info === 'capabilities') {
      return NextResponse.json({
        status: 'active',
        capabilities: {
          assessment: {
            description: 'Complete 40-question IPP assessment with scoring and interpretation',
            endpoints: ['/api/spiralogic-ipp/assessment'],
            features: ['Elemental scoring', 'Treatment planning', 'Progress tracking']
          },
          imagery: {
            description: 'Guided imagery scripts for all 5 elemental parents',
            endpoints: ['/api/spiralogic-ipp/imagery'],
            features: ['Trauma-sensitive adaptations', 'Cultural personalization', 'Session tracking']
          },
          knowledge: {
            description: 'Intelligent content search and contextual guidance',
            endpoints: ['/api/spiralogic-ipp/knowledge'],
            features: ['Semantic search', 'Phase-aware responses', 'Personalized guidance']
          },
          integration: {
            description: 'MAIA consciousness system integration',
            features: ['Oracle consultation context', 'Elemental alignment', 'Progress tracking']
          }
        },
        contentLibrary: {
          totalFiles: files.length,
          types: ['concepts', 'assessment', 'scripts', 'guidance'],
          elements: ['earth', 'water', 'fire', 'air', 'aether'],
          languages: ['english'], // Future: multi-language support
          formats: ['markdown', 'pdf', 'json', 'api']
        }
      });
    }

    return NextResponse.json({
      status: 'active',
      contentPath,
      filesLoaded: files.length,
      availableFiles: files,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
      integrationStatus: 'fully_operational'
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions for knowledge processing
async function loadIPPKnowledgeBase() {
  const contentPath = join(process.cwd(), 'apps', 'web', 'docs', 'community-library', 'spiralogic-ipp');
  const knowledge: any[] = [];

  if (!existsSync(contentPath)) {
    throw new Error('IPP content directory not found');
  }

  const files = readdirSync(contentPath).filter(file => file.endsWith('.md'));

  for (const file of files) {
    try {
      const content = readFileSync(join(contentPath, file), 'utf-8');
      const parsed = parseContentForKnowledge(content, file);
      knowledge.push(parsed);
    } catch (error) {
      console.warn(`Failed to load ${file}:`, error);
    }
  }

  return knowledge;
}

function parseContentForKnowledge(content: string, filename: string) {
  const sections: any[] = [];
  const lines = content.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];
  let metadata: any = {};

  // Parse frontmatter
  let inFrontmatter = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === '---' && i === 0) {
      inFrontmatter = true;
      continue;
    }
    if (line === '---' && inFrontmatter) {
      inFrontmatter = false;
      continue;
    }
    if (inFrontmatter) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        metadata[key.trim()] = valueParts.join(':').trim();
      }
      continue;
    }

    // Parse sections
    if (line.startsWith('#')) {
      if (currentSection && currentContent.length > 0) {
        sections.push({
          title: currentSection,
          content: currentContent.join('\n').trim(),
          type: getSectionType(currentSection),
          keywords: extractKeywords(currentContent.join('\n'))
        });
      }
      currentSection = line.replace(/^#+\s*/, '');
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Add final section
  if (currentSection && currentContent.length > 0) {
    sections.push({
      title: currentSection,
      content: currentContent.join('\n').trim(),
      type: getSectionType(currentSection),
      keywords: extractKeywords(currentContent.join('\n'))
    });
  }

  return {
    source: filename,
    metadata,
    sections,
    type: getFileType(filename),
    keywords: extractKeywords(content)
  };
}

function searchKnowledge(query: string, knowledge: any[], context: any = {}) {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  const results: any[] = [];

  for (const doc of knowledge) {
    for (const section of doc.sections) {
      const relevance = calculateRelevance(queryTerms, section, doc, context);
      if (relevance > 0.1) { // Minimum relevance threshold
        results.push({
          ...section,
          source: doc.source,
          relevance,
          docType: doc.type,
          metadata: doc.metadata
        });
      }
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
}

function calculateRelevance(queryTerms: string[], section: any, doc: any, context: any) {
  let score = 0;
  const sectionText = (section.title + ' ' + section.content).toLowerCase();
  const keywords = section.keywords || [];

  // Basic text matching
  for (const term of queryTerms) {
    const termRegex = new RegExp(term, 'gi');
    const matches = (sectionText.match(termRegex) || []).length;
    score += matches * 0.1;
  }

  // Keyword matching bonus
  for (const keyword of keywords) {
    if (queryTerms.some(term => keyword.toLowerCase().includes(term))) {
      score += 0.3;
    }
  }

  // Context matching bonuses
  if (context.element) {
    const elementRegex = new RegExp(context.element, 'gi');
    if (elementRegex.test(sectionText)) {
      score += 0.5;
    }
  }

  if (context.phase) {
    const phaseTerms = {
      assessment: ['assessment', 'scoring', 'evaluation', 'deficit'],
      imagery: ['imagery', 'guided', 'visualization', 'script'],
      integration: ['integration', 'practice', 'embodiment', 'application'],
      support: ['support', 'help', 'guidance', 'assistance']
    };

    const relevantTerms = phaseTerms[context.phase as keyof typeof phaseTerms] || [];
    for (const term of relevantTerms) {
      if (sectionText.includes(term)) {
        score += 0.2;
      }
    }
  }

  // File type relevance
  const fileTypeBonus: Record<string, number> = {
    assessment: context.phase === 'assessment' ? 0.3 : 0,
    scripts: context.phase === 'imagery' ? 0.3 : 0,
    guidance: context.phase === 'support' ? 0.3 : 0,
    concepts: 0.1
  };

  score += fileTypeBonus[doc.type] || 0;

  return Math.min(score, 1.0); // Cap at 1.0
}

function generateContextualResponse(query: string, relevantContent: any[], context: any) {
  const { phase, element, personalizations } = context;

  // Build response based on most relevant content
  const topContent = relevantContent.slice(0, 3);
  let response = '';

  if (phase === 'assessment') {
    response = generateAssessmentResponse(query, topContent, element);
  } else if (phase === 'imagery') {
    response = generateImageryResponse(query, topContent, element);
  } else if (phase === 'integration') {
    response = generateIntegrationResponse(query, topContent, element);
  } else {
    response = generateGeneralResponse(query, topContent, element);
  }

  // Add personalization if provided
  if (personalizations) {
    response += `\n\nPersonalized considerations: ${personalizations}`;
  }

  return {
    text: response,
    confidence: calculateConfidence(relevantContent),
    type: phase || 'general',
    element,
    supportingContent: topContent.map(item => ({
      title: item.title,
      snippet: item.content.substring(0, 200) + '...',
      relevance: item.relevance
    }))
  };
}

function generateAssessmentResponse(query: string, content: any[], element?: string) {
  const assessmentContent = content.find(item =>
    item.source.includes('Assessment') || item.title.toLowerCase().includes('assessment')
  );

  if (assessmentContent) {
    return `Based on the Spiralogic-IPP Assessment framework: ${assessmentContent.content.substring(0, 300)}...

${element ? `For ${element.toUpperCase()} element work specifically: Focus on ${getElementFocus(element)}.` : ''}

The assessment helps identify which Ideal Parent Functions were missing in your development and guides targeted healing work.`;
  }

  return `The Spiralogic-IPP Assessment evaluates your attachment patterns across 5 elemental domains. ${element ? `For ${element} element questions, focus on ${getElementFocus(element)}.` : ''} Each element represents different developmental needs and healing approaches.`;
}

function generateImageryResponse(query: string, content: any[], element?: string) {
  const imageryContent = content.find(item =>
    item.source.includes('Scripts') || item.title.toLowerCase().includes('imagery')
  );

  if (imageryContent) {
    return `Guided imagery approach: ${imageryContent.content.substring(0, 250)}...

${element ? `For ${element.toUpperCase()} Parent imagery: ${getElementImageryGuidance(element)}` : ''}

Remember to practice regularly (15-20 minutes daily) for optimal neuroplastic installation of these internal parent functions.`;
  }

  return `Guided imagery is the primary method for installing missing Ideal Parent Functions. ${element ? `${element.toUpperCase()} Parent imagery focuses on ${getElementFocus(element)}.` : ''} Practice involves meeting and internalizing the archetypal parent energy you needed.`;
}

function generateIntegrationResponse(query: string, content: any[], element?: string) {
  return `Integration involves applying your newly installed internal parent functions in daily life. ${element ? `For ${element} element: Practice accessing your internal ${element} parent during relevant situations.` : ''}

Key integration practices include:
- Calling on your internal parents during stress
- Noticing shifts in your emotional responses
- Practicing new patterns in relationships
- Building on your strengths while addressing remaining deficits

Progress is gradual but transformational as these new neural pathways strengthen.`;
}

function generateGeneralResponse(query: string, content: any[], element?: string) {
  if (content.length === 0) {
    return `I can help you understand the Spiralogic-IPP framework for attachment healing. ${element ? `Regarding ${element} element work: Focus on ${getElementFocus(element)}.` : ''} What specific aspect would you like to explore?`;
  }

  const bestMatch = content[0];
  return `${bestMatch.content.substring(0, 300)}...

${element ? `For ${element.toUpperCase()} element specifically: ${getElementFocus(element)}.` : ''}

This framework integrates clinical attachment research with elemental psychology for comprehensive healing.`;
}

// Utility functions
function getSectionType(title: string): string {
  const typeMap: Record<string, string> = {
    'assessment': 'evaluation',
    'imagery': 'practice',
    'earth': 'elemental',
    'water': 'elemental',
    'fire': 'elemental',
    'air': 'elemental',
    'aether': 'elemental',
    'integration': 'application',
    'next steps': 'guidance',
    'interpretation': 'analysis'
  };

  const lowerTitle = title.toLowerCase();
  for (const [key, type] of Object.entries(typeMap)) {
    if (lowerTitle.includes(key)) {
      return type;
    }
  }
  return 'general';
}

function getFileType(filename: string): string {
  if (filename.includes('Assessment')) return 'assessment';
  if (filename.includes('Scripts')) return 'scripts';
  if (filename.includes('Instructions') || filename.includes('Engaging')) return 'guidance';
  if (filename.includes('Protocol') || filename.includes('Archetypal')) return 'concepts';
  return 'general';
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const commonTerms = [
    'earth', 'water', 'fire', 'air', 'aether',
    'attachment', 'parent', 'imagery', 'assessment', 'healing',
    'trauma', 'safety', 'boundaries', 'emotional', 'soothing',
    'encouragement', 'guidance', 'wisdom', 'love', 'identity'
  ];

  for (const term of commonTerms) {
    if (text.toLowerCase().includes(term)) {
      keywords.push(term);
    }
  }

  return [...new Set(keywords)];
}

function getElementFocus(element: string): string {
  const focuses: Record<string, string> = {
    earth: 'safety, protection, structure, and reliable boundaries',
    water: 'emotional attunement, soothing, and nurturing care',
    fire: 'encouragement, confidence-building, and celebration of your uniqueness',
    air: 'clear communication, wisdom, and meaning-making guidance',
    aether: 'unconditional love, soul recognition, and authentic identity support'
  };
  return focuses[element.toLowerCase()] || 'archetypal parent installation';
}

function getElementImageryGuidance(element: string): string {
  const guidance: Record<string, string> = {
    earth: 'Visualize a deeply grounding, protective presence that makes you feel completely safe.',
    water: 'Connect with a nurturing, emotionally attuned presence that soothes and understands you.',
    fire: 'Meet an encouraging presence that delights in who you are and supports your self-expression.',
    air: 'Encounter a wise guide who offers clarity, perspective, and meaningful communication.',
    aether: 'Experience unconditional love from a presence that sees and celebrates your true essence.'
  };
  return guidance[element.toLowerCase()] || 'Connect with the archetypal parent energy you need most.';
}

function calculateConfidence(relevantContent: any[]): number {
  if (relevantContent.length === 0) return 0.3;

  const avgRelevance = relevantContent.reduce((sum, item) => sum + item.relevance, 0) / relevantContent.length;
  const contentBonus = Math.min(relevantContent.length * 0.1, 0.3);

  return Math.min(avgRelevance + contentBonus, 0.95);
}

function generateFollowUpSuggestions(query: string, phase?: string, element?: string): string[] {
  const base = [
    "How can I personalize this approach for my cultural background?",
    "What signs should I look for to know I'm making progress?",
    "How long should I practice before moving to the next element?"
  ];

  const phaseSpecific: Record<string, string[]> = {
    assessment: [
      "What does my score mean for my healing journey?",
      "Which element should I focus on first?",
      "How often should I retake the assessment?"
    ],
    imagery: [
      "How can I adapt this script if I have trouble visualizing?",
      "What should I do if the imagery brings up difficult emotions?",
      "How do I know if the internal parent is really installing?"
    ],
    integration: [
      "How can I access my internal parents during stress?",
      "What integration practices work best for daily life?",
      "How do I know when I'm ready for the next element?"
    ]
  };

  const elementSpecific: Record<string, string[]> = {
    earth: ["How can I build stronger boundaries?", "What helps with feeling safer?"],
    water: ["How can I improve emotional regulation?", "What supports self-soothing?"],
    fire: ["How can I build more confidence?", "What helps with taking initiative?"],
    air: ["How can I improve decision-making?", "What supports clearer thinking?"],
    aether: ["How can I strengthen my sense of identity?", "What supports authentic expression?"]
  };

  let suggestions = [...base];

  if (phase && phaseSpecific[phase]) {
    suggestions = [...suggestions, ...phaseSpecific[phase]];
  }

  if (element && elementSpecific[element.toLowerCase()]) {
    suggestions = [...suggestions, ...elementSpecific[element.toLowerCase()]];
  }

  return suggestions.slice(0, 5);
}