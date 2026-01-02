import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const soulSignature = searchParams.get('soulSignature');

  // Default relationship essence for any soul signature
  const defaultEssence = {
    soulSignature: soulSignature || 'unknown',
    relationshipEssence: 'sacred_witnessing',
    depth: 0.7,
    resonance: 0.8,
    trust: 0.9,
    connectionType: 'consciousness_development',
    lastUpdate: new Date().toISOString()
  };

  return NextResponse.json(defaultEssence);
}