export const dynamic = 'force-dynamic';

/**
 * STUDIO MODULES API
 *
 * GET  — Returns current enabled modules (or defaults for portal type)
 * PATCH — Updates enabled modules for the practitioner
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePractitioner } from '@/lib/auth/getCurrentPractitioner';
import { query } from '@/lib/db/postgres';
import {
  getDefaultModules,
  validateModuleSlugs,
  type PortalType,
} from '@/lib/studio/moduleDefinitions';

export async function GET(request: NextRequest) {
  const result = await requirePractitioner(request);
  if ('error' in result) return result.error;

  const { identity } = result;

  const dbResult = await query(
    'SELECT portal_type, enabled_modules FROM practitioners WHERE id = $1',
    [identity.practitionerId]
  );

  const row = dbResult.rows[0];
  const portalType = (row?.portal_type ?? 'generalist') as PortalType;
  const enabledModules = row?.enabled_modules ?? null;
  const resolved = enabledModules ?? getDefaultModules(portalType);

  return NextResponse.json({
    portalType,
    enabledModules: enabledModules,
    resolvedModules: resolved,
    isDefault: enabledModules === null,
  });
}

export async function PATCH(request: NextRequest) {
  const result = await requirePractitioner(request);
  if ('error' in result) return result.error;

  const { identity } = result;

  const body = await request.json();
  const { enabledModules } = body as { enabledModules: string[] };

  if (!Array.isArray(enabledModules)) {
    return NextResponse.json(
      { error: 'enabledModules must be an array of module slugs' },
      { status: 400 }
    );
  }

  if (!validateModuleSlugs(enabledModules)) {
    return NextResponse.json(
      { error: 'Invalid module slug in enabledModules' },
      { status: 400 }
    );
  }

  await query(
    'UPDATE practitioners SET enabled_modules = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(enabledModules), identity.practitionerId]
  );

  return NextResponse.json({ success: true, enabledModules });
}
