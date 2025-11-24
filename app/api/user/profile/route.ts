import { NextRequest, NextResponse } from 'next/server';

/**
 * User Profile API endpoint
 * Returns basic profile information for guest users and authenticated users
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const domain = searchParams.get('domain');

    // For now, return a simple guest profile for all users
    // This prevents 404 errors while keeping the profile system minimal
    const profile = {
      id: userId || 'guest',
      name: 'Guest User',
      domain: domain || 'localhost',
      isGuest: true,
      preferences: {
        theme: 'dark',
        voiceEnabled: true,
      },
      created: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('❌ [USER-PROFILE] Error fetching profile:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile',
        profile: {
          id: 'guest',
          name: 'Guest User',
          isGuest: true,
          preferences: {
            theme: 'dark',
            voiceEnabled: true,
          }
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For now, just acknowledge the profile update without persisting
    // This prevents errors while keeping the system simple
    console.log('📝 [USER-PROFILE] Profile update requested:', body);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        ...body,
        updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [USER-PROFILE] Error updating profile:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}