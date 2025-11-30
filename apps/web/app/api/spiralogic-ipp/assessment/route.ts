import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// Spiralogic-IPP Assessment API - Handles assessment logic and scoring
export async function POST(request: NextRequest) {
  try {
    const { answers, userId, sessionId } = await request.json();

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({
        error: 'Assessment answers are required',
        expected: 'Object with element scores: { earth: [scores], water: [scores], ... }'
      }, { status: 400 });
    }

    // Calculate elemental scores
    const scores = calculateElementalScores(answers);
    const interpretation = interpretScores(scores);
    const recommendations = generateRecommendations(scores, interpretation);

    // Store results (future implementation could save to database)
    const assessmentResult = {
      userId: userId || 'anonymous',
      sessionId: sessionId || `assessment-${Date.now()}`,
      timestamp: new Date().toISOString(),
      scores,
      interpretation,
      recommendations,
      nextSteps: getNextSteps(interpretation.primaryDeficit),
      version: '1.0'
    };

    return NextResponse.json({
      success: true,
      assessment: assessmentResult,
      summary: {
        primaryDeficit: interpretation.primaryDeficit,
        secondaryDeficit: interpretation.secondaryDeficit,
        strongestElement: interpretation.strongestElement,
        treatmentPriority: interpretation.treatmentPriority,
        timeToHealing: estimateHealingTime(scores)
      }
    });

  } catch (error) {
    console.error('Spiralogic-IPP assessment error:', error);
    return NextResponse.json({
      error: 'Assessment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for assessment questions and structure
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const element = searchParams.get('element'); // Get questions for specific element
    const format = searchParams.get('format') || 'structured'; // 'structured', 'flat', 'metadata'

    // Load assessment questions from the survey file
    const surveyPath = join(process.cwd(), 'apps', 'web', 'docs', 'community-library', 'spiralogic-ipp', 'Spiralogic-IPP-Assessment-Survey.md');

    if (!existsSync(surveyPath)) {
      return NextResponse.json({
        error: 'Assessment survey file not found',
        path: surveyPath
      }, { status: 404 });
    }

    const surveyContent = readFileSync(surveyPath, 'utf-8');
    const questions = parseAssessmentQuestions(surveyContent);

    if (element && element !== 'all') {
      const elementQuestions = questions[element.toLowerCase()];
      if (!elementQuestions) {
        return NextResponse.json({
          error: `Invalid element: ${element}`,
          availableElements: Object.keys(questions)
        }, { status: 400 });
      }

      return NextResponse.json({
        element: element.toLowerCase(),
        questions: elementQuestions,
        totalQuestions: elementQuestions.length,
        scoringScale: {
          0: "Never experienced",
          1: "Rarely experienced",
          2: "Sometimes experienced",
          3: "Often experienced",
          4: "Consistently experienced"
        }
      });
    }

    if (format === 'metadata') {
      return NextResponse.json({
        totalElements: Object.keys(questions).length,
        elements: Object.keys(questions),
        totalQuestions: Object.values(questions).reduce((sum, q: any) => sum + q.length, 0),
        questionsPerElement: Object.entries(questions).reduce((acc, [element, qs]: [string, any]) => ({
          ...acc,
          [element]: qs.length
        }), {}),
        maxScore: Object.values(questions).reduce((sum, q: any) => sum + (q.length * 4), 0),
        scoringGuide: {
          "0-12": "Severe deficit - Primary treatment focus",
          "13-20": "Moderate deficit - Secondary treatment target",
          "21-26": "Adequate but fragile - Strengthening work",
          "27-32": "Strong internalization - Resource for other elements"
        }
      });
    }

    return NextResponse.json({
      success: true,
      format,
      assessment: {
        title: "Spiralogic-IPP Attachment Assessment",
        description: "Diagnostic tool for identifying missing Ideal Parent Functions and elemental imbalances",
        instructions: "Rate each statement based on your childhood experience (ages 0-18)",
        elements: questions,
        totalQuestions: Object.values(questions).reduce((sum, q: any) => sum + q.length, 0),
        scoringScale: {
          0: "Never experienced",
          1: "Rarely experienced",
          2: "Sometimes experienced",
          3: "Often experienced",
          4: "Consistently experienced"
        }
      }
    });

  } catch (error) {
    console.error('Assessment GET error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve assessment questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions
function calculateElementalScores(answers: any) {
  const elements = ['earth', 'water', 'fire', 'air', 'aether'];
  const scores: any = {};

  for (const element of elements) {
    if (answers[element] && Array.isArray(answers[element])) {
      const elementScores = answers[element];
      scores[element] = {
        individual: elementScores,
        total: elementScores.reduce((sum: number, score: number) => sum + score, 0),
        average: elementScores.reduce((sum: number, score: number) => sum + score, 0) / elementScores.length,
        maxPossible: elementScores.length * 4
      };
    } else {
      scores[element] = {
        individual: [],
        total: 0,
        average: 0,
        maxPossible: 32 // Standard 8 questions × 4 max score
      };
    }
  }

  return scores;
}

function interpretScores(scores: any) {
  const elements = Object.keys(scores);
  const totals = elements.map(el => ({ element: el, total: scores[el].total }));

  // Sort by total score (lowest first)
  totals.sort((a, b) => a.total - b.total);

  const primaryDeficit = totals[0];
  const secondaryDeficit = totals[1];
  const strongestElement = totals[totals.length - 1];

  const getDeficitLevel = (total: number) => {
    if (total <= 12) return 'severe';
    if (total <= 20) return 'moderate';
    if (total <= 26) return 'adequate';
    return 'strong';
  };

  return {
    primaryDeficit: {
      element: primaryDeficit.element,
      score: primaryDeficit.total,
      level: getDeficitLevel(primaryDeficit.total)
    },
    secondaryDeficit: {
      element: secondaryDeficit.element,
      score: secondaryDeficit.total,
      level: getDeficitLevel(secondaryDeficit.total)
    },
    strongestElement: {
      element: strongestElement.element,
      score: strongestElement.total,
      level: getDeficitLevel(strongestElement.total)
    },
    treatmentPriority: primaryDeficit.element,
    allScores: totals
  };
}

function generateRecommendations(scores: any, interpretation: any) {
  const elementRecommendations: Record<string, any> = {
    earth: {
      focus: "Protection, Structure, Safety, Boundaries",
      practices: [
        "Daily 15-minute Earth Parent imagery for 4-8 weeks",
        "Installation of protective, grounding presence",
        "Building internal sense of safety and predictability",
        "Establishing reliable inner parent who provides structure"
      ],
      deficitIndicators: [
        "Chronic anxiety, hypervigilance, difficulty trusting",
        "Problems with boundaries, either too rigid or too loose",
        "Expecting chaos or abandonment",
        "Feeling lost, directionless, difficulty making decisions"
      ]
    },
    water: {
      focus: "Attunement, Soothing, Emotional Resonance",
      practices: [
        "Daily 15-minute Water Parent imagery for 4-8 weeks",
        "Emotional attunement and validation experiences",
        "Soothing and comfort installation",
        "Building capacity to feel and be felt"
      ],
      deficitIndicators: [
        "Feeling unseen, difficulty reading others emotionally",
        "Inability to self-comfort, seeking external regulation",
        "Difficulty with emotional intimacy, feeling alien",
        "Worth based on performance, conditional self-acceptance"
      ]
    },
    fire: {
      focus: "Encouragement, Confidence, Exploration, Agency",
      practices: [
        "Daily 15-minute Fire Parent imagery for 4-8 weeks",
        "Installation of encouraging, delighting presence",
        "Building courage and self-worth",
        "Permission to shine and take up space"
      ],
      deficitIndicators: [
        "Low self-worth, paralysis, difficulty taking action",
        "Feeling burdensome, unwelcome, 'too much'",
        "Fear of new experiences, excessive need for approval",
        "People-pleasing, difficulty asserting needs or boundaries"
      ]
    },
    air: {
      focus: "Guidance, Meaning, Communication, Understanding",
      practices: [
        "Daily 15-minute Air Parent imagery for 4-8 weeks",
        "Clear communication and understanding",
        "Wisdom and perspective installation",
        "Meaning-making and guidance"
      ],
      deficitIndicators: [
        "Confusion about life direction, poor decision-making",
        "Difficulty learning from experience, repeating patterns",
        "Problems expressing thoughts clearly, misunderstandings",
        "Black-and-white thinking, difficulty with nuance"
      ]
    },
    aether: {
      focus: "Soul-Witnessing, Identity Support, Unconditional Presence",
      practices: [
        "Daily 15-minute Aether Parent imagery for 4-8 weeks",
        "Unconditional love and soul recognition",
        "Identity support and authenticity",
        "Inherent worth beyond performance"
      ],
      deficitIndicators: [
        "Chronic emptiness, identity confusion",
        "False self, chronic masking, people-pleasing",
        "Achievement addiction, perfectionism",
        "Spiritual disconnection, meaninglessness"
      ]
    }
  };

  const primary = elementRecommendations[interpretation.primaryDeficit.element];
  const secondary = elementRecommendations[interpretation.secondaryDeficit.element];

  return {
    primaryTreatment: {
      element: interpretation.primaryDeficit.element,
      ...primary,
      urgency: "immediate",
      duration: "4-8 weeks minimum"
    },
    secondaryTreatment: {
      element: interpretation.secondaryDeficit.element,
      ...secondary,
      urgency: "after primary shows improvement",
      duration: "4-8 weeks"
    },
    integration: {
      timeline: "Begin secondary element work after 4-8 weeks of primary element practice",
      signs: "Increased stability, reduced triggering, better self-regulation",
      progression: "Move to multi-elemental integration once both deficits are addressed"
    }
  };
}

function getNextSteps(primaryElement: string) {
  return [
    `Begin daily ${primaryElement.charAt(0).toUpperCase() + primaryElement.slice(1)} Parent guided imagery`,
    "Practice 15-20 minutes daily for 4-8 weeks",
    "Work with MAIA for personalized guidance and adaptation",
    "Track progress with weekly check-ins",
    "Consider professional support if trauma symptoms arise",
    "Retake assessment after 3 months to track improvement"
  ];
}

function estimateHealingTime(scores: any) {
  const severeDeficits = Object.values(scores).filter((s: any) => s.total <= 12).length;
  const moderateDeficits = Object.values(scores).filter((s: any) => s.total > 12 && s.total <= 20).length;

  let months = 0;
  months += severeDeficits * 3; // 3 months per severe deficit
  months += moderateDeficits * 2; // 2 months per moderate deficit

  return {
    estimatedMonths: Math.max(3, months),
    factors: {
      severeDeficits,
      moderateDeficits,
      note: "Timeline varies based on individual factors, trauma history, and consistency of practice"
    }
  };
}

function parseAssessmentQuestions(content: string) {
  const questions: any = {
    earth: [],
    water: [],
    fire: [],
    air: [],
    aether: []
  };

  const lines = content.split('\n');
  let currentElement = '';
  let questionNumber = 0;

  for (const line of lines) {
    // Detect element sections
    if (line.includes('EARTH ELEMENT')) {
      currentElement = 'earth';
      questionNumber = 0;
    } else if (line.includes('WATER ELEMENT')) {
      currentElement = 'water';
      questionNumber = 0;
    } else if (line.includes('FIRE ELEMENT')) {
      currentElement = 'fire';
      questionNumber = 0;
    } else if (line.includes('AIR ELEMENT')) {
      currentElement = 'air';
      questionNumber = 0;
    } else if (line.includes('AETHER ELEMENT')) {
      currentElement = 'aether';
      questionNumber = 0;
    }

    // Extract questions (lines starting with numbers)
    const questionMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (questionMatch && currentElement) {
      questionNumber++;
      questions[currentElement].push({
        id: `${currentElement}_${questionNumber}`,
        number: parseInt(questionMatch[1]),
        text: questionMatch[2].trim(),
        element: currentElement
      });
    }
  }

  return questions;
}