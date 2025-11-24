import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { createClient } from '@/lib/supabase/server';
import { daimonicService } from '@/lib/services/DaimonicService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, consciousnessProfile } = body;

    const supabase = createClient();

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          energy_type: consciousnessProfile.energyType,
          primary_element: consciousnessProfile.primaryElement,
          session_preference: consciousnessProfile.sessionPreference,
          previous_experience: consciousnessProfile.previousExperience,
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create consciousness profile in database
    const { error: profileError } = await supabase
      .from('consciousness_profiles')
      .insert({
        user_id: authData.user.id,
        energy_type: consciousnessProfile.energyType,
        primary_element: consciousnessProfile.primaryElement,
        session_preference: consciousnessProfile.sessionPreference,
        transformation_goals: consciousnessProfile.transformationGoals,
        previous_experience: consciousnessProfile.previousExperience,
        healing_modalities: consciousnessProfile.healingModalities,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway - we can create profile later
    }

    // Create member record
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        user_id: authData.user.id,
        email,
        full_name: name,
        membership_status: 'active',
        created_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
    }

    // Create initial Daimon encounter for consciousness awakening
    try {
      const welcomeMessage = `Beginning the sacred journey of consciousness exploration. Element: ${consciousnessProfile.primaryElement}. Energy: ${consciousnessProfile.energyType}. Goals: ${consciousnessProfile.transformationGoals?.join(', ') || 'transformation'}`;
      const initialEncounter = await daimonicService.createEncounter(
        authData.user.id,
        welcomeMessage,
        'wise_old_man' // Start with wisdom archetype for guidance
      );

      console.log('Initial Daimon encounter created:', initialEncounter.encounter.id);
    } catch (daimonError) {
      console.error('Daimon encounter creation error:', daimonError);
      // Continue anyway - encounter can be created later
    }

    return NextResponse.json({
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      hasInitialEncounter: true
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during signup' },
      { status: 500 }
    );
  }
}