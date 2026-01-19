/**
 * GET/POST /api/practice/preferences
 *
 * Practitioner insight preferences
 * - Which insight types to generate
 * - Their modality vocabulary
 * - MAIA's voice depth (light/balanced/deep)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getInsightPreferences,
  upsertInsightPreferences,
  getModalityVocabulary
} from '@/lib/practice/PracticeStore';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const practitionerId = searchParams.get('practitionerId');
    const includeVocabulary = searchParams.get('includeVocabulary') === 'true';

    if (!practitionerId) {
      return NextResponse.json(
        { success: false, error: 'practitionerId required' },
        { status: 400 }
      );
    }

    const preferences = await getInsightPreferences(practitionerId);

    // Optionally include full modality vocabulary for UI
    let vocabulary;
    if (includeVocabulary) {
      vocabulary = await getModalityVocabulary();
    }

    return NextResponse.json({
      success: true,
      preferences: preferences || {
        // Return defaults if no preferences saved
        enabled_insights: [
          'modality_used', 'client_response', 'modality_opportunity',
          'growth_edge', 'strength_spotted', 'reflection_question'
        ],
        modality_vocabulary: [
          'somatic', 'cognitive', 'relational', 'parts_work', 'breathwork',
          'mindfulness', 'narrative', 'expressive', 'energy_work', 'spiritual'
        ],
        insight_depth: 'balanced'
      },
      ...(vocabulary && { vocabulary })
    });
  } catch (error) {
    console.error('[practice/preferences] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      practitionerId,
      enabledInsights,
      modalityVocabulary,
      insightDepth
    } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { success: false, error: 'practitionerId required' },
        { status: 400 }
      );
    }

    // Validate insightDepth if provided
    if (insightDepth && !['light', 'balanced', 'deep'].includes(insightDepth)) {
      return NextResponse.json(
        { success: false, error: 'insightDepth must be: light, balanced, or deep' },
        { status: 400 }
      );
    }

    const preferences = await upsertInsightPreferences({
      practitionerId,
      enabledInsights,
      modalityVocabulary,
      insightDepth
    });

    return NextResponse.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('[practice/preferences] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
