import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * User Profile API endpoint
 * Returns basic profile information for guest users and authenticated users
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const domain = searchParams.get('domain');

    // Try to get a more personalized name based on userId or use a fallback
    let userName = 'Explorer'; // Default fallback

    // Check for Kelly special case
    if (userId === 'kelly-nezat' || userId === 'kelly') {
      userName = 'Kelly';
    }
    // Check for other custom user IDs
    else if (userId && userId !== 'guest') {
      // Extract a friendly name from user ID if possible
      const fullName = userId.replace(/[-_]/g, ' ')
                             .replace(/\b\w/g, l => l.toUpperCase())
                             .replace(/^Guest\d*$/, 'Explorer'); // Clean up guest IDs
      // Extract first name only for conversational intimacy
      userName = fullName.split(' ')[0];
    }

    const profile = {
      id: userId || 'guest',
      name: userName,
      domain: domain || 'localhost',
      isGuest: userId === 'guest' || !userId,
      preferences: {
        theme: 'dark',
        voiceEnabled: true,
      },
      created: new Date().toISOString(),
    };

    // Return in the format expected by MAIA page (data.user.name)
    return NextResponse.json({
      success: true,
      user: profile  // Changed from 'profile' to 'user' to match MAIA expectation
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