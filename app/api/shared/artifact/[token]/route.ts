export const dynamic = 'force-dynamic';

/**
 * PUBLIC ARTIFACT SHARE ACCESS
 *
 * Allows recipients to access shared session artifacts via token.
 * No authentication required — access controlled by token validity.
 *
 * Hard-limited to: parent_update, client_summary, integration_note
 *
 * Follows the existing shared/file/[token] pattern:
 * - Token validation
 * - Expiry check
 * - Optional password gate
 * - Access logging (fire-and-forget)
 *
 * GET  - Retrieve shared artifact (returns 401 if password required)
 * POST - Validate password for protected shares, then return artifact
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveShareToken } from '@/lib/trust/service';

type RouteContext = { params: Promise<{ token: string }> };

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

// GET - Retrieve shared artifact
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const result = await resolveShareToken(token);

    if ('error' in result) {
      return json(result.status, { error: result.error });
    }

    // Log access (fire-and-forget, non-blocking)
    logAccess(request, result.share.id).catch(() => {});

    return json(200, {
      artifact: {
        id: result.artifact.id,
        type: result.artifact.artifact_type,
        content: result.artifact.content,
      },
      share: {
        scope: result.share.share_scope,
        expiresAt: result.share.expires_at,
        passwordProtected: !!result.share.password_hash,
      },
    });
  } catch (error) {
    console.error('[Shared Artifact] Access error:', error);
    return json(500, { error: 'Failed to access shared artifact' });
  }
}

// POST - Validate password and return artifact
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await request.json();
    const password = body?.password;

    if (!password || typeof password !== 'string') {
      return json(400, { error: 'Password is required' });
    }

    const result = await resolveShareToken(token, password);

    if ('error' in result) {
      return json(result.status, { error: result.error });
    }

    logAccess(request, result.share.id).catch(() => {});

    return json(200, {
      artifact: {
        id: result.artifact.id,
        type: result.artifact.artifact_type,
        content: result.artifact.content,
      },
      share: {
        scope: result.share.share_scope,
        expiresAt: result.share.expires_at,
      },
    });
  } catch (error) {
    console.error('[Shared Artifact] Password validation error:', error);
    return json(500, { error: 'Failed to validate access' });
  }
}

// Fire-and-forget access log — mirrors shared/file/[token] pattern
async function logAccess(request: NextRequest, shareId: string) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  console.log(`[Trust] Artifact share accessed: ${shareId} from ${ip.substring(0, 50)}`);
}
