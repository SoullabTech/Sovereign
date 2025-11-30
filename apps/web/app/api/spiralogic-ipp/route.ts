import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Main Spiralogic-IPP API router and documentation endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'overview';

    const apiDocumentation = {
      title: "Spiralogic-IPP API",
      description: "Complete API for Dan Brown & David Elliott's Ideal Parenting Protocol integrated with Spiralogic 5-element framework",
      version: "1.0",
      basePath: "/api/spiralogic-ipp",
      integration: "MAIA Consciousness System",
      lastUpdated: new Date().toISOString(),

      endpoints: {
        "/content": {
          methods: ["GET", "POST"],
          description: "Access all Spiralogic-IPP content library",
          parameters: {
            type: "assessment | scripts | guidance | concepts | all",
            format: "json | markdown | meta"
          },
          examples: [
            "/api/spiralogic-ipp/content?type=assessment",
            "/api/spiralogic-ipp/content?type=scripts&format=markdown"
          ]
        },

        "/assessment": {
          methods: ["GET", "POST"],
          description: "Complete 40-question IPP assessment with scoring and interpretation",
          features: [
            "Elemental deficit identification",
            "Treatment priority ranking",
            "Personalized recommendations",
            "Progress tracking"
          ],
          examples: [
            "GET /api/spiralogic-ipp/assessment?element=earth",
            "POST /api/spiralogic-ipp/assessment (with answers payload)"
          ]
        },

        "/imagery": {
          methods: ["GET", "POST"],
          description: "Guided imagery scripts for all 5 elemental parents",
          features: [
            "Trauma-sensitive adaptations",
            "Cultural personalizations",
            "Session tracking",
            "Multiple script formats"
          ],
          parameters: {
            element: "earth | water | fire | air | aether",
            type: "full | abbreviated | intro | integration",
            personalization: "custom adaptations"
          },
          examples: [
            "/api/spiralogic-ipp/imagery?element=earth&type=full",
            "POST /api/spiralogic-ipp/imagery (for personalized sessions)"
          ]
        },

        "/knowledge": {
          methods: ["GET", "POST"],
          description: "Intelligent content search and contextual guidance for MAIA integration",
          features: [
            "Semantic content search",
            "Phase-aware responses",
            "Contextual recommendations",
            "MAIA knowledge base integration"
          ],
          parameters: {
            query: "user question or topic",
            element: "elemental context",
            phase: "assessment | imagery | integration | support",
            personalizations: "custom considerations"
          }
        }
      },

      framework: {
        title: "Spiralogic-IPP Framework",
        description: "Integration of Dan Brown & David Elliott's Ideal Parenting Protocol with Spiralogic 5-element system",

        elements: {
          earth: {
            ipp_functions: ["Protection", "Predictability", "Structure", "Repair", "Boundaries"],
            focus: "Safety, grounding, reliable structure",
            deficits: "Anxiety, hypervigilance, boundary issues",
            healing: "Earth Parent imagery, safety practices"
          },
          water: {
            ipp_functions: ["Attunement", "Soothing", "Empathy", "Emotional Understanding", "Unconditional Love"],
            focus: "Emotional regulation, nurturing, connection",
            deficits: "Emotional numbness, difficulty with intimacy",
            healing: "Water Parent imagery, emotional attunement"
          },
          fire: {
            ipp_functions: ["Encouragement", "Support for Exploration", "Delight", "Pride"],
            focus: "Confidence, creativity, self-expression",
            deficits: "Low self-worth, people-pleasing, paralysis",
            healing: "Fire Parent imagery, encouragement practices"
          },
          air: {
            ipp_functions: ["Guidance", "Teaching", "Naming Emotions", "Mentalization", "Perspective"],
            focus: "Clarity, wisdom, communication",
            deficits: "Confusion, poor decision-making, black-white thinking",
            healing: "Air Parent imagery, wisdom cultivation"
          },
          aether: {
            ipp_functions: ["Identity Support", "Unconditional Acceptance", "Authenticity", "Worthiness"],
            focus: "Soul recognition, authentic identity",
            deficits: "Identity confusion, chronic emptiness, false self",
            healing: "Aether Parent imagery, soul-level witnessing"
          }
        },

        clinical_foundation: {
          research_base: "Dan Brown PhD & David Elliott PhD - Three Pillars Model",
          mechanism: "Memory reconsolidation and neuroplastic installation",
          evidence: "Decades of attachment research and clinical application",
          integration: "Spiralogic consciousness development framework"
        },

        treatment_phases: [
          {
            phase: "Assessment",
            duration: "1 session",
            description: "40-question evaluation identifying elemental deficits",
            outcome: "Treatment priority and personalized plan"
          },
          {
            phase: "Primary Element Work",
            duration: "4-8 weeks",
            description: "Daily guided imagery with most deficient element",
            outcome: "Installation of primary ideal parent function"
          },
          {
            phase: "Secondary Element Work",
            duration: "4-8 weeks",
            description: "Daily imagery with secondary deficit element",
            outcome: "Strengthening of additional parent functions"
          },
          {
            phase: "Integration & Service",
            duration: "Ongoing",
            description: "Multi-elemental integration and community contribution",
            outcome: "Secure attachment and consciousness development"
          }
        ]
      },

      maia_integration: {
        description: "How Spiralogic-IPP integrates with MAIA consciousness system",
        features: [
          "24/7 AI-guided attachment healing support",
          "Personalized imagery script adaptation",
          "Progress tracking and optimization",
          "Integration with Oracle consultations",
          "Community connection facilitation"
        ],
        prompts: {
          assessment: "\"Hi MAIA, I'd like to begin working with the Spiralogic-IPP attachment healing framework. Can you guide me through the assessment?\"",
          imagery: "\"MAIA, I'm ready for today's [Element] Parent imagery session. Please guide me through connecting with my archetypal parent.\"",
          support: "\"MAIA, I'm struggling with [specific challenge]. Can you help me understand why and suggest strategies using my [Element] Parent?\"",
          progress: "\"MAIA, it's been a week since I started working with my [Element] Parent. Can you help me assess my progress?\""
        }
      },

      usage_examples: {
        complete_assessment: {
          description: "Taking the full IPP assessment and getting results",
          steps: [
            "GET /api/spiralogic-ipp/assessment (get questions)",
            "POST /api/spiralogic-ipp/assessment (submit answers)",
            "Use results to begin imagery work"
          ]
        },
        guided_imagery_session: {
          description: "Accessing personalized guided imagery",
          steps: [
            "GET /api/spiralogic-ipp/imagery?element=earth&type=full",
            "POST /api/spiralogic-ipp/imagery (for personalized session)",
            "Follow integration guidance"
          ]
        },
        knowledge_query: {
          description: "Getting contextual guidance from MAIA",
          steps: [
            "POST /api/spiralogic-ipp/knowledge (with query and context)",
            "Receive personalized guidance and sources",
            "Apply recommendations in practice"
          ]
        }
      },

      community_resources: {
        documentation: [
          "Complete User Instructions (PDF available)",
          "MAIA Integration Guide",
          "Cultural Adaptation Guidelines",
          "Professional Integration Manual"
        ],
        support: [
          "24/7 MAIA guidance",
          "Community practice groups",
          "Professional therapist integration",
          "Progress tracking tools"
        ]
      }
    };

    if (format === 'endpoints') {
      return NextResponse.json({
        endpoints: Object.keys(apiDocumentation.endpoints).map(path => ({
          path: `/api/spiralogic-ipp${path}`,
          ...apiDocumentation.endpoints[path]
        }))
      });
    }

    if (format === 'framework') {
      return NextResponse.json({
        framework: apiDocumentation.framework
      });
    }

    if (format === 'maia') {
      return NextResponse.json({
        maia_integration: apiDocumentation.maia_integration
      });
    }

    // Default: full overview
    return NextResponse.json(apiDocumentation);

  } catch (error) {
    console.error('Spiralogic-IPP API documentation error:', error);
    return NextResponse.json({
      error: 'Failed to load API documentation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint for API testing and validation
export async function POST(request: NextRequest) {
  try {
    const { test_type, payload } = await request.json();

    switch (test_type) {
      case 'health_check':
        return NextResponse.json({
          status: 'healthy',
          api: 'spiralogic-ipp',
          version: '1.0',
          endpoints_active: 4,
          timestamp: new Date().toISOString(),
          content_loaded: true
        });

      case 'validate_integration':
        // Test all endpoints are accessible
        const endpoints = ['content', 'assessment', 'imagery', 'knowledge'];
        const results = [];

        for (const endpoint of endpoints) {
          try {
            const testUrl = `${request.nextUrl.origin}/api/spiralogic-ipp/${endpoint}`;
            const response = await fetch(testUrl, { method: 'GET' });
            results.push({
              endpoint,
              status: response.ok ? 'active' : 'error',
              response_code: response.status
            });
          } catch (error) {
            results.push({
              endpoint,
              status: 'unreachable',
              error: error instanceof Error ? error.message : 'Unknown'
            });
          }
        }

        return NextResponse.json({
          validation: 'complete',
          endpoints: results,
          overall_status: results.every(r => r.status === 'active') ? 'healthy' : 'issues_detected'
        });

      default:
        return NextResponse.json({
          message: 'Spiralogic-IPP API is operational',
          available_tests: ['health_check', 'validate_integration'],
          timestamp: new Date().toISOString()
        });
    }

  } catch (error) {
    return NextResponse.json({
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}