import { NextRequest, NextResponse } from 'next/server';
import { PremiumStorageService } from '@/lib/services/premium-storage';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscriptionTier, preferences } = body;

    if (!userId || !subscriptionTier) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, subscriptionTier' },
        { status: 400 }
      );
    }

    const storageService = PremiumStorageService.getInstance();
    const config = await storageService.initializePremiumStorage(
      userId,
      subscriptionTier,
      preferences
    );

    return NextResponse.json({
      success: true,
      config,
      message: 'Premium storage initialized successfully'
    });

  } catch (error) {
    console.error('Error initializing premium storage:', error);
    return NextResponse.json(
      { error: 'Failed to initialize premium storage' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const storageService = PremiumStorageService.getInstance();
    const estimate = await storageService.estimateUserStorageNeeds(userId);

    return NextResponse.json({
      success: true,
      estimate,
    });

  } catch (error) {
    console.error('Error getting storage estimate:', error);
    return NextResponse.json(
      { error: 'Failed to get storage estimate' },
      { status: 500 }
    );
  }
}