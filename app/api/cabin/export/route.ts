import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { NextRequest, NextResponse } from 'next/server';

import { requireMemberId } from '@/lib/auth/session';
import { exportConnectedCabinContextPackage } from '@/lib/cabin/connectedContextExport';
import type { ConnectedCabinExportSelection } from '@/lib/cabin/connectedExportAssembly';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;
const MAX_IDS_PER_KIND = 64;

const privacyHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  Vary: 'Cookie, x-session-token, Origin',
};

function reply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privacyHeaders });
}

function isSameOrigin(request: NextRequest, origin: string): boolean {
  try {
    const source = new URL(origin);
    const host = request.headers.get('host') || request.nextUrl.host;
    const protocol =
      request.headers.get('x-forwarded-proto')?.split(',')[0].trim() ||
      request.nextUrl.protocol.replace(':', '');

    return (
      source.origin === origin &&
      source.host === host &&
      ['http:', 'https:'].includes(source.protocol) &&
      source.protocol === `${protocol}:`
    );
  } catch {
    return false;
  }
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function parseSelection(body: unknown): ConnectedCabinExportSelection {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('CABIN_EXPORT_SELECTION_INVALID');
  }

  const record = body as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  if (
    keys.length !== 3 ||
    keys[0] !== 'memoryIds' ||
    keys[1] !== 'relationshipIds' ||
    keys[2] !== 'workIds'
  ) {
    throw new Error('CABIN_EXPORT_SELECTION_INVALID');
  }

  const parseIds = (value: unknown, field: string): string[] => {
    if (!Array.isArray(value) || value.length > MAX_IDS_PER_KIND) {
      throw new Error(`CABIN_EXPORT_SELECTION_INVALID:${field}`);
    }

    if (value.some((id) => !isUuid(id))) {
      throw new Error(`CABIN_EXPORT_SELECTION_INVALID:${field}`);
    }

    const unique = new Set(value);
    if (unique.size !== value.length) {
      throw new Error(`CABIN_EXPORT_SELECTION_INVALID:${field}`);
    }

    return [...value];
  };

  return {
    workIds: parseIds(record.workIds, 'workIds'),
    relationshipIds: parseIds(record.relationshipIds, 'relationshipIds'),
    memoryIds: parseIds(record.memoryIds, 'memoryIds'),
  };
}

function temporaryPackagePath(): string {
  return path.join(
    os.tmpdir(),
    `soullab-cabin-export-${process.pid}-${randomUUID()}.json`,
  );
}

export type CabinExportRouteDeps = {
  exportPackage: typeof exportConnectedCabinContextPackage;
  readFile: typeof fs.readFileSync;
  unlink: typeof fs.unlinkSync;
};

const productionDeps: CabinExportRouteDeps = {
  exportPackage: exportConnectedCabinContextPackage,
  readFile: fs.readFileSync,
  unlink: fs.unlinkSync,
};

function isCabinExportDeps(value: unknown): value is CabinExportRouteDeps {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.exportPackage === 'function' &&
    typeof candidate.readFile === 'function' &&
    typeof candidate.unlink === 'function'
  );
}

async function handlePost(
  request: NextRequest,
  deps: CabinExportRouteDeps,
): Promise<Response> {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    return reply({ error: 'not_connected_runtime' }, 404);
  }

  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return reply({ error: 'Authentication required.', code: 'AUTH_REQUIRED' }, 401);
    }

    return reply(
      { error: 'Cabin export could not be authenticated.', code: 'AUTH_UNAVAILABLE' },
      503,
    );
  }

  if (request.nextUrl.search) {
    return reply({ error: 'Unexpected parameters.', code: 'UNEXPECTED_PARAMETERS' }, 400);
  }

  const origin = request.headers.get('origin');
  if (
    (origin && !isSameOrigin(request, origin)) ||
    (!origin && !request.headers.get('x-session-token'))
  ) {
    return reply({ error: 'Open your House and try again.', code: 'ORIGIN_REQUIRED' }, 403);
  }

  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return reply({ error: 'JSON is required.', code: 'JSON_REQUIRED' }, 415);
  }

  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
    return reply({ error: 'Selection is too large.', code: 'SELECTION_TOO_LARGE' }, 413);
  }

  let selection: ConnectedCabinExportSelection;
  try {
    selection = parseSelection(JSON.parse(text));
  } catch (error) {
    const code =
      error instanceof Error &&
      error.message.startsWith('CABIN_EXPORT_SELECTION_INVALID')
        ? error.message
        : 'CABIN_EXPORT_SELECTION_INVALID';

    return reply({ error: 'The Cabin selection is not valid.', code }, 400);
  }

  const packagePath = temporaryPackagePath();

  try {
    const result = await deps.exportPackage(memberId, selection, packagePath);
    const bytes = deps.readFile(result.packagePath);
    const payload = bytes instanceof Buffer ? new Uint8Array(bytes) : bytes;

    return new NextResponse(payload, {
      status: 200,
      headers: {
        ...privacyHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="context-package.json"',
        'Content-Length': String(payload.byteLength),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith('CABIN_EXPORT_SELECTION_INVALID')
    ) {
      return reply(
        {
          error: 'The selected Cabin context could not be assembled.',
          code: error.message,
        },
        400,
      );
    }

    return reply(
      { error: 'Cabin export could not be completed.', code: 'CABIN_EXPORT_UNAVAILABLE' },
      503,
    );
  } finally {
    try {
      deps.unlink(packagePath);
    } catch {
      // Best-effort cleanup. No persistent server artifact is intended.
    }
  }
}

export async function POST(
  request: NextRequest,
  context?: unknown,
): Promise<Response> {
  const deps = isCabinExportDeps(context) ? context : productionDeps;
  return handlePost(request, deps);
}
