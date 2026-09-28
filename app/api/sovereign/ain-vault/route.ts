export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

import { requireFounder } from '@/lib/founder/founderAuth';
import {
  AinVaultReadError,
  ainVaultReadService,
} from '@/lib/ain/vault/AinVaultReadService';
import {
  formatExplicitVaultContextAddendum,
  parseExplicitVaultSourceRefs,
  vaultProvenanceForResponse,
} from '@/lib/ain/vault/ExplicitVaultContext';
import { isAinVaultAlias } from '@/lib/ain/vault/VaultRegistry';
import type { AinVaultAlias } from '@/lib/ain/vault/types';

async function authorize() {
  const auth = await requireFounder();
  if (!auth.ok) {
    return {
      response: NextResponse.json({ error: auth.error }, { status: auth.status }),
      memberId: null,
    };
  }
  return { response: null, memberId: auth.memberId };
}
function requireAlias(value: unknown): AinVaultAlias {
  if (!isAinVaultAlias(value)) {
    throw new AinVaultReadError('A valid vaultAlias is required', 'INVALID_SCOPE', 400);
  }
  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function requiredString(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AinVaultReadError(name + ' is required', 'INVALID_PATH', 400);
  }
  return value;
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof AinVaultReadError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  console.error('[AIN vault] read-only service error:', error);
  return NextResponse.json(
    { error: 'VAULT_READ_FAILED', message: 'The AIN vault read could not be completed.' },
    { status: 500 },
  );
}
export async function GET() {
  const auth = await authorize();
  if (auth.response) return auth.response;

  try {
    const scopes = await ainVaultReadService.listScopes();
    return NextResponse.json({
      readOnly: true,
      founderScoped: true,
      scopes,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorize();
  if (auth.response) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const action = typeof body?.action === 'string' ? body.action : '';

    if (action === 'list') {
      const vaultAlias = requireAlias(body.vaultAlias);
      const entries = await ainVaultReadService.list(
        vaultAlias,
        optionalString(body.directory) ?? '',
      );
      return NextResponse.json({ action, vaultAlias, readOnly: true, entries });
    }
    if (action === 'search') {
      const vaultAlias = requireAlias(body.vaultAlias);
      const query = requiredString(body.query, 'query');
      const limit =
        typeof body.limit === 'number' && Number.isFinite(body.limit)
          ? body.limit
          : undefined;
      const results = await ainVaultReadService.search(vaultAlias, query, { limit });
      return NextResponse.json({ action, vaultAlias, query, readOnly: true, results });
    }

    if (action === 'read') {
      const vaultAlias = requireAlias(body.vaultAlias);
      const relativePath = requiredString(body.relativePath, 'relativePath');
      const result = await ainVaultReadService.read(
        vaultAlias,
        relativePath,
        optionalString(body.heading),
      );
      return NextResponse.json({ action, readOnly: true, ...result });
    }

    if (action === 'links') {
      const vaultAlias = requireAlias(body.vaultAlias);
      const relativePath = requiredString(body.relativePath, 'relativePath');
      const result = await ainVaultReadService.links(vaultAlias, relativePath);
      return NextResponse.json({ action, readOnly: true, ...result });
    }
    if (action === 'context-preview') {
      const refs = parseExplicitVaultSourceRefs(body.sources);
      const sources = await ainVaultReadService.resolveContextSources(refs);
      const addendum = formatExplicitVaultContextAddendum(sources);
      return NextResponse.json({
        action,
        readOnly: true,
        sourceCount: sources.length,
        provenance: vaultProvenanceForResponse(sources),
        addendum,
      });
    }

    return NextResponse.json(
      {
        error: 'UNSUPPORTED_ACTION',
        message: 'Allowed actions: list, search, read, links, context-preview.',
      },
      { status: 400 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
