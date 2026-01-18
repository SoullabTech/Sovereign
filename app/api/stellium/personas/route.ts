/**
 * STELLIUM PERSONA API
 *
 * MAIA persona management - the ensouled intelligence native to each practice
 *
 * "The apprentice who never forgets, never burns out,
 *  and knows when to stay quiet."
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getPersona,
  getPersonaById,
  createPersona,
  updatePersona,
  recordTrainingSession,
  addIndexedMaterial,
  addBookReference,
  getPersonaContext,
  getPersonaTemplate,
} from '@/lib/stellium/personas';
import { Modality } from '@/lib/stellium/types';

/**
 * GET /api/stellium/personas
 * Get practitioner's persona or template
 *
 * Query params:
 * - practitionerId: required
 * - personaId: get specific persona by ID
 * - template: get starter template for a modality
 * - context: if 'true', return full MAIA context with system prompt
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId');
    const personaId = searchParams.get('personaId');
    const templateModality = searchParams.get('template') as Modality;
    const withContext = searchParams.get('context') === 'true';

    // Return template for a modality (no auth needed)
    if (templateModality) {
      const template = getPersonaTemplate(templateModality);
      return NextResponse.json({ template });
    }

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    // Return full MAIA context
    if (withContext) {
      const context = await getPersonaContext(practitionerId);
      return NextResponse.json(context);
    }

    // Get specific persona by ID
    if (personaId) {
      const persona = await getPersonaById(practitionerId, personaId);
      if (!persona) {
        return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
      }
      return NextResponse.json({ persona });
    }

    // Get active persona
    const persona = await getPersona(practitionerId);
    return NextResponse.json({ persona });
  } catch (error) {
    console.error('[Stellium Personas API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stellium/personas
 * Create a new persona
 *
 * Body:
 * - practitionerId: required
 * - fromTemplate: modality to use as template
 * - ...persona fields
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, fromTemplate, ...personaData } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    // Merge with template if specified
    let input = personaData;
    if (fromTemplate) {
      const template = getPersonaTemplate(fromTemplate as Modality);
      input = { ...template, ...personaData };
    }

    if (!input.persona_name) {
      return NextResponse.json(
        { error: 'Persona name required' },
        { status: 400 }
      );
    }

    if (!input.modality) {
      return NextResponse.json(
        { error: 'Modality required' },
        { status: 400 }
      );
    }

    const persona = await createPersona(practitionerId, input);

    return NextResponse.json({
      success: true,
      persona,
    });
  } catch (error) {
    console.error('[Stellium Personas API] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/stellium/personas
 * Update a persona or record training
 *
 * Body:
 * - practitionerId: required
 * - personaId: required
 * - recordTraining: if true, increment training count
 * - addMaterial: material name to add to indexed list
 * - addBook: book title to add to references
 * - ...update fields
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      practitionerId,
      personaId,
      recordTraining,
      addMaterial,
      addBook,
      ...updateData
    } = body;

    if (!practitionerId || !personaId) {
      return NextResponse.json(
        { error: 'Practitioner ID and Persona ID required' },
        { status: 400 }
      );
    }

    // Record training session
    if (recordTraining) {
      await recordTrainingSession(practitionerId, personaId);
      const persona = await getPersonaById(practitionerId, personaId);
      return NextResponse.json({ success: true, persona });
    }

    // Add indexed material
    if (addMaterial) {
      await addIndexedMaterial(practitionerId, personaId, addMaterial);
      const persona = await getPersonaById(practitionerId, personaId);
      return NextResponse.json({ success: true, persona });
    }

    // Add book reference
    if (addBook) {
      await addBookReference(practitionerId, personaId, addBook);
      const persona = await getPersonaById(practitionerId, personaId);
      return NextResponse.json({ success: true, persona });
    }

    // Regular update
    const persona = await updatePersona(practitionerId, personaId, updateData);

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, persona });
  } catch (error) {
    console.error('[Stellium Personas API] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}
