import { NextRequest, NextResponse } from 'next/server';

// Beta passcode validation endpoint
// Validates invitation codes for the transformational experience

interface ValidatePasscodeRequest {
  passcode: string;
}

interface ValidatePasscodeResponse {
  valid: boolean;
  message?: string;
}

// Beta passcodes for sacred access
const VALID_PASSCODES = [
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
  // Add more as needed
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
      // Log successful validation (for analytics)
      console.log('✨ Valid passcode used:', passcode, {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')
      });

      return NextResponse.json({
        valid: true,
        message: 'Welcome to the sacred space'
      });
    }

    // Log invalid attempts (for monitoring)
    console.log('⚠️  Invalid passcode attempt:', passcode, {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

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