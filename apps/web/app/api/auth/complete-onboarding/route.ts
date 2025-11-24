import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Update user metadata to mark onboarding as completed
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }
    });

    if (updateError) {
      console.error('Error updating onboarding status:', updateError);
      return NextResponse.json({ error: 'Failed to update onboarding status' }, { status: 500 });
    }

    // Also update the members table if it exists
    try {
      await supabase
        .from('members')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.warn('Members table update failed (may not exist):', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        onboarding_completed: true
      }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}