/**
 * Training Source API — CRUD for corrections, examples, preferences, builds
 *
 * GET  ?type=corrections|examples|preferences|builds
 * POST ?type=corrections|examples|preferences
 * DELETE ?type=corrections|examples|preferences&id=X
 *
 * Auth: slug → field → practitionerId → active persona.
 * No persona = 404. personaId is derived server-side.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFieldBySlug } from '@/lib/masters/registry';
import { getPersona } from '@/lib/stellium/personas';
import {
  listCorrections,
  addCorrection,
  deleteCorrection,
  listExamples,
  addExample,
  deleteExample,
  listPreferences,
  upsertPreference,
  deactivatePreference,
  listBuilds,
  getBuildDiff,
} from '@/lib/stellium/trainingData';
import type {
  CreateCorrectionInput,
  CreateExampleInput,
  UpsertPreferenceInput,
  TrainingLayer,
  PreferenceCategory,
} from '@/lib/stellium/trainingTypes';

export const dynamic = 'force-dynamic';

type TrainingType = 'corrections' | 'examples' | 'preferences' | 'builds';

async function resolvePersonaId(slug: string): Promise<string | null> {
  const field = getFieldBySlug(slug);
  if (!field?.practitionerId) return null;

  const persona = await getPersona(field.practitionerId);
  return persona?.id ?? null;
}

// ============================================
// GET — List training sources
// ============================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const personaId = await resolvePersonaId(slug);
    if (!personaId) {
      return NextResponse.json(
        { error: 'No persona found for this field' },
        { status: 404 }
      );
    }

    const type = req.nextUrl.searchParams.get('type') as TrainingType | null;

    switch (type) {
      case 'corrections': {
        const data = await listCorrections(personaId);
        return NextResponse.json({ corrections: data });
      }
      case 'examples': {
        const layer = req.nextUrl.searchParams.get('layer') as TrainingLayer | null;
        const data = await listExamples(personaId, layer ?? undefined);
        return NextResponse.json({ examples: data });
      }
      case 'preferences': {
        const category = req.nextUrl.searchParams.get('category') as PreferenceCategory | null;
        const data = await listPreferences(personaId, category ?? undefined);
        return NextResponse.json({ preferences: data });
      }
      case 'builds': {
        const [builds, diff] = await Promise.all([
          listBuilds(personaId),
          getBuildDiff(personaId),
        ]);
        return NextResponse.json({ builds, diff });
      }
      default:
        return NextResponse.json(
          { error: 'type param required: corrections|examples|preferences|builds' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('[Training API] GET error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ============================================
// POST — Add training source
// ============================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const personaId = await resolvePersonaId(slug);
    if (!personaId) {
      return NextResponse.json(
        { error: 'No persona found for this field' },
        { status: 404 }
      );
    }

    const type = req.nextUrl.searchParams.get('type') as TrainingType | null;
    const body = await req.json();

    switch (type) {
      case 'corrections': {
        const input = body as CreateCorrectionInput;
        if (!input.original_response?.trim() || !input.correction?.trim()) {
          return NextResponse.json(
            { error: 'original_response and correction are required' },
            { status: 400 }
          );
        }
        const correction = await addCorrection(personaId, input);
        return NextResponse.json({ correction }, { status: 201 });
      }
      case 'examples': {
        const input = body as CreateExampleInput;
        if (!input.user_message?.trim() || !input.ideal_response?.trim() || !input.layer) {
          return NextResponse.json(
            { error: 'user_message, ideal_response, and layer are required' },
            { status: 400 }
          );
        }
        if (!['voice', 'stance', 'knowledge'].includes(input.layer)) {
          return NextResponse.json(
            { error: 'layer must be voice, stance, or knowledge' },
            { status: 400 }
          );
        }
        const example = await addExample(personaId, input);
        return NextResponse.json({ example }, { status: 201 });
      }
      case 'preferences': {
        const input = body as UpsertPreferenceInput;
        if (!input.category || !input.key?.trim() || !input.value?.trim()) {
          return NextResponse.json(
            { error: 'category, key, and value are required' },
            { status: 400 }
          );
        }
        if (!['voice', 'stance', 'boundary'].includes(input.category)) {
          return NextResponse.json(
            { error: 'category must be voice, stance, or boundary' },
            { status: 400 }
          );
        }
        const preference = await upsertPreference(personaId, input);
        return NextResponse.json({ preference }, { status: 201 });
      }
      default:
        return NextResponse.json(
          { error: 'type param required: corrections|examples|preferences' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('[Training API] POST error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// ============================================
// DELETE — Remove training source
// ============================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const personaId = await resolvePersonaId(slug);
    if (!personaId) {
      return NextResponse.json(
        { error: 'No persona found for this field' },
        { status: 404 }
      );
    }

    const type = req.nextUrl.searchParams.get('type') as TrainingType | null;
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id param required' }, { status: 400 });
    }

    switch (type) {
      case 'corrections': {
        const deleted = await deleteCorrection(personaId, id);
        return NextResponse.json({ deleted });
      }
      case 'examples': {
        const deleted = await deleteExample(personaId, id);
        return NextResponse.json({ deleted });
      }
      case 'preferences': {
        const deactivated = await deactivatePreference(personaId, id);
        return NextResponse.json({ deactivated });
      }
      default:
        return NextResponse.json(
          { error: 'type param required: corrections|examples|preferences' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('[Training API] DELETE error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
