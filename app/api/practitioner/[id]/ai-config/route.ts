export const dynamic = 'force-static';
export async function generateStaticParams() { return []; }

/**
 * Practitioner AI Config API
 *
 * GET /api/practitioner/[id]/ai-config - Get AI companion configuration
 * PUT /api/practitioner/[id]/ai-config - Update AI companion configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPractitionerById,
  getAICompanionConfig,
  saveAICompanionConfig,
  generateSystemPrompt,
} from '@/lib/practitioner/practitionerService';
import type { AICompanionConfig } from '@/lib/practitioner/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Get AI companion configuration
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify practitioner exists
    const practitioner = await getPractitionerById(id);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    const config = await getAICompanionConfig(id);

    // Also generate the system prompt for preview
    const systemPrompt = config ? await generateSystemPrompt(id) : null;

    return NextResponse.json({
      config,
      systemPromptPreview: systemPrompt,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Get AI config error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI configuration' },
      { status: 500 }
    );
  }
}

// Update AI companion configuration
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify practitioner exists
    const practitioner = await getPractitionerById(id);
    if (!practitioner) {
      return NextResponse.json(
        { error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    const {
      name,
      pronouns,
      voiceStyle,
      tone,
      frameworks,
      primaryFramework,
      specialties,
      boundaries,
      knowledgeBase,
      systemPromptTemplate,
    } = body;

    if (!name || !voiceStyle || !primaryFramework) {
      return NextResponse.json(
        { error: 'Name, voice style, and primary framework are required' },
        { status: 400 }
      );
    }

    // Build config object
    const config: Omit<AICompanionConfig, 'practitionerId'> = {
      name,
      pronouns: pronouns || 'they/them',
      voiceStyle,
      tone: tone || { formality: 3, warmth: 4, depth: 3, directness: 3 },
      frameworks: frameworks || [primaryFramework],
      primaryFramework,
      specialties: specialties || [],
      boundaries: boundaries || {
        noPredictions: true,
        noMedicalAdvice: true,
        noTherapy: true,
        noRelationshipAdvice: false,
        crisisReferral: true,
        practitionerReferral: [],
        customBoundaries: [],
      },
      knowledgeBase: knowledgeBase || {
        ownMaterials: [],
        referencedAuthors: [],
        customInterpretations: {},
      },
      systemPromptTemplate,
    };

    // Save the configuration
    const savedConfig = await saveAICompanionConfig(id, config);

    // Generate the new system prompt
    const systemPrompt = await generateSystemPrompt(id);

    return NextResponse.json({
      success: true,
      config: savedConfig,
      systemPromptPreview: systemPrompt,
    });
  } catch (error) {
    console.error('[PRACTITIONER] Update AI config error:', error);
    return NextResponse.json(
      { error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}
