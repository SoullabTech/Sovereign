export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { logAuthEvent, hashCredential, redactPasscode } from '@/lib/security/authAudit';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';

// Note: No dynamic export needed - Capacitor apps call remote API server

// Beta passcode validation endpoint
// Validates invitation codes for the transformational experience

interface ValidatePasscodeRequest {
  passcode: string;
}

interface ValidatePasscodeResponse {
  valid: boolean;
  message?: string;
}

// Beta passcodes for sacred access - includes all SOULLAB-[name] passcodes for testers
const VALID_PASSCODES = [
  // General consciousness passcodes
  'CONSCIOUS',
  'SACRED',
  'WISDOM',
  'TRANSFORM',
  'EMERGE',
  'AWAKEN',
  'DEPTH',
  'CLARITY',
  'INSIGHT',
  'PRESENCE',
  'CONSCIOUSNESS2025',
  'DAIMON',
  'SOULLAB',
  'ORACLE',
  'MAIA',
  'BETA-TESTER-2025',

  // SOULLAB-[name] passcodes for 46 beta testers
  'SOULLAB-NATHAN',
  'SOULLAB-JASON',
  'SOULLAB-TRAVIS',
  'SOULLAB-ANDREA',
  'SOULLAB-JUSTIN',
  'SOULLAB-SUSAN',
  'SOULLAB-MEAGAN',
  'SOULLAB-PATRICK',
  'SOULLAB-TAMARA',
  'SOULLAB-LORALEE',
  'SOULLAB-ANDREAFAGAN',
  'SOULLAB-CECE',
  'SOULLAB-ZSUZSANNA',
  'SOULLAB-ANGELA',
  'SOULLAB-KRISTEN',
  'SOULLAB-DOUG',
  'SOULLAB-RICK',
  'SOULLAB-JULIE',
  'SOULLAB-KIMBERLY',
  'SOULLAB-LEONARD',
  'SOULLAB-CYNTHY',
  'SOULLAB-NINA',
  'SOULLAB-AUGUSTEN',
  'SOULLAB-SOPHIE',
  'SOULLAB-ROMEO',
  'SOULLAB-STEPHEN',
  'SOULLAB-WEEZIE',
  'SOULLAB-KOREY',
  'SOULLAB-KAREN',
  'SOULLAB-NATASHA',
  'SOULLAB-CATHERINE',
  'SOULLAB-THEA',
  'SOULLAB-VIRGINIA',
  'SOULLAB-JONDI',
  'SOULLAB-JOSEPH',
  'SOULLAB-KELLY',
  'SOULLAB-KARA',
  'SOULLAB-CHRISTIAN',
  'SOULLAB-CLAUDIA',
  'SOULLAB-NICOLE',
  'SOULLAB-MARIECHRISTINE',
  'SOULLAB-LORNA',
  'SOULLAB-YVONNE',
  'SOULLAB-ANNA',
  'SOULLAB-RISAKO',
  'SOULLAB-WHITEY',
  'SOULLAB-LAUREN',
  'SOULLAB-NADIA'
];

export async function POST(request: NextRequest) {
  try {
    /**
     * SOURCE-CUSTODY-PII-01 · R2 — CONTAINMENT, EXPLICITLY NOT REMEDIATION.
     *
     * This corpus is 64 credentials: 48 of `SOULLAB-<FIRSTNAME>` form and 14
     * single dictionary words. A first name is not a secret and neither is
     * `WISDOM`, so this endpoint was an unthrottled oracle over a guessable
     * keyspace. Throttling it is worth doing today.
     *
     * ⛔ IT IS NOT THE FIX. Per the founder ruling, rate-limiting compromised
     * credentials is not remediation — these values lost secret standing by
     * having lived in tracked source, and they must be RETIRED and replaced by
     * individually revocable, hashed credentials. That replacement needs a
     * migration path for the people still holding them, so it is its own act.
     * This limiter must not be mistaken for that act having happened.
     */
    const limit = await checkRateLimit(getClientIP(request), 'ip', 'beta/validate-passcode');
    if (!limit.allowed) {
      return NextResponse.json(
        { valid: false, message: 'Invalid invitation code' },
        { status: 429, headers: buildRateLimitHeaders(limit) },
      );
    }

    const body: ValidatePasscodeRequest = await request.json();

    if (!body.passcode) {
      return NextResponse.json(
        { valid: false, message: 'Passcode is required' },
        { status: 400 }
      );
    }

    const passcode = body.passcode.toUpperCase().trim();

    // Validate against beta passcodes
    const isValid = VALID_PASSCODES.includes(passcode);

    if (isValid) {
      // Audit trail for successful beta access (writes to audit_logs table)
      // SECURITY: Hash passcode, don't store plaintext
      await logAuthEvent({
        action: 'passcode_valid',
        resourceType: 'beta_passcode',
        result: 'success',
        metadata: {
          passcode_hash: hashCredential(passcode),
          passcode_hint: redactPasscode(passcode),
        },
      }, request);

      return NextResponse.json({
        valid: true,
        message: 'Welcome to the sacred space'
      });
    }

    // Audit trail for failed beta access (writes to audit_logs table)
    // SECURITY: Hash passcode, don't store plaintext
    await logAuthEvent({
      action: 'passcode_invalid',
      resourceType: 'beta_passcode',
      result: 'failure',
      errorMessage: 'invalid_passcode',
      metadata: {
        passcode_hash: hashCredential(passcode || 'missing'),
        passcode_hint: redactPasscode(passcode || ''),
      },
    }, request);

    return NextResponse.json(
      { valid: false, message: 'Invalid invitation code' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Passcode validation error:', error);

    return NextResponse.json(
      { valid: false, message: 'Validation service temporarily unavailable' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}