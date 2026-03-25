/**
 * Build + Activation API
 *
 * POST /api/fields/[slug]/training/build           → create draft build
 * POST /api/fields/[slug]/training/build?action=activate&id=X  → validate + activate
 * POST /api/fields/[slug]/training/build?action=validate&id=X  → validate only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFieldBySlug } from '@/lib/masters/registry';
import { getPersona } from '@/lib/stellium/personas';
import { buildPersona } from '@/lib/stellium/personaBuilder';
import { validateBuild } from '@/lib/stellium/buildValidator';
import {
  activateBuild,
  updateBuildValidation,
  listBuilds,
} from '@/lib/stellium/trainingData';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const field = getFieldBySlug(slug);
    if (!field?.practitionerId) {
      return NextResponse.json(
        { error: 'No practitioner linked to this field' },
        { status: 404 }
      );
    }

    const persona = await getPersona(field.practitionerId);
    if (!persona) {
      return NextResponse.json(
        { error: 'No persona found for this practitioner' },
        { status: 404 }
      );
    }

    const action = req.nextUrl.searchParams.get('action');
    const buildId = req.nextUrl.searchParams.get('id');

    // ── Validate only ──────────────────────────────────────────
    if (action === 'validate' && buildId) {
      const builds = await listBuilds(persona.id);
      const build = builds.find(b => b.id === buildId);
      if (!build) {
        return NextResponse.json({ error: 'Build not found' }, { status: 404 });
      }

      const result = validateBuild(build);

      if (result.valid) {
        await updateBuildValidation(persona.id, buildId, 'validated');
      } else {
        await updateBuildValidation(persona.id, buildId, 'rejected', result.issues);
      }

      return NextResponse.json({
        valid: result.valid,
        issues: result.issues,
        buildId,
      });
    }

    // ── Activate (validate first) ──────────────────────────────
    if (action === 'activate' && buildId) {
      const builds = await listBuilds(persona.id);
      const build = builds.find(b => b.id === buildId);
      if (!build) {
        return NextResponse.json({ error: 'Build not found' }, { status: 404 });
      }

      // Must validate before activating
      const result = validateBuild(build);
      if (!result.valid) {
        await updateBuildValidation(persona.id, buildId, 'rejected', result.issues);
        return NextResponse.json(
          {
            error: 'Build failed validation',
            issues: result.issues,
            buildId,
          },
          { status: 422 }
        );
      }

      await updateBuildValidation(persona.id, buildId, 'validated');
      const activated = await activateBuild(persona.id, buildId);

      if (!activated) {
        return NextResponse.json(
          { error: 'Could not activate build — may not be validated' },
          { status: 422 }
        );
      }

      console.log(
        '[PersonaBuild] Activated build v%d for %s',
        activated.version,
        slug
      );

      return NextResponse.json({
        success: true,
        build: activated,
      });
    }

    // ── Create new build (default action) ──────────────────────
    const build = await buildPersona(persona.id, field.practitionerId);

    return NextResponse.json({
      success: true,
      build,
    });
  } catch (err) {
    console.error('[Build API] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Build failed' },
      { status: 500 }
    );
  }
}
