export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { logAuthEvent } from '@/lib/security/authAudit';

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
      // Note: passcode stored in errorMessage since resource_id is UUID type
      await logAuthEvent({
        action: 'passcode_valid',
        resourceType: 'beta_passcode',
        result: 'success',
        errorMessage: `passcode:${passcode}`,
      }, request);

      return NextResponse.json({
        valid: true,
        message: 'Welcome to the sacred space'
      });
    }

    // Audit trail for failed beta access (writes to audit_logs table)
    await logAuthEvent({
      action: 'passcode_invalid',
      resourceType: 'beta_passcode',
      result: 'failure',
      errorMessage: `passcode:${passcode || 'missing'}`,
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