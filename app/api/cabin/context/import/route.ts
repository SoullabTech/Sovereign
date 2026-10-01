import { NextRequest, NextResponse } from 'next/server';

import { cabinMemberFromRequest, cabinStore, setCabinSessionCookie } from '@/lib/cabin/request';
import { parseCabinContextPackage } from '@/lib/cabin/contextPackage';
import { resolveCabinContextPackagePath } from '@/lib/cabin/contextRuntime';
import { writeCabinContextPackage } from '@/lib/cabin/contextPackageWriter';

export const dynamic = 'force-dynamic';

const MAX_PACKAGE_BYTES = 2 * 1024 * 1024;
const PACKAGE_FILENAME = 'context-package.json';

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
      source.protocol === protocol + ':'
    );
  } catch {
    return false;
  }
}

function isFileValue(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'arrayBuffer' in value &&
    typeof value.arrayBuffer === 'function' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

function formKeys(formData: FormData): string[] {
  return Array.from(formData.keys());
}

export type CabinContextImportDeps = {
  writePackage: typeof writeCabinContextPackage;
};

const productionDeps: CabinContextImportDeps = {
  writePackage: writeCabinContextPackage,
};

function isCabinImportDeps(value: unknown): value is CabinContextImportDeps {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.writePackage === 'function';
}

async function handlePost(
  request: NextRequest,
  deps: CabinContextImportDeps,
): Promise<Response> {
  if (process.env.MAIA_CABIN_MODE !== 'offline') {
    return reply({ error: 'local_placement_requires_offline_cabin' }, 404);
  }

  if (request.nextUrl.search) {
    return reply(
      { error: 'Unexpected parameters.', code: 'UNEXPECTED_PARAMETERS' },
      400,
    );
  }

  const origin = request.headers.get('origin');
  if (
    (origin && !isSameOrigin(request, origin)) ||
    (!origin && !request.headers.get('x-session-token'))
  ) {
    return reply(
      { error: 'Open your Cabin and try again.', code: 'ORIGIN_REQUIRED' },
      403,
    );
  }

  if (
    !request
      .headers.get('content-type')
      ?.toLowerCase()
      .startsWith('multipart/form-data')
  ) {
    return reply(
      { error: 'A package file is required.', code: 'MULTIPART_REQUIRED' },
      415,
    );
  }

  const declaredLength = Number(request.headers.get('content-length') || '0');
  if (declaredLength > MAX_PACKAGE_BYTES + 64 * 1024) {
    return reply(
      { error: 'The package is too large.', code: 'PACKAGE_TOO_LARGE' },
      413,
    );
  }

  const store = cabinStore();

  try {
    const { issuedToken } = cabinMemberFromRequest(store, request);
    const formData = await request.formData();
    const keys = formKeys(formData);

    if (keys.length !== 1 || keys[0] !== 'context-package') {
      const response = reply(
        {
          error: 'Exactly one context package file is required.',
          code: 'PACKAGE_FIELD_INVALID',
        },
        400,
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    }

    const file = formData.get('context-package');
    if (!isFileValue(file) || file.name !== PACKAGE_FILENAME) {
      const response = reply(
        {
          error: 'The file must be named context-package.json.',
          code: 'PACKAGE_FILENAME_INVALID',
        },
        400,
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    }

    if (file.size > MAX_PACKAGE_BYTES) {
      const response = reply(
        { error: 'The package is too large.', code: 'PACKAGE_TOO_LARGE' },
        413,
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    }

    const serialized = new TextDecoder().decode(await file.arrayBuffer());
    const packageValue = parseCabinContextPackage(serialized);

    if (!packageValue) {
      const response = reply(
        {
          error: 'The context package is not valid.',
          code: 'CABIN_CONTEXT_PACKAGE_INVALID',
        },
        400,
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    }

    const dataPath = process.env.MAIA_CABIN_DATA_PATH;
    if (!dataPath) {
      const response = reply(
        {
          error: 'Cabin local storage is unavailable.',
          code: 'CABIN_DATA_UNAVAILABLE',
        },
        503,
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    }

    const packagePath = resolveCabinContextPackagePath(dataPath);
    const result = deps.writePackage(packagePath, {
      works: packageValue.works,
      relationships: packageValue.relationships,
      memories: packageValue.memories,
    });

    const response = reply({
      placed: true,
      schema: result.package.schema,
      bytes: result.bytes,
      requiresRuntimeRefresh: true,
    });
    setCabinSessionCookie(response, issuedToken);
    return response;
  } catch {
    return reply(
      {
        error: 'The context package could not be placed.',
        code: 'CABIN_CONTEXT_PACKAGE_PLACEMENT_FAILED',
      },
      400,
    );
  } finally {
    store.close();
  }
}

export async function POST(
  request: NextRequest,
  context?: unknown,
): Promise<Response> {
  const deps = isCabinImportDeps(context) ? context : productionDeps;
  return handlePost(request, deps);
}
