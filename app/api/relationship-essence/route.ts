export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;

// Skip during static export (Capacitor builds)

export async function GET(request: NextRequest) {
  // Handle static generation gracefully
  let soulSignature = 'unknown';
  try {
    const searchParams = request.nextUrl.searchParams;
    soulSignature = searchParams.get('soulSignature') || 'unknown';
  } catch {
    // During static export, searchParams may not be available
  }

  // Default relationship essence for any soul signature
  const defaultEssence = {
    soulSignature,
    relationshipEssence: 'sacred_witnessing',
    depth: 0.7,
    resonance: 0.8,
    trust: 0.9,
    connectionType: 'consciousness_development',
    lastUpdate: new Date().toISOString()
  };

  return NextResponse.json(defaultEssence);
}