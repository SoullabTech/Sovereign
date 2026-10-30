export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { CALCULATOR_PRIVATE_HEADERS } from '@/lib/astrology/calculatorRequests';

const held = () => NextResponse.json({
  success: false,
  error: 'Ashtakavarga current-position calculations are held pending independent astronomical and Jyotisha qualification.',
  code: 'VEDIC_ASHTAKAVARGA_UNQUALIFIED_HELD',
}, { status: 451, headers: CALCULATOR_PRIVATE_HEADERS });

// Fail closed before request-body parsing, calculator budget or any calculation.
export async function POST() {
  return held();
}

export async function GET() {
  return held();
}
